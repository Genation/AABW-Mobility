"""Semantics-first quality gate for the complete map-search experience.

Unlike the public compatibility evaluator, this module never imports or reads
evaluation sheets. Cases are generated from the live corpus and graded by
canonical IDs, structured slots, metadata constraints, paired perturbations,
and runtime invariants. Exact suggestion text is diagnostic only.

    python -m scripts.experience_quality --report-only
    python -m scripts.experience_quality --no-baseline --output artifacts/experience_baseline_e5.json
    python -m scripts.experience_quality
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import statistics
import time
import unicodedata
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Callable, Iterable, Sequence

from rapidfuzz import fuzz

from tascomaps import config
from tascomaps.core.text import (fold, has_accents, normalize, parse_coordinates,
                                 strip_accents, tokenize)
from tascomaps.core.understand import understand
from tascomaps.data.loader import load_kb
from tascomaps.engines.semantic_search import SemanticSearchEngine
from tascomaps.engines.trie import TrieAutocomplete
from scripts.generalization_gate import _nonce_queries


ROOT = Path(__file__).resolve().parent.parent
ARTIFACTS = ROOT / "artifacts"
FRACTIONS = (0.25, 0.50, 0.75)
SLOT_FIELDS = ("category", "city", "district", "brand", "street", "dish",
               "location", "poi_names", "origin", "destination_poi",
               "house_number", "latitude", "longitude", "price_max",
               "rating_min", "open_after", "open_before", "open_late",
               "open_24h", "open_now")


def _ratio(value: float, total: float) -> float:
    return value / total if total else 0.0


def _stable_sample(values: Iterable, limit: int, key: Callable) -> list:
    ordered = sorted(values, key=lambda value: hashlib.sha256(
        key(value).encode("utf-8")).hexdigest())
    return ordered[:limit] if limit > 0 else ordered


def _regression_sample(values: Iterable, limit: int, key: Callable) -> list:
    """Select a deterministic corpus fifth for stable, order-independent coverage."""
    values = list(values)
    sampled = [value for value in values if int(
        hashlib.sha256(key(value).encode("utf-8")).hexdigest()[:8], 16) % 5 == 4]
    return _stable_sample(sampled or values, limit, key)


def _percentile(values: Sequence[float], percentile: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(float(value) for value in values)
    position = min(len(ordered) - 1,
                   round((percentile / 100.0) * (len(ordered) - 1)))
    return ordered[position]


def _latency(values: Sequence[float]) -> dict:
    return {
        "n": len(values),
        "p50_ms": round(statistics.median(values), 4) if values else 0.0,
        "p95_ms": round(_percentile(values, 95), 4),
        "p99_ms": round(_percentile(values, 99), 4),
        "max_ms": round(max(values), 4) if values else 0.0,
    }


def _duplicate_letter(value: str) -> str:
    words = [(index, word) for index, word in enumerate(value.split())
             if sum(char.isalpha() for char in word) >= 4]
    if not words:
        return value
    index, word = max(words, key=lambda item: len(item[1]))
    at = max(1, len(word) // 2)
    pieces = value.split()
    pieces[index] = word[:at] + word[at] + word[at:]
    return " ".join(pieces)


def _prefix(value: str, fraction: float) -> str:
    value = " ".join(str(value or "").split())
    if len(value) <= 2:
        return value
    size = min(len(value) - 1, max(2, int(round(len(value) * fraction))))
    while size > 1 and size < len(value) and unicodedata.combining(value[size]):
        size -= 1
    return value[:size].rstrip()


def _phrase_overlap(left: str, right: str) -> bool:
    a, b = fold(left), fold(right)
    return bool(a and b and (a == b or a in b or b in a
                             or fuzz.token_set_ratio(a, b) >= 86))


def _prefix_sequence(prefix: str, suggestion: str) -> bool:
    wanted = fold(prefix).split()
    candidate = fold(suggestion).split()
    if not wanted or not candidate:
        return False
    cursor = 0
    for token in wanted:
        while cursor < len(candidate) and not candidate[cursor].startswith(token):
            cursor += 1
        if cursor >= len(candidate):
            return False
        cursor += 1
    return True


def _intent_compatible(expected: str, actual: str) -> bool:
    if expected == actual:
        return True
    families = (
        {"Category Search", "Discovery Search"},
        {"POI Search", "Brand Category Search"},
    )
    return any(expected in family and actual in family for family in families)


class SemanticJudge:
    """Independent metadata/lexicon grader; never calls P6 or an embedder."""

    def __init__(self, kb):
        self.kb = kb
        self._cache = {}
        self.forms = defaultdict(list)
        self.lexicons = defaultdict(dict)

        def add(kind: str, surface, canonical) -> None:
            surface = str(surface or "").strip()
            canonical = str(canonical or "").strip()
            if surface and canonical:
                self.lexicons[kind].setdefault(normalize(surface), canonical)

        for surface, canonical in kb.category_terms.items():
            add("category", surface, canonical)
        for surface, canonical in kb.attribute_terms.items():
            add("attributes", surface, canonical)
        for surface, canonical in kb.cities.items():
            add("city", surface, canonical)
        for surface, canonical in kb.districts.items():
            add("district", surface, canonical)
        for surface, canonical in kb.brands.items():
            add("brand", surface, canonical)
        for surface, canonical in kb.dish_terms.items():
            add("dish", surface, canonical)
        for row in kb.addresses:
            add("street", row.get("street"), row.get("street"))
        for poi in kb.pois:
            for value in (poi.name, poi.name_en, *poi.aliases):
                if value:
                    self.forms[normalize(value)].append(poi)
            add("category", poi.category, poi.category)
            add("city", poi.city, poi.city)
            add("district", poi.district, poi.district)
            add("brand", poi.brand, poi.brand)
            for value in (*poi.attributes, *poi.tags):
                add("attributes", value, value)

    @staticmethod
    def _surface_spans(text: str, surface: str) -> list[tuple[int, int]]:
        """Accent-safe phrase spans using only text primitives."""
        source = tokenize(text)
        target = tokenize(surface)
        if not source or not target or len(target) > len(source):
            return []
        wanted = [fold(token) for token in target]
        spans = []
        for start in range(len(source) - len(target) + 1):
            window = source[start:start + len(target)]
            if [fold(token) for token in window] != wanted:
                continue
            if all(not has_accents(typed) or normalize(typed) == normalize(canonical)
                   for typed, canonical in zip(window, target)):
                spans.append((start, start + len(target)))
        return spans

    def _extract(self, kind: str, text: str) -> list[tuple[str, int]]:
        found = {}
        for surface, canonical in self.lexicons[kind].items():
            spans = self._surface_spans(text, surface)
            if not spans:
                continue
            start = spans[0][0]
            key = normalize(canonical)
            current = found.get(key)
            if current is None or len(tokenize(surface)) > current[1]:
                found[key] = (canonical, len(tokenize(surface)), start)
        return [(canonical, start) for canonical, _, start in sorted(
            found.values(), key=lambda item: (item[2], -item[1], normalize(item[0])))]

    @staticmethod
    def _add(target: dict[str, set], key: str, value) -> None:
        values = value if isinstance(value, list) else [value]
        for item in values:
            item = str(item or "").strip()
            if item:
                target[key].add(item)

    def evidence(self, text: str) -> dict:
        cache_key = normalize(text)
        if cache_key in self._cache:
            return self._cache[cache_key]
        slots = defaultdict(set)
        pois = list(self.forms.get(cache_key, []))
        unique = {f"{poi.source}:{poi.poi_id}:{fold(poi.name)}": poi for poi in pois}
        for poi in unique.values():
            slots["poi_ids"].add(f"{poi.source}:{poi.poi_id}")
            self._add(slots, "poi_names", poi.name)
            for key, value in (("category", poi.category), ("city", poi.city),
                               ("district", poi.district), ("brand", poi.brand),
                               ("street", poi.address)):
                self._add(slots, key, value)
            self._add(slots, "attributes", [*poi.attributes, *poi.tags])

        if not unique:
            for kind in ("category", "city", "district", "brand", "dish",
                         "street"):
                for canonical, _ in self._extract(kind, text):
                    slots[kind].add(canonical)
            attribute_matches = self._extract("attributes", text)
            folded_tokens = fold(text).split()
            for canonical, start in attribute_matches:
                prefix = " ".join(folded_tokens[max(0, start - 4):start])
                target = "excluded_attributes" if re.search(
                    r"\b(?:khong(?: co)?|tranh|without|no)$", prefix) \
                    else "attributes"
                slots[target].add(canonical)

        coords = parse_coordinates(text)
        if coords:
            slots["latitude"].add(str(coords[0]))
            slots["longitude"].add(str(coords[1]))
        house = re.match(r"^\s*(\d+[a-zA-Z]?(?:/\d+)?)\b", text)
        if house:
            slots["house_number"].add(house.group(1))
        qfold = fold(text)
        if re.search(r"\b(?:gan day|gan toi|gan tui|quanh toi|quanh tui|near me)\b",
                     qfold):
            slots["location"].add("current_location")
        route = re.search(r"\btu\s+(.+?)\s+(?:den|toi)\s+(.+)$", qfold)
        if route:
            slots["origin"].add(route.group(1))
            slots["destination_poi"].add(route.group(2))
        if re.search(r"\b24/?7\b|\b24h\b", qfold):
            slots["open_24h"].add("true")
        if re.search(r"\b(?:mo khuya|mo muon)\b", qfold):
            slots["open_late"].add("true")
        if re.search(r"\b(?:dang mo|con mo|mo cua bay gio)\b", qfold):
            slots["open_now"].add("true")

        meaningful = any(slots[key] for key in (*SLOT_FIELDS, "poi_names",
                                                 "poi_ids", "attributes",
                                                 "excluded_attributes"))
        if coords:
            intent = "Coordinate Search"
        elif route:
            intent = "Navigation"
        elif slots["location"]:
            intent = "Nearby Search"
        elif unique:
            intent = "POI Search"
        elif slots["street"] and slots["house_number"]:
            intent = "Address Search"
        elif slots["brand"] and slots["category"]:
            intent = "Brand Category Search"
        elif slots["category"] and slots["attributes"]:
            intent = "Discovery Search"
        elif slots["category"] or slots["dish"]:
            intent = "Category Search"
        else:
            intent = "Ambiguous"
        result = {
            "intent": intent,
            "slots": slots,
            "grounded": meaningful,
        }
        self._cache[cache_key] = result
        return result

    @staticmethod
    def _set_satisfies(actual: set, expected: set) -> bool:
        if not expected:
            return True
        return all(any(_phrase_overlap(left, right) for left in actual)
                   for right in expected)

    def slot_fraction(self, expected: dict[str, set], evidence: dict) -> float:
        requested = [(key, value) for key, values in expected.items()
                     for value in values]
        if not requested:
            return 1.0
        return _ratio(sum(any(_phrase_overlap(actual, value)
                              for actual in evidence["slots"][key])
                          for key, value in requested), len(requested))

    def gain(self, case: dict, suggestion: str) -> int:
        evidence = self.evidence(suggestion)
        expected = case["expected"]
        visible = case.get("visible_expected", expected)
        target_id = case.get("target_poi_id")
        if target_id and target_id in evidence["slots"]["poi_ids"]:
            return 3
        wrong_target_branch = bool(
            target_id and evidence["slots"]["poi_ids"]
            and target_id not in evidence["slots"]["poi_ids"])

        def satisfaction(wanted):
            hard = {key: values for key, values in wanted.items()
                    if key != "attributes" and values}
            attributes = wanted.get("attributes", set())
            hard_ok = all(self._set_satisfies(evidence["slots"][key], values)
                          for key, values in hard.items())
            attr_ok = self._set_satisfies(
                evidence["slots"]["attributes"], attributes)
            return hard, attributes, hard_ok, attr_ok

        hard, attributes, hard_ok, attr_ok = satisfaction(expected)
        visible_hard, visible_attributes, visible_hard_ok, visible_attr_ok = \
            satisfaction(visible)
        contradiction = any(
            evidence["slots"][key]
            and not self._set_satisfies(evidence["slots"][key], values)
            for key, values in visible_hard.items()
        )
        if hard_ok and attr_ok and (hard or attributes):
            return 3
        if (visible_hard or visible_attributes) and visible_hard_ok \
                and visible_attr_ok:
            return 2
        similarity = fuzz.token_set_ratio(fold(case["target"]), fold(suggestion))
        if not wrong_target_branch \
                and not (visible_hard or visible_attributes) and evidence["grounded"] \
                and (_prefix_sequence(case["prefix"], suggestion)
                     or similarity >= 72):
            return 2
        if not contradiction and evidence["grounded"] and (
                self.slot_fraction(visible or expected, evidence) > 0
                or _prefix_sequence(case["prefix"], suggestion)
                or similarity >= 72):
            return 1
        return 0


def _completion_targets(kb, judge: SemanticJudge, per_family: int) -> list[dict]:
    targets = []
    name_counts = Counter(fold(poi.name) for poi in kb.pois_t2 if poi.name)
    pois = _regression_sample(
        [poi for poi in kb.pois_t2 if poi.name and name_counts[fold(poi.name)] == 1],
        per_family, lambda poi: f"poi:{poi.poi_id}:{fold(poi.name)}")
    for poi in pois:
        targets.append({
            "id": f"poi:{poi.poi_id}", "family": "poi", "target": poi.name,
            "target_poi_id": f"{poi.source}:{poi.poi_id}",
            "expected": defaultdict(set),
        })

    structured = {}
    for poi in kb.pois_t2:
        for attribute in poi.attributes[:2]:
            if poi.category and poi.city and attribute:
                key = (fold(poi.category), fold(attribute), fold(poi.city))
                structured.setdefault(key, (poi.category, attribute, poi.city))
    for category, attribute, city in _regression_sample(
            structured.values(), per_family,
            lambda item: "structured:" + "|".join(fold(value) for value in item)):
        expected = defaultdict(set, {
            "category": {category}, "city": {city}, "attributes": {attribute},
        })
        targets.append({
            "id": "structured:" + "|".join(fold(x) for x in
                                               (category, attribute, city)),
            "family": "structured", "target": f"tìm {category} {attribute} ở {city}",
            "expected": expected,
        })

    for row in _regression_sample(
            kb.popular_queries, min(per_family, len(kb.popular_queries)),
            lambda row: f"popular:{fold(row.get('query_text', ''))}"):
        text = str(row.get("query_text") or "").strip()
        if not text:
            continue
        targets.append({
            "id": "popular:" + fold(text), "family": "popular", "target": text,
            "expected": judge.evidence(text)["slots"],
        })

    brands = _regression_sample(
        sorted(set(kb.brands.values()), key=fold), per_family,
        lambda value: "brand:" + fold(value))
    for brand in brands:
        targets.append({
            "id": "brand:" + fold(brand), "family": "brand", "target": brand,
            "expected": defaultdict(set, {"brand": {brand}}),
        })
    return targets


def _suggestion_and_completion(kb, autocomplete, judge, per_family: int) -> tuple[dict, dict]:
    targets = _completion_targets(kb, judge, per_family)
    cases = []
    trajectories = defaultdict(dict)
    aggregate_gains = []
    utility = success1 = success3 = success6 = exact_rr = 0.0
    covered = grounded = unique = finite = monotonic = slot_sum = slot_n = 0

    for target in targets:
        for fraction in FRACTIONS:
            prefix = _prefix(target["target"], fraction)
            if not prefix:
                continue
            visible_expected = judge.evidence(prefix)["slots"]
            case = {**target, "fraction": fraction, "prefix": prefix,
                    "visible_expected": visible_expected}
            output = autocomplete.suggest(prefix, top_k=6)
            suggestions = output.get("suggestions", [])
            texts = [str(item.get("text") or "") for item in suggestions]
            gains = [judge.gain(case, text) for text in texts]
            aggregate_gains.extend(gains)
            covered += bool(texts)
            grounded += sum(judge.evidence(text)["grounded"] for text in texts)
            unique += len({fold(text) for text in texts}) == len(texts)
            finite += all(math.isfinite(float(item.get("score", 0)))
                          and 0 <= float(item.get("score", 0)) <= 1
                          for item in suggestions)
            scores = [float(item.get("score", 0)) for item in suggestions]
            monotonic += all(left + 1e-12 >= right
                             for left, right in zip(scores, scores[1:]))
            discounts = [1 / math.log2(index + 2) for index in range(len(gains))]
            utility += _ratio(sum(gain * discount for gain, discount in
                                  zip(gains, discounts)), 3 * sum(discounts))
            success1 += any(gain >= 2 for gain in gains[:1])
            success3 += any(gain >= 2 for gain in gains[:3])
            success6 += any(gain >= 2 for gain in gains[:6])
            exact_index = next((index for index, text in enumerate(texts)
                                if fold(text) == fold(target["target"])), None)
            exact_rr += 1 / (exact_index + 1) if exact_index is not None else 0.0
            if texts and any(visible_expected.values()):
                slot_sum += judge.slot_fraction(visible_expected,
                                                judge.evidence(texts[0]))
                slot_n += 1
            trajectories[target["id"]][fraction] = any(gain >= 2 for gain in gains)
            cases.append({
                "id": target["id"], "family": target["family"],
                "fraction": fraction, "prefix": prefix,
                "suggestions": texts, "gains": gains,
            })

    total = len(cases)
    first_success = []
    persistence_ok = persistence_total = 0
    for values in trajectories.values():
        successes = [fraction for fraction in FRACTIONS if values.get(fraction)]
        first_success.append(min(successes) if successes else 1.0)
        seen = False
        for fraction in FRACTIONS:
            current = bool(values.get(fraction))
            if seen:
                persistence_total += 1
                persistence_ok += current
            seen = seen or current

    relevance = {
        "cases": total,
        "graded_utility@6": _ratio(utility, total),
        "semantic_success@1": _ratio(success1, total),
        "semantic_success@3": _ratio(success3, total),
        "semantic_success@6": _ratio(success6, total),
        "relevant_suggestion_rate": _ratio(sum(gain >= 1 for gain in aggregate_gains),
                                             len(aggregate_gains)),
        "strong_suggestion_rate": _ratio(sum(gain >= 2 for gain in aggregate_gains),
                                           len(aggregate_gains)),
        "unrelated_suggestion_rate": _ratio(sum(gain == 0 for gain in aggregate_gains),
                                              len(aggregate_gains)),
        "grounded_suggestion_rate": _ratio(grounded, len(aggregate_gains)),
        "top1_slot_retention": _ratio(slot_sum, slot_n),
    }
    completion = {
        "targets": len(trajectories), "prefix_cases": total,
        "list_coverage": _ratio(covered, total),
        "semantic_success_auc": _ratio(sum(
            sum(bool(values.get(fraction)) for fraction in FRACTIONS) / len(FRACTIONS)
            for values in trajectories.values()), len(trajectories)),
        "median_fraction_typed_for_success": statistics.median(first_success)
        if first_success else 1.0,
        "median_keystroke_savings": 1.0 - statistics.median(first_success)
        if first_success else 0.0,
        "success_persistence": _ratio(persistence_ok, persistence_total),
        "unique_list_rate": _ratio(unique, total),
        "finite_bounded_score_rate": _ratio(finite, total),
        "monotonic_score_rate": _ratio(monotonic, total),
        "exact_target_mrr_diagnostic": _ratio(exact_rr, total),
    }
    return relevance, completion


def _intent_cases(kb, judge: SemanticJudge, per_family: int) -> list[dict]:
    families = defaultdict(list)
    counts = Counter(fold(poi.name) for poi in kb.pois if poi.name)
    for poi in kb.pois:
        if poi.name and counts[fold(poi.name)] == 1:
            families["POI Search"].append({"query": poi.name,
                                            "expected": {"poi_names": {poi.name}}})
        if poi.lat is not None and poi.lng is not None:
            families["Coordinate Search"].append(
                {"query": f"{poi.lat},{poi.lng}", "expected": {
                    "latitude": {str(float(poi.lat))},
                    "longitude": {str(float(poi.lng))},
                }})
    for category in sorted(set(p.category for p in kb.pois if p.category), key=fold):
        families["Category Search"].append(
            {"query": category, "expected": {"category": {category}}})
        families["Nearby Search"].append(
            {"query": f"{category} gần tôi", "expected": {
                "category": {category}, "location": {"current_location"}}})
    for row in kb.addresses:
        address = str(row.get("full_address") or "").strip()
        house_number = str(row.get("house_number") or "").strip()
        if address and house_number and any(char.isdigit() for char in house_number):
            families["Address Search"].append({"query": address, "expected": {
                "house_number": {house_number},
                "street": {str(row.get("street") or "")},
                "city": {str(row.get("city") or "")},
            }})
    nav_pois = _stable_sample([p for p in kb.pois if p.name], per_family * 2,
                              lambda p: f"nav:{p.source}:{p.poi_id}")
    for left, right in zip(nav_pois[::2], nav_pois[1::2]):
        families["Navigation"].append(
            {"query": f"chỉ đường từ {left.name} đến {right.name}", "expected": {
                "origin": {left.name}, "destination_poi": {right.name}}})
    for row in kb.popular_queries:
        expected = str(row.get("intent_type") or "").strip()
        query = str(row.get("query_text") or "").strip()
        if expected and query:
            families[expected].append(
                {"query": query, "expected": judge.evidence(query)["slots"]})
    for row in kb.attribute_taxonomy:
        query = str(row.get("examples") or "").strip()
        if query:
            evidence = judge.evidence(query)
            expected_intent = "Category Search" \
                if evidence["slots"]["category"] else "Discovery Search"
            families[expected_intent].append(
                {"query": query, "expected": evidence["slots"]})
    by_brand = defaultdict(list)
    for poi in kb.pois:
        if poi.brand:
            by_brand[fold(poi.brand)].append(poi)
    for group in by_brand.values():
        if len({fold(poi.name) for poi in group if poi.name}) < 2:
            continue
        categories = {poi.category for poi in group if poi.category}
        brand = group[0].brand
        if any(fold(brand) in {fold(poi.name),
                               *(fold(alias) for alias in poi.aliases)}
               for poi in kb.pois):
            continue
        for category in categories:
            families["Brand Category Search"].append({
                "query": f"{brand} {category}",
                "expected": {"brand": {brand}, "category": {category}},
            })

    cases = []
    for expected_intent, values in families.items():
        for case in _regression_sample(
                values, per_family,
                lambda item: f"intent:{expected_intent}:{fold(item['query'])}"):
            cases.append({**case, "intent": expected_intent})
    return cases


def _macro_f1(expected: Sequence[str], predicted: Sequence[str]) -> float:
    labels = sorted(set(expected))
    scores = []
    for label in labels:
        tp = sum(left == label and right == label for left, right in zip(expected, predicted))
        fp = sum(left != label and right == label for left, right in zip(expected, predicted))
        fn = sum(left == label and right != label for left, right in zip(expected, predicted))
        precision = _ratio(tp, tp + fp)
        recall = _ratio(tp, tp + fn)
        scores.append(_ratio(2 * precision * recall, precision + recall))
    return statistics.mean(scores) if scores else 0.0


def _intent_metrics(kb, judge, per_family: int) -> tuple[dict, list[dict]]:
    cases = _intent_cases(kb, judge, per_family)
    expected, predicted, perturbed = [], [], []
    correct = []
    slot_score = slot_n = 0
    failures = []
    bins = defaultdict(list)
    brier = 0.0
    for case in cases:
        output = understand(case["query"], kb)
        noisy = understand(strip_accents(case["query"]), kb)
        expected.append(case["intent"])
        predicted.append(output.intent)
        perturbed.append(noisy.intent)
        ok = output.intent == case["intent"]
        correct.append(ok)
        brier += (float(output.confidence) - float(ok)) ** 2
        bucket = min(4, int(float(output.confidence) * 5))
        bins[bucket].append((float(output.confidence), float(ok)))
        evidence = judge.evidence(output.normalized_query)
        if case["expected"]:
            slot_score += judge.slot_fraction(case["expected"], evidence)
            slot_n += 1
        if len(failures) < 16 and not ok:
            failures.append({"query": case["query"], "expected": case["intent"],
                             "predicted": output.intent})
    ece = sum(len(values) / len(cases)
              * abs(statistics.mean(value[0] for value in values)
                    - statistics.mean(value[1] for value in values))
              for values in bins.values()) if cases else 0.0
    return {
        "cases": len(cases), "families": len(set(expected)),
        "strict_accuracy": _ratio(sum(correct), len(cases)),
        "macro_f1": _macro_f1(expected, predicted),
        "compatible_accuracy": _ratio(sum(_intent_compatible(left, right)
                                            for left, right in zip(expected, predicted)),
                                       len(cases)),
        "accentless_intent_accuracy": _ratio(sum(
            _intent_compatible(left, right) for left, right in zip(expected, perturbed)),
            len(cases)),
        "typed_slot_fidelity": _ratio(slot_score, slot_n),
        "confidence_brier": _ratio(brier, len(cases)),
        "confidence_ece": ece,
    }, failures


def _semantic_retention(query: str, clean, variant, judge) -> float:
    expected = judge.evidence(query)["slots"]
    intent = float(_intent_compatible(clean.intent, variant.intent))
    if not expected:
        return intent
    slots = judge.slot_fraction(expected, judge.evidence(variant.normalized_query))
    return (intent + slots) / 2.0


def _vietnamese_metrics(kb, search, judge, intent_cases: list[dict], limit: int) -> dict:
    bases = _stable_sample(
        [case["query"] for case in intent_cases if len(case["query"].split()) >= 2],
        limit, lambda value: "vietnamese:" + fold(value))
    variants = {
        "accentless": strip_accents,
        "unicode_nfd": lambda value: unicodedata.normalize("NFD", value),
        "format_noise": lambda value: " !!!  " + "   ".join(
            value.swapcase().split()) + " ??? ",
        "single_edit": _duplicate_letter,
    }
    metrics = {}
    for name, transform in variants.items():
        retention = rank_retention = clean_rank_cases = 0.0
        for query in bases:
            clean = understand(query, kb)
            noisy = understand(transform(query), kb)
            retention += _semantic_retention(query, clean, noisy, judge)
            clean_results = search.search(query, top_k=5)["results"]
            noisy_results = search.search(transform(query), top_k=5)["results"]
            if clean_results:
                clean_rank_cases += 1
                clean_names = {fold(row["name"]) for row in clean_results[:3]}
                noisy_names = {fold(row["name"]) for row in noisy_results[:5]}
                rank_retention += bool(clean_names & noisy_names)
        metrics[name] = {
            "cases": len(bases),
            "semantic_retention": _ratio(retention, len(bases)),
            "search_rank_retention": _ratio(rank_retention, clean_rank_cases),
        }

    colloquial = [
        ("quán cà phê gần tui", "Nearby Search",
         {"category": {"Quán cà phê"}, "location": {"current_location"}}),
        ("có cây atm nào gần tui hông", "Nearby Search",
         {"category": {"ATM"}, "location": {"current_location"}}),
        ("bv nhi gần đây", "Nearby Search", {"category": {"Bệnh viện"}}),
        ("khách sạn nào hông quá mắc", "Category Search",
         {"category": {"Khách sạn"}}),
    ]
    colloquial_score = 0.0
    for query, expected_intent, expected_slots in colloquial:
        output = understand(query, kb)
        intent_score = float(_intent_compatible(expected_intent, output.intent))
        slot_score = judge.slot_fraction(
            expected_slots, judge.evidence(output.normalized_query))
        colloquial_score += (intent_score + slot_score) / 2.0
    metrics["colloquial"] = {
        "cases": len(colloquial),
        "semantic_fidelity": _ratio(colloquial_score, len(colloquial)),
    }
    return metrics


def _bench(inputs: Sequence[str], function: Callable[[str], object], repeat: int) -> dict:
    for value in inputs:
        function(value)
    samples = []
    errors = 0
    for _ in range(repeat):
        for value in inputs:
            started = time.perf_counter()
            try:
                function(value)
            except Exception:
                errors += 1
            samples.append((time.perf_counter() - started) * 1000.0)
    return {**_latency(samples), "errors": errors,
            "error_rate": _ratio(errors, len(samples))}


def _production_metrics(kb, search, autocomplete, intent_cases: list[dict],
                        repeat: int) -> dict:
    queries = _stable_sample([case["query"] for case in intent_cases], 24,
                             lambda value: "runtime:" + fold(value))
    prefixes = [_prefix(query, 0.5) for query in queries if len(query) >= 4]
    p6_latency = _bench(queries, lambda query: understand(query, kb), repeat)
    p7_latency = _bench(queries, lambda query: search.search(query, top_k=5), repeat)
    p9_latency = _bench(prefixes, lambda prefix: autocomplete.suggest(prefix, 6), repeat)

    deterministic = bounded = unique_results = reasons = result_count = 0
    for query in queries:
        left = search.search(query, top_k=5)
        right = search.search(query, top_k=5)
        deterministic += left == right
        rows = left["results"]
        bounded += all(math.isfinite(float(row["score"]))
                       and 0 <= float(row["score"]) <= 1 for row in rows)
        unique_results += len({fold(row.get("display_name") or row["name"])
                               for row in rows}) == len(rows)
        reasons += sum(bool(row.get("reasons")) for row in rows)
        result_count += len(rows)

    nonce = _nonce_queries(kb)
    blank_ood = ["", "   ", *nonce]
    autocomplete_abstention = sum(
        not autocomplete.suggest(value, 6).get("suggestions") for value in blank_ood)
    search_abstention = sum(not search.search(value, top_k=5)["results"]
                            for value in blank_ood)

    tasks = [("p6", query) for query in queries[:8]] \
        + [("p7", query) for query in queries[:8]] \
        + [("p9", prefix) for prefix in prefixes[:8]]

    def concurrent(item):
        name, value = item
        if name == "p6":
            return understand(value, kb).intent
        if name == "p7":
            return len(search.search(value, top_k=5)["results"])
        return len(autocomplete.suggest(value, 6)["suggestions"])

    started = time.perf_counter()
    concurrent_errors = 0
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = [pool.submit(concurrent, item) for item in tasks]
        for future in futures:
            try:
                future.result()
            except Exception:
                concurrent_errors += 1
    concurrent_ms = (time.perf_counter() - started) * 1000.0

    return {
        "runtime_cases": len(queries),
        "p6_latency": p6_latency, "p7_latency": p7_latency,
        "autocomplete_latency": p9_latency,
        "deterministic_search_rate": _ratio(deterministic, len(queries)),
        "bounded_score_rate": _ratio(bounded, len(queries)),
        "unique_result_list_rate": _ratio(unique_results, len(queries)),
        "explained_result_rate": _ratio(reasons, result_count),
        "autocomplete_blank_ood_abstention": _ratio(
            autocomplete_abstention, len(blank_ood)),
        "search_blank_ood_abstention": _ratio(search_abstention, len(blank_ood)),
        "concurrency": {
            "requests": len(tasks), "workers": 4,
            "elapsed_ms": round(concurrent_ms, 3),
            "error_rate": _ratio(concurrent_errors, len(tasks)),
        },
    }


def _corpus_fingerprint(kb) -> str:
    state = {
        "pois": [poi.to_dict() for poi in kb.pois],
        "addresses": kb.addresses,
        "popular_queries": kb.popular_queries,
        "autocomplete_pairs": kb.autocomplete_pairs,
        "category_terms": kb.category_terms,
        "attribute_terms": kb.attribute_terms,
        "dish_terms": kb.dish_terms,
    }
    return hashlib.sha256(json.dumps(
        state, ensure_ascii=False, sort_keys=True, default=str,
        separators=(",", ":")).encode("utf-8")).hexdigest()


_FLOORS = {
    ("suggestion_relevance", "semantic_success@6"): 0.60,
    ("suggestion_relevance", "grounded_suggestion_rate"): 0.75,
    ("suggestion_relevance", "top1_slot_retention"): 0.65,
    ("intent_prediction", "strict_accuracy"): 0.75,
    ("intent_prediction", "macro_f1"): 0.65,
    ("intent_prediction", "typed_slot_fidelity"): 0.80,
    ("query_completion", "list_coverage"): 0.75,
    ("query_completion", "semantic_success_auc"): 0.55,
    ("query_completion", "unique_list_rate"): 1.0,
    ("query_completion", "finite_bounded_score_rate"): 1.0,
    ("query_completion", "monotonic_score_rate"): 1.0,
    ("production_readiness", "deterministic_search_rate"): 1.0,
    ("production_readiness", "bounded_score_rate"): 1.0,
    ("production_readiness", "unique_result_list_rate"): 1.0,
    ("production_readiness", "explained_result_rate"): 0.75,
    ("production_readiness", "autocomplete_blank_ood_abstention"): 1.0,
    ("production_readiness", "search_blank_ood_abstention"): 1.0,
}

_NESTED_FLOORS = {
    ("vietnamese_handling", "accentless", "semantic_retention"): 0.90,
    ("vietnamese_handling", "unicode_nfd", "semantic_retention"): 0.90,
    ("vietnamese_handling", "format_noise", "semantic_retention"): 0.90,
    ("vietnamese_handling", "single_edit", "semantic_retention"): 0.55,
    ("vietnamese_handling", "single_edit", "search_rank_retention"): 0.65,
    ("vietnamese_handling", "colloquial", "semantic_fidelity"): 0.85,
}

_HIGHER = tuple(_FLOORS) + (
    ("suggestion_relevance", "graded_utility@6"),
    ("suggestion_relevance", "semantic_success@1"),
    ("suggestion_relevance", "semantic_success@3"),
    ("query_completion", "success_persistence"),
    ("intent_prediction", "compatible_accuracy"),
    ("intent_prediction", "accentless_intent_accuracy"),
)

_HIGHER_NESTED = tuple(_NESTED_FLOORS)
_LOWER = (
    ("suggestion_relevance", "unrelated_suggestion_rate"),
    ("intent_prediction", "confidence_brier"),
    ("intent_prediction", "confidence_ece"),
)
_COUNT_PATHS = (
    ("suggestion_relevance", "cases"),
    ("intent_prediction", "cases"),
    ("intent_prediction", "families"),
    ("query_completion", "targets"),
    ("query_completion", "prefix_cases"),
    ("production_readiness", "runtime_cases"),
)


def _path_value(value: dict, path: tuple[str, ...]):
    for key in path:
        value = value[key]
    return value


def _check(result: dict, baseline: dict | None, tolerance: float) -> list[str]:
    failures = []
    for (group, metric), floor in _FLOORS.items():
        value = float(result[group][metric])
        if value + 1e-12 < floor:
            failures.append(f"{group}.{metric}: {value:.4f} < {floor:.4f}")
    for path, floor in _NESTED_FLOORS.items():
        value = float(_path_value(result, path))
        if value + 1e-12 < floor:
            failures.append(f"{'.'.join(path)}: {value:.4f} < {floor:.4f}")
    if result["suggestion_relevance"]["cases"] < 12:
        failures.append("suggestion_relevance.cases is too small")
    if result["intent_prediction"]["families"] < 5:
        failures.append("intent_prediction.families is too small")
    for name in ("p6_latency", "p7_latency", "autocomplete_latency"):
        if result["production_readiness"][name]["n"] <= 0:
            failures.append(f"production_readiness.{name}.n is empty")
    for name, values in result["vietnamese_handling"].items():
        if int(values.get("cases", 0)) <= 0:
            failures.append(f"vietnamese_handling.{name}.cases is empty")
    if result["production_readiness"]["concurrency"]["error_rate"] > 0:
        failures.append("production_readiness.concurrency.error_rate > 0")
    if baseline is None:
        return failures
    for key in ("schema_version", "mode", "uses_public_evaluation", "judge",
                "embedder", "embed_model", "corpus_fingerprint",
                "evaluator_config"):
        if baseline.get(key) != result.get(key):
            failures.append(
                f"incomparable {key}: {baseline.get(key)!r} != {result.get(key)!r}")
    for group, metric in _HIGHER:
        if metric not in baseline.get(group, {}):
            failures.append(f"baseline missing {group}.{metric}")
            continue
        before, after = float(baseline[group][metric]), float(result[group][metric])
        if after + tolerance < before:
            failures.append(f"{group}.{metric}: {before:.4f} -> {after:.4f}")
    for path in _HIGHER_NESTED:
        before = float(_path_value(baseline, path))
        after = float(_path_value(result, path))
        if after + tolerance < before:
            failures.append(
                f"{'.'.join(path)}: {before:.4f} -> {after:.4f}")
    for group, metric in _LOWER:
        before = float(baseline[group][metric])
        after = float(result[group][metric])
        if after > before + tolerance:
            failures.append(f"{group}.{metric}: {before:.4f} -> {after:.4f}")
    for path in _COUNT_PATHS:
        before, after = _path_value(baseline, path), _path_value(result, path)
        if before != after:
            failures.append(f"incomparable {'.'.join(path)}: {before} != {after}")
    for key in ("p6_latency", "p7_latency", "autocomplete_latency"):
        before = float(baseline["production_readiness"][key]["p95_ms"])
        after = float(result["production_readiness"][key]["p95_ms"])
        if after > max(before * 1.5, before + 2.0):
            failures.append(f"production_readiness.{key}.p95_ms: {before:.2f} -> {after:.2f}")
    return failures


def _render_report(result: dict) -> str:
    suggestion = result["suggestion_relevance"]
    intent = result["intent_prediction"]
    completion = result["query_completion"]
    vi = result["vietnamese_handling"]
    prod = result["production_readiness"]
    pct = lambda value: f"{100 * value:.1f}%"
    lines = [
        "# Semantics-first search experience quality", "",
        "This report uses a deterministic corpus-derived regression sample and an independent",
        "accent-safe metadata/lexicon judge. Exact expected strings are a secondary",
        "diagnostic; semantic relevance, intent/slot fidelity, Vietnamese robustness,",
        "and runtime behavior are the acceptance criteria. Catalog and popular-query rows",
        "remain visible to the live engine, so this is a regression gate rather than an",
        "estimate of performance on unseen data.", "",
        "## Scorecard", "",
        "| Criterion | Primary evidence |",
        "|---|---|",
        (f"| Suggestion relevance | success@6 {pct(suggestion['semantic_success@6'])}; "
         f"graded utility {pct(suggestion['graded_utility@6'])}; unrelated "
         f"{pct(suggestion['unrelated_suggestion_rate'])} |"),
        (f"| Intent prediction | strict {pct(intent['strict_accuracy'])}; macro-F1 "
         f"{pct(intent['macro_f1'])}; slot fidelity {pct(intent['typed_slot_fidelity'])} |"),
        (f"| Query completion | semantic AUC {pct(completion['semantic_success_auc'])}; "
         f"coverage {pct(completion['list_coverage'])}; median savings "
         f"{pct(completion['median_keystroke_savings'])} |"),
        (f"| Vietnamese handling | accentless semantic retention "
         f"{pct(vi['accentless']['semantic_retention'])}; typo retention "
         f"{pct(vi['single_edit']['semantic_retention'])} |"),
        (f"| Production readiness | P6/P7/autocomplete p95 "
         f"{prod['p6_latency']['p95_ms']:.2f}/{prod['p7_latency']['p95_ms']:.2f}/"
         f"{prod['autocomplete_latency']['p95_ms']:.2f} ms; concurrent errors "
         f"{pct(prod['concurrency']['error_rate'])} |"),
        "", "## Exact-string diagnostic", "",
        (f"Exact target MRR is {completion['exact_target_mrr_diagnostic']:.3f}. It is "
         "reported for compatibility and is not a gate floor."),
    ]
    if result.get("comparison"):
        lines.extend(["", "## Frozen-baseline comparison", "",
                      f"Regressions: {len(result['comparison']['regressions'])}."])
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--per-family", type=int, default=20)
    parser.add_argument("--vietnamese-cases", type=int, default=40)
    parser.add_argument("--repeat", type=int, default=2)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--report", type=Path)
    parser.add_argument("--baseline", type=Path)
    parser.add_argument("--no-baseline", action="store_true")
    parser.add_argument("--report-only", action="store_true")
    parser.add_argument("--allowed-regression", type=float, default=0.01)
    args = parser.parse_args()

    load_started = time.perf_counter()
    kb = load_kb()
    kb_ms = (time.perf_counter() - load_started) * 1000.0
    search_started = time.perf_counter()
    search = SemanticSearchEngine(kb)
    search_ms = (time.perf_counter() - search_started) * 1000.0
    autocomplete_started = time.perf_counter()
    autocomplete = TrieAutocomplete(kb)
    autocomplete_ms = (time.perf_counter() - autocomplete_started) * 1000.0
    judge = SemanticJudge(kb)

    relevance, completion = _suggestion_and_completion(
        kb, autocomplete, judge, args.per_family)
    intent, intent_failures = _intent_metrics(kb, judge, args.per_family)
    intent_cases = _intent_cases(kb, judge, args.per_family)
    vietnamese = _vietnamese_metrics(
        kb, search, judge, intent_cases, args.vietnamese_cases)
    production = _production_metrics(
        kb, search, autocomplete, intent_cases, args.repeat)
    production["startup"] = {
        "kb_ms": round(kb_ms, 3), "search_ms": round(search_ms, 3),
        "autocomplete_ms": round(autocomplete_ms, 3),
    }

    result = {
        "schema_version": 2,
        "mode": "corpus-derived-semantic-experience",
        "uses_public_evaluation": False,
        "judge": "independent-accent-safe-metadata-lexicon-v1",
        "evaluator_config": {
            "per_family": args.per_family,
            "vietnamese_cases": args.vietnamese_cases,
            "repeat": args.repeat,
            "sample": "sha256-mod-5-bucket-4",
            "prefix_fractions": list(FRACTIONS),
        },
        "embedder": search.index.embedder.kind,
        "embed_model": config.EMBED_MODEL if search.index.embedder.kind \
            == "sentence-transformer" else "tfidf-char-2-4+bm25",
        "corpus_fingerprint": _corpus_fingerprint(kb),
        "suggestion_relevance": relevance,
        "intent_prediction": intent,
        "query_completion": completion,
        "vietnamese_handling": vietnamese,
        "production_readiness": production,
        "sample_failures": {"intent": intent_failures},
    }

    baseline_path = args.baseline
    missing_baseline = None
    if baseline_path is None and not args.no_baseline and not args.report_only:
        suffix = "e5" if result["embedder"] == "sentence-transformer" else "tfidf"
        candidate = ARTIFACTS / f"experience_baseline_{suffix}.json"
        if candidate.exists():
            baseline_path = candidate
        else:
            missing_baseline = f"missing frozen baseline: {candidate}"
    baseline = json.loads(baseline_path.read_text()) if baseline_path else None
    failures = _check(result, baseline, args.allowed_regression)
    if missing_baseline:
        failures.append(missing_baseline)
    if baseline_path:
        result["comparison"] = {"baseline": str(baseline_path),
                                "regressions": failures}

    payload = json.dumps(result, ensure_ascii=False, indent=2)
    print(payload)
    report = _render_report(result)
    if args.report_only or not failures:
        if args.output:
            args.output.parent.mkdir(parents=True, exist_ok=True)
            args.output.write_text(payload)
        if args.report:
            args.report.parent.mkdir(parents=True, exist_ok=True)
            args.report.write_text(report)
    if failures and not args.report_only:
        raise SystemExit("experience quality gate failed: " + "; ".join(failures))


if __name__ == "__main__":
    main()

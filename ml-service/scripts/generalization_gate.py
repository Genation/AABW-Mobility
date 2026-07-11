"""Corpus-derived quality gate for P6 understanding and P7 ranking.

This suite intentionally never imports ``load_eval``.  It creates expectations
from the searchable corpus itself, then measures invariants that should hold for
new data as well as the bundled challenge data:

* exact and lightly corrupted POI names remain grounded;
* formatting noise does not change semantic interpretation;
* direct-name searches retrieve the named P7 POI;
* generated category + attribute + city searches satisfy their constraints;
* blank queries abstain and every public score is finite and bounded.

Use ``--baseline`` in CI to reject a candidate that regresses a previously
frozen run.  Public challenge labels remain a final compatibility report, not an
optimization signal for this gate.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from collections import Counter
from pathlib import Path
from typing import Callable, Iterable

from tascomaps import config
from tascomaps.core.text import fold, fold_tokens, normalize, strip_accents
from tascomaps.core.understand import understand
from tascomaps.data.loader import load_kb
from tascomaps.engines.semantic_search import SemanticSearchEngine, _haversine


def _stable_sample(values: Iterable, limit: int, key: Callable) -> list:
    ordered = sorted(values, key=lambda value: hashlib.sha256(
        key(value).encode("utf-8")).hexdigest())
    return ordered[:limit] if limit > 0 else ordered


def _unique_pois(pois) -> list:
    counts = Counter(fold(p.name) for p in pois if p.name)
    return [p for p in pois if p.name and counts[fold(p.name)] == 1]


def _duplicate_letter(value: str) -> str:
    words = [(i, word) for i, word in enumerate(value.split())
             if sum(ch.isalpha() for ch in word) >= 4]
    if not words:
        return value
    index, word = max(words, key=lambda item: len(item[1]))
    letters = list(word)
    at = max(1, len(letters) // 2)
    letters.insert(at, letters[at])
    parts = value.split()
    parts[index] = "".join(letters)
    return " ".join(parts)


def _nonce_queries(kb, count: int = 5) -> list[str]:
    """Generate pure and corpus-prefixed nonwords absent from the live KB."""
    corpus = fold(" ".join(p.search_text for p in kb.pois))
    alphabet = "qzxvwjk"
    values, counter = [], 0
    while len(values) < count:
        digest = hashlib.sha256(f"tasco-ood-{counter}".encode()).digest()
        token = "".join(alphabet[value % len(alphabet)] for value in digest[:12])
        counter += 1
        if token not in corpus and not kb.lexicon.exact(token):
            values.append(token)
    corpus_tokens = _stable_sample(
        {
            token for p in kb.pois
            for token in fold_tokens(p.search_text)
            if len(token) >= 4 and token.isalpha()
        },
        count,
        lambda token: "ood-prefix:" + token,
    )
    prefixed = []
    for prefix, nonce in zip(corpus_tokens, values):
        prefix_size = min(5, max(3, len(prefix) // 2))
        combined = prefix[:prefix_size] + nonce
        if combined not in corpus and not kb.lexicon.exact(combined):
            prefixed.append(combined)
    return values + prefixed


def _ratio(ok: int, total: int) -> float:
    return ok / total if total else 0.0


def _p6_metrics(kb, limit: int) -> tuple[dict, list[dict]]:
    pois = _stable_sample(
        _unique_pois(kb.pois), limit,
        lambda p: f"{p.source}:{p.poi_id}:{fold(p.name)}")
    exact = punctuation = typo = 0
    failures = []
    long_total = long_ok = 0

    for poi in pois:
        clean = understand(poi.name, kb)
        clean_name = fold(clean.entities.get("poi_name", ""))
        exact_ok = clean.intent == "POI Search" and clean_name == fold(poi.name)
        exact += exact_ok
        if len(poi.name.split()) > 6:
            long_total += 1
            long_ok += exact_ok

        noisy = understand(f"  {poi.name.swapcase()},  ", kb)
        punctuation_ok = (
            noisy.intent == clean.intent
            and fold(noisy.entities.get("poi_name", "")) == clean_name
        )
        punctuation += punctuation_ok

        changed = _duplicate_letter(poi.name)
        if changed == poi.name:
            typo_ok = exact_ok
        else:
            fuzzy = understand(changed, kb)
            typo_ok = (fuzzy.intent == "POI Search"
                       and fold(fuzzy.entities.get("poi_name", "")) == fold(poi.name))
        typo += typo_ok

        if len(failures) < 12 and not (exact_ok and punctuation_ok and typo_ok):
            failures.append({
                "source": poi.source,
                "poi_id": poi.poi_id,
                "name": poi.name,
                "exact": bool(exact_ok),
                "punctuation": bool(punctuation_ok),
                "single_edit": bool(typo_ok),
            })

    blank = understand(" \t\n", kb)
    blank_abstains = not any(blank.entities.get(key) for key in
                             ("poi_name", "reference_poi", "candidates"))
    nonce = _nonce_queries(kb)
    ood_abstains = sum(
        not any(understand(query, kb).entities.get(key) for key in
                ("poi_name", "reference_poi", "candidates"))
        for query in nonce)
    metrics = {
        "cases": len(pois),
        "exact_poi_accuracy": _ratio(exact, len(pois)),
        "long_poi_accuracy": _ratio(long_ok, long_total),
        "punctuation_stability": _ratio(punctuation, len(pois)),
        "single_edit_accuracy": _ratio(typo, len(pois)),
        "blank_abstains": bool(blank_abstains),
        "ood_cases": len(nonce),
        "ood_abstention": _ratio(ood_abstains, len(nonce)),
    }
    return metrics, failures


def _attribute_haystack(poi) -> str:
    return fold(" ; ".join([*poi.attributes, *poi.tags, poi.description])
                .replace("-", " "))


def _semantic_overlap(left: str, right: str) -> bool:
    a, b = fold(left), fold(right)
    return bool(a and b and (a in b or b in a))


def _p7_metrics(kb, engine, limit: int) -> tuple[dict, list[dict]]:
    pois = _stable_sample(
        _unique_pois(kb.pois_t2), limit,
        lambda p: f"{p.poi_id}:{fold(p.name)}")
    direct = address_hits = reference_address_hits = partial_hits = scores_safe = 0
    failures = []
    for poi in pois:
        output = engine.search(poi.name, top_k=5)
        results = output["results"]
        hit = any(fold(row["name"]) == fold(poi.name) for row in results)
        direct += hit
        safe = all(math.isfinite(float(row["score"]))
                   and 0.0 <= float(row["score"]) <= 1.0 for row in results)
        scores_safe += safe
        if len(failures) < 12 and not (hit and safe):
            failures.append({"query": poi.name, "direct_hit@5": hit,
                             "safe_scores": safe})

    address_counts = Counter(fold(p.address) for p in kb.pois_t2 if p.address)
    address_cases = _stable_sample(
        [p for p in kb.pois_t2 if p.address and address_counts[fold(p.address)] == 1],
        limit, lambda p: f"address:{p.poi_id}:{fold(p.address)}")
    for poi in address_cases:
        results = engine.search(poi.address, top_k=5)["results"]
        hit = any(fold(row["name"]) == fold(poi.name) for row in results)
        address_hits += hit
        if len(failures) < 16 and not hit:
            failures.append({"query": poi.address, "address_hit@5": False,
                             "expected": poi.name})

    short_address_points = {}
    for poi in kb.pois:
        if (poi.address and "," in poi.address
                and poi.lat is not None and poi.lng is not None):
            key = fold(poi.address.split(",", 1)[0].strip())
            short_address_points.setdefault(key, []).append((poi.lat, poi.lng))
    for row in kb.addresses:
        address = str(row.get("full_address") or "")
        lat, lng = row.get("latitude"), row.get("longitude")
        if address and "," in address and lat is not None and lng is not None:
            key = fold(address.split(",", 1)[0].strip())
            short_address_points.setdefault(key, []).append((float(lat), float(lng)))
    unambiguous_short_addresses = {
        key for key, points in short_address_points.items()
        if not any(_haversine(left, right) > 0.5
                   for index, left in enumerate(points)
                   for right in points[index + 1:])
    }
    reference_address_cases = []
    for poi in kb.pois_t2:
        if not (poi.category and poi.address
                and poi.lat is not None and poi.lng is not None):
            continue
        # Prefer the common shortened form (house number + street) so the gate
        # exercises resolution when ward/district/city suffixes are omitted.
        short = poi.address.split(",", 1)[0].strip() \
            if "," in poi.address else ""
        reference = short if short and fold(short) in unambiguous_short_addresses \
            else poi.address
        query = f"{poi.category} gần {reference}"
        if understand(query, kb).entities.get("reference_address"):
            reference_address_cases.append((query, poi))
    reference_address_cases = _stable_sample(
        reference_address_cases, limit,
        lambda case: f"reference-address:{case[1].poi_id}:{fold(case[1].address)}")
    for query, reference in reference_address_cases:
        output = engine.search(query, top_k=1)
        results = output["results"]
        selected = kb.resolve(results[0]["poi_id"], results[0]["name"]) \
            if results else None
        hit = bool(
            output.get("diagnostics", {}).get("location_source")
            == "reference_address"
            and selected and selected.lat is not None and selected.lng is not None
            and fold(selected.category) == fold(reference.category)
            and _haversine((reference.lat, reference.lng),
                           (selected.lat, selected.lng)) <= 5.0
        )
        reference_address_hits += hit
        if len(failures) < 20 and not hit:
            failures.append({
                "query": query,
                "reference_address_satisfied@1": False,
                "top": results[0]["name"] if results else None,
            })

    name_tokens = {
        id(poi): {token for token in fold_tokens(poi.name)
                  if len(token) >= 5 and token.isalpha()}
        for poi in kb.pois_t2
    }
    token_counts = Counter(token for tokens in name_tokens.values() for token in tokens)
    partial_cases = []
    for poi in kb.pois_t2:
        for token in name_tokens[id(poi)]:
            # A distinctive name token that is absent from P6's phrase lexicon
            # checks that P7 can retrieve open vocabulary via the index.
            token_understanding = understand(token, kb)
            is_no_match = (token_understanding.intent == "Ambiguous"
                           and token_understanding.entities.get("ambiguity_type")
                           == "no_match")
            if (token_counts[token] == 1 and not kb.lexicon.exact(token)
                    and is_no_match):
                partial_cases.append((token, poi))
    partial_cases = _stable_sample(
        partial_cases, limit, lambda case: f"token:{case[0]}:{case[1].poi_id}")
    for token, poi in partial_cases:
        results = engine.search(token, top_k=5)["results"]
        hit = any(fold(row["name"]) == fold(poi.name) for row in results)
        partial_hits += hit
        if len(failures) < 20 and not hit:
            failures.append({"query": token, "partial_name_hit@5": False,
                             "expected": poi.name})

    cases = {}
    for poi in kb.pois_t2:
        if not (poi.category and poi.city and poi.attributes):
            continue
        # The expectation comes from metadata, not a hand-authored answer.  Use
        # every distinct tuple at most once to avoid over-weighting franchises.
        attr = poi.attributes[0]
        key = (fold(poi.category), fold(attr), fold(poi.city))
        cases.setdefault(key, (poi.category, attr, poi.city))
    structured = _stable_sample(
        cases.values(), limit,
        lambda case: "|".join(fold(value) for value in case))
    constraint_ok = robust_constraint_ok = 0
    for category, attribute, city in structured:
        query = f"tìm {category} có {attribute} tại {city}"
        # Accent removal plus a single edit exercises a different surface form
        # without inventing a hand-labelled answer.
        noisy_query = (f"tim {strip_accents(category)} co "
                       f"{_duplicate_letter(strip_accents(attribute))} tai "
                       f"{strip_accents(city)}")
        outcomes = []
        for variant in (query, noisy_query):
            results = engine.search(variant, top_k=1)["results"]
            ok = False
            if results:
                row = results[0]
                selected = next((p for p in kb.pois_t2
                                 if p.poi_id == row["poi_id"]
                                 and fold(p.name) == fold(row["name"])), None)
                ok = bool(
                    selected
                    and fold(selected.category) == fold(category)
                    and fold(selected.city) == fold(city)
                    and fold(attribute) in _attribute_haystack(selected)
                )
            outcomes.append((ok, results))
        clean_ok, clean_results = outcomes[0]
        noisy_ok, noisy_results = outcomes[1]
        constraint_ok += clean_ok
        robust_constraint_ok += noisy_ok
        if len(failures) < 20 and not (clean_ok and noisy_ok):
            failures.append({
                "query": query,
                "perturbed_query": noisy_query,
                "constraint_satisfied@1": bool(clean_ok),
                "perturbed_constraint_satisfied@1": bool(noisy_ok),
                "top": clean_results[0]["name"] if clean_results else None,
                "perturbed_top": noisy_results[0]["name"] if noisy_results else None,
            })

    by_place = {}
    category_terms = {
        fold(value) for item in kb.category_terms.items() for value in item if value
    }
    for poi in kb.pois_t2:
        if poi.category and poi.city and poi.attributes:
            by_place.setdefault((fold(poi.category), fold(poi.city)), []).append(poi)
    negation_cases = {}
    for group in by_place.values():
        observed = {
            fold(value): value for poi in group for value in poi.attributes
            if value and fold(value) not in category_terms
            and not fold(value).startswith("gan ")
        }
        for target in group:
            target_hay = _attribute_haystack(target)
            for required_attr in target.attributes:
                if (fold(required_attr) in category_terms
                        or fold(required_attr).startswith("gan ")):
                    continue
                for excluded_fold, excluded_attr in observed.items():
                    if excluded_fold and excluded_fold not in target_hay:
                        key = (fold(target.category), excluded_fold,
                               fold(required_attr), fold(target.city))
                        negation_cases.setdefault(
                            key, (target.category, excluded_attr,
                                  required_attr, target.city))
                        break
                if any(key[0] == fold(target.category) and key[3] == fold(target.city)
                       for key in negation_cases):
                    break
    negation_cases = _stable_sample(
        negation_cases.values(), limit,
        lambda case: "negation:" + "|".join(fold(value) for value in case))
    negation_parse = negation_rank = 0
    for category, excluded_attr, required_attr, city in negation_cases:
        query = (f"{category} không có {excluded_attr} nhưng có "
                 f"{required_attr} tại {city}")
        output = engine.search(query, top_k=1)
        parsed_required = output.get("required_attributes", [])
        parsed_excluded = output.get("excluded_attributes", [])
        required_canonical = kb.attribute_terms.get(
            normalize(required_attr), required_attr)
        excluded_canonical = kb.attribute_terms.get(
            normalize(excluded_attr), excluded_attr)
        parse_ok = (
            any(_semantic_overlap(required_canonical, value) for value in parsed_required)
            and any(_semantic_overlap(excluded_canonical, value) for value in parsed_excluded)
            and not any(_semantic_overlap(required_canonical, value)
                        for value in parsed_excluded)
        )
        negation_parse += parse_ok
        results = output["results"]
        rank_ok = False
        if results:
            selected = next((p for p in kb.pois_t2
                             if p.poi_id == results[0]["poi_id"]
                             and fold(p.name) == fold(results[0]["name"])), None)
            if selected:
                hay = _attribute_haystack(selected)
                rank_ok = (fold(required_attr) in hay and fold(excluded_attr) not in hay)
        negation_rank += rank_ok
        if len(failures) < 24 and not (parse_ok and rank_ok):
            failures.append({
                "query": query, "negation_parse": bool(parse_ok),
                "negation_constraint_satisfied@1": bool(rank_ok),
                "top": results[0]["name"] if results else None,
            })

    blank_results = engine.search(" \t\n", top_k=5)["results"]
    nonce = _nonce_queries(kb)
    ood_abstains = sum(not engine.search(query, top_k=5)["results"]
                       for query in nonce)
    metrics = {
        "direct_cases": len(pois),
        "direct_name_hit@5": _ratio(direct, len(pois)),
        "address_cases": len(address_cases),
        "address_hit@5": _ratio(address_hits, len(address_cases)),
        "reference_address_cases": len(reference_address_cases),
        "reference_address_satisfaction@1": _ratio(
            reference_address_hits, len(reference_address_cases)),
        "partial_name_cases": len(partial_cases),
        "partial_name_hit@5": _ratio(partial_hits, len(partial_cases)),
        "bounded_finite_scores": _ratio(scores_safe, len(pois)),
        "structured_cases": len(structured),
        "constraint_satisfaction@1": _ratio(constraint_ok, len(structured)),
        "perturbed_constraint_satisfaction@1": _ratio(
            robust_constraint_ok, len(structured)),
        "negation_cases": len(negation_cases),
        "negation_parse_accuracy": _ratio(negation_parse, len(negation_cases)),
        "negation_constraint_satisfaction@1": _ratio(
            negation_rank, len(negation_cases)),
        "blank_abstains": not blank_results,
        "ood_cases": len(nonce),
        "ood_abstention": _ratio(ood_abstains, len(nonce)),
    }
    return metrics, failures


_HIGHER_IS_BETTER = (
    ("p6", "exact_poi_accuracy"),
    ("p6", "long_poi_accuracy"),
    ("p6", "punctuation_stability"),
    ("p6", "single_edit_accuracy"),
    ("p6", "ood_abstention"),
    ("p7", "direct_name_hit@5"),
    ("p7", "address_hit@5"),
    ("p7", "reference_address_satisfaction@1"),
    ("p7", "partial_name_hit@5"),
    ("p7", "bounded_finite_scores"),
    ("p7", "constraint_satisfaction@1"),
    ("p7", "perturbed_constraint_satisfaction@1"),
    ("p7", "negation_parse_accuracy"),
    ("p7", "negation_constraint_satisfaction@1"),
    ("p7", "ood_abstention"),
)

_MINIMUMS = {
    ("p6", "exact_poi_accuracy"): 0.95,
    ("p6", "long_poi_accuracy"): 0.90,
    ("p6", "punctuation_stability"): 0.98,
    ("p6", "single_edit_accuracy"): 0.75,
    ("p6", "ood_abstention"): 1.0,
    ("p7", "direct_name_hit@5"): 0.98,
    ("p7", "address_hit@5"): 0.90,
    ("p7", "reference_address_satisfaction@1"): 0.90,
    ("p7", "partial_name_hit@5"): 0.90,
    ("p7", "bounded_finite_scores"): 1.0,
    ("p7", "constraint_satisfaction@1"): 0.90,
    ("p7", "perturbed_constraint_satisfaction@1"): 0.75,
    ("p7", "negation_parse_accuracy"): 0.90,
    ("p7", "negation_constraint_satisfaction@1"): 0.75,
    ("p7", "ood_abstention"): 1.0,
}


def _compare(result: dict, baseline: dict, tolerance: float) -> list[str]:
    regressions = []
    for key in ("gate_schema_version", "embedder", "embed_model",
                "corpus_fingerprint"):
        if baseline.get(key) != result.get(key):
            regressions.append(
                f"incomparable {key}: {baseline.get(key)!r} != {result.get(key)!r}")
    for group, metric in (("p6", "cases"), ("p6", "ood_cases"),
                          ("p7", "direct_cases"), ("p7", "ood_cases"),
                          ("p7", "address_cases"),
                          ("p7", "reference_address_cases"),
                          ("p7", "partial_name_cases"),
                          ("p7", "structured_cases"), ("p7", "negation_cases")):
        if metric not in baseline.get(group, {}):
            regressions.append(f"baseline missing {group}.{metric}")
            continue
        if int(result[group][metric]) < int(baseline[group][metric]):
            regressions.append(
                f"{group}.{metric}: {baseline[group][metric]} -> {result[group][metric]}")
    for group, metric in _HIGHER_IS_BETTER:
        if metric not in baseline.get(group, {}):
            regressions.append(f"baseline missing {group}.{metric}")
            continue
        before = float(baseline[group][metric])
        after = float(result[group][metric])
        if after + tolerance < before:
            regressions.append(
                f"{group}.{metric}: {before:.4f} -> {after:.4f}")
    for group in ("p6", "p7"):
        if baseline[group].get("blank_abstains") and not result[group]["blank_abstains"]:
            regressions.append(f"{group}.blank_abstains: true -> false")
    return regressions


def _minimum_failures(result: dict, limit: int) -> list[str]:
    failures = []
    expected_cases = min(limit, 20) if limit > 0 else 20
    family_minimums = {("p7", "partial_name_cases"): min(expected_cases, 2)}
    for group, metric in (("p6", "cases"), ("p7", "direct_cases"),
                          ("p7", "address_cases"),
                          ("p7", "reference_address_cases"),
                          ("p7", "partial_name_cases"),
                          ("p7", "structured_cases"), ("p7", "negation_cases")):
        minimum = family_minimums.get((group, metric), expected_cases)
        if int(result[group][metric]) < minimum:
            failures.append(
                f"{group}.{metric}: {result[group][metric]} < {minimum}")
    for (group, metric), floor in _MINIMUMS.items():
        value = float(result[group][metric])
        if value + 1e-12 < floor:
            failures.append(f"{group}.{metric}: {value:.4f} < {floor:.4f}")
    return failures


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0,
                        help="stable maximum per family; 0 evaluates all cases")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--baseline", type=Path,
                        help="frozen JSON run to compare against")
    parser.add_argument("--no-baseline", action="store_true",
                        help="skip automatic frozen-baseline comparison")
    parser.add_argument("--allowed-regression", type=float, default=0.005)
    args = parser.parse_args()

    kb = load_kb()
    engine = SemanticSearchEngine(kb)
    p6, p6_failures = _p6_metrics(kb, args.limit)
    p7, p7_failures = _p7_metrics(kb, engine, args.limit)
    corpus_state = {
        "pois": [poi.to_dict() for poi in kb.pois],
        "addresses": kb.addresses,
        "abbreviations": {
            key: {"abbr": value.abbr, "expansion": value.expansion,
                  "full": value.full, "type": value.type}
            for key, value in sorted(kb.abbrev.items())
        },
        "popular_queries": kb.popular_queries,
        "attribute_taxonomy": kb.attribute_taxonomy,
        "ranking_signals": kb.ranking_signals,
        "category_terms": kb.category_terms,
        "attribute_terms": kb.attribute_terms,
        "dish_terms": kb.dish_terms,
        "dish_heads": kb.dish_heads,
        "dish_categories": kb.dish_categories,
        "dish_head_categories": kb.dish_head_categories,
        "dish_token_vocab": kb.dish_token_vocab,
    }
    fingerprint = hashlib.sha256(json.dumps(
        corpus_state, ensure_ascii=False, sort_keys=True,
        separators=(",", ":"), default=str).encode("utf-8")).hexdigest()
    result = {
        "gate_schema_version": 2,
        "mode": "corpus-derived-generalization",
        "embedder": engine.index.embedder.kind,
        "embed_model": config.EMBED_MODEL if engine.index.embedder.kind \
            == "sentence-transformer" else "tfidf-char-2-4+bm25",
        "corpus_fingerprint": fingerprint,
        "uses_public_evaluation": False,
        "p6": p6,
        "p7": p7,
        "sample_failures": {"p6": p6_failures, "p7": p7_failures},
    }
    regressions = []
    baseline_path = args.baseline
    if baseline_path is None and not args.no_baseline:
        suffix = "e5" if engine.index.embedder.kind == "sentence-transformer" else "tfidf"
        candidate = Path(__file__).resolve().parent.parent / "artifacts" / \
            f"generalization_baseline_{suffix}.json"
        if candidate.exists():
            baseline_path = candidate
        else:
            regressions.append(f"missing frozen baseline: {candidate}")
    if baseline_path:
        regressions.extend(_compare(
            result, json.loads(baseline_path.read_text()), args.allowed_regression))
        result["comparison"] = {"baseline": str(baseline_path),
                                "regressions": regressions}
    print(json.dumps(result, ensure_ascii=False, indent=2))

    invariant_failures = _minimum_failures(result, args.limit)
    if not p6["blank_abstains"]:
        invariant_failures.append("P6 blank query did not abstain")
    if not p7["blank_abstains"]:
        invariant_failures.append("P7 blank query did not abstain")
    if p7["bounded_finite_scores"] < 1.0:
        invariant_failures.append("P7 emitted non-finite or out-of-range scores")
    if regressions or invariant_failures:
        raise SystemExit("quality gate failed: " + "; ".join(
            [*invariant_failures, *regressions]))
    # A failed run must never overwrite or create a file that callers may
    # mistake for a frozen passing baseline.
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

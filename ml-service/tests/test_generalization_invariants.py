"""KB-derived P6/P7 generalization checks.

These tests deliberately use only source-corpus metadata loaded by ``load_kb``.
The public evaluation sheets are guarded off and must not become an optimization
signal for this suite.
"""
from __future__ import annotations

import hashlib
import re
import unittest
from collections import Counter, defaultdict
from unittest.mock import patch

import numpy as np

from tascomaps.constants import (  # noqa: E402
    ATTRIBUTE_TERMS, CITY_CANON, LANDMARK_CATEGORIES, canon_city)
from tascomaps.core.text import fold, normalize  # noqa: E402
from tascomaps.core.understand import understand  # noqa: E402
from tascomaps.data import loader  # noqa: E402
from tascomaps.engines.semantic_search import (  # noqa: E402
    SemanticSearchEngine,
    _haversine,
)
from tascomaps.index.store import HybridIndex  # noqa: E402


def _stable_sample(items, size, key):
    """Select a reproducible corpus sample without choosing named fixtures."""
    ordered = sorted(
        items,
        key=lambda item: hashlib.sha256(key(item).encode("utf-8")).hexdigest(),
    )
    return ordered[:size]


def _unique_named_pois(kb, source=None):
    pois = [p for p in kb.pois if p.name and (source is None or p.source == source)]
    counts = Counter(fold(p.name) for p in pois)
    return sorted(
        (p for p in pois if counts[fold(p.name)] == 1),
        key=lambda p: (fold(p.name), p.source, p.poi_id),
    )


def _duplicate_middle_letter(text):
    """Duplicate one letter in the longest word, preserving the rest verbatim."""
    words = list(re.finditer(r"[^\W\d_]+", text, flags=re.UNICODE))
    word = max(words, key=lambda match: (len(match.group()), -match.start()))
    index = word.start() + len(word.group()) // 2
    return text[:index] + text[index] + text[index:]


def _entity_attributes(entities, singular, plural):
    values = []
    if entities.get(singular):
        values.append(entities[singular])
    values.extend(entities.get(plural, []) or [])
    return {fold(value) for value in values}


class GeneralizationInvariantTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Fail loudly if this suite, or code reached only by it, starts consuming
        # the public gold sheets. load_kb() does not use load_eval().
        cls._public_eval_guard = patch.object(
            loader,
            "load_eval",
            side_effect=AssertionError(
                "generalization tests must not read public evaluation rows"
            ),
        )
        cls._public_eval_guard.start()
        cls.addClassCleanup(cls._public_eval_guard.stop)

        cls.kb = loader.load_kb()
        cls.search = SemanticSearchEngine(cls.kb)
        cls.unique_pois = _unique_named_pois(cls.kb)
        cls.unique_t2_pois = _unique_named_pois(cls.kb, source="T2")

    def test_empty_query_has_no_arbitrary_poi_candidates(self):
        result = understand("   \t\n", self.kb)

        self.assertEqual(result.normalized_query, "")
        self.assertNotIn("poi_name", result.entities)
        self.assertNotIn("reference_poi", result.entities)
        self.assertFalse(result.entities.get("candidates"))

    def test_empty_semantic_query_returns_no_results(self):
        result = self.search.search("   \t\n", top_k=5)
        self.assertEqual(result["results"], [])

    def test_nonword_ood_query_abstains(self):
        query = "qzxvwjkqzxvw"
        understanding = understand(query, self.kb)
        self.assertFalse(understanding.entities.get("poi_name"))
        self.assertFalse(understanding.entities.get("candidates"))
        self.assertEqual(self.search.search(query, top_k=5)["results"], [])

    def test_nonword_ood_cannot_pass_on_dense_similarity_alone(self):
        query = "qzxvwjkqzxvw"
        self.search._dense_ood_floor = 0.0
        with patch.object(
            self.search.index,
            "retrieve_fused",
            return_value=[(0, 0.99, 0.0, 1.0)],
        ):
            output = self.search.search(query, top_k=5)
        self.assertEqual(output["results"], [])
        self.assertEqual(output["diagnostics"]["status"], "low_evidence")
        self.assertEqual(output["diagnostics"]["orthographic_support"], 0.0)

    def test_corpus_prefixed_nonword_cannot_bypass_ood_guard(self):
        corpus_tokens = {
            token for poi in self.unique_t2_pois
            for token in fold(poi.search_text).split()
            if len(token) >= 4 and token.isalpha()
        }
        prefix = _stable_sample(
            corpus_tokens, 1, lambda token: "ood-prefix:" + token
        )[0]
        query = prefix[:min(5, max(3, len(prefix) // 2))] + "qzxvwjkqzxvw"
        self.search._dense_ood_floor = 0.0
        with patch.object(
            self.search.index,
            "retrieve_fused",
            return_value=[(0, 0.99, 0.0, 1.0)],
        ):
            output = self.search.search(query, top_k=5)
        self.assertEqual(output["results"], [])
        self.assertLess(
            output["diagnostics"]["orthographic_support"],
            output["diagnostics"]["orthographic_floor"],
        )

    def test_case_punctuation_and_whitespace_are_stable(self):
        eligible = [p for p in self.unique_t2_pois if 2 <= len(p.name.split()) <= 6]
        poi = _stable_sample(eligible, 1, lambda p: f"{p.source}:{p.poi_id}:{p.name}")[0]
        noisy = f" \t!!!  {'   '.join(poi.name.swapcase().split())}  ???\n"

        clean_understanding = understand(poi.name, self.kb)
        noisy_understanding = understand(noisy, self.kb)
        self.assertEqual(clean_understanding.intent, noisy_understanding.intent)
        self.assertEqual(
            fold(clean_understanding.normalized_query),
            fold(noisy_understanding.normalized_query),
        )
        self.assertEqual(
            fold(clean_understanding.entities.get("poi_name", "")),
            fold(noisy_understanding.entities.get("poi_name", "")),
        )

        clean_names = [fold(row["name"]) for row in self.search.search(poi.name)["results"]]
        noisy_names = [fold(row["name"]) for row in self.search.search(noisy)["results"]]
        self.assertEqual(clean_names, noisy_names)

    def test_exact_long_poi_names_resolve_from_corpus(self):
        eligible = [
            p
            for p in self.unique_pois
            if len(p.name.split()) > 6
        ]
        sample = _stable_sample(
            eligible, 8, lambda p: f"{p.source}:{p.poi_id}:{p.name}"
        )
        self.assertEqual(len(sample), 8)

        for poi in sample:
            with self.subTest(source=poi.source, poi_id=poi.poi_id):
                result = understand(poi.name, self.kb)
                self.assertEqual(result.intent, "POI Search")
                self.assertEqual(fold(result.entities.get("poi_name", "")), fold(poi.name))

    def test_arbitrary_duplicated_letter_poi_typo_resolves(self):
        eligible = [
            p
            for p in self.unique_pois
            if 2 <= len(p.name.split()) <= 6
            and len(p.name) >= 12
            and re.search(r"[^\W\d_]{4}", p.name, flags=re.UNICODE)
        ]
        poi = _stable_sample(
            eligible, 1, lambda p: f"typo:{p.source}:{p.poi_id}:{p.name}"
        )[0]
        typo = _duplicate_middle_letter(poi.name)
        self.assertNotEqual(fold(typo), fold(poi.name))

        result = understand(typo, self.kb)
        self.assertEqual(result.intent, "POI Search")
        self.assertEqual(fold(result.entities.get("poi_name", "")), fold(poi.name))

    def test_morning_and_evening_times_are_distinct(self):
        morning = understand("mở cửa sau 8 giờ sáng", self.kb)
        evening = understand("mở cửa sau 8 giờ tối", self.kb)

        morning_hour = int(morning.entities["open_after"].split(":", 1)[0])
        evening_hour = int(evening.entities["open_after"].split(":", 1)[0])
        self.assertEqual(morning_hour, 8)
        self.assertEqual(evening_hour, 20)
        self.assertNotEqual(morning_hour, evening_hour)

    def test_negated_attribute_is_excluded_not_required(self):
        surfaces = defaultdict(list)
        for surface, canonical in ATTRIBUTE_TERMS.items():
            surfaces[fold(canonical)].append(surface)

        frequency = Counter()
        categories = defaultdict(Counter)
        for poi in self.kb.pois_t2:
            for raw_attribute in poi.attributes:
                raw_fold = fold(raw_attribute)
                for canonical_fold in surfaces:
                    if canonical_fold and (
                        canonical_fold == raw_fold or canonical_fold in raw_fold
                    ):
                        frequency[canonical_fold] += 1
                        categories[canonical_fold][poi.category] += 1

        attribute_fold, _ = frequency.most_common(1)[0]
        surface = min(surfaces[attribute_fold], key=lambda value: (len(value), fold(value)))
        category = categories[attribute_fold].most_common(1)[0][0]
        query = f"{category} không có {surface}"

        result = understand(query, self.kb)
        required = _entity_attributes(result.entities, "attribute", "attributes")
        excluded = _entity_attributes(
            result.entities, "excluded_attribute", "excluded_attributes"
        )
        self.assertNotIn(attribute_fold, required)
        self.assertIn(attribute_fold, excluded)

        ranked = self.search.search(query, top_k=5)
        self.assertNotIn(attribute_fold, {fold(value) for value in ranked["required_attributes"]})

    def test_navigation_origin_stops_before_destination(self):
        blocked = {"tu", "den", "chi", "duong"}
        eligible = [
            p
            for p in self.unique_pois
            if 2 <= len(p.name.split()) <= 4
            and not (set(fold(p.name).split()) & blocked)
        ]
        origin, destination = _stable_sample(
            eligible, 2, lambda p: f"route:{p.source}:{p.poi_id}:{p.name}"
        )
        query = f"chỉ đường từ {origin.name} đến {destination.name}"

        result = understand(query, self.kb)
        self.assertEqual(result.intent, "Navigation")
        parsed_origin = result.entities.get("origin", "")
        self.assertEqual(fold(parsed_origin), fold(origin.name))
        self.assertNotIn(fold(destination.name), fold(parsed_origin))

    def test_data_derived_attribute_stops_reference_landmark_span(self):
        static_terms = {
            fold(value)
            for pair in ATTRIBUTE_TERMS.items()
            for value in pair
        }
        data_attributes = sorted({
            attribute
            for poi in self.kb.pois_t2
            for attribute in poi.attributes
            if fold(attribute) not in static_terms
            and fold(attribute) in {fold(term) for term in self.kb.attribute_terms}
        }, key=fold)
        attribute = _stable_sample(
            data_attributes, 1, lambda value: f"reference-attribute:{value}"
        )[0]
        landmarks = [
            poi for poi in self.unique_pois
            if poi.category in LANDMARK_CATEGORIES and 2 <= len(poi.name.split()) <= 5
        ]
        landmark = _stable_sample(
            landmarks, 1, lambda poi: f"reference-landmark:{poi.source}:{poi.poi_id}"
        )[0]

        result = understand(
            f"Quán cà phê gần {landmark.name} có {attribute}", self.kb
        )
        parsed_reference = result.entities.get("reference_poi") \
            or result.entities.get("location", "")
        self.assertEqual(fold(parsed_reference), fold(landmark.name))
        required = _entity_attributes(result.entities, "attribute", "attributes")
        self.assertIn(fold(attribute), required)

    def test_corpus_dish_registry_supports_exact_and_composed_dishes(self):
        exact_dishes = sorted({
            canonical for canonical in self.kb.dish_terms.values()
            if len(canonical.split()) >= 2
        }, key=fold)
        exact = _stable_sample(
            exact_dishes, 1, lambda value: f"exact-dish:{value}"
        )[0]
        exact_result = understand(f"{exact} gần tôi", self.kb)
        self.assertEqual(fold(exact_result.entities.get("dish", "")), fold(exact))

        attribute_starts = {
            fold(term).split()[0] for term in self.kb.attribute_terms if fold(term)
        }
        modifiers = {
            canonical.split()[-1]
            for canonical in self.kb.dish_terms.values()
            if len(canonical.split()) >= 2
            and fold(canonical.split()[-1]) not in attribute_starts
        }
        composed = []
        for head_fold, head in self.kb.dish_heads.items():
            if len(head_fold.split()) != 1 or len(head_fold) < 3:
                continue
            for modifier in modifiers:
                phrase = f"{head} {modifier.lower()}"
                if normalize(phrase) not in self.kb.dish_terms:
                    composed.append(phrase)
        novel = _stable_sample(
            sorted(set(composed), key=fold), 1,
            lambda value: f"composed-dish:{value}",
        )[0]
        composed_result = understand(f"{novel} gần tôi", self.kb)
        self.assertEqual(
            fold(composed_result.entities.get("dish", "")), fold(novel)
        )

    def test_learned_dish_heads_require_menu_modifier_evidence(self):
        for query in ("bánh xe gần tôi", "nước rửa xe gần tôi"):
            with self.subTest(query=query):
                result = understand(query, self.kb)
                self.assertNotIn("dish", result.entities)
                self.assertNotEqual(result.entities.get("category"), "Nhà hàng")

    def test_p7_direct_names_hit_top_five_on_deterministic_sample(self):
        sample = _stable_sample(
            self.unique_t2_pois,
            12,
            lambda p: f"direct:{p.source}:{p.poi_id}:{p.name}",
        )
        self.assertEqual(len(sample), 12)

        for poi in sample:
            with self.subTest(poi_id=poi.poi_id):
                results = self.search.search(poi.name, top_k=5)["results"]
                self.assertIn(fold(poi.name), {fold(row["name"]) for row in results})

    def test_city_aliases_share_one_p6_p7_identity(self):
        # P6 must emit whichever city spelling the loaded POIs use, otherwise the
        # P7 hard location constraint compares unequal strings and drops every
        # candidate.  Every recognized alias of a corpus city must canonicalize
        # to that same identity through both the dictionary and the understander.
        corpus_cities = {canon_city(p.city) for p in self.kb.pois if p.city}
        checked = 0
        for alias, canonical in CITY_CANON.items():
            identity = canon_city(canonical)
            if identity not in corpus_cities:
                continue
            with self.subTest(alias=alias):
                self.assertEqual(
                    canon_city(alias), identity,
                    f"alias {alias!r} does not share {canonical!r} identity")
                detected = understand(f"cafe ở {alias}", self.kb).entities.get("city")
                if detected:
                    self.assertEqual(
                        canon_city(detected), identity,
                        f"understand({alias!r}) city {detected!r} != {identity!r}")
                    checked += 1
        self.assertTrue(checked, "no corpus city alias was exercised")

    def test_p7_city_abbreviation_recall_matches_full_name(self):
        # The most populous corpus city drives a deterministic sample.  A query
        # phrased with any of its abbreviations must recall results and never be
        # rejected as a location non-match — matching the full-name behaviour.
        counts = Counter(canon_city(p.city) for p in self.kb.pois if p.city)
        identity, _ = counts.most_common(1)[0]
        aliases = sorted({alias for alias, canonical in CITY_CANON.items()
                          if canon_city(canonical) == identity}, key=len)
        full = self.search.search(f"cafe ở {identity}", top_k=5)
        self.assertTrue(full["results"], f"full-name query for {identity!r} empty")
        for alias in aliases:
            with self.subTest(alias=alias):
                output = self.search.search(f"cafe ở {alias}", top_k=5)
                self.assertNotEqual(
                    output["diagnostics"].get("reason"),
                    "no_strict_location_candidates",
                    f"alias {alias!r} rejected on canonicalization mismatch")
                self.assertTrue(
                    output["results"],
                    f"alias {alias!r} recalled no results for {identity!r}")

    def test_p7_unique_addresses_hit_top_five(self):
        counts = Counter(fold(p.address) for p in self.unique_t2_pois if p.address)
        eligible = [p for p in self.unique_t2_pois
                    if p.address and counts[fold(p.address)] == 1]
        sample = _stable_sample(
            eligible, 8, lambda p: f"address:{p.poi_id}:{p.address}")
        for poi in sample:
            with self.subTest(address=poi.address):
                results = self.search.search(poi.address, top_k=5)["results"]
                self.assertIn(fold(poi.name), {fold(row["name"]) for row in results})

    def test_p7_no_match_tokens_still_reach_semantic_retrieval(self):
        token_counts = Counter(
            token for poi in self.unique_t2_pois
            for token in set(fold(poi.name).split())
            if len(token) >= 5 and token.isalpha())
        cases = []
        for poi in self.unique_t2_pois:
            for token in set(fold(poi.name).split()):
                if len(token) < 5 or not token.isalpha():
                    continue
                parsed = understand(token, self.kb)
                if (token_counts[token] == 1
                        and not self.kb.lexicon.exact(token)
                        and parsed.entities.get("ambiguity_type") == "no_match"):
                    cases.append((token, poi))
        sample = _stable_sample(
            cases, min(5, len(cases)),
            lambda case: f"token:{case[0]}:{case[1].poi_id}")
        self.assertTrue(sample)
        for token, poi in sample:
            with self.subTest(token=token):
                results = self.search.search(token, top_k=5)["results"]
                self.assertIn(fold(poi.name), {fold(row["name"]) for row in results})

    def test_p7_negation_scope_stops_at_contrastive_clause(self):
        output = self.search.search(
            "quán cà phê không có wifi nhưng yên tĩnh", top_k=5)
        required = {fold(value) for value in output["required_attributes"]}
        excluded = {fold(value) for value in output["excluded_attributes"]}
        self.assertIn("yen tinh", required)
        self.assertIn("wifi", excluded)
        self.assertNotIn("yen tinh", excluded)

    def test_p7_required_attributes_create_relaxation_evidence(self):
        attributes = sorted({
            value for poi in self.kb.pois_t2 for value in poi.attributes
            if value
        }, key=fold)
        required = _stable_sample(
            attributes, 2, lambda value: f"required-evidence:{value}")
        poi = _stable_sample(
            [p for p in self.kb.pois_t2 if p.description or p.attributes or p.tags],
            1, lambda p: f"required-poi:{p.poi_id}:{p.name}")[0]
        index = self.search._position[id(poi)]
        low_scores = np.zeros((len(required), len(self.search.pois)), dtype=np.float32)

        _, _, violations, unknowns = self.search._positive_attribute_evidence(
            index, required, low_scores)
        self.assertEqual(violations, len(required))
        self.assertEqual(unknowns, 0)

        metadata_known = self.search._attribute_known.copy()
        metadata_known[index] = False
        with patch.object(self.search, "_attribute_known", metadata_known):
            _, _, violations, unknowns = self.search._positive_attribute_evidence(
                index, required, low_scores)
        self.assertEqual(violations, 0)
        self.assertEqual(unknowns, len(required))

    def test_p7_reference_address_resolves_both_address_sources(self):
        address_rows = [
            row for row in self.kb.addresses
            if row.get("full_address") and row.get("latitude") is not None
            and row.get("longitude") is not None
        ]
        row = _stable_sample(
            address_rows, 1,
            lambda value: f"address-row:{value.get('full_address')}")[0]
        resolved = self.search._resolve_reference_address(row["full_address"])
        self.assertIsNotNone(resolved)
        self.assertLess(
            _haversine((row["latitude"], row["longitude"]), resolved), 0.05)

        row_addresses = {fold(row.get("full_address", "")) for row in address_rows}
        poi_addresses = [
            poi for poi in self.kb.pois_t2
            if poi.address and poi.lat is not None and poi.lng is not None
            and fold(poi.address) not in row_addresses
        ]
        poi = _stable_sample(
            poi_addresses, 1,
            lambda value: f"poi-address:{value.poi_id}:{value.address}")[0]
        resolved = self.search._resolve_reference_address(poi.address)
        self.assertIsNotNone(resolved)
        self.assertLess(_haversine((poi.lat, poi.lng), resolved), 0.05)

    def test_p7_short_reference_address_resolves_admin_suffix(self):
        short_points = defaultdict(list)
        for source in self.kb.pois:
            if (source.address and "," in source.address
                    and source.lat is not None and source.lng is not None):
                key = fold(source.address.split(",", 1)[0].strip())
                short_points[key].append((source.lat, source.lng))
        for row in self.kb.addresses:
            address = str(row.get("full_address") or "")
            lat, lng = row.get("latitude"), row.get("longitude")
            if address and "," in address and lat is not None and lng is not None:
                key = fold(address.split(",", 1)[0].strip())
                short_points[key].append((float(lat), float(lng)))
        cases = []
        for poi in self.kb.pois_t2:
            if not (poi.category and poi.address and "," in poi.address
                    and poi.lat is not None and poi.lng is not None):
                continue
            short = poi.address.split(",", 1)[0].strip()
            points = short_points[fold(short)]
            if any(_haversine(left, right) > 0.5
                   for index, left in enumerate(points)
                   for right in points[index + 1:]):
                continue
            query = f"{poi.category} gần {short}"
            parsed = understand(query, self.kb)
            if parsed.entities.get("reference_address"):
                cases.append((query, short, poi))
        query, short, poi = _stable_sample(
            cases, 1, lambda case: f"short-address:{case[2].poi_id}")[0]
        resolved = self.search._resolve_reference_address(short)
        self.assertIsNotNone(resolved)
        self.assertLess(_haversine((poi.lat, poi.lng), resolved), 0.05)
        output = self.search.search(query, top_k=1)
        self.assertEqual(output["diagnostics"]["location_source"],
                         "reference_address")

    def test_p7_ambiguous_short_address_does_not_create_midpoint(self):
        groups = defaultdict(list)
        for poi in self.kb.pois:
            if (poi.address and "," in poi.address
                    and poi.lat is not None and poi.lng is not None):
                short = poi.address.split(",", 1)[0].strip()
                groups[fold(short)].append((short, (poi.lat, poi.lng)))
        ambiguous = []
        for values in groups.values():
            if any(_haversine(left[1], right[1]) > 0.5
                   for index, left in enumerate(values)
                   for right in values[index + 1:]):
                ambiguous.append(values[0][0])
        if not ambiguous:
            self.skipTest("corpus has no geographically ambiguous short address")
        short = _stable_sample(
            ambiguous, 1, lambda value: f"ambiguous-address:{value}")[0]
        self.assertIsNone(self.search._resolve_reference_address(short))

    def test_p7_near_reference_address_uses_address_coordinates(self):
        cases = []
        for poi in self.kb.pois_t2:
            if not (poi.category and poi.address and poi.lat is not None
                    and poi.lng is not None):
                continue
            query = f"{poi.category} gần {poi.address}"
            parsed = understand(query, self.kb)
            if parsed.entities.get("reference_address"):
                cases.append((query, poi))
        query, poi = _stable_sample(
            cases, 1, lambda case: f"near-address:{case[1].poi_id}")[0]

        output = self.search.search(query, top_k=5)
        self.assertEqual(output["diagnostics"]["location_source"],
                         "reference_address")
        self.assertTrue(output["results"])
        top = self.kb.resolve(output["results"][0]["poi_id"],
                              output["results"][0]["name"])
        self.assertLessEqual(_haversine((poi.lat, poi.lng), (top.lat, top.lng)), 5.0)

    def test_p7_scores_do_not_depend_on_candidate_pool_size(self):
        poi = _stable_sample(
            [p for p in self.unique_t2_pois if p.attributes and p.city], 1,
            lambda p: f"pool:{p.poi_id}:{p.name}")[0]
        query = f"{poi.category} {poi.attributes[0]} {poi.city}"
        small = self.search.search(query, top_k=10, candidate_k=20)["results"]
        large = self.search.search(query, top_k=10, candidate_k=80)["results"]
        small_scores = {row["poi_id"]: row["score"] for row in small}
        large_scores = {row["poi_id"]: row["score"] for row in large}
        common = set(small_scores) & set(large_scores)
        self.assertTrue(common)
        for poi_id in common:
            self.assertAlmostEqual(small_scores[poi_id], large_scores[poi_id], places=7)

    def test_rrf_does_not_reward_zero_score_corpus_order(self):
        index = HybridIndex.__new__(HybridIndex)
        index.pois = list(range(5))
        dense = np.zeros((2, 5), dtype=np.float32)
        lexical = {
            "first": np.asarray([0, 0, 1, 0, 0], dtype=np.float32),
            "second": np.asarray([0, 0, 0, 1, 0], dtype=np.float32),
        }
        with patch.object(index, "vector_scores_many", return_value=dense), \
                patch.object(index, "lexical_scores",
                             side_effect=lambda query: lexical[query]):
            results = index.retrieve_fused(["first", "second"], top_k=5)

        self.assertEqual({row[0] for row in results[:2]}, {2, 3})
        scores = {row[0]: row[3] for row in results}
        self.assertEqual(scores[0], 0.0)

    def test_p7_structured_constraints_hold_on_deterministic_sample(self):
        surfaces = defaultdict(list)
        for surface, canonical in ATTRIBUTE_TERMS.items():
            surfaces[fold(canonical)].append(surface)

        cases = {}
        for poi in self.kb.pois_t2:
            if not poi.category or not poi.city:
                continue
            for raw_attribute in poi.attributes:
                raw_fold = fold(raw_attribute)
                matches = [
                    canonical_fold
                    for canonical_fold in surfaces
                    if canonical_fold
                    and (canonical_fold == raw_fold or canonical_fold in raw_fold)
                ]
                if not matches:
                    continue
                attribute_fold = max(matches, key=len)
                surface = min(
                    surfaces[attribute_fold], key=lambda value: (len(value), fold(value))
                )
                key = (fold(poi.category), attribute_fold, fold(poi.city))
                cases.setdefault(key, (poi.category, surface, attribute_fold, poi.city))

        sample = _stable_sample(
            list(cases.values()),
            8,
            lambda case: "|".join(case),
        )
        self.assertEqual(len(sample), 8)

        for category, surface, attribute_fold, city in sample:
            query = f"{category} {surface} {city}"
            with self.subTest(query=query):
                results = self.search.search(query, top_k=1)["results"]
                self.assertEqual(len(results), 1)
                top = results[0]
                self.assertEqual(fold(top["category"]), fold(category))
                self.assertEqual(fold(top["city"]), fold(city))
                poi = self.kb.resolve(top["poi_id"], top["name"])
                haystack = fold(
                    " ; ".join([*poi.attributes, *poi.tags, poi.description])
                )
                self.assertIn(attribute_fold, haystack)


if __name__ == "__main__":
    unittest.main()

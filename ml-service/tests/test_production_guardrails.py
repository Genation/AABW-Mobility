from __future__ import annotations

import itertools
import unittest
from collections import Counter
from datetime import datetime
from pathlib import Path
from unittest.mock import patch

import numpy as np
from fastapi.testclient import TestClient
from pydantic import ValidationError

from tascomaps.api import main, schemas
from tascomaps.core.text import fold, normalize
from tascomaps.core.understand import understand
from tascomaps.data.loader import load_kb
from tascomaps.engines.semantic_search import SemanticSearchEngine
from tascomaps.engines.trie import TrieAutocomplete


class ApiInputGuardrailTests(unittest.TestCase):
    def test_understand_rejects_blank_and_oversized_queries(self):
        for value in ("   \t\n", "x" * (schemas.MAX_QUERY_LENGTH + 1)):
            with self.subTest(length=len(value)), self.assertRaises(ValidationError):
                schemas.UnderstandRequest(query=value)

    def test_understand_trims_valid_query(self):
        request = schemas.UnderstandRequest(query="  quán cà phê  ")
        self.assertEqual(request.query, "quán cà phê")

    def test_search_rejects_blank_and_trims_valid_query(self):
        with self.assertRaises(ValidationError):
            schemas.SearchRequest(query="   ")
        request = schemas.SearchRequest(query="  nhà hàng yên tĩnh  ")
        self.assertEqual(request.query, "nhà hàng yên tĩnh")

    def test_autocomplete_http_contract_rejects_blank_and_oversized_prefixes(self):
        client = TestClient(main.app)
        for value in ("", "   ", "x" * (schemas.MAX_AUTOCOMPLETE_LENGTH + 1)):
            with self.subTest(length=len(value)):
                response = client.get("/autocomplete", params={"q": value})
                self.assertEqual(response.status_code, 422)

    def test_local_autocomplete_receives_location_context(self):
        class RecordingAutocomplete:
            def __init__(self):
                self.call = None

            def suggest(self, prefix, top_k=6, lat=None, lng=None):
                self.call = (prefix, top_k, lat, lng)
                return {
                    "prefix": prefix, "suggestion_type": None,
                    "suggestions": [], "source": "no-match",
                }

        autocomplete = RecordingAutocomplete()
        with patch.object(main, "_state", return_value={"ac": autocomplete}):
            main._hai_autocomplete(
                "quán", 4, False, lat=10.7769, lng=106.7009)
        self.assertEqual(
            autocomplete.call, ("quán", 4, 10.7769, 106.7009))

    def test_autocomplete_rejects_unpaired_location(self):
        client = TestClient(main.app)
        response = client.get("/autocomplete", params={"q": "quán", "lat": 10.7})
        self.assertEqual(response.status_code, 422)

    def test_response_schema_rejects_out_of_range_scores(self):
        with self.assertRaises(ValidationError):
            schemas.Suggestion(
                text="Quán cà phê", type="Category Suggestions",
                score=1.5, source="synthetic")

    def test_malformed_internal_autocomplete_cannot_bypass_response_contract(self):
        class MalformedAutocomplete:
            def suggest(self, *_args, **_kwargs):
                return {
                    "prefix": "q", "suggestion_type": None,
                    "suggestions": [{"text": "missing required fields"}],
                    "source": "malformed",
                }

        client = TestClient(main.app, raise_server_exceptions=False)
        with patch.object(main, "_state", return_value={
                "ac": MalformedAutocomplete(), "kb": object()}):
            response = client.get("/autocomplete/hai", params={"q": "q"})
        self.assertEqual(response.status_code, 500)

    def test_malformed_track4_payload_uses_validated_local_fallback(self):
        class ValidAutocomplete:
            def suggest(self, prefix, *_args, **_kwargs):
                return {
                    "prefix": prefix, "suggestion_type": "Category Suggestions",
                    "suggestions": [{
                        "text": "Quán cà phê", "display": "Quán cà phê",
                        "type": "Category Suggestions", "score": 0.9,
                        "source": "exact",
                    }],
                    "source": "exact", "latencyMs": 0.1,
                }

        malformed = {
            "prefix": "cafe", "suggestion_type": "Category Suggestions",
            "suggestions": [{"text": "missing required fields"}],
            "source": "track-4-service",
        }
        client = TestClient(main.app)
        with patch("tascomaps.integrations.track4.config.TRACK4_URL",
                   "http://configured"), \
                patch("tascomaps.integrations.track4.suggest",
                      return_value=malformed), \
                patch.object(main, "_state", return_value={
                    "ac": ValidAutocomplete(), "kb": object()}):
            response = client.get("/autocomplete", params={"q": "cafe"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("local-fallback", response.json()["source"])
        self.assertEqual(response.json()["suggestions"][0]["text"], "Quán cà phê")


class LocalAutocompleteGuardrailTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.autocomplete = TrieAutocomplete(load_kb())

    def test_blank_prefix_abstains(self):
        for value in ("", "   \t", "🍜"):
            with self.subTest(value=value):
                output = self.autocomplete.suggest(value)
                self.assertEqual(output["suggestions"], [])
                self.assertEqual(output["source"], "empty")

    def test_long_unsupported_prefix_abstains(self):
        output = self.autocomplete.suggest("qzxvwjkqzxvw", top_k=6)
        self.assertEqual(output["suggestions"], [])
        self.assertEqual(output["source"], "no-match")

    def test_short_unknown_prefix_keeps_popular_fallback(self):
        # Select a two-character key absent from the live corpus so this remains
        # data-derived if the workbook vocabulary changes.
        candidate = next(
            key for key in map("".join, itertools.product("qzxvwjk", repeat=2))
            if self.autocomplete._walk(key) is None
            and not self.autocomplete._fuzzy(key)
        )
        output = self.autocomplete.suggest(candidate, top_k=3)
        self.assertEqual(output["source"], "popular")
        self.assertTrue(output["suggestions"])

    def test_corpus_derived_category_attribute_city_completion(self):
        combinations = sorted({
            (poi.category, attribute, poi.city)
            for poi in load_kb().pois_t2 for attribute in poi.attributes
            if poi.category and attribute and poi.city
        }, key=lambda item: tuple(fold(value) for value in item))
        category, attribute, city = next(
            item for item in combinations
            if understand(
                f"{item[0]} {item[1]} ở {item[2]}", load_kb()
            ).entities.get("category") == item[0]
        )
        prefix = f"tìm {category} {attribute} ở {city[:-1]}"
        output = self.autocomplete.suggest(prefix, top_k=6)
        self.assertTrue(output["suggestions"])
        top = output["suggestions"][0]["text"]
        parsed = understand(top, load_kb())
        self.assertEqual(parsed.entities.get("category"), category)
        self.assertEqual(parsed.entities.get("city"), city)
        self.assertIn(fold(attribute), fold(top))

    def test_explicit_vietnamese_accents_do_not_collapse_minimal_pairs(self):
        forbidden = {
            "gà": "galaxy", "phố": "phở", "mì": "mipec", "cũ": "cửa",
        }
        for prefix, wrong in forbidden.items():
            with self.subTest(prefix=prefix):
                texts = [item["text"] for item in
                         self.autocomplete.suggest(prefix, top_k=6)["suggestions"]]
                self.assertFalse(any(normalize(wrong) in normalize(text)
                                     for text in texts))

    def test_live_dish_registry_completes_unseen_multiword_dishes(self):
        dishes = sorted({value for value in load_kb().dish_terms.values()
                         if len(value.split()) >= 2}, key=fold)
        self.assertTrue(dishes)
        dish = dishes[len(dishes) // 2]
        prefix = dish[:-1]
        texts = [item["text"] for item in
                 self.autocomplete.suggest(prefix, top_k=6)["suggestions"]]
        self.assertTrue(any(fold(dish) in fold(text) for text in texts))


class VietnameseColloquialGuardrailTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.kb = load_kb()

    def test_colloquial_local_pronouns_map_to_current_location(self):
        for query in ("quán cà phê gần tui", "có cây atm nào gần tui hông"):
            with self.subTest(query=query):
                output = understand(query, self.kb)
                self.assertEqual(output.intent, "Nearby Search")
                self.assertEqual(output.entities.get("location"), "current_location")
                self.assertNotIn("reference_poi", output.entities)

    def test_generic_reference_nouns_become_relational_preferences(self):
        cases = (
            ("cafe gần sông hàn để làm việc", "gần sông"),
            ("khách sạn có phòng họp gần khu văn phòng", "gần văn phòng"),
            ("địa điểm miễn phí gần hồ xuân hương", "gần hồ"),
        )
        for query, expected in cases:
            with self.subTest(query=query):
                output = understand(query, self.kb)
                values = output.entities.get("attributes") or [
                    output.entities.get("attribute")]
                self.assertTrue(any(fold(value) == fold(expected)
                                    for value in values if value))
                self.assertNotIn("reference_poi", output.entities)
                self.assertNotIn("reference_area", output.entities)

    def test_address_words_do_not_become_venue_attributes(self):
        output = understand(
            "Khách sạn gần 119 Đường Trung Tâm, Đống Đa", self.kb)
        self.assertIn("reference_address", output.entities)
        values = output.entities.get("attributes") or [
            output.entities.get("attribute")]
        self.assertFalse(any(fold(value) == "trung tam"
                             for value in values if value))

    def test_bare_motion_preposition_is_navigation(self):
        output = understand("tới chợ bến thành", self.kb)
        self.assertEqual(output.intent, "Navigation")
        self.assertEqual(output.entities.get("action"), "directions")


class SemanticSearchProductionGuardrailTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.kb = load_kb()
        cls.search = SemanticSearchEngine(cls.kb)

    def test_current_location_query_requires_coordinates(self):
        output = self.search.search("quán ăn gần đây", top_k=5)
        self.assertEqual(output["results"], [])
        self.assertEqual(output["diagnostics"]["status"], "needs_location")

    def test_unresolved_reference_returns_explicit_no_matches(self):
        query = "ATM gần qzxvwjkqzxvw"
        parsed = understand(query, self.kb)
        self.assertTrue(parsed.entities.get("reference_poi"))
        output = self.search.search(query, top_k=5)
        self.assertEqual(output["results"], [])
        self.assertEqual(output["diagnostics"]["status"], "no_matches")
        self.assertEqual(output["diagnostics"]["reason"], "unresolved_location")

    def test_unresolved_precise_address_does_not_relax_to_district(self):
        case = None
        for row in self.kb.addresses:
            street = str(row.get("street") or "").strip()
            district = str(row.get("district") or "").strip()
            city = str(row.get("city") or "").strip()
            if not (street and district and city):
                continue
            query = f"ATM gần 99999 {street}, {district}, {city}"
            if understand(query, self.kb).entities.get("reference_address"):
                case = query
                break
        self.assertIsNotNone(case)
        output = self.search.search(case, top_k=5)
        self.assertEqual(output["results"], [])
        self.assertEqual(output["diagnostics"]["status"], "no_matches")
        self.assertEqual(output["diagnostics"]["reason"], "unresolved_location")

    def test_city_constraint_never_returns_another_city(self):
        city_counts = Counter(fold(poi.city) for poi in self.kb.pois_t2 if poi.city)
        city_fold, _ = city_counts.most_common(1)[0]
        city = next(value for value in self.kb.cities.values()
                    if fold(value) == city_fold)
        output = self.search.search(f"Nhà hàng tại {city}", top_k=10)
        self.assertTrue(output["results"])
        self.assertTrue(all(
            fold(result["city"]) == city_fold for result in output["results"]))

    def test_city_absent_from_search_corpus_returns_no_matches(self):
        available = {fold(poi.city) for poi in self.kb.pois_t2 if poi.city}
        absent = sorted({value for value in self.kb.cities.values()
                         if fold(value) not in available}, key=fold)
        if not absent:
            self.skipTest("all configured cities have semantic-search POIs")
        city = next((value for value in absent
                     if understand(f"Nhà hàng tại {value}", self.kb).entities.get("city")),
                    None)
        if city is None:
            self.skipTest("no absent city is recognized by the current corpus")
        output = self.search.search(f"Nhà hàng tại {city}", top_k=5)
        self.assertEqual(output["results"], [])
        self.assertEqual(output["diagnostics"]["status"], "no_matches")

    def test_same_name_branches_keep_unique_display_identity(self):
        duplicate_names = {
            name for name, count in Counter(
                fold(poi.name) for poi in self.kb.pois_t2 if poi.name
            ).items() if count > 1
        }
        if not duplicate_names:
            self.skipTest("semantic corpus has no duplicate display names")
        duplicate = sorted(duplicate_names)[0]
        display = next(poi.name for poi in self.kb.pois_t2
                       if fold(poi.name) == duplicate)
        output = self.search.search(
            display, top_k=20, candidate_k=len(self.kb.pois_t2))
        branches = [result for result in output["results"]
                    if fold(result["name"]) == duplicate]
        self.assertGreaterEqual(len(branches), 2)
        labels = [fold(result["display_name"]) for result in branches]
        self.assertEqual(len(labels), len(set(labels)))
        self.assertTrue(all(result.get("address") for result in branches))

    def test_exact_poi_does_not_erase_explicit_exclusion(self):
        counts = Counter(fold(poi.name) for poi in self.kb.pois_t2 if poi.name)
        case = None
        for poi in self.kb.pois_t2:
            if counts[fold(poi.name)] != 1:
                continue
            for attribute in poi.attributes:
                query = f"{poi.name} không có {attribute}"
                parsed = understand(query, self.kb)
                excluded = parsed.entities.get("excluded_attributes") or []
                if parsed.entities.get("poi_name") == poi.name \
                        and any(fold(value) == fold(attribute)
                                for value in excluded):
                    case = (poi, query)
                    break
            if case:
                break
        self.assertIsNotNone(case)
        poi, query = case
        output = self.search.search(
            query, top_k=1, candidate_k=len(self.kb.pois_t2))
        self.assertEqual(fold(output["results"][0]["name"]), fold(poi.name))
        self.assertEqual(output["diagnostics"]["status"], "constraints_relaxed")
        self.assertEqual(output["diagnostics"]["strict_candidate_count"], 0)

    def test_exact_poi_does_not_erase_explicit_open_now_violation(self):
        query = "The Workshop Coffee đang mở cửa"
        parsed = understand(query, self.kb)
        if parsed.entities.get("poi_name") != "The Workshop Coffee":
            self.skipTest("reference POI is absent from this corpus")
        output = self.search.search(
            query, top_k=1,
            as_of=datetime.fromisoformat("2026-07-11T03:00:00+07:00"))
        self.assertEqual(output["results"][0]["name"], "The Workshop Coffee")
        self.assertEqual(output["results"][0]["signals"]["hours"], 0.0)
        self.assertEqual(output["diagnostics"]["status"], "constraints_relaxed")
        self.assertEqual(output["diagnostics"]["strict_candidate_count"], 0)

    def test_unknown_attribute_evidence_is_not_reported_as_strict(self):
        category = next(poi.category for poi in self.kb.pois_t2
                        if poi.category and poi.attributes)
        attribute = next(attribute for poi in self.kb.pois_t2
                         if poi.category == category for attribute in poi.attributes)
        query = f"{category} có {attribute}"
        with patch.object(
                self.search, "_attribute_known",
                np.zeros(len(self.search.pois), dtype=bool)):
            output = self.search.search(query, top_k=5)
        self.assertEqual(output["diagnostics"]["status"], "constraints_relaxed")
        self.assertEqual(output["diagnostics"]["strict_candidate_count"], 0)
        self.assertGreater(output["diagnostics"]["unknown_candidate_count"], 0)
        self.assertTrue(all(
            not any(reason.startswith("phù hợp:") for reason in result["reasons"])
            for result in output["results"]))


class BrowserExperienceGuardrailTests(unittest.TestCase):
    def test_each_async_view_cancels_and_sequences_its_requests(self):
        web = Path(__file__).resolve().parents[1] / "tascomaps" / "web"
        expected_guards = {
            "index.html": ("acController", "acSequence",
                           "analysisController", "analysisSequence"),
            "autocomplete.html": ("controller", "sequence"),
            "search.html": ("searchController", "searchSequence"),
            "understand.html": ("understandController", "understandSequence"),
            "lab.html": ("p9Controller", "p9Sequence", "p6Controller",
                         "p6Sequence", "p7Controller", "p7Sequence"),
        }
        for name, guards in expected_guards.items():
            source = (web / name).read_text()
            with self.subTest(name=name):
                self.assertIn("AbortController", source)
                for guard in guards:
                    self.assertIn(guard, source)

    def test_integrated_autocomplete_escapes_quoted_attribute_values(self):
        source = (Path(__file__).resolve().parents[1] / "tascomaps" / "web" /
                  "index.html").read_text()
        self.assertIn("&quot;", source)
        self.assertIn("&#39;", source)
        self.assertIn("/[&<>\"']/g", source)

    def test_rank_score_is_labelled_as_utility_not_probability(self):
        web = Path(__file__).resolve().parents[1] / "tascomaps" / "web"
        for name in ("index.html", "search.html", "lab.html"):
            source = (web / name).read_text()
            with self.subTest(name=name):
                self.assertIn("utility", source)

    def test_rank_views_use_disambiguated_branch_labels(self):
        web = Path(__file__).resolve().parents[1] / "tascomaps" / "web"
        for name in ("index.html", "search.html", "lab.html"):
            source = (web / name).read_text()
            with self.subTest(name=name):
                self.assertIn("display_name", source)


if __name__ == "__main__":
    unittest.main()

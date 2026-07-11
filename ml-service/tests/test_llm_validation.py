from __future__ import annotations

import unittest
from unittest.mock import patch

from tascomaps.data.loader import load_kb
from tascomaps.llm.boost import (
    _validated_llm_result,
    boost_understanding,
    smart_suggestions,
)


class LLMValidationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.kb = load_kb()

    def test_invalid_structured_payloads_are_rejected(self):
        base = {
            "normalized_query": "Quán cà phê",
            "intent": "Category Search",
            "entities": {"category": "Quán cà phê"},
            "confidence": 0.8,
        }
        invalid = [
            {**base, "confidence": 17},
            {**base, "entities": {"latitude": 999, "longitude": 106.7}},
            {**base, "entities": {"unknown": "value"}},
            {**base, "entities": {"category": "   "}},
            {**base, "entities": {"open_after": "29:99"}},
        ]
        for payload in invalid:
            with self.subTest(payload=payload):
                self.assertIsNone(_validated_llm_result(payload, self.kb))

    def test_ungrounded_poi_cannot_replace_deterministic_result(self):
        payload = {
            "normalized_query": "Địa Điểm Không Hề Tồn Tại XYZ",
            "intent": "POI Search",
            "entities": {"poi_name": "Địa Điểm Không Hề Tồn Tại XYZ"},
            "confidence": 0.99,
        }
        with patch("tascomaps.llm.boost.client.is_available", return_value=True), \
                patch("tascomaps.llm.boost.client.chat_json", return_value=payload):
            result = boost_understanding("cafe gần tôi", self.kb)
        self.assertEqual(result.source, "deterministic")
        self.assertNotEqual(result.entities.get("poi_name"), payload["entities"]["poi_name"])

    def test_model_only_constraints_cannot_filter_results(self):
        invented = {
            "normalized_query": "Quán cà phê 24/7 sau 23:59",
            "intent": "Category Search",
            "entities": {
                "category": "Quán cà phê", "open_after": "23:59",
                "open_24h": True, "price_max": 50000, "rating_min": 4.8,
            },
            "confidence": 0.99,
        }
        with patch("tascomaps.llm.boost.client.is_available", return_value=True), \
                patch("tascomaps.llm.boost.client.chat_json", return_value=invented):
            result = boost_understanding("coffee", self.kb)
        self.assertEqual(result.source, "deterministic")
        for key in ("open_after", "open_24h", "price_max", "rating_min"):
            self.assertNotIn(key, result.entities)

    def test_existing_slot_does_not_authorize_changed_value(self):
        changed = {
            "normalized_query": "Khách sạn mở 24/7 sau 23:59",
            "intent": "Category Search",
            "entities": {
                "category": "Khách sạn", "open_after": "23:59", "open_24h": True,
            },
            "confidence": 0.99,
        }
        with patch("tascomaps.llm.boost.client.is_available", return_value=True), \
                patch("tascomaps.llm.boost.client.chat_json", return_value=changed):
            result = boost_understanding("quán cà phê mở khuya", self.kb)
        self.assertEqual(result.source, "deterministic")
        self.assertNotEqual(result.entities.get("category"), "Khách sạn")

    def test_omitted_model_slots_do_not_erase_deterministic_constraints(self):
        payload = {
            "normalized_query": "Quán cà phê gần tôi dưới 50.000đ",
            "intent": "Nearby Search", "entities": {}, "confidence": 0.9,
        }
        query = "quán cà phê gần tôi dưới 50k"
        with patch("tascomaps.llm.boost.client.is_available", return_value=True), \
                patch("tascomaps.llm.boost.client.chat_json", return_value=payload):
            result = boost_understanding(query, self.kb)
        self.assertEqual(result.entities.get("location"), "current_location")
        self.assertEqual(result.entities.get("price_max"), 50000)

    def test_normalized_text_cannot_change_numeric_constraint(self):
        payload = {
            "normalized_query": "Quán cà phê dưới 5.000.000đ",
            "intent": "Category Search", "entities": {}, "confidence": 0.99,
        }
        with patch("tascomaps.llm.boost.client.is_available", return_value=True), \
                patch("tascomaps.llm.boost.client.chat_json", return_value=payload):
            result = boost_understanding("quán cà phê dưới 50k", self.kb)
        self.assertEqual(result.source, "deterministic")
        self.assertEqual(result.entities.get("price_max"), 50000)

    def test_open_vocabulary_grounding_requires_phrase_boundaries(self):
        payload = {
            "normalized_query": "Quán cà phê",
            "intent": "Category Search",
            "entities": {"brand": "an"},
            "confidence": 0.99,
        }
        with patch("tascomaps.llm.boost.client.is_available", return_value=True), \
                patch("tascomaps.llm.boost.client.chat_json", return_value=payload):
            result = boost_understanding("quán cà phê", self.kb)
        self.assertEqual(result.source, "deterministic")
        self.assertNotIn("brand", result.entities)

    def test_malformed_suggestions_fall_back_without_throwing(self):
        deterministic = {
            "prefix": "ca", "suggestion_type": None, "suggestions": [],
        }
        payload = {"suggestions": [None, 3, {"text": "   "}]}
        with patch("tascomaps.llm.boost.client.is_available", return_value=True), \
                patch("tascomaps.llm.boost.client.chat_json", return_value=payload):
            result = smart_suggestions("ca", deterministic, self.kb)
        self.assertIs(result, deterministic)


if __name__ == "__main__":
    unittest.main()

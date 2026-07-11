from __future__ import annotations

import unittest

from tascomaps.core.text import fold
from tascomaps.core.understand import understand
from tascomaps.data.loader import load_kb


def _attributes(entities: dict) -> set[str]:
    values = []
    if entities.get("attribute"):
        values.append(entities["attribute"])
    values.extend(entities.get("attributes", []) or [])
    return {fold(value) for value in values}


class P6PolaritySpanTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.kb = load_kb()

    def test_negated_dish_is_not_emitted_as_positive(self):
        positive = understand("quán ăn có thịt", self.kb)
        negative = understand("quán ăn không thịt", self.kb)

        self.assertEqual(positive.entities.get("dish"), "Thịt")
        self.assertNotIn("dish", negative.entities)

    def test_negated_nearby_reference_is_not_emitted_as_positive(self):
        positive = understand("khách sạn gần sân bay", self.kb)
        negative = understand("khách sạn không gần sân bay", self.kb)

        self.assertEqual(
            positive.entities.get("reference_poi"),
            "Sân bay Tân Sơn Nhất",
        )
        self.assertFalse(any(
            key in negative.entities
            for key in ("reference_poi", "reference_area", "reference_address")
        ))

    def test_known_negated_attribute_remains_an_exclusion(self):
        positive = understand("cafe có wifi", self.kb)
        negative = understand("cafe không có wifi", self.kb)

        self.assertIn("wifi", _attributes(positive.entities))
        self.assertNotIn("wifi", _attributes(negative.entities))
        self.assertIn(
            "wifi",
            {fold(value) for value in negative.entities.get(
                "excluded_attributes", [])},
        )

    def test_unknown_negated_complement_stays_internal_negative_evidence(self):
        positive = understand("cafe có nhạc", self.kb)
        negative = understand("cafe không có nhạc", self.kb)

        self.assertNotIn("nhac", _attributes(positive.entities))
        self.assertNotIn("nhac", _attributes(negative.entities))
        self.assertTrue(any(
            mention["polarity"] == "negative"
            and "nhac" in fold(mention["canonical"])
            for mention in negative.debug.get("semantic_mentions", [])
        ))

    def test_negation_scope_stops_at_contrastive_clause(self):
        result = understand(
            "quán ăn không thịt nhưng gần sân bay", self.kb)

        self.assertNotIn("dish", result.entities)
        self.assertEqual(
            result.entities.get("reference_poi"),
            "Sân bay Tân Sơn Nhất",
        )

    def test_positive_conjunction_reopens_scope(self):
        cases = (
            ("cafe không có wifi và có bãi đỗ xe", "bai do xe"),
            ("cafe no wifi and has parking", "bai do xe"),
        )

        for query, required in cases:
            with self.subTest(query=query):
                result = understand(query, self.kb)
                self.assertIn(required, _attributes(result.entities))
                self.assertNotIn(
                    required,
                    {fold(value) for value in result.entities.get(
                        "excluded_attributes", [])},
                )

    def test_positive_relation_conjunction_reopens_scope(self):
        result = understand(
            "quán ăn không thịt và gần sân bay", self.kb)

        self.assertNotIn("dish", result.entities)
        self.assertEqual(
            result.entities.get("reference_poi"),
            "Sân bay Tân Sơn Nhất",
        )

    def test_negative_and_positive_nearby_clauses_stay_separate(self):
        result = understand(
            "khách sạn không gần sân bay và gần trung tâm", self.kb)

        self.assertNotIn("reference_poi", result.entities)
        self.assertIn("gan trung tam", _attributes(result.entities))
        self.assertNotIn(
            "gan trung tam",
            {fold(value) for value in result.entities.get(
                "excluded_attributes", [])},
        )

    def test_english_positive_relation_conjunction_reopens_scope(self):
        result = understand(
            "hotel without wifi and near airport", self.kb)

        self.assertIn(
            "wifi",
            {fold(value) for value in result.entities.get(
                "excluded_attributes", [])},
        )
        self.assertEqual(
            result.entities.get("reference_poi")
            or result.entities.get("location"),
            "Sân bay Tân Sơn Nhất",
        )

    def test_punctuation_reopens_scope_before_nearby_reference(self):
        result = understand("quán ăn không thịt, gần sân bay", self.kb)

        self.assertNotIn("dish", result.entities)
        self.assertEqual(
            result.entities.get("reference_poi"),
            "Sân bay Tân Sơn Nhất",
        )

    def test_negated_brand_span_is_not_selected(self):
        result = understand("nhà hàng không phải Pizza 4P's", self.kb)

        self.assertNotIn("brand", result.entities)

    def test_negated_district_span_is_not_selected(self):
        result = understand("khách sạn tránh quận 1", self.kb)

        self.assertNotIn("district", result.entities)

    def test_negated_city_span_is_not_selected(self):
        result = understand("khách sạn không ở Hà Nội", self.kb)

        self.assertNotIn("city", result.entities)

    def test_negated_street_span_is_not_selected(self):
        result = understand("khách sạn không ở đường Lê Lợi", self.kb)

        self.assertNotIn("street", result.entities)

    def test_negated_poi_span_is_not_selected(self):
        result = understand("không phải Sân bay Tân Sơn Nhất", self.kb)

        self.assertNotIn("poi_name", result.entities)

    def test_negated_category_span_is_not_selected(self):
        result = understand("không phải nhà hàng", self.kb)

        self.assertNotIn("category", result.entities)

    def test_negated_category_abbreviation_is_not_selected(self):
        result = understand("tránh ATM", self.kb)

        self.assertNotIn("category", result.entities)

    def test_unknown_residue_survives_known_negative_attribute(self):
        result = understand("cafe không wifi nhạc", self.kb)

        self.assertIn(
            "wifi",
            {fold(value) for value in result.entities.get(
                "excluded_attributes", [])},
        )
        self.assertTrue(any(
            mention["slot"] == "unknown"
            and "nhac" in fold(mention["canonical"])
            for mention in result.debug.get("semantic_mentions", [])
        ))

    def test_modeled_price_is_not_unknown_negative_evidence(self):
        result = understand("cafe không quá 100k", self.kb)

        self.assertEqual(result.entities.get("price_max"), 100_000)
        self.assertFalse(any(
            mention["slot"] == "unknown"
            for mention in result.debug.get("semantic_mentions", [])
        ))

    def test_khong_phai_does_not_ground_gia_vua_phai(self):
        result = understand("nhà hàng không phải đồ Tàu", self.kb)

        all_attributes = _attributes(result.entities)
        all_attributes.update(
            fold(value)
            for value in result.entities.get("excluded_attributes", [])
        )
        self.assertNotIn("gia vua phai", all_attributes)


if __name__ == "__main__":
    unittest.main()

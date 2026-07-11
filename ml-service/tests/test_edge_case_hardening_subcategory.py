from __future__ import annotations

import unittest

from tascomaps.core.understand import understand
from tascomaps.data.loader import load_kb


class SubcategoryEdgeCaseHardeningTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.kb = load_kb()

    def test_known_cafe_subcategories_preserve_canonical_identity(self):
        cases = [
            ("book cafe", "Book Cafe"),
            ("garden cafe", "Garden Cafe"),
            ("specialty coffee", "Specialty Coffee"),
        ]

        for query, expected in cases:
            with self.subTest(query=query):
                output = understand(query, self.kb)
                self.assertEqual(output.entities.get("category"), "Quán cà phê")
                self.assertEqual(output.entities.get("sub_category"), expected)
                self.assertIn(expected, output.normalized_query)

    def test_unknown_modifier_does_not_fabricate_subcategory(self):
        output = understand("quantum cafe", self.kb)

        self.assertNotIn("sub_category", output.entities)

    def test_negated_subcategory_does_not_leak_through_positive_parent(self):
        queries = [
            "cafe không phải Garden Cafe",
            "cafe không phải loại Garden Cafe",
            "cafe không phải kiểu Garden Cafe",
            "cafe tránh các Garden Cafe",
            "cafe không có phong cách Garden Cafe",
        ]

        for query in queries:
            with self.subTest(query=query):
                output = understand(query, self.kb)
                self.assertEqual(output.entities.get("category"), "Quán cà phê")
                self.assertNotIn("sub_category", output.entities)

    def test_punctuation_ends_subcategory_negation_scope(self):
        output = understand("cafe không wifi, Garden Cafe", self.kb)

        self.assertEqual(output.entities.get("sub_category"), "Garden Cafe")


if __name__ == "__main__":
    unittest.main()

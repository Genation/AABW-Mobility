from __future__ import annotations

import unittest
import re

from tascomaps.core.text import fold, normalize
from tascomaps.data.loader import load_kb
from tascomaps.engines.semantic_search import SemanticSearchEngine


class P7EdgeCaseHardeningTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.search = SemanticSearchEngine(load_kb())

    def test_explicit_dish_never_relaxes_to_another_dish(self):
        output = self.search.search("best pho hn", top_k=5)

        self.assertTrue(output["results"])
        self.assertTrue(all(
            re.search(r"(?<!\w)phở(?!\w)", normalize(row["name"]))
            for row in output["results"]
        ))
        self.assertTrue(all(
            fold(row.get("city", "")) == fold("Hà Nội")
            for row in output["results"]
        ))

    def test_empty_explicit_specialization_reports_no_matches(self):
        output = self.search.search("best sushi cá voi hn", top_k=5)

        self.assertEqual(output["results"], [])
        self.assertEqual(output["diagnostics"]["status"], "no_matches")
        self.assertEqual(
            output["diagnostics"]["reason"],
            "no_strict_specialization_candidates",
        )

    def test_generic_category_results_diversify_repeated_names(self):
        output = self.search.search("atm 24/7", top_k=8)
        names = [fold(row["name"]) for row in output["results"]]

        self.assertTrue(names)
        self.assertEqual(len(names), len(set(names)))

    def test_explicit_subcategory_requires_canonical_evidence(self):
        cases = [
            ("book cafe", "Book Cafe"),
            ("garden cafe", "Garden Cafe"),
            ("specialty coffee", "Specialty Coffee"),
        ]

        for query, expected_subcategory in cases:
            with self.subTest(query=query):
                output = self.search.search(query, top_k=5)
                self.assertTrue(output["results"])
                for row in output["results"]:
                    poi = next(
                        poi for poi in self.search.catalog_pois
                        if poi.poi_id == row["poi_id"]
                        and poi.source == row["source"]
                    )
                    self.assertEqual(
                        normalize(poi.sub_category),
                        normalize(expected_subcategory),
                    )

    def test_explicit_brand_search_keeps_same_name_physical_branches(self):
        output = self.search.search("ACB", top_k=12)
        repeated = [
            row for row in output["results"]
            if fold(row["name"]) == fold("ACB Phường 1")
        ]

        self.assertGreaterEqual(len(repeated), 2)


if __name__ == "__main__":
    unittest.main()

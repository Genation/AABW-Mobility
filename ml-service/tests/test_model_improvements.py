from __future__ import annotations

import unittest

from tascomaps.core.understand import understand
from tascomaps.data.loader import load_kb
from tascomaps.engines.semantic_search import SemanticSearchEngine
from tascomaps.engines.trie import TrieAutocomplete


class ModelImprovementTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.kb = load_kb()
        cls.search = SemanticSearchEngine(cls.kb)
        cls.autocomplete = TrieAutocomplete(cls.kb)

    def test_accented_pho_is_not_pho_dish(self):
        result = understand("điểm ngắm thành phố về đêm", self.kb)
        self.assertNotIn("dish", result.entities)

    def test_accented_ga_is_not_station_abbreviation(self):
        result = understand("tôi muốn ăn phở gà", self.kb)
        self.assertEqual(result.entities.get("dish"), "Phở gà")
        self.assertNotEqual(result.entities.get("category"), "Ga")

    def test_administrative_area_wins_over_street_alias(self):
        result = understand("cafe có phòng họp tại cầu giấy", self.kb)
        self.assertEqual(result.entities.get("district"), "Cầu Giấy")
        self.assertNotIn("street", result.entities)

    def test_overnight_hours_promote_valid_results(self):
        overnight = self.kb.resolve("R008", "Rooftop Sky Garden")
        closed = self.kb.resolve("R004", "Phở Thìn Lò Đúc")
        constraint = {"open_after": "23:00"}
        overnight_score = self.search._hours_score(overnight, constraint)
        closed_score = self.search._hours_score(closed, constraint)
        self.assertEqual(overnight_score[0], 1.0)
        self.assertEqual(closed_score[0], 0.0)

    def test_autocomplete_canonicalizes_cross_track_ids(self):
        result = self.autocomplete.suggest("san bay n", top_k=6)
        texts = [row["text"] for row in result["suggestions"]]
        self.assertIn("Sân bay Nội Bài", texts)
        self.assertNotIn("Vincom Center Đồng Khởi", texts)

    def test_autocomplete_supports_acronyms(self):
        result = self.autocomplete.suggest("dh bk", top_k=6)
        texts = [row["text"] for row in result["suggestions"]]
        self.assertIn("Đại học Bách Khoa", texts)


if __name__ == "__main__":
    unittest.main()

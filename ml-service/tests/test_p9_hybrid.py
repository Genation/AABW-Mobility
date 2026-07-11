from __future__ import annotations

import ast
import copy
import math
import unicodedata
import unittest
from pathlib import Path
from time import perf_counter

from tascomaps.core.text import fold
from tascomaps.data.loader import load_eval, load_kb
from tascomaps.engines.trie import TrieAutocomplete


class P9HybridGeneralizationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.kb = load_kb()
        cls.autocomplete = TrieAutocomplete(cls.kb)

    @staticmethod
    def _texts(output):
        return [row["text"] for row in output["suggestions"]]

    def test_observed_input_prefix_is_a_data_driven_lookup_key(self):
        prefix = "bí danh zxq"
        first_display = "Địa điểm Thử Nghiệm Xa Lạ"
        second_display = "Địa điểm Thay Thế Hoàn Toàn"

        def build(display):
            kb = copy.deepcopy(self.kb)
            kb.autocomplete_pairs.append({
                "input_prefix": prefix,
                "suggestion_text": display,
                "suggestion_type": "POI Search",
                "score": 0.97,
                "query_frequency": 100,
            })
            return TrieAutocomplete(kb)

        first = build(first_display)
        for typed in ("bí d", "bi danh", prefix):
            with self.subTest(typed=typed):
                self.assertIn(first_display, self._texts(first.suggest(typed)))

        second = build(second_display)
        second_texts = self._texts(second.suggest("bi danh"))
        self.assertIn(second_display, second_texts)
        self.assertNotIn(first_display, second_texts)

    def test_exact_and_semantic_candidates_are_fused(self):
        output = self.autocomplete.suggest("siêu thị", top_k=10)
        self.assertEqual(output["source"], "hybrid")
        sources = {row["source"] for row in output["suggestions"]}
        self.assertIn("exact", sources)
        self.assertIn("semantic", sources)
        self.assertTrue(any("Co.opmart" in row["text"]
                            or "Lotte Mart" in row["text"]
                            for row in output["suggestions"]))

    def test_fusion_deduplicates_support_and_keeps_safe_scores(self):
        rows = [
            ("exact", [("Địa điểm tổng hợp", "POI Suggestions", 0.80)]),
            ("semantic", [
                ("Địa điểm tổng hợp", "POI Suggestions", 0.99),
                ("Địa điểm khác", "POI Suggestions", 0.90),
            ]),
        ]
        output = self.autocomplete._fuse_candidate_pools(
            "địa điểm", rows, 6, perf_counter())
        texts = self._texts(output)
        self.assertEqual(texts.count("Địa điểm tổng hợp"), 1)
        merged = next(row for row in output["suggestions"]
                      if row["text"] == "Địa điểm tổng hợp")
        self.assertEqual(merged["source"], "hybrid")
        scores = [row["score"] for row in output["suggestions"]]
        self.assertTrue(all(math.isfinite(score) and 0 <= score <= 1
                            for score in scores))
        self.assertEqual(scores, sorted(scores, reverse=True))

    def test_adjacent_transposition_uses_fuzzy_recovery(self):
        texts = self._texts(self.autocomplete.suggest("nguyne hue"))
        self.assertIn("Nguyễn Huệ, Quận 1, TP.HCM", texts)

    def test_nfc_and_nfd_have_identical_order(self):
        prefix = "siêu th"
        nfc = self._texts(self.autocomplete.suggest(prefix))
        nfd = self._texts(self.autocomplete.suggest(
            unicodedata.normalize("NFD", prefix)))
        self.assertEqual(nfc, nfd)

    def test_resolved_reference_is_verbalized_once(self):
        texts = self._texts(self.autocomplete.suggest("cafe gần hồ gươm"))
        self.assertTrue(texts)
        self.assertIn("Hồ Hoàn Kiếm", texts[0])
        self.assertNotIn(fold("gần hồ gần"), fold(texts[0]))

    def test_runtime_has_no_literal_public_answer_mapping(self):
        source = (Path(__file__).resolve().parents[1] / "tascomaps" /
                  "engines" / "trie.py").read_text()
        constants = {
            fold(node.value) for node in ast.walk(ast.parse(source))
            if isinstance(node, ast.Constant) and isinstance(node.value, str)
        }
        expected = {
            fold(value.strip())
            for row in load_eval("T4")
            for value in str(row["expected_top_suggestions"]).split(";")
            if value.strip()
        }
        self.assertFalse(constants & expected)


if __name__ == "__main__":
    unittest.main()

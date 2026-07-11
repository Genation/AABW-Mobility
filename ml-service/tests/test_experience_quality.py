from __future__ import annotations

import copy
import json
import unittest
from collections import defaultdict
from pathlib import Path

from scripts.experience_quality import (SemanticJudge, _check,
                                        _regression_sample)
from tascomaps.core.text import fold
from tascomaps.data.loader import load_kb


class IndependentExperienceQualityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.kb = load_kb()
        cls.judge = SemanticJudge(cls.kb)

    def test_evaluator_never_loads_public_evaluation_rows(self):
        source = (Path(__file__).resolve().parents[1] / "scripts" /
                  "experience_quality.py").read_text()
        self.assertNotIn("load" + "_eval", source)

    def test_accent_distinct_inputs_have_distinct_cache_entries(self):
        street = self.judge.evidence("phố")
        dish = self.judge.evidence("phở")
        self.assertIsNot(street, dish)
        self.assertNotEqual(street["slots"]["dish"], dish["slots"]["dish"])

    def test_every_expected_value_contributes_to_slot_fidelity(self):
        expected = {"attributes": {"wifi", "yên tĩnh"}}
        evidence = {"slots": defaultdict(set, {"attributes": {"wifi"}})}
        self.assertFalse(self.judge._set_satisfies(
            evidence["slots"]["attributes"], expected["attributes"]))
        self.assertEqual(self.judge.slot_fraction(expected, evidence), 0.5)

    def test_wrong_poi_branch_is_not_a_strong_completion(self):
        groups = defaultdict(list)
        for poi in self.kb.pois_t2:
            if poi.brand:
                groups[fold(poi.brand)].append(poi)
        branches = next(values for values in groups.values()
                        if len({fold(poi.name) for poi in values}) >= 2)
        target, alternative = branches[0], next(
            poi for poi in branches[1:] if fold(poi.name) != fold(branches[0].name))
        case = {
            "target": target.name,
            "target_poi_id": f"{target.source}:{target.poi_id}",
            "prefix": target.brand,
            "expected": defaultdict(set),
            "visible_expected": defaultdict(set),
        }
        self.assertLessEqual(self.judge.gain(case, alternative.name), 1)

    def test_vietnamese_metrics_are_acceptance_gates(self):
        # A minimal structurally valid result is enough to prove that a zeroed
        # Vietnamese score cannot silently pass the acceptance checker.
        result = {
            "suggestion_relevance": {
                "cases": 12, "semantic_success@6": 1.0,
                "grounded_suggestion_rate": 1.0, "top1_slot_retention": 1.0,
            },
            "intent_prediction": {
                "cases": 8, "families": 5, "strict_accuracy": 1.0,
                "macro_f1": 1.0, "typed_slot_fidelity": 1.0,
            },
            "query_completion": {
                "list_coverage": 1.0, "semantic_success_auc": 1.0,
                "unique_list_rate": 1.0, "finite_bounded_score_rate": 1.0,
                "monotonic_score_rate": 1.0,
            },
            "vietnamese_handling": {
                name: {"cases": 1, "semantic_retention": 0.0,
                       "search_rank_retention": 0.0}
                for name in ("accentless", "unicode_nfd", "format_noise",
                             "single_edit")
            },
            "production_readiness": {
                "deterministic_search_rate": 1.0, "bounded_score_rate": 1.0,
                "unique_result_list_rate": 1.0, "explained_result_rate": 1.0,
                "autocomplete_blank_ood_abstention": 1.0,
                "search_blank_ood_abstention": 1.0,
                "concurrency": {"error_rate": 0.0},
                "p6_latency": {"n": 1}, "p7_latency": {"n": 1},
                "autocomplete_latency": {"n": 1},
            },
        }
        result["vietnamese_handling"]["colloquial"] = {
            "cases": 1, "semantic_fidelity": 0.0}
        failures = _check(copy.deepcopy(result), None, 0.01)
        self.assertTrue(any("vietnamese_handling" in failure
                            for failure in failures))

    def test_regression_sample_is_deterministic(self):
        values = list(range(100))
        key = lambda value: f"case:{value}"
        left = _regression_sample(values, 100, key)
        right = _regression_sample(reversed(values), 100, key)
        self.assertEqual(left, right)
        self.assertGreater(len(left), 0)
        self.assertLess(len(left), len(values))

    def test_evaluator_identity_is_part_of_baseline_compatibility(self):
        baseline_path = (Path(__file__).resolve().parents[1] / "artifacts" /
                         "experience_baseline_tfidf.json")
        result = json.loads(baseline_path.read_text())
        for key in ("mode", "uses_public_evaluation", "judge"):
            baseline = copy.deepcopy(result)
            baseline[key] = f"incompatible-{key}"
            failures = _check(result, baseline, 0.01)
            self.assertTrue(any(f"incomparable {key}" in failure
                                for failure in failures))


if __name__ == "__main__":
    unittest.main()

from __future__ import annotations

import unicodedata
import unittest

from tascomaps.core.text import fold, normalize, tokenize
from tascomaps.data.kb import KnowledgeBase, POI, QuerySurface
from tascomaps.data.loader import _add_query_surface, load_kb
from tascomaps.engines.trie import TrieAutocomplete


_TONE_MARKS = {"\u0300", "\u0301", "\u0303", "\u0309", "\u0323"}


def _without_tone(value: str) -> str:
    decomposed = unicodedata.normalize("NFD", normalize(value))
    return unicodedata.normalize(
        "NFC", "".join(char for char in decomposed
                       if char not in _TONE_MARKS))


def _register_brand(kb: KnowledgeBase, brand: str, index: int,
                    popularity: float = 0.0) -> None:
    poi = POI(
        poi_id=f"SYN{index}", source="T2", name=f"{brand} Branch {index}",
        brand=brand, category="Quán cà phê", city="Hà Nội",
        popularity_score=popularity,
    )
    kb.pois.append(poi)
    kb.poi_by_id[poi.poi_id] = poi
    kb.brands[fold(brand)] = brand


class QuerySurfaceRegistryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.kb = load_kb()

    def test_approved_surfaces_are_typed_and_provenance_aware(self):
        cases = (
            ("hcmc", "TP Hồ Chí Minh", "city", "approved_alias"),
            ("big c", "GO!", "brand", "historical_brand_alias"),
            ("pho4p", "Pizza 4P's", "poi_family",
             "approved_observed_correction"),
        )

        for surface, canonical, entity_type, provenance in cases:
            with self.subTest(surface=surface):
                resolved = self.kb.resolve_query_surface(surface)
                self.assertEqual(
                    resolved,
                    QuerySurface(surface, canonical, entity_type, provenance),
                )

    def test_unknown_and_multi_target_surfaces_do_not_resolve_uniquely(self):
        self.assertIsNone(self.kb.resolve_query_surface("not registered"))

        kb = KnowledgeBase()
        key = "shared historical label"
        first = QuerySurface(key, "First Brand", "brand", "approved_alias")
        second = QuerySurface(key, "Second Brand", "brand", "approved_alias")
        _register_brand(kb, first.canonical, 1)
        _register_brand(kb, second.canonical, 2)
        _add_query_surface(kb, first)
        _add_query_surface(kb, first)
        _add_query_surface(kb, second)

        self.assertEqual(kb.query_surfaces[fold(key)], [first, second])
        self.assertIsNone(kb.resolve_query_surface(key))
        texts = [row["text"] for row in
                 TrieAutocomplete(kb).suggest(key, top_k=2)["suggestions"]]
        self.assertEqual({fold(text) for text in texts},
                         {"first brand", "second brand"})

    def test_unbacked_surface_target_is_rejected_before_indexing(self):
        kb = KnowledgeBase()
        invalid = QuerySurface(
            "imaginary", "Never Exists", "brand", "approved_alias")

        _add_query_surface(kb, invalid)

        self.assertNotIn(fold(invalid.surface), kb.query_surfaces)
        kb.query_surfaces[fold(invalid.surface)] = [invalid]
        self.assertNotIn(
            "never exists",
            {fold(text) for text in P9EdgeCaseHardeningTests._texts(
                TrieAutocomplete(kb).suggest(invalid.surface))},
        )


class P9EdgeCaseHardeningTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.autocomplete = TrieAutocomplete(load_kb())

    @staticmethod
    def _texts(output):
        return [row["text"] for row in output["suggestions"]]

    def test_approved_surfaces_reach_their_canonical_families(self):
        cases = (
            ("hcmc", "tp ho chi minh"),
            ("big c", "go"),
            ("pho4p", "pizza 4p's"),
        )
        for query, family in cases:
            with self.subTest(query=query):
                output = self.autocomplete.suggest(query, top_k=10)
                self.assertIn(output["source"], {"access-surface", "hybrid"})
                self.assertTrue(any(
                    fold(family) in fold(text)
                    for text in self._texts(output)
                ))
                self.assertTrue(any(
                    row["source"] in {"access-surface", "hybrid"}
                    and fold(family) in fold(row["text"])
                    for row in output["suggestions"]
                ))

    def test_unique_diacritic_recovery_runs_only_after_strict_matching(self):
        strict_pho = self.autocomplete.suggest("Phở", top_k=10)
        strict_street = self.autocomplete.suggest("Phố", top_k=10)
        recovered_pho = self.autocomplete.suggest("Phỡ", top_k=10)
        recovered_city = self.autocomplete.suggest("Dà Nãng", top_k=10)

        self.assertNotEqual(strict_pho["source"], "diacritic")
        self.assertNotEqual(strict_street["source"], "diacritic")
        self.assertEqual(recovered_pho["source"], "diacritic")
        self.assertEqual(recovered_city["source"], "diacritic")
        recovered_heads = [tokenize(text)[0]
                           for text in self._texts(recovered_pho)]
        self.assertTrue(recovered_heads)
        self.assertTrue(all(
            _without_tone(head) == normalize("phơ")
            for head in recovered_heads
        ))
        self.assertTrue(any(
            "da nang" in fold(text)
            for text in self._texts(recovered_city)
        ))
        self.assertFalse(
            {fold(text) for text in self._texts(strict_pho)}
            & {fold(text) for text in self._texts(strict_street)}
        )
        self.assertFalse(
            {fold(text) for text in self._texts(recovered_pho)}
            & {fold(text) for text in self._texts(strict_street)}
        )

    def test_exact_go_brand_evidence_precedes_longer_prefix_matches(self):
        texts = self._texts(self.autocomplete.suggest("go", top_k=10))
        exact = next(index for index, text in enumerate(texts)
                     if fold(text) == "go")
        golden = next(index for index, text in enumerate(texts)
                      if fold(text).startswith("golden lotus"))
        self.assertLess(exact, golden)

    def test_exact_canonical_brand_survives_crowded_prefix_top_k(self):
        for target in ("Vincom", "The Coffee House"):
            with self.subTest(target=target):
                kb = KnowledgeBase()
                _register_brand(kb, target, 1)
                for index in range(2, 20):
                    _register_brand(
                        kb, f"{target} Popular Family {index}", index,
                        popularity=100.0,
                    )
                autocomplete = TrieAutocomplete(kb)
                node = autocomplete._walk(fold(target))
                self.assertIsNotNone(node)
                self.assertNotIn(
                    fold(target),
                    {fold(autocomplete.entries[index].display)
                     for index in node.top},
                )
                output = autocomplete.suggest(target, top_k=10)
                texts = self._texts(output)
                self.assertTrue(texts)
                self.assertEqual(fold(texts[0]), fold(target))

    def test_complete_live_canonical_brand_is_preserved_and_ranked_first(self):
        for target in ("Vincom", "The Coffee House"):
            with self.subTest(target=target):
                self.assertIn(fold(target), self.autocomplete.kb.brands)
                self.assertEqual(
                    self.autocomplete._expand_prefix(target), fold(target))

                output = self.autocomplete.suggest(target, top_k=10)
                texts = self._texts(output)
                self.assertTrue(texts)
                self.assertEqual(fold(texts[0]), fold(target))


if __name__ == "__main__":
    unittest.main()

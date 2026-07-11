from __future__ import annotations

import unicodedata
import unittest

from tascomaps.core.text import fold, normalize, tokenize
from tascomaps.core.understand import understand
from tascomaps.data.kb import KnowledgeBase, POI
from tascomaps.data.loader import load_kb
from tascomaps.engines.trie import TrieAutocomplete


# Vietnamese vowel shape and tone are separate pieces of information.  A user
# who has typed ``ơ`` but not chosen a tone yet should still reach ``ở``;
# removing every accent would also collapse distinct shapes such as ``ô``.
_TONE_MARKS = {"\u0300", "\u0301", "\u0303", "\u0309", "\u0323"}


def _without_tone(value: str) -> str:
    decomposed = unicodedata.normalize("NFD", normalize(value))
    return unicodedata.normalize(
        "NFC", "".join(char for char in decomposed
                       if char not in _TONE_MARKS))


class FirstWordFallbackTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.kb = load_kb()
        cls.autocomplete = TrieAutocomplete(cls.kb)

    @staticmethod
    def _texts(output):
        return [row["text"] for row in output["suggestions"]]

    @staticmethod
    def _first_word(value):
        words = tokenize(value)
        return words[0] if words else ""

    @staticmethod
    def _stable_rows(output):
        return [(row["text"], row["type"], row["source"], row["score"])
                for row in output["suggestions"]]

    @classmethod
    def _unique_progressive_prefix(cls, values):
        canonicals = sorted(set(values), key=fold)
        for canonical in canonicals:
            words = tokenize(canonical)
            if len(words) < 2:
                continue
            first = words[0]
            for length in range(len(first) - 1, 3, -1):
                partial = first[:length]
                partial_fold = fold(partial)
                if partial_fold in cls.kb.abbrev:
                    continue
                if cls.kb.lexicon.exact(partial_fold):
                    continue
                matches = {
                    value for value in canonicals
                    if fold(tokenize(value)[0]).startswith(partial_fold)
                }
                if matches == {canonical}:
                    return canonical, partial
        raise AssertionError("no unique corpus-derived progressive prefix")

    def test_live_category_first_word_is_shared_by_p6_and_p9(self):
        categories = {
            poi.category for poi in self.kb.pois_t2
            if poi.category and len(tokenize(poi.category)) >= 2
        }
        category, partial = self._unique_progressive_prefix(categories)
        query = " ".join([partial, *tokenize(category)[1:], "gần", "tôi"])

        parsed = understand(query, self.kb)
        self.assertEqual(fold(parsed.entities.get("category", "")), fold(category))
        self.assertEqual(parsed.entities.get("location"), "current_location")
        self.assertEqual(
            fold(parsed.debug["first_token_prefix"]["canonical"]), fold(category))
        self.assertNotIn(fold(partial), {fold(key) for key in parsed.debug["abbrev"]})

        output = self.autocomplete.suggest(query, top_k=10)
        category_pois = {
            fold(poi.name) for poi in self.kb.pois
            if fold(poi.category) == fold(category)
        }
        self.assertTrue(any(
            fold(category) in fold(text) or fold(text) in category_pois
            for text in self._texts(output)
        ))

    def test_live_brand_head_uses_constraint_but_rejects_unknown_tail(self):
        brand, partial = self._unique_progressive_prefix(
            self.kb.brands.values())
        grounded_query = f"{partial} gần tôi"

        parsed = understand(grounded_query, self.kb)
        self.assertEqual(fold(parsed.entities.get("brand", "")), fold(brand))
        self.assertEqual(parsed.entities.get("location"), "current_location")
        brand_pois = {
            fold(poi.name) for poi in self.kb.pois
            if fold(poi.brand) == fold(brand)
        }
        output = self.autocomplete.suggest(grounded_query, top_k=10)
        self.assertTrue(any(
            fold(text) == fold(brand) or fold(text) in brand_pois
            for text in self._texts(output)
        ))

        nonce_query = f"{partial} qzxvwjkqzxvw"
        rejected = understand(nonce_query, self.kb)
        self.assertFalse(rejected.entities.get("brand"))
        self.assertFalse(rejected.entities.get("poi_name"))
        self.assertEqual(self.autocomplete.suggest(
            nonce_query, top_k=6)["suggestions"], [])

    @staticmethod
    def _synthetic_categories():
        kb = KnowledgeBase()
        for index, (category, name) in enumerate((
                ("Xưởng gốm", "Gốm An Nhiên"),
                ("Xưởng mộc", "Mộc Bình Minh")), 1):
            poi = POI(
                poi_id=f"SYN{index}", source="T2", name=name,
                category=category, city="Hà Nội", popularity_score=50 - index,
            )
            kb.pois.append(poi)
            kb.poi_by_id[poi.poi_id] = poi
            kb.category_terms[normalize(category)] = category
            kb.lexicon.add(category, "category", weight=0.5)
            kb.lexicon.add(name, "poi", weight=1.0, payload=poi.poi_id)
        return kb

    def test_shared_head_requires_phrase_continuation(self):
        kb = self._synthetic_categories()
        autocomplete = TrieAutocomplete(kb)

        for suffix, expected in (("gốm", "Xưởng gốm"),
                                 ("mộc", "Xưởng mộc")):
            query = f"xưở {suffix}"
            with self.subTest(query=query):
                parsed = understand(query, kb)
                self.assertEqual(
                    fold(parsed.entities.get("category", "")), fold(expected))
                self.assertTrue(any(
                    fold(expected) in fold(text)
                    for text in self._texts(autocomplete.suggest(query, top_k=6))
                ))

        unknown = "xưở qzxvwjkqzxvw"
        parsed = understand(unknown, kb)
        self.assertFalse(parsed.entities.get("category"))
        self.assertFalse(parsed.entities.get("candidates"))
        self.assertEqual(autocomplete.suggest(unknown)["suggestions"], [])

    def test_first_word_fallback_is_nfc_nfd_stable(self):
        kb = self._synthetic_categories()
        autocomplete = TrieAutocomplete(kb)
        nfc_query = "xưở gốm gần tôi"
        nfd_query = unicodedata.normalize("NFD", nfc_query)

        nfc_parsed = understand(nfc_query, kb)
        nfd_parsed = understand(nfd_query, kb)
        self.assertEqual(nfc_parsed.intent, nfd_parsed.intent)
        self.assertEqual(nfc_parsed.entities, nfd_parsed.entities)
        self.assertEqual(fold(nfc_parsed.normalized_query),
                         fold(nfd_parsed.normalized_query))
        self.assertEqual(nfc_parsed.confidence, nfd_parsed.confidence)

        def stable_rows(query):
            return [(row["text"], row["type"], row["source"], row["score"])
                    for row in autocomplete.suggest(query)["suggestions"]]

        self.assertEqual(stable_rows(nfc_query), stable_rows(nfd_query))

    def test_bare_prefix_ranks_a_live_first_word_before_suffix_noise(self):
        """A progressive head should outrank words found later in a display.

        The cases and expected head words come from the live autocomplete
        corpus.  No POI name or benchmark answer is embedded in the test.
        Known brands remain allowed anywhere in a suggestion; the assertion is
        only that the best result preserves the uniquely resolved live head.
        """
        identity_sources = {
            "curated", "poi", "poi-alias", "brand", "address", "acronym",
        }
        all_heads = {
            fold(self._first_word(entry.display))
            for entry in self.autocomplete.entries
            if self._first_word(entry.display)
        }
        identity_heads = {
            fold(self._first_word(entry.display))
            for entry in self.autocomplete.entries
            if entry.source in identity_sources and self._first_word(entry.display)
        }
        observed = {
            fold(row.get("input_prefix", ""))
            for row in self.kb.autocomplete_pairs
        }

        cases = []
        for head in sorted(identity_heads):
            if len(head) < 5:
                continue
            for length in range(3, len(head)):
                partial = head[:length]
                if partial in self.kb.abbrev or partial in observed:
                    continue
                if {word for word in all_heads
                        if word.startswith(partial)} == {head}:
                    cases.append((head, partial))
                    break

        self.assertGreaterEqual(len(cases), 8)
        for expected_head, partial in cases[:12]:
            with self.subTest(partial=partial, expected_head=expected_head):
                rows = self.autocomplete.suggest(
                    partial, top_k=8)["suggestions"]
                self.assertTrue(rows)
                self.assertIn(expected_head, fold(rows[0]["text"]).split())

    def test_pho_prefix_variants_only_return_first_word_matches(self):
        """`ph`, `pho`, `phở`, and tone-pending `phơ` stay relevant."""
        target_shape = normalize("phơ")
        live_target_displays = {
            fold(entry.display)
            for entry in self.autocomplete.entries
            if _without_tone(self._first_word(entry.display)).startswith(
                target_shape)
        }
        self.assertTrue(live_target_displays)

        for prefix in ("ph", "pho", "phở", "phơ"):
            with self.subTest(prefix=prefix):
                rows = self.autocomplete.suggest(
                    prefix, top_k=10)["suggestions"]
                self.assertTrue(rows)
                self.assertTrue(live_target_displays & {
                    fold(row["text"]) for row in rows
                })
                heads = [self._first_word(row["text"]) for row in rows]
                if prefix == "phơ":
                    self.assertTrue(all(
                        _without_tone(head).startswith(target_shape)
                        for head in heads))
                elif prefix == "phở":
                    self.assertTrue(all(
                        normalize(head).startswith(normalize(prefix))
                        for head in heads))
                else:
                    self.assertTrue(all(
                        fold(head).startswith(fold(prefix)) for head in heads))

    def test_tone_pending_prefix_keeps_complete_tone_ranking(self):
        complete = self.autocomplete.suggest("phở", top_k=10)["suggestions"]
        pending = self.autocomplete.suggest("phơ", top_k=10)["suggestions"]

        self.assertTrue(complete)
        self.assertTrue(pending)
        self.assertEqual(complete[0]["text"], pending[0]["text"])

        # Select a corpus-backed minimal pair instead of naming its expected
        # display.  Supplying a different tone/vowel shape remains meaningful.
        target_shape = normalize("phơ")
        alternatives = sorted({
            normalize(self._first_word(entry.display))
            for entry in self.autocomplete.entries
            if fold(self._first_word(entry.display)) == fold(target_shape)
            and _without_tone(self._first_word(entry.display)) != target_shape
            and normalize(self._first_word(entry.display))
                != _without_tone(self._first_word(entry.display))
        })
        self.assertTrue(alternatives)
        alternative = alternatives[0]
        alternative_rows = self.autocomplete.suggest(
            alternative, top_k=10)["suggestions"]
        self.assertTrue(alternative_rows)
        self.assertFalse(
            {fold(row["text"]) for row in complete}
            & {fold(row["text"]) for row in alternative_rows})

    def test_pho_first_word_variants_preserve_a_live_continuation(self):
        """The head correction must not discard a following typed token."""
        target_shape = normalize("phơ")
        identity_sources = {"curated", "poi", "poi-alias", "brand"}
        live = []
        for entry in self.autocomplete.entries:
            words = tokenize(entry.display)
            if entry.source in identity_sources and len(words) >= 2 \
                    and _without_tone(words[0]).startswith(target_shape):
                live.append((entry.display, fold(words[1])))
        self.assertTrue(live)

        # Pick the most strongly represented next-letter branch from the live
        # identity corpus, rather than fixing a restaurant or benchmark string.
        branches = {}
        for display, second in live:
            if second:
                branches.setdefault(second[0], set()).add(fold(display))
        continuation, expected = max(
            branches.items(), key=lambda item: (len(item[1]), item[0]))

        for head in ("ph", "pho", "phở", "phơ"):
            prefix = f"{head} {continuation}"
            with self.subTest(prefix=prefix):
                rows = self.autocomplete.suggest(
                    prefix, top_k=10)["suggestions"]
                self.assertTrue(rows)
                self.assertTrue(expected & {
                    fold(row["text"]) for row in rows
                })
                self.assertTrue(all(
                    fold(self._first_word(row["text"])).startswith("ph")
                    for row in rows))

    def test_tone_pending_first_word_is_nfc_nfd_stable(self):
        for prefix in ("phơ", "phở"):
            with self.subTest(prefix=prefix):
                nfc_rows = self._stable_rows(
                    self.autocomplete.suggest(prefix, top_k=10))
                nfd_rows = self._stable_rows(self.autocomplete.suggest(
                    unicodedata.normalize("NFD", prefix), top_k=10))
                self.assertEqual(nfc_rows, nfd_rows)

    def test_transposed_first_word_typo_has_no_suffix_noise(self):
        canonical_prefix = "pho"
        transposed = canonical_prefix[1] + canonical_prefix[0] \
            + canonical_prefix[2:]
        rows = self.autocomplete.suggest(
            transposed, top_k=10)["suggestions"]

        self.assertTrue(rows)
        self.assertTrue(any(
            _without_tone(self._first_word(row["text"])).startswith("phơ")
            for row in rows))
        self.assertTrue(all(
            fold(self._first_word(row["text"])).startswith(canonical_prefix)
            for row in rows))

    def test_unique_single_token_transposition_stays_on_corrected_head(self):
        """Unique typo recovery must not pull rows from other token heads."""
        identity_sources = {
            "curated", "poi", "poi-alias", "acronym", "brand", "address",
        }
        heads = sorted({
            fold(self._first_word(entry.display))
            for entry in self.autocomplete.entries
            if entry.source in identity_sources
            and len(fold(self._first_word(entry.display))) >= 3
            and fold(self._first_word(entry.display)).isalpha()
        })
        prefixes = {
            head[:size]
            for head in heads
            for size in range(3, min(8, len(head)) + 1)
        }
        corrections = {}
        for corrected in prefixes:
            for index in range(len(corrected) - 1):
                if corrected[index] == corrected[index + 1]:
                    continue
                typo = corrected[:index] + corrected[index + 1] \
                    + corrected[index] + corrected[index + 2:]
                corrections.setdefault(typo, set()).add(corrected)

        cases = []
        for typo, values in sorted(corrections.items()):
            if len(values) != 1 or typo in self.kb.abbrev:
                continue
            if self.autocomplete._walk(typo) is not None \
                    or self.autocomplete._walk(
                        typo, self.autocomplete.suffix_root) is not None:
                continue
            corrected = next(iter(values))
            matching_heads = {
                head for head in heads if head.startswith(corrected)
            }
            if len(corrected) >= 4 and len(matching_heads) == 1:
                cases.append((typo, corrected, matching_heads))

        self.assertGreaterEqual(len(cases), 8)
        stride = max(1, len(cases) // 8)
        for typo, corrected, expected_heads in cases[::stride][:8]:
            with self.subTest(typo=typo, corrected=corrected):
                output = self.autocomplete.suggest(typo, top_k=10)
                rows = output["suggestions"]
                self.assertTrue(rows)
                self.assertIn("fuzzy", output["source"])
                corrected_node = self.autocomplete._walk(corrected)
                self.assertIsNotNone(corrected_node)
                expected_displays = {
                    fold(self.autocomplete._canonical_display(
                        self.autocomplete.entries[index].display))
                    for index in corrected_node.top
                }
                returned_displays = {
                    fold(row["text"]) for row in rows
                }
                self.assertTrue(returned_displays <= expected_displays)

                # A linked discovery template may verbalize the corrected
                # access surface later in its display.  Still require at least
                # one direct head completion so recovery remains useful.
                returned_heads = {
                    fold(self._first_word(row["text"])) for row in rows
                }
                self.assertTrue(returned_heads & expected_heads)

    def test_ambiguous_single_token_transposition_abstains(self):
        """Two corpus-backed adjacent-swap corrections are not mixed."""
        identity_sources = {
            "curated", "poi", "poi-alias", "acronym", "brand", "address",
        }
        heads = {
            fold(self._first_word(entry.display))
            for entry in self.autocomplete.entries
            if entry.source in identity_sources
            and len(fold(self._first_word(entry.display))) >= 3
            and fold(self._first_word(entry.display)).isalpha()
        }
        prefixes = {
            head[:size]
            for head in heads
            for size in range(3, min(8, len(head)) + 1)
        }
        corrections = {}
        for corrected in prefixes:
            for index in range(len(corrected) - 1):
                if corrected[index] == corrected[index + 1]:
                    continue
                typo = corrected[:index] + corrected[index + 1] \
                    + corrected[index] + corrected[index + 2:]
                corrections.setdefault(typo, set()).add(corrected)

        ambiguous = []
        for typo, values in sorted(corrections.items()):
            if len(values) < 2 or typo in self.kb.abbrev:
                continue
            if self.autocomplete._walk(typo) is not None \
                    or self.autocomplete._walk(
                        typo, self.autocomplete.suffix_root) is not None:
                continue
            parsed = understand(typo, self.kb)
            if parsed.entities.get("ambiguity_type") != "no_match":
                continue
            families = [
                {head for head in heads if head.startswith(corrected)}
                for corrected in values
            ]
            if all(families) and len(set().union(*families)) >= 2:
                ambiguous.append((typo, values))

        self.assertTrue(ambiguous)
        for typo, values in ambiguous:
            with self.subTest(typo=typo, corrections=values):
                output = self.autocomplete.suggest(typo, top_k=10)
                self.assertEqual(output["suggestions"], [])
                self.assertEqual(output["source"], "no-match")
                self.assertIsNone(output["suggestion_type"])


if __name__ == "__main__":
    unittest.main()

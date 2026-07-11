"""Corpus-driven hybrid autocomplete for Vietnamese map search.

    User Input → Normalize → Collect Exact + Semantic + First-token Anchors
               → Confidence-gated Fusion → Typo Recovery → Popular Fallback

* Character-level in-memory trie with a **precomputed Top-K** at every node.
* **Position-aware multi-key insertion**: full/head keys and later-token keys
  live in separate tries, so `dong k` reaches `Vincom Center Đồng Khởi` without
  letting `pho` match arbitrary names containing `Hải Phòng`.
* **Observed-prefix indexing**: curated typed prefixes point to their corpus-backed
  displays even when the two strings do not share a literal prefix.
* **Semantic composition**: query slots are verbalized from live KB values rather
  than fixed expected-answer tables.
* **Progressive first word**: a valid trie head can recover identity candidates
  when later words provide phrase continuation or grounded constraint evidence.
* **Fuzzy**: edit distance 1 plus conservative, uniqueness-gated first-token
  transposition recovery.
* **Fusion**: exact, semantic, and first-token candidates are deduplicated and
  ranked together with source provenance and bounded, monotonic scores.
* **Fallback**: popular queries (region-aware if lat/lng given) when nothing matches.
* **Scoring priority**: curated observations > exact corpus entries > semantic KB
  evidence > first-token recovery > fuzzy recovery > popular fallback.

The corpus is built from the unified KB. Public expected strings are used only by
the diagnostic evaluator and are not runtime rules.
"""
from __future__ import annotations

import re
from bisect import bisect_left
from collections import Counter
from dataclasses import dataclass, field
from time import perf_counter
from typing import Dict, List, Optional, Tuple

from ..constants import (ATTRIBUTE_TERMS, CATEGORY_CANON, CATEGORY_QUERY_TERMS,
                         LANDMARK_CATEGORIES)
from ..core.text import (accent_prefix_compatible, fold, has_accents,
                         normalize, tokenize)
from ..core.understand import understand
from ..data.kb import KnowledgeBase

TOP_K = 10
# Once a user has supplied three meaningful characters, unrelated trending
# queries are worse than an honest no-match.  One- and two-character prefixes
# retain the popular fallback that makes an early typeahead feel responsive.
_POPULAR_FALLBACK_MAX_CHARS = 2
# source authority → base score (ground-truth > frequency > popularity > template)
_BASE = {"curated": 0.90, "popular": 0.82, "poi": 0.70, "brand": 0.74,
         "address": 0.68, "template": 0.60, "combo": 0.58}
_SUFFIX_PENALTY = 0.06      # token-suffix keys rank just below the full-phrase key
_FUZZY_PENALTY = 0.15
# generic words that must NOT seed a token-suffix key (else common category words
# like "quán cà phê" inside long POI names flood every "cafe" query)
_SKIP_SUFFIX_HEADS = (
    {tok for term in CATEGORY_QUERY_TERMS for tok in fold(term).split()}
    | {tok for c in CATEGORY_CANON.values() for tok in fold(c).split()}
    | {"gan", "day", "nhat", "co", "o", "tai", "va", "mo", "cua"})

_CITY_ALIASES = {
    "ha noi": "Hà Nội", "hanoi": "Hà Nội", "hn": "Hà Nội",
    "da nang": "Đà Nẵng", "danang": "Đà Nẵng", "dn": "Đà Nẵng",
    "da lat": "Đà Lạt", "dalat": "Đà Lạt",
    "hcm": "TP.HCM", "tphcm": "TP.HCM", "tp hcm": "TP.HCM",
}

_DISTRICT_ALIASES = {f"q{i}": f"Quận {i}" for i in range(1, 13)}
_DISTRICT_ALIASES.update({f"quan {i}": f"Quận {i}" for i in range(1, 13)})

_CATEGORY_ALIASES = [
    (("cf", "cafe", "coffee", "ca phe"), "Quán cà phê"),
    (("ks", "hotel", "khach san"), "Khách sạn"),
    (("bv", "benh vien", "hospital"), "Bệnh viện"),
    (("atm",), "ATM"),
    (("xang", "cay xang", "tram xang", "tram"), "Cây xăng"),
    (("spa",), "Spa"),
    (("gym", "phong gym"), "Phòng gym"),
    (("sieuthi", "sieu thi"), "Siêu thị"),
    (("sua xe", "tiem sua xe"), "Tiệm sửa xe"),
    (("gara", "gara oto", "garage oto"), "Garage ô tô"),
    (("hoc vien",), "Học viện"),
]

def _token_prefix_related(left: str, right: str) -> bool:
    """Whether either folded phrase begins at a token boundary in the other."""
    left, right = fold(left), fold(right)
    if not left or not right:
        return False
    return bool(re.search(r"(?<!\w)" + re.escape(right), left)
                or re.search(r"(?<!\w)" + re.escape(left), right))


def _poi_display_variants(name: str) -> List[str]:
    """Generate common concise display forms without changing the POI record."""
    variants = []
    if name.startswith("Trường "):
        short = name[len("Trường "):]
        variants.append(short)
        for city in (" Hà Nội", " Đà Nẵng", " TP.HCM", " TP Hồ Chí Minh"):
            if short.endswith(city):
                variants.append(short[:-len(city)])
    if name.startswith("Nhà hàng "):
        variants.append(name[len("Nhà hàng "):])
    return list(dict.fromkeys(v for v in variants if v))


@dataclass
class Entry:
    display: str
    type: str
    score: float
    source: str


@dataclass(frozen=True)
class _SlotCandidate:
    """A live-registry value inferred from a complete or partial span."""

    value: str
    confidence: float
    kind: str = ""


class _Node:
    __slots__ = ("children", "ends", "top")

    def __init__(self):
        self.children: Dict[str, _Node] = {}
        self.ends: List[int] = []          # entry indices terminating here
        self.top: List[int] = []           # precomputed Top-K entry indices


class TrieAutocomplete:
    def __init__(self, kb: KnowledgeBase):
        self.kb = kb
        self.entries: List[Entry] = []
        self.root = _Node()
        self.suffix_root = _Node()
        self._semantic_indexes: Dict[str, Dict[str, list]] = {
            key: {} for key in ("category", "city", "district", "brand")}
        self._category_attributes: Dict[str, Dict[str, str]] = {}
        self._identity_token_entries: Dict[str, List[int]] = {}
        self._identity_tokens: List[str] = []
        for poi in kb.pois:
            for key, value in (("category", poi.category), ("city", poi.city),
                               ("district", poi.district), ("brand", poi.brand)):
                value_fold = fold(value)
                if value_fold:
                    self._semantic_indexes[key].setdefault(
                        value_fold, []).append(poi)
            category_fold = fold(poi.category)
            if category_fold:
                registry = self._category_attributes.setdefault(category_fold, {})
                for attribute in poi.attributes:
                    if re.search(r"(?<!\w)" + re.escape(fold(attribute))
                                 + r"(?!\w)", category_fold):
                        continue
                    registry.setdefault(normalize(attribute), attribute)
        self._popular = self._popular_pool()
        self._build_corpus()
        self._build_identity_token_index()
        self._precompute(self.root)
        self._precompute(self.suffix_root)

    # -- corpus -----------------------------------------------------------
    def _add(self, display, type_, score, source):
        display = (display or "").strip()
        if not display:
            return None
        idx = len(self.entries)
        self.entries.append(Entry(display, type_, round(score, 4), source))
        key = fold(display)
        self._insert(key, idx, 0.0)
        # multi-key: also index from each later token boundary, but never seed a
        # suffix at a generic category/stop word (avoids flooding common queries).
        toks = key.split()
        for t in range(1, len(toks)):
            if toks[t] in _SKIP_SUFFIX_HEADS:
                continue
            self._insert_suffix(" ".join(toks[t:]), idx)
        return idx

    def _insert(self, key: str, idx: int, penalty: float):
        if not key:
            return
        node = self.root
        for ch in key:
            node = node.children.setdefault(ch, _Node())
        # a suffix key stores a slightly penalised score via a shadow entry ref
        if penalty and self.entries[idx].source != "_pen":
            pen = Entry(self.entries[idx].display, self.entries[idx].type,
                        self.entries[idx].score - penalty, self.entries[idx].source)
            self.entries.append(pen)
            node.ends.append(len(self.entries) - 1)
        else:
            node.ends.append(idx)

    def _insert_suffix(self, key: str, idx: int,
                       penalty: float = _SUFFIX_PENALTY) -> None:
        """Insert a later-token access key into its own low-confidence lane."""
        if not key:
            return
        source = self.entries[idx]
        shadow = Entry(source.display, source.type,
                       source.score - penalty, source.source)
        self.entries.append(shadow)
        shadow_index = len(self.entries) - 1
        node = self.suffix_root
        for char in key:
            node = node.children.setdefault(char, _Node())
        node.ends.append(shadow_index)

    def _build_corpus(self):
        kb = self.kb
        # A. curated autocomplete pairs (ground truth)
        for r in kb.autocomplete_pairs:
            txt = str(r.get("suggestion_text", "")).strip()
            idx = self._add(
                txt, self._norm_type(r.get("suggestion_type")),
                _BASE["curated"] + 0.09 * float(r.get("score") or 0),
                "curated")
            # Training pairs describe a real observed path from typed prefix to
            # display text. Index that relation directly instead of relying on
            # a query-specific runtime branch. Ancestor Top-K values make every
            # shorter progressive prefix reach the same suggestion.
            observed_prefix = fold(r.get("input_prefix"))
            if idx is not None and observed_prefix:
                self._insert(observed_prefix, idx, 0.0)
        # B. popular queries
        for q in kb.popular_queries:
            self._add(str(q.get("query_text", "")), self._intent_type(q.get("intent_type")),
                      _BASE["popular"], "popular")
        # C. POIs, brands, streets/addresses
        for p in kb.pois:
            poi_idx = len(self.entries)
            self._add(p.name, "POI Suggestions",
                      _BASE["poi"] + min(0.2, (p.popularity_score or 0) / 500.0), "poi")
            for variant in _poi_display_variants(p.name):
                self._add(variant, "POI Suggestions",
                          _BASE["poi"] + min(0.16, (p.popularity_score or 0) / 600.0),
                          "poi-alias")

            # Index discovery queries under landmark aliases as well as under
            # their full generated text. This lets a partial landmark such as
            # "ben th" produce both the landmark and nearby-place suggestions.
            if p.category in LANDMARK_CATEGORIES:
                display = f"Khách sạn gần {p.name}"
                idx = len(self.entries)
                self._add(display, "Discovery Search", _BASE["template"], "landmark")
                keys = [p.name, *p.aliases]
                for alias in keys:
                    tokens = fold(alias).split()
                    for start in range(len(tokens)):
                        key = " ".join(tokens[start:])
                        if start == 0:
                            # A complete name/alias is a genuine access surface.
                            # Later words are useful fallbacks, but they must not
                            # masquerade as a position-zero exact match.
                            self._insert(key, poi_idx, 0.02)
                            self._insert(key, idx, 0.03)
                        else:
                            self._insert_suffix(key, poi_idx, 0.02)
                            self._insert_suffix(key, idx, 0.03)

            # Add an acronym access key for university names while keeping the
            # natural display text ("Đại học Bách Khoa" -> "dai hoc bk").
            if p.name.startswith("Trường Đại học "):
                short = p.name[len("Trường "):]
                proper = short.split()[2:4]
                if len(proper) == 2:
                    acronym = "".join(fold(token)[0] for token in proper if fold(token))
                    variants = sorted(_poi_display_variants(p.name), key=len)
                    for offset, variant in enumerate(variants):
                        idx = self._add(
                            variant, "POI Suggestions",
                            _BASE["poi"] + 0.05 - offset * 0.01,
                            "acronym")
                        if idx is not None:
                            self._insert(f"dai hoc {acronym}", idx, 0.0)
        for b in set(kb.brands.values()):
            self._add(b, "Brand Suggestions", _BASE["brand"], "brand")
        for a in kb.addresses:
            short = ", ".join(x for x in [a.get("street"), a.get("district"),
                                          a.get("city")] if x)
            self._add(short, "Address Suggestions", _BASE["address"], "address")
        # D. category / dish templates
        cats = set(kb.category_terms.values()) | set(CATEGORY_CANON.values())
        for c in cats:
            self._add(f"{c} gần đây", "Category Suggestions", _BASE["template"] + 0.05, "template")
            self._add(f"{c} gần nhất", "Nearby Suggestions", _BASE["template"], "template")
            self._add(f"{c} mở cửa 24/7", "Discovery Search", _BASE["template"] - 0.02, "template")
        dishes = sorted(set(kb.dish_terms.values()), key=fold)
        for dd in dishes:
            self._add(f"{dd} gần đây", "Category Suggestions", _BASE["template"] + 0.04, "template")
            self._add(f"{dd} ngon", "Discovery Search", _BASE["template"], "template")
        # E. observed semantic combinations.  This scales with corpus rows,
        # unlike a category/dish × every-location Cartesian product.
        seen_combinations = set()
        for poi in kb.pois_t2:
            for location in (poi.city, poi.district):
                if not poi.category or not location:
                    continue
                combination = (fold(poi.category), "", fold(location))
                if combination not in seen_combinations:
                    seen_combinations.add(combination)
                    self._add(f"{poi.category} {location}",
                              "Category Suggestions", _BASE["combo"], "combo")

    def _popular_pool(self):
        pool = []
        for q in sorted(self.kb.popular_queries,
                        key=lambda r: -int(r.get("monthly_frequency") or 0)):
            pool.append({"text": str(q.get("query_text", "")),
                         "type": self._intent_type(q.get("intent_type")),
                         "region": q.get("region", "")})
        return pool

    def _build_identity_token_index(self) -> None:
        """Index the first token of each live identity access surface.

        Trie nodes retain only global Top-K rows.  Filtering that truncated set
        for a continuation can therefore lose the relevant identity.  This side
        index stays corpus-derived and bounded at query time, while preserving
        all eligible heads until continuation evidence is evaluated.  Brands,
        aliases, addresses, and concise POI variants are standalone access
        surfaces in the corpus, so indexing arbitrary embedded display words is
        unnecessary and would reintroduce suffix noise.
        """
        identity_sources = {
            "curated", "poi", "poi-alias", "acronym", "brand", "address",
        }
        seen = set()
        for index, entry in enumerate(self.entries):
            if entry.source not in identity_sources:
                continue
            signature = (fold(entry.display), entry.source)
            if signature in seen:
                continue
            seen.add(signature)
            display_tokens = fold(entry.display).split()
            if not display_tokens:
                continue
            token = display_tokens[0]
            if (len(token) < 2 or not token.isalpha()
                    or token in _SKIP_SUFFIX_HEADS):
                continue
            self._identity_token_entries.setdefault(token, []).append(index)
        for indexes in self._identity_token_entries.values():
            indexes.sort(key=lambda value: (
                -self.entries[value].score, fold(self.entries[value].display)))
        self._identity_tokens = sorted(self._identity_token_entries)

    def _identity_token_candidates(self, prefix: str,
                                   limit: int = 256) -> List[int]:
        """Return bounded identity entries whose token starts with ``prefix``."""
        if not prefix or not self._identity_tokens:
            return []
        position = bisect_left(self._identity_tokens, prefix)
        candidates = []
        seen = set()
        while position < len(self._identity_tokens):
            token = self._identity_tokens[position]
            if not token.startswith(prefix):
                break
            for index in self._identity_token_entries[token]:
                display = fold(self.entries[index].display)
                if display in seen:
                    continue
                seen.add(display)
                candidates.append(index)
                if len(candidates) >= limit:
                    return candidates
            position += 1
        return candidates

    # -- precompute Top-K per node ---------------------------------------
    def _precompute(self, node: _Node) -> List[int]:
        pool = list(node.ends)
        for child in node.children.values():
            pool.extend(self._precompute(child))
        best: Dict[str, int] = {}
        for i in pool:
            e = self.entries[i]
            k = fold(e.display)          # dedup case-insensitively; keep best score
            if k not in best or e.score > self.entries[best[k]].score:
                best[k] = i
        node.top = sorted(best.values(), key=lambda i: -self.entries[i].score)[:TOP_K]
        return node.top

    # -- query ------------------------------------------------------------
    def _walk(self, key: str, root: Optional[_Node] = None) -> Optional[_Node]:
        node = root or self.root
        for ch in key:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def _fuzzy(self, key: str, budget: int = 1) -> Dict[str, float]:
        # A single first word needs a stricter policy than a complete phrase:
        # correct one corpus-backed prefix only, otherwise abstain.  This keeps
        # a transposition such as ``hpo`` on ``pho`` instead of also deleting a
        # letter and fanning out through every ``ho...`` entry.
        if (budget == 1 and " " not in key and key.isalpha()
                and key not in self.kb.abbrev and self._walk(key) is None):
            return self._single_token_fuzzy(key)

        out: Dict[str, float] = {}

        def collect(node):
            for i in node.top:
                e = self.entries[i]
                s = e.score - _FUZZY_PENALTY
                if s > out.get(e.display, -1):
                    out[e.display] = s

        def dfs(node, qi, b):
            if qi == len(key):
                collect(node)
                return
            ch = key[qi]
            for c, child in node.children.items():
                if c == ch:
                    dfs(child, qi + 1, b)
                elif b > 0:
                    dfs(child, qi + 1, b - 1)      # substitute
                    dfs(child, qi, b - 1)          # extra trie char
            if b > 0:
                dfs(node, qi + 1, b - 1)           # extra query char
                # One adjacent transposition is a common mobile typo and costs
                # the same as one insertion/deletion/substitution.
                if qi + 1 < len(key):
                    first = node.children.get(key[qi + 1])
                    second = first.children.get(ch) if first else None
                    if second is not None:
                        dfs(second, qi + 2, b - 1)
        dfs(self.root, 0, budget)
        return out

    def _single_token_fuzzy(self, key: str) -> Dict[str, float]:
        """Recover one unambiguous, corpus-backed first-token prefix.

        Operation strength is ordered by retained evidence: adjacent
        transposition, same-length substitution, then insertion/deletion.  A
        tier with multiple valid corrected prefixes is deliberately ambiguous
        and returns no automatic correction.
        """
        def descend(node: Optional[_Node], suffix: str) -> Optional[_Node]:
            for char in suffix:
                if node is None:
                    return None
                node = node.children.get(char)
            return node

        def valid_node(candidate: str) -> Optional[_Node]:
            if candidate == key or not candidate.isalpha():
                return None
            node = self._walk(candidate)
            return node if node and node.top else None

        def pack(candidates: Dict[str, _Node]) -> Optional[Dict[str, float]]:
            if len(candidates) != 1:
                return None
            node = next(iter(candidates.values()))
            rows: Dict[str, float] = {}
            for index in node.top:
                entry = self.entries[index]
                rows[entry.display] = max(
                    rows.get(entry.display, -1),
                    entry.score - _FUZZY_PENALTY)
            return rows

        if len(key) >= 3:
            transpositions = {}
            for position in range(len(key) - 1):
                if key[position] == key[position + 1]:
                    continue
                candidate = (key[:position] + key[position + 1]
                             + key[position] + key[position + 2:])
                node = valid_node(candidate)
                if node:
                    transpositions[candidate] = node
            if transpositions:
                return pack(transpositions) or {}

        # Short substitutions and length edits are much too ambiguous for an
        # automatic first-word correction; let the normal short-prefix popular
        # fallback handle them instead.
        if len(key) < 4:
            return {}

        substitutions = {}
        for position in range(len(key)):
            prefix_node = descend(self.root, key[:position])
            if prefix_node is None:
                break
            for char, child in prefix_node.children.items():
                if char == key[position] or not char.isalpha():
                    continue
                node = descend(child, key[position + 1:])
                if node and node.top:
                    candidate = key[:position] + char + key[position + 1:]
                    substitutions[candidate] = node
        if substitutions:
            return pack(substitutions) or {}

        length_edits = {}
        for position in range(len(key)):
            candidate = key[:position] + key[position + 1:]
            node = valid_node(candidate)
            if node:
                length_edits[candidate] = node
        for position in range(len(key) + 1):
            prefix_node = descend(self.root, key[:position])
            if prefix_node is None:
                break
            for char, child in prefix_node.children.items():
                if not char.isalpha():
                    continue
                node = descend(child, key[position:])
                if node and node.top:
                    candidate = key[:position] + char + key[position:]
                    length_edits[candidate] = node
        return pack(length_edits) or {}

    def _expand_prefix(self, prefix: str) -> str:
        toks = tokenize(prefix)
        out = []
        for i, t in enumerate(toks):
            ft = fold(t)
            last = i == len(toks) - 1
            if ft in self.kb.abbrev and (not last or len(toks) == 1):
                out.append(self.kb.abbrev[ft].expansion)
            else:
                out.append(t)
        return fold(" ".join(out))

    def _category_in(self, key: str) -> Optional[str]:
        for forms, display in _CATEGORY_ALIASES:
            if any(re.search(r"\b" + re.escape(fold(f)) + r"\b", key) for f in forms):
                return display
        for term, display in CATEGORY_QUERY_TERMS.items():
            if re.search(r"\b" + re.escape(fold(term)) + r"\b", key):
                return display
        return None

    def _city_in(self, key: str) -> Optional[str]:
        if re.search(r"\bda n(?:ang)?\b|\bdanang\b", key):
            return "Đà Nẵng"
        for alias, city in _CITY_ALIASES.items():
            if re.search(r"\b" + re.escape(alias) + r"\b", key):
                return city
        for cf, city in self.kb.cities.items():
            if re.search(r"\b" + re.escape(cf) + r"\b", key):
                return city
        return None

    def _district_in(self, key: str) -> Optional[str]:
        for alias, district in _DISTRICT_ALIASES.items():
            if re.search(r"\b" + re.escape(alias) + r"\b", key):
                return district
        return None

    def _pack(self, prefix: str, primary_type: str, rows: List[Tuple[str, str, float]],
              source: str, t0: float, top_k: int) -> dict:
        seen = set()
        sugg = []
        # Producers may interleave semantic query completions and concrete POIs.
        # Rank once here so every response has a stable, monotonic utility order.
        for text, typ, score in sorted(rows, key=lambda row: -float(row[2])):
            if not text:
                continue
            text = self._canonical_display(text)
            if not self._accent_compatible(prefix, text):
                continue
            k = fold(text)
            if k in seen:
                continue
            seen.add(k)
            sugg.append({"text": text, "display": text, "type": typ,
                         "score": round(score, 4), "source": source})
            if len(sugg) >= top_k:
                break
        return {"prefix": prefix, "suggestion_type": primary_type if sugg else None,
                "suggestions": sugg, "source": source,
                "latencyMs": round((perf_counter() - t0) * 1000, 3)}

    @staticmethod
    def _accent_compatible(prefix: str, suggestion: str) -> bool:
        """Reject only direct folded-token collisions with explicit accents.

        Semantic alternatives need not repeat every typed word, so absence is
        allowed. If a suggestion *does* contain the same folded token prefix,
        however, its Vietnamese accents must agree with the user's input.
        """
        candidates = tokenize(suggestion)
        for typed in tokenize(prefix):
            if not has_accents(typed):
                continue
            folded = fold(typed)
            collisions = [token for token in candidates
                          if fold(token).startswith(folded)]
            if collisions and not any(
                    accent_prefix_compatible(typed, token)
                    for token in collisions):
                return False
        return True

    def _score_rows(self, texts: List[str], typ: str, start: float = 0.99):
        return [(t, typ, start - i * 0.015) for i, t in enumerate(texts)]

    @staticmethod
    def _compose_semantic_text(category: str, attribute: str = "",
                               location: str = "", reference: str = "",
                               current_location: bool = False) -> str:
        """Verbalize structured slots without an answer lookup table.

        Values are supplied by the live corpus/P6 registries.  The only fixed
        behavior here is Vietnamese grammar: relational/adjectival attributes
        attach directly, while amenity nouns use ``có``.
        """
        parts = [category.strip()]
        attribute = attribute.strip()
        if reference and re.match(r"^gần\b", attribute, flags=re.I):
            # P6 may expose both a generic relational preference ("gần hồ")
            # and its resolved landmark. The resolved reference already carries
            # that relation, so verbalize it once.
            attribute = ""
        if attribute:
            direct = bool(re.match(
                r"^(?:phù hợp|gần|mở(?:\s+cửa)?|cho|để|view|yên tĩnh|"
                r"lãng mạn|miễn phí|check-?in|24(?:/7|h)?)\b",
                attribute, flags=re.I))
            if direct:
                parts.append(attribute)
            else:
                parts.extend(["có", attribute])
        if reference:
            parts.extend(["gần", reference.strip()])
        elif location:
            parts.extend(["tại", location.strip()])
        elif current_location:
            parts.extend(["gần", "đây"])
        return " ".join(part for part in parts if part).strip()

    def _coordinate_rows(self, key: str) -> List[str]:
        found = []
        for p in self.kb.pois:
            if p.lat is None or p.lng is None:
                continue
            coord = f"{p.lat},{p.lng}"
            if coord.startswith(key):
                found.append((coord, p.popularity_score or 0))
        for a in self.kb.addresses:
            lat, lng = a.get("latitude"), a.get("longitude")
            if lat is None or lng is None:
                continue
            coord = f"{lat},{lng}"
            if coord.startswith(key):
                found.append((coord, 0))
        return [c for c, _ in sorted(dict(found).items(), key=lambda x: -x[1])]

    def _brand_family(self, key: str) -> List[str]:
        keys = {key, key.replace("cafe", "ca phe"), key.replace("coffee", "ca phe")}
        out = sorted({brand for brand in self.kb.brands.values() if brand
                      and any(_token_prefix_related(brand, value)
                              for value in keys)}, key=fold)

        candidates = []
        for p in self.kb.pois:
            bf = fold(p.brand)
            if bf and any(_token_prefix_related(bf, x) for x in keys):
                candidates.append(p)
        candidates.sort(key=lambda p: -(p.popularity_score or 0))

        seen = {fold(x) for x in out}
        for p in candidates:
            heads = []
            if p.brand:
                heads.append(p.brand)
            heads.extend(_poi_display_variants(p.name))
            toks = p.name.split()
            if len(toks) >= 2:
                heads.append(" ".join(toks[:2]))
            heads.append(p.name)
            for h in heads:
                fh = fold(h)
                if fh not in seen and any(x in fh or fh in x for x in keys):
                    seen.add(fh)
                    out.append(h)
                    break
            if len(out) >= 6:
                break
        return out

    def _brand_rows(self, key: str) -> Optional[Tuple[str, List[Tuple[str, str, float]]]]:
        normalized_keys = {key, key.replace("cafe", "ca phe"),
                           key.replace("coffee", "ca phe")}
        exact_brands = sorted({brand for brand in self.kb.brands.values()
                               if any(fold(brand) == k for k in normalized_keys)})
        if len(exact_brands) == 1 and len(key) >= 4:
            brand = exact_brands[0]
            rows: List[Tuple[str, str, float]] = [
                (brand, "Brand Suggestions", 0.99),
                (f"{brand} gần đây", "Brand Suggestions", 0.98),
            ]
            branches = sorted(
                (p for p in self.kb.pois if fold(p.brand) == fold(brand)),
                key=lambda p: -(p.popularity_score or 0),
            )
            seen = {fold(text) for text, _, _ in rows}
            for p in branches:
                names = _poi_display_variants(p.name) or [p.name]
                for name in names:
                    if fold(name) not in seen:
                        seen.add(fold(name))
                        rows.append((name, "POI Suggestions", 0.95 - len(rows) * 0.01))
                        break
            return "Brand Suggestions", rows

        family = self._brand_family(key)
        if not family:
            return None
        keys = {key, key.replace("cafe", "ca phe"), key.replace("coffee", "ca phe")}
        matched_pois = [
            p for p in self.kb.pois
            if p.brand and any(_token_prefix_related(p.brand, x) for x in keys)
        ]
        unique_pois = {
            p.name for p in self.kb.pois
            if p.brand and any(_token_prefix_related(p.brand, x) for x in keys)
        }
        family_categories = {p.category for p in matched_pois if p.category}
        if len(family) >= 2 and len(family_categories) >= 2:
            typ = "Ambiguous"
        elif len(unique_pois) == 1:
            typ = "POI Suggestions"
        else:
            typ = "Brand Suggestions"
        rows = self._score_rows(family, typ)
        return typ, rows

    def _brand_location_rows(self, key: str, loc: str) -> Optional[List[Tuple[str, str, float]]]:
        family = self._brand_family(key)
        if not family:
            return None
        keys = {key, key.replace("cafe", "ca phe"), key.replace("coffee", "ca phe")}
        locf = fold(loc)
        rows = []
        for p in sorted(self.kb.pois, key=lambda p: -(p.popularity_score or 0)):
            bf = fold(p.brand)
            if not bf or not any(_token_prefix_related(bf, x) for x in keys):
                continue
            hay = fold(" ".join([p.name, p.address, p.district, p.city]))
            if locf in hay:
                rows.append((p.name, "POI Suggestions", 0.99 - len(rows) * 0.015))
        if rows:
            return rows
        head = re.sub(r"\s+gần đây$", "", family[0], flags=re.I)
        return [(f"{head} {loc}", "POI Suggestions", 0.97)]

    def _navigation_targets(self, key: str) -> List[str]:
        tail = re.sub(r"^.*?\b(?:chi duong|duong den|duong toi|dan duong)\b", "", key).strip()
        targets = []
        category = self._category_in(tail)
        if category:
            for p in sorted(self.kb.pois, key=lambda p: -(p.popularity_score or 0)):
                if p.category == category:
                    targets.append(p.name)
                if len(targets) >= 2:
                    break
        for e in self.kb.lexicon.fuzzy(tail, types={"poi", "alias", "brand"}, limit=4,
                                       score_cutoff=65):
            nm = e[0].canonical
            if tail == "ben" and fold(nm).startswith("benh"):
                continue
            if nm not in targets:
                targets.append(nm)
        if "ben" in tail and not any("bến" in t.lower() for t in targets):
            targets.append("bến xe")
        elif "ben" in tail and "ben xe" not in [fold(t) for t in targets]:
            targets.insert(1, "bến xe")
        return [f"Chỉ đường đến {t}" for t in targets[:3]]

    def _canonical_display(self, text: str) -> str:
        # Only canonicalize a bare alias/POI suggestion. Generated natural
        # language templates should retain their wording.
        text_fold = fold(text)
        node = self._walk(text_fold)
        if node:
            # Concise forms intentionally registered by the corpus builder
            # (for example a university acronym expansion) are valid displays,
            # not accidental aliases that should be expanded again.
            for index in node.ends:
                entry = self.entries[index]
                if entry.source in {"acronym", "poi-alias"} \
                        and fold(entry.display) == text_fold:
                    return entry.display
        if text_fold in self.kb.brands:
            return self.kb.brands[text_fold]
        hits = self.kb.lexicon.exact(text_fold, types={"poi", "alias"})
        for hit in hits:
            if hit.payload:
                poi = self.kb.resolve(hit.payload, hit.canonical)
                if poi:
                    return poi.name
        return text

    def _partial_city_rows(self, key: str, category: Optional[str]):
        if category != "Khách sạn":
            return None
        tail = key.split()[-1] if key.split() else ""
        if not (1 <= len(tail) <= 2):
            return None
        cities = list(dict.fromkeys(self.kb.cities.values()))
        matches = [city for city in cities if fold(city).startswith(tail)]
        if not matches:
            return None
        rows = []
        for city in matches[:3]:
            rows.append((f"Khách sạn {city}", "Category Suggestions",
                         0.99 - len(rows) * 0.015))
            rows.append((f"Khách sạn gần biển {city}", "Discovery Search",
                         0.98 - len(rows) * 0.015))
        return rows

    @staticmethod
    def _registry_matches(key: str, registry, limit: int = 4,
                          raw: str = "") -> List[str]:
        """Find complete or final-partial phrases from a live semantic registry.

        Every token except the currently typed final token must match exactly;
        the final token may be a prefix. This supports natural progressive input
        without broad substring matching or query-specific completions.
        """
        query_tokens = key.split()
        raw_tokens = tokenize(raw)
        aligned_raw = raw_tokens if len(raw_tokens) == len(query_tokens) else []
        scored = {}
        items = registry.items() if hasattr(registry, "items") else registry
        for surface, canonical in items:
            target = fold(surface).split()
            surface_tokens = tokenize(surface)
            canonical_tokens = tokenize(str(canonical))
            if (len(canonical_tokens) == len(surface_tokens)
                    and fold(str(canonical)) == fold(str(surface))
                    and any(has_accents(token) for token in canonical_tokens)):
                surface_tokens = canonical_tokens
            if not target:
                continue
            for start in range(len(query_tokens)):
                available = min(len(target), len(query_tokens) - start)
                for size in range(available, 0, -1):
                    # A partial semantic phrase is useful only at the live end
                    # of the prefix. Embedded spans must be complete phrases.
                    if size < len(target) and start + size != len(query_tokens):
                        continue
                    window = query_tokens[start:start + size]
                    ok = True
                    used_partial = False
                    for index, (typed, expected) in enumerate(zip(window, target)):
                        final = index == size - 1
                        min_partial = 1 if size >= 2 else 2
                        if typed == expected:
                            continue
                        if not (final and len(typed) >= min_partial
                                and expected.startswith(typed)):
                            ok = False
                            break
                        used_partial = True
                    if used_partial and start + size != len(query_tokens):
                        ok = False
                    if ok and aligned_raw:
                        raw_window = aligned_raw[start:start + size]
                        for index, (typed_raw, expected_raw) in enumerate(
                                zip(raw_window, surface_tokens)):
                            if not has_accents(typed_raw):
                                continue
                            final = index == size - 1
                            accent_ok = accent_prefix_compatible(
                                typed_raw, expected_raw)
                            if not final:
                                accent_ok = accent_ok and \
                                    len(fold(typed_raw)) == len(fold(expected_raw))
                            if not accent_ok:
                                ok = False
                                break
                    if not ok:
                        continue
                    completeness = size / len(target)
                    typed_chars = sum(len(token) for token in window)
                    score = completeness + min(0.25, typed_chars / 100.0)
                    key_canonical = fold(canonical)
                    if score > scored.get(key_canonical, (0.0, ""))[0]:
                        scored[key_canonical] = (score, canonical)
                    break
        return [canonical for _, canonical in sorted(
            scored.values(), key=lambda item: (-item[0], fold(item[1])))[:limit]]

    def _semantic_slot_rows(self, prefix: str, key: str):
        """Generate corpus-grounded completions from partial semantic slots."""
        parsed = understand(prefix, self.kb)
        entities = parsed.entities or {}

        categories = []
        if entities.get("category"):
            categories.append(str(entities["category"]))
        else:
            alias_category = self._category_in(key)
            if alias_category:
                categories.append(alias_category)
            categories.extend(self._registry_matches(
                key, self.kb.category_terms, 3, raw=prefix))
        attributes = []
        if entities.get("attribute"):
            attributes.append(str(entities["attribute"]))
        attributes.extend(str(value) for value in
                          (entities.get("attributes") or []) if value)
        if not attributes and categories:
            # Include attributes observed for the inferred category, even when
            # that phrase is also a valid category elsewhere in the corpus.
            # Context makes e.g. a convenience store an amenity of a fuel stop.
            attribute_registry = dict(self.kb.attribute_terms)
            for category in categories:
                attribute_registry.update(
                    self._category_attributes.get(fold(category), {}))
            attributes = self._registry_matches(
                key, attribute_registry, 4, raw=prefix)
        cities = ([str(entities["city"])] if entities.get("city") else
                  self._registry_matches(key, self.kb.cities, 3, raw=prefix))
        # A partial final token can resemble both a city and a district.  Treat
        # them as alternatives, never simultaneous hard filters.
        districts = ([str(entities["district"])] if entities.get("district") else
                     ([] if cities else
                      self._registry_matches(
                          key, self.kb.districts, 3, raw=prefix)))

        # Brand and dish prefixes are useful on their own.  They must not become
        # accidental hard filters merely because the last two letters of a
        # category/attribute also begin a brand or dish (for example `sa...`).
        brands = [str(entities["brand"])] if entities.get("brand") else []
        dishes = ([str(entities["dish"])] if entities.get("dish") else
                  self._registry_matches(
                      key, self.kb.dish_terms, 4, raw=prefix))
        if not any((categories, attributes, cities, districts, brands, dishes)):
            brands = self._registry_matches(
                key, self.kb.brands, 3, raw=prefix)
            if not brands:
                dishes = self._registry_matches(
                    key, self.kb.dish_terms, 3, raw=prefix)

        current_location = entities.get("location") == "current_location" or bool(
            re.search(r"\b(?:gan|near)(?:\s+(?:d|da|day|n|nh|nhat))?$", key))
        reference = str(entities.get("reference_poi")
                        or entities.get("reference_area")
                        or entities.get("reference_address") or "").strip()

        categories = list(dict.fromkeys(categories))
        attributes = list(dict.fromkeys(attributes))
        cities = list(dict.fromkeys(cities))
        districts = list(dict.fromkeys(districts))
        brands = list(dict.fromkeys(brands))
        dishes = list(dict.fromkeys(dishes))

        dish_categories = {fold(value) for value in self.kb.dish_categories.values()
                           if value}
        dish_led = bool(
            dishes and not attributes and not brands
            and (not categories or all(fold(value) in dish_categories
                                       for value in categories)))
        if dish_led:
            rows: List[Tuple[str, str, float]] = []
            for index, dish in enumerate(dishes):
                location = cities[0] if cities else (districts[0] if districts else "")
                if location:
                    text = f"{dish} tại {location}"
                elif current_location:
                    text = f"{dish} gần đây"
                else:
                    text = dish
                rows.append((text, "Category Suggestions", 0.985 - index * 0.01))
            dish_folds = {fold(value) for value in dishes}
            candidates = []
            for poi in self.kb.pois:
                if cities and fold(poi.city) not in {fold(value) for value in cities}:
                    continue
                haystack = fold(" ; ".join([
                    poi.name, poi.sub_category, *poi.attributes, *poi.tags]))
                if not any(value in haystack for value in dish_folds):
                    continue
                quality = float(poi.popularity_score or 0) \
                    + 20 * float(poi.rating or 0)
                candidates.append((quality, poi))
            for index, (_, poi) in enumerate(sorted(
                    candidates, key=lambda item: (-item[0], fold(item[1].name)))[:4]):
                rows.append((poi.name, "POI Suggestions", 0.90 - index * 0.01))
            return rows[0][1], rows

        if not any((categories, attributes, brands, dishes)):
            return None

        category_folds = {fold(value) for value in categories}
        city_folds = {fold(value) for value in cities}
        district_folds = {fold(value) for value in districts}
        brand_folds = {fold(value) for value in brands}
        attribute_folds = {fold(value) for value in attributes}

        indexed_pools = []
        for kind, values in (("category", category_folds), ("city", city_folds),
                             ("district", district_folds), ("brand", brand_folds)):
            if values:
                indexed_pools.append([
                    poi for value in values
                    for poi in self._semantic_indexes[kind].get(value, [])])
        candidate_pool = min(indexed_pools, key=len) if indexed_pools \
            else self.kb.pois

        candidates = []
        for poi in candidate_pool:
            if category_folds and fold(poi.category) not in category_folds:
                continue
            if city_folds and fold(poi.city) not in city_folds:
                continue
            if district_folds and fold(poi.district) not in district_folds:
                continue
            if brand_folds and fold(poi.brand) not in brand_folds:
                continue
            haystack = fold(" ; ".join([*poi.attributes, *poi.tags,
                                         poi.description]))
            matched_attributes = [value for value in attributes
                                  if fold(value) in haystack]
            if attribute_folds and not matched_attributes:
                continue
            quality = float(poi.popularity_score or 0) + 20 * float(poi.rating or 0)
            candidates.append((quality, poi, matched_attributes))
        candidates.sort(key=lambda item: (-item[0], fold(item[1].name)))

        rows: List[Tuple[str, str, float]] = []
        seen_queries = set()
        for _, poi, matched_attributes in candidates[:12]:
            category = poi.category if categories else poi.category
            attribute = matched_attributes[0] if matched_attributes else \
                (attributes[0] if attributes else "")
            location = (cities[0] if cities else
                        (districts[0] if districts else ""))
            text = self._compose_semantic_text(
                category, attribute, location, reference, current_location)
            text_fold = fold(text)
            if text and text_fold not in seen_queries:
                seen_queries.add(text_fold)
                suggestion_type = "Discovery Search" if attribute \
                    else ("Nearby Suggestions" if current_location
                          else "Category Suggestions")
                rows.append((text, suggestion_type, 0.985 - len(rows) * 0.01))
            rows.append((poi.name, "POI Suggestions", 0.90 - len(rows) * 0.005))
            if len(rows) >= 8:
                break

        if not rows and dishes and not categories:
            rows.extend((f"{dish} gần đây", "Category Suggestions",
                         0.95 - index * 0.01)
                        for index, dish in enumerate(dishes[:4]))
        if not rows and brands and not categories:
            rows.extend((brand, "Brand Suggestions", 0.95 - index * 0.01)
                        for index, brand in enumerate(brands[:4]))
        if not rows and categories:
            location = cities[0] if cities else (districts[0] if districts else "")
            for index, category in enumerate(categories[:4]):
                attribute = attributes[0] if attributes else ""
                text = self._compose_semantic_text(
                    category, attribute, location, reference, current_location)
                suggestion_type = "Discovery Search" if attribute or reference \
                    else ("Nearby Suggestions" if current_location
                          else "Category Suggestions")
                rows.append((text, suggestion_type, 0.95 - index * 0.01))
        if not rows:
            return None
        primary = rows[0][1]
        return primary, rows

    def _first_token_anchor_rows(self, prefix: str, top_k: int = 4):
        """Recover bounded identity candidates from a progressive first word.

        A first-token prefix is useful only when the remaining text either
        continues the candidate identity or contains independently grounded
        query evidence. This prevents an unknown tail from bypassing OOD
        abstention while still handling inputs such as a brand head + amenity.
        """
        tokens = tokenize(prefix)
        if len(tokens) < 2:
            return []
        head_raw = tokens[0]
        head = fold(head_raw)
        if len(head) < 2 or not head.isalpha() or head in self.kb.abbrev:
            return []
        identity_candidates = self._identity_token_candidates(
            head, limit=max(64, top_k * 24))
        if not identity_candidates:
            return []

        tail_tokens = tokens[1:]
        tail_understanding = understand(" ".join(tail_tokens), self.kb)
        tail_entities = {
            key: value for key, value in (tail_understanding.entities or {}).items()
            if key not in {"ambiguity_type", "candidates"} and value
        }
        tail_has_evidence = bool(tail_entities) \
            or tail_understanding.intent not in {"Ambiguous", "POI Search"}
        rows = []
        for entry_index in identity_candidates:
            entry = self.entries[entry_index]
            display_tokens = tokenize(entry.display)
            best_continuation = 0
            best_head_coverage = 0.0
            for position, expected_head in enumerate(display_tokens):
                expected_fold = fold(expected_head)
                if not expected_fold.startswith(head):
                    continue
                if has_accents(head_raw) and not accent_prefix_compatible(
                        head_raw, expected_head):
                    continue
                continuation = 0
                for typed, expected in zip(
                        tail_tokens, display_tokens[position + 1:]):
                    if not fold(expected).startswith(fold(typed)):
                        break
                    if has_accents(typed) and not accent_prefix_compatible(
                            typed, expected):
                        break
                    continuation += 1
                head_coverage = min(1.0, len(head) / max(1, len(expected_fold)))
                if (continuation, head_coverage) > (
                        best_continuation, best_head_coverage):
                    best_continuation = continuation
                    best_head_coverage = head_coverage

            continuation_chars = sum(
                len(fold(token)) for token in tail_tokens[:best_continuation])
            progressive_evidence = best_continuation > 0 \
                and len(head) + continuation_chars >= 4
            constrained_head = len(head) >= 3 and tail_has_evidence
            if not (progressive_evidence or constrained_head):
                continue
            score = min(0.95, entry.score
                        + 0.05 * min(2, best_continuation)
                        + 0.03 * best_head_coverage)
            rows.append((entry.display, entry.type, score))

        deduped = {}
        for display, suggestion_type, score in rows:
            key = fold(display)
            current = deduped.get(key)
            if current is None or score > current[2]:
                deduped[key] = (display, suggestion_type, score)
        return sorted(deduped.values(), key=lambda row: (-row[2], fold(row[0])))\
            [:min(4, top_k)]

    def _smart_patterns(self, prefix: str, key: str, top_k: int,
                        t0: float) -> Optional[dict]:
        """Intent-level completions for prefixes whose token order is not a trie key.

        Keep this layer compositional: category + attribute, category + location,
        brand family, navigation + destination, etc. The trie remains the primary
        exact/fuzzy retrieval path.
        """
        if not key:
            return None
        raw_key = fold(prefix)
        exact_node = self._walk(key)
        has_exact_poi = bool(exact_node and any(
            self.entries[index].type == "POI Suggestions"
            for index in exact_node.top))

        # Coordinates are not natural-language strings, so they do not live well
        # inside the phrase trie.
        if re.fullmatch(r"\d{1,2}(?:\.\d+)?", key):
            coords = self._coordinate_rows(key)
            if not coords:
                return None
            return self._pack(prefix, "Coordinate Search",
                              self._score_rows(coords, "Coordinate Search"),
                              "pattern", t0, top_k)

        # Navigation prefixes should complete to actions, not raw POI names.
        if re.search(r"\b(chi duong|duong den|duong toi|dan duong)\b", key):
            texts = self._navigation_targets(key)
            if not texts:
                return None
            return self._pack(prefix, "Navigation",
                              self._score_rows(texts, "Navigation"),
                              "pattern", t0, top_k)

        city = self._city_in(key)
        district = self._district_in(key)
        category = self._category_in(key)
        loc = district or city
        rows: List[Tuple[str, str, float]] = []
        primary_type: Optional[str] = None

        partial_city_rows = self._partial_city_rows(
            key, category) if city is None and not has_exact_poi else None
        if partial_city_rows:
            primary_type = "Category Suggestions"
            rows.extend(partial_city_rows)

        if loc and not has_exact_poi:
            branch_rows = self._brand_location_rows(key, loc)
            if branch_rows:
                primary_type = primary_type or "POI Suggestions"
                rows.extend(branch_rows)

        brand = self._brand_rows(key)
        if not has_exact_poi and brand and len(raw_key.split()) <= 2:
            primary_type, brand_rows = brand
            rows.extend(brand_rows)

        # A concrete POI prefix is higher-confidence than a semantic
        # interpretation. Other exact prefixes (categories, brands, observed
        # query aliases) may still contribute alongside semantic candidates.
        semantic = self._semantic_slot_rows(prefix, key) if not has_exact_poi else None
        if semantic:
            semantic_type, semantic_rows = semantic
            primary_type = primary_type or semantic_type
            rows.extend(semantic_rows)

        if not rows:
            return None
        return self._pack(prefix, primary_type or rows[0][1], rows,
                          "semantic", t0, top_k)

    def _fuse_candidate_pools(self, prefix: str, pools: list, top_k: int,
                              t0: float) -> dict:
        """Fuse confidence-gated candidate sources and rank once.

        Exact evidence remains the primary tier when present. Semantic,
        first-token, and fuzzy candidates can corroborate or fill the list but
        cannot crowd out a full exact pool merely because their producer used
        a larger raw score.
        """
        nonempty = [(source, rows) for source, rows in pools if rows]
        if not nonempty:
            return {"prefix": prefix, "suggestion_type": None,
                    "suggestions": [], "source": "no-match",
                    "latencyMs": round((perf_counter() - t0) * 1000, 3)}

        present = {source for source, _ in nonempty}
        if "exact" in present:
            primary = "exact"
            weights = {"exact": 1.0, "semantic": 0.45,
                       "first-token": 0.30, "suffix": 0.20,
                       "suffix-continuation": 0.35,
                       "fuzzy": 0.35, "popular": 0.20}
        elif "first-token" in present:
            primary = "first-token"
            weights = {"first-token": 1.0, "semantic": 0.72,
                       "suffix": 0.35, "suffix-continuation": 0.58,
                       "fuzzy": 0.30, "popular": 0.20}
        elif "suffix-continuation" in present:
            # Matching two or more typed tokens at a token boundary is strong
            # lexical evidence (for example ``bien my`` → ``Biển Mỹ Khê``).
            # It outranks a weak semantic reinterpretation while remaining
            # below a genuine position-zero or first-token identity match.
            primary = "suffix-continuation"
            weights = {"suffix-continuation": 1.0, "semantic": 0.55,
                       "suffix": 0.35, "fuzzy": 0.30, "popular": 0.20}
        elif "semantic" in present:
            primary = "semantic"
            weights = {"semantic": 1.0, "first-token": 0.68,
                       "suffix": 0.30, "suffix-continuation": 0.60,
                       "fuzzy": 0.35, "popular": 0.20}
        elif "suffix" in present:
            primary = "suffix"
            weights = {"suffix": 1.0, "fuzzy": 0.30, "popular": 0.20}
        elif "fuzzy" in present:
            primary = "fuzzy"
            weights = {"fuzzy": 1.0, "popular": 0.20}
        else:
            primary = "popular"
            weights = {"popular": 1.0}

        fused = {}
        for source, rows in nonempty:
            weight = weights.get(source, 0.2)
            for rank, item in enumerate(rows, 1):
                if isinstance(item, dict):
                    display = str(item.get("display") or item.get("text") or "")
                    typ = str(item.get("type") or "Category Suggestions")
                    raw_score = float(item.get("score") or 0.0)
                else:
                    display, typ, raw_score = item
                    display, typ = str(display), str(typ)
                    raw_score = float(raw_score)
                display = self._canonical_display(display)
                if not display or not self._accent_compatible(prefix, display):
                    continue
                key = fold(display)
                vote = weight / (8.0 + rank)
                candidate = fused.get(key)
                if candidate is None:
                    fused[key] = {
                        "display": display, "type": typ, "vote": vote,
                        "raw_score": raw_score, "sources": {source},
                        "best_source": source, "best_weight": weight,
                    }
                    continue
                candidate["vote"] += vote
                candidate["sources"].add(source)
                if weight > candidate["best_weight"] \
                        or (weight == candidate["best_weight"]
                            and raw_score > candidate["raw_score"]):
                    candidate.update({
                        "display": display, "type": typ,
                        "raw_score": raw_score, "best_source": source,
                        "best_weight": weight,
                    })

        ranked = sorted(
            fused.values(),
            key=lambda item: (-item["vote"], -item["raw_score"],
                              fold(item["display"])))[:top_k]
        if not ranked:
            return {"prefix": prefix, "suggestion_type": None,
                    "suggestions": [], "source": "no-match",
                    "latencyMs": round((perf_counter() - t0) * 1000, 3)}

        caps = {"exact": 0.99, "semantic": 0.96,
                "first-token": 0.92, "suffix-continuation": 0.90,
                "suffix": 0.86,
                "fuzzy": 0.82, "popular": 0.55}
        cap = caps[primary]
        floor = max(0.0, cap - 0.24)
        max_vote = ranked[0]["vote"] or 1.0
        suggestions = []
        previous_score = 1.0
        for item in ranked:
            score = floor + (cap - floor) * (item["vote"] / max_vote)
            score = min(previous_score, max(0.0, min(1.0, score)))
            previous_score = score
            item_source = item["best_source"] if len(item["sources"]) == 1 \
                else "hybrid"
            suggestions.append({
                "text": item["display"], "display": item["display"],
                "type": item["type"], "score": round(score, 4),
                "source": item_source,
            })
        response_source = primary if len(present) == 1 else "hybrid"
        return {"prefix": prefix,
                "suggestion_type": suggestions[0]["type"],
                "suggestions": suggestions, "source": response_source,
                "latencyMs": round((perf_counter() - t0) * 1000, 3)}

    def suggest(self, prefix: str, top_k: int = 6, lat: float = None,
                lng: float = None) -> dict:
        t0 = perf_counter()
        key = self._expand_prefix(prefix)

        if not key:
            return {"prefix": prefix, "suggestion_type": None,
                    "suggestions": [], "source": "empty",
                    "latencyMs": round((perf_counter() - t0) * 1000, 3)}

        smart = self._smart_patterns(prefix, key, top_k, t0)
        # Explicit coordinate/navigation intent is complete and should not be
        # diluted by lexical completions. All natural-language producers fuse.
        if smart and smart.get("suggestions") \
                and smart.get("suggestion_type") in {
                    "Coordinate Search", "Navigation"}:
            return smart

        # house-number address: keep the typed number, match the street part
        hn = re.match(r"^(\d+[a-z]?)\s+(.+)$", key)
        if hn:
            num, rest = hn.group(1), hn.group(2)
            node = self._walk(rest)
            pool = (node.top if node and node.top else
                    sorted(self._fuzzy(rest).items(), key=lambda x: -x[1]))
            results: List[tuple] = []
            for item in pool[:top_k]:
                if isinstance(item, int):
                    e = self.entries[item]
                    disp, ty, sc = e.display, e.type, e.score
                else:
                    disp, sc = item
                    ty = self._type_of(disp)
                if ty == "Address Suggestions":
                    disp = f"{num} {disp}"
                if not self._accent_compatible(prefix, disp):
                    continue
                results.append((disp, "Address Suggestions" if ty == "Address Suggestions" else ty, sc))
            if results:
                results = results[:top_k]
                sugg = [{"text": d, "display": d, "type": ty, "score": round(sc, 4),
                         "source": "exact"} for d, ty, sc in results]
                return {"prefix": prefix, "suggestion_type": sugg[0]["type"],
                        "suggestions": sugg, "source": "exact",
                        "latencyMs": round((perf_counter() - t0) * 1000, 3)}

        pools = []
        node = self._walk(key)
        exact_rows = []
        if node and node.top:
            exact_rows = [(self.entries[index].display,
                           self.entries[index].type,
                           self.entries[index].score)
                          for index in node.top]
            pools.append(("exact", exact_rows))

        # Later-token matches are useful for queries such as ``dong k`` but
        # must never pollute an available position-zero/head match (``pho``
        # should not be padded with arbitrary POIs in Hai Phong).
        suffix_rows = []
        if not exact_rows:
            suffix_node = self._walk(key, self.suffix_root)
            if suffix_node and suffix_node.top:
                suffix_rows = [(self.entries[index].display,
                                self.entries[index].type,
                                self.entries[index].score)
                               for index in suffix_node.top]

        semantic_rows = list((smart or {}).get("suggestions") or [])
        if semantic_rows:
            pools.append(("semantic", semantic_rows))

        first_token_rows = []
        if not exact_rows:
            first_token_rows = self._first_token_anchor_rows(prefix, top_k)
            if first_token_rows:
                pools.append(("first-token", first_token_rows))

        if suffix_rows:
            suffix_source = "suffix-continuation" \
                if len(key.split()) >= 2 else "suffix"
            pools.append((suffix_source, suffix_rows))

        # Fuzzy retrieval is a recovery tier, not padding. Once exact or
        # semantic evidence exists, returning a shorter grounded list is better
        # than filling it with one-edit lookalikes (for example xăng → Nẵng).
        if (not exact_rows and not semantic_rows and not first_token_rows
                and not suffix_rows):
            have = {fold(row[0]) for row in exact_rows}
            have.update(fold(row.get("display") or row.get("text") or "")
                        for row in semantic_rows)
            fuzzy_rows = [
                (display, self._type_of(display), score)
                for display, score in sorted(
                    self._fuzzy(key).items(), key=lambda item: -item[1])
                if fold(display) not in have
            ]
            if fuzzy_rows:
                pools.append(("fuzzy", fuzzy_rows))

        if not pools:
            compact_key = key.replace(" ", "")
            if " " not in key and len(compact_key) <= _POPULAR_FALLBACK_MAX_CHARS:
                popular_rows = [(row["text"], row["type"], 0.5)
                                for row in self._region_pool(lat, lng)]
                pools.append(("popular", popular_rows))

        return self._fuse_candidate_pools(prefix, pools, top_k, t0)

    def _region_pool(self, lat, lng):
        # Infer the nearest corpus city centroid; no geography thresholds or
        # fixed city list is baked into the engine.
        region = None
        if lat is not None and lng is not None:
            groups: Dict[str, List[Tuple[float, float]]] = {}
            displays = {}
            for poi in self.kb.pois:
                if not poi.city or poi.lat is None or poi.lng is None:
                    continue
                key = fold(poi.city)
                groups.setdefault(key, []).append((float(poi.lat), float(poi.lng)))
                displays.setdefault(key, poi.city)
            if groups:
                nearest = min(groups, key=lambda key: (
                    (sum(point[0] for point in groups[key]) / len(groups[key])
                     - float(lat)) ** 2
                    + (sum(point[1] for point in groups[key]) / len(groups[key])
                       - float(lng)) ** 2))
                region = displays[nearest]
        region_key = fold(self.kb.cities.get(fold(region), region)) if region else ""
        ranked = [p for p in self._popular if not region_key or fold(
            self.kb.cities.get(fold(p["region"]), p["region"])) == region_key]
        return (ranked or self._popular)[:6]

    # -- helpers ----------------------------------------------------------
    def _type_of(self, display: str) -> str:
        f = fold(display)
        node = self._walk(f)
        if node and node.ends:
            return self.entries[node.ends[0]].type
        return "Category Suggestions"

    def _norm_type(self, t):
        t = (t or "").strip()
        m = {"Brand Search": "Brand Suggestions", "Category Search": "Category Suggestions",
             "Nearby Search": "Nearby Suggestions", "POI Search": "POI Suggestions",
             "POI Suggestion": "POI Suggestions", "Address Suggestion": "Address Suggestions",
             "Location Search": "Category Suggestions"}
        if t in m:
            return m[t]
        return (t + "s") if t.endswith("Suggestion") else (t or "Category Suggestions")

    def _intent_type(self, t):
        return {"Category Search": "Category Suggestions",
                "Nearby Search": "Nearby Suggestions",
                "POI Search": "POI Suggestions",
                "Discovery Search": "Discovery Search"}.get(t, "Category Suggestions")

"""Unified knowledge base + phrase lexicon.

The lexicon is the workhorse behind the whole system: one accent-insensitive,
fuzzy-searchable index of every canonical phrase (POI names, brands, streets,
districts, cities, categories, aliases). It powers accent restoration, typo
correction, abbreviation grounding, and entity linking simultaneously.
"""
from __future__ import annotations

from bisect import bisect_left
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from rapidfuzz import fuzz, process

from ..core.text import accent_prefix_compatible, fold, has_accents, tokenize


@dataclass
class POI:
    poi_id: str
    source: str                       # "T1" | "T2" | "T4"
    name: str
    name_en: str = ""
    brand: str = ""
    category: str = ""                # canonical
    sub_category: str = ""
    address: str = ""
    ward: str = ""
    district: str = ""
    city: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    rating: Optional[float] = None
    review_count: int = 0
    popularity_score: float = 0.0
    price_level: Optional[int] = None
    opening_hours: str = ""
    attributes: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    aliases: List[str] = field(default_factory=list)
    description: str = ""

    @property
    def search_text(self) -> str:
        parts = [self.name, self.name_en, self.brand, self.category,
                 self.sub_category, self.district, self.city, self.description,
                 " ".join(self.attributes), " ".join(self.tags),
                 " ".join(self.aliases)]
        return " ".join(p for p in parts if p)

    def to_dict(self) -> dict:
        return {
            "poi_id": self.poi_id, "source": self.source, "name": self.name,
            "name_en": self.name_en, "brand": self.brand, "category": self.category,
            "sub_category": self.sub_category, "address": self.address,
            "ward": self.ward, "district": self.district, "city": self.city,
            "lat": self.lat, "lng": self.lng, "rating": self.rating,
            "review_count": self.review_count, "popularity_score": self.popularity_score,
            "price_level": self.price_level, "opening_hours": self.opening_hours,
            "attributes": self.attributes, "tags": self.tags,
            "aliases": self.aliases, "description": self.description,
        }


@dataclass
class AbbrevEntry:
    abbr: str
    expansion: str          # primary expansion (accented, natural)
    full: str               # raw normalized_form (may contain alternatives)
    type: str


@dataclass
class PhraseEntry:
    canonical: str          # accented, display-ready
    fold: str               # accent-insensitive lookup key
    type: str               # poi|brand|street|district|city|ward|category|alias
    weight: float = 1.0
    payload: Optional[str] = None   # e.g. poi_id


class PhraseLexicon:
    """Accent-insensitive + fuzzy phrase index."""

    def __init__(self) -> None:
        self.entries: List[PhraseEntry] = []
        self._by_fold: Dict[str, List[PhraseEntry]] = {}
        self._keys: List[str] = []          # unique fold keys for fuzzy search
        self._by_first_token: Dict[str, List[PhraseEntry]] = {}
        self._first_tokens: List[str] = []
        self.max_tokens = 1                 # longest registered phrase
        self._dirty = True

    def add(self, canonical: str, type_: str, weight: float = 1.0,
            payload: Optional[str] = None) -> None:
        canonical = (canonical or "").strip()
        if not canonical:
            return
        f = fold(canonical)
        if not f:
            return
        self.entries.append(PhraseEntry(canonical, f, type_, weight, payload))
        self._by_fold.setdefault(f, []).append(self.entries[-1])
        self.max_tokens = max(self.max_tokens, len(f.split()))
        self._dirty = True

    def _rebuild(self) -> None:
        self._keys = list(self._by_fold.keys())
        by_first: Dict[str, List[PhraseEntry]] = {}
        for entry in self.entries:
            first = entry.fold.split()[0] if entry.fold.split() else ""
            if first:
                by_first.setdefault(first, []).append(entry)
        self._by_first_token = by_first
        self._first_tokens = sorted(by_first)
        self._dirty = False

    def exact(self, fold_key: str, types: Optional[set] = None) -> List[PhraseEntry]:
        hits = self._by_fold.get(fold_key, [])
        if types:
            hits = [h for h in hits if h.type in types]
        return sorted(hits, key=lambda e: -e.weight)

    def fuzzy(self, query: str, types: Optional[set] = None, limit: int = 5,
              score_cutoff: float = 80.0) -> List[Tuple[PhraseEntry, float]]:
        """Return [(entry, score)] fuzzy-matched on the accent-folded key."""
        if self._dirty:
            self._rebuild()
        qf = fold(query)
        if not qf:
            return []
        matches = process.extract(
            qf, self._keys, scorer=fuzz.WRatio, limit=limit * 4,
            score_cutoff=score_cutoff)
        out: List[Tuple[PhraseEntry, float]] = []
        seen = set()
        for key, score, _ in matches:
            for e in self._by_fold.get(key, []):
                if types and e.type not in types:
                    continue
                sig = (e.canonical, e.type)
                if sig in seen:
                    continue
                seen.add(sig)
                out.append((e, float(score) + e.weight * 0.01))
        out.sort(key=lambda x: -x[1])
        return out[:limit]

    def first_token_prefix(self, prefix: str, types: Optional[set] = None,
                           limit: int = 64) -> List[PhraseEntry]:
        """Return live phrases whose first token starts with ``prefix``.

        The sorted first-token index makes progressive entity grounding cheap
        without turning incomplete input into an abbreviation dictionary. An
        explicitly accented prefix must agree with the canonical surface.
        """
        if self._dirty:
            self._rebuild()
        raw_tokens = tokenize(prefix)
        if not raw_tokens:
            return []
        raw = raw_tokens[0]
        key = fold(raw)
        if not key:
            return []

        start = bisect_left(self._first_tokens, key)
        best: Dict[Tuple[str, str, Optional[str]], PhraseEntry] = {}
        index = start
        while index < len(self._first_tokens):
            first = self._first_tokens[index]
            if not first.startswith(key):
                break
            for entry in self._by_first_token[first]:
                if types and entry.type not in types:
                    continue
                canonical_tokens = tokenize(entry.canonical)
                if not canonical_tokens:
                    continue
                if has_accents(raw) and not accent_prefix_compatible(
                        raw, canonical_tokens[0]):
                    continue
                signature = (fold(entry.canonical), entry.type, entry.payload)
                current = best.get(signature)
                if current is None or entry.weight > current.weight:
                    best[signature] = entry
            index += 1

        return sorted(
            best.values(),
            key=lambda entry: (
                -min(1.0, len(key) / max(1, len(entry.fold.split()[0]))),
                -entry.weight,
                entry.fold,
                entry.type,
            ),
        )[:limit]


@dataclass
class KnowledgeBase:
    pois: List[POI] = field(default_factory=list)
    poi_by_id: Dict[str, POI] = field(default_factory=dict)
    abbrev: Dict[str, AbbrevEntry] = field(default_factory=dict)   # keyed by fold(abbr)
    addresses: List[dict] = field(default_factory=list)
    popular_queries: List[dict] = field(default_factory=list)
    autocomplete_pairs: List[dict] = field(default_factory=list)
    attribute_taxonomy: List[dict] = field(default_factory=list)
    ranking_signals: List[dict] = field(default_factory=list)
    lexicon: PhraseLexicon = field(default_factory=PhraseLexicon)
    districts: Dict[str, str] = field(default_factory=dict)   # fold -> canonical
    cities: Dict[str, str] = field(default_factory=dict)
    brands: Dict[str, str] = field(default_factory=dict)
    streets: Dict[str, str] = field(default_factory=dict)
    token_vocab: Dict[str, str] = field(default_factory=dict)  # fold token -> accented
    # Data-derived semantic registries. Keys retain their natural surface form
    # (matching itself is accent-insensitive); values are canonical labels.
    category_terms: Dict[str, str] = field(default_factory=dict)
    attribute_terms: Dict[str, str] = field(default_factory=dict)
    dish_terms: Dict[str, str] = field(default_factory=dict)
    dish_heads: Dict[str, str] = field(default_factory=dict)
    dish_categories: Dict[str, str] = field(default_factory=dict)
    dish_head_categories: Dict[str, str] = field(default_factory=dict)
    dish_token_vocab: Dict[str, str] = field(default_factory=dict)

    @property
    def pois_t2(self) -> List[POI]:
        """POIs from the semantic-ranking track (rich attributes/descriptions)."""
        return [p for p in self.pois if p.source == "T2"]

    def get(self, poi_id: str) -> Optional[POI]:
        return self.poi_by_id.get(poi_id)

    def resolve(self, poi_id: str, surface: str = "") -> Optional[POI]:
        """Resolve a bare cross-track ID using the matched surface form.

        The challenge workbooks reuse IDs such as ``POI003``. Looking up only
        the bare ID can therefore return a place from the wrong track.
        """
        candidates = [p for p in self.pois if p.poi_id == poi_id]
        sf = fold(surface)
        if sf:
            for p in candidates:
                forms = [p.name, p.name_en, *p.aliases]
                if any(fold(form) == sf for form in forms if form):
                    return p
        return candidates[0] if candidates else self.get(poi_id)

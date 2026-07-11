"""P9 — real-time autocomplete & query-suggestion engine.

Deterministic and fast (no network / LLM on the hot path). For a typed prefix
it expands abbreviations, then generates candidates from: the curated
autocomplete pairs, popular queries, POI / brand / street prefixes, and
category + "near me / 24-7" templates. Candidates are typed and ranked by
source authority, query frequency, popularity and prefix exactness.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from ..constants import CATEGORY_QUERY_TERMS
from ..core.text import fold, tokenize
from ..data.kb import KnowledgeBase

_AMBIGUOUS = {"galaxy", "big c", "vinmec"}
# dish words surface as their own display label instead of the parent category
_DISH_DISPLAY = {"trà sữa": "Trà sữa", "bún chả": "Bún chả", "phở": "Phở",
                 "bún": "Bún", "pizza": "Pizza", "lẩu": "Lẩu"}
_SOURCE_WEIGHT = {"curated": 1.0, "popular": 0.9, "brand": 0.82, "poi": 0.76,
                  "address": 0.74, "template": 0.68}
# popular-query intent labels double as suggestion types in the dataset
_INTENT_TYPE = {"Category Search": "Category Suggestions",
                "Nearby Search": "Nearby Suggestions",
                "POI Search": "POI Suggestions",
                "Discovery Search": "Discovery Search"}


@dataclass
class Suggestion:
    text: str
    type: str
    score: float
    source: str
    meta: Dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return {"text": self.text, "type": self.type,
                "score": round(self.score, 4), "source": self.source}


class AutocompleteEngine:
    def __init__(self, kb: KnowledgeBase):
        self.kb = kb
        self._max_freq = max([1] + [int(p.get("query_frequency") or 0)
                                    for p in kb.autocomplete_pairs]
                             + [int(q.get("monthly_frequency") or 0)
                                for q in kb.popular_queries])

    # -- prefix pre-processing -------------------------------------------
    def _expand_prefix(self, prefix: str):
        """Expand full-token abbreviations; keep the last (partial) token as-is.

        Returns (expanded_fold, leading_category_or_None)."""
        toks = tokenize(prefix)
        out, category = [], None
        for i, t in enumerate(toks):
            ft = fold(t)
            is_last = i == len(toks) - 1
            if ft in self.kb.abbrev and not is_last:
                e = self.kb.abbrev[ft]
                out.append(e.expansion)
                if e.type == "category":
                    category = e.expansion
            elif ft in self.kb.abbrev and is_last and len(toks) == 1:
                e = self.kb.abbrev[ft]
                out.append(e.expansion)
                if e.type == "category":
                    category = e.expansion
            else:
                out.append(t)
        expanded = fold(" ".join(out))
        if category is None:
            for term, canon in CATEGORY_QUERY_TERMS.items():
                if expanded.startswith(fold(term)):
                    category = canon
                    break
        return expanded, category

    def _freq(self, v) -> float:
        try:
            return min(1.0, (int(v) or 0) / self._max_freq)
        except (ValueError, TypeError):
            return 0.0

    def _prefix_hit(self, cand_fold: str, pf: str) -> bool:
        """True if the candidate should surface for this prefix.

        Single-token prefix: some word in the candidate starts with it.
        Multi-token prefix: the prefix tokens appear, in order, each as a
        word-prefix in the candidate (so 'vincom dong k' hits 'Vincom Center
        Đồng Khởi'). Loose on purpose — ranking decides the final order.
        """
        if not pf:
            return False
        if cand_fold.startswith(pf):
            return True
        ctoks = cand_fold.split()
        ptoks = pf.split()
        if len(ptoks) == 1:
            return any(w.startswith(ptoks[0]) for w in ctoks)
        ci = 0
        for pt in ptoks:
            while ci < len(ctoks) and not ctoks[ci].startswith(pt):
                ci += 1
            if ci >= len(ctoks):
                return False
            ci += 1
        return True

    # -- main -------------------------------------------------------------
    def suggest(self, prefix: str, top_k: int = 6, lat: float = None,
                lng: float = None) -> dict:
        raw = prefix
        pf = fold(prefix)
        if not pf:
            return {"prefix": raw, "suggestion_type": None, "suggestions": []}
        expanded, category = self._expand_prefix(prefix)
        cands: List[Suggestion] = []

        # ambiguous brand typed alone
        if pf in _AMBIGUOUS or expanded in _AMBIGUOUS:
            names = self._brand_branches(pf if pf in _AMBIGUOUS else expanded)
            for i, nm in enumerate(names[:4]):
                cands.append(Suggestion(nm, "Ambiguous", 0.95 - 0.03 * i, "brand"))
            if cands:
                return self._finalize(raw, cands, top_k, forced_type="Ambiguous")

        # A. curated autocomplete pairs
        for row in self.kb.autocomplete_pairs:
            ip = fold(row.get("input_prefix", ""))
            text = str(row.get("suggestion_text", "")).strip()
            if not text:
                continue
            if ip.startswith(pf) or pf.startswith(ip) or self._prefix_hit(fold(text), expanded):
                # curated authority (its own score) leads; frequency is a tie-breaker
                s = _SOURCE_WEIGHT["curated"] + 0.35 * float(row.get("score") or 0) \
                    + 0.05 * self._freq(row.get("query_frequency"))
                cands.append(Suggestion(text, self._norm_type(row.get("suggestion_type")),
                                        s, "curated"))

        # B. popular queries
        for q in self.kb.popular_queries:
            text = str(q.get("query_text", "")).strip()
            if self._prefix_hit(fold(text), expanded) or self._prefix_hit(fold(text), pf):
                s = _SOURCE_WEIGHT["popular"] + 0.15 * self._freq(q.get("monthly_frequency"))
                cands.append(Suggestion(text, _INTENT_TYPE.get(q.get("intent_type"),
                             "Category Suggestions"), s, "popular"))

        # C. POI / brand / street prefixes
        for e in self.kb.lexicon.entries:
            if e.type not in ("poi", "brand", "street", "alias"):
                continue
            if not (self._prefix_hit(e.fold, expanded) or self._prefix_hit(e.fold, pf)):
                continue
            if e.type == "brand":
                typ, src = "Brand Suggestions", "brand"
            elif e.type == "street":
                typ, src = "Address Suggestions", "address"
            else:
                typ, src = "POI Suggestions", "poi"
            s = _SOURCE_WEIGHT[src] + 0.12 * min(1.0, e.weight / 2.0)
            if e.fold.startswith(pf):
                s += 0.08
            cands.append(Suggestion(e.canonical, typ, s, src, {"w": e.weight}))

        # D. category / dish + "near me / 24-7 / ngon" templates
        if category:
            disp = category
            for d, dd in _DISH_DISPLAY.items():
                if expanded.startswith(fold(d)):
                    disp = dd
                    break
            for tmpl, typ in [("{c} gần đây", "Category Suggestions"),
                              ("{c} gần nhất", "Nearby Suggestions"),
                              ("{c} ngon", "Discovery Search"),
                              ("{c} mở cửa 24/7", "Discovery Search")]:
                text = tmpl.format(c=disp)
                cands.append(Suggestion(text, typ,
                             _SOURCE_WEIGHT["template"] + 0.04, "template"))
            # category + trailing city partial, e.g. 'ks d' -> 'Khách sạn Đà Nẵng'
            tail = expanded[len(fold(category)):].strip()
            if tail:
                for cf, city in self.kb.cities.items():
                    if cf.startswith(tail) and len(tail) >= 1:
                        cands.append(Suggestion(f"{category} {city}",
                                     "Category Suggestions",
                                     _SOURCE_WEIGHT["template"] + 0.14, "template"))

        # F. compositional "<head> <location>" (location-aware suggestions):
        # e.g. 'ha noi an' -> Quán ăn Hà Nội; 'da lat check' -> ... ở Đà Lạt.
        loc = None
        for cf, name in list(self.kb.cities.items()) + list(self.kb.districts.items()):
            if cf in expanded:
                loc = name
                break
        landmark = None
        if not loc:
            for e in self.kb.lexicon.entries:
                if e.type in ("poi", "alias") and len(e.fold) >= 5 and e.fold in expanded:
                    landmark = e.canonical
                    break
        if loc or landmark:
            disp = category
            for d, dd in _DISH_DISPLAY.items():
                if fold(d) in expanded:
                    disp = dd
                    break
            heads: List[str] = []
            if disp:
                heads.append(disp)
            if "rooftop" in expanded:
                heads += ["Rooftop", "Quán bar rooftop"]
            if "check" in expanded:
                heads.append("Địa điểm check-in đẹp ở")
            if category == "Nhà hàng" or re.search(r"\ban\b|an dem", expanded):
                heads += ["Quán ăn", "Ăn đêm"]
            for h in heads:
                if loc:
                    txt = f"{h} {loc}" if h.endswith("ở") else f"{h} {loc}"
                else:
                    txt = f"{h} gần {landmark}"
                cands.append(Suggestion(re.sub(r"\s+", " ", txt).strip(),
                             "Discovery Search", _SOURCE_WEIGHT["template"] + 0.1,
                             "template"))

        # E. addresses. If the user typed a house number, keep THAT number and
        # match the rest against the street (streets recur at many numbers).
        import re as _re
        num_m = _re.match(r"^(\d+[a-z]?)\s+(.*)$", pf)
        street_pf = num_m.group(2) if num_m else pf
        if street_pf:
            for a in self.kb.addresses:
                street = a.get("street", "")
                if not street:
                    continue
                short = ", ".join(x for x in [street, a.get("district"),
                                              a.get("city")] if x)
                if self._prefix_hit(fold(street), street_pf) \
                        or self._prefix_hit(fold(short), street_pf):
                    text = f"{num_m.group(1)} {short}" if num_m else short
                    cands.append(Suggestion(text, "Address Suggestions",
                                 _SOURCE_WEIGHT["address"] + 0.06, "address"))

        return self._finalize(raw, cands, top_k)

    def _brand_branches(self, key: str) -> List[str]:
        """Distinct brand/line heads for an ambiguous term (not every branch)."""
        heads, seen = [], set()
        for p in self.kb.pois:
            if key in fold(p.name) or (p.brand and key in fold(p.brand)):
                head = p.brand or " ".join(p.name.split()[:2])
                if fold(head) not in seen:
                    seen.add(fold(head))
                    heads.append(head)
        return heads or [key.title()]

    def _norm_type(self, t: Optional[str]) -> str:
        t = (t or "").strip()
        mapping = {"Brand Search": "Brand Suggestions",
                   "Category Search": "Category Suggestions",
                   "Nearby Search": "Nearby Suggestions",
                   "POI Search": "POI Suggestions",
                   "POI Suggestion": "POI Suggestions",
                   "Address Suggestion": "Address Suggestions",
                   "Discovery Search": "Discovery Search"}
        if t in mapping:
            return mapping[t]
        if t.endswith("Suggestion"):
            return t + "s"
        return t or "Category Suggestions"

    def _finalize(self, raw, cands, top_k, forced_type=None) -> dict:
        best: Dict[str, Suggestion] = {}
        for c in cands:
            k = fold(c.text)
            if k not in best or c.score > best[k].score:
                best[k] = c
        ranked = sorted(best.values(), key=lambda c: -c.score)[:top_k]
        primary = forced_type or (ranked[0].type if ranked else None)
        return {"prefix": raw, "suggestion_type": primary,
                "suggestions": [s.to_dict() for s in ranked]}

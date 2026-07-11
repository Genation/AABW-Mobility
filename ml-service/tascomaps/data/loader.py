"""Load the three challenge workbooks into a single KnowledgeBase."""
from __future__ import annotations

import functools
import re
from typing import List, Optional

import pandas as pd

from .. import config
from ..constants import (ADJECTIVE_STOP, APPROVED_QUERY_SURFACES_V1,
                         ATTRIBUTE_TERMS, CATEGORY_CANON, CATEGORY_QUERY_TERMS,
                         canon_category, canon_city)
from ..core.text import fold, nfc, normalize
from .kb import AbbrevEntry, KnowledgeBase, POI, QuerySurface

# Folded surface forms that must never become a POI/alias/brand phrase, so a
# generic word like "nhà hàng" or "ngon" can't masquerade as a place name.
_GENERIC_FOLDS = (
    {fold(v) for v in CATEGORY_CANON.values()}
    | {fold(k) for k in CATEGORY_QUERY_TERMS}
    | {fold(v) for v in CATEGORY_QUERY_TERMS.values()}
    | {fold(a) for a in ADJECTIVE_STOP}
)


def _split_list(val) -> List[str]:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return []
    s = str(val).strip()
    if not s:
        return []
    parts = re.split(r"[;,|]", s)
    return [nfc(p.strip()) for p in parts if p.strip()]


def _num(val, cast=float):
    try:
        if val is None or (isinstance(val, float) and pd.isna(val)):
            return None
        return cast(val)
    except (ValueError, TypeError):
        return None


def _s(val) -> str:
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return ""
    return nfc(str(val).strip())


def _canon_city(raw: str) -> str:
    # Delegate to the shared identity so loaded POIs, the abbreviation
    # dictionary, and the query understander all agree on one spelling.
    return canon_city(raw)


def _extract_street(address: str) -> str:
    """Best-effort street name from a Vietnamese address string."""
    if not address:
        return ""
    first = address.split(",")[0].strip()
    # drop a leading house number
    first = re.sub(r"^\d+[A-Za-z]?\s+", "", first).strip()
    return first


# --------------------------------------------------------------------------
def _load_track1(xlsx, kb: KnowledgeBase) -> None:
    poi = pd.read_excel(xlsx, sheet_name="POI Dataset")
    for _, r in poi.iterrows():
        pid = _s(r["poi_id"]) or f"T1-{len(kb.pois)}"
        p = POI(
            poi_id=pid, source="T1",
            name=_s(r.get("name_vi")) or _s(r.get("name_en")),
            name_en=_s(r.get("name_en")),
            brand=_s(r.get("brand")),
            category=canon_category(_s(r.get("category"))),
            address=_s(r.get("address")),
            district=_s(r.get("district")),
            city=_canon_city(_s(r.get("city"))),
            lat=_num(r.get("latitude")), lng=_num(r.get("longitude")),
            rating=_num(r.get("rating")),
            opening_hours=_s(r.get("opening_hours")),
            aliases=_split_list(r.get("aliases")),
        )
        _register_poi(kb, p)

    addr = pd.read_excel(xlsx, sheet_name="Address Dataset")
    for _, r in addr.iterrows():
        d = {k: _s(r.get(k)) for k in
             ["address_id", "full_address", "house_number", "street", "ward",
              "district", "city", "aliases", "notes"]}
        d["latitude"] = _num(r.get("latitude"))
        d["longitude"] = _num(r.get("longitude"))
        kb.addresses.append(d)
        if d["street"]:
            kb.streets.setdefault(fold(d["street"]), d["street"])
            kb.lexicon.add(d["street"], "street", weight=1.0)
        if d["ward"]:
            kb.lexicon.add(d["ward"], "ward", weight=0.8)
        for al in _split_list(r.get("aliases")):
            kb.lexicon.add(al, "street", weight=0.6)

    abbr = pd.read_excel(xlsx, sheet_name="Abbreviation Dictionary")
    for _, r in abbr.iterrows():
        _add_abbrev(kb, _s(r.get("term")), _s(r.get("normalized_form")), _s(r.get("type")))


def _load_track2(xlsx, kb: KnowledgeBase) -> None:
    poi = pd.read_excel(xlsx, sheet_name="POI_Dataset")
    for _, r in poi.iterrows():
        pid = _s(r["poi_id"])
        p = POI(
            poi_id=pid, source="T2", name=_s(r.get("poi_name")),
            brand=_s(r.get("brand")),
            category=canon_category(_s(r.get("category"))),
            sub_category=_s(r.get("sub_category")),
            address=_s(r.get("address")),
            district=_s(r.get("district")),
            city=_canon_city(_s(r.get("city"))),
            lat=_num(r.get("latitude")), lng=_num(r.get("longitude")),
            rating=_num(r.get("rating")),
            review_count=_num(r.get("review_count"), int) or 0,
            popularity_score=_num(r.get("popularity_score")) or 0.0,
            price_level=_num(r.get("price_level"), int),
            opening_hours=_s(r.get("opening_hours")),
            attributes=_split_list(r.get("attributes")),
            tags=_split_list(r.get("tags")),
            description=_s(r.get("description")),
        )
        _register_poi(kb, p)
        st = _extract_street(p.address)
        if st:
            kb.streets.setdefault(fold(st), st)
            kb.lexicon.add(st, "street", weight=0.7)

    tax = pd.read_excel(xlsx, sheet_name="Attribute_Taxonomy")
    kb.attribute_taxonomy = tax.fillna("").to_dict(orient="records")
    sig = pd.read_excel(xlsx, sheet_name="Ranking_Signals")
    kb.ranking_signals = sig.fillna("").to_dict(orient="records")


def _load_track4(xlsx, kb: KnowledgeBase) -> None:
    poi = pd.read_excel(xlsx, sheet_name="POI Dataset")
    for _, r in poi.iterrows():
        pid = _s(r["poi_id"])
        p = POI(
            poi_id=pid, source="T4", name=_s(r.get("poi_name")),
            brand=_s(r.get("brand")),
            category=canon_category(_s(r.get("category"))),
            address=_s(r.get("address")),
            city=_canon_city(_s(r.get("city"))),
            lat=_num(r.get("latitude")), lng=_num(r.get("longitude")),
            rating=_num(r.get("rating")),
            review_count=_num(r.get("review_count"), int) or 0,
            popularity_score=_num(r.get("popularity_score")) or 0.0,
            tags=_split_list(r.get("tags")),
        )
        _register_poi(kb, p)

    ac = pd.read_excel(xlsx, sheet_name="Autocomplete Dataset")
    kb.autocomplete_pairs = ac.fillna("").to_dict(orient="records")
    pop = pd.read_excel(xlsx, sheet_name="Popular Queries")
    kb.popular_queries = pop.fillna("").to_dict(orient="records")
    abbr = pd.read_excel(xlsx, sheet_name="Abbreviation Dictionary")
    for _, r in abbr.iterrows():
        _add_abbrev(kb, _s(r.get("abbreviation")), _s(r.get("expanded_form")), _s(r.get("type")))


def _register_dish(kb: KnowledgeBase, raw: str,
                   category: str = "Nhà hàng") -> None:
    canonical = nfc(str(raw or "").strip())
    tokens = normalize(canonical).split()
    if not canonical or not tokens:
        return
    key = normalize(canonical)
    kb.dish_terms.setdefault(key, canonical)
    kb.dish_categories.setdefault(key, category)

    canonical_tokens = canonical.split()
    prefix_limit = 1 if len(tokens) == 1 else min(3, len(tokens) - 1)
    for size in range(1, prefix_limit + 1):
        head_key = fold(" ".join(tokens[:size]))
        canonical_head = " ".join(canonical_tokens[:size])
        if head_key and any(char.isalpha() for char in head_key):
            kb.dish_heads.setdefault(head_key, canonical_head)
            kb.dish_head_categories.setdefault(head_key, category)


def _load_track6_menu(xlsx, kb: KnowledgeBase) -> None:
    """Optionally load dish vocabulary from Track 6's Menu Dataset only."""
    if not xlsx or not xlsx.is_file():
        return
    try:
        menu = pd.read_excel(xlsx, sheet_name="Menu Dataset",
                             usecols=["dish_name"])
    except (FileNotFoundError, OSError, ValueError, ImportError):
        # Track 6 is an optional enrichment source. T2 sub-categories below
        # still provide a small corpus-derived fallback.
        return
    for value in menu["dish_name"].dropna():
        _register_dish(kb, _s(value), "Nhà hàng")


# --------------------------------------------------------------------------
def _register_poi(kb: KnowledgeBase, p: POI) -> None:
    # Namespace ids so the same code can hold all three POI sets without clashes.
    key = f"{p.source}:{p.poi_id}"
    if p.poi_id in kb.poi_by_id:            # keep bare id addressable too (T2 eval)
        kb.poi_by_id[key] = p
    else:
        kb.poi_by_id[p.poi_id] = p
    kb.pois.append(p)

    w = 1.0 + (p.popularity_score or 0) / 100.0
    if fold(p.name) not in _GENERIC_FOLDS:
        kb.lexicon.add(p.name, "poi", weight=w, payload=p.poi_id)
    if p.name_en and fold(p.name_en) not in _GENERIC_FOLDS:
        kb.lexicon.add(p.name_en, "alias", weight=w * 0.7, payload=p.poi_id)
    for al in p.aliases:
        if fold(al) not in _GENERIC_FOLDS:
            kb.lexicon.add(al, "alias", weight=w * 0.7, payload=p.poi_id)
    if p.brand and fold(p.brand) not in _GENERIC_FOLDS:
        kb.brands.setdefault(fold(p.brand), p.brand)
        kb.lexicon.add(p.brand, "brand", weight=w)
    if p.district:
        kb.districts.setdefault(fold(p.district), p.district)
        kb.lexicon.add(p.district, "district", weight=0.9)
    if p.city:
        kb.cities.setdefault(fold(p.city), p.city)
        kb.lexicon.add(p.city, "city", weight=0.9)


# Map an abbreviation `type` label to (entity_kind, lexicon_type).
# entity_kind drives typed hints in the understanding engine; lexicon_type
# controls whether/how the expansion joins the fuzzy phrase index. Non-place
# types (intent/nearby/amenity/synonym/...) are handled as markers, not text.
_ABBR_TYPE_MAP = {
    "district abbreviation": ("district", "district"),
    "district": ("district", "district"),
    "city abbreviation": ("city", "city"),
    "city alias": ("city", "city"),
    "city": ("city", "city"),
    "category abbreviation": ("category", "category"),
    "category": ("category", "category"),
    "category slang": ("category", "category"),
    "category alias": ("category", "category"),
    "brand abbreviation": ("brand", "brand"),
    "brand": ("brand", "brand"),
    "poi abbreviation": ("poi", "poi"),
    "street abbreviation": ("street", "street"),
    "area abbreviation": ("area", "street"),
    "alias": ("alias", "alias"),
    "accentless alias": ("alias", "alias"),
    "English alias": ("category", "category"),   # coffee/hotel/... -> category
    "amenity": ("amenity", None),
    "intent": ("intent", None),
    "intent phrase": ("intent", None),
    "nearby": ("nearby", None),
    "opening hour constraint": ("opening", None),
    "English term": ("preposition", None),
    "English phrase": ("attribute", None),
    "synonym": ("synonym", None),
    "informal/synonym": ("synonym", None),
}


def _add_abbrev(kb: KnowledgeBase, term: str, expansion: str, type_: str) -> None:
    if not term or not expansion:
        return
    # Alternatives use a spaced separator ("A / B"). Preserve slashes inside
    # canonical values such as 24/7.
    primary = re.split(r"\s+/\s+", expansion, maxsplit=1)[0].strip()
    kind, lex_type = _ABBR_TYPE_MAP.get(type_, ("synonym", None))
    # A dictionary may spell a city expansion freely ("Thành phố Hồ Chí Minh"),
    # but P6/P7 share one canonical spelling ("TP Hồ Chí Minh"). Canonicalize
    # the stored expansion so the abbreviation path agrees with loaded POIs.
    if kind == "city":
        primary = canon_city(primary) or primary
    entry = AbbrevEntry(abbr=term, expansion=primary, full=expansion, type=kind)
    key = fold(term)
    if key not in kb.abbrev:            # first (T1) definition wins on conflict
        kb.abbrev[key] = entry
    if lex_type:
        kb.lexicon.add(primary, lex_type, weight=0.8)


def _add_query_surface(kb: KnowledgeBase, entry: QuerySurface) -> None:
    key = fold(entry.surface)
    if not key or not kb.supports_query_surface(entry):
        return
    candidates = kb.query_surfaces.setdefault(key, [])
    if entry not in candidates:
        candidates.append(entry)


def _seed_query_surfaces(kb: KnowledgeBase) -> None:
    for values in APPROVED_QUERY_SURFACES_V1:
        _add_query_surface(kb, QuerySurface(*values))


def _seed_lexicon(kb: KnowledgeBase) -> None:
    """Seed canonical categories / cities / standard districts as phrases."""
    from ..constants import CATEGORY_CANON, CITY_CANON
    for canon in set(CATEGORY_CANON.values()):
        kb.lexicon.add(canon, "category", weight=0.5)
    for canon in set(CITY_CANON.values()):
        kb.cities.setdefault(fold(canon), canon)
        kb.lexicon.add(canon, "city", weight=0.85)
    for n in list(range(1, 13)):
        kb.districts.setdefault(f"quan {n}", f"Quận {n}")
        kb.lexicon.add(f"Quận {n}", "district", weight=0.85)


def _build_vocab(kb: KnowledgeBase) -> None:
    """Build the token vocabulary (fold token -> most frequent accented form)."""
    from collections import Counter
    counter: Counter = Counter()
    forms: dict = {}
    sources = [p.name for p in kb.pois] + list(kb.brands.values()) + \
        list(kb.districts.values()) + list(kb.cities.values()) + \
        list(kb.streets.values()) + [a.expansion for a in kb.abbrev.values()] + \
        [q.get("query_text", "") for q in kb.popular_queries]
    for phrase in sources:
        for tok in normalize(phrase).split(" "):
            if not tok:
                continue
            ft = fold(tok)
            counter[ft] += 1
            forms.setdefault(ft, Counter())[tok] += 1
    for ft, c in forms.items():
        kb.token_vocab[ft] = c.most_common(1)[0][0]


def _build_semantic_registries(kb: KnowledgeBase) -> None:
    """Build category/attribute term maps from configured data and taxonomy.

    Static synonyms remain useful seeds, but the understanding engine should
    automatically learn new canonical categories, sub-categories, and
    attributes when a new workbook is loaded.
    """
    def add(registry: dict, term: str, canonical: str) -> None:
        key = normalize(term)
        canonical = nfc(str(canonical or "").strip())
        if key and canonical:
            registry.setdefault(key, canonical)

    for term, canonical in CATEGORY_QUERY_TERMS.items():
        add(kb.category_terms, term, canonical)
    for term, canonical in CATEGORY_CANON.items():
        add(kb.category_terms, term, canonical)
    ambiguous_subcategories = set()
    for poi in kb.pois:
        add(kb.category_terms, poi.category, poi.category)
        # Sub-categories such as Book Cafe, Bún Chả, or Business Hotel are
        # useful query surfaces while their parent remains the stable category.
        if poi.sub_category:
            add(kb.category_terms, poi.sub_category, poi.category)
            key = normalize(poi.sub_category)
            value = (nfc(poi.sub_category.strip()), nfc(poi.category.strip()))
            existing = kb.sub_category_terms.get(key)
            if key in ambiguous_subcategories:
                continue
            if existing and tuple(fold(item) for item in existing) \
                    != tuple(fold(item) for item in value):
                kb.sub_category_terms.pop(key, None)
                ambiguous_subcategories.add(key)
            elif key and all(value):
                kb.sub_category_terms.setdefault(key, value)

    for term, canonical in ATTRIBUTE_TERMS.items():
        add(kb.attribute_terms, term, canonical)
    for row in kb.attribute_taxonomy:
        attribute = _s(row.get("attribute"))
        add(kb.attribute_terms, attribute, attribute)
    category_folds = [fold(term) for term in kb.category_terms]
    for poi in kb.pois:
        for attribute in poi.attributes:
            attribute_fold = fold(attribute)
            # Dataset attribute columns occasionally repeat the place type
            # itself (for example "thuốc" for a pharmacy).  Those terms are
            # category evidence, not useful ranking constraints.
            if any(re.search(r"(?<!\w)" + re.escape(attribute_fold) + r"(?!\w)", cat)
                   for cat in category_folds):
                continue
            add(kb.attribute_terms, attribute, attribute)


def _build_dish_registries(kb: KnowledgeBase) -> None:
    """Add conservative T2 fallback dishes and build dish token accents."""
    for poi in kb.pois_t2:
        if fold(poi.category) != fold("Nhà hàng"):
            continue
        sub_category = _s(poi.sub_category)
        if not sub_category:
            continue
        # Only treat a sub-category as food vocabulary when the independent
        # name/attribute/tag evidence also contains it. This admits Phở, Bún
        # Chả, Hotpot, etc. without turning generic "Restaurant" labels into
        # dishes.
        evidence = fold(" ".join([
            poi.name, " ".join(poi.attributes), " ".join(poi.tags),
        ]))
        sf = fold(sub_category)
        if re.search(r"(?<!\w)" + re.escape(sf) + r"(?!\w)", evidence):
            _register_dish(kb, sub_category, poi.category or "Nhà hàng")

    from collections import Counter
    forms = {}
    for canonical in kb.dish_terms.values():
        for token in normalize(canonical).split():
            ft = fold(token)
            forms.setdefault(ft, Counter())[token] += 1
    for token_fold, counts in forms.items():
        kb.dish_token_vocab[token_fold] = counts.most_common(1)[0][0]


@functools.lru_cache(maxsize=1)
def load_kb() -> KnowledgeBase:
    kb = KnowledgeBase()
    _load_track1(config.TRACK1_XLSX, kb)
    _load_track2(config.TRACK2_XLSX, kb)
    _load_track4(config.TRACK4_XLSX, kb)
    _load_track6_menu(config.TRACK6_XLSX, kb)
    _seed_lexicon(kb)
    _seed_query_surfaces(kb)
    _build_semantic_registries(kb)
    _build_dish_registries(kb)
    _build_vocab(kb)
    return kb


# --- gold evaluation sets --------------------------------------------------
def load_eval(track: str) -> List[dict]:
    if track == "T1":
        df = pd.read_excel(config.TRACK1_XLSX, sheet_name="Public Evaluation")
    elif track == "T2":
        df = pd.read_excel(config.TRACK2_XLSX, sheet_name="Public_Evaluation")
    elif track == "T4":
        df = pd.read_excel(config.TRACK4_XLSX, sheet_name="Public Evaluation")
    else:
        raise ValueError(track)
    return df.fillna("").to_dict(orient="records")

"""Optional LLM boost layer (hybrid mode).

Each function takes the deterministic result and *refines* it, grounded on KB
evidence. If the LLM is unavailable or errors, the deterministic result is
returned unchanged, so behaviour never regresses below the offline core.
"""
from __future__ import annotations

import json
import math
import re
from functools import lru_cache
from typing import Dict, List

from ..constants import INTENTS
from rapidfuzz import fuzz

from ..core.text import fold
from ..core.understand import QueryUnderstanding, understand
from ..data.kb import KnowledgeBase
from . import client

_UNDERSTAND_SYS = (
    "You are a Vietnamese map-search query understanding engine for Tasco Maps. "
    "Given a raw (often noisy) search query, output a JSON object with keys: "
    "normalized_query (clean, accented, canonical Vietnamese), intent (one of: "
    + ", ".join(INTENTS) + "), entities (object with any of: poi_name, brand, "
    "category, district, city, street, ward, house_number, attributes (array), "
    "reference_poi, location, latitude, longitude, action, dish, price_max, "
    "open_after, open_24h, candidates (array), ambiguity_type), and confidence "
    "(0-1). Expand abbreviations, restore accents, fix typos. Output ONLY JSON."
)

_STRING_ENTITIES = {
    "poi_name", "brand", "category", "district", "city", "street", "ward",
    "house_number", "reference_poi", "reference_area", "reference_address",
    "location", "action", "dish", "open_after", "open_before", "origin",
    "destination", "destination_poi", "destination_category", "route_destination",
    "ambiguity_type", "attribute",
}
_NUMBER_ENTITIES = {"latitude", "longitude", "price_max", "rating_min"}
_BOOL_ENTITIES = {"open_late", "open_24h", "open_now"}
_LIST_ENTITIES = {
    "attributes", "excluded_attributes", "candidates", "amenities",
}
_TIME_VALUE_RE = re.compile(r"^(?:[01]\d|2[0-3]):[0-5]\d$")


def _contains_phrase(haystack: str, needle: str) -> bool:
    """Accent-insensitive phrase containment with lexical boundaries."""
    target = fold(needle)
    return bool(target and re.search(
        r"(?<!\w)" + re.escape(target) + r"(?!\w)", fold(haystack)))


def _canonical_grounding(value: str, forms, raw_query: str = "") -> str | None:
    """Canonicalize against corpus forms or retain a value quoted by the user."""
    target = fold(value)
    if not target:
        return None
    best = None
    for surface, canonical in forms:
        candidate = fold(surface)
        if not candidate:
            continue
        if target == candidate:
            return canonical
        length_ratio = min(len(target), len(candidate)) / max(len(target), len(candidate))
        score = fuzz.token_sort_ratio(target, candidate)
        if length_ratio >= 0.8 and score >= 92 and (best is None or score > best[0]):
            best = (score, canonical)
    if best:
        return best[1]
    # Open-vocabulary locations/brands are safe only when copied from the raw
    # query, never when introduced solely by the model.
    if raw_query and _contains_phrase(raw_query, target):
        return value
    return None


def _validated_llm_result(data, kb: KnowledgeBase | None = None,
                          raw_query: str = "") \
        -> tuple[str, str, dict, float] | None:
    """Validate the untrusted model payload before it can replace P6 output."""
    if not isinstance(data, dict):
        return None
    normalized = data.get("normalized_query")
    intent = data.get("intent")
    entities = data.get("entities")
    try:
        confidence = float(data.get("confidence"))
    except (TypeError, ValueError):
        return None
    if (not isinstance(normalized, str) or not normalized.strip()
            or len(normalized) > 512 or intent not in INTENTS
            or not isinstance(entities, dict)
            or not math.isfinite(confidence) or not 0.0 <= confidence <= 1.0):
        return None

    allowed = _STRING_ENTITIES | _NUMBER_ENTITIES | _BOOL_ENTITIES | _LIST_ENTITIES
    if any(key not in allowed for key in entities):
        return None
    clean = {}
    for key, value in entities.items():
        if value in (None, "", [], {}):
            continue
        if key in _STRING_ENTITIES:
            if not isinstance(value, str) or len(value) > 256:
                return None
            value = value.strip()
            if not value:
                return None
            if key in {"open_after", "open_before"} and not _TIME_VALUE_RE.match(value):
                return None
            clean[key] = value
        elif key in _NUMBER_ENTITIES:
            if isinstance(value, bool):
                return None
            try:
                number = float(value)
            except (TypeError, ValueError):
                return None
            if not math.isfinite(number):
                return None
            clean[key] = number
        elif key in _BOOL_ENTITIES:
            if not isinstance(value, bool):
                return None
            clean[key] = value
        else:
            if (not isinstance(value, list) or len(value) > 20
                    or any(not isinstance(item, str) or len(item) > 256 for item in value)):
                return None
            values = [item.strip() for item in value]
            if any(not item for item in values):
                return None
            clean[key] = values

    lat, lng = clean.get("latitude"), clean.get("longitude")
    if (lat is None) != (lng is None):
        return None
    if lat is not None and not (-90 <= lat <= 90 and -180 <= lng <= 180):
        return None
    if clean.get("price_max", 0) < 0 or not 0 <= clean.get("rating_min", 0) <= 5:
        return None

    if kb is not None:
        poi_forms = [
            (form, poi.name)
            for poi in kb.pois
            for form in (poi.name, poi.name_en, *poi.aliases)
            if form
        ]
        grounding = {
            "poi_name": poi_forms,
            "reference_poi": poi_forms,
            "destination_poi": poi_forms,
            "brand": [(value, value) for value in kb.brands.values()],
            "category": [(surface, canonical)
                         for surface, canonical in kb.category_terms.items()],
            "destination_category": [(surface, canonical)
                                      for surface, canonical in kb.category_terms.items()],
            "district": [(value, value) for value in kb.districts.values()],
            "city": [(value, value) for value in kb.cities.values()],
            "street": [(value, value) for value in kb.streets.values()],
            "ward": [(value, value) for value in {
                *(poi.ward for poi in kb.pois if poi.ward),
                *(row.get("ward", "") for row in kb.addresses if row.get("ward")),
            }],
        }
        for key, forms in grounding.items():
            if not clean.get(key):
                continue
            canonical = _canonical_grounding(clean[key], forms, raw_query)
            if canonical is None:
                return None
            clean[key] = canonical
        if clean.get("location") and clean["location"] != "current_location":
            location_forms = [*poi_forms,
                              *((value, value) for value in kb.districts.values()),
                              *((value, value) for value in kb.cities.values())]
            canonical = _canonical_grounding(clean["location"], location_forms, raw_query)
            if canonical is None:
                return None
            clean["location"] = canonical
        place_forms = [
            *poi_forms,
            *((value, value) for value in kb.districts.values()),
            *((value, value) for value in kb.cities.values()),
            *((value, value) for value in kb.streets.values()),
            *((surface, canonical) for surface, canonical in kb.category_terms.items()),
        ]
        for key in ("reference_area", "reference_address", "origin", "destination",
                    "route_destination"):
            if not clean.get(key):
                continue
            canonical = _canonical_grounding(clean[key], place_forms, raw_query)
            if canonical is None:
                return None
            clean[key] = canonical
        attribute_forms = list(kb.attribute_terms.items())
        for key in ("attribute", "dish"):
            if clean.get(key):
                canonical = _canonical_grounding(clean[key], attribute_forms, raw_query)
                if canonical is None:
                    return None
                clean[key] = canonical
        for key in ("attributes", "excluded_attributes", "amenities"):
            if not clean.get(key):
                continue
            values = []
            for value in clean[key]:
                canonical = _canonical_grounding(value, attribute_forms, raw_query)
                if canonical is None:
                    return None
                values.append(canonical)
            clean[key] = list(dict.fromkeys(values))
        if clean.get("action") and clean["action"] != "directions":
            return None
    return normalized.strip(), intent, clean, confidence


def _kb_hints(query: str, kb: KnowledgeBase, det: QueryUnderstanding) -> str:
    hints: List[str] = []
    fz = kb.lexicon.fuzzy(query, limit=5, score_cutoff=75)
    if fz:
        hints.append("KB candidates: " + "; ".join(
            f"{e.canonical}({e.type})" for e, _ in fz))
    if det.debug.get("abbrev"):
        hints.append("Abbreviations: " + json.dumps(det.debug["abbrev"],
                                                     ensure_ascii=False))
    hints.append("Deterministic guess: " + json.dumps(det.to_dict(),
                                                       ensure_ascii=False))
    return "\n".join(hints)


def _equivalent_value(left, right) -> bool:
    if isinstance(left, bool) or isinstance(right, bool):
        return left is right
    if isinstance(left, (int, float)) and isinstance(right, (int, float)):
        return math.isclose(float(left), float(right), rel_tol=1e-6, abs_tol=1e-6)
    if isinstance(left, list) or isinstance(right, list):
        a = left if isinstance(left, list) else [left]
        b = right if isinstance(right, list) else [right]
        return {fold(str(value)) for value in a} == {fold(str(value)) for value in b}
    return fold(str(left)) == fold(str(right))


def _entity_already_supported(key: str, value, entities: dict) -> bool:
    if key in entities:
        return _equivalent_value(value, entities[key])
    attribute_family = {"attribute", "attributes", "amenities"}
    if key in attribute_family and attribute_family & entities.keys():
        existing = []
        for name in attribute_family & entities.keys():
            item = entities[name]
            existing.extend(item if isinstance(item, list) else [item])
        proposed = value if isinstance(value, list) else [value]
        return all(any(fold(str(candidate)) == fold(str(current))
                       for current in existing) for candidate in proposed)
    return False


def _raw_supports_entity(key: str, value, query: str, kb: KnowledgeBase) -> bool:
    """Require evidence in the user's text for every model-added semantic slot."""
    qf = fold(query)
    values = value if isinstance(value, list) else [value]
    if key in _BOOL_ENTITIES:
        patterns = {
            "open_late": r"\b(mo khuya|mo muon|open late|an dem|khuya)\b",
            "open_24h": r"\b(24/?7|24h|ca ngay)\b",
            "open_now": r"\b(dang mo|con mo|open now)\b",
        }
        return bool(value is True and re.search(patterns[key], qf))
    if key == "action":
        return bool(re.search(r"\b(chi duong|duong di|navigate|directions)\b", qf))
    if key in _NUMBER_ENTITIES or key in {"house_number", "open_after", "open_before"}:
        markers = {
            "latitude": r"-?\d+(?:[.,]\d+)?\s*[,; ]\s*-?\d+(?:[.,]\d+)?",
            "longitude": r"-?\d+(?:[.,]\d+)?\s*[,; ]\s*-?\d+(?:[.,]\d+)?",
            "price_max": r"\b(duoi|under|gia|price|max)\b|\d\s*(?:k|vnd|d)\b",
            "rating_min": r"\b(rating|danh gia|sao)\b",
            "house_number": r"(?:^|\bso\s+)\d+[a-z]?(?:[/.-]\d+)?\b",
            "open_after": r"\b(mo|open|sau|after)\b.*\d",
            "open_before": r"\b(mo|open|truoc|before)\b.*\d",
        }
        return bool(re.search(markers[key], qf))

    semantic_forms = []
    for surface, canonical in kb.category_terms.items():
        semantic_forms.append((surface, canonical))
    for surface, canonical in kb.attribute_terms.items():
        semantic_forms.append((surface, canonical))
    semantic_forms.extend((value, value) for value in kb.brands.values())
    semantic_forms.extend((value, value) for value in kb.districts.values())
    semantic_forms.extend((value, value) for value in kb.cities.values())
    semantic_forms.extend((value, value) for value in kb.streets.values())
    for poi in kb.pois:
        semantic_forms.extend((form, poi.name)
                              for form in (poi.name, poi.name_en, *poi.aliases) if form)

    for item in values:
        target = fold(item)
        if target and _contains_phrase(qf, target):
            continue
        supported = any(
            fold(canonical) == target and _contains_phrase(qf, surface)
            for surface, canonical in semantic_forms if surface and canonical)
        if not supported:
            return False
    return True


def _grounded_refinement(query: str, det: QueryUnderstanding, intent: str,
                         entities: dict, normalized: str, kb: KnowledgeBase) -> bool:
    if intent != det.intent and det.intent != "Ambiguous":
        return False
    if fuzz.token_set_ratio(
            fold(normalized), fold(f"{query} {det.normalized_query}")) < 50:
        return False
    # The display normalization is also a search view, so it must preserve all
    # deterministic numeric/time constraints even when the model omits them
    # from its structured entity object. Re-parse it through the auditable core
    # and compare canonical values (for example 50k == 50.000đ).
    normalized_det = understand(normalized, kb)
    constraint_keys = (
        _NUMBER_ENTITIES
        | _BOOL_ENTITIES
        | {"house_number", "open_after", "open_before", "price_level_max"}
    )
    deterministic_entities = det.entities or {}
    normalized_entities = normalized_det.entities or {}
    for key in constraint_keys:
        before_present = key in deterministic_entities
        after_present = key in normalized_entities
        if before_present != after_present:
            return False
        if before_present and not _equivalent_value(
                deterministic_entities[key], normalized_entities[key]):
            return False
    for key, value in entities.items():
        if _entity_already_supported(key, value, det.entities or {}):
            continue
        # Never let a model revise or invent numeric constraints. The
        # deterministic parser supplies the auditable value; mere presence of
        # a number/marker in the query is not evidence for the model's number.
        if key in (_NUMBER_ENTITIES | {"house_number", "open_after", "open_before"}):
            return False
        if not _raw_supports_entity(key, value, query, kb):
            return False
    return True


def boost_understanding(query: str, kb: KnowledgeBase) -> QueryUnderstanding:
    det = understand(query, kb)
    if not client.is_available():
        return det
    user = (f"Query: {query}\n{_kb_hints(query, kb, det)}\n\n"
            "Return the corrected JSON.")
    validated = _validated_llm_result(
        client.chat_json(_UNDERSTAND_SYS, user), kb, raw_query=query)
    if validated is None:
        return det
    normalized, intent, ents, confidence = validated
    if not _grounded_refinement(query, det, intent, ents, normalized, kb):
        return det
    merged_entities = dict(det.entities or {})
    merged_entities.update(ents)
    return QueryUnderstanding(
        raw=query,
        normalized_query=normalized,
        intent=intent, entities=merged_entities,
        confidence=confidence,
        source="llm", debug=det.debug)


_SUGGEST_SYS = (
    "You are a Vietnamese map-search autocomplete engine. Given a typed prefix "
    "and candidate suggestions, return JSON {\"suggestions\": [{\"text\":..., "
    "\"type\":...}]} with 3-6 realistic, ranked completions. Types: Brand "
    "Suggestions, Category Suggestions, POI Suggestions, Nearby Suggestions, "
    "Address Suggestions, Discovery Search, Ambiguous. Use natural accented "
    "Vietnamese, expand abbreviations, honour the user's intent. JSON only."
)

_SUGGESTION_TYPES = {
    "Brand Suggestions", "Category Suggestions", "POI Suggestions",
    "Nearby Suggestions", "Address Suggestions", "Discovery Search", "Ambiguous",
}


def smart_suggestions(prefix: str, det: dict, kb: KnowledgeBase) -> dict:
    if not client.is_available():
        return det
    user = (f"Prefix: {prefix}\nDeterministic candidates: "
            f"{json.dumps(det.get('suggestions', []), ensure_ascii=False)}\n"
            "Return improved ranked suggestions as JSON.")
    data = client.chat_json(_SUGGEST_SYS, user, max_tokens=400)
    if not isinstance(data, dict) or not isinstance(data.get("suggestions"), list):
        return det
    sugg = []
    for item in data["suggestions"][:6]:
        if not isinstance(item, dict):
            continue
        value = item.get("text")
        kind = item.get("type", "Category Suggestions")
        if not isinstance(value, str) or not value.strip() or len(value) > 256:
            continue
        if kind not in _SUGGESTION_TYPES:
            kind = "Category Suggestions"
        sugg.append({
            "text": value.strip(), "type": kind,
            "score": round(0.99 - 0.03 * len(sugg), 3), "source": "llm",
        })
    if not sugg:
        return det
    return {"prefix": prefix, "suggestion_type": sugg[0]["type"], "suggestions": sugg}


_EXPLAIN_SYS = (
    "You explain, in one short Vietnamese sentence, why a place matches a search "
    "query. Return JSON {\"reason\": \"...\"}. Be concrete and concise."
)


def explain(query: str, poi: dict) -> str:
    if not client.is_available():
        return ""
    data = client.chat_json(
        _EXPLAIN_SYS,
        f"Query: {query}\nPlace: {json.dumps(poi, ensure_ascii=False)}",
        max_tokens=120)
    if isinstance(data, dict):
        return str(data.get("reason", ""))
    return ""

"""Optional LLM refinement of RouteMate need prediction.

Given the trip context and the deterministic needs, the model may reorder or add
sensible categories. Every returned category is grounded to a canonical KB
category; anything ungrounded is dropped. On any failure the deterministic list
is returned unchanged, so behaviour never regresses below the offline core.
"""
from __future__ import annotations

import json
from typing import Dict, List, Optional

from ..core.needs import NeedSpec, _CATEGORY_NEED
from ..core.text import fold
from ..data.kb import KnowledgeBase
from . import client

_SYS = (
    "You are a trip-assistant for a Vietnamese self-drive car rental. Given a "
    "journey (vehicle type, distance, duration) and an optional user request, "
    "list the categories of places the driver will likely need along the way, "
    "most important first. Respond ONLY as JSON: {\"needs\": [\"<category>\", ...]}. "
    "Allowed categories: Cây xăng, Trạm sạc điện, Nhà hàng, Quán cà phê, Khách sạn. "
    "An electric vehicle needs Trạm sạc điện (never Cây xăng); a petrol car needs "
    "Cây xăng (never Trạm sạc điện)."
)


def _canonical_categories(kb: KnowledgeBase) -> Dict[str, str]:
    """fold(surface) -> canonical, for the categories RouteMate supports."""
    out: Dict[str, str] = {}
    for canonical in _CATEGORY_NEED:            # the 5 supported canonicals
        out[fold(canonical)] = canonical
    for surface, canonical in (kb.category_terms or {}).items():
        if canonical in _CATEGORY_NEED:
            out[fold(surface)] = canonical
    return out


def boost_needs(trip_context: dict, deterministic: List[NeedSpec],
                kb: KnowledgeBase) -> List[NeedSpec]:
    if not client.is_available():
        return deterministic
    user = ("Trip: " + json.dumps(trip_context, ensure_ascii=False)
            + "\nDeterministic guess: "
            + json.dumps([n.category for n in deterministic], ensure_ascii=False)
            + "\nReturn the JSON.")
    data = client.chat_json(_SYS, user, max_tokens=200)
    if not isinstance(data, dict) or not isinstance(data.get("needs"), list):
        return deterministic

    grounding = _canonical_categories(kb)
    # Preserve any request-specific attributes the deterministic pass found.
    attrs_by_category = {n.category: n.required_attrs for n in deterministic}
    why_by_category = {n.category: n.why for n in deterministic}

    refined: List[NeedSpec] = []
    seen = set()
    for raw in data["needs"]:
        if not isinstance(raw, str):
            continue
        canonical = grounding.get(fold(raw))
        if canonical is None or canonical in seen:
            continue
        seen.add(canonical)
        need_key, label = _CATEGORY_NEED.get(canonical, ("custom", canonical))
        refined.append(NeedSpec(
            need_key=need_key, category=canonical, label=label,
            priority=len(refined),
            required_attrs=attrs_by_category.get(canonical, []),
            why=why_by_category.get(canonical, "Gợi ý theo hành trình")))

    return refined or deterministic

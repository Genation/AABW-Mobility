"""RouteMate need prediction — what will the traveler need on this journey?

Deterministic and offline. Gating is purely distance-based (per product spec):

* rest (café / restaurant) — always offered;
* fuel / charging — only when the trip is longer than ``FUEL_MIN_KM``;
* hotel — only when the trip is longer than ``HOTEL_MIN_KM``.

Fuel/charging and hotel needs carry a "target distance along the route" plus
slider bounds so the UI can let the driver choose where to stop (default 100 km
for fuel/charging, 200 km for a hotel).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict, List, Optional

from .understand import QueryUnderstanding  # noqa: F401 (kept for signature compat)

FUEL_MIN_KM = 100.0
HOTEL_MIN_KM = 200.0
FUEL_DEFAULT_KM = 100.0
HOTEL_DEFAULT_KM = 200.0


@dataclass
class NeedSpec:
    need_key: str                 # "rest" | "fuel" | "charge" | "hotel"
    categories: List[str]         # one or more canonical KB categories
    label: str                    # human display (Vietnamese)
    priority: int = 0             # display order (lower first)
    target_km: Optional[float] = None     # preferred distance along the route
    slider: Optional[Dict[str, float]] = None   # {default,min,max} for the UI
    why: str = ""
    required_attrs: List[str] = field(default_factory=list)

    @property
    def category(self) -> str:
        return self.categories[0] if self.categories else ""

    def to_dict(self) -> dict:
        return {
            "need_key": self.need_key,
            "categories": self.categories,
            "category": self.category,
            "label": self.label,
            "priority": self.priority,
            "target_km": self.target_km,
            "slider": self.slider,
            "why": self.why,
            "required_attrs": self.required_attrs,
        }


def _is_ev(vehicle_type: Optional[str]) -> bool:
    vehicle = (vehicle_type or "").strip().lower()
    return vehicle in {"ev", "electric", "electric_vehicle", "xe điện", "xe dien"}


def predict_needs(vehicle_type: Optional[str], distance_km: float,
                  duration_min: float = 0.0,
                  understanding: Optional[QueryUnderstanding] = None) -> List[NeedSpec]:
    """Distance-gated need list for a trip of ``distance_km`` kilometres."""
    needs: List[NeedSpec] = []

    # 1) Café and restaurant are always relevant, as separate buckets. On a long
    #    trip they also get a distance slider (where along the way to stop).
    long_trip = distance_km > FUEL_MIN_KM

    def rest_slider(fraction: float):
        if not long_trip:
            return None, None
        target = round(min(max(20.0, distance_km * fraction), distance_km))
        return target, {"default": target, "min": 20, "max": round(distance_km)}

    cafe_target, cafe_slider = rest_slider(0.25)
    needs.append(NeedSpec(
        need_key="cafe", categories=["Quán cà phê"], label="Cà phê",
        priority=0, target_km=cafe_target, slider=cafe_slider,
        why="Nghỉ chân, cà phê dọc đường"))
    food_target, food_slider = rest_slider(0.5)
    needs.append(NeedSpec(
        need_key="food", categories=["Nhà hàng"], label="Nhà hàng / quán ăn",
        priority=1, target_km=food_target, slider=food_slider,
        why="Ăn uống dọc đường"))

    # 2) Fuel / charging for trips over 100 km, with a distance slider.
    if distance_km > FUEL_MIN_KM:
        default = round(min(FUEL_DEFAULT_KM, distance_km))
        bounds = {"default": default, "min": 20, "max": round(distance_km)}
        if _is_ev(vehicle_type):
            needs.append(NeedSpec(
                need_key="charge", categories=["Trạm sạc điện"],
                label="Trạm sạc điện", priority=2, target_km=default,
                slider=bounds, why="Sạc pin trên đường"))
        else:
            needs.append(NeedSpec(
                need_key="fuel", categories=["Cây xăng"],
                label="Cây xăng", priority=2, target_km=default,
                slider=bounds, why="Đổ xăng trên đường"))

    # 3) Hotel for trips over 200 km, with a distance slider.
    if distance_km > HOTEL_MIN_KM:
        default = round(min(HOTEL_DEFAULT_KM, distance_km))
        needs.append(NeedSpec(
            need_key="hotel", categories=["Khách sạn"], label="Khách sạn",
            priority=3, target_km=default,
            slider={"default": default, "min": 100, "max": round(distance_km)},
            why="Nghỉ đêm nếu đi xa"))

    needs.sort(key=lambda spec: spec.priority)
    return needs

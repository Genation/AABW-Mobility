"""Synthetic en-route POIs for the RouteMate showcase corridor.

The challenge datasets only contain POIs *inside* cities, so a corridor between
two cities finds nothing on the road between them. To let RouteMate demonstrate
the long-distance road-trip story (fuel / charging / rest / hotel while driving),
this module seeds a small, hand-placed set of realistic stops along ONE corridor:
Hồ Chí Minh City → Đà Lạt (national highway QL20, via Dầu Giây, Định Quán,
Madagui, Bảo Lộc, Di Linh, Đức Trọng).

These POIs are tagged ``source="RM-seed"`` and are loaded ONLY into RouteMate's
candidate pool (see ``engines/corridor.py``). They never enter ``load_kb()``, so
the P6/P7/P9 engines and the Track-4 evaluation are completely unaffected.
"""
from __future__ import annotations

from functools import lru_cache
from typing import List

from .kb import POI

# (name, category, brand, lat, lng, rating, review_count, popularity, city, tags)
# Coordinates lie along the real QL20 corridor between HCM and Đà Lạt.
_SEED = [
    # --- fuel (petrol) -----------------------------------------------------
    ("Cây xăng Petrolimex Long Thành", "Cây xăng", "Petrolimex",
     10.7910, 107.0020, 4.2, 180, 62.0, "Đồng Nai", ["24/7", "toilet"]),
    ("Cây xăng PV Oil Dầu Giây", "Cây xăng", "PV Oil",
     10.9320, 107.1520, 4.0, 95, 48.0, "Đồng Nai", ["toilet", "bãi đỗ xe"]),
    ("Cây xăng Petrolimex Định Quán", "Cây xăng", "Petrolimex",
     11.1900, 107.3600, 4.1, 120, 51.0, "Đồng Nai", ["24/7"]),
    ("Cây xăng Bảo Lộc", "Cây xăng", "Petrolimex",
     11.5490, 107.8080, 3.9, 76, 40.0, "Lâm Đồng", ["toilet"]),
    ("Cây xăng Đức Trọng", "Cây xăng", "PV Oil",
     11.7520, 108.3700, 4.0, 60, 38.0, "Lâm Đồng", ["bãi đỗ xe"]),
    # --- charging (EV) -----------------------------------------------------
    ("Trạm sạc VinFast Long Thành", "Trạm sạc điện", "VinFast",
     10.7950, 107.0060, 4.5, 210, 78.0, "Đồng Nai", ["ổ cắm", "quán cà phê"]),
    ("Trạm sạc VinFast Dầu Giây", "Trạm sạc điện", "VinFast",
     10.9360, 107.1560, 4.4, 150, 70.0, "Đồng Nai", ["ổ cắm", "toilet"]),
    ("Trạm sạc EV One Madagui", "Trạm sạc điện", "EV One",
     11.3600, 107.6200, 4.3, 88, 55.0, "Lâm Đồng", ["ổ cắm"]),
    ("Trạm sạc VinFast Bảo Lộc", "Trạm sạc điện", "VinFast",
     11.5520, 107.8120, 4.4, 132, 66.0, "Lâm Đồng", ["ổ cắm", "toilet"]),
    ("Trạm sạc VinFast Đức Trọng", "Trạm sạc điện", "VinFast",
     11.7560, 108.3740, 4.5, 97, 60.0, "Lâm Đồng", ["ổ cắm", "bãi đỗ xe"]),
    # --- rest stops / cafés ------------------------------------------------
    ("Trạm dừng chân Tâm Châu", "Quán cà phê", "Tâm Châu",
     11.3620, 107.6240, 4.4, 320, 82.0, "Lâm Đồng",
     ["toilet", "bãi đỗ xe", "24/7"]),
    ("Highlands Coffee Dầu Giây", "Quán cà phê", "Highlands Coffee",
     10.9300, 107.1500, 4.3, 260, 74.0, "Đồng Nai", ["wifi", "bãi đỗ xe"]),
    ("Cà phê Mê Linh Bảo Lộc", "Quán cà phê", "",
     11.5300, 107.7900, 4.6, 410, 88.0, "Lâm Đồng",
     ["view đẹp", "check-in", "wifi"]),
    ("Trạm dừng chân Định Quán", "Quán cà phê", "",
     11.1880, 107.3560, 4.0, 140, 50.0, "Đồng Nai", ["toilet", "bãi đỗ xe"]),
    # --- restaurants -------------------------------------------------------
    ("Nhà hàng Hoa Viên Madagui", "Nhà hàng", "",
     11.3580, 107.6180, 4.2, 190, 58.0, "Lâm Đồng",
     ["bãi đỗ xe", "phù hợp gia đình"]),
    ("Quán cơm Phương Nam Định Quán", "Nhà hàng", "",
     11.1920, 107.3640, 4.1, 220, 54.0, "Đồng Nai", ["bãi đỗ xe"]),
    ("Nhà hàng Đồng Quê Bảo Lộc", "Nhà hàng", "",
     11.5460, 107.8040, 4.3, 175, 60.0, "Lâm Đồng",
     ["phù hợp gia đình", "phòng riêng"]),
    # --- hotels ------------------------------------------------------------
    ("Khách sạn Seri Bảo Lộc", "Khách sạn", "",
     11.5480, 107.8100, 4.2, 130, 57.0, "Lâm Đồng",
     ["bãi đỗ xe", "wifi"]),
    ("Madagui Resort", "Khách sạn", "",
     11.3560, 107.6160, 4.4, 260, 72.0, "Lâm Đồng",
     ["hồ bơi", "phù hợp gia đình", "bãi đỗ xe"]),
    ("Khách sạn Đức Trọng Palace", "Khách sạn", "",
     11.7540, 108.3720, 4.1, 90, 46.0, "Lâm Đồng", ["wifi", "bãi đỗ xe"]),
]


@lru_cache(maxsize=1)
def seed_corridor_pois() -> List[POI]:
    """Return the hand-placed HCM→Đà Lạt corridor POIs as KB POI records."""
    pois: List[POI] = []
    for i, (name, category, brand, lat, lng, rating, reviews,
            popularity, city, tags) in enumerate(_SEED):
        pois.append(POI(
            poi_id=f"RM{i:03d}", source="RM-seed", name=name, brand=brand,
            category=category, city=city, lat=lat, lng=lng, rating=rating,
            review_count=reviews, popularity_score=popularity,
            tags=list(tags), attributes=list(tags),
        ))
    return pois

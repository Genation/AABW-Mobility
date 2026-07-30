#!/usr/bin/env python3
"""
Generate minimal competition dataset Excel files so the ML service can start.

These files mirror the structure expected by ml-service/tascomaps/data/loader.py
without requiring the original competition datasets.

Usage:
  source ml-service/.venv/bin/activate
  python data/pre-trip-usecase/generate-datasets.py

Output: datasets/ai-maps-challenge-package/
"""

import os
import sys
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("ERROR: openpyxl not found. Run: pip install openpyxl")
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "datasets" / "ai-maps-challenge-package"

# ---------------------------------------------------------------------------
# POI data: merged from existing seed (migration 0004) + new route POIs
# ---------------------------------------------------------------------------

POIS_BASIC = [
    # --- Existing seed POIs (from 0004, 62 rows) ---
    ("POI001", "Highlands Coffee Nguyễn Huệ", "Quán cà phê", "Highlands Coffee",
     "86 Nguyễn Huệ, Quận 1, TP.HCM", "TP.HCM", 10.7759, 106.7031, 4.3, 1250, 88),
    ("POI002", "Chợ Bến Thành", "Chợ", None,
     "Lê Lợi, Quận 1, TP.HCM", "TP.HCM", 10.772, 106.698, 4.4, 9800, 98),
    ("POI003", "Vincom Center Đồng Khởi", "Trung tâm thương mại", "Vincom",
     "72 Lê Thánh Tôn, Quận 1, TP.HCM", "TP.HCM", 10.7781, 106.702, 4.5, 6500, 96),
    ("POI004", "ATM Vietcombank Nguyễn Huệ", "ATM", "Vietcombank",
     "Nguyễn Huệ, Quận 1, TP.HCM", "TP.HCM", 10.7751, 106.7035, 4.1, 310, 75),
    ("POI005", "Bệnh viện Bạch Mai", "Bệnh viện", None,
     "78 Giải Phóng, Đống Đa, Hà Nội", "Hà Nội", 21.0018, 105.8412, 4.1, 3200, 92),
    ("POI006", "Sân bay Nội Bài", "Sân bay", None,
     "Phú Minh, Sóc Sơn, Hà Nội", "Hà Nội", 21.2187, 105.8042, 4.2, 8400, 99),
    ("POI007", "The Coffee House Trần Duy Hưng", "Quán cà phê", "The Coffee House",
     "117 Trần Duy Hưng, Cầu Giấy, Hà Nội", "Hà Nội", 21.016, 105.7945, 4.2, 780, 82),
    ("POI008", "Vinmec Times City", "Bệnh viện", "Vinmec",
     "458 Minh Khai, Hai Bà Trưng, Hà Nội", "Hà Nội", 20.9954, 105.868, 4.5, 2100, 91),
    ("POI009", "Galaxy Cinema Nguyễn Du", "Rạp chiếu phim", "Galaxy Cinema",
     "116 Nguyễn Du, Quận 1, TP.HCM", "TP.HCM", 10.7728, 106.6938, 4.2, 4300, 86),
    ("POI010", "Khách sạn Mường Thanh Đà Nẵng", "Khách sạn", "Mường Thanh",
     "270 Võ Nguyên Giáp, Sơn Trà, Đà Nẵng", "Đà Nẵng", 16.061, 108.2446, 4.1, 1950, 84),
    ("POI011", "Cây xăng Petrolimex Nguyễn Trãi", "Cây xăng", "Petrolimex",
     "Nguyễn Trãi, Thanh Xuân, Hà Nội", "Hà Nội", 20.9939, 105.8037, 4, 560, 72),
    ("POI012", "Phở Thìn Lò Đúc", "Nhà hàng", "Phở Thìn",
     "13 Lò Đúc, Hai Bà Trưng, Hà Nội", "Hà Nội", 21.0183, 105.8557, 4.3, 3500, 90),
    ("POI013", "Cộng Cà Phê Hồ Gươm", "Quán cà phê", "Cộng Cà Phê",
     "32 Lê Thái Tổ, Hoàn Kiếm, Hà Nội", "Hà Nội", 21.0288, 105.852, 4.2, 2800, 89),
    ("POI014", "Nhà hàng Pizza 4P's Bến Nghé", "Nhà hàng", "Pizza 4P's",
     "8 Thủ Khoa Huân, Quận 1, TP.HCM", "TP.HCM", 10.7745, 106.6997, 4.6, 5400, 94),
    ("POI015", "Bến xe Miền Đông mới", "Bến xe", None,
     "501 Hoàng Hữu Nam, TP Thủ Đức, TP.HCM", "TP.HCM", 10.8798, 106.8142, 3.9, 1800, 80),
    ("POI016", "Trường Đại học Bách Khoa Hà Nội", "Đại học", None,
     "1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội", "Hà Nội", 21.0055, 105.8435, 4.6, 6100, 93),
    ("POI017", "Lotteria Nguyễn Văn Linh", "Nhà hàng", "Lotteria",
     "Nguyễn Văn Linh, Quận 7, TP.HCM", "TP.HCM", 10.729, 106.7018, 4, 650, 70),
    ("POI018", "AEON Mall Long Biên", "Trung tâm thương mại", "AEON Mall",
     "27 Cổ Linh, Long Biên, Hà Nội", "Hà Nội", 21.0276, 105.8991, 4.5, 7200, 95),
    ("POI019", "Bãi biển Mỹ Khê", "Bãi biển", None,
     "Võ Nguyên Giáp, Sơn Trà, Đà Nẵng", "Đà Nẵng", 16.0616, 108.2474, 4.6, 12000, 99),
    ("POI020", "Rooftop Chill Skybar", "Quán bar", "Chill Skybar",
     "76A Lê Lai, Quận 1, TP.HCM", "TP.HCM", 10.7715, 106.6944, 4.3, 2300, 87),
]

# --- New Route POIs for the 3 Pre-Trip scenarios ---
POIS_ROUTES = [
    # Route 1: HCM → Đà Lạt
    ("ROUTE001", "Mekong Rest Stop Biên Hòa", "Trạm dừng chân", "Mekong Rest Stop",
     "QL1, Hố Nai, Biên Hòa, Đồng Nai", "Biên Hòa", 10.823, 106.816, 4.1, 850, 82),
    ("ROUTE002", "Cây xăng Petrolimex Trảng Bom", "Cây xăng", "Petrolimex",
     "QL1, Trảng Bom, Đồng Nai", "Trảng Bom", 10.865, 106.950, 4.0, 410, 70),
    ("ROUTE003", "Cafe Sài Gòn Xưa Trảng Bom", "Quán cà phê", None,
     "QL1, Trảng Bom, Đồng Nai", "Trảng Bom", 10.872, 106.958, 4.2, 320, 65),
    ("ROUTE004", "Quán Cơm Tấm Bụi Đồng Nai", "Nhà hàng", None,
     "QL1, Thống Nhất, Đồng Nai", "Thống Nhất", 10.898, 107.130, 4.3, 540, 74),
    ("ROUTE005", "Cây xăng Petrolimex Long Khánh", "Cây xăng", "Petrolimex",
     "QL1, Long Khánh, Đồng Nai", "Long Khánh", 10.915, 107.215, 4.0, 320, 72),
    ("ROUTE006", "Đồi chè Bảo Lộc Check-in", "Điểm check-in", None,
     "QL20, Lộc Châu, Bảo Lộc, Lâm Đồng", "Bảo Lộc", 11.487, 107.760, 4.6, 4200, 96),
    ("ROUTE007", "Cafe Tám Trình Bảo Lộc", "Quán cà phê", None,
     "QL20, Lộc Thanh, Bảo Lộc, Lâm Đồng", "Bảo Lộc", 11.515, 107.790, 4.3, 680, 78),
    ("ROUTE008", "Quán Bánh Canh Ghẹ Long Khánh", "Nhà hàng", None,
     "QL20, Xuân Lộc, Đồng Nai", "Long Khánh", 10.955, 107.270, 4.4, 890, 82),
    ("ROUTE009", "Thác Đam Bri Bảo Lộc", "Điểm check-in", None,
     "QL20, Lộc Tân, Bảo Lộc, Lâm Đồng", "Bảo Lộc", 11.458, 107.720, 4.4, 2800, 88),
    ("ROUTE010", "Homestay Đồi Thông Bảo Lộc", "Nghỉ dưỡng", None,
     "QL20, Lộc Châu, Bảo Lộc, Lâm Đồng", "Bảo Lộc", 11.495, 107.770, 4.5, 1200, 84),
    ("ROUTE011", "Thác Datanla Đà Lạt", "Điểm check-in", None,
     "QL20, Phường 3, TP. Đà Lạt, Lâm Đồng", "Đà Lạt", 11.898, 108.430, 4.5, 8900, 98),
    ("ROUTE012", "Panorama Coffee Đà Lạt", "Quán cà phê", None,
     "Trần Hưng Đạo, Phường 10, Đà Lạt, Lâm Đồng", "Đà Lạt", 11.935, 108.438, 4.4, 2100, 90),
    ("ROUTE013", "Chợ đêm Đà Lạt", "Ẩm thực", None,
     "Nguyễn Thị Minh Khai, Phường 1, Đà Lạt", "Đà Lạt", 11.944, 108.437, 4.4, 12000, 99),
    ("ROUTE014", "Hồ Xuân Hương Đà Lạt", "Điểm check-in", None,
     "Phường 1, TP. Đà Lạt, Lâm Đồng", "Đà Lạt", 11.942, 108.442, 4.7, 15000, 99),
    ("ROUTE015", "Lẩu Gà Lá É Tao Ngộ Đà Lạt", "Nhà hàng", "Tao Ngộ",
     "Đường 3/4, Phường 3, Đà Lạt, Lâm Đồng", "Đà Lạt", 11.942, 108.434, 4.5, 5600, 93),
    ("ROUTE016", "Cây xăng Petrolimex Di Linh", "Cây xăng", "Petrolimex",
     "QL20, Di Linh, Lâm Đồng", "Di Linh", 11.580, 108.080, 4.0, 280, 68),
    ("ROUTE017", "Resort Terracotta Đà Lạt", "Nghỉ dưỡng", "Terracotta",
     "Tuyền Lâm, Phường 3, Đà Lạt, Lâm Đồng", "Đà Lạt", 11.905, 108.435, 4.6, 3200, 91),

    # Route 2: HN → Hạ Long
    ("ROUTE018", "Trạm dừng chân Phố Nối", "Trạm dừng chân", None,
     "QL5, Phố Nối, Hưng Yên", "Hưng Yên", 21.082, 105.945, 3.9, 450, 62),
    ("ROUTE019", "Đền Đô Bắc Ninh", "Di tích", None,
     "Đình Bảng, Từ Sơn, Bắc Ninh", "Bắc Ninh", 21.184, 105.957, 4.6, 3800, 89),
    ("ROUTE021", "Đền Kiếp Bạc", "Di tích", None,
     "Kiếp Bạc, Hưng Đạo, Chí Linh, Hải Dương", "Chí Linh", 21.105, 106.280, 4.6, 3100, 87),
    ("ROUTE024", "Sun World Hạ Long", "Giải trí", "Sun World",
     "Đường Hạ Long, Bãi Cháy, Hạ Long", "Hạ Long", 20.962, 107.050, 4.5, 15000, 97),
    ("ROUTE025", "Chợ Hạ Long 1", "Mua sắm", None,
     "Bạch Đằng, Bãi Cháy, Hạ Long", "Hạ Long", 20.947, 107.075, 4.1, 5600, 86),
    ("ROUTE026", "Nhà hàng Hải Sản Bà Tuyết", "Nhà hàng", None,
     "Võ Nguyên Giáp, Bãi Cháy, Hạ Long", "Hạ Long", 20.950, 107.068, 4.3, 2400, 84),
    ("ROUTE027", "Cây xăng Petrolimex Hạ Long", "Cây xăng", "Petrolimex",
     "QL18, Bãi Cháy, Hạ Long", "Hạ Long", 20.968, 106.980, 4.0, 290, 68),
    ("ROUTE028", "Vinpearl Resort Hạ Long", "Nghỉ dưỡng", "Vinpearl",
     "Đảo Rều, Bãi Cháy, Hạ Long", "Hạ Long", 20.955, 107.080, 4.7, 8900, 94),

    # Route 3: ĐN → Huế
    ("ROUTE029", "Bán đảo Sơn Trà - Chùa Linh Ứng", "Điểm check-in", None,
     "Bán đảo Sơn Trà, Đà Nẵng", "Đà Nẵng", 16.111, 108.279, 4.7, 9500, 97),
    ("ROUTE030", "Cafe Hải Vân Top", "Quán cà phê", None,
     "Đèo Hải Vân, Liên Chiểu, Đà Nẵng", "Đà Nẵng", 16.170, 108.133, 4.2, 780, 71),
    ("ROUTE031", "Hải Vân Quan", "Di tích", None,
     "Đỉnh đèo Hải Vân, Lăng Cô, Huế", "Huế", 16.207, 108.099, 4.8, 18000, 99),
    ("ROUTE032", "Cầu vồng Lăng Cô", "Điểm check-in", None,
     "QL1A, Lăng Cô, Phú Lộc, Huế", "Huế", 16.245, 108.090, 4.4, 3200, 84),
    ("ROUTE033", "Bãi biển Lăng Cô", "Bãi biển", None,
     "Lăng Cô, Phú Lộc, Huế", "Huế", 16.260, 108.085, 4.5, 8700, 95),
    ("ROUTE035", "Quán Hải Sản Bé Thơ Lăng Cô", "Nhà hàng", None,
     "QL1A, Lăng Cô, Phú Lộc, Huế", "Huế", 16.270, 107.940, 4.4, 1600, 82),
    ("ROUTE036", "Điểm ngắm đầm Cầu Hai", "Điểm check-in", None,
     "QL49B, Vinh Hiền, Phú Lộc, Huế", "Huế", 16.300, 107.820, 4.2, 450, 65),
    ("ROUTE037", "Cây xăng Petrolimex Phú Lộc", "Cây xăng", "Petrolimex",
     "QL1A, Phú Lộc, Huế", "Huế", 16.285, 107.860, 4.0, 250, 67),
    ("ROUTE038", "Lăng Khải Định", "Di tích", None,
     "Thủy Bằng, Hương Thủy, Huế", "Huế", 16.403, 107.587, 4.6, 14000, 98),
    ("ROUTE039", "Chùa Thiên Mụ", "Di tích", None,
     "Kim Long, TP. Huế", "Huế", 16.453, 107.545, 4.7, 21000, 99),
    ("ROUTE040", "Bún bò Huế Bà Tuyết", "Nhà hàng", None,
     "Nguyễn Huệ, Phú Nhuận, TP. Huế", "Huế", 16.465, 107.590, 4.5, 7800, 92),
    ("ROUTE041", "Đại Nội Huế", "Di tích", None,
     "23/8, Thuận Hòa, TP. Huế", "Huế", 16.470, 107.578, 4.7, 25000, 99),
    ("ROUTE043", "Azerai La Residence Huế", "Nghỉ dưỡng", "Azerai",
     "Lê Lợi, Vĩnh Ninh, TP. Huế", "Huế", 16.463, 107.582, 4.7, 2100, 90),
]

ALL_POIS = POIS_BASIC + POIS_ROUTES

# Map route POI categories to canonical categories recognized by P6/P7 engine.
# Only these 17 canonicals exist: ATM, Bến xe, Bệnh viện, Cây xăng, Công viên,
# Cửa hàng tiện lợi, Cửa hàng điện máy, Khách sạn, Nhà hàng, Nhà thuốc,
# Quán cà phê, Rạp chiếu phim, Siêu thị, Sân bay, Trung tâm thương mại,
# Trạm sạc điện, Điểm tham quan
CATEGORY_MAP = {
    "Điểm check-in": "Điểm tham quan",
    "Di tích": "Điểm tham quan",
    "Bãi biển": "Điểm tham quan",
    "Danh thắng": "Điểm tham quan",
    "Trạm dừng chân": "Cửa hàng tiện lợi",
    "Giải trí": "Điểm tham quan",
    "Mua sắm": "Trung tâm thương mại",
    "Ẩm thực": "Nhà hàng",
    "Nghỉ dưỡng": "Khách sạn",
    "Đặc sản": "Cửa hàng tiện lợi",
    "Chợ": "Trung tâm thương mại",
    "Đại học": "Điểm tham quan",
    "Quán bar": "Quán cà phê",
    "Rooftop": "Quán cà phê",
}

def canonicalize(cat: str) -> str:
    """Map a raw category to one the engine recognizes."""
    cat = str(cat or "").strip()
    return CATEGORY_MAP.get(cat, cat)  # passthrough if already canonical

# Tags for new route POIs (enables P7 semantic matching for AI Suggestions)
ROUTE_TAGS = {
    "ROUTE001": ["dừng chân", "cafe", "toilet", "ăn sáng"],
    "ROUTE002": ["xăng", "toilet", "24/7"],
    "ROUTE003": ["cafe", "wifi", "yên tĩnh"],
    "ROUTE004": ["cơm", "ăn trưa", "địa phương"],
    "ROUTE005": ["xăng", "toilet", "24/7"],
    "ROUTE006": ["check-in", "săn mây", "view đẹp", "du lịch"],
    "ROUTE007": ["cafe", "view núi", "takeaway", "wifi"],
    "ROUTE008": ["bánh canh", "đặc sản", "ăn sáng"],
    "ROUTE009": ["check-in", "thác nước", "du lịch", "thiên nhiên"],
    "ROUTE010": ["nghỉ dưỡng", "homestay", "view đẹp", "yên tĩnh"],
    "ROUTE011": ["check-in", "thác nước", "trượt máng", "du lịch"],
    "ROUTE012": ["cafe", "view toàn cảnh", "check-in", "wifi"],
    "ROUTE013": ["ẩm thực", "chợ đêm", "mua sắm", "du lịch"],
    "ROUTE014": ["check-in", "hồ", "du lịch", "dạo bộ"],
    "ROUTE015": ["lẩu gà", "đặc sản", "địa phương", "gia đình"],
    "ROUTE016": ["xăng", "toilet", "24/7"],
    "ROUTE017": ["resort", "nghỉ dưỡng", "gia đình", "hồ bơi"],
    "ROUTE018": ["dừng chân", "cafe", "toilet", "ăn sáng"],
    "ROUTE019": ["di tích", "lịch sử", "du lịch", "tâm linh"],
    "ROUTE021": ["di tích", "lịch sử", "tâm linh", "du lịch"],
    "ROUTE024": ["giải trí", "cáp treo", "check-in", "view biển"],
    "ROUTE025": ["mua sắm", "chợ", "hải sản", "lưu niệm"],
    "ROUTE026": ["hải sản", "ăn trưa", "view biển", "gia đình"],
    "ROUTE027": ["xăng", "toilet", "24/7"],
    "ROUTE028": ["resort", "nghỉ dưỡng", "đảo", "hồ bơi", "cao cấp"],
    "ROUTE029": ["check-in", "chùa", "view biển", "du lịch"],
    "ROUTE030": ["cafe", "view biển", "check-in", "gió mát"],
    "ROUTE031": ["di tích", "check-in", "view biển", "lịch sử"],
    "ROUTE032": ["check-in", "view đầm", "núi", "săn mây"],
    "ROUTE033": ["biển", "du lịch", "check-in", "tắm biển"],
    "ROUTE035": ["hải sản", "tươi sống", "địa phương", "gia đình"],
    "ROUTE036": ["check-in", "hoàng hôn", "đầm phá", "view đẹp"],
    "ROUTE037": ["xăng", "toilet", "24/7"],
    "ROUTE038": ["di tích", "UNESCO", "kiến trúc", "check-in"],
    "ROUTE039": ["di tích", "chùa", "view sông Hương", "biểu tượng"],
    "ROUTE040": ["bún bò", "đặc sản", "ăn sáng", "địa phương"],
    "ROUTE041": ["di tích", "UNESCO", "lịch sử", "check-in"],
    "ROUTE043": ["khách sạn", "nghỉ dưỡng", "cao cấp", "view sông Hương"],
}


def _write_sheet(ws, headers, rows):
    """Write headers + rows to a worksheet."""
    ws.append(headers)
    for row in rows:
        ws.append([row.get(h) if isinstance(row, dict) else v for h, v in zip(headers, row)])


# =========================================================================
# Track 1
# =========================================================================
def write_track1(path):
    wb = openpyxl.Workbook()

    # --- POI Dataset ---
    ws = wb.active
    ws.title = "POI Dataset"
    headers = ["poi_id", "name_vi", "name_en", "brand", "category", "address",
               "district", "city", "latitude", "longitude", "rating",
               "opening_hours", "aliases"]
    ws.append(headers)
    for pid, name, cat, brand, addr, city, lat, lng, rating, _, _ in POIS_BASIC:
        ws.append([pid, name, name, brand or "", cat, addr, "", city, lat, lng, rating, "", ""])

    # --- Address Dataset ---
    ws2 = wb.create_sheet("Address Dataset")
    addr_headers = ["address_id", "full_address", "house_number", "street", "ward",
                    "district", "city", "aliases", "notes", "latitude", "longitude"]
    ws2.append(addr_headers)  # empty rows ok

    # --- Abbreviation Dictionary ---
    ws3 = wb.create_sheet("Abbreviation Dictionary")
    abbr_headers = ["term", "normalized_form", "type"]
    _write_sheet(ws3, abbr_headers, [
        {"term": "q1", "normalized_form": "Quận 1", "type": "district abbreviation"},
        {"term": "hn", "normalized_form": "Hà Nội", "type": "city abbreviation"},
        {"term": "dn", "normalized_form": "Đà Nẵng", "type": "city abbreviation"},
        {"term": "ks", "normalized_form": "Khách sạn", "type": "category abbreviation"},
        {"term": "bv", "normalized_form": "Bệnh viện", "type": "category abbreviation"},
        {"term": "atm", "normalized_form": "ATM", "type": "category abbreviation"},
        {"term": "cafe", "normalized_form": "Cà phê", "type": "category abbreviation"},
        {"term": "cf", "normalized_form": "Cà phê", "type": "category abbreviation"},
    ])

    # --- Attribute_Taxonomy ---
    ws4 = wb.create_sheet("Attribute_Taxonomy")
    ws4.append(["attribute", "canonical"])
    for attr in ["wifi", "đậu xe", "mở cửa khuya", "view đẹp", "check-in",
                  "yên tĩnh", "gia đình", "hồ bơi", "24/7"]:
        ws4.append([attr, attr])

    # --- Ranking_Signals ---
    ws5 = wb.create_sheet("Ranking_Signals")
    ws5.append(["signal", "weight"])
    for sig in [("rating", 0.15), ("popularity", 0.10), ("relevance", 0.50), ("distance", 0.25)]:
        ws5.append(list(sig))

    wb.save(path)
    print(f"  ✓ {path.name}")


# =========================================================================
# Track 2 (P7 semantic search uses this)
# =========================================================================
def write_track2(path):
    wb = openpyxl.Workbook()

    # --- POI_Dataset (note underscore!) ---
    ws = wb.active
    ws.title = "POI_Dataset"
    headers = ["poi_id", "poi_name", "brand", "category", "sub_category",
               "address", "district", "city", "latitude", "longitude",
               "rating", "review_count", "popularity_score", "price_level",
               "opening_hours", "attributes", "tags", "description"]
    ws.append(headers)
    for pid, name, cat, brand, addr, city, lat, lng, rating, reviews, pop in ALL_POIS:
        canon = canonicalize(cat)
        tags = ROUTE_TAGS.get(pid, [])
        attrs = ROUTE_TAGS.get(pid, [])
        ws.append([
            pid, name, brand or "", canon, "",
            addr, "", city, lat, lng,
            rating, reviews, pop, None,
            "",  # opening_hours
            "; ".join(attrs),  # attributes
            "; ".join(tags),   # tags
            "",                # description
        ])

    # --- Attribute_Taxonomy ---
    ws2 = wb.create_sheet("Attribute_Taxonomy")
    ws2.append(["attribute", "canonical"])
    for attr in ["wifi", "đậu xe", "view đẹp", "check-in", "yên tĩnh",
                  "gia đình", "hồ bơi", "24/7", "du lịch", "lịch sử",
                  "đặc sản", "view biển", "nghỉ dưỡng"]:
        ws2.append([attr, attr])

    # --- Ranking_Signals ---
    ws3 = wb.create_sheet("Ranking_Signals")
    ws3.append(["signal", "weight"])
    for sig in [("relevance", 0.50), ("name", 0.40), ("category", 0.12),
                ("attributes", 0.16), ("location", 0.18), ("rating", 0.08),
                ("popularity", 0.06)]:
        ws3.append(list(sig))

    # --- Public_Evaluation (required for eval, can be empty) ---
    ws4 = wb.create_sheet("Public_Evaluation")
    ws4.append(["query", "expected_poi_ids"])

    wb.save(path)
    print(f"  ✓ {path.name}")


# =========================================================================
# Track 4
# =========================================================================
def write_track4(path):
    wb = openpyxl.Workbook()

    # --- POI Dataset ---
    ws = wb.active
    ws.title = "POI Dataset"
    headers = ["poi_id", "poi_name", "brand", "category", "address", "city",
               "latitude", "longitude", "rating", "review_count",
               "popularity_score", "tags"]
    ws.append(headers)
    for pid, name, cat, brand, addr, city, lat, lng, rating, reviews, pop in ALL_POIS:
        canon = canonicalize(cat)
        tags = ROUTE_TAGS.get(pid, [])
        ws.append([pid, name, brand or "", canon, addr, city, lat, lng,
                   rating, reviews, pop, "; ".join(tags)])

    # --- Autocomplete Dataset ---
    ws2 = wb.create_sheet("Autocomplete Dataset")
    ac_headers = ["input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency"]
    _write_sheet(ws2, ac_headers, [
        {"input_prefix": "doi che", "suggestion_text": "Đồi chè Bảo Lộc", "suggestion_type": "POI Suggestion", "score": 0.96, "query_frequency": 4200},
        {"input_prefix": "thac d", "suggestion_text": "Thác Datanla Đà Lạt", "suggestion_type": "POI Suggestion", "score": 0.95, "query_frequency": 8900},
        {"input_prefix": "ha long", "suggestion_text": "Bãi Cháy Hạ Long", "suggestion_type": "POI Suggestion", "score": 0.94, "query_frequency": 12000},
        {"input_prefix": "hai van", "suggestion_text": "Hải Vân Quan", "suggestion_type": "POI Suggestion", "score": 0.97, "query_frequency": 15000},
        {"input_prefix": "dai noi", "suggestion_text": "Đại Nội Huế", "suggestion_type": "POI Suggestion", "score": 0.98, "query_frequency": 22000},
        {"input_prefix": "lang co", "suggestion_text": "Bãi biển Lăng Cô", "suggestion_type": "POI Suggestion", "score": 0.94, "query_frequency": 8700},
        {"input_prefix": "thien mu", "suggestion_text": "Chùa Thiên Mụ", "suggestion_type": "POI Suggestion", "score": 0.97, "query_frequency": 18000},
        {"input_prefix": "khai dinh", "suggestion_text": "Lăng Khải Định", "suggestion_type": "POI Suggestion", "score": 0.96, "query_frequency": 12000},
        {"input_prefix": "dat t", "suggestion_text": "Đà Lạt", "suggestion_type": "Location Search", "score": 0.96, "query_frequency": 25000},
        # Generic category searches (matching AI Suggestions queries)
        {"input_prefix": "cafe", "suggestion_text": "Quán cà phê gần đây", "suggestion_type": "Category Search", "score": 0.97, "query_frequency": 6200},
        {"input_prefix": "tram xang", "suggestion_text": "Trạm xăng gần đây", "suggestion_type": "Nearby Search", "score": 0.95, "query_frequency": 7500},
        {"input_prefix": "check in", "suggestion_text": "Điểm check-in đẹp", "suggestion_type": "Discovery Search", "score": 0.93, "query_frequency": 9800},
    ])

    # --- Popular Queries ---
    ws3 = wb.create_sheet("Popular Queries")
    pq_headers = ["query_text", "intent_type", "monthly_frequency", "region"]
    _write_sheet(ws3, pq_headers, [
        {"query_text": "quán cà phê gần đây", "intent_type": "Category Search", "monthly_frequency": 12000, "region": "Toàn quốc"},
        {"query_text": "cây xăng gần đây", "intent_type": "Nearby Search", "monthly_frequency": 9800, "region": "Toàn quốc"},
        {"query_text": "điểm check-in đẹp gần đây", "intent_type": "Discovery Search", "monthly_frequency": 8700, "region": "Toàn quốc"},
        {"query_text": "resort nghỉ dưỡng", "intent_type": "Discovery Search", "monthly_frequency": 5600, "region": "Toàn quốc"},
    ])

    # --- Abbreviation Dictionary ---
    ws4 = wb.create_sheet("Abbreviation Dictionary")
    abbr_headers = ["abbreviation", "expanded_form", "type"]
    _write_sheet(ws4, abbr_headers, [
        {"abbreviation": "q1", "expanded_form": "Quận 1", "type": "district"},
        {"abbreviation": "hn", "expanded_form": "Hà Nội", "type": "city"},
        {"abbreviation": "dn", "expanded_form": "Đà Nẵng", "type": "city"},
        {"abbreviation": "ks", "expanded_form": "Khách sạn", "type": "category"},
        {"abbreviation": "bv", "expanded_form": "Bệnh viện", "type": "category"},
        {"abbreviation": "atm", "expanded_form": "ATM", "type": "category"},
        {"abbreviation": "cafe", "expanded_form": "Cà phê", "type": "category"},
        {"abbreviation": "cf", "expanded_form": "Cà phê", "type": "category"},
    ])

    wb.save(path)
    print(f"  ✓ {path.name}")


# =========================================================================
# Main
# =========================================================================
def main():
    OUT.mkdir(parents=True, exist_ok=True)

    t1_dir = OUT / "Track 1 - AI Search Understanding for Maps"
    t2_dir = OUT / "Track 2 - AI Semantic Search & Ranking"
    t4_dir = OUT / "Track 4 - AI-Powered Autocomplete & Query Suggestions"

    for d in (t1_dir, t2_dir, t4_dir):
        d.mkdir(parents=True, exist_ok=True)

    print("Generating dataset Excel files...")
    print(f"  Output: {OUT}\n")

    write_track1(t1_dir / "ai_maps_track1_dataset_participants_v2.xlsx")
    write_track2(t2_dir / "ai_maps_track2_dataset_participants.xlsx")
    write_track4(t4_dir / "ai_maps_track4_dataset_participants.xlsx")

    print(f"\nDone! {len(ALL_POIS)} POIs written ({len(POIS_BASIC)} existing + {len(POIS_ROUTES)} route).")
    print(f"\nNow run: cd ml-service && PORT=8100 ./run.sh serve")


if __name__ == "__main__":
    main()

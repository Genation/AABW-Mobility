"""Shared vocabularies: canonical categories, intents, stopwords, templates.

These are hand-curated from the three challenge datasets (P6/P7/P9). They are
small on purpose — the datasets are synthetic and category labels are duplicated
across Vietnamese/English, so we canonicalize to a single Vietnamese label.
"""
from __future__ import annotations

from .core.text import fold, nfc

# Versioned, reviewed query access surfaces. These are input evidence rather
# than synonyms to display, so provenance and entity type stay explicit.
APPROVED_QUERY_SURFACES_V1 = (
    ("hcmc", "TP Hồ Chí Minh", "city", "approved_alias"),
    ("big c", "GO!", "brand", "historical_brand_alias"),
    ("pho4p", "Pizza 4P's", "poi_family",
     "approved_observed_correction"),
)

# --- Canonical category map ------------------------------------------------
# Maps every raw category label (any track, any language) to one canonical form.
CATEGORY_CANON = {
    "cafe": "Quán cà phê",
    "cafe/tea": "Quán cà phê",
    "quán cà phê": "Quán cà phê",
    "quan ca phe": "Quán cà phê",
    "coffee": "Quán cà phê",
    "nhà hàng": "Nhà hàng",
    "restaurant": "Nhà hàng",
    "khách sạn": "Khách sạn",
    "hotel": "Khách sạn",
    "hospital": "Bệnh viện",
    "bệnh viện": "Bệnh viện",
    "pharmacy": "Nhà thuốc",
    "nhà thuốc": "Nhà thuốc",
    "bank/atm": "ATM",
    "atm": "ATM",
    "bank": "ATM",
    "gas station": "Cây xăng",
    "cây xăng": "Cây xăng",
    "trạm xăng": "Cây xăng",
    "supermarket": "Siêu thị",
    "siêu thị": "Siêu thị",
    "convenience store": "Cửa hàng tiện lợi",
    "cửa hàng tiện lợi": "Cửa hàng tiện lợi",
    "shopping mall": "Trung tâm thương mại",
    "trung tâm thương mại": "Trung tâm thương mại",
    "mall": "Trung tâm thương mại",
    "cinema": "Rạp chiếu phim",
    "rạp chiếu phim": "Rạp chiếu phim",
    "rạp phim": "Rạp chiếu phim",
    "sân bay": "Sân bay",
    "airport": "Sân bay",
    "điểm du lịch": "Điểm tham quan",
    "điểm tham quan": "Điểm tham quan",
    "chợ, điểm du lịch": "Điểm tham quan",
    "công viên": "Công viên",
    "bến xe": "Bến xe",
    "electronics": "Cửa hàng điện máy",
    "trạm sạc điện": "Trạm sạc điện",
}

# Category keywords that may appear in a raw query (accent-insensitive lookup is
# built from these plus their no-accent forms in the KB lexicon).
CATEGORY_QUERY_TERMS = {
    "quán cà phê": "Quán cà phê", "cà phê": "Quán cà phê", "cafe": "Quán cà phê",
    "coffee": "Quán cà phê", "cà phê học bài": "Quán cà phê",
    "nhà hàng": "Nhà hàng", "quán ăn": "Nhà hàng", "restaurant": "Nhà hàng",
    "restaurants": "Nhà hàng", "quán nhậu": "Nhà hàng",
    "quán": "Nhà hàng", "ăn đêm": "Nhà hàng", "ăn": "Nhà hàng",
    "khách sạn": "Khách sạn", "hotel": "Khách sạn", "resort": "Khách sạn",
    "bệnh viện": "Bệnh viện", "hospital": "Bệnh viện",
    "nhà thuốc": "Nhà thuốc", "pharmacy": "Nhà thuốc", "hiệu thuốc": "Nhà thuốc",
    "atm": "ATM", "cây atm": "ATM",
    "cây xăng": "Cây xăng", "trạm xăng": "Cây xăng", "xăng": "Cây xăng",
    "siêu thị": "Siêu thị", "supermarket": "Siêu thị",
    "cửa hàng tiện lợi": "Cửa hàng tiện lợi", "tiện lợi": "Cửa hàng tiện lợi",
    "trung tâm thương mại": "Trung tâm thương mại", "mall": "Trung tâm thương mại",
    "rạp chiếu phim": "Rạp chiếu phim", "rạp phim": "Rạp chiếu phim", "cinema": "Rạp chiếu phim",
    "sân bay": "Sân bay", "airport": "Sân bay",
    "điểm tham quan": "Điểm tham quan", "điểm du lịch": "Điểm tham quan",
    "công viên": "Công viên", "park": "Công viên",
    "bến xe": "Bến xe",
    "trạm sạc": "Trạm sạc điện", "trạm sạc điện": "Trạm sạc điện", "sạc xe điện": "Trạm sạc điện",
    "trà sữa": "Quán cà phê", "pizza": "Nhà hàng", "phở": "Nhà hàng",
}


def canon_category(raw: str) -> str:
    if not raw:
        return ""
    key = str(raw).strip().lower()
    if key in CATEGORY_CANON:
        return CATEGORY_CANON[key]
    # take first component if comma-separated
    first = key.split(",")[0].strip()
    return CATEGORY_CANON.get(first, str(raw).strip())


# --- Intent taxonomy (P6) --------------------------------------------------
INTENTS = [
    "POI Search",
    "Category Search",
    "Brand Category Search",
    "Nearby Search",
    "Navigation",
    "Address Search",
    "Coordinate Search",
    "Discovery Search",
    "Ambiguous",
]

# Words that signal "near me / nearby" -> Nearby Search
NEARBY_TERMS = [
    "gần đây", "gần tôi", "gần nhất", "gần nhà", "quanh đây", "xung quanh",
    "gần tui", "quanh tui", "near me", "nearby", "gần", "close to",
]

# Words that signal navigation / directions -> Navigation
NAV_TERMS = [
    "chỉ đường", "chỉ đường đến", "đường đến", "đi đến", "tới", "đến",
    "directions", "navigate", "how to get to", "dẫn đường", "lộ trình",
]

# Words that signal discovery / natural-language "place for ..." -> Discovery
DISCOVERY_TERMS = [
    "địa điểm", "nơi", "chỗ", "phù hợp", "để hẹn hò", "hẹn hò", "check-in",
    "checkin", "view đẹp", "lãng mạn", "vui chơi", "cho trẻ", "cho gia đình",
    "place for", "spot", "hangout",
]

# Attribute lexicon (semantic requirements for P7 and Discovery in P6).
ATTRIBUTE_TERMS = {
    "yên tĩnh": "yên tĩnh", "quiet": "yên tĩnh",
    "wifi": "wifi", "wi-fi": "wifi", "internet": "wifi",
    "làm việc": "phù hợp làm việc", "work": "phù hợp làm việc",
    "làm việc yên tĩnh": "phù hợp làm việc", "công tác": "phù hợp làm việc",
    "học bài": "phù hợp học tập", "học tập": "phù hợp học tập",
    "để học": "phù hợp học tập", "học": "phù hợp học tập",
    "gia đình": "phù hợp gia đình", "trẻ em": "phù hợp gia đình",
    "trẻ nhỏ": "phù hợp gia đình", "family": "phù hợp gia đình",
    "lãng mạn": "lãng mạn", "hẹn hò": "lãng mạn", "date": "lãng mạn",
    "romantic": "lãng mạn",
    "mở khuya": "mở khuya", "mở cửa khuya": "mở khuya", "ăn đêm": "mở khuya",
    "khuya": "mở khuya", "late": "mở khuya", "mở cửa muộn": "mở khuya",
    "gần biển": "gần biển", "biển": "gần biển", "beach": "gần biển",
    "bãi đỗ xe": "bãi đỗ xe", "đậu xe": "bãi đỗ xe", "chỗ để xe": "bãi đỗ xe",
    "parking": "bãi đỗ xe", "gửi xe": "bãi đỗ xe",
    "check-in": "check-in", "checkin": "check-in", "sống ảo": "check-in",
    "view đẹp": "check-in", "chụp ảnh": "check-in",
    "24/7": "24/7", "24h": "24/7", "cả ngày": "24/7", "toilet": "toilet",
    "phòng riêng": "phòng riêng", "private room": "phòng riêng",
    "hồ bơi": "hồ bơi", "bể bơi": "hồ bơi", "pool": "hồ bơi",
    "chay": "chay", "vegetarian": "chay", "ổ cắm": "ổ cắm", "rooftop": "rooftop",
}

# City normalization
CITY_CANON = {
    "tp.hcm": "TP Hồ Chí Minh", "tp hcm": "TP Hồ Chí Minh",
    "tphcm": "TP Hồ Chí Minh", "hcm": "TP Hồ Chí Minh", "sài gòn": "TP Hồ Chí Minh",
    "sai gon": "TP Hồ Chí Minh", "sg": "TP Hồ Chí Minh",
    "ho chi minh": "TP Hồ Chí Minh", "hà nội": "Hà Nội", "ha noi": "Hà Nội",
    "hn": "Hà Nội", "đà nẵng": "Đà Nẵng", "da nang": "Đà Nẵng", "dn": "Đà Nẵng",
    "đà lạt": "Đà Lạt", "da lat": "Đà Lạt", "hạ long": "Hạ Long",
}

# Accent-insensitive lookup for the map above so callers can canonicalize from
# any surface spelling with a single fold key.
_CITY_CANON_FOLDED = {fold(key): value for key, value in CITY_CANON.items()}

# Administrative prefixes (folded) that may precede a city proper noun. Stripping
# one lets "Thành phố Hồ Chí Minh", "TP. Hồ Chí Minh", and "TP HCM" resolve to
# the same identity as the bare "Hồ Chí Minh" / "HCM" keys above.
_CITY_ADMIN_PREFIXES = ("thanh pho", "tp", "tinh", "thi xa", "thi tran")


def canon_city(raw: str) -> str:
    """Canonicalize any city surface form to one shared identity.

    P6 (understanding) and P7 (search) must agree on a single spelling for each
    city; otherwise a hard location constraint compares unequal strings and
    silently drops every candidate. This resolves abbreviations, accentless
    input, and an optional administrative prefix ("Thành phố" / "TP" / "Tỉnh"…).
    Unknown cities are returned unchanged (NFC-normalized) so out-of-vocabulary
    places such as "Nha Trang" keep a stable identity.
    """
    if not raw:
        return ""
    key = fold(raw)
    if key in _CITY_CANON_FOLDED:
        return _CITY_CANON_FOLDED[key]
    for prefix in _CITY_ADMIN_PREFIXES:
        if key.startswith(prefix + " "):
            stripped = key[len(prefix):].strip()
            if stripped in _CITY_CANON_FOLDED:
                return _CITY_CANON_FOLDED[stripped]
            break
    return nfc(str(raw).strip())

# "Singleton facility" categories: category-word + a proper noun names a
# specific place (e.g. 'ga hà nội' -> Ga Hà Nội), so treat as a POI, not a
# generic category search. Unlike cafe/hotel/atm which have many instances.
FACILITY_CATEGORIES = {"Ga", "Nhà ga", "Bến xe", "Sân bay", "Đại học", "Chợ"}

# Categories that are typically used as proximity landmarks ("... near X").
LANDMARK_CATEGORIES = {"Điểm tham quan", "Điểm du lịch", "Công viên", "Chợ",
                       "Sân bay", "Bến xe", "Trung tâm thương mại"}

# Common adjectives / quality words that must never be treated as a brand or POI.
ADJECTIVE_STOP = {
    "ngon", "đẹp", "mới", "rẻ", "sang", "xịn", "tốt", "xỉu", "chất",
    "nổi tiếng", "yêu thích", "gần", "lake", "beach",
}

# Generic Vietnamese/English stopwords for lexical matching (kept minimal).
STOPWORDS = {
    "ở", "tại", "của", "có", "và", "cho", "là", "the", "a", "an", "in", "at",
    "of", "to", "for", "gần", "đi", "một", "với", "trên", "dưới",
}

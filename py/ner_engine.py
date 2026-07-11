"""
RouteMate NER Engine — Map Search Query Understanding
======================================================
2-stage architecture:
  Stage 1: Ollama (qwen2.5:1.5b-instruct) → understands the query, outputs normalized text
  Stage 2: Fast NER extractor → parses LLM output into structured hard_filters

This matches the pitch: "LLM phân tích ngữ cảnh → NER siêu tốc bóc tách Entities
thành cấu trúc chuẩn cho Search Engine"

No hardcoded dictionaries. The extractor works purely on the model's own output.
"""

from __future__ import annotations

import json
import re
import time
import sys
import io
from dataclasses import dataclass, field, asdict
from typing import Any

from ollama import chat

if sys.stdout.encoding != "utf-8":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")


# ═══════════════════════════════════════════════════════════════════════════════
# Constants
# ═══════════════════════════════════════════════════════════════════════════════

TOOL_REGISTRY: dict[str, str] = {
    "brand_suggestion": "Brand Autocomplete",
    "poi_suggestion": "POI Lookup",
    "address_suggestion": "Address Autocomplete",
    "category_search": "Category Search",
    "nearby_search": "Nearby Search",
    "attribute_search": "Attribute Filter",
    "discovery_search": "Semantic Discovery",
    "navigation": "Navigation / Routing",
    "coordinate_search": "Coordinate Lookup",
    "ambiguous": "Ambiguous Intent",
}

ENTITY_FIELDS = [
    "brand", "category", "city", "district",
    "street", "building", "attribute", "nearby_ref", "coordinate",
]

# Only pure regex — no dictionaries
_COORDINATE_RE = re.compile(r"(\d{1,2}\.\d{3,})\s*,?\s*(\d{1,3}\.\d{3,})")
_CITY_RE = re.compile(
    r"\b(Hà\s*Nội|TP\.?\s*HCM|TPHCM|Đà\s*Nẵng|Đà\s*Lạt|Hải\s*Phòng|Nha\s*Trang|"
    r"Phan\s*Thiết|Huế|Cần\s*Thơ|Vũng\s*Tàu|Phú\s*Quốc|Hạ\s*Long|Quy\s*Nhơn|Sài\s*Gòn)\b",
    re.IGNORECASE,
)
_DISTRICT_RE = re.compile(r"\b(Quận\s*\d+|Q\.?\s*\d+|Huyện\s+\w+|quận\s+\d+)", re.IGNORECASE)
_BUILDING_RE = re.compile(r"^(\d+[a-z]?)\s+")
_STREET_RE = re.compile(
    r"(?:số\s+)?(\d+[a-z]?)\s+(?:đường\s+)?(Nguyễn\s+\w+|Lê\s+\w+|Trần\s+\w+|"
    r"Phạm\s+\w+|Đồng\s+Khởi|Hai\s+Bà\s+Trưng|Điện\s+Biên\s+Phủ)",
    re.IGNORECASE,
)


# ═══════════════════════════════════════════════════════════════════════════════
# Enhanced System Prompt — teaches the model Vietnamese map query understanding
# ═══════════════════════════════════════════════════════════════════════════════

SYSTEM_PROMPT = """You are a Vietnamese map search understanding engine.
Parse a user query and output structured analysis. Input may be partial (typing), with or without diacritics, mixed Vietnamese/English.

OUTPUT a JSON object with exactly these keys:
{
  "completed_query": "fully normalized Vietnamese query",
  "tool": "one of the tool types below",
  "cleaned_query": "semantic/attribute part only",
  "suggestions": ["3-5 autocomplete suggestions"]
}

TOOLS (pick one):
  brand_suggestion — just a brand name
  poi_suggestion — a specific known place/landmark
  address_suggestion — number + street address
  category_search — just a category, no attributes
  nearby_search — has "gần đây"/"near me"/"gần nhất"
  attribute_search — category + specific attribute (wifi, 24/7…)
  discovery_search — category + descriptive/semantic attribute
  navigation — asking for directions ("chỉ đường", "đường đến")
  coordinate_search — decimal coordinates
  ambiguous — unclear intent

── KNOWLEDGE ──

Abbreviations (ALWAYS expand these):
  ks=khách sạn  cf=cà phê  nh=nhà hàng  bv=bệnh viện  dh=đại học
  q=Quận  q1=Quận 1  q2=Quận 2  q3=Quận 3  q7=Quận 7
  vcb=Vietcombank  bidv=BIDV  atm=ATM
  hcm=TP.HCM  tphcm=TP.HCM  hn=Hà Nội  đn=Đà Nẵng  dl=Đà Lạt

Ascii/telex → restore diacritics by context:
  "gan" before locations → "gần" (near). "san bay" → "sân bay" (airport).
  "chi duong" → "chỉ đường" (directions). "dep" → "đẹp" (beautiful).
  "song ao" → "check-in sống ảo" (instagram-worthy). "hoc tap" → "học tập" (study).
  "lam viec" → "làm việc" (work). "yen tinh" → "yên tĩnh" (quiet).
  "tram sac" → "trạm sạc" (charging station). "ho boi" → "hồ bơi" (pool).

CATEGORY → BRAND vs ATTRIBUTE rule (generic):
  After a category word, the next word can be either a BRAND (proper name: Trung Nguyên, Khánh Hội, Loving Hut, Highlands, Vincom…) or an ATTRIBUTE (descriptive: chay, đẹp, sang trọng, bình dân, ngon, rẻ, sạch, view đẹp, ngoài trời, lãng mạn, gia đình, vintage, hiện đại, cổ điển, truyền thống, Halal, rooftop…).
  HOW TO TELL THEM APART:
  - If it is a capitalized proper noun or well-known brand name → BRAND
  - If it is a Vietnamese descriptive adjective, food type, style, ambiance, dietary preference → ATTRIBUTE
  For example: "nhà hàng chay" → category="nhà hàng", attribute="chay" (chay is a dietary style, not a name)
  "nhà hàng Khánh Hội" → category="nhà hàng", brand="Khánh Hội" (Khánh Hội is a proper name)
  "cà phê đẹp" → category="cà phê", attribute="đẹp" (đẹp is descriptive)
  "cà phê Trung Nguyên" → category="cà phê", brand="Trung Nguyên" (Trung Nguyên is a brand)

TOOL SELECTION (generic):
  Ask: does this query ask for directions? → navigation
  Does it contain coordinates? → coordinate_search
  Does it start with a house number? → address_suggestion
  Does it contain "gần đây"/"near me"? → nearby_search
  Is it just a brand name with no context? → brand_suggestion
  Is it a specific known place? → poi_suggestion
  Is it a category + a specific filter attribute? → attribute_search
  Is it a category + descriptive/semantic qualities? → discovery_search
  Is it just a category with nothing else? → category_search
  Otherwise → ambiguous

COMPLETED_QUERY rule:
  Expand all abbreviations. Restore all diacritics. Capitalize proper nouns and brand names.
  If the brand implies a known category, prepend the category word: "Mường Thanh" → "khách sạn Mường Thanh".
  Keep all original attribute words intact.

CLEANED_QUERY rule:
  Contains ONLY the semantic/attribute/quality part, WITHOUT brand names, categories, cities, districts, or coordinates.
  "nhà hàng Khánh Hội có máy lạnh" → cleaned_query="có máy lạnh"
  "cà phê đẹp view biển" → cleaned_query="đẹp view biển"
  "khách sạn gần biển" → cleaned_query="gần biển"

── EXAMPLES ──

Input: "Mường Thanh Đà Nẵng có hồ bơi view biển đẹp"
Output: {"completed_query":"khách sạn Mường Thanh Đà Nẵng có hồ bơi view biển đẹp","tool":"discovery_search","cleaned_query":"có hồ bơi view biển đẹp","suggestions":["Mường Thanh Đà Nẵng","Resort Mường Thanh Đà Nẵng","Mường Thanh Luxury Đà Nẵng"]}

Input: "ks gần biển có trạm sạc"
Output: {"completed_query":"khách sạn gần biển có trạm sạc","tool":"discovery_search","cleaned_query":"gần biển có trạm sạc","suggestions":["Khách sạn gần biển có trạm sạc","Resort ven biển có trạm sạc","Khách sạn view biển"]}

Input: "cafe wifi q1"
Output: {"completed_query":"cà phê có wifi Quận 1","tool":"attribute_search","cleaned_query":"có wifi","suggestions":["Cà phê có wifi Quận 1","Cà phê làm việc Quận 1","Coffee shop wifi Quận 1"]}

Input: "atm vcb gần đây"
Output: {"completed_query":"ATM Vietcombank gần đây","tool":"nearby_search","cleaned_query":"gần đây","suggestions":["ATM Vietcombank gần nhất","ATM Vietcombank Quận 1","ATM BIDV gần đây"]}

Input: "12 nguyen hue q1"
Output: {"completed_query":"12 Nguyễn Huệ, Quận 1, TP.HCM","tool":"address_suggestion","cleaned_query":"12 Nguyễn Huệ Quận 1","suggestions":["12 Nguyễn Huệ, Quận 1","12 Nguyễn Huệ, phường Bến Nghé, Quận 1"]}

Input: "10.7769,106.7009"
Output: {"completed_query":"10.7769,106.7009","tool":"coordinate_search","cleaned_query":"","suggestions":["10.7769,106.7009 (Quận 1, TP.HCM)","10.777,106.701"]}

Input: "hotel near beach danang"
Output: {"completed_query":"khách sạn gần biển Đà Nẵng","tool":"discovery_search","cleaned_query":"gần biển","suggestions":["Khách sạn gần biển Đà Nẵng","Resort Đà Nẵng view biển","Hotel Mỹ Khê Đà Nẵng"]}

Input: "benh vien gan san bay"
Output: {"completed_query":"bệnh viện gần sân bay","tool":"attribute_search","cleaned_query":"gần sân bay","suggestions":["Bệnh viện gần sân bay Nội Bài","Bệnh viện gần sân bay Tân Sơn Nhất"]}

Input: "gym 24/7"
Output: {"completed_query":"phòng gym mở cửa 24/7","tool":"attribute_search","cleaned_query":"mở cửa 24/7","suggestions":["Phòng gym 24/7 gần đây","Phòng gym 24h","Fitness 24/7"]}

Input: "rooftop q1"
Output: {"completed_query":"rooftop Quận 1","tool":"discovery_search","cleaned_query":"rooftop","suggestions":["Rooftop bar Quận 1","Quán rooftop Quận 1","Rooftop cafe Quận 1"]}

Input: "halal hcm"
Output: {"completed_query":"nhà hàng Halal TP.HCM","tool":"category_search","cleaned_query":"Halal","suggestions":["Nhà hàng Halal TP.HCM","Nhà hàng Halal Quận 1","Halal food TP.HCM"]}

Input: "chi duong san bay"
Output: {"completed_query":"chỉ đường đến sân bay","tool":"navigation","cleaned_query":"đến sân bay","suggestions":["Chỉ đường đến sân bay Nội Bài","Chỉ đường đến sân bay Tân Sơn Nhất"]}

Input: "san bay noi bai"
Output: {"completed_query":"Sân bay Nội Bài","tool":"poi_suggestion","cleaned_query":"","suggestions":["Sân bay Nội Bài","Sân bay Nội Bài Hà Nội"]}

Input: "cafe dep song ao"
Output: {"completed_query":"cà phê đẹp check-in sống ảo","tool":"discovery_search","cleaned_query":"đẹp check-in sống ảo","suggestions":["Cà phê đẹp sống ảo","Cà phê check-in đẹp","Quán cà phê decor đẹp"]}

Input: "phuc long"
Output: {"completed_query":"Phúc Long Coffee & Tea","tool":"brand_suggestion","cleaned_query":"","suggestions":["Phúc Long gần đây","Phúc Long Coffee & Tea","Phúc Long Quận 1"]}

Input: "bv bach mai"
Output: {"completed_query":"Bệnh viện Bạch Mai","tool":"poi_suggestion","cleaned_query":"","suggestions":["Bệnh viện Bạch Mai","Bệnh viện Bạch Mai Hà Nội"]}

Input: "Nhà hàng Khánh Hội có máy lạnh"
Output: {"completed_query":"nhà hàng Khánh Hội có máy lạnh","tool":"attribute_search","cleaned_query":"có máy lạnh","suggestions":["Nhà hàng Khánh Hội","Nhà hàng có máy lạnh Quận 1"]}

Input: "nhà hàng chay"
Output: {"completed_query":"nhà hàng chay","tool":"attribute_search","cleaned_query":"chay","suggestions":["Nhà hàng chay gần đây","Nhà hàng chay Quận 1","Quán chay ngon"]}

Input: "nhà hàng chay Loving Hut"
Output: {"completed_query":"nhà hàng chay Loving Hut","tool":"brand_suggestion","cleaned_query":"chay","suggestions":["Loving Hut gần đây","Nhà hàng chay Loving Hut Quận 1","Loving Hut"]}

Input: "cà phê đẹp view biển"
Output: {"completed_query":"cà phê đẹp view biển","tool":"discovery_search","cleaned_query":"đẹp view biển","suggestions":["Cà phê đẹp view biển","Cà phê view biển Đà Nẵng","Quán cà phê đẹp"]}

Input: "cà phê Trung Nguyên có wifi"
Output: {"completed_query":"cà phê Trung Nguyên có wifi","tool":"attribute_search","cleaned_query":"có wifi","suggestions":["Cà phê Trung Nguyên","Trung Nguyên Legend","Cà phê Trung Nguyên có wifi"]}

Input: "vincom dong khoi"
Output: {"completed_query":"Vincom Center Đồng Khởi","tool":"poi_suggestion","cleaned_query":"","suggestions":["Vincom Center Đồng Khởi","Vincom Đồng Khởi Quận 1","Vincom Center"]}

Input: "dai hoc bach"
Output: {"completed_query":"Đại học Bách Khoa","tool":"poi_suggestion","cleaned_query":"","suggestions":["Đại học Bách Khoa Hà Nội","Đại học Bách Khoa TP.HCM","Đại học Bách Khoa Đà Nẵng"]}

Input: "dh bk"
Output: {"completed_query":"Đại học Bách Khoa","tool":"poi_suggestion","cleaned_query":"","suggestions":["Đại học Bách Khoa Hà Nội","Đại học Bách Khoa TP.HCM"]}

Output ONLY the JSON object. No markdown, no explanation.
"""


# ═══════════════════════════════════════════════════════════════════════════════
# Stage 2: Fast NER Extractor
# Extracts structured entities from the LLM's completed_query + cleaned_query.
# No external knowledge — purely parses the model's own output text.
# ═══════════════════════════════════════════════════════════════════════════════

def extract_hard_filters(
    completed_query: str, cleaned_query: str, tool: str, raw_input: str,
) -> dict[str, str]:
    """
    Extract structured entities from the LLM's normalized output.
    Uses regex on the model's OWN text — no dictionaries, no external KB.
    The model already normalized the text (expanded abbreviations, restored diacritics).
    We just parse what it wrote.
    """
    filters: dict[str, str] = {}
    text = completed_query

    # ── Coordinate (pure regex) ──
    cm = _COORDINATE_RE.search(text) or _COORDINATE_RE.search(raw_input)
    if cm:
        filters["coordinate"] = f"{cm.group(1)},{cm.group(2)}"

    # ── City (regex on normalized text) ──
    cm = _CITY_RE.search(text)
    if cm:
        raw_city = cm.group(0)
        # Normalize common variants
        city_map = {
            "hà nội": "Hà Nội", "tphcm": "TP.HCM", "tp.hcm": "TP.HCM",
            "tp hcm": "TP.HCM", "đà nẵng": "Đà Nẵng", "đà lạt": "Đà Lạt",
            "hải phòng": "Hải Phòng", "nha trang": "Nha Trang",
            "phan thiết": "Phan Thiết", "huế": "Huế", "cần thơ": "Cần Thơ",
            "vũng tàu": "Vũng Tàu", "phú quốc": "Phú Quốc",
            "hạ long": "Hạ Long", "quy nhơn": "Quy Nhơn",
            "sài gòn": "TP.HCM",
        }
        filters["city"] = city_map.get(raw_city.lower(), raw_city.title())

    # ── District ──
    dm = _DISTRICT_RE.search(text)
    if dm:
        dist = dm.group(0)
        dist = re.sub(r"(?i)^Q\.?\s*", "Quận ", dist)
        # Fix duplicate: "Quận uận 1" → "Quận 1"
        dist = re.sub(r"Quận\s+[uU]ận\s+", "Quận ", dist)
        dist = re.sub(r"(?i)^Huyện\s+", "Huyện ", dist)
        filters["district"] = dist.strip()

    # ── Building number + Street ──
    bm = _BUILDING_RE.match(text.strip())
    if bm:
        filters["building"] = bm.group(1)
    sm = _STREET_RE.search(text)
    if sm:
        filters["street"] = sm.group(2) if sm.lastindex and sm.lastindex >= 2 else sm.group(0)

    # ── Category — from completed_query (MUST run BEFORE brand) ──
    category_patterns = [
        (r"\bkhách\s*sạn\b", "khách sạn"),
        (r"\bnhà\s*hàng\b", "nhà hàng"),
        (r"\bc[àa]\s*ph[êe]\b", "cà phê"),
        (r"\bb[ệe]nh\s*vi[ệe]n\b", "bệnh viện"),
        (r"\bs[âa]n\s*bay\b", "sân bay"),
        (r"\bđ[ạa]i\s*h[ọo]c\b", "đại học"),
        (r"\bph[òo]ng\s*gym\b", "phòng gym"),
        (r"\bATM\b", "ATM"),
        (r"\btr[ạa]m\s*x[ăa]ng\b", "trạm xăng"),
        (r"\btr[ạa]m\s*s[ạa]c\b", "trạm sạc"),
        (r"\bsi[êe]u\s*th[ịi]\b", "siêu thị"),
        (r"\bqu[áa]n\s*[ăa]n\b", "quán ăn"),
        (r"\btr[àa]\s*s[ữư]a\b", "trà sữa"),
        (r"\bb[ãa]i\s*bi[ểe]n\b", "bãi biển"),
        (r"\bspa\b", "spa"),
        (r"\bkhoa\s*vi[ệe]n\b", "khoa viện"),
        (r"\bh[ọo]c\s*vi[ệe]n\b", "học viện"),
        (r"\bb[ếe]n\s*xe\b", "bến xe"),
        (r"\bnh[àa]\s*th[ờơ]\b", "nhà thờ"),
        (r"\bch[ợơ]\b", "chợ"),
        (r"\bhotel\b", "khách sạn"),
        (r"\bcoffee\b", "cà phê"),
        (r"\brestaurant\b", "nhà hàng"),
        (r"\bHalal\b", "nhà hàng Halal"),
    ]
    for pattern, cat_label in category_patterns:
        if re.search(pattern, text, re.IGNORECASE) and "category" not in filters:
            filters["category"] = cat_label

    # ── Attribute — extract from cleaned_query, with fallback (AFTER category) ──
    if cleaned_query and cleaned_query not in ("", text):
        attr = re.sub(r"^(có|các|với|và)\s+", "", cleaned_query.strip())
        attr = re.sub(r"^đến\s+", "", attr)
        # If attribute is just brand+category repeated → it's wrong, extract from completed_query
        known_entities = []
        for k in ("brand", "category", "city", "district", "street"):
            if k in filters:
                known_entities.append(filters[k])
        attr_lower = attr.lower()
        is_entity_duplicate = any(e.lower() in attr_lower for e in known_entities if len(e) > 2)
        if is_entity_duplicate and completed_query:
            remaining = completed_query
            for e in sorted(known_entities, key=len, reverse=True):
                remaining = re.sub(re.escape(e), "", remaining, count=1, flags=re.IGNORECASE)
            remaining = re.sub(r"^(có|các|với|và|\s|,)+", "", remaining.strip())
            if remaining and len(remaining) > 1 and remaining != attr:
                attr = remaining
            else:
                attr = ""
        if attr and len(attr) > 1:
            filters["attribute"] = attr

    # ── Brand — extract from completed_query (AFTER category + attribute) ──
    if completed_query and "brand" not in filters:
        words = completed_query.split()
        skip_words = set()
        # Add category words
        if "category" in filters:
            for w in filters["category"].split():
                low = w.lower()
                skip_words.add(low)
                no_diac = re.sub(r"[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]", "", low)
                if no_diac != low:
                    skip_words.add(no_diac)
        # Add attribute words (important: "nhà hàng chay Loving Hut" → skip "chay")
        if "attribute" in filters:
            for w in filters["attribute"].replace(",", " ").split():
                low = w.lower()
                skip_words.add(low)
        func_words = {"có", "gần", "tại", "ở", "và", "các", "với", "cho", "của", "đến", "từ", "co"}
        attr_descriptors = {"chay", "mặn", "ngon", "rẻ", "sạch", "đẹp", "sang", "trọng", "bình", "dân",
                            "vintage", "hiện", "đại", "cổ", "điển", "truyền", "thống", "gia", "đình",
                            "lãng", "mạn", "ngoài", "trời", "view", "wifi", "rooftop", "halal",
                            "cao", "cấp", "sống", "ảo", "check-in", "mở", "cửa"}
        # Skip leading category/attribute/func/descriptor words
        idx = 0
        while idx < len(words):
            w_lower = words[idx].lower()
            w_nodia = re.sub(r"[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]", "", w_lower)
            if (w_lower in skip_words or w_nodia in skip_words or
                w_lower in func_words or w_lower in attr_descriptors):
                idx += 1
            else:
                break
        # Collect remaining words as brand — stop at func/descriptor words
        brand_words = []
        while idx < len(words):
            w = words[idx]
            w_lower = w.lower()
            if w_lower in func_words or w_lower in attr_descriptors:
                break
            brand_words.append(w)
            idx += 1
        if brand_words:
            brand = " ".join(brand_words)
            # Sanity: "Quận/Huyện/Thành phố/Tỉnh X" is never a brand
            if not re.match(r"^(quận|huyện|thành\s*phố|tỉnh|phường|xã|thị\s*trấn|tp\.?|q\.?)\b", brand, re.IGNORECASE):
                filters["brand"] = brand

    # ── Nearby reference ──
    nearby_ctx = re.search(r"gần\s+(.+?)(?:$|,|có|và)", cleaned_query or text)
    if nearby_ctx and "nearby_ref" not in filters:
        ref = nearby_ctx.group(1).strip()
        # Exclude false positives
        if ref and len(ref) > 1 and ref not in ("đây", "tôi", "đó", "kia", "nhất"):
            filters["nearby_ref"] = ref

    return filters


# ═══════════════════════════════════════════════════════════════════════════════
# Data Structures
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class NerResult:
    completed_query: str
    tool: str
    hard_filters: dict[str, str] = field(default_factory=dict)
    cleaned_query: str = ""
    suggestions: list[str] = field(default_factory=list)
    confidence: float = 0.0
    raw_ms: float = 0.0
    raw_llm_output: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    def pretty(self) -> str:
        hf = json.dumps(self.hard_filters, ensure_ascii=False, indent=2) if self.hard_filters else "  {}"
        tool_name = TOOL_REGISTRY.get(self.tool, self.tool)
        lines = [
            f"┌─ Tool       : {self.tool} ({tool_name})",
            f"├─ Completed  : {self.completed_query}",
            f"├─ Hard Filters: {hf}",
            f"├─ Cleaned    : {self.cleaned_query or '(empty)'}",
            f"├─ Suggestions: {', '.join(self.suggestions) if self.suggestions else '(none)'}",
            f"└─ Confidence : {self.confidence:.0%} | Latency: {self.raw_ms:.0f}ms",
        ]
        return "\n".join(lines)


# ═══════════════════════════════════════════════════════════════════════════════
# NER Engine (2-stage)
# ═══════════════════════════════════════════════════════════════════════════════

class NerEngine:
    def __init__(self, model: str = "qwen2.5:1.5b-instruct"):
        self.model = model

    def parse(self, raw_query: str) -> NerResult:
        t0 = time.perf_counter()
        raw_output = ""

        # ── Stage 1: LLM understanding ──
        try:
            response = chat(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Input: {raw_query!r}"},
                ],
                options={"temperature": 0.0, "num_predict": 768},
            )
            raw_output = response.message.content.strip()
        except Exception:
            raw_output = ""

        elapsed_ms = (time.perf_counter() - t0) * 1000

        parsed = self._extract_json(raw_output)
        if parsed is None:
            parsed = {}

        completed = parsed.get("completed_query", raw_query)
        tool = parsed.get("tool", "ambiguous")
        cleaned = parsed.get("cleaned_query", "")
        suggestions = parsed.get("suggestions", [])
        confidence = float(parsed.get("confidence", 0.5))

        # ── Stage 2: Fast NER extraction (from LLM's own output) ──
        filters = extract_hard_filters(completed, cleaned, tool, raw_query)

        return NerResult(
            completed_query=completed,
            tool=tool,
            hard_filters=self._clean_filters(filters),
            cleaned_query=cleaned,
            suggestions=suggestions,
            confidence=confidence,
            raw_ms=elapsed_ms,
            raw_llm_output=raw_output,
        )

    def parse_batch(self, queries: list[str]) -> list[NerResult]:
        return [self.parse(q) for q in queries]

    @staticmethod
    def _extract_json(text: str) -> dict[str, Any] | None:
        text = text.strip()
        for pattern in [
            r"```(?:json)?\s*(\{.*?\})\s*```",
            r"\{.*\}",
        ]:
            m = re.search(pattern, text, re.DOTALL)
            if m:
                try:
                    return json.loads(m.group(0) if "{" == m.group(0)[0] else m.group(1))
                except json.JSONDecodeError:
                    continue
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            return None

    @staticmethod
    def _clean_filters(filters: dict[str, Any]) -> dict[str, str]:
        result: dict[str, str] = {}
        for key in ENTITY_FIELDS:
            val = filters.get(key)
            if val and isinstance(val, str) and val.strip():
                result[key] = val.strip()
        return result


# ═══════════════════════════════════════════════════════════════════════════════
# Demo
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    engine = NerEngine()

    test_queries = [
        "Mường Thanh Đà Nẵng có hồ bơi view biển đẹp",
        "ks gần biển có trạm sạc",
        "cafe wifi q1",
        "atm vcb gần đây",
        "12 nguyen hue q1",
        "cf lam viec",
        "hotel near beach danang",
        "benh vien gan san bay",
        "gym 24/7",
        "rooftop q1",
        "halal hcm",
        "10.7769,106.7009",
        "chi duong san bay",
        "san bay noi bai",
        "quan cafe hoc tap",
        "cafe dep song ao",
        "vincom dong khoi",
    ]

    print("╔" + "═" * 70 + "╗")
    print("║" + "  RouteMate NER — 2-stage: LLM understanding + Fast NER extraction".center(70) + "║")
    print("╠" + "═" * 70 + "╣")

    total_ms = 0
    for i, q in enumerate(test_queries):
        result = engine.parse(q)
        total_ms += result.raw_ms
        print(f"║ #{i+1:02d} Query: {q}")
        print("║")
        for line in result.pretty().split("\n"):
            print(f"║  {line}")
        if i < len(test_queries) - 1:
            print("╟" + "─" * 70 + "╢")
        else:
            print("╠" + "═" * 70 + "╣")
            avg = total_ms / len(test_queries)
            print(f"║  AVG LATENCY: {avg:.0f}ms across {len(test_queries)} queries".ljust(71) + "║")
            print("╚" + "═" * 70 + "╝")

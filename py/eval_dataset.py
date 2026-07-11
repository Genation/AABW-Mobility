"""
Dataset loader for Track 4 — AI Maps Public Evaluation.
Reads the CSV and normalizes test cases for NER evaluation.
"""

from __future__ import annotations

import csv
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

CSV_PATH = Path(__file__).resolve().parents[1] / "backend" / "docs" / "track_4_dataset" / "ai_maps_track4_dataset_participants.xlsx - Public Evaluation.csv"

# Map expected_suggestion_type → ner tool
TOOL_MAP: dict[str, str] = {
    "Brand Suggestions": "brand_suggestion",
    "Category Suggestions": "category_search",
    "Nearby Suggestions": "nearby_search",
    "POI Suggestions": "poi_suggestion",
    "Discovery Search": "discovery_search",
    "Category Search": "category_search",
    "Attribute Search": "attribute_search",
    "Navigation": "navigation",
    "Address Suggestions": "address_suggestion",
    "Coordinate Search": "coordinate_search",
    "Ambiguous": "ambiguous",
}

# Map expected_top_suggestions segments → entity hints
# Format: "Suggestion1; Suggestion2" — first segment hints at expected entities
SUGGESTION_HINTS: dict[str, dict[str, list[str]]] = {
    "PUB001": {"brand": ["Vincom", "Vinmec", "Vinpearl"]},
    "PUB002": {"category": ["cà phê", "coffee"]},
    "PUB003": {"category": ["ATM"], "nearby": ["gần"]},
    "PUB004": {"street": ["Nguyễn Huệ"], "district": ["Quận 1"], "city": ["TP.HCM"]},
    "PUB005": {"brand": ["Chợ Bến Thành"], "category": ["khách sạn"]},
    "PUB006": {"category": ["khách sạn"], "city": ["Đà Nẵng"], "attribute": ["gần biển"]},
    "PUB007": {"brand": ["Bạch Mai"], "category": ["bệnh viện"]},
    "PUB008": {"category": ["cây xăng"], "nearby": ["gần"]},
    "PUB009": {"brand": ["Phở Thìn Lò Đúc"]},
    "PUB010": {"category": ["cà phê", "coffee"], "nearby": ["near me", "gần"]},
    "PUB011": {"street": ["Nguyễn Huệ"], "district": ["Quận 1"]},
    "PUB012": {"brand": ["Vincom Center Đồng Khởi"]},
    "PUB013": {"category": ["ATM"], "brand": ["Vietcombank"], "district": ["Quận 1", "Quận 7"]},
    "PUB014": {"category": ["quán ăn"], "attribute": ["mở cửa khuya", "ăn đêm"]},
    "PUB015": {"category": ["trà sữa"]},
    "PUB016": {"category": ["khách sạn", "hotel"], "city": ["Đà Nẵng"], "attribute": ["gần biển"]},
    "PUB017": {"brand": ["Nội Bài"], "category": ["sân bay"]},
    "PUB018": {"category": ["ATM"], "nearby_ref": ["sân bay Nội Bài"]},
    "PUB019": {"brand": ["Galaxy"]},
    "PUB020": {"brand": ["Big C", "GO!"]},
    "PUB021": {"category": ["cà phê"], "attribute": ["học tập", "Wi-Fi"]},
    "PUB022": {"building": ["12"], "street": ["Nguyễn Huệ"], "city": ["TP.HCM"]},
    "PUB023": {"building": ["12"], "street": ["Nguyễn Huệ"], "district": ["Quận 1"]},
    "PUB024": {"category": ["trạm xăng", "cây xăng"], "nearby": ["gần"]},
    "PUB025": {"brand": ["WinMart"]},
    "PUB026": {"brand": ["Lotte"]},
    "PUB027": {"category": ["quán ăn"], "city": ["Hà Nội"]},
    "PUB028": {"city": ["Đà Lạt"], "attribute": ["check-in"]},
    "PUB029": {"district": ["Quận 1"], "attribute": ["rooftop"]},
    "PUB030": {"category": ["cà phê"], "attribute": ["Wi-Fi"]},
    "PUB031": {"category": ["nhà hàng chay", "quán chay"]},
    "PUB032": {"city": ["TP.HCM"], "category": ["halal", "nhà hàng"]},
    "PUB033": {"brand": ["Mỹ Khê"], "category": ["bãi biển"]},
    "PUB034": {"category": ["khách sạn"], "nearby_ref": ["biển Mỹ Khê"]},
    "PUB035": {"brand": ["Bách Khoa"], "category": ["đại học"]},
    "PUB036": {"brand": ["Bách Khoa"], "category": ["đại học"]},
    "PUB037": {"brand": ["Phúc Long"]},
    "PUB038": {"brand": ["Cộng Cà Phê"]},
    "PUB039": {"nearby_ref": ["Hồ Gươm"], "category": ["cà phê"]},
    "PUB040": {"brand": ["Pizza 4P's"]},
    "PUB041": {"category": ["sửa xe"]},
    "PUB042": {"category": ["garage", "ô tô"]},
    "PUB043": {"category": ["chợ Bến Thành", "bến xe"]},
    "PUB044": {"category": ["sân bay"]},
    "PUB045": {"coordinate": ["10.7769,106.7009"]},
    "PUB046": {"category": ["cây xăng", "trạm dừng"]},
    "PUB047": {"category": ["nhà hàng"], "attribute": ["trẻ em"]},
    "PUB048": {"category": ["cà phê"], "attribute": ["làm việc", "Wi-Fi"]},
    "PUB049": {"category": ["ATM"], "brand": ["BIDV"]},
    "PUB050": {"category": ["bệnh viện"], "nearby_ref": ["sân bay"]},
    "PUB051": {"category": ["spa"]},
    "PUB052": {"category": ["phòng gym"], "attribute": ["24/7"]},
    "PUB053": {"category": ["siêu thị"]},
    "PUB054": {"category": ["quán nướng"], "district": ["Quận 7"]},
    "PUB055": {"category": ["cà phê"], "attribute": ["yên tĩnh"]},
    "PUB056": {"category": ["khách sạn", "hotel"], "city": ["Đà Nẵng"], "attribute": ["gần biển"]},
    "PUB057": {"brand": ["Miền Đông"], "category": ["bến xe"]},
    "PUB058": {"category": ["học viện", "trung tâm đào tạo"]},
    "PUB059": {"category": ["ăn vặt"]},
    "PUB060": {"category": ["cà phê"], "attribute": ["đẹp", "check-in"]},
}


@dataclass
class TestCase:
    case_id: str
    input_prefix: str
    expected_tool: str
    expected_suggestions: list[str]
    difficulty: str
    skills_tested: list[str]
    entity_hints: dict[str, list[str]] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return {
            "case_id": self.case_id,
            "input_prefix": self.input_prefix,
            "expected_tool": self.expected_tool,
            "expected_suggestions": self.expected_suggestions,
            "difficulty": self.difficulty,
            "skills_tested": self.skills_tested,
            "entity_hints": self.entity_hints,
        }


def load_dataset(csv_path: str | None = None) -> list[TestCase]:
    path = Path(csv_path) if csv_path else CSV_PATH
    cases: list[TestCase] = []

    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            cid = row.get("case_id", "").strip()
            if not cid:
                continue

            tool = TOOL_MAP.get(row.get("expected_suggestion_type", "").strip(), "ambiguous")
            suggestions = [
                s.strip()
                for s in row.get("expected_top_suggestions", "").split(";")
                if s.strip()
            ]
            skills = [
                s.strip()
                for s in row.get("skills_tested", "").split(";")
                if s.strip()
            ]

            cases.append(TestCase(
                case_id=cid,
                input_prefix=row.get("input_prefix", "").strip(),
                expected_tool=tool,
                expected_suggestions=suggestions,
                difficulty=row.get("difficulty", "Medium").strip(),
                skills_tested=skills,
                entity_hints=SUGGESTION_HINTS.get(cid, {}),
            ))

    return cases


if __name__ == "__main__":
    cases = load_dataset()
    print(f"Loaded {len(cases)} test cases")
    for c in cases[:5]:
        print(f"  {c.case_id}: '{c.input_prefix}' → {c.expected_tool} [{c.difficulty}]")

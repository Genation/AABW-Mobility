"""Run deterministic edge-case gates and record qualitative audit outputs."""
from __future__ import annotations

import os
from pathlib import Path

from tascomaps.core.text import fold, normalize
from tascomaps.core.understand import understand
from tascomaps.data.loader import load_kb
from tascomaps.engines.semantic_search import SemanticSearchEngine
from tascomaps.engines.trie import TrieAutocomplete


ROOT = Path(__file__).resolve().parents[1]

# Frozen from the first run against the pre-SPEC005 branch. This is reporting
# evidence only; runtime engines never consume these labels.
BASELINE_FAILURES = {
    "A04", "A08c", "A10b", "A18", "A20", "A22",
    "B15-POLARITY", "B-CATEGORY-POLARITY", "B33", "B34", "B35",
    "C-DISH", "C-DIVERSITY",
}
def main() -> int:
    kb = load_kb()
    autocomplete = TrieAutocomplete(kb)
    search = SemanticSearchEngine(kb)
    checks: list[tuple[str, bool, str]] = []

    def check(case_id: str, condition: bool, detail: str) -> None:
        checks.append((case_id, bool(condition), detail))

    def suggestions(query: str) -> list[str]:
        return [
            row["display"]
            for row in autocomplete.suggest(query, top_k=8)["suggestions"]
        ]

    for case_id, query, expected in (
        ("A01", "hgihlands", "highlands"),
        ("A04", "pho4p", "pizza 4p"),
        ("A18", "hcmc", "ho chi minh"),
        ("A22", "big c", "go"),
    ):
        rows = suggestions(query)
        if case_id == "A18":
            matched = any(expected in fold(row) for row in rows)
        elif case_id == "A22":
            matched = any(
                fold(row) == expected or fold(row).startswith(expected + " ")
                for row in rows
            )
        else:
            matched = any(expected in fold(row) for row in rows)
        check(case_id, matched, repr(rows))

    for case_id, query in (("A08a", "Phở"), ("A08b", "Phơ"), ("A08c", "Phỡ")):
        rows = suggestions(query)
        check(case_id, any("phở" in normalize(row) for row in rows), repr(rows))

    for case_id, query in (("A10a", "Đà Nẵng"), ("A10b", "Dà Nãng"),
                           ("A10c", "da nang")):
        rows = suggestions(query)
        check(case_id, any("da nang" in fold(row) for row in rows), repr(rows))

    go_rows = suggestions("go")
    first_go = fold(go_rows[0]) if go_rows else ""
    check("A20", first_go == "go" or first_go.startswith("go "), repr(go_rows))

    typo = understand("chữa hàng tiện lợi", kb)
    check("B-TYPO", typo.normalized_query == "Cửa hàng tiện lợi",
          repr(typo.to_dict()))

    meat = understand("quán ăn không thịt và gần sân bay", kb)
    check("B15-POLARITY", fold(meat.entities.get("dish", "")) != "thit",
          repr(meat.to_dict()))
    check("B15-CLAUSE", any(
        "san bay" in fold(str(meat.entities.get(key, "")))
        for key in ("reference_poi", "reference_area", "location")
    ), repr(meat.to_dict()))

    negative_category = understand("không phải nhà hàng", kb)
    check("B-CATEGORY-POLARITY",
          fold(negative_category.entities.get("category", "")) != "nha hang",
          repr(negative_category.to_dict()))

    for case_id, query, expected in (
        ("B33", "book cafe", "Book Cafe"),
        ("B34", "garden cafe", "Garden Cafe"),
        ("B35", "specialty coffee", "Specialty Coffee"),
    ):
        parsed = understand(query, kb)
        check(case_id, parsed.entities.get("sub_category") == expected,
              repr(parsed.to_dict()))

    brand = search.search("Circle K", top_k=5)
    check("P7-BRAND", bool(brand["results"]) and all(
        "circle k" in fold(row["name"]) for row in brand["results"]
    ), repr([row["name"] for row in brand["results"]]))

    dish = search.search("best pho hn", top_k=5)
    check("C-DISH", bool(dish["results"]) and all(
        "phở" in normalize(row["name"]) for row in dish["results"]
    ), repr([row["name"] for row in dish["results"]]))

    atm = search.search("atm 24/7", top_k=8)
    atm_names = [fold(row["name"]) for row in atm["results"]]
    check("C-DIVERSITY", bool(atm_names)
          and len(atm_names) == len(set(atm_names)), repr(atm_names))

    audits = []
    for case_id, query in (
        ("B01", "đói bụng quá"),
        ("B02", "trời mưa quá"),
        ("B05", "đau bụng"),
        ("B06", "mệt quá muốn nghỉ"),
        ("B07", "xe hết điện"),
    ):
        parsed = understand(query, kb)
        audits.append((case_id, query, parsed.intent, parsed.entities))

    beach = search.search("khách sạn gần biển", top_k=5)
    audits.append((
        "C15", "khách sạn gần biển", beach["diagnostics"]["status"],
        [row["name"] for row in beach["results"]],
    ))

    lines = [
        "# Edge-Case Matrix",
        "",
        "## Deterministic Gates",
        "",
        "| Case | Baseline | Current | Detail |",
        "|---|---|---|---|",
    ]
    for case_id, passed, detail in checks:
        escaped = detail.replace("|", "\\|").replace("\n", " ")
        baseline = "FAIL" if case_id in BASELINE_FAILURES else "PASS"
        lines.append(
            f"| {case_id} | {baseline} | {'PASS' if passed else 'FAIL'} | {escaped} |"
        )
    lines.extend(["", "## Qualitative Audit", "", "```text"])
    lines.extend(repr(row) for row in audits)
    lines.extend(["```", ""])
    invocation = "forced_tfidf" if os.getenv("TASCO_DISABLE_EMBED") else "default"
    report = ROOT / "artifacts" / f"edge_case_matrix_{invocation}.md"
    lines.insert(2, f"Backend: `{search.index.embedder.kind}`; invocation: `{invocation}`")
    lines.insert(3, "")
    report.write_text("\n".join(lines), encoding="utf-8")

    failures = [case_id for case_id, passed, _ in checks if not passed]
    print(f"deterministic={len(checks)} passed={len(checks) - len(failures)} "
          f"failed={len(failures)}")
    if failures:
        print("failed cases:", ", ".join(failures))
    print(f"backend={search.index.embedder.kind} report={report}")
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())

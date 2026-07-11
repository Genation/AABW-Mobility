# P6/P7 Query Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> sdlc:subagent-driven-development (recommended) or sdlc:executing-plans to
> implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for
> tracking.

**Goal:** Canonicalize confidently recovered P6 categories and let P7 rank safely grounded bare-brand branches.

**Architecture:** Keep P6's parser output intact, but make normalized text prefer a grounded canonical category. Add a narrow P7 adapter that converts only a uniquely grounded `brand_or_branch` ambiguity into an internal brand-search understanding while preserving the original P6 response for clients.

**Tech Stack:** Python 3, `unittest`, deterministic KB loader, hybrid semantic search engine.

---

### Task 1: Canonical category normalization

**Files:**

- Modify: `ml-service/tests/test_model_improvements.py`
- Modify: `ml-service/tascomaps/core/understand.py`

- [ ] Add a regression test asserting `chữa hàng tiện lợi` has canonical category and normalized query.
- [ ] Run the focused test and confirm it fails because normalized text retains the typo.
- [ ] Render a grounded category-only query from `entities.category` before the reconstruction fallback.
- [ ] Run the focused test and existing model-improvement tests until green.

### Task 2: Actionable bare-brand ranking

**Files:**

- Modify: `ml-service/tests/test_model_improvements.py`
- Modify: `ml-service/tascomaps/engines/semantic_search.py`

- [ ] Add regression tests asserting `Circle K` returns only Circle K branches, casing is stable, OOD ambiguity stays blocked, and `Circle K gần tôi` still needs coordinates.
- [ ] Run the focused tests and confirm the bare-brand case fails with `ambiguous_query`.
- [ ] Add a helper that resolves `brand_or_branch` to exactly one KB-grounded brand and creates an internal brand-search understanding.
- [ ] Use the internal understanding for identity filtering/ranking while retaining the original understanding in the response.
- [ ] Run focused P6/P7 tests until green.

### Task 3: Verification

**Files:**

- Modify: `.sdlc/SPEC004-p6-p7-query-canonicalization/tasks.md`

- [ ] Run all ML service unit tests.
- [ ] Run repository diff checks and inspect the final diff for unrelated edits.
- [ ] Update task status with exact verification evidence.


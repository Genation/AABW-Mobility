# Search Edge-Case Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> sdlc:subagent-driven-development (recommended) or sdlc:executing-plans to
> implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for
> tracking.

**Goal:** Harden P9, P6, and P7 against the deterministic edge-case failures while preserving API contracts and existing quality gates.

**Architecture:** Add typed, provenance-aware access surfaces to the shared KB; use them in autocomplete before fuzzy fallback. Add bounded polarity spans and a separate subcategory registry in P6, then enforce explicit dish/subcategory identity and display diversity in P7. Keep qualitative/data-quality cases as audits rather than fabricating runtime truth.

**Tech Stack:** Python 3.12, `unittest`, RapidFuzz, existing deterministic KB, TrieAutocomplete, SemanticSearchEngine.

---

### Task 1: Shared query access surfaces

**Files:**

- Modify: `ml-service/tascomaps/data/kb.py`
- Modify: `ml-service/tascomaps/constants.py`
- Modify: `ml-service/tascomaps/data/loader.py`
- Test: `ml-service/tests/test_model_improvements.py`

- [ ] **Step 1: Add failing typed-surface tests**

Assert that the loaded KB resolves `hcmc` to city `TP Hồ Chí Minh`, `big c` to
brand `GO!`, and `pho4p` to the Pizza 4P's POI family. Assert that unknown and
multi-target surfaces do not resolve uniquely.

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
cd ml-service
python -m unittest tests.test_model_improvements -v
```

Expected: the three access-surface assertions fail because the KB has no typed
registry.

- [ ] **Step 3: Add the minimal data model**

Add a frozen record and registry:

```python
@dataclass(frozen=True)
class QuerySurface:
    surface: str
    canonical: str
    entity_type: str
    provenance: str

# KnowledgeBase
query_surfaces: Dict[str, List[QuerySurface]] = field(default_factory=dict)
```

Provide a loader helper that keys by `fold(surface)`, deduplicates the complete
record, and never silently replaces an existing target.

- [ ] **Step 4: Register approved surfaces in the data layer**

Define versioned approved seeds in `constants.py`, load them through the helper,
and link POI-family corrections to canonical brands/names already present in the
KB. Do not add conditionals to `suggest()` or `understand()`.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run the Task 1 tests and the existing loader/model-improvement suites.

### Task 2: P9 evidence ordering and diacritic recovery

**Files:**

- Modify: `ml-service/tascomaps/engines/trie.py`
- Test: `ml-service/tests/test_first_word_fallback.py`
- Test: `ml-service/tests/test_model_improvements.py`

- [ ] **Step 1: Add failing autocomplete regressions**

Cover `pho4p`, `Phỡ`, `Dà Nãng`, `hcmc`, `big c`, and `go`. Assert relevant
family membership and that exact GO! evidence ranks before Golden Lotus. Retain
the existing NFC/NFD and ambiguous-transposition tests.

- [ ] **Step 2: Verify RED on the reported failures**

Run only the new P9 tests and confirm each failure matches the observed empty or
misordered result.

- [ ] **Step 3: Index typed access surfaces**

Add alias postings that point to existing canonical entries and preserve an
evidence label. Expand a unique full surface before ordinary trie lookup; for
multiple targets, merge bounded candidates rather than selecting one.

- [ ] **Step 4: Add fallback-only diacritic recovery**

After strict accent filtering yields no rows, compare the typed phrase against
the already retrieved folded candidates. Accept only a unique highest scorer
with a minimum score and margin. Do not bypass `accent_prefix_compatible()` when
strict candidates exist.

- [ ] **Step 5: Make evidence class precede popularity**

Carry producer/evidence priority into fusion so normalized exact brand evidence
beats longer prefix matches. Popularity remains the tie-breaker within an
evidence class.

- [ ] **Step 6: Verify focused P9 suites**

Run:

```bash
cd ml-service
python -m unittest tests.test_first_word_fallback tests.test_model_improvements tests.test_p9_hybrid -v
```

Expected: all tests pass, including existing minimal-pair abstention.

### Task 3: P6 polarity spans

**Files:**

- Modify: `ml-service/tascomaps/core/understand.py`
- Test: `ml-service/tests/test_identity_owned_attributes.py`
- Test: `ml-service/tests/test_model_improvements.py`

- [ ] **Step 1: Add failing positive/negative pair tests**

Cover:

```text
cafe có nhạc              / cafe không có nhạc
khách sạn gần sân bay     / khách sạn không gần sân bay
quán ăn có thịt           / quán ăn không thịt
nhà hàng không phải đồ Tàu
```

Assert negative spans never emit their positive dish/reference and that
`không phải` cannot ground `giá vừa phải`.

- [ ] **Step 2: Verify RED**

Run the new tests and confirm the current positive dish/reference leakage.

- [ ] **Step 3: Add bounded semantic mentions**

Introduce an internal record:

```python
@dataclass(frozen=True)
class SemanticMention:
    start: int
    end: int
    slot: str
    canonical: str
    polarity: str = "positive"
    operator: str = "include"
```

Build negation ranges for `không`, `không có`, `không phải`, `không quá`,
`tránh`, `without`, and `no`, terminated by existing clause boundaries.

- [ ] **Step 4: Make entity extractors consume polarity**

Filter dish and reference candidates whose spans fall under negative scope.
Convert known negative attributes to `excluded_attributes`. Preserve unknown
negative mentions in internal debug/evidence rather than inventing a canonical
attribute.

- [ ] **Step 5: Verify focused P6 suites**

Run identity-owned, model-improvement, and generalization tests until green.

### Task 4: Preserve data-derived subcategories

**Files:**

- Modify: `ml-service/tascomaps/data/kb.py`
- Modify: `ml-service/tascomaps/data/loader.py`
- Modify: `ml-service/tascomaps/core/understand.py`
- Test: `ml-service/tests/test_generalization_invariants.py`

- [ ] **Step 1: Add failing corpus-derived subtype tests**

Select deterministic unique subcategories from the loaded corpus and assert P6
emits both parent `category` and canonical `sub_category`. Include Book Cafe,
Garden Cafe, and Specialty Coffee smoke cases plus an arbitrary modifier that
must not fabricate a subtype.

- [ ] **Step 2: Verify RED**

Confirm P6 currently emits only the parent category.

- [ ] **Step 3: Build a separate registry**

Add:

```python
sub_category_terms: Dict[str, tuple[str, str]] = field(default_factory=dict)
```

Populate `surface -> (canonical_subcategory, parent_category)` from live POIs.
Keep `category_terms` for parent category detection.

- [ ] **Step 4: Emit subtype without changing API shape**

When a unique subtype surface is observed, add `sub_category` beside `category`
and use it in normalized text. Collisions across parents remain unresolved.

- [ ] **Step 5: Verify subtype and full P6 tests**

Run generalization, identity-owned, and model-improvement suites.

### Task 5: P7 hard specialization constraints

**Files:**

- Modify: `ml-service/tascomaps/engines/semantic_search.py`
- Test: `ml-service/tests/test_generalization_invariants.py`
- Test: `ml-service/tests/test_production_guardrails.py`

- [ ] **Step 1: Add failing hard-identity tests**

Assert `best pho hn` returns only POIs with verified Phở evidence in Hà Nội and
may return fewer than requested. Add corpus-derived assertions that explicit
brand/category/subcategory/city results contain zero known identity violations.

- [ ] **Step 2: Verify RED**

Confirm the current result list contains non-Phở restaurants.

- [ ] **Step 3: Add specialization evidence**

Compute a tri-state match (`True`, `False`, `None`) for explicit dish/subcategory
against canonical subcategory, POI/name aliases, and verified metadata. Dense
similarity contributes ranking relevance but never a strict `True` identity.

- [ ] **Step 4: Prevent hard-identity relaxation**

Exclude known hard-identity violations before top-k slicing. Retain unknowns
with diagnostics and allow the response to be shorter than `top_k`.

- [ ] **Step 5: Verify P7 guardrails**

Run generalization, production-guardrail, and identity-owned suites.

### Task 6: Result display diversity

**Files:**

- Modify: `ml-service/tascomaps/engines/semantic_search.py`
- Test: `ml-service/tests/test_production_guardrails.py`

- [ ] **Step 1: Add a failing generic-result diversity test**

Assert `atm 24/7` top-k has unique `fold(display_name)` values. Add a branch
query control proving distinct physical branches remain visible.

- [ ] **Step 2: Verify RED**

Confirm repeated ACB display identity appears in the generic result set.

- [ ] **Step 3: Add a post-ranking diversity pass**

After physical deduplication, suppress repeated normalized display identities
only for generic category/discovery searches. Do not merge POI records and do
not apply this pass to explicit POI/brand/branch intent.

- [ ] **Step 4: Verify diversity and identity suites**

Run production guardrails and cross-track identity tests.

### Task 7: Full verification and edge-case report

**Files:**

- Create: `ml-service/scripts/edge_case_matrix.py`
- Create: `ml-service/artifacts/edge_case_matrix.md`
- Modify: `.sdlc/SPEC005-search-edge-case-hardening/tasks.md`

- [ ] **Step 1: Add a deterministic matrix runner**

The runner must separate machine-checkable assertions from qualitative audit
rows, print exact failures, and exit non-zero only for deterministic gates. It
must not load public evaluation answers into runtime engines.

- [ ] **Step 2: Run focused and full suites**

Run:

```bash
cd ml-service
python -m unittest discover -s tests
python scripts/edge_case_matrix.py
TASCO_DISABLE_EMBED=1 python scripts/edge_case_matrix.py
```

- [ ] **Step 3: Verify repository hygiene**

Run `git diff --check`, inspect the complete diff, and confirm no dataset,
cache, generated index, or unrelated frontend file is tracked.

- [ ] **Step 4: Record exact evidence**

Update `tasks.md` with test counts, matrix pass/fail counts, embedding modes,
latency summary, and any explicitly deferred qualitative cases.


# Search Edge-Case Hardening

## Summary

Harden the deterministic P9 autocomplete, P6 query-understanding, and P7
semantic-ranking pipeline against the high-confidence failures found in the
provided edge-case matrix. The work must improve reusable evidence handling,
not encode a table of expected answers.

This specification covers the first implementation batch only. It preserves
the current API response shapes and the existing P6/P7 bare-brand fixes.

## Goals

- Give P9 first-class, typed access surfaces for approved aliases and observed
  corrections.
- Recover unique diacritic mistakes only after strict accent matching produces
  no candidates.
- Represent negative query scope before extracting positive entities.
- Preserve data-derived subcategory evidence instead of collapsing it into the
  parent category.
- Treat explicit identity constraints as non-relaxable in P7.
- Separate physical deduplication from top-k display diversification.
- Add a reproducible regression matrix covering all implemented behavior.

## Non-Goals

- Deterministically guessing ambiguous health, weather, or rest needs such as
  `đau bụng`, `trời mưa quá`, or `mệt quá muốn nghỉ`.
- Treating public evaluation rows as runtime query mappings.
- Automatically correcting source facts such as an inland hotel tagged
  `gần biển`; those require a separately reviewed validation dataset.
- Replacing the deterministic pipeline with an LLM.
- Guaranteeing five results when fewer than five satisfy a hard constraint.

## Architecture

### Shared access surfaces

Extend the KB with typed query surfaces that point to a canonical entity and
record their provenance. Supported provenance includes source abbreviations,
approved aliases, historical brand aliases, and approved observed corrections.
Ambiguous surfaces must retain multiple candidates or abstain; they may not
silently select one identity.

The first approved additions are:

- `hcmc` as an alias for `TP Hồ Chí Minh`;
- `big c` as a historical alias for the `GO!` brand;
- `pho4p` as an approved observed correction for `Pizza 4P's`.

These values belong in a data/registry layer shared by P6 and P9, not in the
ranking function.

### P9 evidence order

Rank autocomplete producers by evidence class before popularity:

1. normalized exact canonical or brand surface;
2. strict accent-compatible exact prefix;
3. approved alias or abbreviation;
4. unique diacritic recovery;
5. unique bounded fuzzy recovery;
6. popular fallback.

If strict accent matching yields nothing, diacritic recovery may compare
canonical candidates. It must require a unique winner with a configured margin
and must retain existing minimal-pair abstention safeguards.

Unresolved final slots may expand only through bounded, corpus-backed
combinations. For example, a district prefix after an ATM brand may offer only
districts that contain matching ATM records.

### P6 polarity and subtype evidence

Create clause-level semantic mentions containing at least span, slot, canonical
value, polarity, and operator. Positive entity extractors must ignore mentions
under negative scope.

Required negative behavior:

- `không thịt` never emits positive dish `Thịt`;
- `không gần sân bay` never emits a positive nearby reference;
- known negated attributes remain exclusions;
- unknown negative complements remain explicit soft/unknown evidence rather
  than asserted facts.

Build a separate data-derived subcategory registry. P6 emits both the parent
`category` and a canonical `sub_category` for recognized terms such as Book
Cafe, Garden Cafe, and Specialty Coffee.

### P7 constraint policy

Classify query evidence as:

- hard identity: POI, brand, category, dish/subcategory, city, explicit
  location;
- preference: attributes, qualitative price, rating, and distance preferences;
- objective: best, popular, nearest, newest.

Known hard-identity violations must never be used to fill `top_k`. Unknown
metadata may be retained with an explicit unknown state. The response may
contain fewer results than requested.

Dish/subcategory matching uses canonical identity fields and verified metadata;
dense similarity alone cannot establish a strict dish match.

### Result diversity

Physical deduplication remains coordinate/address based. For generic category
searches, apply a display-diversity pass that prevents repeated normalized
names from occupying multiple top positions. Branch/name searches remain
exempt so distinct physical branches are still discoverable.

## Required Regression Cases

### P9

- `pho4p` returns Pizza 4P's through an approved observed surface.
- `Phở`, `Phơ`, and `Phỡ` retain a relevant Phở suggestion.
- NFC and NFD remain order-equivalent.
- `Dà Nãng` recovers Đà Nẵng only through a unique diacritic winner.
- `hcmc` returns TP.HCM-related suggestions.
- `big c` returns GO!-related suggestions.
- `go` ranks the exact GO! brand family before Golden Lotus.
- Existing ambiguous minimal-pair tests still abstain.

### P6

- Positive/negative pairs for music, meat, and airport proximity preserve
  polarity.
- `không phải đồ Tàu` does not become `giá vừa phải`.
- Book, Garden, and Specialty Coffee preserve subcategory evidence.
- Alias outputs are canonical and typed.

### P7

- `best pho hn` returns only verified Phở candidates in Hà Nội and may return
  fewer than `top_k`.
- Hard category, brand, dish/subcategory, city, and explicit location have zero
  known violations in returned results.
- Generic `atm 24/7` does not repeat the same normalized display name in top-k.
- Explicit branch search remains exempt from display diversification.

## Evaluation

- Run focused regression tests for each engine.
- Run the complete ML service suite in both configured embedding modes when
  available.
- Compare the edge-case batch before and after changes.
- Preserve OOD abstention, NFC/NFD stability, existing accent-safety tests, and
  current latency guardrails.
- Record qualitative/data-quality cases in a separate audit report; do not
  count them as automated passes without independent expected labels.

## Delivery Strategy

Implement in small TDD slices:

1. shared access surfaces and P9 evidence ordering;
2. P6 negative scope;
3. P6 subcategory preservation;
4. P7 hard dish/subcategory constraints;
5. P7 display diversification;
6. full regression and edge-case comparison.

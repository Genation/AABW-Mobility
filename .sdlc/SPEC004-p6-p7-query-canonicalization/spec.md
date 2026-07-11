# P6/P7 Query Canonicalization and Actionable Ambiguity

## Summary

Fix two related search-understanding regressions:

1. P6 may identify a fuzzy category correctly while leaving the typo in
   `normalized_query`.
2. P7 rejects a bare brand with multiple branches as ambiguous even though the
   branches form a valid ranked result set.

The implementation must use grounded semantic entities rather than special-case
the reported strings.

## Current Behavior

For `chữa hàng tiện lợi`, P6 returns category `Cửa hàng tiện lợi` but keeps
`Chữa hàng tiện lợi` as the normalized query. Fuzzy category detection and text
reconstruction currently produce conflicting representations.

For `Circle K`, P6 returns `Ambiguous` with `ambiguity_type=brand_or_branch` and
candidate branch names. P7 rejects every non-`no_match` ambiguity before
retrieval, so no branch is ranked.

## Required Behavior

### P6 canonical category normalization

- When P6 has grounded a query to a canonical category, a category-only
  normalized query must use the canonical category value.
- Existing structured category composition for attributes, brands, time,
  price, and location must remain unchanged.
- Unknown text and genuinely ambiguous queries must retain the existing
  reconstruction behavior.
- The behavior must generalize to other confidently recovered category typos;
  no query-specific typo dictionary entry may be added.

### P7 actionable brand ambiguity

- `brand_or_branch` is actionable in a ranked-search context and must proceed
  through P7 retrieval/ranking.
- Candidate branches must be restricted to the grounded brand identity; the
  change must not permit unrelated semantic results.
- Ambiguity types that do not establish a safe searchable identity must retain
  the existing empty-result behavior.
- Location-dependent behavior remains unchanged. For example, `Circle K gần
  tôi` still requires caller coordinates.
- Navigation behavior remains unchanged; selecting one destination may still
  require a specific branch or location.

## Design

### Normalized query composition

Extend P6's semantic-slot renderer so a canonical category is itself sufficient
to render a structured normalized query. This makes the entity value the source
of truth after deterministic fuzzy grounding. Preserve the reconstruction
fallback when no grounded category exists.

### Search-context ambiguity policy

At the P7 entry point, replace the blanket ambiguity rejection with an explicit
policy. Convert an actionable `brand_or_branch` understanding into the minimal
brand-search representation needed by existing identity filtering and ranking.
Keep P6's original understanding in the response so clients can still explain
that multiple branches exist.

The conversion must derive the brand from grounded KB evidence, not from an
unchecked raw substring. If a unique brand cannot be established, P7 must keep
returning `ambiguous_query`.

## Error Handling

- Empty and no-evidence queries keep their current status.
- Unresolvable actionable ambiguity falls back to `ambiguous_query` rather than
  broad semantic retrieval.
- Existing `needs_location`, `navigation_only`, `no_matches`, and
  `constraints_relaxed` statuses are unchanged.

## Tests

Add focused regression coverage proving:

- `chữa hàng tiện lợi` normalizes to `Cửa hàng tiện lợi`.
- A clean category-only query remains canonical.
- Another confidently recoverable category typo follows the same invariant.
- `Circle K` returns ranked Circle K branches and no unrelated brands.
- Bare-brand matching is casing-insensitive.
- A true ambiguous or no-evidence query remains blocked.
- Brand plus current-location wording still returns `needs_location` without
  coordinates.

Run the focused P6/P7 tests followed by the complete ML service test suite.

## Non-Goals

- Changing frontend layout or copy.
- Adding query-specific typo replacements.
- Broadening semantic retrieval for arbitrary ambiguous text.
- Changing autocomplete or navigation policy.

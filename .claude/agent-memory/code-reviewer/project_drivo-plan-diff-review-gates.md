---
name: drivo-plan-diff-review-gates
description: AABW-Mobility drivo feature plans embed red-team-reviewed diff-gates (exact line-count constraints) for phases sharing a file — verify these literally, line by line.
metadata:
  type: project
---

Plans under `plans/*-drivo-*/` (e.g. `plans/260731-0859-drivo-pretrip-ux-redesign/`) sometimes include a "Red Team Review" section in `plan.md` with a disposition table of accepted findings, and individual phase files impose explicit **diff-review gates** — e.g. "function X must diff to exactly one added line, plus dep-array update" — when two phases touch the same file in sequence (ordering enforced via "Next Steps" / phase Dependencies section).

**Why:** These gates exist because a prior red-team session found real risks in landing order and scope creep for shared-file edits (e.g. Phase 3 and Phase 4 of the pretrip-ux-redesign plan both edit `TrackDetailScreen.tsx`). The plan authors pre-negotiated exactly what each phase is allowed to change.

**How to apply:** When reviewing a phase's diff against such a plan, don't just check for compile/lint/security — literally diff the gated function bodies line-by-line against the stated constraint (e.g. "exactly one line: `onStopAdded?.(dest);`, plus dep array"). Also check the plan's "Known-intentional items" / already-accepted findings list before flagging something as an issue — many apparent smells (restricted union types instead of `string`, missing fallback behavior, eslint-disable comments) are deliberate per a locked design decision, not oversights.

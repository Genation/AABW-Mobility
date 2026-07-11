# SPEC001 — RouteMate Pitch Deck for AABW Hackathon

## Summary
Single-page scrollable HTML pitch deck for RouteMate — an AI-powered route-aware discovery experience built for Tasco Maps. Presented at AABW Hackathon by GenAI Fund. 5 sections with ~12 sub-slides, following `timeline.md` narrative flow.

## Output
- **File:** `slides/route-mate-pitch/index.html`
- **Self-contained:** All CSS/JS inline (except Chart.js CDN)
- **Language:** 100% English
- **Format:** Single-page scrollable with Intersection Observer animations

## Design System
| Token          | Value     | Usage                        |
|----------------|-----------|------------------------------|
| Surface        | `#FFFFFF` | Card backgrounds             |
| Teal-50        | `#F0FDFA` | Section backgrounds          |
| Teal-100       | `#CCFBF1` | Highlights, badges           |
| Teal-500       | `#14B8A6` | Accent elements, buttons     |
| Teal-600       | `#0D9488` | Primary brand, headings      |
| Ink            | `#0F172A` | Body text                     |
| Muted          | `#334155` | Secondary text                |
| Sponsored      | `#F59E0B` | Ad labels, monetization       |
| Indigo         | `#4F46E5` | Demo section accent           |

Font: `'Inter', system-ui, -apple-system, sans-serif`

## Slide Structure (12 sub-slides)

### Section 01 — IDENTITY & THE GRAND PROBLEM (0:00-0:45)
**Slide 1.1 — Hero**
- Full-viewport hero, teal gradient → white
- Large "RouteMate" heading with fade-up animation
- Subtitle: "Search the journey, not just the destination"
- Animated HCM → Phan Thiet route line (SVG stroke-dasharray)
- Search bar mockup: cursor blinking, "Phan..." typed with autocomplete dropdown showing "Phan Thiết"

**Slide 1.2 — The Problem**
- Scroll-triggered comparison: "Today" (red-toned pain points) vs "With RouteMate" (teal-toned solutions)
- 4 pain points each, animate in staggered

### Section 02 — THE SOLUTION (0:45-1:45)
**Slide 2.1 — Query Understanding Overview**
- Complex query input display: "ks gần biển có trạm sạc"
- 3-step summary: Query → NER Extraction → Structured Intent
- LLM as context analyzer (NOT data source) — "zero hallucination" badge

**Slide 2.2 — NER Pipeline (from p6_p7_deep_dive)**
- Horizontal pipeline: Normalize → Abbrev Expand → Span Linking → Category Detection → Reference Check → Intent Classify → Reconstruct
- Each step animates in sequence on scroll
- Color-coded: teal for text processing, indigo for AI

**Slide 2.3 — Real Example Trace**
- Worked example: "bv bach mai" → "Bệnh viện Bạch Mai"
- Input/Output boxes showing each step's transformation
- Confidence score breakdown (0.82)

### Section 03 — CREDIBILITY & ARCHITECTURE (1:45-2:30)
**Slide 3.1 — Ranking Formula**
- Visual formula: `Rank = Quality + Preference + Relevance − Detour Cost`
- 4 color-coded term blocks (teal, cyan, indigo, amber)
- Sponsored result rules (3 checkmarks)

**Slide 3.2 — Hybrid Retrieval Architecture**
- Dense embeddings + BM25 → Hybrid Score diagram
- 6 business signal weights table (from p6_p7_deep_dive)
- Semantic Search explainability: per-result reason strings

**Slide 3.3 — Performance Dashboard (from routemate_performance_dashboard)**
- Live Chart.js line chart: latency over time (target <50ms)
- Live metrics: RPS counter (950-1050), DB Load (Singleflight collapsed), P95 Latency
- Request log stream showing NER + Semantic Score + Action
- "Roadmap to Production" dark card with Tasco Maps/VETC mention

**Slide 3.4 — Benchmark Metrics**
- Metric cards: Intent Accuracy 0.967, Token F1 0.896, Entity F1 0.762
- Retrieval: Recall@3 0.892, MRR 0.951, Hit@1 0.933
- Comparison vs baseline (traditional keyword search)

### Section 04 — IMPACT & BUSINESS VALUE (2:30-3:15)
**Slide 4.1 — Dual Value**
- 2-column: User Value (teal) + Business Value (amber)
- Monetization quote card: "Normal advertising targets what users might want. RouteMate reaches them at the exact moment and location where they need it."
- VETC EV charging network integration highlight

**Slide 4.2 — Revenue Model**
- Revenue streams: Sponsored POI placements, Hotel/restaurant booking commissions, Charging station partnerships, Petrol partnerships, Insurance cross-sell
- Icon + description for each stream

### Section 05 — THE DEMO & CLOSE (3:15-4:45)
**Slide 5.1 — Interactive Mobile Demo**
- iPhone 15 Pro mockup frame (centered)
- Animated demo (~60s loop): Search "Phan Thet" (typo) → autocomplete corrects → route HCM→Phan Thiet draws → "tram sac V-Green" search → POI pins appear on map → user selects → waypoint inserted → route redraws
- Below phone: step captions synchronized with animation

**Slide 5.2 — Team & Thank You**
- Team: La Hoang Phong, Nguyen Truong Hai, Ha Van Truong — Team Genation
- Closing statement: "Tasco Maps is not just a map — it's your personal travel assistant."
- RouteMate logo + "Thank you, BGK Tasco Maps."

## Animation Strategy
- **Scroll trigger:** `IntersectionObserver` with `threshold: 0.15`
- **Fade-up:** `opacity: 0 → 1` + `translateY(30px → 0)`, staggered by `--delay` CSS variable
- **Slide-in:** Left/right columns enter from sides
- **Pipeline:** Steps appear sequentially with arrow connectors drawing
- **Dashboard:** Chart.js animation on mount
- **Phone demo:** JavaScript-timed animation loop (setTimeout/setInterval)
- **SVG route:** `stroke-dasharray` + `stroke-dashoffset` CSS animation

## Assets Reused
| Source File                          | Content Used                                                |
|--------------------------------------|-------------------------------------------------------------|
| `routemate-pitch.html`               | Hero, Problem, How It Works, Demo Scenarios, Ranking, Why Wins |
| `p6_p7_deep_dive.html`               | P6 7-step pipeline, P7 ranking signals, real traces, benchmarks |
| `routemate_performance_dashboard.html` | Live metrics, Chart.js latency graph, Singleflight visualization |
| `timeline.md`                        | Narrative structure, key phrases, timing                     |

## Tech Stack
- **HTML5** — semantic sections
- **CSS3** — @keyframes, CSS variables, flexbox/grid, backdrop-filter
- **Vanilla JS** — IntersectionObserver, Chart.js (CDN), animation controller
- **Chart.js** — loaded via CDN `<script>` tag

## Browser Support
Modern browsers (Chrome, Firefox, Safari, Edge) — last 2 versions.

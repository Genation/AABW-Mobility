# RouteMate — Complete Presentation Script

## AABW Hackathon · GenAI Fund · Tasco Maps Integration

### Total Duration: ~4:45 | Language: English

---

### SLIDE 01 — HERO (0:00 — 0:20)

> _[Slide transition. Full-viewport hero with RouteMate logo, teal gradient, animated search bar.]_

**Speaker:**
"Good morning, judges from Tasco Maps. My name is Phong La, and on behalf of Team Genation, I'm excited to present RouteMate.

Maps were born to find destinations. But drivers don't need a destination — they need a **journey**. And every journey begins with a search box.

Watch what happens the moment a user types."

> _[Search bar animates: "Ph..." → "Phan Thiet" autocompletes]_

"Our AI autocomplete — addressing **Track P9** of this challenge — predicts trip intent from the very first keystroke. 'Phan...' — we immediately know: **Phan Thiet**. Even through Vietnamese typos. Even through accent mistakes."

---

### SLIDE 02 — PROBLEM (0:20 — 0:45)

**Speaker:**
"But here's where traditional maps stop. They show you the road from Ho Chi Minh City to Phan Thiet — and then they abandon you.

The driver is now on their own. They need a hotel near the beach with an EV charger. They need lunch along the way. They need a petrol station before the next stretch. Today, they must run **four separate searches**, manually read reviews, and mentally calculate: 'Will this hotel make me drive 20 kilometers off course?'

That's not a journey. That's a chore.

To solve this completely, we didn't solve just one problem. We solved **all three competition tracks** — **P9** Autocomplete, **P6** Search Understanding, and **P7** Semantic Ranking — and unified them into one seamless experience called **RouteMate**."

---

### SLIDE 03 — SOLUTION OVERVIEW (0:45 — 1:10)

> _[Slide shows: "Complex queries. Structured intent. Real results."]_

**Speaker:**
"So how does RouteMate work? Let's take a real example — this is **Track P6: Search Understanding** in action.

A user types: **'ks gan bien co tram sac'** — hotel near beach with charging station. This is messy Vietnamese with abbreviations, missing accents, and a compound requirement.

Instead of sending this directly to an LLM — which would happily hallucinate a hotel that doesn't exist — our agent does something smarter.

The LLM analyzes the **context**: 'This is a long trip. The user needs accommodation and charging.' But the LLM never returns location data. The actual places come from Tasco's **verified Search Engine**.

This split is critical. The LLM understands. The Search Engine retrieves. **Zero hallucination. 100% real data.**"

---

### SLIDE 04 — NER PIPELINE (1:10 — 1:25)

> _[7-step pipeline animates: Normalize → Abbrev Expand → Span Linking → Category Detection → Reference Check → Intent Classify → Reconstruct]_

**Speaker:**
"How do we turn messy Vietnamese into structured, searchable intent? Through a deterministic 7-step pipeline — our solution for **Track P6: AI Search Understanding for Maps**.

Step 1: Normalize — fold accents, lowercase, tokenize.
Step 2: Expand abbreviations — 'ks' becomes 'Khach san', 'bv' becomes 'Benh vien'.
Step 3: Span linking — accent restoration, fuzzy matching against a phrase lexicon of every POI, brand, street, and district.
Step 4 through 6: detect category, brand, location, reference intent.
Step 7: Reconstruct a clean, normalized query with a confidence score.

This entire pipeline runs in **under 5 milliseconds**. No LLM latency. No hallucination risk."

---

### SLIDE 05 — REAL TRACE (1:25 — 1:45)

> _[Shows: "bv bach mai" → "Bệnh viện Bạch Mai" with confidence breakdown]_

**Speaker:**
"Here's a real trace from the pipeline. Input: 'bv bach mai' — lowercase, no accents, abbreviated. That's four tokens that mean nothing to a keyword search engine.

Our engine expands 'bv' to 'Bệnh viện', then links the span 'bach mai' to the known POI 'Bệnh viện Bạch Mai' in one accent-insensitive lookup. Output: a normalized query with **82% confidence** — and the confidence formula is fully auditable, not a black box.

Every entity extracted — category, brand, district, attributes — feeds directly into the next stage: **ranking**."

---

### SLIDE 06 — RANKING FORMULA (1:45 — 2:00)

> _[Formula animates in: Rank Score = Quality + Preference + Relevance − Detour Cost]_

**Speaker:**
"Understanding intent — solved by **Track P6** — is half the battle. The other half is ranking — putting the right result at the right place on the route. This is **Track P7: Semantic Search & Ranking**.

Our formula: **Rank Score = Quality + Preference + Relevance − Detour Cost.**

Place quality comes from ratings and reviews. Preference captures the user's stated need — 'near the beach', 'has EV charging'. Relevance measures how well the result fits the route corridor. And critically, we **subtract** detour cost — because nobody wants a perfect hotel that adds 45 minutes to their drive.

Three rules govern sponsored results: they must satisfy the user's actual need, they must be clearly labeled, and sponsorship never overrides route suitability. Never."

---

### SLIDE 07 — HYBRID ARCHITECTURE (2:00 — 2:12)

> _[Signal weights table appears]_

**Speaker:**
"Under the hood, we use **hybrid retrieval** — dense semantic embeddings from multilingual-e5-small, fused with BM25 lexical search via min-max normalization. The fused score carries the heaviest weight at 0.42, followed by category match, attribute match, and business signals like rating and popularity.

No single signal dominates. The system evaluates every candidate across **six weighted dimensions** to produce a single, explainable rank score. In our example run, 'Tranquil Books & Coffee' scored 0.8653 — and every contributing factor is transparent."

---

### SLIDE 08 — PERFORMANCE DASHBOARD (2:12 — 2:22)

> _[Live dashboard: 1024 RPS, 340 DB load, 42ms P95 latency, real-time logs]_

**Speaker:**
"Judges, this is not a white paper. This is a **live simulation** of our **Track P7** ranking pipeline under 1,000 requests per second — proving the system works at production scale, not just in theory.

Three metrics tell the story. Incoming traffic at over 1,000 RPS. Database load collapsed to just 340 requests per second thanks to **Singleflight deduplication** — 66% of redundant database calls eliminated. And P95 latency at just **42 milliseconds**.

Compare that to calling an LLM API — which adds 500 milliseconds or more. Our local embedding model runs at 200 megabytes, fits on commodity hardware, and eliminates that bottleneck entirely."

---

### SLIDE 09 — ROADMAP (2:22 — 2:30)

> _[Roadmap: 60 POIs → Millions of POIs → Continuous Learning. Three architecture cards below.]_

**Speaker:**
"Where are we today, and where do we go?

We started with **60 POIs** in the Hackathon prototype. The next step is integration with **Tasco Maps and VETC real-world data** — millions of POIs, billions of trip histories. At that scale, the model enters continuous learning — auto-optimizing its ranking weights to commercial-grade precision.

Three architecture principles make this possible: 66% database savings through Singleflight, 200-megabyte local embeddings with no external API dependency, and 100% real data — the LLM is a reasoning layer, never a data source."

---

### SLIDE 10 — DUAL VALUE (2:30 — 2:50)

> _[Two-column: User Value in teal, Business Value in amber. Quote card below.]_

**Speaker:**
"Let's talk about impact — for users and for Tasco.

For **users**: fewer searches, zero trip-planning friction. Recommendations that fit the entire journey, not just one stop. Every result ranked by actual detour cost. Typo-tolerant Vietnamese input. And personalization by vehicle type — EV drivers see chargers, petrol drivers see fuel stations.

For **Tasco**: a new, native revenue channel that doesn't feel like advertising. Sponsored POI placements along relevant routes. Hotel and restaurant booking commissions. VETC EV charging network integration — Tasco owns the charging infrastructure, RouteMate brings the demand. Petrol affiliate revenue. Insurance cross-sell through Tasco Insurance.

And here's the key insight:

> _[Quote card highlights]_

**'Normal advertising targets what users might want. RouteMate reaches them at the exact moment and location where they need it.'**

This is not interruption marketing. This is utility. The user needs a charger — we show them a V-Green station on their route. They're happy. Tasco earns. Everyone wins."

---

### SLIDE 11 — REVENUE MODEL (2:50 — 3:00)

> _[6 revenue stream cards]_

**Speaker:**
"Six monetization streams, all native to the VETC/Tasco ecosystem: sponsored POIs, hotel bookings, restaurant recommendations, EV charging via VETC's network, petrol station partnerships, and insurance cross-sell.

Every revenue stream emerges from a genuine user need at the right moment in their journey."

---

### SLIDE 12 — MOBILE DEMO (3:00 — 4:00)

> _[iPhone mockup. Animated demo plays: type → autocomplete → route draws → search → POIs appear → waypoint → route redraws.]_

**Speaker:**
"Let me show you the full experience, end to end.

> _[Slide 12 appears with iPhone mockup and step indicators]_

Step one: the user types 'Phan Thet' — with a typo. The autocomplete immediately corrects it to 'Phan Thiet'. No special syntax. No need to spell correctly.

Step two: Tasco Maps draws the optimal route from Ho Chi Minh City to Phan Thiet. The user is now on the road.

Step three: driving along, they realize they need an EV charger. They type 'tram sac V-Green' — messy, informal Vietnamese. RouteMate understands the intent immediately.

Step four: results appear, ranked by detour cost. V-Green charging station — only 0.3 kilometers off route. Clearly labeled as sponsored. The user also sees a nearby hotel and a seafood restaurant with their detour costs.

Step five: the user taps the V-Green station. The route **redraws instantly** with the new waypoint.

What used to be four separate apps and ten minutes of searching is now a single, fluid, three-tap experience."

---

### SLIDE 13 — TEAM & CLOSE (4:00 — 4:45)

> _[Dark teal background. Team: La Hoang Phong, Nguyen Truong Hai, Ha Van Truong — Team Genation.]_

**Speaker:**
"RouteMate was built by our team — La Hoang Phong, Nguyen Truong Hai, Ha Van Truong — **Team Genation**, for the AABW Hackathon organized by GenAI Fund.

Before I close, let me map this directly to the challenge tracks.

The judges gave us three problems. **P9: Autocomplete** — solved with typo-tolerant, accent-aware intent prediction from the first keystroke. **P6: Search Understanding** — solved with our 7-step deterministic NER pipeline, turning messy Vietnamese into structured, searchable entities with zero hallucination. **P7: Semantic Ranking** — solved with hybrid retrieval and multi-signal reranking weighted by detour cost.

We didn't pick one track and ignore the others. We built all three into a single product experience. Because that's what real users need — not isolated solutions, but a complete journey.

Here's our closing thought.

Tasco Maps today is already the backbone of Vietnam's mobility ecosystem — from VETC's electronic toll collection serving 1.5 million vehicles, to the nationwide EV charging network, to insurance and auto services.

With RouteMate, Tasco Maps becomes more than infrastructure. It becomes a **personal travel assistant** — understanding not just where you're going, but what you'll need along the way, and delivering it at the exact moment it matters.

Search the journey. Not just the destination.

Thank you, judges. We're happy to take your questions."

---

## Timing Summary

| Slide | Section               | Time      | Cumulative |
| ----- | --------------------- | --------- | ---------- |
| 01    | Hero                  | 0:00–0:20 | 0:20       |
| 02    | Problem               | 0:20–0:45 | 0:45       |
| 03    | Solution Overview     | 0:45–1:10 | 1:10       |
| 04    | NER Pipeline          | 1:10–1:25 | 1:25       |
| 05    | Real Trace            | 1:25–1:45 | 1:45       |
| 06    | Ranking Formula       | 1:45–2:00 | 2:00       |
| 07    | Hybrid Architecture   | 2:00–2:12 | 2:12       |
| 08    | Performance Dashboard | 2:12–2:22 | 2:22       |
| 09    | Roadmap               | 2:22–2:30 | 2:30       |
| 10    | Dual Value + Quote    | 2:30–2:50 | 2:50       |
| 11    | Revenue Model         | 2:50–3:00 | 3:00       |
| 12    | Mobile Demo           | 3:00–4:00 | 4:00       |
| 13    | Team & Close          | 4:00–4:45 | 4:45       |

---

## Cue Notes for Presenter

- **Slide 01:** Look at audience. Confident opening. The search bar animation is your backdrop — let it play. Call out **"Track P9"** explicitly.
- **Slide 02:** Pause slightly after "That's not a journey. That's a chore." Let the silence land. Name all three tracks: **P9, P6, P7**.
- **Slide 03:** Say **"Track P6: Search Understanding"** when introducing the solution.
- **Slide 04:** Point to the pipeline as it animates. Walk through steps 1-2-3 quickly, then summarize 4-7. This is your **P6 evidence**.
- **Slide 06:** Emphasize the **minus** before Detour Cost. That's the key insight. Call out **"Track P7"** here.
- **Slide 08:** Let the live dashboard speak. Point to the RPS counter, the latency number. Frame this as **"Track P7 at production scale."**
- **Slide 10:** Read the quote slowly. It's the money line.
- **Slide 12:** This is the longest section (60s). Don't rush. Let each step of the demo animate fully before narrating it. The demo itself is your slideshow.
- **Slide 13:** The track recap paragraph (P9, P6, P7) is critical — slow down here. Eye contact. "Search the journey. Not just the destination." is the final line — let it hang.

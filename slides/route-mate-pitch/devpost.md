## Inspiration

Every driver knows the pain: you're on a road trip from Ho Chi Minh City to Phan Thiet, and suddenly you need a hotel near the beach with an EV charging station. Today, that means running four separate searches across multiple apps, manually reading reviews, and mentally calculating whether each stop will add 20 kilometers to your route. Maps find destinations — but they don't plan journeys.

Tasco Maps is building Vietnam's #1 mobility platform, serving 1.5 million VETC electronic toll collection users and rapidly expanding into EV charging, insurance, and auto services. We saw a golden opportunity: what if the map didn't just show you the road, but understood your entire journey — from the moment you start typing, through every need that arises along the way?

## What it does

**RouteMate** unifies all three Tasco Maps AI Challenge tracks into one seamless experience:

- **P9 — AI Autocomplete:** Typo-tolerant, accent-aware Vietnamese intent prediction from the very first keystroke. Type "Phan" → system predicts "Phan Thiet" even through spelling mistakes.

- **P6 — AI Search Understanding:** A deterministic 7-step NER pipeline that turns messy, abbreviated Vietnamese queries like "ks gan bien co tram sac" into structured entities (category: Khach san, location: near beach, attributes: EV charging). The LLM analyzes context — the Search Engine retrieves real places. **Zero hallucination.**

- **P7 — AI Semantic Ranking:** Hybrid retrieval (multilingual-e5-small dense embeddings + BM25 lexical search, min-max fused) combined with 6-signal business reranking. The core formula: **Rank Score = Quality + Preference + Relevance − Detour Cost.** Sponsored results appear only when they genuinely match the user's need, always clearly labeled, and never above route suitability.

The end result: a user types a destination once, and RouteMate handles everything else — recommending hotels, restaurants, EV chargers, and petrol stations ranked by how well they fit the journey, not just the search keywords.

## How we built it

**Search Understanding (P6):** We built a deterministic, no-LLM pipeline with 7 stages — NFC normalization, type-aware abbreviation expansion (mapping "bv" → "Bệnh viện", "ks" → "Khách sạn"), accent-insensitive span linking against a full POI/brand/street/district phrase lexicon, category/attribute/brand/city detection, reference/nearby parsing, intent classification across 9 categories, and final reconstruction with an auditable confidence score.

**Semantic Search & Ranking (P7):** Each POI is flattened into a searchable document. We run parallel dense retrieval (local `multilingual-e5-small` embeddings, 200MB, cosine similarity) and BM25 lexical search over accent-folded tokens. Both score arrays are min-max normalized to [0,1] and fused 65/35. The top ~25 candidates are then rescored across 6 weighted business signals: fused relevance (0.42), category match (0.14), attribute match (0.18), location/distance (0.12), rating (0.07), and popularity (0.07).

**Performance Architecture:** Singleflight request collapsing eliminates 66% of redundant database calls. The local embedding model avoids external LLM API latency entirely. System latency stays at 40–60ms P95 under 1,000 RPS simulated load.

**Autocomplete (P9):** Intent prediction from partial input using the same knowledge base, with fuzzy matching for typo tolerance and accent restoration for Vietnamese.

## Challenges we ran into

**Vietnamese NLP is hard.** Abbreviations, missing accents, regional variations, and compound queries ("ks gan bien co tram sac") break standard tokenizers. We had to build a type-aware abbreviation dictionary from scratch, distinguishing place-type abbreviations (substitute into the query) from intent-type abbreviations (set flags only, don't corrupt the visible text).

**Hallucination risk.** The obvious approach — sending user queries directly to an LLM — produces convincing but fabricated results. Our solution: the LLM is a reasoning layer only. It analyzes context and suggests categories. The actual place data always comes from the verified Search Engine. This split is architecturally critical.

**Latency at scale.** LLM APIs add 500ms+ per call. We replaced that with a local 200MB embedding model and Singleflight deduplication, achieving 42ms P95 latency at 1,000 RPS — fast enough for real-time, per-keystroke search.

**Synthetic data limitations.** The hackathon dataset is 60 POIs. Real-world Tasco Maps has millions. Our architecture is designed for that scale — the ranking weights are structured to auto-optimize as real trip history data flows in.

## Accomplishments that we're proud of

1. **Solved all three tracks as one product.** Most teams tackle P6, P7, or P9 in isolation. We built a unified flow where each track feeds the next — autocomplete predicts the destination, understanding extracts intent, ranking scores results by route fit.

2. **Zero hallucination by design.** The LLM-context + Search-Engine-data split is a principled architectural decision, not an afterthought. Every result on screen comes from a verified database.

3. **Production-grade performance.** 42ms P95 latency at 1,000 RPS with Singleflight dedup — proven with a live dashboard simulation, not just claimed.

4. **Actually useful for Tasco.** We didn't build a research demo. We built something that plugs directly into Tasco's existing search infrastructure, integrates with VETC's EV charging network, and creates real monetization channels — sponsored POIs, hotel/restaurant booking commissions, charging partnerships, insurance cross-sell.

## What we learned

- **Vietnamese search needs its own NLP stack.** Western NLP tools fail on Vietnamese's unique combination of diacritics, abbreviations, and compound queries. Deterministic, rule-based preprocessing outperforms pure LLM approaches for this language specifically.

- **Hybrid retrieval beats pure semantic.** Dense embeddings alone overfit to semantic similarity and miss exact brand/street name matches. BM25 catches what embeddings miss. The 65/35 fusion consistently outperforms either approach alone.

- **Singleflight is underrated.** A 3-line pattern change eliminated two-thirds of our database load. For search infrastructure at Tasco's scale, this alone saves significant infrastructure cost.

- **Monetization must feel like utility, not advertising.** RouteMate shows sponsored V-Green charging stations when the user actively searches for EV chargers along their route. That's not an ad — it's the answer they wanted.

## What's next for RouteMate

1. **Tasco Maps production integration.** Plug RouteMate's understanding and ranking engines into Tasco's live search API. The architecture is designed for this — our deterministic pipeline and local embedding model fit into any Go/Node.js backend.

2. **Continuous learning from real data.** With access to Tasco's millions of POIs and billions of trip histories, the ranking weights auto-optimize — learning which signals best predict user selections and detour tolerance at commercial scale.

3. **Multi-modal input.** Voice queries for hands-free driving ("find me a coffee shop on the way"). The NER pipeline already handles unstructured Vietnamese text — voice is a natural extension.

4. **Real-time traffic-aware reranking.** Incorporate live traffic data into the detour cost calculation. A 5-minute detour on a clear highway is very different from a 5-minute detour through rush-hour congestion.

5. **VETC ecosystem deep integration.** Direct booking flow: search for a hotel → book it inside Tasco Maps → VETC toll pass automatically adjusts for the new route → EV charger reserved at the destination. One tap, end to end.

## Built with

- **Search Understanding Engine:** Python (deterministic 7-stage NLP pipeline, NFC normalization, fuzzy matching via rapidfuzz, type-aware abbreviation dictionary, accent-insensitive phrase lexicon)
- **Semantic Search & Ranking:** Python + sentence-transformers (`multilingual-e5-small`), BM25 (rank-bm25), min-max score fusion, 6-signal weighted reranker with explainable output
- **Performance & Infrastructure:** Singleflight request deduplication, local embedding (no external API dependency), simulated at 1,000 RPS
- **Autocomplete (P9):** Intent prediction from partial input with fuzzy matching against the unified knowledge base
- **Demo & Visualization:** HTML/CSS/JavaScript, Chart.js for live performance dashboard, CSS scroll-snap for horizontal slide navigation, IntersectionObserver for animation triggers

## Technology Partners

### OpenAI

We use OpenAI's GPT models as the **context reasoning layer** in RouteMate's architecture. When a user types a complex query like "ks gan bien co tram sac", the LLM analyzes the trip context — understanding that this is a long-distance journey, the user needs accommodation with specific amenities, and an EV charging requirement implies an electric vehicle. Critically, the LLM is **never used as a data source** — it does not return POI names, addresses, or coordinates. Instead, it outputs structured intent: suggested place categories, required attributes, and trip context flags. This "LLM as reasoner, Search Engine as retriever" split eliminates hallucination entirely — every location the user sees comes from Tasco's verified database. The LLM handles what it does best (understanding messy human language) while the Search Engine handles what it does best (returning real, accurate places).

### Amazon Web Services (AWS)

RouteMate's production architecture is designed to run on AWS infrastructure, leveraging the services that Tasco Maps already uses:

- **Amazon ECS / EKS** — Containerized deployment of the NER pipeline, semantic search engine, and ranking service. The deterministic pipeline runs as a stateless microservice, scaling horizontally behind an Application Load Balancer to handle Tasco's production traffic volume.

- **Amazon ElastiCache (Redis)** — The abbreviation dictionary, phrase lexicon, and POI knowledge base are cached in Redis for sub-millisecond lookups during the span linking and entity extraction stages. Singleflight deduplication uses Redis as the coordination layer for collapsing duplicate search queries across multiple application instances.

- **Amazon SageMaker** — The `multilingual-e5-small` embedding model is deployed as a SageMaker real-time inference endpoint, serving dense vector embeddings at production scale without requiring GPU instances on the application tier. As Tasco's POI database grows, SageMaker also enables continuous fine-tuning of the ranking weights using real user interaction data.

- **Amazon RDS (PostgreSQL)** — The verified POI database, user preference store, and trip history for the continuous learning pipeline. The hybrid search index (BM25 inverted index) is periodically rebuilt from RDS via a background worker.

- **Amazon S3 + CloudFront** — Static assets for the Tasco Maps web and mobile clients, including the embedded RouteMate search UI components and map tile layers.

This architecture ensures RouteMate scales from the current 60-POI hackathon prototype to Tasco's millions of real-world POIs without architectural changes — only configuration scaling.

## Optional Links

- **GitHub Repository:** https://github.com/Genation/AABW-Mobility
- **Live Pitch Deck:** Included in `slides/route-mate-pitch/index.html` — single-file, open in any browser
- **Presentation Script:** `slides/route-mate-pitch/script.md`
- **Technical Deep Dive:** `slides/p6_p7_deep_dive.html` — full pipeline walkthrough with real traces
- **Performance Dashboard:** `slides/routemate_performance_dashboard.html` — standalone live simulation

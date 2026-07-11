# AABW Mobility

The team backend is a Deno/Hono API on port `8000`. Hai's map-search engines
run as a Python/FastAPI service on port `8100`; the Deno API exposes them through
the same `/api/v1` surface as the rest of the team code.

## Hai AI endpoints

| Feature | Team API endpoint | Implementation |
| --- | --- | --- |
| Intent search | `POST /api/v1/track-1-hai/understand` | Hai P6 query understanding |
| Semantic search | `POST /api/v1/track-2-hai/search` | Hai P7 hybrid semantic ranking |
| Autocomplete (Hai) | `GET /api/v1/track-4-hai/suggest` | Hai P9 trie + pattern layer |
| Autocomplete (Phong) | `GET /api/v1/track-4-phong/suggest` | Existing Deno autocomplete |
| Autocomplete (legacy) | `GET /api/v1/track-4/suggest` | Backward-compatible alias for Phong |

## Prerequisites

- Deno 2
- Node.js 20+ and npm
- Python 3.11 or 3.12
- Access to the team's Supabase project if running Phong's autocomplete

Hai's three engines do not require new Supabase tables. They read the committed
Excel datasets and build their indexes in memory.

## 1. Clone and install

```bash
git clone <repository-url>
cd AABW-Mobility

cd frontend
npm install
cd ..

cd ml-service
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cd ..
```

On Windows PowerShell, activate Python with:

```powershell
cd ml-service
.venv\Scripts\Activate.ps1
```

On Windows, replace `./run.sh serve` in the commands below with:

```powershell
$env:PORT="8100"
python -m uvicorn tascomaps.api.main:app --host 0.0.0.0 --port 8100
```

## 2. Configure the backend

Create `backend/.env.local` from the example. Never commit this file.

```bash
cd backend
cp .env.local.example .env.local
```

Fill in:

```env
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@<pooler-host>:6543/postgres"
SUPABASE_URL="https://<project-ref>.supabase.co"
SUPABASE_SECRET_KEY="<server-side-secret-or-service-role-key>"
SUPABASE_ANON_KEY="<anon-key>"

PORT=8000
ML_SERVICE_URL="http://localhost:8100"
```

Use the existing shared Supabase credentials from Phong when available. Share
secrets privately, never through GitHub or frontend environment variables.

## 3. Database and pgvector

### Existing team Supabase project

No database action is needed when Phong has already applied the migrations and
seeded the shared database. Hai's intent, semantic-search, and autocomplete
engines add no migrations.

### Fresh Supabase or local database

Set `DATABASE_URL` in `backend/.env.local`, then apply all migrations:

```bash
cd backend
deno task db migrate
```

The migrations create and seed Phong's Track 4 tables. Migration `0008` also:

- enables the PostgreSQL `vector` extension;
- creates `track_4_suggestion_embeddings` with `vector(384)` values;
- creates the IVFFlat cosine-similarity index.

Verify it from the Supabase SQL editor:

```sql
select extname, extversion
from pg_extension
where extname = 'vector';

select count(*) as embedding_count
from track_4_suggestion_embeddings;
```

The `vector` extension and table can exist with zero rows. Phong's exact Trie,
fuzzy matching, and popular-query fallbacks still work; only the final semantic
fallback needs populated vectors.

### Optional: build Phong's pgvector index

Run this once after the migrations when the embedding table is empty:

```bash
cd backend
deno run --env-file=.env.local -A \
  src/modules/track-4-autocomplete/eval/build-embeddings.ts
```

This downloads `intfloat/multilingual-e5-small`, embeds the autocomplete
snapshot, writes 384-dimensional vectors to Supabase, and builds the vector
index. It is not required for Hai's autocomplete.

## 4. Choose Hai's semantic embedding mode

Hai's semantic-search embedding is separate from Phong's Supabase pgvector
table. Hai builds a local in-memory index whenever `ml-service` starts.

### Fast/offline mode

Uses TF-IDF and requires no model download:

```bash
cd ml-service
source .venv/bin/activate
TASCO_DISABLE_EMBED=1 PORT=8100 ./run.sh serve
```

### Multilingual embedding mode

Uses `intfloat/multilingual-e5-small` through Sentence Transformers:

```bash
cd ml-service
source .venv/bin/activate
PORT=8100 ./run.sh serve
```

The first run downloads approximately 120 MB. Later runs use the local model
cache. To choose another compatible model, set `TASCO_EMBED_MODEL`.

Optional LLM refinement uses OpenRouter and is disabled when no key is set:

```bash
export OPENROUTER_API_KEY="<key>"
export TASCO_LLM=auto
PORT=8100 ./run.sh serve
```

## 5. Start all services

Use three terminals.

Terminal 1 — Hai ML service:

```bash
cd ml-service
source .venv/bin/activate
TASCO_DISABLE_EMBED=1 PORT=8100 ./run.sh serve
```

Terminal 2 — team Deno API:

```bash
cd backend
deno task dev
```

Terminal 3 — frontend:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`. The Track 4 page includes a live Phong-vs-Hai
autocomplete comparison.

## 6. Verify the installation

Check Hai's service directly:

```bash
curl http://localhost:8100/health
```

The response should report `status: "ok"`, `datasets_found: true`, and either
`embedder: "tfidf"` or the configured sentence-transformer.

Check the team API with these example requests:

```bash
curl -X POST http://localhost:8000/api/v1/track-1-hai/understand \
  -H 'content-type: application/json' \
  -d '{"query":"bv bach mai","boost":false}'

curl -X POST http://localhost:8000/api/v1/track-2-hai/search \
  -H 'content-type: application/json' \
  -d '{"query":"quán cà phê yên tĩnh để làm việc","top_k":5}'

curl 'http://localhost:8000/api/v1/track-4-hai/suggest?q=atm%20vcb&limit=8'
curl 'http://localhost:8000/api/v1/track-4-phong/suggest?q=atm%20vcb&limit=8'
```

## Embedding architecture

| Feature | Embedding storage | Required? |
| --- | --- | --- |
| Hai intent understanding | None; deterministic Vietnamese NLP | No |
| Hai semantic search | In-memory E5 or TF-IDF index | TF-IDF is automatic fallback |
| Hai autocomplete | In-memory Trie + pattern rules | No embeddings required |
| Phong autocomplete | Supabase `pgvector` semantic fallback | Optional |

## Troubleshooting

### `Environment variables are not set`

The Deno backend validates all Supabase variables at startup. Check that
`backend/.env.local` exists and that none of its four Supabase values are empty.

### `Hai AI service is unavailable`

Start `ml-service` on port `8100`, or change `ML_SERVICE_URL` to its actual URL.
Confirm `curl http://localhost:8100/health` succeeds.

### Phong returns empty suggestions or database errors

Confirm `DATABASE_URL` reaches the same database where the Track 4 migrations
were applied. For a fresh database, run `deno task db migrate`.

### Embedding model download fails

Start Hai in offline mode with `TASCO_DISABLE_EMBED=1`. This does not disable
semantic search; it switches retrieval to TF-IDF.

### `relation track_4_suggestion_embeddings does not exist`

Apply migration `0008` with `deno task db migrate`. Populating that table is
optional, but the table itself must exist before Phong can query its semantic
fallback.

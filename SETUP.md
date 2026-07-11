# Setup — AABW Mobility (RouteMate + AI Search)

This build ships two live services:

- **RouteMate** — route-aware discovery (pick a destination, get en-route fuel /
  charging / food / rest stops ranked by detour).
- **AI Search** — Vietnamese autocomplete + intent & semantic search.

Both are powered by three processes that must run together:

| Service | Stack | Port | Role |
| --- | --- | --- | --- |
| `frontend/` | Next.js (npm) | **3000** | UI; proxies `/api/v1/*` → backend |
| `backend/` | Deno / Hono | **8000** | API gateway; proxies AI calls → ml-service |
| `ml-service/` | Python / FastAPI | **8100** | Hai's AI engines (intent P6, ranking P7, autocomplete P9) |

```
Browser → frontend:3000 → backend:8000 → ml-service:8100
```

> Miss any one process and both RouteMate and AI Search will error / 404.

## Prerequisites

- **Deno 2** — <https://deno.com>
- **Node.js 20+** and npm
- **Python 3.11 or 3.12**
- Internet access (RouteMate draws route lines from the public OSRM server)

## 1. Clone

```bash
git clone https://github.com/Genation/AABW-Mobility.git
cd AABW-Mobility
```

## 2. Start the ML service (port 8100) — Terminal 1

```bash
cd ml-service
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
PORT=8100 ./run.sh serve
```

The engines read the committed Excel datasets in `ml-service/datasets/` and build
their indexes in memory — no database required.

Optional: set `OPENROUTER_API_KEY` to enable the LLM boost. The core runs fully
without it (deterministic TF-IDF / rule-based fallback).

## 3. Start the backend (port 8000) — Terminal 2

```bash
cd backend
cp .env.local.example .env.local
```

Edit `.env.local` and make sure:

```
PORT=8000
ML_SERVICE_URL="http://localhost:8100"
```

The `SUPABASE_*` / `DATABASE_URL` values are only needed for the legacy Phong
autocomplete alias — RouteMate and the AI Search (Hai) engines do **not** use
Supabase. Then run:

```bash
deno task dev
```

## 4. Start the frontend (port 3000) — Terminal 3

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000> → log in → the dashboard shows **RouteMate** and
**AI Autocomplete**.

Demo login (hardcoded): user `aabw-user`, password `123456`.

## Ports are configurable

If a port is taken, change it and keep the chain consistent:

- ml-service: `PORT=8200 ./run.sh serve` → then set `ML_SERVICE_URL="http://localhost:8200"` in `backend/.env.local`.
- frontend: `PORT=3001 npm run dev`.
- The frontend → backend rewrite target lives in `frontend/next.config.ts`.

## Troubleshooting

- **`/api/v1/routemate/plan` 404, or AI Search returns nothing** — the backend or
  ml-service isn't running (or `ML_SERVICE_URL` points at the wrong port). Confirm
  all three processes are up.
- **`deno task dev` can't find `.env.local`** — you skipped the `cp` step in §3.

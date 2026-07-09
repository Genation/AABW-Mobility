# Track 4: AI-Powered Autocomplete & Query Suggestions

Real-time Vietnamese map search autocomplete engine built on Tasco Maps ecosystem.

## Architecture

```
User Input → Normalize → Abbrev Expand → Trie Exact → Trie Fuzzy → Popular Fallback → Response
```

- **Trie**: Character-level in-memory trie with pre-computed Top-10 at each node
- **Fuzzy**: DFS over Trie with edit distance 1 (substitute, insert, delete)
- **Fallback**: Popular queries by region when no prefix match found
- **Scoring**: Multi-factor (ground truth score > frequency > popularity > template)

## API

### `GET /api/v1/track-4/suggest`

Autocomplete as you type.

**Parameters**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `q` | string | yes | — | Search query prefix (min 1, max 200 chars). Supports: accented or accent-less, abbreviations, partial text, English-Vietnamese mixed |
| `lat` | number | no | — | User latitude (-90 to 90). Used for region-based suggestion ranking |
| `lng` | number | no | — | User longitude (-180 to 180). Used for region-based suggestion ranking |
| `limit` | number | no | 10 | Max suggestions to return (1-20) |

**Response**

```json
{
  "suggestions": [
    {
      "text": "quan ca phe gan day",
      "display": "Quán cà phê gần đây",
      "type": "Category Search",
      "score": 0.97
    }
  ],
  "latencyMs": 0.8,
  "source": "exact"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `suggestions[].text` | string | Normalized suggestion text (accent-free, used as key) |
| `suggestions[].display` | string | Display text with proper Vietnamese diacritics |
| `suggestions[].type` | string | Suggestion type: `Brand Search`, `Category Search`, `POI Suggestion`, `Nearby Search`, `Discovery Search`, `Location Search`, `Address Suggestion` |
| `suggestions[].score` | number | Relevance score (0-1). Higher = better match |
| `latencyMs` | number | Request processing time in milliseconds |
| `source` | string | Match source: `exact` (Trie prefix match), `fuzzy` (edit-distance corrected), `popular` (regional fallback), `empty` (engine not loaded) |

**Examples**

```bash
# Basic autocomplete
curl "http://localhost:8906/api/v1/track-4/suggest?q=cafe"

# With location for regional ranking  
curl "http://localhost:8906/api/v1/track-4/suggest?q=atm&lat=10.7759&lng=106.7031&limit=5"

# Typo handling (fuzzy match)
curl "http://localhost:8906/api/v1/track-4/suggest?q=nguyen+huee"

# Abbreviation expansion (ks → khách sạn)
curl "http://localhost:8906/api/v1/track-4/suggest?q=ks+da+nang"

# Accent-less Vietnamese
curl "http://localhost:8906/api/v1/track-4/suggest?q=benh+vien"

# Mixed English-Vietnamese
curl "http://localhost:8906/api/v1/track-4/suggest?q=coffee+near"
```

## Request Flow

```
1. q.length < 2   → return popular queries by region
2. q.length >= 2  → normalize → expand abbreviations
3. Trie exact search → if found, return
4. Trie fuzzy search (edit=1) → if found, return
5. Fallback to popular queries by region
```

## Features

- **Vietnamese language**: accent normalization (Nguyễn Huệ ↔ nguyen hue), abbreviation expansion (ks → khách sạn, q1 → Quận 1), typo tolerance (nguyen huee → Nguyễn Huệ)
- **Intent prediction**: detects category, brand, POI, address, and discovery intent from partial input
- **Template generation**: dynamic suggestions for categories/brands not in POI dataset
- **Regional ranking**: lat/lng-based suggestion boosting for nearby results
- **Mixed language**: handles English-Vietnamese queries (coffee near → quán cà phê gần đây)

## Build Pipeline

```
DB (5 tables) → Scorer → Trie → snapshot.json (persisted to disk)
```

Run: `deno test -A --env-file=.env.local src/modules/track-4-autocomplete/tests/track-4-autocomplete.builder.test.ts`

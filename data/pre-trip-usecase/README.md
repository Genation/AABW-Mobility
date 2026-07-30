# Pre-Trip Usecase — Dữ liệu & Kịch bản Hoàn chỉnh

> **Mục tiêu:** Khi người dùng thao tác trên Drivo Pre-Trip (3 màn hình),
> các API search/AI Suggestions trả về đúng POI dọc tuyến đường thực tế.

---

## Luồng dữ liệu tổng thể

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DRIVO PRE-TRIP DATA FLOW                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. DATABASE (PostgreSQL)                                                   │
│     track_4_pois ←── 0009_seed-pre-trip-routes.sql (43 POI mới)            │
│     │                                                                       │
│     ▼                                                                       │
│  2. ML-SERVICE (Python, port 8100)                                         │
│     KnowledgeBase đọc POI từ DB → HybridIndex (dense + BM25)               │
│     │                                                                       │
│     ▼                                                                       │
│  3. P7 SEMANTIC SEARCH (POST /api/v1/track-2-hai/search)                   │
│     searchPlaces("điểm check-in đẹp", 8)                                   │
│     → HaiAiService → ML Service /search → SemanticSearchEngine.search()    │
│     → Retrieve top-K POI theo embedding + lexical                           │
│     │                                                                       │
│     ▼                                                                       │
│  4. AISuggestions (React Component)                                         │
│     Nhận PlaceCandidate[] → sort theo khoảng cách tới route midpoint        │
│     → Hiển thị POI cards với nút [+] để thêm vào chặng                      │
│     │                                                                       │
│     ▼                                                                       │
│  5. DRIVO APP (localStorage)                                                │
│     TripPlan JSON → 3 màn hình CreateTrip / TripItinerary / TrackDetail     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Ví dụ cụ thể: Người dùng thêm điểm check-in vào Chặng 2 (Long Khánh → Bảo Lộc)

```
Bước 1: Trên TrackDetailScreen, user kéo panel lên → panelExpanded = true
Bước 2: User chọn chip "📸 Check-in" → activeCategory = "checkin"
Bước 3: AISuggestions gọi: searchPlaces("điểm check-in đẹp", 8)
        → POST /api/v1/track-2-hai/search { query: "điểm check-in đẹp", top_k: 8 }
        → ML Service /search → P7 SemanticSearchEngine.search()
        → P7 dùng embedding (multilingual-e5-small) + BM25 trên toàn bộ track_4_pois
        → POI có category="Điểm check-in" + tags chứa "check-in","view đẹp" → ranked cao
        → Trả về: [
            { name: "Đồi chè Bảo Lộc Check-in", lat: 11.487, lng: 107.760, ... },
            { name: "Hồ Xuân Hương Đà Lạt",       lat: 11.942, lng: 108.442, ... },
            { name: "Thác Datanla Đà Lạt",         lat: 11.898, lng: 108.430, ... },
            ...
          ]
Bước 4: AISuggestions tính route midpoint (~11.23, 107.53)
        → Sort POI theo khoảng cách đến midpoint
        → "Đồi chè Bảo Lộc" đứng #1 (cách route ~30km)
        → "Thác Datanla" đứng #2 (cách route ~80km)
        → User thấy "Đồi chè Bảo Lộc" ngay đầu, tap [+] → thêm vào chặng
```

---

## 3 Kịch bản Road-Trip

### Kịch bản 1: TP.HCM → Đà Lạt — "Phượt Cao Nguyên" (Hero)

| Thuộc tính          | Giá trị                                  |
| ------------------- | ---------------------------------------- |
| Tuyến               | 3 chặng, tổng ~330km, ~8.5h drive        |
| Lộ trình            | QL1 → QL20                               |
| Điểm xuất phát      | Highlands Coffee Nguyễn Huệ, Q1, TP.HCM  |
| Điểm đến            | Hồ Xuân Hương, TP. Đà Lạt                |
| Thời gian khởi hành | 31/07/2026 06:00                         |

| Chặng | Tên                    | Từ → Đến             | ~KM  | POI dọc đường (có trong DB)                                      |
| ----- | ---------------------- | -------------------- | ---- | ---------------------------------------------------------------- |
| 1     | Sài Gòn → Đồng Nai     | TP.HCM → Long Khánh  | 100  | Mekong Rest Stop (cafe), Petrolimex Trảng Bom (xăng)             |
| 2     | Đồng Nai → Bảo Lộc     | Long Khánh → Bảo Lộc | 120  | Đồi chè Bảo Lộc (check-in), Cafe Tám Trình (cafe)               |
| 3     | Bảo Lộc → Đà Lạt       | Bảo Lộc → Đà Lạt     | 110  | Thác Datanla (check-in), Panorama Coffee (cafe), Chợ đêm Đà Lạt  |

**POIs trong DB cho tuyến này (13 POI):**
| POI ID     | Tên                          | Lat       | Lng       | Category         |
| ---------- | ---------------------------- | --------- | --------- | ---------------- |
| ROUTE001   | Mekong Rest Stop Biên Hòa    | 10.823    | 106.816   | Trạm dừng chân   |
| ROUTE002   | Petrolimex Trảng Bom         | 10.865    | 106.950   | Cây xăng         |
| ROUTE003   | Cafe Sài Gòn Xưa             | 10.872    | 106.958   | Quán cà phê      |
| ROUTE004   | Cơm Tấm Bụi Đồng Nai         | 10.898    | 107.130   | Nhà hàng         |
| ROUTE005   | Petrolimex Long Khánh        | 10.915    | 107.215   | Cây xăng         |
| ROUTE006   | Đồi chè Bảo Lộc Check-in     | 11.487    | 107.760   | Điểm check-in    |
| ROUTE007   | Cafe Tám Trình Bảo Lộc       | 11.515    | 107.790   | Quán cà phê      |
| ROUTE008   | Bánh Canh Ghẹ Long Khánh     | 10.955    | 107.270   | Nhà hàng         |
| ROUTE009   | Thác Đam Bri Bảo Lộc         | 11.458    | 107.720   | Điểm check-in    |
| ROUTE010   | Homestay Đồi Thông Bảo Lộc   | 11.495    | 107.770   | Nghỉ dưỡng       |
| ROUTE011   | Thác Datanla Đà Lạt          | 11.898    | 108.430   | Điểm check-in    |
| ROUTE012   | Panorama Coffee Đà Lạt       | 11.935    | 108.438   | Quán cà phê      |
| ROUTE013   | Chợ đêm Đà Lạt               | 11.944    | 108.437   | Ẩm thực          |

### Kịch bản 2: Hà Nội → Hạ Long — "Weekend Biển"

| Thuộc tính          | Giá trị                                  |
| ------------------- | ---------------------------------------- |
| Tuyến               | 3 chặng, tổng ~160km, ~3.5h drive        |
| Lộ trình            | QL5 → QL18                              |
| Điểm xuất phát      | Cộng Cà Phê Hồ Gươm, Hoàn Kiếm, Hà Nội  |
| Điểm đến            | Bãi Cháy, TP. Hạ Long                   |
| Thời gian khởi hành | 02/08/2026 08:00                        |

| Chặng | Tên                 | Từ → Đến             | KM  | POI dọc đường                                   |
| ----- | ------------------- | -------------------- | --- | ----------------------------------------------- |
| 1     | Hà Nội → Bắc Ninh   | HN → Bắc Ninh        | 35  | Trạm dừng chân Phố Nối, Đền Đô Bắc Ninh         |
| 2     | Bắc Ninh → Hải Dương| Bắc Ninh → Hải Dương | 50  | Đền Kiếp Bạc, Bánh đậu xanh Rồng Vàng           |
| 3     | Hải Dương → Hạ Long | Hải Dương → Hạ Long  | 65  | Sun World, Chợ Hạ Long, Hải Sản Bà Tuyết        |

**POIs trong DB cho tuyến này (11 POI):**
| POI ID     | Tên                          | Lat       | Lng       | Category       |
| ---------- | ---------------------------- | --------- | --------- | -------------- |
| ROUTE018   | Trạm dừng chân Phố Nối       | 21.082    | 105.945   | Trạm dừng chân |
| ROUTE019   | Đền Đô Bắc Ninh              | 21.184    | 105.957   | Di tích        |
| ROUTE020   | Bánh Phu Thê Đình Bảng       | 21.188    | 105.965   | Đặc sản        |
| ROUTE021   | Đền Kiếp Bạc                 | 21.105    | 106.280   | Di tích        |
| ROUTE022   | Bánh đậu xanh Rồng Vàng      | 20.940    | 106.325   | Đặc sản        |
| ROUTE023   | Cafe Mộc Hải Dương           | 20.935    | 106.330   | Quán cà phê    |
| ROUTE024   | Sun World Hạ Long            | 20.962    | 107.050   | Giải trí       |
| ROUTE025   | Chợ Hạ Long 1                | 20.947    | 107.075   | Mua sắm        |
| ROUTE026   | Hải Sản Bà Tuyết             | 20.950    | 107.068   | Nhà hàng       |
| ROUTE027   | Petrolimex Hạ Long           | 20.968    | 106.980   | Cây xăng       |
| ROUTE028   | Vinpearl Resort Hạ Long      | 20.955    | 107.080   | Nghỉ dưỡng     |

### Kịch bản 3: Đà Nẵng → Huế — "Cung Đường Di Sản"

| Thuộc tính          | Giá trị                                  |
| ------------------- | ---------------------------------------- |
| Tuyến               | 4 chặng, tổng ~155km, ~4h drive          |
| Lộ trình            | QL1A qua đèo Hải Vân                     |
| Điểm xuất phát      | Bãi biển Mỹ Khê, Sơn Trà, Đà Nẵng       |
| Điểm đến            | Đại Nội, TP. Huế                        |
| Thời gian khởi hành | 05/08/2026 07:30                        |

| Chặng | Tên                 | Từ → Đến            | KM  | POI dọc đường                                  |
| ----- | ------------------- | -------------------- | --- | ---------------------------------------------- |
| 1     | Đà Nẵng → Hải Vân   | ĐN → Đỉnh Hải Vân    | 30  | Chùa Linh Ứng Sơn Trà, Cafe Hải Vân Top        |
| 2     | Hải Vân → Lăng Cô   | Đỉnh HV → Lăng Cô    | 25  | Cầu vồng Lăng Cô, Bãi biển Lăng Cô             |
| 3     | Lăng Cô → Cầu Hai   | Lăng Cô → Đầm Cầu Hai| 50  | Hải Sản Bé Thơ, Điểm ngắm đầm Cầu Hai          |
| 4     | Cầu Hai → Huế       | Cầu Hai → Đại Nội    | 45  | Lăng Khải Định, Chùa Thiên Mụ, Bún bò Bà Tuyết |

**POIs trong DB cho tuyến này (15 POI):**
| POI ID     | Tên                          | Lat       | Lng       | Category       |
| ---------- | ---------------------------- | --------- | --------- | -------------- |
| ROUTE029   | Bán đảo Sơn Trà              | 16.111    | 108.279   | Điểm check-in  |
| ROUTE030   | Cafe Hải Vân Top             | 16.170    | 108.133   | Quán cà phê    |
| ROUTE031   | Hải Vân Quan                 | 16.207    | 108.099   | Di tích        |
| ROUTE032   | Cầu vồng Lăng Cô             | 16.245    | 108.090   | Điểm check-in  |
| ROUTE033   | Bãi biển Lăng Cô             | 16.260    | 108.085   | Bãi biển       |
| ROUTE034   | Cafe Lăng Cô Beach Club      | 16.255    | 108.083   | Quán cà phê    |
| ROUTE035   | Hải Sản Bé Thơ Lăng Cô       | 16.270    | 107.940   | Nhà hàng       |
| ROUTE036   | Điểm ngắm đầm Cầu Hai        | 16.300    | 107.820   | Điểm check-in  |
| ROUTE037   | Petrolimex Phú Lộc           | 16.285    | 107.860   | Cây xăng       |
| ROUTE038   | Lăng Khải Định               | 16.403    | 107.587   | Di tích        |
| ROUTE039   | Chùa Thiên Mụ                | 16.453    | 107.545   | Di tích        |
| ROUTE040   | Bún bò Huế Bà Tuyết          | 16.465    | 107.590   | Nhà hàng       |
| ROUTE041   | Đại Nội Huế                  | 16.470    | 107.578   | Di tích        |
| ROUTE042   | Cơm hến Huế O Nhỏ            | 16.460    | 107.585   | Nhà hàng       |
| ROUTE043   | Azerai La Residence Huế      | 16.463    | 107.582   | Nghỉ dưỡng     |

---

## Category → Query mapping cho AI Suggestions

Khi user chọn chip category trên TrackDetailScreen, AISuggestions gọi API với query tương ứng:

| Chip             | Query API              | Category trong DB khớp                | Số POI mới |
| ---------------- | ---------------------- | ------------------------------------- | ---------- |
| 🍜 Ăn uống       | `quán ăn ngon`         | Nhà hàng, Ẩm thực, Đặc sản            | 11         |
| ☕ Cafe           | `quán cafe đẹp`        | Quán cà phê                           | 7          |
| ⛽ Trạm xăng      | `trạm xăng`            | Cây xăng                              | 5          |
| 📸 Check-in       | `điểm check-in đẹp`     | Điểm check-in, Di tích, Bãi biển      | 15         |
| 🏨 Nghỉ dưỡng     | `resort nghỉ dưỡng`    | Nghỉ dưỡng, Khách sạn                 | 4          |

Mỗi POI đều có `tags` JSON chứa từ khóa semantic để P7 embedding khớp với query.
Ví dụ: `ROUTE006` (Đồi chè Bảo Lộc) có tags `["check-in","săn mây","view đẹp","du lịch"]`
→ Khi search "điểm check-in đẹp", P7 thấy "check-in" + "view đẹp" → rank cao.

---

## Các file trong thư mục

| File                            | Mô tả                                                              |
| ------------------------------- | ------------------------------------------------------------------ |
| `README.md`                     | File này — tổng quan + luồng dữ liệu                               |
| `sample-trip-hcm-dalat.json`    | TripPlan cho localStorage: Sài Gòn → Đà Lạt (3 chặng, 7 POI)      |
| `sample-trip-hanoi-halong.json` | TripPlan cho localStorage: Hà Nội → Hạ Long (3 chặng, 6 POI)      |
| `sample-trip-danang-hue.json`   | TripPlan cho localStorage: Đà Nẵng → Huế (4 chặng, 8 POI)         |
| `seed-routes-pois.sql`          | SQL INSERT 43 POI + 15 autocomplete entries                        |
| `load-trip.html`                | HTML tool load TripPlan vào localStorage để demo nhanh             |

**Migration file (trong backend):**
| File                                          | Mô tả                                   |
| --------------------------------------------- | --------------------------------------- |
| `backend/drizzle/0009_seed-pre-trip-routes.sql` | Migration chính thức để `deno task db migrate` |

---

### Bước 0: Generate dataset Excel files (chỉ cần làm 1 lần)

ML Service cần file Excel từ cuộc thi. Dùng script generate để tạo từ dữ liệu có sẵn:

```bash
cd ml-service
source .venv/bin/activate
python ../data/pre-trip-usecase/generate-datasets.py
```

Script tạo 3 file Excel tại `datasets/ai-maps-challenge-package/` với 58 POI (20 cũ + 38 route mới).

## Cách chạy

### Bước 1: Apply migration (đưa POI vào DB)

```bash
cd backend
deno task db migrate
# Migration 0009 sẽ INSERT 43 POI vào track_4_pois
```

### Bước 2: Khởi động ML Service (để build index từ POI mới)

```bash
cd ml-service
./run.sh
# ML Service sẽ đọc track_4_pois từ DB, build HybridIndex
# Lúc này search "điểm check-in đẹp" sẽ trả về Đồi chè Bảo Lộc, Hải Vân Quan, v.v.
```

### Bước 3: Load TripPlan vào localStorage

Mở `data/pre-trip-usecase/load-trip.html` → chọn kịch bản → Load.

Hoặc paste thủ công qua DevTools Console:

```js
// Set version
localStorage.setItem('drivo-app-version', '2');

// Copy nội dung file JSON mong muốn
fetch('data/pre-trip-usecase/sample-trip-hcm-dalat.json')
  .then(r => r.json())
  .then(data => localStorage.setItem('drivo-app-state', JSON.stringify(data)));
```

### Bước 4: Mở Drivo

```
http://localhost:3000/dashboard/tracks/drivo
```

→ Screen hiển thị TRIP_ITINERARY với 3 chặng đầy đủ
→ Tap vào chặng bất kỳ → vào TrackDetailScreen
→ Kéo panel lên → chọn category chip → POI dọc tuyến hiển thị

---

## Coverage các state

| State            | Mô tả                                        | Cách test                                   |
| ---------------- | -------------------------------------------- | ------------------------------------------- |
| EMPTY            | Mở app lần đầu, chưa có trip                 | Xóa localStorage, refresh                    |
| START_SELECTED   | Chọn start trước                             | Màn CreateTrip, chọn điểm xuất phát          |
| BOTH_SELECTED    | Chọn cả start + end                          | Map hiển thị route preview                   |
| SUBMITTING       | Nhấn "Lên kế hoạch"                          | Transition sang Screen 2                     |
| WITH_TRACKS      | Danh sách chặng + map màu                    | Load TripPlan → TripItineraryScreen          |
| REORDERING       | Drag thả chặng                               | Kéo thả track card                           |
| VIEWING          | Map fullscreen, timeline collapsed           | TrackDetailScreen mặc định                   |
| ADDING_STOP      | Chạm map thêm điểm dừng                      | Tap vào route trên map                       |
| EXPANDED         | Panel kéo lên, AI suggestions hiển thị       | Kéo panel handle lên                         |
| DRAGGING         | Kéo marker trên map                          | Drag waypoint marker                         |
| SAVING           | Lưu thay đổi chặng                           | Nhấn ✓ trên header                           |
| ERROR            | OSRM fail → fallback straight line           | Tắt mạng, load trip vẫn hiển thị             |
| DUPLICATE_POI    | Toast khi thêm trùng POI                     | Thêm cùng 1 POI 2 lần                        |
| CATEGORY_FILTER  | Lọc POI theo category                        | Chọn chip "☕ Cafe" → chỉ hiện cafe dọc đường |

# Tasco Maps AI — Sample Outputs

## P6 · Search Understanding (query → structured intent)

- **`bv bach mai`** → intent=`POI Search`, normalized=`Bệnh viện Bạch Mai`, entities=`{"poi_name": "Bệnh viện Bạch Mai", "category": "Bệnh viện"}`, conf=0.82
- **`atm vcb`** → intent=`Brand Category Search`, normalized=`ATM Vietcombank`, entities=`{"category": "ATM", "brand": "Vietcombank"}`, conf=0.82
- **`vincom q1`** → intent=`POI Search`, normalized=`Vincom Center Đồng Khởi, Quận 1`, entities=`{"poi_name": "Vincom Center Đồng Khởi", "brand": "Vincom", "district": "Quận 1"}`, conf=0.88
- **`cafe gan day`** → intent=`Nearby Search`, normalized=`Quán cà phê gần đây`, entities=`{"category": "Quán cà phê", "location": "current_location"}`, conf=0.72
- **`ks da nang gan bien`** → intent=`Category Search`, normalized=`Khách sạn đà nẵng gần biên`, entities=`{"category": "Khách sạn", "city": "Đà Nẵng", "attribute": "gần biển"}`, conf=0.78
- **`chi duong den san bay`** → intent=`Navigation`, normalized=`Chỉ đường đến Sân bay`, entities=`{"action": "directions", "category": "Sân bay"}`, conf=0.72
- **`12 nguyen hue q1`** → intent=`Address Search`, normalized=`12 Nguyễn Huệ Quận 1`, entities=`{"district": "Quận 1", "street": "Nguyễn Huệ", "house_number": "12"}`, conf=0.88
- **`10.7769,106.7009`** → intent=`Coordinate Search`, normalized=`10.7769,106.7009`, entities=`{"latitude": 10.7769, "longitude": 106.7009}`, conf=0.99
- **`galaxy`** → intent=`Ambiguous`, normalized=`Galaxy`, entities=`{"candidates": ["Galaxy Nguyễn Du", "Galaxy Cinema Cách Mạng Tháng Tám", "Galaxy Cinema Hai Bà Trưng", "Galaxy Cinema Võ Nguyên Giáp"], "ambiguity_type": "brand_or_branch"}`, conf=0.5
- **`benh vien bach maj`** → intent=`POI Search`, normalized=`Bệnh viện Bạch Mai`, entities=`{"poi_name": "Bệnh viện Bạch Mai", "category": "Bệnh viện"}`, conf=0.67
- **`coffee near ben thanh market`** → intent=`Nearby Search`, normalized=`Quán cà phê gần Chợ Bến Thành market`, entities=`{"category": "Quán cà phê", "reference_poi": "Ben Thanh Market"}`, conf=0.82
- **`nt long chau q1`** → intent=`Brand Category Search`, normalized=`Nhà thuốc Long Châu Quận 1`, entities=`{"category": "Nhà thuốc", "brand": "Nhà thuốc Long Châu", "district": "Quận 1"}`, conf=0.88

## P7 · Semantic Search & Ranking (needs → ranked places + reasons)

- **`quán cà phê yên tĩnh để làm việc`**
    - Tranquil Books & Coffee (Quán cà phê) — score 0.87 · đúng loại Quán cà phê; phù hợp: yên tĩnh, phù hợp làm việc; đánh giá 4.7★; phổ biến
    - The Workshop Coffee (Quán cà phê) — score 0.85 · đúng loại Quán cà phê; phù hợp: yên tĩnh, phù hợp làm việc; đánh giá 4.6★; phổ biến
    - Dream Beans Coffee Đà Nẵng (Quán cà phê) — score 0.76 · đúng loại Quán cà phê; phù hợp: yên tĩnh, phù hợp làm việc; đánh giá 4.5★
- **`cafe có wifi gần hồ gươm`**
    - WorkHub Cafe Cầu Giấy (Quán cà phê) — score 0.87 · đúng loại Quán cà phê; phù hợp: wifi; đánh giá 4.5★
    - Cộng Cà Phê Tây Hồ (Quán cà phê) — score 0.82 · đúng loại Quán cà phê; phù hợp: wifi; phổ biến
    - Tranquil Books & Coffee (Quán cà phê) — score 0.75 · đúng loại Quán cà phê; phù hợp: wifi; cách ~0.8 km; đánh giá 4.7★
- **`nơi phù hợp để hẹn hò ở quận 1`**
    - Rooftop Sky Garden (Nhà hàng) — score 0.90 · phù hợp: lãng mạn; thuộc Quận 1; đánh giá 4.6★; phổ biến
    - Pizza 4P's Lê Thánh Tôn (Nhà hàng) — score 0.81 · phù hợp: lãng mạn; thuộc Quận 1; đánh giá 4.7★; phổ biến
    - Lẩu Phố Quận 1 (Nhà hàng) — score 0.79 · phù hợp: lãng mạn; thuộc Quận 1; đánh giá 4.3★; phổ biến
- **`nhà hàng cho gia đình có trẻ nhỏ`**
    - Nhà hàng Gia Đình Hoa Sen (Nhà hàng) — score 0.85 · đúng loại Nhà hàng; phù hợp: phù hợp gia đình
    - Bếp Nhà Đà Nẵng (Nhà hàng) — score 0.74 · đúng loại Nhà hàng; phù hợp: phù hợp gia đình; đánh giá 4.5★
    - Nhà hàng Biển Xanh Phường 3 (Nhà hàng) — score 0.66 · đúng loại Nhà hàng; phù hợp: phù hợp gia đình; đánh giá 4.6★; phổ biến
- **`khách sạn gần biển đà nẵng có hồ bơi`**
    - Sea Pearl Hotel Đà Nẵng (Khách sạn) — score 0.94 · đúng loại Khách sạn; phù hợp: gần biển, hồ bơi; tại Đà Nẵng; đánh giá 4.4★
    - Ocean View Resort Đà Nẵng (Khách sạn) — score 0.88 · đúng loại Khách sạn; phù hợp: gần biển, hồ bơi; tại Đà Nẵng; đánh giá 4.6★
    - Lotus Hotel Ngũ Hành Sơn (Khách sạn) — score 0.62 · đúng loại Khách sạn; phù hợp: hồ bơi; tại Đà Nẵng; đánh giá 4.4★
- **`quán ăn mở cửa sau 11 giờ tối`**
    - Quán Ăn Đêm 24h Nguyễn Trãi (Nhà hàng) — score 0.67 · đúng loại Nhà hàng
    - Phở Thìn Lò Đúc (Nhà hàng) — score 0.38 · đúng loại Nhà hàng; phổ biến
    - Quán Ngon Thanh Khê (Nhà hàng) — score 0.37 · đúng loại Nhà hàng
- **`atm rút tiền 24/7 gần phố đi bộ nguyễn huệ`**
    - ATM Vietcombank Nguyễn Huệ (ATM) — score 0.89 · đúng loại ATM; phù hợp: 24/7
    - ATM Techcombank Hồ Gươm (ATM) — score 0.63 · đúng loại ATM; phù hợp: 24/7
    - ACB Phường 1 (ATM) — score 0.62 · đúng loại ATM; phù hợp: 24/7; đánh giá 4.4★; phổ biến
- **`trạm sạc xe điện gần trung tâm đà nẵng`**
    - Trạm sạc EV One Đà Nẵng (Trạm sạc điện) — score 0.78 · đúng loại Trạm sạc điện; tại Đà Nẵng; cách ~0.1 km; đánh giá 4.3★
    - CGV Vincom Đà Nẵng (Rạp chiếu phim) — score 0.12 · tại Đà Nẵng; cách ~0.8 km; đánh giá 4.3★
    - Trạm xăng Shell Việt Ngũ Hành Sơn (Cây xăng) — score 0.12 · tại Đà Nẵng; đánh giá 4.6★
- **`quán cafe học bài ở hoàn kiếm`**
    - Tranquil Books & Coffee (Quán cà phê) — score 0.87 · đúng loại Quán cà phê; phù hợp: phù hợp học tập; đánh giá 4.7★; phổ biến
    - WorkHub Cafe Cầu Giấy (Quán cà phê) — score 0.53 · đúng loại Quán cà phê; đánh giá 4.5★
    - The Workshop Coffee (Quán cà phê) — score 0.46 · đúng loại Quán cà phê; đánh giá 4.6★; phổ biến
- **`địa điểm check-in đẹp ở đà lạt`**
    - Quảng trường Lâm Viên (Điểm tham quan) — score 0.88 · phù hợp: check-in; tại Đà Lạt; đánh giá 4.4★; phổ biến
    - Dalat View Coffee (Quán cà phê) — score 0.73 · phù hợp: check-in; tại Đà Lạt; đánh giá 4.4★
    - Dalat Garden Homestay (Khách sạn) — score 0.68 · phù hợp: check-in; tại Đà Lạt; đánh giá 4.5★

## P9 · Autocomplete & Query Suggestions (prefix → ranked suggestions)

- **`vin`** → Vincom Center [Brand Suggestions]; Vinpearl [Brand Suggestions]; Vinmec [Brand Suggestions]; Vincom [Brand Suggestions]; vincom đồng khởi [POI Suggestions]
- **`cafe`** → Quán cà phê gần đây [Category Suggestions]; Cà phê mở cửa 24/7 [Discovery Search]; Highlands Coffee [Brand Suggestions]; quán cafe học bài [Discovery Search]; Mộc Cafe [Brand Suggestions]
- **`atm`** → ATM Vietcombank gần nhất [Nearby Suggestions]; ATM BIDV gần đây [Nearby Suggestions]; ATM gần sân bay [Nearby Suggestions]; atm vcb gần nhất [Nearby Suggestions]; ATM Vietcombank Nguyễn Huệ [POI Suggestions]
- **`nguyen h`** → Nguyễn Huệ, Quận 1, TP.HCM [Address Suggestions]; Phố đi bộ Nguyễn Huệ [POI Suggestions]; Highlands Coffee Nguyễn Huệ [POI Suggestions]; Nguyễn Huệ [Address Suggestions]; Khách sạn Nguyễn Huệ TP.HCM [POI Suggestions]
- **`ben th`** → Chợ Bến Thành [POI Suggestions]; Khách sạn gần Chợ Bến Thành [Discovery Search]; Ben Thanh Market [POI Suggestions]; bến thành [POI Suggestions]; Bệnh viện Lý Thường Kiệt Hà Nội [POI Suggestions]
- **`ks d`** → Khách sạn gần đây [Category Suggestions]; Khách sạn Đà Nẵng [Location Search]; Khách sạn Đà Nẵng gần biển [Discovery Search]; Khách sạn Mường Thanh Đà Nẵng [POI Suggestions]; Khách sạn Pasteur Đà Nẵng [POI Suggestions]
- **`bv bach`** → Bệnh viện Bạch Mai [POI Suggestions]; Bệnh viện gần đây [Category Suggestions]; bv bach mai [POI Suggestions]; Bệnh viện Bạch Mai Cơ sở 1 [POI Suggestions]; Bệnh viện Bạch Mai Cơ sở 2 [POI Suggestions]
- **`pho th`** → Phở Thìn Lò Đúc [POI Suggestions]; Phở gần đây [Category Suggestions]; Phở Thìn [Brand Suggestions]; Lẩu Phố Bình Thạnh [POI Suggestions]; Phở Truyền Thống Xuân Thủy [POI Suggestions]
- **`galaxy`** → Galaxy Cinema [Ambiguous]
- **`12 ngu`** → 12 Nguyễn Huệ, Quận 7, TP Hồ Chí Minh [Address Suggestions]; 12 Nguyễn Huệ, Bình Thạnh, TP Hồ Chí Minh [Address Suggestions]; 12 Võ Nguyên Giáp, Ba Đình, Hà Nội [Address Suggestions]; 12 Trần Hưng Đạo, Ngũ Hành Sơn, Đà Nẵng [Address Suggestions]; 12 Nguyễn Chí Thanh, Cầu Giấy, Hà Nội [Address Suggestions]
- **`atm vcb q`** → ATM Vietcombank gần nhất [Nearby Suggestions]; ATM BIDV gần đây [Nearby Suggestions]; ATM gần sân bay [Nearby Suggestions]; ATM gần vietcom [Discovery Search]; ATM gần đây [Category Suggestions]
- **`khach san da n`** → Khách sạn Đà Nẵng [Location Search]; Khách sạn Đà Nẵng gần biển [Discovery Search]; Khách sạn Mường Thanh Đà Nẵng [POI Suggestions]; Khách sạn Pasteur Đà Nẵng [POI Suggestions]; Khách sạn gần đây [Category Suggestions]
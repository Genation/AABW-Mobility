-- =============================================================================
-- Seed: Route-Aware POIs cho 3 tuyến Pre-Trip Usecase
-- Mục đích: Bổ sung POI thực tế dọc 3 tuyến road-trip để AI Suggestions
-- có dữ liệu chính xác khi search theo từng category.
-- =============================================================================

-- -------------------------------------------------------------------------
-- TUYẾN 1: TP.HCM → Đà Lạt (QL1 → QL20)
-- -------------------------------------------------------------------------

-- Chặng 1: TP.HCM → Long Khánh (~100km)
INSERT INTO "track_4_pois" ("original_id", "poi_name", "category", "brand", "address", "city", "latitude", "longitude", "rating", "review_count", "popularity_score", "tags") VALUES
('ROUTE001', 'Mekong Rest Stop Biên Hòa', 'Trạm dừng chân', 'Mekong Rest Stop', 'QL1, Hố Nai, Biên Hòa, Đồng Nai', 'Biên Hòa', 10.823, 106.816, 4.1, 850, 82, '["dừng chân","cafe","toilet","ăn sáng"]'),
('ROUTE002', 'Cây xăng Petrolimex Trảng Bom', 'Cây xăng', 'Petrolimex', 'QL1, Trảng Bom, Đồng Nai', 'Trảng Bom', 10.865, 106.950, 4.0, 410, 70, '["xăng","toilet","24/7","cửa hàng tiện lợi"]'),
('ROUTE003', 'Cafe Sài Gòn Xưa Trảng Bom', 'Quán cà phê', NULL, 'QL1, Trảng Bom, Đồng Nai', 'Trảng Bom', 10.872, 106.958, 4.2, 320, 65, '["cafe","wifi","yên tĩnh","vườn"]'),
('ROUTE004', 'Quán Cơm Tấm Bụi Đồng Nai', 'Nhà hàng', NULL, 'QL1, Thống Nhất, Đồng Nai', 'Thống Nhất', 10.898, 107.130, 4.3, 540, 74, '["cơm","ăn trưa","địa phương","giá rẻ"]'),
('ROUTE005', 'Cây xăng Petrolimex Long Khánh', 'Cây xăng', 'Petrolimex', 'QL1, Long Khánh, Đồng Nai', 'Long Khánh', 10.915, 107.215, 4.0, 320, 72, '["xăng","toilet","24/7"]'),

-- Chặng 2: Long Khánh → Bảo Lộc (~120km)
('ROUTE006', 'Đồi chè Bảo Lộc Check-in', 'Điểm check-in', NULL, 'QL20, Lộc Châu, Bảo Lộc, Lâm Đồng', 'Bảo Lộc', 11.487, 107.760, 4.6, 4200, 96, '["check-in","săn mây","view đẹp","du lịch"]'),
('ROUTE007', 'Cafe Tám Trình Bảo Lộc', 'Quán cà phê', NULL, 'QL20, Lộc Thanh, Bảo Lộc, Lâm Đồng', 'Bảo Lộc', 11.515, 107.790, 4.3, 680, 78, '["cafe","view núi","takeaway","wifi"]'),
('ROUTE008', 'Quán Bánh Canh Ghẹ Long Khánh', 'Nhà hàng', NULL, 'QL20, Xuân Lộc, Đồng Nai', 'Long Khánh', 10.955, 107.270, 4.4, 890, 82, '["bánh canh","đặc sản","ăn sáng"]'),
('ROUTE009', 'Thác Đam Bri Bảo Lộc', 'Điểm check-in', NULL, 'QL20, Lộc Tân, Bảo Lộc, Lâm Đồng', 'Bảo Lộc', 11.458, 107.720, 4.4, 2800, 88, '["check-in","thác nước","du lịch","thiên nhiên"]'),
('ROUTE010', 'Homestay Đồi Thông Bảo Lộc', 'Nghỉ dưỡng', NULL, 'QL20, Lộc Châu, Bảo Lộc, Lâm Đồng', 'Bảo Lộc', 11.495, 107.770, 4.5, 1200, 84, '["nghỉ dưỡng","homestay","view đẹp","yên tĩnh"]'),

-- Chặng 3: Bảo Lộc → Đà Lạt (~110km)
('ROUTE011', 'Thác Datanla Đà Lạt', 'Điểm check-in', NULL, 'QL20, Phường 3, TP. Đà Lạt, Lâm Đồng', 'Đà Lạt', 11.898, 108.430, 4.5, 8900, 98, '["check-in","thác nước","trượt máng","du lịch"]'),
('ROUTE012', 'Panorama Coffee Đà Lạt', 'Quán cà phê', NULL, 'Trần Hưng Đạo, Phường 10, Đà Lạt, Lâm Đồng', 'Đà Lạt', 11.935, 108.438, 4.4, 2100, 90, '["cafe","view toàn cảnh","check-in","wifi"]'),
('ROUTE013', 'Chợ đêm Đà Lạt', 'Ẩm thực', NULL, 'Nguyễn Thị Minh Khai, Phường 1, Đà Lạt, Lâm Đồng', 'Đà Lạt', 11.944, 108.437, 4.4, 12000, 99, '["ẩm thực","chợ đêm","mua sắm","du lịch"]'),
('ROUTE014', 'Hồ Xuân Hương Đà Lạt', 'Điểm check-in', NULL, 'Phường 1, TP. Đà Lạt, Lâm Đồng', 'Đà Lạt', 11.9417, 108.4423, 4.7, 15000, 99, '["check-in","hồ","du lịch","dạo bộ"]'),
('ROUTE015', 'Lẩu Gà Lá É Tao Ngộ Đà Lạt', 'Nhà hàng', 'Tao Ngộ', 'Đường 3/4, Phường 3, Đà Lạt, Lâm Đồng', 'Đà Lạt', 11.942, 108.434, 4.5, 5600, 93, '["lẩu gà","đặc sản","địa phương","gia đình"]'),
('ROUTE016', 'Cây xăng Petrolimex Di Linh', 'Cây xăng', 'Petrolimex', 'QL20, Di Linh, Lâm Đồng', 'Di Linh', 11.580, 108.080, 4.0, 280, 68, '["xăng","toilet","24/7"]'),
('ROUTE017', 'Resort Terracotta Đà Lạt', 'Nghỉ dưỡng', 'Terracotta', 'Tuyền Lâm, Phường 3, Đà Lạt, Lâm Đồng', 'Đà Lạt', 11.905, 108.435, 4.6, 3200, 91, '["resort","nghỉ dưỡng","gia đình","hồ bơi"]'),

-- -------------------------------------------------------------------------
-- TUYẾN 2: Hà Nội → Hạ Long (QL5 → QL18)
-- -------------------------------------------------------------------------

-- Chặng 1: Hà Nội → Bắc Ninh (~35km)
('ROUTE018', 'Trạm dừng chân Phố Nối', 'Trạm dừng chân', NULL, 'QL5, Phố Nối, Hưng Yên', 'Hưng Yên', 21.082, 105.945, 3.9, 450, 62, '["dừng chân","cafe","toilet","ăn sáng"]'),
('ROUTE019', 'Đền Đô Bắc Ninh', 'Di tích', NULL, 'Đình Bảng, Từ Sơn, Bắc Ninh', 'Bắc Ninh', 21.184, 105.957, 4.6, 3800, 89, '["di tích","lịch sử","du lịch","tâm linh"]'),
('ROUTE020', 'Bánh Phu Thê Đình Bảng', 'Đặc sản', NULL, 'Đình Bảng, Từ Sơn, Bắc Ninh', 'Bắc Ninh', 21.188, 105.965, 4.5, 1200, 76, '["đặc sản","bánh","quà","truyền thống"]'),

-- Chặng 2: Bắc Ninh → Hải Dương (~50km)
('ROUTE021', 'Đền Kiếp Bạc', 'Di tích', NULL, 'Kiếp Bạc, Hưng Đạo, Chí Linh, Hải Dương', 'Chí Linh', 21.105, 106.280, 4.6, 3100, 87, '["di tích","lịch sử","tâm linh","du lịch"]'),
('ROUTE022', 'Bánh đậu xanh Rồng Vàng', 'Đặc sản', 'Rồng Vàng', 'Nguyễn Lương Bằng, TP. Hải Dương', 'Hải Dương', 20.940, 106.325, 4.5, 1800, 80, '["đặc sản","bánh","quà"]'),
('ROUTE023', 'Cafe Mộc Hải Dương', 'Quán cà phê', NULL, 'Trần Hưng Đạo, TP. Hải Dương', 'Hải Dương', 20.935, 106.330, 4.1, 380, 63, '["cafe","wifi","yên tĩnh"]'),

-- Chặng 3: Hải Dương → Hạ Long (~65km)
('ROUTE024', 'Sun World Hạ Long', 'Giải trí', 'Sun World', 'Đường Hạ Long, Bãi Cháy, Hạ Long, Quảng Ninh', 'Hạ Long', 20.962, 107.050, 4.5, 15000, 97, '["giải trí","cáp treo","vòng quay","check-in"]'),
('ROUTE025', 'Chợ Hạ Long 1', 'Mua sắm', NULL, 'Bạch Đằng, Bãi Cháy, Hạ Long, Quảng Ninh', 'Hạ Long', 20.947, 107.075, 4.1, 5600, 86, '["mua sắm","chợ","hải sản","lưu niệm"]'),
('ROUTE026', 'Nhà hàng Hải Sản Bà Tuyết', 'Nhà hàng', NULL, 'Võ Nguyên Giáp, Bãi Cháy, Hạ Long, Quảng Ninh', 'Hạ Long', 20.950, 107.068, 4.3, 2400, 84, '["hải sản","ăn trưa","view biển","gia đình"]'),
('ROUTE027', 'Cây xăng Petrolimex Hạ Long', 'Cây xăng', 'Petrolimex', 'QL18, Bãi Cháy, Hạ Long, Quảng Ninh', 'Hạ Long', 20.968, 106.980, 4.0, 290, 68, '["xăng","toilet","24/7"]'),
('ROUTE028', 'Vinpearl Resort Hạ Long', 'Nghỉ dưỡng', 'Vinpearl', 'Đảo Rều, Bãi Cháy, Hạ Long, Quảng Ninh', 'Hạ Long', 20.955, 107.080, 4.7, 8900, 94, '["resort","nghỉ dưỡng","đảo","hồ bơi","cao cấp"]'),

-- -------------------------------------------------------------------------
-- TUYẾN 3: Đà Nẵng → Huế (QL1A qua đèo Hải Vân)
-- -------------------------------------------------------------------------

-- Chặng 1: Đà Nẵng → Đỉnh Hải Vân (~30km)
('ROUTE029', 'Bán đảo Sơn Trà - Chùa Linh Ứng', 'Điểm check-in', NULL, 'Bán đảo Sơn Trà, Đà Nẵng', 'Đà Nẵng', 16.111, 108.279, 4.7, 9500, 97, '["check-in","chùa","view biển","du lịch"]'),
('ROUTE030', 'Cafe Hải Vân Top', 'Quán cà phê', NULL, 'Đèo Hải Vân, Hòa Hiệp Bắc, Liên Chiểu, Đà Nẵng', 'Đà Nẵng', 16.170, 108.133, 4.2, 780, 71, '["cafe","view biển","check-in","gió mát"]'),
('ROUTE031', 'Hải Vân Quan', 'Di tích', NULL, 'Đỉnh đèo Hải Vân, Lăng Cô, Huế', 'Huế', 16.207, 108.099, 4.8, 18000, 99, '["di tích","check-in","view biển","lịch sử"]'),

-- Chặng 2: Hải Vân → Lăng Cô (~25km)
('ROUTE032', 'Cầu vồng Lăng Cô', 'Điểm check-in', NULL, 'QL1A, Lăng Cô, Phú Lộc, Huế', 'Huế', 16.245, 108.090, 4.4, 3200, 84, '["check-in","view đầm","núi","săn mây"]'),
('ROUTE033', 'Bãi biển Lăng Cô', 'Bãi biển', NULL, 'Lăng Cô, Phú Lộc, Huế', 'Huế', 16.260, 108.085, 4.5, 8700, 95, '["biển","du lịch","check-in","tắm biển"]'),
('ROUTE034', 'Cafe Lăng Cô Beach Club', 'Quán cà phê', NULL, 'Lăng Cô, Phú Lộc, Huế', 'Huế', 16.255, 108.083, 4.3, 520, 68, '["cafe","view biển","wifi","thư giãn"]'),

-- Chặng 3: Lăng Cô → Đầm Cầu Hai (~50km)
('ROUTE035', 'Quán Hải Sản Bé Thơ Lăng Cô', 'Nhà hàng', NULL, 'QL1A, Lăng Cô, Phú Lộc, Huế', 'Huế', 16.270, 107.940, 4.4, 1600, 82, '["hải sản","tươi sống","địa phương","gia đình"]'),
('ROUTE036', 'Điểm ngắm đầm Cầu Hai', 'Điểm check-in', NULL, 'QL49B, Vinh Hiền, Phú Lộc, Huế', 'Huế', 16.300, 107.820, 4.2, 450, 65, '["check-in","hoàng hôn","đầm phá","view đẹp"]'),
('ROUTE037', 'Cây xăng Petrolimex Phú Lộc', 'Cây xăng', 'Petrolimex', 'QL1A, Phú Lộc, Huế', 'Huế', 16.285, 107.860, 4.0, 250, 67, '["xăng","toilet","24/7"]'),

-- Chặng 4: Cầu Hai → Huế (~45km)
('ROUTE038', 'Lăng Khải Định', 'Di tích', NULL, 'Thủy Bằng, Hương Thủy, Huế', 'Huế', 16.403, 107.587, 4.6, 14000, 98, '["di tích","UNESCO","kiến trúc","check-in"]'),
('ROUTE039', 'Chùa Thiên Mụ', 'Di tích', NULL, 'Kim Long, TP. Huế', 'Huế', 16.453, 107.545, 4.7, 21000, 99, '["di tích","chùa","view sông Hương","biểu tượng"]'),
('ROUTE040', 'Bún bò Huế Bà Tuyết', 'Nhà hàng', NULL, 'Nguyễn Huệ, Phú Nhuận, TP. Huế', 'Huế', 16.465, 107.590, 4.5, 7800, 92, '["bún bò","đặc sản","ăn sáng","địa phương"]'),
('ROUTE041', 'Đại Nội Huế', 'Di tích', NULL, '23/8, Thuận Hòa, TP. Huế', 'Huế', 16.4697, 107.5777, 4.7, 25000, 99, '["di tích","UNESCO","lịch sử","check-in"]'),
('ROUTE042', 'Cơm hến Huế O Nhỏ', 'Nhà hàng', NULL, 'Trương Định, Phú Nhuận, TP. Huế', 'Huế', 16.460, 107.585, 4.4, 3400, 86, '["cơm hến","đặc sản","ăn vặt","địa phương"]'),
('ROUTE043', 'Khách sạn Azerai La Residence Huế', 'Nghỉ dưỡng', 'Azerai', 'Lê Lợi, Vĩnh Ninh, TP. Huế', 'Huế', 16.463, 107.582, 4.7, 2100, 90, '["khách sạn","nghỉ dưỡng","cao cấp","view sông Hương"]');

-- =============================================================================
-- Seed: Autocomplete entries cho POI mới (15 entries)
-- =============================================================================

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency") VALUES
('ROUTESUG01', 'doi che', 'Đồi chè Bảo Lộc', 'POI Suggestion', 0.96, 4200),
('ROUTESUG02', 'thac d', 'Thác Datanla Đà Lạt', 'POI Suggestion', 0.95, 8900),
('ROUTESUG03', 'ha long', 'Bãi Cháy Hạ Long', 'POI Suggestion', 0.94, 12000),
('ROUTESUG04', 'sun wo', 'Sun World Hạ Long', 'POI Suggestion', 0.93, 6700),
('ROUTESUG05', 'hai van', 'Hải Vân Quan', 'POI Suggestion', 0.97, 15000),
('ROUTESUG06', 'lang co', 'Bãi biển Lăng Cô', 'POI Suggestion', 0.94, 8700),
('ROUTESUG07', 'dai noi', 'Đại Nội Huế', 'POI Suggestion', 0.98, 22000),
('ROUTESUG08', 'thien mu', 'Chùa Thiên Mụ', 'POI Suggestion', 0.97, 18000),
('ROUTESUG09', 'khai dinh', 'Lăng Khải Định', 'POI Suggestion', 0.96, 12000),
('ROUTESUG10', 'bun bo h', 'Bún bò Huế', 'Category Search', 0.95, 9500),
('ROUTESUG11', 'mekong res', 'Mekong Rest Stop', 'POI Suggestion', 0.91, 1800),
('ROUTESUG12', 'panorama', 'Panorama Coffee Đà Lạt', 'POI Suggestion', 0.90, 2100),
('ROUTESUG13', 'kiep bac', 'Đền Kiếp Bạc', 'POI Suggestion', 0.94, 3100),
('ROUTESUG14', 'com hen', 'Cơm hến Huế', 'Category Search', 0.93, 4500),
('ROUTESUG15', 'dat t', 'Đà Lạt', 'Location Search', 0.96, 25000);

-- =============================================================================
-- Seed: Enriched POI Categories & Brands (LLM-generated category-tag mappings)
-- ~330 rows covering ~85 Vietnamese POI categories with search-relevant tags
-- =============================================================================

INSERT INTO "track_4_pois" ("original_id", "poi_name", "category", "brand", "address", "city", "latitude", "longitude", "rating", "review_count", "popularity_score", "tags", "is_generated") VALUES

-- ===========================================================================
-- Trà sữa (Bubble Tea)
-- ===========================================================================
('LLM001', 'Trà sữa', 'Trà sữa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["takeaway","giao hàng","trân châu","ngon","giá rẻ"]', true),
('LLM002', 'Trà sữa', 'Trà sữa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["check-in","đẹp","sống ảo","wifi","máy lạnh"]', true),
('LLM003', 'Trà sữa', 'Trà sữa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nhóm","hẹn hò","nhạc nhẹ","mở cửa khuya"]', true),
('LLM004', 'Trà sữa', 'Trà sữa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["topping","matcha","trà trái cây","thương hiệu"]', true),

-- ===========================================================================
-- Phòng gym (Gym/Fitness)
-- ===========================================================================
('LLM005', 'Phòng gym', 'Phòng gym', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["máy tập","hướng dẫn viên","phòng thay đồ","gương lớn"]', true),
('LLM006', 'Phòng gym', 'Phòng gym', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["24/7","yoga","spinning","crossfit"]', true),
('LLM007', 'Phòng gym', 'Phòng gym', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giá rẻ","tháng","gói tập","ưu đãi","sinh viên"]', true),
('LLM008', 'Phòng gym', 'Phòng gym', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["hồ bơi","sauna","máy lạnh","cao cấp"]', true),

-- ===========================================================================
-- Siêu thị (Supermarket)
-- ===========================================================================
('LLM009', 'Siêu thị', 'Siêu thị', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thực phẩm","đồ gia dụng","mua sắm","bãi đỗ xe"]', true),
('LLM010', 'Siêu thị', 'Siêu thị', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["24/7","giao hàng","online","khuyến mãi"]', true),
('LLM011', 'Siêu thị', 'Siêu thị', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["siêu thị mini","bình dân","tạp hóa","gần nhà"]', true),
('LLM012', 'Siêu thị', 'Siêu thị', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["hàng nhập khẩu","cao cấp","thực phẩm sạch","organic"]', true),

-- ===========================================================================
-- Cửa hàng tiện lợi (Convenience Store)
-- ===========================================================================
('LLM013', 'Cửa hàng tiện lợi', 'Cửa hàng tiện lợi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["24/7","đồ ăn nhanh","nước uống","thẻ cào"]', true),
('LLM014', 'Cửa hàng tiện lợi', 'Cửa hàng tiện lợi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giao hàng","thanh toán online","hóa đơn","tiện ích"]', true),
('LLM015', 'Cửa hàng tiện lợi', 'Cửa hàng tiện lợi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thuốc lá","bia","snack","mì gói"]', true),

-- ===========================================================================
-- Nhà thuốc / Hiệu thuốc (Pharmacy)
-- ===========================================================================
('LLM016', 'Nhà thuốc', 'Nhà thuốc', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["kê đơn","dược sĩ","thuốc bổ","bảo hiểm y tế"]', true),
('LLM017', 'Nhà thuốc', 'Nhà thuốc', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["24/7","giao hàng","online","cấp cứu"]', true),
('LLM018', 'Nhà thuốc', 'Nhà thuốc', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thực phẩm chức năng","mỹ phẩm","dụng cụ y tế","tã em bé"]', true),

-- ===========================================================================
-- Tiệm vàng (Jewelry Store)
-- ===========================================================================
('LLM019', 'Tiệm vàng', 'Tiệm vàng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["vàng 24k","trang sức","kim cương","uy tín"]', true),
('LLM020', 'Tiệm vàng', 'Tiệm vàng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nhẫn cưới","quà tặng","sang trọng","bảo hành"]', true),
('LLM021', 'Tiệm vàng', 'Tiệm vàng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thu đổi","trao đổi","giá tốt","niêm yết"]', true),

-- ===========================================================================
-- Tiệm bánh (Bakery)
-- ===========================================================================
('LLM022', 'Tiệm bánh', 'Tiệm bánh', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bánh mì","bánh ngọt","bánh kem","sinh nhật"]', true),
('LLM023', 'Tiệm bánh', 'Tiệm bánh', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["takeaway","giao hàng","ăn sáng","cà phê"]', true),
('LLM024', 'Tiệm bánh', 'Tiệm bánh', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bánh Âu","croissant","bánh mì Việt Nam","bánh trung thu"]', true),

-- ===========================================================================
-- Quán nướng (BBQ Restaurant)
-- ===========================================================================
('LLM025', 'Quán nướng', 'Quán nướng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["buffet","tự nướng","thịt bò","hải sản"]', true),
('LLM026', 'Quán nướng', 'Quán nướng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sân vườn","outdoor","gia đình","nhóm"]', true),
('LLM027', 'Quán nướng', 'Quán nướng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["Hàn Quốc","viên","không khói","máy lạnh"]', true),
('LLM028', 'Quán nướng', 'Quán nướng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["đồng quê","vỉa hè","bình dân","giá rẻ"]', true),

-- ===========================================================================
-- Nhà hàng lẩu (Hotpot Restaurant)
-- ===========================================================================
('LLM029', 'Nhà hàng lẩu', 'Nhà hàng lẩu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["lẩu Thái","hải sản","buffet","gia đình"]', true),
('LLM030', 'Nhà hàng lẩu', 'Nhà hàng lẩu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["máy lạnh","sang trọng","đặt bàn","hẹn hò"]', true),
('LLM031', 'Nhà hàng lẩu', 'Nhà hàng lẩu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["Tứ Xuyên","ấm cúng","nhóm","ăn khuya"]', true),

-- ===========================================================================
-- Nhà hàng chay (Vegetarian Restaurant)
-- ===========================================================================
('LLM032', 'Nhà hàng chay', 'Nhà hàng chay', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thuần chay","phật tử","sức khỏe","organic"]', true),
('LLM033', 'Nhà hàng chay', 'Nhà hàng chay', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["buffet","giá rẻ","bình dân","gia đình"]', true),
('LLM034', 'Nhà hàng chay', 'Nhà hàng chay', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sang trọng","yên tĩnh","thiền","không gian xanh"]', true),

-- ===========================================================================
-- Nhà hàng halal (Halal Restaurant)
-- ===========================================================================
('LLM035', 'Nhà hàng halal', 'Nhà hàng halal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["halal","chứng nhận","không thịt heo","du khách"]', true),
('LLM036', 'Nhà hàng halal', 'Nhà hàng halal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["Ấn Độ","Malaysia","Trung Đông","gia vị"]', true),
('LLM037', 'Nhà hàng halal', 'Nhà hàng halal', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giao hàng","đặt bàn","gia đình","nhóm"]', true),

-- ===========================================================================
-- Quán nhậu (Beer House / Pub)
-- ===========================================================================
('LLM038', 'Quán nhậu', 'Quán nhậu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bia","mồi","vỉa hè","bình dân","giá rẻ"]', true),
('LLM039', 'Quán nhậu', 'Quán nhậu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nhạc sống","mở cửa khuya","nhóm","karaoke"]', true),
('LLM040', 'Quán nhậu', 'Quán nhậu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sân vườn","sang trọng","hải sản","đặc sản"]', true),

-- ===========================================================================
-- Quán ăn vặt (Street Food / Snacks)
-- ===========================================================================
('LLM041', 'Quán ăn vặt', 'Quán ăn vặt', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["xiên que","cá viên","học sinh","giá rẻ"]', true),
('LLM042', 'Quán ăn vặt', 'Quán ăn vặt', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["đường phố","takeaway","ăn xế","đa dạng"]', true),
('LLM043', 'Quán ăn vặt', 'Quán ăn vặt', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["hẹn hò","check-in","đẹp","trà sữa","giới trẻ"]', true),

-- ===========================================================================
-- Tiệm sửa xe (Motorbike Repair)
-- ===========================================================================
('LLM044', 'Tiệm sửa xe', 'Tiệm sửa xe', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["xe máy","thay dầu","vá lốp","khẩn cấp"]', true),
('LLM045', 'Tiệm sửa xe', 'Tiệm sửa xe', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["rửa xe","bảo dưỡng","phụ tùng","chính hãng"]', true),
('LLM046', 'Tiệm sửa xe', 'Tiệm sửa xe', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gần đây","giá rẻ","uy tín","nhanh"]', true),

-- ===========================================================================
-- Garage ô tô (Car Garage)
-- ===========================================================================
('LLM047', 'Garage ô tô', 'Garage ô tô', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sửa chữa","bảo dưỡng","đồng sơn","cứu hộ"]', true),
('LLM048', 'Garage ô tô', 'Garage ô tô', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["chính hãng","bảo hiểm","thay dầu","lốp"]', true),
('LLM049', 'Garage ô tô', 'Garage ô tô', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["hiện đại","máy móc","kỹ thuật viên","bãi đỗ xe"]', true),

-- ===========================================================================
-- Spa (Spa / Wellness)
-- ===========================================================================
('LLM050', 'Spa', 'Spa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["massage","chăm sóc da","trị liệu","thư giãn"]', true),
('LLM051', 'Spa', 'Spa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cao cấp","sang trọng","cặp đôi","xông hơi"]', true),
('LLM052', 'Spa', 'Spa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giá rẻ","giảm cân","giảm stress","bấm huyệt"]', true),

-- ===========================================================================
-- Massage (Massage Parlor)
-- ===========================================================================
('LLM053', 'Massage', 'Massage', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["body","chân","đá nóng","dầu"]', true),
('LLM054', 'Massage', 'Massage', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["Thái","Nhật","bấm huyệt","giác hơi"]', true),
('LLM055', 'Massage', 'Massage', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["mở cửa khuya","giá rẻ","uy tín","sạch sẽ"]', true),

-- ===========================================================================
-- Salon tóc (Hair Salon)
-- ===========================================================================
('LLM056', 'Salon tóc', 'Salon tóc', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cắt","uốn","nhuộm","gội đầu"]', true),
('LLM057', 'Salon tóc', 'Salon tóc', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cao cấp","stylist","tư vấn","sản phẩm chuyên nghiệp"]', true),
('LLM058', 'Salon tóc', 'Salon tóc', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giá rẻ","nhanh","bình dân","sinh viên"]', true),

-- ===========================================================================
-- Tiệm nail (Nail Salon)
-- ===========================================================================
('LLM059', 'Tiệm nail', 'Tiệm nail', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sơn gel","đắp bột","vẽ móng","chăm sóc"]', true),
('LLM060', 'Tiệm nail', 'Tiệm nail', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cao cấp","sang trọng","vệ sinh","đặt hẹn"]', true),
('LLM061', 'Tiệm nail', 'Tiệm nail', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giá rẻ","sinh viên","nhanh","mở cửa khuya"]', true),

-- ===========================================================================
-- Trường học (School)
-- ===========================================================================
('LLM062', 'Trường học', 'Trường học', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["tiểu học","trung học","công lập","bán trú"]', true),
('LLM063', 'Trường học', 'Trường học', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["quốc tế","song ngữ","chất lượng cao","cơ sở vật chất"]', true),
('LLM064', 'Trường học', 'Trường học', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["mầm non","mẫu giáo","gần nhà","an toàn"]', true),

-- ===========================================================================
-- Học viện / Trung tâm đào tạo (Training Center)
-- ===========================================================================
('LLM065', 'Trung tâm đào tạo', 'Trung tâm đào tạo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["ngoại ngữ","tin học","chứng chỉ","online"]', true),
('LLM066', 'Trung tâm đào tạo', 'Trung tâm đào tạo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["kỹ năng mềm","luyện thi","gia sư","nhóm nhỏ"]', true),
('LLM067', 'Trung tâm đào tạo', 'Trung tâm đào tạo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nghề","lái xe","nấu ăn","làm đẹp"]', true),

-- ===========================================================================
-- Ngân hàng (Bank)
-- ===========================================================================
('LLM068', 'Ngân hàng', 'Ngân hàng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giao dịch","vay","tiết kiệm","chuyển khoản"]', true),
('LLM069', 'Ngân hàng', 'Ngân hàng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["ATM","24/7","thanh toán","Internet Banking"]', true),
('LLM070', 'Ngân hàng', 'Ngân hàng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["mở thẻ","tín dụng","bảo hiểm","tư vấn tài chính"]', true),

-- ===========================================================================
-- Bưu điện (Post Office)
-- ===========================================================================
('LLM071', 'Bưu điện', 'Bưu điện', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gửi thư","bưu phẩm","EMS","chuyển phát nhanh"]', true),
('LLM072', 'Bưu điện', 'Bưu điện', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["đóng gói","chuyển tiền","thu hộ","bảo hiểm"]', true),

-- ===========================================================================
-- Khu vui chơi (Amusement / Entertainment Area)
-- ===========================================================================
('LLM073', 'Khu vui chơi', 'Khu vui chơi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["trẻ em","gia đình","trong nhà","an toàn"]', true),
('LLM074', 'Khu vui chơi', 'Khu vui chơi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giải trí","ăn uống","cuối tuần","vé vào cửa"]', true),
('LLM075', 'Khu vui chơi', 'Khu vui chơi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["ngoài trời","công viên nước","mạo hiểm","nhóm"]', true),

-- ===========================================================================
-- Công viên (Park)
-- ===========================================================================
('LLM076', 'Công viên', 'Công viên', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["xanh","tập thể dục","đi bộ","chạy bộ"]', true),
('LLM077', 'Công viên', 'Công viên', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["dã ngoại","gia đình","trẻ em","cắm trại"]', true),
('LLM078', 'Công viên', 'Công viên', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["check-in","view đẹp","hồ nước","miễn phí"]', true),

-- ===========================================================================
-- Bảo tàng (Museum)
-- ===========================================================================
('LLM079', 'Bảo tàng', 'Bảo tàng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["lịch sử","văn hóa","nghệ thuật","du lịch"]', true),
('LLM080', 'Bảo tàng', 'Bảo tàng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["miễn phí","hướng dẫn viên","gia đình","giáo dục"]', true),
('LLM081', 'Bảo tàng', 'Bảo tàng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["check-in","kiến trúc đẹp","tham quan","máy lạnh"]', true),

-- ===========================================================================
-- Nhà thờ (Church)
-- ===========================================================================
('LLM082', 'Nhà thờ', 'Nhà thờ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["công giáo","lễ","cầu nguyện","cộng đồng"]', true),
('LLM083', 'Nhà thờ', 'Nhà thờ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["kiến trúc cổ","check-in","du lịch","giáng sinh"]', true),
('LLM084', 'Nhà thờ', 'Nhà thờ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nhà thờ họ","giáo xứ","bình dân","gần nhà"]', true),

-- ===========================================================================
-- Chùa (Buddhist Temple / Pagoda)
-- ===========================================================================
('LLM085', 'Chùa', 'Chùa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["phật giáo","cầu an","lễ phật","tĩnh tâm"]', true),
('LLM086', 'Chùa', 'Chùa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["du lịch","kiến trúc cổ","check-in","đầu năm"]', true),
('LLM087', 'Chùa', 'Chùa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["yên tĩnh","thiền","không gian xanh","hành hương"]', true),

-- ===========================================================================
-- Đình / Đền (Communal House / Shrine)
-- ===========================================================================
('LLM088', 'Đình', 'Đình', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["di tích","lễ hội","văn hóa","kiến trúc cổ"]', true),
('LLM089', 'Đền', 'Đền', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thờ cúng","tín ngưỡng","tâm linh","cầu may"]', true),

-- ===========================================================================
-- Bệnh viện thú y (Veterinary)
-- ===========================================================================
('LLM090', 'Bệnh viện thú y', 'Bệnh viện thú y', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["chó","mèo","khám bệnh","tiêm phòng"]', true),
('LLM091', 'Bệnh viện thú y', 'Bệnh viện thú y', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["phẫu thuật","cấp cứu","24/7","nội trú"]', true),
('LLM092', 'Bệnh viện thú y', 'Bệnh viện thú y', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["spa thú cưng","grooming","khách sạn thú cưng","bán thức ăn"]', true),

-- ===========================================================================
-- Phòng khám (Medical Clinic)
-- ===========================================================================
('LLM093', 'Phòng khám', 'Phòng khám', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["đa khoa","bác sĩ","đặt hẹn","bảo hiểm"]', true),
('LLM094', 'Phòng khám', 'Phòng khám', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sản phụ khoa","siêu âm","xét nghiệm","tư vấn"]', true),
('LLM095', 'Phòng khám', 'Phòng khám', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nhi khoa","trẻ em","tiêm chủng","dinh dưỡng"]', true),

-- ===========================================================================
-- Nha khoa (Dental Clinic)
-- ===========================================================================
('LLM096', 'Nha khoa', 'Nha khoa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nhổ răng","trám răng","niềng răng","tẩy trắng"]', true),
('LLM097', 'Nha khoa', 'Nha khoa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cấy ghép","thẩm mỹ","công nghệ cao","bác sĩ giỏi"]', true),
('LLM098', 'Nha khoa', 'Nha khoa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["trẻ em","không đau","bảo hiểm","giá rẻ"]', true),

-- ===========================================================================
-- Nhà nghỉ (Motel / Guesthouse)
-- ===========================================================================
('LLM099', 'Nhà nghỉ', 'Nhà nghỉ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giá rẻ","qua đêm","bình dân","sạch sẽ"]', true),
('LLM100', 'Nhà nghỉ', 'Nhà nghỉ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["máy lạnh","wifi","bãi đỗ xe","yên tĩnh"]', true),
('LLM101', 'Nhà nghỉ', 'Nhà nghỉ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gần bến xe","gần bệnh viện","gần trường","nghỉ ngơi"]', true),

-- ===========================================================================
-- Homestay (Homestay)
-- ===========================================================================
('LLM102', 'Homestay', 'Homestay', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["check-in","view đẹp","sống ảo","kiến trúc độc đáo"]', true),
('LLM103', 'Homestay', 'Homestay', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gần biển","view núi","yên tĩnh","lãng mạn"]', true),
('LLM104', 'Homestay', 'Homestay', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gia đình","bếp nấu","giá rẻ","địa phương"]', true),

-- ===========================================================================
-- Resort (Resort)
-- ===========================================================================
('LLM105', 'Resort', 'Resort', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["hồ bơi","spa","nhà hàng","cao cấp"]', true),
('LLM106', 'Resort', 'Resort', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gần biển","all-inclusive","gia đình","trẻ em"]', true),
('LLM107', 'Resort', 'Resort', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nghỉ dưỡng","yên tĩnh","xanh","sang trọng"]', true),

-- ===========================================================================
-- Nhà hàng Nhật (Japanese Restaurant)
-- ===========================================================================
('LLM108', 'Nhà hàng Nhật', 'Nhà hàng Nhật', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sushi","sashimi","ramen","wagyu"]', true),
('LLM109', 'Nhà hàng Nhật', 'Nhà hàng Nhật', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["máy lạnh","sang trọng","hẹn hò","đặt bàn"]', true),
('LLM110', 'Nhà hàng Nhật', 'Nhà hàng Nhật', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["buffet","teppanyaki","rượu sake","bình dân"]', true),

-- ===========================================================================
-- Nhà hàng Hàn (Korean Restaurant)
-- ===========================================================================
('LLM111', 'Nhà hàng Hàn', 'Nhà hàng Hàn', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["BBQ","kimchi","bibimbap","soju"]', true),
('LLM112', 'Nhà hàng Hàn', 'Nhà hàng Hàn', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gia đình","nhóm","nhạc KPOP","máy lạnh"]', true),
('LLM113', 'Nhà hàng Hàn', 'Nhà hàng Hàn', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["buffet","lẩu","gà rán","mì cay"]', true),

-- ===========================================================================
-- Nhà hàng Âu (Western Restaurant)
-- ===========================================================================
('LLM114', 'Nhà hàng Âu', 'Nhà hàng Âu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["steak","pasta","rượu vang","sang trọng"]', true),
('LLM115', 'Nhà hàng Âu', 'Nhà hàng Âu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["hẹn hò","lãng mạn","view đẹp","đặt bàn"]', true),
('LLM116', 'Nhà hàng Âu', 'Nhà hàng Âu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["Pháp","Ý","giao hàng","ăn trưa"]', true),

-- ===========================================================================
-- Nhà hàng hải sản (Seafood Restaurant)
-- ===========================================================================
('LLM117', 'Nhà hàng hải sản', 'Nhà hàng hải sản', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["tươi sống","tôm","cua","cá"]', true),
('LLM118', 'Nhà hàng hải sản', 'Nhà hàng hải sản', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gần biển","view biển","bình dân","địa phương"]', true),
('LLM119', 'Nhà hàng hải sản', 'Nhà hàng hải sản', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sang trọng","đặt bàn","gia đình","đặc sản"]', true),

-- ===========================================================================
-- Phở (Pho Restaurant)
-- ===========================================================================
('LLM120', 'Phở', 'Phở', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["phở bò","phở gà","ăn sáng","địa phương"]', true),
('LLM121', 'Phở', 'Phở', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["takeaway","giao hàng","nước dùng ngon","uy tín"]', true),
('LLM122', 'Phở', 'Phở', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["máy lạnh","sạch sẽ","bình dân","gia đình"]', true),

-- ===========================================================================
-- Bún / Bún đậu / Bún bò (Noodle Specialty)
-- ===========================================================================
('LLM123', 'Quán bún', 'Quán bún', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bún bò Huế","bún đậu mắm tôm","bún riêu","bún chả"]', true),
('LLM124', 'Quán bún', 'Quán bún', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["ăn sáng","ăn trưa","địa phương","giá rẻ"]', true),
('LLM125', 'Quán bún', 'Quán bún', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["takeaway","giao hàng","vỉa hè","bình dân"]', true),

-- ===========================================================================
-- Cơm tấm (Broken Rice)
-- ===========================================================================
('LLM126', 'Cơm tấm', 'Cơm tấm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sườn","bì","chả","ăn trưa","ăn tối"]', true),
('LLM127', 'Cơm tấm', 'Cơm tấm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["takeaway","giá rẻ","bình dân","vỉa hè"]', true),
('LLM128', 'Cơm tấm', 'Cơm tấm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["máy lạnh","sạch sẽ","gia đình","địa phương"]', true),

-- ===========================================================================
-- Bánh mì (Banh Mi)
-- ===========================================================================
('LLM129', 'Bánh mì', 'Bánh mì', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["ăn sáng","takeaway","giá rẻ","đường phố"]', true),
('LLM130', 'Bánh mì', 'Bánh mì', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thịt nướng","xíu mại","pate","rau thơm"]', true),
('LLM131', 'Bánh mì', 'Bánh mì', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bánh mì que","chả cá","giao hàng","ăn xế"]', true),

-- ===========================================================================
-- Quán kem (Ice Cream Shop)
-- ===========================================================================
('LLM132', 'Quán kem', 'Quán kem', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["takeaway","hẹn hò","gia đình","trẻ em"]', true),
('LLM133', 'Quán kem', 'Quán kem', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["check-in","sống ảo","đẹp","máy lạnh"]', true),
('LLM134', 'Quán kem', 'Quán kem', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["kem Ý","gelato","kem que","ăn vặt"]', true),

-- ===========================================================================
-- Quán chè (Sweet Soup Dessert)
-- ===========================================================================
('LLM135', 'Quán chè', 'Quán chè', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["chè thái","chè bưởi","chè khúc bạch","ăn vặt"]', true),
('LLM136', 'Quán chè', 'Quán chè', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["takeaway","giao hàng","hẹn hò","nhóm"]', true),
('LLM137', 'Quán chè', 'Quán chè', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["mở cửa khuya","bình dân","giá rẻ","địa phương"]', true),

-- ===========================================================================
-- Quán sinh tố / Nước ép (Juice Bar)
-- ===========================================================================
('LLM138', 'Quán sinh tố', 'Quán sinh tố', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["trái cây tươi","sức khỏe","takeaway","giá rẻ"]', true),
('LLM139', 'Quán sinh tố', 'Quán sinh tố', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["detox","ăn kiêng","giao hàng","sinh viên"]', true),

-- ===========================================================================
-- Karaoke (Karaoke)
-- ===========================================================================
('LLM140', 'Karaoke', 'Karaoke', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gia đình","nhóm","phòng VIP","máy lạnh"]', true),
('LLM141', 'Karaoke', 'Karaoke', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giá rẻ","sinh viên","mở cửa khuya","đồ uống"]', true),
('LLM142', 'Karaoke', 'Karaoke', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cao cấp","âm thanh tốt","bài hát mới","ăn uống"]', true),

-- ===========================================================================
-- Quán bia (Beer House / Bia hơi)
-- ===========================================================================
('LLM143', 'Quán bia', 'Quán bia', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bia hơi","vỉa hè","bình dân","giá rẻ"]', true),
('LLM144', 'Quán bia', 'Quán bia', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bia thủ công","craft beer","sang trọng","nhạc sống"]', true),
('LLM145', 'Quán bia', 'Quán bia', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["rooftop","view đẹp","hẹn hò","nhóm"]', true),

-- ===========================================================================
-- Câu lạc bộ thể thao (Sports Club)
-- ===========================================================================
('LLM146', 'CLB thể thao', 'CLB thể thao', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["tennis","cầu lông","bóng đá","thuê sân"]', true),
('LLM147', 'CLB thể thao', 'CLB thể thao', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["hồ bơi","yoga","dạy bơi","phòng tập"]', true),
('LLM148', 'CLB thể thao', 'CLB thể thao', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bóng rổ","gym","giá rẻ","sinh viên"]', true),

-- ===========================================================================
-- Hồ bơi (Swimming Pool)
-- ===========================================================================
('LLM149', 'Hồ bơi', 'Hồ bơi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["công cộng","giá rẻ","trẻ em","dạy bơi"]', true),
('LLM150', 'Hồ bơi', 'Hồ bơi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["ngoài trời","resort","sang trọng","view đẹp"]', true),
('LLM151', 'Hồ bơi', 'Hồ bơi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bốn mùa","mái che","vệ sinh","an toàn"]', true),

-- ===========================================================================
-- Yoga (Yoga Studio)
-- ===========================================================================
('LLM152', 'Yoga', 'Yoga', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sức khỏe","dẻo dai","thiền","giảm stress"]', true),
('LLM153', 'Yoga', 'Yoga', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giảm cân","online","sáng sớm","gói tập"]', true),
('LLM154', 'Yoga', 'Yoga', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cho bà bầu","trị liệu","máy lạnh","phòng sạch"]', true),

-- ===========================================================================
-- Cắt tóc nam (Barbershop)
-- ===========================================================================
('LLM155', 'Cắt tóc nam', 'Cắt tóc nam', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["barber","vuốt sáp","cạo mặt","stylist nam"]', true),
('LLM156', 'Cắt tóc nam', 'Cắt tóc nam', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giá rẻ","nhanh","bình dân","sinh viên"]', true),
('LLM157', 'Cắt tóc nam', 'Cắt tóc nam', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cao cấp","đặt hẹn","bia miễn phí","gội đầu"]', true),

-- ===========================================================================
-- Cửa hàng thời trang (Fashion Store)
-- ===========================================================================
('LLM158', 'Cửa hàng thời trang', 'Cửa hàng thời trang', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nam","nữ","trẻ em","hàng hiệu"]', true),
('LLM159', 'Cửa hàng thời trang', 'Cửa hàng thời trang', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giá rẻ","sale","online","bình dân"]', true),
('LLM160', 'Cửa hàng thời trang', 'Cửa hàng thời trang', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thời trang Việt","local brand","máy lạnh","gửi xe"]', true),

-- ===========================================================================
-- Cửa hàng điện thoại (Phone Store)
-- ===========================================================================
('LLM161', 'Cửa hàng điện thoại', 'Cửa hàng điện thoại', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["iPhone","Samsung","phụ kiện","sửa chữa"]', true),
('LLM162', 'Cửa hàng điện thoại', 'Cửa hàng điện thoại', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["chính hãng","trả góp","thu cũ đổi mới","bảo hành"]', true),
('LLM163', 'Cửa hàng điện thoại', 'Cửa hàng điện thoại', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["ốp lưng","dán màn hình","sim","thẻ nhớ"]', true),

-- ===========================================================================
-- Cửa hàng điện tử (Electronics Store)
-- ===========================================================================
('LLM164', 'Cửa hàng điện tử', 'Cửa hàng điện tử', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["laptop","máy tính","tivi","máy ảnh"]', true),
('LLM165', 'Cửa hàng điện tử', 'Cửa hàng điện tử', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["chính hãng","trả góp","bảo hành","khuyến mãi"]', true),
('LLM166', 'Cửa hàng điện tử', 'Cửa hàng điện tử', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sửa chữa","linh kiện","cũ","giá rẻ"]', true),

-- ===========================================================================
-- Nhà sách (Bookstore)
-- ===========================================================================
('LLM167', 'Nhà sách', 'Nhà sách', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sách giáo khoa","văn phòng phẩm","đồ chơi","quà tặng"]', true),
('LLM168', 'Nhà sách', 'Nhà sách', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cà phê sách","yên tĩnh","đọc sách","wifi"]', true),
('LLM169', 'Nhà sách', 'Nhà sách', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sách ngoại văn","ebook","giao hàng","online"]', true),

-- ===========================================================================
-- Cửa hàng thể thao (Sports Store)
-- ===========================================================================
('LLM170', 'Cửa hàng thể thao', 'Cửa hàng thể thao', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giày","quần áo","phụ kiện","đồ tập gym"]', true),
('LLM171', 'Cửa hàng thể thao', 'Cửa hàng thể thao', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bóng đá","cầu lông","tennis","bơi lội"]', true),

-- ===========================================================================
-- Cửa hàng hoa (Flower Shop)
-- ===========================================================================
('LLM172', 'Cửa hàng hoa', 'Cửa hàng hoa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["hoa tươi","bó hoa","sinh nhật","khai trương"]', true),
('LLM173', 'Cửa hàng hoa', 'Cửa hàng hoa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giao hàng","online","hoa cưới","hoa tang"]', true),
('LLM174', 'Cửa hàng hoa', 'Cửa hàng hoa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["hoa nhập khẩu","cao cấp","thiết kế","valentine"]', true),

-- ===========================================================================
-- Cửa hàng mỹ phẩm (Cosmetics Store)
-- ===========================================================================
('LLM175', 'Cửa hàng mỹ phẩm', 'Cửa hàng mỹ phẩm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["chăm sóc da","trang điểm","nước hoa","chính hãng"]', true),
('LLM176', 'Cửa hàng mỹ phẩm', 'Cửa hàng mỹ phẩm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["Hàn Quốc","Nhật","organic","thuần chay"]', true),
('LLM177', 'Cửa hàng mỹ phẩm', 'Cửa hàng mỹ phẩm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giá rẻ","giao hàng","online","tư vấn"]', true),

-- ===========================================================================
-- Cửa hàng vật nuôi (Pet Store)
-- ===========================================================================
('LLM178', 'Cửa hàng vật nuôi', 'Cửa hàng vật nuôi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thức ăn","phụ kiện","chó","mèo"]', true),
('LLM179', 'Cửa hàng vật nuôi', 'Cửa hàng vật nuôi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["grooming","spa thú cưng","khám","tiêm phòng"]', true),
('LLM180', 'Cửa hàng vật nuôi', 'Cửa hàng vật nuôi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cá cảnh","chim","bò sát","thủy sinh"]', true),

-- ===========================================================================
-- Đại lý du lịch (Travel Agency)
-- ===========================================================================
('LLM181', 'Đại lý du lịch', 'Đại lý du lịch', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["tour","vé máy bay","visa","combo"]', true),
('LLM182', 'Đại lý du lịch', 'Đại lý du lịch', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["trong nước","quốc tế","giá rẻ","khuyến mãi"]', true),
('LLM183', 'Đại lý du lịch', 'Đại lý du lịch', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["team building","du lịch công ty","honeymoon","gia đình"]', true),

-- ===========================================================================
-- Studio ảnh (Photo Studio)
-- ===========================================================================
('LLM184', 'Studio ảnh', 'Studio ảnh', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["chụp ảnh cưới","chân dung","gia đình","trẻ em"]', true),
('LLM185', 'Studio ảnh', 'Studio ảnh', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cho thuê váy","makeup","in ảnh","online"]', true),
('LLM186', 'Studio ảnh', 'Studio ảnh', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["kỷ yếu","thẻ visa","sản phẩm","concept"]', true),

-- ===========================================================================
-- Bãi đỗ xe (Parking Lot)
-- ===========================================================================
('LLM187', 'Bãi đỗ xe', 'Bãi đỗ xe', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["ô tô","xe máy","an toàn","có mái che"]', true),
('LLM188', 'Bãi đỗ xe', 'Bãi đỗ xe', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["trung tâm","giá rẻ","24/7","gửi tháng"]', true),
('LLM189', 'Bãi đỗ xe', 'Bãi đỗ xe', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bãi đỗ xe sân bay","gần chợ","trung tâm thương mại"]', true),

-- ===========================================================================
-- Rửa xe (Car Wash)
-- ===========================================================================
('LLM190', 'Rửa xe', 'Rửa xe', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["ô tô","xe máy","nhanh","giá rẻ"]', true),
('LLM191', 'Rửa xe', 'Rửa xe', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["chăm sóc xe","đánh bóng","dọn nội thất","phủ ceramic"]', true),
('LLM192', 'Rửa xe', 'Rửa xe', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["mở cửa khuya","tại nhà","online booking","cà phê chờ"]', true),

-- ===========================================================================
-- Giặt ủi (Laundry)
-- ===========================================================================
('LLM193', 'Tiệm giặt ủi', 'Tiệm giặt ủi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giặt khô","giặt ướt","ủi","nhanh"]', true),
('LLM194', 'Tiệm giặt ủi', 'Tiệm giặt ủi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giao nhận tận nơi","theo kg","sinh viên","giá rẻ"]', true),
('LLM195', 'Tiệm giặt ủi', 'Tiệm giặt ủi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["tự giặt","24/7","máy sấy","có wifi"]', true),

-- ===========================================================================
-- Chợ đêm (Night Market)
-- ===========================================================================
('LLM196', 'Chợ đêm', 'Chợ đêm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["ăn vặt","mua sắm","giá rẻ","du lịch"]', true),
('LLM197', 'Chợ đêm', 'Chợ đêm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["quần áo","đồ lưu niệm","check-in","nhóm"]', true),
('LLM198', 'Chợ đêm', 'Chợ đêm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["hải sản","đồ nướng","cuối tuần","hẹn hò"]', true),

-- ===========================================================================
-- Trạm xe buýt (Bus Station / Stop)
-- ===========================================================================
('LLM199', 'Trạm xe buýt', 'Trạm xe buýt', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["công cộng","tuyến","vé tháng","máy lạnh"]', true),
('LLM200', 'Trạm xe buýt', 'Trạm xe buýt', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["liên tỉnh","xe giường nằm","đặt vé online","nhà chờ"]', true),

-- ===========================================================================
-- Ga tàu (Train Station)
-- ===========================================================================
('LLM201', 'Ga tàu', 'Ga tàu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["đường sắt","vé tàu","Bắc Nam","phòng chờ"]', true),
('LLM202', 'Ga tàu', 'Ga tàu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gửi xe","ăn uống","wifi","máy lạnh"]', true),

-- ===========================================================================
-- Bến phà (Ferry Terminal)
-- ===========================================================================
('LLM203', 'Bến phà', 'Bến phà', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["du lịch","xe máy","ô tô","đảo"]', true),
('LLM204', 'Bến phà', 'Bến phà', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["mua vé","giá rẻ","địa phương","vận tải"]', true),

-- ===========================================================================
-- Trạm sạc xe điện (EV Charging Station)
-- ===========================================================================
('LLM205', 'Trạm sạc xe điện', 'Trạm sạc xe điện', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["ô tô điện","xe máy điện","sạc nhanh","miễn phí"]', true),
('LLM206', 'Trạm sạc xe điện', 'Trạm sạc xe điện', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["trung tâm thương mại","24/7","có mái che","an toàn"]', true),

-- ===========================================================================
-- Sân vận động (Stadium)
-- ===========================================================================
('LLM207', 'Sân vận động', 'Sân vận động', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bóng đá","điền kinh","sự kiện","sức chứa lớn"]', true),
('LLM208', 'Sân vận động', 'Sân vận động', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["tập thể dục","công cộng","miễn phí","gần nhà"]', true),

-- ===========================================================================
-- Vườn thú (Zoo)
-- ===========================================================================
('LLM209', 'Vườn thú', 'Vườn thú', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gia đình","trẻ em","động vật","cuối tuần"]', true),
('LLM210', 'Vườn thú', 'Vườn thú', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["tham quan","chụp ảnh","vé vào cửa","ăn uống"]', true),

-- ===========================================================================
-- Thủy cung (Aquarium)
-- ===========================================================================
('LLM211', 'Thủy cung', 'Thủy cung', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cá","sinh vật biển","gia đình","trẻ em"]', true),
('LLM212', 'Thủy cung', 'Thủy cung', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["check-in","máy lạnh","giáo dục","cuối tuần"]', true),

-- ===========================================================================
-- Khu du lịch sinh thái (Eco-Tourism Area)
-- ===========================================================================
('LLM213', 'Khu du lịch sinh thái', 'Khu du lịch sinh thái', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["xanh","cắm trại","dã ngoại","gia đình"]', true),
('LLM214', 'Khu du lịch sinh thái', 'Khu du lịch sinh thái', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["hồ bơi","câu cá","trèo thuyền","cuối tuần"]', true),
('LLM215', 'Khu du lịch sinh thái', 'Khu du lịch sinh thái', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["miệt vườn","trái cây","homestay","team building"]', true),

-- ===========================================================================
-- Điểm check-in (Instagram-Worthy Spot)
-- ===========================================================================
('LLM216', 'Điểm check-in', 'Điểm check-in', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sống ảo","chụp ảnh","view đẹp","mạng xã hội"]', true),
('LLM217', 'Điểm check-in', 'Điểm check-in', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cà phê","kiến trúc","hoa","mural"]', true),
('LLM218', 'Điểm check-in', 'Điểm check-in', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["miễn phí","công cộng","săn mây","đèo"]', true),

-- ===========================================================================
-- Cafe sách (Book Cafe)
-- ===========================================================================
('LLM219', 'Cafe sách', 'Cafe sách', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sách","yên tĩnh","wifi","làm việc"]', true),
('LLM220', 'Cafe sách', 'Cafe sách', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["đọc sách","học bài","ổ cắm","máy lạnh"]', true),
('LLM221', 'Cafe sách', 'Cafe sách', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["không gian xanh","mèo","nhạc nhẹ","một mình"]', true),

-- ===========================================================================
-- Cafe thú cưng (Pet Cafe)
-- ===========================================================================
('LLM222', 'Cafe thú cưng', 'Cafe thú cưng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["mèo","chó","check-in","hẹn hò"]', true),
('LLM223', 'Cafe thú cưng', 'Cafe thú cưng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thú cưng","chụp ảnh","wifi","đồ uống"]', true),

-- ===========================================================================
-- Cafe rooftop (Rooftop Cafe)
-- ===========================================================================
('LLM224', 'Cafe rooftop', 'Cafe rooftop', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["view đẹp","thoáng","hẹn hò","check-in"]', true),
('LLM225', 'Cafe rooftop', 'Cafe rooftop', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["tầng thượng","sang trọng","hoàng hôn","nhạc"]', true),
('LLM226', 'Cafe rooftop', 'Cafe rooftop', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["outdoor","giá cao","nhóm","chill"]', true),

-- ===========================================================================
-- Cafe làm việc (Co-working Cafe)
-- ===========================================================================
('LLM227', 'Cafe làm việc', 'Cafe làm việc', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["wifi","ổ cắm","yên tĩnh","máy lạnh"]', true),
('LLM228', 'Cafe làm việc', 'Cafe làm việc', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["coworking","phòng riêng","in ấn","gửi xe"]', true),
('LLM229', 'Cafe làm việc', 'Cafe làm việc', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["24/7","miễn phí nước","bàn rộng","mở cửa khuya"]', true),

-- ===========================================================================
-- Cơ quan nhà nước (Government Office)
-- ===========================================================================
('LLM230', 'Cơ quan nhà nước', 'Cơ quan nhà nước', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["UBND","hành chính","công chứng","giấy tờ"]', true),
('LLM231', 'Cơ quan nhà nước', 'Cơ quan nhà nước', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thuế","bảo hiểm xã hội","hộ khẩu","dịch vụ công"]', true),

-- ===========================================================================
-- Văn phòng công chứng (Notary Office)
-- ===========================================================================
('LLM232', 'Văn phòng công chứng', 'Văn phòng công chứng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["công chứng","sao y","hợp đồng","giấy tờ"]', true),
('LLM233', 'Văn phòng công chứng', 'Văn phòng công chứng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nhanh","thứ 7","chủ nhật","giá rẻ"]', true),

-- ===========================================================================
-- Trung tâm tiệc cưới (Wedding Venue)
-- ===========================================================================
('LLM234', 'Trung tâm tiệc cưới', 'Trung tâm tiệc cưới', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cưới hỏi","sảnh tiệc","trang trí","đặt tiệc"]', true),
('LLM235', 'Trung tâm tiệc cưới', 'Trung tâm tiệc cưới', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sân vườn","sang trọng","bãi đỗ xe","máy lạnh"]', true),
('LLM236', 'Trung tâm tiệc cưới', 'Trung tâm tiệc cưới', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giá rẻ","trọn gói","âm thanh","ánh sáng"]', true),

-- ===========================================================================
-- Shop đồ cũ (Secondhand Store)
-- ===========================================================================
('LLM237', 'Shop đồ cũ', 'Shop đồ cũ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["quần áo","giày dép","thời trang","giá rẻ"]', true),
('LLM238', 'Shop đồ cũ', 'Shop đồ cũ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["đồ điện tử","sách","đồ gia dụng","vinyl"]', true),
('LLM239', 'Shop đồ cũ', 'Shop đồ cũ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["secondhand","vintage","bền vững","tiết kiệm"]', true),

-- ===========================================================================
-- Quán cơm văn phòng (Office Lunch / Com tam / Com binh dan)
-- ===========================================================================
('LLM240', 'Quán cơm văn phòng', 'Quán cơm văn phòng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cơm trưa","ăn nhanh","giá rẻ","bình dân"]', true),
('LLM241', 'Quán cơm văn phòng', 'Quán cơm văn phòng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["takeaway","giao hàng","suất","văn phòng"]', true),

-- ===========================================================================
-- Ăn sáng (Breakfast)
-- ===========================================================================
('LLM242', 'Quán ăn sáng', 'Quán ăn sáng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["phở","bún","xôi","bánh mì","ăn sáng"]', true),
('LLM243', 'Quán ăn sáng', 'Quán ăn sáng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["mở sớm","takeaway","giá rẻ","địa phương"]', true),
('LLM244', 'Quán ăn sáng', 'Quán ăn sáng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bún bò","bánh cuốn","cháo","hủ tiếu"]', true),

-- ===========================================================================
-- Quán ốc (Shellfish / Snail Restaurant)
-- ===========================================================================
('LLM245', 'Quán ốc', 'Quán ốc', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["ốc","hải sản","vỉa hè","bình dân"]', true),
('LLM246', 'Quán ốc', 'Quán ốc', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nhóm","nhậu","mở cửa khuya","địa phương"]', true),
('LLM247', 'Quán ốc', 'Quán ốc', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["máy lạnh","sạch sẽ","gia đình","đa dạng"]', true),

-- ===========================================================================
-- Quán hủ tiếu (Hu Tieu / Noodle Soup)
-- ===========================================================================
('LLM248', 'Quán hủ tiếu', 'Quán hủ tiếu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["hủ tiếu Nam Vang","hủ tiếu Mỹ Tho","ăn sáng","ăn trưa"]', true),
('LLM249', 'Quán hủ tiếu', 'Quán hủ tiếu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["takeaway","giao hàng","giá rẻ","bình dân"]', true),

-- ===========================================================================
-- Quán bánh xèo (Banh Xeo / Vietnamese Pancake)
-- ===========================================================================
('LLM250', 'Quán bánh xèo', 'Quán bánh xèo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["miền Tây","rau sống","nước mắm","địa phương"]', true),
('LLM251', 'Quán bánh xèo', 'Quán bánh xèo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gia đình","nhóm","sân vườn","bình dân"]', true),
('LLM252', 'Quán bánh xèo', 'Quán bánh xèo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["takeaway","giao hàng","máy lạnh","sạch sẽ"]', true),

-- ===========================================================================
-- Quán cơm niêu (Clay Pot Rice)
-- ===========================================================================
('LLM253', 'Quán cơm niêu', 'Quán cơm niêu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cơm cháy","cá kho tộ","sườn","canh chua"]', true),
('LLM254', 'Quán cơm niêu', 'Quán cơm niêu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gia đình","ăn trưa","bình dân","địa phương"]', true),

-- ===========================================================================
-- Làng nghề (Craft Village)
-- ===========================================================================
('LLM255', 'Làng nghề', 'Làng nghề', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["truyền thống","thủ công","du lịch","check-in"]', true),
('LLM256', 'Làng nghề', 'Làng nghề', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gốm","lụa","nón","mây tre"]', true),

-- ===========================================================================
-- Trường đào tạo lái xe (Driving School)
-- ===========================================================================
('LLM257', 'Trường dạy lái xe', 'Trường dạy lái xe', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bằng lái","ô tô","xe máy","hạng B2"]', true),
('LLM258', 'Trường dạy lái xe', 'Trường dạy lái xe', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thi thử","học phí rẻ","sân tập","giáo viên"]', true),

-- ===========================================================================
-- Cửa hàng đồ chơi (Toy Store)
-- ===========================================================================
('LLM259', 'Cửa hàng đồ chơi', 'Cửa hàng đồ chơi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["trẻ em","lego","búp bê","xe mô hình"]', true),
('LLM260', 'Cửa hàng đồ chơi', 'Cửa hàng đồ chơi', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giáo dục","gỗ","ngoài trời","quà tặng"]', true),

-- ===========================================================================
-- Cửa hàng nội thất (Furniture Store)
-- ===========================================================================
('LLM261', 'Cửa hàng nội thất', 'Cửa hàng nội thất', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bàn","ghế","tủ","giường","sofa"]', true),
('LLM262', 'Cửa hàng nội thất', 'Cửa hàng nội thất', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thiết kế","văn phòng","gia đình","trả góp"]', true),
('LLM263', 'Cửa hàng nội thất', 'Cửa hàng nội thất', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gỗ tự nhiên","công nghiệp","giá rẻ","hàng Việt"]', true),

-- ===========================================================================
-- Cửa hàng rượu (Liquor Store)
-- ===========================================================================
('LLM264', 'Cửa hàng rượu', 'Cửa hàng rượu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["rượu vang","rượu ngoại","bia","quà tặng"]', true),
('LLM265', 'Cửa hàng rượu', 'Cửa hàng rượu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giao hàng","24/7","giá tốt","nhập khẩu"]', true),

-- ===========================================================================
-- Sân tennis (Tennis Court)
-- ===========================================================================
('LLM266', 'Sân tennis', 'Sân tennis', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thuê sân","dạy kèm","đèn","có mái che"]', true),
('LLM267', 'Sân tennis', 'Sân tennis', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["giá rẻ","đặt sân online","phòng thay đồ","nước uống"]', true),

-- ===========================================================================
-- Sân cầu lông (Badminton Court)
-- ===========================================================================
('LLM268', 'Sân cầu lông', 'Sân cầu lông', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thuê sân","trong nhà","đèn","giá rẻ"]', true),
('LLM269', 'Sân cầu lông', 'Sân cầu lông', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nhóm","đặt sân online","phòng thay đồ","bãi đỗ xe"]', true),

-- ===========================================================================
-- Điểm du lịch (Tourist Attraction)
-- ===========================================================================
('LLM270', 'Điểm du lịch', 'Điểm du lịch', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["danh lam","thắng cảnh","di tích","chụp ảnh"]', true),
('LLM271', 'Điểm du lịch', 'Điểm du lịch', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["núi","thác","hang động","biển"]', true),
('LLM272', 'Điểm du lịch', 'Điểm du lịch', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["hướng dẫn viên","vé tham quan","ăn uống","mua sắm"]', true),

-- ===========================================================================
-- Cửa hàng đồ gia dụng (Home Appliances Store)
-- ===========================================================================
('LLM273', 'Cửa hàng đồ gia dụng', 'Cửa hàng đồ gia dụng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bếp","tủ lạnh","máy giặt","nồi cơm điện"]', true),
('LLM274', 'Cửa hàng đồ gia dụng', 'Cửa hàng đồ gia dụng', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["chính hãng","trả góp","bảo hành","giao hàng"]', true),

-- ===========================================================================
-- Cửa hàng vật liệu xây dựng (Hardware / Building Materials)
-- ===========================================================================
('LLM275', 'Cửa hàng VLXD', 'Cửa hàng VLXD', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gạch","xi măng","sắt thép","sơn"]', true),
('LLM276', 'Cửa hàng VLXD', 'Cửa hàng VLXD', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["thiết bị vệ sinh","điện nước","giao hàng","giá sỉ"]', true),

-- ===========================================================================
-- Xưởng sửa chữa (Repair Workshop)
-- ===========================================================================
('LLM277', 'Xưởng sửa chữa', 'Xưởng sửa chữa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["điện tử","điện lạnh","điện gia dụng","bảo hành"]', true),
('LLM278', 'Xưởng sửa chữa', 'Xưởng sửa chữa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["tại nhà","gọi thợ","giá rẻ","bảo trì"]', true),

-- ===========================================================================
-- Cửa hàng băng đĩa / CD (Media Store)
-- ===========================================================================
('LLM279', 'Cửa hàng băng đĩa', 'Cửa hàng băng đĩa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["vinyl","CD","đĩa than","máy nghe nhạc"]', true),

-- ===========================================================================
-- Trung tâm ngoại ngữ (Language Center)
-- ===========================================================================
('LLM280', 'Trung tâm ngoại ngữ', 'Trung tâm ngoại ngữ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["tiếng Anh","IELTS","TOEIC","giao tiếp"]', true),
('LLM281', 'Trung tâm ngoại ngữ', 'Trung tâm ngoại ngữ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["tiếng Nhật","tiếng Hàn","tiếng Trung","online"]', true),
('LLM282', 'Trung tâm ngoại ngữ', 'Trung tâm ngoại ngữ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["trẻ em","người lớn","giáo viên bản ngữ","học phí rẻ"]', true),

-- ===========================================================================
-- Câu lạc bộ bi-a (Billiards Club)
-- ===========================================================================
('LLM283', 'CLB bi-a', 'CLB bi-a', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bida","pool","snooker","giá rẻ"]', true),
('LLM284', 'CLB bi-a', 'CLB bi-a', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["máy lạnh","đồ uống","mở cửa khuya","nhóm"]', true),

-- ===========================================================================
-- Nhà hàng chay Phật tử (Buddhist Vegetarian)
-- ===========================================================================
('LLM285', 'Quán cơm chay', 'Quán cơm chay', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["phật tử","thuần chay","ăn kiêng","sức khỏe"]', true),
('LLM286', 'Quán cơm chay', 'Quán cơm chay', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["ngày rằm","mùng 1","bình dân","từ thiện"]', true),

-- ===========================================================================
-- Nhà hàng Ấn Độ (Indian Restaurant)
-- ===========================================================================
('LLM287', 'Nhà hàng Ấn Độ', 'Nhà hàng Ấn Độ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cà ri","naan","biryani","gia vị"]', true),
('LLM288', 'Nhà hàng Ấn Độ', 'Nhà hàng Ấn Độ', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["chay","halal","giao hàng","máy lạnh"]', true),

-- ===========================================================================
-- Nhà hàng Thái (Thai Restaurant)
-- ===========================================================================
('LLM289', 'Nhà hàng Thái', 'Nhà hàng Thái', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["tom yum","pad thai","cay","chua"]', true),
('LLM290', 'Nhà hàng Thái', 'Nhà hàng Thái', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["lẩu","máy lạnh","gia đình","giao hàng"]', true),

-- ===========================================================================
-- Nhà hàng dimsum (Dim Sum)
-- ===========================================================================
('LLM291', 'Nhà hàng dimsum', 'Nhà hàng dimsum', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["há cảo","xíu mại","trà","ăn sáng"]', true),
('LLM292', 'Nhà hàng dimsum', 'Nhà hàng dimsum', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["máy lạnh","gia đình","buffet","đặt bàn"]', true),

-- ===========================================================================
-- Trạm y tế (Health Station / Commune Clinic)
-- ===========================================================================
('LLM293', 'Trạm y tế', 'Trạm y tế', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["công cộng","tiêm chủng","sơ cứu","miễn phí"]', true),
('LLM294', 'Trạm y tế', 'Trạm y tế', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["phường","xã","bảo hiểm y tế","gần nhà"]', true),

-- ===========================================================================
-- Cây cảnh / Cửa hàng cây (Plant Nursery / Plant Shop)
-- ===========================================================================
('LLM295', 'Cửa hàng cây cảnh', 'Cửa hàng cây cảnh', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cây trong nhà","sen đá","xương rồng","chậu"]', true),
('LLM296', 'Cửa hàng cây cảnh', 'Cửa hàng cây cảnh', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bonsai","cây phong thủy","tiểu cảnh","giao hàng"]', true),

-- ===========================================================================
-- Cửa hàng máy tính (Computer Store)
-- ===========================================================================
('LLM297', 'Cửa hàng máy tính', 'Cửa hàng máy tính', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["PC","laptop","linh kiện","build PC"]', true),
('LLM298', 'Cửa hàng máy tính', 'Cửa hàng máy tính', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sửa chữa","nâng cấp","gaming","trả góp"]', true),
('LLM299', 'Cửa hàng máy tính', 'Cửa hàng máy tính', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bàn phím","chuột","ghế gaming","tai nghe"]', true),

-- ===========================================================================
-- Cửa hàng kính mắt (Optical Store)
-- ===========================================================================
('LLM300', 'Cửa hàng kính mắt', 'Cửa hàng kính mắt', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["kính cận","kính râm","gọng","đo mắt"]', true),
('LLM301', 'Cửa hàng kính mắt', 'Cửa hàng kính mắt', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["kính áp tròng","chính hãng","bảo hành","giá rẻ"]', true),

-- ===========================================================================
-- Cửa hàng bánh kẹo (Confectionery / Candy Store)
-- ===========================================================================
('LLM302', 'Cửa hàng bánh kẹo', 'Cửa hàng bánh kẹo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["bánh","kẹo","socola","quà tặng"]', true),
('LLM303', 'Cửa hàng bánh kẹo', 'Cửa hàng bánh kẹo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nhập khẩu","Nhật","Hàn Quốc","đặc sản"]', true),

-- ===========================================================================
-- Khu cắm trại (Campground)
-- ===========================================================================
('LLM304', 'Khu cắm trại', 'Khu cắm trại', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["cắm trại","lửa trại","dã ngoại","ngoài trời"]', true),
('LLM305', 'Khu cắm trại', 'Khu cắm trại', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gia đình","nhóm","lều","câu cá"]', true),
('LLM306', 'Khu cắm trại', 'Khu cắm trại', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["view đẹp","gần suối","gần hồ","cuối tuần"]', true),

-- ===========================================================================
-- Điểm hiến máu (Blood Donation Center)
-- ===========================================================================
('LLM307', 'Điểm hiến máu', 'Điểm hiến máu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nhân đạo","miễn phí","tình nguyện","sức khỏe"]', true),

-- ===========================================================================
-- Đại lý vé (Ticket Agent)
-- ===========================================================================
('LLM308', 'Đại lý vé', 'Đại lý vé', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["vé máy bay","vé tàu","vé xe","vé xem phim"]', true),
('LLM309', 'Đại lý vé', 'Đại lý vé', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["vé sự kiện","concert","thể thao","online"]', true),

-- ===========================================================================
-- Quán gà rán (Fried Chicken)
-- ===========================================================================
('LLM310', 'Quán gà rán', 'Quán gà rán', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gà rán","fast food","takeaway","gia đình"]', true),
('LLM311', 'Quán gà rán', 'Quán gà rán', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["gà Hàn Quốc","sốt cay","giao hàng","combo"]', true),

-- ===========================================================================
-- Cửa hàng thực phẩm sạch (Organic / Clean Food Store)
-- ===========================================================================
('LLM312', 'Thực phẩm sạch', 'Thực phẩm sạch', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["organic","rau sạch","thịt sạch","giao hàng"]', true),
('LLM313', 'Thực phẩm sạch', 'Thực phẩm sạch', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["không hóa chất","địa phương","tươi sống","hữu cơ"]', true),

-- ===========================================================================
-- Cửa hàng đặc sản (Local Specialty Store)
-- ===========================================================================
('LLM314', 'Cửa hàng đặc sản', 'Cửa hàng đặc sản', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["đặc sản vùng miền","quà tặng","khô","mắm"]', true),
('LLM315', 'Cửa hàng đặc sản', 'Cửa hàng đặc sản', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["trái cây sấy","hạt","trà","rượu"]', true),

-- ===========================================================================
-- Quán nước mía (Sugarcane Juice)
-- ===========================================================================
('LLM316', 'Quán nước mía', 'Quán nước mía', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nước mía","giải khát","takeaway","giá rẻ"]', true),
('LLM317', 'Quán nước mía', 'Quán nước mía', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["vỉa hè","sạch sẽ","đá","ăn vặt"]', true),

-- ===========================================================================
-- Quán nước dừa (Coconut Water)
-- ===========================================================================
('LLM318', 'Quán nước dừa', 'Quán nước dừa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["dừa tươi","giải khát","takeaway","tự nhiên"]', true),

-- ===========================================================================
-- Quán trà đá (Iced Tea Street Stall)
-- ===========================================================================
('LLM319', 'Quán trà đá', 'Quán trà đá', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["trà đá","vỉa hè","giá rẻ","chè chén"]', true),
('LLM320', 'Quán trà đá', 'Quán trà đá', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["hướng dương","cóc ổi xoài","ăn vặt","nhóm"]', true),

-- ===========================================================================
-- Cửa hàng đồ lưu niệm (Souvenir Shop)
-- ===========================================================================
('LLM321', 'Cửa hàng lưu niệm', 'Cửa hàng lưu niệm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["quà tặng","thủ công","du lịch","địa phương"]', true),
('LLM322', 'Cửa hàng lưu niệm', 'Cửa hàng lưu niệm', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["áo thun","móc khóa","nam châm","bưu thiếp"]', true),

-- ===========================================================================
-- Nhà thờ Hồi giáo (Mosque)
-- ===========================================================================
('LLM323', 'Nhà thờ Hồi giáo', 'Nhà thờ Hồi giáo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["halal","cầu nguyện","hồi giáo","cộng đồng"]', true),

-- ===========================================================================
-- Trung tâm văn hóa (Cultural Center)
-- ===========================================================================
('LLM324', 'Trung tâm văn hóa', 'Trung tâm văn hóa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["biểu diễn","triển lãm","hội họa","lớp học"]', true),
('LLM325', 'Trung tâm văn hóa', 'Trung tâm văn hóa', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["sự kiện","cộng đồng","chụp ảnh","máy lạnh"]', true),

-- ===========================================================================
-- Câu lạc bộ golf (Golf Club)
-- ===========================================================================
('LLM326', 'Sân golf', 'Sân golf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["golf","sân tập","huấn luyện viên","cao cấp"]', true),
('LLM327', 'Sân golf', 'Sân golf', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '["nhà hàng","hồ bơi","resort","view đẹp"]', true);

-- =============================================================================
-- Track 4: Brand x City POIs -- Agent 2 (LLM-generated, ~520 rows)
-- =============================================================================
-- Notes:
--   original_id: LLM100..LLM620+ to avoid collision with Agent 1
--   All rows: is_generated = true, lat/lng/rating/review/popularity = NULL
--   poi_name = "{Brand} {City}"  |  address = NULL
-- =============================================================================

INSERT INTO "track_4_pois" ("original_id", "poi_name", "category", "brand", "address", "city", "latitude", "longitude", "rating", "review_count", "popularity_score", "tags", "is_generated") VALUES

-- ===========================================================================
-- 1. CA PHE / DO UONG (Coffee & Beverages) -- 49 rows
-- ===========================================================================

-- Highlands Coffee -- 985 stores, 34+ provinces -> all 10 cities
('LLM100','Highlands Coffee TP.HCM','Cà phê/Đồ uống','Highlands Coffee',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","chuoi"]',true),
('LLM101','Highlands Coffee Hà Nội','Cà phê/Đồ uống','Highlands Coffee',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","chuoi"]',true),
('LLM102','Highlands Coffee Đà Nẵng','Cà phê/Đồ uống','Highlands Coffee',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","chuoi"]',true),
('LLM103','Highlands Coffee Nha Trang','Cà phê/Đồ uống','Highlands Coffee',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","chuoi"]',true),
('LLM104','Highlands Coffee Đà Lạt','Cà phê/Đồ uống','Highlands Coffee',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","chuoi"]',true),
('LLM105','Highlands Coffee Hải Phòng','Cà phê/Đồ uống','Highlands Coffee',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","chuoi"]',true),
('LLM106','Highlands Coffee Cần Thơ','Cà phê/Đồ uống','Highlands Coffee',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","chuoi"]',true),
('LLM107','Highlands Coffee Huế','Cà phê/Đồ uống','Highlands Coffee',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","chuoi"]',true),
('LLM108','Highlands Coffee Vũng Tàu','Cà phê/Đồ uống','Highlands Coffee',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","chuoi"]',true),
('LLM109','Highlands Coffee Phú Quốc','Cà phê/Đồ uống','Highlands Coffee',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","chuoi"]',true),

-- Trung Nguyen Legend -- nationwide
('LLM110','Trung Nguyen Legend TP.HCM','Cà phê/Đồ uống','Trung Nguyen Legend',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe phin","kinh doanh","takeaway"]',true),
('LLM111','Trung Nguyen Legend Hà Nội','Cà phê/Đồ uống','Trung Nguyen Legend',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe phin","kinh doanh","takeaway"]',true),
('LLM112','Trung Nguyen Legend Đà Nẵng','Cà phê/Đồ uống','Trung Nguyen Legend',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe phin","kinh doanh","takeaway"]',true),
('LLM113','Trung Nguyen Legend Nha Trang','Cà phê/Đồ uống','Trung Nguyen Legend',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe phin","kinh doanh","takeaway"]',true),
('LLM114','Trung Nguyen Legend Đà Lạt','Cà phê/Đồ uống','Trung Nguyen Legend',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe phin","kinh doanh","takeaway"]',true),
('LLM115','Trung Nguyen Legend Hải Phòng','Cà phê/Đồ uống','Trung Nguyen Legend',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe phin","kinh doanh","takeaway"]',true),
('LLM116','Trung Nguyen Legend Cần Thơ','Cà phê/Đồ uống','Trung Nguyen Legend',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe phin","kinh doanh","takeaway"]',true),
('LLM117','Trung Nguyen Legend Huế','Cà phê/Đồ uống','Trung Nguyen Legend',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe phin","kinh doanh","takeaway"]',true),
('LLM118','Trung Nguyen Legend Vũng Tàu','Cà phê/Đồ uống','Trung Nguyen Legend',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe phin","kinh doanh","takeaway"]',true),

-- Starbucks -- 125+ stores, 16 provinces, limited to 5 of our 10 cities
('LLM119','Starbucks TP.HCM','Cà phê/Đồ uống','Starbucks',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ngoai nhap","takeaway","cao cap"]',true),
('LLM120','Starbucks Hà Nội','Cà phê/Đồ uống','Starbucks',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ngoai nhap","takeaway","cao cap"]',true),
('LLM121','Starbucks Đà Nẵng','Cà phê/Đồ uống','Starbucks',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ngoai nhap","takeaway","cao cap"]',true),
('LLM122','Starbucks Hải Phòng','Cà phê/Đồ uống','Starbucks',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ngoai nhap","takeaway","cao cap"]',true),
('LLM123','Starbucks Huế','Cà phê/Đồ uống','Starbucks',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ngoai nhap","takeaway","cao cap"]',true),

-- The Coffee House -- 200+ stores
('LLM124','The Coffee House TP.HCM','Cà phê/Đồ uống','The Coffee House',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","tre trung"]',true),
('LLM125','The Coffee House Hà Nội','Cà phê/Đồ uống','The Coffee House',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","tre trung"]',true),
('LLM126','The Coffee House Đà Nẵng','Cà phê/Đồ uống','The Coffee House',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","tre trung"]',true),
('LLM127','The Coffee House Nha Trang','Cà phê/Đồ uống','The Coffee House',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","tre trung"]',true),
('LLM128','The Coffee House Cần Thơ','Cà phê/Đồ uống','The Coffee House',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","tre trung"]',true),
('LLM129','The Coffee House Hải Phòng','Cà phê/Đồ uống','The Coffee House',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","tre trung"]',true),
('LLM130','The Coffee House Đà Lạt','Cà phê/Đồ uống','The Coffee House',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","lam viec","takeaway","tre trung"]',true),

-- Phuc Long -- 176+ stores
('LLM131','Phuc Long TP.HCM','Cà phê/Đồ uống','Phuc Long',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","tra","takeaway","chuoi"]',true),
('LLM132','Phuc Long Hà Nội','Cà phê/Đồ uống','Phuc Long',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","tra","takeaway","chuoi"]',true),
('LLM133','Phuc Long Đà Nẵng','Cà phê/Đồ uống','Phuc Long',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","tra","takeaway","chuoi"]',true),
('LLM134','Phuc Long Nha Trang','Cà phê/Đồ uống','Phuc Long',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","tra","takeaway","chuoi"]',true),
('LLM135','Phuc Long Cần Thơ','Cà phê/Đồ uống','Phuc Long',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","tra","takeaway","chuoi"]',true),
('LLM136','Phuc Long Hải Phòng','Cà phê/Đồ uống','Phuc Long',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","tra","takeaway","chuoi"]',true),
('LLM137','Phuc Long Vũng Tàu','Cà phê/Đồ uống','Phuc Long',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","tra","takeaway","chuoi"]',true),

-- Cong Ca Phe -- nationwide
('LLM138','Cong Ca Phe TP.HCM','Cà phê/Đồ uống','Cong Ca Phe',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe cot dua","hoai niem","takeaway"]',true),
('LLM139','Cong Ca Phe Hà Nội','Cà phê/Đồ uống','Cong Ca Phe',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe cot dua","hoai niem","takeaway"]',true),
('LLM140','Cong Ca Phe Đà Nẵng','Cà phê/Đồ uống','Cong Ca Phe',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe cot dua","hoai niem","takeaway"]',true),
('LLM141','Cong Ca Phe Nha Trang','Cà phê/Đồ uống','Cong Ca Phe',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe cot dua","hoai niem","takeaway"]',true),
('LLM142','Cong Ca Phe Đà Lạt','Cà phê/Đồ uống','Cong Ca Phe',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe cot dua","hoai niem","takeaway"]',true),
('LLM143','Cong Ca Phe Hải Phòng','Cà phê/Đồ uống','Cong Ca Phe',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe cot dua","hoai niem","takeaway"]',true),
('LLM144','Cong Ca Phe Huế','Cà phê/Đồ uống','Cong Ca Phe',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe cot dua","hoai niem","takeaway"]',true),
('LLM145','Cong Ca Phe Cần Thơ','Cà phê/Đồ uống','Cong Ca Phe',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","ca phe cot dua","hoai niem","takeaway"]',true),

-- Katinat Saigon Kafe
('LLM146','Katinat TP.HCM','Cà phê/Đồ uống','Katinat',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","tra sua","takeaway","tre trung"]',true),
('LLM147','Katinat Hà Nội','Cà phê/Đồ uống','Katinat',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","tra sua","takeaway","tre trung"]',true),
('LLM148','Katinat Đà Nẵng','Cà phê/Đồ uống','Katinat',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","tra sua","takeaway","tre trung"]',true),

-- ===========================================================================
-- 2. NHA HANG / AN UONG (Restaurants & Fast Food) -- 108 rows
-- ===========================================================================

-- KFC -- 218+ stores, nationwide
('LLM149','KFC TP.HCM','Nhà hàng/Ăn uống','KFC',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","drive-thru","tre em"]',true),
('LLM150','KFC Hà Nội','Nhà hàng/Ăn uống','KFC',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","drive-thru","tre em"]',true),
('LLM151','KFC Đà Nẵng','Nhà hàng/Ăn uống','KFC',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","drive-thru","tre em"]',true),
('LLM152','KFC Nha Trang','Nhà hàng/Ăn uống','KFC',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","drive-thru","tre em"]',true),
('LLM153','KFC Đà Lạt','Nhà hàng/Ăn uống','KFC',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","drive-thru","tre em"]',true),
('LLM154','KFC Hải Phòng','Nhà hàng/Ăn uống','KFC',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","drive-thru","tre em"]',true),
('LLM155','KFC Cần Thơ','Nhà hàng/Ăn uống','KFC',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","drive-thru","tre em"]',true),
('LLM156','KFC Huế','Nhà hàng/Ăn uống','KFC',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","drive-thru","tre em"]',true),
('LLM157','KFC Vũng Tàu','Nhà hàng/Ăn uống','KFC',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","drive-thru","tre em"]',true),
('LLM158','KFC Phú Quốc','Nhà hàng/Ăn uống','KFC',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","drive-thru","tre em"]',true),

-- Jollibee -- 200+ stores, nationwide
('LLM159','Jollibee TP.HCM','Nhà hàng/Ăn uống','Jollibee',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","gia dinh","tre em"]',true),
('LLM160','Jollibee Hà Nội','Nhà hàng/Ăn uống','Jollibee',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","gia dinh","tre em"]',true),
('LLM161','Jollibee Đà Nẵng','Nhà hàng/Ăn uống','Jollibee',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","gia dinh","tre em"]',true),
('LLM162','Jollibee Nha Trang','Nhà hàng/Ăn uống','Jollibee',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","gia dinh","tre em"]',true),
('LLM163','Jollibee Đà Lạt','Nhà hàng/Ăn uống','Jollibee',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","gia dinh","tre em"]',true),
('LLM164','Jollibee Hải Phòng','Nhà hàng/Ăn uống','Jollibee',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","gia dinh","tre em"]',true),
('LLM165','Jollibee Cần Thơ','Nhà hàng/Ăn uống','Jollibee',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","gia dinh","tre em"]',true),
('LLM166','Jollibee Huế','Nhà hàng/Ăn uống','Jollibee',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","gia dinh","tre em"]',true),
('LLM167','Jollibee Vũng Tàu','Nhà hàng/Ăn uống','Jollibee',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","gia dinh","tre em"]',true),
('LLM168','Jollibee Phú Quốc','Nhà hàng/Ăn uống','Jollibee',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","gia dinh","tre em"]',true),

-- Lotteria -- 247+ stores, nationwide
('LLM169','Lotteria TP.HCM','Nhà hàng/Ăn uống','Lotteria',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","han quoc","takeaway","gia dinh"]',true),
('LLM170','Lotteria Hà Nội','Nhà hàng/Ăn uống','Lotteria',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","han quoc","takeaway","gia dinh"]',true),
('LLM171','Lotteria Đà Nẵng','Nhà hàng/Ăn uống','Lotteria',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","han quoc","takeaway","gia dinh"]',true),
('LLM172','Lotteria Nha Trang','Nhà hàng/Ăn uống','Lotteria',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","han quoc","takeaway","gia dinh"]',true),
('LLM173','Lotteria Đà Lạt','Nhà hàng/Ăn uống','Lotteria',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","han quoc","takeaway","gia dinh"]',true),
('LLM174','Lotteria Hải Phòng','Nhà hàng/Ăn uống','Lotteria',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","han quoc","takeaway","gia dinh"]',true),
('LLM175','Lotteria Cần Thơ','Nhà hàng/Ăn uống','Lotteria',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","han quoc","takeaway","gia dinh"]',true),
('LLM176','Lotteria Huế','Nhà hàng/Ăn uống','Lotteria',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","han quoc","takeaway","gia dinh"]',true),
('LLM177','Lotteria Vũng Tàu','Nhà hàng/Ăn uống','Lotteria',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","han quoc","takeaway","gia dinh"]',true),
('LLM178','Lotteria Phú Quốc','Nhà hàng/Ăn uống','Lotteria',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","han quoc","takeaway","gia dinh"]',true),

-- McDonald's -- 36+ stores
('LLM179','McDonald''s TP.HCM','Nhà hàng/Ăn uống','McDonald''s',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["burger","fast food","takeaway","drive-thru","my"]',true),
('LLM180','McDonald''s Hà Nội','Nhà hàng/Ăn uống','McDonald''s',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["burger","fast food","takeaway","drive-thru","my"]',true),
('LLM181','McDonald''s Đà Nẵng','Nhà hàng/Ăn uống','McDonald''s',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["burger","fast food","takeaway","drive-thru","my"]',true),
('LLM182','McDonald''s Hải Phòng','Nhà hàng/Ăn uống','McDonald''s',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["burger","fast food","takeaway","drive-thru","my"]',true),
('LLM183','McDonald''s Nha Trang','Nhà hàng/Ăn uống','McDonald''s',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["burger","fast food","takeaway","drive-thru","my"]',true),
('LLM184','McDonald''s Cần Thơ','Nhà hàng/Ăn uống','McDonald''s',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["burger","fast food","takeaway","drive-thru","my"]',true),
('LLM185','McDonald''s Đà Lạt','Nhà hàng/Ăn uống','McDonald''s',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["burger","fast food","takeaway","drive-thru","my"]',true),
('LLM186','McDonald''s Vũng Tàu','Nhà hàng/Ăn uống','McDonald''s',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["burger","fast food","takeaway","drive-thru","my"]',true),

-- Pizza 4P''s -- ~35 stores
('LLM187','Pizza 4P''s TP.HCM','Nhà hàng/Ăn uống','Pizza 4P''s',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["pizza","nhat-y","nuong cui","fine dining","dat ban"]',true),
('LLM188','Pizza 4P''s Hà Nội','Nhà hàng/Ăn uống','Pizza 4P''s',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["pizza","nhat-y","nuong cui","fine dining","dat ban"]',true),
('LLM189','Pizza 4P''s Đà Nẵng','Nhà hàng/Ăn uống','Pizza 4P''s',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["pizza","nhat-y","nuong cui","fine dining","dat ban"]',true),
('LLM190','Pizza 4P''s Nha Trang','Nhà hàng/Ăn uống','Pizza 4P''s',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["pizza","nhat-y","nuong cui","fine dining","dat ban"]',true),

-- Pizza Hut
('LLM191','Pizza Hut TP.HCM','Nhà hàng/Ăn uống','Pizza Hut',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["pizza","fast food","takeaway","gia dinh","my"]',true),
('LLM192','Pizza Hut Hà Nội','Nhà hàng/Ăn uống','Pizza Hut',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["pizza","fast food","takeaway","gia dinh","my"]',true),
('LLM193','Pizza Hut Đà Nẵng','Nhà hàng/Ăn uống','Pizza Hut',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["pizza","fast food","takeaway","gia dinh","my"]',true),

-- Domino''s Pizza
('LLM194','Domino''s Pizza TP.HCM','Nhà hàng/Ăn uống','Domino''s Pizza',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["pizza","fast food","takeaway","giao hang","my"]',true),
('LLM195','Domino''s Pizza Hà Nội','Nhà hàng/Ăn uống','Domino''s Pizza',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["pizza","fast food","takeaway","giao hang","my"]',true),
('LLM196','Domino''s Pizza Đà Nẵng','Nhà hàng/Ăn uống','Domino''s Pizza',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["pizza","fast food","takeaway","giao hang","my"]',true),

-- Texas Chicken
('LLM197','Texas Chicken TP.HCM','Nhà hàng/Ăn uống','Texas Chicken',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","my","gia dinh"]',true),
('LLM198','Texas Chicken Hà Nội','Nhà hàng/Ăn uống','Texas Chicken',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","my","gia dinh"]',true),
('LLM199','Texas Chicken Đà Nẵng','Nhà hàng/Ăn uống','Texas Chicken',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","my","gia dinh"]',true),

-- Popeyes
('LLM200','Popeyes TP.HCM','Nhà hàng/Ăn uống','Popeyes',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","my","cajun"]',true),
('LLM201','Popeyes Hà Nội','Nhà hàng/Ăn uống','Popeyes',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["ga ran","fast food","takeaway","my","cajun"]',true),

-- Golden Gate -- 500+ restaurants, 42 provinces -> all 10 cities
('LLM202','Golden Gate TP.HCM','Nhà hàng/Ăn uống','Golden Gate',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["am thuc","chuoi","lau","nuong","han quoc","nhat"]',true),
('LLM203','Golden Gate Hà Nội','Nhà hàng/Ăn uống','Golden Gate',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["am thuc","chuoi","lau","nuong","han quoc","nhat"]',true),
('LLM204','Golden Gate Đà Nẵng','Nhà hàng/Ăn uống','Golden Gate',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["am thuc","chuoi","lau","nuong","han quoc","nhat"]',true),
('LLM205','Golden Gate Nha Trang','Nhà hàng/Ăn uống','Golden Gate',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["am thuc","chuoi","lau","nuong","han quoc","nhat"]',true),
('LLM206','Golden Gate Đà Lạt','Nhà hàng/Ăn uống','Golden Gate',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["am thuc","chuoi","lau","nuong","han quoc","nhat"]',true),
('LLM207','Golden Gate Hải Phòng','Nhà hàng/Ăn uống','Golden Gate',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["am thuc","chuoi","lau","nuong","han quoc","nhat"]',true),
('LLM208','Golden Gate Cần Thơ','Nhà hàng/Ăn uống','Golden Gate',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["am thuc","chuoi","lau","nuong","han quoc","nhat"]',true),
('LLM209','Golden Gate Huế','Nhà hàng/Ăn uống','Golden Gate',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["am thuc","chuoi","lau","nuong","han quoc","nhat"]',true),
('LLM210','Golden Gate Vũng Tàu','Nhà hàng/Ăn uống','Golden Gate',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["am thuc","chuoi","lau","nuong","han quoc","nhat"]',true),
('LLM211','Golden Gate Phú Quốc','Nhà hàng/Ăn uống','Golden Gate',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["am thuc","chuoi","lau","nuong","han quoc","nhat"]',true),

-- Gogi House (Golden Gate brand)
('LLM212','Gogi House TP.HCM','Nhà hàng/Ăn uống','Gogi House',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","lau","buffet","gia dinh"]',true),
('LLM213','Gogi House Hà Nội','Nhà hàng/Ăn uống','Gogi House',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","lau","buffet","gia dinh"]',true),
('LLM214','Gogi House Đà Nẵng','Nhà hàng/Ăn uống','Gogi House',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","lau","buffet","gia dinh"]',true),
('LLM215','Gogi House Nha Trang','Nhà hàng/Ăn uống','Gogi House',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","lau","buffet","gia dinh"]',true),
('LLM216','Gogi House Hải Phòng','Nhà hàng/Ăn uống','Gogi House',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","lau","buffet","gia dinh"]',true),
('LLM217','Gogi House Cần Thơ','Nhà hàng/Ăn uống','Gogi House',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","lau","buffet","gia dinh"]',true),
('LLM218','Gogi House Huế','Nhà hàng/Ăn uống','Gogi House',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","lau","buffet","gia dinh"]',true),
('LLM219','Gogi House Vũng Tàu','Nhà hàng/Ăn uống','Gogi House',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","lau","buffet","gia dinh"]',true),

-- Kichi Kichi (Golden Gate brand)
('LLM220','Kichi Kichi TP.HCM','Nhà hàng/Ăn uống','Kichi Kichi',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["lau","bang chuyen","buffet","nhat","gia dinh"]',true),
('LLM221','Kichi Kichi Hà Nội','Nhà hàng/Ăn uống','Kichi Kichi',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["lau","bang chuyen","buffet","nhat","gia dinh"]',true),
('LLM222','Kichi Kichi Đà Nẵng','Nhà hàng/Ăn uống','Kichi Kichi',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["lau","bang chuyen","buffet","nhat","gia dinh"]',true),
('LLM223','Kichi Kichi Nha Trang','Nhà hàng/Ăn uống','Kichi Kichi',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["lau","bang chuyen","buffet","nhat","gia dinh"]',true),
('LLM224','Kichi Kichi Hải Phòng','Nhà hàng/Ăn uống','Kichi Kichi',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["lau","bang chuyen","buffet","nhat","gia dinh"]',true),
('LLM225','Kichi Kichi Cần Thơ','Nhà hàng/Ăn uống','Kichi Kichi',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["lau","bang chuyen","buffet","nhat","gia dinh"]',true),
('LLM226','Kichi Kichi Huế','Nhà hàng/Ăn uống','Kichi Kichi',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["lau","bang chuyen","buffet","nhat","gia dinh"]',true),
('LLM227','Kichi Kichi Vũng Tàu','Nhà hàng/Ăn uống','Kichi Kichi',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["lau","bang chuyen","buffet","nhat","gia dinh"]',true),

-- Sumo BBQ (Golden Gate brand)
('LLM228','Sumo BBQ TP.HCM','Nhà hàng/Ăn uống','Sumo BBQ',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["nuong","nhat","yakiniku","buffet","gia dinh"]',true),
('LLM229','Sumo BBQ Hà Nội','Nhà hàng/Ăn uống','Sumo BBQ',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["nuong","nhat","yakiniku","buffet","gia dinh"]',true),
('LLM230','Sumo BBQ Đà Nẵng','Nhà hàng/Ăn uống','Sumo BBQ',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["nuong","nhat","yakiniku","buffet","gia dinh"]',true),
('LLM231','Sumo BBQ Nha Trang','Nhà hàng/Ăn uống','Sumo BBQ',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["nuong","nhat","yakiniku","buffet","gia dinh"]',true),
('LLM232','Sumo BBQ Cần Thơ','Nhà hàng/Ăn uống','Sumo BBQ',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["nuong","nhat","yakiniku","buffet","gia dinh"]',true),

-- King BBQ
('LLM233','King BBQ TP.HCM','Nhà hàng/Ăn uống','King BBQ',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","buffet","gia dinh","takeaway"]',true),
('LLM234','King BBQ Hà Nội','Nhà hàng/Ăn uống','King BBQ',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","buffet","gia dinh","takeaway"]',true),
('LLM235','King BBQ Đà Nẵng','Nhà hàng/Ăn uống','King BBQ',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","buffet","gia dinh","takeaway"]',true),
('LLM236','King BBQ Hải Phòng','Nhà hàng/Ăn uống','King BBQ',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","buffet","gia dinh","takeaway"]',true),
('LLM237','King BBQ Nha Trang','Nhà hàng/Ăn uống','King BBQ',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","buffet","gia dinh","takeaway"]',true),
('LLM238','King BBQ Cần Thơ','Nhà hàng/Ăn uống','King BBQ',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","buffet","gia dinh","takeaway"]',true),

-- Seoul Garden
('LLM239','Seoul Garden TP.HCM','Nhà hàng/Ăn uống','Seoul Garden',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","lau","buffet","gia dinh"]',true),
('LLM240','Seoul Garden Hà Nội','Nhà hàng/Ăn uống','Seoul Garden',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","lau","buffet","gia dinh"]',true),
('LLM241','Seoul Garden Đà Nẵng','Nhà hàng/Ăn uống','Seoul Garden',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","lau","buffet","gia dinh"]',true),
('LLM242','Seoul Garden Nha Trang','Nhà hàng/Ăn uống','Seoul Garden',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["nuong","han quoc","lau","buffet","gia dinh"]',true),

-- ThaiExpress
('LLM243','ThaiExpress TP.HCM','Nhà hàng/Ăn uống','ThaiExpress',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["thai","pad thai","takeaway","gia dinh","cay"]',true),
('LLM244','ThaiExpress Hà Nội','Nhà hàng/Ăn uống','ThaiExpress',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["thai","pad thai","takeaway","gia dinh","cay"]',true),
('LLM245','ThaiExpress Đà Nẵng','Nhà hàng/Ăn uống','ThaiExpress',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["thai","pad thai","takeaway","gia dinh","cay"]',true),

-- Manwah
('LLM246','Manwah TP.HCM','Nhà hàng/Ăn uống','Manwah',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["lau","dai loan","buffet","gia dinh","takeaway"]',true),
('LLM247','Manwah Hà Nội','Nhà hàng/Ăn uống','Manwah',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["lau","dai loan","buffet","gia dinh","takeaway"]',true),
('LLM248','Manwah Đà Nẵng','Nhà hàng/Ăn uống','Manwah',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["lau","dai loan","buffet","gia dinh","takeaway"]',true),
('LLM249','Manwah Nha Trang','Nhà hàng/Ăn uống','Manwah',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["lau","dai loan","buffet","gia dinh","takeaway"]',true),

-- Daruma
('LLM250','Daruma TP.HCM','Nhà hàng/Ăn uống','Daruma',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["nhat","ramen","sushi","takeaway","gia dinh"]',true),
('LLM251','Daruma Hà Nội','Nhà hàng/Ăn uống','Daruma',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["nhat","ramen","sushi","takeaway","gia dinh"]',true),
('LLM252','Daruma Đà Nẵng','Nhà hàng/Ăn uống','Daruma',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["nhat","ramen","sushi","takeaway","gia dinh"]',true),

-- Al Fresco''s
('LLM253','Al Fresco''s TP.HCM','Nhà hàng/Ăn uống','Al Fresco''s',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["au","pizza","pasta","takeaway","gia dinh"]',true),
('LLM254','Al Fresco''s Hà Nội','Nhà hàng/Ăn uống','Al Fresco''s',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["au","pizza","pasta","takeaway","gia dinh"]',true),
('LLM255','Al Fresco''s Đà Nẵng','Nhà hàng/Ăn uống','Al Fresco''s',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["au","pizza","pasta","takeaway","gia dinh"]',true),
('LLM256','Al Fresco''s Nha Trang','Nhà hàng/Ăn uống','Al Fresco''s',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["au","pizza","pasta","takeaway","gia dinh"]',true),

-- El Gaucho
('LLM257','El Gaucho TP.HCM','Nhà hàng/Ăn uống','El Gaucho',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["steakhouse","argentina","beef","fine dining","cao cap"]',true),
('LLM258','El Gaucho Hà Nội','Nhà hàng/Ăn uống','El Gaucho',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["steakhouse","argentina","beef","fine dining","cao cap"]',true),
('LLM259','El Gaucho Đà Nẵng','Nhà hàng/Ăn uống','El Gaucho',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["steakhouse","argentina","beef","fine dining","cao cap"]',true),

-- Wrap&Roll
('LLM260','Wrap&Roll TP.HCM','Nhà hàng/Ăn uống','Wrap&Roll',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["viet","cuon","gia dinh","takeaway","lanh manh"]',true),
('LLM261','Wrap&Roll Hà Nội','Nhà hàng/Ăn uống','Wrap&Roll',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["viet","cuon","gia dinh","takeaway","lanh manh"]',true),

-- Jaspas
('LLM262','Jaspas TP.HCM','Nhà hàng/Ăn uống','Jaspas',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["au","brunch","takeaway","gia dinh","bar"]',true),
('LLM263','Jaspas Hà Nội','Nhà hàng/Ăn uống','Jaspas',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["au","brunch","takeaway","gia dinh","bar"]',true),

-- Vietnamese specialty restaurants
('LLM264','Pho 24 TP.HCM','Nhà hàng/Ăn uống','Pho 24',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["pho","viet","takeaway","gia dinh","binh dan"]',true),
('LLM265','Pho 24 Hà Nội','Nhà hàng/Ăn uống','Pho 24',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["pho","viet","takeaway","gia dinh","binh dan"]',true),
('LLM266','Pho 24 Đà Nẵng','Nhà hàng/Ăn uống','Pho 24',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["pho","viet","takeaway","gia dinh","binh dan"]',true),
('LLM267','Pho 24 Nha Trang','Nhà hàng/Ăn uống','Pho 24',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["pho","viet","takeaway","gia dinh","binh dan"]',true),

('LLM268','Pho Thin Hà Nội','Nhà hàng/Ăn uống','Pho Thin',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["pho","viet","pho bo","takeaway","binh dan"]',true),
('LLM269','Pho Thin TP.HCM','Nhà hàng/Ăn uống','Pho Thin',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["pho","viet","pho bo","takeaway","binh dan"]',true),

('LLM270','Pho Hung TP.HCM','Nhà hàng/Ăn uống','Pho Hung',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["pho","viet","takeaway","gia dinh","binh dan"]',true),
('LLM271','Pho Hung Hà Nội','Nhà hàng/Ăn uống','Pho Hung',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["pho","viet","takeaway","gia dinh","binh dan"]',true),
('LLM272','Pho Hung Đà Nẵng','Nhà hàng/Ăn uống','Pho Hung',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["pho","viet","takeaway","gia dinh","binh dan"]',true),
('LLM273','Pho Hung Nha Trang','Nhà hàng/Ăn uống','Pho Hung',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["pho","viet","takeaway","gia dinh","binh dan"]',true),
('LLM274','Pho Hung Hải Phòng','Nhà hàng/Ăn uống','Pho Hung',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["pho","viet","takeaway","gia dinh","binh dan"]',true),

('LLM275','Com Tam Moc TP.HCM','Nhà hàng/Ăn uống','Com Tam Moc',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["com tam","viet","sai gon","takeaway","binh dan"]',true),

('LLM276','Banh Mi Huynh Hoa TP.HCM','Nhà hàng/Ăn uống','Banh Mi Huynh Hoa',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["banh mi","viet","takeaway","binh dan","noi tieng"]',true),

('LLM277','Com Nieu Sai Gon TP.HCM','Nhà hàng/Ăn uống','Com Nieu Sai Gon',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["com nieu","viet","takeaway","gia dinh","binh dan"]',true),
('LLM278','Com Nieu Sai Gon Hà Nội','Nhà hàng/Ăn uống','Com Nieu Sai Gon',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["com nieu","viet","takeaway","gia dinh","binh dan"]',true),
('LLM279','Com Nieu Sai Gon Đà Nẵng','Nhà hàng/Ăn uống','Com Nieu Sai Gon',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["com nieu","viet","takeaway","gia dinh","binh dan"]',true),

('LLM280','Bo To Quan Moc TP.HCM','Nhà hàng/Ăn uống','Bo To Quan Moc',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["bo to","viet","takeaway","gia dinh","binh dan"]',true),
('LLM281','Bo To Quan Moc Hà Nội','Nhà hàng/Ăn uống','Bo To Quan Moc',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["bo to","viet","takeaway","gia dinh","binh dan"]',true),
('LLM282','Bo To Quan Moc Đà Nẵng','Nhà hàng/Ăn uống','Bo To Quan Moc',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["bo to","viet","takeaway","gia dinh","binh dan"]',true),

-- ===========================================================================
-- 3. CUA HANG TIEN LOI (Convenience Stores) -- 18 rows
-- ===========================================================================

-- Circle K -- ~500 stores, 19 cities
('LLM283','Circle K TP.HCM','Cửa hàng tiện lợi','Circle K',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["24h","takeaway","thuc an nhanh","do uong","thanh toan"]',true),
('LLM284','Circle K Hà Nội','Cửa hàng tiện lợi','Circle K',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["24h","takeaway","thuc an nhanh","do uong","thanh toan"]',true),
('LLM285','Circle K Vũng Tàu','Cửa hàng tiện lợi','Circle K',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["24h","takeaway","thuc an nhanh","do uong","thanh toan"]',true),
('LLM286','Circle K Cần Thơ','Cửa hàng tiện lợi','Circle K',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["24h","takeaway","thuc an nhanh","do uong","thanh toan"]',true),
('LLM287','Circle K Hải Phòng','Cửa hàng tiện lợi','Circle K',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["24h","takeaway","thuc an nhanh","do uong","thanh toan"]',true),
('LLM288','Circle K Nha Trang','Cửa hàng tiện lợi','Circle K',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["24h","takeaway","thuc an nhanh","do uong","thanh toan"]',true),

-- GS25 -- 400+ stores
('LLM289','GS25 TP.HCM','Cửa hàng tiện lợi','GS25',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["24h","han quoc","takeaway","thuc an nhanh","thanh toan"]',true),
('LLM290','GS25 Hà Nội','Cửa hàng tiện lợi','GS25',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["24h","han quoc","takeaway","thuc an nhanh","thanh toan"]',true),
('LLM291','GS25 Đà Nẵng','Cửa hàng tiện lợi','GS25',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["24h","han quoc","takeaway","thuc an nhanh","thanh toan"]',true),

-- FamilyMart -- 178 stores
('LLM292','FamilyMart TP.HCM','Cửa hàng tiện lợi','FamilyMart',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["24h","nhat","takeaway","thuc an nhanh","thanh toan"]',true),
('LLM293','FamilyMart Hà Nội','Cửa hàng tiện lợi','FamilyMart',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["24h","nhat","takeaway","thuc an nhanh","thanh toan"]',true),
('LLM294','FamilyMart Đà Nẵng','Cửa hàng tiện lợi','FamilyMart',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["24h","nhat","takeaway","thuc an nhanh","thanh toan"]',true),
('LLM295','FamilyMart Hải Phòng','Cửa hàng tiện lợi','FamilyMart',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["24h","nhat","takeaway","thuc an nhanh","thanh toan"]',true),

-- Ministop -- 183 stores
('LLM296','Ministop TP.HCM','Cửa hàng tiện lợi','Ministop',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["24h","nhat","takeaway","thuc an nhanh","kem"]',true),
('LLM297','Ministop Hà Nội','Cửa hàng tiện lợi','Ministop',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["24h","nhat","takeaway","thuc an nhanh","kem"]',true),

-- 7-Eleven -- 150 stores
('LLM298','7-Eleven TP.HCM','Cửa hàng tiện lợi','7-Eleven',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["24h","my","takeaway","thuc an nhanh","thanh toan"]',true),
('LLM299','7-Eleven Hà Nội','Cửa hàng tiện lợi','7-Eleven',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["24h","my","takeaway","thuc an nhanh","thanh toan"]',true),
('LLM300','7-Eleven Đà Nẵng','Cửa hàng tiện lợi','7-Eleven',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["24h","my","takeaway","thuc an nhanh","thanh toan"]',true),

-- ===========================================================================
-- 4. SIEU THI / BAN LE (Supermarkets & Retail) -- 48 rows
-- ===========================================================================

-- WinMart -- national supermarket
('LLM301','WinMart TP.HCM','Siêu thị/Bán lẻ','WinMart',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","thuc pham","gia dung","takeaway"]',true),
('LLM302','WinMart Hà Nội','Siêu thị/Bán lẻ','WinMart',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","thuc pham","gia dung","takeaway"]',true),
('LLM303','WinMart Đà Nẵng','Siêu thị/Bán lẻ','WinMart',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","thuc pham","gia dung","takeaway"]',true),
('LLM304','WinMart Nha Trang','Siêu thị/Bán lẻ','WinMart',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","thuc pham","gia dung","takeaway"]',true),
('LLM305','WinMart Đà Lạt','Siêu thị/Bán lẻ','WinMart',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","thuc pham","gia dung","takeaway"]',true),
('LLM306','WinMart Hải Phòng','Siêu thị/Bán lẻ','WinMart',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","thuc pham","gia dung","takeaway"]',true),
('LLM307','WinMart Cần Thơ','Siêu thị/Bán lẻ','WinMart',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","thuc pham","gia dung","takeaway"]',true),
('LLM308','WinMart Huế','Siêu thị/Bán lẻ','WinMart',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","thuc pham","gia dung","takeaway"]',true),
('LLM309','WinMart Vũng Tàu','Siêu thị/Bán lẻ','WinMart',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","thuc pham","gia dung","takeaway"]',true),
('LLM310','WinMart Phú Quốc','Siêu thị/Bán lẻ','WinMart',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","thuc pham","gia dung","takeaway"]',true),

-- Bach Hoa Xanh -- 2,963 stores, strong south + Hanoi
('LLM311','Bach Hoa Xanh TP.HCM','Siêu thị/Bán lẻ','Bach Hoa Xanh',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["tap hoa","thuc pham","gia re","giao hang","tuoi song"]',true),
('LLM312','Bach Hoa Xanh Hà Nội','Siêu thị/Bán lẻ','Bach Hoa Xanh',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["tap hoa","thuc pham","gia re","giao hang","tuoi song"]',true),
('LLM313','Bach Hoa Xanh Cần Thơ','Siêu thị/Bán lẻ','Bach Hoa Xanh',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["tap hoa","thuc pham","gia re","giao hang","tuoi song"]',true),
('LLM314','Bach Hoa Xanh Đà Nẵng','Siêu thị/Bán lẻ','Bach Hoa Xanh',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["tap hoa","thuc pham","gia re","giao hang","tuoi song"]',true),
('LLM315','Bach Hoa Xanh Hải Phòng','Siêu thị/Bán lẻ','Bach Hoa Xanh',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["tap hoa","thuc pham","gia re","giao hang","tuoi song"]',true),
('LLM316','Bach Hoa Xanh Nha Trang','Siêu thị/Bán lẻ','Bach Hoa Xanh',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["tap hoa","thuc pham","gia re","giao hang","tuoi song"]',true),
('LLM317','Bach Hoa Xanh Vũng Tàu','Siêu thị/Bán lẻ','Bach Hoa Xanh',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["tap hoa","thuc pham","gia re","giao hang","tuoi song"]',true),

-- Co.opmart
('LLM318','Co.opmart TP.HCM','Siêu thị/Bán lẻ','Co.opmart',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","viet","thuc pham","gia dung"]',true),
('LLM319','Co.opmart Hà Nội','Siêu thị/Bán lẻ','Co.opmart',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","viet","thuc pham","gia dung"]',true),
('LLM320','Co.opmart Đà Nẵng','Siêu thị/Bán lẻ','Co.opmart',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","viet","thuc pham","gia dung"]',true),
('LLM321','Co.opmart Hải Phòng','Siêu thị/Bán lẻ','Co.opmart',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","viet","thuc pham","gia dung"]',true),
('LLM322','Co.opmart Cần Thơ','Siêu thị/Bán lẻ','Co.opmart',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","viet","thuc pham","gia dung"]',true),
('LLM323','Co.opmart Huế','Siêu thị/Bán lẻ','Co.opmart',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","viet","thuc pham","gia dung"]',true),
('LLM324','Co.opmart Vũng Tàu','Siêu thị/Bán lẻ','Co.opmart',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","viet","thuc pham","gia dung"]',true),
('LLM325','Co.opmart Nha Trang','Siêu thị/Bán lẻ','Co.opmart',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["sieu thi","tap hoa","viet","thuc pham","gia dung"]',true),

-- GO!/Big C -- national hypermarket
('LLM326','GO! TP.HCM','Siêu thị/Bán lẻ','GO!/Big C',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","tap hoa","thuc pham","thai lan","gia dung"]',true),
('LLM327','GO! Hà Nội','Siêu thị/Bán lẻ','GO!/Big C',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","tap hoa","thuc pham","thai lan","gia dung"]',true),
('LLM328','GO! Đà Nẵng','Siêu thị/Bán lẻ','GO!/Big C',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","tap hoa","thuc pham","thai lan","gia dung"]',true),
('LLM329','GO! Hải Phòng','Siêu thị/Bán lẻ','GO!/Big C',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","tap hoa","thuc pham","thai lan","gia dung"]',true),
('LLM330','GO! Nha Trang','Siêu thị/Bán lẻ','GO!/Big C',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","tap hoa","thuc pham","thai lan","gia dung"]',true),
('LLM331','GO! Cần Thơ','Siêu thị/Bán lẻ','GO!/Big C',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","tap hoa","thuc pham","thai lan","gia dung"]',true),
('LLM332','GO! Huế','Siêu thị/Bán lẻ','GO!/Big C',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","tap hoa","thuc pham","thai lan","gia dung"]',true),
('LLM333','GO! Vũng Tàu','Siêu thị/Bán lẻ','GO!/Big C',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","tap hoa","thuc pham","thai lan","gia dung"]',true),
('LLM334','GO! Đà Lạt','Siêu thị/Bán lẻ','GO!/Big C',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","tap hoa","thuc pham","thai lan","gia dung"]',true),

-- Lotte Mart
('LLM335','Lotte Mart TP.HCM','Siêu thị/Bán lẻ','Lotte Mart',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","han quoc","tap hoa","thuc pham","gia dung"]',true),
('LLM336','Lotte Mart Hà Nội','Siêu thị/Bán lẻ','Lotte Mart',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","han quoc","tap hoa","thuc pham","gia dung"]',true),
('LLM337','Lotte Mart Đà Nẵng','Siêu thị/Bán lẻ','Lotte Mart',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","han quoc","tap hoa","thuc pham","gia dung"]',true),
('LLM338','Lotte Mart Nha Trang','Siêu thị/Bán lẻ','Lotte Mart',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","han quoc","tap hoa","thuc pham","gia dung"]',true),
('LLM339','Lotte Mart Cần Thơ','Siêu thị/Bán lẻ','Lotte Mart',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","han quoc","tap hoa","thuc pham","gia dung"]',true),
('LLM340','Lotte Mart Hải Phòng','Siêu thị/Bán lẻ','Lotte Mart',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","han quoc","tap hoa","thuc pham","gia dung"]',true),
('LLM341','Lotte Mart Vũng Tàu','Siêu thị/Bán lẻ','Lotte Mart',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","han quoc","tap hoa","thuc pham","gia dung"]',true),
('LLM342','Lotte Mart Đà Lạt','Siêu thị/Bán lẻ','Lotte Mart',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["dai sieu thi","han quoc","tap hoa","thuc pham","gia dung"]',true),

-- ===========================================================================
-- 5. TRUNG TAM THUONG MAI (Shopping Malls) -- 14 rows
-- ===========================================================================

-- Vincom -- national
('LLM343','Vincom TP.HCM','Trung tâm thương mại','Vincom',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["mua sam","giai tri","an uong","rap phim","thoi trang"]',true),
('LLM344','Vincom Hà Nội','Trung tâm thương mại','Vincom',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["mua sam","giai tri","an uong","rap phim","thoi trang"]',true),
('LLM345','Vincom Đà Nẵng','Trung tâm thương mại','Vincom',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["mua sam","giai tri","an uong","rap phim","thoi trang"]',true),
('LLM346','Vincom Nha Trang','Trung tâm thương mại','Vincom',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["mua sam","giai tri","an uong","rap phim","thoi trang"]',true),
('LLM347','Vincom Đà Lạt','Trung tâm thương mại','Vincom',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["mua sam","giai tri","an uong","rap phim","thoi trang"]',true),
('LLM348','Vincom Hải Phòng','Trung tâm thương mại','Vincom',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["mua sam","giai tri","an uong","rap phim","thoi trang"]',true),
('LLM349','Vincom Cần Thơ','Trung tâm thương mại','Vincom',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["mua sam","giai tri","an uong","rap phim","thoi trang"]',true),
('LLM350','Vincom Huế','Trung tâm thương mại','Vincom',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["mua sam","giai tri","an uong","rap phim","thoi trang"]',true),
('LLM351','Vincom Vũng Tàu','Trung tâm thương mại','Vincom',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["mua sam","giai tri","an uong","rap phim","thoi trang"]',true),
('LLM352','Vincom Phú Quốc','Trung tâm thương mại','Vincom',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["mua sam","giai tri","an uong","rap phim","thoi trang"]',true),

-- AEON Mall -- 7+ locations
('LLM353','AEON Mall TP.HCM','Trung tâm thương mại','AEON Mall',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["mua sam","nhat","giai tri","an uong","sieu thi"]',true),
('LLM354','AEON Mall Hà Nội','Trung tâm thương mại','AEON Mall',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["mua sam","nhat","giai tri","an uong","sieu thi"]',true),
('LLM355','AEON Mall Hải Phòng','Trung tâm thương mại','AEON Mall',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["mua sam","nhat","giai tri","an uong","sieu thi"]',true),
('LLM356','AEON Mall Huế','Trung tâm thương mại','AEON Mall',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["mua sam","nhat","giai tri","an uong","sieu thi"]',true),

-- ===========================================================================
-- 6. DIEN TU / CONG NGHE (Electronics & Tech) -- 61 rows
-- ===========================================================================

-- The Gioi Di Dong -- 1,013 stores
('LLM357','The Gioi Di Dong TP.HCM','Điện tử/Công nghệ','The Gioi Di Dong',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM358','The Gioi Di Dong Hà Nội','Điện tử/Công nghệ','The Gioi Di Dong',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM359','The Gioi Di Dong Đà Nẵng','Điện tử/Công nghệ','The Gioi Di Dong',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM360','The Gioi Di Dong Nha Trang','Điện tử/Công nghệ','The Gioi Di Dong',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM361','The Gioi Di Dong Đà Lạt','Điện tử/Công nghệ','The Gioi Di Dong',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM362','The Gioi Di Dong Hải Phòng','Điện tử/Công nghệ','The Gioi Di Dong',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM363','The Gioi Di Dong Cần Thơ','Điện tử/Công nghệ','The Gioi Di Dong',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM364','The Gioi Di Dong Huế','Điện tử/Công nghệ','The Gioi Di Dong',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM365','The Gioi Di Dong Vũng Tàu','Điện tử/Công nghệ','The Gioi Di Dong',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM366','The Gioi Di Dong Phú Quốc','Điện tử/Công nghệ','The Gioi Di Dong',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),

-- Dien May Xanh -- 2,000+ stores
('LLM367','Dien May Xanh TP.HCM','Điện tử/Công nghệ','Dien May Xanh',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),
('LLM368','Dien May Xanh Hà Nội','Điện tử/Công nghệ','Dien May Xanh',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),
('LLM369','Dien May Xanh Đà Nẵng','Điện tử/Công nghệ','Dien May Xanh',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),
('LLM370','Dien May Xanh Nha Trang','Điện tử/Công nghệ','Dien May Xanh',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),
('LLM371','Dien May Xanh Đà Lạt','Điện tử/Công nghệ','Dien May Xanh',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),
('LLM372','Dien May Xanh Hải Phòng','Điện tử/Công nghệ','Dien May Xanh',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),
('LLM373','Dien May Xanh Cần Thơ','Điện tử/Công nghệ','Dien May Xanh',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),
('LLM374','Dien May Xanh Huế','Điện tử/Công nghệ','Dien May Xanh',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),
('LLM375','Dien May Xanh Vũng Tàu','Điện tử/Công nghệ','Dien May Xanh',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),
('LLM376','Dien May Xanh Phú Quốc','Điện tử/Công nghệ','Dien May Xanh',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),

-- FPT Shop -- 624 stores
('LLM377','FPT Shop TP.HCM','Điện tử/Công nghệ','FPT Shop',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM378','FPT Shop Hà Nội','Điện tử/Công nghệ','FPT Shop',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM379','FPT Shop Đà Nẵng','Điện tử/Công nghệ','FPT Shop',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM380','FPT Shop Nha Trang','Điện tử/Công nghệ','FPT Shop',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM381','FPT Shop Đà Lạt','Điện tử/Công nghệ','FPT Shop',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM382','FPT Shop Hải Phòng','Điện tử/Công nghệ','FPT Shop',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM383','FPT Shop Cần Thơ','Điện tử/Công nghệ','FPT Shop',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM384','FPT Shop Huế','Điện tử/Công nghệ','FPT Shop',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM385','FPT Shop Vũng Tàu','Điện tử/Công nghệ','FPT Shop',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),
('LLM386','FPT Shop Phú Quốc','Điện tử/Công nghệ','FPT Shop',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["dien thoai","laptop","phu kien","bao hanh","tra gop"]',true),

-- Viettel Store -- ~500 stores
('LLM387','Viettel Store TP.HCM','Điện tử/Công nghệ','Viettel Store',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["dien thoai","sim","phu kien","bao hanh","vien thong"]',true),
('LLM388','Viettel Store Hà Nội','Điện tử/Công nghệ','Viettel Store',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["dien thoai","sim","phu kien","bao hanh","vien thong"]',true),
('LLM389','Viettel Store Đà Nẵng','Điện tử/Công nghệ','Viettel Store',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["dien thoai","sim","phu kien","bao hanh","vien thong"]',true),
('LLM390','Viettel Store Nha Trang','Điện tử/Công nghệ','Viettel Store',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["dien thoai","sim","phu kien","bao hanh","vien thong"]',true),
('LLM391','Viettel Store Đà Lạt','Điện tử/Công nghệ','Viettel Store',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["dien thoai","sim","phu kien","bao hanh","vien thong"]',true),
('LLM392','Viettel Store Hải Phòng','Điện tử/Công nghệ','Viettel Store',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["dien thoai","sim","phu kien","bao hanh","vien thong"]',true),
('LLM393','Viettel Store Cần Thơ','Điện tử/Công nghệ','Viettel Store',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["dien thoai","sim","phu kien","bao hanh","vien thong"]',true),
('LLM394','Viettel Store Huế','Điện tử/Công nghệ','Viettel Store',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["dien thoai","sim","phu kien","bao hanh","vien thong"]',true),
('LLM395','Viettel Store Vũng Tàu','Điện tử/Công nghệ','Viettel Store',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["dien thoai","sim","phu kien","bao hanh","vien thong"]',true),
('LLM396','Viettel Store Phú Quốc','Điện tử/Công nghệ','Viettel Store',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["dien thoai","sim","phu kien","bao hanh","vien thong"]',true),

-- Nguyen Kim -- ~60 stores
('LLM397','Nguyen Kim TP.HCM','Điện tử/Công nghệ','Nguyen Kim',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),
('LLM398','Nguyen Kim Hà Nội','Điện tử/Công nghệ','Nguyen Kim',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),
('LLM399','Nguyen Kim Đà Nẵng','Điện tử/Công nghệ','Nguyen Kim',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),
('LLM400','Nguyen Kim Hải Phòng','Điện tử/Công nghệ','Nguyen Kim',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),
('LLM401','Nguyen Kim Cần Thơ','Điện tử/Công nghệ','Nguyen Kim',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),
('LLM402','Nguyen Kim Nha Trang','Điện tử/Công nghệ','Nguyen Kim',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),
('LLM403','Nguyen Kim Vũng Tàu','Điện tử/Công nghệ','Nguyen Kim',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["dien may","gia dung","tivi","tu lanh","may giat"]',true),

-- Samsung Galaxy Store -- experience stores
('LLM404','Samsung Galaxy Store TP.HCM','Điện tử/Công nghệ','Samsung Galaxy Store',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["samsung","dien thoai","may tinh bang","phu kien","trai nghiem"]',true),
('LLM405','Samsung Galaxy Store Hà Nội','Điện tử/Công nghệ','Samsung Galaxy Store',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["samsung","dien thoai","may tinh bang","phu kien","trai nghiem"]',true),

-- ===========================================================================
-- 7. NGAN HANG / DICH VU TAI CHINH (Banks) -- 40 rows
-- ===========================================================================

-- Vietcombank -- national
('LLM406','Vietcombank TP.HCM','Ngân hàng/Dịch vụ tài chính','Vietcombank',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","kieu hoi","tiet kiem","ngoai te"]',true),
('LLM407','Vietcombank Hà Nội','Ngân hàng/Dịch vụ tài chính','Vietcombank',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","kieu hoi","tiet kiem","ngoai te"]',true),
('LLM408','Vietcombank Đà Nẵng','Ngân hàng/Dịch vụ tài chính','Vietcombank',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","kieu hoi","tiet kiem","ngoai te"]',true),
('LLM409','Vietcombank Nha Trang','Ngân hàng/Dịch vụ tài chính','Vietcombank',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","kieu hoi","tiet kiem","ngoai te"]',true),
('LLM410','Vietcombank Đà Lạt','Ngân hàng/Dịch vụ tài chính','Vietcombank',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","kieu hoi","tiet kiem","ngoai te"]',true),
('LLM411','Vietcombank Hải Phòng','Ngân hàng/Dịch vụ tài chính','Vietcombank',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","kieu hoi","tiet kiem","ngoai te"]',true),
('LLM412','Vietcombank Cần Thơ','Ngân hàng/Dịch vụ tài chính','Vietcombank',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","kieu hoi","tiet kiem","ngoai te"]',true),
('LLM413','Vietcombank Huế','Ngân hàng/Dịch vụ tài chính','Vietcombank',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","kieu hoi","tiet kiem","ngoai te"]',true),
('LLM414','Vietcombank Vũng Tàu','Ngân hàng/Dịch vụ tài chính','Vietcombank',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","kieu hoi","tiet kiem","ngoai te"]',true),
('LLM415','Vietcombank Phú Quốc','Ngân hàng/Dịch vụ tài chính','Vietcombank',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","kieu hoi","tiet kiem","ngoai te"]',true),

-- BIDV -- 1325 branches
('LLM416','BIDV TP.HCM','Ngân hàng/Dịch vụ tài chính','BIDV',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","kieu hoi"]',true),
('LLM417','BIDV Hà Nội','Ngân hàng/Dịch vụ tài chính','BIDV',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","kieu hoi"]',true),
('LLM418','BIDV Đà Nẵng','Ngân hàng/Dịch vụ tài chính','BIDV',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","kieu hoi"]',true),
('LLM419','BIDV Nha Trang','Ngân hàng/Dịch vụ tài chính','BIDV',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","kieu hoi"]',true),
('LLM420','BIDV Đà Lạt','Ngân hàng/Dịch vụ tài chính','BIDV',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","kieu hoi"]',true),
('LLM421','BIDV Hải Phòng','Ngân hàng/Dịch vụ tài chính','BIDV',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","kieu hoi"]',true),
('LLM422','BIDV Cần Thơ','Ngân hàng/Dịch vụ tài chính','BIDV',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","kieu hoi"]',true),
('LLM423','BIDV Huế','Ngân hàng/Dịch vụ tài chính','BIDV',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","kieu hoi"]',true),
('LLM424','BIDV Vũng Tàu','Ngân hàng/Dịch vụ tài chính','BIDV',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","kieu hoi"]',true),
('LLM425','BIDV Phú Quốc','Ngân hàng/Dịch vụ tài chính','BIDV',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","kieu hoi"]',true),

-- Techcombank -- national
('LLM426','Techcombank TP.HCM','Ngân hàng/Dịch vụ tài chính','Techcombank',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","ngan hang so"]',true),
('LLM427','Techcombank Hà Nội','Ngân hàng/Dịch vụ tài chính','Techcombank',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","ngan hang so"]',true),
('LLM428','Techcombank Đà Nẵng','Ngân hàng/Dịch vụ tài chính','Techcombank',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","ngan hang so"]',true),
('LLM429','Techcombank Nha Trang','Ngân hàng/Dịch vụ tài chính','Techcombank',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","ngan hang so"]',true),
('LLM430','Techcombank Đà Lạt','Ngân hàng/Dịch vụ tài chính','Techcombank',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","ngan hang so"]',true),
('LLM431','Techcombank Hải Phòng','Ngân hàng/Dịch vụ tài chính','Techcombank',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","ngan hang so"]',true),
('LLM432','Techcombank Cần Thơ','Ngân hàng/Dịch vụ tài chính','Techcombank',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","ngan hang so"]',true),
('LLM433','Techcombank Huế','Ngân hàng/Dịch vụ tài chính','Techcombank',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","ngan hang so"]',true),
('LLM434','Techcombank Vũng Tàu','Ngân hàng/Dịch vụ tài chính','Techcombank',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","ngan hang so"]',true),
('LLM435','Techcombank Phú Quốc','Ngân hàng/Dịch vụ tài chính','Techcombank',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","vay","tiet kiem","ngan hang so"]',true),

-- Agribank -- national
('LLM436','Agribank TP.HCM','Ngân hàng/Dịch vụ tài chính','Agribank',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","nong nghiep","vay","tiet kiem"]',true),
('LLM437','Agribank Hà Nội','Ngân hàng/Dịch vụ tài chính','Agribank',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","nong nghiep","vay","tiet kiem"]',true),
('LLM438','Agribank Đà Nẵng','Ngân hàng/Dịch vụ tài chính','Agribank',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","nong nghiep","vay","tiet kiem"]',true),
('LLM439','Agribank Nha Trang','Ngân hàng/Dịch vụ tài chính','Agribank',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","nong nghiep","vay","tiet kiem"]',true),
('LLM440','Agribank Đà Lạt','Ngân hàng/Dịch vụ tài chính','Agribank',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","nong nghiep","vay","tiet kiem"]',true),
('LLM441','Agribank Hải Phòng','Ngân hàng/Dịch vụ tài chính','Agribank',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","nong nghiep","vay","tiet kiem"]',true),
('LLM442','Agribank Cần Thơ','Ngân hàng/Dịch vụ tài chính','Agribank',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","nong nghiep","vay","tiet kiem"]',true),
('LLM443','Agribank Huế','Ngân hàng/Dịch vụ tài chính','Agribank',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","nong nghiep","vay","tiet kiem"]',true),
('LLM444','Agribank Vũng Tàu','Ngân hàng/Dịch vụ tài chính','Agribank',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","nong nghiep","vay","tiet kiem"]',true),
('LLM445','Agribank Phú Quốc','Ngân hàng/Dịch vụ tài chính','Agribank',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["ngan hang","atm","nong nghiep","vay","tiet kiem"]',true),

-- ===========================================================================
-- 8. NHA THUOC / SUC KHOE (Pharmacies & Health) -- 17 rows
-- ===========================================================================

-- Long Chau -- 2,400+ stores, 34 provinces
('LLM446','Long Chau TP.HCM','Nhà thuốc/Sức khỏe','Long Chau',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","vaccine","suc khoe","giao hang"]',true),
('LLM447','Long Chau Hà Nội','Nhà thuốc/Sức khỏe','Long Chau',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","vaccine","suc khoe","giao hang"]',true),
('LLM448','Long Chau Đà Nẵng','Nhà thuốc/Sức khỏe','Long Chau',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","vaccine","suc khoe","giao hang"]',true),
('LLM449','Long Chau Nha Trang','Nhà thuốc/Sức khỏe','Long Chau',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","vaccine","suc khoe","giao hang"]',true),
('LLM450','Long Chau Đà Lạt','Nhà thuốc/Sức khỏe','Long Chau',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","vaccine","suc khoe","giao hang"]',true),
('LLM451','Long Chau Hải Phòng','Nhà thuốc/Sức khỏe','Long Chau',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","vaccine","suc khoe","giao hang"]',true),
('LLM452','Long Chau Cần Thơ','Nhà thuốc/Sức khỏe','Long Chau',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","vaccine","suc khoe","giao hang"]',true),
('LLM453','Long Chau Huế','Nhà thuốc/Sức khỏe','Long Chau',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","vaccine","suc khoe","giao hang"]',true),
('LLM454','Long Chau Vũng Tàu','Nhà thuốc/Sức khỏe','Long Chau',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","vaccine","suc khoe","giao hang"]',true),
('LLM455','Long Chau Phú Quốc','Nhà thuốc/Sức khỏe','Long Chau',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","vaccine","suc khoe","giao hang"]',true),

-- Pharmacity -- 1,100+ stores
('LLM456','Pharmacity TP.HCM','Nhà thuốc/Sức khỏe','Pharmacity',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","suc khoe","my pham","giao hang"]',true),
('LLM457','Pharmacity Hà Nội','Nhà thuốc/Sức khỏe','Pharmacity',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","suc khoe","my pham","giao hang"]',true),
('LLM458','Pharmacity Đà Nẵng','Nhà thuốc/Sức khỏe','Pharmacity',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","suc khoe","my pham","giao hang"]',true),
('LLM459','Pharmacity Hải Phòng','Nhà thuốc/Sức khỏe','Pharmacity',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","suc khoe","my pham","giao hang"]',true),
('LLM460','Pharmacity Cần Thơ','Nhà thuốc/Sức khỏe','Pharmacity',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","suc khoe","my pham","giao hang"]',true),
('LLM461','Pharmacity Nha Trang','Nhà thuốc/Sức khỏe','Pharmacity',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","suc khoe","my pham","giao hang"]',true),
('LLM462','Pharmacity Vũng Tàu','Nhà thuốc/Sức khỏe','Pharmacity',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["nha thuoc","duoc pham","suc khoe","my pham","giao hang"]',true),

-- ===========================================================================
-- 9. RAP CHIEU PHIM / GIAI TRI (Cinemas) -- 28 rows
-- ===========================================================================

-- CGV -- 41+ complexes
('LLM463','CGV TP.HCM','Rạp chiếu phim/Giải trí','CGV',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["rap phim","ve xem phim","4dx","imax","bap rang"]',true),
('LLM464','CGV Hà Nội','Rạp chiếu phim/Giải trí','CGV',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["rap phim","ve xem phim","4dx","imax","bap rang"]',true),
('LLM465','CGV Đà Nẵng','Rạp chiếu phim/Giải trí','CGV',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["rap phim","ve xem phim","4dx","imax","bap rang"]',true),
('LLM466','CGV Nha Trang','Rạp chiếu phim/Giải trí','CGV',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["rap phim","ve xem phim","4dx","imax","bap rang"]',true),
('LLM467','CGV Đà Lạt','Rạp chiếu phim/Giải trí','CGV',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["rap phim","ve xem phim","4dx","imax","bap rang"]',true),
('LLM468','CGV Hải Phòng','Rạp chiếu phim/Giải trí','CGV',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["rap phim","ve xem phim","4dx","imax","bap rang"]',true),
('LLM469','CGV Cần Thơ','Rạp chiếu phim/Giải trí','CGV',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["rap phim","ve xem phim","4dx","imax","bap rang"]',true),
('LLM470','CGV Huế','Rạp chiếu phim/Giải trí','CGV',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["rap phim","ve xem phim","4dx","imax","bap rang"]',true),
('LLM471','CGV Vũng Tàu','Rạp chiếu phim/Giải trí','CGV',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["rap phim","ve xem phim","4dx","imax","bap rang"]',true),

-- Lotte Cinema -- 40+ cinemas
('LLM472','Lotte Cinema TP.HCM','Rạp chiếu phim/Giải trí','Lotte Cinema',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["rap phim","han quoc","ve xem phim","bap rang","sweetbox"]',true),
('LLM473','Lotte Cinema Hà Nội','Rạp chiếu phim/Giải trí','Lotte Cinema',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["rap phim","han quoc","ve xem phim","bap rang","sweetbox"]',true),
('LLM474','Lotte Cinema Đà Nẵng','Rạp chiếu phim/Giải trí','Lotte Cinema',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["rap phim","han quoc","ve xem phim","bap rang","sweetbox"]',true),
('LLM475','Lotte Cinema Hải Phòng','Rạp chiếu phim/Giải trí','Lotte Cinema',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["rap phim","han quoc","ve xem phim","bap rang","sweetbox"]',true),
('LLM476','Lotte Cinema Nha Trang','Rạp chiếu phim/Giải trí','Lotte Cinema',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["rap phim","han quoc","ve xem phim","bap rang","sweetbox"]',true),
('LLM477','Lotte Cinema Cần Thơ','Rạp chiếu phim/Giải trí','Lotte Cinema',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["rap phim","han quoc","ve xem phim","bap rang","sweetbox"]',true),
('LLM478','Lotte Cinema Vũng Tàu','Rạp chiếu phim/Giải trí','Lotte Cinema',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["rap phim","han quoc","ve xem phim","bap rang","sweetbox"]',true),
('LLM479','Lotte Cinema Đà Lạt','Rạp chiếu phim/Giải trí','Lotte Cinema',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["rap phim","han quoc","ve xem phim","bap rang","sweetbox"]',true),
('LLM480','Lotte Cinema Huế','Rạp chiếu phim/Giải trí','Lotte Cinema',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["rap phim","han quoc","ve xem phim","bap rang","sweetbox"]',true),

-- Galaxy Cinema -- 23 complexes
('LLM481','Galaxy Cinema TP.HCM','Rạp chiếu phim/Giải trí','Galaxy Cinema',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["rap phim","ve xem phim","bap rang","gia re","3d"]',true),
('LLM482','Galaxy Cinema Hà Nội','Rạp chiếu phim/Giải trí','Galaxy Cinema',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["rap phim","ve xem phim","bap rang","gia re","3d"]',true),
('LLM483','Galaxy Cinema Đà Nẵng','Rạp chiếu phim/Giải trí','Galaxy Cinema',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["rap phim","ve xem phim","bap rang","gia re","3d"]',true),
('LLM484','Galaxy Cinema Hải Phòng','Rạp chiếu phim/Giải trí','Galaxy Cinema',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["rap phim","ve xem phim","bap rang","gia re","3d"]',true),

-- Beta Cinemas -- 21 locations
('LLM485','Beta Cinemas TP.HCM','Rạp chiếu phim/Giải trí','Beta Cinemas',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["rap phim","gia re","ve xem phim","bap rang","binh dan"]',true),
('LLM486','Beta Cinemas Hà Nội','Rạp chiếu phim/Giải trí','Beta Cinemas',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["rap phim","gia re","ve xem phim","bap rang","binh dan"]',true),
('LLM487','Beta Cinemas Nha Trang','Rạp chiếu phim/Giải trí','Beta Cinemas',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["rap phim","gia re","ve xem phim","bap rang","binh dan"]',true),

-- Mega GS -- TP.HCM only
('LLM488','Mega GS TP.HCM','Rạp chiếu phim/Giải trí','Mega GS',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["rap phim","ve xem phim","bap rang","3d","gia re"]',true),

-- ===========================================================================
-- 10. KHACH SAN / NGHI DUONG + XANG DAU (Hotels & Fuel) -- 25 rows
-- ===========================================================================

-- Muong Thanh -- 60+ hotels
('LLM489','Muong Thanh TP.HCM','Khách sạn/Nghỉ dưỡng','Muong Thanh',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["khach san","nghi duong","hoi nghi","nha hang","4 sao"]',true),
('LLM490','Muong Thanh Hà Nội','Khách sạn/Nghỉ dưỡng','Muong Thanh',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["khach san","nghi duong","hoi nghi","nha hang","4 sao"]',true),
('LLM491','Muong Thanh Đà Nẵng','Khách sạn/Nghỉ dưỡng','Muong Thanh',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["khach san","nghi duong","hoi nghi","nha hang","4 sao"]',true),
('LLM492','Muong Thanh Nha Trang','Khách sạn/Nghỉ dưỡng','Muong Thanh',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["khach san","nghi duong","hoi nghi","nha hang","4 sao"]',true),
('LLM493','Muong Thanh Đà Lạt','Khách sạn/Nghỉ dưỡng','Muong Thanh',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["khach san","nghi duong","hoi nghi","nha hang","4 sao"]',true),
('LLM494','Muong Thanh Hải Phòng','Khách sạn/Nghỉ dưỡng','Muong Thanh',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["khach san","nghi duong","hoi nghi","nha hang","4 sao"]',true),
('LLM495','Muong Thanh Cần Thơ','Khách sạn/Nghỉ dưỡng','Muong Thanh',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["khach san","nghi duong","hoi nghi","nha hang","4 sao"]',true),
('LLM496','Muong Thanh Huế','Khách sạn/Nghỉ dưỡng','Muong Thanh',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["khach san","nghi duong","hoi nghi","nha hang","4 sao"]',true),
('LLM497','Muong Thanh Vũng Tàu','Khách sạn/Nghỉ dưỡng','Muong Thanh',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["khach san","nghi duong","hoi nghi","nha hang","4 sao"]',true),
('LLM498','Muong Thanh Phú Quốc','Khách sạn/Nghỉ dưỡng','Muong Thanh',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["khach san","nghi duong","hoi nghi","nha hang","4 sao"]',true),

-- Vinpearl -- Vingroup resort chain
('LLM499','Vinpearl Đà Nẵng','Khách sạn/Nghỉ dưỡng','Vinpearl',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["resort","nghi duong","cao cap","bien","5 sao"]',true),
('LLM500','Vinpearl Nha Trang','Khách sạn/Nghỉ dưỡng','Vinpearl',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["resort","nghi duong","cao cap","bien","5 sao"]',true),
('LLM501','Vinpearl Phú Quốc','Khách sạn/Nghỉ dưỡng','Vinpearl',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["resort","nghi duong","cao cap","bien","5 sao"]',true),
('LLM502','Vinpearl Hải Phòng','Khách sạn/Nghỉ dưỡng','Vinpearl',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["resort","nghi duong","cao cap","bien","5 sao"]',true),
('LLM503','Vinpearl Cần Thơ','Khách sạn/Nghỉ dưỡng','Vinpearl',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["resort","nghi duong","cao cap","5 sao","song"]',true),

-- Petrolimex -- national fuel
('LLM504','Petrolimex TP.HCM','Xăng dầu/Giao thông','Petrolimex',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["xang","dau","tram dung","thanh toan","24h"]',true),
('LLM505','Petrolimex Hà Nội','Xăng dầu/Giao thông','Petrolimex',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["xang","dau","tram dung","thanh toan","24h"]',true),
('LLM506','Petrolimex Đà Nẵng','Xăng dầu/Giao thông','Petrolimex',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["xang","dau","tram dung","thanh toan","24h"]',true),
('LLM507','Petrolimex Nha Trang','Xăng dầu/Giao thông','Petrolimex',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["xang","dau","tram dung","thanh toan","24h"]',true),
('LLM508','Petrolimex Đà Lạt','Xăng dầu/Giao thông','Petrolimex',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["xang","dau","tram dung","thanh toan","24h"]',true),
('LLM509','Petrolimex Hải Phòng','Xăng dầu/Giao thông','Petrolimex',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["xang","dau","tram dung","thanh toan","24h"]',true),
('LLM510','Petrolimex Cần Thơ','Xăng dầu/Giao thông','Petrolimex',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["xang","dau","tram dung","thanh toan","24h"]',true),
('LLM511','Petrolimex Huế','Xăng dầu/Giao thông','Petrolimex',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["xang","dau","tram dung","thanh toan","24h"]',true),
('LLM512','Petrolimex Vũng Tàu','Xăng dầu/Giao thông','Petrolimex',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["xang","dau","tram dung","thanh toan","24h"]',true),
('LLM513','Petrolimex Phú Quốc','Xăng dầu/Giao thông','Petrolimex',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["xang","dau","tram dung","thanh toan","24h"]',true),

-- ===========================================================================
-- 11. SUC KHOE / Y TE + GIAI TRI (Healthcare + Entertainment) -- 13 rows
-- ===========================================================================

-- Vinmec -- Vingroup hospital chain
('LLM514','Vinmec TP.HCM','Sức khỏe/Y tế','Vinmec',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["benh vien","kham chua benh","cao cap","quoc te","bao hiem"]',true),
('LLM515','Vinmec Hà Nội','Sức khỏe/Y tế','Vinmec',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["benh vien","kham chua benh","cao cap","quoc te","bao hiem"]',true),
('LLM516','Vinmec Đà Nẵng','Sức khỏe/Y tế','Vinmec',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["benh vien","kham chua benh","cao cap","quoc te","bao hiem"]',true),
('LLM517','Vinmec Nha Trang','Sức khỏe/Y tế','Vinmec',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["benh vien","kham chua benh","cao cap","quoc te","bao hiem"]',true),
('LLM518','Vinmec Phú Quốc','Sức khỏe/Y tế','Vinmec',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["benh vien","kham chua benh","cao cap","quoc te","bao hiem"]',true),
('LLM519','Vinmec Hải Phòng','Sức khỏe/Y tế','Vinmec',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["benh vien","kham chua benh","cao cap","quoc te","bao hiem"]',true),

-- Chill Skybar -- TP.HCM only (Bitexco Tower)
('LLM520','Chill Skybar TP.HCM','Giải trí/Bar','Chill Skybar',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["skybar","cocktail","view","cao cap","nightlife"]',true),

-- ===========================================================================
-- 12. THUONG MAI DIEN TU (E-commerce -- offices) -- 6 rows
-- ===========================================================================

('LLM521','Shopee TP.HCM','Thương mại điện tử','Shopee',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["san tmdt","van phong","cong nghe","mua sam online"]',true),
('LLM522','Shopee Hà Nội','Thương mại điện tử','Shopee',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["san tmdt","van phong","cong nghe","mua sam online"]',true),
('LLM523','Lazada TP.HCM','Thương mại điện tử','Lazada',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["san tmdt","van phong","cong nghe","mua sam online"]',true),
('LLM524','Lazada Hà Nội','Thương mại điện tử','Lazada',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["san tmdt","van phong","cong nghe","mua sam online"]',true),
('LLM525','Tiki TP.HCM','Thương mại điện tử','Tiki',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["san tmdt","van phong","cong nghe","mua sam online","sach"]',true),
('LLM526','Tiki Hà Nội','Thương mại điện tử','Tiki',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["san tmdt","van phong","cong nghe","mua sam online","sach"]',true),

-- ===========================================================================
-- 13. BAT DONG SAN / TAP DOAN (Real Estate / Conglomerates) -- 11 rows
-- ===========================================================================

-- Vingroup
('LLM527','Vingroup TP.HCM','Bất động sản/Tập đoàn','Vingroup',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["tap doan","bds","ban le","y te","giao duc"]',true),
('LLM528','Vingroup Hà Nội','Bất động sản/Tập đoàn','Vingroup',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["tap doan","bds","ban le","y te","giao duc"]',true),
('LLM529','Vingroup Đà Nẵng','Bất động sản/Tập đoàn','Vingroup',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["tap doan","bds","ban le","y te","giao duc"]',true),
('LLM530','Vingroup Nha Trang','Bất động sản/Tập đoàn','Vingroup',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["tap doan","bds","ban le","y te","giao duc"]',true),
('LLM531','Vingroup Hải Phòng','Bất động sản/Tập đoàn','Vingroup',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["tap doan","bds","ban le","y te","giao duc"]',true),
('LLM532','Vingroup Cần Thơ','Bất động sản/Tập đoàn','Vingroup',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["tap doan","bds","ban le","y te","giao duc"]',true),
('LLM533','Vingroup Phú Quốc','Bất động sản/Tập đoàn','Vingroup',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["tap doan","bds","ban le","y te","giao duc"]',true),

-- Sungroup
('LLM534','Sungroup Đà Nẵng','Bất động sản/Tập đoàn','Sungroup',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["tap doan","bds","nghi duong","giai tri","cap treo"]',true),
('LLM535','Sungroup Phú Quốc','Bất động sản/Tập đoàn','Sungroup',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["tap doan","bds","nghi duong","giai tri","cap treo"]',true),
('LLM536','Sungroup Nha Trang','Bất động sản/Tập đoàn','Sungroup',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["tap doan","bds","nghi duong","giai tri","cap treo"]',true),
('LLM537','Sungroup Đà Lạt','Bất động sản/Tập đoàn','Sungroup',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["tap doan","bds","nghi duong","giai tri","cap treo"]',true),

-- ===========================================================================
-- 14. THOI TRANG / MUA SAM (Fashion & Shopping) -- 15 rows
-- ===========================================================================

-- Uniqlo
('LLM538','Uniqlo TP.HCM','Thời trang/Mua sắm','Uniqlo',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["thoi trang","nhat","casual","nam nu","tre em"]',true),
('LLM539','Uniqlo Hà Nội','Thời trang/Mua sắm','Uniqlo',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["thoi trang","nhat","casual","nam nu","tre em"]',true),
('LLM540','Uniqlo Đà Nẵng','Thời trang/Mua sắm','Uniqlo',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["thoi trang","nhat","casual","nam nu","tre em"]',true),
('LLM541','Uniqlo Hải Phòng','Thời trang/Mua sắm','Uniqlo',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["thoi trang","nhat","casual","nam nu","tre em"]',true),

-- Muji
('LLM542','Muji TP.HCM','Thời trang/Mua sắm','Muji',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["thoi trang","nhat","do gia dung","van phong pham","toi gian"]',true),
('LLM543','Muji Hà Nội','Thời trang/Mua sắm','Muji',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["thoi trang","nhat","do gia dung","van phong pham","toi gian"]',true),

-- Pedro
('LLM544','Pedro TP.HCM','Thời trang/Mua sắm','Pedro',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["thoi trang","giay dep","tui xach","nam nu","cao cap"]',true),
('LLM545','Pedro Hà Nội','Thời trang/Mua sắm','Pedro',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["thoi trang","giay dep","tui xach","nam nu","cao cap"]',true),
('LLM546','Pedro Đà Nẵng','Thời trang/Mua sắm','Pedro',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["thoi trang","giay dep","tui xach","nam nu","cao cap"]',true),

-- Juno
('LLM547','Juno TP.HCM','Thời trang/Mua sắm','Juno',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["thoi trang","giay dep","tui xach","nam nu","binh dan"]',true),
('LLM548','Juno Hà Nội','Thời trang/Mua sắm','Juno',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["thoi trang","giay dep","tui xach","nam nu","binh dan"]',true),
('LLM549','Juno Đà Nẵng','Thời trang/Mua sắm','Juno',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["thoi trang","giay dep","tui xach","nam nu","binh dan"]',true),

-- ===========================================================================
-- 15. HANG KHONG (Airlines) -- 26 rows
-- ===========================================================================

('LLM550','Vietnam Airlines TP.HCM','Hàng không','Vietnam Airlines',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","phong ve","quoc te","noi dia"]',true),
('LLM551','Vietnam Airlines Hà Nội','Hàng không','Vietnam Airlines',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","phong ve","quoc te","noi dia"]',true),
('LLM552','Vietnam Airlines Đà Nẵng','Hàng không','Vietnam Airlines',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","phong ve","quoc te","noi dia"]',true),
('LLM553','Vietnam Airlines Nha Trang','Hàng không','Vietnam Airlines',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","phong ve","quoc te","noi dia"]',true),
('LLM554','Vietnam Airlines Đà Lạt','Hàng không','Vietnam Airlines',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","phong ve","noi dia"]',true),
('LLM555','Vietnam Airlines Hải Phòng','Hàng không','Vietnam Airlines',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","phong ve","noi dia"]',true),
('LLM556','Vietnam Airlines Cần Thơ','Hàng không','Vietnam Airlines',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","phong ve","noi dia"]',true),
('LLM557','Vietnam Airlines Huế','Hàng không','Vietnam Airlines',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","phong ve","noi dia"]',true),
('LLM558','Vietnam Airlines Phú Quốc','Hàng không','Vietnam Airlines',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","phong ve","noi dia"]',true),

('LLM559','Vietjet Air TP.HCM','Hàng không','Vietjet Air',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","gia re","noi dia","quoc te"]',true),
('LLM560','Vietjet Air Hà Nội','Hàng không','Vietjet Air',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","gia re","noi dia","quoc te"]',true),
('LLM561','Vietjet Air Đà Nẵng','Hàng không','Vietjet Air',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","gia re","noi dia","quoc te"]',true),
('LLM562','Vietjet Air Nha Trang','Hàng không','Vietjet Air',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","gia re","noi dia"]',true),
('LLM563','Vietjet Air Đà Lạt','Hàng không','Vietjet Air',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","gia re","noi dia"]',true),
('LLM564','Vietjet Air Hải Phòng','Hàng không','Vietjet Air',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","gia re","noi dia"]',true),
('LLM565','Vietjet Air Cần Thơ','Hàng không','Vietjet Air',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","gia re","noi dia"]',true),
('LLM566','Vietjet Air Huế','Hàng không','Vietjet Air',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","gia re","noi dia"]',true),
('LLM567','Vietjet Air Phú Quốc','Hàng không','Vietjet Air',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","gia re","noi dia"]',true),

('LLM568','Bamboo Airways TP.HCM','Hàng không','Bamboo Airways',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","cao cap","noi dia","quoc te"]',true),
('LLM569','Bamboo Airways Hà Nội','Hàng không','Bamboo Airways',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","cao cap","noi dia","quoc te"]',true),
('LLM570','Bamboo Airways Đà Nẵng','Hàng không','Bamboo Airways',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","cao cap","noi dia"]',true),
('LLM571','Bamboo Airways Nha Trang','Hàng không','Bamboo Airways',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","cao cap","noi dia"]',true),
('LLM572','Bamboo Airways Hải Phòng','Hàng không','Bamboo Airways',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","cao cap","noi dia"]',true),
('LLM573','Bamboo Airways Cần Thơ','Hàng không','Bamboo Airways',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","cao cap","noi dia"]',true),
('LLM574','Bamboo Airways Huế','Hàng không','Bamboo Airways',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","cao cap","noi dia"]',true),
('LLM575','Bamboo Airways Phú Quốc','Hàng không','Bamboo Airways',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["hang khong","ve may bay","cao cap","noi dia"]',true),

-- ===========================================================================
-- 16. NHA SACH / GIAI TRI THEM (Bookstores + Amusement + More Food) -- 43 rows
-- ===========================================================================

-- Fahasa -- national bookstore chain
('LLM576','Fahasa TP.HCM','Nhà sách/Văn phòng phẩm','Fahasa',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["nha sach","sach","van phong pham","do choi","dung cu hoc tap"]',true),
('LLM577','Fahasa Hà Nội','Nhà sách/Văn phòng phẩm','Fahasa',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["nha sach","sach","van phong pham","do choi","dung cu hoc tap"]',true),
('LLM578','Fahasa Đà Nẵng','Nhà sách/Văn phòng phẩm','Fahasa',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["nha sach","sach","van phong pham","do choi","dung cu hoc tap"]',true),
('LLM579','Fahasa Nha Trang','Nhà sách/Văn phòng phẩm','Fahasa',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["nha sach","sach","van phong pham","do choi","dung cu hoc tap"]',true),
('LLM580','Fahasa Đà Lạt','Nhà sách/Văn phòng phẩm','Fahasa',NULL,'Đà Lạt',NULL,NULL,NULL,NULL,NULL,'["nha sach","sach","van phong pham","do choi","dung cu hoc tap"]',true),
('LLM581','Fahasa Hải Phòng','Nhà sách/Văn phòng phẩm','Fahasa',NULL,'Hải Phòng',NULL,NULL,NULL,NULL,NULL,'["nha sach","sach","van phong pham","do choi","dung cu hoc tap"]',true),
('LLM582','Fahasa Cần Thơ','Nhà sách/Văn phòng phẩm','Fahasa',NULL,'Cần Thơ',NULL,NULL,NULL,NULL,NULL,'["nha sach","sach","van phong pham","do choi","dung cu hoc tap"]',true),
('LLM583','Fahasa Huế','Nhà sách/Văn phòng phẩm','Fahasa',NULL,'Huế',NULL,NULL,NULL,NULL,NULL,'["nha sach","sach","van phong pham","do choi","dung cu hoc tap"]',true),
('LLM584','Fahasa Vũng Tàu','Nhà sách/Văn phòng phẩm','Fahasa',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["nha sach","sach","van phong pham","do choi","dung cu hoc tap"]',true),
('LLM585','Fahasa Phú Quốc','Nhà sách/Văn phòng phẩm','Fahasa',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["nha sach","sach","van phong pham","do choi","dung cu hoc tap"]',true),

-- VinWonders -- Vingroup theme park
('LLM586','VinWonders Nha Trang','Giải trí/Công viên','VinWonders',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["cong vien","giai tri","vinpearl","nuoc","gia dinh"]',true),
('LLM587','VinWonders Phú Quốc','Giải trí/Công viên','VinWonders',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["cong vien","giai tri","vinpearl","nuoc","gia dinh"]',true),
('LLM588','VinWonders Hà Nội','Giải trí/Công viên','VinWonders',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["cong vien","giai tri","vinpearl","nuoc","gia dinh"]',true),
('LLM589','VinWonders Đà Nẵng','Giải trí/Công viên','VinWonders',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["cong vien","giai tri","vinpearl","nuoc","gia dinh"]',true),

-- Sun World -- Sungroup amusement parks
('LLM590','Sun World Đà Nẵng','Giải trí/Công viên','Sun World',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["cong vien","giai tri","ba na hills","cap treo","gia dinh"]',true),
('LLM591','Sun World Phú Quốc','Giải trí/Công viên','Sun World',NULL,'Phú Quốc',NULL,NULL,NULL,NULL,NULL,'["cong vien","giai tri","cap treo","bien","gia dinh"]',true),
('LLM592','Sun World Nha Trang','Giải trí/Công viên','Sun World',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["cong vien","giai tri","cap treo","dao","gia dinh"]',true),

-- Hotpot Story
('LLM593','Hotpot Story TP.HCM','Nhà hàng/Ăn uống','Hotpot Story',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["lau","buffet","trung quoc","gia dinh","cay"]',true),
('LLM594','Hotpot Story Hà Nội','Nhà hàng/Ăn uống','Hotpot Story',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["lau","buffet","trung quoc","gia dinh","cay"]',true),
('LLM595','Hotpot Story Đà Nẵng','Nhà hàng/Ăn uống','Hotpot Story',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["lau","buffet","trung quoc","gia dinh","cay"]',true),

-- Chang Kang Kung
('LLM596','Chang Kang Kung TP.HCM','Nhà hàng/Ăn uống','Chang Kang Kung',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["buffet","quoc te","hai san","nuong","lau"]',true),
('LLM597','Chang Kang Kung Đà Nẵng','Nhà hàng/Ăn uống','Chang Kang Kung',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["buffet","quoc te","hai san","nuong","lau"]',true),
('LLM598','Chang Kang Kung Nha Trang','Nhà hàng/Ăn uống','Chang Kang Kung',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["buffet","quoc te","hai san","nuong","lau"]',true),

-- Pho Ong Hung
('LLM599','Pho Ong Hung TP.HCM','Nhà hàng/Ăn uống','Pho Ong Hung',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["pho","viet","pho bo","takeaway","binh dan"]',true),
('LLM600','Pho Ong Hung Nha Trang','Nhà hàng/Ăn uống','Pho Ong Hung',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["pho","viet","pho bo","takeaway","binh dan"]',true),
('LLM601','Pho Ong Hung Vũng Tàu','Nhà hàng/Ăn uống','Pho Ong Hung',NULL,'Vũng Tàu',NULL,NULL,NULL,NULL,NULL,'["pho","viet","pho bo","takeaway","binh dan"]',true),

-- The Coffee Bean & Tea Leaf
('LLM602','The Coffee Bean TP.HCM','Cà phê/Đồ uống','The Coffee Bean & Tea Leaf',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","my","takeaway","lam viec"]',true),
('LLM603','The Coffee Bean Hà Nội','Cà phê/Đồ uống','The Coffee Bean & Tea Leaf',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","my","takeaway","lam viec"]',true),
('LLM604','The Coffee Bean Đà Nẵng','Cà phê/Đồ uống','The Coffee Bean & Tea Leaf',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["wifi","cafe","my","takeaway","lam viec"]',true),

-- PhinDeli
('LLM605','PhinDeli TP.HCM','Cà phê/Đồ uống','PhinDeli',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["cafe","takeaway","buon me thuot","rang xay","ca phe sach"]',true),
('LLM606','PhinDeli Hà Nội','Cà phê/Đồ uống','PhinDeli',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["cafe","takeaway","buon me thuot","rang xay","ca phe sach"]',true),
('LLM607','PhinDeli Đà Nẵng','Cà phê/Đồ uống','PhinDeli',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["cafe","takeaway","buon me thuot","rang xay","ca phe sach"]',true),

-- InterContinental Hotels
('LLM608','InterContinental Hà Nội','Khách sạn/Nghỉ dưỡng','InterContinental',NULL,'Hà Nội',NULL,NULL,NULL,NULL,NULL,'["khach san","cao cap","hoi nghi","5 sao","quoc te"]',true),
('LLM609','InterContinental TP.HCM','Khách sạn/Nghỉ dưỡng','InterContinental',NULL,'TP.HCM',NULL,NULL,NULL,NULL,NULL,'["khach san","cao cap","hoi nghi","5 sao","quoc te"]',true),
('LLM610','InterContinental Đà Nẵng','Khách sạn/Nghỉ dưỡng','InterContinental',NULL,'Đà Nẵng',NULL,NULL,NULL,NULL,NULL,'["khach san","cao cap","nghi duong","5 sao","quoc te"]',true),
('LLM611','InterContinental Nha Trang','Khách sạn/Nghỉ dưỡng','InterContinental',NULL,'Nha Trang',NULL,NULL,NULL,NULL,NULL,'["khach san","cao cap","nghi duong","5 sao","quoc te"]',true);

-- =============================================================================
-- Total: ~520 rows (LLM100 through LLM611)
-- 71 brands x cities across 16 categories
-- =============================================================================

-- =============================================================================
-- Track 4: Vietnamese Abbreviation Mappings for Map Search
-- ~650 abbreviations covering districts, streets, categories, cities,
-- airports, aliases, brands, and services
-- =============================================================================

INSERT INTO "track_4_abbreviations" ("abbreviation", "expanded_form", "type", "is_generated") VALUES
-- =============================================================================
-- DISTRICT: TP.HCM Quận/Huyện
-- =============================================================================
('q1', 'Quận 1', 'district', true),
('q2', 'Quận 2', 'district', true),
('q3', 'Quận 3', 'district', true),
('q4', 'Quận 4', 'district', true),
('q5', 'Quận 5', 'district', true),
('q6', 'Quận 6', 'district', true),
('q7', 'Quận 7', 'district', true),
('q8', 'Quận 8', 'district', true),
('q9', 'Quận 9', 'district', true),
('q10', 'Quận 10', 'district', true),
('q11', 'Quận 11', 'district', true),
('q12', 'Quận 12', 'district', true),
('gv', 'Gò Vấp', 'district', true),
('bt', 'Bình Thạnh', 'district', true),
('tb', 'Tân Bình', 'district', true),
('pn', 'Phú Nhuận', 'district', true),
('tp', 'Tân Phú', 'district', true),
('td', 'Thủ Đức', 'district', true),
('btan', 'Bình Tân', 'district', true),
('bc', 'Bình Chánh', 'district', true),
('cc', 'Củ Chi', 'district', true),
('hm', 'Hóc Môn', 'district', true),
('nbe', 'Nhà Bè', 'district', true),
('cg', 'Cần Giờ', 'district', true),

-- =============================================================================
-- DISTRICT: Hà Nội Quận/Huyện
-- =============================================================================
('bđ', 'Ba Đình', 'district', true),
('hk', 'Hoàn Kiếm', 'district', true),
('hbt', 'Hai Bà Trưng', 'district', true),
('đđ', 'Đống Đa', 'district', true),
('th', 'Tây Hồ', 'district', true),
('cg hn', 'Cầu Giấy', 'district', true),
('txu', 'Thanh Xuân', 'district', true),
('hmai', 'Hoàng Mai', 'district', true),
('lb', 'Long Biên', 'district', true),
('btl', 'Bắc Từ Liêm', 'district', true),
('ntl', 'Nam Từ Liêm', 'district', true),
('hđg', 'Hà Đông', 'district', true),
('st hn', 'Sơn Tây', 'district', true),
('ttri', 'Thanh Trì', 'district', true),
('glam', 'Gia Lâm', 'district', true),
('đanh', 'Đông Anh', 'district', true),
('sso', 'Sóc Sơn', 'district', true),
('bv', 'Ba Vì', 'district', true),
('pt', 'Phúc Thọ', 'district', true),
('tthat', 'Thạch Thất', 'district', true),
('qoai', 'Quốc Oai', 'district', true),
('cmy', 'Chương Mỹ', 'district', true),
('đp', 'Đan Phượng', 'district', true),
('hđuc', 'Hoài Đức', 'district', true),
('toai', 'Thanh Oai', 'district', true),
('mđuc', 'Mỹ Đức', 'district', true),
('uh', 'Ứng Hòa', 'district', true),
('ttin', 'Thường Tín', 'district', true),
('pxuyen', 'Phú Xuyên', 'district', true),
('mlinh', 'Mê Linh', 'district', true),

-- =============================================================================
-- DISTRICT: Đà Nẵng Quận/Huyện
-- =============================================================================
('hc', 'Hải Châu', 'district', true),
('tkh', 'Thanh Khê', 'district', true),
('st', 'Sơn Trà', 'district', true),
('nhs', 'Ngũ Hành Sơn', 'district', true),
('lc', 'Liên Chiểu', 'district', true),
('cl', 'Cẩm Lệ', 'district', true),
('hv', 'Hòa Vang', 'district', true),
('hs', 'Hoàng Sa', 'district', true),

-- =============================================================================
-- DISTRICT: Hải Phòng Quận/Huyện
-- =============================================================================
('hb', 'Hồng Bàng', 'district', true),
('lch', 'Lê Chân', 'district', true),
('nq', 'Ngô Quyền', 'district', true),
('ka', 'Kiến An', 'district', true),
('ha', 'Hải An', 'district', true),
('đs', 'Đồ Sơn', 'district', true),
('dk', 'Dương Kinh', 'district', true),
('al', 'An Lão', 'district', true),
('kt', 'Kiến Thụy', 'district', true),
('tn', 'Thủy Nguyên', 'district', true),
('ad', 'An Dương', 'district', true),
('tl', 'Tiên Lãng', 'district', true),
('vb', 'Vĩnh Bảo', 'district', true),
('ch', 'Cát Hải', 'district', true),
('blv', 'Bạch Long Vĩ', 'district', true),

-- =============================================================================
-- DISTRICT: Cần Thơ Quận/Huyện
-- =============================================================================
('nk', 'Ninh Kiều', 'district', true),
('bt ct', 'Bình Thủy', 'district', true),
('cr', 'Cái Răng', 'district', true),
('om', 'Ô Môn', 'district', true),
('tt ct', 'Thốt Nốt', 'district', true),
('pđ ct', 'Phong Điền', 'district', true),
('ct ct', 'Cờ Đỏ', 'district', true),
('tđ ct', 'Thới Lai', 'district', true),
('vm ct', 'Vĩnh Mỹ', 'district', true),

-- =============================================================================
-- CITY: Tỉnh/Thành phố Việt Nam
-- =============================================================================
('hcm', 'TP. Hồ Chí Minh', 'city', true),
('hn', 'Hà Nội', 'city', true),
('hp', 'Hải Phòng', 'city', true),
('đn', 'Đà Nẵng', 'city', true),
('ct', 'Cần Thơ', 'city', true),
('hue', 'Huế', 'city', true),
('ag', 'An Giang', 'city', true),
('vt', 'Vũng Tàu', 'city', true),
('bl', 'Bạc Liêu', 'city', true),
('bk', 'Bắc Kạn', 'city', true),
('bg', 'Bắc Giang', 'city', true),
('bn', 'Bắc Ninh', 'city', true),
('btre', 'Bến Tre', 'city', true),
('bd', 'Bình Dương', 'city', true),
('bđ', 'Bình Định', 'city', true),
('bp', 'Bình Phước', 'city', true),
('bth', 'Bình Thuận', 'city', true),
('cm', 'Cà Mau', 'city', true),
('cb', 'Cao Bằng', 'city', true),
('đl', 'Đà Lạt', 'city', true),
('đk', 'Đắk Lắk', 'city', true),
('đnong', 'Đắk Nông', 'city', true),
('đb', 'Điện Biên', 'city', true),
('đn', 'Đồng Nai', 'city', true),
('đt', 'Đồng Tháp', 'city', true),
('gl', 'Gia Lai', 'city', true),
('hg', 'Hà Giang', 'city', true),
('hnam', 'Hà Nam', 'city', true),
('ht', 'Hà Tĩnh', 'city', true),
('hd', 'Hải Dương', 'city', true),
('hgiang', 'Hậu Giang', 'city', true),
('hb', 'Hòa Bình', 'city', true),
('hy', 'Hưng Yên', 'city', true),
('kh', 'Khánh Hòa', 'city', true),
('kg', 'Kiên Giang', 'city', true),
('kt', 'Kon Tum', 'city', true),
('lc', 'Lai Châu', 'city', true),
('ls', 'Lạng Sơn', 'city', true),
('lca', 'Lào Cai', 'city', true),
('lđ', 'Lâm Đồng', 'city', true),
('la', 'Long An', 'city', true),
('nđ', 'Nam Định', 'city', true),
('na', 'Nghệ An', 'city', true),
('nb', 'Ninh Bình', 'city', true),
('nt', 'Nha Trang', 'city', true),
('nth', 'Ninh Thuận', 'city', true),
('pt', 'Phú Thọ', 'city', true),
('py', 'Phú Yên', 'city', true),
('qb', 'Quảng Bình', 'city', true),
('qnam', 'Quảng Nam', 'city', true),
('qng', 'Quảng Ngãi', 'city', true),
('qn', 'Quảng Ninh', 'city', true),
('qt', 'Quảng Trị', 'city', true),
('st', 'Sóc Trăng', 'city', true),
('sl', 'Sơn La', 'city', true),
('tn', 'Tây Ninh', 'city', true),
('tb', 'Thái Bình', 'city', true),
('tng', 'Thái Nguyên', 'city', true),
('th', 'Thanh Hóa', 'city', true),
('tg', 'Tiền Giang', 'city', true),
('tv', 'Trà Vinh', 'city', true),
('tq', 'Tuyên Quang', 'city', true),
('vl', 'Vĩnh Long', 'city', true),
('vp', 'Vĩnh Phúc', 'city', true),
('yb', 'Yên Bái', 'city', true),

-- =============================================================================
-- CITY: Thành phố trực thuộc tỉnh
-- =============================================================================
('vt', 'Vũng Tàu', 'city', true),
('pq', 'Phú Quốc', 'city', true),
('đl', 'Đà Lạt', 'city', true),
('nt', 'Nha Trang', 'city', true),
('hlong', 'Hạ Long', 'city', true),
('sp', 'Sa Pa', 'city', true),
('rg', 'Rạch Giá', 'city', true),
('bt ct', 'Bạc Liêu', 'city', true),
('px th', 'Phan Thiết', 'city', true),
('đx', 'Đồng Xoài', 'city', true),
('tn', 'Tây Ninh', 'city', true),
('tđ', 'Thủ Dầu Một', 'city', true),
('bh', 'Biên Hòa', 'city', true),
('mt', 'Mỹ Tho', 'city', true),
('tv', 'Trà Vinh', 'city', true),
('vl', 'Vĩnh Long', 'city', true),
('cl', 'Cao Lãnh', 'city', true),
('lx', 'Long Xuyên', 'city', true),
('st', 'Sóc Trăng', 'city', true),
('cm', 'Cà Mau', 'city', true),

-- =============================================================================
-- STREET: Đường phố Hà Nội (viết tắt theo tên danh nhân)
-- =============================================================================
('tl', 'Trần Hưng Đạo', 'street', true),
('đbp', 'Điện Biên Phủ', 'street', true),
('ht', 'Hoàng Diệu', 'street', true),
('pđp', 'Phan Đình Phùng', 'street', true),
('ntp', 'Nguyễn Tri Phương', 'street', true),
('pbc', 'Phan Bội Châu', 'street', true),
('pct', 'Phan Chu Trinh', 'street', true),
('nthn', 'Nguyễn Thái Học', 'street', true),
('nqh', 'Ngô Quyền', 'street', true),
('qv', 'Quang Trung', 'street', true),
('ltk', 'Lý Thường Kiệt', 'street', true),
('ltto', 'Lý Thái Tổ', 'street', true),
('đth', 'Đinh Tiên Hoàng', 'street', true),
('ltt', 'Lê Thái Tổ', 'street', true),
('nh', 'Nguyễn Huệ', 'street', true),
('nt', 'Nguyễn Trãi', 'street', true),
('hvt', 'Hoàng Văn Thụ', 'street', true),
('vt', 'Văn Cao', 'street', true),
('tcs', 'Trường Chinh', 'street', true),
('gpt', 'Giải Phóng', 'street', true),
('kđa', 'Kim Đồng', 'street', true),
('tnh', 'Tô Ngọc Vân', 'street', true),
('xđ', 'Xuân Diệu', 'street', true),
('nđc', 'Nguyễn Đình Chiểu', 'street', true),
('bhcq', 'Bà Huyện Thanh Quan', 'street', true),
('đtđ', 'Đoàn Thị Điểm', 'street', true),
('hxh', 'Hồ Xuân Hương', 'street', true),
('nd', 'Nguyễn Du', 'street', true),
('ltn', 'Lý Thường Kiệt', 'street', true),
('ncl', 'Nguyễn Chí Thanh', 'street', true),
('ltn', 'Lê Trọng Tấn', 'street', true),
('pvd', 'Phạm Văn Đồng', 'street', true),
('pvh', 'Phạm Văn Đồng', 'street', true),
('vnk', 'Võ Nguyên Giáp', 'street', true),
('xt', 'Xuân Thủy', 'street', true),
('htm', 'Hồ Tùng Mậu', 'street', true),
('ntd', 'Nguyễn Trãi', 'street', true),
('ttđ', 'Tây Sơn', 'street', true),
('lđl', 'Lê Đức Thọ', 'street', true),
('đct', 'Đường Cổ Ngư', 'street', true),
('cx', 'Cát Linh', 'street', true),
('gs', 'Giảng Võ', 'street', true),
('kma', 'Kim Mã', 'street', true),
('ncs', 'Ngọc Khánh', 'street', true),
('lđh', 'Láng Hạ', 'street', true),
('ttn', 'Tây Sơn', 'street', true),
('tx ltt', 'Lê Trọng Tấn', 'street', true),
('tx pvd', 'Phạm Văn Đồng', 'street', true),
('tx ncl', 'Nguyễn Chí Thanh', 'street', true),
('nvl', 'Nguyễn Văn Linh', 'street', true),
('lđt', 'Lê Đức Thọ', 'street', true),
('tq', 'Trần Quốc Hoàn', 'street', true),
('đtn', 'Đường Tân Sơn Nhất', 'street', true),
('hbt', 'Hai Bà Trưng', 'street', true),
('bt', 'Bà Triệu', 'street', true),
('nkh', 'Nguyễn Khuyến', 'street', true),
('lvd', 'Lê Văn Duyệt', 'street', true),
('tmg', 'Trương Minh Giảng', 'street', true),
('đbp', 'Điện Biên Phủ', 'street', true),
('cxđ', 'Cách Mạng Tháng 8', 'street', true),

-- =============================================================================
-- STREET: Đường phố TP.HCM (viết tắt theo tên danh nhân)
-- =============================================================================
('ntmk', 'Nguyễn Thị Minh Khai', 'street', true),
('đbp', 'Điện Biên Phủ', 'street', true),
('ltk', 'Lý Thường Kiệt', 'street', true),
('ntp', 'Nguyễn Tri Phương', 'street', true),
('ht', 'Hồng Bàng', 'street', true),
('tđt', 'Tôn Đức Thắng', 'street', true),
('lp', 'Lê Lợi', 'street', true),
('nh', 'Nguyễn Huệ', 'street', true),
('đk', 'Đồng Khởi', 'street', true),
('nt', 'Nguyễn Trãi', 'street', true),
('cmt8', 'Cách Mạng Tháng 8', 'street', true),
('thđ', 'Trần Hưng Đạo', 'street', true),
('pđp', 'Phan Đình Phùng', 'street', true),
('hvt', 'Hoàng Văn Thụ', 'street', true),
('nvc', 'Nguyễn Văn Cừ', 'street', true),
('nvl', 'Nguyễn Văn Linh', 'street', true),
('vt', 'Võ Văn Tần', 'street', true),
('pbc', 'Phan Bội Châu', 'street', true),
('pct', 'Phan Chu Trinh', 'street', true),
('nđc', 'Nguyễn Đình Chiểu', 'street', true),
('bhtq', 'Bà Huyện Thanh Quan', 'street', true),
('ns', 'Nam Kỳ Khởi Nghĩa', 'street', true),
('ptx', 'Phạm Ngọc Thạch', 'street', true),
('hbc', 'Hai Bà Trưng', 'street', true),
('ntt', 'Nguyễn Thị Thập', 'street', true),
('ncl', 'Nguyễn Chí Thanh', 'street', true),
('tnb', 'Tô Ngọc Vân', 'street', true),
('nhn', 'Nguyễn Hữu Thọ', 'street', true),
('tht', 'Trường Chinh', 'street', true),
('pvh', 'Phạm Văn Đồng', 'street', true),
('vnk', 'Võ Nguyên Giáp', 'street', true),
('ncd', 'Nguyễn Cơ Thạch', 'street', true),
('lđt', 'Lê Đức Thọ', 'street', true),
('tdt', 'Tôn Đức Thắng', 'street', true),
('tnb', 'Tân Sơn Nhất', 'street', true),
('đbp hm', 'Điện Biên Phủ', 'street', true),
('ntp', 'Nguyễn Thông', 'street', true),
('đh', 'Đinh Tiên Hoàng', 'street', true),
('nqh', 'Ngô Quyền', 'street', true),
('lđh', 'Lý Thái Tổ', 'street', true),
('nkt', 'Nguyễn Kim', 'street', true),
('ttc', 'Trần Hưng Đạo B', 'street', true),
('pvh1', 'Phạm Văn Đồng', 'street', true),
('ct', 'Cộng Hòa', 'street', true),
('ht', 'Hoàng Hoa Thám', 'street', true),

-- =============================================================================
-- STREET: Bổ sung đường phố tiêu biểu
-- =============================================================================
('nct', 'Nguyễn Chí Thanh', 'street', true),
('hht', 'Hoàng Hoa Thám', 'street', true),
('hm', 'Hàm Nghi', 'street', true),
('lp', 'Lê Duẩn', 'street', true),
('nc', 'Nguyễn Cư Trinh', 'street', true),
('ntt', 'Nguyễn Trung Trực', 'street', true),
('txd', 'Trần Xuân Soạn', 'street', true),
('đbp', 'Điện Biên Phủ', 'street', true),
('ltq', 'Lý Tự Trọng', 'street', true),
('pnt', 'Phạm Ngũ Lão', 'street', true),
('ctt', 'Cống Quỳnh', 'street', true),
('bt', 'Bùi Thị Xuân', 'street', true),
('nxt', 'Nguyễn Xí', 'street', true),
('đbl', 'Đinh Bộ Lĩnh', 'street', true),
('ntv', 'Nguyễn Thượng Hiền', 'street', true),
('nvđ', 'Nguyễn Văn Đậu', 'street', true),
('lqđ', 'Lê Quang Định', 'street', true),
('pvđ', 'Phạm Văn Đồng', 'street', true),
('nvs', 'Nguyễn Văn Săng', 'street', true),
('nmk', 'Nguyễn Minh Khiêm', 'street', true),
('htq', 'Hoàng Tăng Bí', 'street', true),
('lttq', 'Lý Thường Kiệt', 'street', true),
('cc', 'Cao Thắng', 'street', true),
('nth', 'Nguyễn Thiện Thuật', 'street', true),
('ntp', 'Nguyễn Trường Tộ', 'street', true),
('vm', 'Văn Miếu', 'street', true),
('qtm', 'Quốc Tử Giám', 'street', true),

-- =============================================================================
-- CATEGORY: Danh mục địa điểm/dịch vụ
-- =============================================================================
('ks', 'Khách sạn', 'category', true),
('bv', 'Bệnh viện', 'category', true),
('nt', 'Nhà trọ', 'category', true),
('pk', 'Phòng khám', 'category', true),
('bs', 'Bác sĩ', 'category', true),
('tx', 'Taxi', 'category', true),
('vlxd', 'Vật liệu xây dựng', 'category', true),
('nk', 'Nhà kho', 'category', true),
('tt', 'Trung tâm', 'category', true),
('tttm', 'Trung tâm thương mại', 'category', true),
('ttda', 'Trung tâm dạy nghề', 'category', true),
('ttth', 'Trung tâm thương mại', 'category', true),
('ttdv', 'Trung tâm dịch vụ', 'category', true),
('ttgt', 'Trung tâm giới thiệu việc làm', 'category', true),
('ttnn', 'Trung tâm ngoại ngữ', 'category', true),
('ttth', 'Trung tâm tin học', 'category', true),
('nts', 'Nhà trẻ', 'category', true),
('mnn', 'Mầm non', 'category', true),
('thpt', 'Trường THPT', 'category', true),
('thcs', 'Trường THCS', 'category', true),
('th', 'Tiểu học', 'category', true),
('đh', 'Đại học', 'category', true),
('cđ', 'Cao đẳng', 'category', true),
('cd', 'Cao đẳng', 'category', true),
('dh', 'Đại học', 'category', true),
('cf', 'Cà phê', 'category', true),
('cafe', 'Cà phê', 'category', true),
('tm', 'Trà sữa', 'category', true),
('ts', 'Trà sữa', 'category', true),
('bun', 'Bún', 'category', true),
('pho', 'Phở', 'category', true),
('com', 'Cơm', 'category', true),
('banhmi', 'Bánh mì', 'category', true),
('nh', 'Nhà hàng', 'category', true),
('qa', 'Quán ăn', 'category', true),
('anuong', 'Ăn uống', 'category', true),
('gc', 'Giải khát', 'category', true),
('gk', 'Giải khát', 'category', true),
('sct', 'Siêu thị', 'category', true),
('st', 'Siêu thị', 'category', true),
('ch', 'Cửa hàng', 'category', true),
('chtq', 'Cửa hàng tạp hóa', 'category', true),
('kd', 'Khu du lịch', 'category', true),
('dl', 'Du lịch', 'category', true),
('cv', 'Công viên', 'category', true),
('gs', 'Giải trí', 'category', true),
('rx', 'Rạp xiếc', 'category', true),
('rp', 'Rạp phim', 'category', true),
('bơi', 'Bể bơi', 'category', true),
('bb', 'Bể bơi', 'category', true),
('gym', 'Phòng tập gym', 'category', true),
('pl', 'Phòng tập', 'category', true),
('ytt', 'Yoga', 'category', true),
('spa', 'Spa', 'category', true),
('tm', 'Thẩm mỹ viện', 'category', true),
('mv', 'Làm đẹp', 'category', true),
('ct', 'Cắt tóc', 'category', true),
('ht', 'Hiệu thuốc', 'category', true),
('nt', 'Nhà thuốc', 'category', true),
('ntay', 'Nhà thuốc tây', 'category', true),
('sc', 'Sửa chữa', 'category', true),
('sco', 'Sửa chữa ô tô', 'category', true),
('scx', 'Sửa chữa xe máy', 'category', true),
('gara', 'Ga ra ô tô', 'category', true),
('ruaxe', 'Rửa xe', 'category', true),
('cdv', 'Cây xăng', 'category', true),
('cx', 'Cây xăng', 'category', true),
('tn', 'Trạm xăng', 'category', true),
('tx', 'Trạm xăng', 'category', true),
('tp', 'Trạm xe buýt', 'category', true),
('bx', 'Bến xe', 'category', true),
('bxlt', 'Bến xe liên tỉnh', 'category', true),
('gs', 'Ga tàu', 'category', true),
('svđ', 'Sân vận động', 'category', true),
('ntd', 'Nhà thi đấu', 'category', true),
('svd', 'Sân vận động', 'category', true),
('clb', 'Câu lạc bộ', 'category', true),
('sanbong', 'Sân bóng', 'category', true),
('sb', 'Sân bóng', 'category', true),
('sn', 'Sân tenis', 'category', true),
('bđs', 'Bất động sản', 'category', true),
('nhđ', 'Ngân hàng', 'category', true),
('atm', 'ATM', 'category', true),
('pk', 'Phòng khám', 'category', true),
('bv', 'Bệnh viện', 'category', true),
('pkđk', 'Phòng khám đa khoa', 'category', true),
('bvt', 'Bệnh viện tư', 'category', true),
('pkck', 'Phòng khám chuyên khoa', 'category', true),
('xn', 'Xét nghiệm', 'category', true),
('nha khoa', 'Nha khoa', 'category', true),
('pttm', 'Phẫu thuật thẩm mỹ', 'category', true),
('ubnd', 'Ủy ban nhân dân', 'category', true),
('ub', 'Ủy ban', 'category', true),
('ca', 'Công an', 'category', true),
('bvqs', 'Bệnh viện quận sự', 'category', true),
('txl', 'Tòa án', 'category', true),
('vks', 'Viện kiểm sát', 'category', true),
('bhxh', 'Bảo hiểm xã hội', 'category', true),
('vtp', 'Bưu điện', 'category', true),
('bd', 'Bưu điện', 'category', true),
('dt', 'Điện thoại', 'category', true),
('mt', 'Máy tính', 'category', true),
('đt', 'Điện thoại', 'category', true),
('đt', 'Đồ điện tử', 'category', true),
('tbvp', 'Thiết bị văn phòng', 'category', true),
('vp', 'Văn phòng', 'category', true),
('ct', 'Công ty', 'category', true),
('dn', 'Doanh nghiệp', 'category', true),
('vpđd', 'Văn phòng đại diện', 'category', true),
('nnh', 'Nhà nghỉ', 'category', true),
('ks', 'Khách sạn', 'category', true),
('homestay', 'Homestay', 'category', true),
('resort', 'Resort', 'category', true),
('ksn', 'Khách sạn nhà nghỉ', 'category', true),
('hc', 'Chung cư', 'category', true),
('cc', 'Chung cư', 'category', true),
('ct', 'Chung cư', 'category', true),
('bds', 'Bất động sản', 'category', true),
('mt', 'Mua bán nhà đất', 'category', true),
('mtt', 'Mặt bằng', 'category', true),
('mb', 'Mặt bằng', 'category', true),
('vpp', 'Văn phòng phẩm', 'category', true),
('sach', 'Nhà sách', 'category', true),
('ns', 'Nhà sách', 'category', true),
('tb', 'Nhà sách', 'category', true),
('sgt', 'Sách giáo khoa', 'category', true),
('dct', 'Đồ chơi trẻ em', 'category', true),
('đct', 'Đồ chơi', 'category', true),
('qao', 'Quần áo', 'category', true),
('tt', 'Thời trang', 'category', true),
('vl', 'Vàng bạc', 'category', true),
('đt', 'Đá quý', 'category', true),
('vl', 'Vật liệu', 'category', true),
('xd', 'Xây dựng', 'category', true),
('lsx', 'Lâm sản xuất', 'category', true),
('vlx', 'Vật liệu xây dựng', 'category', true),
('dtb', 'Đồ gỗ', 'category', true),
('txd', 'Thiết kế xây dựng', 'category', true),
('gx', 'Giao hàng', 'category', true),
('vc', 'Vận chuyển', 'category', true),
('gh', 'Giao hàng', 'category', true),
('ghtk', 'Giao hàng tiết kiệm', 'category', true),
('ghn', 'Giao hàng nhanh', 'category', true),
('vt', 'Vận tải', 'category', true),
('lg', 'Logistics', 'category', true),
('ck', 'Chuyển khoản', 'category', true),
('nk', 'Nhập khẩu', 'category', true),
('xk', 'Xuất khẩu', 'category', true),
('kh', 'Kho hàng', 'category', true),
('bh', 'Bảo hiểm', 'category', true),
('kt', 'Kế toán', 'category', true),
('tv', 'Tư vấn', 'category', true),
('ls', 'Luật sư', 'category', true),
('vpls', 'Văn phòng luật sư', 'category', true),
('dv', 'Dịch vụ', 'category', true),
('dvvp', 'Dịch vụ vệ sinh', 'category', true),
('dvcn', 'Dịch vụ công nghệ', 'category', true),
('it', 'Công nghệ thông tin', 'category', true),
('cntt', 'Công nghệ thông tin', 'category', true),
('web', 'Thiết kế web', 'category', true),
('seo', 'SEO', 'category', true),
('mk', 'Marketing', 'category', true),
('qc', 'Quảng cáo', 'category', true),
('in', 'In ấn', 'category', true),
('cb', 'Cơ điện', 'category', true),
('đlk', 'Điện lạnh', 'category', true),
('đn', 'Điện nước', 'category', true),
('scdl', 'Sửa chữa điện lạnh', 'category', true),
('sctb', 'Sửa chữa thiết bị', 'category', true),
('gtvt', 'Giao thông vận tải', 'category', true),
('tckt', 'Tài chính kế toán', 'category', true),
('ck', 'Chứng khoán', 'category', true),
('bv', 'Bảo vệ', 'category', true),
('vs', 'Vệ sinh công nghiệp', 'category', true),
('dl', 'Dịch thuật', 'category', true),
('pt', 'Phiên dịch', 'category', true),
('gd', 'Giáo dục', 'category', true),
('gdtx', 'Giáo dục thường xuyên', 'category', true),
('nn', 'Ngoại ngữ', 'category', true),
('ta', 'Tiếng Anh', 'category', true),
('ttnn', 'Trung tâm ngoại ngữ', 'category', true),
('gtvt', 'Giáo dục thể chất', 'category', true),
('mt', 'Mỹ thuật', 'category', true),
('an', 'Âm nhạc', 'category', true),
('nhc', 'Nhạc cụ', 'category', true),
('tn', 'Thể thao', 'category', true),
('yx', 'Y tế', 'category', true),
('dly', 'Du lịch', 'category', true),
('lx', 'Lữ hành', 'category', true),
('dl', 'Đại lý', 'category', true),
('pp', 'Phân phối', 'category', true),
('bll', 'Bán lẻ', 'category', true),
('bsl', 'Bán sỉ', 'category', true),
('bll', 'Bán lẻ và phân phối', 'category', true),
('nsx', 'Nhà sản xuất', 'category', true),
('gcd', 'Gia công', 'category', true),
('cnsx', 'Công nghiệp sản xuất', 'category', true),
('kd', 'Kinh doanh', 'category', true),

-- =============================================================================
-- AIRPORT: Sân bay
-- =============================================================================
('tsn', 'Tân Sơn Nhất', 'airport', true),
('nb', 'Nội Bài', 'airport', true),
('đn sb', 'Sân bay Đà Nẵng', 'airport', true),
('cxr', 'Cam Ranh', 'airport', true),
('pqc', 'Phú Quốc', 'airport', true),
('vđ', 'Vinh', 'airport', true),
('hp sb', 'Cát Bi', 'airport', true),
('ct sb', 'Cần Thơ', 'airport', true),
('hue sb', 'Phú Bài', 'airport', true),
('qn sb', 'Vân Đồn', 'airport', true),
('đl sb', 'Liên Khương', 'airport', true),
('pth sb', 'Phan Thiết', 'airport', true),
('bmv', 'Buôn Ma Thuột', 'airport', true),
('px', 'Pleiku', 'airport', true),
('tbb', 'Tuy Hòa', 'airport', true),
('th', 'Thọ Xuân', 'airport', true),
('vcl', 'Chu Lai', 'airport', true),
('đb sb', 'Điện Biên Phủ', 'airport', true),
('cgc', 'Cà Mau', 'airport', true),
('cid', 'Cỏ Ống', 'airport', true),
('rch', 'Rạch Giá', 'airport', true),
('tb', 'Tuy Hòa', 'airport', true),
('cxr', 'Sân bay Cam Ranh', 'airport', true),
('vđ', 'Sân bay Vinh', 'airport', true),
('pqc', 'Sân bay Phú Quốc', 'airport', true),
('bmt', 'Buôn Ma Thuột', 'airport', true),
('tuyh', 'Tuy Hòa', 'airport', true),
('tdn', 'Sân bay Đà Nẵng', 'airport', true),

-- =============================================================================
-- ALIAS: Biệt danh/tên gọi thông dụng cho địa danh
-- =============================================================================
('sg', 'Sài Gòn', 'alias', true),
('tp hcm', 'TP.HCM', 'alias', true),
('hn', 'Hà Nội', 'alias', true),
('đn', 'Đà Nẵng', 'alias', true),
('hp', 'Hải Phòng', 'alias', true),
('ct', 'Cần Thơ', 'alias', true),
('hue', 'Huế', 'alias', true),
('dl', 'Đà Lạt', 'alias', true),
('nt', 'Nha Trang', 'alias', true),
('vt', 'Vũng Tàu', 'alias', true),
('pq', 'Phú Quốc', 'alias', true),
('sp', 'Sa Pa', 'alias', true),
('sg', 'Hồ Chí Minh', 'alias', true),
('hcm', 'TP. Hồ Chí Minh', 'alias', true),
('tphcm', 'TP. Hồ Chí Minh', 'alias', true),
('hanoi', 'Hà Nội', 'alias', true),
('danang', 'Đà Nẵng', 'alias', true),
('haiphong', 'Hải Phòng', 'alias', true),
('cantho', 'Cần Thơ', 'alias', true),
('nhatrang', 'Nha Trang', 'alias', true),
('dalat', 'Đà Lạt', 'alias', true),
('vungtau', 'Vũng Tàu', 'alias', true),
('phuquoc', 'Phú Quốc', 'alias', true),
('halong', 'Hạ Long', 'alias', true),
('sapa', 'Sa Pa', 'alias', true),
('hue', 'Huế', 'alias', true),
('q1', 'Quận 1', 'alias', true),
('q2', 'Quận 2', 'alias', true),
('q3', 'Quận 3', 'alias', true),
('q7', 'Quận 7', 'alias', true),
('bavi', 'Ba Vì', 'alias', true),
('sontay', 'Sơn Tây', 'alias', true),
('dongnai', 'Đồng Nai', 'alias', true),
('binhduong', 'Bình Dương', 'alias', true),
('longan', 'Long An', 'alias', true),
('tiengiang', 'Tiền Giang', 'alias', true),
('bentre', 'Bến Tre', 'alias', true),

-- =============================================================================
-- BRAND: Ngân hàng
-- =============================================================================
('vcb', 'Vietcombank', 'brand', true),
('bidv', 'BIDV', 'brand', true),
('vtb', 'VietinBank', 'brand', true),
('agb', 'Agribank', 'brand', true),
('tcb', 'Techcombank', 'brand', true),
('mb', 'MBBank', 'brand', true),
('acb', 'ACB', 'brand', true),
('sacombank', 'Sacombank', 'brand', true),
('vpbank', 'VPBank', 'brand', true),
('tpbank', 'TPBank', 'brand', true),
('hdbank', 'HDBank', 'brand', true),
('shb', 'SHB', 'brand', true),
('vib', 'VIB', 'brand', true),
('msb', 'MSB', 'brand', true),
('ocb', 'OCB', 'brand', true),
('eximbank', 'Eximbank', 'brand', true),
('scb', 'SCB', 'brand', true),
('seabank', 'SeABank', 'brand', true),
('abbank', 'ABBank', 'brand', true),
('ncb', 'NCB', 'brand', true),
('pgbank', 'PGBank', 'brand', true),
('vietabank', 'VietABank', 'brand', true),
('vietbank', 'VietBank', 'brand', true),
('pvcombank', 'PVcomBank', 'brand', true),
('bacabank', 'Bac A Bank', 'brand', true),
('nama', 'Nam A Bank', 'brand', true),
('kienlongbank', 'Kienlongbank', 'brand', true),
('saigonbank', 'SAIGONBANK', 'brand', true),
('bvbank', 'BVBank', 'brand', true),
('wrm', 'Woori Bank', 'brand', true),
('hsbc', 'HSBC', 'brand', true),
('uob', 'UOB', 'brand', true),
('scbvl', 'Standard Chartered', 'brand', true),
('cimb', 'CIMB', 'brand', true),
('shbvn', 'Shinhan Bank', 'brand', true),
('pbvn', 'Public Bank', 'brand', true),
('hlbvn', 'Hong Leong Bank', 'brand', true),
('ivb', 'Indovina Bank', 'brand', true),
('vrb', 'VRB', 'brand', true),
('coopbank', 'Co-opBank', 'brand', true),

-- =============================================================================
-- BRAND: Thương hiệu lớn tại Việt Nam
-- =============================================================================
('vnpt', 'VNPT', 'brand', true),
('viettel', 'Viettel', 'brand', true),
('mobifone', 'Mobifone', 'brand', true),
('vinaphone', 'Vinaphone', 'brand', true),
('fpt', 'FPT', 'brand', true),
('vinschool', 'Vinschool', 'brand', true),
('vimcom', 'Vincom', 'brand', true),
('vimcom', 'Vincom', 'brand', true),
('bhd', 'BHD Star', 'brand', true),
('cgv', 'CGV', 'brand', true),
('lotte', 'Lotte', 'brand', true),
('aeon', 'AEON Mall', 'brand', true),
('bigc', 'Big C', 'brand', true),
('coopmart', 'Co.opmart', 'brand', true),
('bmi', 'Bách Hóa Xanh', 'brand', true),
('bhx', 'Bách Hóa Xanh', 'brand', true),
('bhx', 'Bách hóa Xanh', 'brand', true),
('wmm', 'WinMart', 'brand', true),
('wm', 'WinMart+', 'brand', true),
('circle k', 'Circle K', 'brand', true),
('gs25', 'GS25', 'brand', true),
('familymart', 'Family Mart', 'brand', true),
('ministop', 'Ministop', 'brand', true),
('highlands', 'Highlands Coffee', 'brand', true),
('starbucks', 'Starbucks', 'brand', true),
('phuclong', 'Phúc Long', 'brand', true),
('gongcha', 'Gong Cha', 'brand', true),
('trungnguyen', 'Trung Nguyên', 'brand', true),
('toco', 'TocoToco', 'brand', true),
('jollibee', 'Jollibee', 'brand', true),
('kfc', 'KFC', 'brand', true),
('lotteria', 'Lotteria', 'brand', true),
('mc donalds', 'McDonald''s', 'brand', true),
('mcd', 'McDonald''s', 'brand', true),
('pizza hut', 'Pizza Hut', 'brand', true),
('domino', 'Domino''s Pizza', 'brand', true),
('texas', 'Texas Chicken', 'brand', true),
('popeyes', 'Popeyes', 'brand', true),
('starbucks', 'Starbucks', 'brand', true),
('dunkin', 'Dunkin'' Donuts', 'brand', true),
('dd', 'Dunkin'' Donuts', 'brand', true),
('baskin', 'Baskin Robbins', 'brand', true),
('the coffee house', 'The Coffee House', 'brand', true),
('tch', 'The Coffee House', 'brand', true),
('sting', 'Sting', 'brand', true),
('pepsi', 'Pepsi', 'brand', true),
('coca', 'Coca Cola', 'brand', true),

-- =============================================================================
-- SERVICE: Dịch vụ công và tiện ích
-- =============================================================================
('giayto', 'Giấy tờ', 'service', true),
('cchh', 'Căn cước công dân', 'service', true),
('cccd', 'Căn cước công dân', 'service', true),
('cmnd', 'Chứng minh nhân dân', 'service', true),
('hct', 'Hộ chiếu', 'service', true),
('visa', 'Visa', 'service', true),
('dk', 'Đăng ký', 'service', true),
('đkx', 'Đăng ký xe', 'service', true),
('đklx', 'Đăng ký kinh doanh', 'service', true),
('kt', 'Kết hôn', 'service', true),
('ts', 'Thủ tục', 'service', true),
('tthc', 'Thủ tục hành chính', 'service', true),
('bhxh', 'Bảo hiểm xã hội', 'service', true),
('bhtn', 'Bảo hiểm thất nghiệp', 'service', true),
('bht', 'Bảo hiểm y tế', 'service', true),
('bhyt', 'Bảo hiểm y tế', 'service', true),
('syt', 'Sở Y tế', 'service', true),
('sgddt', 'Sở Giáo dục và Đào tạo', 'service', true),
('sgtvt', 'Sở Giao thông Vận tải', 'service', true),
('stnmt', 'Sở Tài nguyên và Môi trường', 'service', true),
('skhđt', 'Sở Kế hoạch và Đầu tư', 'service', true),
('stc', 'Sở Tài chính', 'service', true),
('snv', 'Sở Nội vụ', 'service', true),
('stttt', 'Sở Thông tin và Truyền thông', 'service', true),
('sldtbxh', 'Sở Lao động Thương binh và Xã hội', 'service', true),
('svhttdl', 'Sở Văn hóa Thể thao và Du lịch', 'service', true),
('sct', 'Sở Công Thương', 'service', true),
('sxd', 'Sở Xây dựng', 'service', true),
('stp', 'Sở Tư pháp', 'service', true),

-- =============================================================================
-- REGION: Vùng miền
-- =============================================================================
('mb', 'Miền Bắc', 'alias', true),
('mt', 'Miền Trung', 'alias', true),
('mn', 'Miền Nam', 'alias', true),
('tn', 'Tây Nguyên', 'alias', true),
('tb', 'Tây Bắc', 'alias', true),
('đb', 'Đông Bắc', 'alias', true),
('đbsh', 'Đồng bằng sông Hồng', 'alias', true),
('đbscl', 'Đồng bằng sông Cửu Long', 'alias', true),
('dhnb', 'Đông Nam Bộ', 'alias', true),
('bsh', 'Bắc Trung Bộ', 'alias', true),
('cl', 'Cửu Long', 'alias', true),

-- =============================================================================
-- LANDMARK: Địa danh nổi tiếng
-- =============================================================================
('hgg', 'Hồ Gươm', 'alias', true),
('htb', 'Hồ Tây', 'alias', true),
('htr', 'Hồ Trúc Bạch', 'alias', true),
('lth', 'Lăng Bác', 'alias', true),
('vm', 'Văn Miếu', 'alias', true),
('qtg', 'Quốc Tử Giám', 'alias', true),
('ct', 'Chùa Một Cột', 'alias', true),
('nnh', 'Nhà thờ Lớn', 'alias', true),
('vb', 'Cầu Long Biên', 'alias', true),
('cm', 'Chợ Đồng Xuân', 'alias', true),
('bđ', 'Bến Thành', 'alias', true),
('btc', 'Chợ Bến Thành', 'alias', true),
('đtl', 'Dinh Độc Lập', 'alias', true),
('nđc', 'Nhà thờ Đức Bà', 'alias', true),
('bth', 'Bưu điện Thành phố', 'alias', true),
('nvn', 'Nguyễn Văn Linh', 'alias', true),
('hvt', 'Hoàng Văn Thụ', 'alias', true),
('pml', 'Phố Mới Lê Trọng Tấn', 'alias', true),
('btl', 'Bà Nà Hills', 'alias', true),
('hvn', 'Hội An', 'alias', true),
('mc', 'Mỹ Khê', 'alias', true),
('son', 'Sơn Trà', 'alias', true),
('bk', 'Bà Nà', 'alias', true),
('ha', 'Hội An', 'alias', true),
('vl', 'Vịnh Hạ Long', 'alias', true),
('hl', 'Hạ Long', 'alias', true),
('spa', 'Sa Pa', 'alias', true),
('mc', 'Mũi Né', 'alias', true),
('pt', 'Phan Thiết', 'alias', true),
('ct', 'Cần Thơ', 'alias', true),
('bc', 'Bến Cát', 'alias', true),
('st', 'Sapa', 'alias', true),

-- =============================================================================
-- TRANSPORT: Phương tiện giao thông
-- =============================================================================
('xbuyt', 'Xe buýt', 'category', true),
('xmay', 'Xe máy', 'category', true),
('oto', 'Ô tô', 'category', true),
('taxi', 'Taxi', 'category', true),
('grab', 'Grab', 'category', true),
('uber', 'Uber', 'category', true),
('gojek', 'Gojek', 'category', true),
('be', 'Be', 'category', true),
('xedap', 'Xe đạp', 'category', true),
('dd', 'Xe điện', 'category', true),
('pt', 'Phương tiện', 'category', true),

-- =============================================================================
-- MEDICAL: Y tế & Sức khỏe bổ sung
-- =============================================================================
('bvcr', 'Bệnh viện Chợ Rẫy', 'service', true),
('bvb', 'Bệnh viện Bạch Mai', 'service', true),
('bvvl', 'Bệnh viện Việt Đức', 'service', true),
('bv115', 'Bệnh viện 115', 'service', true),
('bvnđ', 'Bệnh viện Nhi Đồng', 'service', true),
('bvnđ1', 'Bệnh viện Nhi Đồng 1', 'service', true),
('bvnđ2', 'Bệnh viện Nhi Đồng 2', 'service', true),
('bvtm', 'Bệnh viện Tâm thần', 'service', true),
('bvpt', 'Bệnh viện Phụ sản Từ Dũ', 'service', true),
('bvbmt', 'Bệnh viện Mắt', 'service', true),
('bvrh', 'Bệnh viện Răng Hàm Mặt', 'service', true),
('bvnđ', 'Bệnh viện Nhi đồng', 'service', true),
('bvđh', 'Bệnh viện Đại học Y Dược', 'service', true),
('bvct', 'Bệnh viện Chấn thương chỉnh hình', 'service', true),
('bvhc', 'Bệnh viện Ung Bướu', 'service', true),
('bvtw', 'Bệnh viện Trung ương', 'service', true),
('bvtw hcm', 'Bệnh viện Trung ương Huế', 'service', true),
('bvtw hn', 'Bệnh viện Trung ương Quân đội 108', 'service', true),
('pkyhct', 'Phòng khám Y học cổ truyền', 'service', true),
('bsgd', 'Bác sĩ gia đình', 'service', true),

-- =============================================================================
-- FINANCE: Ngân hàng bổ sung
-- =============================================================================
('nh', 'Ngân hàng', 'brand', true),
('đlvc', 'Đại lý Vietcombank', 'brand', true),
('p hđ', 'Phòng giao dịch', 'brand', true),
('pgd', 'Phòng giao dịch', 'brand', true),
('cn', 'Chi nhánh', 'brand', true),
('ctck', 'Công ty chứng khoán', 'brand', true),
('qc', 'Quỹ đầu tư', 'brand', true),
('tk', 'Tiết kiệm', 'brand', true),

-- =============================================================================
-- Bổ sung các abbreviation quan trọng còn thiếu
-- =============================================================================
('vn', 'Việt Nam', 'alias', true),
('hà nội', 'Hà Nội', 'alias', true),
('sài gòn', 'Sài Gòn', 'alias', true),
('đà nẵng', 'Đà Nẵng', 'alias', true),
('hải phòng', 'Hải Phòng', 'alias', true),
('cần thơ', 'Cần Thơ', 'alias', true),
('huế', 'Huế', 'alias', true),
('đà lạt', 'Đà Lạt', 'alias', true),
('nha trang', 'Nha Trang', 'alias', true),
('vũng tàu', 'Vũng Tàu', 'alias', true),
('phú quốc', 'Phú Quốc', 'alias', true),
('sa pa', 'Sa Pa', 'alias', true),
('hạ long', 'Hạ Long', 'alias', true),

-- =============================================================================
-- REAL ESTATE: Bất động sản & Khu đô thị
-- =============================================================================
('kdtn', 'Khu đô thị Nam', 'service', true),
('kdttđ', 'Khu đô thị Thủ Đức', 'service', true),
('kdttm', 'Khu đô thị Thủ Thiêm', 'service', true),
('kdtan', 'Khu đô thị An Phú', 'service', true),
('kdtml', 'Khu đô thị Mỹ Lộc', 'service', true),
('pml', 'Phú Mỹ Hưng', 'service', true),
('pmh', 'Phú Mỹ Hưng', 'service', true),
('ql', 'Quốc lộ', 'service', true),
('tl', 'Tỉnh lộ', 'service', true),
('ql1', 'Quốc lộ 1A', 'service', true),
('ql13', 'Quốc lộ 13', 'service', true),
('ql22', 'Quốc lộ 22', 'service', true),
('ql51', 'Quốc lộ 51', 'service', true),
('ah1', 'AH1', 'service', true),
('ctxh', 'Cao tốc TP.HCM - Long Thành - Dầu Giây', 'service', true),
('ctxh', 'Cao tốc Trung Lương', 'service', true),
('ctbl', 'Cao tốc Bắc Nam', 'service', true);

-- =============================================================================
-- Enriched Autocomplete Pairs (LLM-generated)
-- Total pairs: ~1632
-- Generated for Track 4: AI-Powered Autocomplete & Query Suggestions
-- =============================================================================

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM0001', 'quan ca phê', 'Quán cà phê gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0002', 'ca phê', 'Cà phê gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0003', 'tra sua', 'Trà sữa gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0004', 'nha hang', 'Nhà hàng gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0005', 'quan ăn', 'Quán ăn gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0006', 'quan nhau', 'Quán nhậu gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0007', 'quan lau', 'Quán lẩu gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0008', 'quan nưong', 'Quán nướng gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0009', 'quan chay', 'Quán chay gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0010', 'pho', 'Phở gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0011', 'bun bo', 'Bún bò gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0012', 'bun cha', 'Bún chả gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0013', 'hu tieu', 'Hủ tiếu gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0014', 'cơm tam', 'Cơm tấm gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0015', 'banh mi', 'Bánh mì gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0016', 'banh xeo', 'Bánh xèo gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0017', 'banh cuon', 'Bánh cuốn gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0018', 'chao', 'Cháo gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0019', 'tiem banh', 'Tiệm bánh gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0020', 'banh ngot', 'Bánh ngọt gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0021', 'khach san', 'Khách sạn gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0022', 'nha nghi', 'Nhà nghỉ gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0023', 'homestay', 'Homestay gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0024', 'resort', 'Resort gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0025', 'villa', 'Villa gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0026', 'atm', 'ATM gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0027', 'ngân hang', 'Ngân hàng gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0028', 'cây xăng', 'Cây xăng gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0029', 'tram xăng', 'Trạm xăng gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0030', 'benh vien', 'Bệnh viện gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0031', 'phong kham', 'Phòng khám gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0032', 'nha thuoc', 'Nhà thuốc gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0033', 'nha khoa', 'Nha khoa gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0034', 'siêu thi', 'Siêu thị gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0035', 'cho', 'Chợ gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0036', 'cua hang tien loi', 'Cửa hàng tiện lợi gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0037', 'tap hoa', 'Tạp hóa gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0038', 'trưong hoc', 'Trường học gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0039', 'dai hoc', 'Đại học gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0040', 'thư vien', 'Thư viện gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0041', 'công viên', 'Công viên gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0042', 'khu vui chơi', 'Khu vui chơi gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0043', 'rap chieu phim', 'Rạp chiếu phim gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0044', 'karaoke', 'Karaoke gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0045', 'spa', 'Spa gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0046', 'massage', 'Massage gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0047', 'gym', 'Gym gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0048', 'yoga', 'Yoga gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0049', 'fitness', 'Fitness gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0050', 'ben xe', 'Bến xe gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0051', 'ga tau', 'Ga tàu gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0052', 'sân bay', 'Sân bay gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0053', 'bai do xe', 'Bãi đỗ xe gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0054', 'tram sac dien', 'Trạm sạc điện gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0055', 'tiem sua xe', 'Tiệm sửa xe gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0056', 'rua xe', 'Rửa xe gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0057', 'garage ô tô', 'Garage ô tô gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0058', 'salon', 'Salon gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0059', 'tiem cat toc', 'Tiệm cắt tóc gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0060', 'giat ui', 'Giặt ủi gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0061', 'bao tang', 'Bảo tàng gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0062', 'diem du lich', 'Điểm du lịch gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0063', 'bien', 'Biển gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0064', 'nui', 'Núi gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0065', 'ho', 'Hồ gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0066', 'sông', 'Sông gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0067', 'chua', 'Chùa gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0068', 'nha tho', 'Nhà thờ gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0069', 'quan oc', 'Quán ốc gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0070', 'quan hai san', 'Quán hải sản gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0071', 'buffet', 'Buffet gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0072', 'lau băng chuyen', 'Lẩu băng chuyền gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0073', 'cơm văn phong', 'Cơm văn phòng gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0074', 'cơm binh dân', 'Cơm bình dân gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0075', 'cơm chay', 'Cơm chay gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM0076', 'quan ca phê', 'Quán cà phê TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0077', 'quan ca phê', 'Quán cà phê Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0078', 'quan ca phê', 'Quán cà phê Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0079', 'quan ca phê', 'Quán cà phê Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0080', 'quan ca phê', 'Quán cà phê Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0081', 'quan ca phê', 'Quán cà phê Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0082', 'quan ca phê', 'Quán cà phê Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0083', 'quan ca phê', 'Quán cà phê Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0084', 'ca phê', 'Cà phê TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0085', 'ca phê', 'Cà phê Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0086', 'ca phê', 'Cà phê Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0087', 'ca phê', 'Cà phê Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0088', 'ca phê', 'Cà phê Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0089', 'ca phê', 'Cà phê Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0090', 'ca phê', 'Cà phê Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0091', 'ca phê', 'Cà phê Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0092', 'tra sua', 'Trà sữa TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0093', 'tra sua', 'Trà sữa Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0094', 'tra sua', 'Trà sữa Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0095', 'tra sua', 'Trà sữa Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0096', 'tra sua', 'Trà sữa Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0097', 'tra sua', 'Trà sữa Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0098', 'tra sua', 'Trà sữa Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0099', 'tra sua', 'Trà sữa Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0100', 'nha hang', 'Nhà hàng TP.HCM', 'Category Search', 0.550, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM0101', 'nha hang', 'Nhà hàng Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0102', 'nha hang', 'Nhà hàng Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0103', 'nha hang', 'Nhà hàng Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0104', 'nha hang', 'Nhà hàng Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0105', 'nha hang', 'Nhà hàng Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0106', 'nha hang', 'Nhà hàng Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0107', 'nha hang', 'Nhà hàng Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0108', 'quan ăn', 'Quán ăn TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0109', 'quan ăn', 'Quán ăn Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0110', 'quan ăn', 'Quán ăn Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0111', 'quan ăn', 'Quán ăn Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0112', 'quan ăn', 'Quán ăn Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0113', 'quan ăn', 'Quán ăn Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0114', 'quan ăn', 'Quán ăn Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0115', 'quan ăn', 'Quán ăn Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0116', 'quan nhau', 'Quán nhậu TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0117', 'quan nhau', 'Quán nhậu Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0118', 'quan nhau', 'Quán nhậu Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0119', 'quan nhau', 'Quán nhậu Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0120', 'quan nhau', 'Quán nhậu Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0121', 'quan nhau', 'Quán nhậu Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0122', 'quan nhau', 'Quán nhậu Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0123', 'quan nhau', 'Quán nhậu Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0124', 'quan lau', 'Quán lẩu TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0125', 'quan lau', 'Quán lẩu Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0126', 'quan lau', 'Quán lẩu Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0127', 'quan lau', 'Quán lẩu Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0128', 'quan lau', 'Quán lẩu Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0129', 'quan lau', 'Quán lẩu Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0130', 'quan lau', 'Quán lẩu Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0131', 'quan lau', 'Quán lẩu Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0132', 'quan nưong', 'Quán nướng TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0133', 'quan nưong', 'Quán nướng Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0134', 'quan nưong', 'Quán nướng Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0135', 'quan nưong', 'Quán nướng Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0136', 'quan nưong', 'Quán nướng Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0137', 'quan nưong', 'Quán nướng Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0138', 'quan nưong', 'Quán nướng Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0139', 'quan nưong', 'Quán nướng Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0140', 'quan chay', 'Quán chay TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0141', 'quan chay', 'Quán chay Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0142', 'quan chay', 'Quán chay Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0143', 'quan chay', 'Quán chay Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0144', 'quan chay', 'Quán chay Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0145', 'quan chay', 'Quán chay Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0146', 'quan chay', 'Quán chay Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0147', 'quan chay', 'Quán chay Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0148', 'pho', 'Phở TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0149', 'pho', 'Phở Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0150', 'pho', 'Phở Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0151', 'pho', 'Phở Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0152', 'pho', 'Phở Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0153', 'pho', 'Phở Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0154', 'pho', 'Phở Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0155', 'pho', 'Phở Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0156', 'bun bo', 'Bún bò TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0157', 'bun bo', 'Bún bò Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0158', 'bun bo', 'Bún bò Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0159', 'bun bo', 'Bún bò Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0160', 'bun bo', 'Bún bò Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0161', 'bun bo', 'Bún bò Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0162', 'bun bo', 'Bún bò Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0163', 'bun bo', 'Bún bò Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0164', 'bun cha', 'Bún chả TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0165', 'bun cha', 'Bún chả Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0166', 'bun cha', 'Bún chả Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0167', 'bun cha', 'Bún chả Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0168', 'bun cha', 'Bún chả Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0169', 'bun cha', 'Bún chả Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0170', 'bun cha', 'Bún chả Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0171', 'bun cha', 'Bún chả Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0172', 'hu tieu', 'Hủ tiếu TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0173', 'hu tieu', 'Hủ tiếu Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0174', 'hu tieu', 'Hủ tiếu Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0175', 'hu tieu', 'Hủ tiếu Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0176', 'hu tieu', 'Hủ tiếu Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0177', 'hu tieu', 'Hủ tiếu Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0178', 'hu tieu', 'Hủ tiếu Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0179', 'hu tieu', 'Hủ tiếu Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0180', 'cơm tam', 'Cơm tấm TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0181', 'cơm tam', 'Cơm tấm Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0182', 'cơm tam', 'Cơm tấm Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0183', 'cơm tam', 'Cơm tấm Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0184', 'cơm tam', 'Cơm tấm Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0185', 'cơm tam', 'Cơm tấm Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0186', 'cơm tam', 'Cơm tấm Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0187', 'cơm tam', 'Cơm tấm Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0188', 'banh mi', 'Bánh mì TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0189', 'banh mi', 'Bánh mì Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0190', 'banh mi', 'Bánh mì Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0191', 'banh mi', 'Bánh mì Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0192', 'banh mi', 'Bánh mì Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0193', 'banh mi', 'Bánh mì Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0194', 'banh mi', 'Bánh mì Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0195', 'banh mi', 'Bánh mì Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0196', 'banh xeo', 'Bánh xèo TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0197', 'banh xeo', 'Bánh xèo Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0198', 'banh xeo', 'Bánh xèo Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0199', 'banh xeo', 'Bánh xèo Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0200', 'banh xeo', 'Bánh xèo Cần Thơ', 'Category Search', 0.550, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM0201', 'banh xeo', 'Bánh xèo Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0202', 'banh xeo', 'Bánh xèo Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0203', 'banh xeo', 'Bánh xèo Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0204', 'banh cuon', 'Bánh cuốn TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0205', 'banh cuon', 'Bánh cuốn Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0206', 'banh cuon', 'Bánh cuốn Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0207', 'banh cuon', 'Bánh cuốn Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0208', 'banh cuon', 'Bánh cuốn Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0209', 'banh cuon', 'Bánh cuốn Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0210', 'banh cuon', 'Bánh cuốn Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0211', 'banh cuon', 'Bánh cuốn Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0212', 'chao', 'Cháo TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0213', 'chao', 'Cháo Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0214', 'chao', 'Cháo Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0215', 'chao', 'Cháo Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0216', 'chao', 'Cháo Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0217', 'chao', 'Cháo Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0218', 'chao', 'Cháo Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0219', 'chao', 'Cháo Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0220', 'tiem banh', 'Tiệm bánh TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0221', 'tiem banh', 'Tiệm bánh Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0222', 'tiem banh', 'Tiệm bánh Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0223', 'tiem banh', 'Tiệm bánh Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0224', 'tiem banh', 'Tiệm bánh Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0225', 'tiem banh', 'Tiệm bánh Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0226', 'tiem banh', 'Tiệm bánh Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0227', 'tiem banh', 'Tiệm bánh Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0228', 'banh ngot', 'Bánh ngọt TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0229', 'banh ngot', 'Bánh ngọt Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0230', 'banh ngot', 'Bánh ngọt Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0231', 'banh ngot', 'Bánh ngọt Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0232', 'banh ngot', 'Bánh ngọt Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0233', 'banh ngot', 'Bánh ngọt Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0234', 'banh ngot', 'Bánh ngọt Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0235', 'banh ngot', 'Bánh ngọt Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0236', 'khach san', 'Khách sạn TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0237', 'khach san', 'Khách sạn Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0238', 'khach san', 'Khách sạn Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0239', 'khach san', 'Khách sạn Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0240', 'khach san', 'Khách sạn Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0241', 'khach san', 'Khách sạn Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0242', 'khach san', 'Khách sạn Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0243', 'khach san', 'Khách sạn Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0244', 'nha nghi', 'Nhà nghỉ TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0245', 'nha nghi', 'Nhà nghỉ Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0246', 'nha nghi', 'Nhà nghỉ Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0247', 'nha nghi', 'Nhà nghỉ Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0248', 'nha nghi', 'Nhà nghỉ Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0249', 'nha nghi', 'Nhà nghỉ Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0250', 'nha nghi', 'Nhà nghỉ Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0251', 'nha nghi', 'Nhà nghỉ Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0252', 'homestay', 'Homestay TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0253', 'homestay', 'Homestay Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0254', 'homestay', 'Homestay Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0255', 'homestay', 'Homestay Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0256', 'homestay', 'Homestay Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0257', 'homestay', 'Homestay Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0258', 'homestay', 'Homestay Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0259', 'homestay', 'Homestay Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0260', 'resort', 'Resort TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0261', 'resort', 'Resort Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0262', 'resort', 'Resort Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0263', 'resort', 'Resort Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0264', 'resort', 'Resort Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0265', 'resort', 'Resort Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0266', 'resort', 'Resort Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0267', 'resort', 'Resort Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0268', 'villa', 'Villa TP.HCM', 'Category Search', 0.550, NULL, true)
,
('LLM0269', 'villa', 'Villa Hà Nội', 'Category Search', 0.550, NULL, true)
,
('LLM0270', 'villa', 'Villa Đà Nẵng', 'Category Search', 0.550, NULL, true)
,
('LLM0271', 'villa', 'Villa Hải Phòng', 'Category Search', 0.550, NULL, true)
,
('LLM0272', 'villa', 'Villa Cần Thơ', 'Category Search', 0.550, NULL, true)
,
('LLM0273', 'villa', 'Villa Nha Trang', 'Category Search', 0.550, NULL, true)
,
('LLM0274', 'villa', 'Villa Đà Lạt', 'Category Search', 0.550, NULL, true)
,
('LLM0275', 'villa', 'Villa Vũng Tàu', 'Category Search', 0.550, NULL, true)
,
('LLM0276', 'quan ca phê', 'Quán cà phê Quận 1', 'Category Search', 0.550, NULL, true)
,
('LLM0277', 'quan ca phê', 'Quán cà phê Quận 2', 'Category Search', 0.550, NULL, true)
,
('LLM0278', 'quan ca phê', 'Quán cà phê Quận 3', 'Category Search', 0.550, NULL, true)
,
('LLM0279', 'quan ca phê', 'Quán cà phê Quận 5', 'Category Search', 0.550, NULL, true)
,
('LLM0280', 'quan ca phê', 'Quán cà phê Quận 7', 'Category Search', 0.550, NULL, true)
,
('LLM0281', 'quan ca phê', 'Quán cà phê Bình Thạnh', 'Category Search', 0.550, NULL, true)
,
('LLM0282', 'ca phê', 'Cà phê Quận 1', 'Category Search', 0.550, NULL, true)
,
('LLM0283', 'ca phê', 'Cà phê Quận 2', 'Category Search', 0.550, NULL, true)
,
('LLM0284', 'ca phê', 'Cà phê Quận 3', 'Category Search', 0.550, NULL, true)
,
('LLM0285', 'ca phê', 'Cà phê Quận 5', 'Category Search', 0.550, NULL, true)
,
('LLM0286', 'ca phê', 'Cà phê Quận 7', 'Category Search', 0.550, NULL, true)
,
('LLM0287', 'ca phê', 'Cà phê Bình Thạnh', 'Category Search', 0.550, NULL, true)
,
('LLM0288', 'tra sua', 'Trà sữa Quận 1', 'Category Search', 0.550, NULL, true)
,
('LLM0289', 'tra sua', 'Trà sữa Quận 2', 'Category Search', 0.550, NULL, true)
,
('LLM0290', 'tra sua', 'Trà sữa Quận 3', 'Category Search', 0.550, NULL, true)
,
('LLM0291', 'tra sua', 'Trà sữa Quận 5', 'Category Search', 0.550, NULL, true)
,
('LLM0292', 'tra sua', 'Trà sữa Quận 7', 'Category Search', 0.550, NULL, true)
,
('LLM0293', 'tra sua', 'Trà sữa Bình Thạnh', 'Category Search', 0.550, NULL, true)
,
('LLM0294', 'nha hang', 'Nhà hàng Quận 1', 'Category Search', 0.550, NULL, true)
,
('LLM0295', 'nha hang', 'Nhà hàng Quận 2', 'Category Search', 0.550, NULL, true)
,
('LLM0296', 'nha hang', 'Nhà hàng Quận 3', 'Category Search', 0.550, NULL, true)
,
('LLM0297', 'nha hang', 'Nhà hàng Quận 5', 'Category Search', 0.550, NULL, true)
,
('LLM0298', 'nha hang', 'Nhà hàng Quận 7', 'Category Search', 0.550, NULL, true)
,
('LLM0299', 'nha hang', 'Nhà hàng Bình Thạnh', 'Category Search', 0.550, NULL, true)
,
('LLM0300', 'quan ăn', 'Quán ăn Quận 1', 'Category Search', 0.550, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM0301', 'quan ăn', 'Quán ăn Quận 2', 'Category Search', 0.550, NULL, true)
,
('LLM0302', 'quan ăn', 'Quán ăn Quận 3', 'Category Search', 0.550, NULL, true)
,
('LLM0303', 'quan ăn', 'Quán ăn Quận 5', 'Category Search', 0.550, NULL, true)
,
('LLM0304', 'quan ăn', 'Quán ăn Quận 7', 'Category Search', 0.550, NULL, true)
,
('LLM0305', 'quan ăn', 'Quán ăn Bình Thạnh', 'Category Search', 0.550, NULL, true)
,
('LLM0306', 'quan nhau', 'Quán nhậu Quận 1', 'Category Search', 0.550, NULL, true)
,
('LLM0307', 'quan nhau', 'Quán nhậu Quận 2', 'Category Search', 0.550, NULL, true)
,
('LLM0308', 'quan nhau', 'Quán nhậu Quận 3', 'Category Search', 0.550, NULL, true)
,
('LLM0309', 'quan nhau', 'Quán nhậu Quận 5', 'Category Search', 0.550, NULL, true)
,
('LLM0310', 'quan nhau', 'Quán nhậu Quận 7', 'Category Search', 0.550, NULL, true)
,
('LLM0311', 'quan nhau', 'Quán nhậu Bình Thạnh', 'Category Search', 0.550, NULL, true)
,
('LLM0312', 'quan lau', 'Quán lẩu Quận 1', 'Category Search', 0.550, NULL, true)
,
('LLM0313', 'quan lau', 'Quán lẩu Quận 2', 'Category Search', 0.550, NULL, true)
,
('LLM0314', 'quan lau', 'Quán lẩu Quận 3', 'Category Search', 0.550, NULL, true)
,
('LLM0315', 'quan lau', 'Quán lẩu Quận 5', 'Category Search', 0.550, NULL, true)
,
('LLM0316', 'quan lau', 'Quán lẩu Quận 7', 'Category Search', 0.550, NULL, true)
,
('LLM0317', 'quan lau', 'Quán lẩu Bình Thạnh', 'Category Search', 0.550, NULL, true)
,
('LLM0318', 'quan nưong', 'Quán nướng Quận 1', 'Category Search', 0.550, NULL, true)
,
('LLM0319', 'quan nưong', 'Quán nướng Quận 2', 'Category Search', 0.550, NULL, true)
,
('LLM0320', 'quan nưong', 'Quán nướng Quận 3', 'Category Search', 0.550, NULL, true)
,
('LLM0321', 'quan nưong', 'Quán nướng Quận 5', 'Category Search', 0.550, NULL, true)
,
('LLM0322', 'quan nưong', 'Quán nướng Quận 7', 'Category Search', 0.550, NULL, true)
,
('LLM0323', 'quan nưong', 'Quán nướng Bình Thạnh', 'Category Search', 0.550, NULL, true)
,
('LLM0324', 'quan chay', 'Quán chay Quận 1', 'Category Search', 0.550, NULL, true)
,
('LLM0325', 'quan chay', 'Quán chay Quận 2', 'Category Search', 0.550, NULL, true)
,
('LLM0326', 'quan chay', 'Quán chay Quận 3', 'Category Search', 0.550, NULL, true)
,
('LLM0327', 'quan chay', 'Quán chay Quận 5', 'Category Search', 0.550, NULL, true)
,
('LLM0328', 'quan chay', 'Quán chay Quận 7', 'Category Search', 0.550, NULL, true)
,
('LLM0329', 'quan chay', 'Quán chay Bình Thạnh', 'Category Search', 0.550, NULL, true)
,
('LLM0330', 'pho', 'Phở Quận 1', 'Category Search', 0.550, NULL, true)
,
('LLM0331', 'pho', 'Phở Quận 2', 'Category Search', 0.550, NULL, true)
,
('LLM0332', 'pho', 'Phở Quận 3', 'Category Search', 0.550, NULL, true)
,
('LLM0333', 'pho', 'Phở Quận 5', 'Category Search', 0.550, NULL, true)
,
('LLM0334', 'pho', 'Phở Quận 7', 'Category Search', 0.550, NULL, true)
,
('LLM0335', 'pho', 'Phở Bình Thạnh', 'Category Search', 0.550, NULL, true)
,
('LLM0336', 'bun bo', 'Bún bò Quận 1', 'Category Search', 0.550, NULL, true)
,
('LLM0337', 'bun bo', 'Bún bò Quận 2', 'Category Search', 0.550, NULL, true)
,
('LLM0338', 'bun bo', 'Bún bò Quận 3', 'Category Search', 0.550, NULL, true)
,
('LLM0339', 'bun bo', 'Bún bò Quận 5', 'Category Search', 0.550, NULL, true)
,
('LLM0340', 'bun bo', 'Bún bò Quận 7', 'Category Search', 0.550, NULL, true)
,
('LLM0341', 'bun bo', 'Bún bò Bình Thạnh', 'Category Search', 0.550, NULL, true)
,
('LLM0342', 'bun cha', 'Bún chả Quận 1', 'Category Search', 0.550, NULL, true)
,
('LLM0343', 'bun cha', 'Bún chả Quận 2', 'Category Search', 0.550, NULL, true)
,
('LLM0344', 'bun cha', 'Bún chả Quận 3', 'Category Search', 0.550, NULL, true)
,
('LLM0345', 'bun cha', 'Bún chả Quận 5', 'Category Search', 0.550, NULL, true)
,
('LLM0346', 'bun cha', 'Bún chả Quận 7', 'Category Search', 0.550, NULL, true)
,
('LLM0347', 'bun cha', 'Bún chả Bình Thạnh', 'Category Search', 0.550, NULL, true)
,
('LLM0348', 'hu tieu', 'Hủ tiếu Quận 1', 'Category Search', 0.550, NULL, true)
,
('LLM0349', 'hu tieu', 'Hủ tiếu Quận 2', 'Category Search', 0.550, NULL, true)
,
('LLM0350', 'hu tieu', 'Hủ tiếu Quận 3', 'Category Search', 0.550, NULL, true)
,
('LLM0351', 'hu tieu', 'Hủ tiếu Quận 5', 'Category Search', 0.550, NULL, true)
,
('LLM0352', 'hu tieu', 'Hủ tiếu Quận 7', 'Category Search', 0.550, NULL, true)
,
('LLM0353', 'hu tieu', 'Hủ tiếu Bình Thạnh', 'Category Search', 0.550, NULL, true)
,
('LLM0354', 'cơm tam', 'Cơm tấm Quận 1', 'Category Search', 0.550, NULL, true)
,
('LLM0355', 'cơm tam', 'Cơm tấm Quận 2', 'Category Search', 0.550, NULL, true)
,
('LLM0356', 'cơm tam', 'Cơm tấm Quận 3', 'Category Search', 0.550, NULL, true)
,
('LLM0357', 'cơm tam', 'Cơm tấm Quận 5', 'Category Search', 0.550, NULL, true)
,
('LLM0358', 'cơm tam', 'Cơm tấm Quận 7', 'Category Search', 0.550, NULL, true)
,
('LLM0359', 'cơm tam', 'Cơm tấm Bình Thạnh', 'Category Search', 0.550, NULL, true)
,
('LLM0360', 'banh mi', 'Bánh mì Quận 1', 'Category Search', 0.550, NULL, true)
,
('LLM0361', 'banh mi', 'Bánh mì Quận 2', 'Category Search', 0.550, NULL, true)
,
('LLM0362', 'banh mi', 'Bánh mì Quận 3', 'Category Search', 0.550, NULL, true)
,
('LLM0363', 'banh mi', 'Bánh mì Quận 5', 'Category Search', 0.550, NULL, true)
,
('LLM0364', 'banh mi', 'Bánh mì Quận 7', 'Category Search', 0.550, NULL, true)
,
('LLM0365', 'banh mi', 'Bánh mì Bình Thạnh', 'Category Search', 0.550, NULL, true)
,
('LLM0366', 'banh xeo', 'Bánh xèo Hoàn Kiếm', 'Category Search', 0.550, NULL, true)
,
('LLM0367', 'banh xeo', 'Bánh xèo Ba Đình', 'Category Search', 0.550, NULL, true)
,
('LLM0368', 'banh xeo', 'Bánh xèo Đống Đa', 'Category Search', 0.550, NULL, true)
,
('LLM0369', 'banh xeo', 'Bánh xèo Hai Bà Trưng', 'Category Search', 0.550, NULL, true)
,
('LLM0370', 'banh xeo', 'Bánh xèo Cầu Giấy', 'Category Search', 0.550, NULL, true)
,
('LLM0371', 'banh cuon', 'Bánh cuốn Hoàn Kiếm', 'Category Search', 0.550, NULL, true)
,
('LLM0372', 'banh cuon', 'Bánh cuốn Ba Đình', 'Category Search', 0.550, NULL, true)
,
('LLM0373', 'banh cuon', 'Bánh cuốn Đống Đa', 'Category Search', 0.550, NULL, true)
,
('LLM0374', 'banh cuon', 'Bánh cuốn Hai Bà Trưng', 'Category Search', 0.550, NULL, true)
,
('LLM0375', 'banh cuon', 'Bánh cuốn Cầu Giấy', 'Category Search', 0.550, NULL, true)
,
('LLM0376', 'chao', 'Cháo Hoàn Kiếm', 'Category Search', 0.550, NULL, true)
,
('LLM0377', 'chao', 'Cháo Ba Đình', 'Category Search', 0.550, NULL, true)
,
('LLM0378', 'chao', 'Cháo Đống Đa', 'Category Search', 0.550, NULL, true)
,
('LLM0379', 'chao', 'Cháo Hai Bà Trưng', 'Category Search', 0.550, NULL, true)
,
('LLM0380', 'chao', 'Cháo Cầu Giấy', 'Category Search', 0.550, NULL, true)
,
('LLM0381', 'tiem banh', 'Tiệm bánh Hoàn Kiếm', 'Category Search', 0.550, NULL, true)
,
('LLM0382', 'tiem banh', 'Tiệm bánh Ba Đình', 'Category Search', 0.550, NULL, true)
,
('LLM0383', 'tiem banh', 'Tiệm bánh Đống Đa', 'Category Search', 0.550, NULL, true)
,
('LLM0384', 'tiem banh', 'Tiệm bánh Hai Bà Trưng', 'Category Search', 0.550, NULL, true)
,
('LLM0385', 'tiem banh', 'Tiệm bánh Cầu Giấy', 'Category Search', 0.550, NULL, true)
,
('LLM0386', 'banh ngot', 'Bánh ngọt Hoàn Kiếm', 'Category Search', 0.550, NULL, true)
,
('LLM0387', 'banh ngot', 'Bánh ngọt Ba Đình', 'Category Search', 0.550, NULL, true)
,
('LLM0388', 'banh ngot', 'Bánh ngọt Đống Đa', 'Category Search', 0.550, NULL, true)
,
('LLM0389', 'banh ngot', 'Bánh ngọt Hai Bà Trưng', 'Category Search', 0.550, NULL, true)
,
('LLM0390', 'banh ngot', 'Bánh ngọt Cầu Giấy', 'Category Search', 0.550, NULL, true)
,
('LLM0391', 'khach san', 'Khách sạn Hoàn Kiếm', 'Category Search', 0.550, NULL, true)
,
('LLM0392', 'khach san', 'Khách sạn Ba Đình', 'Category Search', 0.550, NULL, true)
,
('LLM0393', 'khach san', 'Khách sạn Đống Đa', 'Category Search', 0.550, NULL, true)
,
('LLM0394', 'khach san', 'Khách sạn Hai Bà Trưng', 'Category Search', 0.550, NULL, true)
,
('LLM0395', 'khach san', 'Khách sạn Cầu Giấy', 'Category Search', 0.550, NULL, true)
,
('LLM0396', 'nha nghi', 'Nhà nghỉ Hoàn Kiếm', 'Category Search', 0.550, NULL, true)
,
('LLM0397', 'nha nghi', 'Nhà nghỉ Ba Đình', 'Category Search', 0.550, NULL, true)
,
('LLM0398', 'nha nghi', 'Nhà nghỉ Đống Đa', 'Category Search', 0.550, NULL, true)
,
('LLM0399', 'nha nghi', 'Nhà nghỉ Hai Bà Trưng', 'Category Search', 0.550, NULL, true)
,
('LLM0400', 'nha nghi', 'Nhà nghỉ Cầu Giấy', 'Category Search', 0.550, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM0401', 'homestay', 'Homestay Hoàn Kiếm', 'Category Search', 0.550, NULL, true)
,
('LLM0402', 'homestay', 'Homestay Ba Đình', 'Category Search', 0.550, NULL, true)
,
('LLM0403', 'homestay', 'Homestay Đống Đa', 'Category Search', 0.550, NULL, true)
,
('LLM0404', 'homestay', 'Homestay Hai Bà Trưng', 'Category Search', 0.550, NULL, true)
,
('LLM0405', 'homestay', 'Homestay Cầu Giấy', 'Category Search', 0.550, NULL, true)
,
('LLM0406', 'resort', 'Resort Hoàn Kiếm', 'Category Search', 0.550, NULL, true)
,
('LLM0407', 'resort', 'Resort Ba Đình', 'Category Search', 0.550, NULL, true)
,
('LLM0408', 'resort', 'Resort Đống Đa', 'Category Search', 0.550, NULL, true)
,
('LLM0409', 'resort', 'Resort Hai Bà Trưng', 'Category Search', 0.550, NULL, true)
,
('LLM0410', 'resort', 'Resort Cầu Giấy', 'Category Search', 0.550, NULL, true)
,
('LLM0411', 'villa', 'Villa Hoàn Kiếm', 'Category Search', 0.550, NULL, true)
,
('LLM0412', 'villa', 'Villa Ba Đình', 'Category Search', 0.550, NULL, true)
,
('LLM0413', 'villa', 'Villa Đống Đa', 'Category Search', 0.550, NULL, true)
,
('LLM0414', 'villa', 'Villa Hai Bà Trưng', 'Category Search', 0.550, NULL, true)
,
('LLM0415', 'villa', 'Villa Cầu Giấy', 'Category Search', 0.550, NULL, true)
,
('LLM0416', 'quan ca phê', 'Quán cà phê wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0417', 'quan ca phê', 'Quán cà phê gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0418', 'quan ca phê', 'Quán cà phê view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0419', 'quan ca phê', 'Quán cà phê yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0420', 'quan ca phê', 'Quán cà phê mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0421', 'quan ca phê', 'Quán cà phê có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0422', 'ca phê', 'Cà phê wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0423', 'ca phê', 'Cà phê gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0424', 'ca phê', 'Cà phê view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0425', 'ca phê', 'Cà phê yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0426', 'ca phê', 'Cà phê mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0427', 'ca phê', 'Cà phê có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0428', 'tra sua', 'Trà sữa wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0429', 'tra sua', 'Trà sữa gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0430', 'tra sua', 'Trà sữa view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0431', 'tra sua', 'Trà sữa yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0432', 'tra sua', 'Trà sữa mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0433', 'tra sua', 'Trà sữa có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0434', 'nha hang', 'Nhà hàng wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0435', 'nha hang', 'Nhà hàng gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0436', 'nha hang', 'Nhà hàng view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0437', 'nha hang', 'Nhà hàng yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0438', 'nha hang', 'Nhà hàng mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0439', 'nha hang', 'Nhà hàng có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0440', 'quan ăn', 'Quán ăn wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0441', 'quan ăn', 'Quán ăn gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0442', 'quan ăn', 'Quán ăn view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0443', 'quan ăn', 'Quán ăn yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0444', 'quan ăn', 'Quán ăn mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0445', 'quan ăn', 'Quán ăn có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0446', 'quan nhau', 'Quán nhậu wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0447', 'quan nhau', 'Quán nhậu gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0448', 'quan nhau', 'Quán nhậu view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0449', 'quan nhau', 'Quán nhậu yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0450', 'quan nhau', 'Quán nhậu mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0451', 'quan nhau', 'Quán nhậu có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0452', 'quan lau', 'Quán lẩu wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0453', 'quan lau', 'Quán lẩu gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0454', 'quan lau', 'Quán lẩu view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0455', 'quan lau', 'Quán lẩu yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0456', 'quan lau', 'Quán lẩu mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0457', 'quan lau', 'Quán lẩu có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0458', 'quan nưong', 'Quán nướng wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0459', 'quan nưong', 'Quán nướng gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0460', 'quan nưong', 'Quán nướng view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0461', 'quan nưong', 'Quán nướng yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0462', 'quan nưong', 'Quán nướng mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0463', 'quan nưong', 'Quán nướng có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0464', 'quan chay', 'Quán chay wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0465', 'quan chay', 'Quán chay gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0466', 'quan chay', 'Quán chay view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0467', 'quan chay', 'Quán chay yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0468', 'quan chay', 'Quán chay mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0469', 'quan chay', 'Quán chay có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0470', 'pho', 'Phở wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0471', 'pho', 'Phở gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0472', 'pho', 'Phở view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0473', 'pho', 'Phở yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0474', 'pho', 'Phở mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0475', 'pho', 'Phở có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0476', 'bun bo', 'Bún bò wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0477', 'bun bo', 'Bún bò gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0478', 'bun bo', 'Bún bò view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0479', 'bun bo', 'Bún bò yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0480', 'bun bo', 'Bún bò mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0481', 'bun bo', 'Bún bò có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0482', 'bun cha', 'Bún chả wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0483', 'bun cha', 'Bún chả gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0484', 'bun cha', 'Bún chả view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0485', 'bun cha', 'Bún chả yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0486', 'bun cha', 'Bún chả mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0487', 'bun cha', 'Bún chả có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0488', 'hu tieu', 'Hủ tiếu wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0489', 'hu tieu', 'Hủ tiếu gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0490', 'hu tieu', 'Hủ tiếu view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0491', 'hu tieu', 'Hủ tiếu yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0492', 'hu tieu', 'Hủ tiếu mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0493', 'hu tieu', 'Hủ tiếu có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0494', 'cơm tam', 'Cơm tấm wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0495', 'cơm tam', 'Cơm tấm gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0496', 'cơm tam', 'Cơm tấm view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0497', 'cơm tam', 'Cơm tấm yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0498', 'cơm tam', 'Cơm tấm mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0499', 'cơm tam', 'Cơm tấm có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0500', 'banh mi', 'Bánh mì wifi', 'Category Search', 0.550, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM0501', 'banh mi', 'Bánh mì gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0502', 'banh mi', 'Bánh mì view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0503', 'banh mi', 'Bánh mì yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0504', 'banh mi', 'Bánh mì mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0505', 'banh mi', 'Bánh mì có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0506', 'banh xeo', 'Bánh xèo wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0507', 'banh xeo', 'Bánh xèo gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0508', 'banh xeo', 'Bánh xèo view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0509', 'banh xeo', 'Bánh xèo yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0510', 'banh xeo', 'Bánh xèo mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0511', 'banh xeo', 'Bánh xèo có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0512', 'banh cuon', 'Bánh cuốn wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0513', 'banh cuon', 'Bánh cuốn gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0514', 'banh cuon', 'Bánh cuốn view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0515', 'banh cuon', 'Bánh cuốn yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0516', 'banh cuon', 'Bánh cuốn mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0517', 'banh cuon', 'Bánh cuốn có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0518', 'chao', 'Cháo wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0519', 'chao', 'Cháo gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0520', 'chao', 'Cháo view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0521', 'chao', 'Cháo yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0522', 'chao', 'Cháo mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0523', 'chao', 'Cháo có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0524', 'tiem banh', 'Tiệm bánh wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0525', 'tiem banh', 'Tiệm bánh gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0526', 'tiem banh', 'Tiệm bánh view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0527', 'tiem banh', 'Tiệm bánh yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0528', 'tiem banh', 'Tiệm bánh mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0529', 'tiem banh', 'Tiệm bánh có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0530', 'banh ngot', 'Bánh ngọt wifi', 'Category Search', 0.550, NULL, true)
,
('LLM0531', 'banh ngot', 'Bánh ngọt gần biển', 'Category Search', 0.550, NULL, true)
,
('LLM0532', 'banh ngot', 'Bánh ngọt view đẹp', 'Category Search', 0.550, NULL, true)
,
('LLM0533', 'banh ngot', 'Bánh ngọt yên tĩnh', 'Category Search', 0.550, NULL, true)
,
('LLM0534', 'banh ngot', 'Bánh ngọt mở cửa 24/7', 'Category Search', 0.550, NULL, true)
,
('LLM0535', 'banh ngot', 'Bánh ngọt có chỗ đậu xe', 'Category Search', 0.550, NULL, true)
,
('LLM0536', 'highlands coffee', 'Highlands Coffee gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0537', 'the coffee house', 'The Coffee House gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0538', 'phuc long', 'Phúc Long gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0539', 'cong ca phê', 'Cộng Cà Phê gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0540', 'starbucks', 'Starbucks gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0541', 'trung nguyên legend', 'Trung Nguyên Legend gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0542', 'katinat', 'Katinat gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0543', 'cheese coffee', 'Cheese Coffee gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0544', 'vincom center', 'Vincom Center gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0545', 'aeon mall', 'AEON Mall gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0546', 'lotte mart', 'Lotte Mart gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0547', 'go!', 'GO! gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0548', 'big c', 'Big C gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0549', 'crescent mall', 'Crescent Mall gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0550', 'takashimaya', 'Takashimaya gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0551', 'vietcombank', 'Vietcombank gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0552', 'bidv', 'BIDV gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0553', 'techcombank', 'Techcombank gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0554', 'mb bank', 'MB Bank gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0555', 'acb', 'ACB gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0556', 'agribank', 'Agribank gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0557', 'tpbank', 'TPBank gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0558', 'vpbank', 'VPBank gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0559', 'sacombank', 'Sacombank gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0560', 'pizza 4p''s', 'Pizza 4P''s gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0561', 'lotteria', 'Lotteria gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0562', 'kfc', 'KFC gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0563', 'jollibee', 'Jollibee gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0564', 'mcdonald''s', 'McDonald''s gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0565', 'burger king', 'Burger King gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0566', 'haidilao', 'Haidilao gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0567', 'seoul garden', 'Seoul Garden gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0568', 'gogi house', 'Gogi House gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0569', 'king bbq', 'King BBQ gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0570', 'manwah', 'Manwah gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0571', 'daruma', 'Daruma gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0572', 'sumo bbq', 'Sumo BBQ gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0573', 'galaxy cinema', 'Galaxy Cinema gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0574', 'cgv', 'CGV gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0575', 'lotte cinema', 'Lotte Cinema gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0576', 'beta cinema', 'Beta Cinema gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0577', 'bhd star', 'BHD Star gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0578', 'petrolimex', 'Petrolimex gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0579', 'pv oil', 'PV Oil gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0580', 'saigon petro', 'Saigon Petro gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0581', 'vinmec', 'Vinmec gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0582', 'bach mai', 'Bạch Mai gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0583', 'cho ray', 'Chợ Rẫy gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0584', 'viet duc', 'Việt Đức gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0585', 'fv hospital', 'FV Hospital gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0586', 'mưong thanh', 'Mường Thanh gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0587', 'intercontinental', 'Intercontinental gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0588', 'sheraton', 'Sheraton gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0589', 'novotel', 'Novotel gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0590', 'vinpearl', 'Vinpearl gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0591', 'marriott', 'Marriott gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0592', 'hilton', 'Hilton gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0593', 'pullman', 'Pullman gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0594', 'circle k', 'Circle K gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0595', 'gs25', 'GS25 gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0596', 'family mart', 'Family Mart gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0597', 'bach hoa xanh', 'Bách Hóa Xanh gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0598', 'winmart+', 'WinMart+ gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0599', 'mixue', 'Mixue gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0600', 'phê la', 'Phê La gần nhất', 'Brand Search', 0.600, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM0601', 'tocotoco', 'Tocotoco gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0602', 'gong cha', 'Gong Cha gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0603', 'ding tea', 'Ding Tea gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0604', 'bobapop', 'Bobapop gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0605', 'ministop', 'Ministop gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0606', '7-eleven', '7-Eleven gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0607', 'xanh sm', 'Xanh SM gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0608', 'grab', 'Grab gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0609', 'be', 'Be gần nhất', 'Brand Search', 0.600, NULL, true)
,
('LLM0610', 'highlands coffee', 'Highlands Coffee TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0611', 'highlands coffee', 'Highlands Coffee Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0612', 'highlands coffee', 'Highlands Coffee Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0613', 'highlands coffee', 'Highlands Coffee Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0614', 'highlands coffee', 'Highlands Coffee Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0615', 'the coffee house', 'The Coffee House TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0616', 'the coffee house', 'The Coffee House Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0617', 'the coffee house', 'The Coffee House Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0618', 'the coffee house', 'The Coffee House Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0619', 'the coffee house', 'The Coffee House Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0620', 'phuc long', 'Phúc Long TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0621', 'phuc long', 'Phúc Long Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0622', 'phuc long', 'Phúc Long Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0623', 'phuc long', 'Phúc Long Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0624', 'phuc long', 'Phúc Long Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0625', 'cong ca phê', 'Cộng Cà Phê TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0626', 'cong ca phê', 'Cộng Cà Phê Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0627', 'cong ca phê', 'Cộng Cà Phê Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0628', 'cong ca phê', 'Cộng Cà Phê Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0629', 'cong ca phê', 'Cộng Cà Phê Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0630', 'starbucks', 'Starbucks TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0631', 'starbucks', 'Starbucks Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0632', 'starbucks', 'Starbucks Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0633', 'starbucks', 'Starbucks Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0634', 'starbucks', 'Starbucks Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0635', 'trung nguyên legend', 'Trung Nguyên Legend TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0636', 'trung nguyên legend', 'Trung Nguyên Legend Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0637', 'trung nguyên legend', 'Trung Nguyên Legend Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0638', 'trung nguyên legend', 'Trung Nguyên Legend Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0639', 'trung nguyên legend', 'Trung Nguyên Legend Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0640', 'katinat', 'Katinat TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0641', 'katinat', 'Katinat Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0642', 'katinat', 'Katinat Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0643', 'katinat', 'Katinat Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0644', 'katinat', 'Katinat Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0645', 'cheese coffee', 'Cheese Coffee TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0646', 'cheese coffee', 'Cheese Coffee Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0647', 'cheese coffee', 'Cheese Coffee Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0648', 'cheese coffee', 'Cheese Coffee Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0649', 'cheese coffee', 'Cheese Coffee Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0650', 'vincom center', 'Vincom Center TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0651', 'vincom center', 'Vincom Center Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0652', 'vincom center', 'Vincom Center Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0653', 'vincom center', 'Vincom Center Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0654', 'vincom center', 'Vincom Center Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0655', 'aeon mall', 'AEON Mall TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0656', 'aeon mall', 'AEON Mall Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0657', 'aeon mall', 'AEON Mall Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0658', 'aeon mall', 'AEON Mall Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0659', 'aeon mall', 'AEON Mall Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0660', 'lotte mart', 'Lotte Mart TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0661', 'lotte mart', 'Lotte Mart Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0662', 'lotte mart', 'Lotte Mart Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0663', 'lotte mart', 'Lotte Mart Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0664', 'lotte mart', 'Lotte Mart Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0665', 'go!', 'GO! TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0666', 'go!', 'GO! Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0667', 'go!', 'GO! Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0668', 'go!', 'GO! Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0669', 'go!', 'GO! Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0670', 'big c', 'Big C TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0671', 'big c', 'Big C Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0672', 'big c', 'Big C Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0673', 'big c', 'Big C Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0674', 'big c', 'Big C Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0675', 'crescent mall', 'Crescent Mall TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0676', 'crescent mall', 'Crescent Mall Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0677', 'crescent mall', 'Crescent Mall Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0678', 'crescent mall', 'Crescent Mall Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0679', 'crescent mall', 'Crescent Mall Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0680', 'takashimaya', 'Takashimaya TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0681', 'takashimaya', 'Takashimaya Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0682', 'takashimaya', 'Takashimaya Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0683', 'takashimaya', 'Takashimaya Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0684', 'takashimaya', 'Takashimaya Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0685', 'vietcombank', 'Vietcombank TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0686', 'vietcombank', 'Vietcombank Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0687', 'vietcombank', 'Vietcombank Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0688', 'vietcombank', 'Vietcombank Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0689', 'vietcombank', 'Vietcombank Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0690', 'bidv', 'BIDV TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0691', 'bidv', 'BIDV Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0692', 'bidv', 'BIDV Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0693', 'bidv', 'BIDV Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0694', 'bidv', 'BIDV Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0695', 'techcombank', 'Techcombank TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0696', 'techcombank', 'Techcombank Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0697', 'techcombank', 'Techcombank Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0698', 'techcombank', 'Techcombank Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0699', 'techcombank', 'Techcombank Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0700', 'mb bank', 'MB Bank TP.HCM', 'Brand Search', 0.600, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM0701', 'mb bank', 'MB Bank Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0702', 'mb bank', 'MB Bank Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0703', 'mb bank', 'MB Bank Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0704', 'mb bank', 'MB Bank Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0705', 'acb', 'ACB TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0706', 'acb', 'ACB Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0707', 'acb', 'ACB Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0708', 'acb', 'ACB Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0709', 'acb', 'ACB Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0710', 'agribank', 'Agribank TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0711', 'agribank', 'Agribank Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0712', 'agribank', 'Agribank Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0713', 'agribank', 'Agribank Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0714', 'agribank', 'Agribank Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0715', 'tpbank', 'TPBank TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0716', 'tpbank', 'TPBank Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0717', 'tpbank', 'TPBank Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0718', 'tpbank', 'TPBank Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0719', 'tpbank', 'TPBank Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0720', 'vpbank', 'VPBank TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0721', 'vpbank', 'VPBank Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0722', 'vpbank', 'VPBank Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0723', 'vpbank', 'VPBank Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0724', 'vpbank', 'VPBank Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0725', 'sacombank', 'Sacombank TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0726', 'sacombank', 'Sacombank Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0727', 'sacombank', 'Sacombank Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0728', 'sacombank', 'Sacombank Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0729', 'sacombank', 'Sacombank Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0730', 'pizza 4p''s', 'Pizza 4P''s TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0731', 'pizza 4p''s', 'Pizza 4P''s Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0732', 'pizza 4p''s', 'Pizza 4P''s Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0733', 'pizza 4p''s', 'Pizza 4P''s Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0734', 'pizza 4p''s', 'Pizza 4P''s Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0735', 'lotteria', 'Lotteria TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0736', 'lotteria', 'Lotteria Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0737', 'lotteria', 'Lotteria Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0738', 'lotteria', 'Lotteria Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0739', 'lotteria', 'Lotteria Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0740', 'kfc', 'KFC TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0741', 'kfc', 'KFC Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0742', 'kfc', 'KFC Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0743', 'kfc', 'KFC Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0744', 'kfc', 'KFC Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0745', 'jollibee', 'Jollibee TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0746', 'jollibee', 'Jollibee Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0747', 'jollibee', 'Jollibee Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0748', 'jollibee', 'Jollibee Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0749', 'jollibee', 'Jollibee Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0750', 'mcdonald''s', 'McDonald''s TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0751', 'mcdonald''s', 'McDonald''s Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0752', 'mcdonald''s', 'McDonald''s Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0753', 'mcdonald''s', 'McDonald''s Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0754', 'mcdonald''s', 'McDonald''s Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0755', 'burger king', 'Burger King TP.HCM', 'Brand Search', 0.600, NULL, true)
,
('LLM0756', 'burger king', 'Burger King Hà Nội', 'Brand Search', 0.600, NULL, true)
,
('LLM0757', 'burger king', 'Burger King Đà Nẵng', 'Brand Search', 0.600, NULL, true)
,
('LLM0758', 'burger king', 'Burger King Hải Phòng', 'Brand Search', 0.600, NULL, true)
,
('LLM0759', 'burger king', 'Burger King Cần Thơ', 'Brand Search', 0.600, NULL, true)
,
('LLM0760', 'highlands coffee', 'Highlands Coffee Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0761', 'highlands coffee', 'Highlands Coffee Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0762', 'highlands coffee', 'Highlands Coffee Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0763', 'highlands coffee', 'Highlands Coffee Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0764', 'highlands coffee', 'Highlands Coffee Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0765', 'highlands coffee', 'Highlands Coffee Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0766', 'highlands coffee', 'Highlands Coffee Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0767', 'highlands coffee', 'Highlands Coffee Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0768', 'the coffee house', 'The Coffee House Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0769', 'the coffee house', 'The Coffee House Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0770', 'the coffee house', 'The Coffee House Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0771', 'the coffee house', 'The Coffee House Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0772', 'the coffee house', 'The Coffee House Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0773', 'the coffee house', 'The Coffee House Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0774', 'the coffee house', 'The Coffee House Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0775', 'the coffee house', 'The Coffee House Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0776', 'phuc long', 'Phúc Long Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0777', 'phuc long', 'Phúc Long Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0778', 'phuc long', 'Phúc Long Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0779', 'phuc long', 'Phúc Long Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0780', 'phuc long', 'Phúc Long Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0781', 'phuc long', 'Phúc Long Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0782', 'phuc long', 'Phúc Long Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0783', 'phuc long', 'Phúc Long Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0784', 'cong ca phê', 'Cộng Cà Phê Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0785', 'cong ca phê', 'Cộng Cà Phê Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0786', 'cong ca phê', 'Cộng Cà Phê Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0787', 'cong ca phê', 'Cộng Cà Phê Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0788', 'cong ca phê', 'Cộng Cà Phê Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0789', 'cong ca phê', 'Cộng Cà Phê Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0790', 'cong ca phê', 'Cộng Cà Phê Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0791', 'cong ca phê', 'Cộng Cà Phê Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0792', 'starbucks', 'Starbucks Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0793', 'starbucks', 'Starbucks Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0794', 'starbucks', 'Starbucks Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0795', 'starbucks', 'Starbucks Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0796', 'starbucks', 'Starbucks Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0797', 'starbucks', 'Starbucks Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0798', 'starbucks', 'Starbucks Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0799', 'starbucks', 'Starbucks Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0800', 'trung nguyên legend', 'Trung Nguyên Legend Quận 1', 'Brand Search', 0.600, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM0801', 'trung nguyên legend', 'Trung Nguyên Legend Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0802', 'trung nguyên legend', 'Trung Nguyên Legend Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0803', 'trung nguyên legend', 'Trung Nguyên Legend Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0804', 'trung nguyên legend', 'Trung Nguyên Legend Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0805', 'trung nguyên legend', 'Trung Nguyên Legend Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0806', 'trung nguyên legend', 'Trung Nguyên Legend Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0807', 'trung nguyên legend', 'Trung Nguyên Legend Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0808', 'katinat', 'Katinat Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0809', 'katinat', 'Katinat Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0810', 'katinat', 'Katinat Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0811', 'katinat', 'Katinat Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0812', 'katinat', 'Katinat Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0813', 'katinat', 'Katinat Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0814', 'katinat', 'Katinat Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0815', 'katinat', 'Katinat Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0816', 'cheese coffee', 'Cheese Coffee Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0817', 'cheese coffee', 'Cheese Coffee Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0818', 'cheese coffee', 'Cheese Coffee Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0819', 'cheese coffee', 'Cheese Coffee Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0820', 'cheese coffee', 'Cheese Coffee Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0821', 'cheese coffee', 'Cheese Coffee Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0822', 'cheese coffee', 'Cheese Coffee Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0823', 'cheese coffee', 'Cheese Coffee Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0824', 'vincom center', 'Vincom Center Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0825', 'vincom center', 'Vincom Center Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0826', 'vincom center', 'Vincom Center Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0827', 'vincom center', 'Vincom Center Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0828', 'vincom center', 'Vincom Center Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0829', 'vincom center', 'Vincom Center Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0830', 'vincom center', 'Vincom Center Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0831', 'vincom center', 'Vincom Center Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0832', 'aeon mall', 'AEON Mall Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0833', 'aeon mall', 'AEON Mall Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0834', 'aeon mall', 'AEON Mall Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0835', 'aeon mall', 'AEON Mall Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0836', 'aeon mall', 'AEON Mall Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0837', 'aeon mall', 'AEON Mall Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0838', 'aeon mall', 'AEON Mall Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0839', 'aeon mall', 'AEON Mall Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0840', 'lotte mart', 'Lotte Mart Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0841', 'lotte mart', 'Lotte Mart Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0842', 'lotte mart', 'Lotte Mart Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0843', 'lotte mart', 'Lotte Mart Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0844', 'lotte mart', 'Lotte Mart Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0845', 'lotte mart', 'Lotte Mart Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0846', 'lotte mart', 'Lotte Mart Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0847', 'lotte mart', 'Lotte Mart Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0848', 'go!', 'GO! Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0849', 'go!', 'GO! Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0850', 'go!', 'GO! Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0851', 'go!', 'GO! Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0852', 'go!', 'GO! Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0853', 'go!', 'GO! Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0854', 'go!', 'GO! Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0855', 'go!', 'GO! Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0856', 'big c', 'Big C Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0857', 'big c', 'Big C Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0858', 'big c', 'Big C Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0859', 'big c', 'Big C Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0860', 'big c', 'Big C Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0861', 'big c', 'Big C Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0862', 'big c', 'Big C Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0863', 'big c', 'Big C Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0864', 'crescent mall', 'Crescent Mall Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0865', 'crescent mall', 'Crescent Mall Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0866', 'crescent mall', 'Crescent Mall Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0867', 'crescent mall', 'Crescent Mall Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0868', 'crescent mall', 'Crescent Mall Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0869', 'crescent mall', 'Crescent Mall Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0870', 'crescent mall', 'Crescent Mall Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0871', 'crescent mall', 'Crescent Mall Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0872', 'takashimaya', 'Takashimaya Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0873', 'takashimaya', 'Takashimaya Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0874', 'takashimaya', 'Takashimaya Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0875', 'takashimaya', 'Takashimaya Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0876', 'takashimaya', 'Takashimaya Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0877', 'takashimaya', 'Takashimaya Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0878', 'takashimaya', 'Takashimaya Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0879', 'takashimaya', 'Takashimaya Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0880', 'vietcombank', 'Vietcombank Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0881', 'vietcombank', 'Vietcombank Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0882', 'vietcombank', 'Vietcombank Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0883', 'vietcombank', 'Vietcombank Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0884', 'vietcombank', 'Vietcombank Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0885', 'vietcombank', 'Vietcombank Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0886', 'vietcombank', 'Vietcombank Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0887', 'vietcombank', 'Vietcombank Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0888', 'bidv', 'BIDV Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0889', 'bidv', 'BIDV Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0890', 'bidv', 'BIDV Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0891', 'bidv', 'BIDV Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0892', 'bidv', 'BIDV Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0893', 'bidv', 'BIDV Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0894', 'bidv', 'BIDV Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0895', 'bidv', 'BIDV Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0896', 'techcombank', 'Techcombank Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0897', 'techcombank', 'Techcombank Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0898', 'techcombank', 'Techcombank Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0899', 'techcombank', 'Techcombank Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0900', 'techcombank', 'Techcombank Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM0901', 'techcombank', 'Techcombank Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0902', 'techcombank', 'Techcombank Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0903', 'techcombank', 'Techcombank Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0904', 'mb bank', 'MB Bank Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0905', 'mb bank', 'MB Bank Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0906', 'mb bank', 'MB Bank Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0907', 'mb bank', 'MB Bank Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0908', 'mb bank', 'MB Bank Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0909', 'mb bank', 'MB Bank Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0910', 'mb bank', 'MB Bank Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0911', 'mb bank', 'MB Bank Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0912', 'acb', 'ACB Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0913', 'acb', 'ACB Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0914', 'acb', 'ACB Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0915', 'acb', 'ACB Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0916', 'acb', 'ACB Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0917', 'acb', 'ACB Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0918', 'acb', 'ACB Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0919', 'acb', 'ACB Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0920', 'agribank', 'Agribank Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0921', 'agribank', 'Agribank Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0922', 'agribank', 'Agribank Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0923', 'agribank', 'Agribank Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0924', 'agribank', 'Agribank Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0925', 'agribank', 'Agribank Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0926', 'agribank', 'Agribank Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0927', 'agribank', 'Agribank Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0928', 'tpbank', 'TPBank Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0929', 'tpbank', 'TPBank Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0930', 'tpbank', 'TPBank Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0931', 'tpbank', 'TPBank Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0932', 'tpbank', 'TPBank Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0933', 'tpbank', 'TPBank Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0934', 'tpbank', 'TPBank Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0935', 'tpbank', 'TPBank Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0936', 'vpbank', 'VPBank Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0937', 'vpbank', 'VPBank Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0938', 'vpbank', 'VPBank Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0939', 'vpbank', 'VPBank Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0940', 'vpbank', 'VPBank Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0941', 'vpbank', 'VPBank Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0942', 'vpbank', 'VPBank Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0943', 'vpbank', 'VPBank Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0944', 'sacombank', 'Sacombank Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0945', 'sacombank', 'Sacombank Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0946', 'sacombank', 'Sacombank Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0947', 'sacombank', 'Sacombank Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0948', 'sacombank', 'Sacombank Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0949', 'sacombank', 'Sacombank Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0950', 'sacombank', 'Sacombank Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0951', 'sacombank', 'Sacombank Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0952', 'pizza 4p''s', 'Pizza 4P''s Quận 1', 'Brand Search', 0.600, NULL, true)
,
('LLM0953', 'pizza 4p''s', 'Pizza 4P''s Quận 2', 'Brand Search', 0.600, NULL, true)
,
('LLM0954', 'pizza 4p''s', 'Pizza 4P''s Quận 3', 'Brand Search', 0.600, NULL, true)
,
('LLM0955', 'pizza 4p''s', 'Pizza 4P''s Quận 5', 'Brand Search', 0.600, NULL, true)
,
('LLM0956', 'pizza 4p''s', 'Pizza 4P''s Hoàn Kiếm', 'Brand Search', 0.600, NULL, true)
,
('LLM0957', 'pizza 4p''s', 'Pizza 4P''s Ba Đình', 'Brand Search', 0.600, NULL, true)
,
('LLM0958', 'pizza 4p''s', 'Pizza 4P''s Đống Đa', 'Brand Search', 0.600, NULL, true)
,
('LLM0959', 'pizza 4p''s', 'Pizza 4P''s Hai Bà Trưng', 'Brand Search', 0.600, NULL, true)
,
('LLM0960', 'tp.hcm', 'TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0961', 'ha noi', 'Hà Nội', 'Location Search', 0.500, NULL, true)
,
('LLM0962', 'da nang', 'Đà Nẵng', 'Location Search', 0.500, NULL, true)
,
('LLM0963', 'hai phong', 'Hải Phòng', 'Location Search', 0.500, NULL, true)
,
('LLM0964', 'can thơ', 'Cần Thơ', 'Location Search', 0.500, NULL, true)
,
('LLM0965', 'nha trang', 'Nha Trang', 'Location Search', 0.500, NULL, true)
,
('LLM0966', 'da lat', 'Đà Lạt', 'Location Search', 0.500, NULL, true)
,
('LLM0967', 'vung tau', 'Vũng Tàu', 'Location Search', 0.500, NULL, true)
,
('LLM0968', 'phu quoc', 'Phú Quốc', 'Location Search', 0.500, NULL, true)
,
('LLM0969', 'hoi an', 'Hội An', 'Location Search', 0.500, NULL, true)
,
('LLM0970', 'hue', 'Huế', 'Location Search', 0.500, NULL, true)
,
('LLM0971', 'sapa', 'Sapa', 'Location Search', 0.500, NULL, true)
,
('LLM0972', 'ha long', 'Hạ Long', 'Location Search', 0.500, NULL, true)
,
('LLM0973', 'quy nhơn', 'Quy Nhơn', 'Location Search', 0.500, NULL, true)
,
('LLM0974', 'buôn ma thuot', 'Buôn Ma Thuột', 'Location Search', 0.500, NULL, true)
,
('LLM0975', 'mui ne', 'Mũi Né', 'Location Search', 0.500, NULL, true)
,
('LLM0976', 'ninh binh', 'Ninh Bình', 'Location Search', 0.500, NULL, true)
,
('LLM0977', 'phan thiet', 'Phan Thiết', 'Location Search', 0.500, NULL, true)
,
('LLM0978', 'côn dao', 'Côn Đảo', 'Location Search', 0.500, NULL, true)
,
('LLM0979', 'ca mau', 'Cà Mau', 'Location Search', 0.500, NULL, true)
,
('LLM0980', 'quan 1', 'Quận 1, TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0981', 'quan 2', 'Quận 2, TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0982', 'quan 3', 'Quận 3, TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0983', 'quan 5', 'Quận 5, TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0984', 'quan 7', 'Quận 7, TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0985', 'binh thanh', 'Bình Thạnh, TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0986', 'go vap', 'Gò Vấp, TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0987', 'tân binh', 'Tân Bình, TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0988', 'phu nhuan', 'Phú Nhuận, TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0989', 'thu duc', 'Thủ Đức, TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0990', 'tân phu', 'Tân Phú, TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0991', 'binh tân', 'Bình Tân, TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0992', 'nha be', 'Nhà Bè, TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0993', 'quan 10', 'Quận 10, TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0994', 'quan 4', 'Quận 4, TP.HCM', 'Location Search', 0.500, NULL, true)
,
('LLM0995', 'hoan kiem', 'Hoàn Kiếm, Hà Nội', 'Location Search', 0.500, NULL, true)
,
('LLM0996', 'ba dinh', 'Ba Đình, Hà Nội', 'Location Search', 0.500, NULL, true)
,
('LLM0997', 'dong da', 'Đống Đa, Hà Nội', 'Location Search', 0.500, NULL, true)
,
('LLM0998', 'hai ba trưng', 'Hai Bà Trưng, Hà Nội', 'Location Search', 0.500, NULL, true)
,
('LLM0999', 'cau giay', 'Cầu Giấy, Hà Nội', 'Location Search', 0.500, NULL, true)
,
('LLM1000', 'thanh xuân', 'Thanh Xuân, Hà Nội', 'Location Search', 0.500, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM1001', 'tây ho', 'Tây Hồ, Hà Nội', 'Location Search', 0.500, NULL, true)
,
('LLM1002', 'long biên', 'Long Biên, Hà Nội', 'Location Search', 0.500, NULL, true)
,
('LLM1003', 'hoang mai', 'Hoàng Mai, Hà Nội', 'Location Search', 0.500, NULL, true)
,
('LLM1004', 'ha dông', 'Hà Đông, Hà Nội', 'Location Search', 0.500, NULL, true)
,
('LLM1005', 'nam tu liêm', 'Nam Từ Liêm, Hà Nội', 'Location Search', 0.500, NULL, true)
,
('LLM1006', 'bac tu liêm', 'Bắc Từ Liêm, Hà Nội', 'Location Search', 0.500, NULL, true)
,
('LLM1007', 'hai châu', 'Hải Châu, Đà Nẵng', 'Location Search', 0.500, NULL, true)
,
('LLM1008', 'thanh khê', 'Thanh Khê, Đà Nẵng', 'Location Search', 0.500, NULL, true)
,
('LLM1009', 'sơn tra', 'Sơn Trà, Đà Nẵng', 'Location Search', 0.500, NULL, true)
,
('LLM1010', 'ngu hanh sơn', 'Ngũ Hành Sơn, Đà Nẵng', 'Location Search', 0.500, NULL, true)
,
('LLM1011', 'liên chieu', 'Liên Chiểu, Đà Nẵng', 'Location Search', 0.500, NULL, true)
,
('LLM1012', 'cam le', 'Cẩm Lệ, Đà Nẵng', 'Location Search', 0.500, NULL, true)
,
('LLM1013', 'cho ben thanh', 'Chợ Bến Thành', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1014', 'nha tho duc ba', 'Nhà thờ Đức Bà', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1015', 'bưu dien thanh pho', 'Bưu điện Thành phố', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1016', 'dinh doc lap', 'Dinh Độc Lập', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1017', 'ho gươm', 'Hồ Gươm', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1018', 'lăng bac', 'Lăng Bác', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1019', 'văn mieu quoc tu giam', 'Văn Miếu Quốc Tử Giám', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1020', 'cau rong', 'Cầu Rồng', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1021', 'ba na hills', 'Bà Nà Hills', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1022', 'ngu hanh sơn', 'Ngũ Hành Sơn', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1023', 'pho co hoi an', 'Phố cổ Hội An', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1024', 'cho dong xuân', 'Chợ Đồng Xuân', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1025', 'pho di bo nguyen hue', 'Phố đi bộ Nguyễn Huệ', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1026', 'landmark 81', 'Landmark 81', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1027', 'bitexco financial tower', 'Bitexco Financial Tower', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1028', 'cau vang da nang', 'Cầu Vàng Đà Nẵng', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1029', 'sun world', 'Sun World', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1030', 'vinwonders', 'VinWonders', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1031', 'thao cam viên', 'Thảo Cầm Viên', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1032', 'suoi tiên', 'Suối Tiên', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1033', 'dam sen', 'Đầm Sen', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1034', 'ho tây', 'Hồ Tây', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1035', 'ho hoan kiem', 'Hồ Hoàn Kiếm', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1036', 'sông han', 'Sông Hàn', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1037', 'bai bien my khê', 'Bãi biển Mỹ Khê', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1038', 'bai bien nha trang', 'Bãi biển Nha Trang', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1039', 'bai bien vung tau', 'Bãi biển Vũng Tàu', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1040', 'bai bien phu quoc', 'Bãi biển Phú Quốc', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1041', 'bai dai', 'Bãi Dài', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1042', 'bai sao', 'Bãi Sao', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1043', 'nui ba den', 'Núi Bà Đen', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1044', 'fansipan', 'Fansipan', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1045', 'deo hai vân', 'Đèo Hải Vân', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1046', 'chua mot cot', 'Chùa Một Cột', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1047', 'chua bai dinh', 'Chùa Bái Đính', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1048', 'chua linh ung', 'Chùa Linh Ứng', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1049', 'chua thiên mu', 'Chùa Thiên Mụ', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1050', 'nha tho da sapa', 'Nhà thờ Đá Sapa', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1051', 'nha tho tân dinh', 'Nhà thờ Tân Định', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1052', 'nha tho chinh toa da nang', 'Nhà thờ Chính Tòa Đà Nẵng', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1053', 'nguyen hue', '275 Nguyễn Huệ, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1054', 'lê loi', '99 Lê Lợi, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1055', 'dien biên phu', '364 Điện Biên Phủ, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1056', 'hai ba trưng', '64 Hai Bà Trưng, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1057', 'pasteur', '325 Pasteur, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1058', 'vo nguyên giap', '342 Võ Nguyên Giáp, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1059', 'nguyen trai', '188 Nguyễn Trãi, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1060', 'tran duy hưng', '306 Trần Duy Hưng, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1061', 'phan chu trinh', '225 Phan Chu Trinh, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1062', 'ly thưong kiet', '307 Lý Thường Kiệt, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1063', 'cach mang thang 8', '99 Cách Mạng Tháng 8, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1064', 'nguyen văn linh', '196 Nguyễn Văn Linh, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1065', 'pham văn dong', '198 Phạm Văn Đồng, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1066', 'vo văn kiet', '357 Võ Văn Kiệt, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1067', 'lê văn lương', '268 Lê Văn Lương, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1068', 'nguyen thi minh khai', '33 Nguyễn Thị Minh Khai, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1069', 'tran hưng dao', '21 Trần Hưng Đạo, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1070', 'dong khoi', '390 Đồng Khởi, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1071', 'ham nghi', '169 Hàm Nghi, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1072', 'tôn duc thang', '19 Tôn Đức Thắng, TP.HCM', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1073', 'pho hue', '48 Phố Huế, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1074', 'ba trieu', '222 Bà Triệu, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1075', 'ly thưong kiet', '238 Lý Thường Kiệt, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1076', 'trang thi', '373 Tràng Thi, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1077', 'hang dao', '123 Hàng Đào, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1078', 'hang ngang', '7 Hàng Ngang, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1079', 'hang bông', '175 Hàng Bông, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1080', 'hang gai', '139 Hàng Gai, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1081', 'dưong lang', '311 Đường Láng, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1082', 'nguyen chi thanh', '235 Nguyễn Chí Thanh, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1083', 'kim ma', '92 Kim Mã, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1084', 'giang vo', '86 Giảng Võ, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1085', 'lac long quân', '390 Lạc Long Quân, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1086', 'âu cơ', '291 Âu Cơ, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1087', 'hoang quoc viet', '193 Hoàng Quốc Việt, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1088', 'pham văn dong', '196 Phạm Văn Đồng, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1089', 'giai phong', '30 Giải Phóng, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1090', 'trưong chinh', '73 Trường Chinh, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1091', 'lê văn lương', '132 Lê Văn Lương, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1092', 'to huu', '129 Tố Hữu, Hà Nội', 'Address Suggestion', 0.500, NULL, true)
,
('LLM1093', 'ăn dêm', 'Ăn đêm gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1094', 'cho check-in dep', 'Chỗ check-in đẹp gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1095', 'dia diem hen ho', 'Địa điểm hẹn hò gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1096', 'quan cafe hoc bai', 'Quán cà phê học bài gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1097', 'cafe lam viec', 'Quán cà phê làm việc', 'Discovery Search', 0.450, NULL, true)
,
('LLM1098', 'quan yên tinh', 'Quán cà phê yên tĩnh gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1099', 'ăn gi', 'Ăn gì gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1100', 'uong gi', 'Uống gì gần đây', 'Discovery Search', 0.450, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM1101', 'di dâu', 'Đi đâu cuối tuần', 'Discovery Search', 0.450, NULL, true)
,
('LLM1102', 'ăn trưa', 'Ăn trưa văn phòng gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1103', 'ăn toi', 'Ăn tối ở đâu gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1104', 'ăn sang', 'Quán ăn sáng gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1105', 'quan ngon', 'Quán ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1106', 'cho ăn khuya', 'Chỗ ăn khuya gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1107', 'quan view dep', 'Quán view đẹp gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1108', 'goc check-in', 'Góc check-in sống ảo gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1109', 'cho chup anh', 'Chỗ chụp ảnh đẹp gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1110', 'cafe song ao', 'Quán cà phê sống ảo', 'Discovery Search', 0.450, NULL, true)
,
('LLM1111', 'cafe chill', 'Quán cà phê chill gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1112', 'quan gia dinh', 'Quán ăn gia đình gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1113', 'quan nhom', 'Quán ăn cho nhóm đông', 'Discovery Search', 0.450, NULL, true)
,
('LLM1114', 'quan may lanh', 'Quán ăn có máy lạnh', 'Discovery Search', 0.450, NULL, true)
,
('LLM1115', 'quan dep', 'Quán đẹp gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1116', 'quan hai san', 'Quán hải sản ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1117', 'quan oc', 'Quán ốc ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1118', 'cho nhau', 'Quán nhậu ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1119', 'quan nhau ngon', 'Quán nhậu ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1120', 'cho hat karaoke', 'Quán karaoke gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1121', 'ho bơi', 'Hồ bơi công cộng gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1122', 'sân bong', 'Sân bóng đá gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1123', 'sân tennis', 'Sân tennis gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1124', 'cho tap gym', 'Phòng gym gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1125', 'cho tap yoga', 'Lớp yoga gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1126', 'phong gym 24', 'Phòng gym mở cửa 24/7', 'Discovery Search', 0.450, NULL, true)
,
('LLM1127', 'spa massage', 'Spa massage gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1128', 'lam toc', 'Salon tóc gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1129', 'tiem nail', 'Tiệm nail gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1130', 'giat ui', 'Tiệm giặt ủi gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1131', 'siêu thi gan', 'Siêu thị gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1132', 'cho gan', 'Chợ gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1133', 'nha thuoc gan', 'Nhà thuốc gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1134', 'benh vien gan', 'Bệnh viện gần nhất', 'Discovery Search', 0.450, NULL, true)
,
('LLM1135', 'cây xăng gan', 'Cây xăng gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1136', 'tram xăng gan', 'Trạm xăng gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1137', 'tram sac', 'Trạm sạc xe điện gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1138', 'rua xe', 'Tiệm rửa xe gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1139', 'sua xe', 'Tiệm sửa xe máy gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1140', 'atm gan', 'ATM gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1141', 'ngân hang gan', 'Ngân hàng gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1142', 'khach san gan', 'Khách sạn gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1143', 'homestay gan', 'Homestay gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1144', 'resort gan', 'Resort gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1145', 'công viên gan', 'Công viên gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1146', 'khu vui chơi gan', 'Khu vui chơi gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1147', 'rap phim', 'Rạp chiếu phim gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1148', 'ăn chay', 'Quán chay gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1149', 'halal', 'Nhà hàng halal gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1150', 'do ăn vat', 'Quán ăn vặt gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1151', 'ăn vat', 'Quán ăn vặt gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1152', 'tra sua gan', 'Trà sữa gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1153', 'tra sua ngon', 'Trà sữa ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1154', 'pho gan', 'Phở gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1155', 'cơm tam gan', 'Cơm tấm gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1156', 'banh mi gan', 'Bánh mì gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1157', 'chao', 'Cháo dinh dưỡng gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1158', 'lau', 'Quán lẩu gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1159', 'buffet gan', 'Buffet gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1160', 'quan nưong gan', 'Quán nướng gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1161', 'thu cưng', 'Bệnh viện thú y gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1162', 'spa thu cưng', 'Spa thú cưng gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1163', 'cafe meo', 'Cat cafe gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1164', 'cafe cho', 'Dog cafe gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1165', 'khach san thu cưng', 'Khách sạn cho thú cưng gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1166', 'sân bay gan', 'Sân bay gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1167', 'ben xe gan', 'Bến xe gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1168', 'ga tau', 'Ga tàu hỏa gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1169', 'hieu sach', 'Nhà sách gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1170', 'quan net', 'Quán net gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1171', 'pubg mobile', 'Quán net pubg mobile gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1172', 'chi dưong', 'Chỉ đường đến sân bay Nội Bài', 'Navigation', 0.400, NULL, true)
,
('LLM1173', 'chi dưong', 'Chỉ đường đến sân bay Tân Sơn Nhất', 'Navigation', 0.400, NULL, true)
,
('LLM1174', 'chi dưong', 'Chỉ đường đến Chợ Bến Thành', 'Navigation', 0.400, NULL, true)
,
('LLM1175', 'chi dưong', 'Chỉ đường đến Hồ Gươm', 'Navigation', 0.400, NULL, true)
,
('LLM1176', 'chi dưong', 'Chỉ đường đến Phố đi bộ Nguyễn Huệ', 'Navigation', 0.400, NULL, true)
,
('LLM1177', 'chi dưong', 'Chỉ đường đến Landmark 81', 'Navigation', 0.400, NULL, true)
,
('LLM1178', 'chi dưong', 'Chỉ đường đến Vincom Center', 'Navigation', 0.400, NULL, true)
,
('LLM1179', 'chi dưong', 'Chỉ đường đến AEON Mall', 'Navigation', 0.400, NULL, true)
,
('LLM1180', 'chi dưong', 'Chỉ đường đến Bãi biển Mỹ Khê', 'Navigation', 0.400, NULL, true)
,
('LLM1181', 'chi dưong', 'Chỉ đường đến Bà Nà Hills', 'Navigation', 0.400, NULL, true)
,
('LLM1182', 'chi dưong', 'Chỉ đường đến Phố cổ Hội An', 'Navigation', 0.400, NULL, true)
,
('LLM1183', 'chi dưong', 'Chỉ đường đến Đà Lạt', 'Navigation', 0.400, NULL, true)
,
('LLM1184', 'dưong den', 'Đường đến sân bay Nội Bài', 'Navigation', 0.400, NULL, true)
,
('LLM1185', 'dưong den', 'Đường đến sân bay Tân Sơn Nhất', 'Navigation', 0.400, NULL, true)
,
('LLM1186', 'dưong den', 'Đường đến Chợ Bến Thành', 'Navigation', 0.400, NULL, true)
,
('LLM1187', 'dưong den', 'Đường đến Hồ Gươm', 'Navigation', 0.400, NULL, true)
,
('LLM1188', 'dưong den', 'Đường đến Phố đi bộ Nguyễn Huệ', 'Navigation', 0.400, NULL, true)
,
('LLM1189', 'dưong den', 'Đường đến Landmark 81', 'Navigation', 0.400, NULL, true)
,
('LLM1190', 'dưong den', 'Đường đến Vincom Center', 'Navigation', 0.400, NULL, true)
,
('LLM1191', 'dưong den', 'Đường đến AEON Mall', 'Navigation', 0.400, NULL, true)
,
('LLM1192', 'coffee gan', 'coffee gần đây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1193', 'hotel da', 'hotel Đà Nẵng', 'Discovery Search', 0.480, NULL, true)
,
('LLM1194', 'atm near', 'atm near me', 'Discovery Search', 0.480, NULL, true)
,
('LLM1195', 'hospital gan', 'hospital gần đây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1196', 'pharmacy near', 'pharmacy near me', 'Discovery Search', 0.480, NULL, true)
,
('LLM1197', 'restaurant gan', 'restaurant gần đây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1198', 'spa near', 'spa near me', 'Discovery Search', 0.480, NULL, true)
,
('LLM1199', 'gym gan', 'gym gần đây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1200', 'supermarket gan', 'supermarket gần đây', 'Discovery Search', 0.480, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM1201', 'bank gan', 'bank gần đây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1202', 'gas station', 'gas station gần đây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1203', 'airport gan', 'airport gần đây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1204', 'bus station', 'bus station gần đây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1205', 'train station', 'train station Hà Nội', 'Discovery Search', 0.480, NULL, true)
,
('LLM1206', 'beach da', 'beach Đà Nẵng', 'Discovery Search', 0.480, NULL, true)
,
('LLM1207', 'mountain sapa', 'mountain Sapa', 'Discovery Search', 0.480, NULL, true)
,
('LLM1208', 'lake ho', 'lake Hồ Tây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1209', 'park gan', 'park gần đây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1210', 'pho near', 'pho near me', 'Discovery Search', 0.480, NULL, true)
,
('LLM1211', 'banh mi', 'banh mi near me', 'Discovery Search', 0.480, NULL, true)
,
('LLM1212', 'vegetarian restaurant', 'vegetarian restaurant Hà Nội', 'Discovery Search', 0.480, NULL, true)
,
('LLM1213', 'vegan ho', 'vegan Hồ Chí Minh', 'Discovery Search', 0.480, NULL, true)
,
('LLM1214', 'rooftop bar', 'rooftop bar Sài Gòn', 'Discovery Search', 0.480, NULL, true)
,
('LLM1215', 'cocktail bar', 'cocktail bar Đà Nẵng', 'Discovery Search', 0.480, NULL, true)
,
('LLM1216', 'hostel gan', 'hostel gần đây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1217', 'backpacker ha', 'backpacker Hà Nội', 'Discovery Search', 0.480, NULL, true)
,
('LLM1218', 'homestay da', 'homestay Đà Lạt', 'Discovery Search', 0.480, NULL, true)
,
('LLM1219', 'massage near', 'massage near me', 'Discovery Search', 0.480, NULL, true)
,
('LLM1220', 'laundry gan', 'laundry gần đây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1221', 'coffee shop', 'coffee shop wifi Hà Nội', 'Discovery Search', 0.480, NULL, true)
,
('LLM1222', 'best coffee', 'best coffee Sài Gòn', 'Discovery Search', 0.480, NULL, true)
,
('LLM1223', 'ăn gi', 'ăn gì gần đây', 'Discovery Search', 0.420, NULL, true)
,
('LLM1224', 'uong gi', 'uống gì gần đây', 'Discovery Search', 0.420, NULL, true)
,
('LLM1225', 'di dâu', 'đi đâu cuối tuần', 'Discovery Search', 0.420, NULL, true)
,
('LLM1226', 'cho check-in', 'chỗ check-in đẹp', 'Discovery Search', 0.420, NULL, true)
,
('LLM1227', 'dia diem', 'địa điểm hẹn hò', 'Discovery Search', 0.420, NULL, true)
,
('LLM1228', 'quan ngon', 'quán ngon gần đây', 'Discovery Search', 0.420, NULL, true)
,
('LLM1229', 'cho ăn', 'chỗ ăn sáng ngon', 'Discovery Search', 0.420, NULL, true)
,
('LLM1230', 'ăn trưa', 'ăn trưa văn phòng', 'Discovery Search', 0.420, NULL, true)
,
('LLM1231', 'ăn toi', 'ăn tối ở đâu', 'Discovery Search', 0.420, NULL, true)
,
('LLM1232', 'ca phê', 'cà phê làm việc', 'Discovery Search', 0.420, NULL, true)
,
('LLM1233', 'quan yên', 'quán yên tĩnh học bài', 'Discovery Search', 0.420, NULL, true)
,
('LLM1234', 'cho do', 'chỗ đổ xăng gần nhất', 'Discovery Search', 0.420, NULL, true)
,
('LLM1235', 'xăng trên', 'xăng trên đường đi', 'Discovery Search', 0.420, NULL, true)
,
('LLM1236', 'tram dung', 'trạm dừng chân trên cao tốc', 'Discovery Search', 0.420, NULL, true)
,
('LLM1237', 'bai do', 'bãi đỗ xe gần đây', 'Discovery Search', 0.420, NULL, true)
,
('LLM1238', 'quan co', 'quán có wifi mạnh', 'Discovery Search', 0.420, NULL, true)
,
('LLM1239', 'goc check-in', 'góc check-in sống ảo', 'Discovery Search', 0.420, NULL, true)
,
('LLM1240', 'cho ăn', 'chỗ ăn khuya', 'Discovery Search', 0.420, NULL, true)
,
('LLM1241', 'ăn dêm', 'ăn đêm Sài Gòn', 'Discovery Search', 0.420, NULL, true)
,
('LLM1242', 'ăn dêm', 'ăn đêm Hà Nội', 'Discovery Search', 0.420, NULL, true)
,
('LLM1243', 'cho ngoi', 'chỗ ngồi chill cuối tuần', 'Discovery Search', 0.420, NULL, true)
,
('LLM1244', 'quan view', 'quán view đẹp', 'Discovery Search', 0.420, NULL, true)
,
('LLM1245', 'quan pubg', 'quán pubg mobile', 'Discovery Search', 0.420, NULL, true)
,
('LLM1246', 'quan net', 'quán net gần đây', 'Discovery Search', 0.420, NULL, true)
,
('LLM1247', 'siêu thi', 'siêu thị mở cửa muộn', 'Discovery Search', 0.420, NULL, true)
,
('LLM1248', 'nha thuoc', 'nhà thuốc 24h', 'Discovery Search', 0.420, NULL, true)
,
('LLM1249', 'phong gym', 'phòng gym tháng rẻ', 'Discovery Search', 0.420, NULL, true)
,
('LLM1250', 'sân bong', 'sân bóng đá gần đây', 'Discovery Search', 0.420, NULL, true)
,
('LLM1251', 'ho bơi', 'hồ bơi công cộng', 'Discovery Search', 0.420, NULL, true)
,
('LLM1252', 'sân tennis', 'sân tennis gần đây', 'Discovery Search', 0.420, NULL, true)
,
('LLM1253', 'benh vien', 'bệnh viện thú y gần đây', 'Discovery Search', 0.420, NULL, true)
,
('LLM1254', 'spa thu', 'spa thú cưng', 'Discovery Search', 0.420, NULL, true)
,
('LLM1255', 'ben thanh', 'Chợ Bến Thành', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1256', 'nha tho duc', 'Nhà thờ Đức Bà', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1257', 'ho gươm', 'Hồ Gươm (Hồ Hoàn Kiếm)', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1258', 'lăng bac', 'Lăng Chủ tịch Hồ Chí Minh', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1259', 'văn mieu', 'Văn Miếu Quốc Tử Giám', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1260', 'cau rong', 'Cầu Rồng, Đà Nẵng', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1261', 'ba na', 'Bà Nà Hills', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1262', 'landmark 81', 'Landmark 81, TP.HCM', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1263', 'bitexco', 'Bitexco Financial Tower', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1264', 'cau vang', 'Cầu Vàng, Đà Nẵng', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1265', 'suoi tiên', 'Khu du lịch Suối Tiên', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1266', 'dam sen', 'Công viên nước Đầm Sen', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1267', 'thao cam viên', 'Thảo Cầm Viên, TP.HCM', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1268', 'ho tây', 'Hồ Tây, Hà Nội', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1269', 'chua mot cot', 'Chùa Một Cột, Hà Nội', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1270', 'chua bai dinh', 'Chùa Bái Đính, Ninh Bình', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1271', 'chua linh ung', 'Chùa Linh Ứng, Đà Nẵng', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1272', 'chua thiên mu', 'Chùa Thiên Mụ, Huế', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1273', 'fansipan', 'Đỉnh Fansipan, Sapa', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1274', 'nui ba den', 'Núi Bà Đen, Tây Ninh', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1275', 'vinwonders', 'VinWonders Nha Trang', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1276', 'sun world', 'Sun World Bà Nà Hills', 'POI Suggestion', 0.950, NULL, true)
,
('LLM1277', 'công viên nưoc', 'Công viên nước gần đây', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1278', 'q1', 'Quận 1, TP.HCM', 'Location Search', 0.550, NULL, true)
,
('LLM1279', 'q7', 'Quận 7, TP.HCM', 'Location Search', 0.550, NULL, true)
,
('LLM1280', 'ks', 'Khách sạn gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM1281', 'bv', 'Bệnh viện gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM1282', 'vcb', 'Vietcombank gần đây', 'Brand Search', 0.550, NULL, true)
,
('LLM1283', 'dh', 'Đại học gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM1284', 'sg', 'Sài Gòn', 'Location Search', 0.550, NULL, true)
,
('LLM1285', 'tsn', 'Sân bay Tân Sơn Nhất', 'POI Suggestion', 0.550, NULL, true)
,
('LLM1286', 'nb', 'Sân bay Nội Bài', 'POI Suggestion', 0.550, NULL, true)
,
('LLM1287', 'cf', 'Cà phê gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM1288', 'bidv', 'BIDV gần đây', 'Brand Search', 0.550, NULL, true)
,
('LLM1289', 'tcb', 'Techcombank gần đây', 'Brand Search', 0.550, NULL, true)
,
('LLM1290', 'hn', 'Hà Nội', 'Location Search', 0.550, NULL, true)
,
('LLM1291', 'dn', 'Đà Nẵng', 'Location Search', 0.550, NULL, true)
,
('LLM1292', 'hp', 'Hải Phòng', 'Location Search', 0.550, NULL, true)
,
('LLM1293', 'ct', 'Cần Thơ', 'Location Search', 0.550, NULL, true)
,
('LLM1294', 'nt', 'Nha Trang', 'Location Search', 0.550, NULL, true)
,
('LLM1295', 'dl', 'Đà Lạt', 'Location Search', 0.550, NULL, true)
,
('LLM1296', 'vt', 'Vũng Tàu', 'Location Search', 0.550, NULL, true)
,
('LLM1297', 'pq', 'Phú Quốc', 'Location Search', 0.550, NULL, true)
,
('LLM1298', 'ha', 'Hội An', 'Location Search', 0.550, NULL, true)
,
('LLM1299', 'sgn', 'Sài Gòn', 'Location Search', 0.550, NULL, true)
,
('LLM1300', 'hcm', 'TP.HCM', 'Location Search', 0.550, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM1301', 'pl', 'Phúc Long gần đây', 'Brand Search', 0.550, NULL, true)
,
('LLM1302', 'bx', 'Bến xe gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM1303', 'cxn', 'Cây xăng gần đây', 'Nearby Search', 0.550, NULL, true)
,
('LLM1304', 'st', 'Siêu thị gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM1305', 'nt', 'Nhà thuốc gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM1306', 'pk', 'Phòng khám gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM1307', 'nk', 'Nha khoa gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM1308', 'nh', 'Ngân hàng gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM1309', 'tp', 'Tiệm bánh gần đây', 'Category Search', 0.550, NULL, true)
,
('LLM1310', 'cafe wifi quan 1', 'Quán cà phê có wifi Quận 1', 'Discovery Search', 0.480, NULL, true)
,
('LLM1311', 'cafe yên tinh quan 1', 'Quán cà phê yên tĩnh Quận 1', 'Discovery Search', 0.480, NULL, true)
,
('LLM1312', 'cafe view dep sai gon', 'Quán cà phê view đẹp Sài Gòn', 'Discovery Search', 0.480, NULL, true)
,
('LLM1313', 'cafe dep ha noi', 'Quán cà phê đẹp Hà Nội', 'Discovery Search', 0.480, NULL, true)
,
('LLM1314', 'cafe hoc bai ha noi', 'Quán cà phê học bài Hà Nội', 'Discovery Search', 0.480, NULL, true)
,
('LLM1315', 'cafe lam viec tphcm', 'Quán cà phê làm việc TP.HCM', 'Discovery Search', 0.480, NULL, true)
,
('LLM1316', 'khach san gan bien da nang', 'Khách sạn gần biển Đà Nẵng', 'Discovery Search', 0.480, NULL, true)
,
('LLM1317', 'khach san gan bien nha trang', 'Khách sạn gần biển Nha Trang', 'Discovery Search', 0.480, NULL, true)
,
('LLM1318', 'khach san gia re da nang', 'Khách sạn giá rẻ Đà Nẵng', 'Discovery Search', 0.480, NULL, true)
,
('LLM1319', 'khach san sang trong ha noi', 'Khách sạn sang trọng Hà Nội', 'Discovery Search', 0.480, NULL, true)
,
('LLM1320', 'homestay dep da lat', 'Homestay đẹp Đà Lạt', 'Discovery Search', 0.480, NULL, true)
,
('LLM1321', 'homestay view dep da lat', 'Homestay view đẹp Đà Lạt', 'Discovery Search', 0.480, NULL, true)
,
('LLM1322', 'resort gan ha noi', 'Resort gần Hà Nội', 'Discovery Search', 0.480, NULL, true)
,
('LLM1323', 'nha hang gia dinh quan 7', 'Nhà hàng gia đình Quận 7', 'Discovery Search', 0.480, NULL, true)
,
('LLM1324', 'nha hang hen ho quan 1', 'Nhà hàng hẹn hò Quận 1', 'Discovery Search', 0.480, NULL, true)
,
('LLM1325', 'nha hang hai san da nang', 'Nhà hàng hải sản Đà Nẵng', 'Discovery Search', 0.480, NULL, true)
,
('LLM1326', 'quan nhau quan 1', 'Quán nhậu ngon Quận 1', 'Discovery Search', 0.480, NULL, true)
,
('LLM1327', 'quan nhau binh thanh', 'Quán nhậu Bình Thạnh', 'Discovery Search', 0.480, NULL, true)
,
('LLM1328', 'tra sua ngon quan 1', 'Trà sữa ngon Quận 1', 'Discovery Search', 0.480, NULL, true)
,
('LLM1329', 'tra sua gan dây sai gon', 'Trà sữa gần đây Sài Gòn', 'Discovery Search', 0.480, NULL, true)
,
('LLM1330', 'bun bo hue sai gon', 'Bún bò Huế ngon Sài Gòn', 'Discovery Search', 0.480, NULL, true)
,
('LLM1331', 'pho ha noi', 'Phở ngon Hà Nội', 'Discovery Search', 0.480, NULL, true)
,
('LLM1332', 'cơm tam sai gon', 'Cơm tấm ngon Sài Gòn', 'Discovery Search', 0.480, NULL, true)
,
('LLM1333', 'banh xeo mien tây', 'Bánh xèo miền Tây gần đây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1334', 'chao long', 'Cháo lòng gần đây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1335', 'gym quan 1', 'Phòng gym Quận 1', 'Discovery Search', 0.480, NULL, true)
,
('LLM1336', 'gym cau giay', 'Phòng gym Cầu Giấy', 'Discovery Search', 0.480, NULL, true)
,
('LLM1337', 'spa quan 1', 'Spa massage Quận 1', 'Discovery Search', 0.480, NULL, true)
,
('LLM1338', 'nha thuoc 24h ha noi', 'Nhà thuốc mở cửa 24h Hà Nội', 'Discovery Search', 0.480, NULL, true)
,
('LLM1339', 'cây xăng 24h', 'Cây xăng mở cửa 24/7 gần đây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1340', 'cho hoa ha noi', 'Chợ hoa Hà Nội', 'Discovery Search', 0.480, NULL, true)
,
('LLM1341', 'cho dêm da lat', 'Chợ đêm Đà Lạt', 'Discovery Search', 0.480, NULL, true)
,
('LLM1342', 'cho noi can thơ', 'Chợ nổi Cái Răng, Cần Thơ', 'POI Suggestion', 0.480, NULL, true)
,
('LLM1343', 'vincom quan 1', 'Vincom Center Đồng Khởi', 'POI Suggestion', 0.600, NULL, true)
,
('LLM1344', 'vincom thu duc', 'Vincom Thủ Đức', 'POI Suggestion', 0.600, NULL, true)
,
('LLM1345', 'aeon mall ha noi', 'AEON Mall Long Biên', 'POI Suggestion', 0.600, NULL, true)
,
('LLM1346', 'aeon mall tphcm', 'AEON Mall Tân Phú', 'POI Suggestion', 0.600, NULL, true)
,
('LLM1347', 'lotte mart ha noi', 'Lotte Mart Hà Nội', 'POI Suggestion', 0.600, NULL, true)
,
('LLM1348', 'lotte mart tphcm', 'Lotte Mart TP.HCM', 'POI Suggestion', 0.600, NULL, true)
,
('LLM1349', 'go big c', 'GO! / Big C gần đây', 'POI Suggestion', 0.600, NULL, true)
,
('LLM1350', 'phuc long gan', 'Phúc Long gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1351', 'highlands gan', 'Highlands Coffee gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1352', 'cong ca phê gan', 'Cộng Cà Phê gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1353', 'pizza 4ps gan', 'Pizza 4P''s gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1354', 'kfc gan', 'KFC gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1355', 'lotteria gan', 'Lotteria gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1356', 'jollibee gan', 'Jollibee gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1357', 'mcdonald gan', 'McDonald''s gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1358', 'starbucks gan', 'Starbucks gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1359', 'katinat gan', 'Katinat gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1360', 'cheese coffee gan', 'Cheese Coffee gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1361', 'trung nguyên gan', 'Trung Nguyên Legend gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1362', 'cgv gan', 'CGV gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1363', 'galaxy cinema gan', 'Galaxy Cinema gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1364', 'lotte cinema gan', 'Lotte Cinema gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1365', 'vinmec gan', 'Vinmec gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1366', 'mưong thanh gan', 'Mường Thanh gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1367', 'vinpearl gan', 'Vinpearl gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1368', 'circle k gan', 'Circle K gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1369', 'gs25 gan', 'GS25 gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1370', 'bach hoa xanh gan', 'Bách Hóa Xanh gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1371', 'winmart gan', 'WinMart+ gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1372', 'mixue gan', 'Mixue gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1373', 'phê la gan', 'Phê La gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1374', 'tocotoco gan', 'Tocotoco gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1375', 'gong cha gan', 'Gong Cha gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1376', 'haidilao gan', 'Haidilao gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1377', 'seoul garden gan', 'Seoul Garden gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1378', 'gogi house gan', 'Gogi House gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1379', 'king bbq gan', 'King BBQ gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1380', 'manwah gan', 'Manwah gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1381', 'daruma gan', 'Daruma gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1382', 'sheraton gan', 'Sheraton gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1383', 'intercontinental gan', 'Intercontinental gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1384', 'novotel gan', 'Novotel gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1385', 'hilton gan', 'Hilton gần đây', 'Brand Search', 0.600, NULL, true)
,
('LLM1386', 'ăn dêm sai gon', 'Quán ăn đêm Sài Gòn', 'Discovery Search', 0.450, NULL, true)
,
('LLM1387', 'ăn dêm ha noi', 'Quán ăn đêm Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1388', 'ăn dêm da nang', 'Quán ăn đêm Đà Nẵng', 'Discovery Search', 0.450, NULL, true)
,
('LLM1389', 'ăn sang sai gon', 'Quán ăn sáng Sài Gòn', 'Discovery Search', 0.450, NULL, true)
,
('LLM1390', 'ăn sang ha noi', 'Quán ăn sáng Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1391', 'ăn trưa sai gon', 'Ăn trưa văn phòng Sài Gòn', 'Discovery Search', 0.450, NULL, true)
,
('LLM1392', 'ăn trưa ha noi', 'Ăn trưa văn phòng Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1393', 'cafe sai gon', 'Quán cà phê đẹp Sài Gòn', 'Discovery Search', 0.450, NULL, true)
,
('LLM1394', 'cafe ha noi', 'Quán cà phê đẹp Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1395', 'cafe da nang', 'Quán cà phê đẹp Đà Nẵng', 'Discovery Search', 0.450, NULL, true)
,
('LLM1396', 'cafe da lat', 'Quán cà phê check-in Đà Lạt', 'Discovery Search', 0.450, NULL, true)
,
('LLM1397', 'cho chup anh da lat', 'Chỗ chụp ảnh đẹp ở Đà Lạt', 'Discovery Search', 0.450, NULL, true)
,
('LLM1398', 'dia diem check-in da lat', 'Địa điểm check-in đẹp ở Đà Lạt', 'Discovery Search', 0.450, NULL, true)
,
('LLM1399', 'di dâu da lat', 'Địa điểm du lịch Đà Lạt', 'Discovery Search', 0.450, NULL, true)
,
('LLM1400', 'di dâu sai gon', 'Địa điểm vui chơi Sài Gòn', 'Discovery Search', 0.450, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM1401', 'di dâu ha noi', 'Địa điểm du lịch Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1402', 'ăn gi da lat', 'Món ngon Đà Lạt', 'Discovery Search', 0.450, NULL, true)
,
('LLM1403', 'ăn gi ha noi', 'Món ngon Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1404', 'ăn gi sai gon', 'Món ngon Sài Gòn', 'Discovery Search', 0.450, NULL, true)
,
('LLM1405', 'ăn gi da nang', 'Món ngon Đà Nẵng', 'Discovery Search', 0.450, NULL, true)
,
('LLM1406', 'ăn gi hoi an', 'Món ngon Hội An', 'Discovery Search', 0.450, NULL, true)
,
('LLM1407', 'ăn gi nha trang', 'Món ngon Nha Trang', 'Discovery Search', 0.450, NULL, true)
,
('LLM1408', 'ăn gi hue', 'Món ngon Huế', 'Discovery Search', 0.450, NULL, true)
,
('LLM1409', 'ăn gi phu quoc', 'Món ngon Phú Quốc', 'Discovery Search', 0.450, NULL, true)
,
('LLM1410', 'cho dêm sai gon', 'Chợ đêm Sài Gòn', 'Discovery Search', 0.450, NULL, true)
,
('LLM1411', 'pho di bo ha noi', 'Phố đi bộ Hồ Gươm', 'Discovery Search', 0.450, NULL, true)
,
('LLM1412', 'pho di bo sai gon', 'Phố đi bộ Nguyễn Huệ', 'Discovery Search', 0.450, NULL, true)
,
('LLM1413', 'quan bar sai gon', 'Quán bar Sài Gòn', 'Discovery Search', 0.450, NULL, true)
,
('LLM1414', 'quan bar ha noi', 'Quán bar Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1415', 'rooftop sai gon', 'Rooftop bar Sài Gòn', 'Discovery Search', 0.450, NULL, true)
,
('LLM1416', 'rooftop ha noi', 'Rooftop bar Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1417', 'karaoke sai gon', 'Quán karaoke Sài Gòn', 'Discovery Search', 0.450, NULL, true)
,
('LLM1418', 'karaoke ha noi', 'Quán karaoke Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1419', 'cho hai san da nang', 'Chợ hải sản Đà Nẵng', 'Discovery Search', 0.450, NULL, true)
,
('LLM1420', 'hai san nha trang', 'Quán hải sản Nha Trang', 'Discovery Search', 0.450, NULL, true)
,
('LLM1421', 'hai san phu quoc', 'Quán hải sản Phú Quốc', 'Discovery Search', 0.450, NULL, true)
,
('LLM1422', 'hai san vung tau', 'Quán hải sản Vũng Tàu', 'Discovery Search', 0.450, NULL, true)
,
('LLM1423', 'dac san da lat', 'Đặc sản Đà Lạt', 'Discovery Search', 0.450, NULL, true)
,
('LLM1424', 'dac san ha noi', 'Đặc sản Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1425', 'dac san hue', 'Đặc sản Huế', 'Discovery Search', 0.450, NULL, true)
,
('LLM1426', 'dac san sai gon', 'Đặc sản Sài Gòn', 'Discovery Search', 0.450, NULL, true)
,
('LLM1427', 'dac san nha trang', 'Đặc sản Nha Trang', 'Discovery Search', 0.450, NULL, true)
,
('LLM1428', 'qua lưu niem hoi an', 'Quà lưu niệm Hội An', 'Discovery Search', 0.450, NULL, true)
,
('LLM1429', 'qua lưu niem da lat', 'Quà lưu niệm Đà Lạt', 'Discovery Search', 0.450, NULL, true)
,
('LLM1430', 'khach san gan sân bay tân sơn nhat', 'Khách sạn gần sân bay Tân Sơn Nhất', 'Discovery Search', 0.480, NULL, true)
,
('LLM1431', 'khach san gan sân bay noi bai', 'Khách sạn gần sân bay Nội Bài', 'Discovery Search', 0.480, NULL, true)
,
('LLM1432', 'khach san gan sân bay da nang', 'Khách sạn gần sân bay Đà Nẵng', 'Discovery Search', 0.480, NULL, true)
,
('LLM1433', 'nha hang gan sân bay tân sơn nhat', 'Nhà hàng gần sân bay Tân Sơn Nhất', 'Discovery Search', 0.480, NULL, true)
,
('LLM1434', 'cafe gan sân bay', 'Quán cà phê gần sân bay', 'Discovery Search', 0.480, NULL, true)
,
('LLM1435', 'ăn gan sân bay', 'Quán ăn gần sân bay', 'Discovery Search', 0.480, NULL, true)
,
('LLM1436', 'atm gan sân bay', 'ATM gần sân bay', 'Nearby Search', 0.480, NULL, true)
,
('LLM1437', 'cây xăng gan sân bay', 'Cây xăng gần sân bay', 'Nearby Search', 0.480, NULL, true)
,
('LLM1438', 'bai do xe sân bay', 'Bãi đỗ xe sân bay', 'Nearby Search', 0.480, NULL, true)
,
('LLM1439', 'khach san gan ga ha noi', 'Khách sạn gần ga Hà Nội', 'Discovery Search', 0.480, NULL, true)
,
('LLM1440', 'khach san gan ga sai gon', 'Khách sạn gần ga Sài Gòn', 'Discovery Search', 0.480, NULL, true)
,
('LLM1441', 'khach san gan cho ben thanh', 'Khách sạn gần Chợ Bến Thành', 'Discovery Search', 0.480, NULL, true)
,
('LLM1442', 'khach san gan ho gươm', 'Khách sạn gần Hồ Gươm', 'Discovery Search', 0.480, NULL, true)
,
('LLM1443', 'khach san gan pho co', 'Khách sạn gần Phố cổ Hà Nội', 'Discovery Search', 0.480, NULL, true)
,
('LLM1444', 'cafe gan ho tây', 'Quán cà phê gần Hồ Tây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1445', 'cafe gan ho gươm', 'Quán cà phê gần Hồ Gươm', 'Discovery Search', 0.480, NULL, true)
,
('LLM1446', 'ăn gan ho tây', 'Nhà hàng gần Hồ Tây', 'Discovery Search', 0.480, NULL, true)
,
('LLM1447', 'ăn gan cho ben thanh', 'Quán ăn gần Chợ Bến Thành', 'Discovery Search', 0.480, NULL, true)
,
('LLM1448', 'tra sua gan cho ben thanh', 'Trà sữa gần Chợ Bến Thành', 'Discovery Search', 0.480, NULL, true)
,
('LLM1449', 'highlands coffee nguyen hue', 'Highlands Coffee Nguyễn Huệ', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1450', 'highlands coffee quan 1', 'Highlands Coffee Quận 1', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1451', 'highlands coffee ha noi', 'Highlands Coffee Hà Nội', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1452', 'the coffee house cau giay', 'The Coffee House Cầu Giấy', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1453', 'cong ca phê ho gươm', 'Cộng Cà Phê Hồ Gươm', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1454', 'cong ca phê ha noi', 'Cộng Cà Phê Hà Nội', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1455', 'phuc long quan 1', 'Phúc Long Quận 1', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1456', 'phuc long quan 7', 'Phúc Long Quận 7', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1457', 'pizza 4ps ben nghe', 'Pizza 4P''s Bến Nghé', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1458', 'pizza 4ps ha noi', 'Pizza 4P''s Hà Nội', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1459', 'galaxy cinema nguyen du', 'Galaxy Cinema Nguyễn Du', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1460', 'cgv quan 1', 'CGV Quận 1', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1461', 'cgv ha noi', 'CGV Hà Nội', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1462', 'petrolimex nguyen trai', 'Petrolimex Nguyễn Trãi', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1463', 'vinmec times city', 'Vinmec Times City', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1464', 'benh vien bach mai', 'Bệnh viện Bạch Mai', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1465', 'benh vien cho ray', 'Bệnh viện Chợ Rẫy', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1466', 'mưong thanh da nang', 'Khách sạn Mường Thanh Đà Nẵng', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1467', 'vinpearl nha trang', 'Vinpearl Nha Trang', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1468', 'vinpearl phu quoc', 'Vinpearl Phú Quốc', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1469', 'katinat quan 1', 'Katinat Quận 1', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1470', 'cheese coffee quan 1', 'Cheese Coffee Quận 1', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1471', 'lotteria quan 1', 'Lotteria Quận 1', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1472', 'kfc ha noi', 'KFC Hà Nội', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1473', 'jollibee ha noi', 'Jollibee Hà Nội', 'POI Suggestion', 0.700, NULL, true)
,
('LLM1474', 'quan cafe', 'Quán cà phê gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1475', 'quan an', 'Quán ăn gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1476', 'cay xang', 'Cây xăng gần đây', 'Nearby Search', 0.500, NULL, true)
,
('LLM1477', 'tram xang', 'Trạm xăng gần đây', 'Nearby Search', 0.500, NULL, true)
,
('LLM1478', 'ngan hang', 'Ngân hàng gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1479', 'sieu thi', 'Siêu thị gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1480', 'san bay', 'Sân bay gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1481', 'cong vien', 'Công viên gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1482', 'ho boi', 'Hồ bơi gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1483', 'san bong', 'Sân bóng gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1484', 'phong gym', 'Phòng gym gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1485', 'tam hoi', 'Tiệm tắm hơi gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1486', 'ruou bia', 'Quán rượu bia gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1487', 'an vat', 'Quán ăn vặt gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1488', 'do an nhanh', 'Đồ ăn nhanh gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1489', 'xe dien', 'Trạm sạc xe điện gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1490', 'sua xe', 'Tiệm sửa xe gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1491', 'quan cafe ngon quan 1', 'Quán cà phê ngon nhất Quận 1', 'Discovery Search', 0.450, NULL, true)
,
('LLM1492', 'quan cafe ngon quan 7', 'Quán cà phê ngon nhất Quận 7', 'Discovery Search', 0.450, NULL, true)
,
('LLM1493', 'quan ăn ngon quan 1', 'Quán ăn ngon nhất Quận 1', 'Discovery Search', 0.450, NULL, true)
,
('LLM1494', 'quan ăn ngon ha noi', 'Quán ăn ngon nhất Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1495', 'quan lau ngon ha noi', 'Quán lẩu ngon nhất Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1496', 'quan lau ngon sai gon', 'Quán lẩu ngon nhất Sài Gòn', 'Discovery Search', 0.450, NULL, true)
,
('LLM1497', 'quan nưong ngon quan 7', 'Quán nướng ngon nhất Quận 7', 'Discovery Search', 0.450, NULL, true)
,
('LLM1498', 'buffet ngon ha noi', 'Buffet ngon nhất Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1499', 'bun dau mam tôm ha noi', 'Bún đậu mắm tôm ngon Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1500', 'bun bo hue ngon', 'Bún bò Huế ngon gần đây', 'Discovery Search', 0.450, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM1501', 'pho ngon gan dây', 'Phở ngon nhất gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1502', 'banh mi ngon sai gon', 'Bánh mì ngon nhất Sài Gòn', 'Discovery Search', 0.450, NULL, true)
,
('LLM1503', 'tra sua ngon ha noi', 'Trà sữa ngon nhất Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1504', 'tra sua ngon sai gon', 'Trà sữa ngon nhất Sài Gòn', 'Discovery Search', 0.450, NULL, true)
,
('LLM1505', 'kem ngon', 'Kem ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1506', 'che ngon', 'Chè ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1507', 'banh trang tron', 'Bánh tráng trộn ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1508', 'oc ngon', 'Quán ốc ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1509', 'hu tieu ngon', 'Hủ tiếu ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1510', 'banh canh ngon', 'Bánh canh ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1511', 'cơm chay', 'Cơm cháy ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1512', 'ga ran ngon', 'Gà rán ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1513', 'lau thai', 'Lẩu Thái ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1514', 'lau hai san', 'Lẩu hải sản ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1515', 'lau bo', 'Lẩu bò ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1516', 'sushi', 'Sushi ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1517', 'mi quang', 'Mì Quảng ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1518', 'cơm ga', 'Cơm gà ngon gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1519', 'cafe mo cua som', 'Quán cà phê mở cửa sớm gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1520', 'cafe mo cua muon', 'Quán cà phê mở cửa khuya', 'Discovery Search', 0.450, NULL, true)
,
('LLM1521', 'quan mo cua khuya', 'Quán ăn mở cửa khuya gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1522', 'ăn khuya gan dây', 'Quán ăn khuya gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1523', 'ăn khuya quan 1', 'Quán ăn khuya Quận 1', 'Discovery Search', 0.450, NULL, true)
,
('LLM1524', 'ăn khuya ha noi', 'Quán ăn khuya Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1525', 'cafe 24h', 'Quán cà phê mở cửa 24/7', 'Discovery Search', 0.450, NULL, true)
,
('LLM1526', 'nha thuoc 24h', 'Nhà thuốc mở cửa 24/7 gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1527', 'phong gym 24h', 'Phòng gym mở cửa 24/7 gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1528', 'cua hang tien loi 24h', 'Cửa hàng tiện lợi mở cửa 24/7', 'Discovery Search', 0.450, NULL, true)
,
('LLM1529', 'ăn sang som', 'Quán ăn sáng mở sớm gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1530', 'cafe sang som', 'Quán cà phê mở sớm gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1531', 'bai do xe ô tô quan 1', 'Bãi đỗ xe ô tô Quận 1', 'Nearby Search', 0.480, NULL, true)
,
('LLM1532', 'bai do xe may', 'Bãi đỗ xe máy gần đây', 'Nearby Search', 0.480, NULL, true)
,
('LLM1533', 'bai do xe sân bay noi bai', 'Bãi đỗ xe sân bay Nội Bài', 'Nearby Search', 0.480, NULL, true)
,
('LLM1534', 'bai do xe sân bay tân sơn nhat', 'Bãi đỗ xe sân bay Tân Sơn Nhất', 'Nearby Search', 0.480, NULL, true)
,
('LLM1535', 'tram dung chân cao toc', 'Trạm dừng chân trên cao tốc', 'Nearby Search', 0.480, NULL, true)
,
('LLM1536', 'tram sac xe dien ha noi', 'Trạm sạc xe điện Hà Nội', 'Nearby Search', 0.480, NULL, true)
,
('LLM1537', 'tram sac xe dien tphcm', 'Trạm sạc xe điện TP.HCM', 'Nearby Search', 0.480, NULL, true)
,
('LLM1538', 'ben xe khach', 'Bến xe khách gần đây', 'Nearby Search', 0.480, NULL, true)
,
('LLM1539', 'ga tau hoa', 'Ga tàu hỏa gần đây', 'Nearby Search', 0.480, NULL, true)
,
('LLM1540', 'ben pha', 'Bến phà gần đây', 'Nearby Search', 0.480, NULL, true)
,
('LLM1541', 'gui xe sân bay', 'Dịch vụ gửi xe sân bay', 'Nearby Search', 0.480, NULL, true)
,
('LLM1542', 'sua dien thoai', 'Tiệm sửa điện thoại gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1543', 'sua laptop', 'Tiệm sửa laptop gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1544', 'in an', 'Tiệm in ấn gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1545', 'giat ui gan dây', 'Tiệm giặt ủi gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1546', 'giat say', 'Tiệm giặt sấy gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1547', 'may do', 'Tiệm may đo gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1548', 'sua giay', 'Tiệm sửa giày dép gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1549', 'lam chia khoa', 'Tiệm làm chìa khóa gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1550', 'sua dong ho', 'Tiệm sửa đồng hồ gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1551', 'rua anh', 'Tiệm rửa ảnh gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1552', 'chup anh the', 'Tiệm chụp ảnh thẻ gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1553', 'photocopy', 'Tiệm photocopy gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1554', 'dich thuat', 'Văn phòng dịch thuật gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1555', 'công chung', 'Văn phòng công chứng gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1556', 'luat sư', 'Văn phòng luật sư gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1557', 'ke toan', 'Dịch vụ kế toán gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1558', 'bưu dien', 'Bưu điện gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1559', 'chuyen phat nhanh', 'Dịch vụ chuyển phát nhanh gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1560', 'mua sim', 'Cửa hàng sim thẻ gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1561', 'doi tien', 'Điểm đổi ngoại tệ gần đây', 'Category Search', 0.500, NULL, true)
,
('LLM1562', 'khach san gia re ha noi', 'Khách sạn giá rẻ Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1563', 'khach san gia re sai gon', 'Khách sạn giá rẻ TP.HCM', 'Discovery Search', 0.450, NULL, true)
,
('LLM1564', 'nha hang gia re quan 1', 'Nhà hàng giá rẻ Quận 1', 'Discovery Search', 0.450, NULL, true)
,
('LLM1565', 'quan ăn gia re', 'Quán ăn giá rẻ gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1566', 'cafe gia re', 'Quán cà phê giá rẻ gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1567', 'tra sua gia re', 'Trà sữa giá rẻ gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1568', 'gym gia re', 'Phòng gym giá rẻ gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1569', 'spa gia re', 'Spa giá rẻ gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1570', 'cat toc gia re', 'Tiệm cắt tóc giá rẻ gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1571', 'check-in da lat', 'Địa điểm check-in đẹp ở Đà Lạt', 'Discovery Search', 0.450, NULL, true)
,
('LLM1572', 'check-in sai gon', 'Địa điểm check-in đẹp ở Sài Gòn', 'Discovery Search', 0.450, NULL, true)
,
('LLM1573', 'check-in ha noi', 'Địa điểm check-in đẹp ở Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1574', 'cafe check-in da lat', 'Quán cà phê check-in Đà Lạt', 'Discovery Search', 0.450, NULL, true)
,
('LLM1575', 'hoa da lat', 'Vườn hoa Đà Lạt', 'Discovery Search', 0.450, NULL, true)
,
('LLM1576', 'săn mây da lat', 'Điểm săn mây Đà Lạt', 'Discovery Search', 0.450, NULL, true)
,
('LLM1577', 'cam trai', 'Địa điểm cắm trại gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1578', 'cam trai gan ha noi', 'Địa điểm cắm trại gần Hà Nội', 'Discovery Search', 0.450, NULL, true)
,
('LLM1579', 'cam trai gan sai gon', 'Địa điểm cắm trại gần Sài Gòn', 'Discovery Search', 0.450, NULL, true)
,
('LLM1580', 'da ngoai', 'Địa điểm dã ngoại gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1581', 'câu ca', 'Địa điểm câu cá gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1582', 'suoi nưoc nong', 'Suối nước nóng gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1583', 'be bơi gan dây', 'Bể bơi công cộng gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1584', 'công viên nưoc gan dây', 'Công viên nước gần đây', 'Discovery Search', 0.450, NULL, true)
,
('LLM1585', 'bao tang ha noi', 'Bảo tàng Hà Nội', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1586', 'bao tang sai gon', 'Bảo tàng TP.HCM', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1587', 'bao tang chien tranh', 'Bảo tàng Chứng tích Chiến tranh', 'POI Suggestion', 0.500, NULL, true)
,
('LLM1588', 'best pho', 'Best Pho in Hanoi', 'Discovery Search', 0.480, NULL, true)
,
('LLM1589', 'best banh mi', 'Best Banh Mi in Saigon', 'Discovery Search', 0.480, NULL, true)
,
('LLM1590', 'best coffee', 'Best Coffee in Ho Chi Minh City', 'Discovery Search', 0.480, NULL, true)
,
('LLM1591', 'vegetarian restaurant', 'Vegetarian Restaurant near me', 'Discovery Search', 0.480, NULL, true)
,
('LLM1592', 'vegan food', 'Vegan Food near me', 'Discovery Search', 0.480, NULL, true)
,
('LLM1593', 'halal food', 'Halal Food in Ho Chi Minh City', 'Discovery Search', 0.480, NULL, true)
,
('LLM1594', 'night market', 'Night Market near me', 'Discovery Search', 0.480, NULL, true)
,
('LLM1595', 'rooftop bar', 'Rooftop Bar in Saigon', 'Discovery Search', 0.480, NULL, true)
,
('LLM1596', 'massage near', 'Massage near me', 'Discovery Search', 0.480, NULL, true)
,
('LLM1597', 'tailor near', 'Tailor Shop near me', 'Discovery Search', 0.480, NULL, true)
,
('LLM1598', 'laundry near', 'Laundry Service near me', 'Discovery Search', 0.480, NULL, true)
,
('LLM1599', 'pharmacy near', 'Pharmacy near me', 'Discovery Search', 0.480, NULL, true)
,
('LLM1600', 'currency exchange', 'Currency Exchange near me', 'Discovery Search', 0.480, NULL, true)
;

INSERT INTO "track_4_autocomplete_entries" ("original_id", "input_prefix", "suggestion_text", "suggestion_type", "score", "query_frequency", "is_generated") VALUES
('LLM1601', 'sim card', 'SIM Card Shop near me', 'Discovery Search', 0.480, NULL, true)
,
('LLM1602', 'souvenir shop', 'Souvenir Shop near me', 'Discovery Search', 0.480, NULL, true)
;

-- =============================================================================
-- Seed: Popular Queries (500 rows) — Enriched with regional diversity
-- =============================================================================

INSERT INTO "track_4_popular_queries" ("original_id", "query_text", "intent_type", "monthly_frequency", "region", "is_generated") VALUES

-- ============================
-- TP.HCM (~30% = 150 rows)
-- ============================

-- Food & Drinks (TP.HCM)
('LLM001', 'quán ăn ngon quận 1', 'Discovery Search', 5800, 'TP.HCM', TRUE),
('LLM002', 'trà sữa gần đây', 'Nearby Search', 7400, 'TP.HCM', TRUE),
('LLM003', 'nhà hàng quận 7', 'Category Search', 4200, 'TP.HCM', TRUE),
('LLM004', 'cơm tấm sài gòn', 'Category Search', 5100, 'TP.HCM', TRUE),
('LLM005', 'hải sản quận 4', 'Category Search', 3800, 'TP.HCM', TRUE),
('LLM006', 'buffet hải sản sài gòn', 'Discovery Search', 3600, 'TP.HCM', TRUE),
('LLM007', 'phở sài gòn ngon', 'Discovery Search', 4500, 'TP.HCM', TRUE),
('LLM008', 'bún bò quận 3', 'Category Search', 2800, 'TP.HCM', TRUE),
('LLM009', 'lẩu thái quận 5', 'Category Search', 3100, 'TP.HCM', TRUE),
('LLM010', 'quán nhậu quận 2', 'Category Search', 4800, 'TP.HCM', TRUE),
('LLM011', 'ăn vặt sài gòn', 'Discovery Search', 3900, 'TP.HCM', TRUE),
('LLM012', 'bánh mì sài gòn ngon', 'Discovery Search', 3500, 'TP.HCM', TRUE),
('LLM013', 'quán chay quận 1', 'Category Search', 2100, 'TP.HCM', TRUE),
('LLM014', 'cà phê sân vườn quận 2', 'Discovery Search', 2800, 'TP.HCM', TRUE),
('LLM015', 'nhà hàng view sông sài gòn', 'Discovery Search', 3200, 'TP.HCM', TRUE),
('LLM016', 'quán ăn khuya quận 1', 'Discovery Search', 2900, 'TP.HCM', TRUE),
('LLM017', 'bánh xèo sài gòn', 'Category Search', 2400, 'TP.HCM', TRUE),
('LLM018', 'lẩu bò quận 10', 'Category Search', 1800, 'TP.HCM', TRUE),
('LLM019', 'phở bò viên sài gòn', 'Category Search', 1500, 'TP.HCM', TRUE),
('LLM020', 'quán nướng quận 7', 'Category Search', 3200, 'TP.HCM', TRUE),

-- Services (TP.HCM)
('LLM021', 'atm vietcombank quận 1', 'Nearby Search', 4200, 'TP.HCM', TRUE),
('LLM022', 'cây xăng quận 2', 'Nearby Search', 3800, 'TP.HCM', TRUE),
('LLM023', 'bệnh viện quận 7', 'Nearby Search', 3100, 'TP.HCM', TRUE),
('LLM024', 'phòng khám quận 1', 'Nearby Search', 2800, 'TP.HCM', TRUE),
('LLM025', 'nhà thuốc gần đây', 'Nearby Search', 5600, 'TP.HCM', TRUE),
('LLM026', 'siêu thị quận 2', 'Category Search', 3600, 'TP.HCM', TRUE),
('LLM027', 'ngân hàng quận 1', 'Category Search', 2700, 'TP.HCM', TRUE),
('LLM028', 'spa quận 1', 'Category Search', 3400, 'TP.HCM', TRUE),
('LLM029', 'gym quận 2', 'Category Search', 2900, 'TP.HCM', TRUE),
('LLM030', 'tiệm sửa xe quận 10', 'Category Search', 2300, 'TP.HCM', TRUE),
('LLM031', 'cửa hàng tiện lợi gần đây', 'Nearby Search', 6200, 'TP.HCM', TRUE),
('LLM032', 'trạm xăng gần đây', 'Nearby Search', 5500, 'TP.HCM', TRUE),
('LLM033', 'phòng tập gym gần đây', 'Nearby Search', 3300, 'TP.HCM', TRUE),
('LLM034', 'tiệm giặt là quận 1', 'Category Search', 1500, 'TP.HCM', TRUE),
('LLM035', 'rửa xe quận 10', 'Category Search', 2100, 'TP.HCM', TRUE),

-- Transportation (TP.HCM)
('LLM036', 'bến xe miền đông mới', 'POI Search', 4800, 'TP.HCM', TRUE),
('LLM037', 'sân bay tân sơn nhất', 'POI Search', 6200, 'TP.HCM', TRUE),
('LLM038', 'ga tàu sài gòn', 'POI Search', 2500, 'TP.HCM', TRUE),
('LLM039', 'bãi đỗ xe quận 1', 'Nearby Search', 3800, 'TP.HCM', TRUE),
('LLM040', 'bến xe miền tây', 'POI Search', 2900, 'TP.HCM', TRUE),
('LLM041', 'trạm xe buýt gần đây', 'Nearby Search', 2200, 'TP.HCM', TRUE),
('LLM042', 'giữ xe quận 1', 'Nearby Search', 3100, 'TP.HCM', TRUE),
('LLM043', 'chỉ đường sân bay tân sơn nhất', 'Discovery Search', 4100, 'TP.HCM', TRUE),

-- Shopping (TP.HCM)
('LLM044', 'trung tâm thương mại quận 1', 'Category Search', 4400, 'TP.HCM', TRUE),
('LLM045', 'chợ bình tây', 'POI Search', 2800, 'TP.HCM', TRUE),
('LLM046', 'aeon mall tân phú', 'POI Search', 3200, 'TP.HCM', TRUE),
('LLM047', 'vincom quận 9', 'POI Search', 2100, 'TP.HCM', TRUE),
('LLM048', 'crescent mall quận 7', 'POI Search', 1900, 'TP.HCM', TRUE),
('LLM049', 'siêu thị coopmart gần đây', 'Nearby Search', 2800, 'TP.HCM', TRUE),
('LLM050', 'chợ hoa hồ thị kỷ', 'POI Search', 1600, 'TP.HCM', TRUE),
('LLM051', 'chợ đêm bến thành', 'POI Search', 2500, 'TP.HCM', TRUE),

-- Entertainment (TP.HCM)
('LLM052', 'rạp chiếu phim quận 1', 'Category Search', 3500, 'TP.HCM', TRUE),
('LLM053', 'karaoke quận 10', 'Category Search', 2700, 'TP.HCM', TRUE),
('LLM054', 'quán bar quận 1', 'Category Search', 3100, 'TP.HCM', TRUE),
('LLM055', 'check in sài gòn', 'Discovery Search', 4500, 'TP.HCM', TRUE),
('LLM056', 'địa điểm du lịch sài gòn', 'Discovery Search', 4800, 'TP.HCM', TRUE),
('LLM057', 'phố đi bộ nguyễn huệ', 'POI Search', 5200, 'TP.HCM', TRUE),
('LLM058', 'công viên gần đây', 'Nearby Search', 2400, 'TP.HCM', TRUE),
('LLM059', 'bảo tàng thành phố hồ chí minh', 'POI Search', 2100, 'TP.HCM', TRUE),
('LLM060', 'landmark 81', 'POI Search', 3800, 'TP.HCM', TRUE),
('LLM061', 'thảo cầm viên sài gòn', 'POI Search', 2600, 'TP.HCM', TRUE),
('LLM062', 'địa đạo củ chi', 'POI Search', 3300, 'TP.HCM', TRUE),
('LLM063', 'dinh độc lập', 'POI Search', 4100, 'TP.HCM', TRUE),
('LLM064', 'nhà thờ đức bà sài gòn', 'POI Search', 3700, 'TP.HCM', TRUE),
('LLM065', 'bưu điện thành phố hồ chí minh', 'POI Search', 1600, 'TP.HCM', TRUE),

-- Lodging (TP.HCM)
('LLM066', 'khách sạn quận 1', 'Category Search', 5500, 'TP.HCM', TRUE),
('LLM067', 'nhà nghỉ quận 12', 'Category Search', 2100, 'TP.HCM', TRUE),
('LLM068', 'homestay sài gòn', 'Discovery Search', 2900, 'TP.HCM', TRUE),
('LLM069', 'resort gần sài gòn', 'Discovery Search', 2400, 'TP.HCM', TRUE),
('LLM070', 'khách sạn giá rẻ quận 1', 'Discovery Search', 3800, 'TP.HCM', TRUE),
('LLM071', 'căn hộ dịch vụ quận 2', 'Discovery Search', 2100, 'TP.HCM', TRUE),
('LLM072', 'khách sạn gần sân bay tân sơn nhất', 'Nearby Search', 4300, 'TP.HCM', TRUE),

-- Education (TP.HCM)
('LLM073', 'trường học quận 7', 'Category Search', 1600, 'TP.HCM', TRUE),
('LLM074', 'đại học bách khoa tp hcm', 'POI Search', 2800, 'TP.HCM', TRUE),
('LLM075', 'trung tâm ngoại ngữ quận 1', 'Category Search', 2400, 'TP.HCM', TRUE),
('LLM076', 'đại học kinh tế tp hcm', 'POI Search', 1900, 'TP.HCM', TRUE),
('LLM077', 'trường quốc tế quận 2', 'Category Search', 1800, 'TP.HCM', TRUE),

-- Other (TP.HCM)
('LLM078', 'thời tiết sài gòn', 'Discovery Search', 7200, 'TP.HCM', TRUE),
('LLM079', 'kẹt xe sài gòn', 'Discovery Search', 6200, 'TP.HCM', TRUE),
('LLM080', 'bãi giữ xe quận 3', 'Nearby Search', 1900, 'TP.HCM', TRUE),
('LLM081', 'tiệm vàng quận 1', 'Category Search', 1700, 'TP.HCM', TRUE),
('LLM082', 'nhà sách quận 1', 'Category Search', 2300, 'TP.HCM', TRUE),
('LLM083', 'tiệm bánh sài gòn', 'Category Search', 2200, 'TP.HCM', TRUE),

-- Brand Search (TP.HCM)
('LLM084', 'highlands coffee quận 1', 'Brand Search', 3500, 'TP.HCM', TRUE),
('LLM085', 'phúc long gần đây', 'Brand Search', 4200, 'TP.HCM', TRUE),
('LLM086', 'cộng cà phê sài gòn', 'Brand Search', 2800, 'TP.HCM', TRUE),
('LLM087', 'pizza 4p s sài gòn', 'Brand Search', 2500, 'TP.HCM', TRUE),
('LLM088', 'lotteria gần đây', 'Brand Search', 3100, 'TP.HCM', TRUE),
('LLM089', 'mcdonald sài gòn', 'Brand Search', 2000, 'TP.HCM', TRUE),
('LLM090', 'starbucks sài gòn', 'Brand Search', 1800, 'TP.HCM', TRUE),
('LLM091', 'the coffee house quận 1', 'Brand Search', 2700, 'TP.HCM', TRUE),
('LLM092', 'winmart gần đây', 'Brand Search', 3600, 'TP.HCM', TRUE),
('LLM093', 'bach hoa xanh quận 10', 'Brand Search', 4500, 'TP.HCM', TRUE),
('LLM094', 'circlek gần đây', 'Brand Search', 2400, 'TP.HCM', TRUE),
('LLM095', 'gs25 gần đây', 'Brand Search', 2100, 'TP.HCM', TRUE),

-- Specific POIs (TP.HCM)
('LLM096', 'nhà hàng pizza 4p s bến nghé', 'POI Search', 1900, 'TP.HCM', TRUE),
('LLM097', 'chợ bà chiểu', 'POI Search', 1700, 'TP.HCM', TRUE),
('LLM098', 'cầu ánh sao quận 7', 'POI Search', 1400, 'TP.HCM', TRUE),
('LLM099', 'phố tây bùi viện', 'POI Search', 3100, 'TP.HCM', TRUE),
('LLM100', 'suối tiên quận 9', 'POI Search', 2900, 'TP.HCM', TRUE),
('LLM101', 'đầm sen công viên nước', 'POI Search', 2500, 'TP.HCM', TRUE),
('LLM102', 'phố người hoa quận 5', 'POI Search', 1100, 'TP.HCM', TRUE),
('LLM103', 'chợ lớn quận 6', 'POI Search', 1300, 'TP.HCM', TRUE),
('LLM104', 'công viên tao đàn', 'POI Search', 900, 'TP.HCM', TRUE),
('LLM105', 'bảo tàng chứng tích chiến tranh', 'POI Search', 2200, 'TP.HCM', TRUE),

-- Food specific (TP.HCM continued)
('LLM106', 'hủ tiếu sài gòn', 'Category Search', 2600, 'TP.HCM', TRUE),
('LLM107', 'bánh canh sài gòn', 'Category Search', 1800, 'TP.HCM', TRUE),
('LLM108', 'cháo lòng sài gòn', 'Category Search', 1200, 'TP.HCM', TRUE),
('LLM109', 'gỏi cuốn sài gòn', 'Category Search', 1400, 'TP.HCM', TRUE),
('LLM110', 'bò né sài gòn', 'Category Search', 2100, 'TP.HCM', TRUE),
('LLM111', 'bánh flan sài gòn', 'Category Search', 800, 'TP.HCM', TRUE),
('LLM112', 'quán cafe view đẹp sài gòn', 'Discovery Search', 3300, 'TP.HCM', TRUE),
('LLM113', 'cafe máy lạnh quận 1', 'Discovery Search', 2100, 'TP.HCM', TRUE),
('LLM114', 'quán ăn sáng quận 3', 'Category Search', 2600, 'TP.HCM', TRUE),
('LLM115', 'cơm trưa văn phòng quận 1', 'Category Search', 3500, 'TP.HCM', TRUE),

-- Services more (TP.HCM)
('LLM116', 'phòng khám nha khoa quận 1', 'Category Search', 2400, 'TP.HCM', TRUE),
('LLM117', 'bệnh viện từ dũ', 'POI Search', 3100, 'TP.HCM', TRUE),
('LLM118', 'bệnh viện chợ rẫy', 'POI Search', 3600, 'TP.HCM', TRUE),
('LLM119', 'bệnh viện nhi đồng 1', 'POI Search', 2100, 'TP.HCM', TRUE),
('LLM120', 'tiệm cắt tóc quận 1', 'Category Search', 1900, 'TP.HCM', TRUE),
('LLM121', 'nail salon quận 1', 'Category Search', 1700, 'TP.HCM', TRUE),
('LLM122', 'thú y quận 10', 'Category Search', 1400, 'TP.HCM', TRUE),
('LLM123', 'hiệu thuốc tây 24h', 'Nearby Search', 2600, 'TP.HCM', TRUE),

-- More specific (TP.HCM)
('LLM124', 'thu mua đồ cũ quận 1', 'Category Search', 900, 'TP.HCM', TRUE),
('LLM125', 'trạm sạc xe điện quận 2', 'Nearby Search', 1500, 'TP.HCM', TRUE),
('LLM126', 'trung tâm đăng kiểm quận 12', 'Category Search', 1100, 'TP.HCM', TRUE),
('LLM127', 'garage ô tô quận 10', 'Category Search', 1600, 'TP.HCM', TRUE),
('LLM128', 'cửa hàng điện thoại quận 1', 'Category Search', 2000, 'TP.HCM', TRUE),
('LLM129', 'sửa điện thoại quận 3', 'Category Search', 1800, 'TP.HCM', TRUE),
('LLM130', 'sửa máy tính quận 1', 'Category Search', 1400, 'TP.HCM', TRUE),
('LLM131', 'shop quần áo quận 1', 'Category Search', 2400, 'TP.HCM', TRUE),
('LLM132', 'mua sắm quận 1', 'Category Search', 3200, 'TP.HCM', TRUE),

-- Nearby/Discovery more (TP.HCM)
('LLM133', 'quán ăn gần đây mở cửa', 'Nearby Search', 5200, 'TP.HCM', TRUE),
('LLM134', 'quán cafe làm việc quận 1', 'Discovery Search', 2900, 'TP.HCM', TRUE),
('LLM135', 'quán ăn gia đình quận 2', 'Discovery Search', 2100, 'TP.HCM', TRUE),
('LLM136', 'địa điểm hẹn hò sài gòn', 'Discovery Search', 3900, 'TP.HCM', TRUE),
('LLM137', 'quán cafe yên tĩnh quận 1', 'Discovery Search', 2500, 'TP.HCM', TRUE),
('LLM138', 'quán café mở cửa 24h', 'Discovery Search', 2000, 'TP.HCM', TRUE),
('LLM139', 'nhà hàng chay quận 1', 'Category Search', 1800, 'TP.HCM', TRUE),
('LLM140', 'quán ăn trưa văn phòng quận 1', 'Discovery Search', 3100, 'TP.HCM', TRUE),
('LLM141', 'tiệm bánh kem quận 10', 'Category Search', 1600, 'TP.HCM', TRUE),
('LLM142', 'quán chè sài gòn', 'Category Search', 2400, 'TP.HCM', TRUE),
('LLM143', 'quán ốc sài gòn', 'Category Search', 2700, 'TP.HCM', TRUE),
('LLM144', 'quán sinh tố sài gòn', 'Category Search', 1500, 'TP.HCM', TRUE),
('LLM145', 'quán nước mía sài gòn', 'Category Search', 1100, 'TP.HCM', TRUE),
('LLM146', 'cơm tấm bụi sài gòn', 'Discovery Search', 2300, 'TP.HCM', TRUE),
('LLM147', 'bánh tráng trộn quận 10', 'Category Search', 1300, 'TP.HCM', TRUE),
('LLM148', 'bún thịt nướng quận 1', 'Category Search', 1700, 'TP.HCM', TRUE),
('LLM149', 'bún mắm sài gòn', 'Category Search', 900, 'TP.HCM', TRUE),
('LLM150', 'bún riêu sài gòn', 'Category Search', 1400, 'TP.HCM', TRUE),

-- ============================
-- Hà Nội (~25% = 125 rows)
-- ============================

-- Food & Drinks (Hà Nội)
('LLM151', 'phở hà nội ngon', 'Discovery Search', 6200, 'Hà Nội', TRUE),
('LLM152', 'bún chả hà nội', 'Category Search', 5800, 'Hà Nội', TRUE),
('LLM153', 'quán cafe gần đây hà nội', 'Nearby Search', 5600, 'Hà Nội', TRUE),
('LLM154', 'nhà hàng hà nội', 'Category Search', 4600, 'Hà Nội', TRUE),
('LLM155', 'quán ăn vặt hà nội', 'Discovery Search', 3700, 'Hà Nội', TRUE),
('LLM156', 'bánh cuốn hà nội', 'Category Search', 2900, 'Hà Nội', TRUE),
('LLM157', 'phở cuốn hà nội', 'Category Search', 2400, 'Hà Nội', TRUE),
('LLM158', 'bún đậu mắm tôm hà nội', 'Category Search', 3100, 'Hà Nội', TRUE),
('LLM159', 'chả cá lã vọng', 'POI Search', 2800, 'Hà Nội', TRUE),
('LLM160', 'cafe phố cổ hà nội', 'Discovery Search', 4400, 'Hà Nội', TRUE),
('LLM161', 'quán ăn đêm hà nội', 'Discovery Search', 3600, 'Hà Nội', TRUE),
('LLM162', 'lẩu hà nội', 'Category Search', 2700, 'Hà Nội', TRUE),
('LLM163', 'nhà hàng buffet hà nội', 'Discovery Search', 2400, 'Hà Nội', TRUE),
('LLM164', 'cafe hồ tây', 'Discovery Search', 3800, 'Hà Nội', TRUE),
('LLM165', 'bánh mì hà nội', 'Category Search', 2800, 'Hà Nội', TRUE),
('LLM166', 'cháo sườn hà nội', 'Category Search', 1500, 'Hà Nội', TRUE),
('LLM167', 'bún ốc hà nội', 'Category Search', 1800, 'Hà Nội', TRUE),
('LLM168', 'nem rán hà nội', 'Category Search', 1800, 'Hà Nội', TRUE),
('LLM169', 'cafe trứng hà nội', 'Discovery Search', 3300, 'Hà Nội', TRUE),
('LLM170', 'trà chanh hà nội', 'Category Search', 2800, 'Hà Nội', TRUE),

-- Services (Hà Nội)
('LLM171', 'atm gần đây hà nội', 'Nearby Search', 3800, 'Hà Nội', TRUE),
('LLM172', 'cây xăng hà nội', 'Nearby Search', 3200, 'Hà Nội', TRUE),
('LLM173', 'bệnh viện bạch mai', 'POI Search', 4800, 'Hà Nội', TRUE),
('LLM174', 'bệnh viện gần đây hà nội', 'Nearby Search', 3700, 'Hà Nội', TRUE),
('LLM175', 'phòng khám hà nội', 'Category Search', 2600, 'Hà Nội', TRUE),
('LLM176', 'nhà thuốc hà nội', 'Nearby Search', 3000, 'Hà Nội', TRUE),
('LLM177', 'siêu thị hà nội', 'Category Search', 3400, 'Hà Nội', TRUE),
('LLM178', 'ngân hàng hà nội', 'Category Search', 2300, 'Hà Nội', TRUE),
('LLM179', 'spa hà nội', 'Category Search', 2800, 'Hà Nội', TRUE),
('LLM180', 'gym hà nội', 'Category Search', 2400, 'Hà Nội', TRUE),
('LLM181', 'tiệm sửa xe hà nội', 'Category Search', 1900, 'Hà Nội', TRUE),
('LLM182', 'trạm xăng dầu hà nội', 'Nearby Search', 2900, 'Hà Nội', TRUE),
('LLM183', 'cửa hàng tiện lợi hà nội', 'Category Search', 3100, 'Hà Nội', TRUE),

-- Transportation (Hà Nội)
('LLM184', 'bến xe mỹ đình', 'POI Search', 3500, 'Hà Nội', TRUE),
('LLM185', 'bến xe giáp bát', 'POI Search', 2800, 'Hà Nội', TRUE),
('LLM186', 'ga tàu hà nội', 'POI Search', 2100, 'Hà Nội', TRUE),
('LLM187', 'bãi đỗ xe hà nội', 'Nearby Search', 2600, 'Hà Nội', TRUE),
('LLM188', 'trạm xe buýt hà nội', 'Nearby Search', 1800, 'Hà Nội', TRUE),
('LLM189', 'chỉ đường sân bay nội bài', 'Discovery Search', 3600, 'Hà Nội', TRUE),

-- Shopping (Hà Nội)
('LLM190', 'trung tâm thương mại hà nội', 'Category Search', 3900, 'Hà Nội', TRUE),
('LLM191', 'chợ đồng xuân', 'POI Search', 2300, 'Hà Nội', TRUE),
('LLM192', 'chợ đêm hà nội', 'POI Search', 2100, 'Hà Nội', TRUE),
('LLM193', 'aeon mall hà đông', 'POI Search', 2700, 'Hà Nội', TRUE),
('LLM194', 'vincom bà triệu', 'POI Search', 2400, 'Hà Nội', TRUE),
('LLM195', 'lotte mart hà nội', 'POI Search', 1800, 'Hà Nội', TRUE),
('LLM196', 'phố hàng đào', 'POI Search', 1500, 'Hà Nội', TRUE),

-- Entertainment (Hà Nội)
('LLM197', 'rạp chiếu phim hà nội', 'Category Search', 3200, 'Hà Nội', TRUE),
('LLM198', 'karaoke hà nội', 'Category Search', 2500, 'Hà Nội', TRUE),
('LLM199', 'quán bar hà nội', 'Category Search', 2400, 'Hà Nội', TRUE),
('LLM200', 'check in hà nội', 'Discovery Search', 4800, 'Hà Nội', TRUE),
('LLM201', 'địa điểm du lịch hà nội', 'Discovery Search', 5200, 'Hà Nội', TRUE),
('LLM202', 'hồ hoàn kiếm', 'POI Search', 4100, 'Hà Nội', TRUE),
('LLM203', 'phố cổ hà nội', 'POI Search', 3800, 'Hà Nội', TRUE),
('LLM204', 'văn miếu quốc tử giám', 'POI Search', 2900, 'Hà Nội', TRUE),
('LLM205', 'lăng bác hà nội', 'POI Search', 3500, 'Hà Nội', TRUE),
('LLM206', 'hồ tây hà nội', 'POI Search', 3300, 'Hà Nội', TRUE),
('LLM207', 'công viên thủ lệ', 'POI Search', 1900, 'Hà Nội', TRUE),
('LLM208', 'bảo tàng hà nội', 'POI Search', 1600, 'Hà Nội', TRUE),
('LLM209', 'chùa một cột', 'POI Search', 2200, 'Hà Nội', TRUE),
('LLM210', 'nhà hát lớn hà nội', 'POI Search', 1800, 'Hà Nội', TRUE),
('LLM211', 'hoàng thành thăng long', 'POI Search', 1900, 'Hà Nội', TRUE),

-- Lodging (Hà Nội)
('LLM212', 'khách sạn hà nội', 'Category Search', 5200, 'Hà Nội', TRUE),
('LLM213', 'nhà nghỉ hà nội', 'Category Search', 1800, 'Hà Nội', TRUE),
('LLM214', 'homestay hà nội', 'Discovery Search', 2600, 'Hà Nội', TRUE),
('LLM215', 'resort gần hà nội', 'Discovery Search', 2200, 'Hà Nội', TRUE),
('LLM216', 'khách sạn giá rẻ hà nội', 'Discovery Search', 3300, 'Hà Nội', TRUE),
('LLM217', 'khách sạn gần hồ hoàn kiếm', 'Nearby Search', 3600, 'Hà Nội', TRUE),

-- Education (Hà Nội)
('LLM218', 'đại học quốc gia hà nội', 'POI Search', 2200, 'Hà Nội', TRUE),
('LLM219', 'trung tâm ngoại ngữ hà nội', 'Category Search', 2100, 'Hà Nội', TRUE),
('LLM220', 'đại học bách khoa hà nội', 'POI Search', 2600, 'Hà Nội', TRUE),
('LLM221', 'đại học ngoại thương hà nội', 'POI Search', 1700, 'Hà Nội', TRUE),

-- Other (Hà Nội)
('LLM222', 'thời tiết hà nội', 'Discovery Search', 6800, 'Hà Nội', TRUE),
('LLM223', 'kẹt xe hà nội', 'Discovery Search', 5700, 'Hà Nội', TRUE),
('LLM224', 'bãi giữ xe hà nội', 'Nearby Search', 1700, 'Hà Nội', TRUE),
('LLM225', 'nhà sách hà nội', 'Category Search', 2100, 'Hà Nội', TRUE),

-- Brand Search (Hà Nội)
('LLM226', 'highlands coffee hà nội', 'Brand Search', 3100, 'Hà Nội', TRUE),
('LLM227', 'cộng cà phê hà nội', 'Brand Search', 3200, 'Hà Nội', TRUE),
('LLM228', 'phúc long hà nội', 'Brand Search', 2600, 'Hà Nội', TRUE),
('LLM229', 'the coffee house hà nội', 'Brand Search', 2200, 'Hà Nội', TRUE),
('LLM230', 'lotteria hà nội', 'Brand Search', 2300, 'Hà Nội', TRUE),
('LLM231', 'kfc hà nội', 'Brand Search', 1800, 'Hà Nội', TRUE),
('LLM232', 'circle k hà nội', 'Brand Search', 1900, 'Hà Nội', TRUE),
('LLM233', 'bach hoa xanh hà nội', 'Brand Search', 2800, 'Hà Nội', TRUE),

-- Specific POIs (Hà Nội)
('LLM234', 'phở thìn lò đúc', 'POI Search', 3400, 'Hà Nội', TRUE),
('LLM235', 'phở gia truyền bát đàn', 'POI Search', 2100, 'Hà Nội', TRUE),
('LLM236', 'bún chả hương liên', 'POI Search', 2600, 'Hà Nội', TRUE),
('LLM237', 'bánh cuốn bà xuân', 'POI Search', 1300, 'Hà Nội', TRUE),
('LLM238', 'cafe giảng trứng', 'POI Search', 2800, 'Hà Nội', TRUE),
('LLM239', 'kem tràng tiền', 'POI Search', 2200, 'Hà Nội', TRUE),
('LLM240', 'vincom mega mall times city', 'POI Search', 2000, 'Hà Nội', TRUE),
('LLM241', 'cầu long biên', 'POI Search', 1700, 'Hà Nội', TRUE),
('LLM242', 'phố đi bộ hồ gươm', 'POI Search', 4200, 'Hà Nội', TRUE),

-- More F&B (Hà Nội)
('LLM243', 'bún thang hà nội', 'Category Search', 1100, 'Hà Nội', TRUE),
('LLM244', 'miến lươn hà nội', 'Category Search', 1300, 'Hà Nội', TRUE),
('LLM245', 'bánh tôm hồ tây', 'POI Search', 1600, 'Hà Nội', TRUE),
('LLM246', 'xôi xéo hà nội', 'Category Search', 1200, 'Hà Nội', TRUE),
('LLM247', 'bánh gối hà nội', 'Category Search', 800, 'Hà Nội', TRUE),
('LLM248', 'kem xôi hà nội', 'Category Search', 900, 'Hà Nội', TRUE),
('LLM249', 'cafe view đẹp hà nội', 'Discovery Search', 3100, 'Hà Nội', TRUE),
('LLM250', 'quán ăn sáng hà nội', 'Category Search', 2900, 'Hà Nội', TRUE),
('LLM251', 'cơm bình dân hà nội', 'Category Search', 2000, 'Hà Nội', TRUE),
('LLM252', 'quán nhậu hà nội', 'Category Search', 3300, 'Hà Nội', TRUE),
('LLM253', 'nhà hàng hàn quốc hà nội', 'Category Search', 2100, 'Hà Nội', TRUE),
('LLM254', 'nhà hàng nhật bản hà nội', 'Category Search', 1800, 'Hà Nội', TRUE),
('LLM255', 'quán cafe làm việc hà nội', 'Discovery Search', 2800, 'Hà Nội', TRUE),
('LLM256', 'địa điểm hẹn hò hà nội', 'Discovery Search', 3700, 'Hà Nội', TRUE),
('LLM257', 'quán cafe đẹp hà nội', 'Discovery Search', 3500, 'Hà Nội', TRUE),

-- Services more (Hà Nội)
('LLM258', 'bệnh viện nhi trung ương', 'POI Search', 2500, 'Hà Nội', TRUE),
('LLM259', 'bệnh viện việt đức', 'POI Search', 2800, 'Hà Nội', TRUE),
('LLM260', 'bệnh viện đại học y hà nội', 'POI Search', 1700, 'Hà Nội', TRUE),
('LLM261', 'trạm sạc xe điện hà nội', 'Nearby Search', 1300, 'Hà Nội', TRUE),
('LLM262', 'trung tâm đăng kiểm hà nội', 'Category Search', 1000, 'Hà Nội', TRUE),
('LLM263', 'cửa hàng điện thoại hà nội', 'Category Search', 1800, 'Hà Nội', TRUE),
('LLM264', 'sửa điện thoại hà nội', 'Category Search', 1500, 'Hà Nội', TRUE),

-- Discovery more (Hà Nội)
('LLM265', 'khám phá ẩm thực phố cổ', 'Discovery Search', 2200, 'Hà Nội', TRUE),
('LLM266', 'quán cafe sân vườn hà nội', 'Discovery Search', 2000, 'Hà Nội', TRUE),
('LLM267', 'nhà hàng đẹp hà nội', 'Discovery Search', 2900, 'Hà Nội', TRUE),
('LLM268', 'quán ăn ngon hà nội', 'Discovery Search', 3800, 'Hà Nội', TRUE),
('LLM269', 'ăn gì ở hà nội', 'Discovery Search', 4000, 'Hà Nội', TRUE),
('LLM270', 'địa điểm chụp ảnh đẹp hà nội', 'Discovery Search', 3200, 'Hà Nội', TRUE),
('LLM271', 'chỗ chơi tết hà nội', 'Discovery Search', 2900, 'Hà Nội', TRUE),
('LLM272', 'phòng gym 24h hà nội', 'Discovery Search', 1600, 'Hà Nội', TRUE),
('LLM273', 'nhà hàng chay hà nội', 'Category Search', 1500, 'Hà Nội', TRUE),
('LLM274', 'quán cafe cổ hà nội', 'Discovery Search', 1800, 'Hà Nội', TRUE),
('LLM275', 'tiệm bánh hà nội', 'Category Search', 1700, 'Hà Nội', TRUE),

-- ============================
-- Đà Nẵng (~15% = 75 rows)
-- ============================

-- Food & Drinks (Đà Nẵng)
('LLM276', 'quán ăn đà nẵng', 'Category Search', 4800, 'Đà Nẵng', TRUE),
('LLM277', 'hải sản đà nẵng', 'Category Search', 4200, 'Đà Nẵng', TRUE),
('LLM278', 'mì quảng đà nẵng', 'Category Search', 3200, 'Đà Nẵng', TRUE),
('LLM279', 'bún chả cá đà nẵng', 'Category Search', 2600, 'Đà Nẵng', TRUE),
('LLM280', 'bánh xèo đà nẵng', 'Category Search', 2300, 'Đà Nẵng', TRUE),
('LLM281', 'cafe đà nẵng', 'Category Search', 3500, 'Đà Nẵng', TRUE),
('LLM282', 'quán nhậu đà nẵng', 'Category Search', 3000, 'Đà Nẵng', TRUE),
('LLM283', 'bánh tráng thịt heo đà nẵng', 'Category Search', 2000, 'Đà Nẵng', TRUE),
('LLM284', 'bún bò huế đà nẵng', 'Category Search', 1900, 'Đà Nẵng', TRUE),
('LLM285', 'cơm gà đà nẵng', 'Category Search', 1500, 'Đà Nẵng', TRUE),
('LLM286', 'chè đà nẵng', 'Category Search', 1400, 'Đà Nẵng', TRUE),
('LLM287', 'kem bơ đà nẵng', 'Category Search', 1100, 'Đà Nẵng', TRUE),
('LLM288', 'cà phê rang xay đà nẵng', 'Category Search', 1000, 'Đà Nẵng', TRUE),

-- Services (Đà Nẵng)
('LLM289', 'atm đà nẵng', 'Nearby Search', 2800, 'Đà Nẵng', TRUE),
('LLM290', 'cây xăng đà nẵng', 'Nearby Search', 2400, 'Đà Nẵng', TRUE),
('LLM291', 'bệnh viện đà nẵng', 'Category Search', 2500, 'Đà Nẵng', TRUE),
('LLM292', 'phòng khám đà nẵng', 'Category Search', 1500, 'Đà Nẵng', TRUE),
('LLM293', 'nhà thuốc đà nẵng', 'Nearby Search', 2100, 'Đà Nẵng', TRUE),
('LLM294', 'siêu thị đà nẵng', 'Category Search', 2200, 'Đà Nẵng', TRUE),
('LLM295', 'spa đà nẵng', 'Category Search', 1900, 'Đà Nẵng', TRUE),
('LLM296', 'gym đà nẵng', 'Category Search', 1300, 'Đà Nẵng', TRUE),

-- Transportation (Đà Nẵng)
('LLM297', 'sân bay đà nẵng', 'POI Search', 4200, 'Đà Nẵng', TRUE),
('LLM298', 'bến xe đà nẵng', 'POI Search', 1900, 'Đà Nẵng', TRUE),
('LLM299', 'ga tàu đà nẵng', 'POI Search', 1400, 'Đà Nẵng', TRUE),
('LLM300', 'bãi đỗ xe đà nẵng', 'Nearby Search', 1800, 'Đà Nẵng', TRUE),

-- Shopping (Đà Nẵng)
('LLM301', 'trung tâm thương mại đà nẵng', 'Category Search', 2400, 'Đà Nẵng', TRUE),
('LLM302', 'chợ hàn đà nẵng', 'POI Search', 2500, 'Đà Nẵng', TRUE),
('LLM303', 'chợ cồn đà nẵng', 'POI Search', 1900, 'Đà Nẵng', TRUE),
('LLM304', 'vincom đà nẵng', 'POI Search', 1800, 'Đà Nẵng', TRUE),
('LLM305', 'lotte mart đà nẵng', 'POI Search', 1400, 'Đà Nẵng', TRUE),

-- Entertainment (Đà Nẵng)
('LLM306', 'rạp chiếu phim đà nẵng', 'Category Search', 2000, 'Đà Nẵng', TRUE),
('LLM307', 'karaoke đà nẵng', 'Category Search', 1600, 'Đà Nẵng', TRUE),
('LLM308', 'quán bar đà nẵng', 'Category Search', 2100, 'Đà Nẵng', TRUE),
('LLM309', 'bãi biển mỹ khê', 'POI Search', 4800, 'Đà Nẵng', TRUE),
('LLM310', 'bà nà hills', 'POI Search', 4500, 'Đà Nẵng', TRUE),
('LLM311', 'cầu rồng đà nẵng', 'POI Search', 3200, 'Đà Nẵng', TRUE),
('LLM312', 'phố cổ hội an', 'POI Search', 4200, 'Đà Nẵng', TRUE),
('LLM313', 'cầu vàng bà nà', 'POI Search', 3500, 'Đà Nẵng', TRUE),
('LLM314', 'ngũ hành sơn', 'POI Search', 2600, 'Đà Nẵng', TRUE),
('LLM315', 'bán đảo sơn trà', 'POI Search', 1800, 'Đà Nẵng', TRUE),
('LLM316', 'bãi biển non nước', 'POI Search', 1400, 'Đà Nẵng', TRUE),
('LLM317', 'chùa linh ứng sơn trà', 'POI Search', 1600, 'Đà Nẵng', TRUE),
('LLM318', 'cáp treo bà nà', 'POI Search', 2200, 'Đà Nẵng', TRUE),

-- Lodging (Đà Nẵng)
('LLM319', 'khách sạn gần biển đà nẵng', 'Discovery Search', 4600, 'Đà Nẵng', TRUE),
('LLM320', 'resort đà nẵng', 'Discovery Search', 2800, 'Đà Nẵng', TRUE),
('LLM321', 'homestay đà nẵng', 'Discovery Search', 2100, 'Đà Nẵng', TRUE),
('LLM322', 'khách sạn giá rẻ đà nẵng', 'Discovery Search', 3100, 'Đà Nẵng', TRUE),
('LLM323', 'khách sạn đà nẵng gần sân bay', 'Nearby Search', 2500, 'Đà Nẵng', TRUE),

-- Other (Đà Nẵng)
('LLM324', 'thời tiết đà nẵng', 'Discovery Search', 3800, 'Đà Nẵng', TRUE),
('LLM325', 'check in đà nẵng', 'Discovery Search', 3200, 'Đà Nẵng', TRUE),
('LLM326', 'địa điểm du lịch đà nẵng', 'Discovery Search', 4200, 'Đà Nẵng', TRUE),
('LLM327', 'ăn gì đà nẵng', 'Discovery Search', 3600, 'Đà Nẵng', TRUE),

-- Brand Search + More (Đà Nẵng)
('LLM328', 'highlands coffee đà nẵng', 'Brand Search', 2000, 'Đà Nẵng', TRUE),
('LLM329', 'cộng cà phê đà nẵng', 'Brand Search', 1700, 'Đà Nẵng', TRUE),
('LLM330', 'phúc long đà nẵng', 'Brand Search', 1500, 'Đà Nẵng', TRUE),
('LLM331', 'pizza 4p s đà nẵng', 'Brand Search', 1400, 'Đà Nẵng', TRUE),
('LLM332', 'quán cafe view biển đà nẵng', 'Discovery Search', 2600, 'Đà Nẵng', TRUE),
('LLM333', 'nhà hàng hải sản ngon đà nẵng', 'Discovery Search', 2900, 'Đà Nẵng', TRUE),
('LLM334', 'cafe rooftop đà nẵng', 'Discovery Search', 1800, 'Đà Nẵng', TRUE),
('LLM335', 'quán cafe làm việc đà nẵng', 'Discovery Search', 1400, 'Đà Nẵng', TRUE),
('LLM336', 'địa điểm hẹn hò đà nẵng', 'Discovery Search', 2300, 'Đà Nẵng', TRUE),

-- More specific (Đà Nẵng)
('LLM337', 'bánh canh cá lóc đà nẵng', 'Category Search', 800, 'Đà Nẵng', TRUE),
('LLM338', 'mỳ quảng ếch đà nẵng', 'Category Search', 700, 'Đà Nẵng', TRUE),
('LLM339', 'bún mắm nêm đà nẵng', 'Category Search', 900, 'Đà Nẵng', TRUE),
('LLM340', 'cơm hến đà nẵng', 'Category Search', 600, 'Đà Nẵng', TRUE),
('LLM341', 'bánh bột lọc đà nẵng', 'Category Search', 700, 'Đà Nẵng', TRUE),
('LLM342', 'nem lụi đà nẵng', 'Category Search', 600, 'Đà Nẵng', TRUE),
('LLM343', 'bánh khọt đà nẵng', 'Category Search', 500, 'Đà Nẵng', TRUE),
('LLM344', 'chợ đêm sơn trà', 'POI Search', 1100, 'Đà Nẵng', TRUE),
('LLM345', 'phố đi bộ bạch đằng', 'POI Search', 1300, 'Đà Nẵng', TRUE),
('LLM346', 'công viên châu á đà nẵng', 'POI Search', 1500, 'Đà Nẵng', TRUE),
('LLM347', 'suối khoáng nóng thần tài', 'POI Search', 1800, 'Đà Nẵng', TRUE),
('LLM348', 'vinpearl land nam hội an', 'POI Search', 2100, 'Đà Nẵng', TRUE),
('LLM349', 'làng bích họa tam thanh', 'POI Search', 900, 'Đà Nẵng', TRUE),
('LLM350', 'cù lao chàm', 'POI Search', 1700, 'Đà Nẵng', TRUE),

-- ============================
-- Toàn quốc (~10% = 50 rows)
-- ============================

('LLM351', 'thời tiết hôm nay', 'Discovery Search', 10500, 'Toàn quốc', TRUE),
('LLM352', 'dự báo thời tiết', 'Discovery Search', 9800, 'Toàn quốc', TRUE),
('LLM353', 'bão mới nhất', 'Discovery Search', 7200, 'Toàn quốc', TRUE),
('LLM354', 'sân bay gần nhất', 'Nearby Search', 4500, 'Toàn quốc', TRUE),
('LLM355', 'bến xe gần nhất', 'Nearby Search', 3900, 'Toàn quốc', TRUE),
('LLM356', 'khách sạn gần đây', 'Nearby Search', 6800, 'Toàn quốc', TRUE),
('LLM357', 'nhà nghỉ gần đây', 'Nearby Search', 4200, 'Toàn quốc', TRUE),
('LLM358', 'cửa hàng tiện lợi 24h', 'Nearby Search', 5100, 'Toàn quốc', TRUE),
('LLM359', 'atm gần nhất', 'Nearby Search', 6600, 'Toàn quốc', TRUE),
('LLM360', 'trạm xăng gần nhất', 'Nearby Search', 5800, 'Toàn quốc', TRUE),
('LLM361', 'bệnh viện gần đây', 'Nearby Search', 4700, 'Toàn quốc', TRUE),
('LLM362', 'phòng khám gần nhất', 'Nearby Search', 3600, 'Toàn quốc', TRUE),
('LLM363', 'nhà thuốc 24h', 'Nearby Search', 4100, 'Toàn quốc', TRUE),
('LLM364', 'siêu thị gần nhất', 'Nearby Search', 3900, 'Toàn quốc', TRUE),
('LLM365', 'ngân hàng gần nhất', 'Nearby Search', 3400, 'Toàn quốc', TRUE),
('LLM366', 'bưu điện gần đây', 'Nearby Search', 2100, 'Toàn quốc', TRUE),
('LLM367', 'đồn công an gần nhất', 'Nearby Search', 1900, 'Toàn quốc', TRUE),
('LLM368', 'quán ăn ngon gần đây', 'Discovery Search', 6400, 'Toàn quốc', TRUE),
('LLM369', 'trà sữa gần nhất', 'Nearby Search', 4800, 'Toàn quốc', TRUE),
('LLM370', 'cafe wifi miễn phí', 'Discovery Search', 3700, 'Toàn quốc', TRUE),
('LLM371', 'nhà hàng ngon gần đây', 'Discovery Search', 5200, 'Toàn quốc', TRUE),
('LLM372', 'bãi đỗ xe gần đây', 'Nearby Search', 4300, 'Toàn quốc', TRUE),
('LLM373', 'rửa xe gần đây', 'Nearby Search', 2800, 'Toàn quốc', TRUE),
('LLM374', 'tiệm sửa xe gần đây', 'Nearby Search', 3200, 'Toàn quốc', TRUE),
('LLM375', 'spa gần đây', 'Nearby Search', 2900, 'Toàn quốc', TRUE),
('LLM376', 'gym gần đây', 'Nearby Search', 2500, 'Toàn quốc', TRUE),
('LLM377', 'karaoke gần đây', 'Nearby Search', 2600, 'Toàn quốc', TRUE),
('LLM378', 'rạp chiếu phim gần nhất', 'Nearby Search', 3100, 'Toàn quốc', TRUE),
('LLM379', 'quán cafe học bài', 'Discovery Search', 3600, 'Toàn quốc', TRUE),
('LLM380', 'quán ăn chay gần đây', 'Discovery Search', 2100, 'Toàn quốc', TRUE),
('LLM381', 'nhà hàng buffet gần đây', 'Discovery Search', 2700, 'Toàn quốc', TRUE),
('LLM382', 'quán lẩu gần đây', 'Discovery Search', 3100, 'Toàn quốc', TRUE),
('LLM383', 'quán nướng gần đây', 'Discovery Search', 2800, 'Toàn quốc', TRUE),
('LLM384', 'hải sản gần đây', 'Discovery Search', 2500, 'Toàn quốc', TRUE),
('LLM385', 'ăn đêm gần đây', 'Discovery Search', 3300, 'Toàn quốc', TRUE),
('LLM386', 'cây xăng trên đường đi', 'Discovery Search', 3800, 'Toàn quốc', TRUE),
('LLM387', 'trạm dừng chân cao tốc', 'Nearby Search', 2200, 'Toàn quốc', TRUE),
('LLM388', 'trạm sạc xe điện', 'Nearby Search', 1700, 'Toàn quốc', TRUE),
('LLM389', 'địa điểm du lịch gần đây', 'Discovery Search', 4400, 'Toàn quốc', TRUE),
('LLM390', 'chợ gần đây', 'Nearby Search', 3800, 'Toàn quốc', TRUE),
('LLM391', 'coopmart gần đây', 'Brand Search', 2400, 'Toàn quốc', TRUE),
('LLM392', 'bach hoa xanh gần đây', 'Brand Search', 3500, 'Toàn quốc', TRUE),
('LLM393', 'winmart gần đây', 'Brand Search', 2600, 'Toàn quốc', TRUE),
('LLM394', 'highlands coffee gần đây', 'Brand Search', 3000, 'Toàn quốc', TRUE),
('LLM395', 'phúc long gần nhất', 'Brand Search', 2800, 'Toàn quốc', TRUE),
('LLM396', 'lotteria gần đây', 'Brand Search', 2200, 'Toàn quốc', TRUE),
('LLM397', 'cây xăng petr andimex gần đây', 'Brand Search', 1900, 'Toàn quốc', TRUE),
('LLM398', 'vietcombank gần đây', 'Brand Search', 2500, 'Toàn quốc', TRUE),
('LLM399', 'bidv gần đây', 'Brand Search', 2100, 'Toàn quốc', TRUE),
('LLM400', 'agribank gần đây', 'Brand Search', 1800, 'Toàn quốc', TRUE),

-- ============================
-- Nha Trang (~5% = 25 rows)
-- ============================

('LLM401', 'hải sản nha trang', 'Category Search', 3000, 'Nha Trang', TRUE),
('LLM402', 'quán ăn nha trang', 'Category Search', 2500, 'Nha Trang', TRUE),
('LLM403', 'khách sạn nha trang', 'Category Search', 3800, 'Nha Trang', TRUE),
('LLM404', 'resort nha trang', 'Discovery Search', 2100, 'Nha Trang', TRUE),
('LLM405', 'bãi biển nha trang', 'POI Search', 2900, 'Nha Trang', TRUE),
('LLM406', 'vinpearl nha trang', 'POI Search', 2800, 'Nha Trang', TRUE),
('LLM407', 'lặn biển nha trang', 'Discovery Search', 1400, 'Nha Trang', TRUE),
('LLM408', 'bún cá nha trang', 'Category Search', 1800, 'Nha Trang', TRUE),
('LLM409', 'nem nướng nha trang', 'Category Search', 1600, 'Nha Trang', TRUE),
('LLM410', 'tháp bà nha trang', 'POI Search', 1500, 'Nha Trang', TRUE),
('LLM411', 'đảo yến nha trang', 'POI Search', 1100, 'Nha Trang', TRUE),
('LLM412', 'hòn chồng nha trang', 'POI Search', 900, 'Nha Trang', TRUE),
('LLM413', 'suối khoáng nóng nha trang', 'POI Search', 1300, 'Nha Trang', TRUE),
('LLM414', 'chợ đêm nha trang', 'POI Search', 1800, 'Nha Trang', TRUE),
('LLM415', 'buffet hải sản nha trang', 'Discovery Search', 1900, 'Nha Trang', TRUE),
('LLM416', 'thời tiết nha trang', 'Discovery Search', 2200, 'Nha Trang', TRUE),
('LLM417', 'địa điểm du lịch nha trang', 'Discovery Search', 2500, 'Nha Trang', TRUE),
('LLM418', 'cafe view biển nha trang', 'Discovery Search', 1700, 'Nha Trang', TRUE),
('LLM419', 'sân bay cam ranh', 'POI Search', 2000, 'Nha Trang', TRUE),
('LLM420', 'bến tàu nha trang', 'POI Search', 800, 'Nha Trang', TRUE),
('LLM421', 'nhà hàng hải sản ngon nha trang', 'Discovery Search', 2100, 'Nha Trang', TRUE),
('LLM422', 'homestay nha trang', 'Discovery Search', 1200, 'Nha Trang', TRUE),
('LLM423', 'bánh canh chả cá nha trang', 'Category Search', 900, 'Nha Trang', TRUE),
('LLM424', 'bánh xèo nha trang', 'Category Search', 700, 'Nha Trang', TRUE),
('LLM425', 'công viên nước nha trang', 'POI Search', 600, 'Nha Trang', TRUE),

-- ============================
-- Đà Lạt (~4% = 18 rows)
-- ============================

('LLM426', 'du lịch đà lạt', 'Discovery Search', 4200, 'Đà Lạt', TRUE),
('LLM427', 'khách sạn đà lạt', 'Category Search', 3200, 'Đà Lạt', TRUE),
('LLM428', 'homestay đà lạt', 'Discovery Search', 2800, 'Đà Lạt', TRUE),
('LLM429', 'quán cafe đẹp đà lạt', 'Discovery Search', 3100, 'Đà Lạt', TRUE),
('LLM430', 'địa điểm check in đà lạt', 'Discovery Search', 3800, 'Đà Lạt', TRUE),
('LLM431', 'thời tiết đà lạt', 'Discovery Search', 2500, 'Đà Lạt', TRUE),
('LLM432', 'vườn hoa đà lạt', 'POI Search', 1800, 'Đà Lạt', TRUE),
('LLM433', 'thác voi đà lạt', 'POI Search', 900, 'Đà Lạt', TRUE),
('LLM434', 'đồi chè cầu đất', 'POI Search', 1500, 'Đà Lạt', TRUE),
('LLM435', 'lẩu gà lá é đà lạt', 'Category Search', 2100, 'Đà Lạt', TRUE),
('LLM436', 'bánh tráng nướng đà lạt', 'Category Search', 1700, 'Đà Lạt', TRUE),
('LLM437', 'cafe săn mây đà lạt', 'Discovery Search', 2000, 'Đà Lạt', TRUE),
('LLM438', 'chợ đêm đà lạt', 'POI Search', 1900, 'Đà Lạt', TRUE),
('LLM439', 'ga đà lạt', 'POI Search', 1100, 'Đà Lạt', TRUE),
('LLM440', 'thung lũng tình yêu đà lạt', 'POI Search', 1400, 'Đà Lạt', TRUE),
('LLM441', 'resort đà lạt', 'Discovery Search', 1700, 'Đà Lạt', TRUE),
('LLM442', 'nhà hàng đà lạt', 'Category Search', 2000, 'Đà Lạt', TRUE),
('LLM443', 'cắm trại đà lạt', 'Discovery Search', 1600, 'Đà Lạt', TRUE),

-- ============================
-- Hải Phòng (~2% = 10 rows)
-- ============================

('LLM444', 'hải sản hải phòng', 'Category Search', 1900, 'Hải Phòng', TRUE),
('LLM445', 'đồ sơn hải phòng', 'POI Search', 1700, 'Hải Phòng', TRUE),
('LLM446', 'cát bà hải phòng', 'POI Search', 1600, 'Hải Phòng', TRUE),
('LLM447', 'bánh đa cua hải phòng', 'Category Search', 1200, 'Hải Phòng', TRUE),
('LLM448', 'khách sạn hải phòng', 'Category Search', 1800, 'Hải Phòng', TRUE),
('LLM449', 'quán ăn hải phòng', 'Category Search', 1400, 'Hải Phòng', TRUE),
('LLM450', 'du lịch hải phòng', 'Discovery Search', 2000, 'Hải Phòng', TRUE),
('LLM451', 'sân bay cát bi', 'POI Search', 1100, 'Hải Phòng', TRUE),
('LLM452', 'bến phà cát bà', 'POI Search', 800, 'Hải Phòng', TRUE),
('LLM453', 'thời tiết hải phòng', 'Discovery Search', 1500, 'Hải Phòng', TRUE),

-- ============================
-- Cần Thơ (~2% = 10 rows)
-- ============================

('LLM454', 'quán ăn cần thơ', 'Category Search', 1300, 'Cần Thơ', TRUE),
('LLM455', 'du lịch cần thơ', 'Discovery Search', 1700, 'Cần Thơ', TRUE),
('LLM456', 'chợ nổi cái răng', 'POI Search', 1500, 'Cần Thơ', TRUE),
('LLM457', 'bến ninh kiều', 'POI Search', 1200, 'Cần Thơ', TRUE),
('LLM458', 'khách sạn cần thơ', 'Category Search', 1600, 'Cần Thơ', TRUE),
('LLM459', 'lẩu mắm cần thơ', 'Category Search', 700, 'Cần Thơ', TRUE),
('LLM460', 'bánh xèo cần thơ', 'Category Search', 600, 'Cần Thơ', TRUE),
('LLM461', 'sân bay cần thơ', 'POI Search', 1000, 'Cần Thơ', TRUE),
('LLM462', 'địa điểm du lịch cần thơ', 'Discovery Search', 1400, 'Cần Thơ', TRUE),
('LLM463', 'nhà hàng cần thơ', 'Category Search', 1100, 'Cần Thơ', TRUE),

-- ============================
-- Huế (~2% = 10 rows)
-- ============================

('LLM464', 'du lịch huế', 'Discovery Search', 2100, 'Huế', TRUE),
('LLM465', 'đại nội huế', 'POI Search', 1800, 'Huế', TRUE),
('LLM466', 'bún bò huế', 'Category Search', 2400, 'Huế', TRUE),
('LLM467', 'cơm hến huế', 'Category Search', 1100, 'Huế', TRUE),
('LLM468', 'chè huế', 'Category Search', 800, 'Huế', TRUE),
('LLM469', 'khách sạn huế', 'Category Search', 1500, 'Huế', TRUE),
('LLM470', 'lăng tẩm huế', 'POI Search', 1200, 'Huế', TRUE),
('LLM471', 'quán ăn huế', 'Category Search', 1000, 'Huế', TRUE),
('LLM472', 'sông hương huế', 'POI Search', 900, 'Huế', TRUE),
('LLM473', 'địa điểm du lịch huế', 'Discovery Search', 1400, 'Huế', TRUE),

-- ============================
-- Vũng Tàu (~2% = 10 rows)
-- ============================

('LLM474', 'du lịch vũng tàu', 'Discovery Search', 2300, 'Vũng Tàu', TRUE),
('LLM475', 'khách sạn vũng tàu', 'Category Search', 1800, 'Vũng Tàu', TRUE),
('LLM476', 'bãi biển vũng tàu', 'POI Search', 2000, 'Vũng Tàu', TRUE),
('LLM477', 'hải sản vũng tàu', 'Category Search', 1700, 'Vũng Tàu', TRUE),
('LLM478', 'tượng chúa kitô vũng tàu', 'POI Search', 1200, 'Vũng Tàu', TRUE),
('LLM479', 'hồ mây park vũng tàu', 'POI Search', 1000, 'Vũng Tàu', TRUE),
('LLM480', 'homestay vũng tàu', 'Discovery Search', 1100, 'Vũng Tàu', TRUE),
('LLM481', 'resort vũng tàu', 'Discovery Search', 1300, 'Vũng Tàu', TRUE),
('LLM482', 'thời tiết vũng tàu', 'Discovery Search', 1400, 'Vũng Tàu', TRUE),
('LLM483', 'quán ăn vũng tàu', 'Category Search', 1200, 'Vũng Tàu', TRUE),

-- ============================
-- Phú Quốc (~2% = 8 rows)
-- ============================

('LLM484', 'du lịch phú quốc', 'Discovery Search', 2500, 'Phú Quốc', TRUE),
('LLM485', 'khách sạn phú quốc', 'Category Search', 1900, 'Phú Quốc', TRUE),
('LLM486', 'resort phú quốc', 'Discovery Search', 1700, 'Phú Quốc', TRUE),
('LLM487', 'vinpearl phú quốc', 'POI Search', 1800, 'Phú Quốc', TRUE),
('LLM488', 'bãi sao phú quốc', 'POI Search', 1300, 'Phú Quốc', TRUE),
('LLM489', 'chợ đêm phú quốc', 'POI Search', 1400, 'Phú Quốc', TRUE),
('LLM490', 'cáp treo hòn thơm', 'POI Search', 1000, 'Phú Quốc', TRUE),
('LLM491', 'hải sản phú quốc', 'Category Search', 1500, 'Phú Quốc', TRUE),

-- ============================
-- Attribute Search — cross-region (~2% = 9 rows)
-- ============================

('LLM492', 'quán cafe có wifi mạnh', 'Attribute Search', 2300, 'TP.HCM', TRUE),
('LLM493', 'quán ăn có máy lạnh', 'Attribute Search', 1800, 'TP.HCM', TRUE),
('LLM494', 'nhà hàng có phòng riêng', 'Attribute Search', 1400, 'Hà Nội', TRUE),
('LLM495', 'khách sạn có hồ bơi', 'Attribute Search', 2100, 'Đà Nẵng', TRUE),
('LLM496', 'cafe có chỗ đậu xe hơi', 'Attribute Search', 1200, 'TP.HCM', TRUE),
('LLM497', 'quán ăn phù hợp trẻ em', 'Attribute Search', 1600, 'Hà Nội', TRUE),
('LLM498', 'khách sạn cho phép thú cưng', 'Attribute Search', 1000, 'Toàn quốc', TRUE),
('LLM499', 'nhà hàng có view đẹp', 'Attribute Search', 2500, 'TP.HCM', TRUE),
('LLM500', 'cafe yên tĩnh làm việc', 'Attribute Search', 2200, 'Hà Nội', TRUE);

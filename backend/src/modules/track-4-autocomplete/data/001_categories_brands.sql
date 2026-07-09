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

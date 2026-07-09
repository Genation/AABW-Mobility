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


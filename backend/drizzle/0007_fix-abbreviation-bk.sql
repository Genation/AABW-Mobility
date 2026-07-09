-- Fix abbreviation collision: bk → Bách Khoa (category, highest priority)
-- Also add key missing map-search abbreviations
INSERT INTO "track_4_abbreviations" ("abbreviation", "expanded_form", "type", "is_generated") VALUES
('bk', 'Bách Khoa', 'category', true),
('nx', 'Nhà xuất bản', 'category', true),
('tnhh', 'Trách nhiệm hữu hạn', 'category', true),
('cp', 'Cổ phần', 'category', true);

# Edge-Case Matrix

Backend: `sentence-transformer`; invocation: `default`

## Deterministic Gates

| Case | Baseline | Current | Detail |
|---|---|---|---|
| A01 | PASS | PASS | ['Highlands Coffee', 'Highlands Coffee Nguyễn Huệ', 'Highlands Coffee Quán cà phê Võ Nguyên Giáp Đà Nẵng', 'Highlands Coffee ATM Pasteur Nha Trang', 'Highlands Coffee Quán cà phê Lê Lợi Nha Trang', 'Highlands Coffee Nguyễn Trãi', 'Highlands Coffee Lê Duẩn', 'Highlands Coffee Phạm Văn Đồng'] |
| A04 | FAIL | PASS | ["Pizza 4P's Lê Thánh Tôn", "Nhà hàng Pizza 4P's Bến Nghé", "Pizza 4P's", 'Nhà hàng'] |
| A18 | FAIL | PASS | ['TP Hồ Chí Minh'] |
| A22 | FAIL | PASS | ['GO! Phường 3', 'GO! Phường 2', 'GO!', 'Trung tâm thương mại'] |
| A08a | PASS | PASS | ['Phở Thìn Lò Đúc', 'Phở gần đây', 'Phở Thìn', 'Phở Truyền Thống Kim Mã', 'Phở Truyền Thống Xuân Thủy', 'Phở bò tái gần đây', 'Phở bò tái ngon', 'Phở ngon'] |
| A08b | PASS | PASS | ['Phở Thìn Lò Đúc', 'Phở gần đây', 'Phở Thìn', 'Phở Truyền Thống Kim Mã', 'Phở Truyền Thống Xuân Thủy', 'Phở bò tái gần đây', 'Phở bò tái ngon', 'Phở ngon'] |
| A08c | FAIL | PASS | ['Phở Thìn Lò Đúc', 'Phở gần đây', 'Phở Thìn', 'Phở Truyền Thống Xuân Thủy', 'Phở Truyền Thống Kim Mã', 'Phở bò tái gần đây', 'Phở ngon', 'Phở bò tái ngon'] |
| A10a | PASS | PASS | ['Khách sạn Đà Nẵng', 'Bãi biển Mỹ Khê Đà Nẵng'] |
| A10b | FAIL | PASS | ['Khách sạn Đà Nẵng', 'Bãi biển Mỹ Khê Đà Nẵng'] |
| A10c | PASS | PASS | ['Khách sạn Đà Nẵng', 'Bãi biển Mỹ Khê Đà Nẵng'] |
| A20 | FAIL | PASS | ['GO!', 'Golden Lotus Phường 4', 'GO! Phường 3', 'GO! Phường 2', 'Golden Lotus Đống Đa', 'Golden Lotus', 'Gỏi cuốn chay gần đây', 'Gỏi cuốn gần đây'] |
| B-TYPO | PASS | PASS | {'raw': 'chữa hàng tiện lợi', 'normalized_query': 'Cửa hàng tiện lợi', 'intent': 'Category Search', 'entities': {'category': 'Cửa hàng tiện lợi'}, 'confidence': 0.61, 'source': 'deterministic'} |
| B15-POLARITY | FAIL | PASS | {'raw': 'quán ăn không thịt và gần sân bay', 'normalized_query': 'Nhà hàng gần Sân bay Tân Sơn Nhất', 'intent': 'Nearby Search', 'entities': {'category': 'Nhà hàng', 'reference_poi': 'Sân bay Tân Sơn Nhất'}, 'confidence': 0.67, 'source': 'deterministic'} |
| B15-CLAUSE | PASS | PASS | {'raw': 'quán ăn không thịt và gần sân bay', 'normalized_query': 'Nhà hàng gần Sân bay Tân Sơn Nhất', 'intent': 'Nearby Search', 'entities': {'category': 'Nhà hàng', 'reference_poi': 'Sân bay Tân Sơn Nhất'}, 'confidence': 0.67, 'source': 'deterministic'} |
| B-CATEGORY-POLARITY | FAIL | PASS | {'raw': 'không phải nhà hàng', 'normalized_query': 'Không phải Nhà hàng', 'intent': 'POI Search', 'entities': {}, 'confidence': 0.55, 'source': 'deterministic'} |
| B33 | FAIL | PASS | {'raw': 'book cafe', 'normalized_query': 'Book Cafe', 'intent': 'Category Search', 'entities': {'category': 'Quán cà phê', 'sub_category': 'Book Cafe'}, 'confidence': 0.67, 'source': 'deterministic'} |
| B34 | FAIL | PASS | {'raw': 'garden cafe', 'normalized_query': 'Garden Cafe', 'intent': 'Category Search', 'entities': {'category': 'Quán cà phê', 'sub_category': 'Garden Cafe'}, 'confidence': 0.67, 'source': 'deterministic'} |
| B35 | FAIL | PASS | {'raw': 'specialty coffee', 'normalized_query': 'Specialty Coffee', 'intent': 'Category Search', 'entities': {'category': 'Quán cà phê', 'sub_category': 'Specialty Coffee'}, 'confidence': 0.67, 'source': 'deterministic'} |
| P7-BRAND | PASS | PASS | ['Circle K Hùng Vương', 'Circle K Láng Hạ', 'Circle K Lý Thường Kiệt', 'Circle K Nguyễn Huệ', 'Circle K Phạm Văn Đồng'] |
| C-DISH | FAIL | PASS | ['Phở Thìn Lò Đúc'] |
| C-DIVERSITY | FAIL | PASS | ['acb phuong 1', 'vpbank son tra', 'techcombank dong da', 'techcombank cau giay', 'vpbank phuong 8', 'acb hai chau', 'vpbank ba dinh', 'atm vietcombank nguyen hue'] |

## Qualitative Audit

```text
('B01', 'đói bụng quá', 'Ambiguous', {'ambiguity_type': 'no_match'})
('B02', 'trời mưa quá', 'Ambiguous', {'ambiguity_type': 'no_match'})
('B05', 'đau bụng', 'Ambiguous', {'ambiguity_type': 'no_match'})
('B06', 'mệt quá muốn nghỉ', 'Ambiguous', {'ambiguity_type': 'no_match'})
('B07', 'xe hết điện', 'Ambiguous', {'ambiguity_type': 'no_match'})
('C15', 'khách sạn gần biển', 'ok', ['Sea Pearl Hotel Đà Nẵng', 'Lotus Hotel Tây Hồ', 'Golden Lotus Phường 4', 'Ocean View Resort Đà Nẵng', 'Holiday Ba Đình'])
```

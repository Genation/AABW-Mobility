=========
KỊCH BẢN THUYẾT TRÌNH ROUTEMATE (REVISED)
Dựa trên UX Flow thực tế: Bắt đầu tìm kiếm -> Lên tuyến đường -> Phát sinh nhu cầu dọc đường

0:00 - 0:45 (45s): IDENTITY & THE GRAND PROBLEM (Bắt đầu hành trình - P9)
Mở đầu: "Chào BGK Tasco Maps. Bản đồ sinh ra để tìm điểm đến, nhưng người lái xe lại cần một hành trình. Và mọi hành trình đều bắt đầu từ một ô tìm kiếm."

P9 (Autocomplete): "Ngay khi user gõ những ký tự đầu tiên, ví dụ 'Phan...', AI Autocomplete (giải quyết bài toán P9) của chúng tôi dự đoán ngay Intent của chuyến đi là 'Thành phố Phan Thiết', thông minh vượt qua cả các lỗi chính tả tiếng Việt."

Vấn đề mở rộng: "Nhưng bản đồ truyền thống thường dừng lại ở đó. Khi họ đang lái xe từ HCM đi Phan Thiết và bất chợt phát sinh nhu cầu: 'tìm ks gần biển có trạm sạc', họ phải tự gõ, tự mò mẫm đọc review, và tự tính xem cái khách sạn đó có làm họ đi mua đường không.

Để giải quyết trọn vẹn nỗi đau này, team chúng tôi không chỉ giải 1, mà đã gom cả 3 bài toán P9 (Autocomplete), P6 (Understanding) và P7 (Ranking) vào một trải nghiệm liền mạch mang tên: RouteMate - Search the journey, not just the destination."

0:45 - 1:45 (60s): THE SOLUTION (Hiểu nhu cầu trên đường đi - P6)
P6 (Understanding): "Tiếp nối hành trình đi Phan Thiết, khi user nhập yêu cầu phức tạp 'ks gần biển có trạm sạc'. Thay vì để LLM tự ảo giác ra địa điểm, Agent của chúng tôi sẽ đóng vai trò phân tích ngữ cảnh (Step 2 & 3). Một hệ thống NER siêu tốc sẽ bóc tách các Entities (Brand, Location, Specs) thành các cấu trúc chuẩn để Search Engine của Tasco có thể hiểu được (P6)."

(Nhấn mạnh tính năng): "Việc LLM chỉ đóng vai trò phân tích yêu cầu, nhường việc truy xuất địa điểm thật cho Search Engine đảm bảo 100% dữ liệu trả về là thật, loại bỏ hoàn toàn tình trạng xuất hiện quán ăn hay khách sạn 'ma'."
1:45 - 2:30 (45s): CREDIBILITY (Gợi ý đúng chỗ, đúng đường - P7 & Architecture)
P7 (Semantic Ranking): "Đã hiểu được ý định, vậy làm sao để gợi ý đúng chỗ? Chúng tôi giải bài toán P7 bằng công thức: Rank Score = Quality + Preference + Relevance - Detour Cost. Semantic Search đảm bảo hiểu đúng ý (vd: 'gần biển', 'trạm sạc'), trong khi Detour Cost đảm bảo người dùng không phải đi vòng quá xa khỏi tuyến đường chính."

Chứng minh hệ thống: "Thưa BGK, để chứng minh giải pháp này hoàn toàn khả thi trên môi trường Production của Tasco Maps thay vì chỉ là một bản vẽ trên giấy, đây là Dashboard mô phỏng hệ thống của chúng tôi chạy ở mức 1000 RPS.

Nhờ kiến trúc Singleflight gom các query trùng lặp và Fast NER bóc tách thực thể trước khi đưa vào Vector DB, chúng tôi duy trì được System Latency ở mức rất thấp (chỉ khoảng 40-60ms), triệt tiêu hoàn toàn độ trễ của API LLM. Hệ thống tự động tính toán Semantic Score kết hợp với điểm số NER để cho ra bảng Ranking cuối cùng. Khi đưa vào thực tế với nguồn dữ liệu khổng lồ của Tasco và VETC, mô hình sẽ tự học và độ chính xác sẽ tiệm cận mức tối đa."

2:30 - 3:15 (45s): IMPACT & BIZ VALUE (The Monetization Hook)
"Normal advertising targets what users might want. RouteMate reaches them at the exact moment and location where they need it.

Sponsored results được tích hợp minh bạch và tự nhiên, chỉ hiện lên nếu nó thực sự phù hợp với tuyến đường và nhu cầu (ví dụ: gợi ý trạm sạc V-Green ngay trên tuyến đường khi user tìm khách sạn). Tasco Maps có thêm doanh thu, User có chuyến đi tiện lợi."
3:15 - 4:45 (90s): THE DEMO & CLOSE
"Hãy cùng xem toàn bộ trải nghiệm Tasco Maps với RouteMate hoạt động."

Chiếu kịch bản Long Trip (HCM -> Phan Thiết). "Chỉ bằng vài thao tác gõ tìm Phan Thiết (có lỗi chính tả), hệ thống lập tức hiểu ý. Trên dọc đường, tìm kiếm trạm sạc V-Green hay quán ăn trưa. Chọn xong, Map tự vẽ lại tuyến đường tối ưu nhất, thêm các điểm dừng (waypoints) một cách mượt mà."

Chốt: "Với RouteMate, Tasco Maps không chỉ là bản đồ, mà là một người trợ lý du lịch cá nhân. Cảm ơn BGK."
======
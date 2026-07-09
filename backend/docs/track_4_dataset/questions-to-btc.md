Hi @…,

We are researching ai_maps_track4_dataset_participants, I have a few questions:

- I found that the Public Evaluation have some test cases that expected suggestions does not included in POI Dataset or Autocomplete Dataset:
  Categories like trà sữa, tiệm sửa xe, phòng gym, siêu thị, quán nhậu...
  Brands like Samsung Galaxy, GO!/Big C...

- Some expected suggestions are not exist as literal strings anywhere in dataset: "Quán cà phê gần đây", "quán cà phê phù hợp học tập", "Khách sạn gần biển Đà Nẵng", "ATM BIDV gần đây"... they look like generated from template patterns like [Category] + gần đây, [Brand] + gần nhất.

- There are also cases like "Chỉ đường đến Chợ Bến Thành" or coordinate input "10.77", but these are not mentioned in problem statement.

- Synonym cases: cây xăng = trạm xăng, and slang like "cafe dep song ao" → check-in.

- "gần đây" / "gần nhất" in suggestions imply location awareness, should we expect lat,lng from request?

Can you help me to understand:
- Are we allowed to expand/generate data beyond provided datasets? Or should we only use what is given?
- For suggestions that don't exist as strings in dataset, is template-based generation expected?
- Are navigation and coordinate cases part of scope?
- How will the 60 Public Evaluation cases be scored? Exact match or partial?
- Any latency threshold we should target for "real-time"?

Thanks!

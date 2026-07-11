from __future__ import annotations

import unittest

from tascomaps.core.understand import understand
from tascomaps.data.loader import load_kb


class SharedSurfaceEdgeCaseHardeningTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.kb = load_kb()

    def test_p6_consumes_unique_shared_access_surfaces(self):
        cases = [
            ("cafe hcmc", "city", "TP Hồ Chí Minh"),
            ("big c", "brand", "GO!"),
            ("pho4p", "brand", "Pizza 4P's"),
        ]

        for query, slot, expected in cases:
            with self.subTest(query=query):
                output = understand(query, self.kb)
                self.assertEqual(output.entities.get(slot), expected)

    def test_positive_location_clause_reopens_after_negative_attribute(self):
        queries = [
            "cafe không wifi ở Hà Nội",
            "quán ăn không thịt ở Hà Nội",
            "quán ăn không quá 100k ở Hà Nội",
            "nhà hàng không phải đồ Tàu ở Hà Nội",
            "khách sạn không gần sân bay ở Hà Nội",
            "cafe không phải Garden Cafe ở Hà Nội",
            "nhà hàng không phải Pizza 4P's ở Hà Nội",
            "không phải nhà hàng ở Hà Nội",
            "khách sạn tránh đường Lê Lợi ở TP Hồ Chí Minh",
        ]

        for query in queries:
            with self.subTest(query=query):
                output = understand(query, self.kb)
                expected_city = ("TP Hồ Chí Minh"
                                 if "TP Hồ Chí Minh" in query else "Hà Nội")
                self.assertEqual(output.entities.get("city"), expected_city)

        wifi = understand(queries[0], self.kb)
        self.assertIn("wifi", wifi.entities.get("excluded_attributes", []))

    def test_location_immediately_after_negation_remains_negative(self):
        queries = [
            "khách sạn không ở Hà Nội",
            "khách sạn không nằm ở Hà Nội",
            "khách sạn không nằm ngay ở Hà Nội",
            "khách sạn không tọa lạc ở Hà Nội",
            "khách sạn không cần ở Hà Nội",
            "khách sạn không phải loại nằm ở Hà Nội",
            "khách sạn không có mặt ở Hà Nội",
            "khách sạn không hiện diện ở Hà Nội",
            "khách sạn không hoạt động ở Hà Nội",
            "khách sạn không nằm sát ở Hà Nội",
            "khách sạn không được phép ở Hà Nội",
        ]

        for query in queries:
            with self.subTest(query=query):
                output = understand(query, self.kb)
                self.assertNotIn("city", output.entities)


if __name__ == "__main__":
    unittest.main()

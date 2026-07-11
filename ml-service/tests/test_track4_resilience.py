from __future__ import annotations

import json
import unittest
from unittest.mock import MagicMock, patch

from tascomaps.integrations import track4


class Track4ResilienceTests(unittest.TestCase):
    def setUp(self):
        track4._reset_state_for_tests()

    def tearDown(self):
        track4._reset_state_for_tests()

    @patch("tascomaps.integrations.track4.config.TRACK4_URL", "http://track4")
    @patch("tascomaps.integrations.track4.config.TRACK4_BREAKER_SECONDS", 5.0)
    def test_failure_opens_circuit_for_following_keystrokes(self):
        with patch("tascomaps.integrations.track4.urllib.request.urlopen",
                   side_effect=OSError("offline")) as request:
            self.assertIsNone(track4.suggest("quán"))
            self.assertIsNone(track4.suggest("quán c"))
        self.assertEqual(request.call_count, 1)

    @patch("tascomaps.integrations.track4.config.TRACK4_URL", "http://track4")
    @patch("tascomaps.integrations.track4.config.TRACK4_CACHE_SECONDS", 10.0)
    def test_success_is_cached_for_repeated_prefix(self):
        payload = {"suggestions": [{
            "text": "quan ca phe", "display": "Quán cà phê",
            "type": "Category Suggestions", "score": 0.9,
        }]}
        response = MagicMock()
        response.read.return_value = json.dumps(payload).encode()
        response.__enter__.return_value = response
        with patch("tascomaps.integrations.track4.urllib.request.urlopen",
                   return_value=response) as request:
            first = track4.suggest("quán")
            second = track4.suggest("quán")
        self.assertEqual(first, second)
        self.assertEqual(request.call_count, 1)


if __name__ == "__main__":
    unittest.main()

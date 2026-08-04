import os
import unittest

from app.auth import GUEST_ACCESS_TOKEN, guest_access_token


class GuestAuthTests(unittest.TestCase):
    def test_guest_session_resolves_to_demo_access(self):
        original = os.environ.get("CHUTES_API_KEY")
        os.environ.pop("CHUTES_API_KEY", None)
        try:
            self.assertEqual(guest_access_token("1"), GUEST_ACCESS_TOKEN)
        finally:
            if original is None:
                os.environ.pop("CHUTES_API_KEY", None)
            else:
                os.environ["CHUTES_API_KEY"] = original

    def test_non_guest_session_has_no_demo_access(self):
        original = os.environ.get("CHUTES_API_KEY")
        os.environ["CHUTES_API_KEY"] = "cpk_test_guest_key"
        try:
            self.assertIsNone(guest_access_token(None))
        finally:
            if original is None:
                os.environ.pop("CHUTES_API_KEY", None)
            else:
                os.environ["CHUTES_API_KEY"] = original


if __name__ == "__main__":
    unittest.main()

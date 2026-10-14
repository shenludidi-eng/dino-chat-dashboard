"""No private data: guard incremental import and UTC normalization."""
import json
import tempfile
import unittest
from pathlib import Path
from build_data import business_date, business_hour
from refresh_dashboard import merge_sources, normalize


def message(**overrides):
    return {"message_id":"m1","user_id":"u1","session_id":"s1","entry_type":"HOME",
            "sequence_no":1,"role":"user","content":"Hello","created_at":"2026-10-04 16:00:20",**overrides}


class RefreshTests(unittest.TestCase):
    def test_utc_not_beijing(self):
        new = message(message_created_at_utc="2026-10-04 16:00:20",message_created_at_beijing="2026-10-05 00:00:20")
        new.pop("created_at")
        self.assertEqual(normalize(new), normalize(message()))

    def test_beijing_reporting_boundary(self):
        self.assertEqual(business_date("2026-10-04 15:59:59"), "2026-10-04")
        self.assertEqual(business_hour("2026-10-04 15:59:59"), 23)
        self.assertEqual(business_date("2026-10-04 16:00:00"), "2026-10-05")
        self.assertEqual(business_hour("2026-10-04 16:00:00"), 0)

    def test_identical_overlap_idempotent(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp)/"fixture.json"
            p.write_text(json.dumps([message()]))
            rows, audit = merge_sources([(p,[message(),message(sequence_no="1"),message(message_id="m2")])])
            self.assertEqual(len(rows),2)
            self.assertEqual(audit[p.name]["duplicates"],1)

    def test_conflict_stops_import(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)/"fixture.json"
            p.write_text("[]")
            with self.assertRaisesRegex(ValueError,"Conflicting duplicate"):
                merge_sources([(p,[message(),message(content="Different")])])

    def test_invalid_values_never_silently_become_home(self):
        for overrides in ({"entry_type":"unknown"},{"role":"system"},{"message_id":""},{"created_at":""}):
            with self.assertRaises(ValueError):
                normalize(message(**overrides))


if __name__=="__main__":
    unittest.main()

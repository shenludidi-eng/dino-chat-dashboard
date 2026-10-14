"""Integrity checks for the data actually delivered to the local dashboard."""
import collections
import json
import re
import unittest
from pathlib import Path

from build_entry_analysis import CONFIGS, matches, classify_language

ROOT = Path(__file__).resolve().parents[1]


def read_js(path):
    return json.loads(path.read_text().split("=", 1)[1].rstrip(";\n"))


class EntryAnalysisTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.analysis = read_js(ROOT / "analysis/entry-analysis.js")
        cls.base = read_js(ROOT / "data.js")
        cls.transcripts = {}
        for path in (ROOT / "analysis/transcripts").glob("*.json"):
            cls.transcripts.update(json.loads(path.read_text()))

    def test_full_corpus_reconciliation_and_unique_message_positions(self):
        a, d = self.analysis, self.base
        rows = [r for entry in a["records"] for r in entry]
        self.assertEqual(len(rows), d["meta"]["totalMessages"])
        self.assertEqual(sum(r[12] == 1 for r in rows), d["meta"]["userMessages"])
        self.assertEqual(len({r[1] for r in rows}), d["meta"]["users"])
        self.assertEqual(len({r[2] for r in rows}), d["meta"]["sessions"])
        self.assertEqual(len({(r[2], r[4]) for r in rows}), len(rows))

    def test_all_evidence_positions_roles_rounds_and_profiles_align(self):
        expected = {r[2]: r for r in self.base["sessionRows"]}
        for e, rows in enumerate(self.analysis["records"]):
            for r in rows:
                session = self.transcripts[str(r[2])]
                m = session["messages"][r[4]]
                self.assertEqual((session["entry"],session["user"]), (e,r[1]))
                self.assertEqual(expected[r[2]][:2], [e,r[1]])
                self.assertEqual(m["round"],r[3])
                self.assertEqual(m["role"],"assistant" if r[12]==0 else "user")
                self.assertEqual(m["date"],self.base["dimensions"]["dates"][r[0]])
                self.assertRegex(m["timestamp"], r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$")
                self.assertEqual(m["timestamp"][:10], m["date"])
        for sid, s in self.transcripts.items():
            self.assertEqual(sum(m["role"] == "user" for m in s["messages"]),expected[int(sid)][5])

    def test_each_entry_has_its_own_dimensions_and_role_safe_masks(self):
        keys = [g["key"] for e in self.analysis["entries"] for g in e["groups"]]
        self.assertEqual(len(keys),len(set(keys)))
        direction_sets = [tuple(t["label"] for t in e["groups"][0]["tags"]) for e in self.analysis["entries"]]
        self.assertEqual(len(set(direction_sets)),3)
        for e, rows in enumerate(self.analysis["records"]):
            for gi,g in enumerate(self.analysis["entries"][e]["groups"]):
                correct_role = 0 if g["role"] == "assistant" else 1
                for r in rows:
                    self.assertLess(r[5+gi],1<<len(g["tags"]))
                    if r[12] != correct_role:
                        self.assertEqual(r[5+gi],0)

    def test_aggregate_counts_do_not_exceed_denominators(self):
        audit=json.loads((ROOT / "analysis/analysis-audit.json").read_text())
        for e, entry in enumerate(audit["entries"]):
            for gi,g in enumerate(entry["groups"]):
                self.assertEqual(g["matched"]+g["unclassified"],g["total"])
                for ti,t in enumerate(g["counts"]):
                    hits=[r for r in self.analysis["records"][e] if r[5+gi]&(1<<ti)]
                    self.assertEqual(t["messages"],len(hits))
                    self.assertEqual(t["sessions"],len({r[2] for r in hits}))
                    self.assertLessEqual(t["messages"],g["total"])
                    self.assertLessEqual(t["sessions"],entry["sessions"])

    def test_boundary_cases_are_not_inferred_as_preferences_or_language_help(self):
        def hit(e,gi,ti,text,previous=""):
            t=dict(CONFIGS[e]["groups"][gi]["tags"][ti])
            t["regex"]=re.compile(t["pattern"],re.I)
            return matches(t,text,previous)
        self.assertFalse(hit(0,4,0,"Blue."))
        self.assertTrue(hit(0,4,0,"I like blue."))
        self.assertEqual(classify_language("我今天吃苹果"),1)
        self.assertFalse(any(hit(0,5,i,"我今天吃苹果") for i in range(4)))
        self.assertTrue(hit(1,3,5,"I like bananas.",'Try: “I like bananas.”'))
        self.assertFalse(hit(1,3,5,"I like bananas.","Do you like bananas?"))
        self.assertFalse(hit(0,0,0,"Con muốn tớ nói lại để dễ nhớ không?"))
        self.assertTrue(hit(0,0,0,"Bạn nói lại được không?"))


if __name__ == "__main__":
    unittest.main()

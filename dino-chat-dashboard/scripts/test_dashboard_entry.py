import importlib.util
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("serve_dashboard.py")
INDEX = SCRIPT.parent.parent / "index.html"
SPEC = importlib.util.spec_from_file_location("serve_dashboard", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class DashboardEntryTest(unittest.TestCase):
    def test_root_always_redirects_to_index(self):
        self.assertEqual(MODULE.canonical_redirect("/"), "/index.html")
        self.assertEqual(
            MODULE.canonical_redirect("/", "page=entry&entry=2"),
            "/index.html?page=entry&entry=2",
        )

    def test_common_folder_url_redirects_to_index(self):
        self.assertEqual(
            MODULE.canonical_redirect("/dino-chat-dashboard/"), "/index.html"
        )

    def test_real_assets_are_not_redirected(self):
        self.assertIsNone(MODULE.canonical_redirect("/styles.css"))
        self.assertIsNone(MODULE.canonical_redirect("/analysis/entry-analysis.js"))

    def test_required_home_file_exists(self):
        self.assertTrue((MODULE.DASHBOARD_DIR / "index.html").is_file())

    def test_all_pages_have_section_navigation(self):
        markup = INDEX.read_text(encoding="utf-8")
        script = (MODULE.DASHBOARD_DIR / "app.js").read_text(encoding="utf-8")
        self.assertIn('id="sectionSubnav"', markup)
        self.assertIn("const overviewSubnav=", script)
        self.assertIn("activePageLink.insertAdjacentElement('afterend',nav)", script)
        self.assertIn("const standardEntrySubnav=", script)
        self.assertIn("const postClassSubnav=", script)
        self.assertNotIn("nav.innerHTML=`<p>", script)
        for target in (
            "overviewVolumeSection",
            "overviewTrafficSection",
            "weeklyTraffic",
            "profilePanel",
            "overviewRoundSection",
            "overviewVersionSection",
            "entryVolumeSection",
            "entryProfileSection",
            "entryRoundsSection",
            "sampledConversationAnalysisSection",
            "postClassCompletionSection",
            "postClassConversationAnalysisSection",
        ):
            self.assertIn(target, markup)
            self.assertIn(target, script)

    def test_legacy_entry_analysis_is_removed(self):
        markup = INDEX.read_text(encoding="utf-8")
        script = (MODULE.DASHBOARD_DIR / "app.js").read_text(encoding="utf-8")
        self.assertNotIn('id="legacyEntryAnalysis"', markup)
        self.assertNotIn('id="entryTabs"', markup)
        self.assertNotIn('id="dinoAnalysis"', markup)
        self.assertNotIn('id="childAnalysis"', markup)
        self.assertNotIn('src="entry-analysis.js', markup)
        self.assertNotIn("$('#legacyEntryAnalysis')", script)

    def test_file_mode_is_redirected_to_local_server(self):
        markup = INDEX.read_text(encoding="utf-8")
        self.assertIn('window.location.protocol === "file:"', markup)
        self.assertIn("http://127.0.0.1:8765/index.html", markup)

    def test_overview_links_never_point_to_a_directory(self):
        markup = INDEX.read_text(encoding="utf-8")
        self.assertNotIn('href="./"', markup)


if __name__ == "__main__":
    unittest.main()

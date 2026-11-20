"""Dependency-free checks for the exact files published to GitHub Pages."""

import collections
from html.parser import HTMLParser
from pathlib import Path
import unittest
from urllib.parse import unquote, urlsplit
import xml.etree.ElementTree as ET


SITE = Path(__file__).resolve().parents[1] / "site"
PUBLIC_URL = "https://maherajlian.github.io/my-resume/"


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.elements = []
        self.text = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))

    def handle_data(self, data):
        self.text.append(data)

    def matching(self, tag):
        return [attrs for name, attrs in self.elements if name == tag]


class ResumeSiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = (SITE / "index.html").read_text(encoding="utf-8")
        cls.doc = Document(cls.source)
        cls.ids = [attrs["id"] for _, attrs in cls.doc.elements if "id" in attrs]

    def test_language_viewport_and_landmarks(self):
        self.assertEqual(self.doc.matching("html")[0]["lang"], "en")
        viewport = [m for m in self.doc.matching("meta") if m.get("name") == "viewport"]
        self.assertEqual(len(viewport), 1)
        self.assertIn("width=device-width", viewport[0]["content"])
        for landmark in ("header", "main", "footer", "h1"):
            with self.subTest(landmark=landmark):
                self.assertEqual(len(self.doc.matching(landmark)), 1)
        self.assertTrue(any(a.get("href") == "#main" for a in self.doc.matching("a")))

    def test_ids_are_unique(self):
        self.assertEqual([i for i, count in collections.Counter(self.ids).items() if count > 1], [])

    def test_all_local_links_and_resources_exist(self):
        for tag, attrs in self.doc.elements:
            for attribute in ("href", "src"):
                if attribute not in attrs:
                    continue
                with self.subTest(tag=tag, reference=attrs[attribute]):
                    url = urlsplit(attrs[attribute])
                    if url.scheme or url.netloc:
                        self.assertIn(url.scheme, ("https", "mailto", "tel"))
                        continue
                    # Root-relative assets break when hosted under /my-resume/.
                    self.assertFalse(url.path.startswith("/"))
                    if url.path:
                        target = (SITE / unquote(url.path)).resolve()
                        self.assertTrue(target.is_relative_to(SITE.resolve()))
                        self.assertTrue(target.is_file(), str(target))
                    elif url.fragment:
                        self.assertIn(unquote(url.fragment), self.ids)

    def test_metadata_and_social_image(self):
        meta = {m.get("name", m.get("property")): m.get("content") for m in self.doc.matching("meta")}
        self.assertGreater(len(meta["description"]), 50)
        self.assertEqual(meta["og:url"], PUBLIC_URL)
        self.assertEqual(meta["twitter:card"], "summary_large_image")
        self.assertEqual(meta["og:image"], PUBLIC_URL + "assets/social.png")
        self.assertEqual((SITE / "assets/social.png").read_bytes()[:8], b"\x89PNG\r\n\x1a\n")
        self.assertTrue(any(a.get("rel") == "canonical" and a.get("href") == PUBLIC_URL
                            for a in self.doc.matching("link")))

    def test_cv_download_is_the_provided_pdf(self):
        downloads = [a for a in self.doc.matching("a") if "download" in a]
        self.assertEqual(len(downloads), 2)
        for link in downloads:
            self.assertEqual(link["href"], "assets/Maheraj-Lian-CV.pdf")
            data = (SITE / link["href"]).read_bytes()
            self.assertTrue(data.startswith(b"%PDF-"))
            self.assertGreater(len(data), 10_000)

    def test_cv_content_is_present(self):
        content = " ".join(self.doc.text)
        for expected in ("Maheraj Lian", "UBS", "Zustech", "University of Exeter", "Eton College",
                         "We Belong", "Cumberland Community School", "7M", "98.3%", "30%",
                         "First Class Honours", "AI-103", "AZ-900"):
            with self.subTest(content=expected):
                self.assertIn(expected, content)
        self.assertNotIn("25–20 million", content)
        self.assertTrue(any(a.get("href") == "mailto:maherajlian@outlook.com"
                            for a in self.doc.matching("a")))

    def test_accessibility_basics(self):
        for img in self.doc.matching("img"):
            self.assertIn("alt", img)
        for nav in self.doc.matching("nav"):
            self.assertTrue(nav.get("aria-label"))
        for section in self.doc.matching("section"):
            self.assertTrue(section.get("aria-label") or section.get("aria-labelledby"))
            if "aria-labelledby" in section:
                self.assertIn(section["aria-labelledby"], self.ids)
        self.assertEqual(len(self.doc.matching("summary")), 1)
        self.assertNotIn("<script", self.source.lower())

    def test_styles_support_accessibility_mobile_and_print(self):
        css = (SITE / "styles.css").read_text(encoding="utf-8")
        for required in (":focus-visible", "prefers-reduced-motion:reduce", "@media print",
                         "@media(max-width:720px)", "@media(max-width:359px)"):
            with self.subTest(rule=required):
                self.assertIn(required, css)
        self.assertNotIn("@import", css)
        self.assertNotIn("url(http", css)

    def test_sitemap_and_robots(self):
        root = ET.fromstring((SITE / "sitemap.xml").read_text())
        self.assertEqual(root.find(".//{*}loc").text, PUBLIC_URL)
        self.assertIn(PUBLIC_URL + "sitemap.xml", (SITE / "robots.txt").read_text())
        self.assertTrue((SITE / ".nojekyll").is_file())


if __name__ == "__main__":
    unittest.main()

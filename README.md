# Maheraj Lian — personal resume

A responsive, dependency-free resume website, based on the supplied CV.

**Site:** https://maherajlian.github.io/my-resume/

## Run locally

Requires Python 3.10 or newer. No package installation, JavaScript build,
framework, external fonts, analytics or API keys are needed.

```sh
python -m http.server 8000 --directory site
```

Open http://localhost:8000. All published files live in `site/`.

## Validate

```sh
python -m unittest discover -s tests -v
node --test tests/theme.test.cjs
```

Checks cover local links, project-relative asset paths, PDF downloads, CV
content, metadata, sitemap and accessibility basics. The site also supports
keyboard navigation, native expandable experience, reduced motion and print.
Theme tests use the built-in Node.js test runner (Node 24 in CI), with no npm
dependencies. Browser-based visual and accessibility checks complement them.

## Appearance

The header’s **Dark mode** toggle follows the system preference on first visit,
then remembers an explicit choice in this browser. It also syncs changes across
tabs and continues working when local storage is unavailable. Without JavaScript,
the resume remains readable in light mode and the toggle stays hidden. Printing
always uses the light palette regardless of the selected screen theme.

## Edit

- `site/index.html`: copy, experience, projects, skills and contact links.
- `site/styles.css`: colours, responsive layouts and print styles.
- `site/theme.js`: system preference, accessible toggle and saved theme choice.
- `site/assets/Maheraj-Lian-CV.pdf`: the latest owner-supplied downloadable CV.
- `site/assets/social.png`: social sharing image.
- `tests/test_site.py`: content and publishing checks.
- `tests/theme.test.cjs`: dependency-free theme behavior tests.

The HTML summarises the CV rather than adding new biographical claims. The
inconsistent "25–20 million metric samples per minute" figure in the source CV
is intentionally not repeated on the page. The latest supplied PDF is published
byte-for-byte; its SHA-256 is checked by the download regression test. The page
leads with observability and transferable engineering capabilities, using named
products as concrete examples within the work rather than as the skills taxonomy.
The public page uses email as the contact method; the downloadable CV includes
the contact information in the supplied document.

## GitHub Pages

The GitHub Actions workflow validates pull requests and pushes to `main`.
Only a validated push to `main` (or a manual workflow run on `main`) deploys
`site/` to GitHub Pages; tests and repository configuration are not published.

One-time setup, if not already enabled:

1. Open https://github.com/maherajlian/my-resume/settings/pages.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Open https://github.com/maherajlian/my-resume/actions/workflows/pages.yml,
   select **Run workflow**, keep branch **main**, and click **Run workflow**.

The deployment URL appears in the `github-pages` environment and in the
workflow summary. No paid hosting or custom domain is required.

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
```

Checks cover local links, project-relative asset paths, PDF downloads, CV
content, metadata, sitemap and accessibility basics. The site also supports
keyboard navigation, native expandable experience, reduced motion and print.
Browser-based visual and accessibility checks complement these static checks.

## Edit

- `site/index.html`: copy, experience, projects, skills and contact links.
- `site/styles.css`: colours, responsive layouts and print styles.
- `site/assets/Maheraj-Lian-CV.pdf`: the original downloadable CV.
- `site/assets/social.png`: social sharing image.
- `tests/test_site.py`: content and publishing checks.

The HTML summarises the CV rather than adding new biographical claims. The
inconsistent "25–20 million metric samples per minute" figure in the source CV
is intentionally not repeated on the page. The original PDF remains unchanged.
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

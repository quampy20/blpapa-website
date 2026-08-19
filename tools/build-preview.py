#!/usr/bin/env python3
"""Bundle the built site into one self-contained HTML file for sharing.

    node build.mjs && python3 tools/build-preview.py

This exists only so the site can be looked at without deploying it. The real
site is the many-file build in dist/; this squashes that into a single page
with every stylesheet, font, and image embedded, plus a small script that
swaps between pages when a link is clicked.

Nothing here is part of the real site, and nothing here should ever be treated
as the source of truth for how a page looks. If the preview and dist/ disagree,
dist/ is right.
"""

import base64
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
OUT = ROOT / "preview" / "blpapa-preview.html"

MIME = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
}

# Page order in the switcher. Home first; the 404 is not reachable by a link.
ROUTES = [
    ("/", "index.html"),
    ("/about/", "about/index.html"),
    ("/events/", "events/index.html"),
    ("/events/bayanihan-festival/", "events/bayanihan-festival/index.html"),
    ("/get-involved/", "get-involved/index.html"),
    ("/culture/", "culture/index.html"),
    ("/culture/newsletter/fourth-edition-may-2026/",
     "culture/newsletter/fourth-edition-may-2026/index.html"),
    ("/gallery/", "gallery/index.html"),
    ("/donate/", "donate/index.html"),
    ("/contact/", "contact/index.html"),
]

assets: dict[str, str] = {}


def data_uri(url: str) -> str:
    """Encode a /assets/... file once, reusing it everywhere it appears."""
    if url not in assets:
        path = DIST / url.lstrip("/")
        mime = MIME.get(path.suffix.lower(), "application/octet-stream")
        payload = base64.b64encode(path.read_bytes()).decode("ascii")
        assets[url] = f"data:{mime};base64,{payload}"
    return assets[url]


def inline_css() -> str:
    css = (DIST / "styles" / "site.css").read_text()
    return re.sub(
        r"url\((/assets/fonts/[^)]+)\)",
        lambda m: f"url({data_uri(m.group(1))})",
        css,
    )


def scope_ids(body: str, prefix: str) -> str:
    """Make every id on a page unique.

    All ten pages live in one document here, so ids like "main" and "site-nav"
    would otherwise repeat ten times and in-page links would jump to whichever
    copy came first. Each page gets its own prefix, and every attribute that
    points at an id is rewritten to match.
    """
    body = re.sub(r'\bid="([^"]+)"', lambda m: f'id="{prefix}-{m.group(1)}"', body)
    for attr in ("for", "aria-controls", "data-picker"):
        body = re.sub(
            rf'\b{attr}="([^"]+)"',
            lambda m, a=attr: f'{a}="{prefix}-{m.group(1)}"',
            body,
        )
    for attr in ("aria-describedby", "aria-labelledby"):
        body = re.sub(
            rf'\b{attr}="([^"]+)"',
            lambda m, a=attr: '{}="{}"'.format(
                a, " ".join(f"{prefix}-{i}" for i in m.group(1).split())
            ),
            body,
        )
    # In-page anchors, but not links to other pages.
    return re.sub(r'href="#([^"]+)"', lambda m: f'href="#{prefix}-{m.group(1)}"', body)


def defer_images(body: str) -> str:
    """Swap image URLs for markers the runtime fills in from the asset map.

    Embedding each image where it appears would repeat the same photograph and
    logo on every page and quadruple the file.
    """
    def keep(url: str) -> str:
        data_uri(url)  # registers it in the shared map the runtime reads
        return url

    body = re.sub(r'\bsrc="(/assets/[^"]+)"',
                  lambda m: f'data-src="{keep(m.group(1))}"', body)

    def srcset(match: re.Match) -> str:
        for candidate in match.group(1).split(','):
            url = candidate.strip().split()[0]
            if url.startswith('/assets/'):
                keep(url)
        return f'data-srcset="{match.group(1)}"'

    return re.sub(r'\bsrcset="([^"]*/assets/[^"]*)"', srcset, body)


def page_body(path: Path) -> str:
    html = path.read_text()
    body = html.split("<body", 1)[1].split(">", 1)[1].rsplit("</body>", 1)[0]
    # The real scripts are replaced by the preview runtime at the end of the file.
    return re.sub(r"<script[\s\S]*?</script>", "", body)


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    css = inline_css()

    sections = []
    for index, (route, rel) in enumerate(ROUTES):
        prefix = f"pg{index}"
        body = defer_images(scope_ids(page_body(DIST / rel), prefix))
        sections.append(
            f'<div class="pv-page" data-route="{route}" data-prefix="{prefix}" hidden>\n'
            f"{body}\n</div>"
        )

    asset_map = ",\n".join(f'  "{k}": "{v}"' for k, v in assets.items())

    OUT.write_text(TEMPLATE.format(css=css, sections="\n".join(sections), assets=asset_map))
    size = OUT.stat().st_size / 1024 / 1024
    print(f"{OUT.relative_to(ROOT)} — {len(ROUTES)} pages, {len(assets)} assets, {size:.1f} MB")


TEMPLATE = """<title>Bayanihan Dawn</title>

<!-- Generated by tools/build-preview.py. Do not edit by hand. -->

<style>
{css}

/* Preview shell only — not part of the real site. */
.pv-page[hidden] {{ display: none; }}
.pv-bar {{
  position: sticky; top: 0; z-index: 200;
  display: flex; flex-wrap: wrap; align-items: center; gap: .5rem 1rem;
  padding: .55rem 1.25rem;
  background: var(--blpapa-navy); color: var(--blpapa-white);
  font-family: var(--font-body); font-size: .875rem;
}}
.pv-bar strong {{ font-family: var(--font-heading); color: var(--blpapa-gold); }}
.pv-bar span {{ color: #E8EEEE; }}
.site-header {{ top: 2.9rem; }}
[id] {{ scroll-margin-top: 10rem; }}
</style>

<div class="pv-bar">
  <strong>Preview</strong>
  <span>A working copy of the new BLPAPA site. Every link and menu works — use the navigation as a visitor would.</span>
</div>

{sections}

<script>
const ASSETS = {{
{assets}
}};

// Fill in images from the shared map, so each photograph and logo is stored
// once rather than repeated on all ten pages.
for (const el of document.querySelectorAll('[data-src]')) {{
  if (ASSETS[el.dataset.src]) el.src = ASSETS[el.dataset.src];
}}
for (const el of document.querySelectorAll('[data-srcset]')) {{
  el.srcset = el.dataset.srcset.split(',').map((part) => {{
    const [url, ...rest] = part.trim().split(/\\s+/);
    return [ASSETS[url] || url, ...rest].join(' ');
  }}).join(', ');
}}

const pages = [...document.querySelectorAll('.pv-page')];

function showRoute(route, anchor) {{
  const page = pages.find((p) => p.dataset.route === route) || pages[0];
  for (const p of pages) p.hidden = p !== page;
  initPage(page);
  if (anchor) {{
    const target = page.querySelector('#' + CSS.escape(page.dataset.prefix + '-' + anchor));
    if (target) {{ target.scrollIntoView({{ behavior: 'instant', block: 'start' }}); return; }}
  }}
  window.scrollTo({{ top: 0, left: 0, behavior: 'instant' }});
}}

// Links to other pages switch panels instead of leaving the document.
document.addEventListener('click', (event) => {{
  const link = event.target.closest('a[href^="/"]');
  if (!link) return;
  const [path, anchor] = link.getAttribute('href').split('#');
  if (!pages.some((p) => p.dataset.route === path)) return;
  event.preventDefault();
  showRoute(path, anchor);
}});

// Per-page behaviour: the mobile menu, and the application chooser.
function initPage(page) {{
  if (page.dataset.ready) return;
  page.dataset.ready = '1';

  const toggle = page.querySelector('.nav-toggle');
  const nav = page.querySelector('.site-nav');
  if (toggle && nav) {{
    const label = toggle.querySelector('.nav-toggle__label');
    toggle.addEventListener('click', () => {{
      const open = toggle.getAttribute('aria-expanded') !== 'true';
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      if (label) label.textContent = open ? 'Close' : 'Menu';
    }});
  }}

  const panels = [...page.querySelectorAll('.form-panel')];
  const pickers = [...page.querySelectorAll('[data-picker]')];
  if (panels.length) {{
    const show = (id) => {{
      const target = panels.find((p) => p.id === id) || panels[0];
      for (const p of panels) p.hidden = p !== target;
      for (const b of pickers) b.setAttribute('aria-current', String(b.dataset.picker === target.id));
      return target;
    }};
    show(panels[0].id);
    for (const picker of pickers) {{
      picker.addEventListener('click', (event) => {{
        event.preventDefault();
        show(picker.dataset.picker).scrollIntoView({{ behavior: 'smooth', block: 'start' }});
      }});
    }}
  }}

  // The forms are not connected yet, so the site shows this note instead of
  // pretending to send. Same wording the real site uses.
  for (const form of page.querySelectorAll('form[data-intake]')) {{
    const notice = document.createElement('div');
    notice.className = 'form-preview-notice';
    notice.innerHTML = '<p class="form-preview-notice__title">Please use the form linked below</p>'
      + '<p>We are in the middle of moving our applications over to this page. '
      + 'Until that is finished, send yours through the form at the bottom of '
      + 'this section — it goes straight to us and we are watching it daily.</p>';
    form.prepend(notice);
    form.addEventListener('submit', (event) => {{
      event.preventDefault();
      form.querySelector('.form__status').innerHTML =
        '<div class="callout callout--gold"><p class="callout__title">Almost — one more step</p>'
        + '<p>This page is not taking applications yet. Please send yours through '
        + 'the form linked just below, which comes straight to us.</p></div>';
    }});
  }}
}}

showRoute('/');
</script>
"""


if __name__ == "__main__":
    main()

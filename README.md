# BLPAPA Website

A redesign of the website for **Bukang Liwayway Pilipino-Amerikano Pangarap
Asosasyon**, a Filipino-American cultural non-profit in Elk Grove, California.

Hand-written static HTML, CSS, and vanilla JavaScript. **No dependencies at
all** — not runtime, not build. The whole toolchain is `build.mjs`,
`lib/markdown.mjs`, and Node itself.

> **This is a speculative pitch.** BLPAPA has not commissioned it and does not
> know it exists. Every page must be presentation-ready at all times: assume
> any commit could be the one that gets demoed. Do not contact the
> organization, register domains, or create accounts in their name.

---

## Getting started

```bash
npm run build     # src/ + content/ -> dist/
npm run serve     # build, then preview at http://localhost:8080
npm run check     # build, then run the definition-of-done checks
```

Node 18 or newer. There is nothing to install.

---

## Read these first

| File | What it is |
|---|---|
| **`CLAUDE.md`** | The constitution. Stack, design system, content rules, accessibility, conventions |
| **`HANDOFF.md`** | Current state, decisions *with their reasoning*, open questions |
| **`content/verified-facts.md`** | Every organizational fact, with sources. **If it is not here, it is not verified** |

Two content rules matter more than anything else here, and they pull against
each other:

**Never fabricate an organizational fact.** No invented board bios, dollar
figures, dates, attendance numbers, testimonials, or partners. This site gets
shown to the people who run this organization.

**Never print our open questions on their website either.** No visible "to be
confirmed with BLPAPA" boxes — they read as unfinished and they second-guess
the organization on its own site. Write around the gap so the page reads as
finished, and log the question in `HANDOFF.md` §7.1. `CLAUDE.md` §5.1 has the
full rule and an example of each.

And one hard boundary, which has already been crossed once:

**Jay's Google Drive holds other clients' work. Do not browse it.** Exactly one
folder is in scope — `BLPAPA 8/18/26`, id `1iA3DjHCdDH0nhPH59vM4a9qafzQIeHGb`.
Never run an account-wide search; scope every query to that folder or to a file
id Jay supplied, and ask him before touching anything else. Same rule for every
other connected account. `CLAUDE.md` §8.1 is the full rule.

---

## Layout

```
build.mjs              The whole build. ~200 lines, zero dependencies
check.mjs              Definition-of-done checks, run by `npm run check`
server.mjs             Local preview server
lib/markdown.mjs       Minimal Markdown renderer for newsletter transcriptions

src/
  pages/               One .html per route, with a <!--meta --> front block
  partials/            layout, header, footer
  templates/           newsletter.html — rendered once per issue in content/
  styles/              tokens, fonts, base, layout, components/
  scripts/             nav.js, forms.js
  assets/              logo/ images/ fonts/

content/
  site.json            Owner-editable values: contact, social, next event, form endpoint
  verified-facts.md    Single source of truth for organizational facts
  newsletters/         One .md per issue
  events/ gallery/     Ready for content

admin/                 Decap CMS — index.html + config.yml
brand-assets/          Approved masters, NOT deployed (print sizes, 4 MB)
tools/                 One-off asset and font generation, and the Apps Script
docs/                  Style guide, site plan, owner guide, forms setup
dist/                  Build output. Never edited by hand, never committed
preview/               Single-file shareable copy. Also generated, also not committed
```

---

## How the build works

`build.mjs` walks `src/pages`, reads a small `<!--meta -->` block from each
page, renders it into `src/partials/layout.html`, and writes
`dist/<route>/index.html`.

The template syntax is three forms and nothing else:

| Syntax | Meaning |
|---|---|
| `{{> header }}` | Include a partial from `src/partials/` |
| `{{ value }}` | Insert, HTML-escaped |
| `{{{ value }}}` | Insert raw |

An unknown partial or value **throws and fails the build**. A typo should never
ship as a blank page.

Page meta keys: `route`, `title`, `description`, `nav` (which nav item to mark
current), `script` (loads `/scripts/<name>.js` on that page only), `sitemap:
false`, `bodyClass`.

Stylesheets are concatenated into one `site.css` with tokens first, so
authoring stays modular while the page pays for one request.

---

## Checks

`npm run check` enforces the mechanical half of `CLAUDE.md` §8:

- Exactly one `<h1>`, and heading levels that descend without skipping
- `alt` on every image; an accessible name on every link
- No `outline: none`, no tracking scripts, no Lorem Ipsum
- Internal links resolve to something the build emitted
- Google Form URLs match the canonical strings character-for-character
- Every page under 500 KB — HTML, CSS, JS, all four webfonts, and the heaviest
  candidate from each `<picture>` or `srcset` group

It cannot judge copy or verify a fact. Those stay human jobs.

---

## Assets

Regenerate by hand when a master changes; none of this runs during `npm run
build`. Each needs `pip install Pillow` except the font script.

```bash
python3 tools/generate-logo-sizes.py   # web logo sizes + the social card
python3 tools/optimize-photos.py       # photographs -> WebP + JPEG
python3 tools/fetch-fonts.py           # vendor Montserrat + Noto Sans locally
```

To show the site to someone without deploying it, `tools/build-preview.py`
squashes `dist/` into a single self-contained HTML file — every stylesheet,
font, and image embedded, plus a small script that swaps pages when a link is
clicked. Output lands in `preview/`, which is generated and not committed.

```bash
node build.mjs && python3 tools/build-preview.py
```

The preview is for looking at only. If it ever disagrees with `dist/`,
`dist/` is right.

Two opposite rules, both deliberate:

- **Logo marks ship as palette PNG.** Flat illustration with hard edges, where
  a 256-colour PNG beats WebP outright — 41 KB against 58 KB at 600px.
- **Photographs ship as WebP with a JPEG fallback.** The opposite case, and the
  only asset class heavy enough to threaten the page budget.

Fonts are **self-hosted, not loaded from Google**. `CLAUDE.md` §2 bans shipping
third-party surveillance into a site serving a specific ethnic community, and a
Google Fonts request reports every visitor before a word is drawn.

---

## The two things that carry real risk

**1. The application forms.** Five intakes post to a Google Apps Script Web App
that writes to a BLPAPA-owned Sheet and emails a copy. A broken submit handler
is a person who did not get registered for the festival.

The repository ships in the **safe state**: `forms.unifiedEndpoint` in
`content/site.json` is empty, so the forms show a preview notice and send
people to the original Google Forms, which stay live and monitored. See
`docs/forms-setup.md` for the setup and the pre-launch checklist.

**2. Money copy.** 501(c)(3) status and the EIN are verified and may be stated.
Impact figures, overhead ratios, and fundraising totals are not — and inventing
them is legal exposure for the organization, not a design flourish.
`CLAUDE.md` §5.5 has the rules.

---

## Deploying

Netlify, free tier. `netlify.toml` sets the build command, the publish
directory, security headers, and 301s from the old Google Sites paths.

Decap CMS at `/admin` needs Netlify Identity and Git Gateway enabled on the
site, and the owner invited by email. `docs/owner-guide.md` is written for her.

**Do not touch DNS.** This is still an unsolicited pitch.

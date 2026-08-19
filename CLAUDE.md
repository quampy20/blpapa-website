# CLAUDE.md — BLPAPA Website

Guidance for Claude Code / any AI agent working in this repository. Read this
before writing code. If an instruction here conflicts with a request in the
chat, follow the chat and note the deviation in `HANDOFF.md`.

---

## 1. What this project is

A full redesign of the website for **Bukang Liwayway Pilipino-Amerikano
Pangarap Asosasyon (BLPAPA)** — a Filipino-American cultural non-profit
founded in **2023**, based in **Elk Grove, California**.

The organization currently runs on Google Sites
(`https://sites.google.com/blpapa.org/blpapa/home`). That site is dated,
awkward on mobile, buries the mission, and publishes its quarterly newsletter
as scanned images that cannot be read or searched. This project replaces it.

**Important framing:** this redesign is being built *speculatively* as a
surprise pitch to the organization. It has not been commissioned. Every page
must be presentation-ready at all times — there is no "we'll polish it later"
phase. Assume any commit could be the one that gets demoed.

### Who the site serves

1. **Local Filipino-American community members** — the primary audience.
   Goal: get them to join, attend events, volunteer, perform, and vend.
2. **The general public** — secondary. Goal: teach them something real about
   Filipino culture, then invite them to donate.

Design decisions get resolved in favor of audience 1. When copy has to choose,
it speaks to the community and lets the public listen in — never the reverse.

---

## 2. Stack

| Layer | Choice |
|---|---|
| Markup | Hand-written semantic HTML5, one file per page |
| Styling | Plain CSS with custom properties. No framework, no preprocessor |
| Scripting | Vanilla JS, ES modules, progressive enhancement only |
| Content | Markdown + JSON in `/content`, rendered at build time |
| CMS | Decap CMS (`/admin`), git-backed, Netlify Identity auth |
| Hosting | Netlify, free tier |
| Build | Node script (`npm run build`) → `/dist`. Keep it under ~200 lines |

### Why this stack (do not relitigate without asking)

The owner is non-technical and came from Google Sites. Decap gives her a
web form to edit content, commits to git on her behalf, and costs nothing.
Netlify's free tier covers a site this size indefinitely, including a custom
domain and HTTPS. A framework would add a build toolchain, a dependency
upgrade treadmill, and a class of failure the org cannot debug. Static HTML
will still render in ten years.

### Hard constraints

- **No client-side framework.** No React, Vue, Svelte, Alpine, jQuery.
- **No CSS framework.** No Tailwind, Bootstrap.
- **No runtime npm dependencies.** Build-time dev dependencies are fine and
  should stay minimal (a markdown parser and a template engine at most).
- **No tracking, analytics, ad, or social SDK scripts** without explicit
  approval. This is a non-profit serving a specific ethnic community; do not
  ship third-party surveillance into it.
- **No web fonts beyond two families.** Self-host or use Google Fonts with
  `display=swap`. Two families total, not two per page.
- Total page weight budget: **< 500 KB** on first load, images included.

---

## 3. Design system

**The authority for everything in this section is
`BLPAPABrandandWebsiteStyleGuide.pdf`** (project docs, prepared 18 Aug 2026),
built from the approved horizontal logo finalized August 2026. It supersedes
any palette, type, or motif guidance from the original brief.

Do not re-derive colors by sampling the logo. That was done in an earlier
session against the *old* logo and produced a different, now-obsolete palette.
If a value is not in this section, look it up in the style guide — not in a
screenshot.

### Brand idea

*Bukang Liwayway* means **dawn**. That is the whole brand in one word: a new
beginning, light, possibility, dreams becoming visible. The visual system
should feel **rooted, joyful, uniting, and aspirational** — culturally
specific and future-facing at once, never generic-nonprofit.

### Color

```css
:root {
  /* Primary palette — sampled from the approved logo */
  --blpapa-navy:            #042B34;  /* Heritage Navy — primary anchor */
  --blpapa-red:             #D5230C;  /* Bayanihan Red — LOGO + large only */
  --blpapa-red-accessible:  #B21A09;  /* Deep Red — all small UI text/buttons */
  --blpapa-gold:            #FDCF06;  /* Dawn Gold — accents, never text */
  --blpapa-green:           #1A552A;  /* Mountain Green — programs, nature */
  --blpapa-teal:            #125657;  /* River Teal — links, subheadings */
  --blpapa-cream:           #F0E8D1;  /* Warm Cream — alternating sections */

  /* Neutrals and secondary accent */
  --blpapa-white:           #FDFDFD;  /* Cloud White — default background */
  --blpapa-ink:             #0E1C20;  /* Charcoal — body text */
  --blpapa-orange:          #EB620F;  /* Sunrise Orange — sparing accent */
  --blpapa-gray:            #F3F5F4;  /* Soft Gray — subtle fields */
}
```

**Roles.** `--blpapa-navy` is the structural color — navigation, headings,
footer, primary buttons. `--blpapa-teal` is the reading color — links and
supporting headings. `--blpapa-ink` on white or cream is body text.
`--blpapa-green` categorizes programs. Red and gold are *punctuation*.

**The 60 / 25 / 10 / 5 rule.** From the style guide, and the single most
useful constraint in it:

| Share | What |
|---|---|
| 60% | White or cream backgrounds |
| 25% | Navy and teal structure |
| 10% | Green |
| 5% | Red, gold, and orange accents |

> *"Let the logo and cultural imagery remain the most colorful elements."*

The logo is already vivid. If the page competes with it, the page loses. A
section that uses every brand color is a bug.

### The two reds — do not confuse them

This is the most common way to get the brand wrong:

- **`#D5230C` (Bayanihan Red)** lives *inside the logo* and in large
  decorative headings. It is 4.21:1 on cream — **fails AA for body text.**
- **`#B21A09` (Deep Red)** is the interface red. Every link, label, button,
  and small element that needs to read as red uses this one.

Never recolor the logo's red. Never set small text in it on cream.

**Verified contrast** — every ratio below was independently recomputed and
matches the style guide exactly:

| Foreground / background | Ratio | Level | Use |
|---|---|---|---|
| Navy on Cloud White | 14.74 | AAA | Headings, body, navigation |
| Navy on Warm Cream | 12.26 | AAA | Story and program sections |
| Charcoal on Cloud White | 17.12 | AAA | Default body text |
| Charcoal on Warm Cream | 14.24 | AAA | Body on cream bands |
| Navy on Dawn Gold | 10.07 | AAA | Gold tags, highlighted cards |
| Mountain Green on Cloud White | 8.69 | AAA | Program labels |
| River Teal on Cloud White | 8.28 | AAA | Links, supporting headings |
| Mountain Green on Warm Cream | 7.22 | AAA | Program labels on cream |
| River Teal on Warm Cream | 6.88 | AA | Links on cream |
| Deep Red on Cloud White | 6.78 | AA | UI red on white |
| White on Deep Red | 6.78 | AA | Event button label |
| Deep Red on Warm Cream | 5.64 | AA | UI red on cream |
| Bayanihan Red on Cloud White | 5.07 | AA | Large emphasis only |
| White on Bayanihan Red | 5.07 | AA | Large decorative blocks |
| Bayanihan Red on Warm Cream | 4.21 | ❌ FAIL | **Use Deep Red instead** |
| Sunrise Orange on Cloud White | 3.28 | large only | Decorative |
| Dawn Gold on Cloud White | 1.46 | ❌ FAIL | Never text |

**Never:**

- Gold or orange as body text on white or cream.
- Red body text on gold, or logo red as small text on cream.
- Text directly over festival photography without a navy overlay or a solid
  text panel behind it.
- Color alone to carry meaning — always pair with a label, icon, or pattern.

### Button system

| Button | Recipe | Use |
|---|---|---|
| Primary | White text on Heritage Navy | Join, donate, register, apply |
| Event | White text on Deep Red `#B21A09` | Festival and deadline actions |
| Secondary | Heritage Navy text on Dawn Gold | Learn more, view programs |
| Outline | Navy border + navy text, transparent | Lower-priority actions |

### Typography

| | Family | Fallback |
|---|---|---|
| Headings | **Montserrat** | `Montserrat, Arial, sans-serif` |
| Body | **Noto Sans** | `Noto Sans, Arial, sans-serif` |

Geometric and confident for headings, to match the logo's rounded letterforms;
highly readable and broad in language support for body. Two families total, per
§2 — Montserrat and Noto Sans are the two. If custom fonts cannot load, use
Arial for both and **preserve the weight hierarchy**.

| Role | Desktop size | Weight | Color |
|---|---|---|---|
| Hero headline | 48–64px | 700–800 | Heritage Navy |
| Page title / H1 | 40–48px | 700 | Heritage Navy |
| Section title / H2 | 28–36px | 700 | Navy or Teal |
| Card title / H3 | 20–24px | 600–700 | Navy, Teal, or Green |
| Body | 17–18px | 400 | Charcoal |
| Small / metadata | 14–15px | 500–600 | Teal or muted gray |
| Button | 16px | 700 | Per button style |

Scale fluidly with `clamp()` between mobile and the desktop sizes above; the
table is the desktop end of the ramp, not a fixed pixel spec. Body stays at
**17px minimum** — many readers are older community members.

No script fonts for paragraphs or navigation. A decorative Filipino-inspired
display face may appear in **event artwork only**, never as a site typeface.

### Logo system

Five approved files. All are transparent PNG — unlike the old logo, they do
**not** carry a baked-in background, so they may sit on white, cream, or a
navy field.

| File | Size | Use |
|---|---|---|
| `blpapahorizontalwebsitetransparent1200.png` | 1200×480 | **Site header.** Web-optimized. |
| `blpapahorizontalrefinedtransparentmaster.png` | master | Horizontal source for new derivatives |
| `blpapahorizontalhighresolutiontransparent4096.png` | 4096 wide | Print, banners, large-format |
| `bukangliwaywaysealweb1000.png` | 966×1000 | Round seal — mobile header, favicon, social avatar, stamps, certificates |
| `bukangliwaywaycrestweb800.png` | 800×1120 | Vertical crest — stationery, PDFs, posters, merch, portrait layouts |
| `blpapasunmountaintransparent512x512.png` | 512×512 | **Simplified sun-over-mountain mark** — favicon, app icon, small mobile header, bullets, loading states |

**The simplified mark.** Sun over mountain, no figures, no lettering — the
style guide's called-for "simplified emblem at very small sizes." Use it
wherever the full seal would turn to mush: favicon, apple-touch-icon, app
manifest, a very narrow mobile header, and as a small repeating brand tick
(list bullets, section markers) where the full logo would be absurd.

Verified legibility: **clean at 64px and 32px, soft but still readable as a
sunrise at 16px.** That is a large improvement on the seal, which is mud below
64px. The art is landscape inside a square canvas, so tight-crop and recentre
before generating icon sizes or roughly a third of the box is empty.

Its colours sit close to but not exactly on the brand palette — the orange is
brighter than Sunrise Orange `#EB620F`, and the gold, teal, and cream are each
within a few units of their brand equivalents. **This is fine. Do not
"correct" the artwork to match the tokens.** Match CSS to the palette, not to
the mark.

**Header rule.** The **horizontal logo is the main website logo** and goes in
the top header. Desktop: start around **300–380px wide** and test legibility in
the real navigation. Minimum full-logo width **~280px**. Below that, swap to
the **seal** rather than shrinking the horizontal mark.

**Everywhere else.** The seal and crest are free to use across the site and on
other materials — PDFs, stationery, newsletters, merch, social. Match the shape
to the space: seal for anything round or square, crest for anything portrait.

**Clear space:** at least the height of one capital "B" around the whole mark.

**Do:** use the transparent PNG on white or very light cream; keep the
full-color version as the primary expression; use the seal at small sizes.

**Do not:** stretch, compress, rotate, crop, or rearrange it; place it on busy
photography or a similarly-colored background; recolor cultural details or
change the people in the illustration; add shadows, outlines, gradients, or
extra wording; detach the illustration and reuse it as stock art.

**Alt text** for the horizontal logo: `"BLPAPA — Bukang Liwayway
Pilipino-Amerikano Pangarap Association. A sunrise over a mountain with
community members in traditional Philippine dress."` The seal and crest, when
they appear alongside the name in text, are decorative: `alt=""`.

**Vector:** none of these is an SVG, and none is coming — the org's tooling
would not export one. This is no longer a gap worth chasing: the 4096px
horizontal covers every raster size the site needs, and the 512px simplified
mark covers icons. Generate the sizes you need from those two.

### Cultural motifs

Motifs come from the approved logo's own visual language. Extend it — do not
invent a second system alongside it.

| Motif | Use | Guardrail |
|---|---|---|
| **Philippine sun rays** | Section markers, subtle background bursts | Never assemble into an alternate logo |
| **Woven ribbon / textile band** | Dividers, event cards, footer accents | Keep secondary to content |
| **Landscape / mountain** | Place-based storytelling | Use the approved illustration style |
| **Sampaguita flowers** | Small accents, ceremonial moments | Do not repeat on every component |
| **Red-gold-blue flag cues** | Events and calls to action | Pair with navy/cream to avoid noise |

Implement patterns as CSS gradients or inline SVG, not raster images. Prefix
motif classes `motif-`. Every motif gets `aria-hidden="true"` and must be
removable without losing information.

**Avoid:** generic tropical imagery and tourist clichés; unrelated "Asian"
patterns; overcrowded pages where every section uses every brand color.

### Photography

Images should show culture being **practiced, taught, shared, and enjoyed** —
not treated as decoration.

- Prioritize candid human moments: dancing, teaching, cooking, performing,
  greeting guests, families learning together.
- Represent youth, elders, adults, families, artists, volunteers, and
  Filipino-owned businesses.
- Warm natural light, authentic environments, a mix of wide community scenes
  and close detail shots.
- Caption garments, instruments, dishes, and dances accurately where context
  matters.
- **Reusing BLPAPA's own already-published photos is approved** — images from
  their current website, Instagram (@bayanihanfestival), and the sponsorship
  packet may be carried over to the new site. This is a migration of the
  organization's own published material onto the organization's own new site,
  not a new publication decision. Confirmed by Jay, 19 Aug 2026.
- For any photo that is **not** already published by BLPAPA — a third party's
  image, or a new shoot — confirm the source and permission before use.

**Do not generate cultural clothing, instruments, flags, or historical scenes
with AI** without knowledgeable human review. Getting a regional costume wrong
is the kind of error this audience notices immediately, and the site is a pitch
to that audience.

### Layout

- Mobile-first. Author the small-screen rules, then add breakpoints up.
- Breakpoints: 480 / 768 / 1024 / 1280.
- Generous whitespace. The brief calls for "generous and open, not cluttered"
  — when in doubt, add space and remove an element.
- Touch targets ≥ 44×44px. A large share of traffic is phones.

## 4. Site structure

```
/                    Home — hero, mission, next event, photo strip, CTAs
/about/              Mission, vision, 2023 founding story, programs, board
/events/             Event listing; Bayanihan Festival detail page
/get-involved/       Membership, volunteer, performer, vendor — all forms
/culture/            Newsletter archive as real web pages; cultural content
/gallery/            Photo grid + embedded YouTube (incl. KCRA 2024 coverage)
/donate/             Impact copy + trust signals → links to GivingEdge (§5.5)
/contact/            Contact info + inquiry form
/admin/              Decap CMS (not in main navigation)
```

Navigation order is fixed as above. "Donate" additionally appears as a
persistent button in the header, visually distinct from the nav links.

### How each area should look

From the style guide §07. This is the fastest way to keep the palette
disciplined — it pre-decides the 60/25/10/5 balance per section.

| Area | Treatment | Why |
|---|---|---|
| Header | White background, full horizontal logo, navy navigation | Maximum logo clarity |
| Hero | Cream or white field, navy headline, red or gold accent, community image | Warm, optimistic first impression |
| Mission / story | Warm Cream background, navy text, teal labels | Editorial, reflective rhythm |
| Programs | White cards, navy titles, green and teal category accents | Organizes without over-coloring |
| Festival | White or cream field, red CTA, gold details, vivid photography | Celebratory but readable |
| Newsletter | Light teal background, navy text, navy primary button | Distinct, calm conversion section |
| Footer | Heritage Navy background, white text, gold focus/hover | Strong close, excellent contrast |

---

## 5. Content rules

These are the rules most likely to be violated by an agent moving fast. They
are the ones that matter most.

### 5.1 Never fabricate organizational facts — and never editorialize either

Two rules, and they pull in different directions. Hold both.

**Do not invent.** No made-up board members, event dates, dollar amounts,
attendance figures, program names, testimonials, partner organizations, or
history. If a fact is not in `/content/verified-facts.md` and not in material
BLPAPA supplied, it does not go on the page. This site will be shown to the
people who actually run this organization; a fabricated detail is the fastest
way to lose the pitch and it is dishonest besides.

**Do not put your questions on their website.** *Instruction from Jay,
19 Aug 2026, and it supersedes the old placeholder rule below.* Earlier
sessions filled the pages with visible red boxes reading "to be confirmed with
BLPAPA" and "verify before launch." Those are gone and must not come back. It
is not our place to question their message, their photographs, their roster, or
their wording on their own site, and a page covered in red boxes reads as
unfinished to the people we are trying to impress.

So when something is unknown, **write around it**. Say what is true, leave out
what is not known, and offer a way to find out:

```html
<!-- Right: the gap is invisible to the reader, and the page still works. -->
<p>Language, history, and cooking classes are on the way as our Educational
   Program grows. <a href="/contact/">Send us a note</a> and we will tell you
   when they open.</p>

<!-- Wrong: our open question, printed on their website. -->
<p class="placeholder">[Class schedule — to be confirmed with BLPAPA]</p>
```

That is not a licence to invent a schedule. It is the difference between a
finished sentence that happens not to contain a date, and a note to ourselves
left where the public can read it.

**Where the questions go instead:** `HANDOFF.md`. Every open question, source
conflict, and thing needing confirmation belongs there, in full detail. That is
what the file is for.

**Where sources disagree,** prefer BLPAPA's own most complete material and
present one clean answer. Do not print both versions and ask the reader to
sort it out. Log the discrepancy in `HANDOFF.md`.

**The one exception** is a functional warning a visitor genuinely needs — for
example, a form that cannot yet send. Keep those, keep them calm and plainly
worded, and phrase them as helpful direction rather than as a defect report.

### 5.2 Intake forms — unified page, but intake must not break

**Direction changed 19 Aug 2026.** The original rule was "link out to the
Google Forms, never rebuild them." That has been superseded: BLPAPA's five
separate forms are one of the worst parts of the current experience — an
undifferentiated list with no explanation of who each is for — and Jay wants a
**single unified forms page** instead. A mockup of that page exists (see
`HANDOFF.md` §5.8).

**What has not changed is the constraint underneath the old rule.** BLPAPA
already manages responses in Google Forms. Whatever we build, submissions must
still arrive where the organization already looks for them. A prettier form
that quietly drops a vendor application is far worse than an ugly one that
works.

So the rule is now:

- **Unify the presentation freely.** One page, clear routing, plain-English
  "this is for you if…" copy, shared fields collected once.
- **Submissions go to a Google Apps Script Web App**, which appends to a
  BLPAPA-owned Google Sheet and emails a copy to `bukangliwayway@blpapa.org`
  as a backstop. Decided 19 Aug 2026 — see `HANDOFF.md` §5.8 for the
  implementation shape and its gotchas. Do not substitute Netlify Forms,
  Formspree, or any third-party processor: it would put applicant data with a
  vendor and add a cost the org has not agreed to.
- **POST as `application/x-www-form-urlencoded`, never `application/json`.**
  JSON triggers a CORS preflight Apps Script does not answer.
- **Never hardcode the Apps Script endpoint.** It lives in
  `content/site.json` as `forms.unifiedEndpoint`. The script is built on a
  personal account and moves to a BLPAPA account if the pitch is accepted —
  redeployment issues a *new* URL, so this must stay a one-value edit.
  `HANDOFF.md` §5.8 has the migration checklist.
- **No reCAPTCHA.** Spam protection is a honeypot field plus a render-time
  check. reCAPTCHA is a third-party tracking script and §2 bans those.
- **Never ship a form whose submit path has not been tested end to end**, with
  a real test submission confirmed as arriving. This is the single highest-risk
  thing in the whole project.
- **Always provide the canonical Google Form link as a visible fallback**, so a
  user can complete the application even if the unified form fails.

These five URLs remain the source of truth and must be reproduced
character-for-character wherever they appear:

| Purpose | URL |
|---|---|
| Vendor application | `https://forms.gle/kouXfBpNwrdLDqUp8` |
| BLPAPA dancer application | `https://docs.google.com/forms/d/e/1FAIpQLSfeuSqK6Pfrc1bgEM8wTu8KkPxBQAUzUlV_B38VhUUs3sC7iw/viewform?usp=sharing` |
| Performer application | `https://forms.gle/5qUU2HFtGZH783Cg8` |
| Volunteer application | `https://forms.gle/rj6jPf3qSvStGwEN6` |
| Sponsorship info (PDF, Drive) | `https://drive.google.com/file/d/1b7yoeVSQmDcZZIykRFB16kGrt27jtc8r/view?usp=drive_link` |

Do not use `<iframe>` embeds of Google Forms. They are heavy, ignore the
site's typography, and are poor on mobile — and the unified page makes them
redundant anyway.

### 5.3 PDFs and scanned newsletters become real web pages

The current site publishes its quarterly newsletter as scanned images. This is
the single biggest failure of the existing site: unreadable on a phone,
invisible to search engines, inaccessible to screen readers.

Each newsletter becomes an HTML page at `/culture/newsletter/<issue-slug>/`
with real headings, real paragraphs, and real alt text. Keep the original PDF
linked at the bottom as an archival download — do not make it the primary
artifact.

Where scan text is genuinely illegible, mark it:

```html
<p class="placeholder">[Text unclear in original scan — awaiting clean copy]</p>
```

Do not guess at the words. Do not paraphrase from context.

**Do not silently correct the organization's own writing either.** The May 2026
issue contains "BDOG if May 7" where "is" was clearly meant. It is transcribed
as printed with a flagged comment. Typos in a founder's letter are the org's to
fix, not ours — surface them, do not quietly rewrite them.

There is **one** issue, not an archive: 4th Edition, May 2026. Do not build
archive pagination for a single item.

### 5.4 Voice

Warm, community-first, proud, inclusive. Never corporate, never transactional.

**Brand character** (style guide §02): **Rooted** — historically aware and
specific. **Joyful** — colorful and full of human movement. **Uniting** —
welcoming across generations and levels of familiarity. **Aspirational** —
focused on dreams, pride, learning, and legacy.

**Message hierarchy.** Primary: *"What is your dream? What is your legacy?"*
Supporting: *"Celebrate Filipino culture. Connect generations. Carry the
legacy forward."* Approved homepage headline option: *"A new dawn for Filipino
culture, community, and legacy."*

**Voice principles:**

| Principle | Application |
|---|---|
| Invite, do not lecture | "Come celebrate, learn, and share with us." |
| Use living, active language | Celebrate, connect, preserve, teach, perform, build, carry forward |
| Be specific about culture | Name the dance, dish, language, artist, tradition, or partner |
| Connect heritage to the future | Show how participating passes knowledge to the next generation |
| Keep institutional language human | "Our community" and "join us" over nonprofit jargon |

*Bukang Liwayway* means **dawn** — reach for that image when copy needs a
metaphor. It is the organization's own, and it beats anything invented.

- CTAs: "Join our community," "Celebrate with us," "Support our mission,"
  "Come dance with us." Not "Submit," "Learn more," "Click here."
- Filipino terms — *bayanihan*, *parol*, *kababayan*, *pasalubong* — are
  welcome and should be used naturally. Gloss on first use in a way that
  informs the outsider without lecturing the insider.
- Pride in heritage, framed as an open door. A non-Filipino visitor should
  feel invited, not tolerated.
- No em-dash-heavy AI cadence, no "In today's fast-paced world," no
  "we're thrilled to announce." Write like a person who lives in Elk Grove.
- **No Lorem Ipsum, ever.** Placeholder copy is written to fit the actual
  mission and clearly marked as draft.

### 5.5 Donations and legal claims

BLPAPA already raises money through **GivingEdge**, the Sacramento Region
Community Foundation's year-round giving platform (and the engine behind Big
Day of Giving). They have a live profile. **Do not build a new donation
mechanism and do not move them off it** — same reasoning as the Google Forms
in §5.2: it works, they know it, and the receipts and compliance are handled.

Canonical giving URL:

```
https://www.bigdayofgiving.org/organization/Bukang-Liwayway-Pilipino-Amerikano-Pangarap-Asosasyon
```

**Verified tax facts** — these are confirmed against IRS records and may be
stated on the site:

- 501(c)(3) public charity, **tax-exempt since April 2024**
- **EIN 93-2844176**
- NTEE classification: Arts, Culture, and Humanities N.E.C.

Approved phrasing: *"BLPAPA is a registered 501(c)(3) non-profit organization.
EIN 93-2844176. Donations are tax-deductible to the extent allowed by law."*

**Everything else about money is off-limits.** Specifically, do not write:

- A dollar figure tied to an outcome ("$50 buys a costume") unless BLPAPA
  supplies the number. Impact copy must describe **what a gift supports**, not
  what it purchases, until real program costs are provided.
- Percentage-to-program or overhead-ratio claims. No 990 has been filed yet;
  there is no source for these and inventing one is a legal exposure for the
  organization, not a design flourish.
- Fundraising totals, donor counts, or goal progress as **hardcoded** values.
  They are live figures on a platform we do not control and will go stale
  silently. If social proof is wanted, phrase it so drift is harmless and
  keep the number in `content/site.json` where the owner can edit it.
- Matching-gift, employer-match, or deadline urgency claims. None verified.

**Fee transparency.** GivingEdge retains **5.2%** to cover technology,
processing, and management, and grants funds to the organization no later
than 30 days after the end of the month of the gift. Do not print the fee on
the donate page — it is not standard practice and reads as a warning — but do
not claim "100% goes to the cause" either. That claim would be false.

### 5.6 The organization's name — DECIDED

**Use "Asosasyon" everywhere in copy.** That is what the live website, the IRS
record for EIN 93-2844176, and the GivingEdge profile all use, and it is the
registered legal name. Decision made 19 Aug 2026; not an open question.

The approved logo artwork reads "Pangarap **Association**" instead. That is
fine and requires no action: **reproduce the logo exactly as supplied** — never
edit the artwork to match the copy. A logo and a legal name differing slightly
is ordinary. If BLPAPA later wants them unified, that is their call to make.

Not in dispute anywhere: the org spells it **"Pilipino"** with a P in its own
name. Match that exactly. Use "Filipino" only when describing the culture or
people generally — "Filipino culture", "Filipino-American community".

---

## 6. Accessibility

Treated as a requirement, not a nice-to-have.

- Semantic HTML first: real `<nav>`, `<main>`, `<article>`, `<button>`.
  Never a `<div>` with a click handler where a `<button>` belongs.
- One `<h1>` per page. Heading levels descend without skipping.
- Every meaningful image has descriptive alt text. Decorative images get
  `alt=""`. Cultural imagery gets alt text that names what is happening —
  "Dancers performing tinikling with bamboo poles," not "dance photo."
- Visible focus states on every interactive element. Never `outline: none`.
- Fully keyboard-navigable, mobile menu included.
- Respect `prefers-reduced-motion`; disable parallax and autoplay under it.
- Never encode meaning in color alone.
- Test at 200% browser zoom.

---

## 7. Conventions

```
/
├── src/
│   ├── pages/          One .html per route
│   ├── partials/       header, footer, nav, event-card, form-cta
│   ├── styles/         tokens.css, base.css, layout.css, components/
│   ├── scripts/        One small ES module per behavior
│   └── assets/         images/, fonts/, logo/, motifs/
│                        logo/ holds all five approved marks — see §3
├── content/
│   ├── events/         One .md per event, YAML front matter
│   ├── newsletters/    One .md per issue
│   ├── gallery/        gallery.json
│   ├── site.json       Nav, contact, social, form URLs
│   └── verified-facts.md   ← single source of truth for org facts
├── admin/              Decap: index.html + config.yml
├── dist/               Build output. Never edited by hand, never committed
└── docs/               Style guide, site plan, owner instructions
```

- Files and directories: `kebab-case`. CSS classes: `kebab-case`, BEM-ish
  (`.event-card__date`). JS: `camelCase`. CSS custom properties: `--kebab-case`.
- Prefix cultural-motif classes with `motif-` so they are easy to audit.
- Comment the *why*, not the *what*. Cultural design choices in particular
  deserve a one-line comment — the next person will not know that the woven
  band under a section header is a textile motif from the logo, or that the
  ray geometry matches the logo's sun rather than the flag's, unless it says
  so. Cite the style guide section where relevant.
- Every commit leaves the site in a deployable state.

---

## 8. Working agreements

### 8.0 How to talk to the project owner

**Instruction from Jay, 19 Aug 2026.** Jay is not a developer. Explain things
the way you would to a bright ninth-grader: plain words, short sentences, and
the point first.

- **Say what changed and what it means for him.** Not "refactored the template
  layer" but "the pages now share one header, so a phone number is typed once
  and updates everywhere."
- **No jargon without a plain-English translation.** Avoid *endpoint, repo,
  commit, deploy, CSS, DOM, breakpoint, regex, CORS, WCAG* unless you
  immediately say what it means in ordinary words. Prefer the ordinary word
  outright: "the web address the forms send to," "saved," "published,"
  "how it looks on a phone."
- **Describe things by what the visitor sees**, not by the file that produces
  it. "The dark blue strip at the bottom of every page" beats
  `src/partials/footer.html`.
- **Lead with the answer.** Put the result in the first sentence, then the
  detail if it is needed. Do not narrate the steps taken to get there.
- **Numbers need a yardstick.** "400 KB, which is under our 500 KB limit and
  means it loads fast on a phone" — not a bare figure.
- **Keep file paths and code out of the summary** unless he asks. They belong
  in the files, not in the conversation.

This applies to chat replies. Code comments and the docs in `/docs` still carry
the technical detail, because a future developer reads those.

### 8.1 Before, during, after

**Before starting a task:** read `HANDOFF.md` for current state and open
questions. Do not re-derive what a previous session already settled.

**Before adding an organizational fact:** check `/content/verified-facts.md`.
If it is not there, it is not verified — placeholder it and add the question
to `HANDOFF.md`.

**Before adding a dependency:** don't. If it seems truly necessary, raise it
rather than installing it.

**After a work session:** update `HANDOFF.md` — what changed, what broke, what
is still open. This is the only reliable continuity between sessions.

**Definition of done for any page:**

- [ ] Renders correctly at 375px, 768px, and 1440px
- [ ] Keyboard navigable end to end; focus states visible
- [ ] All text/background pairs pass WCAG AA contrast
- [ ] All images have appropriate alt text
- [ ] Heading hierarchy is logical, one `<h1>`
- [ ] No fabricated facts; all placeholders visibly marked
- [ ] Any Google Form URL matches §5.2 character-for-character
- [ ] Loads under 500 KB
- [ ] Copy passes §5.4 voice check

---

## 9. Verified reference

Everything below is confirmed from the live BLPAPA site as of **19 Aug 2026**.
Do not contradict it. Do not extend it without a source.

- **Full name:** Bukang Liwayway Pilipino-Amerikano Pangarap Asosasyon (BLPAPA)
- **Founded:** 2023
- **Location:** Elk Grove, California
- **Email:** bukangliwayway@blpapa.org
- **Tagline:** "What is your dream? What is your legacy?"
- **Brand system:** `BLPAPABrandandWebsiteStyleGuide.pdf`, prepared
  18 Aug 2026 from the approved logo finalized August 2026. Authoritative for
  color, type, logo usage, motifs, and photography — see §3. Its seven stated
  contrast ratios were independently recomputed and all seven match.
- **Logo (approved, Aug 2026):** three lockups, five transparent PNG files.
  *Horizontal* — illustration left (sunrise over a green mountain, a crowd in
  regional Philippine dress, a Philippine flag, a woven textile band,
  sampaguita blossoms), wordmark right in navy with "Pangarap Association" in
  red, and "Dr. Edith Montemayor • Est. 2023" beneath in gold rule. *Seal* —
  the same scene in a circle, name in red arc text, founder line at the
  bottom over a woven band. *Crest* — vertical shield with a banner wordmark
  over a woven base. Note the name reads **"Association"** on the artwork;
  see §5.6, this conflicts with the legal name and is unresolved.
- **Name spelling:** the org uses **"Pilipino"** with a P. All sources agree.
  "Association" vs "Asosasyon" is disputed — §5.6.
- **Mission:** "Our organization is dedicated to promoting and preserving the
  rich heritage of Filipino culture. Through vibrant events, educational
  programs, and community engagement, we aim to celebrate and share the
  traditions, values, and artistic expressions that define our identity."
- **Vision:** "A future where the Filipino culture is celebrated, cherished,
  and integrated into the fabric of society. We envision a vibrant community
  that embraces our rich heritage, fosters intergenerational connections."
- **Board:** Dr. Edith Montemayor (Founder, CEO & President); Khrizza
  Manalastas (Secretary); John Tran (CFO & Treasurer); Rochelle Datangel
  (Director of Events). Volunteer: Mia Ancog (Marketing Director).
- **Programs:** Performing Arts Program (active — traditional Filipino dance,
  song, instruments). Educational Program (planned — Tagalog language,
  Filipino history, cuisine, fashion).
- **Flagship event:** Bayanihan Festival. Next: **27 Sep 2026, 11am–4pm,
  District 56, Elk Grove, CA. Free admission.** Inaugural: 8 Oct 2023,
  5,000+ attendees, 70+ vendors, performances by Jules Aurora and Jamieboy.
- **Media:** KCRA coverage of the 2024 festival (YouTube, linked from Events).
- **Photo sources:** the live website, Instagram @bayanihanfestival, and the
  sponsorship packet PDF (which contains festival photography including youth
  performing *tinikling*).
- **Newsletter:** Described as quarterly, but **only one issue exists** —
  4th Edition, May 2026, "Letter from our Founder" by Dr. Edith Montemayor.
  Transcribed at `content/newsletters/2026-05-fourth-edition.md`.
- **Rehearsal space:** as of the May 2026 newsletter, BLPAPA has **secured a
  dedicated rehearsal and community space.** No address published. Do not
  invent one; ask before naming a location.
- **Mailing address:** PO Box 580593, Elk Grove, CA 95758.
- **Phone:** 279-901-1025.
- **Domains:** `blpapa.com` (302-redirects to the Google Site) and
  `blpapa.org` (used for email and the Sites URL). They control both.
- **Social:** Facebook — "Bukang Liwayway Pilipino-Amerikano Pangarap
  Asosasyon". Instagram — **two accounts**: @bayanihanfestival (the festival,
  listed on GivingEdge) and **@bukangliwayway.blpapa** (the organization,
  found via search 19 Aug 2026 — verify before linking).
- **Press:** Sacramento News & Review covered the 2025 Bayanihan Festival
  (Oct 2025); New Times Magazine also covered it. BLPAPA additionally appears
  in Cal State Fair and Idealist listings. Useful as third-party credibility
  on About or Press — verify each link before use.
- **Tax status:** 501(c)(3) public charity, tax-exempt since **April 2024**.
  **EIN 93-2844176.** NTEE: Arts, Culture, and Humanities N.E.C. No Form 990
  on file yet — the org is too new. Confirmed via IRS records.
- **Fundraising:** Live GivingEdge profile (Sacramento Region Community
  Foundation). Campaign goal $15,000; $3,180 raised from 27 donors as of
  19 Aug 2026 — **a live figure, do not hardcode it.**
- **Self-description (GivingEdge):** "the sole Filipino-American organization
  in Elk Grove dedicated to preserving and celebrating Filipino culture."
  Strong positioning line — use it, it is theirs.
- **Programs (GivingEdge wording):** folk dancing now; planned expansion into
  Tagalog lessons, Filipino cuisine instruction, and native instrument
  classes. Note this is more specific than the website's "Educational
  Program" — prefer this wording.

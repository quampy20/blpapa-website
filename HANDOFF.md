# HANDOFF.md — BLPAPA Website

**Last updated:** 19 Aug 2026
**Updated by:** Claude Code (build session)
**Status:** Site built. All 10 pages, the CMS, and the docs are done. Not
deployed, and the forms are deliberately switched off — see §1.1.

Read this first, then `CLAUDE.md`. Update this file at the end of every
session — it is the only continuity between sessions.

---

## 1. Where things stand

| Area | Status |
|---|---|
| Requirements gathering | ✅ Complete — source brief in project docs |
| Existing site audit | ✅ Complete — see §3 |
| Platform decision | ✅ Decided — static HTML/CSS/JS + Netlify + Decap CMS |
| Brand system | ✅ Approved style guide received — authoritative, see `CLAUDE.md` §3 |
| Design tokens | ✅ Built as `src/styles/tokens.css`; all ratios re-verified |
| Logo assets | ✅ Complete, and now web-sized. Masters moved to `brand-assets/` |
| Repo scaffold | ✅ Build script, checks, preview server, asset tooling |
| Page builds | ✅ 10 of 10 (8 nav pages + festival detail + newsletter issue + 404) |
| Unified forms page | ✅ Built and tested end to end against a mock. **Endpoint intentionally empty** — §1.1 |
| Newsletter transcription | ✅ The one issue is live at `/culture/newsletter/fourth-edition-may-2026/` |
| Decap CMS config | ✅ `admin/config.yml`, three collections, editorial workflow |
| Deployment | ⬜ Not deployed — but `netlify.toml` is written. See §5.5 |
| Style guide doc | ✅ `docs/style-guide.md` |
| Site plan / pitch doc | ✅ `docs/site-plan.md` |
| Owner instructions | ✅ `docs/owner-guide.md` and `docs/forms-setup.md` |

Nothing has been deployed. No contact has been made with BLPAPA — **this is
still a speculative pitch** (see §6).

### 1.1 The one thing that is deliberately not finished

`forms.unifiedEndpoint` in `content/site.json` is **empty, on purpose.** That
is the safe state described in §5.8, and it is what the repository ships in.

With it empty, every form on the site shows a visible preview notice, refuses
to submit, and points the visitor at the canonical Google Form — which stays
live and monitored throughout. Filling it in before the Sheet lives on a
BLPAPA-owned account would mean real vendor applications landing in a personal
spreadsheet nobody is watching.

The five-step checklist in §5.8 is the gate. `docs/forms-setup.md` is the same
checklist written for a non-technical owner.

### 1.2 What was verified rather than assumed

- **The submit path was tested end to end** against a mock Apps Script
  endpoint. Confirmed: the POST is `application/x-www-form-urlencoded`, **no
  CORS preflight is triggered** (the mock was instrumented to fail loudly if
  one arrived — this is the failure mode §5.8 warns about), the response is
  read rather than assumed, a success resets the form, and a failure keeps
  everything the applicant typed on screen and shows them the Google Form.
- **Keyboard navigation**, including the mobile menu: Escape closes it and
  returns focus to the toggle. All 25 tab stops checked on the forms page show
  a 3px focus ring.
- **200% zoom and 375px**: no horizontal scrolling on any page.
- **`prefers-reduced-motion`**: transitions and smooth scrolling both disabled.
- **Contrast**: every text pairing recomputed, including the three derived
  tints that are not in the style guide. All pass AA; most reach AAA.
- **Page weight**: worst page is ~400 KB against the 500 KB budget, counting
  the HTML, CSS, JS, all four webfonts, and the heaviest image in each group.

`npm run check` re-runs the mechanical half of this on every build.

---

## 2. The decisions already made — and why

Do not reopen these without a reason. Re-deciding settled questions is the
main way this project loses time across sessions.

**Static hand-coded HTML/CSS/JS over WordPress, Squarespace, or Wix.**
The brief named all four as candidates. Static won on three grounds: total
design control (the cultural motif work is the whole pitch and templates
fight it), $0 recurring cost against a limited non-profit budget, and
longevity — no plugin updates, no theme deprecations, no renewal that lapses
when the volunteer who set it up moves on. The tradeoff is that the owner
cannot edit without the CMS layer, which is exactly why Decap is not optional.

**Decap CMS over Sanity, Contentful, or "just edit the HTML."**
Decap is free, git-backed, and presents a form-based UI at `/admin` that is
roughly as approachable as Google Sites. The owner never sees git. No vendor
account, no seat pricing, no data living somewhere BLPAPA does not control.
Setup cost is a one-time Netlify Identity configuration.

**Netlify over Vercel, GitHub Pages, or Cloudflare Pages.**
Netlify Identity + Git Gateway is what makes Decap work without the owner
holding a GitHub account. That integration is the deciding factor; the other
hosts are comparable on everything else.

**No client-side framework.**
Eight largely static pages. A framework would add a build toolchain and an
upgrade treadmill that nobody at BLPAPA can maintain, in exchange for nothing
this site needs.

**Google Forms preserved rather than rebuilt.**
Explicit requirement from the org. They already manage responses there.
Rebuilding intake would break a working process and create a data-handling
obligation nobody asked for.

**Google Forms: unify the presentation, preserve the destination.**
*This reverses an earlier decision — read the reasoning before reverting it.*
The original rule was to link out to the five Google Forms untouched. Jay
changed direction on 19 Aug 2026: the five-forms-in-a-list experience is one of
the current site's real weaknesses (audit weakness #6), and a single unified
forms page is worth building.

The reversal is narrower than it sounds. What made the old rule right was never
"Google Forms are good" — it was "BLPAPA already reads responses in one place
and breaking that costs them real applications." That constraint survives
intact. We are free to redesign the *front* of the form; we are not free to
silently move where the data *lands*. See §5.8 — the submit mechanism is now
the single highest-risk open item in the project.

**GivingEdge kept as the donation path, for the same reason.**
It turns out BLPAPA was never without a donation mechanism — they have a live
profile on GivingEdge, the Sacramento Region Community Foundation's year-round
giving platform. Linking it costs nothing, requires no setup, and puts
receipting and compliance on a trusted regional institution rather than on a
brand-new non-profit. The 5.2% platform fee is the price of that, and it is
worth paying today. Revisit only if giving volume grows enough for the fee to
exceed the cost of running an alternative (§5.4).

**Palette comes from the approved style guide. Twice superseded — read this.**
This decision has now changed twice, so the history matters:

1. The original brief proposed Philippine-flag colors (gold `#E8A020`, blue
   `#0038A8`, red `#CE1126`).
2. An earlier session sampled the *then-current* logo and replaced those with
   an orange/sage palette (`#E8923F` on `#EDEEE8`).
3. **Both are now obsolete.** BLPAPA has an approved brand system
   (`BLPAPABrandandWebsiteStyleGuide.pdf`, 18 Aug 2026) built on a **new logo
   finalized August 2026**, and the palette is different again: Heritage Navy
   `#042B34` anchoring, cream and white carrying the page, red and gold as
   punctuation.

The style guide wins outright — it is the organization's approved system, not
our inference. **Do not sample the logo to derive colors.** The values in
`CLAUDE.md` §3 are transcribed from the guide.

Confidence in that document is high: it states seven contrast ratios and all
seven recompute exactly, which is rare enough in a brand PDF to be worth
noting. Its palette is also genuinely accessible, which the earlier sampled one
was not — that palette's brand orange failed contrast at 2.1:1 and could not
be used for text at all. Navy at 14.74:1 has no such problem.

**Typography changed with it:** Montserrat headings + Noto Sans body, replacing
the Fraunces/Inter pairing an earlier session proposed. Still two families, so
§2's font budget holds.

**The one number the guide gets wrong by omission:** it tells you to use Deep
Red `#B21A09` for small text on cream but never says why. The reason is that
logo red `#D5230C` on cream is **4.21:1 — a straight AA failure for body
text**. That number is now in `CLAUDE.md` §3 so nobody "simplifies" back to one
red.

---

## 3. What the existing site actually contains

Audited 19 Aug 2026 from `https://sites.google.com/blpapa.org/blpapa/home`.
This is the migration source of record.

**Pages:** Home · About Us · Team · Events → Bayanihan Festival

**Note:** the site does not mention the organization's 501(c)(3) status, EIN,
mailing address, phone number, social accounts, or donation page. All of that
exists — it is just published on GivingEdge instead (see §5.4). Consolidating
it onto the new site is free credibility.

**Content confirmed:** full mission and vision statements, 2023 founding,
board roster (5 people), two programs (Performing Arts active; Educational
planned), Bayanihan Festival history and next date, contact email, tagline,
KCRA 2024 YouTube coverage, quarterly newsletter (4th Edition, May 2026).

All of this is transcribed verbatim in `CLAUDE.md` §9. Treat that section as
the fact base; do not re-scrape unless verifying a change.

**Five external links must survive the migration byte-for-byte** — four Google
Forms and one Drive-hosted sponsorship PDF. Exact URLs in `CLAUDE.md` §5.2.
Verify each one still resolves before launch; forms get archived and links
rot, and a dead vendor application during festival season is a real cost to
the organization.

### What is wrong with it (this is the pitch)

1. **Mission is buried.** The organization's purpose is the most compelling
   thing it has and it is below the fold behind a generic layout.
2. **Mobile is poor.** Google Sites' responsive behavior is weak and most of
   this audience is on a phone.
3. **The newsletter is scanned images.** Unreadable at phone width,
   un-searchable, invisible to screen readers, invisible to Google. Four
   editions of real community writing are effectively lost. Fixing this is
   the most visible single improvement available.
4. **No donation path on the site.** They *do* have a live GivingEdge profile
   raising real money (§5.4) — but nothing on the website points to it. Every
   visitor who arrives ready to give leaves without a way to. This is the
   cheapest fix on the list and probably the highest-return.
5. **Weak event discovery.** The flagship festival — 5,000+ attendees — is two
   clicks deep with no calendar, no reminders, no share affordance.
6. **Applications are undifferentiated.** Vendor, dancer, performer, and
   volunteer forms sit in a list with no explanation of who each is for.

Frame the redesign around these six. They are concrete, the org already feels
them, and each maps to a page in the new structure.

---

## 4. Suggested build order

Sequenced so there is always something demo-able.

1. **Scaffold + design tokens.** Repo structure per `CLAUDE.md` §7,
   `tokens.css` (transcribe the palette from `CLAUDE.md` §3 — it is already
   the style guide's own `:root` block), `base.css`, header/footer partials,
   the build script. Load Montserrat + Noto Sans with `display=swap`. Get one
   page deploying to Netlify before writing eight of them.
   **Optimize the logo files first** — they ship as 600KB–1.3MB PNGs (§5.1).
2. **Home page.** The pitch lives or dies here. The style guide gives an
   approved six-part sequence — follow it rather than inventing one:

   1. Header and hero — logo, concise promise, one primary action, one
      community image
   2. Mission in action — three pillars: celebrate, connect, carry forward
   3. Programs and learning — performing arts, language, history, food, fashion
   4. Bayanihan Festival — impact, upcoming date, participation and sponsorship
   5. Stories and newsletter — community voices, photos, recent updates
   6. Join the legacy — volunteer, donate, perform, vend, sponsor, or attend

   Approved headline option: *"A new dawn for Filipino culture, community, and
   legacy."* Note the sequence puts **one** primary action in the hero, not
   three — resist stacking CTAs.
3. **About + Events.** Highest-density verified content; fastest to make real.
   Bayanihan Festival gets its own detail page with the four application
   forms explained and differentiated.
4. **Get Involved — the unified forms page.** Now the biggest single piece of
   work and the most differentiating part of the pitch (§5.8). Build the
   front end from the mockup's field lists but in the approved brand system,
   and **solve the submit path before writing markup** — the answer to §5.8
   determines the form's structure, so deciding it late means rework.
5. **Culture & Resources.** Newsletter archive as real HTML. Blocked on source
   files (§5.2) — build the template and ship one issue as a demo.
6. **Gallery + Donate + Contact.** Gallery needs real photos (§5.3). Donate is
   unblocked — it is a content-and-trust page pointing at GivingEdge, no
   integration work (§5.4). Contact should surface the mailing address and
   phone that currently live only on GivingEdge.
7. **Decap CMS.** Wire `admin/config.yml` to the `/content` collections. Test
   the full loop as a non-technical user would: log in, add an event, see it
   live. If that loop is confusing, the whole approach fails.
8. **Docs:** style guide, site plan, owner instructions, maintenance tiers.

---

## 5. Open questions and blockers

Ordered by how much they block. Logo, brand system, donation path, photography,
and the name question are all resolved. **Nothing blocks the build.** §5.1–5.4, §5.7 and §5.8
are resolved or deliberately closed. Two items remain live but neither gates
writing code:

- **§5.5 (domain)** — a launch-day decision, and one only BLPAPA can make.
  Do not touch DNS regardless; this is still an unsolicited pitch (§6).
- **§5.6 (small unknowns)** — membership program, newsletter signup, which
  Instagram is primary. Handle each with a visibly-marked placeholder per
  `CLAUDE.md` §5.1 and keep building.

The one hard future gate is the pre-launch migration checklist in §5.8.

### 5.1 Logo — CLOSED

**Complete as of 19 Aug 2026.** Six approved transparent PNGs, plus the brand
style guide. Nothing outstanding.

| File | Size | Role |
|---|---|---|
| `blpapahorizontalwebsitetransparent1200.png` | 1200×480 | **Site header** — web-optimized |
| `blpapahorizontalrefinedtransparentmaster.png` | 1983×793 | Source for horizontal derivatives |
| `blpapahorizontalhighresolutiontransparent4096.png` | 4096×1638 | Print, banners, large format |
| `bukangliwaywaysealweb1000.png` | 966×1000 | Social avatar, stamps, certificates |
| `bukangliwaywaycrestweb800.png` | 800×1120 | Stationery, PDFs, posters, merch |
| `blpapasunmountaintransparent512x512.png` | 512×512 | **Favicon / simplified mark** |

**SVG: dropped, deliberately.** The org's tooling would not export one and the
upload path rejected the file type. It is not worth further effort — the
4096px horizontal covers every raster size the site needs and the 512px mark
covers icons. Do not reopen this unless a designer hands over a vector source
unprompted.

**Favicon legibility — tested, not assumed.** The simplified mark renders clean
at 64px and 32px and stays readable as a sunrise at 16px. (For contrast, the
full seal is mud below 64px and the full illustration is unusable at 32px.)
Two build notes:

- The art is **landscape inside a square canvas** — tight-crop to the alpha
  bbox and recentre before generating icon sizes, or ~35% of the icon box is
  empty and the mark looks small.
- At 16px the thin ray spokes blur out and only the sunrise gestalt survives.
  Acceptable. If someone later wants a crisper 16px, a further-simplified
  variant with fewer, thicker rays would do it — nice-to-have, not a blocker.

**Weight.** All the full-lockup files are heavy (600KB–4.4MB). Convert to WebP
with PNG fallback and size properly at build time; the 500KB page budget in
`CLAUDE.md` §2 is tighter than it looks. The icon derivatives are trivial by
comparison (32px = 2.3KB, 16px = 762B).

### 5.2 Newsletter — CLOSED

**Two corrections to earlier assumptions (19 Aug 2026, Jay):**

1. **There is only ONE newsletter**, not a four-edition archive. The site's
   other newsletter-looking item is just information about past events. Earlier
   notes here implied ~4 quarterly editions to transcribe — wrong. Scope is a
   fraction of what was planned.
2. **Page 1 is transcribed.** Jay supplied a legible scan; the text is at
   `content/newsletters/2026-05-fourth-edition.md`. No OCR guessing was
   needed — the scan was clean enough to read directly.

**What the issue contains** (4th Edition, May 2026, "Letter from our Founder"
by Dr. Edith Montemayor): AAPI Heritage Month; a Big Day of Giving appeal
carrying the GivingEdge link; and the announcement that BLPAPA **has secured a
dedicated rehearsal and community space.**

**Closed 19 Aug 2026.** Do not chase further pages or back-issues — Dr.
Montemayor will supply more if she has them. Build `/culture` around the one
transcribed issue and make it easy to add another later: one markdown file per
issue in `content/newsletters/`, rendered by a single template. If a second
issue never arrives, the section still reads as complete rather than empty.

**Minor items, non-blocking:**

- If more pages of this issue turn up later, append them to the same file —
  the front matter has a `transcription_status` field for exactly that.
- **One verbatim typo, unresolved by choice.** The original reads *"BDOG if May 7"* —
  almost certainly "is". The date itself is right (BDOG 2026 fell on Thursday
  7 May 2026). It is transcribed **as printed** with an HTML comment flagging
  it. Ask BLPAPA before silently correcting a founder's letter.
- **The founder's portrait** accompanies the letter and is worth reusing on
  About — a good, warm photo of Dr. Montemayor in traditional dress. Extract at
  the highest resolution available.

**Note the implication for `/culture`.** With one issue rather than four, a
"newsletter archive" is overbuilt. Better: publish this as a proper page at
`/culture/newsletter/fourth-edition-may-2026/`, and design the section so it
reads well with one entry and grows gracefully. Do not build archive
pagination for a single item.

### 5.3 Photography — RESOLVED

**Cleared 19 Aug 2026 (Jay).** Event photography is to be taken from BLPAPA's
own published material and carried onto the new site:

- The current website
- Instagram — **@bayanihanfestival**
- The sponsorship packet PDF —
  `https://drive.google.com/file/d/1b7yoeVSQmDcZZIykRFB16kGrt27jtc8r/view?usp=drive_link`
  (this is the source of the *tinikling* photo embedded in the forms mockup)

This is a migration of the organization's own already-public images onto the
organization's own new site, so it does not require a fresh permission pass.
Proceed without gating on consent questions for these images.

*Practical notes for whoever does the extraction:*

- Pull at the highest resolution available; Instagram's web sizes are small and
  will look soft in a hero.
- Convert to WebP with fallbacks and size to the slot — the page budget is
  500KB (`CLAUDE.md` §2) and photography is what will blow it.
- **Alt text still matters** and is not optional (`CLAUDE.md` §6). Name what is
  happening: "Youth performing tinikling with bamboo poles at the Bayanihan
  Festival," not "dance photo."
- Anything *not* from BLPAPA's own published material still needs its source
  confirmed.

### 5.4 Donation platform — RESOLVED

**Resolved 19 Aug 2026.** The earlier note here said the org had no donation
mechanism. That was wrong — they have a live **GivingEdge** profile:

```
https://www.bigdayofgiving.org/organization/Bukang-Liwayway-Pilipino-Amerikano-Pangarap-Asosasyon
```

GivingEdge is run by the Sacramento Region Community Foundation. It powers Big
Day of Giving (next: **Thursday, 6 May 2027**; the 2026 event raised $15.4M
across 886 regional non-profits) and accepts donations **year-round**, not
only on the giving day. Fee: **5.2%**, retained to cover technology,
processing, and management. Funds are granted to the organization no later
than 30 days after the end of the month of the gift.

**Decision:** GivingEdge is the primary and only giving path on the site. Do
not build a second one. See `CLAUDE.md` §5.5 for the rules that follow.

**Future option, not for this pitch:** PayPal Giving Fund passes 0% for
verified 501(c)(3)s and BLPAPA now qualifies. At current volume the fee
difference is small (~$165/yr against the $3,180 raised) and not worth adding
a second donate button, which reliably lowers conversion. Worth raising with
the org once annual giving is large enough that 5.2% is real money — mention
it in the pitch as a growth idea, not as a criticism of what they have.

**Also resolved: tax status.** Independently confirmed against IRS records —
501(c)(3) public charity, tax-exempt since **April 2024**, **EIN 93-2844176**,
NTEE "Arts, Culture, and Humanities N.E.C." No Form 990 filed yet (the org is
too new). The earlier warning against publishing tax-deductibility claims is
lifted for the basic statement; the ban on **fabricated financial specifics**
stands and is now written into `CLAUDE.md` §5.5.

### 5.5 Domain — decision needed at LAUNCH, not before

They control **two** domains, which the earlier audit missed:

- **`blpapa.com`** — currently a **302 redirect** to the Google Site. This is
  the address printed on their GivingEdge profile, so it is the one donors and
  partners actually see. It is the strongest candidate for the new site.
- **`blpapa.org`** — carries their email (`bukangliwayway@blpapa.org`) and the
  Google Sites URL.

*Recommended cutover:* point `blpapa.com` at Netlify as the canonical home,
301 `blpapa.org` to it, and leave the Google Site live until the org approves
the replacement. Map redirects from the old Sites paths (`/home`, `/about-us`,
`/team`, `/events`, `/events/bayanihan-festival`) so nothing 404s.

*Must confirm with Jay before touching anything:* who holds the registrar
logins, and whether the `.com` redirect is configured at the registrar or
through Google. **Do not attempt DNS changes** — see §6, this is still an
unsolicited pitch.

### 5.6 Smaller unknowns — placeholder and move on

- Social accounts: **Facebook** plus **two Instagram accounts** —
  @bayanihanfestival (on GivingEdge) and @bukangliwayway.blpapa (found via
  search). Ask which is primary, and get direct URLs before linking.
- **Press coverage — APPROVED for the site (Jay, 19 Aug 2026).** Sacramento
  News & Review and New Times Magazine both covered the 2025 festival; BLPAPA
  also appears in Cal State Fair and Idealist listings. None of this is on
  their current site. Build a press strip — logos or publication names with
  dates, linking out. Verify every URL resolves before shipping, and quote
  headlines accurately rather than paraphrasing them.
- Membership: the brief mentions membership info, but no membership form or
  dues structure was found. Is there a membership program?
- Newsletter signup: brief asks for it; no mailing list platform identified.
  Mailchimp free tier or Buttondown if one is needed.
- Events beyond Bayanihan Festival — are there smaller recurring ones? The
  GivingEdge profile mentions folk dancing as an ongoing activity, which
  implies regular rehearsals that could be listed.
- **Phone number** `279-901-1025` appears on GivingEdge but not the website.
  Confirm whether it should be public on the new site.
- The GivingEdge profile says leadership is **BIPOC-led** (both ED/CEO and
  Board Chair). Useful for grant-facing copy; ask before featuring it.
- Preferred pronunciation/usage: "BLPAPA" as letters or as a word? Affects
  voiceover, alt text, and how the name is written in copy.

### 5.7 The organization's name — CLOSED

**Decided 19 Aug 2026 (Jay):** use **"Asosasyon"** in all copy — matching the
live website, the IRS registration, and GivingEdge. The logo artwork says
"Association" and stays exactly as supplied. No reconciliation needed, no
question to take to BLPAPA. Rule is in `CLAUDE.md` §5.6.

### 5.8 Unified forms page — BUILT. Endpoint deliberately empty

**Status as of the build session:** the page is built at `/get-involved/`, the
Apps Script is written at `tools/apps-script/Code.gs`, and the whole submit
path has been tested end to end against a mock endpoint. What has *not*
happened, and must not happen until the checklist below is done, is pointing it
at a real deployment. The decision record follows unchanged.

**What the testing confirmed** (against a mock instrumented to fail loudly on a
preflight):

- The POST is `application/x-www-form-urlencoded;charset=UTF-8` and **no CORS
  preflight is triggered** — the single most common way this integration fails
- Field names arrive as readable spreadsheet column headers
- The response is parsed and checked, so a failed write cannot show a success
- On failure the applicant's typing is preserved and they are shown the
  canonical Google Form
- The honeypot and the render-time check are enforced in the browser, and the
  honeypot again in the Apps Script so posting straight at the endpoint does
  not bypass it

**One change from the plan:** the sponsor logo upload in the mockup was
dropped. See §7.1.

**What Jay asked for (19 Aug 2026):** replace the five scattered Google Form
links with one unified forms page, submitting to **a Google Sheet with an email
notification as backup**. A content mockup exists in the project as
`BLPAPA-Involvement-Website-Mockup.html`.

**What the mockup is — and firmly is not.**

It is a **content and flow mockup of the unified forms page only.** Jay was
explicit: it is *not* the visual standard, not a template, and not the design
direction for the rest of the site. Do not lift its layout, its CSS, its
component patterns, or its type into the real build. It was generated by a
different tool and does not follow the approved brand system in `CLAUDE.md` §3.
Take from it **only the field lists, section groupings, and copy.**

**What it contains** (inspected, not assumed): native HTML fields — 36 inputs,
17 selects, 14 textareas, 20 buttons — across five intakes, and **zero iframes
and zero references to the canonical Google Form URLs.**

| Intake | Sections in the mockup |
|---|---|
| Sponsorship | Organization and contact · Sponsorship details |
| Volunteer | Your information · Availability and interests · Background · Accessibility and accommodations |
| Performer | Performer information · Set timing and playback · Technical requirements · Media consent |
| Dancer | Your information · Dance background · Media consent |
| Vendor | Required acknowledgment · Business and contact · Vendor space selection · Terms and conditions |

### The submit path — decided

**Google Apps Script Web App, bound to a Google Sheet, sending an email
notification on every submission.**

This supersedes the earlier recommendation to POST through to the existing
Google Forms. It is better on every axis that matters here: it gives BLPAPA a
spreadsheet *and* an email trail, it has no silent-failure mode tied to
entry IDs, and it still costs nothing.

Why this fits the project's constraints:

- **Free, permanently.** No platform fee, no submission cap to blow through in
  festival season, nothing to renew.
- **Lives in BLPAPA's own Google account.** Same Drive, same login, same
  spreadsheet UI they already use daily. Nothing new to learn and no vendor
  holding their applicant data.
- **No runtime dependency and no backend** — satisfies `CLAUDE.md` §2. The site
  stays a static build on Netlify; the script is the org's, not ours.
- **Email is the backup that makes it safe.** If a sheet write ever fails, a
  human still gets the application in their inbox. This is precisely why the
  belt-and-braces version is worth the small extra effort.

**Implementation shape:**

1. Create a Google Sheet, one tab per intake (Sponsorship, Volunteer,
   Performer, Dancer, Vendor) — matches how they already think about these.
2. Bound Apps Script `doPost(e)` → `appendRow()` for the sheet, then
   `MailApp.sendEmail()` to `bukangliwayway@blpapa.org` with the submission
   formatted readably. Deploy as a Web App, execute as the owner, access
   "Anyone."
3. Site posts as **`application/x-www-form-urlencoded`** (or `text/plain`) —
   *not* `application/json`. JSON triggers a CORS preflight that Apps Script
   does not answer, which is the single most common way this integration
   fails. Verify the response is readable so real success/failure can be shown
   to the user rather than a hopeful "thanks!"
4. Show a genuine confirmation on success and a visible error with the
   canonical Google Form link on failure.

### Account ownership — decided, with a required migration

**Decided 19 Aug 2026 (Jay):** build on **Jay's Google account** for now. If
BLPAPA buys the site, either transfer the sheet or create a fresh one on their
account at that point.

Correct call — waiting on an account BLPAPA has not agreed to provide would
block the whole pitch. But it puts a hard gate on launch day, so treat the
following as a checklist, not a suggestion.

**While the sheet lives on Jay's account, the form must not take real
applications.** A vendor who submits through a demo lands in a personal
spreadsheet nobody is monitoring, and their application is effectively lost.
Until migration: keep the unified form behind the pitch (not on a public URL),
or point it at a test sheet and leave the canonical Google Form links as the
live path.

**The migration gotcha — the deployment URL changes.** These are two separate
artifacts and they behave differently:

- The **Sheet** can transfer ownership directly (Drive → Share → Make owner).
  A container-bound Apps Script travels with it.
- The **Web App deployment** does not survive intact. Redeploying under the new
  owner issues a **new endpoint URL**, and the old one stops working.

This is exactly why the endpoint is `forms.unifiedEndpoint` in
`content/site.json` rather than hardcoded in markup — migration should be a
one-value edit the owner could theoretically make themselves. **Do not
hardcode the Apps Script URL anywhere.**

**Also changes at migration:** `MailApp` sends from whoever owns the script, so
notification emails come from Jay's Gmail until transfer, then from BLPAPA's.
Confirm the notification recipient is `bukangliwayway@blpapa.org` either way,
not a personal inbox.

**Pre-launch checklist — all five, in order:**

1. Sheet transferred to (or recreated on) a BLPAPA-owned account
2. Apps Script redeployed under that account
3. `forms.unifiedEndpoint` in `site.json` updated to the new URL
4. A real test submission confirmed arriving in **both** the sheet and the inbox
5. Only then point the public site's form at it

**Other sub-questions:**

- **Spam.** A public endpoint with no protection will collect bot submissions.
  Use a honeypot field and a form-render timestamp check. **Do not add
  reCAPTCHA** — it is a third-party tracking script and `CLAUDE.md` §2 bans
  those without explicit approval.
- **Historical continuity.** Existing responses live in the current Google
  Forms' own response sheets. New submissions land in a new spreadsheet, so
  there is a break at cutover. Simplest handling: keep the old sheets as
  archive and start clean. Confirm BLPAPA is fine with that.

**Still required regardless** (`CLAUDE.md` §5.2): never ship a form whose
submit path has not been tested end to end with a real submission confirmed as
arriving in both the sheet and the inbox, and always show the canonical Google
Form link as a fallback. That fallback also covers users with JavaScript
disabled, for whom the native form cannot submit at all.

---

## 6. Things to be careful about

**This is an unsolicited pitch.** BLPAPA has not asked for this and does not
know it is happening. Two consequences: (a) quality bar is high because there
is exactly one first impression, and (b) do not contact the organization,
register domains, create accounts in their name, or claim affiliation. The
deliverable is a proposal, not a fait accompli.

**Do not fabricate anything.** This is the highest-risk failure mode. The
people reviewing this site are the people in it — a made-up board member,
invented attendance number, or fictional event date is immediately visible
and immediately fatal to credibility. `CLAUDE.md` §5.1 is the rule; treat it
as absolute. Verified facts live in `CLAUDE.md` §9 and nowhere else.

**Cultural motifs are now specified — follow the guide, don't improvise.**
Earlier sessions were inventing a motif language (parol, banig, baybayin). The
approved guide names a different set: Philippine sun rays, woven ribbon,
landscape, sampaguita, and flag cues, each with its own guardrail
(`CLAUDE.md` §3). Use that set. In particular **baybayin is not in the
approved system** — drop the earlier plan to use it rather than adding a
script the org never asked for. The old guidance stands in spirit: motifs are
structural, never the sole carrier of meaning, and "it looked nice" is not an
answer when the org asks why something is there.

**The forms are live infrastructure — and we are now rebuilding their front
end.** Those five URLs receive real vendor and volunteer applications today.
A typo in a link is a person who did not get registered for the festival; a
broken submit handler on a native form is the same failure, silently and at
scale. §5.8 is where this is worked out. Until a submit path is tested end to
end, the unified form is a mockup, not a feature.

**Accessibility is part of the brief, not polish.** Older community members
and multilingual readers are core audience. The 18px minimum and the AA
contrast floor in `CLAUDE.md` are requirements.

---

## 7. Next session: start here

The site is built. What remains is deployment and the questions only BLPAPA can
answer.

1. Read `CLAUDE.md` end to end, then §1.1 above.
2. Run `npm run check`. It should report 11 pages and no problems.
3. **Deploy to Netlify.** `netlify.toml` is written. Enable Netlify Identity
   and Git Gateway so `/admin` works, then invite the owner by email.
4. **Do not touch DNS** (§5.5). This is still an unsolicited pitch.
5. Re-verify the four Google Form URLs and the Drive PDF still resolve. All
   five returned HTTP 200 on 19 Aug 2026 and are unchanged in the code, but
   forms get archived and links rot.
6. Take the questions in §5.6 and §7.1 to BLPAPA if and when contact is made.
7. The forms stay off until every step of the §5.8 checklist is done.
8. Update this file before you stop.

### 7.1 Questions raised during the build

New since the discovery session. All are placeheld visibly on the site rather
than guessed at.

- **The board roster does not agree between two sources.** The organization's
  own website lists four board members and one volunteer (Dr. Edith
  Montemayor, Khrizza Manalastas, John Tran, Rochelle Datangel; Mia Ancog as
  Marketing Director). Their sponsorship material additionally names **Joyce
  Ballesteros** on the board and **Monica Alleje Simonson** in volunteer staff,
  and spells Mia's surname **"Acong"**. The site publishes the website roster —
  `verified-facts.md` is the source of truth — and carries a visible
  placeholder noting the difference. Do not merge the two lists without asking.
- **Sponsorship tiers and vendor pricing** are taken from the supplied mockup,
  which came from BLPAPA's own sponsorship packet. Worth confirming the
  figures are current before launch, since they are the only dollar amounts on
  the site.
- **The KCRA YouTube URL** (`watch?v=Fe-r1JNRCqw`) came from the same mockup.
  It is now in `site.json` and used on the Gallery page, with a visible
  placeholder asking for confirmation that it is the intended segment.
- **Festival deadlines** (performer 23 Aug, volunteer 6 Sep, vendor 31 Aug with
  payment 15 Sep) come from the mockup and are printed on the festival and
  forms pages. Confirm they are the 2026 dates.
- **A sponsor logo upload** was dropped from the sponsorship form. The Apps
  Script path is urlencoded text and cannot carry a file, and adding a
  third-party upload service would put sponsor assets with a vendor nobody
  agreed to. The form now says BLPAPA will ask for artwork by email after
  confirming. Revisit only if that proves awkward in practice.
- **The phone number** is published on the site (footer and Contact page). It
  is already public on GivingEdge, so this is not a new disclosure, but
  `site.json` still flags it and it is worth a yes from BLPAPA.

## 8. Session log

| Date | Session | What happened |
|---|---|---|
| 19 Aug 2026 | Discovery | Read brief + owner notes. Audited live Google Site (home, about, team, events, festival). Captured mission, vision, founding, board, programs, festival details, 5 external form/PDF URLs. Decided stack. Wrote `CLAUDE.md` and this file. No code. |
| 19 Aug 2026 | Logo intake | Jay supplied the live-site logo. Saved to `assets/blpapa-logo.png`, sampled 12 colors, computed contrast ratios, replaced the flag-derived palette with a logo-derived one in `CLAUDE.md` §3. Added logo usage rules and a mountain-silhouette motif. |
| 19 Aug 2026 | Newsletter closed | Jay: no further chasing — Dr. Montemayor will supply more issues if available. `/culture` to be built around the one transcribed issue, structured to grow. All open questions now resolved; project is build-ready. |
| 19 Aug 2026 | Form account | Decided: build the Sheet + Apps Script on Jay's Google account, migrate to BLPAPA's if they buy. Documented the migration gate — redeploying under a new owner issues a **new endpoint URL**, so the endpoint stays in `site.json` and is never hardcoded. Added a five-step pre-launch checklist and a rule that the form must not accept real applications before migration. |
| 19 Aug 2026 | Handoff package | Created `content/verified-facts.md` (referenced by `CLAUDE.md` since day one but never actually written) and `content/site.json`. Generated web-ready logo sizes as PNG+WebP (65–84% smaller). Staged the cleared festival photo. Wrote `README.md`. Ran a consistency audit: all cross-references resolve, all shared facts agree across files, no stale guidance survives outside the intentional decision-history prose. |
| 19 Aug 2026 | Newsletter + press | Jay supplied a legible scan of the newsletter and confirmed **only one issue exists** — scope corrected from ~4. Transcribed page 1 to `content/newsletters/`. New verified fact: BLPAPA has secured a dedicated rehearsal/community space. Press coverage approved for the site. Nothing blocking the build now. |
| 19 Aug 2026 | Form submit path | Decided: Apps Script Web App → Google Sheet + email notification, superseding the Google-Forms-POST-through idea. Free, org-owned, no backend, with email as the failure backstop. Documented implementation shape, the urlencoded/CORS gotcha, honeypot-not-reCAPTCHA, and the account-ownership question. |
| 19 Aug 2026 | Forms + photos | Jay cleared photography (reuse BLPAPA's own published images from site, Instagram, sponsorship PDF) — closed §5.3. Reversed the Google Forms decision: now building a **unified forms page**, mockup supplied. Inspected the mockup (native fields, no iframes, no canonical URLs) and opened §5.8 for the submit-path question. Clarified in-doc that the mockup is content-only, **not** a visual template. |
| 19 Aug 2026 | Favicon mark | Jay supplied `blpapasunmountaintransparent512x512.png` — simplified sun-over-mountain, no figures. Tested at 64/32/16px: clean, clean, soft-but-readable. Generated icon derivatives. Closed §5.1; SVG dropped as not worth chasing. |
| 19 Aug 2026 | Brand system | Jay added the approved style guide (18 Aug 2026) and five logo files. **Superseded the entire design system**: new palette (Heritage Navy anchor), new type (Montserrat/Noto Sans), new logo lockups, new motif set, photography direction. Verified all 7 of the guide's contrast ratios — all match — and added the missing logo-red-on-cream failure (4.21). Rewrote `CLAUDE.md` §3, added §4 section treatments, §5.4 voice principles, §5.6 name conflict. Closed §5.1. Opened §5.7. No code. |
| 19 Aug 2026 | **Build** | Built the whole site from the handoff package. Zero-dependency `build.mjs` + `lib/markdown.mjs`, `check.mjs` enforcing the §8 checklist, preview server, asset tooling. Design system from `CLAUDE.md` §3 with three derived tints, all contrast re-verified. 10 pages incl. the unified forms page and the newsletter as real HTML. Decap CMS wired with three collections and editorial workflow. **Tested the submit path end to end against a mock endpoint — urlencoded, no CORS preflight, both success and failure paths.** Verified keyboard nav, 200% zoom, 375px, reduced motion. Self-hosted the fonts instead of Google (§2's anti-surveillance rule). Wrote four docs. Endpoint left empty on purpose (§1.1). Raised the board-roster conflict and four other questions in §7.1. |
| 19 Aug 2026 | GivingEdge find | Jay found their GivingEdge profile. Confirmed 501(c)(3) + EIN 93-2844176 independently against IRS records. Captured mailing address, phone, both domains, socials, self-description, program detail, and live campaign figures. Closed §5.4. Rewrote §5.5 (domain). Added `CLAUDE.md` §5.5 governing donation and financial claims. No code written. |

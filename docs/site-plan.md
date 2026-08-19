# Site plan

What was built, and why each piece exists. The structure follows the six
weaknesses found in the audit of the current Google Site, because those are the
problems the organization already feels.

---

## The six problems, and where each is answered

| # | Problem on the current site | Answer |
|---|---|---|
| 1 | **The mission is buried** below the fold behind a generic layout | It is the hero. The headline, the three pillars, and the mission quote are the first three things on the home page |
| 2 | **Mobile is poor** — and most of this audience is on a phone | Authored mobile-first. Every layout starts at 375px and adds breakpoints upward |
| 3 | **The newsletter is scanned images** — unreadable, unsearchable, invisible to screen readers | `/culture/newsletter/fourth-edition-may-2026/` is real text with real headings |
| 4 | **No donation path**, despite a live GivingEdge profile raising real money | A Donate button in the header of every page and a full `/donate/` page |
| 5 | **Weak event discovery** — the flagship festival is two clicks deep | A dated stamp in the hero, a full festival page, and the date pulled from one place so it can never drift |
| 6 | **Applications are undifferentiated** — five form links in a list | One `/get-involved/` page where each intake says who it is for before it asks for anything |

---

## Pages

```
/                    Hero, mission, programs, festival, stories, press, join
/about/              Mission, vision, founding story, timeline, programs, board, press
/events/             Event listing and dance rehearsals
/events/bayanihan-festival/
                     Festival detail, the five ways to take part, vendor terms, sponsorship tiers
/get-involved/       The unified intake page — five applications, one place
/culture/            Newsletter, and the traditions behind the programs
/culture/newsletter/fourth-edition-may-2026/
                     The May 2026 issue as a real web page
/gallery/            Photography, KCRA video, written press
/donate/             What a gift supports, trust signals, GivingEdge
/contact/            Contact details and an enquiry form
/admin/              Decap CMS, not in the navigation
404.html             With real routes back
```

Old Google Sites paths (`/home`, `/about-us`, `/team`, `/events/...`) are
301-redirected in `netlify.toml`, so links already printed on flyers and on the
GivingEdge profile keep working after cutover.

---

## What is deliberately not on the site

Each of these is a decision, not an omission.

**Board biographies.** None are published anywhere, so none were written. The
page carries a visible placeholder instead. `CLAUDE.md` §5.1 is absolute on
this, and the people reviewing this site are the people in it.

**Impact figures tied to dollars.** No "$50 buys a costume." The Donate page
describes what a gift *supports* rather than what it *purchases*, because
BLPAPA has not supplied program costs and no Form 990 exists yet. Inventing one
would be legal exposure for the organization.

**A second donation mechanism.** GivingEdge is the only giving path. PayPal
Giving Fund would pass 0% against GivingEdge's 5.2%, which at current volume is
roughly $165 a year — not worth a second donate button, which reliably lowers
conversion. Worth revisiting when annual giving makes 5.2% real money.

**A newsletter archive with pagination.** One issue exists. The section is
built to read as complete with one entry and to grow gracefully.

**An embedded YouTube player.** The KCRA segment is linked, not embedded. An
iframe would load Google's tracking and ads into the page and be the heaviest
thing on the site.

**reCAPTCHA.** A third-party tracking script. Spam is handled with a honeypot
field and a render-time check, both enforced in the browser and again in the
Apps Script.

**Google Analytics, or any analytics.** Nothing on this site reports a visitor
to anyone.

---

## The technical shape, briefly

Hand-written HTML, CSS, and vanilla JavaScript, assembled by a build script
that has **no dependencies at all** — not even development ones. The whole
toolchain is `build.mjs`, `lib/markdown.mjs`, and Node itself. It will still
build in ten years without an `npm install` resolving.

Content lives in `/content` as Markdown and JSON, edited through Decap CMS at
`/admin` by someone who never sees git. Hosted on Netlify's free tier.

`npm run check` enforces the mechanical half of the definition of done:
one `<h1>` per page, headings that descend without skipping, alt text on every
image, no `outline: none`, no tracking scripts, no Lorem Ipsum, internal links
that resolve, Google Form URLs matching the canonical strings
character-for-character, and every page under 500 KB.

---

## Before this goes live

The forms are the one thing that must be finished rather than reviewed. In
order, from `docs/forms-setup.md`:

1. Create the intake spreadsheet on a **BLPAPA-owned** Google account
2. Deploy the Apps Script from that account
3. Put the deployment URL in `content/site.json` as `forms.unifiedEndpoint`
4. Send a real test submission and confirm it arrives in **both** the sheet
   and the inbox
5. Only then rely on the site's forms

Until step 3, the forms show a preview notice and send people to the original
Google Forms, which stay live throughout. That is the safe state, and it is the
state this repository ships in.

Also worth confirming before launch:

- The four Google Form URLs and the sponsorship PDF still resolve
- The KCRA YouTube link is the intended segment
- Whether the phone number should be public on the website
- The Facebook page URL, and which Instagram account is primary
- The board roster (two sources disagree — see `HANDOFF.md`)
- Sponsorship tiers and vendor pricing against the current packet

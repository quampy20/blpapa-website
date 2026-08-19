# Editing the website

This guide is for whoever at BLPAPA looks after the site. It assumes no
technical background, and nothing in it requires you to touch code.

You edit the website through a form-based editor at
**`https://blpapa.com/admin/`**. It looks a little like Google Sites: you fill
in fields, you press a button, the website updates.

---

## Logging in

1. Go to `https://blpapa.com/admin/`
2. Click **Login with Netlify Identity**
3. Use the email and password you were invited with

If you have never logged in, someone with access to the Netlify account needs
to invite your email address first. There is no public sign-up, which is
deliberate.

Forgotten password? Click **Forgot password** on that same screen.

---

## How changes get published

When you save, your change does **not** go live immediately. It goes into a
review queue first, under the **Workflow** tab at the top:

**Drafts** → **In review** → **Ready**

Drag a card to **Ready** and click **Publish** to put it live. A minute or two
later the website updates itself.

This exists so a mistake is never instantly public, and so nothing is ever
truly lost — every version is kept and can be brought back.

---

## What you can change

### Website settings

Everything that changes over time and is not a whole page of writing.

**Contact details** — email, phone, mailing address. These appear in the footer
of every page and on the Contact page. Change them here once and they change
everywhere.

**Social media** — your Instagram and Facebook addresses. Paste the full web
address, the one that starts with `https://`.

**Next event** — the festival's date, time, venue, and admission. This one is
worth understanding, because it feeds the home page banner, the events page,
and the festival page all at once. Change the date here and every mention of it
updates together.

**Donations** — the GivingEdge address every Donate button points at, and the
donor count shown on the Donate page.

> The tax-deductibility sentence has been checked for accuracy. Please ask
> before changing its wording.

**Application forms** — where the website's forms send applications. See
`forms-setup.md`. If this is blank, the forms are switched off and visitors are
sent to the original Google Forms instead.

**Menu** — the links across the top of every page, in order.

**Press coverage** — publications that have written about BLPAPA.

### Newsletter issues

Each issue becomes its own page, in real text. That matters more than it
sounds: a scanned image cannot be read on a phone, cannot be found by Google,
and cannot be read aloud to somebody who is blind. Typed text can be all three.

To add an issue: **Newsletter issues → New newsletter issue**, fill in the
details, and type the issue into the big box at the bottom.

Some notes on that box:

- `## A heading` on its own line makes a section heading
- `**important**` makes text bold
- A blank line starts a new paragraph
- Web addresses become links on their own

**Type it as printed.** If the original has a typo in it, leave the typo and
mention it to whoever wrote it. If a word is genuinely unreadable in a scan,
write `[unclear]` rather than guessing.

The **Web address** field becomes part of the page's link, so avoid changing it
once an issue is published or existing links to it will break.

### Events

For events other than the Bayanihan Festival. The festival's own details live
under **Website settings → Next event**, not here.

---

## Adding pictures

Any field that takes an image lets you upload one. Two things worth doing:

**Shrink it first.** A photo straight off a phone can be 5 MB, which is slow
for anyone on a phone connection. Anything around 1500 pixels wide is plenty.

**Describe it.** Where a description box appears, write what is happening in
the picture: "Young dancers performing tinikling with bamboo poles at the
Bayanihan Festival," not "photo 4." That description is what somebody using a
screen reader hears instead of the image, and it is what Google reads.

---

## Things to be careful with

**Do not invent details.** Names, dates, dollar figures, attendance numbers.
If you are not sure, leave it out or ask. The people reading this website are
the people in it.

**Do not add claims about money** beyond what is already there — how much of a
donation reaches programs, what a given amount buys, fundraising totals. Those
need to come from real records.

**Web addresses must be exact.** One wrong character in a Google Form link is a
vendor who never got registered for the festival.

---

## If something looks broken

Nothing you can do in the editor can permanently break the site. Every version
is kept.

1. Check the **Workflow** tab — the change may be sitting in review
2. Wait two minutes and refresh; publishing takes a moment
3. Try a hard refresh: **Ctrl+Shift+R**, or **Cmd+Shift+R** on a Mac

If a change made something look wrong, whoever set the site up can restore the
previous version.

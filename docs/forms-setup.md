# Connecting the application forms

The Get Involved page collects six kinds of submission (volunteer, performer,
dancer, vendor, sponsorship, and general enquiries from the Contact page) and
sends them to a **Google Sheet you own**, with an **email copy** to
`bukangliwayway@blpapa.org` as a backstop.

Nothing here costs money, and nothing lives outside BLPAPA's own Google
account.

> **The forms are switched off until you do this.** While the endpoint is
> blank, the website shows visitors a notice and points them at the original
> Google Forms, which stay live and monitored throughout. That is deliberate:
> an application landing in a spreadsheet nobody is watching is worse than no
> form at all.

---

## Why it is built this way

| | |
|---|---|
| **Free, permanently** | No platform fee, no submission cap to hit during festival season, nothing to renew. |
| **Yours** | The spreadsheet lives in BLPAPA's Google Drive, in the same interface you already use. No vendor holds applicant data. |
| **No server** | The website stays a set of static files. The script is Google's, running in your account. |
| **Email is the safety net** | If a spreadsheet write ever fails, a human still gets the application in their inbox. |

---

## Setup, once

### 1. Create the spreadsheet

On a **BLPAPA-owned Google account** (not a personal one), create a new Google
Sheet and name it something like *BLPAPA Applications*.

You do not need to create any tabs or headers. The script creates them the
first time each kind of application arrives.

### 2. Add the script

In that spreadsheet: **Extensions → Apps Script**.

Delete whatever is in the editor, then paste in the whole contents of
`tools/apps-script/Code.gs` from this repository. Save.

Check the `NOTIFY` line near the top says the address you want notifications
to go to. It should be an organization address, not somebody's personal inbox.

### 3. Deploy it as a web app

**Deploy → New deployment → Web app.**

| Setting | Value |
|---|---|
| Description | `BLPAPA intake` |
| Execute as | **Me** (the account that owns the sheet) |
| Who has access | **Anyone** |

"Anyone" sounds alarming and is not. It means the website can post to the
script without the visitor needing a Google account. The script only ever
writes to your sheet and sends you mail; it cannot read anything.

Google will ask you to authorize it. Click through the "unverified app"
warning — the app is yours.

Copy the **Web app URL** it gives you. It ends in `/exec`.

### 4. Tell the website where to send things

Either in the CMS at `/admin` (**Website settings → Application forms → Where
the website's forms send applications**), or by editing
`content/site.json` directly:

```json
"forms": {
  "unifiedEndpoint": "https://script.google.com/macros/s/AKfy.../exec"
}
```

Save. Netlify rebuilds the site automatically.

### 5. Test it before trusting it

**Do not skip this.** Open the live site, fill in one form for real, and send
it. Then check **both**:

- [ ] The row appeared in the spreadsheet, on the right tab
- [ ] The email arrived at `bukangliwayway@blpapa.org`

If either is missing, set `unifiedEndpoint` back to `""` and the site returns
to pointing people at the Google Forms while you sort it out.

---

## Moving the sheet to a different account

This is the step that catches people out, so it is worth reading before you
start rather than after.

The **spreadsheet** transfers cleanly: Share → make the new account the owner.
The script travels with it.

The **deployment does not**. Redeploying under a new owner issues a **brand
new URL**, and the old one stops working. So the order matters:

1. Transfer the sheet to (or recreate it on) the new account
2. Redeploy the script from that account — **Deploy → New deployment**
3. Update `unifiedEndpoint` with the new URL
4. Send a test submission and confirm it lands in both the sheet and the inbox
5. Only then rely on the site's forms again

One other thing changes: notification emails are sent by whoever owns the
script, so the "from" address changes at the same time.

---

## How it behaves

**When it works.** The visitor sees a confirmation. The row lands on the tab
for that kind of application. You get an email you can reply to directly,
because the reply-to is set to the applicant's address.

**When it fails.** The website tells the visitor plainly that it did not send,
keeps everything they typed on screen so nothing is lost, and points them at
the original Google Form. It never shows a confirmation for a submission that
did not arrive.

**Spam.** Every form carries a hidden field that people never see and bots
usually fill, plus a check that the form was on screen for at least a few
seconds. Both the browser and the script check the hidden field, so posting
straight at the endpoint does not get round it.

There is deliberately **no reCAPTCHA**. It is a third-party tracking script,
and this site does not ship those.

**New questions.** Add a field to the form on the website and the script adds a
matching column the next time a submission arrives. Existing rows are left
alone.

---

## If something goes wrong

| Symptom | Cause | Fix |
|---|---|---|
| Every submission fails | Deployment set to "Only myself" | Redeploy with access set to **Anyone** |
| Submissions stopped after an edit | Editing the script does not redeploy it | **Deploy → Manage deployments → Edit → New version** |
| Nothing arrives, no error | `unifiedEndpoint` points at an old deployment | Copy the current URL from Manage deployments |
| Sheet fills but no email | Gmail's daily send quota | Check the sheet directly; the quota resets after 24 hours |
| A form says "This form is a preview" | `unifiedEndpoint` is blank | Follow step 4 above |

The canonical Google Forms stay linked under every form on the site, so even a
complete failure of this setup leaves people a way to apply.

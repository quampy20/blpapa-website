/**
 * BLPAPA unified intake endpoint.
 *
 * Receives submissions from the Get Involved page, appends each one to a tab
 * in this spreadsheet, and emails a readable copy to the organization. The
 * email is the backstop: if a sheet write ever fails, a human still gets the
 * application in their inbox rather than it vanishing.
 *
 * SETUP — see docs/forms-setup.md for the full walkthrough.
 *
 *   1. Create a Google Sheet on a BLPAPA-owned account.
 *   2. Extensions > Apps Script, paste this file in, save.
 *   3. Deploy > New deployment > Web app.
 *        Execute as:  Me (the sheet owner)
 *        Who has access:  Anyone
 *   4. Copy the deployment URL into content/site.json as
 *      `forms.unifiedEndpoint`, then rebuild and redeploy the site.
 *   5. Send a real test submission and confirm it arrives in BOTH the sheet
 *      and the inbox before pointing the public site at it.
 *
 * The deployment URL changes if this script is ever redeployed under a
 * different account, which is exactly why the site keeps it in site.json
 * instead of hardcoding it.
 */

/** Where notifications go. Must be the organization's address, never a personal inbox. */
var NOTIFY = 'bukangliwayway@blpapa.org';

/** One tab per intake — matching how BLPAPA already thinks about these. */
var TABS = {
  volunteer: 'Volunteer',
  performer: 'Performer',
  dancer: 'Dancer',
  vendor: 'Vendor',
  sponsor: 'Sponsorship',
  contact: 'General enquiries'
};

function doPost(e) {
  try {
    var params = (e && e.parameter) || {};
    var intake = String(params._intake || '').toLowerCase();

    if (!TABS[intake]) {
      return json({ status: 'error', message: 'Unknown application type.' });
    }

    // Server-side honeypot check. The browser checks this too, but a bot
    // posting directly to the endpoint never runs that code.
    if (params._website) {
      // Answer 'ok' so a bot cannot tell it was filtered, and write nothing.
      return json({ status: 'ok' });
    }

    var record = {};
    Object.keys(params).forEach(function (key) {
      if (key.charAt(0) !== '_') record[key] = params[key];
    });

    var sheet = sheetFor(TABS[intake], record);
    appendRow(sheet, record, params._submittedAt);
    notify(intake, record);

    return json({ status: 'ok' });
  } catch (error) {
    // Surface the failure to the browser so the page can show the fallback
    // Google Form link rather than a false confirmation.
    return json({ status: 'error', message: String(error && error.message || error) });
  }
}

/** A GET is only ever a person checking the URL by hand. */
function doGet() {
  return json({ status: 'ok', message: 'BLPAPA intake endpoint. POST only.' });
}

/**
 * Fetch the tab for an intake, creating it with a header row if it is new.
 * New fields added to the website form later become new columns rather than
 * silently landing in the wrong one.
 */
function sheetFor(name, record) {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(name);
  if (!sheet) {
    sheet = book.insertSheet(name);
    sheet.appendRow(['Submitted'].concat(Object.keys(record)));
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold');
  }
  return sheet;
}

function appendRow(sheet, record, submittedAt) {
  var headers = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0];

  // Append any field the sheet has not seen before as a new column.
  Object.keys(record).forEach(function (key) {
    if (headers.indexOf(key) === -1) {
      headers.push(key);
      sheet.getRange(1, headers.length).setValue(key).setFontWeight('bold');
    }
  });

  var row = headers.map(function (header) {
    if (header === 'Submitted') return submittedAt ? new Date(submittedAt) : new Date();
    return record[header] === undefined ? '' : record[header];
  });
  sheet.appendRow(row);
}

function notify(intake, record) {
  var label = TABS[intake];
  var who = record['Full name'] || record['Name'] || record['Performer or group name']
    || record['Business name'] || record['Organization'] || 'Someone';

  var lines = Object.keys(record).map(function (key) {
    return key + ': ' + record[key];
  });

  MailApp.sendEmail({
    to: NOTIFY,
    replyTo: record['Email'] || record['Business email'] || NOTIFY,
    subject: 'New ' + label.toLowerCase() + ' application — ' + who,
    body: 'A new ' + label.toLowerCase() + ' application arrived from the website.\n\n'
      + lines.join('\n')
      + '\n\nIt has also been added to the ' + label + ' tab of the intake spreadsheet.'
  });
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

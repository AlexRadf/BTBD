// Google Apps Script backend for the crew intake site.
// Setup steps are in README.md. In short: paste this into a Sheet's Apps Script
// editor, set a GM_KEY script property, deploy as a web app ("Anyone" access),
// and put the /exec URL into js/config.js.

const SHEET_NAME = 'Dossiers';
const HEADERS = ['id', 'updated', 'role', 'jumpsuit', 'name', 'player', 'answered', 'dossier'];
const MAX_PAYLOAD = 45000; // a Sheets cell holds 50k characters

function doPost(e) {
  let data;
  try {
    const raw = (e.postData && e.postData.contents) || '';
    if (raw.length > MAX_PAYLOAD) return json_({ ok: false, error: 'too long' });
    data = JSON.parse(raw);
  } catch (err) {
    return json_({ ok: false, error: 'bad request' });
  }
  if (typeof data.id !== 'string' || !/^[A-Za-z0-9.]{8,64}$/.test(data.id) || !Array.isArray(data.answers)) {
    return json_({ ok: false, error: 'bad request' });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = sheet_();
    const row = [
      data.id,
      new Date(),
      String(data.role || ''),
      String(data.alias || ''),
      String(data.characterName || ''),
      String(data.playerName || ''),
      data.answers.filter(function (a) { return a && a.a; }).length + '/' + data.answers.length,
      JSON.stringify(data),
    ].map(safe_);

    // Resubmissions from the same browser overwrite their earlier row.
    const last = sheet.getLastRow();
    const ids = last > 1 ? sheet.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return r[0]; }) : [];
    const i = ids.indexOf(data.id);
    if (i >= 0) sheet.getRange(i + 2, 1, 1, row.length).setValues([row]);
    else sheet.appendRow(row);
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

// The GM page reads this with a <script> tag (JSONP), which sidesteps browser CORS checks.
function doGet(e) {
  const params = e.parameter || {};
  const cb = /^[A-Za-z_$][\w$]{0,60}$/.test(params.callback || '') ? params.callback : null;
  const reply = function (obj) {
    if (!cb) return json_(obj);
    return ContentService.createTextOutput(cb + '(' + JSON.stringify(obj) + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  };
  if (params.ping) return reply({ ok: true, pong: true });
  const key = PropertiesService.getScriptProperties().getProperty('GM_KEY');
  if (!key) return reply({ ok: false, error: 'GM_KEY script property is not set' });
  if (params.key !== key) return reply({ ok: false, error: 'unauthorized' });

  let sheet;
  try {
    sheet = sheet_();
  } catch (err) {
    return reply({ ok: false, error: String(err.message || err) });
  }

  // GM housekeeping: ?delete=<id>[,<id>…] removes those files; ?delete=* clears every file.
  if (params.delete) return reply(deleteFiles_(sheet, String(params.delete)));

  const last = sheet.getLastRow();
  const rows = last > 1 ? sheet.getRange(2, 1, last - 1, HEADERS.length).getValues() : [];
  const dossiers = [];
  rows.forEach(function (r) {
    if (!r[0]) return;
    try {
      dossiers.push(JSON.parse(String(r[7]).replace(/^'/, '')));
    } catch (err) {
      // skip rows edited into nonsense by hand
    }
  });
  return reply({ ok: true, dossiers: dossiers });
}

function deleteFiles_(sheet, which) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const last = sheet.getLastRow();
    if (last < 2) return { ok: true, deleted: 0 };
    const all = which === '*';
    const ids = which.split(',');
    const col = sheet.getRange(2, 1, last - 1, 1).getValues();
    const rows = [];
    col.forEach(function (r, i) {
      if (all || ids.indexOf(String(r[0])) >= 0) rows.push(i + 2);
    });
    if (rows.length && rows.length === col.length) {
      // Sheets won't delete every row under a frozen header, so blank the first and drop the rest.
      sheet.getRange(2, 1, 1, sheet.getMaxColumns()).clearContent();
      if (last > 2) sheet.deleteRows(3, last - 2);
    } else {
      // Bottom-up, so earlier row numbers stay valid as rows disappear.
      for (let i = rows.length - 1; i >= 0; i--) sheet.deleteRow(rows[i]);
    }
    return { ok: true, deleted: rows.length };
  } finally {
    lock.releaseLock();
  }
}

function sheet_() {
  // Works when the script is opened from a Sheet (Extensions -> Apps Script). For a standalone
  // script, set a SHEET_ID script property to the long id in the Sheet's URL.
  const id = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  const ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('No spreadsheet: open this script from a Google Sheet, or set SHEET_ID');
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Stop player text that starts with = + - @ from being read as a formula.
function safe_(v) {
  return typeof v === 'string' && /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

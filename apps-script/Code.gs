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
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function doGet(e) {
  const key = PropertiesService.getScriptProperties().getProperty('GM_KEY');
  if (!key || !e.parameter || e.parameter.key !== key) return json_({ ok: false, error: 'unauthorized' });

  const sheet = sheet_();
  const last = sheet.getLastRow();
  const rows = last > 1 ? sheet.getRange(2, 1, last - 1, HEADERS.length).getValues() : [];
  const dossiers = [];
  rows.forEach(function (r) {
    try {
      dossiers.push(JSON.parse(String(r[7]).replace(/^'/, '')));
    } catch (err) {
      // skip rows edited into nonsense by hand
    }
  });
  return json_({ ok: true, dossiers: dossiers });
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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

/**
 * GRAMASEVA Apps Script web app.
 * Keep this bound to the existing complaint spreadsheet. Deploy as a web app
 * executing as the spreadsheet owner and accessible to anyone.
 */
const SHEET_NAME_PROPERTY = 'GRAMASEVA_SHEET_NAME';
const ADMIN_SECRET_PROPERTY = 'GRAMASEVA_API_SECRET';
const DEFAULT_SHEET_NAME = 'Complaints';
const HEADERS = ['Complaint_ID', 'Name', 'Phone', 'Village', 'Category', 'Location', 'Description', 'Status', 'Created_Date', 'Solution'];

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  if (action === 'list') {
    if (!authorized_(e.parameter.key)) return json_({ success: false, error: 'Unauthorized.' });
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = spreadsheet && spreadsheet.getSheetByName('Complaints');
      if (!sheet) throw new Error('Complaints sheet not found.');
      ensureSolutionColumn_(sheet);
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) return json_({ success: true, complaints: [] });
      const rows = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
      const complaints = rows.filter(row => row[0] !== '').map(row => ({
        complaintId: String(row[0]), name: String(row[1] || ''), phone: String(row[2] || ''),
        village: String(row[3] || ''), category: String(row[4] || ''), location: String(row[5] || ''),
        description: String(row[6] || ''), status: String(row[7] || 'Pending'),
        createdDate: row[8] instanceof Date ? Utilities.formatDate(row[8], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(row[8] || ''),
        solution: String(row[9] || '')
      }));
      return json_({ success: true, complaints: complaints });
    } catch (error) {
      return json_({ success: false, error: String(error.message || error) });
    }
  }

  if (action) return json_({ success: false, error: 'Unsupported action.' });
  return HtmlService.createHtmlOutputFromFile('Index');
}

function doPost(e) {
  let body;
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (error) { return json_({ success: false, error: 'Invalid JSON request.' }); }

  if (body.action === 'updateComplaint' || body.action === 'update') {
    if (!authorized_(body.key)) return json_({ success: false, error: 'Unauthorized.' });
    return updateComplaint_(body);
  }
  if (body.action) return json_({ success: false, error: 'Unsupported action: ' + String(body.action) });
  return submitComplaint_(body);
}

function submitComplaint_(body) {
  const name = String(body.name || body.fullName || '').trim();
  const phone = String(body.phone || body.mobile || '').replace(/\D/g, '');
  const village = String(body.village || '').trim();
  const category = String(body.category || '').trim();
  const location = String(body.location || '').trim();
  const description = String(body.description || '').trim();
  if (!name || !phone || !village || !category || !location || !description) {
    return json_({ success: false, error: 'All complaint fields are required.' });
  }
  if (!/^[6-9]\d{9}$/.test(phone)) return json_({ success: false, error: 'Enter a valid 10-digit Indian mobile number.' });
  try {
    const sheet = sheet_();
    ensureSolutionColumn_(sheet);
    const id = 'GS-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Utilities.getUuid().slice(0, 6).toUpperCase();
    const createdAt = new Date();
    sheet.appendRow([id, name, phone, village, category, location, description, 'Pending', createdAt, '']);
    return json_({ success: true, complaintId: id });
  } catch (error) {
    return json_({ success: false, error: String(error.message || error) });
  }
}

function updateComplaint_(body) {
  const complaintId = String(body.complaintId || '').trim();
  const status = String(body.status || '').trim();
  const solution = String(body.solution || '');
  if (!complaintId || ['Pending', 'In Progress', 'Resolved'].indexOf(status) < 0) {
    return json_({ success: false, error: 'Complaint ID or status is invalid.' });
  }
  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = sheet_();
      ensureSolutionColumn_(sheet);
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) return json_({ success: false, error: 'Complaint not found.' });
      const ids = sheet.getRange(2, 1, lastRow - 1, 1).getDisplayValues();
      const index = ids.findIndex(row => row[0] === complaintId);
      if (index < 0) return json_({ success: false, error: 'Complaint not found.' });
      const rowNumber = index + 2;
      sheet.getRange(rowNumber, 8).setValue(status);
      sheet.getRange(rowNumber, 10).setValue(solution);
      return json_({ success: true, complaintId: complaintId, status: status, solution: solution });
    } finally { lock.releaseLock(); }
  } catch (error) {
    return json_({ success: false, error: String(error.message || error) });
  }
}

function sheet_() {
  const name = PropertiesService.getScriptProperties().getProperty(SHEET_NAME_PROPERTY) || DEFAULT_SHEET_NAME;
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Bind this script to the existing complaint spreadsheet.');
  const sheet = spreadsheet.getSheetByName(name);
  if (!sheet) throw new Error('Complaint sheet not found: ' + name);
  return sheet;
}

function ensureSolutionColumn_(sheet) {
  if (sheet.getMaxColumns() < 10) sheet.insertColumnsAfter(sheet.getMaxColumns(), 10 - sheet.getMaxColumns());
  const value = sheet.getRange(1, 10).getValue();
  if (!value) sheet.getRange(1, 10).setValue('Solution');
  else if (String(value).trim() !== 'Solution') throw new Error('Column J is already in use. Check the sheet headers before enabling solutions.');
}

function authorized_(provided) {
  const expected = PropertiesService.getScriptProperties().getProperty(ADMIN_SECRET_PROPERTY);
  return Boolean(expected && provided && constantTimeEqual_(String(expected), String(provided)));
}

function constantTimeEqual_(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let i = 0; i < left.length; i++) result |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return result === 0;
}

function json_(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON);
}

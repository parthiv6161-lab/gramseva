/**
 * GRAMASEVA Apps Script web app.
 * Keep this bound to the existing complaint spreadsheet. Deploy as a web app
 * executing as the spreadsheet owner and accessible to anyone.
 */
const SHEET_NAME_PROPERTY = 'GRAMASEVA_SHEET_NAME';
const PHOTO_FOLDER_ID_PROPERTY = 'GRAMASEVA_PHOTO_FOLDER_ID';
const PHOTO_FOLDER_NAME = 'GRAMASEVA Complaint Photos';
const DEFAULT_SHEET_NAME = 'Complaints';
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const VALID_STATUSES = ['Pending', 'In Progress', 'Resolved'];
const SECRET_PROPERTY_NAMES = ['GRAMASEVA_API_SECRET', 'APPS_SCRIPT_SHARED_SECRET', 'GRAMASEVA_SHARED_SECRET'];

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';

  if (action === 'list') {
    if (!authorized_(e.parameter.key)) return json_({ success: false, error: 'Unauthorized.' });
    try {
      const sheet = sheet_();
      const columns = columnMap_(sheet);
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) return json_({ success: true, complaints: [] });
      const width = rowWidth_(columns);
      const rows = sheet.getRange(2, 1, lastRow - 1, width).getValues();
      const complaints = rows
        .filter(row => String(row[columns.complaintId - 1] || '').trim() !== '')
        .map(row => ({
          complaintId: String(row[columns.complaintId - 1] || ''),
          name: String(row[columns.name - 1] || ''),
          phone: String(row[columns.phone - 1] || ''),
          village: String(row[columns.village - 1] || ''),
          category: String(row[columns.category - 1] || ''),
          location: String(row[columns.location - 1] || ''),
          description: String(row[columns.description - 1] || ''),
          status: String(row[columns.status - 1] || 'Pending'),
          createdDate: formatCellDate_(row[columns.createdDate - 1]),
          solution: String(row[columns.solution - 1] || ''),
          latitude: cellText_(row, columns.latitude),
          longitude: cellText_(row, columns.longitude),
          photoUrl: String(row[columns.photoUrl - 1] || '')
        }));
      return json_({ success: true, complaints: complaints });
    } catch (error) {
      return json_({ success: false, error: String(error.message || error) });
    }
  }

  if (action === 'getPhoto' || action === 'photo') {
    if (!authorized_(e.parameter.key)) return json_({ success: false, error: 'Unauthorized.' });
    try {
      const photo = complaintPhoto_(String(e.parameter.complaintId || '').trim());
      if (photo.error) return json_({ success: false, error: photo.error });
      return json_({ success: true, mimeType: photo.mimeType, data: photo.data });
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
  return submitComplaint(body);
}

function submitComplaint(body) {
  const name = String(body.name || body.fullName || '').trim();
  const phone = String(body.phone || body.mobile || '').replace(/\D/g, '');
  const village = String(body.village || '').trim();
  const category = String(body.category || '').trim();
  const location = String(body.location || '').trim();
  const description = String(body.description || '').trim();
  const latitude = String(body.latitude ?? (body.selectedCoords && body.selectedCoords.lat) ?? '').trim();
  const longitude = String(body.longitude ?? (body.selectedCoords && body.selectedCoords.lng) ?? '').trim();

  if (!name || !phone || !village || !category || !location || !description) {
    return json_({ success: false, error: 'All complaint fields are required.' });
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return json_({ success: false, error: 'Enter a valid 10-digit Indian mobile number.' });
  }

  let photo = null;
  if (body.photo && typeof body.photo === 'object' && !Array.isArray(body.photo) && (body.photo.data || body.photo.base64)) {
    try { photo = validatePhoto_(body.photo); }
    catch (error) { return json_({ success: false, error: String(error.message || error) }); }
  }

  let uploadedFile = null;
  try {
    const sheet = sheet_();
    const columns = columnMap_(sheet);
    const complaintId = newComplaintId_();
    const createdAt = new Date();
    let photoUrl = '';

    if (photo) {
      try {
        uploadedFile = uploadPhoto_(complaintId, photo);
        photoUrl = uploadedFile.getUrl();
      } catch (uploadError) {
        photoUrl = '';
      }
    }

    const row = new Array(rowWidth_(columns)).fill('');
    row[columns.complaintId - 1] = complaintId;
    row[columns.name - 1] = name;
    row[columns.phone - 1] = phone;
    row[columns.village - 1] = village;
    row[columns.category - 1] = category;
    row[columns.location - 1] = location;
    row[columns.description - 1] = description;
    row[columns.status - 1] = 'Pending';
    row[columns.createdDate - 1] = createdAt;
    row[columns.solution - 1] = '';
    if (columns.latitude > 0) row[columns.latitude - 1] = latitude;
    if (columns.longitude > 0) row[columns.longitude - 1] = longitude;
    row[columns.photoUrl - 1] = photoUrl;
    sheet.appendRow(row);

    const response = { success: true, complaintId: complaintId, photoUrl: photoUrl };
    if (photo && !photoUrl) response.photoWarning = 'Complaint registered, but the photo could not be uploaded. Please contact the administrator.';
    return json_(response);
  } catch (error) {
    if (uploadedFile) { try { uploadedFile.setTrashed(true); } catch (cleanupError) {} }
    return json_({ success: false, error: String(error.message || error) });
  }
}

function updateComplaint_(body) {
  const complaintId = String(body.complaintId || '').trim();
  const status = String(body.status || '').trim();
  const solution = String(body.solution || '');

  if (!complaintId || VALID_STATUSES.indexOf(status) < 0) {
    return json_({ success: false, error: 'Complaint ID or status is invalid.' });
  }

  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = sheet_();
      const columns = columnMap_(sheet);
      const lastRow = sheet.getLastRow();
      if (lastRow < 2) return json_({ success: false, error: 'Complaint not found.' });
      const ids = sheet.getRange(2, columns.complaintId, lastRow - 1, 1).getDisplayValues();
      const index = ids.findIndex(row => row[0] === complaintId);
      if (index < 0) return json_({ success: false, error: 'Complaint not found.' });
      const rowNumber = index + 2;
      sheet.getRange(rowNumber, columns.status).setValue(status);
      sheet.getRange(rowNumber, columns.solution).setValue(solution);
      return json_({ success: true, complaintId: complaintId, status: status, solution: solution });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    return json_({ success: false, error: String(error.message || error) });
  }
}

function columnMap_(sheet) {
  return {
    complaintId: columnRequired_(sheet, 'Complaint_ID'),
    name: columnRequired_(sheet, 'Name'),
    phone: columnRequired_(sheet, 'Phone'),
    village: columnRequired_(sheet, 'Village'),
    category: columnRequired_(sheet, 'Category'),
    location: columnRequired_(sheet, 'Location'),
    description: columnRequired_(sheet, 'Description'),
    status: columnRequired_(sheet, 'Status'),
    createdDate: columnRequired_(sheet, 'Created_Date'),
    solution: ensureSolutionColumn_(sheet),
    latitude: findColumn_(sheet, 'Latitude'),
    longitude: findColumn_(sheet, 'Longitude'),
    photoUrl: ensurePhotoColumn_(sheet)
  };
}

function rowWidth_(columns) {
  let width = 10;
  for (const key in columns) {
    if (Object.prototype.hasOwnProperty.call(columns, key) && columns[key] > width) width = columns[key];
  }
  return width;
}

function cellText_(row, column) {
  if (column < 1) return '';
  return String(row[column - 1] || '');
}

function formatCellDate_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return String(value || '');
}

function newComplaintId_() {
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  return 'GS-' + stamp + '-' + Utilities.getUuid().slice(0, 6).toUpperCase();
}

function validatePhoto_(photo) {
  const mimeType = String(photo.mimeType || photo.type || '').toLowerCase();
  const extension = PHOTO_TYPES[mimeType];
  if (!extension) throw new Error('Only JPG, JPEG, PNG and WEBP images are supported.');
  const rawData = String(photo.data || photo.base64 || '').replace(/^data:[^;]+;base64,/, '').replace(/\s/g, '');
  if (!rawData || !/^[A-Za-z0-9+/]+={0,2}$/.test(rawData)) throw new Error('The photo could not be read. Please choose another image.');
  let bytes;
  try { bytes = Utilities.base64Decode(rawData); }
  catch (error) { throw new Error('The photo could not be read. Please choose another image.'); }
  if (!bytes.length) throw new Error('That image is empty. Please choose another photo.');
  if (bytes.length > MAX_PHOTO_BYTES) throw new Error('The photo must be 5 MB or smaller.');
  if (!hasImageSignature_(bytes, mimeType)) throw new Error('That file is not a valid JPG, PNG or WEBP image.');
  return { bytes: bytes, mimeType: mimeType, extension: extension };
}

function byteAt_(bytes, index) {
  return index >= bytes.length || bytes[index] === undefined ? -1 : bytes[index] & 0xff;
}

function asciiAt_(bytes, start, length) {
  let text = '';
  for (let index = 0; index < length; index++) text += String.fromCharCode(byteAt_(bytes, start + index));
  return text;
}

function hasImageSignature_(bytes, mimeType) {
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    return byteAt_(bytes, 0) === 0xff && byteAt_(bytes, 1) === 0xd8 && byteAt_(bytes, 2) === 0xff;
  }
  if (mimeType === 'image/png') {
    return byteAt_(bytes, 0) === 0x89 && asciiAt_(bytes, 1, 3) === 'PNG' && byteAt_(bytes, 4) === 0x0d && byteAt_(bytes, 5) === 0x0a && byteAt_(bytes, 6) === 0x1a && byteAt_(bytes, 7) === 0x0a;
  }
  return bytes.length >= 12 && asciiAt_(bytes, 0, 4) === 'RIFF' && asciiAt_(bytes, 8, 4) === 'WEBP';
}

function photoFolder_() {
  const folderId = PropertiesService.getScriptProperties().getProperty(PHOTO_FOLDER_ID_PROPERTY);
  if (folderId) return DriveApp.getFolderById(folderId);
  const folders = DriveApp.getFoldersByName(PHOTO_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(PHOTO_FOLDER_NAME);
}

function uploadPhoto_(complaintId, photo) {
  const folder = photoFolder_();
  const fileName = complaintId + '-' + Utilities.getUuid().slice(0, 6).toUpperCase() + '.' + photo.extension;
  const blob = Utilities.newBlob(photo.bytes, photo.mimeType, fileName);
  return folder.createFile(blob);
}

function photoFileIdFromUrl_(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const fileMatch = text.match(/\/file\/d\/([^/?]+)/);
  if (fileMatch) return fileMatch[1];
  const idMatch = text.match(/[?&]id=([^&]+)/);
  if (idMatch) return decodeURIComponent(idMatch[1]);
  return /^[A-Za-z0-9_-]+$/.test(text) ? text : '';
}

function complaintPhoto_(complaintId) {
  if (!complaintId) return { error: 'Complaint ID is required.' };
  const sheet = sheet_();
  const photoColumn = findColumn_(sheet, 'Photo_URL');
  if (photoColumn < 0) return { error: 'Photo_URL column not found.' };
  const idColumn = columnRequired_(sheet, 'Complaint_ID');
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return { error: 'No photo uploaded.' };
  const ids = sheet.getRange(2, idColumn, lastRow - 1, 1).getDisplayValues();
  const index = ids.findIndex(row => row[0] === complaintId);
  if (index < 0) return { error: 'Complaint not found.' };
  const storedUrl = String(sheet.getRange(index + 2, photoColumn).getValue() || '').trim();
  const fileId = photoFileIdFromUrl_(storedUrl);
  if (!fileId) return { error: 'No photo uploaded.' };
  let file;
  try { file = DriveApp.getFileById(fileId); }
  catch (error) { return { error: 'The photo is no longer available.' }; }
  const blob = file.getBlob();
  const mimeType = String(blob.getContentType() || '').toLowerCase();
  if (!PHOTO_TYPES[mimeType]) return { error: 'The stored photo has an unsupported format.' };
  return { mimeType: mimeType, data: Utilities.base64Encode(blob.getBytes()) };
}

function sheet_() {
  const name = PropertiesService.getScriptProperties().getProperty(SHEET_NAME_PROPERTY) || DEFAULT_SHEET_NAME;
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error('Bind this script to the existing complaint spreadsheet.');
  const sheet = spreadsheet.getSheetByName(name);
  if (!sheet) throw new Error('Complaint sheet not found: ' + name);
  return sheet;
}

function findColumn_(sheet, header) {
  const wanted = String(header).trim().toLowerCase();
  const headers = sheet.getRange(1, 1, 1, sheet.getMaxColumns()).getDisplayValues()[0];
  for (let index = 0; index < headers.length; index++) {
    if (String(headers[index]).trim().toLowerCase() === wanted) return index + 1;
  }
  return -1;
}

function columnRequired_(sheet, header) {
  const column = findColumn_(sheet, header);
  if (column < 0) throw new Error('Required column not found: ' + header);
  return column;
}

function ensureSolutionColumn_(sheet) {
  const existing = findColumn_(sheet, 'Solution');
  if (existing > 0) return existing;
  return appendHeaderColumn_(sheet, 'Solution');
}

function ensurePhotoColumn_(sheet) {
  const existing = findColumn_(sheet, 'Photo_URL');
  if (existing > 0) return existing;
  return appendHeaderColumn_(sheet, 'Photo_URL');
}

function appendHeaderColumn_(sheet, header) {
  const lastColumn = sheet.getMaxColumns();
  sheet.insertColumnsAfter(lastColumn, 1);
  const newColumn = lastColumn + 1;
  sheet.getRange(1, newColumn).setValue(header);
  return newColumn;
}

function authorized_(provided) {
  if (!provided) return false;
  const properties = PropertiesService.getScriptProperties();
  for (let index = 0; index < SECRET_PROPERTY_NAMES.length; index++) {
    const expected = properties.getProperty(SECRET_PROPERTY_NAMES[index]);
    if (expected && constantTimeEqual_(String(expected), String(provided))) return true;
  }
  return false;
}

function constantTimeEqual_(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index++) result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return result === 0;
}

function json_(object) {
  return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON);
}

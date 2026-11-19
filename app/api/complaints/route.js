import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const allowedPhotoTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const maxPhotoBytes = 5 * 1024 * 1024;

function photoUploadError(photo) {
  if (photo == null) return '';
  if (typeof photo !== 'object' || Array.isArray(photo)) return 'Invalid photo upload.';
  const mimeType = String(photo.mimeType || '').toLowerCase();
  if (!allowedPhotoTypes.includes(mimeType)) return 'Only JPG, JPEG, PNG and WEBP images are supported.';
  if (typeof photo.data !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(photo.data)) return 'The photo could not be read. Please choose another image.';
  const bytes = Buffer.from(photo.data, 'base64');
  if (!bytes.length) return 'That image is empty. Please choose another photo.';
  if (bytes.length > maxPhotoBytes) return 'The photo must be 5 MB or smaller.';
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff) return 'That file is not a valid JPG, PNG or WEBP image.';
  } else if (mimeType === 'image/png') {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if (!signature.every((byte, index) => bytes[index] === byte)) return 'That file is not a valid JPG, PNG or WEBP image.';
  } else if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP') {
    return 'That file is not a valid JPG, PNG or WEBP image.';
  }
  return '';
}

export async function GET(request) {
  const endpoint = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SHARED_SECRET;
  if (!endpoint || !secret) return NextResponse.json({ error: 'Complaint service is not configured.' }, { status: 503 });
  try {
    const complaintId = String(new URL(request.url).searchParams.get('complaintId') || '').trim();
    if (!complaintId) return NextResponse.json({ error: 'Please enter a Complaint ID.' }, { status: 400 });
    const url = new URL(endpoint);
    url.searchParams.set('action', 'list');
    url.searchParams.set('key', secret);
    const response = await fetch(url.toString(), { method: 'GET', cache: 'no-store', redirect: 'follow' });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error('Complaint service returned an unreadable response.'); }
    if (!response.ok || data.success === false || data.error) throw new Error(data.message || data.error || 'Unable to check complaint status.');
    if (!Array.isArray(data.complaints)) throw new Error('Complaint service returned an unexpected response.');
    const match = data.complaints.find(item => String(item.complaintId || '').trim().toUpperCase() === complaintId.toUpperCase());
    if (!match) return NextResponse.json({ error: 'No complaint was found for that Complaint ID. Please check the ID and try again.' }, { status: 404 });
    return NextResponse.json({
      success: true,
      complaint: {
        complaintId: String(match.complaintId || ''),
        category: String(match.category || ''),
        village: String(match.village || ''),
        location: String(match.location || ''),
        createdDate: String(match.createdDate || ''),
        status: String(match.status || 'Pending'),
        solution: String(match.solution || ''),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to check complaint status.' }, { status: 502 });
  }
}

export async function POST(request) {
  const endpoint = process.env.APPS_SCRIPT_URL;
  if (!endpoint) {
    console.error('[GRAMASEVA] APPS_SCRIPT_URL is not configured.');
    return NextResponse.json({ error: 'Complaint service is not configured.' }, { status: 503 });
  }
  try {
    const payload = await request.json();
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      console.error('[GRAMASEVA] Invalid complaint payload received.');
      return NextResponse.json({ error: 'Invalid complaint submission.' }, { status: 400 });
    }
    const invalidPhoto = photoUploadError(payload.photo);
    if (invalidPhoto) {
      console.error('[GRAMASEVA] Complaint photo rejected:', { reason: invalidPhoto, mimeType: payload.photo && payload.photo.mimeType });
      return NextResponse.json({ error: invalidPhoto }, { status: 400 });
    }
    console.info('[GRAMASEVA] Forwarding complaint submission', {
      fields: Object.keys(payload).filter(field => field !== 'photo'),
      photoBytes: payload.photo && payload.photo.data ? Math.floor(payload.photo.data.length * 3 / 4) : 0,
      contentLength: request.headers.get('content-length'),
    });
    const complaintPayload = { ...payload };
    delete complaintPayload.action;
    delete complaintPayload.key;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(complaintPayload),
      cache: 'no-store',
      redirect: 'follow',
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch {
      console.error('[GRAMASEVA] Apps Script returned a non-JSON response', { status: response.status, contentType: response.headers.get('content-type'), body: text.slice(0, 1200) });
      throw new Error('Complaint service returned an unreadable response.');
    }
    if (!response.ok || data.success === false || data.error) {
      const backendError = data.message || data.error || 'Unable to submit complaint.';
      console.error('[GRAMASEVA] Apps Script rejected the complaint', { status: response.status, backendError, body: text.slice(0, 1200) });
      return NextResponse.json({ error: backendError }, { status: 502 });
    }
    console.info('[GRAMASEVA] Complaint registered', { complaintId: data.complaintId || data.complaintID || data.id, hasPhotoUrl: Boolean(data.photoUrl) });
    return NextResponse.json(data);
  } catch (error) {
    console.error('[GRAMASEVA] Complaint submission request failed:', error.message || error);
    return NextResponse.json({ error: error.message || 'Unable to submit complaint.' }, { status: 502 });
  }
}

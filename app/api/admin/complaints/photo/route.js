import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../../lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const allowedPhotoTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const maxPhotoBytes = 5 * 1024 * 1024;

export async function GET(request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const endpoint = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SHARED_SECRET;
  if (!endpoint || !secret) return NextResponse.json({ error: 'Complaint service is not configured.' }, { status: 503 });
  const complaintId = String(new URL(request.url).searchParams.get('complaintId') || '').trim();
  if (!complaintId) return NextResponse.json({ error: 'Complaint ID is required.' }, { status: 400 });
  try {
    const url = new URL(endpoint);
    url.searchParams.set('action', 'getPhoto');
    url.searchParams.set('key', secret);
    url.searchParams.set('complaintId', complaintId);
    const response = await fetch(url.toString(), { method: 'GET', cache: 'no-store', redirect: 'follow' });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); }
    catch {
      if (process.env.NODE_ENV !== 'production') console.error('[GRAMASEVA] Photo service non-JSON', { status: response.status, contentType: response.headers.get('content-type'), body: text.slice(0, 800) });
      throw new Error('The photo service returned an unreadable response.');
    }
    if (!response.ok || data.success === false || data.error) {
      if (process.env.NODE_ENV !== 'production') console.error('[GRAMASEVA] Photo service rejected request', { status: response.status, backendError: data.message || data.error || null, body: text.slice(0, 800) });
      throw new Error(data.message || data.error || 'Unable to load the complaint photo.');
    }
    const mimeType = String(data.mimeType || '').toLowerCase();
    if (!allowedPhotoTypes.includes(mimeType)) throw new Error('The stored photo has an unsupported format.');
    if (typeof data.data !== 'string' || !/^[A-Za-z0-9+/]+={0,2}$/.test(data.data)) throw new Error('The stored photo could not be read.');
    const bytes = Buffer.from(data.data, 'base64');
    if (!bytes.length || bytes.length > maxPhotoBytes) throw new Error('The stored photo could not be read.');
    return new NextResponse(new Uint8Array(bytes), { status: 200, headers: { 'Content-Type': mimeType, 'Cache-Control': 'private, max-age=300' } });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('[GRAMASEVA] Admin photo load failed:', error.message || error);
    return NextResponse.json({ error: error.message || 'Unable to load the complaint photo.' }, { status: 502 });
  }
}

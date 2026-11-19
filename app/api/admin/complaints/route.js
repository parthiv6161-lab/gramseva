import { NextResponse } from 'next/server';
import { isAdmin } from '../../../../lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const endpoint = process.env.APPS_SCRIPT_URL;

async function appsScriptRequest(url, options) {
  if (!url || !process.env.APPS_SCRIPT_SHARED_SECRET) throw new Error('Apps Script connection is not configured.');
  const response = await fetch(url, { ...options, cache: 'no-store', redirect: 'follow' });
  const text = await response.text();
  const contentType = response.headers.get('content-type') || '';
  let data;
  try { data = JSON.parse(text); } catch {
    if (process.env.NODE_ENV !== 'production') console.error('[GRAMASEVA] Apps Script returned non-JSON', { status: response.status, contentType, body: text.slice(0, 800) });
    if (/text\/html/i.test(contentType) || /^\s*<!doctype html|^\s*<html/i.test(text)) {
      const signInPage = /accounts\.google\.com|ServiceLogin|Sign in to continue/i.test(text);
      throw new Error(signInPage
        ? 'Google Apps Script redirected to a sign-in page. Deploy the web app to run as its owner and allow access to anyone; admin data still remains protected by the server-side shared secret.'
        : 'Google Apps Script returned an HTML page instead of JSON. Publish a new web app version containing the action=list GET handler, then try again.');
    }
    throw new Error(`Apps Script returned a non-JSON response (HTTP ${response.status}, ${contentType || 'unknown content type'}). Check the web app deployment and its GET handler.`);
  }
  if (!response.ok || data.success === false || data.error) {
    if (process.env.NODE_ENV !== 'production') console.error('[GRAMASEVA] Apps Script rejected request', { status: response.status, contentType, backendError: data.message || data.error || null, body: text.slice(0, 800) });
    throw new Error(data.message || data.error || 'Apps Script request failed.');
  }
  return data;
}

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const url = new URL(endpoint);
    url.searchParams.set('action', 'list');
    url.searchParams.set('key', process.env.APPS_SCRIPT_SHARED_SECRET);
    const data = await appsScriptRequest(url.toString(), { method: 'GET' });
    if (data.success !== true) throw new Error('Apps Script did not confirm a successful complaints response.');
    if (!Array.isArray(data.complaints)) throw new Error('Apps Script returned JSON, but it did not include a complaints array. Confirm that the deployed GET handler returns { success: true, complaints: [...] }.');
    const complaints = data.complaints.map(item => ({
      ...item,
      complaintId: String(item.complaintId ?? item.Complaint_ID ?? ''),
      name: String(item.name ?? item.Name ?? ''),
      phone: String(item.phone ?? item.Phone ?? ''),
      village: String(item.village ?? item.Village ?? ''),
      category: String(item.category ?? item.Category ?? ''),
      location: String(item.location ?? item.Location ?? ''),
      description: String(item.description ?? item.Description ?? ''),
      status: String(item.status ?? item.Status ?? 'Pending'),
      createdDate: String(item.createdDate ?? item.Created_Date ?? ''),
      solution: String(item.solution ?? item.Solution ?? ''),
      latitude: String(item.latitude ?? item.Latitude ?? ''),
      longitude: String(item.longitude ?? item.Longitude ?? ''),
      photoUrl: String(item.photoUrl ?? item.Photo_URL ?? '')
    }));
    if (process.env.NODE_ENV !== 'production') console.info('[GRAMASEVA] Admin complaints loaded', { count: complaints.length });
    return NextResponse.json({ success: true, complaints });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('[GRAMASEVA] Admin complaints GET failed:', error.message || error);
    return NextResponse.json({ error: error.message || 'Unable to retrieve complaints.' }, { status: 502 });
  }
}

export async function PATCH(request) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const { complaintId, status, solution } = await request.json();
    const statuses = ['Pending', 'In Progress', 'Resolved'];
    if (typeof complaintId !== 'string' || !complaintId.trim() || typeof status !== 'string' || !statuses.includes(status)) {
      return NextResponse.json({ error: 'A complaint ID and valid status are required.' }, { status: 400 });
    }
    const cleanedSolution = typeof solution === 'string' ? solution : '';
    const data = await appsScriptRequest(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'updateComplaint', key: process.env.APPS_SCRIPT_SHARED_SECRET, complaintId: complaintId.trim(), status, solution: cleanedSolution }),
    });
    if (data.success !== true) throw new Error('Apps Script did not confirm the complaint update.');
    return NextResponse.json({ success: true, message: 'Complaint status and solution saved.', complaintId: complaintId.trim(), status, solution: cleanedSolution });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('[GRAMASEVA] Admin complaint update failed:', error.message || error);
    return NextResponse.json({ error: error.message || 'Unable to save complaint updates.' }, { status: 502 });
  }
}

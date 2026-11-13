import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  if (!endpoint) return NextResponse.json({ error: 'Complaint service is not configured.' }, { status: 503 });
  try {
    const payload = await request.json();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      cache: 'no-store',
      redirect: 'follow',
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error('Complaint service returned an unreadable response.'); }
    if (!response.ok || data.success === false || data.error) return NextResponse.json({ error: data.message || data.error || 'Unable to submit complaint.' }, { status: 502 });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to submit complaint.' }, { status: 502 });
  }
}

'use client';

import { useState } from 'react';
import Link from 'next/link';

function Mark({ small = false }) {
  return <span className={`inline-flex items-center justify-center rounded-xl bg-[#e6f0e5] text-[#34734e] ${small ? 'h-9 w-9' : 'h-11 w-11'}`} aria-hidden="true"><svg viewBox="0 0 32 32" className="h-7 w-7" fill="none"><path d="M5 25h22M8 24V13l8-6 8 6v11M12 24v-7h8v7M4 13l12-8 12 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11h.01M20 11h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg></span>;
}

const statusStyles = {
  Pending: 'border-[#f0d9b5] bg-[#fff4e5] text-[#a4681c]',
  'In Progress': 'border-[#c9dcf0] bg-[#e8f1fb] text-[#356a9a]',
  Resolved: 'border-[#bfe0c6] bg-[#e9f6ec] text-[#2d6540]',
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TrackComplaint() {
  const [complaintId, setComplaintId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [complaint, setComplaint] = useState(null);

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    const id = complaintId.trim();
    if (!id) { setError('Please enter your Complaint ID.'); setComplaint(null); return; }
    setLoading(true); setError(''); setComplaint(null);
    try {
      const response = await fetch(`/api/complaints?complaintId=${encodeURIComponent(id)}`, { cache: 'no-store' });
      let data;
      try { data = await response.json(); } catch { throw new Error('We could not read the complaint service response. Please try again.'); }
      if (!response.ok) throw new Error(data.error || 'Unable to check complaint status.');
      setComplaint(data.complaint);
    } catch (err) {
      setError(err instanceof TypeError ? 'Unable to connect to the complaint service. Check your connection and try again.' : err.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  }

  const statusClass = complaint ? statusStyles[complaint.status] || 'border-[#e4e9df] bg-[#f4f5ef] text-[#5d7264]' : '';

  return <main className="min-h-screen overflow-hidden">
    <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-3 px-5 py-5 sm:px-8 lg:px-12">
      <Link href="/" className="flex items-center gap-3" aria-label="GRAMASEVA home"><Mark/><span><span className="block text-[17px] font-extrabold tracking-[.12em] text-[#244c3b]">GRAMASEVA</span><span className="block text-[10px] tracking-wide text-[#839088]">A better village, together</span></span></Link>
      <nav className="flex w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-[#e4e9df] bg-white/60 p-1.5 text-[11px] font-semibold text-[#607168] backdrop-blur-sm sm:w-auto sm:gap-1 sm:text-[12px]">
        <Link href="/" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">Home</Link>
        <Link href="/report" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">Report an Issue</Link>
        <Link href="/track" aria-current="page" className="rounded-full bg-[#285f43] px-3 py-2 text-white transition sm:px-4">Track Complaint</Link>
        <Link href="/about" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">About</Link>
        <Link href="/admin/login" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">Admin</Link>
      </nav>
    </header>

    <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 md:pt-16 lg:px-12">
      <div className="mx-auto max-w-[760px] text-center">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#dce8da] bg-white/70 px-3 py-2 text-[11px] font-semibold tracking-wide text-[#52745f]"><span className="h-2 w-2 rounded-full bg-[#74a875]"></span>TRACK YOUR COMPLAINT</div>
        <h1 className="serif text-[40px] leading-[1.1] tracking-[-.035em] text-[#1b3c30] sm:text-[54px]">Follow your complaint from <span className="italic text-[#5c9269]">report to resolution.</span></h1>
        <p className="mx-auto mt-5 max-w-[560px] text-[15px] leading-7 text-[#6c7a71] sm:text-[16px]">Enter the Complaint ID you received when you registered your issue to see the latest status and any action taken by the administration.</p>
      </div>

      <div className="mx-auto mt-10 max-w-[760px] rounded-[26px] border border-[#e9eae4] bg-white p-5 shadow-[0_16px_60px_rgba(38,66,49,.06)] sm:p-8">
        {error && <div role="alert" aria-live="polite" className="mb-6 rounded-xl border border-[#f0d1c8] bg-[#fff6f3] px-4 py-3 text-sm leading-5 text-[#a54836]">{error}</div>}
        <form onSubmit={submit} noValidate className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="complaint-id" className="mb-2 block text-[13px] font-semibold text-[#334b41]">Complaint ID</label>
            <input className="field font-mono tracking-wide" id="complaint-id" name="complaintId" value={complaintId} onChange={event => { setComplaintId(event.target.value); if (error) setError(''); }} placeholder="e.g. GS-20260101-120000-ABC123" autoComplete="off" maxLength={100} required/>
          </div>
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#285f43] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1d4d35] disabled:cursor-wait disabled:opacity-65">{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"/>Checking…</> : <>Track Status <span className="text-lg">→</span></>}</button>
        </form>
        <p className="mt-4 text-[11px] text-[#929c94]">This page is read-only. Complaint details cannot be edited here.</p>
      </div>

      {complaint && <div aria-live="polite" className="mx-auto mt-6 max-w-[760px] overflow-hidden rounded-[26px] border border-[#e9eae4] bg-white shadow-[0_16px_60px_rgba(38,66,49,.06)]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#eef0ea] bg-[#f8f9f5] px-5 py-5 sm:px-8">
          <div><p className="text-[10px] font-bold tracking-[.15em] text-[#6e9873]">COMPLAINT FOUND</p><p className="mt-1 font-mono text-sm font-bold tracking-wide text-[#285f43]">{complaint.complaintId}</p></div>
          <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition duration-300 hover:scale-105 ${statusClass}`}><span className="h-1.5 w-1.5 rounded-full bg-current"></span>{complaint.status}</span>
        </div>
        <div className="grid gap-5 px-5 py-6 sm:grid-cols-2 sm:px-8">
          <div><p className="text-[10px] font-bold tracking-[.12em] text-[#8a958d]">CATEGORY</p><p className="mt-1.5 text-sm font-semibold text-[#244436]">{complaint.category || '—'}</p></div>
          <div><p className="text-[10px] font-bold tracking-[.12em] text-[#8a958d]">VILLAGE</p><p className="mt-1.5 text-sm font-semibold text-[#244436]">{complaint.village || '—'}</p></div>
          <div><p className="text-[10px] font-bold tracking-[.12em] text-[#8a958d]">LOCATION</p><p className="mt-1.5 text-sm font-semibold text-[#244436]">{complaint.location ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(complaint.location)}`} target="_blank" rel="noopener noreferrer" className="underline decoration-[#b9d8bd] underline-offset-2 transition hover:text-[#34734e]">{complaint.location}</a> : '—'}</p></div>
          <div><p className="text-[10px] font-bold tracking-[.12em] text-[#8a958d]">COMPLAINT DATE</p><p className="mt-1.5 text-sm font-semibold text-[#244436]">{formatDate(complaint.createdDate)}</p></div>
        </div>
        <div className="border-t border-[#eef0ea] px-5 py-6 sm:px-8">
          <p className="text-[10px] font-bold tracking-[.12em] text-[#8a958d]">ADMIN SOLUTION / ACTION TAKEN</p>
          {complaint.solution ? <p className="mt-2 text-sm leading-6 text-[#4e6155]">{complaint.solution}</p> : <p className="mt-2 text-sm leading-6 text-[#929c94]">No admin solution has been added yet. Please check again later.</p>}
        </div>
      </div>}
    </section>

    <section className="bg-[#244b38] px-5 py-12 text-center text-white sm:px-8"><p className="serif text-2xl italic">“A community grows stronger when every voice counts.”</p><p className="mt-3 text-[11px] tracking-[.12em] text-[#c4d5c6]">GRAMASEVA · TOGETHER FOR OUR VILLAGES</p></section>
    <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-[11px] text-[#8b968e] sm:flex-row sm:px-8 lg:px-12"><Link href="/" className="flex items-center gap-2"><Mark small/><span className="font-bold tracking-[.12em] text-[#45614e]">GRAMASEVA</span></Link><p>Made with care for stronger rural communities.</p><Link href="/report" className="transition hover:text-[#34734e]">Register a complaint ↑</Link></footer>
  </main>;
}

'use client';

import { useState } from 'react';
import Link from 'next/link';

const categories = ['Road', 'Water', 'Electricity', 'Waste Management', 'Drainage', 'Other'];

function Mark({ small = false }) {
  return <span className={`inline-flex items-center justify-center rounded-xl bg-[#e6f0e5] text-[#34734e] ${small ? 'h-9 w-9' : 'h-11 w-11'}`} aria-hidden="true"><svg viewBox="0 0 32 32" className="h-7 w-7" fill="none"><path d="M5 25h22M8 24V13l8-6 8 6v11M12 24v-7h8v7M4 13l12-8 12 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11h.01M20 11h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg></span>;
}

function FieldLabel({ children, required = true, htmlFor }) {
  return <label htmlFor={htmlFor} className="mb-2 block text-[13px] font-semibold text-[#334b41]">{children}{required && <span className="ml-1 text-[#c66e4f]">*</span>}</label>;
}

export default function ReportIssue() {
  const emptyForm = { name: '', phone: '', village: '', category: '', location: '', description: '' };
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function update(e) {
    const { name, value } = e.target;
    setForm(current => ({ ...current, [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value }));
  }

  async function submit(e) {
    e.preventDefault();
    if (loading) return;
    setError(''); setResult(null);
    const cleanedPhone = String(form.phone).replace(/\D/g, '');
    const cleanedForm = { ...form, name: form.name.trim(), phone: cleanedPhone, village: form.village.trim(), category: form.category.trim(), location: form.location.trim(), description: form.description.trim() };
    if (Object.values(cleanedForm).some(value => !value)) { setError('Please fill in all fields.'); return; }
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) { setError('Enter a valid 10-digit Indian mobile number.'); document.getElementById('phone')?.focus(); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/complaints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...cleanedForm, submittedAt: new Date().toISOString() }) });
      if (!response.ok) throw new Error('The service could not receive your complaint. Please try again.');
      let data;
      try { data = await response.json(); } catch { throw new Error('We could not confirm your submission. Please try again.'); }
      if (data.success === false || data.error) throw new Error(data.message || data.error || 'Your complaint could not be submitted.');
      const complaintId = data.complaintId || data.complaintID || data.id || data.data?.complaintId;
      if (!complaintId) throw new Error(data.message || 'The service did not return a Complaint ID. Please try again.');
      setResult(String(complaintId));
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof TypeError ? 'Unable to connect to the complaint service. Check your connection and try again.' : err.message || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  }

  return <main className="min-h-screen overflow-hidden">
    <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-3 px-5 py-5 sm:px-8 lg:px-12">
      <Link href="/" className="flex items-center gap-3" aria-label="GRAMASEVA home"><Mark/><span><span className="block text-[17px] font-extrabold tracking-[.12em] text-[#244c3b]">GRAMASEVA</span><span className="block text-[10px] tracking-wide text-[#839088]">A better village, together</span></span></Link>
      <nav className="flex w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-[#e4e9df] bg-white/60 p-1.5 text-[11px] font-semibold text-[#607168] backdrop-blur-sm sm:w-auto sm:gap-1 sm:text-[12px]">
        <Link href="/" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">Home</Link>
        <Link href="/report" aria-current="page" className="rounded-full bg-[#285f43] px-3 py-2 text-white transition sm:px-4">Report an Issue</Link>
        <Link href="/track" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">Track Complaint</Link>
        <Link href="/about" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">About</Link>
        <Link href="/admin/login" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">Admin</Link>
      </nav>
    </header>

    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20 lg:px-12">
      <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
        <div className="lg:sticky lg:top-10">
          <div className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold tracking-[.15em] text-[#6e9873]"><span className="h-px w-6 bg-[#6e9873]"></span>LET’S GET STARTED</div>
          <h1 className="serif text-[39px] leading-tight tracking-[-.03em] text-[#1b3c30] sm:text-[48px]">Every little change<br/>begins with <span className="italic text-[#5c9269]">a voice.</span></h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[#728077]">Tell us a little about yourself and the issue you’ve noticed. Your information helps us understand what your community needs.</p>
          <div className="mt-9 flex items-center gap-3 rounded-2xl border border-[#e4e9df] bg-white/70 p-4"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eaf1e6] text-[#588361]">♧</span><p className="text-xs leading-5 text-[#6f7d73]">Your details are used to help identify and understand your complaint.</p></div>
        </div>

        <div className="rounded-[26px] border border-[#e9eae4] bg-white p-5 shadow-[0_16px_60px_rgba(38,66,49,.06)] sm:p-8">
          <div className="mb-7 flex items-center justify-between"><div><h2 className="text-lg font-bold text-[#244436]">Complaint details</h2><p className="mt-1 text-xs text-[#8a958d]">Fields marked with <span className="text-[#c66e4f]">*</span> are required</p></div><span className="rounded-full bg-[#f1f5ed] px-3 py-1.5 text-[10px] font-semibold tracking-wide text-[#68836b]">2–3 MIN</span></div>
          {result && <div role="status" className="mb-6 rounded-2xl border border-[#b9d8bd] bg-[#eff8ef] p-4"><div className="flex gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#d9eedb] text-[#367148]">✓</span><div><p className="text-sm font-bold text-[#2d6540]">Your complaint has been submitted</p><p className="mt-1 text-xs text-[#587660]">Keep this reference ID for your records.</p><p className="mt-2 inline-block rounded-lg bg-white px-3 py-1.5 font-mono text-sm font-bold tracking-wide text-[#285f43]">{result}</p></div></div></div>}
          {error && <div role="alert" className="mb-6 rounded-xl border border-[#f0d1c8] bg-[#fff6f3] px-4 py-3 text-sm leading-5 text-[#a54836]">{error}</div>}
          <form onSubmit={submit} noValidate className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2"><div><FieldLabel htmlFor="name">Full name</FieldLabel><input className="field" id="name" name="name" value={form.name} onChange={update} placeholder="e.g. Ananya Sharma" required autoComplete="name" maxLength={100}/></div><div><FieldLabel htmlFor="phone">Mobile number</FieldLabel><div className="phone-field flex overflow-hidden rounded-xl border border-[#dce4dc] focus-within:border-[#3c865d] focus-within:ring-2 focus-within:ring-[#3c865d]/15"><span className="flex items-center border-r border-[#e7ece6] bg-[#fafbf9] px-3 text-sm text-[#829087]">+91</span><input className="min-w-0 flex-1 border-0 px-3 py-3 text-sm outline-none placeholder:text-[#a0aaa2]" id="phone" name="phone" type="tel" value={form.phone} onChange={update} placeholder="10-digit mobile number" required inputMode="numeric" autoComplete="tel-national" maxLength={10} title="Enter a valid 10-digit Indian mobile number"/></div></div></div>
            <div className="grid gap-5 sm:grid-cols-2"><div><FieldLabel htmlFor="village">Village name</FieldLabel><input className="field" id="village" name="village" value={form.village} onChange={update} placeholder="Your village" required maxLength={100}/></div><div><FieldLabel htmlFor="category">Complaint category</FieldLabel><select className="field" id="category" name="category" value={form.category} onChange={update} required><option value="" disabled>Select a category</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div></div>
            <div><FieldLabel htmlFor="location">Exact location</FieldLabel><input className="field" id="location" name="location" value={form.location} onChange={update} placeholder="Landmark, street, or nearby place" required maxLength={200}/><p className="mt-1.5 text-[11px] text-[#929c94]">A nearby landmark helps us locate the issue.</p></div>
            <div><FieldLabel htmlFor="description">Complaint description</FieldLabel><textarea className="field min-h-[125px] resize-y" id="description" name="description" value={form.description} onChange={update} placeholder="Please describe the issue and how it affects your community…" required minLength={10} maxLength={2000}/><div className="mt-1 flex justify-between text-[11px] text-[#929c94]"><span>Please include the details that will help us understand.</span><span>{form.description.length}/2000</span></div></div>
            <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#285f43] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1d4d35] disabled:cursor-wait disabled:opacity-65">{loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"/>Submitting complaint…</> : <>Submit complaint <span className="text-lg">→</span></>}</button>
            <p className="text-center text-[11px] text-[#929c94]">By submitting, you confirm that the information provided is accurate.</p>
          </form>
        </div>
      </div>
    </section>

    <section className="bg-[#244b38] px-5 py-12 text-center text-white sm:px-8"><p className="serif text-2xl italic">“A community grows stronger when every voice counts.”</p><p className="mt-3 text-[11px] tracking-[.12em] text-[#c4d5c6]">GRAMASEVA · TOGETHER FOR OUR VILLAGES</p></section>
    <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-[11px] text-[#8b968e] sm:flex-row sm:px-8 lg:px-12"><Link href="/" className="flex items-center gap-2"><Mark small/><span className="font-bold tracking-[.12em] text-[#45614e]">GRAMASEVA</span></Link><p>Made with care for stronger rural communities.</p><Link href="/report" className="transition hover:text-[#34734e]">Register a complaint ↑</Link></footer>
  </main>;
}

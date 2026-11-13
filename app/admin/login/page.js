'use client';

import { useState } from 'react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to sign in.');
      window.location.assign('/admin');
    } catch (err) { setError(err.message || 'Unable to sign in.'); }
    finally { setLoading(false); }
  }

  return <main className="flex min-h-screen items-center justify-center px-5 py-12">
    <div className="w-full max-w-md rounded-[26px] border border-[#e9eae4] bg-white p-7 shadow-[0_16px_60px_rgba(38,66,49,.08)] sm:p-9">
      <a href="/" className="mb-9 inline-flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e6f0e5] text-[#34734e]">⌂</span><span className="text-[16px] font-extrabold tracking-[.12em] text-[#244c3b]">GRAMASEVA</span></a>
      <p className="mb-2 text-[11px] font-bold tracking-[.15em] text-[#6e9873]">ADMINISTRATION</p><h1 className="serif text-4xl text-[#1b3c30]">Admin login</h1><p className="mt-3 text-sm leading-6 text-[#728077]">Sign in to manage community complaints and responses.</p>
      {error && <div role="alert" className="mt-6 rounded-xl border border-[#f0d1c8] bg-[#fff6f3] px-4 py-3 text-sm text-[#a54836]">{error}</div>}
      <form onSubmit={submit} className="mt-7 space-y-5"><div><label htmlFor="admin-password" className="mb-2 block text-[13px] font-semibold text-[#334b41]">Password</label><input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="field" placeholder="Enter admin password"/></div><button disabled={loading} className="w-full rounded-full bg-[#285f43] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1d4d35] disabled:opacity-60">{loading ? 'Signing in…' : 'Sign in'}</button></form>
      <a href="/" className="mt-6 inline-block text-xs font-medium text-[#68836b] hover:text-[#285f43]">← Back to GRAMASEVA</a>
    </div>
  </main>;
}

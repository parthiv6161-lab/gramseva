'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminHeader from './admin-header';

const categories = ['Road', 'Water', 'Electricity', 'Waste Management', 'Drainage', 'Other'];
const statuses = ['Pending', 'In Progress', 'Resolved'];

function normalized(row) {
  return {
    id: String(row.complaintId ?? ''),
    name: String(row.name ?? ''),
    phone: String(row.phone ?? ''),
    village: String(row.village ?? ''),
    category: String(row.category ?? ''),
    location: String(row.location ?? ''),
    description: String(row.description ?? ''),
    status: String(row.status || 'Pending'),
    date: String(row.createdDate ?? ''),
    solution: String(row.solution ?? ''),
  };
}

function dateLabel(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function StatusBadge({ status }) {
  const style = status === 'Resolved' ? 'bg-[#e8f4e8] text-[#3b7549]' : status === 'In Progress' ? 'bg-[#fff4df] text-[#966c1e]' : 'bg-[#f0f1ed] text-[#68756c]';
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold transition duration-300 hover:scale-105 ${style}`}>{status}</span>;
}

function ComplaintDetails({ complaint, close, saved }) {
  const [status, setStatus] = useState(complaint.status);
  const [solution, setSolution] = useState(complaint.solution);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (saving) return;
    const complaintId = String(complaint.id || '').trim();
    if (!complaintId || !status) {
      setError('Complaint ID and status are required.');
      return;
    }
    setSaving(true); setError('');
    try {
      const response = await fetch('/api/admin/complaints', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ complaintId, status, solution }) });
      let data;
      try { data = await response.json(); } catch { throw new Error('The admin update service returned an unreadable response.'); }
      if (!response.ok) throw new Error(data.error || 'Unable to save changes.');
      if (data.success !== true) throw new Error(data.error || data.message || 'The admin service did not confirm the update.');
      await saved({ ...complaint, status, solution });
    } catch (err) { setError(err.message || 'Unable to save changes.'); }
    finally { setSaving(false); }
  }
  

  const details = [['Complaint ID', complaint.id], ['Name', complaint.name], ['Mobile Number', complaint.phone], ['Village', complaint.village], ['Category', complaint.category], ['Location', complaint.location], ['Date', dateLabel(complaint.date)]];
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#11281f]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="details-title" className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-[26px] bg-[#faf9f6] p-5 shadow-2xl sm:rounded-[26px] sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold tracking-[.15em] text-[#6e9873]">COMPLAINT DETAILS</p><h2 id="details-title" className="serif mt-1 text-3xl text-[#1b3c30]">{complaint.id}</h2></div><button onClick={close} aria-label="Close details" className="grid h-9 w-9 place-items-center rounded-full bg-white text-xl text-[#66776b] hover:bg-[#eaf1e6]">×</button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="rounded-xl border border-[#e7eae3] bg-white p-3.5"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#879189]">{label}</p><p className="mt-1 break-words text-sm font-medium text-[#334b41]">{label === 'Location' && value ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`} target="_blank" rel="noopener noreferrer" className="underline decoration-[#b9d8bd] underline-offset-2 transition hover:text-[#34734e]">{value}</a> : (value || '—')}</p></div>)}</div>
      <div className="mt-4 rounded-xl border border-[#e7eae3] bg-white p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#879189]">Description</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-[#40574a]">{complaint.description || 'No description provided.'}</p></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1.5fr]"><div><label htmlFor="complaint-status" className="mb-2 block text-[13px] font-semibold text-[#334b41]">Complaint status</label>
      <select id="complaint-status" value={status} onChange={event => setStatus(event.target.value)} className="field">{statuses.map(item => <option key={item}>{item}</option>)}</select></div><div><label htmlFor="complaint-solution" className="mb-2 block text-[13px] font-semibold text-[#334b41]">Solution / action taken</label><textarea id="complaint-solution" value={solution} onChange={event => setSolution(event.target.value)} maxLength={4000} rows={4} className="field resize-y" placeholder="Describe the action taken or next steps…"/></div></div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-[#f0d1c8] bg-[#fff6f3] px-4 py-3 text-sm text-[#a54836]">{error}</p>}
      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button
  onClick={save}
  disabled={saving}
  className="rounded-full bg-[#285f43] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1d4d35] disabled:opacity-60"
>
  {saving ? 'Saving…' : 'Save solution and status'}
</button></div>
    </section>
  </div>;
}

function ComplaintMobileList({ items, onSelect }) {
  const fields = [['Name', 'name'], ['Mobile Number', 'phone'], ['Village', 'village'], ['Category', 'category'], ['Location', 'location']];
  return <div className="xl:hidden">
    {items.map(item => <article key={item.id} className="border-t border-[#edf0e9] px-4 py-4 first:border-t-0 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#879189]">Complaint ID</p><p className="mt-1 break-all font-mono text-sm font-semibold text-[#355345]">{item.id || '—'}</p></div>
        <StatusBadge status={item.status}/>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {fields.map(([label, key]) => <div key={key}><dt className="text-[10px] font-semibold uppercase tracking-wide text-[#879189]">{label}</dt><dd className="mt-0.5 break-words text-xs font-medium leading-5 text-[#52665a]">{key === 'location' && item[key] ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item[key])}`} target="_blank" rel="noopener noreferrer" className="underline decoration-[#b9d8bd] underline-offset-2 transition hover:text-[#34734e]">{item[key]}</a> : (item[key] || '—')}</dd></div>)}
      </dl>
      <div className="mt-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#879189]">Description</p><p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-[#52665a]">{item.description || '—'}</p></div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f1f3ee] pt-3">
        <p className="text-[11px] text-[#879189]"><span className="font-semibold text-[#52665a]">Date:</span> {dateLabel(item.date)}</p>
        <button onClick={() => onSelect(item)} className="whitespace-nowrap rounded-full border border-[#dce7db] px-3 py-2 text-[11px] font-semibold text-[#3f7450] hover:bg-[#edf4eb]">View details</button>
      </div>
    </article>)}
  </div>;
}

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All categories');
  const [status, setStatus] = useState('All statuses');
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/complaints', { cache: 'no-store' });
      const data = await response.json();
      if (response.status === 401) { window.location.assign('/admin/login'); return; }
      if (!response.ok) throw new Error(data.error || 'Unable to load complaints.');
      if (data.success !== true || !Array.isArray(data.complaints)) throw new Error('The complaints API returned an unexpected response. Expected success:true and a complaints array.');
      setComplaints(data.complaints.map(normalized));
    } catch (err) { setError(err.message || 'Unable to load complaints.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(timer); }, [notice]);

  const stats = useMemo(() => ({ total: complaints.length, pending: complaints.filter(item => item.status === 'Pending').length, progress: complaints.filter(item => item.status === 'In Progress').length, resolved: complaints.filter(item => item.status === 'Resolved').length }), [complaints]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return complaints.filter(item => (!needle || [item.id, item.name, item.phone].some(value => value.toLowerCase().includes(needle))) && (category === 'All categories' || item.category === category) && (status === 'All statuses' || item.status === status));
  }, [complaints, query, category, status]);

  async function handleSaved(updated) {
    setComplaints(current => current.map(item => item.id === updated.id ? updated : item));
    setSelected(null);
    await refresh();
    setNotice('Solution and complaint status saved.');
  }

  const tiles = [['Total Complaints', stats.total, 'all'], ['Pending Complaints', stats.pending, 'pending'], ['In Progress', stats.progress, 'progress'], ['Resolved Complaints', stats.resolved, 'resolved']];
  return <main className="min-h-screen bg-[#f7f8f4] text-[#17352d]">
    <AdminHeader/>
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold tracking-[.15em] text-[#6e9873]">COMMUNITY OVERVIEW</p><h1 className="serif mt-2 text-4xl text-[#1b3c30]">Complaint dashboard</h1><p className="mt-2 text-sm text-[#78847c]">Review reports and share the actions taken.</p></div><button onClick={refresh} disabled={loading} className="self-start rounded-full border border-[#dce4dc] bg-white px-4 py-2.5 text-xs font-semibold text-[#45614e] transition hover:bg-[#f1f5ed] disabled:opacity-60 sm:self-auto">↻ &nbsp;{loading ? 'Refreshing…' : 'Refresh complaints'}</button></div>
      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">{tiles.map(([label, value, id]) => <div key={id} className="anim-card rounded-2xl border border-[#e7eae3] bg-white p-4 sm:p-5"><p className="text-xs font-medium text-[#7f8b82]">{label}</p><p className="serif mt-2 text-3xl text-[#285f43]">{loading || error ? '—' : value}</p></div>)}</div>
      {notice && <div role="status" className="mt-5 rounded-xl border border-[#b9d8bd] bg-[#eff8ef] px-4 py-3 text-sm text-[#367148]">✓ &nbsp;{notice}</div>}
      <section className="mt-7 overflow-hidden rounded-[22px] border border-[#e7eae3] bg-white"><div className="flex flex-col gap-3 border-b border-[#edf0e9] p-4 sm:flex-row sm:items-center sm:p-5"><div className="flex-1"><h2 className="text-sm font-bold text-[#334b41]">All complaints</h2><p className="mt-1 text-xs text-[#89948a]">{filtered.length} {filtered.length === 1 ? 'record' : 'records'}</p></div><input aria-label="Search by ID, name or phone" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search ID, name or phone" className="field sm:max-w-[230px]"/><select aria-label="Filter by category" value={category} onChange={event => setCategory(event.target.value)} className="field sm:max-w-[190px]"><option>All categories</option>{categories.map(item => <option key={item}>{item}</option>)}</select><select aria-label="Filter by status" value={status} onChange={event => setStatus(event.target.value)} className="field sm:max-w-[170px]"><option>All statuses</option>{statuses.map(item => <option key={item}>{item}</option>)}</select></div>
        {error ? <div className="m-5 rounded-xl border border-[#f0d1c8] bg-[#fff6f3] px-4 py-4 text-sm text-[#a54836]">{error} <button onClick={refresh} className="ml-2 font-bold underline">Try again</button></div> : loading ? <div className="p-12 text-center text-sm text-[#879189]">Loading complaints…</div> : filtered.length === 0 ? <div className="p-12 text-center"><p className="text-sm font-semibold text-[#52665a]">{complaints.length ? 'No complaints match these filters.' : 'No complaints found yet.'}</p><p className="mt-1 text-xs text-[#89948a]">{complaints.length ? 'Adjust your search or filters.' : 'New user submissions will appear here.'}</p></div> : <>
          <div className="hidden overflow-hidden xl:block"><table className="w-full table-fixed border-collapse text-left"><colgroup><col style={{width:'10%'}}/><col style={{width:'9%'}}/><col style={{width:'10%'}}/><col style={{width:'9%'}}/><col style={{width:'9%'}}/><col style={{width:'12%'}}/><col style={{width:'17%'}}/><col style={{width:'8%'}}/><col style={{width:'8%'}}/><col style={{width:'8%'}}/></colgroup><thead><tr className="bg-[#f8f9f6] text-[10px] uppercase tracking-wide text-[#879189]">{['Complaint ID','Name','Mobile Number','Village','Category','Location','Description','Status','Date',''].map(title=><th key={title} className="break-words px-2 py-3 font-bold">{title}</th>)}</tr></thead><tbody>{filtered.map(item=><tr key={item.id} className="border-t border-[#edf0e9] text-xs text-[#52665a] hover:bg-[#fbfcfa]"><td className="break-all px-2 py-3.5 font-mono font-semibold text-[#355345]">{item.id || '�'}</td><td className="break-words px-2 py-3.5 font-semibold text-[#334b41]">{item.name || '�'}</td><td className="break-all px-2 py-3.5">{item.phone || '�'}</td><td className="break-words px-2 py-3.5">{item.village || '�'}</td><td className="break-words px-2 py-3.5">{item.category || '�'}</td><td className="break-words px-2 py-3.5">{item.location ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`} target="_blank" rel="noopener noreferrer" className="underline decoration-[#b9d8bd] underline-offset-2 transition hover:text-[#34734e]">{item.location}</a> : '—'}</td><td className="whitespace-pre-wrap break-words px-2 py-3.5">{item.description || '�'}</td><td className="break-words px-2 py-3.5"><StatusBadge status={item.status}/></td><td className="break-words px-2 py-3.5">{dateLabel(item.date)}</td><td className="px-2 py-3.5"><button onClick={()=>setSelected(item)} className="whitespace-normal break-words rounded-full border border-[#dce7db] px-2 py-2 text-[11px] font-semibold text-[#3f7450] hover:bg-[#edf4eb]">View details</button></td></tr>)}</tbody></table></div>
          <div className="xl:hidden"><ComplaintMobileList items={filtered} onSelect={setSelected}/></div>
        </>}
      </section>
    </div>
    {selected && <ComplaintDetails key={selected.id} complaint={selected} close={() => setSelected(null)} saved={handleSaved}/>}
  </main>;
}

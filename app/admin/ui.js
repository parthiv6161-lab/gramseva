'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminHeader from './admin-header';
import { useLanguage } from '../language-provider';

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
    latitude: String(row.latitude ?? ''),
    longitude: String(row.longitude ?? ''),
    photoUrl: String(row.photoUrl ?? ''),
  };
}

function dateLabel(value, locale) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

function safePhotoUrl(value) {
  return String(value || '').trim();
}

function StatusBadge({ status }) {
  const { tStatus } = useLanguage();
  const style = status === 'Resolved' ? 'bg-[#e8f4e8] text-[#3b7549]' : status === 'In Progress' ? 'bg-[#fff4df] text-[#966c1e]' : 'bg-[#f0f1ed] text-[#68756c]';
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold transition duration-300 hover:scale-105 ${style}`}>{tStatus(status)}</span>;
}

function ComplaintDetails({ complaint, close, saved }) {
  const { t, tCategory, tStatus, tError, dateLocale } = useLanguage();
  const [status, setStatus] = useState(complaint.status);
  const [solution, setSolution] = useState(complaint.solution);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const hasPhoto = Boolean(safePhotoUrl(complaint.photoUrl));
  const photoSrc = hasPhoto ? `/api/admin/complaints/photo?complaintId=${encodeURIComponent(complaint.id)}` : '';

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKeyDown = event => { if (event.key === 'Escape') setLightboxOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxOpen]);

  async function save() {
    if (saving) return;
    const complaintId = String(complaint.id || '').trim();
    if (!complaintId || !status) {
      setError('admin.saveRequired');
      return;
    }
    setSaving(true); setError('');
    try {
      const response = await fetch('/api/admin/complaints', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ complaintId, status, solution }) });
      let data;
      try { data = await response.json(); } catch { throw new Error('errors.unreadableResponse'); }
      if (!response.ok) throw new Error(data.error || 'errors.unableSave');
      if (data.success !== true) throw new Error(data.error || data.message || 'errors.updateNotConfirmed');
      await saved({ ...complaint, status, solution });
    } catch (err) { console.error('[GRAMASEVA] Admin update failed:', err); setError(err.message || 'errors.unableSave'); }
    finally { setSaving(false); }
  }
  

  const details = [[t('common.complaintId'), complaint.id], [t('common.name'), complaint.name], [t('common.mobileNumber'), complaint.phone], [t('common.village'), complaint.village], [t('common.category'), tCategory(complaint.category)], [t('common.location'), complaint.location], [t('common.date'), dateLabel(complaint.date, dateLocale)]];
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#11281f]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="details-title" className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-[26px] bg-[#faf9f6] p-5 shadow-2xl sm:rounded-[26px] sm:p-8">
      <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold tracking-[.15em] text-[#6e9873]">{t('admin.detailsEyebrow')}</p><h2 id="details-title" className="serif mt-1 text-3xl text-[#1b3c30]">{complaint.id}</h2></div><button onClick={close} aria-label={t('admin.detailsClose')} className="grid h-9 w-9 place-items-center rounded-full bg-white text-xl text-[#66776b] hover:bg-[#eaf1e6]">×</button></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">{details.map(([label, value], index) => <div key={`${label}-${index}`} className="rounded-xl border border-[#e7eae3] bg-white p-3.5"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#879189]">{label}</p><p className="mt-1 break-words text-sm font-medium text-[#334b41]">{label === t('common.location') && value ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`} target="_blank" rel="noopener noreferrer" className="underline decoration-[#b9d8bd] underline-offset-2 transition hover:text-[#34734e]">{value}</a> : (value || '—')}</p></div>)}</div>
      <div className="mt-4 rounded-xl border border-[#e7eae3] bg-white p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#879189]">{t('common.description')}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-[#40574a]">{complaint.description || t('admin.noDescription')}</p></div>
      <div className="mt-4 rounded-xl border border-[#e7eae3] bg-white p-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#879189]">{t('common.complaintPhoto')}</p>{hasPhoto && !photoFailed ? <><button type="button" onClick={() => setLightboxOpen(true)} aria-label={t('admin.viewPhoto')} className="mt-2 block w-full overflow-hidden rounded-xl border border-[#e7eae3] bg-[#f7f8f4] p-2"><img src={photoSrc} alt={t('admin.photoAlt')} onError={() => { console.error('[GRAMASEVA] Complaint photo preview failed', complaint.id); setPhotoFailed(true); }} className="mx-auto max-h-64 w-full object-contain"/></button><p className="mt-1.5 text-[11px] text-[#929c94]">{t('admin.photoHint')}</p></> : <p className="mt-2 text-sm text-[#879189]">{hasPhoto ? t('admin.photoUnavailable') : t('admin.noPhoto')}</p>}</div>
      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1.5fr]"><div><label htmlFor="complaint-status" className="mb-2 block text-[13px] font-semibold text-[#334b41]">{t('admin.statusLabel')}</label>
      <select id="complaint-status" value={status} onChange={event => setStatus(event.target.value)} className="field">{statuses.map(item => <option key={item} value={item}>{tStatus(item)}</option>)}</select></div><div><label htmlFor="complaint-solution" className="mb-2 block text-[13px] font-semibold text-[#334b41]">{t('admin.solutionLabel')}</label><textarea id="complaint-solution" value={solution} onChange={event => setSolution(event.target.value)} maxLength={4000} rows={4} className="field resize-y" placeholder={t('admin.solutionPlaceholder')}/></div></div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-[#f0d1c8] bg-[#fff6f3] px-4 py-3 text-sm text-[#a54836]">{tError(error)}</p>}
      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button
  onClick={save}
  disabled={saving}
  className="rounded-full bg-[#285f43] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1d4d35] disabled:opacity-60"
>
  {saving ? t('admin.saving') : t('admin.save')}
</button></div>
    </section>
    {lightboxOpen && <div role="dialog" aria-modal="true" aria-label={t('admin.enlargePhoto')} className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0d1f17]/85 p-4" onMouseDown={event => { if (event.target === event.currentTarget) setLightboxOpen(false); }}><button type="button" onClick={() => setLightboxOpen(false)} aria-label={t('admin.closePhoto')} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl text-[#334b41] hover:bg-white">×</button><img src={photoSrc} alt={t('admin.enlargedAlt')} onError={() => { console.error('[GRAMASEVA] Enlarged complaint photo failed', complaint.id); setPhotoFailed(true); setLightboxOpen(false); }} className="max-h-[90vh] max-w-full rounded-xl object-contain"/></div>}
  </div>;
}

function ComplaintMobileList({ items, onSelect }) {
  const { t, tCategory, dateLocale } = useLanguage();
  const fields = [[t('common.name'), 'name'], [t('common.mobileNumber'), 'phone'], [t('common.village'), 'village'], [t('common.category'), 'category'], [t('common.location'), 'location']];
  return <div className="xl:hidden">
    {items.map(item => <article key={item.id} className="border-t border-[#edf0e9] px-4 py-4 first:border-t-0 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#879189]">{t('common.complaintId')}</p><p className="mt-1 break-all font-mono text-sm font-semibold text-[#355345]">{item.id || '—'}</p></div>
        <StatusBadge status={item.status}/>
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {fields.map(([label, key]) => <div key={key}><dt className="text-[10px] font-semibold uppercase tracking-wide text-[#879189]">{label}</dt><dd className="mt-0.5 break-words text-xs font-medium leading-5 text-[#52665a]">{key === 'location' && item[key] ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item[key])}`} target="_blank" rel="noopener noreferrer" className="underline decoration-[#b9d8bd] underline-offset-2 transition hover:text-[#34734e]">{item[key]}</a> : (key === 'category' ? tCategory(item[key]) : (item[key] || '—'))}</dd></div>)}
      </dl>
      <div className="mt-4"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#879189]">{t('common.description')}</p><p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-[#52665a]">{item.description || '—'}</p></div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f1f3ee] pt-3">
        <p className="text-[11px] text-[#879189]"><span className="font-semibold text-[#52665a]">{t('admin.datePrefix')}</span> {dateLabel(item.date, dateLocale)}</p>
        <button onClick={() => onSelect(item)} className="whitespace-nowrap rounded-full border border-[#dce7db] px-3 py-2 text-[11px] font-semibold text-[#3f7450] hover:bg-[#edf4eb]">{t('common.viewDetails')}</button>
      </div>
    </article>)}
  </div>;
}

export default function AdminDashboard() {
  const { t, tCategory, tStatus, tError, dateLocale } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/complaints', { cache: 'no-store' });
      const data = await response.json();
      if (response.status === 401) { window.location.assign('/admin/login'); return; }
      if (!response.ok) throw new Error(data.error || 'errors.unableLoadComplaints');
      if (data.success !== true || !Array.isArray(data.complaints)) throw new Error('errors.unexpectedResponse');
      setComplaints(data.complaints.map(normalized));
    } catch (err) { console.error('[GRAMASEVA] Admin dashboard load failed:', err); setError(err.message || 'errors.unableLoadComplaints'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 3500); return () => clearTimeout(timer); }, [notice]);

  const stats = useMemo(() => ({ total: complaints.length, pending: complaints.filter(item => item.status === 'Pending').length, progress: complaints.filter(item => item.status === 'In Progress').length, resolved: complaints.filter(item => item.status === 'Resolved').length }), [complaints]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return complaints.filter(item => (!needle || [item.id, item.name, item.phone].some(value => value.toLowerCase().includes(needle))) && (!category || item.category === category) && (!status || item.status === status));
  }, [complaints, query, category, status]);

  async function handleSaved(updated) {
    setComplaints(current => current.map(item => item.id === updated.id ? updated : item));
    setSelected(null);
    await refresh();
    setNotice('admin.savedNotice');
  }

  const tiles = [[t('admin.total'), stats.total, 'all'], [t('admin.pending'), stats.pending, 'pending'], [t('admin.inProgress'), stats.progress, 'progress'], [t('admin.resolved'), stats.resolved, 'resolved']];
  const tableHeaders = ['admin.tableId', 'admin.tableName', 'admin.tablePhone', 'admin.tableVillage', 'admin.tableCategory', 'admin.tableLocation', 'admin.tableDescription', 'admin.tableStatus', 'admin.tableDate'];
  return <main className="min-h-screen bg-[#f7f8f4] text-[#17352d]">
    <AdminHeader/>
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold tracking-[.15em] text-[#6e9873]">{t('admin.dashboardEyebrow')}</p><h1 className="serif mt-2 text-4xl text-[#1b3c30]">{t('admin.dashboardTitle')}</h1><p className="mt-2 text-sm text-[#78847c]">{t('admin.dashboardSubtitle')}</p></div><button onClick={refresh} disabled={loading} className="self-start rounded-full border border-[#dce4dc] bg-white px-4 py-2.5 text-xs font-semibold text-[#45614e] transition hover:bg-[#f1f5ed] disabled:opacity-60 sm:self-auto">↻ &nbsp;{loading ? t('admin.refreshing') : t('admin.refresh')}</button></div>
      <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">{tiles.map(([label, value, id]) => <div key={id} className="anim-card rounded-2xl border border-[#e7eae3] bg-white p-4 sm:p-5"><p className="text-xs font-medium text-[#7f8b82]">{label}</p><p className="serif mt-2 text-3xl text-[#285f43]">{loading || error ? '—' : value}</p></div>)}</div>
      {notice && <div role="status" className="mt-5 rounded-xl border border-[#b9d8bd] bg-[#eff8ef] px-4 py-3 text-sm text-[#367148]">✓ &nbsp;{t(notice)}</div>}
      <section className="mt-7 overflow-hidden rounded-[22px] border border-[#e7eae3] bg-white"><div className="flex flex-col gap-3 border-b border-[#edf0e9] p-4 sm:flex-row sm:items-center sm:p-5"><div className="flex-1"><h2 className="text-sm font-bold text-[#334b41]">{t('admin.allComplaints')}</h2><p className="mt-1 text-xs text-[#89948a]">{filtered.length} {filtered.length === 1 ? t('admin.record') : t('admin.records')}</p></div><input aria-label={t('admin.searchAria')} value={query} onChange={event => setQuery(event.target.value)} placeholder={t('admin.searchPlaceholder')} className="field sm:max-w-[230px]"/><select aria-label={t('admin.filterCategoryAria')} value={category} onChange={event => setCategory(event.target.value)} className="field sm:max-w-[190px]"><option value="">{t('admin.allCategories')}</option>{categories.map(item => <option key={item} value={item}>{tCategory(item)}</option>)}</select><select aria-label={t('admin.filterStatusAria')} value={status} onChange={event => setStatus(event.target.value)} className="field sm:max-w-[170px]"><option value="">{t('admin.allStatuses')}</option>{statuses.map(item => <option key={item} value={item}>{tStatus(item)}</option>)}</select></div>
        {error ? <div className="m-5 rounded-xl border border-[#f0d1c8] bg-[#fff6f3] px-4 py-4 text-sm text-[#a54836]">{tError(error)} <button onClick={refresh} className="ml-2 font-bold underline">{t('common.tryAgain')}</button></div> : loading ? <div className="p-12 text-center text-sm text-[#879189]">{t('admin.loading')}</div> : filtered.length === 0 ? <div className="p-12 text-center"><p className="text-sm font-semibold text-[#52665a]">{complaints.length ? t('admin.emptyFiltered') : t('admin.empty')}</p><p className="mt-1 text-xs text-[#89948a]">{complaints.length ? t('admin.emptyFilteredHint') : t('admin.emptyHint')}</p></div> : <>
          <div className="hidden overflow-hidden xl:block"><table className="w-full table-fixed border-collapse text-left"><colgroup><col style={{width:'10%'}}/><col style={{width:'9%'}}/><col style={{width:'10%'}}/><col style={{width:'9%'}}/><col style={{width:'9%'}}/><col style={{width:'12%'}}/><col style={{width:'17%'}}/><col style={{width:'8%'}}/><col style={{width:'8%'}}/><col style={{width:'8%'}}/></colgroup><thead><tr className="bg-[#f8f9f6] text-[10px] uppercase tracking-wide text-[#879189]">{tableHeaders.map(key => <th key={key} className="break-words px-2 py-3 font-bold">{t(key)}</th>)}</tr></thead><tbody>{filtered.map(item=><tr key={item.id} className="border-t border-[#edf0e9] text-xs text-[#52665a] hover:bg-[#fbfcfa]"><td className="break-all px-2 py-3.5 font-mono font-semibold text-[#355345]">{item.id || '—'}</td><td className="break-words px-2 py-3.5 font-semibold text-[#334b41]">{item.name || '—'}</td><td className="break-all px-2 py-3.5">{item.phone || '—'}</td><td className="break-words px-2 py-3.5">{item.village || '—'}</td><td className="break-words px-2 py-3.5">{tCategory(item.category)}</td><td className="break-words px-2 py-3.5">{item.location ? <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`} target="_blank" rel="noopener noreferrer" className="underline decoration-[#b9d8bd] underline-offset-2 transition hover:text-[#34734e]">{item.location}</a> : '—'}</td><td className="whitespace-pre-wrap break-words px-2 py-3.5">{item.description || '—'}</td><td className="break-words px-2 py-3.5"><StatusBadge status={item.status}/></td><td className="break-words px-2 py-3.5">{dateLabel(item.date, dateLocale)}</td><td className="px-2 py-3.5"><button onClick={()=>setSelected(item)} className="whitespace-normal break-words rounded-full border border-[#dce7db] px-2 py-2 text-[11px] font-semibold text-[#3f7450] hover:bg-[#edf4eb]">{t('common.viewDetails')}</button></td></tr>)}</tbody></table></div>
          <div className="xl:hidden"><ComplaintMobileList items={filtered} onSelect={setSelected}/></div>
        </>}
      </section>
    </div>
    {selected && <ComplaintDetails key={selected.id} complaint={selected} close={() => setSelected(null)} saved={handleSaved}/>}
  </main>;
}

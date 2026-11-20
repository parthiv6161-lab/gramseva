'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AdminHeader from '../admin-header';
import { useLanguage } from '../../language-provider';

const STATUS_ORDER = ['Pending', 'In Progress', 'Resolved'];
const STATUS_META = {
  Pending: { color: '#b7791f', soft: '#fff4df' },
  'In Progress': { color: '#356a9a', soft: '#e8f1fb' },
  Resolved: { color: '#3b7549', soft: '#e8f4e8' },
};
const FALLBACK_STATUS = { color: '#68756c', soft: '#f0f1ed' };
const WARD_KEYS = ['ward', 'Ward', 'wardName', 'Ward Name', 'wardNo', 'Ward No', 'wardNo.', 'Ward No.', 'wardNumber', 'Ward Number', 'ward_name'];
const numberFormatter = new Intl.NumberFormat('en-IN');

function pick(row, keys) {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value).trim();
  }
  return '';
}

function normalize(row) {
  const status = pick(row, ['status', 'Status', 'complaintStatus', 'Complaint Status']);
  return {
    category: pick(row, ['category', 'Category', 'complaintCategory', 'Complaint Category']) || 'Not specified',
    village: pick(row, ['village', 'Village', 'villageName', 'Village Name']) || 'Not specified',
    ward: pick(row, WARD_KEYS),
    location: pick(row, ['location', 'Location', 'place', 'Place']) || 'Not specified',
    status: status || 'Pending',
  };
}

function formatCount(value) {
  return numberFormatter.format(value || 0);
}

function formatPercent(value) {
  if (!value) return '0%';
  return `${value.toFixed(1).replace(/\.0$/, '')}%`;
}

function tally(records, key, total) {
  const counts = new Map();
  records.forEach(record => {
    const label = record[key] || 'Not specified';
    counts.set(label, (counts.get(label) || 0) + 1);
  });
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count, percentage: total ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function InsightCard({ label, value, detail }) {
  return <div className="anim-card min-h-[120px] rounded-2xl border border-[#e7eae3] bg-white p-4 sm:p-5">
    <p className="text-xs font-medium text-[#7f8b82]">{label}</p>
    <p className="serif mt-2 break-words text-[23px] leading-tight text-[#285f43]" title={typeof value === 'string' ? value : undefined}>{value}</p>
    <p className="mt-1.5 text-[11px] leading-5 text-[#8a958d]">{detail}</p>
  </div>;
}

function EmptyChart({ title, message }) {
  return <div className="mt-5 grid place-items-center rounded-xl border border-dashed border-[#dce4dc] bg-[#fbfcfa] px-5 py-10 text-center">
    <p className="text-sm font-semibold text-[#52665a]">{title}</p>
    <p className="mt-1 max-w-sm text-xs leading-5 text-[#89948a]">{message}</p>
  </div>;
}

function BarChart({ title, description, items, emptyTitle, emptyMessage, groupLabel }) {
  const { t } = useLanguage();
  const topCount = items[0]?.count || 0;
  return <div className="anim-card rounded-[22px] border border-[#e7eae3] bg-white p-5 sm:p-6">
    <div className="flex items-start justify-between gap-4">
      <div><h2 className="text-sm font-bold text-[#334b41]">{title}</h2><p className="mt-1 text-xs text-[#89948a]">{description}</p></div>
      <span className="shrink-0 rounded-full bg-[#f1f5ed] px-3 py-1.5 text-[10px] font-bold tracking-wide text-[#68836b]">{formatCount(items.length)} {groupLabel}</span>
    </div>
    {items.length === 0 ? <EmptyChart title={emptyTitle} message={emptyMessage}/> : <div className="mt-5 max-h-[420px] space-y-4 overflow-y-auto pr-1">
      {items.map((item, index) => {
        const highest = item.count === topCount && topCount > 0;
        return <div key={item.label}>
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex min-w-0 items-center gap-2">
              <span className={`truncate font-semibold ${highest ? 'text-[#285f43]' : 'text-[#455b4e]'}`} title={item.label}>{item.label}</span>
              {highest && <span className="shrink-0 rounded-full bg-[#e8f4e8] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#3b7549]">{t('common.highest')}</span>}
            </div>
            <span className="shrink-0 tabular-nums text-[#7b887f]"><b className="text-[#285f43]">{formatCount(item.count)}</b> · {formatPercent(item.percentage)}</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[#eef1ea]">
            <div className="chart-bar-fill h-full rounded-full" style={{ width: `${Math.max(item.percentage, 1.5)}%`, backgroundColor: highest ? '#285f43' : '#86b18d', animationDelay: `${index * 65}ms` }}/>
          </div>
        </div>;
      })}
    </div>}
  </div>;
}

function StatusChart({ total, segments }) {
  const { t, tStatus } = useLanguage();
  let running = 0;
  const rings = segments.filter(segment => segment.count > 0).map(segment => {
    const start = running;
    running += segment.percentage;
    return { ...segment, start };
  });

  return <div className="anim-card rounded-[22px] border border-[#e7eae3] bg-white p-5 sm:p-6">
    <div><h2 className="text-sm font-bold text-[#334b41]">{t('analytics.statusTitle')}</h2><p className="mt-1 text-xs text-[#89948a]">{t('analytics.statusDesc')}</p></div>
    {total === 0 ? <EmptyChart title={t('analytics.statusEmptyTitle')} message={t('analytics.statusEmpty')}/> : <div className="mt-5 grid items-center gap-7 sm:grid-cols-[180px_1fr]">
      <div className="relative mx-auto h-44 w-44">
        <svg viewBox="0 0 160 160" role="img" aria-label={t('analytics.statusAria', { count: total })} className="h-full w-full -rotate-90">
          <circle cx="80" cy="80" r="58" fill="none" stroke="#eef1ea" strokeWidth="18"/>
          {rings.map((segment, index) => <circle
            key={segment.label}
            cx="80"
            cy="80"
            r="58"
            fill="none"
            stroke={segment.color}
            strokeWidth="18"
            pathLength="100"
            strokeDasharray={`${segment.percentage} ${100 - segment.percentage}`}
            strokeDashoffset={-segment.start}
            className="donut-segment"
            style={{ animationDelay: `${index * 120}ms` }}
          />)}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="serif text-4xl text-[#285f43]">{formatCount(total)}</span>
          <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[.16em] text-[#8a958d]">{t('analytics.complaints')}</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {segments.map(segment => <div key={segment.label} className="flex items-center justify-between gap-3 rounded-xl border border-[#eef0ea] bg-[#fafbf8] px-3.5 py-2.5">
          <span className="inline-flex min-w-0 items-center gap-2 text-xs font-semibold text-[#455b4e]"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: segment.color }}/><span className="truncate">{tStatus(segment.label)}</span></span>
          <span className="shrink-0 text-xs tabular-nums text-[#7b887f]"><b className="text-[#285f43]">{formatCount(segment.count)}</b> · {formatPercent(segment.percentage)}</span>
        </div>)}
      </div>
    </div>}
  </div>;
}

export default function AnalyticsDashboard() {
  const { t, tCategory, tError, dateLocale } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const inFlight = useRef(false);

  const load = useCallback(async (quiet = false) => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/complaints', { cache: 'no-store' });
      let data;
      try { data = await response.json(); } catch { throw new Error('errors.unreadableResponse'); }
      if (response.status === 401) { window.location.assign('/admin/login'); return; }
      if (!response.ok) throw new Error(data.error || 'errors.unableLoadAnalytics');
      if (data.success !== true || !Array.isArray(data.complaints)) throw new Error('errors.unexpectedResponse');
      setComplaints(data.complaints);
      setUpdatedAt(new Date());
      setHasLoaded(true);
    } catch (err) {
      setError(err.message || 'errors.unableLoadAnalytics');
    } finally {
      inFlight.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    function refreshWhenVisible() {
      if (document.visibilityState === 'visible') load(true);
    }
    const interval = window.setInterval(refreshWhenVisible, 30000);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [load]);

  const analysis = useMemo(() => {
    const records = complaints.map(normalize);
    const total = records.length;
    const categories = tally(records, 'category', total);
    const villages = tally(records, 'village', total);
    const hasWard = records.some(record => record.ward);
    const wards = hasWard ? tally(records, 'ward', total) : [];
    const locations = tally(records, 'location', total);

    const statusCounts = new Map();
    records.forEach(record => statusCounts.set(record.status, (statusCounts.get(record.status) || 0) + 1));
    const extraStatuses = [...statusCounts.keys()].filter(status => !STATUS_ORDER.includes(status)).sort((a, b) => (statusCounts.get(b) || 0) - (statusCounts.get(a) || 0));
    const statusSegments = [...STATUS_ORDER, ...extraStatuses].map(label => {
      const count = statusCounts.get(label) || 0;
      const meta = STATUS_META[label] || FALLBACK_STATUS;
      return { label, count, percentage: total ? (count / total) * 100 : 0, ...meta };
    });

    const resolved = statusCounts.get('Resolved') || 0;
    const unresolved = Math.max(total - resolved, 0);

    return {
      total,
      categories,
      villages,
      wards,
      hasWard,
      locations,
      statusSegments,
      resolved,
      unresolved,
      resolutionRate: total ? (resolved / total) * 100 : 0,
      topCategory: categories[0] || null,
      topVillage: villages[0] || null,
      topWard: wards[0] || null,
      topLocation: locations[0] || null,
    };
  }, [complaints]);

  const topVillageOrWard = analysis.hasWard ? analysis.topWard : analysis.topVillage;
  const topVillageOrWardLabel = analysis.hasWard ? t('analytics.topWard') : t('analytics.topVillage');
  const updatedLabel = updatedAt ? updatedAt.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' }) : '';
  const displayCategories = analysis.categories.map(item => ({ ...item, label: tCategory(item.label) }));

  return <main className="min-h-screen bg-[#f7f8f4] text-[#17352d]">
    <AdminHeader/>
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold tracking-[.15em] text-[#6e9873]">{t('analytics.eyebrow')}</p>
          <h1 className="serif mt-2 text-4xl text-[#1b3c30]">{t('analytics.title')}</h1>
          <p className="mt-2 text-sm text-[#78847c]">{t('analytics.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {updatedLabel && <span className="text-[11px] text-[#8a958d]">{t('analytics.updated', { time: updatedLabel })}</span>}
          <button onClick={() => load(true)} disabled={loading || refreshing} className="self-start rounded-full border border-[#dce4dc] bg-white px-4 py-2.5 text-xs font-semibold text-[#45614e] transition hover:bg-[#f1f5ed] disabled:opacity-60 sm:self-auto">↻ &nbsp;{refreshing || loading ? t('analytics.refreshing') : t('analytics.refresh')}</button>
        </div>
      </div>

      {error && <div role="alert" className="mt-5 rounded-xl border border-[#f0d1c8] bg-[#fff6f3] px-4 py-3 text-sm text-[#a54836]">{tError(error)} <button onClick={() => load()} className="ml-2 font-bold underline">{t('common.tryAgain')}</button></div>}

      {loading && !hasLoaded ? <div role="status" className="mt-7 rounded-2xl border border-[#e7eae3] bg-white p-12 text-center text-sm text-[#879189]">{t('analytics.loading')}</div> : hasLoaded ? <>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <InsightCard label={t('analytics.totalLabel')} value={formatCount(analysis.total)} detail={t('analytics.totalDetail', { categories: formatCount(analysis.categories.length), locations: formatCount(analysis.locations.length) })} />
          <InsightCard label={t('analytics.topCategory')} value={analysis.topCategory ? tCategory(analysis.topCategory.label) : t('analytics.noData')} detail={analysis.topCategory ? `${formatCount(analysis.topCategory.count)} ${t('analytics.complaints')} · ${formatPercent(analysis.topCategory.percentage)}` : t('analytics.noComplaintsYet')} />
          <InsightCard label={topVillageOrWardLabel} value={topVillageOrWard?.label || t('analytics.noData')} detail={topVillageOrWard ? `${formatCount(topVillageOrWard.count)} ${t('analytics.complaints')} · ${formatPercent(topVillageOrWard.percentage)}` : t('analytics.noComplaintsYet')} />
          <InsightCard label={t('analytics.topLocation')} value={analysis.topLocation?.label || t('analytics.noData')} detail={analysis.topLocation ? `${formatCount(analysis.topLocation.count)} ${t('analytics.complaints')} · ${formatPercent(analysis.topLocation.percentage)}` : t('analytics.noComplaintsYet')} />
          <InsightCard label={t('analytics.resolvedUnresolved')} value={t('analytics.resolvedValue', { count: formatCount(analysis.resolved) })} detail={t('analytics.unresolvedDetail', { count: formatCount(analysis.unresolved), rate: formatPercent(analysis.resolutionRate) })} />
        </div>

        {analysis.total === 0 && <div className="mt-5 rounded-xl border border-[#dce8da] bg-[#f7fbf5] px-4 py-3 text-sm text-[#52745f]">{t('analytics.emptyBanner')}</div>}

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
          <BarChart title={t('analytics.categoriesTitle')} description={t('analytics.categoriesDesc')} items={displayCategories} groupLabel={t('analytics.categoriesGroup')} emptyTitle={t('analytics.categoriesEmptyTitle')} emptyMessage={t('analytics.categoriesEmpty')}/>
          <StatusChart total={analysis.total} segments={analysis.statusSegments}/>
        </div>

        <div className={`mt-5 grid gap-5 ${analysis.hasWard ? 'lg:grid-cols-2' : ''}`}>
          <BarChart title={t('analytics.villagesTitle')} description={t('analytics.villagesDesc')} items={analysis.villages} groupLabel={t('analytics.villagesGroup')} emptyTitle={t('analytics.villagesEmptyTitle')} emptyMessage={t('analytics.villagesEmpty')}/>
          {analysis.hasWard && <BarChart title={t('analytics.wardsTitle')} description={t('analytics.wardsDesc')} items={analysis.wards} groupLabel={t('analytics.wardsGroup')} emptyTitle={t('analytics.wardsEmptyTitle')} emptyMessage={t('analytics.wardsEmpty')}/>}
        </div>

        <div className="mt-5">
          <BarChart title={t('analytics.locationsTitle')} description={t('analytics.locationsDesc')} items={analysis.locations} groupLabel={t('analytics.locationsGroup')} emptyTitle={t('analytics.locationsEmptyTitle')} emptyMessage={t('analytics.locationsEmpty')}/>
        </div>
      </> : null}
    </div>
  </main>;
}

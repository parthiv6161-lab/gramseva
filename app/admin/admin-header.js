'use client';

import { usePathname } from 'next/navigation';
import LanguageToggle from '../language-toggle';
import { useLanguage } from '../language-provider';

function DashboardIcon() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>;
}

function AnalyticsIcon() {
  return <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true"><path d="M4 20V11M10 20V5M16 20v-6M22 20H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

export default function AdminHeader() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const items = [
    { href: '/admin', label: t('nav.dashboard'), Icon: DashboardIcon },
    { href: '/admin/analytics', label: t('nav.analytics'), Icon: AnalyticsIcon },
  ];

  async function logout() {
    try { await fetch('/api/admin/logout', { method: 'POST', cache: 'no-store' }); }
    finally { window.location.assign('/'); }
  }

  return <header className="border-b border-[#e8ebe4] bg-white">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
      <div className="flex items-center gap-3">
        <button onClick={logout} aria-label={t('admin.logoutAria')} className="inline-flex items-center gap-2 rounded-full border border-[#dce4dc] bg-white px-4 py-2.5 text-xs font-semibold text-[#45614e] transition hover:bg-[#f2f5ef]"><span aria-hidden="true">←</span> {t('admin.logout')}</button>
        <a href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e6f0e5] text-[#34734e]">⌂</span><span><b className="block text-[15px] tracking-[.12em] text-[#244c3b]">GRAMASEVA</b><span className="text-[10px] text-[#839088]">{t('admin.administration')}</span></span></a>
      </div>
      <nav aria-label={t('nav.adminArea')} className="flex w-full items-center gap-1.5 rounded-full border border-[#e4e9df] bg-[#f8f9f5] p-1.5 text-[11px] font-semibold text-[#607168] sm:w-auto sm:text-xs">
        {items.map(({ href, label, Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
          return <a key={href} href={href} aria-current={active ? 'page' : undefined} className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 transition ${active ? 'bg-[#285f43] text-white shadow-sm' : 'hover:bg-white hover:text-[#285f43]'}`}><Icon/><span>{label}</span></a>;
        })}
        <LanguageToggle compact/>
      </nav>
    </div>
  </header>;
}

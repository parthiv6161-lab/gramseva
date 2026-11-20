'use client';

import Link from 'next/link';
import LanguageToggle from '../language-toggle';
import { useLanguage } from '../language-provider';

function Mark({ small = false }) {
  return <span className={`inline-flex items-center justify-center rounded-xl bg-[#e6f0e5] text-[#34734e] ${small ? 'h-9 w-9' : 'h-11 w-11'}`} aria-hidden="true"><svg viewBox="0 0 32 32" className="h-7 w-7" fill="none"><path d="M5 25h22M8 24V13l8-6 8 6v11M12 24v-7h8v7M4 13l12-8 12 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11h.01M20 11h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg></span>;
}

export default function AboutContent() {
  const { t } = useLanguage();
  const steps = [
    [t('about.step1Title'), t('about.step1Text')],
    [t('about.step2Title'), t('about.step2Text')],
    [t('about.step3Title'), t('about.step3Text')],
    [t('about.step4Title'), t('about.step4Text')],
    [t('about.step5Title'), t('about.step5Text')],
  ];

  return <main className="min-h-screen overflow-hidden">
    <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-3 px-5 py-5 sm:px-8 lg:px-12">
      <Link href="/" className="flex items-center gap-3" aria-label={t('home.aria')}><Mark/><span><span className="block text-[17px] font-extrabold tracking-[.12em] text-[#244c3b]">GRAMASEVA</span><span className="block text-[10px] tracking-wide text-[#839088]">{t('common.tagline')}</span></span></Link>
      <nav className="flex w-full flex-wrap items-center justify-center gap-1.5 rounded-full border border-[#e4e9df] bg-white/60 p-1.5 text-[11px] font-semibold text-[#607168] backdrop-blur-sm sm:w-auto sm:gap-1 sm:text-[12px]">
        <Link href="/" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">{t('nav.home')}</Link>
        <Link href="/report" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">{t('nav.report')}</Link>
        <Link href="/track" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">{t('nav.track')}</Link>
        <Link href="/about" aria-current="page" className="rounded-full bg-[#285f43] px-3 py-2 text-white transition sm:px-4">{t('nav.about')}</Link>
        <Link href="/admin/login" className="rounded-full px-3 py-2 transition hover:bg-[#eef2e9] hover:text-[#34734e] sm:px-4">{t('nav.admin')}</Link>
        <LanguageToggle/>
      </nav>
    </header>

    <section className="relative mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 md:pt-20 lg:px-12">
      <div className="mx-auto max-w-[820px] text-center">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#dce8da] bg-white/70 px-3 py-2 text-[11px] font-semibold tracking-wide text-[#52745f]"><span className="h-2 w-2 rounded-full bg-[#74a875]"></span>{t('about.eyebrow')}</div>
        <h1 className="serif text-[40px] leading-[1.1] tracking-[-.035em] text-[#1b3c30] sm:text-[56px]">{t('about.title1')} <span className="italic text-[#5c9269]">{t('about.titleAccent')}</span></h1>
        <p className="mx-auto mt-6 max-w-[640px] text-[15px] leading-7 text-[#6c7a71] sm:text-[16px]">{t('about.intro')}</p>
      </div>

      <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-3">
        <div className="anim-card rounded-[22px] border border-[#e9eae4] bg-white p-6 shadow-[0_16px_50px_rgba(38,66,49,.05)]"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#eaf1e6] text-lg text-[#588361]">✍️</span><h3 className="mt-4 text-sm font-bold text-[#244436]">{t('about.feature1Title')}</h3><p className="mt-2 text-xs leading-5 text-[#7b887f]">{t('about.feature1Text')}</p></div>
        <div className="anim-card rounded-[22px] border border-[#e9eae4] bg-white p-6 shadow-[0_16px_50px_rgba(38,66,49,.05)]"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#eaf1e6] text-lg text-[#588361]">🔎</span><h3 className="mt-4 text-sm font-bold text-[#244436]">{t('about.feature2Title')}</h3><p className="mt-2 text-xs leading-5 text-[#7b887f]">{t('about.feature2Text')}</p></div>
        <div className="anim-card rounded-[22px] border border-[#e9eae4] bg-white p-6 shadow-[0_16px_50px_rgba(38,66,49,.05)]"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#eaf1e6] text-lg text-[#588361]">🌱</span><h3 className="mt-4 text-sm font-bold text-[#244436]">{t('about.feature3Title')}</h3><p className="mt-2 text-xs leading-5 text-[#7b887f]">{t('about.feature3Text')}</p></div>
      </div>
    </section>

    <section className="border-y border-[#e9eae4] bg-[#f4f5ef] py-16 sm:py-20">
      <div className="mx-auto grid max-w-6xl items-start gap-10 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-16 lg:px-12">
        <div className="lg:sticky lg:top-10">
          <div className="mb-5 inline-flex items-center gap-2 text-[11px] font-bold tracking-[.15em] text-[#6e9873]"><span className="h-px w-6 bg-[#6e9873]"></span>{t('about.whoEyebrow')}</div>
          <h2 className="serif text-[32px] leading-tight tracking-[-.03em] text-[#1b3c30] sm:text-[40px]">{t('about.whoTitle1')} <span className="italic text-[#5c9269]">{t('about.whoTitleAccent')}</span></h2>
        </div>
        <div className="space-y-5 text-[14px] leading-7 text-[#6c7a71]">
          <p>{t('about.whoP1')}</p>
          <p>{t('about.whoP2')}</p>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="anim-card rounded-[26px] border border-[#e4e9df] bg-white p-7 shadow-[0_16px_60px_rgba(38,66,49,.06)] sm:p-9">
          <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold tracking-[.15em] text-[#6e9873]"><span className="h-px w-6 bg-[#6e9873]"></span>{t('about.missionEyebrow')}</div>
          <h2 className="serif text-[28px] leading-tight tracking-[-.02em] text-[#1b3c30] sm:text-[32px]">{t('about.missionTitle')}</h2>
          <p className="mt-4 text-[14px] leading-7 text-[#6c7a71]">{t('about.missionText')}</p>
        </div>
        <div className="anim-card rounded-[26px] bg-[#244b38] p-7 text-white shadow-[0_16px_60px_rgba(38,66,49,.14)] sm:p-9">
          <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold tracking-[.15em] text-[#b8d3ba]"><span className="h-px w-6 bg-[#b8d3ba]"></span>{t('about.visionEyebrow')}</div>
          <h2 className="serif text-[28px] leading-tight tracking-[-.02em] sm:text-[32px]">{t('about.visionTitle')}</h2>
          <p className="mt-4 text-[14px] leading-7 text-[#d7e3d6]">{t('about.visionText')}</p>
        </div>
      </div>
    </section>

    <section className="border-y border-[#e9eae4] bg-[#f4f5ef] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold tracking-[.15em] text-[#6e9873]"><span className="h-px w-6 bg-[#6e9873]"></span>{t('about.howEyebrow')}<span className="h-px w-6 bg-[#6e9873]"></span></div>
          <h2 className="serif text-[32px] leading-tight tracking-[-.03em] text-[#1b3c30] sm:text-[40px]">{t('about.howTitle1')} <span className="italic text-[#5c9269]">{t('about.howTitleAccent')}</span></h2>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map(([title, text], index) => (
            <li key={title} className="anim-card rounded-[20px] border border-[#e4e9df] bg-white p-5">
              <span className="serif text-2xl text-[#85a582]">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-3 text-sm font-bold text-[#244436]">{title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-[#7b887f]">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-5 py-16 text-center sm:px-8 sm:py-20 lg:px-12">
      <p className="serif mx-auto max-w-[720px] text-[26px] leading-snug tracking-[-.02em] text-[#1b3c30] sm:text-[34px]">{t('about.cta1')} <span className="italic text-[#5c9269]">{t('about.ctaAccent')}</span></p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/report" className="inline-flex items-center gap-3 rounded-full bg-[#285f43] px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_8px_22px_rgba(40,95,67,.18)] transition hover:-translate-y-0.5 hover:bg-[#1d4d35]">{t('home.cta')} <span className="text-lg">→</span></Link>
        <Link href="/" className="text-[13px] font-semibold text-[#34734e] transition hover:text-[#1d4d35]">{t('about.backHome')}</Link>
      </div>
    </section>

    <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-6 text-[11px] text-[#8b968e] sm:flex-row sm:px-8 lg:px-12"><Link href="/" className="flex items-center gap-2"><Mark small/><span className="font-bold tracking-[.12em] text-[#45614e]">GRAMASEVA</span></Link><p>{t('footer.made')}</p><Link href="/report" className="transition hover:text-[#34734e]">{t('footer.registerUp')}</Link></footer>
  </main>;
}

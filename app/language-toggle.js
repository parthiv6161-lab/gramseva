'use client';

import { useLanguage } from './language-provider';

export default function LanguageToggle({ variant = 'light', compact = false }) {
  const { language, t, toggleLanguage } = useLanguage();
  const colors = variant === 'dark'
    ? 'border border-white/15 text-white/75 hover:bg-white/10 hover:text-white'
    : 'border border-[#e4e9df] text-[#607168] hover:bg-[#eef2e9] hover:text-[#34734e]';
  const spacing = compact ? 'px-3 py-2' : 'px-3 py-2 sm:px-4';

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={t('lang.toggle')}
      title={t('lang.toggle')}
      lang={language === 'mr' ? 'ml' : 'en'}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold transition ${spacing} ${colors}`}
    >
      {language === 'mr' ? 'English' : 'മലയാളം'}
    </button>
  );
}

import './globals.css';
import localFont from 'next/font/local';
import SiteAnimations from './animations';
import { LanguageProvider } from './language-provider';

const manjari = localFont({
  src: './fonts/Manjari-Malayalam-400.woff2',
  weight: '400',
  style: 'normal',
  display: 'swap',
  variable: '--font-manjari',
  preload: false,
  adjustFontFallback: 'Arial',
});

const manjariBold = localFont({
  src: './fonts/Manjari-Malayalam-700.woff2',
  weight: '700',
  style: 'normal',
  display: 'swap',
  variable: '--font-manjari-bold',
  preload: true,
  adjustFontFallback: 'Arial',
});

export const metadata = {
  title: 'GRAMASEVA | ഗ്രാമീണ പരാതി നിർവഹണ സംവിധാനം',
  description: 'ഗ്രാമത്തിലെ പ്രശ്നങ്ങൾ എളുപ്പത്തിൽ അറിയിക്കാൻ സഹായിക്കുന്ന ലളിതവും സുതാര്യവുമായ സംവിധാനം.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ml" className={`${manjari.variable} ${manjariBold.variable}`}>
      <head>
        <link rel="preload" href="/_next/static/media/caf9f9e8b7c7fde7-s.p.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <LanguageProvider>
          <SiteAnimations/>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

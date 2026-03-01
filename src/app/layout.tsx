import type { Metadata } from 'next'
import { Merriweather, Montserrat } from 'next/font/google'
import './globals.css'

const merriweather = Merriweather({
  weight: ['400', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-merriweather',
  display: 'swap',
})

const montserrat = Montserrat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BÜ Nabız',
  description: 'Boğaziçi öğrencilerinin anonim haftalık yük duvarı',
}

// Runs before first paint — reads stored pref or system pref, sets data-theme on <html>
const themeScript = `(function(){try{
  var s=localStorage.getItem('bu_nabiz_theme');
  var t=s||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');
  document.documentElement.setAttribute('data-theme',t);
}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${merriweather.variable} ${montserrat.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}

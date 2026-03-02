import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { BottomNav } from '@/components/BottomNav'

const _geist = Geist({ subsets: ['latin'] })
const _geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FirstBell',
  description: 'Play Fun Learn',
  keywords:
    'FirstBell, online shopping, beauty, toys, gifts, art, home decor',
  generator: 'FirstBell',

  // ✅ Google Site Verification Added Here
  verification: {
    google: 'cXEeUXUxRbpKTmIj95Gogg9LTk_ny6qtpsX-9SBIKzs',
  },

  openGraph: {
    title: 'FirstBell',
    description: 'Play Fun Learn',
    type: 'website',
    url: 'https://first-bell-e.vercel.app',
    siteName: 'FirstBell',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#131921',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${_geist.className} antialiased pb-24`}>
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
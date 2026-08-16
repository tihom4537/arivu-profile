import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Self-hosted at build time by next/font — no request to Google at runtime, which
// matters because this page opens inside WhatsApp's WebView on slow connections.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Arivu Mitra',
  // Shared person to person, not meant to be indexed.
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="flex justify-center bg-soft font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  )
}

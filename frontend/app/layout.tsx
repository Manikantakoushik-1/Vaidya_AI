import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'
import MedicalDisclaimer from '@/components/medical/MedicalDisclaimer'

export const metadata: Metadata = {
  title: 'VaidyaAI - AI Doctor for Rural India',
  description: 'Voice-first AI health assistant in English, Hindi, and Telugu',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VaidyaAI',
  },
  icons: {
    apple: '/icons/icon-192x192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0D9488',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 pb-20 md:pb-0 md:pt-16">
          {children}
        </main>
        <MedicalDisclaimer />
        <MobileNav />
      </body>
    </html>
  )
}

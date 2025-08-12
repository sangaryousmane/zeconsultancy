import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Toaster } from '@/components/ui/toaster'
import { Suspense } from 'react'
import { CriticalErrorBoundary } from '@/components/error/ErrorBoundary'
import WhatsAppFloat from '@/components/shared/WhatsAppFloat'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3004'),
  title: 'RentalHub - Equipment Rental & Brokerage Services',
  description: 'Your trusted partner for equipment rental and brokerage services. High-quality equipment and professional services to help your business succeed.',
  keywords: 'equipment rental, brokerage services, construction equipment, business equipment, rental marketplace, industrial equipment',
  authors: [{ name: 'RentalHub Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'RentalHub - Equipment Rental & Brokerage Services',
    description: 'Your trusted partner for equipment rental and brokerage services',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      </head>
      <body className={inter.className}>
        <CriticalErrorBoundary>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                {children}
              </Suspense>
            </main>
            <Footer />
          </div>
          <Toaster />
          <WhatsAppFloat />
        </CriticalErrorBoundary>
      </body>
    </html>
  )
}
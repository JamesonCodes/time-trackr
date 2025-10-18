import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import MobileNavigation from '@/components/MobileNavigation'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TimeTrackr - Local-First Time Tracking',
  description: 'A local-first time tracking app built with Next.js, TypeScript, Tailwind, and Dexie.js — fast, private, and works offline.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: { url: '/favicon-32x32.png', sizes: '32x32' }
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          {children}
          <Footer />
          <MobileNavigation />
        </ThemeProvider>
      </body>
    </html>
  )
}

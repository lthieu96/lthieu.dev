import type { Metadata } from 'next'
import { Caveat, Geist, Geist_Mono, Space_Grotesk } from 'next/font/google'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Noise } from '@/components/noise'
import { PageLoader } from '@/components/page-loader'
import { SheetFrame } from '@/components/sheet-frame'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

export const dynamic = 'error'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
})

const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Hieu Le — Fullstack Developer',
  description:
    'Portfolio of Hieu Le, a fullstack developer in Ho Chi Minh City building web products end to end.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${caveat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="relative min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark">
          <PageLoader />
          <Noise className="fixed" style={{ zIndex: 20 }} />
          <SheetFrame />
          <Footer />
          <div className="drafting-grid relative z-10 bg-background flex flex-col flex-1">
            <Header />
            <div className="flex flex-1 flex-col">{children}</div>
          </div>
          <div aria-hidden="true" className="h-[150px] sm:h-[210px] lg:h-[300px] shrink-0" />
        </ThemeProvider>
      </body>
    </html>
  )
}

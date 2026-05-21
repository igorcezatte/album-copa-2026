import type { Metadata, Viewport } from 'next'
import { Big_Shoulders_Display, Sora, Space_Mono } from 'next/font/google'
import './globals.css'
import { NavBar } from '@/components/NavBar'
import { DesktopHeader } from '@/components/DesktopHeader'
import { WelcomeModal } from '@/components/WelcomeModal'
import { InAppBrowserBanner } from '@/components/InAppBrowserBanner'
import { AuthProvider } from '@/providers/AuthProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'

const display = Big_Shoulders_Display({
  subsets: ['latin'],
  weight: ['500', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
})

const sans = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Álbum Copa 2026',
  description: 'Controle suas figurinhas da Copa do Mundo 2026',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#060a14',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen-safe bg-copa-bg">
        <ThemeProvider>
        <AuthProvider>
          {/* Sem min-h aqui: o body já garante altura mínima e empilhar dois
              min-h causa "espaço fantasma" no fim da página em mobile. */}
          <DesktopHeader />
          <div className="max-w-lg md:max-w-6xl mx-auto relative md:pt-16">
            <InAppBrowserBanner />
            <main className="pb-20 md:pb-12">{children}</main>
            <NavBar />
          </div>
          <WelcomeModal />
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

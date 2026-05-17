import type { Metadata, Viewport } from 'next'
import './globals.css'
import { NavBar } from '@/components/NavBar'
import { AuthProvider } from '@/providers/AuthProvider'
import { ThemeProvider } from '@/providers/ThemeProvider'

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
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-copa-bg">
        <ThemeProvider>
        <AuthProvider>
          <div className="max-w-lg mx-auto min-h-screen relative">
            <main className="pb-20">{children}</main>
            <NavBar />
          </div>
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

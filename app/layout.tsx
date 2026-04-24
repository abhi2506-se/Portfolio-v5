import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AIAssistant } from '@/components/ai-assistant'
import { CodeProtection } from '@/components/code-protection'

const _inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Abhishek Singh | DevOps/Software Engineer & Full Stack Engineer',
  description: 'Portfolio of Abhishek Singh - Frontend-focused developer building responsive web interfaces with React, JavaScript, and modern web technologies.',
  generator: 'v0.app',
  openGraph: {
    title: 'Abhishek Singh | Frontend Developer',
    description: 'Explore my portfolio showcasing React projects, full-stack development, and web solutions.',
    url: '#',
    siteName: 'Abhishek Singh',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/api/favicon', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {/* Google Analytics — add your GA4 Measurement ID to .env.local as NEXT_PUBLIC_GA_ID */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', { page_path: window.location.pathname });
            `}} />
          </>
        )}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <AIAssistant />
          <CodeProtection />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}

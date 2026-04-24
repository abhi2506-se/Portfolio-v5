import type { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Admin | Portfolio CMS',
  description: 'Portfolio admin panel',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      {children}
    </Suspense>
  )
}

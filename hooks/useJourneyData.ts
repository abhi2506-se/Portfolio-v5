'use client'

import { useState, useEffect, useCallback } from 'react'
import { getBlogs, getCertificates, type BlogPost, type Certificate } from '@/lib/journey-store'

export function useJourneyData() {
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [b, c] = await Promise.all([getBlogs(), getCertificates()])
    setBlogs(b)
    setCertificates(c)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
    window.addEventListener('journey-data-updated', refresh)
    return () => window.removeEventListener('journey-data-updated', refresh)
  }, [refresh])

  return { blogs, certificates, loading, refresh }
}

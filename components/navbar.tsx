'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Menu, X, Moon, Sun, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import Link from 'next/link'

const navItems = [
  { label: 'About',      href: '#about' },
  { label: 'Skills',     href: '#skills' },
  { label: 'Projects',   href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact',    href: '#contact' },
]

export function Navbar() {
  const [isOpen, setIsOpen]       = useState(false)
  const [isScrolled, setScrolled] = useState(false)
  const [active, setActive]       = useState('')
  const { theme, setTheme }       = useTheme()
  const [mounted, setMounted]     = useState(false)
  const { scrollY }               = useScroll()
  const navOpacity                = useTransform(scrollY, [0, 80], [0.7, 1])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      // Highlight active section
      const sections = navItems.map(i => i.href.slice(1))
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 120) { setActive(`#${id}`); break }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault()
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false)
      setActive(href)
    }
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.25,0.46,0.45,0.94] }}
        style={{ opacity: navOpacity }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <motion.a
            href="#"
            onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="relative text-xl font-extrabold"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">AS</span>
            <motion.span
              className="absolute -bottom-0.5 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              whileHover={{ width: '100%' }}
              transition={{ duration: 0.3 }}
            />
          </motion.a>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={e => handleNavClick(e, item.href)}
                whileHover={{ y: -1 }}
                className={`relative px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                  active === item.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {active === item.href && (
                  <motion.span layoutId="nav-pill"
                    className="absolute inset-0 bg-secondary rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </motion.a>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/journey">
              <motion.div
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-500/10 to-orange-500/10 border border-rose-500/20 hover:border-rose-500/50 hover:from-rose-500/20 hover:to-orange-500/20 text-rose-500 text-sm font-semibold transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4" />Journey
              </motion.div>
            </Link>
            {mounted && (
              <Button size="icon" variant="outline"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme" className="rounded-full">
                <AnimatePresence mode="wait">
                  {theme === 'dark'
                    ? <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><Sun className="w-4 h-4" /></motion.div>
                    : <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Moon className="w-4 h-4" /></motion.div>}
                </AnimatePresence>
              </Button>
            )}
          </div>

          {/* Mobile right */}
          <div className="md:hidden flex items-center gap-2">
            <Link href="/journey">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                <Compass className="w-3.5 h-3.5" />Journey
              </div>
            </Link>
            {mounted && (
              <Button size="icon" variant="outline" className="rounded-full h-8 w-8"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </Button>
            )}
            <Button size="icon" variant="outline" className="rounded-full h-8 w-8"
              onClick={() => setIsOpen(!isOpen)}>
              <AnimatePresence mode="wait">
                {isOpen
                  ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X className="w-4 h-4" /></motion.div>
                  : <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Menu className="w-4 h-4" /></motion.div>}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border md:hidden z-40 overflow-hidden"
          >
            <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={e => handleNavClick(e, item.href)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    active === item.href
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                >
                  {item.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

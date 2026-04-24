'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, ArrowUp, Instagram, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePortfolioData } from '@/hooks/usePortfolioData'

export function Footer() {
  const { hero } = usePortfolioData()
  const year = new Date().getFullYear()

  const socialLinks = [
    hero.github    && { icon: Github,    href: hero.github,              label: 'GitHub' },
    hero.linkedin  && { icon: Linkedin,  href: hero.linkedin,            label: 'LinkedIn' },
    hero.email     && { icon: Mail,      href: `mailto:${hero.email}`,   label: 'Email' },
    hero.instagram && { icon: Instagram, href: hero.instagram,           label: 'Instagram' },
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; href: string; label: string }[]

  const quickLinks = [['Home','#'], ['About','#about'], ['Skills','#skills'], ['Projects','#projects'], ['Contact','#contact']]

  return (
    <footer className="border-t border-border bg-secondary/20 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="col-span-2 md:col-span-1"
          >
            <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-3">
              AS
            </div>
            <h3 className="font-bold text-lg mb-2">{hero.name}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{hero.title}</p>
            {hero.available && (
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-600 font-medium">Open to opportunities</span>
              </div>
            )}
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Navigation</h3>
            <ul className="space-y-2">
              {quickLinks.map(([label, href]) => (
                <li key={label}>
                  <motion.a href={href} whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 group">
                    <span className="w-1 h-1 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Connect</h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.a key={i} href={s.href}
                    target={s.href.startsWith('mailto') ? undefined : '_blank'}
                    rel="noopener noreferrer" aria-label={s.label}
                    whileHover={{ scale: 1.15, y: -3 }} whileTap={{ scale: 0.9 }}
                    className="p-2.5 bg-secondary rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-blue-600/30 hover:shadow-md transition-all">
                    <Icon className="w-4 h-4" />
                  </motion.a>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            © {year} {hero.name}. Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> All rights reserved.
          </p>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button size="sm" variant="outline"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Scroll to top" className="gap-2 text-xs">
              <ArrowUp className="w-3.5 h-3.5" />Back to top
            </Button>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}

'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Mail, Linkedin, Github, Instagram, Send, CheckCircle, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePortfolioData } from '@/hooks/usePortfolioData'

export function Contact() {
  const { hero } = usePortfolioData()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.12 } } }
  const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25,0.46,0.45,0.94] } } }

  const contactMethods = [
    hero.location && { icon: MapPin,    label: 'Location',  value: hero.location,            href: `https://maps.google.com/?q=${encodeURIComponent(hero.location || '')}`, color: 'from-emerald-600 to-teal-500' },
    hero.email    && { icon: Mail,      label: 'Email',     value: hero.email,               href: `mailto:${hero.email}`,   color: 'from-blue-600 to-cyan-500' },
    hero.linkedin && { icon: Linkedin,  label: 'LinkedIn',  value: 'Connect on LinkedIn',    href: hero.linkedin,             color: 'from-blue-700 to-blue-500' },
    hero.github   && { icon: Github,    label: 'GitHub',    value: 'Visit GitHub Profile',   href: hero.github,               color: 'from-slate-700 to-slate-500' },
    hero.instagram && { icon: Instagram, label: 'Instagram', value: 'Follow on Instagram',   href: hero.instagram,            color: 'from-pink-600 to-orange-500' },
  ].filter(Boolean) as { icon: React.ComponentType<{ className?: string }>; label: string; value: string; href: string; color: string }[]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { setStatus('sent'); setForm({ name: '', email: '', message: '' }) }
      else setStatus('error')
    } catch { setStatus('error') }
    setTimeout(() => setStatus('idle'), 4000)
  }

  return (
    <motion.section
      id="contact"
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={container}
      className="py-20 md:py-32 px-4 md:px-6 lg:px-8 max-w-5xl mx-auto"
    >
      <motion.div variants={fadeUp} className="mb-12">
        <span className="text-sm font-semibold text-blue-600 uppercase tracking-widest">Say Hello</span>
        <h2 className="text-4xl md:text-5xl font-bold mt-2">
          Get In{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Touch</span>
        </h2>
        <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-2xl">
          I'm always open to discussing new opportunities, interesting projects, or just having a conversation about technology.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
        {/* Contact cards */}
        <motion.div variants={fadeUp} className="space-y-4">
          {contactMethods.map((method, i) => {
            const Icon = method.icon
            return (
              <motion.a
                key={i}
                href={method.href}
                target={method.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                whileHover={{ x: 6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="flex items-center gap-4 p-4 bg-secondary rounded-2xl border border-border hover:border-blue-600/30 hover:shadow-md transition-all group"
              >
                <div className={`p-3 bg-gradient-to-br ${method.color} rounded-xl text-white shadow-md flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{method.label}</p>
                  <p className="font-semibold text-sm group-hover:text-blue-600 transition-colors truncate">{method.value}</p>
                </div>
                <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  className="ml-auto text-muted-foreground/40 group-hover:text-blue-600/60 flex-shrink-0">
                  →
                </motion.div>
              </motion.a>
            )
          })}
        </motion.div>

        {/* Contact form */}
        <motion.div variants={fadeUp} className="bg-secondary rounded-2xl p-6 md:p-8 border border-border">
          <h3 className="text-xl font-bold mb-6">Send a Message</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name',    label: 'Your Name',    type: 'text',  placeholder: 'Rahul Sharma' },
              { key: 'email',   label: 'Email Address', type: 'email', placeholder: 'rahul@example.com' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={(form as Record<string,string>)[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/10 transition-all placeholder-muted-foreground/50"
                />
              </div>
            ))}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Message</label>
              <textarea
                rows={4}
                placeholder="Tell me about your project or opportunity..."
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600/50 focus:ring-2 focus:ring-blue-600/10 transition-all placeholder-muted-foreground/50 resize-none"
              />
            </div>

            <AnimatePresence mode="wait">
              {status === 'sent' ? (
                <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-green-600 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-sm font-medium">
                  <CheckCircle className="w-4 h-4" /> Message sent! I'll get back to you soon.
                </motion.div>
              ) : status === 'error' ? (
                <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm">
                  Something went wrong. Please email me directly.
                </motion.div>
              ) : (
                <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Button type="submit" disabled={status === 'sending'} className="w-full gap-2 shadow-lg shadow-blue-600/20">
                    {status === 'sending' ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</> : <><Send className="w-4 h-4" />Send Message</>}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </motion.section>
  )
}

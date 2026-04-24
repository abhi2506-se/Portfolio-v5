'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Code2, Briefcase, BookOpen, FolderGit2, Mail,
  LogOut, Save, Plus, Trash2, ChevronDown, ChevronUp,
  Eye, Shield, CheckCircle, AlertCircle, Loader2, ExternalLink,
  GraduationCap, Settings, Home, Pencil, X, LayoutDashboard,
  KeyRound, AtSign, RefreshCw, SendHorizonal, Lock,
  Compass, MapPin, Music, Film, Image as ImageIcon, Upload, FileText, Award, Tag, Calendar,
  UserCircle, Camera, BarChart2, MessageSquare, Phone, Bot, Download, Bell, Sparkles,
} from 'lucide-react'
import { defaultPortfolioData, getPortfolioData, savePortfolioData, type PortfolioData } from '@/lib/portfolio-data'
import { getBlogs, saveBlog, deleteBlog, getCertificates, saveCertificate, deleteCertificate, saveMedia, getMediaUrl, isVideoId, generateId, formatFileSize, getJourneyProfile, saveJourneyProfile, type BlogPost, type Certificate, type JourneyMedia, type JourneyProfile } from '@/lib/journey-store'
import { COUNTRIES, getStates, getCities } from '@/lib/geo-data'

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = 'overview' | 'hero' | 'about' | 'skills' | 'experience' | 'education' | 'projects' | 'journey' | 'analytics' | 'messages' | 'chatbot' | 'settings'
type Toast = { id: number; message: string; type: 'success' | 'error' }

// ─── Helper components ────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{children}</label>
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:bg-slate-800 transition-all ${props.className ?? ''}`}
    />
  )
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/60 focus:bg-slate-800 transition-all resize-none ${props.className ?? ''}`}
    />
  )
}

function SectionCard({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700/40 bg-slate-800/30">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-semibold text-white">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

const navItems: { id: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'hero', label: 'Hero', icon: Home },
  { id: 'about', label: 'About', icon: User },
  { id: 'skills', label: 'Skills', icon: Code2 },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'journey', label: 'Journey', icon: Compass },
  { id: 'analytics', label: 'AI Analytics', icon: BarChart2 },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'chatbot', label: 'Chatbot Setup', icon: Bot },
  { id: 'settings', label: 'Settings', icon: Settings },
]

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<Section>('overview')
  const [data, setData] = useState<PortfolioData>(defaultPortfolioData)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [saving, setSaving] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    // Load from DB (cross-device sync)
    fetch('/api/portfolio', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => { if (json) setData(d => ({ ...d, ...json })) })
      .catch(() => {})
  }, [])

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  const handleSave = async (section: keyof PortfolioData, newData: PortfolioData[keyof PortfolioData]) => {
    setSaving(true)
    try {
      const updated = { ...data, [section]: newData }
      // Save to DB so ALL devices see updates immediately
      await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      setData(updated)
      addToast(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully!`)
    } catch {
      addToast('Save failed. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const totalProjects = data.projects.length
  const totalSkills = data.skills.reduce((a, c) => a + c.skills.length, 0)
  const totalExp = data.experience.length + data.education.length

  return (
    <div className="min-h-screen bg-[#020817] text-white flex">
      {/* ── Sidebar ── */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 30, stiffness: 250 }}
            className="w-64 min-h-screen bg-slate-900/80 border-r border-slate-700/40 flex flex-col fixed lg:relative z-30"
          >
            {/* Logo */}
            <div className="px-6 py-5 border-b border-slate-700/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/20">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-sm text-white">Portfolio CMS</p>
                  <p className="text-xs text-slate-500">Admin Dashboard</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = activeSection === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-blue-400 border border-blue-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-blue-400' : ''}`} />
                    {item.label}
                  </button>
                )
              })}
            </nav>

            {/* Bottom */}
            <div className="px-3 py-4 border-t border-slate-700/40 space-y-2">
              <a
                href="/"
                target="_blank"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
              >
                <Eye className="w-4 h-4" />
                View Portfolio
                <ExternalLink className="w-3 h-3 ml-auto" />
              </a>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-slate-900/60 border-b border-slate-700/40 flex items-center px-6 gap-4 sticky top-0 z-20 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-white capitalize">
              {navItems.find((n) => n.id === activeSection)?.label ?? 'Dashboard'}
            </h1>
          </div>
          {saving && (
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
            </div>
          )}
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {activeSection === 'overview' && <OverviewSection data={data} totalProjects={totalProjects} totalSkills={totalSkills} totalExp={totalExp} setActiveSection={setActiveSection} />}
              {activeSection === 'hero' && <HeroSection data={data.hero} onSave={(d) => handleSave('hero', d)} />}
              {activeSection === 'about' && <AboutSection data={data.about} onSave={(d) => handleSave('about', d)} />}
              {activeSection === 'skills' && <SkillsSection data={data.skills} onSave={(d) => handleSave('skills', d)} />}
              {activeSection === 'experience' && <ExperienceSection data={data.experience} onSave={(d) => handleSave('experience', d)} />}
              {activeSection === 'education' && <EducationSection data={data.education} onSave={(d) => handleSave('education', d)} />}
              {activeSection === 'projects' && <ProjectsSection data={data.projects} onSave={(d) => handleSave('projects', d)} />}
              {activeSection === 'journey' && <JourneySection addToast={addToast} />}
              {activeSection === 'analytics' && <AnalyticsSection />}
              {activeSection === 'messages' && <MessagesSection />}
              {activeSection === 'chatbot' && <ChatbotSection addToast={addToast} />}
              {activeSection === 'settings' && <SettingsSection addToast={addToast} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* ── Toast notifications ── */}
      <div className="fixed bottom-6 right-6 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium pointer-events-auto ${
                t.type === 'success'
                  ? 'bg-emerald-900/90 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-900/90 border border-red-500/30 text-red-300'
              }`}
            >
              {t.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Overview Section ─────────────────────────────────────────────────────────
function OverviewSection({
  data, totalProjects, totalSkills, totalExp, setActiveSection,
}: {
  data: PortfolioData
  totalProjects: number
  totalSkills: number
  totalExp: number
  setActiveSection: (s: Section) => void
}) {
  const stats = [
    { label: 'Projects', value: totalProjects, icon: FolderGit2, section: 'projects' as Section, color: 'from-blue-600 to-cyan-500' },
    { label: 'Skill Items', value: totalSkills, icon: Code2, section: 'skills' as Section, color: 'from-purple-600 to-pink-500' },
    { label: 'Timeline Entries', value: totalExp, icon: Briefcase, section: 'experience' as Section, color: 'from-orange-600 to-red-500' },
    { label: 'Skill Categories', value: data.skills.length, icon: Settings, section: 'skills' as Section, color: 'from-green-600 to-teal-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Welcome back, Admin 👋</h2>
        <p className="text-slate-400 text-sm">Manage and update your portfolio content from here.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <button
              key={s.label}
              onClick={() => setActiveSection(s.section)}
              className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5 text-left hover:border-slate-600/60 transition-all group"
            >
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${s.color} mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </button>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">Quick Edit</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {navItems.filter(n => n.id !== 'overview').map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="flex items-center gap-3 px-4 py-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 hover:border-blue-500/30 rounded-xl text-sm text-slate-300 hover:text-white transition-all"
              >
                <Icon className="w-4 h-4 text-blue-400" />
                Edit {item.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-500/5 border border-blue-500/15 rounded-2xl p-5">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-300 mb-1">How it works</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Changes are saved to your browser&apos;s local storage and reflected on the portfolio instantly. To persist changes across devices, export the data or integrate a database. Use the <strong className="text-slate-300">env vars</strong> <code className="font-mono text-blue-300">ADMIN_USERNAME</code> and <code className="font-mono text-blue-300">ADMIN_PASSWORD</code> to set custom credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection({ data, onSave }: { data: PortfolioData['hero']; onSave: (d: PortfolioData['hero']) => void }) {
  const [form, setForm] = useState(data)
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))

  // ── Resume upload state ────────────────────────────────────────────────────
  const [resumeUploading, setResumeUploading] = useState(false)
  const [resumeStatus, setResumeStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const resumeInputRef = useRef<HTMLInputElement>(null)

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setResumeStatus({ type: 'error', msg: 'Only PDF files are supported.' })
      return
    }
    setResumeUploading(true)
    setResumeStatus(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/resume', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok || !json.url) throw new Error(json.error || 'Upload failed')
      setForm((f) => ({ ...f, resumeUrl: json.url }))
      setResumeStatus({ type: 'success', msg: 'Resume uploaded! Click "Save Hero" to apply.' })
    } catch (err: unknown) {
      setResumeStatus({ type: 'error', msg: err instanceof Error ? err.message : String(err) })
    } finally {
      setResumeUploading(false)
      if (resumeInputRef.current) resumeInputRef.current.value = ''
    }
  }

  return (
    <SectionCard title="Hero Section" icon={Home}>
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <Label>Full Name</Label>
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" />
        </div>
        <div>
          <Label>Title / Role</Label>
          <Input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Full Stack Engineer" />
        </div>
        <div className="md:col-span-2">
          <Label>Subtitle</Label>
          <Input value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} placeholder="Short tagline" />
        </div>
        <div className="md:col-span-2">
          <Label>Description</Label>
          <Textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Longer bio paragraph" />
        </div>
        <div>
          <Label>GitHub URL</Label>
          <Input value={form.github} onChange={(e) => set('github', e.target.value)} placeholder="https://github.com/..." />
        </div>
        <div>
          <Label>LinkedIn URL</Label>
          <Input value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <Label>Instagram URL</Label>
          <Input value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="https://instagram.com/..." />
        </div>
        <div className="md:col-span-2">
          <Label>Current Location (shown in Get In Touch)</Label>
          <LocationPicker
            country={(form as any).locationCountry || ''}
            state={(form as any).locationState || ''}
            city={(form as any).locationCity || ''}
            onChange={(field, val) => {
              if (field === 'country') { set('locationCountry', val); set('locationState', ''); set('locationCity', '') }
              else if (field === 'state') { set('locationState', val); set('locationCity', '') }
              else set('locationCity', val)
              // Build display string
              const c = field === 'country' ? val : (form as any).locationCountry || ''
              const s = field === 'state' ? val : (field === 'country' ? '' : (form as any).locationState || '')
              const ci = field === 'city' ? val : (field !== 'country' && field !== 'state' ? (form as any).locationCity || '' : '')
              const parts = [ci, s, c].filter(Boolean)
              set('location', parts.join(', '))
            }}
          />
          {(form as any).location && (
            <p className="mt-1.5 text-xs text-slate-400">📍 Will show as: <span className="text-blue-400">{(form as any).location}</span></p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set('available', !form.available)}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.available ? 'bg-green-500' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.available ? 'translate-x-5' : ''}`} />
            </div>
            <span className="text-sm text-slate-300">Show "Available for opportunities" badge</span>
          </label>
        </div>
      </div>

      {/* ── Resume Management ─────────────────────────────────────────────── */}
      <div className="mt-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-slate-200">Resume / CV</span>
        </div>

        {/* Current URL display */}
        <div>
          <Label>Current Resume URL</Label>
          <div className="flex gap-2">
            <Input
              value={form.resumeUrl || '/Cv.pdf'}
              onChange={(e) => set('resumeUrl', e.target.value)}
              placeholder="https://... or /Cv.pdf"
              className="flex-1 font-mono text-xs"
            />
            {form.resumeUrl && (
              <a
                href={form.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Preview
              </a>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            You can paste any public PDF URL here, or upload a new file below.
          </p>
        </div>

        {/* File upload */}
        <div>
          <Label>Upload New Resume (PDF only)</Label>
          <div
            onClick={() => !resumeUploading && resumeInputRef.current?.click()}
            className={`mt-1.5 flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors
              ${resumeUploading ? 'opacity-50 cursor-not-allowed border-slate-600' : 'border-slate-600 hover:border-blue-500 hover:bg-blue-500/5'}`}
          >
            {resumeUploading ? (
              <>
                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                <span className="text-sm text-slate-400">Uploading…</span>
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 text-slate-500" />
                <span className="text-sm text-slate-400">Click to select a PDF file</span>
                <span className="text-xs text-slate-600">Max recommended size: 5 MB</span>
              </>
            )}
            <input
              ref={resumeInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleResumeUpload}
            />
          </div>
        </div>

        {/* Status feedback */}
        {resumeStatus && (
          <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg text-sm
            ${resumeStatus.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
            {resumeStatus.type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            {resumeStatus.msg}
          </div>
        )}
      </div>

      <SaveButton onClick={() => onSave(form)} />
    </SectionCard>
  )
}

// ─── About Section ────────────────────────────────────────────────────────────
function AboutSection({ data, onSave }: { data: PortfolioData['about']; onSave: (d: PortfolioData['about']) => void }) {
  const [form, setForm] = useState(data)

  const updateStat = (i: number, key: 'label' | 'value', val: string) => {
    const stats = [...form.stats]
    stats[i] = { ...stats[i], [key]: val }
    setForm((f) => ({ ...f, stats }))
  }

  const addStat = () => setForm((f) => ({ ...f, stats: [...f.stats, { label: 'New Stat', value: '0' }] }))
  const removeStat = (i: number) => setForm((f) => ({ ...f, stats: f.stats.filter((_, idx) => idx !== i) }))

  return (
    <SectionCard title="About Section" icon={User}>
      <div className="space-y-4">
        <div>
          <Label>Bio Paragraph 1</Label>
          <Textarea rows={3} value={form.bio1} onChange={(e) => setForm((f) => ({ ...f, bio1: e.target.value }))} />
        </div>
        <div>
          <Label>Bio Paragraph 2</Label>
          <Textarea rows={3} value={form.bio2} onChange={(e) => setForm((f) => ({ ...f, bio2: e.target.value }))} />
        </div>
        <div>
          <Label>Bio Paragraph 3</Label>
          <Textarea rows={3} value={form.bio3} onChange={(e) => setForm((f) => ({ ...f, bio3: e.target.value }))} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Stats / Numbers</Label>
            <button onClick={addStat} className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Stat
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {form.stats.map((stat, i) => (
              <div key={i} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Stat #{i + 1}</span>
                  <button onClick={() => removeStat(i)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Input placeholder="Value (e.g. 15+)" value={stat.value} onChange={(e) => updateStat(i, 'value', e.target.value)} />
                <Input placeholder="Label (e.g. Projects)" value={stat.label} onChange={(e) => updateStat(i, 'label', e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <SaveButton onClick={() => onSave(form)} />
    </SectionCard>
  )
}

// ─── Skills Section ───────────────────────────────────────────────────────────
function SkillsSection({ data, onSave }: { data: PortfolioData['skills']; onSave: (d: PortfolioData['skills']) => void }) {
  const [cats, setCats] = useState(data)
  const [expanded, setExpanded] = useState<number | null>(0)

  const updateField = (i: number, key: 'title' | 'color', val: string) =>
    setCats((c) => c.map((cat, idx) => idx === i ? { ...cat, [key]: val } : cat))

  const updateSkill = (ci: number, si: number, val: string) =>
    setCats((c) => c.map((cat, idx) => idx === ci ? { ...cat, skills: cat.skills.map((s, j) => j === si ? val : s) } : cat))

  const addSkill = (ci: number) =>
    setCats((c) => c.map((cat, idx) => idx === ci ? { ...cat, skills: [...cat.skills, 'New Skill'] } : cat))

  const removeSkill = (ci: number, si: number) =>
    setCats((c) => c.map((cat, idx) => idx === ci ? { ...cat, skills: cat.skills.filter((_, j) => j !== si) } : cat))

  const addCategory = () =>
    setCats((c) => [...c, { title: 'New Category', icon: 'Code2', skills: ['Skill 1'], color: 'from-blue-600 to-cyan-500' }])

  const removeCategory = (i: number) => setCats((c) => c.filter((_, idx) => idx !== i))

  return (
    <SectionCard title="Skills & Expertise" icon={Code2}>
      <div className="space-y-3">
        {cats.map((cat, ci) => (
          <div key={ci} className="bg-slate-800/40 border border-slate-700/40 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === ci ? null : ci)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/60 transition-colors"
            >
              <span className="flex-1 font-medium text-sm text-white">{cat.title || 'Unnamed Category'}</span>
              <span className="text-xs text-slate-500 mr-2">{cat.skills.length} skills</span>
              {expanded === ci ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>

            <AnimatePresence>
              {expanded === ci && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-700/40 pt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Category Title</Label>
                        <Input value={cat.title} onChange={(e) => updateField(ci, 'title', e.target.value)} />
                      </div>
                      <div>
                        <Label>Gradient Color (Tailwind)</Label>
                        <Input value={cat.color} onChange={(e) => updateField(ci, 'color', e.target.value)} placeholder="from-blue-600 to-cyan-500" />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Skills</Label>
                        <button onClick={() => addSkill(ci)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {cat.skills.map((skill, si) => (
                          <div key={si} className="flex gap-2">
                            <Input value={skill} onChange={(e) => updateSkill(ci, si, e.target.value)} />
                            <button onClick={() => removeSkill(ci, si)} className="p-2 text-slate-600 hover:text-red-400 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => removeCategory(ci)}
                      className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 transition-colors pt-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove this category
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        <button
          onClick={addCategory}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-600 hover:border-blue-500/50 rounded-xl text-sm text-slate-400 hover:text-blue-400 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Skill Category
        </button>
      </div>
      <SaveButton onClick={() => onSave(cats)} />
    </SectionCard>
  )
}

// ─── Location Picker ──────────────────────────────────────────────────────────
function LocationPicker({ country, state, city, onChange }: {
  country: string; state: string; city: string
  onChange: (field: 'country' | 'state' | 'city', val: string) => void
}) {
  const states = country ? getStates(country) : []
  const cities = country && state ? getCities(country, state) : []

  return (
    <div className="grid grid-cols-3 gap-2">
      <div>
        <Label>Country</Label>
        <select
          value={country}
          onChange={e => { onChange('country', e.target.value); onChange('state', ''); onChange('city', '') }}
          className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-all"
        >
          <option value="">Select country</option>
          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div>
        <Label>State / Province</Label>
        <select
          value={state}
          onChange={e => { onChange('state', e.target.value); onChange('city', '') }}
          disabled={!states.length}
          className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-all disabled:opacity-40"
        >
          <option value="">Select state</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <Label>City</Label>
        <select
          value={city}
          onChange={e => onChange('city', e.target.value)}
          disabled={!cities.length}
          className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-all disabled:opacity-40"
        >
          <option value="">Select city</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  )
}

// ─── Experience Section ───────────────────────────────────────────────────────
function ExperienceSection({ data, onSave }: { data: PortfolioData['experience']; onSave: (d: PortfolioData['experience']) => void }) {
  const [items, setItems] = useState(data)

  const update = (i: number, key: string, val: string) =>
    setItems((arr) => arr.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  const updateDesc = (i: number, di: number, val: string) =>
    setItems((arr) => arr.map((item, idx) => idx === i ? { ...item, description: item.description.map((d, j) => j === di ? val : d) } : item))

  const addDesc = (i: number) =>
    setItems((arr) => arr.map((item, idx) => idx === i ? { ...item, description: [...item.description, ''] } : item))

  const removeDesc = (i: number, di: number) =>
    setItems((arr) => arr.map((item, idx) => idx === i ? { ...item, description: item.description.filter((_, j) => j !== di) } : item))

  const addItem = () =>
    setItems((arr) => [...arr, { title: 'New Role', company: 'Company Name', period: 'Jan 2025 - Present', type: 'work', description: [''], country: '', state: '', city: '' }])

  const removeItem = (i: number) => setItems((arr) => arr.filter((_, idx) => idx !== i))

  return (
    <SectionCard title="Work Experience" icon={Briefcase}>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Experience #{i + 1}</span>
              <button onClick={() => removeItem(i)} className="text-slate-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Job Title</Label>
                <Input value={item.title} onChange={(e) => update(i, 'title', e.target.value)} />
              </div>
              <div>
                <Label>Company</Label>
                <Input value={item.company} onChange={(e) => update(i, 'company', e.target.value)} />
              </div>
              <div>
                <Label>Period</Label>
                <Input value={item.period} onChange={(e) => update(i, 'period', e.target.value)} placeholder="Jan 2024 - Present" />
              </div>
            </div>
            <div>
              <Label>Place</Label>
              <LocationPicker
                country={(item as any).country || ''}
                state={(item as any).state || ''}
                city={(item as any).city || ''}
                onChange={(field, val) => update(i, field, val)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Responsibilities / Achievements</Label>
                <button onClick={() => addDesc(i)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              {item.description.map((desc, di) => (
                <div key={di} className="flex gap-2 mb-2">
                  <Textarea rows={2} value={desc} onChange={(e) => updateDesc(i, di, e.target.value)} placeholder="Describe what you did..." />
                  <button onClick={() => removeDesc(i, di)} className="p-2 text-slate-600 hover:text-red-400 transition-colors self-start mt-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={addItem}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-600 hover:border-blue-500/50 rounded-xl text-sm text-slate-400 hover:text-blue-400 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
      </div>
      <SaveButton onClick={() => onSave(items)} />
    </SectionCard>
  )
}

// ─── Education Section ────────────────────────────────────────────────────────
function EducationSection({ data, onSave }: { data: PortfolioData['education']; onSave: (d: PortfolioData['education']) => void }) {
  const [items, setItems] = useState(data)

  const update = (i: number, key: string, val: string) =>
    setItems((arr) => arr.map((item, idx) => idx === i ? { ...item, [key]: val } : item))

  const updateAch = (i: number, ai: number, val: string) =>
    setItems((arr) => arr.map((item, idx) => idx === i ? { ...item, achievements: item.achievements.map((a, j) => j === ai ? val : a) } : item))

  const addAch = (i: number) =>
    setItems((arr) => arr.map((item, idx) => idx === i ? { ...item, achievements: [...item.achievements, ''] } : item))

  const removeAch = (i: number, ai: number) =>
    setItems((arr) => arr.map((item, idx) => idx === i ? { ...item, achievements: item.achievements.filter((_, j) => j !== ai) } : item))

  const addItem = () =>
    setItems((arr) => [...arr, { title: 'Degree / Course', institution: 'Institution', period: '2024', type: 'education', description: 'Field of study', achievements: [''], country: '', state: '', city: '' }])

  const removeItem = (i: number) => setItems((arr) => arr.filter((_, idx) => idx !== i))

  return (
    <SectionCard title="Education" icon={GraduationCap}>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Education #{i + 1}</span>
              <button onClick={() => removeItem(i)} className="text-slate-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Degree / Course Title</Label>
                <Input value={item.title} onChange={(e) => update(i, 'title', e.target.value)} />
              </div>
              <div>
                <Label>Institution</Label>
                <Input value={item.institution} onChange={(e) => update(i, 'institution', e.target.value)} />
              </div>
              <div>
                <Label>Period</Label>
                <Input value={item.period} onChange={(e) => update(i, 'period', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Description / Field</Label>
                <Input value={item.description} onChange={(e) => update(i, 'description', e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Place</Label>
              <LocationPicker
                country={(item as any).country || ''}
                state={(item as any).state || ''}
                city={(item as any).city || ''}
                onChange={(field, val) => update(i, field, val)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Achievements / Highlights</Label>
                <button onClick={() => addAch(i)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              {item.achievements.map((ach, ai) => (
                <div key={ai} className="flex gap-2 mb-2">
                  <Input value={ach} onChange={(e) => updateAch(i, ai, e.target.value)} placeholder="Achievement..." />
                  <button onClick={() => removeAch(i, ai)} className="p-2 text-slate-600 hover:text-red-400 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        <button
          onClick={addItem}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-600 hover:border-blue-500/50 rounded-xl text-sm text-slate-400 hover:text-blue-400 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Education
        </button>
      </div>
      <SaveButton onClick={() => onSave(items)} />
    </SectionCard>
  )
}

// ─── Projects Section ─────────────────────────────────────────────────────────
const gradients = [
  'from-blue-600 to-cyan-500',
  'from-orange-600 to-red-500',
  'from-green-600 to-teal-500',
  'from-indigo-600 to-blue-500',
  'from-purple-600 to-pink-500',
  'from-yellow-600 to-orange-500',
]

function ProjectsSection({ data, onSave }: { data: PortfolioData['projects']; onSave: (d: PortfolioData['projects']) => void }) {
  const [items, setItems] = useState(data)

  const update = (i: number, key: string, val: string) =>
    setItems((arr) => arr.map((p, idx) => idx === i ? { ...p, [key]: val } : p))

  const updateTech = (i: number, ti: number, val: string) =>
    setItems((arr) => arr.map((p, idx) => idx === i ? { ...p, tech: p.tech.map((t, j) => j === ti ? val : t) } : p))

  const addTech = (i: number) =>
    setItems((arr) => arr.map((p, idx) => idx === i ? { ...p, tech: [...p.tech, ''] } : p))

  const removeTech = (i: number, ti: number) =>
    setItems((arr) => arr.map((p, idx) => idx === i ? { ...p, tech: p.tech.filter((_, j) => j !== ti) } : p))

  const addProject = () =>
    setItems((arr) => [...arr, { title: 'New Project', description: 'Project description', tech: ['React'], github: '#', live: '#', image: 'from-blue-600 to-cyan-500' }])

  const removeProject = (i: number) => setItems((arr) => arr.filter((_, idx) => idx !== i))

  return (
    <SectionCard title="Projects" icon={FolderGit2}>
      <div className="space-y-5">
        {items.map((project, i) => (
          <div key={i} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${project.image} flex-shrink-0`} />
              <button onClick={() => removeProject(i)} className="text-slate-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label>Project Title</Label>
                <Input value={project.title} onChange={(e) => update(i, 'title', e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea rows={2} value={project.description} onChange={(e) => update(i, 'description', e.target.value)} />
              </div>
              <div>
                <Label>GitHub URL</Label>
                <Input value={project.github} onChange={(e) => update(i, 'github', e.target.value)} placeholder="https://github.com/..." />
              </div>
              <div>
                <Label>Live URL</Label>
                <Input value={project.live} onChange={(e) => update(i, 'live', e.target.value)} placeholder="https://..." />
              </div>
            </div>

            <div>
              <Label>Card Gradient Color</Label>
              <div className="flex gap-2 flex-wrap mt-1">
                {gradients.map((g) => (
                  <button
                    key={g}
                    onClick={() => update(i, 'image', g)}
                    title={g}
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} ${project.image === g ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''} transition-all hover:scale-110`}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Technologies</Label>
                <button onClick={() => addTech(i)} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tech.map((t, ti) => (
                  <div key={ti} className="flex items-center gap-1 bg-slate-700/60 rounded-lg overflow-hidden">
                    <input
                      value={t}
                      onChange={(e) => updateTech(i, ti, e.target.value)}
                      className="bg-transparent text-xs text-white px-2 py-1.5 w-24 focus:outline-none"
                    />
                    <button onClick={() => removeTech(i, ti)} className="pr-2 text-slate-500 hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addProject}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-slate-600 hover:border-blue-500/50 rounded-xl text-sm text-slate-400 hover:text-blue-400 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>
      <SaveButton onClick={() => onSave(items)} />
    </SectionCard>
  )
}

// ─── Save Button ──────────────────────────────────────────────────────────────
function SaveButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-6 flex justify-end">
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
      >
        <Save className="w-4 h-4" />
        Save Changes
      </button>
    </div>
  )
}

// ─── Settings Section ─────────────────────────────────────────────────────────

type ChangeMode = 'username' | 'password' | 'email'

interface SettingsForm {
  mode: ChangeMode
  newUsername: string
  newPassword: string
  confirmPassword: string
  newEmail: string
  adminEmail: string   // where to send OTP
  otp: string
}

type OtpStep = 'idle' | 'sending' | 'sent' | 'verifying' | 'done'

const modeConfig: Record<ChangeMode, { label: string; icon: React.ComponentType<{ className?: string }>; desc: string }> = {
  username: { label: 'Change Username', icon: User,     desc: 'Update your admin login username.' },
  password: { label: 'Change Password', icon: KeyRound, desc: 'Update your admin login password.' },
  email:    { label: 'Change Admin Email', icon: AtSign, desc: 'Update the email where OTP codes are sent.' },
}

// ─── Site Icon Section ────────────────────────────────────────────────────────
function SiteIconSection({ addToast }: { addToast: (msg: string, type?: Toast['type']) => void }) {
  const [iconUrl, setIconUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/favicon', { cache: 'no-store' })
      .then(r => { if (r.redirected) setIconUrl(r.url); else setIconUrl(r.url) })
      .catch(() => {})
  }, [])

  const handleIconUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file (PNG, JPG, SVG, ICO)')
      return
    }
    setUploading(true)
    setUploadError(null)
    try {
      // Upload to Vercel Blob via media route
      const id = `favicon_${Date.now().toString(36)}`
      const formData = new FormData()
      formData.append('id', id)
      formData.append('file', file)
      const res = await fetch('/api/journey/media', { method: 'POST', body: formData })
      if (!res.ok) throw new Error(await res.text())
      const { url } = await res.json()
      // Save favicon URL to DB
      await fetch('/api/favicon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      setIconUrl(url)
      addToast('Site icon updated! Refresh the page to see it.', 'success')
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700/40 bg-slate-800/30">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
          <ImageIcon className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-semibold text-white">Site Icon / Favicon</h2>
      </div>
      <div className="p-6 flex items-center gap-6">
        <div className="w-16 h-16 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
          {iconUrl ? (
            <img src={iconUrl} alt="Site icon" className="w-full h-full object-contain p-1" />
          ) : (
            <ImageIcon className="w-8 h-8 text-slate-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-300 mb-1">Upload your site icon/favicon</p>
          <p className="text-xs text-slate-500 mb-3">PNG, JPG, SVG, ICO — Recommended: 32×32 or 64×64 px</p>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleIconUpload(e.target.files[0])} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all">
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />Uploading…</> : <><Upload className="w-4 h-4" />Choose Icon</>}
          </button>
          {uploadError && (
            <p className="text-xs text-red-400 mt-2">⚠ {uploadError}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SettingsSection({ addToast }: { addToast: (msg: string, type?: Toast['type']) => void }) {
  const [mode, setMode] = useState<ChangeMode>('password')
  const [form, setForm] = useState<SettingsForm>({
    mode: 'password',
    newUsername: '',
    newPassword: '',
    confirmPassword: '',
    newEmail: '',
    adminEmail: '',
    otp: '',
  })
  const [otpStep, setOtpStep] = useState<OtpStep>('idle')
  const [otpError, setOtpError] = useState('')
  const [countdown, setCountdown] = useState(0)

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const set = (k: keyof SettingsForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setOtpError('')
  }

  const validate = (): string => {
    if (!form.adminEmail) return 'Enter the admin email to receive the OTP.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) return 'Enter a valid email address.'
    if (mode === 'username' && form.newUsername.trim().length < 3)
      return 'New username must be at least 3 characters.'
    if (mode === 'password') {
      if (form.newPassword.length < 8) return 'Password must be at least 8 characters.'
      if (form.newPassword !== form.confirmPassword) return 'Passwords do not match.'
    }
    if (mode === 'email') {
      if (!form.newEmail) return 'New email address is required.'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.newEmail)) return 'Enter a valid new email.'
    }
    return ''
  }

  const handleSendOtp = async () => {
    const err = validate()
    if (err) { setOtpError(err); return }

    setOtpStep('sending')
    setOtpError('')

    try {
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.adminEmail }),
      })
      const data = await res.json()
      if (data.success) {
        setOtpStep('sent')
        setCountdown(60)
        addToast('OTP sent! Check your inbox.', 'success')
      } else {
        setOtpError(data.message || 'Failed to send OTP.')
        setOtpStep('idle')
      }
    } catch {
      setOtpError('Network error. Please try again.')
      setOtpStep('idle')
    }
  }

  const handleUpdate = async () => {
    if (!form.otp.trim()) { setOtpError('Please enter the OTP from your email.'); return }
    setOtpStep('verifying')
    setOtpError('')

    try {
      const payload: Record<string, string> = { otp: form.otp.trim() }
      if (mode === 'username') payload.newUsername = form.newUsername.trim()
      if (mode === 'password') { payload.newPassword = form.newPassword; payload.confirmPassword = form.confirmPassword }
      if (mode === 'email')    payload.newEmail = form.newEmail.trim()

      const res = await fetch('/api/admin/update-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (data.success) {
        setOtpStep('done')
        addToast(data.message, 'success')
        // Reset form
        setForm({ mode: 'password', newUsername: '', newPassword: '', confirmPassword: '', newEmail: '', adminEmail: '', otp: '' })
        setTimeout(() => setOtpStep('idle'), 3000)
      } else {
        setOtpError(data.message || 'Verification failed.')
        setOtpStep('sent')
      }
    } catch {
      setOtpError('Network error. Please try again.')
      setOtpStep('sent')
    }
  }

  const reset = () => {
    setOtpStep('idle')
    setOtpError('')
    setForm((f) => ({ ...f, otp: '' }))
    setCountdown(0)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Account Settings</h2>
        <p className="text-slate-400 text-sm">Change your admin credentials. An OTP will be sent to your email for verification.</p>
      </div>

      {/* Mode picker */}
      <div className="grid grid-cols-3 gap-3">
        {(Object.keys(modeConfig) as ChangeMode[]).map((m) => {
          const cfg = modeConfig[m]
          const Icon = cfg.icon
          const active = mode === m
          return (
            <button
              key={m}
              onClick={() => { setMode(m); reset() }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-sm font-medium transition-all ${
                active
                  ? 'bg-gradient-to-br from-blue-600/20 to-cyan-500/10 border-blue-500/30 text-blue-300'
                  : 'bg-slate-900/60 border-slate-700/40 text-slate-400 hover:text-white hover:border-slate-600/60'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'text-blue-400' : ''}`} />
              <span className="text-center leading-tight">{cfg.label}</span>
            </button>
          )
        })}
      </div>

      {/* Form card */}
      <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700/40 bg-slate-800/30">
          {(() => { const Icon = modeConfig[mode].icon; return <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500"><Icon className="w-4 h-4 text-white" /></div> })()}
          <div>
            <h3 className="font-semibold text-white text-sm">{modeConfig[mode].label}</h3>
            <p className="text-xs text-slate-500">{modeConfig[mode].desc}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Step 1 — new value fields */}
          {otpStep === 'idle' || otpStep === 'sending' ? (
            <div className="space-y-4">
              {mode === 'username' && (
                <div>
                  <Label>New Username</Label>
                  <Input
                    value={form.newUsername}
                    onChange={(e) => set('newUsername', e.target.value)}
                    placeholder="Minimum 3 characters"
                  />
                </div>
              )}

              {mode === 'password' && (
                <>
                  <div>
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={form.newPassword}
                      onChange={(e) => set('newPassword', e.target.value)}
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                  <div>
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => set('confirmPassword', e.target.value)}
                      placeholder="Re-enter your new password"
                    />
                  </div>
                </>
              )}

              {mode === 'email' && (
                <div>
                  <Label>New Admin Email</Label>
                  <Input
                    type="email"
                    value={form.newEmail}
                    onChange={(e) => set('newEmail', e.target.value)}
                    placeholder="new-admin@example.com"
                  />
                </div>
              )}

              {/* OTP destination email */}
              <div>
                <Label>Send OTP to Email</Label>
                <Input
                  type="email"
                  value={form.adminEmail}
                  onChange={(e) => set('adminEmail', e.target.value)}
                  placeholder="your-admin-email@example.com"
                />
                <p className="text-xs text-slate-500 mt-1.5">Must match the email registered in your <span className="font-mono text-slate-400">ADMIN_EMAIL</span> env var (or leave blank if none is set).</p>
              </div>

              {otpError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {otpError}
                </div>
              )}

              <button
                onClick={handleSendOtp}
                disabled={otpStep === 'sending'}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
              >
                {otpStep === 'sending' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP…</>
                ) : (
                  <><SendHorizonal className="w-4 h-4" /> Send OTP to Email</>
                )}
              </button>
            </div>
          ) : otpStep === 'done' ? (
            <div className="flex flex-col items-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-white">Credentials Updated!</p>
                <p className="text-sm text-slate-400 mt-1">Your changes have been saved successfully.</p>
              </div>
            </div>
          ) : (
            /* Step 2 — OTP verification */
            <div className="space-y-4">
              <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
                <div className="flex gap-3">
                  <SendHorizonal className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400">
                    A 6-digit OTP was sent to <strong className="text-white">{form.adminEmail}</strong>. Enter it below within 10 minutes.
                  </p>
                </div>
              </div>

              <div>
                <Label>Enter OTP</Label>
                <Input
                  value={form.otp}
                  onChange={(e) => set('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  maxLength={6}
                  className="text-center text-2xl font-mono tracking-[0.5em] py-4"
                />
              </div>

              {otpError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {otpError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleUpdate}
                  disabled={otpStep === 'verifying' || form.otp.length < 6}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                >
                  {otpStep === 'verifying' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Verify & Update</>
                  )}
                </button>

                <button
                  onClick={handleSendOtp}
                  disabled={countdown > 0 || otpStep === 'verifying'}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  {countdown > 0 ? `Resend (${countdown}s)` : 'Resend OTP'}
                </button>
              </div>

              <button
                onClick={reset}
                className="w-full text-xs text-slate-500 hover:text-slate-400 transition-colors pt-1"
              >
                ← Go back and change values
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Site Icon Upload */}
      <SiteIconSection addToast={addToast} />

      {/* SMTP setup notice */}
      <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-5">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300 mb-2">Email (SMTP) Setup Required</p>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Add these to your <span className="font-mono text-slate-300">.env.local</span> file to enable OTP emails:
            </p>
            <pre className="text-xs bg-slate-900/60 border border-slate-700/40 rounded-lg p-3 text-slate-300 overflow-x-auto">{`SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password   # Gmail App Password
ADMIN_EMAIL=your-gmail@gmail.com`}</pre>
            <p className="text-xs text-slate-500 mt-2">
              For Gmail: enable 2FA → generate an <strong className="text-slate-400">App Password</strong> at myaccount.google.com/apppasswords
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
// JOURNEY SECTION — Blogs + Certificates admin panel
// ══════════════════════════════════════════════════════════════════════════════

function JourneySection({ addToast }: { addToast: (msg: string, type?: Toast['type']) => void }) {
  const [tab, setTab] = useState<'profile' | 'blogs' | 'certificates'>('profile')
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [certs, setCerts] = useState<Certificate[]>([])

  const refresh = async () => {
    const [b, c] = await Promise.all([getBlogs(), getCertificates()])
    setBlogs(b)
    setCerts(c)
  }

  useEffect(() => {
    refresh()
    window.addEventListener('journey-data-updated', refresh)
    return () => window.removeEventListener('journey-data-updated', refresh)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Journey Manager</h2>
          <p className="text-slate-400 text-sm mt-1">Manage your journey profile, blog posts, and certificates.</p>
        </div>
        <a href="/journey" target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-slate-300 hover:text-white transition-all">
          <Eye className="w-4 h-4" />
          Preview
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setTab('profile')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'profile' ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}>
          <UserCircle className="w-4 h-4" />
          Journey Profile
        </button>
        <button onClick={() => setTab('blogs')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'blogs' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}>
          <ImageIcon className="w-4 h-4" />
          Blogs ({blogs.length})
        </button>
        <button onClick={() => setTab('certificates')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'certificates' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'}`}>
          <Award className="w-4 h-4" />
          Certificates ({certs.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'profile' ? (
          <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <JourneyProfileAdmin addToast={addToast} />
          </motion.div>
        ) : tab === 'blogs' ? (
          <motion.div key="blogs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <BlogsAdmin blogs={blogs} addToast={addToast} onRefresh={refresh} />
          </motion.div>
        ) : (
          <motion.div key="certs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <CertsAdmin certs={certs} addToast={addToast} onRefresh={refresh} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Journey Profile Admin ─────────────────────────────────────────────────────

function JourneyProfileAdmin({ addToast }: { addToast: (msg: string, type?: Toast['type']) => void }) {
  const [profile, setProfile] = useState<JourneyProfile>({
    bio: '', name: '', tagline: '', mainProfileUrl: '', journeyProfileUrl: '',
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const mainPhotoRef = useRef<HTMLInputElement>(null)
  const journeyPhotoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getJourneyProfile().then(p => { setProfile(p); setLoading(false) })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await saveJourneyProfile(profile)
    setSaving(false)
    addToast('Journey profile updated!')
  }

  const handlePhotoUpload = async (file: File, field: 'mainProfileUrl' | 'journeyProfileUrl') => {
    addToast('Uploading photo...')
    const formData = new FormData()
    formData.append('id', `profile_${field}_${Date.now()}`)
    formData.append('file', file)
    const res = await fetch('/api/journey/media', { method: 'POST', body: formData })
    if (!res.ok) { addToast('Photo upload failed', 'error'); return }
    const json = await res.json()
    setProfile(p => ({ ...p, [field]: json.url }))
    addToast('Photo uploaded! Click Save to apply.')
  }

  if (loading) return (
    <div className="py-12 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Photo uploads side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main (Professional) Profile Photo */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
              <UserCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Main Dashboard Photo</p>
              <p className="text-slate-500 text-xs">Professional / formal photo</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
              {profile.mainProfileUrl ? (
                <img src={profile.mainProfileUrl} alt="Main profile" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-10 h-10 text-slate-600" />
              )}
            </div>
            <input ref={mainPhotoRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, 'mainProfileUrl') }} />
            <button onClick={() => mainPhotoRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-300 hover:text-white transition-all">
              <Camera className="w-3.5 h-3.5" />
              {profile.mainProfileUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
            {profile.mainProfileUrl && (
              <button onClick={() => setProfile(p => ({ ...p, mainProfileUrl: '' }))}
                className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
            )}
          </div>
        </div>

        {/* Journey (Adventure) Profile Photo */}
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-rose-600 to-orange-500">
              <Compass className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Journey Dashboard Photo</p>
              <p className="text-slate-500 text-xs">Adventure / explorer photo</p>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
              {profile.journeyProfileUrl ? (
                <img src={profile.journeyProfileUrl} alt="Journey profile" className="w-full h-full object-cover" />
              ) : (
                <Compass className="w-10 h-10 text-slate-600" />
              )}
            </div>
            <input ref={journeyPhotoRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f, 'journeyProfileUrl') }} />
            <button onClick={() => journeyPhotoRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-300 hover:text-white transition-all">
              <Camera className="w-3.5 h-3.5" />
              {profile.journeyProfileUrl ? 'Change Photo' : 'Upload Photo'}
            </button>
            {profile.journeyProfileUrl && (
              <button onClick={() => setProfile(p => ({ ...p, journeyProfileUrl: '' }))}
                className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
            )}
          </div>
        </div>
      </div>

      {/* Bio fields */}
      <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Pencil className="w-4 h-4 text-slate-400" />
          Journey Bio
        </h3>
        <div>
          <Label>Display Name</Label>
          <Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
            placeholder="Abhishek Singh" />
        </div>
        <div>
          <Label>Tagline (shown under name)</Label>
          <Input value={profile.tagline} onChange={e => setProfile(p => ({ ...p, tagline: e.target.value }))}
            placeholder="Capturing moments, building memories ✨" />
        </div>
        <div>
          <Label>Bio Description</Label>
          <Textarea rows={3} value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
            placeholder="DevOps Engineer · Full Stack Developer · Explorer..." />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl font-medium text-sm transition-all disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? 'Saving…' : 'Save Journey Profile'}
      </button>
    </div>
  )
}


// ─── Blogs Admin ──────────────────────────────────────────────────────────────

function BlogsAdmin({ blogs, addToast, onRefresh }: {
  blogs: BlogPost[]
  addToast: (msg: string, type?: Toast['type']) => void
  onRefresh: () => void
}) {
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [creating, setCreating] = useState(false)

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    await deleteBlog(post.id)
    addToast('Blog post deleted.')
    onRefresh()
  }

  if (editing) return (
    <BlogEditor
      post={editing}
      onSave={async (p) => { await saveBlog(p); setEditing(null); addToast('Blog post saved!'); onRefresh() }}
      onCancel={() => setEditing(null)}
    />
  )

  if (creating) return (
    <BlogEditor
      post={null}
      onSave={async (p) => { await saveBlog(p); setCreating(false); addToast('Blog post created!'); onRefresh() }}
      onCancel={() => setCreating(false)}
    />
  )

  return (
    <div className="space-y-4">
      <button onClick={() => setCreating(true)}
        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-600 hover:border-rose-500/50 rounded-2xl text-slate-400 hover:text-rose-400 text-sm font-medium transition-all">
        <Plus className="w-5 h-5" />
        Create New Blog Post
      </button>

      {blogs.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <ImageIcon className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No blog posts yet. Create your first memory!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blogs.map(post => (
            <div key={post.id} className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
                {post.coverMediaId ? (
                  <MediaPreviewThumb mediaId={post.coverMediaId} isVideo={post.coverMediaId.includes('_v_')} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-slate-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">{post.title}</p>
                <p className="text-slate-400 text-xs mt-0.5 truncate">{post.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  {post.location && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3 h-3" />{post.location}
                    </span>
                  )}
                  <span className="text-xs text-slate-500">{post.mediaIds.length} media</span>
                  {post.audioId && <span className="flex items-center gap-1 text-xs text-slate-500"><Music className="w-3 h-3" />audio</span>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setEditing(post)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white transition-all">
                  Edit
                </button>
                <button onClick={() => handleDelete(post)}
                  className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs text-red-400 hover:text-red-300 transition-all">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Media preview thumbnail (admin) ─────────────────────────────────────────

function MediaPreviewThumb({ mediaId, isVideo }: { mediaId: string; isVideo: boolean }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    getMediaUrl(mediaId).then(u => setUrl(u))
  }, [mediaId])

  if (!url) return <div className="w-full h-full bg-slate-800 animate-pulse" />
  if (isVideo) return <video src={url} className="w-full h-full object-cover" muted playsInline preload="metadata" />
  return <img src={url} alt="" className="w-full h-full object-cover" />
}

// ─── Blog Editor ──────────────────────────────────────────────────────────────

function BlogEditor({ post, onSave, onCancel }: {
  post: BlogPost | null
  onSave: (p: BlogPost) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<BlogPost>(post ?? {
    id: generateId(),
    title: '',
    description: '',
    location: '',
    experience: '',
    date: new Date().toISOString().split('T')[0],
    tags: [],
    mediaIds: [],
    coverMediaId: '',
    audioId: undefined,
    audioName: undefined,
    createdAt: Date.now(),
  })
  const [tagInput, setTagInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [mediaList, setMediaList] = useState<Array<{ id: string; name: string; type: 'image' | 'video'; size: number }>>([])
  const [audioInfo, setAudioInfo] = useState<{ name: string } | null>(post?.audioName ? { name: post.audioName } : null)
  const [saving, setSaving] = useState(false)
  const mediaRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLInputElement>(null)

  const setField = (k: keyof BlogPost, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '')
    if (t && !form.tags.includes(t)) setField('tags', [...form.tags, t])
    setTagInput('')
  }

  const removeTag = (t: string) => setField('tags', form.tags.filter(x => x !== t))

  const handleMediaUpload = async (files: FileList) => {
    setUploading(true)
    setUploadError(null)
    const newIds: string[] = []
    try {
      for (const file of Array.from(files)) {
        const isVideo = file.type.startsWith('video/')
        const localId = `${isVideo ? 'blog_v' : 'blog_i'}_${generateId()}`
        // saveMedia now returns the permanent Vercel Blob URL — use it as the ID
        const blobUrl = await saveMedia(localId, file)
        newIds.push(blobUrl)
        setMediaList(prev => [...prev, { id: blobUrl, name: file.name, type: isVideo ? 'video' : 'image', size: file.size }])
      }
      const updatedIds = [...form.mediaIds, ...newIds]
      setField('mediaIds', updatedIds)
      if (!form.coverMediaId && updatedIds.length > 0) setField('coverMediaId', updatedIds[0])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setUploadError(msg.includes('BLOB_READ_WRITE_TOKEN') || msg.includes('not configured')
        ? 'Media storage is not configured. Add BLOB_READ_WRITE_TOKEN to your environment variables.'
        : `Upload failed: ${msg}`)
    } finally {
      setUploading(false)
    }
  }

  const removeMedia = (id: string) => {
    const updated = form.mediaIds.filter(x => x !== id)
    setField('mediaIds', updated)
    setMediaList(prev => prev.filter(m => m.id !== id))
    if (form.coverMediaId === id) setField('coverMediaId', updated[0] ?? '')
  }

  const handleAudioUpload = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    try {
      const localId = `blog_a_${generateId()}`
      const blobUrl = await saveMedia(localId, file)
      setField('audioId', blobUrl)
      setField('audioName', file.name)
      setAudioInfo({ name: file.name })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setUploadError(msg.includes('BLOB_READ_WRITE_TOKEN') || msg.includes('not configured')
        ? 'Media storage is not configured. Add BLOB_READ_WRITE_TOKEN to your environment variables.'
        : `Upload failed: ${msg}`)
    } finally {
      setUploading(false)
    }
  }

  const removeAudio = () => {
    setField('audioId', undefined)
    setField('audioName', undefined)
    setAudioInfo(null)
  }

  const handleSave = async () => {
    if (!form.title.trim()) { alert('Title is required'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    onSave(form)
    setSaving(false)
  }

  return (
    <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700/40 bg-slate-800/30">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-rose-600 to-orange-500">
          <ImageIcon className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-semibold text-white">{post ? 'Edit Blog Post' : 'New Blog Post'}</h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Title *</Label>
            <Input value={form.title} onChange={e => setField('title', e.target.value)} placeholder="My amazing adventure in..." />
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" value={form.date} onChange={e => setField('date', e.target.value)} />
          </div>
          <div>
            <Label>Location</Label>
            <Input value={form.location} onChange={e => setField('location', e.target.value)} placeholder="New Delhi, India" />
          </div>
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTag()}
                placeholder="#travel #learning" className="flex-1" />
              <button onClick={addTag} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map(t => (
                  <span key={t} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-rose-500/15 text-rose-300 rounded-full border border-rose-500/20">
                    #{t}
                    <button onClick={() => removeTag(t)} className="hover:text-red-300"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <Label>Description</Label>
          <Textarea rows={3} value={form.description} onChange={e => setField('description', e.target.value)}
            placeholder="Share the story of this moment..." />
        </div>

        <div>
          <Label>What I Experienced / Learned</Label>
          <Textarea rows={3} value={form.experience} onChange={e => setField('experience', e.target.value)}
            placeholder="What did this experience teach me? How did it make me feel? What memories did it create?" />
        </div>

        {/* Media upload */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label>Photos & Videos</Label>
            <span className="text-xs text-slate-500">{form.mediaIds.length} file{form.mediaIds.length !== 1 ? 's' : ''} · Supports HD images, 4K videos</span>
          </div>

          <input
            ref={mediaRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={e => e.target.files && handleMediaUpload(e.target.files)}
          />

          <button onClick={() => mediaRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center gap-3 py-8 border-2 border-dashed border-slate-600 hover:border-rose-500/50 rounded-xl text-slate-400 hover:text-rose-400 transition-all disabled:opacity-50">
            {uploading ? (
              <><Loader2 className="w-8 h-8 animate-spin" /><span className="text-sm">Uploading…</span></>
            ) : (
              <>
                <Upload className="w-8 h-8" />
                <div className="text-sm text-center">
                  <p className="font-medium">Click to upload photos & videos</p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP, MP4, MOV, MKV — Any size</p>
                </div>
              </>
            )}
          </button>

          {/* Upload error message */}
          {uploadError && (
            <div className="mt-2 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <span className="text-red-400 mt-0.5 flex-shrink-0">⚠</span>
              <div className="text-xs text-red-300 leading-relaxed">
                <p className="font-semibold mb-0.5">Upload failed</p>
                <p>{uploadError}</p>
                {uploadError.includes('BLOB_READ_WRITE_TOKEN') && (
                  <p className="mt-1 text-red-400/80">
                    Go to <strong>Vercel Dashboard → Storage → Blob</strong>, create a store, then copy the token into your <code className="bg-red-500/20 px-1 rounded">.env.local</code> and Vercel environment variables.
                  </p>
                )}
              </div>
              <button onClick={() => setUploadError(null)} className="ml-auto text-red-400/60 hover:text-red-400 flex-shrink-0">✕</button>
            </div>
          )}

          {/* Media list */}
          {form.mediaIds.length > 0 && (
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {form.mediaIds.map((id, idx) => (
                <div key={id} className={`relative group rounded-xl overflow-hidden aspect-square ${form.coverMediaId === id ? 'ring-2 ring-rose-500' : ''}`}>
                  <MediaPreviewThumb mediaId={id} isVideo={isVideoId(id)} />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5">
                    {form.coverMediaId !== id && (
                      <button onClick={() => setField('coverMediaId', id)}
                        className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-full text-white transition-colors">
                        Cover
                      </button>
                    )}
                    <button onClick={() => removeMedia(id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {form.coverMediaId === id && (
                    <div className="absolute top-1 left-1 text-xs bg-rose-500 text-white px-1.5 py-0.5 rounded-full">Cover</div>
                  )}
                  {isVideoId(id) && (
                    <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                      <Film className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audio upload */}
        <div>
          <Label>Background Music (optional)</Label>
          <input ref={audioRef} type="file" accept="audio/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleAudioUpload(e.target.files[0])} />

          {audioInfo ? (
            <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/40 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-rose-500/15 flex items-center justify-center">
                <Music className="w-4 h-4 text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{audioInfo.name}</p>
                <p className="text-xs text-slate-500">Will play as background music on this post</p>
              </div>
              <button onClick={removeAudio} className="text-slate-500 hover:text-red-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => audioRef.current?.click()}
              className="w-full flex items-center justify-center gap-3 py-4 border border-dashed border-slate-700 hover:border-rose-500/40 rounded-xl text-slate-400 hover:text-rose-400 text-sm transition-all">
              <Music className="w-5 h-5" />
              <span>Add background music — MP3, WAV, AAC, M4A</span>
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg transition-all">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Post</>}
          </button>
          <button onClick={onCancel}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Certificates Admin ────────────────────────────────────────────────────────

function CertsAdmin({ certs, addToast, onRefresh }: {
  certs: Certificate[]
  addToast: (msg: string, type?: Toast['type']) => void
  onRefresh: () => void
}) {
  const [editing, setEditing] = useState<Certificate | null>(null)
  const [creating, setCreating] = useState(false)

  const handleDelete = async (cert: Certificate) => {
    if (!confirm(`Delete "${cert.title}"?`)) return
    await deleteCertificate(cert.id)
    addToast('Certificate deleted.')
    onRefresh()
  }

  if (editing) return (
    <CertEditor
      cert={editing}
      onSave={async (c) => { await saveCertificate(c); setEditing(null); addToast('Certificate saved!'); onRefresh() }}
      onCancel={() => setEditing(null)}
    />
  )

  if (creating) return (
    <CertEditor
      cert={null}
      onSave={async (c) => { await saveCertificate(c); setCreating(false); addToast('Certificate uploaded!'); onRefresh() }}
      onCancel={() => setCreating(false)}
    />
  )

  return (
    <div className="space-y-4">
      <button onClick={() => setCreating(true)}
        className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-600 hover:border-blue-500/50 rounded-2xl text-slate-400 hover:text-blue-400 text-sm font-medium transition-all">
        <Plus className="w-5 h-5" />
        Upload New Certificate
      </button>

      {certs.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          <Award className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No certificates yet. Upload your achievements!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {certs.map(cert => (
            <div key={cert.id} className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4 flex gap-4">
              <div className="w-16 h-20 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                {cert.fileType === 'image' ? (
                  <MediaPreviewThumb mediaId={cert.mediaId} isVideo={false} />
                ) : (
                  <FileText className="w-7 h-7 text-slate-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm line-clamp-2">{cert.title}</p>
                <p className="text-slate-400 text-xs mt-0.5">{cert.issuer}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 bg-blue-500/15 text-blue-300 rounded-full border border-blue-500/20">{cert.category || 'Certificate'}</span>
                  <span className="text-xs text-slate-500">{cert.date}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setEditing(cert)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white transition-all">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(cert)}
                    className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs text-red-400 hover:text-red-300 transition-all">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Certificate Editor ────────────────────────────────────────────────────────

const CERT_CATEGORIES = ['Web Dev', 'Cloud', 'AI/ML', 'DevOps', 'Data Science', 'Cybersecurity', 'Mobile Dev', 'Other']

function CertEditor({ cert, onSave, onCancel }: {
  cert: Certificate | null
  onSave: (c: Certificate) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Certificate>(cert ?? {
    id: generateId(),
    title: '',
    issuer: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    category: 'Web Dev',
    mediaId: '',
    fileType: 'image',
    fileName: '',
    createdAt: Date.now(),
  })
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(
    cert?.fileName ? { name: cert.fileName, size: 0, type: cert.fileType } : null
  )
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const setField = (k: keyof Certificate, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const handleFile = async (file: File) => {
    setUploading(true)
    setUploadError(null)
    try {
      const isPdf = file.type === 'application/pdf'
      const localId = `cert_${isPdf ? 'pdf' : 'img'}_${generateId()}`
      // saveMedia returns the permanent Vercel Blob URL
      const blobUrl = await saveMedia(localId, file)
      setField('mediaId', blobUrl)
      setField('fileType', isPdf ? 'pdf' : 'image')
      setField('fileName', file.name)
      setFileInfo({ name: file.name, size: file.size, type: isPdf ? 'pdf' : 'image' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setUploadError(msg.includes('BLOB_READ_WRITE_TOKEN') || msg.includes('not configured')
        ? 'Media storage is not configured. Add BLOB_READ_WRITE_TOKEN to your environment variables.'
        : `Upload failed: ${msg}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!form.title.trim()) { alert('Title is required'); return }
    if (!form.mediaId) { alert('Please upload a file'); return }
    setSaving(true)
    await new Promise(r => setTimeout(r, 300))
    onSave(form)
    setSaving(false)
  }

  return (
    <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700/40 bg-slate-800/30">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
          <Award className="w-4 h-4 text-white" />
        </div>
        <h2 className="font-semibold text-white">{cert ? 'Edit Certificate' : 'Upload Certificate'}</h2>
      </div>

      <div className="p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Certificate Title *</Label>
            <Input value={form.title} onChange={e => setField('title', e.target.value)} placeholder="AWS Certified Solutions Architect" />
          </div>
          <div>
            <Label>Issuing Organization</Label>
            <Input value={form.issuer} onChange={e => setField('issuer', e.target.value)} placeholder="Amazon Web Services" />
          </div>
          <div>
            <Label>Date Issued</Label>
            <Input type="date" value={form.date} onChange={e => setField('date', e.target.value)} />
          </div>
          <div>
            <Label>Category</Label>
            <select
              value={form.category}
              onChange={e => setField('category', e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-all"
            >
              {CERT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label>Description</Label>
            <Input value={form.description} onChange={e => setField('description', e.target.value)} placeholder="Brief description of this certificate" />
          </div>
        </div>

        {/* File upload */}
        <div>
          <Label>Certificate File (PDF or Image) *</Label>
          <input ref={fileRef} type="file" accept="application/pdf,image/*" className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

          {fileInfo ? (
            <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-700/40 rounded-xl px-4 py-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                {fileInfo.type === 'pdf' ? <FileText className="w-5 h-5 text-blue-400" /> : <ImageIcon className="w-5 h-5 text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{fileInfo.name}</p>
                <p className="text-xs text-slate-500">{fileInfo.type.toUpperCase()} · {fileInfo.size > 0 ? formatFileSize(fileInfo.size) : 'Existing file'}</p>
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-300 transition-all">
                Replace
              </button>
            </div>
          ) : (
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="w-full flex flex-col items-center gap-3 py-8 border-2 border-dashed border-slate-600 hover:border-blue-500/50 rounded-xl text-slate-400 hover:text-blue-400 transition-all disabled:opacity-50">
              {uploading ? (
                <><Loader2 className="w-8 h-8 animate-spin" /><span className="text-sm">Uploading…</span></>
              ) : (
                <>
                  <Upload className="w-8 h-8" />
                  <div className="text-sm text-center">
                    <p className="font-medium">Click to upload PDF or Image</p>
                    <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG, WEBP — High quality supported</p>
                  </div>
                </>
              )}
            </button>
          )}

          {/* Upload error message */}
          {uploadError && (
            <div className="mt-2 flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <span className="text-red-400 mt-0.5 flex-shrink-0">⚠</span>
              <div className="text-xs text-red-300 leading-relaxed">
                <p className="font-semibold mb-0.5">Upload failed</p>
                <p>{uploadError}</p>
                {uploadError.includes('BLOB_READ_WRITE_TOKEN') && (
                  <p className="mt-1 text-red-400/80">
                    Go to <strong>Vercel Dashboard → Storage → Blob</strong>, create a store, then copy the token into your <code className="bg-red-500/20 px-1 rounded">.env.local</code> and Vercel environment variables.
                  </p>
                )}
              </div>
              <button onClick={() => setUploadError(null)} className="ml-auto text-red-400/60 hover:text-red-400 flex-shrink-0">✕</button>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-lg transition-all">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Certificate</>}
          </button>
          <button onClick={onCancel}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Analytics Section ─────────────────────────────────────────────────────────

function AnalyticsSection() {
  const [summary, setSummary] = useState<any>(null)
  const [topQ, setTopQ] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [sumRes, topRes] = await Promise.all([
        fetch('/api/analytics?type=summary').then(r => r.json()),
        fetch('/api/analytics?type=top').then(r => r.json()),
      ])
      setSummary(sumRes.data)
      setTopQ(topRes.data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const intentColor: Record<string, string> = {
    hire: 'from-blue-600 to-cyan-500',
    project: 'from-purple-600 to-pink-500',
    contact: 'from-orange-600 to-red-500',
    resume: 'from-green-600 to-teal-500',
    general: 'from-slate-600 to-slate-500',
  }
  const intentLabel: Record<string, string> = {
    hire: '💼 Hiring Intent',
    project: '🚀 Project Interest',
    contact: '📬 Contact',
    resume: '📄 Resume',
    general: '💬 General',
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">AI Analytics</h2>
          <p className="text-slate-400 text-sm">Track what visitors ask your chatbot and identify high-intent leads.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-slate-300 transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Questions', value: summary?.total ?? 0, icon: MessageSquare, color: 'from-blue-600 to-cyan-500' },
          { label: 'Today', value: summary?.today ?? 0, icon: Calendar, color: 'from-green-600 to-teal-500' },
          { label: 'Hiring Intent', value: summary?.intents?.find((i: any) => i.intent === 'hire')?.count ?? 0, icon: Briefcase, color: 'from-orange-600 to-red-500' },
          { label: 'Unique Questions', value: topQ.length, icon: BarChart2, color: 'from-purple-600 to-pink-500' },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${stat.color} mb-3 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Intent breakdown */}
      {summary?.intents?.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Intent Breakdown</h3>
          <div className="space-y-3">
            {summary.intents.map((row: any) => {
              const pct = summary.total > 0 ? Math.round((parseInt(row.count) / summary.total) * 100) : 0
              const color = intentColor[row.intent] || 'from-slate-600 to-slate-500'
              return (
                <div key={row.intent} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-32 flex-shrink-0">{intentLabel[row.intent] || row.intent}</span>
                  <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-300 w-16 text-right">{row.count} ({pct}%)</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top questions */}
      <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700/40 bg-slate-800/30">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
            <BarChart2 className="w-4 h-4 text-white" />
          </div>
          <h3 className="font-semibold text-white">Top Asked Questions</h3>
        </div>
        <div className="divide-y divide-slate-700/30">
          {topQ.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No questions yet. Share your portfolio link to start collecting data!</p>
            </div>
          ) : topQ.slice(0, 30).map((q: any, i: number) => (
            <div key={i} className="flex items-start gap-4 px-6 py-3.5 hover:bg-slate-800/30 transition-colors">
              <span className="text-slate-500 text-xs font-mono w-5 mt-0.5 flex-shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 leading-relaxed">{q.question}</p>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                  q.intent === 'hire' ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                  : q.intent === 'project' ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                  : q.intent === 'contact' ? 'bg-orange-500/15 text-orange-300 border border-orange-500/20'
                  : q.intent === 'resume' ? 'bg-green-500/15 text-green-300 border border-green-500/20'
                  : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'
                }`}>
                  {intentLabel[q.intent] || q.intent}
                </span>
              </div>
              <span className="flex items-center gap-1 text-xs text-slate-400 flex-shrink-0">
                <span className="font-semibold text-white">{q.count}</span>x
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {summary?.recent?.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-700/40 bg-slate-800/30">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-600 to-teal-500">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="divide-y divide-slate-700/30">
            {summary.recent.map((r: any, i: number) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-800/30 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.intent === 'hire' ? 'bg-blue-400' : r.intent === 'project' ? 'bg-purple-400' : 'bg-slate-500'}`} />
                <p className="flex-1 text-sm text-slate-300 truncate">{r.question}</p>
                <span className="text-xs text-slate-500 flex-shrink-0">
                  {new Date(parseInt(r.created_at)).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Chatbot Setup Section ─────────────────────────────────────────────────────

function ChatbotSection({ addToast }: { addToast: (msg: string, type?: Toast['type']) => void }) {
  const [form, setForm] = useState({
    chatbot_name: '',
    whatsapp_number: '',
    calendly_url: '',
    notify_email: '',
    hire_email_enabled: 'true',
    resume_url: '/Cv.pdf',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        if (d.settings) setForm(f => ({ ...f, ...d.settings }))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) addToast('Chatbot settings saved!', 'success')
      else addToast('Save failed. Please try again.', 'error')
    } catch {
      addToast('Save failed. Please try again.', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Chatbot Setup</h2>
        <p className="text-slate-400 text-sm">Configure your AI chatbot, WhatsApp integration, Calendly booking, and lead notifications.</p>
      </div>

      {/* General */}
      <SectionCard title="General" icon={Bot}>
        <div className="space-y-4">
          <div>
            <Label>Chatbot Name</Label>
            <Input value={form.chatbot_name} onChange={e => set('chatbot_name', e.target.value)} placeholder="Abhishek's AI Assistant" />
            <p className="text-xs text-slate-500 mt-1">This name appears in the chat header and greeting message.</p>
          </div>
        </div>
      </SectionCard>

      {/* WhatsApp */}
      <SectionCard title="WhatsApp Integration" icon={Phone}>
        <div className="space-y-4">
          <div>
            <Label>WhatsApp Number</Label>
            <Input value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} placeholder="+91 98765 43210" />
            <p className="text-xs text-slate-500 mt-1">Include country code (e.g. +91...). A WhatsApp button will appear in the chatbot and high-intent responses.</p>
          </div>
          {form.whatsapp_number && (
            <div className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-green-300 font-medium">WhatsApp button active</p>
                <a href={`https://wa.me/${form.whatsapp_number.replace(/\D/g,'')}?text=Hello!`} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-green-400/70 underline hover:text-green-400">Test link ↗</a>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Calendly */}
      <SectionCard title="Calendly / Book a Call" icon={Calendar}>
        <div className="space-y-4">
          <div>
            <Label>Calendly URL</Label>
            <Input value={form.calendly_url} onChange={e => set('calendly_url', e.target.value)} placeholder="https://calendly.com/your-username/30min" />
            <p className="text-xs text-slate-500 mt-1">A "Book a Call" button will appear in the chatbot toolbar and hiring-intent responses.</p>
          </div>
          {form.calendly_url && (
            <div className="flex items-center gap-3 bg-purple-500/5 border border-purple-500/20 rounded-xl px-4 py-3">
              <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-purple-300 font-medium">Calendly booking active</p>
                <a href={form.calendly_url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-purple-400/70 underline hover:text-purple-400">Preview ↗</a>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Email Notifications */}
      <SectionCard title="Hire-Intent Email Alerts" icon={Bell}>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/60 border border-slate-700/40 rounded-xl">
            <div>
              <p className="text-sm font-medium text-white">Email alerts for hiring intent</p>
              <p className="text-xs text-slate-400 mt-0.5">Get notified instantly when a visitor asks about hiring you</p>
            </div>
            <button
              onClick={() => set('hire_email_enabled', form.hire_email_enabled === 'true' ? 'false' : 'true')}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.hire_email_enabled === 'true' ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.hire_email_enabled === 'true' ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
          <div>
            <Label>Notification Email</Label>
            <Input value={form.notify_email} onChange={e => set('notify_email', e.target.value)} placeholder="your@email.com" type="email" />
            <p className="text-xs text-slate-500 mt-1">Leave blank to use ADMIN_EMAIL from environment variables.</p>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-blue-300">Required:</strong> Set <code className="text-blue-300 bg-blue-500/10 px-1 rounded">SMTP_HOST</code>, <code className="text-blue-300 bg-blue-500/10 px-1 rounded">SMTP_USER</code>, and <code className="text-blue-300 bg-blue-500/10 px-1 rounded">SMTP_PASS</code> in your .env.local. Gmail works out of the box (use an App Password).
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Resume */}
      <SectionCard title="Resume / CV" icon={Download}>
        <div className="space-y-4">
          <div>
            <Label>Resume URL</Label>
            <Input value={form.resume_url} onChange={e => set('resume_url', e.target.value)} placeholder="/Cv.pdf" />
            <p className="text-xs text-slate-500 mt-1">Default is /Cv.pdf (already in /public). Upload a new one below or update the URL.</p>
          </div>
          <a href="/Cv.pdf" download className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
            <Download className="w-3.5 h-3.5" /> Preview current CV ↗
          </a>
        </div>
      </SectionCard>

      {/* Chatbot Preview */}
      <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-3">Feature Checklist</h3>
        <div className="space-y-2">
          {[
            { label: 'Voice Input (mic)', done: true, note: 'Built-in — works in Chrome/Edge/Safari' },
            { label: 'Chat Memory (localStorage)', done: true, note: 'Persists across page reloads' },
            { label: 'Analytics Tracking', done: true, note: `Go to AI Analytics tab to view data` },
            { label: 'Smart CTAs in Replies', done: true, note: 'Auto-injects based on intent' },
            { label: 'Quick Action Buttons', done: true, note: 'Download CV, Hire Me, WhatsApp, Book Call' },
            { label: 'WhatsApp Button', done: !!form.whatsapp_number, note: form.whatsapp_number ? 'Active' : 'Add WhatsApp number above' },
            { label: 'Book a Call (Calendly)', done: !!form.calendly_url, note: form.calendly_url ? 'Active' : 'Add Calendly URL above' },
            { label: 'Hire-Intent Email Alert', done: form.hire_email_enabled === 'true', note: form.hire_email_enabled === 'true' ? 'Requires SMTP env vars' : 'Enable toggle above' },
            { label: 'Resume Auto-Download', done: true, note: '/Cv.pdf is in /public' },
          ].map(({ label, done, note }) => (
            <div key={label} className="flex items-start gap-3 py-2 border-b border-slate-700/20 last:border-0">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${done ? 'bg-green-500/20' : 'bg-slate-700'}`}>
                {done ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <X className="w-3 h-3 text-slate-500" />}
              </div>
              <div>
                <p className="text-sm text-slate-200">{label}</p>
                <p className="text-xs text-slate-500">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg transition-all">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Chatbot Settings</>}
      </button>
    </div>
  )
}

// ─── Messages Section ─────────────────────────────────────────────────────────
function MessagesSection() {
  const [msgs, setMsgs] = useState<any[]>([])
  const [summary, setSummary] = useState<{ total: number; today: number; hiring: number; unique: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'hiring' | 'general'>('all')

  const load = async () => {
    setLoading(true)
    try {
      const [listRes, sumRes] = await Promise.all([
        fetch('/api/contact').then(r => r.json()),
        fetch('/api/contact?type=summary').then(r => r.json()),
      ])
      setMsgs(listRes.data || [])
      setSummary(sumRes.data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'all' ? msgs : msgs.filter((m: any) => m.intent === filter)

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Contact Messages</h2>
          <p className="text-slate-400 text-sm">Messages sent via the portfolio contact form.</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-sm text-slate-300 transition-all">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats matching admin panel categories */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Questions', value: summary?.total ?? 0, icon: MessageSquare, color: 'from-blue-600 to-cyan-500' },
          { label: 'Today', value: summary?.today ?? 0, icon: Calendar, color: 'from-green-600 to-teal-500' },
          { label: 'Hiring Intent', value: summary?.hiring ?? 0, icon: Briefcase, color: 'from-orange-600 to-red-500' },
          { label: 'Unique Questions', value: summary?.unique ?? 0, icon: BarChart2, color: 'from-purple-600 to-pink-500' },
        ].map(stat => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-5">
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${stat.color} mb-3 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'hiring', 'general'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
            }`}>
            {f === 'all' ? 'All' : f === 'hiring' ? '💼 Hiring Intent' : '💬 General'}
          </button>
        ))}
      </div>

      {/* Messages list */}
      <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Mail className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No messages yet. Share your portfolio to start receiving messages!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30">
            {filtered.map((msg: any, i: number) => (
              <div key={i} className="px-6 py-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm">{msg.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      msg.intent === 'hiring'
                        ? 'bg-orange-500/15 text-orange-300 border-orange-500/20'
                        : 'bg-slate-500/15 text-slate-400 border-slate-500/20'
                    }`}>
                      {msg.intent === 'hiring' ? '💼 Hiring Intent' : '💬 General'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">
                    {new Date(msg.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <a href={`mailto:${msg.email}`} className="text-xs text-blue-400 hover:underline mb-2 block">{msg.email}</a>
                <p className="text-sm text-slate-300 leading-relaxed">{msg.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

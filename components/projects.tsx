'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Github, ExternalLink, Code2, Sparkles, Search, Bot, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePortfolioData } from '@/hooks/usePortfolioData'

export function Projects() {
  const { projects } = usePortfolioData()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [filterQuery, setFilterQuery] = useState('')
  const [isFiltering, setIsFiltering] = useState(false)
  const [filteredIndices, setFilteredIndices] = useState<number[] | null>(null)
  const [explaining, setExplaining] = useState<number | null>(null)
  const [explanation, setExplanation] = useState<{ idx: number; text: string } | null>(null)

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } }
  const card = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } } }

  const displayed = filteredIndices !== null ? projects.filter((_, i) => filteredIndices.includes(i)) : projects

  // ── AI-powered project filter ─────────────────────────────────────────────
  const handleFilter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!filterQuery.trim()) { setFilteredIndices(null); return }

    // ── Client-side keyword match first (fast, reliable) ──────────────────
    const q = filterQuery.toLowerCase().trim()
    const keywords = q.split(/[\s,]+/).filter(Boolean)
    const clientMatches = projects.reduce<number[]>((acc, p, i) => {
      const haystack = `${p.title} ${p.description} ${p.tech.join(' ')}`.toLowerCase()
      if (keywords.some(k => haystack.includes(k))) acc.push(i)
      return acc
    }, [])

    // If we got matches locally, use them immediately (no API call needed)
    if (clientMatches.length > 0) {
      setFilteredIndices(clientMatches)
      return
    }

    // ── Fall back to AI for semantic / fuzzy search ────────────────────────
    setIsFiltering(true)
    try {
      const projectList = projects.map((p, i) => `[${i}] ${p.title}: ${p.description} | Tech: ${p.tech.join(', ')}`).join('\n')
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `The user wants to filter projects with: "${filterQuery}"\n\nProjects:\n${projectList}\n\nReturn ONLY a JSON array of matching project indices, like [0,2]. If all match, return all. If none match, return [].`,
          history: [],
        }),
      })
      const data = await res.json()
      const match = data.reply?.match(/\[[\d,\s]*\]/)
      if (match) {
        const indices = JSON.parse(match[0]) as number[]
        setFilteredIndices(indices.filter(i => i >= 0 && i < projects.length))
      } else {
        setFilteredIndices([])
      }
    } catch {
      setFilteredIndices(null)
    } finally {
      setIsFiltering(false)
    }
  }

  // ── Explain project ───────────────────────────────────────────────────────
  const handleExplain = async (project: typeof projects[0], idx: number) => {
    if (explanation?.idx === idx) { setExplanation(null); return }
    setExplaining(idx)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Explain this project to a recruiter in 3-4 sentences. Focus on: what problem it solves, the tech stack used, and why it demonstrates strong engineering skills.\n\nProject: ${project.title}\nDescription: ${project.description}\nTech: ${project.tech.join(', ')}`,
          history: [],
        }),
      })
      const data = await res.json()
      setExplanation({ idx, text: data.reply || 'Could not generate explanation.' })
    } catch {
      setExplanation({ idx, text: 'Error loading explanation. Please try again.' })
    } finally {
      setExplaining(null)
    }
  }

  return (
    <motion.section id="projects" ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={container}
      className="py-20 md:py-32 px-4 md:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div variants={card} className="mb-4">
        <span className="text-sm font-semibold text-blue-600 uppercase tracking-widest">What I've Built</span>
        <h2 className="text-4xl md:text-5xl font-bold mt-2">
          Featured{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Projects</span>
        </h2>
      </motion.div>
      <motion.p variants={card} className="text-base md:text-lg text-muted-foreground mb-6 max-w-2xl">
        Explore my recent work — frontend, full-stack, and AI-powered solutions.
      </motion.p>

      {/* ── AI Smart Filter ── */}
      <motion.form variants={card} onSubmit={handleFilter} className="flex gap-2 mb-10">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={filterQuery}
            onChange={e => { setFilterQuery(e.target.value); if (!e.target.value.trim()) setFilteredIndices(null) }}
            placeholder='Try: "show me backend projects" or "React apps"...'
            className="w-full pl-9 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-sm outline-none focus:border-blue-600/50 transition-colors"
          />
        </div>
        <Button type="submit" disabled={isFiltering} size="sm" className="gap-2 px-4">
          {isFiltering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
          {isFiltering ? 'Filtering…' : 'AI Filter'}
        </Button>
        {filteredIndices !== null && (
          <Button type="button" variant="outline" size="sm" onClick={() => { setFilteredIndices(null); setFilterQuery('') }}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </motion.form>

      {filteredIndices !== null && filteredIndices.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-12 text-muted-foreground">
          No projects found matching "{filterQuery}". <button onClick={() => { setFilteredIndices(null); setFilterQuery('') }} className="text-blue-600 hover:underline ml-1">Show all</button>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {displayed.map((project, displayIdx) => {
          const idx = projects.indexOf(project)
          return (
            <motion.div key={idx} variants={card} whileHover={{ y: -8, scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              onHoverStart={() => setHoveredIdx(idx)} onHoverEnd={() => setHoveredIdx(null)}
              className="group bg-secondary border border-border rounded-2xl overflow-hidden hover:border-blue-600/30 hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-300">
              <div className={`h-44 bg-gradient-to-br ${project.image} relative overflow-hidden`}>
                <motion.div animate={hoveredIdx === idx ? { opacity: 0.4, scale: 1.05 } : { opacity: 0.2, scale: 1 }}
                  transition={{ duration: 0.4 }} className="absolute inset-0 bg-black" />
                <div className="absolute inset-0 opacity-20"
                  style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div animate={hoveredIdx === idx ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }} transition={{ duration: 0.4 }}>
                    <Code2 className="w-14 h-14 text-white/40" />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {hoveredIdx === idx && (
                    <>{[[-20, -20], [20, -10], [-15, 15], [25, 20]].map(([dx, dy], i) => (
                      <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }} className="absolute"
                        style={{ top: `calc(50% + ${dy}px)`, left: `calc(50% + ${dx}px)` }}>
                        <Sparkles className="w-4 h-4 text-white/60" />
                      </motion.div>
                    ))}</>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-200">{project.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{project.description}</p>
                </div>

                {/* AI Explanation */}
                <AnimatePresence>
                  {explanation?.idx === idx && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 overflow-hidden">
                      <p className="text-xs font-semibold text-blue-600 mb-1.5 flex items-center gap-1"><Bot className="w-3 h-3" /> Recruiter Explanation</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{explanation.text}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap gap-2 pt-1">
                  {project.tech.map((tech, i) => (
                    <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.4 + idx * 0.1 + i * 0.04 }} whileHover={{ scale: 1.1 }}
                      className="text-xs px-2.5 py-1 bg-background rounded-full text-muted-foreground border border-border hover:border-blue-600/40 hover:text-blue-600 transition-colors cursor-default">
                      {tech}
                    </motion.span>
                  ))}
                </div>

                <div className="flex gap-2 pt-3 border-t border-border">
                  <Button size="sm" variant="outline"
                    onClick={() => handleExplain(project, idx)}
                    disabled={explaining === idx}
                    className="gap-1.5 text-xs bg-transparent hover:bg-secondary flex-1">
                    {explaining === idx ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                    {explanation?.idx === idx ? 'Hide' : 'Explain for Recruiter'}
                  </Button>
                  <Button asChild size="sm" variant="outline" className="gap-1.5 bg-transparent hover:bg-secondary">
                    <a href={project.github} target="_blank" rel="noopener noreferrer"><Github className="w-3.5 h-3.5" />Code</a>
                  </Button>
                  <Button asChild size="sm" className="gap-1.5 shadow-md shadow-blue-600/10">
                    <a href={project.live} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" />Demo</a>
                  </Button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}

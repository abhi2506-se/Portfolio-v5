'use client'

import { useRef, useState } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { Code2, Palette, Database, GitBranch, Zap, Brain, X, Clock, BarChart2 } from 'lucide-react'
import { usePortfolioData } from '@/hooks/usePortfolioData'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code2, Palette, Database, GitBranch, Zap, Brain,
}

const SKILL_DETAILS: Record<string, { level: number; lastUsed: string; note: string }> = {
  'React':        { level: 95, lastUsed: 'This month',  note: 'Primary frontend framework for all major projects' },
  'Next.js':      { level: 90, lastUsed: 'This month',  note: 'Full-stack React framework used in production apps' },
  'TypeScript':   { level: 88, lastUsed: 'This month',  note: 'Preferred over JS for all new projects' },
  'JavaScript':   { level: 95, lastUsed: 'This month',  note: 'Core language, 3+ years of daily use' },
  'Node.js':      { level: 85, lastUsed: 'This week',   note: 'Backend runtime for REST APIs and serverless functions' },
  'Python':       { level: 80, lastUsed: 'Last month',  note: 'Scripting, data processing, and AI/ML tasks' },
  'PostgreSQL':   { level: 82, lastUsed: 'This week',   note: 'Primary relational DB, used with Neon serverless' },
  'MongoDB':      { level: 78, lastUsed: 'Last month',  note: 'NoSQL for flexible document storage' },
  'Tailwind CSS': { level: 92, lastUsed: 'This month',  note: 'Utility-first CSS for rapid UI development' },
  'Git':          { level: 90, lastUsed: 'Daily',       note: 'Version control for all projects' },
  'Docker':       { level: 72, lastUsed: 'Last month',  note: 'Containerization for consistent deployments' },
}

function getDefaultDetail(skill: string) {
  return { level: 75, lastUsed: 'Recently', note: `Solid hands-on experience with ${skill} in multiple projects` }
}

function SkillDetailPopup({ skill, color, onClose }: { skill: string; color: string; onClose: () => void }) {
  const detail = SKILL_DETAILS[skill] ?? getDefaultDetail(skill)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 10 }}
      className="absolute inset-x-0 top-0 z-20 bg-background border border-border rounded-2xl p-5 shadow-2xl"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-sm">{skill}</h4>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="flex items-center gap-1 text-muted-foreground"><BarChart2 className="w-3 h-3" /> Confidence</span>
          <span className="font-semibold">{detail.level}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <motion.div initial={{ width: 0 }} animate={{ width: `${detail.level}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-2 rounded-full bg-gradient-to-r ${color}`} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
        <Clock className="w-3 h-3" />
        <span>Last used: <strong className="text-foreground">{detail.lastUsed}</strong></span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{detail.note}</p>
    </motion.div>
  )
}

export function Skills() {
  const { skills } = usePortfolioData()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<{ name: string; color: string; cardIdx: number } | null>(null)

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } }
  const card = { hidden: { opacity: 0, y: 40, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } } }

  return (
    <motion.section id="skills" ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={container}
      className="py-20 md:py-32 px-4 md:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div variants={card} className="mb-4">
        <span className="text-sm font-semibold text-blue-600 uppercase tracking-widest">What I Know</span>
        <h2 className="text-4xl md:text-5xl font-bold mt-2">
          Skills &{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Expertise</span>
        </h2>
      </motion.div>
      <motion.p variants={card} className="text-sm text-muted-foreground mb-10">
        ✨ <strong>Click any skill</strong> to see confidence level, last used date, and context.
      </motion.p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {skills.map((cat, idx) => {
          const Icon = iconMap[cat.icon] ?? Code2
          const isHovered = hoveredIdx === idx
          return (
            <motion.div key={idx} variants={card} whileHover={{ y: -8, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              onHoverStart={() => setHoveredIdx(idx)} onHoverEnd={() => setHoveredIdx(null)}
              className="relative group bg-secondary border border-border rounded-2xl p-6 overflow-hidden cursor-default">
              <motion.div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />
              <motion.div animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
                className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${cat.color} opacity-10 rounded-full blur-2xl`} />
              <motion.div whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.5 }}
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${cat.color} mb-4 text-white shadow-lg`}>
                <Icon className="w-5 h-5" />
              </motion.div>
              <h3 className="text-lg font-bold mb-4 group-hover:text-blue-600 transition-colors">{cat.title}</h3>
              <ul className="space-y-2">
                {cat.skills.map((skill, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + idx * 0.08 + i * 0.04 }}
                    onClick={() => setSelectedSkill(
                      selectedSkill?.name === skill && selectedSkill?.cardIdx === idx ? null
                        : { name: skill, color: cat.color, cardIdx: idx }
                    )}
                    className="text-muted-foreground flex items-center gap-2 text-sm cursor-pointer hover:text-foreground hover:bg-background/60 rounded-lg px-2 py-1 -mx-2 transition-all group/skill">
                    <motion.span animate={{ scale: isHovered ? 1.4 : 1 }}
                      className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${cat.color} flex-shrink-0`} />
                    <span className="flex-1">{skill}</span>
                    <span className="text-xs text-muted-foreground/40 opacity-0 group-hover/skill:opacity-100 transition-opacity">tap →</span>
                  </motion.li>
                ))}
              </ul>
              <AnimatePresence>
                {selectedSkill?.cardIdx === idx && (
                  <SkillDetailPopup skill={selectedSkill.name} color={cat.color} onClose={() => setSelectedSkill(null)} />
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}

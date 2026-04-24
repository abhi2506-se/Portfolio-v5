'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { usePortfolioData } from '@/hooks/usePortfolioData'

function CountUp({ target, suffix = '' }: { target: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const num = parseInt(target)
  const hasNum = !isNaN(num)

  return (
    <span ref={ref}>
      {hasNum && inView ? (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {target}
        </motion.span>
      ) : target}
    </span>
  )
}

export function About() {
  const { about } = usePortfolioData()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const container = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }
  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25,0.46,0.45,0.94] } } }
  const fadeRight = { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25,0.46,0.45,0.94] } } }

  return (
    <motion.section
      id="about"
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={container}
      className="py-20 md:py-32 px-4 md:px-6 lg:px-8 max-w-5xl mx-auto"
    >
      {/* Section header */}
      <motion.div variants={fadeUp} className="mb-12">
        <span className="text-sm font-semibold text-blue-600 uppercase tracking-widest">About Me</span>
        <h2 className="text-4xl md:text-5xl font-bold mt-2">
          Who I <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Am</span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
        {/* Bio paragraphs */}
        <div className="space-y-6">
          {[about.bio1, about.bio2, about.bio3].filter(Boolean).map((bio, i) => (
            <motion.p
              key={i}
              variants={fadeRight}
              className="text-base md:text-lg text-muted-foreground leading-relaxed border-l-2 border-blue-600/30 pl-4 hover:border-blue-600 transition-colors duration-300"
            >
              {bio}
            </motion.p>
          ))}
        </div>

        {/* Stats grid */}
        <motion.div variants={fadeUp} className="space-y-6">
          {about.stats && about.stats.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {about.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  whileHover={{ scale: 1.05, y: -4 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="relative bg-secondary rounded-2xl p-5 border border-border text-center overflow-hidden group cursor-default"
                >
                  {/* Gradient hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-cyan-500/0 group-hover:from-blue-600/5 group-hover:to-cyan-500/5 transition-all duration-300" />
                  <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 mb-1">
                    <CountUp target={stat.value} />
                  </p>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Decorative code block */}
          <motion.div
            variants={fadeUp}
            className="bg-secondary/80 border border-border rounded-2xl p-5 font-mono text-xs md:text-sm overflow-hidden"
          >
            <div className="flex gap-1.5 mb-3">
              {['bg-red-500','bg-yellow-500','bg-green-500'].map((c, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${c}`} />
              ))}
            </div>
            <div className="space-y-1 text-muted-foreground">
              <p><span className="text-blue-500">const</span> <span className="text-green-500">dev</span> = {'{'}</p>
              <p className="pl-4"><span className="text-yellow-500">name</span>: <span className="text-orange-400">"{about.bio1?.split(' ').slice(0,2).join(' ') || 'Abhishek'}"</span>,</p>
              <p className="pl-4"><span className="text-yellow-500">passion</span>: <span className="text-orange-400">"Building cool things"</span>,</p>
              <p className="pl-4"><span className="text-yellow-500">available</span>: <span className="text-blue-400">true</span>,</p>
              <p>{'}'}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  )
}

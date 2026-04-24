import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { About } from '@/components/about'
import { Skills } from '@/components/skills'
import { Experience } from '@/components/experience'
import { Projects } from '@/components/projects'
import { Contact } from '@/components/contact'
import { Footer } from '@/components/footer'
import { WhyHireMe } from '@/components/why-hire-me'
import { HireMeBar } from '@/components/hire-me-bar'
import { ExperienceModeSelector } from '@/components/experience-mode'

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Experience mode personalizer (shows after 2s) */}
      <ExperienceModeSelector />

      {/* Sticky hire funnel bar (shows after 30% scroll) */}
      <HireMeBar />

      <Hero />

      <section className="border-t border-border">
        <About />
      </section>

      <section className="border-t border-border">
        <Skills />
      </section>

      <section className="border-t border-border">
        <Experience />
      </section>

      <section className="border-t border-border">
        <Projects />
      </section>

      {/* AI-powered Why Hire Me section */}
      <section className="border-t border-border">
        <WhyHireMe />
      </section>

      <section className="border-t border-border">
        <Contact />
      </section>

      <Footer />
    </main>
  )
}

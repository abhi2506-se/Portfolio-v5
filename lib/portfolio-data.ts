// ─── Default data (fallback when DB has nothing) ──────────────────────────────
export const defaultPortfolioData = {
  hero: {
    name: 'Abhishek Singh',
    title: 'DevOps Engineer & Full Stack Engineer',
    subtitle:
      'Crafting responsive, dynamic web experiences with React, JavaScript, and modern technologies.',
    description:
      'Experienced in internships project-based learning and remote collaboration. Strong leadership with proven communication skills and a continuous learner currently expanding into full stack development.',
    available: true,
    github: 'https://github.com/abhi2506-se',
    linkedin: 'https://www.linkedin.com/in/abhishek-singh-494a86270/',
    email: 'abhisheksingh89208@gmail.com',
    instagram: 'https://www.instagram.com/_abhiiisheksingh/',
    location: 'Najafgarh, New Delhi, India',
    resumeUrl: '/Cv.pdf',
  },
  about: {
    bio1:
      "I'm a passionate Frontend Developer with hands-on experience in building responsive, user-centric web applications. With expertise in React, JavaScript, and modern web technologies, I've successfully delivered projects during my internship at Ksolves India Limited.",
    bio2:
      "I believe in writing clean, maintainable code and staying current with industry trends. Whether it's optimizing performance, implementing complex UI components, or integrating APIs, I approach each challenge with dedication and creativity.",
    bio3:
      "When I'm not coding, I enjoy contributing to open-source projects, exploring new technologies, and mentoring junior developers. I'm passionate about creating digital experiences that are both beautiful and functional.",
    stats: [
      { label: 'Projects Completed', value: '15+' },
      { label: 'Technologies', value: '20+' },
      { label: 'Internships', value: '3' },
      { label: 'Certifications', value: '5+' },
    ],
  },
  skills: [
    {
      title: 'Frontend',
      icon: 'Code2',
      skills: ['HTML5', 'CSS3', 'JavaScript (ES7)', 'React.js', 'Redux'],
      color: 'from-blue-600 to-cyan-500',
    },
    {
      title: 'Backend & Databases',
      icon: 'Database',
      skills: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Java'],
      color: 'from-purple-600 to-pink-500',
    },
    {
      title: 'Design & Styling',
      icon: 'Palette',
      skills: ['Responsive Design', 'Tailwind CSS', 'UI/UX Principles', 'Component Architecture'],
      color: 'from-orange-600 to-red-500',
    },
    {
      title: 'Tools & Workflow',
      icon: 'GitBranch',
      skills: ['Git', 'GitHub', 'VS Code', 'Figma', 'DevTools'],
      color: 'from-green-600 to-teal-500',
    },
    {
      title: 'Soft Skills',
      icon: 'Brain',
      skills: ['Problem Solving', 'Team Collaboration', 'Communication', 'Leadership'],
      color: 'from-indigo-600 to-blue-500',
    },
    {
      title: 'Additional',
      icon: 'Zap',
      skills: ['SEO Optimization', 'Performance Optimization', 'API Integration', 'Redux Toolkit'],
      color: 'from-yellow-600 to-orange-500',
    },
  ],
  experience: [
    {
      title: 'Software Engineer Intern',
      company: 'Amazon Development Center India Pvt Ltd',
      period: 'Oct 2025 - Present',
      type: 'work',
      description: [
        'Developed and optimized 5+ dynamic UI components using React.js',
        'Achieved 98% design accuracy and boosted data rendering efficiency by 35%',
        'Collaborated in a team of 4 to deliver 3 real-time projects with 100% on-time delivery',
        'Resolved 25+ front-end issues during QA and ensured seamless backend integration',
        'Managed global application state using Redux Toolkit',
        'Worked with REST APIs to fetch, display, and update dynamic data',
      ],
    },
  ],
  education: [
    {
      title: 'Full Stack Development with Generative AI (Java & MERN Stack)',
      institution: 'IIT Guwahati (Masai)',
      period: 'Expected: 07/2026',
      type: 'education',
      description: 'Software Development (Java & MERN)',
      achievements: [
        'Offline, instructor-led weekend program',
        'Learning backend development using Java, Spring Boot, and RESTful APIs',
        'Building frontend with HTML, CSS, JavaScript, React.js',
        'MERN stack: MongoDB, Express.js, React.js, Node.js',
      ],
    },
    {
      title: 'Bachelor of Technology (B.Tech) in Computer Science & Engineering',
      institution: 'J.C. BOSE UNIVERSITY OF SCIENCE & TECHNOLOGY, YMCA FARIDABAD',
      period: 'Completed',
      type: 'education',
      description: 'AI & Data Science',
      achievements: [
        'Head of Sponsorship committee',
        'Multiple internships in Software development & DevOps',
        'Certifications in Web Development and Programming',
        'Hands-on experience with C++, HTML, CSS, JavaScript, React.js',
      ],
    },
  ],
  projects: [
    {
      title: 'AI Resume Analyser',
      description:
        'A full-stack AI-powered resume analyser that extracts key information and provides actionable feedback.',
      tech: ['Python', 'HTML', 'JavaScript', 'CSS3', 'Express', 'MongoDB'],
      github: 'https://github.com/abhi2506-se',
      live: '#',
      image: 'from-blue-600 to-cyan-500',
    },
    {
      title: 'College Alumni Portal',
      description:
        'Modern alumni portal with product listings, filters, and community networking functionality.',
      tech: ['PHP', 'HTML', 'JavaScript', 'CSS', 'SQL', 'Component Architecture'],
      github: 'https://github.com/abhi2506-se',
      live: '#',
      image: 'from-orange-600 to-red-500',
    },
    {
      title: 'Portfolio Website',
      description:
        'A personal portfolio website to showcase projects, skills, and experience as a developer.',
      tech: ['Next.js', 'React', 'Tailwind CSS', 'Framer Motion'],
      github: 'https://github.com/abhi2506-se',
      live: 'https://personal-portfolio-iwa3.vercel.app/',
      image: 'from-green-600 to-teal-500',
    },
    {
      title: 'Time-Table Management System',
      description:
        'A flexible application built to help teams and institutions manage timetables intuitively.',
      tech: ['Django', 'Jasmine', 'Sqlite3', 'HTML', 'CSS', 'JavaScript'],
      github: 'https://github.com/abhi2506-se',
      live: '#',
      image: 'from-indigo-600 to-blue-500',
    },
  ],
}

export type PortfolioData = typeof defaultPortfolioData

// ─── Kept for backward compat (no longer used for storage) ───────────────────
export const STORAGE_KEY = 'portfolio_admin_data'

/** Load portfolio data from DB (server-side cache).  */
export async function fetchPortfolioData(): Promise<PortfolioData> {
  try {
    const res = await fetch('/api/portfolio', { cache: 'no-store' })
    if (!res.ok) return defaultPortfolioData
    const json = await res.json()
    if (!json) return defaultPortfolioData
    return { ...defaultPortfolioData, ...json }
  } catch {
    return defaultPortfolioData
  }
}

/** Save portfolio data to DB (called by admin dashboard). */
export async function savePortfolioData(data: Partial<PortfolioData>): Promise<void> {
  try {
    const current = await fetchPortfolioData()
    const merged = { ...current, ...data }
    await fetch('/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged),
    })
    // Broadcast so same-page components re-fetch
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('portfolio-data-updated'))
    }
  } catch (e) {
    console.error('Failed to save portfolio data', e)
    throw e
  }
}

/** @deprecated localStorage fallback — kept so old imports don't break */
export function getPortfolioData(): PortfolioData {
  return defaultPortfolioData
}

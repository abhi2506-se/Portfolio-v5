#Abhishek Singh - Premium Portfolio Website

A modern, responsive personal portfolio website built with **Next.js 16**, **React 19**, **Tailwind CSS**, and **Framer Motion**. Showcasing skills, experience, projects, and contact information with smooth animations and dark mode support.

## Features

- **Responsive Design**: Fully responsive across mobile, tablet, and desktop devices
- **Dark/Light Mode**: Toggle between dark and light themes with persistent storage
- **Smooth Animations**: Scroll-triggered animations and micro-interactions using Framer Motion
- **Modern UI**: Clean, professional design with card-based sections and gradients
- **SEO Optimized**: Proper meta tags, OpenGraph support, and semantic HTML
- **Performance**: Optimized images, lazy loading, and efficient code splitting
- **Accessibility**: ARIA labels, keyboard navigation, and semantic HTML elements
- **Component-Based Architecture**: Reusable, maintainable React components

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **React**: React 19.2
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion 12
- **Icons**: Lucide React
- **Theme**: next-themes

### Tooling
- **TypeScript**: For type safety
- **ESLint**: Code quality
- **PostCSS**: CSS processing
- **Autoprefixer**: Browser compatibility

## Project Structure

```
.
├── app/
│   ├── layout.tsx              # Root layout with theme provider
│   ├── page.tsx                # Main portfolio page
│   └── globals.css             # Global styles and design tokens
├── components/
│   ├── navbar.tsx              # Navigation header with mobile menu
│   ├── hero.tsx                # Hero section with intro
│   ├── about.tsx               # About me section
│   ├── skills.tsx              # Skills and expertise grid
│   ├── experience.tsx          # Work experience and education
│   ├── projects.tsx            # Projects showcase
│   ├── contact.tsx             # Contact section with CTA
│   ├── footer.tsx              # Footer with social links
│   ├── theme-provider.tsx      # Theme provider wrapper
│   └── ui/                     # shadcn UI components
├── public/
│   └── resume.pdf              # Downloadable resume
├── lib/
│   └── utils.ts                # Utility functions (cn)
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── next.config.mjs             # Next.js config
└── README.md                   # This file
```

## Sections

### 1. Hero Section
- Name and title
- Professional summary
- Call-to-action buttons
- Social media links

### 2. About Me
- Professional background
- Key achievements
- Personal interests
- Highlights box

### 3. Skills
- 6 categories of skills (Frontend, Backend, Design, Tools, Soft Skills, Additional)
- Icon-based cards with hover effects
- Organized and scannable layout

### 4. Experience
- Work history with timeline
- Detailed job descriptions
- Education and certifications
- Key achievements for each role

### 5. Projects
- 6 featured projects
- Project descriptions and tech stack
- GitHub links and live demos
- Visual cards with gradient backgrounds

### 6. Contact
- Multiple contact methods (email, phone, socials)
- Quick message CTA
- Opportunity discussion section
- Resume download button

### 7. Navigation & Footer
- Fixed navbar with smooth scroll
- Mobile-friendly menu
- Dark/light mode toggle
- Footer with quick links and social icons

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone or download the project**
```bash
cd Portfolio-main
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Customization Guide

### 1. Update Personal Information

Edit `/components/hero.tsx`:
```tsx
<motion.h1>Hi, I'm <span>Your Name</span></motion.h1>
<motion.p>Your professional summary here...</motion.p>
```

### 2. Update Resume

Replace `/public/resume.pdf` with your actual resume PDF file.

### 3. Update Skills

Edit `/components/skills.tsx` and modify the `skillCategories` array:
```tsx
const skillCategories = [
  {
    title: 'Your Skill Category',
    icon: YourIcon,
    skills: ['Skill 1', 'Skill 2', 'Skill 3'],
    color: 'from-blue-600 to-cyan-500',
  },
  // ... more categories
]
```

### 4. Update Projects

Edit `/components/projects.tsx` and modify the `projects` array:
```tsx
const projects = [
  {
    title: 'Your Project',
    description: 'Project description',
    tech: ['Tech1', 'Tech2'],
    github: 'https://github.com/your-link',
    live: 'https://your-demo.com',
    image: 'bg-gradient-to-br from-color1 to-color2',
  },
  // ... more projects
]
```

### 5. Update Experience & Education

Edit `/components/experience.tsx` and modify the `experiences` and `educations` arrays.

### 6. Update Contact Information

Edit `/components/contact.tsx` and update the `contactMethods` array with your info.

### 7. Customize Theme Colors

Edit `/app/globals.css` to change the color scheme. The design uses CSS custom properties for theming:
```css
:root {
  --background: oklch(1 0 0);      /* White background */
  --foreground: oklch(0.145 0 0);  /* Dark text */
  /* ... more color tokens */
}

.dark {
  --background: oklch(0.145 0 0);  /* Dark background */
  --foreground: oklch(0.985 0 0);  /* Light text */
  /* ... more dark mode colors */
}
```

### 8. Update SEO Metadata

Edit `/app/layout.tsx`:
```tsx
export const metadata: Metadata = {
  title: 'Your Name | Your Title',
  description: 'Your professional description',
  openGraph: {
    title: 'Your Name | Your Title',
    description: 'Your professional description',
    url: 'https://your-domain.com',
    siteName: 'Your Name',
  },
}
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Vercel automatically deploys on every push

```bash
# One-time setup
vercel
```

### Deploy to Other Hosting

1. **Build the project**
```bash
npm run build
```

2. **Upload to your hosting provider**
- Hostinger
- Netlify
- AWS Amplify
- Any Node.js hosting

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization

- Next.js automatic code splitting
- Image optimization with Next.js Image component
- CSS minification with Tailwind
- Font optimization with next/font
- Lazy loading with Framer Motion

## Accessibility Features

- Semantic HTML structure
- ARIA labels for icons and buttons
- Keyboard navigation support
- Sufficient color contrast ratios
- Screen reader friendly

## SEO Best Practices

- Proper heading hierarchy
- Meta descriptions
- OpenGraph tags for social sharing
- Semantic HTML elements
- Mobile-friendly responsive design
- Fast page load times

## License

This project is open source and available for personal and commercial use.

## Support

For questions or issues:
1. Check the code comments
2. Review the component props
3. Visit the Next.js documentation
4. Contact your developer

## Changelog

### v1.0.0 (Initial Release)
- Complete portfolio website
- All sections implemented
- Dark/light mode support
- Fully responsive design
- Production-ready code

---

**Last Updated**: February 2026
**Built with ❤️ using Next.js and Tailwind CSS**

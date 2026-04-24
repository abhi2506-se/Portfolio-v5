import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function getPortfolioContext() {
  try {
    const rows = await sql`SELECT data FROM portfolio_data WHERE key = 'main'`
    return rows.length ? rows[0].data : null
  } catch { return null }
}

// Returns blog and certificate counts for the system prompt context
async function getJourneyStats(): Promise<{ blogCount: number; certCount: number }> {
  try {
    const [blogs, certs] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM journey_blogs`.catch(() => [{ count: 0 }]),
      sql`SELECT COUNT(*) as count FROM journey_certificates`.catch(() => [{ count: 0 }]),
    ])
    return {
      blogCount: Number(blogs[0]?.count ?? 0),
      certCount: Number(certs[0]?.count ?? 0),
    }
  } catch {
    return { blogCount: 0, certCount: 0 }
  }
}

// Fire-and-forget analytics — never throws, never blocks the response
async function trackAnalytics(message: string, intent: string) {
  try {
    await sql`INSERT INTO ai_analytics (message, intent) VALUES (${message}, ${intent})`
  } catch {
    // Analytics failures are silent — never affect the user
  }
}

class ApiError extends Error {
  constructor(message: string, public status: number) { super(message) }
}

function tryParseJson(text: string) {
  try { return JSON.parse(text) } catch { return {} }
}

function trimPortfolio(data: any) {
  if (!data) return 'Not configured'
  const safeData = {
    name: data.name,
    title: data.title,
    about: data.about,
    education: data.education,
    experience: data.experience,
    skills: data.skills,
    projects: data.projects?.slice(0, 4),
  }
  return JSON.stringify(safeData)
}

type ChatMsg = { role: 'user' | 'assistant'; content: string }

function buildSystemPrompt(portfolioSnippet: string, blogCount: number, certCount: number) {
  return `You are a professional HR assistant representing Abhishek Singh.

Your role is to:
- Explain Abhishek's skills, projects, and experience confidently
- Present him as a strong candidate
- Answer like a recruiter speaking to a client or hiring manager

Guidelines:
1. Always be confident and positive
2. Highlight strengths, skills, and project impact
3. If exact data is missing, infer reasonably based on skills/projects
4. NEVER say "I don't have information"
5. Keep answers clear, professional, and concise (3-5 sentences)
6. Speak as if recommending a candidate

Personal Info (only share if the user explicitly asks - do NOT volunteer):
- Date of birth: 25th June
- Marital status: Married
- Wife's name: Gayatri Singh

Portfolio Data:
${portfolioSnippet}

Additional Info:
- ${blogCount} blog posts
- ${certCount} certificates

Tone:
Professional, confident, recruiter-style, helpful.`
}

async function callAnthropic(apiKey: string, systemPrompt: string, messages: ChatMsg[]): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 400,
      system: systemPrompt,
      messages,
    }),
  })
  const data = await res.json()
  const reply = data?.content?.[0]?.text?.trim()
  if (reply) return reply
  throw new ApiError('Empty response from Anthropic', res.status || 500)
}

async function callGroq(apiKey: string, systemPrompt: string, messages: ChatMsg[]): Promise<string> {
  const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant']
  for (const model of models) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-6)],
        max_tokens: 400,
      }),
    })
    const raw = await res.text()
    if (res.ok) {
      const data = tryParseJson(raw) as { choices?: { message?: { content?: string } }[] }
      const reply = data?.choices?.[0]?.message?.content?.trim()
      if (reply) return reply
    } else {
      const parsed = tryParseJson(raw) as { error?: { message?: string } }
      console.error(`[AI] Groq ${res.status} (${model}) - ${parsed?.error?.message ?? 'HTTP error'}`)
    }
  }
  throw new ApiError('All Groq models failed.', 500)
}

function sanitizeHistory(raw: unknown[]): ChatMsg[] {
  const typed: ChatMsg[] = (Array.isArray(raw) ? raw.slice(-10) : [])
    .map((m: unknown) => {
      const msg = m as { role?: string; content?: string }
      return {
        role: (msg?.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
        content: String(msg?.content || '').trim(),
      }
    })
    .filter(m => m.content.length > 0)

  while (typed.length > 0 && typed[0].role === 'assistant') typed.shift()

  const alternated: ChatMsg[] = []
  for (const m of typed) {
    if (alternated.length === 0) {
      alternated.push(m)
    } else if (m.role !== alternated[alternated.length - 1].role) {
      alternated.push(m)
    } else {
      alternated[alternated.length - 1] = m
    }
  }
  while (alternated.length > 0 && alternated[alternated.length - 1].role === 'user') {
    alternated.pop()
  }
  return alternated
}

export async function POST(req: Request) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim()
  const groqKey = process.env.GROQ_API_KEY?.trim()

  if (!anthropicKey && !groqKey) {
    return NextResponse.json({ reply: 'AI assistant not configured.' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const { message, history } = body as { message?: string; history?: unknown[] }

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Detect intent (fire-and-forget analytics)
    const lowerMsg = message.toLowerCase()
    let intent = 'general'
    if (lowerMsg.includes('hire')) intent = 'hire'
    else if (lowerMsg.includes('project')) intent = 'project'
    else if (lowerMsg.includes('contact')) intent = 'contact'
    else if (lowerMsg.includes('resume')) intent = 'resume'
    trackAnalytics(message, intent)

    const [portfolio, stats] = await Promise.all([getPortfolioContext(), getJourneyStats()])
    const portfolioSnippet = trimPortfolio(portfolio)
    const systemPrompt = buildSystemPrompt(portfolioSnippet, stats.blogCount, stats.certCount)
    const sanitized = sanitizeHistory(history ?? [])
    const chatMessages: ChatMsg[] = [...sanitized, { role: 'user', content: message }]

    if (anthropicKey) {
      try {
        const reply = await callAnthropic(anthropicKey, systemPrompt, chatMessages)
        return NextResponse.json({ reply, intent })
      } catch (e) {
        if (e instanceof ApiError && e.status === 400) {
          console.warn('[AI] Anthropic 400 - retrying with no history')
          const reply = await callAnthropic(anthropicKey, systemPrompt, [{ role: 'user', content: message }])
          return NextResponse.json({ reply, intent })
        }
        throw e
      }
    }

    if (!groqKey) return NextResponse.json({ reply: 'Groq API key is missing.' }, { status: 500 })
    const reply = await callGroq(groqKey, systemPrompt, chatMessages)
    return NextResponse.json({ reply, intent })

  } catch (e) {
    if (e instanceof ApiError) {
      console.error(`[AI] ApiError ${e.status}:`, e.message)
      if (e.status === 401) return NextResponse.json({ reply: 'API key is invalid. Please check your environment variables.' })
      if (e.status === 429) return NextResponse.json({ reply: 'Rate limit reached. Please wait a moment and try again!' })
      if (e.status === 400) return NextResponse.json({ reply: 'There was a problem with the request format. Please refresh and try again.' })
      return NextResponse.json({ reply: `Something went wrong (${e.status}). Please try again.` })
    }
    console.error('[AI] Unexpected error:', e)
    return NextResponse.json({ reply: 'Something went wrong. Please try again!' })
  }
}

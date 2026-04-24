import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'


const sql = neon(process.env.DATABASE_URL!)

async function getPortfolioContext() {
  try {
    const rows = await sql`SELECT data FROM portfolio_data WHERE key = 'main'`
    return rows.length ? rows[0].data : null
  } catch { return null }
}

async function getJourneyStats() {
  try {
  await sql`
    INSERT INTO ai_analytics (message, intent)
    VALUES (${message}, ${intent})
  `;
} catch (err) {
  console.error("Analytics error:", err);
}
}

class ApiError extends Error {
  constructor(message: string, public status: number) { super(message) }
}

function tryParseJson(text: string) {
  try { return JSON.parse(text) } catch { return {} }
}

// Trim portfolio JSON to keep it well within Anthropic's token budget.
// Pretty-printed JSON is verbose — compact it and cap at ~6 KB of text.
function trimPortfolio(data) {
  if (!data) return 'Not configured'

  const safeData = {
  name: data.name,
  title: data.title,
  about: data.about,

  education: data.education,   // 🔥 IMPORTANT
  experience: data.experience, // 🔥 IMPORTANT

  skills: data.skills,
  projects: data.projects?.slice(0, 3)
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
5. Keep answers clear, professional, and concise (3–5 sentences)
6. Speak as if recommending a candidate

Portfolio Data:
${portfolioSnippet}

Additional Info:
- ${blogCount} blog posts
- ${certCount} certificates

Tone:
Professional, confident, recruiter-style, helpful.`
}

async function callAnthropic(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMsg[],
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      system: systemPrompt,
      messages,
    }),
  })

  const data = await res.json()

  const reply = data?.content?.[0]?.text?.trim()
  if (reply) return reply

  throw new ApiError("Empty response from Anthropic", 500)
}

async function callGroq(
  apiKey: string,
  systemPrompt: string,
  messages: ChatMsg[],
): Promise<string> {

  const models = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant"
];

  for (const model of models) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-5)
        ],
        max_tokens: 200,
      }),
    });

    const raw = await res.text();

    if (res.ok) {
      const data = tryParseJson(raw) as {
        choices?: { message?: { content?: string } }[]
      };

      const reply = data?.choices?.[0]?.message?.content?.trim();
      if (reply) return reply;

    } else {
      const parsed = tryParseJson(raw) as { error?: { message?: string } };
      const errMsg = parsed?.error?.message || `HTTP ${res.status}`;
      console.error(`[AI] Groq ${res.status} (${model}) — ${errMsg}`);
    }
  }

  throw new ApiError("All Groq models failed.", 500);
}

// Sanitize conversation history for Anthropic's strict alternation rules:
//   • first message must be "user"
//   • roles must strictly alternate user ↔ assistant
//   • last entry in history must be "assistant" (we always append user msg below)
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

  // Drop leading assistant messages (e.g. the welcome greeting)
  while (typed.length > 0 && typed[0].role === 'assistant') typed.shift()

  // Enforce strict alternation — keep the more recent message when roles collide
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

  // History must not end on "user" — we always append the new user message
  while (alternated.length > 0 && alternated[alternated.length - 1].role === 'user') {
    alternated.pop()
  }

  return alternated
}

export async function POST(req: Request) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim()
  const groqKey = process.env.GROQ_API_KEY?.trim()

  if (!anthropicKey && !groqKey) {
    return NextResponse.json({
      reply: 'AI assistant not configured.'
    }, { status: 503 })
  }

  try {
    const body = await req.json()
    const { message, history } = body as { message?: string; history?: unknown[] }

    const lowerMsg = message?.toLowerCase() || "";

let intent = "general";

if (lowerMsg.includes("hire")) intent = "hire";
else if (lowerMsg.includes("project")) intent = "project";
else if (lowerMsg.includes("contact")) intent = "contact";
else if (lowerMsg.includes("resume")) intent = "resume";

await sql`
  INSERT INTO ai_analytics (message, intent)
  VALUES (${message}, ${intent})
`;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    const [portfolio, stats] = await Promise.all([getPortfolioContext(), getJourneyStats()])

    const portfolioSnippet = trimPortfolio(portfolio)
    const systemPrompt = buildSystemPrompt(portfolioSnippet, stats.blogCount, stats.certCount)
    const sanitized = sanitizeHistory(history ?? [])
    const chatMessages: ChatMsg[] = [...sanitized, { role: 'user', content: message }]

    // ── Primary call ────────────────────────────────────────────────────────
    if (anthropicKey) {
  try {
    const reply = await callAnthropic(anthropicKey, systemPrompt, chatMessages)

    return NextResponse.json({ reply })

  } catch (e) {
        if (e instanceof ApiError && e.status === 400) {
          // 400 from Anthropic almost always means bad history shape.
          // Retry with NO history — just the current message.
          console.warn('[AI] Anthropic 400 on full history — retrying with no history')
          try {
            const reply = await callAnthropic(anthropicKey, systemPrompt, [
              { role: 'user', content: message },
            ])
            return NextResponse.json({ reply })
          } catch (retryErr) {
            if (retryErr instanceof ApiError) throw retryErr
            throw retryErr
          }
        }
        throw e // 401, 429, 500 — propagate to outer handler
      }
    }

    // ── Groq fallback ────────────────────────────────────────────────────────
    if (!groqKey) {
  return NextResponse.json({
    reply: "Groq API key is missing."
  }, { status: 500 })
}

const reply = await callGroq(groqKey, systemPrompt, chatMessages)
return NextResponse.json({ reply })

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

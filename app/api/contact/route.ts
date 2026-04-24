import { NextResponse } from 'next/server'
import { dbSaveContactMessage, dbGetContactMessages, dbGetContactMessagesSummary } from '@/lib/db'

// Detect hiring intent from message text
function detectIntent(message: string): string {
  const lower = message.toLowerCase()
  const hiringKeywords = [
    'hire', 'hiring', 'job', 'opportunity', 'position', 'role', 'work', 'freelance',
    'contract', 'project', 'collaborate', 'team', 'salary', 'offer', 'interview',
    'recruit', 'developer', 'engineer', 'remote', 'full-time', 'part-time',
  ]
  return hiringKeywords.some(kw => lower.includes(kw)) ? 'hiring' : 'general'
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, message } = body

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const intent = detectIntent(message)
    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    await dbSaveContactMessage({
      id,
      name: name.trim().slice(0, 100),
      email: email.trim().toLowerCase().slice(0, 200),
      message: message.trim().slice(0, 2000),
      intent,
      created_at: Date.now(),
    })

    return NextResponse.json({ ok: true, intent })
  } catch (e) {
    console.error('[contact] POST error:', e)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'list'

    if (type === 'summary') {
      const summary = await dbGetContactMessagesSummary()
      return NextResponse.json({ data: summary })
    }

    const messages = await dbGetContactMessages(50)
    return NextResponse.json({ data: messages })
  } catch (e) {
    console.error('[contact] GET error:', e)
    return NextResponse.json({ data: null }, { status: 500 })
  }
}

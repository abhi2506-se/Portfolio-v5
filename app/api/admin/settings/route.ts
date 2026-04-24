import { NextResponse } from 'next/server'
import { dbGetSettings, dbSetSettings } from '@/lib/db'

export async function GET() {
  try {
    const settings = await dbGetSettings()
    return NextResponse.json({ settings })
  } catch (e) {
    console.error('[settings] get error:', e)
    return NextResponse.json({ settings: {} })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const allowed = [
      'whatsapp_number',
      'calendly_url',
      'hire_email_enabled',
      'resend_api_key',
      'notify_email',
      'chatbot_name',
      'resume_url',
      'current_location',
    ]
    const filtered: Record<string, string> = {}
    for (const key of allowed) {
      if (key in body) filtered[key] = String(body[key])
    }
    await dbSetSettings(filtered)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[settings] save error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

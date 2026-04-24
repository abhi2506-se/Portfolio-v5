import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS portfolio_data (
      key   TEXT PRIMARY KEY DEFAULT 'main',
      data  JSONB NOT NULL,
      updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
    )
  `
}

export async function GET() {
  try {
    await ensureTable()
    const rows = await sql`SELECT data FROM portfolio_data WHERE key = 'main'`
    if (!rows.length) return NextResponse.json(null)
    return NextResponse.json(rows[0].data)
  } catch (e) {
    console.error('GET /api/portfolio error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await ensureTable()
    const data = await req.json()
    const now = Date.now()
    await sql`
      INSERT INTO portfolio_data (key, data, updated_at)
      VALUES ('main', ${JSON.stringify(data)}, ${now})
      ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
    `
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('POST /api/portfolio error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

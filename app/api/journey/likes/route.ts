import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS journey_likes (
      post_id   TEXT PRIMARY KEY,
      data      JSONB NOT NULL DEFAULT '{"count":0,"comments":[]}'::jsonb
    )
  `
}

export async function GET(req: Request) {
  try {
    await ensureTable()
    const { searchParams } = new URL(req.url)
    const postId = searchParams.get('postId')
    if (!postId) return NextResponse.json({ error: 'Missing postId' }, { status: 400 })
    const rows = await sql`SELECT data FROM journey_likes WHERE post_id = ${postId}`
    if (!rows.length) return NextResponse.json({ count: 0, comments: [] })
    return NextResponse.json(rows[0].data)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await ensureTable()
    const body = await req.json()
    const { postId, action } = body

    // Get current data
    const rows = await sql`SELECT data FROM journey_likes WHERE post_id = ${postId}`
    const current = rows.length ? rows[0].data : { count: 0, comments: [] }

    let updated = { ...current }

    if (action === 'like') {
      updated.count = (updated.count || 0) + 1
    } else if (action === 'comment') {
      const { author, text } = body
      const comment = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        author: author || 'Anonymous',
        text,
        createdAt: Date.now(),
      }
      updated.comments = [...(updated.comments || []), comment]
    } else if (action === 'deleteComment') {
      const { commentId } = body
      updated.comments = (updated.comments || []).filter((c: any) => c.id !== commentId)
    }

    await sql`
      INSERT INTO journey_likes (post_id, data) VALUES (${postId}, ${JSON.stringify(updated)})
      ON CONFLICT (post_id) DO UPDATE SET data = EXCLUDED.data
    `
    return NextResponse.json(updated)
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

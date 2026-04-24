import { NextResponse } from 'next/server'
import { dbGetBlogs, dbSaveBlog, dbDeleteBlog } from '@/lib/db'

export async function GET() {
  try {
    const blogs = await dbGetBlogs()
    return NextResponse.json(blogs)
  } catch (e) {
    console.error('GET /api/journey/blogs error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const post = await req.json()
    await dbSaveBlog(post)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('POST /api/journey/blogs error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    await dbDeleteBlog(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/journey/blogs error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

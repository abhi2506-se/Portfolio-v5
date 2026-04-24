import { NextResponse } from 'next/server'
import { getAdminCredentials } from '@/lib/credentials-store'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, password } = body

    const admin = getAdminCredentials()

    // 🔥 Safety check
    if (!admin.username || !admin.password) {
      return NextResponse.json(
        { error: "Admin credentials not set in environment variables" },
        { status: 500 }
      )
    }

    if (
      username === admin.username &&
      password === admin.password
    ) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    )
  } catch (error) {
    console.error(error) // 👈 important
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    )
  }
}

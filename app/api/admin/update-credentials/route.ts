import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({
    success: false,
    message: "Updating credentials is disabled on Vercel. Please change ADMIN_USERNAME and ADMIN_PASSWORD in environment variables.",
  })
}

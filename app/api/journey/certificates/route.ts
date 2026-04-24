import { NextResponse } from 'next/server'
import { dbGetCertificates, dbSaveCertificate, dbDeleteCertificate } from '@/lib/db'

export async function GET() {
  try {
    const certs = await dbGetCertificates()
    return NextResponse.json(certs)
  } catch (e) {
    console.error('GET /api/journey/certificates error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const cert = await req.json()
    await dbSaveCertificate(cert)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('POST /api/journey/certificates error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()
    await dbDeleteCertificate(id)
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/journey/certificates error:', e)
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

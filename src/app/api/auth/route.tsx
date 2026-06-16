import { NextRequest, NextResponse } from 'next/server'
import { setAdminCookie, clearAdminCookie } from '@/lib/adminAuth'

export async function POST(req: NextRequest) {
  const { password, action } = await req.json()

  if (action === 'logout') {
    const res = NextResponse.json({ ok: true })
    clearAdminCookie(res)
    return res
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  setAdminCookie(res)
  return res
}

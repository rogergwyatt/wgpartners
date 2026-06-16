import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const cart = await req.json()
    if (!cart.sessionId || !cart.email) return NextResponse.json({ ok: true })

    const db = supabaseAdmin()
    await db.from('cart_sessions').upsert({
      session_id: cart.sessionId,
      email: cart.email,
      cart_data: cart,
      updated_at: new Date().toISOString(),
      recovered: false,
    }, { onConflict: 'session_id' })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true }) // fail silently — cart tracking is non-critical
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Public endpoint — the Stripe payment intent ID acts as an unguessable
// access token, the same way the order UUID does on the tracking page.
export async function GET(req: NextRequest) {
  const pi = req.nextUrl.searchParams.get('pi')
  if (!pi) return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 })

  const db = supabaseAdmin()
  const { data } = await db
    .from('orders')
    .select('id, status, email, items, subtotal, shipping, total, shipping_address, created_at')
    .eq('stripe_payment_intent_id', pi)
    .single()

  if (!data) return NextResponse.json({ order: null }, { status: 404 })
  return NextResponse.json({ order: data })
}

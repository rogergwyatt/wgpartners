import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json()
  if (!code) return NextResponse.json({ error: 'No code provided' }, { status: 400 })

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('promo_codes')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('active', true)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Invalid or expired code' }, { status: 404 })

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This code has expired' }, { status: 400 })
  }

  if (data.max_uses !== null && data.uses >= data.max_uses) {
    return NextResponse.json({ error: 'This code has reached its usage limit' }, { status: 400 })
  }

  if (subtotal < data.min_order) {
    return NextResponse.json({ error: `Minimum order of $${data.min_order.toFixed(2)} required` }, { status: 400 })
  }

  const discount = data.type === 'percent'
    ? Math.round(subtotal * (data.value / 100) * 100) / 100
    : Math.min(data.value, subtotal)

  return NextResponse.json({
    valid: true,
    code: data.code,
    type: data.type,
    value: data.value,
    discount,
    description: data.description,
  })
}

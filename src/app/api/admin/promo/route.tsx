import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminAuthenticated } from '@/lib/adminAuth'

export async function GET() {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = supabaseAdmin()
  const { data } = await db.from('promo_codes').select('*').order('created_at', { ascending: false })
  return NextResponse.json({ codes: data ?? [] })
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const db = supabaseAdmin()
  const { data, error } = await db.from('promo_codes').insert({
    code: body.code.toUpperCase().trim(),
    description: body.description ?? '',
    type: body.type ?? 'percent',
    value: body.value,
    min_order: body.min_order ?? 0,
    max_uses: body.max_uses ?? null,
    expires_at: body.expires_at ?? null,
    active: true,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ code: data })
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, active } = await req.json()
  const db = supabaseAdmin()
  await db.from('promo_codes').update({ active }).eq('id', id)
  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminAuthenticated } from '@/lib/adminAuth'
import { logCustomerEvent } from '@/lib/customers'

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = supabaseAdmin()
  const search = req.nextUrl.searchParams.get('q') ?? ''

  let query = db
    .from('customers')
    .select('id, email, name, phone, events, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (search) query = query.ilike('email', `%${search}%`)

  const { data: customers } = await query

  // Enrich with order stats
  const { data: orders } = await db
    .from('orders')
    .select('email, total, created_at, status')
    .neq('status', 'cancelled')

  const statsMap: Record<string, { orderCount: number; totalSpend: number; lastOrderAt: string }> = {}
  for (const order of orders ?? []) {
    const e = order.email
    if (!statsMap[e]) statsMap[e] = { orderCount: 0, totalSpend: 0, lastOrderAt: '' }
    statsMap[e].orderCount++
    statsMap[e].totalSpend += Number(order.total ?? 0)
    if (!statsMap[e].lastOrderAt || order.created_at > statsMap[e].lastOrderAt) {
      statsMap[e].lastOrderAt = order.created_at
    }
  }

  const enriched = (customers ?? []).map(c => ({
    ...c,
    ...(statsMap[c.email] ?? { orderCount: 0, totalSpend: 0, lastOrderAt: null }),
  }))

  return NextResponse.json({ customers: enriched })
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, note, name, phone } = await req.json()
  const db = supabaseAdmin()

  if (note) {
    const { data: customer } = await db.from('customers').select('email').eq('id', id).single()
    if (customer) await logCustomerEvent(customer.email, 'note', note)
  }

  if (name !== undefined || phone !== undefined) {
    await db.from('customers').update({ name, phone, updated_at: new Date().toISOString() }).eq('id', id)
  }

  return NextResponse.json({ ok: true })
}

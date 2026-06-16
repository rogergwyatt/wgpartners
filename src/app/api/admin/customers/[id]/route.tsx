import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminAuthenticated } from '@/lib/adminAuth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = supabaseAdmin()
  const { data: customer } = await db.from('customers').select('*').eq('id', params.id).single()
  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [{ data: orders }, { data: customOrders }] = await Promise.all([
    db.from('orders').select('*').eq('email', customer.email).order('created_at', { ascending: false }),
    db.from('custom_orders').select('*').eq('email', customer.email).order('created_at', { ascending: false }),
  ])

  const totalSpend = (orders ?? []).filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total ?? 0), 0)

  return NextResponse.json({ customer, orders: orders ?? [], customOrders: customOrders ?? [], totalSpend })
}

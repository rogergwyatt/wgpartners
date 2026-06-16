import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminAuthenticated } from '@/lib/adminAuth'

export async function GET() {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = supabaseAdmin()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayISO = todayStart.toISOString()

  const [
    { data: allOrders },
    { data: todayOrders },
    { data: abandonedCarts },
    { data: promoCodes },
    { data: revenueData },
    { count: customerCount },
    { count: newCustomOrders },
  ] = await Promise.all([
    db.from('orders').select('id, status').neq('status', 'cancelled'),
    db.from('orders').select('*').gte('created_at', todayISO).order('created_at', { ascending: false }),
    db.from('cart_sessions').select('id, email, cart_data, updated_at').eq('recovered', false).not('email', 'is', null),
    db.from('promo_codes').select('*').eq('active', true).order('created_at', { ascending: false }),
    db.from('orders').select('total').neq('status', 'cancelled'),
    db.from('customers').select('*', { count: 'exact', head: true }),
    db.from('custom_orders').select('*', { count: 'exact', head: true }).eq('status', 'new'),
  ])

  const totalRevenue = (revenueData ?? []).reduce((sum, o) => sum + Number(o.total ?? 0), 0)
  const todayRevenue = (todayOrders ?? []).reduce((sum, o) => sum + Number(o.total ?? 0), 0)

  const statusCounts = (allOrders ?? []).reduce((acc: Record<string, number>, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1
    return acc
  }, {})

  return NextResponse.json({
    totalRevenue,
    todayRevenue,
    totalOrders: allOrders?.length ?? 0,
    todayOrders: todayOrders ?? [],
    statusCounts,
    abandonedCarts: abandonedCarts ?? [],
    promoCodes: promoCodes ?? [],
    customerCount: customerCount ?? 0,
    newCustomOrders: newCustomOrders ?? 0,
  })
}

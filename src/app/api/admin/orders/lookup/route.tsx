import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ orders: [] })

  const db = supabaseAdmin()
  const { data } = await db
    .from('orders')
    .select('id, status, total, created_at, items, tracking_number')
    .eq('email', email.toLowerCase().trim())
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({ orders: data ?? [] })
}

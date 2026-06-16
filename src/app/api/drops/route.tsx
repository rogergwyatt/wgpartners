import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Public: returns drops that are live and released (release_at null or past),
// each with its items. Used by the shop page's "Latest Drop" section.
export async function GET() {
  const db = supabaseAdmin()
  const nowISO = new Date().toISOString()

  const { data: drops } = await db
    .from('drops')
    .select('*')
    .eq('status', 'live')
    .or(`release_at.is.null,release_at.lte.${nowISO}`)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (!drops || drops.length === 0) return NextResponse.json({ drops: [] })

  const ids = drops.map(d => d.id)
  const { data: items } = await db
    .from('drop_items')
    .select('*')
    .in('drop_id', ids)
    .order('sort_order', { ascending: true })

  const withItems = drops.map(d => ({
    ...d,
    items: (items ?? []).filter(i => i.drop_id === d.id),
  }))

  return NextResponse.json({ drops: withItems })
}

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminAuthenticated } from '@/lib/adminAuth'

export async function GET() {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = supabaseAdmin()
  const { data: drops } = await db.from('drops').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false })
  const { data: items } = await db.from('drop_items').select('*').order('sort_order')
  const withItems = (drops ?? []).map(d => ({ ...d, items: (items ?? []).filter(i => i.drop_id === d.id) }))
  return NextResponse.json({ drops: withItems })
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const db = supabaseAdmin()

  if (body.kind === 'drop') {
    const { data, error } = await db.from('drops')
      .insert({ title: body.title, description: body.description ?? null, status: 'draft' })
      .select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ drop: { ...data, items: [] } })
  }

  if (body.kind === 'item') {
    const imageUrls: string[] = Array.isArray(body.image_urls) ? body.image_urls : []
    const { data, error } = await db.from('drop_items').insert({
      drop_id: body.drop_id,
      name: body.name,
      description: body.description ?? null,
      image_urls: imageUrls,
      image_url: imageUrls[0] ?? body.image_url ?? null,
      video_url: body.video_url ?? null,
      price: Number(body.price),
      quantity: Number(body.quantity) || 1,
      allow_engraving: body.allow_engraving ?? true,
      length_in: body.length_in ? Number(body.length_in) : null,
      width_in: body.width_in ? Number(body.width_in) : null,
      thickness_in: body.thickness_in ? Number(body.thickness_in) : null,
      juice_groove_available: body.juice_groove_available ?? true,
      juice_groove_price: body.juice_groove_price ? Number(body.juice_groove_price) : 0,
      weight_lbs: body.weight_lbs ? Number(body.weight_lbs) : 3,
      sort_order: body.sort_order ?? 0,
    }).select('*').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ item: data })
  }

  return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const db = supabaseAdmin()

  if (body.kind === 'drop') {
    const update: Record<string, unknown> = {}
    if (body.title !== undefined) update.title = body.title
    if (body.description !== undefined) update.description = body.description
    if (body.status !== undefined) update.status = body.status
    if (body.release_at !== undefined) update.release_at = body.release_at || null
    if (body.sort_order !== undefined) update.sort_order = Number(body.sort_order)
    const { error } = await db.from('drops').update(update).eq('id', body.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  if (body.kind === 'item') {
    const update: Record<string, unknown> = {}
    for (const f of ['name', 'description', 'video_url', 'allow_engraving', 'juice_groove_available']) {
      if (body[f] !== undefined) update[f] = body[f]
    }
    if (body.image_urls !== undefined) {
      const arr: string[] = Array.isArray(body.image_urls) ? body.image_urls : []
      update.image_urls = arr
      update.image_url = arr[0] ?? null
    }
    if (body.price !== undefined) update.price = Number(body.price)
    if (body.quantity !== undefined) update.quantity = Number(body.quantity)
    if (body.length_in !== undefined) update.length_in = body.length_in ? Number(body.length_in) : null
    if (body.width_in !== undefined) update.width_in = body.width_in ? Number(body.width_in) : null
    if (body.thickness_in !== undefined) update.thickness_in = body.thickness_in ? Number(body.thickness_in) : null
    if (body.juice_groove_price !== undefined) update.juice_groove_price = body.juice_groove_price ? Number(body.juice_groove_price) : 0
    if (body.sort_order !== undefined) update.sort_order = Number(body.sort_order)
    if (body.sold !== undefined) update.sold = Number(body.sold)
    const { error } = await db.from('drop_items').update(update).eq('id', body.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown kind' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { kind, id } = await req.json()
  const db = supabaseAdmin()
  const table = kind === 'drop' ? 'drops' : 'drop_items'
  const { error } = await db.from(table).delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

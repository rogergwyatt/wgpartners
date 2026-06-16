import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isAdminAuthenticated } from '@/lib/adminAuth'

export const dynamic = 'force-dynamic'

// Whitelist of writable columns; values are taken from the request body as-is.
function columnsFromBody(body: any): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const passthrough = ['slug', 'name', 'tagline', 'description', 'category', 'video_url']
  for (const f of passthrough) if (body[f] !== undefined) out[f] = body[f] || null
  if (body.images !== undefined) out.images = Array.isArray(body.images) ? body.images : []
  if (body.options !== undefined) out.options = Array.isArray(body.options) ? body.options : []
  if (body.base_price !== undefined) out.base_price = Number(body.base_price)
  if (body.sale_price !== undefined) out.sale_price = body.sale_price === '' || body.sale_price == null ? null : Number(body.sale_price)
  if (body.weight_lbs !== undefined) out.weight_lbs = body.weight_lbs ? Number(body.weight_lbs) : 3
  if (body.length_in !== undefined) out.length_in = body.length_in ? Number(body.length_in) : null
  if (body.width_in !== undefined) out.width_in = body.width_in ? Number(body.width_in) : null
  if (body.height_in !== undefined) out.height_in = body.height_in ? Number(body.height_in) : null
  if (body.featured !== undefined) out.featured = !!body.featured
  if (body.in_stock !== undefined) out.in_stock = !!body.in_stock
  if (body.sort_order !== undefined) out.sort_order = Number(body.sort_order)
  return out
}

function friendlyError(error: { message: string; code?: string }) {
  if (error.code === '23505' || /duplicate key/i.test(error.message)) {
    return 'That slug is already in use — choose a different one.'
  }
  return error.message
}

export async function GET() {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabaseAdmin()
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ products: data ?? [] })
}

export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  if (!body.name || !body.slug || body.base_price === undefined || body.base_price === '') {
    return NextResponse.json({ error: 'name, slug, and base_price are required.' }, { status: 400 })
  }
  const insert = { ...columnsFromBody(body), name: body.name, slug: body.slug, base_price: Number(body.base_price) }
  const { data, error } = await supabaseAdmin().from('products').insert(insert).select('*').single()
  if (error) return NextResponse.json({ error: friendlyError(error) }, { status: 400 })
  return NextResponse.json({ product: data })
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  const update = columnsFromBody(body)
  const { error } = await supabaseAdmin().from('products').update(update).eq('id', body.id)
  if (error) return NextResponse.json({ error: friendlyError(error) }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  const { error } = await supabaseAdmin().from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

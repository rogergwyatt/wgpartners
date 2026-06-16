import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/products'
import { supabaseAdmin } from '@/lib/supabase'

const BASE = 'https://www.rogerandsally.com'

// Regenerate on request so newly released drops appear without a rebuild.
export const dynamic = 'force-dynamic'

// Live, released drop item pages (/shop/drop/[id]). Best-effort: never let a
// DB hiccup (or a missing drops table) break the sitemap.
async function dropPages(now: Date): Promise<MetadataRoute.Sitemap> {
  try {
    const db = supabaseAdmin()
    const nowISO = now.toISOString()
    const { data: drops } = await db
      .from('drops')
      .select('id')
      .eq('status', 'live')
      .or(`release_at.is.null,release_at.lte.${nowISO}`)
    const ids = (drops ?? []).map(d => d.id)
    if (ids.length === 0) return []

    const { data: items } = await db
      .from('drop_items')
      .select('id, created_at, drop_id')
      .in('drop_id', ids)
    return (items ?? []).map(item => ({
      url: `${BASE}/shop/drop/${item.id}`,
      lastModified: item.created_at ? new Date(item.created_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/shop`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/philosophy`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/custom-order`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/order/lookup`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const allProducts = await getProducts()
  const productPages: MetadataRoute.Sitemap = allProducts.map(p => ({
    url: `${BASE}/shop/${p.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const drops = await dropPages(now)

  return [...staticPages, ...productPages, ...drops]
}

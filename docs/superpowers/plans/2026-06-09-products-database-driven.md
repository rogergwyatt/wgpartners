# Database-Driven Products Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the product catalog from `src/data/products.json` into a `products` Supabase table with a full Admin → Products management page, while preserving existing shop, checkout, shipping, and SEO behavior.

**Architecture:** A `products` table (options/images as JSONB) is read through a new `src/lib/products.ts` data layer via `supabaseAdmin()`. The shop grid, product detail page, and sitemap call the data layer; product pages render dynamically. Checkout and shipping use the product snapshot already embedded in each cart/order item, so they need neither the JSON nor a DB call. An admin CRUD API + page manage products including a nested options editor.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (Postgres, JSONB), Vercel Blob (images/video via existing GraphicUpload/VideoUpload).

**Verification note:** This project has no unit-test runner. Per the existing workflow, verify each task with `npx tsc --noEmit` and `rm -rf build .next && npx next build`. Live DB/curl checks happen after the owner creates the table (see Task 9 handoff) — do not block code tasks on a live DB. Do not add a test framework.

**Key facts for the implementer:**
- The `Product` and `ProductOption` types live in `src/lib/types.ts` and are UNCHANGED. Shape:
  `Product { id, slug, name, tagline, description, images: string[], video?, category, options: ProductOption[], basePrice, salePrice?, weightLbs, dimensionsInches:{length,width,height}, featured, inStock }`
  `ProductOption { name, key, type?: 'text', placeholder?, priceModifier?, choices?: {label, priceModifier}[] }`
- `supabaseAdmin()` from `src/lib/supabase.ts` returns a service-role client (bypasses RLS).
- `isAdminAuthenticated()` from `src/lib/adminAuth.ts` gates admin routes.
- Admin API routes use the `.tsx` extension (e.g. `src/app/api/admin/drops/route.tsx`).
- Reusable upload components: `@/controls/GraphicUpload` (`value`, `onChange(url)`, `onUploadingChange`, `label`) and `@/controls/VideoUpload` (`value`, `onChange(url)`, `onUploadingChange`, `label`).

---

### Task 1: Schema — products table

**Files:**
- Modify: `src/lib/supabase-schema.sql`

- [ ] **Step 1: Append the table definition**

At the END of `src/lib/supabase-schema.sql`, add:

```sql
-- Catalog products (replaces src/data/products.json). Options and images as JSONB.
create table if not exists products (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  tagline      text,
  description  text,
  images       jsonb not null default '[]',   -- array of image URLs (first = primary)
  video_url    text,
  category     text,
  options      jsonb not null default '[]',   -- ProductOption[] (same shape as products.json)
  base_price   numeric(10,2) not null,
  sale_price   numeric(10,2),
  weight_lbs   numeric(6,2) not null default 3,
  length_in    numeric(6,2),
  width_in     numeric(6,2),
  height_in    numeric(6,2),
  featured     boolean not null default false,
  in_stock     boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now()
);
create index if not exists idx_products_sort on products (sort_order);
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/supabase-schema.sql
git commit -m "Products DB: products table schema"
```

NOTE: The owner must run this in Supabase before live testing (DDL can't run via supabase-js). Flag in the final handoff.

---

### Task 2: Data-access layer

**Files:**
- Create: `src/lib/products.ts`

- [ ] **Step 1: Create the module**

Create `src/lib/products.ts`:

```ts
import { supabaseAdmin } from './supabase'
import { Product } from './types'

// Map a products table row (snake_case) to the camelCase Product type.
export function dbRowToProduct(r: any): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    tagline: r.tagline ?? '',
    description: r.description ?? '',
    images: Array.isArray(r.images) ? r.images : [],
    video: r.video_url ?? undefined,
    category: r.category ?? '',
    options: Array.isArray(r.options) ? r.options : [],
    basePrice: Number(r.base_price),
    salePrice: r.sale_price != null ? Number(r.sale_price) : undefined,
    weightLbs: r.weight_lbs != null ? Number(r.weight_lbs) : 3,
    dimensionsInches: {
      length: r.length_in != null ? Number(r.length_in) : 0,
      width: r.width_in != null ? Number(r.width_in) : 0,
      height: r.height_in != null ? Number(r.height_in) : 0,
    },
    featured: !!r.featured,
    inStock: !!r.in_stock,
  }
}

// All products, catalog order. Returns [] on any failure.
export async function getProducts(): Promise<Product[]> {
  try {
    const { data } = await supabaseAdmin()
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
    return (data ?? []).map(dbRowToProduct)
  } catch {
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data } = await supabaseAdmin().from('products').select('*').eq('slug', slug).single()
    return data ? dbRowToProduct(data) : null
  } catch {
    return null
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data } = await supabaseAdmin().from('products').select('*').eq('id', id).single()
    return data ? dbRowToProduct(data) : null
  } catch {
    return null
  }
}
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/lib/products.ts
git commit -m "Products DB: data-access layer"
```

---

### Task 3: Shop grid reads from DB

**Files:**
- Modify: `src/app/shop/page.tsx`

- [ ] **Step 1: Replace the JSON import with the data layer**

In `src/app/shop/page.tsx`:

1. Remove the line `import products from '@/data/products.json'`.
2. Add `import { getProducts } from '@/lib/products'` near the other imports.
3. Change the component to async and fetch products. Find:
```tsx
export default function ShopPage() {
  return (
```
Replace with:
```tsx
export default async function ShopPage() {
  const products = await getProducts()
  return (
```
4. The existing grid maps `(products as Product[])`. Change `(products as Product[]).map(` to `products.map(`. (Remove the `as Product[]` cast since `products` is already `Product[]`.) If the `Product` import becomes unused after this, remove it.

- [ ] **Step 2: Verify typecheck + build**

Run: `npx tsc --noEmit && rm -rf build .next && npx next build`
Expected: typecheck clean; "Compiled successfully"; `/shop` is ƒ (dynamic). Then `rm -rf build .next`.

- [ ] **Step 3: Commit**

```bash
git add src/app/shop/page.tsx
git commit -m "Products DB: shop grid reads from database"
```

---

### Task 4: Product detail page reads from DB (dynamic)

**Files:**
- Modify: `src/app/shop/[slug]/page.tsx`

- [ ] **Step 1: Swap JSON for the data layer and make it dynamic**

In `src/app/shop/[slug]/page.tsx`:

1. Remove `import products from '@/data/products.json'`.
2. Add `import { getProductBySlug } from '@/lib/products'`.
3. Add near the top (after imports): `export const dynamic = 'force-dynamic'`
4. DELETE the entire `generateStaticParams` function:
```tsx
export async function generateStaticParams() {
  return (products as Product[]).map(p => ({ slug: p.slug }))
}
```
5. In `generateMetadata`, change:
```tsx
  const product = (products as Product[]).find(p => p.slug === params.slug)
```
to:
```tsx
  const product = await getProductBySlug(params.slug)
```
6. Change the page component signature and lookup. Find:
```tsx
export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = (products as Product[]).find(p => p.slug === params.slug)
  if (!product) notFound()
```
Replace with:
```tsx
export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()
```
7. If the `Product` type import is now unused, remove it; if still referenced elsewhere in the file, leave it.

- [ ] **Step 2: Verify typecheck + build**

Run: `npx tsc --noEmit && rm -rf build .next && npx next build`
Expected: clean; "Compiled successfully"; `/shop/[slug]` shows as ƒ (dynamic) — it should no longer be SSG (●). Then `rm -rf build .next`.

- [ ] **Step 3: Commit**

```bash
git add "src/app/shop/[slug]/page.tsx"
git commit -m "Products DB: product detail page reads from database (dynamic)"
```

---

### Task 5: Sitemap reads products from DB

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Replace the JSON import**

In `src/app/sitemap.ts`:

1. Remove `import products from '@/data/products.json'`.
2. Add `import { getProducts } from '@/lib/products'`.
3. Find the product pages block:
```ts
  const productPages: MetadataRoute.Sitemap = (products as { slug: string }[]).map(p => ({
    url: `${BASE}/shop/${p.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))
```
Replace with:
```ts
  const allProducts = await getProducts()
  const productPages: MetadataRoute.Sitemap = allProducts.map(p => ({
    url: `${BASE}/shop/${p.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))
```
(The file already has `export const dynamic = 'force-dynamic'` and an async `sitemap()` from the drops sitemap work; do not duplicate them.)

- [ ] **Step 2: Verify typecheck + build**

Run: `npx tsc --noEmit && rm -rf build .next && npx next build`
Expected: clean; "Compiled successfully". Then `rm -rf build .next`.

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "Products DB: sitemap reads products from database"
```

---

### Task 6: Checkout + shipping use the cart/order snapshot

**Files:**
- Modify: `src/app/checkout/page.tsx`
- Modify: `src/app/api/admin/shipping-label/route.tsx`

Both currently re-look-up the product in `products.json` to get weight/dimensions. The cart/order item already embeds the full product (`item.product`) with `weightLbs` and `dimensionsInches`, so use that — it needs no JSON and works for old and new orders.

- [ ] **Step 1: checkout — use the snapshot weight**

In `src/app/checkout/page.tsx`:
1. Remove `import products from '@/data/products.json'`.
2. Find:
```tsx
    const totalWeight = cart.items.reduce((sum, item) => {
      const p = (products as Product[]).find(p => p.id === item.product.id)
      return sum + (p?.weightLbs ?? 2) * item.quantity
    }, 0)
```
Replace with:
```tsx
    const totalWeight = cart.items.reduce((sum, item) => {
      return sum + (item.product.weightLbs ?? 2) * item.quantity
    }, 0)
```
3. If the `Product` type import is now unused in this file, remove it; otherwise leave it.

- [ ] **Step 2: shipping-label — use the snapshot weight + dimensions**

In `src/app/api/admin/shipping-label/route.tsx`:
1. Remove `import products from '@/data/products.json'` and, if it becomes unused, the `import { Product } from '@/lib/types'` line.
2. Find inside `buildParcel`:
```ts
  for (const item of items) {
    const p = (products as Product[]).find(pr => pr.id === item.product?.id)
    const qty = item.quantity ?? 1
    totalWeightLb += (p?.weightLbs ?? 2) * qty
    const d = p?.dimensionsInches
    if (d) {
      maxL = Math.max(maxL, d.length)
      maxW = Math.max(maxW, d.width)
      maxH = Math.max(maxH, d.height * qty) // stack height grows with qty
    }
  }
```
Replace with:
```ts
  for (const item of items) {
    const p = item.product
    const qty = item.quantity ?? 1
    totalWeightLb += (p?.weightLbs ?? 2) * qty
    const d = p?.dimensionsInches
    if (d) {
      maxL = Math.max(maxL, d.length)
      maxW = Math.max(maxW, d.width)
      maxH = Math.max(maxH, d.height * qty) // stack height grows with qty
    }
  }
```

- [ ] **Step 3: Verify typecheck + build**

Run: `npx tsc --noEmit && rm -rf build .next && npx next build`
Expected: clean; "Compiled successfully". Then `rm -rf build .next`.

- [ ] **Step 4: Commit**

```bash
git add src/app/checkout/page.tsx src/app/api/admin/shipping-label/route.tsx
git commit -m "Products DB: checkout + shipping use cart item snapshot"
```

---

### Task 7: Admin products API

**Files:**
- Create: `src/app/api/admin/products/route.tsx`

- [ ] **Step 1: Create the route**

Create `src/app/api/admin/products/route.tsx`:

```ts
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
```

- [ ] **Step 2: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/products/route.tsx
git commit -m "Products DB: admin products CRUD API"
```

---

### Task 8: Admin products page + nav link

**Files:**
- Create: `src/app/admin/(protected)/products/page.tsx`
- Modify: `src/controls/admin/AdminNav.tsx`

- [ ] **Step 1: Add the nav link**

In `src/controls/admin/AdminNav.tsx`, find:
```tsx
  { href: '/admin/drops', label: 'Drops', icon: '✦' },
```
Insert immediately after it:
```tsx
  { href: '/admin/products', label: 'Products', icon: '🪚' },
```

- [ ] **Step 2: Create the admin page**

Create `src/app/admin/(protected)/products/page.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { serif } from '@/controls/fonts'
import GraphicUpload from '@/controls/GraphicUpload'
import VideoUpload from '@/controls/VideoUpload'

type Choice = { label: string; priceModifier: number }
type Opt = { name: string; key: string; type?: 'text'; placeholder?: string; priceModifier?: number; choices?: Choice[] }

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// Map a DB row to the editable draft used by the form.
function rowToDraft(r: any) {
  return {
    id: r.id,
    slug: r.slug ?? '',
    name: r.name ?? '',
    tagline: r.tagline ?? '',
    description: r.description ?? '',
    category: r.category ?? '',
    images: Array.isArray(r.images) ? r.images : [],
    video_url: r.video_url ?? undefined,
    options: (Array.isArray(r.options) ? r.options : []) as Opt[],
    base_price: r.base_price ?? '',
    sale_price: r.sale_price ?? '',
    weight_lbs: r.weight_lbs ?? '',
    length_in: r.length_in ?? '',
    width_in: r.width_in ?? '',
    height_in: r.height_in ?? '',
    featured: !!r.featured,
    in_stock: r.in_stock ?? true,
  }
}

const blankDraft = () => rowToDraft({ in_stock: true, options: [], images: [] })

export default function ProductsAdminPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null) // product id, or 'new', or null
  const [draft, setDraft] = useState<any>(blankDraft())
  const [mediaBusy, setMediaBusy] = useState(false)
  const [saving, setSaving] = useState(false)

  function load() {
    fetch('/api/admin/products')
      .then(r => { if (r.status === 401) { router.push('/admin/login'); return null } return r.json() })
      .then(d => { if (d) { setProducts(d.products ?? []); setLoading(false) } })
  }
  useEffect(() => { load() }, [])

  function startNew() { setDraft(blankDraft()); setEditing('new') }
  function startEdit(p: any) { setDraft(rowToDraft(p)); setEditing(p.id) }
  function cancel() { setEditing(null) }

  function set(patch: any) { setDraft((d: any) => ({ ...d, ...patch })) }

  // Options helpers
  function addOption() { set({ options: [...draft.options, { name: '', key: '', choices: [{ label: '', priceModifier: 0 }] }] }) }
  function removeOption(i: number) { set({ options: draft.options.filter((_: Opt, idx: number) => idx !== i) }) }
  function updateOption(i: number, patch: Partial<Opt>) {
    set({ options: draft.options.map((o: Opt, idx: number) => idx === i ? { ...o, ...patch } : o) })
  }
  function setOptionName(i: number, name: string) { updateOption(i, { name, key: slugify(name) }) }
  function setOptionType(i: number, type: 'choices' | 'text') {
    if (type === 'text') updateOption(i, { type: 'text', priceModifier: draft.options[i].priceModifier ?? 0, placeholder: draft.options[i].placeholder ?? '', choices: undefined })
    else updateOption(i, { type: undefined, placeholder: undefined, priceModifier: undefined, choices: draft.options[i].choices ?? [{ label: '', priceModifier: 0 }] })
  }
  function addChoice(i: number) { updateOption(i, { choices: [...(draft.options[i].choices ?? []), { label: '', priceModifier: 0 }] }) }
  function removeChoice(i: number, ci: number) { updateOption(i, { choices: (draft.options[i].choices ?? []).filter((_: Choice, idx: number) => idx !== ci) }) }
  function updateChoice(i: number, ci: number, patch: Partial<Choice>) {
    updateOption(i, { choices: (draft.options[i].choices ?? []).map((c: Choice, idx: number) => idx === ci ? { ...c, ...patch } : c) })
  }

  async function save() {
    if (!draft.name || !draft.slug || draft.base_price === '' || draft.base_price == null) {
      alert('Name, slug, and base price are required.'); return
    }
    setSaving(true)
    const payload = { ...draft }
    const isNew = editing === 'new'
    const res = await fetch('/api/admin/products', {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { alert(data.error || 'Save failed'); return }
    setEditing(null)
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this product?')) return
    await fetch('/api/admin/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setProducts(p => p.filter(x => x.id !== id))
  }

  async function move(index: number, dir: -1 | 1) {
    const j = index + dir
    if (j < 0 || j >= products.length) return
    const reordered = [...products]
    ;[reordered[index], reordered[j]] = [reordered[j], reordered[index]]
    setProducts(reordered)
    await Promise.all(reordered.map((p, i) =>
      fetch('/api/admin/products', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, sort_order: i }) })
    ))
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-slate">Loading…</div>

  const photos: string[] = draft.images ?? []

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl text-walnut ${serif.className}`}>Products</h1>
        {editing === null && (
          <button onClick={startNew} className="bg-cherry text-white px-4 py-2 rounded text-sm font-semibold hover:bg-opacity-90">+ New Product</button>
        )}
      </div>

      {editing !== null ? (
        <div className="bg-white border border-maple rounded-lg p-5 space-y-3">
          <h2 className={`text-lg text-walnut ${serif.className}`}>{editing === 'new' ? 'New product' : 'Edit product'}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input placeholder="Name" value={draft.name} onChange={e => set({ name: e.target.value, slug: draft.slug || slugify(e.target.value) })}
              className="border border-maple rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-cherry" />
            <input placeholder="Slug (url)" value={draft.slug} onChange={e => set({ slug: slugify(e.target.value) })}
              className="border border-maple rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-cherry" />
          </div>
          <input placeholder="Tagline" value={draft.tagline} onChange={e => set({ tagline: e.target.value })}
            className="w-full border border-maple rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-cherry" />
          <textarea placeholder="Description" rows={3} value={draft.description} onChange={e => set({ description: e.target.value })}
            className="w-full border border-maple rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-cherry" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input placeholder="Category" value={draft.category} onChange={e => set({ category: e.target.value })}
              className="border border-maple rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-cherry" />
            <input type="number" step="0.01" placeholder="Base price" value={draft.base_price} onChange={e => set({ base_price: e.target.value })}
              className="border border-maple rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-cherry" />
            <input type="number" step="0.01" placeholder="Sale price (optional)" value={draft.sale_price} onChange={e => set({ sale_price: e.target.value })}
              className="border border-maple rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-cherry" />
            <input type="number" step="0.01" placeholder="Weight (lbs)" value={draft.weight_lbs} onChange={e => set({ weight_lbs: e.target.value })}
              className="border border-maple rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-cherry" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <input type="number" step="0.25" placeholder="Length in" value={draft.length_in} onChange={e => set({ length_in: e.target.value })}
              className="border border-maple rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-cherry" />
            <input type="number" step="0.25" placeholder="Width in" value={draft.width_in} onChange={e => set({ width_in: e.target.value })}
              className="border border-maple rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-cherry" />
            <input type="number" step="0.125" placeholder="Height in" value={draft.height_in} onChange={e => set({ height_in: e.target.value })}
              className="border border-maple rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-cherry" />
          </div>
          <div className="flex gap-6 text-sm text-slate">
            <label className="flex items-center gap-2"><input type="checkbox" checked={draft.featured} onChange={e => set({ featured: e.target.checked })} className="accent-cherry" /> Featured</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={draft.in_stock} onChange={e => set({ in_stock: e.target.checked })} className="accent-cherry" /> In stock</label>
          </div>

          {/* Photos */}
          <div>
            <p className="text-xs font-semibold text-walnut mb-1">Photos</p>
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative h-16 w-16 rounded overflow-hidden border border-maple">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => set({ images: photos.filter((_, idx) => idx !== i) })} className="absolute top-0 right-0 bg-walnut/80 text-white text-xs w-5 h-5 leading-5 text-center">×</button>
                    {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-cherry text-white text-[9px] text-center">primary</span>}
                  </div>
                ))}
              </div>
            )}
            <GraphicUpload label="Add a photo" value={undefined} onUploadingChange={setMediaBusy}
              onChange={url => { if (url) set({ images: [...photos, url] }) }} />
          </div>

          {/* Video */}
          <VideoUpload label="Product video (optional)" value={draft.video_url} onUploadingChange={setMediaBusy}
            onChange={url => set({ video_url: url })} />

          {/* Options */}
          <div className="border-t border-maple pt-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-walnut">Options</p>
              <button onClick={addOption} className="text-xs text-forest hover:underline">+ Add option</button>
            </div>
            <div className="space-y-3">
              {draft.options.map((opt: Opt, i: number) => (
                <div key={i} className="border border-maple rounded p-3 bg-parchment">
                  <div className="flex gap-2 items-center mb-2">
                    <input placeholder="Option name (e.g. Wood Type)" value={opt.name} onChange={e => setOptionName(i, e.target.value)}
                      className="flex-1 border border-maple rounded px-2 py-1 text-sm bg-white" />
                    <select value={opt.type === 'text' ? 'text' : 'choices'} onChange={e => setOptionType(i, e.target.value as 'choices' | 'text')}
                      className="border border-maple rounded px-2 py-1 text-sm bg-white">
                      <option value="choices">Choices</option>
                      <option value="text">Text (engraving)</option>
                    </select>
                    <button onClick={() => removeOption(i)} className="text-xs text-slate hover:text-cherry">Remove</button>
                  </div>
                  {opt.type === 'text' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="Placeholder text" value={opt.placeholder ?? ''} onChange={e => updateOption(i, { placeholder: e.target.value })}
                        className="border border-maple rounded px-2 py-1 text-sm bg-white" />
                      <input type="number" step="0.01" placeholder="Price modifier" value={opt.priceModifier ?? 0} onChange={e => updateOption(i, { priceModifier: Number(e.target.value) })}
                        className="border border-maple rounded px-2 py-1 text-sm bg-white" />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {(opt.choices ?? []).map((c: Choice, ci: number) => (
                        <div key={ci} className="flex gap-2 items-center">
                          <input placeholder="Choice label" value={c.label} onChange={e => updateChoice(i, ci, { label: e.target.value })}
                            className="flex-1 border border-maple rounded px-2 py-1 text-sm bg-white" />
                          <input type="number" step="0.01" placeholder="+$" value={c.priceModifier} onChange={e => updateChoice(i, ci, { priceModifier: Number(e.target.value) })}
                            className="w-24 border border-maple rounded px-2 py-1 text-sm bg-white" />
                          <button onClick={() => removeChoice(i, ci)} className="text-xs text-slate hover:text-cherry">×</button>
                        </div>
                      ))}
                      <button onClick={() => addChoice(i)} className="text-xs text-forest hover:underline">+ Add choice</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={save} disabled={saving || mediaBusy} className="bg-forest text-white px-4 py-2 rounded text-sm font-semibold hover:bg-opacity-90 disabled:opacity-50">
              {mediaBusy ? 'Uploading…' : saving ? 'Saving…' : 'Save Product'}
            </button>
            <button onClick={cancel} className="px-4 py-2 rounded text-sm text-slate hover:text-cherry">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {products.length === 0 && <p className="text-slate text-center py-8">No products yet.</p>}
          {products.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 text-sm border border-maple rounded px-3 py-2 bg-white">
              <div className="flex flex-col flex-shrink-0">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="text-slate hover:text-cherry disabled:opacity-25 leading-none text-xs">▲</button>
                <button onClick={() => move(i, 1)} disabled={i === products.length - 1} className="text-slate hover:text-cherry disabled:opacity-25 leading-none text-xs">▼</button>
              </div>
              {Array.isArray(p.images) && p.images[0] && <img src={p.images[0]} alt="" className="h-12 w-12 object-cover rounded flex-shrink-0" />}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-walnut">{p.name} — ${Number(p.base_price).toFixed(2)}</div>
                <div className="text-xs text-slate">/{p.slug}{p.featured ? ' · featured' : ''}{p.in_stock ? '' : ' · out of stock'}</div>
              </div>
              <button onClick={() => startEdit(p)} className="text-xs text-forest hover:underline flex-shrink-0">Edit</button>
              <button onClick={() => remove(p.id)} className="text-xs text-slate hover:text-cherry flex-shrink-0">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verify typecheck + build**

Run: `npx tsc --noEmit && rm -rf build .next && npx next build`
Expected: clean; "Compiled successfully"; `/admin/products` present. Then `rm -rf build .next`.

- [ ] **Step 4: Commit**

```bash
git add "src/app/admin/(protected)/products/page.tsx" src/controls/admin/AdminNav.tsx
git commit -m "Products DB: admin products page + nav link"
```

---

### Task 9: Seed script

**Files:**
- Create: `scripts/seed-products.mjs`

- [ ] **Step 1: Create the seed script**

Create `scripts/seed-products.mjs`:

```js
// One-off: seed the products table from src/data/products.json.
// Run AFTER creating the products table in Supabase:  node scripts/seed-products.mjs
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter(l => l.includes('='))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')] })
)
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const products = JSON.parse(readFileSync('src/data/products.json', 'utf8'))

let order = 0
for (const p of products) {
  const row = {
    slug: p.slug,
    name: p.name,
    tagline: p.tagline ?? null,
    description: p.description ?? null,
    images: p.images ?? [],
    video_url: p.video ?? null,
    category: p.category ?? null,
    options: p.options ?? [],
    base_price: p.basePrice,
    sale_price: p.salePrice ?? null,
    weight_lbs: p.weightLbs ?? 3,
    length_in: p.dimensionsInches?.length ?? null,
    width_in: p.dimensionsInches?.width ?? null,
    height_in: p.dimensionsInches?.height ?? null,
    featured: !!p.featured,
    in_stock: p.inStock !== false,
    sort_order: order++,
  }
  // Upsert on slug so re-running is safe.
  const { error } = await db.from('products').upsert(row, { onConflict: 'slug' })
  console.log(error ? `ERROR ${p.slug}: ${error.message}` : `seeded ${p.slug}`)
}
console.log('done')
```

- [ ] **Step 2: Verify the script parses**

Run: `node --check scripts/seed-products.mjs`
Expected: no output (valid syntax). Do NOT run the script yet — it requires the table to exist in Supabase (owner step).

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-products.mjs
git commit -m "Products DB: seed script from products.json"
```

---

### Task 10: Final verification + confirm no JSON imports

- [ ] **Step 1: Confirm products.json is no longer imported**

Run: `grep -rn "data/products.json" src/`
Expected: NO matches (empty output). If any remain, fix that file to use the data layer or the item snapshot per Tasks 3–6.

- [ ] **Step 2: Full typecheck + build**

Run: `npx tsc --noEmit && rm -rf build .next && npx next build`
Expected: clean; "Compiled successfully"; `/shop` and `/shop/[slug]` are ƒ (dynamic); `/admin/products` and `/api/admin/products` present. Then `rm -rf build .next`.

- [ ] **Step 3: Confirm clean tree**

Run: `git status --short`
Expected: empty.

---

## Post-implementation handoff (owner actions)

1. Run the `create table products …` statement (Task 1) in the Supabase SQL editor, and enable RLS on the `products` table (no anon policies — the app uses the service role).
2. Seed the existing catalog: `node scripts/seed-products.mjs` (needs `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`).
3. Parity check: shop grid, a product detail page (options + price math), add-to-cart, checkout totals, and an admin shipping label all behave as before.
4. `src/data/products.json` is now unused (kept only as the seed source) — safe to delete later.

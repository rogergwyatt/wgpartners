# Database-Driven Products — Design

**Date:** 2026-06-09
**Status:** Approved

## Goal

Replace the static `src/data/products.json` catalog with a database-driven
`products` table (like drops), including a full Admin → Products management page.
The public shop, product pages, checkout, shipping, and sitemap read products
from the database. Existing behavior and appearance are preserved.

## Decisions (from brainstorming)

1. **Full admin UI** to create/edit/delete products, including a nested options
   editor (wood/size/juice-groove/personalization with per-choice price
   modifiers).
2. **Options stored as JSONB** on the product row (same shape as products.json).
3. **Dynamic rendering** (`force-dynamic`) for product pages — admin edits appear
   immediately.

## Schema — `products` table

```sql
create table if not exists products (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  tagline      text,
  description  text,
  images       jsonb not null default '[]',   -- array of image URLs (first = primary)
  video_url    text,
  category     text,
  options      jsonb not null default '[]',   -- the ProductOption[] array, as in products.json
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

Enable RLS on the table (no anon policies; the app uses the service role).

### Seed

Generate `INSERT` statements from the current `src/data/products.json` (3
products) so the catalog starts identical. The owner runs the schema + seed SQL
in Supabase (DDL/seed cannot run via supabase-js).

## Data-access layer — `src/lib/products.ts`

Single source for product reads; all via `supabaseAdmin()` (server-side).

- `dbRowToProduct(row): Product` — maps snake_case DB row to the camelCase
  `Product` type, rebuilding `dimensionsInches` from `length_in/width_in/height_in`,
  `images` from the JSONB array, `video` from `video_url`, `basePrice`/`salePrice`
  from `base_price`/`sale_price`, `weightLbs`, `featured`, `inStock`, `options`.
- `getProducts(): Promise<Product[]>` — all products, ordered by `sort_order`
  then `name`.
- `getProductBySlug(slug: string): Promise<Product | null>`
- `getProductById(id: string): Promise<Product | null>`

Each read is wrapped so a DB failure returns `[]` / `null` rather than throwing.

The `Product` and `ProductOption` types in `src/lib/types.ts` are unchanged.

## Consumer refactors (remove `products.json` imports)

1. **`src/app/shop/page.tsx`** (server, already `force-dynamic`): replace the JSON
   import with `await getProducts()`.
2. **`src/app/shop/[slug]/page.tsx`**: remove `generateStaticParams`; add
   `export const dynamic = 'force-dynamic'`. `generateMetadata` and the page body
   use `await getProductBySlug(params.slug)`; `notFound()` when null. JSON-LD
   unchanged.
3. **`src/app/sitemap.ts`**: replace the JSON import with `await getProducts()`
   for the product slugs (already async + `force-dynamic`).
4. **`src/app/api/admin/shipping-label/route.tsx`**: look up via
   `getProductById(item.product?.id)`, **falling back to the embedded
   `item.product` snapshot** (which already carries `weightLbs`/`dimensionsInches`)
   when the DB lookup misses — keeps old orders (slug-based ids) working.
5. **`src/app/checkout/page.tsx`**: use the product snapshot already present on each
   cart item (`item.product`, captured at add-to-cart) for weight/dimensions, so
   checkout needs neither the JSON nor a DB call.

### ID compatibility

New products use a `uuid` id; `slug` stays separately editable. Orders placed
before the migration stored `product.id` as the old slug; the shipping-label
fallback to the order's embedded product snapshot handles those. New carts/orders
carry the uuid id, which resolves directly.

## Admin API — `src/app/api/admin/products/route.tsx`

Gated by `isAdminAuthenticated()` (mirrors `/api/admin/drops`).

- **GET** — list all products (ordered by `sort_order`, then `name`).
- **POST** — create. Requires `name`, `slug`, `base_price`. Maps camelCase body to
  DB columns; `options`/`images` default to `[]`. Returns the created row.
- **PATCH** — update by `id`. Accepts any subset of fields (name, slug, tagline,
  description, category, images, video_url, options, base_price, sale_price,
  weight_lbs, length_in, width_in, height_in, featured, in_stock, sort_order).
- **DELETE** — by `id`.

Slug uniqueness is enforced by the DB; a unique-violation is surfaced as a
friendly "that slug is already in use" message.

## Admin UI — `src/app/admin/(protected)/products/page.tsx`

Parallels the Drops admin page; client component using the admin API.

- Product list with **▲/▼ reorder** (normalize `sort_order`, persist via PATCH),
  **Edit**, and **Delete**.
- Create/edit form fields: name, slug, tagline, description, category, base price,
  sale price, weight, dimensions (length/width/height), **featured** and
  **in-stock** toggles.
- **Photos**: multiple via `GraphicUpload` (add/remove; first = primary), reusing
  the drops pattern.
- **Video**: optional via `VideoUpload`.
- **Options editor**:
  - Add/remove options. Each option has a **name**, an auto-derived **key**
    (slugified name), and a **type**: `choices` or `text`.
  - **choices**: a list of `{ label, priceModifier }` rows (add/remove/edit).
  - **text** (e.g. Personalization): a `placeholder` string and a single
    `priceModifier`.
- Add a **"Products"** link to `src/controls/admin/AdminNav.tsx`.

## Error handling

- Data layer: try/catch per read → `[]`/`null`; product pages `notFound()` on null.
- Admin API: JSON error responses with appropriate status codes (401 unauth, 400
  validation/unique violation).
- Options JSONB is stored as provided by the admin UI; the UI keeps it well-formed.

## Testing / verification

This project has no unit-test runner; verify with `tsc --noEmit`, `next build`,
and manual `curl`/page checks (consistent with the existing workflow).

- Typecheck + build after each task.
- `curl` the admin API: create, list, patch (including options + sort_order),
  delete.
- **Parity check** after seeding: shop grid, a product detail page (options +
  pricing math), add-to-cart, checkout totals, and a generated shipping label all
  behave as they do today with the JSON.
- Confirm `products.json` is no longer imported anywhere (grep). The file becomes
  an unused seed reference and may be deleted later.

## Out of scope (YAGNI)

- Relational options/choices tables (JSONB chosen).
- ISR/caching (dynamic chosen).
- Inventory counts per product (separate concern; drops already handle limited
  stock).
- Migrating historical orders' embedded product ids (handled via snapshot
  fallback instead).
- Deleting `products.json` in this change (left as a seed reference; optional
  cleanup later).

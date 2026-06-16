# WG Partners — Single-Page Website Design

**Date:** 2026-06-16
**Status:** Approved design — ready for implementation planning
**Author:** Roger Wyatt + Claude

## 1. Overview

Transform the existing Roger & Sally e-commerce codebase into a lean, single-page
marketing site for **Wyatt & Grundvig Partners ("WG Partners")** — a boutique
AI-modernization and legacy-systems consultancy.

**Direction (chosen):** Approach A — *thesis-forward manifesto*. The site leads with
the provocation and makes the "SaaS Killer" argument the centerpiece, supported by
partner pedigree and a clear path to action (a 20-minute intro call).

### Goals
- One-page Next.js site (single scroll, anchor navigation).
- Homepage sections (in order): Hero → SaaS Killer → Whitepapers → Who We Are →
  How We Work → Contact.
- Whitepapers hosted on-site: a `/whitepapers` index and a page per article, built from
  the three existing articles. Homepage stays a single scroll; these are the only
  non-home routes.
- Blue-and-gold visual identity ("Midnight & Gold" palette).
- Clean rebuild: remove all e-commerce machinery.
- Contact form delivers to `roger@wgpartners.com` via existing Nodemailer/SMTP.

### Non-goals / out of scope
- **Confidential financials** (partner salaries, distributions, $2M targets, P&L) —
  never appear on the public site.
- External scheduling tools (Calendly etc.) — the "Book a 20-min call" CTA jumps to
  the on-page contact form for now.
- No new paid third-party services (no Resend/Formspree/Stripe/Supabase). SMTP only.

## 2. Visual Design

### Palette — "Midnight & Gold"
| Token | Hex | Use |
|-------|-----|-----|
| `navy` | `#0A2540` | Primary brand surface (nav, hero) |
| `ink` | `#0F172A` | Darkest sections, stat band, footer |
| `royal` | `#1D4ED8` | Secondary blue accent / links |
| `gold` | `#C9A24B` | CTAs, key numbers, accent rules (used sparingly) |
| `mist` | `#F8FAFC` | Light page background |
| `slate-200/400` | grays | Body text on dark, muted captions |

### Typography
- **Display / headings:** Playfair Display (serif) — matches the existing business card.
- **Body / UI:** Inter (sans).
- Loaded via `next/font/google`.

### Tone
Authoritative, opinionated, quantified. Speaks to a skeptical CTO/CIO buyer. Gold is an
accent, not a fill — reserved for CTAs and the headline numbers.

## 3. Page Structure & Draft Copy

### 3.1 Sticky Top Nav
- Wordmark: **WG PARTNERS**
- Anchor links: SaaS Killer · Whitepapers · Who We Are · How We Work · Contact
- Gold button: **Book a 20-min call** (→ `#contact`)

### 3.2 Hero
- **H1:** You're Renting Software. **You Could Own It Forever.**
- **Sub:** We use AI to build custom software that replaces your legacy systems and
  eliminates annual SaaS fees — permanently. One fixed engagement. You own the code.
  No more recurring bills.
- **CTAs:** `Book a 20-min call →` (→ `#contact`) · `See the argument` (→ `#saas-killer`)
- **Result band:** **90%** cost reduction vs. traditional SI firms · **10×** faster
  delivery than manual development · **Zero** ongoing licensing fees after delivery

### 3.3 SaaS Killer (centerpiece — `#saas-killer`)
**Section intro — "The End of Software Rental":**
> Every year, enterprises pay 15–20% more for software they don't own, can't control,
> and can't leave.

**Two ways software is draining you right now:**
- **Aging Custom Code** — Built years ago; nobody fully understands it anymore.
  Developers are afraid to touch it. Maintenance costs climb 10–15% every year. It
  blocks modern tooling and AI. Modernization quotes from the big firms: $5M–$30M+.
- **Off-the-Shelf SaaS** — Annual fees that never stop; you pay forever and own nothing.
  The vendor raises prices and you have no leverage. Forced upgrades break your
  workflows. Generic features that don't fit your business.
- *Stat line:* Enterprises spend 60–80% of their IT budget just maintaining the above —
  leaving almost nothing for growth.

**The SaaS Hostage Trap (three elements):**
1. **The Pricing Extortion Loop** — Introductory pricing gives way to forced tier
   migrations, infrastructure restructurings, and unbundled feature gates. You pay the
   annual ~15% tax because tearing out your core pipeline feels impossible.
2. **Feature Deprivation** — Multi-tenant vendors build to capture their next 100
   clients, not to serve you. Your requests rot at the bottom of a public backlog.
3. **The Custom Middleware Prison** — To bend a generic app to your business logic, your
   team writes brittle middleware. A breaking API change shatters it — and you fix code
   you don't even own.

**The moat has evaporated:**
> Multi-billion-dollar SaaS companies selling the same generic code to every customer
> are the modern equivalent of buggy-whip manufacturers — selling horseshoes in an era
> that just invented the engine. The historical value of software was labor scarcity.
> Today, syntax generation is a free commodity.

**The Specification Is the Asset. Code Is Disposable.** (Generation over Configuration)
Before/after comparison:
- **Monolith lock-in (today):** Manual code review gates every deploy · vendor controls
  your roadmap · brittle middleware breaks on unannounced API changes · switching costs
  compound · you never own what you paid to build.
- **Spec-driven generation (going forward):** A precise behavioral specification ·
  standard connectors (swap Stripe/Plaid/Twilio in minutes) · automated verification (AI
  writes code in a secure sandbox, slammed against regression tests; deviate by one byte
  → rejected). **Pay once. Own forever.**

**Proof — "We've already done it":** 40× delivery compression. In a single weekend we
built a full production-ready e-commerce platform from scratch — payments, inventory,
shipping APIs, and an admin dashboard. ~6 weeks of boilerplate engineering in under 6
hours of AI orchestration.

### 3.4 Whitepapers (`#whitepapers`)
Homepage band — heading **Whitepapers**, dek *"The thinking behind the thesis."* — with
three cards (title + one-line dek + `Read →`) linking to on-site article pages, plus a
`View all whitepapers` link to `/whitepapers`.

Articles are **hosted on-site**, sourced (verbatim, lightly edited for the web) from the
existing documents in the consulting folder:

| Title | Route | Source doc |
|-------|-------|------------|
| The SaaS Hostage Trap: Why Most Software Companies Are Already Obsolete | `/whitepapers/saas-hostage-trap` | *Software Companies are Dead* |
| The Code Is Disposable: Why the Specification Is Your Only Real Asset | `/whitepapers/code-is-disposable` | *The Specification is the Asset* |
| The "42" Problem: Why Your Downsized Dev Team Is Stalling on "Vibe Coding" | `/whitepapers/the-42-problem` | *42 problem article* |

### 3.5 Who We Are (`#who-we-are`)
**Firm overview:**
> WG Partners is a boutique AI-modernization firm. Senior technologists only — no
> associate layer, no offshore handoff. The partners who pitch you are the partners who
> build your system.

**Partner cards:**
- **Roger Wyatt — Managing Partner & CTO.** 40+ years. 146× performance improvement at
  Duck Creek · $30MM savings at Capital One · $3BN+ revenue at CarMax · $2BN legacy
  modernization at NASA.
- **Michael Grundvig — Principal Engineer.** Enterprise platform experience at UKG and
  Duck Creek. *(Full credentials to be expanded.)*

**Verticals we know:** Financial Services / Fintech · Manufacturing & Supply Chain ·
Enterprise SaaS / Tech · Government / Public Sector.

### 3.6 How We Work (`#how-we-work`)
**Principles:** Senior people deliver. Fixed-price outcomes, not hours. You own the IP.
No recurring fees — ever. *"We hand you the keys. When you're ready to add a room, we're
your team."*

**Engagement model:** Discovery & Architecture → Build & Integrate → Deploy, Transition
& Handover.

**The entry point — the 30-day pilot:** A $50,000 fixed-price challenge. **Isolate →
Specify → Deliver.** 30 days. Working code. You own it forever.

**Primary CTA:**
> Tell us what you're running. We'll tell you if we can help. 20 minutes. No pitch. Just
> questions. → **Book a 20-min call**

### 3.7 Contact Us (`#contact`)
- **Form fields:** Name, Company, Email, Phone, Message (placeholder: "What are you
  running, and what's it costing you?"). The old Zip Code field and service-area
  validation are removed.
- **Delivery:** sends to `roger@wgpartners.com` via Nodemailer/SMTP.
- **Also shown:** email `roger@wgpartners.com`, phone `910-297-0929`.
- **Book a 20-min call** button anchors here (it is the contact form).

### 3.8 Footer
WG Partners · AI Modernization & Legacy Systems Consulting · `roger@wgpartners.com` ·
`910-297-0929`.

## 4. Technical Architecture

### Stack
- Next.js 14.2 (App Router), TypeScript, Tailwind CSS v3, `sonner` for toasts.
- Single route: `/` (`src/app/page.tsx`) composing section components.

### Component structure (new, under `src/components/`)
`TopNav`, `Hero`, `ResultBand`, `SaaSKiller` (with `HostageTrapCard`, `SpecVsMonolith`,
`ProofCaseStudy`), `WhitepapersTeaser` (homepage band of article cards), `WhoWeAre`
(`PartnerCard`, `Verticals`), `HowWeWork`, `ContactSection` (`ContactForm`), `Footer`.
`page.tsx` assembles them in order. A shared `WhitepaperLayout` renders individual
article pages.

### Theme changes
- `tailwind.config.ts`: replace the parchment/walnut palette with the Midnight & Gold
  tokens above; register Playfair Display + Inter font families; remove Roger & Sally
  `backgroundImage` entries.
- `src/controls/fonts.tsx` → updated to export Playfair Display (display) + Inter (sans).

### Contact form / mail
- Client component with validation; submits to a Next.js Route Handler at
  `src/app/api/contact/route.ts` that sends mail with Nodemailer using SMTP env vars.
- Reuse/adapt the existing Nodemailer logic in `src/helpers/emailer`; strip
  zip-code/service-area logic.
- Env vars (user will supply): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`,
  `CONTACT_TO=roger@wgpartners.com`.
- On success: success toast + reset form. On failure: error toast directing the user to
  call `910-297-0929`.

### Whitepapers (on-site hosting)
- **Routes:** `/whitepapers` (index listing all articles) and `/whitepapers/[slug]`
  (individual article). These are the only non-home routes.
- **Content source:** article bodies stored under `src/content/whitepapers/` (one file
  per article), sourced verbatim — lightly edited for the web — from the three consulting
  documents. Index metadata (slug, title, dek, order) in `src/lib/whitepapers.ts`.
  Rendering is dependency-free structured content, or a lightweight free markdown lib
  (e.g. `react-markdown`) — the implementation plan decides; no paid services either way.
- **Layout:** shared `WhitepaperLayout` — Playfair headings, readable measure, a
  back-to-home link, and a contact CTA reusing the homepage styling.
- **SEO:** each article page sets its own `metadata` and JSON-LD `Article`.

### Removals (clean rebuild)
- **App routes:** `shop`, `cart`, `checkout`, `custom-order`, `products`, `gallery`,
  `news`, `terms`, `thankyou`, `emailthankyou`, `admin`, `email`.
- **Code:** `src/context/CartContext`, commerce controls, `src/buttons/*`, and `src/lib`
  modules tied to commerce (supabase, products, stripe, shippo, orders, customers, etc.).
- **Dependencies:** `stripe`, `@stripe/*`, `@supabase/*`, `shippo`, `@vercel/blob`,
  `@vercel/postgres`, `react-router-dom`, `uuid`, `@anthropic-ai/sdk`.
- **Analytics:** remove Hotjar, Google Tag Manager, and the Roger & Sally GA IDs. Keep
  Vercel Analytics (already a dependency, free). GA optional via env later.

### SEO
- New `metadata` in `layout.tsx` (title, description, OpenGraph) for WG Partners.
- JSON-LD `Organization` / `ProfessionalService` for WG Partners (replace the Roger &
  Sally `LocalBusiness` block, including the old VA address).

## 5. Error Handling
- Client-side form validation: required fields + email format; inline messages.
- API route returns 4xx on validation, 5xx on mail failure.
- Mail failure surfaces a toast with the phone fallback.

## 6. Testing / Verification
- `next build` and `next lint` pass with no errors.
- Whitepapers: `/whitepapers` index and each `/whitepapers/[slug]` page render; homepage
  Whitepapers cards link correctly; per-article metadata present.
- Manual: page renders; nav anchors smooth-scroll to each section; responsive on mobile
  (stat band stacks, nav collapses); form validation fires; form submit success and
  failure paths behave (test with throwaway SMTP creds or a mocked transport).
- Confirm no Roger & Sally content, routes, assets, or analytics IDs remain.

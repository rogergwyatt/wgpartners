# WG Partners Single-Page Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Roger & Sally e-commerce app with a single-page WG Partners marketing site (plus on-site whitepaper pages) on the existing Next.js 14 stack.

**Architecture:** Clean rebuild. Strip all commerce code/deps. Homepage (`/`) is a single scroll composed from focused section components in `src/components/`. Whitepapers are hosted at `/whitepapers` and `/whitepapers/[slug]`, rendered from dependency-free structured content modules. The contact form uses the existing Nodemailer server-action pattern.

**Tech Stack:** Next.js 14.2 (App Router), TypeScript, Tailwind CSS v3, Nodemailer (SMTP), `sonner` toasts, `@vercel/analytics`. Tests: Vitest + React Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-06-16-wg-partners-site-design.md`

**Design tokens (Midnight & Gold):** `navy #0A2540`, `ink #0F172A`, `royal #1D4ED8`, `gold #C9A24B`, `mist #F8FAFC`. Display font: Playfair Display (`font-serif`); body: Inter (`font-sans`).

**Testing approach:** TDD the real logic — contact validation/formatting, the whitepaper registry, and the contact form's interactive behavior — with Vitest + RTL. Presentational section components are verified by `next build` + `next lint` (the meaningful failure mode for static markup is a build/type error, not a unit assertion). Components never import `next/font` directly; fonts are applied via Tailwind `font-serif`/`font-sans` utilities so components stay test-friendly.

---

## Phase 0 — Cleanup & Toolchain

### Task 0.1: Remove all e-commerce code

**Files:** delete the commerce routes, controls, libs, buttons, context, helpers, and middleware.

- [ ] **Step 1: Delete commerce app routes**

```bash
git rm -r \
  src/app/shop src/app/cart src/app/checkout src/app/custom-order \
  src/app/products src/app/gallery src/app/news src/app/terms \
  src/app/thankyou src/app/emailthankyou src/app/philosophy \
  src/app/admin src/app/email
```

- [ ] **Step 2: Delete commerce controls, buttons, context, middleware, attachment mailer**

```bash
git rm -r src/controls src/buttons src/context src/middleware.ts src/helpers/attachmentMailer.tsx
```

- [ ] **Step 3: Delete commerce lib modules**

```bash
git rm src/lib/orderOptions.ts src/lib/customers.ts src/lib/fulfillOrder.ts \
  src/lib/supabase-schema.sql src/lib/types.ts src/lib/products.ts \
  src/lib/customOrderAI.ts src/lib/supabase.ts src/lib/adminAuth.ts \
  src/lib/statusEmails.ts src/lib/dropProduct.ts
```

- [ ] **Step 4: Verify only intended files remain**

Run: `find src -type f | sort`
Expected: `src/app/favicon.ico`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/helpers/emailer.tsx`. (`page.tsx`/`layout.tsx`/`globals.css` will be rewritten later.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove Roger & Sally e-commerce code"
```

### Task 0.2: Prune dependencies

**Files:** Modify `package.json`.

- [ ] **Step 1: Replace dependencies/devDependencies blocks**

Set `dependencies` to exactly:

```json
  "dependencies": {
    "@vercel/analytics": "^1.3.1",
    "next": "14.2.35",
    "nodemailer": "^6.9.15",
    "react": "^18",
    "react-dom": "^18",
    "sonner": "^1.5.0"
  },
```

Set `devDependencies` to exactly:

```json
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.7",
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.1",
    "@types/node": "20.19.13",
    "@types/nodemailer": "^6.4.16",
    "@types/react": "18.3.24",
    "@types/react-dom": "^18",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "eslint": "^9",
    "eslint-config-next": "^15",
    "jsdom": "^25.0.0",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "5.9.2",
    "vitest": "^2.1.1"
  }
```

Also update `homepage` and add a `test` script:

```json
  "homepage": "https://www.wgpartners.com",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
```

(Removed: `@anthropic-ai/sdk`, `@stripe/*`, `@supabase/*`, `@types/uuid`, `@vercel/blob`, `@vercel/postgres`, `node-fetch`, `@types/node-fetch`, `react-router-dom`, `shippo`, `stripe`, `uuid`, `swr`, `https`.)

- [ ] **Step 2: Reinstall**

Run: `rm -rf node_modules package-lock.json && npm install`
Expected: completes without peer-dependency errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: prune dependencies to lean marketing-site set"
```

### Task 0.3: Add Vitest + React Testing Library harness

**Files:** Create `vitest.config.ts`, `vitest.setup.ts`, `src/lib/smoke.test.ts`.

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

- [ ] **Step 2: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Write a smoke test** at `src/lib/smoke.test.ts`

```ts
import { describe, it, expect } from 'vitest';

describe('test harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: 1 passing test.

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts src/lib/smoke.test.ts
git commit -m "test: add vitest + RTL harness"
```

---

## Phase 1 — Theme & Shell

### Task 1.1: Fonts module

**Files:** Create `src/lib/fonts.ts`.

- [ ] **Step 1: Create `src/lib/fonts.ts`**

```ts
import { Inter, Playfair_Display } from 'next/font/google';

export const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '700', '800'],
});
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/fonts.ts
git commit -m "feat: add Playfair Display + Inter font module"
```

### Task 1.2: Tailwind theme tokens

**Files:** Modify `tailwind.config.ts`.

- [ ] **Step 1: Replace the whole file**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0A2540",
        "navy-700": "#0F2E52",
        ink: "#0F172A",
        royal: "#1D4ED8",
        gold: "#C9A24B",
        mist: "#F8FAFC",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
export default config;
```

- [ ] **Step 2: Verify build compiles the config**

Run: `npx tsc --noEmit`
Expected: no errors from `tailwind.config.ts`.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: Midnight & Gold tailwind theme"
```

### Task 1.3: Global CSS

**Files:** Replace `src/app/globals.css`.

- [ ] **Step 1: Replace the whole file**

```css
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

html {
  scroll-behavior: smooth;
}

body {
  background-color: #f8fafc;
  color: #0f172a;
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: reset global styles for WG Partners"
```

### Task 1.4: Root layout (metadata, fonts, JSON-LD, analytics)

**Files:** Replace `src/app/layout.tsx`.

- [ ] **Step 1: Replace the whole file**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import { sans, serif } from "@/lib/fonts";

const SITE_URL = "https://www.wgpartners.com";
const SITE_DESCRIPTION =
  "WG Partners (Wyatt & Grundvig) uses AI to replace your legacy systems and off-the-shelf SaaS with custom software you own outright. One fixed engagement. No recurring fees.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "WG Partners | AI Modernization & Legacy Systems Consulting",
  description: SITE_DESCRIPTION,
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "WG Partners",
    title: "WG Partners | Own Your Software. Forever.",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "WG Partners | Own Your Software. Forever.",
    description: SITE_DESCRIPTION,
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}/#org`,
  name: "Wyatt & Grundvig Partners",
  alternateName: "WG Partners",
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  email: "roger@wgpartners.com",
  telephone: "+1-910-297-0929",
  areaServed: "US",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster richColors position="top-center" />
        <Analytics />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat: WG Partners root layout, metadata, JSON-LD"
```

### Task 1.5: Shared primitives — Section, CTAButton, TopNav, Footer

**Files:** Create `src/components/Section.tsx`, `src/components/CTAButton.tsx`, `src/components/TopNav.tsx`, `src/components/Footer.tsx`.

- [ ] **Step 1: Create `src/components/Section.tsx`**

```tsx
import { ReactNode } from "react";

export default function Section({
  id,
  className = "",
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={`scroll-mt-20 px-6 py-20 lg:py-28 ${className}`}>
      <div className="mx-auto max-w-5xl">{children}</div>
    </section>
  );
}
```

- [ ] **Step 2: Create `src/components/CTAButton.tsx`**

```tsx
import Link from "next/link";
import { ReactNode } from "react";

export default function CTAButton({
  href,
  variant = "primary",
  children,
}: {
  href: string;
  variant?: "primary" | "outline";
  children: ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-semibold transition-colors";
  const styles =
    variant === "primary"
      ? "bg-gold text-navy hover:bg-gold/90"
      : "border border-white/30 text-mist hover:bg-white/10";
  return (
    <Link href={href} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}
```

- [ ] **Step 3: Create `src/components/TopNav.tsx`**

```tsx
import Link from "next/link";
import CTAButton from "./CTAButton";

const links = [
  { href: "/#saas-killer", label: "SaaS Killer" },
  { href: "/#whitepapers", label: "Whitepapers" },
  { href: "/#who-we-are", label: "Who We Are" },
  { href: "/#how-we-work", label: "How We Work" },
  { href: "/#contact", label: "Contact" },
];

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 bg-navy/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="font-serif text-lg font-bold tracking-[0.2em] text-mist"
        >
          WG&nbsp;PARTNERS
        </Link>
        <div className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-slate-300 hover:text-mist"
            >
              {l.label}
            </Link>
          ))}
          <CTAButton href="/#contact">Book a 20-min call</CTAButton>
        </div>
        <div className="lg:hidden">
          <CTAButton href="/#contact">Book a call</CTAButton>
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: Create `src/components/Footer.tsx`**

```tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-ink px-6 py-12 text-slate-400">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center text-sm">
        <span className="font-serif text-base tracking-[0.2em] text-mist">
          WG&nbsp;PARTNERS
        </span>
        <span>AI Modernization &amp; Legacy Systems Consulting</span>
        <span>
          <a href="mailto:roger@wgpartners.com" className="hover:text-mist">
            roger@wgpartners.com
          </a>{" "}
          ·{" "}
          <a href="tel:+19102970929" className="hover:text-mist">
            910-297-0929
          </a>
        </span>
        <Link href="/whitepapers" className="hover:text-mist">
          Whitepapers
        </Link>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/Section.tsx src/components/CTAButton.tsx src/components/TopNav.tsx src/components/Footer.tsx
git commit -m "feat: shared Section, CTAButton, TopNav, Footer"
```

---

## Phase 2 — Homepage Sections

### Task 2.1: Hero + ResultBand

**Files:** Create `src/components/Hero.tsx`, `src/components/ResultBand.tsx`.

- [ ] **Step 1: Create `src/components/ResultBand.tsx`**

```tsx
const stats = [
  { figure: "90%", label: "cost reduction vs. traditional SI firms" },
  { figure: "10×", label: "faster delivery than manual development" },
  { figure: "Zero", label: "ongoing licensing fees after delivery" },
];

export default function ResultBand() {
  return (
    <div className="bg-ink">
      <div className="mx-auto grid max-w-5xl grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {stats.map((s) => (
          <div key={s.figure} className="px-6 py-8 text-center">
            <div className="font-serif text-4xl font-extrabold text-gold">
              {s.figure}
            </div>
            <div className="mt-2 text-sm text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/Hero.tsx`**

```tsx
import CTAButton from "./CTAButton";
import ResultBand from "./ResultBand";

export default function Hero() {
  return (
    <>
      <div className="bg-gradient-to-b from-navy to-navy-700 px-6 py-24 text-center lg:py-32">
        <div className="mx-auto max-w-3xl">
          <div className="mx-auto mb-6 h-[3px] w-14 bg-gold" />
          <h1 className="font-serif text-4xl font-bold leading-tight text-mist lg:text-6xl">
            You&rsquo;re Renting Software.{" "}
            <span className="text-gold">You Could Own It Forever.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
            We use AI to build custom software that replaces your legacy systems
            and eliminates annual SaaS fees &mdash; permanently. One fixed
            engagement. You own the code. No more recurring bills.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <CTAButton href="/#contact">Book a 20-min call &rarr;</CTAButton>
            <CTAButton href="/#saas-killer" variant="outline">
              See the argument
            </CTAButton>
          </div>
        </div>
      </div>
      <ResultBand />
    </>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.tsx src/components/ResultBand.tsx
git commit -m "feat: hero + result band"
```

### Task 2.2: SaaS Killer section

**Files:** Create `src/components/SaaSKiller.tsx`.

- [ ] **Step 1: Create `src/components/SaaSKiller.tsx`**

```tsx
import Section from "./Section";

const drains = [
  {
    title: "Aging Custom Code",
    points: [
      "Built years ago — nobody fully understands it anymore.",
      "Developers are afraid to touch it; every change is a risk.",
      "Maintenance costs climb 10–15% every year.",
      "Blocks your ability to integrate modern tools or AI.",
      "Modernization quotes from the big firms: $5M–$30M+.",
    ],
  },
  {
    title: "Off-the-Shelf SaaS",
    points: [
      "Annual maintenance & licensing fees that never stop.",
      "You pay every year — but you'll never own anything.",
      "The vendor raises prices; you have no leverage.",
      "Forced upgrades break your workflows.",
      "Generic features that don't fit your exact business.",
    ],
  },
];

const trap = [
  {
    n: "01",
    title: "The Pricing Extortion Loop",
    body: "Introductory pricing gives way to forced tier migrations, infrastructure restructurings, and unbundled feature gates. You pay the annual ~15% tax because tearing out your core pipeline feels impossible.",
  },
  {
    n: "02",
    title: "Feature Deprivation",
    body: "Multi-tenant vendors build to capture their next 100 clients, not to serve you. Your engineering requests rot at the bottom of a public backlog for 18 months.",
  },
  {
    n: "03",
    title: "The Custom Middleware Prison",
    body: "To bend a generic app to your business logic, your team writes brittle middleware. When the provider pushes a breaking API change, operations break — and you fix code you don't even own.",
  },
];

export default function SaaSKiller() {
  return (
    <Section id="saas-killer" className="bg-navy text-mist">
      <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold">
        The End of Software Rental
      </p>
      <h2 className="mt-3 font-serif text-3xl font-bold lg:text-4xl">
        Every year, enterprises pay 15–20% more for software they don&rsquo;t
        own, can&rsquo;t control, and can&rsquo;t leave.
      </h2>

      <h3 className="mt-14 text-xl font-semibold text-slate-200">
        Two ways software is draining you right now
      </h3>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {drains.map((d) => (
          <div key={d.title} className="rounded-xl bg-white/5 p-6">
            <h4 className="font-serif text-xl font-bold text-gold">{d.title}</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {d.points.map((p) => (
                <li key={p}>— {p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-400">
        Enterprises spend 60–80% of their IT budget just maintaining the above —
        leaving almost nothing for growth.
      </p>

      <h3 className="mt-16 text-xl font-semibold text-slate-200">
        The SaaS Hostage Trap
      </h3>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {trap.map((t) => (
          <div key={t.n} className="rounded-xl border border-white/10 p-6">
            <div className="font-serif text-3xl font-extrabold text-gold">
              {t.n}
            </div>
            <h4 className="mt-3 font-semibold">{t.title}</h4>
            <p className="mt-2 text-sm text-slate-300">{t.body}</p>
          </div>
        ))}
      </div>

      <blockquote className="mt-16 border-l-2 border-gold pl-6 font-serif text-2xl italic leading-snug text-slate-100">
        Multi-billion-dollar SaaS companies selling the same generic code to
        every customer are the modern equivalent of buggy-whip manufacturers —
        selling horseshoes in an era that just invented the engine.
      </blockquote>
      <p className="mt-4 text-sm text-slate-400">
        The historical value of software was labor scarcity. Today, syntax
        generation is a free commodity.
      </p>

      <h3 className="mt-16 font-serif text-2xl font-bold lg:text-3xl">
        The specification is the asset. Code is disposable.
      </h3>
      <p className="mt-2 text-slate-300">Generation over configuration.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 p-6">
          <h4 className="font-semibold text-slate-200">
            Monolith lock-in (today)
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li>— Manual code review gates every deployment.</li>
            <li>— The vendor controls your roadmap and upgrade schedule.</li>
            <li>— Brittle middleware breaks on unannounced API changes.</li>
            <li>— Switching costs compound with every integration.</li>
            <li>— You never own what you paid to build.</li>
          </ul>
        </div>
        <div className="rounded-xl bg-gold/10 p-6 ring-1 ring-gold/30">
          <h4 className="font-semibold text-gold">Spec-driven generation</h4>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            <li>— A precise, machine-readable behavioral specification.</li>
            <li>— Standard connectors — swap Stripe/Plaid/Twilio in minutes.</li>
            <li>
              — Automated verification: AI writes code in a sandbox, slammed
              against regression tests; deviate by one byte → rejected.
            </li>
            <li className="font-semibold text-gold">Pay once. Own forever.</li>
          </ul>
        </div>
      </div>

      <div className="mt-16 rounded-xl bg-ink p-8">
        <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold">
          The proof — we&rsquo;ve already done it
        </p>
        <p className="mt-4 text-2xl font-bold">
          <span className="text-gold">40×</span> compression in engineering
          delivery.
        </p>
        <p className="mt-3 text-slate-300">
          In a single weekend we built a full production-ready e-commerce
          platform from scratch — payments, inventory, shipping APIs, and an
          admin dashboard. What traditionally required six weeks of boilerplate
          engineering took under six hours of AI orchestration.
        </p>
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/SaaSKiller.tsx
git commit -m "feat: SaaS Killer section"
```

### Task 2.3: Who We Are section

**Files:** Create `src/components/WhoWeAre.tsx`.

- [ ] **Step 1: Create `src/components/WhoWeAre.tsx`**

```tsx
import Section from "./Section";

const partners = [
  {
    name: "Roger Wyatt",
    title: "Managing Partner & CTO · 40+ years",
    creds: [
      "146× performance improvement at Duck Creek",
      "$30MM savings at Capital One",
      "$3BN+ revenue at CarMax",
      "$2BN legacy modernization at NASA",
    ],
  },
  {
    name: "Michael Grundvig",
    title: "Principal Engineer",
    creds: ["Enterprise platform experience at UKG and Duck Creek."],
  },
];

const verticals = [
  "Financial Services / Fintech",
  "Manufacturing & Supply Chain",
  "Enterprise SaaS / Tech",
  "Government / Public Sector",
];

export default function WhoWeAre() {
  return (
    <Section id="who-we-are" className="bg-mist">
      <p className="font-serif text-sm uppercase tracking-[0.25em] text-royal">
        Who We Are
      </p>
      <h2 className="mt-3 max-w-3xl font-serif text-3xl font-bold text-navy lg:text-4xl">
        Senior technologists only. The partners who pitch you are the partners
        who build your system.
      </h2>
      <p className="mt-4 max-w-2xl text-slate-600">
        WG Partners is a boutique AI-modernization firm — no associate layer, no
        offshore handoff.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {partners.map((p) => (
          <div
            key={p.name}
            className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm"
          >
            <h3 className="font-serif text-2xl font-bold text-navy">{p.name}</h3>
            <p className="mt-1 text-sm font-medium text-royal">{p.title}</p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {p.creds.map((c) => (
                <li key={c}>— {c}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h3 className="mt-14 text-lg font-semibold text-navy">
        Verticals we know
      </h3>
      <div className="mt-4 flex flex-wrap gap-3">
        {verticals.map((v) => (
          <span
            key={v}
            className="rounded-full bg-navy/5 px-4 py-2 text-sm text-navy"
          >
            {v}
          </span>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/WhoWeAre.tsx
git commit -m "feat: Who We Are section"
```

### Task 2.4: How We Work section

**Files:** Create `src/components/HowWeWork.tsx`.

- [ ] **Step 1: Create `src/components/HowWeWork.tsx`**

```tsx
import Section from "./Section";
import CTAButton from "./CTAButton";

const principles = [
  "Senior people deliver — always.",
  "Fixed-price outcomes, not hours.",
  "You own the IP outright.",
  "No recurring fees, ever.",
];

const phases = [
  { name: "Discovery & Architecture", body: "We audit the legacy system and lock down its true behavioral specification." },
  { name: "Build & Integrate", body: "AI-assisted development against the spec, with weekly demos and integration into your stack." },
  { name: "Deploy, Transition & Handover", body: "Production deployment, knowledge transfer, and full IP assignment. You get the keys." },
];

export default function HowWeWork() {
  return (
    <Section id="how-we-work" className="bg-navy text-mist">
      <p className="font-serif text-sm uppercase tracking-[0.25em] text-gold">
        How We Work
      </p>
      <h2 className="mt-3 font-serif text-3xl font-bold lg:text-4xl">
        We hand you the keys. When you&rsquo;re ready to add a room, we&rsquo;re
        your team.
      </h2>

      <div className="mt-8 flex flex-wrap gap-3">
        {principles.map((p) => (
          <span
            key={p}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200"
          >
            {p}
          </span>
        ))}
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {phases.map((ph, i) => (
          <div key={ph.name} className="rounded-xl bg-white/5 p-6">
            <div className="font-serif text-2xl font-extrabold text-gold">
              {i + 1}
            </div>
            <h3 className="mt-2 font-semibold">{ph.name}</h3>
            <p className="mt-2 text-sm text-slate-300">{ph.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-gold/10 p-8 ring-1 ring-gold/30">
        <h3 className="font-serif text-2xl font-bold text-gold">
          The 30-day, $50,000 pilot
        </h3>
        <p className="mt-2 text-slate-200">
          Isolate → Specify → Deliver. 30 days. Working code. You own it forever.
        </p>
      </div>

      <div className="mt-12 text-center">
        <p className="mx-auto max-w-xl text-lg text-slate-200">
          Tell us what you&rsquo;re running. We&rsquo;ll tell you if we can help.
          20 minutes. No pitch. Just questions.
        </p>
        <div className="mt-6">
          <CTAButton href="/#contact">Book a 20-min call &rarr;</CTAButton>
        </div>
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/HowWeWork.tsx
git commit -m "feat: How We Work section"
```

---

## Phase 3 — Contact

### Task 3.1: Contact validation + formatting logic (TDD)

**Files:** Create `src/lib/contact.ts`, `src/lib/contact.test.ts`.

- [ ] **Step 1: Write the failing test** at `src/lib/contact.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { validateContactForm, formatContactMessage } from "./contact";

const valid = {
  name: "Jane CTO",
  company: "Acme",
  email: "jane@acme.com",
  phone: "910-555-0100",
  message: "We pay $200k/yr for a legacy ERP module.",
};

describe("validateContactForm", () => {
  it("passes for a complete, valid submission", () => {
    expect(validateContactForm(valid)).toEqual({});
  });

  it("flags blank required fields", () => {
    const errors = validateContactForm({ name: "", company: "", email: "", phone: "", message: "" });
    expect(errors.name).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.phone).toBeTruthy();
    expect(errors.message).toBeTruthy();
  });

  it("flags an invalid email", () => {
    const errors = validateContactForm({ ...valid, email: "not-an-email" });
    expect(errors.email).toBeTruthy();
  });

  it("does not require company", () => {
    const errors = validateContactForm({ ...valid, company: "" });
    expect(errors.company).toBeUndefined();
  });
});

describe("formatContactMessage", () => {
  it("includes all fields in the body", () => {
    const body = formatContactMessage(valid);
    expect(body).toContain("Jane CTO");
    expect(body).toContain("Acme");
    expect(body).toContain("jane@acme.com");
    expect(body).toContain("910-555-0100");
    expect(body).toContain("legacy ERP");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/contact.test.ts`
Expected: FAIL — `contact` module not found.

- [ ] **Step 3: Implement** `src/lib/contact.ts`

```ts
export interface ContactFields {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContactForm(fields: ContactFields): ContactErrors {
  const errors: ContactErrors = {};
  if (!fields.name.trim()) errors.name = "Name is required.";
  if (!fields.email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(fields.email)) errors.email = "Enter a valid email.";
  if (!fields.phone.trim()) errors.phone = "Phone is required.";
  if (!fields.message.trim()) errors.message = "Please add a message.";
  return errors;
}

export function formatContactMessage(fields: ContactFields): string {
  return [
    `Name: ${fields.name}`,
    `Company: ${fields.company || "(not provided)"}`,
    `Email: ${fields.email}`,
    `Phone: ${fields.phone}`,
    "",
    "Message:",
    fields.message,
  ].join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/contact.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/contact.ts src/lib/contact.test.ts
git commit -m "feat: contact validation + message formatting (TDD)"
```

### Task 3.2: Contact server action (Nodemailer)

**Files:** Replace `src/helpers/emailer.tsx` with `src/app/actions/contact.ts`.

- [ ] **Step 1: Delete the old emailer**

```bash
git rm src/helpers/emailer.tsx
```

- [ ] **Step 2: Create `src/app/actions/contact.ts`**

```ts
"use server";

import nodemailer from "nodemailer";
import {
  validateContactForm,
  formatContactMessage,
  type ContactFields,
} from "@/lib/contact";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER_HOST,
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_SERVER_USERNAME,
    pass: process.env.SMTP_SERVER_PASSWORD,
  },
});

export async function submitContactForm(
  fields: ContactFields
): Promise<{ ok: boolean; error?: string }> {
  const errors = validateContactForm(fields);
  if (Object.keys(errors).length > 0) {
    return { ok: false, error: "Please complete all required fields." };
  }

  try {
    await transporter.verify();
    await transporter.sendMail({
      from: process.env.SMTP_SERVER_USERNAME,
      replyTo: fields.email,
      to: process.env.SITE_MAIL_RECIEVER || "roger@wgpartners.com",
      subject: `WG Partners inquiry — ${fields.name}${fields.company ? ` (${fields.company})` : ""}`,
      text: formatContactMessage(fields),
    });
    return { ok: true };
  } catch (error) {
    console.error("Contact mail failed:", error);
    return { ok: false, error: "Mail delivery failed." };
  }
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: contact server action via Nodemailer"
```

### Task 3.3: Contact section component (+ behavior test)

**Files:** Create `src/components/ContactSection.tsx`, `src/components/ContactSection.test.tsx`.

- [ ] **Step 1: Create `src/components/ContactSection.tsx`**

```tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import Section from "./Section";
import { validateContactForm, type ContactFields, type ContactErrors } from "@/lib/contact";
import { submitContactForm } from "@/app/actions/contact";

const empty: ContactFields = { name: "", company: "", email: "", phone: "", message: "" };

const fieldClass =
  "block w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-ink focus:border-royal focus:ring-royal";

export default function ContactSection() {
  const [fields, setFields] = useState<ContactFields>(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const update =
    (key: keyof ContactFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validateContactForm(fields);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const result = await submitContactForm(fields);
    setSubmitting(false);

    if (result.ok) {
      toast.success("Thanks — we'll be in touch shortly.");
      setFields(empty);
    } else {
      toast.error("Couldn't send. Please call us at 910-297-0929.");
    }
  }

  return (
    <Section id="contact" className="bg-mist">
      <p className="font-serif text-sm uppercase tracking-[0.25em] text-royal">
        Contact Us
      </p>
      <h2 className="mt-3 font-serif text-3xl font-bold text-navy lg:text-4xl">
        Tell us what you&rsquo;re running.
      </h2>
      <p className="mt-3 text-slate-600">
        20 minutes. No pitch. Just questions. Or reach us directly at{" "}
        <a href="mailto:roger@wgpartners.com" className="text-royal underline">
          roger@wgpartners.com
        </a>{" "}
        ·{" "}
        <a href="tel:+19102970929" className="text-royal underline">
          910-297-0929
        </a>
        .
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 max-w-2xl space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">Name</label>
          <input id="name" className={fieldClass} value={fields.name} onChange={update("name")} />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="company" className="mb-1 block text-sm font-medium text-ink">Company</label>
          <input id="company" className={fieldClass} value={fields.company} onChange={update("company")} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">Email</label>
          <input id="email" type="email" className={fieldClass} value={fields.email} onChange={update("email")} />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-ink">Phone</label>
          <input id="phone" className={fieldClass} value={fields.phone} onChange={update("phone")} />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
        <div>
          <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink">Message</label>
          <textarea
            id="message"
            rows={5}
            className={fieldClass}
            placeholder="What are you running, and what's it costing you?"
            value={fields.message}
            onChange={update("message")}
          />
          {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-md bg-navy px-6 py-3 text-sm font-semibold text-mist hover:bg-navy-700 disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Send message"}
        </button>
      </form>
    </Section>
  );
}
```

- [ ] **Step 2: Write the behavior test** at `src/components/ContactSection.test.tsx`

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactSection from "./ContactSection";

const submitMock = vi.fn();
vi.mock("@/app/actions/contact", () => ({
  submitContactForm: (...args: unknown[]) => submitMock(...args),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

beforeEach(() => submitMock.mockReset());

describe("ContactSection", () => {
  it("shows validation errors and does not submit when empty", async () => {
    render(<ContactSection />);
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("submits when the form is valid", async () => {
    submitMock.mockResolvedValue({ ok: true });
    render(<ContactSection />);
    fireEvent.change(screen.getByLabelText(/^name$/i), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "jane@acme.com" } });
    fireEvent.change(screen.getByLabelText(/^phone$/i), { target: { value: "910-555-0100" } });
    fireEvent.change(screen.getByLabelText(/^message$/i), { target: { value: "Legacy ERP pain." } });
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));
    await waitFor(() => expect(submitMock).toHaveBeenCalledOnce());
  });
});
```

- [ ] **Step 3: Run the test**

Run: `npm test -- src/components/ContactSection.test.tsx`
Expected: PASS (both cases).

- [ ] **Step 4: Commit**

```bash
git add src/components/ContactSection.tsx src/components/ContactSection.test.tsx
git commit -m "feat: contact section with validation behavior test"
```

---

## Phase 4 — Whitepapers

### Task 4.1: Whitepaper registry + content modules (TDD)

**Files:** Create `src/content/whitepapers/types.ts`, three content modules, `src/lib/whitepapers.ts`, `src/lib/whitepapers.test.ts`.

> Article bodies are reproduced verbatim (lightly trimmed for the web) from the consulting documents. Each `paragraphs` entry is one rendered `<p>`; each `heading` becomes an `<h2>`.

- [ ] **Step 1: Create `src/content/whitepapers/types.ts`**

```ts
export interface WhitepaperSection {
  heading?: string;
  paragraphs: string[];
}

export interface Whitepaper {
  slug: string;
  title: string;
  dek: string;
  order: number;
  sections: WhitepaperSection[];
}
```

- [ ] **Step 2: Create `src/content/whitepapers/saas-hostage-trap.ts`**

```ts
import type { Whitepaper } from "./types";

const article: Whitepaper = {
  slug: "saas-hostage-trap",
  title: "The SaaS Hostage Trap: Why Most Software Companies Are Already Obsolete",
  dek: "Your enterprise SaaS stack looks like a utility bill but behaves like a protection tax.",
  order: 1,
  sections: [
    {
      paragraphs: [
        "If you look closely at your company's balance sheet, you'll find a line item that looks like a utility bill but behaves like a protection tax. It's your enterprise SaaS stack.",
        "For the last twenty years, the Software-as-a-Service model has been heralded as the ultimate engine of business convenience. The pitch was beautiful: “Don't spend millions building custom infrastructure. Rent a generic, multi-tenant slice of our platform for a predictable monthly fee. We handle the servers; you handle the growth.”",
        "And it worked. It worked so well that SaaS became the default blueprint for the entire technology industry. But convenience out the front door masked a brutal economic trap designed to snap shut behind you. It's a strategy built entirely on a single metric: maximizing switching costs.",
        "Once your company crosses that threshold of lock-in, the power dynamic shifts completely. You are no longer a customer. You are a captive. And the moment your hands are tied, you are entirely at the mercy of their quarterly revenue targets.",
      ],
    },
    {
      heading: "The Anatomy of the Asymmetric Trap",
      paragraphs: [
        "When a software vendor knows it will cost you a million dollars, a year of engineering chaos, and immense internal political capital just to leave their platform, they stop acting like partners. They start acting like landlords. Once you are locked into the multi-tenant loop, you are forced to fight with your hands tied in three specific ways.",
        "1. The Pricing Extortion Loop. It always starts with aggressive introductory discounts and white-glove sales attention. But once your data is fully migrated and your team is trained, the vendor slowly turns the screw. Forced tier-migrations, sudden contract restructurings, changes to API call limits, and the unbundling of core features into premium add-ons become the norm. You swallow the annual 15% price hike because the alternative—tearing out your operational core—is unthinkable.",
        "2. The Feature Deprivation Bottleneck. A multi-tenant SaaS company builds features to acquire their next one hundred customers, not to satisfy their current captive audience. If your logistics or billing pipeline needs a custom rule to unlock millions in operational efficiency, the vendor will not build it if it doesn't align with their broad, mass-market marketing roadmap.",
        "3. The Custom Middleware Prison. To bridge the gap between what the generic app actually does and what your business actually needs, your engineering team is forced to build a massive, brittle ecosystem of custom middleware. The moment the SaaS provider pushes a mandatory, unannounced update, your internal connections shatter—and your team has to drop everything to fix the wiring on a system you don't even own.",
      ],
    },
    {
      heading: "The Modern Buggy-Whip Manufacturers",
      paragraphs: [
        "The entire economic moat of the SaaS industry was built on labor scarcity. They could demand perpetual rents because duplicating their code would traditionally require you to hire 150 developers and spend five years building from scratch. But the moment AI compressed the cost of syntax generation to near-zero, that moat dried up instantly.",
        "Multi-billion dollar SaaS platforms trying to sell the exact same generic code to every single customer are the modern equivalent of buggy-whip manufacturers. They are charging horses for shoes in an era that just invented the engine.",
        "We no longer need to buy a generic application and violently bend our internal business processes to match its hardcoded constraints. If code generation is a free commodity, you can eliminate switching costs entirely by recognizing one fundamental truth: the value is no longer in the code. The value is in your behavioral specification.",
      ],
    },
    {
      heading: "Corporate Sovereign Infrastructure",
      paragraphs: [
        "The alternative to the SaaS hostage trap isn't writing manual custom code. It's generation over configuration. Instead of paying a software vendor forever to rent a generic platform that handles 80% of your needs, mid-market companies are taking absolute ownership of their digital assets by focusing on two components: the behavioral specification (a precise blueprint of your data structures, business logic, and workflows) and the API connectors (clean routing paths into standard utility networks like Stripe or FedEx).",
        "Once your specification and your connectors are defined, modern AI-augmented engineering engines can compile pristine, hyper-optimized code directly from that spec in minutes. If a provider jacks up their pricing 30% next month, you don't panic and you don't spend six months rewriting legacy code—you swap the connector in your specification, hit execute, discard the old syntax, and regenerate a brand-new application wired to a new provider.",
        "You pay for the architecture once. You own the asset forever. The era of renting generic code is over. Stop submitting your product roadmap to a third-party vendor. Map your own specifications, build your own safety nets, and take back your corporate sovereignty.",
      ],
    },
  ],
};

export default article;
```

- [ ] **Step 3: Create `src/content/whitepapers/code-is-disposable.ts`**

```ts
import type { Whitepaper } from "./types";

const article: Whitepaper = {
  slug: "code-is-disposable",
  title: "The Code Is Disposable: Why the Specification Is Your Only Real Asset",
  dek: "If you're still measuring engineering health by lines of code, you're managing a ghost.",
  order: 2,
  sections: [
    {
      paragraphs: [
        "If you're still measuring the health of your engineering department by counting the lines of code written, the number of commits pushed, or the velocity of Jira tickets closed, you are managing a ghost.",
        "In the pre-AI era, code was the ultimate corporate asset. It represented thousands of grueling human engineering hours spent turning abstract business ideas into rigid syntax. The code was the value because the labor to produce it was incredibly scarce and expensive. Then the world flipped.",
        "With modern tooling, an engineer can prompt a model and watch it generate 500 lines of syntactically perfect code in three seconds. Writing syntax has officially transitioned from a highly skilled craft to a cheap, near-zero-marginal-cost commodity. If code is free, the code itself is no longer the asset. The code is disposable. The only real, unyielding asset your company owns is the specification.",
      ],
    },
    {
      heading: "The Sandbox Illusion",
      paragraphs: [
        "When you give an engineering team an LLM-powered environment without a rigorous, machine-readable specification, you don't get faster feature delivery. You just get an explosion of accidental complexity.",
        "Developers start writing code by intuition—prompting, pasting, hitting a runtime error, pasting the stack trace back into the AI, and asking it to fix itself. This is “vibe coding.” The AI confidently obliges, churning out massive blocks of wrapper code and nested conditionals to bypass the error. The code looks clean, passes a basic local test, and gets shoved into a pull request—but because nobody defined the precise specification of what that module is allowed to do, the AI is essentially guessing the rules of your business.",
      ],
    },
    {
      heading: "Shift the Gate: Stop Reviewing Code",
      paragraphs: [
        "If your senior technical leaders are spending their days manually reviewing AI-generated pull requests line-by-line, you have built a human bottleneck for a machine-scale problem. In a disciplined, AI-augmented engineering department, you don't manage the syntax. You manage the specification.",
        "The Spec is the Truth: your senior architects use AI to analyze old logs, read historical code, and define strict, human-readable schemas (OpenAPI, Protocol Buffers, structural type schemas) that lock down your business rules.",
        "The Code Writes Itself: once the specification is tightly defined and compiled, you hand it to the AI generation engine. Because the prompt is no longer a vague sentence but a precise, mathematical schema, the AI can generate the code flawlessly.",
        "Instant Rejection by Default: you feed the generated code into an isolated testing sandbox and slam it against automated validation. If the code deviates from the specification by even a single byte, the verification engine rejects it instantly and tells the generator to try again. The human never has to look at a single line of code until the machine has mathematically proven it conforms to the spec.",
      ],
    },
    {
      heading: "The Tech Leader's New Mandate",
      paragraphs: [
        "The legacy mindset says: “We own a complex, proprietary software application.” The modern mindset says: “We own a bulletproof, machine-readable specification. The application is just a temporary asset we can regenerate or flip into a different language by next Tuesday if we feel like it.”",
        "If your engineering department is drowning in a backlog despite having AI tools at their fingertips, stop telling them to prompt faster. Strip away the illusion that more raw syntax equals progress. Turn your abstract business rules into rigid, verifiable specifications, build the automated safety nets to police them, and let the code become exactly what it is meant to be in this new era: completely disposable.",
      ],
    },
  ],
};

export default article;
```

- [ ] **Step 4: Create `src/content/whitepapers/the-42-problem.ts`**

```ts
import type { Whitepaper } from "./types";

const article: Whitepaper = {
  slug: "the-42-problem",
  title: 'The "42" Problem: Why Your Downsized Dev Team Is Stalling on "Vibe Coding"',
  dek: "An answer that's totally precise and utterly useless because nobody understood the question.",
  order: 3,
  sections: [
    {
      paragraphs: [
        "If you've ever read The Hitchhiker's Guide to the Galaxy, you know how the joke goes. A supercomputer spends 7.5 million years calculating the Ultimate Answer to Life, the Universe, and Everything. The answer? 42. It's completely accurate, totally precise, and utterly useless because nobody actually understood the question.",
        "Right now, mid-market tech departments are hitting their own version of the “42” problem. Over the last year, a lot of CTOs were forced to downsize engineering headcounts while being told to keep product roadmaps exactly the same. To bridge the gap, companies handed out corporate licenses for AI coding assistants with a simple mandate: “Use AI to code faster and burn through the ticket backlog.”",
        "On paper, the charts look great. Individual developers feel like wizards—they type a prompt, and the AI instantly spits out code. Here is 42. But inside the actual repositories, features aren't shipping any faster. End-to-end delivery has hit a wall.",
      ],
    },
    {
      heading: "Welcome to Vibe Coding",
      paragraphs: [
        "The Blind Paste: the developer prompts an LLM to build a feature module inside a legacy system they didn't build. The AI delivers a beautiful, confident block of code, and the developer copies and pastes it.",
        "The Dependency Ripple: the code passes basic local tests. But the moment it hits staging, it triggers a quiet cascade of regression failures across three completely unrelated services.",
        "The Prompt Flail: instead of stepping back to reverse-engineer why the failure happened, the developer just copies the error stack trace, feeds it back to the AI, and asks “Why did this break?” The AI apologizes, tweaks two variables, and spits out a new block. This is vibe coding—algorithmic whack-a-mole replacing actual structural engineering.",
      ],
    },
    {
      heading: "The Pull Request Gridlock",
      paragraphs: [
        "This trial-and-error loop has shifted the software bottleneck from writing code to comprehending code. Because developers can generate hundreds of lines with a single keystroke, pull requests have exploded in size—but your senior engineers didn't magically double their brain capacity. In fact, you might have fewer of them than six months ago.",
        "A senior engineer opens a PR and is stared down by 800 lines of complex, AI-generated logic written by a developer who can't explain why the AI made those architectural trade-offs. The result is total review gridlock. PRs sit in limbo for days because nobody has the confidence to sign off on code they didn't write, can't verify, and are terrified will break production.",
      ],
    },
    {
      heading: "The Real Fix: From Code Generation to Spec Verification",
      paragraphs: [
        "Generative AI is an accelerator for whatever environment you dump it into. If you inject it into a fragile, tightly coupled legacy architecture, it just helps your team create technical and cognitive debt at a pace nobody can keep up with. The high-value work is defining, verifying, and pinning down the precise intent of code before it ever touches a CPU.",
        "Surgically isolate the sandbox: build hard boundaries around your core domains and use AI agents to map dependency graphs first, so humans know where the tripwires are.",
        "Elevate the spec over the syntax: use AI to analyze old code patterns, logs, and database state transitions to extract the true underlying business specification, then lock it into a strict, human-readable schema. If the generated code doesn't mathematically conform, the system rejects it immediately.",
        "Automate the guardrails via real telemetry: use AI to build ironclad regression suites derived from real production telemetry. When a machine handles 95% of edge-case validation against a locked specification, your lean staff can ship with structural certainty. If your team is generating mountains of code but struggling to finish features, you don't have a resource problem—you have the “42” problem.",
      ],
    },
  ],
};

export default article;
```

- [ ] **Step 5: Write the failing test** at `src/lib/whitepapers.test.ts`

```ts
import { describe, it, expect } from "vitest";
import { getAllWhitepapers, getWhitepaper, whitepaperSlugs } from "./whitepapers";

describe("whitepapers registry", () => {
  it("returns all three articles in order", () => {
    const all = getAllWhitepapers();
    expect(all.map((w) => w.slug)).toEqual([
      "saas-hostage-trap",
      "code-is-disposable",
      "the-42-problem",
    ]);
  });

  it("looks up an article by slug", () => {
    const w = getWhitepaper("the-42-problem");
    expect(w?.title).toContain("42");
    expect(w?.sections.length).toBeGreaterThan(0);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getWhitepaper("nope")).toBeUndefined();
  });

  it("exposes slugs for static params", () => {
    expect(whitepaperSlugs()).toContain("code-is-disposable");
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- src/lib/whitepapers.test.ts`
Expected: FAIL — `whitepapers` module not found.

- [ ] **Step 7: Implement** `src/lib/whitepapers.ts`

```ts
import type { Whitepaper } from "@/content/whitepapers/types";
import saasHostageTrap from "@/content/whitepapers/saas-hostage-trap";
import codeIsDisposable from "@/content/whitepapers/code-is-disposable";
import the42Problem from "@/content/whitepapers/the-42-problem";

const articles: Whitepaper[] = [saasHostageTrap, codeIsDisposable, the42Problem].sort(
  (a, b) => a.order - b.order
);

export function getAllWhitepapers(): Whitepaper[] {
  return articles;
}

export function getWhitepaper(slug: string): Whitepaper | undefined {
  return articles.find((a) => a.slug === slug);
}

export function whitepaperSlugs(): string[] {
  return articles.map((a) => a.slug);
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- src/lib/whitepapers.test.ts`
Expected: PASS (all cases).

- [ ] **Step 9: Commit**

```bash
git add src/content/whitepapers src/lib/whitepapers.ts src/lib/whitepapers.test.ts
git commit -m "feat: whitepaper registry + three article content modules (TDD)"
```

### Task 4.2: Whitepaper rendering components

**Files:** Create `src/components/whitepapers/WhitepaperBody.tsx`, `src/components/whitepapers/WhitepaperLayout.tsx`.

- [ ] **Step 1: Create `src/components/whitepapers/WhitepaperBody.tsx`**

```tsx
import type { Whitepaper } from "@/content/whitepapers/types";

export default function WhitepaperBody({ article }: { article: Whitepaper }) {
  return (
    <div className="space-y-8">
      {article.sections.map((section, i) => (
        <div key={i}>
          {section.heading && (
            <h2 className="font-serif text-2xl font-bold text-navy">
              {section.heading}
            </h2>
          )}
          <div className="mt-3 space-y-4">
            {section.paragraphs.map((p, j) => (
              <p key={j} className="leading-relaxed text-slate-700">
                {p}
              </p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/whitepapers/WhitepaperLayout.tsx`**

```tsx
import Link from "next/link";
import type { Whitepaper } from "@/content/whitepapers/types";
import WhitepaperBody from "./WhitepaperBody";
import CTAButton from "../CTAButton";

export default function WhitepaperLayout({ article }: { article: Whitepaper }) {
  return (
    <main className="bg-mist">
      <div className="bg-navy px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <Link href="/#whitepapers" className="text-sm text-slate-300 hover:text-mist">
            &larr; All whitepapers
          </Link>
          <h1 className="mt-4 font-serif text-3xl font-bold text-mist lg:text-4xl">
            {article.title}
          </h1>
          <p className="mt-3 text-lg text-slate-300">{article.dek}</p>
        </div>
      </div>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <WhitepaperBody article={article} />
        <div className="mt-14 rounded-xl bg-navy p-8 text-center">
          <p className="font-serif text-xl font-bold text-mist">
            Renting software you could own forever?
          </p>
          <p className="mt-2 text-slate-300">20 minutes. No pitch. Just questions.</p>
          <div className="mt-5">
            <CTAButton href="/#contact">Book a 20-min call &rarr;</CTAButton>
          </div>
        </div>
      </article>
    </main>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/whitepapers
git commit -m "feat: whitepaper rendering components"
```

### Task 4.3: Whitepapers index page

**Files:** Create `src/app/whitepapers/page.tsx`.

- [ ] **Step 1: Create `src/app/whitepapers/page.tsx`**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import { getAllWhitepapers } from "@/lib/whitepapers";

export const metadata: Metadata = {
  title: "Whitepapers | WG Partners",
  description: "The thinking behind the thesis — essays on SaaS lock-in, spec-driven engineering, and AI modernization.",
};

export default function WhitepapersIndex() {
  const articles = getAllWhitepapers();
  return (
    <>
      <TopNav />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <p className="font-serif text-sm uppercase tracking-[0.25em] text-royal">
          Whitepapers
        </p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-navy">
          The thinking behind the thesis.
        </h1>
        <div className="mt-10 space-y-6">
          {articles.map((a) => (
            <Link
              key={a.slug}
              href={`/whitepapers/${a.slug}`}
              className="block rounded-xl border border-slate-200 bg-white p-7 shadow-sm transition-colors hover:border-royal"
            >
              <h2 className="font-serif text-2xl font-bold text-navy">{a.title}</h2>
              <p className="mt-2 text-slate-600">{a.dek}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-royal">
                Read &rarr;
              </span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/whitepapers/page.tsx
git commit -m "feat: whitepapers index page"
```

### Task 4.4: Whitepaper article page

**Files:** Create `src/app/whitepapers/[slug]/page.tsx`.

- [ ] **Step 1: Create `src/app/whitepapers/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TopNav from "@/components/TopNav";
import Footer from "@/components/Footer";
import WhitepaperLayout from "@/components/whitepapers/WhitepaperLayout";
import { getWhitepaper, whitepaperSlugs } from "@/lib/whitepapers";

export function generateStaticParams() {
  return whitepaperSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getWhitepaper(params.slug);
  if (!article) return { title: "Whitepaper | WG Partners" };
  return {
    title: `${article.title} | WG Partners`,
    description: article.dek,
    alternates: { canonical: `/whitepapers/${article.slug}` },
  };
}

export default function WhitepaperPage({ params }: { params: { slug: string } }) {
  const article = getWhitepaper(params.slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.dek,
    author: { "@type": "Organization", name: "Wyatt & Grundvig Partners" },
    publisher: { "@type": "Organization", name: "WG Partners" },
  };

  return (
    <>
      <TopNav />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WhitepaperLayout article={article} />
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/whitepapers/[slug]/page.tsx"
git commit -m "feat: whitepaper article page with static params + metadata"
```

### Task 4.5: Whitepapers homepage teaser

**Files:** Create `src/components/WhitepapersTeaser.tsx`.

- [ ] **Step 1: Create `src/components/WhitepapersTeaser.tsx`**

```tsx
import Link from "next/link";
import Section from "./Section";
import { getAllWhitepapers } from "@/lib/whitepapers";

export default function WhitepapersTeaser() {
  const articles = getAllWhitepapers();
  return (
    <Section id="whitepapers" className="bg-mist">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-serif text-sm uppercase tracking-[0.25em] text-royal">
            Whitepapers
          </p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-navy lg:text-4xl">
            The thinking behind the thesis.
          </h2>
        </div>
        <Link href="/whitepapers" className="hidden text-sm font-semibold text-royal hover:underline sm:block">
          View all &rarr;
        </Link>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={`/whitepapers/${a.slug}`}
            className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-royal"
          >
            <h3 className="font-serif text-lg font-bold text-navy">{a.title}</h3>
            <p className="mt-2 flex-1 text-sm text-slate-600">{a.dek}</p>
            <span className="mt-4 text-sm font-semibold text-royal">Read &rarr;</span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/WhitepapersTeaser.tsx
git commit -m "feat: whitepapers homepage teaser"
```

---

## Phase 5 — Assemble & Finalize

### Task 5.1: Homepage assembly

**Files:** Replace `src/app/page.tsx`.

- [ ] **Step 1: Replace the whole file**

```tsx
import TopNav from "@/components/TopNav";
import Hero from "@/components/Hero";
import SaaSKiller from "@/components/SaaSKiller";
import WhitepapersTeaser from "@/components/WhitepapersTeaser";
import WhoWeAre from "@/components/WhoWeAre";
import HowWeWork from "@/components/HowWeWork";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <TopNav />
      <main>
        <Hero />
        <SaaSKiller />
        <WhitepapersTeaser />
        <WhoWeAre />
        <HowWeWork />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: assemble WG Partners homepage"
```

### Task 5.2: Sitemap & robots

**Files:** Replace `src/app/sitemap.ts` and `src/app/robots.ts`.

- [ ] **Step 1: Replace `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { whitepaperSlugs } from "@/lib/whitepapers";

const BASE = "https://www.wgpartners.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now },
    { url: `${BASE}/whitepapers`, lastModified: now },
    ...whitepaperSlugs().map((slug) => ({
      url: `${BASE}/whitepapers/${slug}`,
      lastModified: now,
    })),
  ];
}
```

- [ ] **Step 2: Replace `src/app/robots.ts`**

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://www.wgpartners.com/sitemap.xml",
  };
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: sitemap + robots for wgpartners.com"
```

### Task 5.3: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests pass (smoke, contact, whitepapers, ContactSection).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds; output lists `/`, `/whitepapers`, and `/whitepapers/[slug]` (3 static params) with no type errors.

- [ ] **Step 4: Manual smoke (dev server)**

Run: `npm run dev`, then in a browser:
- `/` renders; top-nav anchors smooth-scroll to SaaS Killer, Whitepapers, Who We Are, How We Work, Contact.
- Result band shows 90% / 10× / Zero; collapses to one column on a narrow viewport.
- Contact form: submitting empty shows validation errors; a valid submission triggers a toast (success requires working SMTP env vars — otherwise the error toast with the phone number is expected).
- `/whitepapers` lists all three articles; each card opens its article page; the "All whitepapers" link returns to `/#whitepapers`.
- Confirm no Roger & Sally text, routes, or analytics remain in the rendered site.
  (Note: the old `favicon.ico` and unused images under `public/` are R&S assets — replacing the favicon and pruning `public/` is a follow-up once WG brand assets exist; it does not block this build.)

- [ ] **Step 5: Final commit (if any tweaks were needed)**

```bash
git add -A
git commit -m "chore: WG Partners site verification fixes"
```

---

## Environment Variables (operator note)

The contact form reuses the existing env var names. Update `.env` / Vercel project env with WG values:

```
SMTP_SERVER_HOST=<your smtp host>
SMTP_SERVER_USERNAME=<your smtp user>
SMTP_SERVER_PASSWORD=<your smtp password>
SITE_MAIL_RECIEVER=roger@wgpartners.com
```

(`SITE_MAIL_RECIEVER` keeps the original spelling used by the codebase. The form falls back to `roger@wgpartners.com` if unset.)

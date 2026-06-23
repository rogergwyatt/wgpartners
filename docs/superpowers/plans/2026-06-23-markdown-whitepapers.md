# Markdown-Driven Whitepapers Implementation Plan

**Goal:** Replace the hand-coded TypeScript whitepaper modules with drop-in Markdown files in `src/content/whitepapers/`, auto-loaded into the site and ordered newest-first by a `date` frontmatter field.

**Architecture:** A build-time registry reads `src/content/whitepapers/*.md` with `fs`, parses frontmatter via `gray-matter`, renders the body to HTML via `marked`, and exposes the same `getAllWhitepapers` / `getWhitepaper` / `whitepaperSlugs` API the pages already use. Rendered Markdown is styled with `@tailwindcss/typography`.

**Tech:** Next.js 14 (SSG), `gray-matter`, `marked`, `@tailwindcss/typography`. All parsing happens at build time (static pages), so `fs` access is safe.

---

## Frontmatter schema (per `*.md`)
```
---
title: "…"          # required
dek: "…"            # required — one-line summary shown as subtitle / card text
date: 2026-06-16    # required — ISO date; site sorts newest-first
---
<markdown body>
```
Slug = filename without `.md`.

## Data model
```ts
export interface Whitepaper {
  slug: string;
  title: string;
  dek: string;
  date: string;        // ISO yyyy-mm-dd
  contentHtml: string; // rendered markdown
}
```

## Tasks

1. **Add dependencies:** `gray-matter`, `marked`, `@tailwindcss/typography`. Register the typography plugin in `tailwind.config.ts`.
2. **Migrate content:** create `saas-hostage-trap.md`, `code-is-disposable.md`, `the-42-problem.md` with frontmatter (dates 2026-06-16 / -15 / -14 to preserve current order) and the verbatim article bodies (section headings → `##`). Delete the three `.ts` modules.
3. **Types:** rewrite `src/content/whitepapers/types.ts` to the model above (drop `WhitepaperSection`).
4. **Registry (TDD):** rewrite `src/lib/whitepapers.ts` to read the folder with `fs`, parse with `gray-matter`, render with `marked`, sort by `date` desc. Update `src/lib/whitepapers.test.ts` to cover fs loading, frontmatter, ordering, and rendered HTML.
5. **Rendering:** `WhitepaperBody` renders `contentHtml` inside a themed `prose` block. `WhitepaperLayout` shows the formatted date under the dek. `[slug]/page.tsx` adds `datePublished` to the Article JSON-LD.
6. **Verify:** `npm test`, `npm run lint`, `npm run build` (all 3 pages prerender). Commit + push.

## Notes
- `marked` output is not sanitized — acceptable because Markdown is first-party repo content, not user input.
- Adding a new whitepaper later = drop a `.md` in the folder; no code changes.

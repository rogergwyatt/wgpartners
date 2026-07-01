# "Compile, Don't Rent" — pitch kit

Two self-contained marketing assets for the consulting practice that replaces SaaS/legacy
systems with LLM-generated custom applications. Both are static HTML, no build step, no
backend, no framework. Drop-in ready.

This README is the handoff for whoever wires these into the site. Read the
**"Rules that keep this credible"** section before changing any numbers — the credibility
of these assets depends on a specific discipline, and it's easy to break by accident.

---

## What's in the box

| File | What it is | Type |
|------|-----------|------|
| `compile-dont-rent-onepager.html` | One-page leave-behind. Frames the argument: an agent's best output is *code*, not a permanent seat in the request path. Includes a static cost-divergence chart, honest-boundary strip, three objection one-liners, CTA. | Static HTML + CSS + inline SVG. Zero JS. |
| `agent-tax-calculator.html` | Interactive calculator. Lead enters their request volume; it shows annual agent-tax vs. compiled cost, break-even, a live ticking meter, and a redrawing chart. Two "builders" let you derive both cost inputs from sourced data live. | Static HTML + CSS + vanilla JS (inline). No framework, no localStorage. |

Both render identically standalone — open in a browser, no server needed.

---

## ⚠️ Before publishing: 2 placeholders, 4 spots

Each file has the practice name and contact in two places. Search and replace in **both** files:

1. **Wordmark** (header), currently: `[ YOUR&nbsp;PRACTICE ]`
   - `compile-dont-rent-onepager.html` line ~146
   - `agent-tax-calculator.html` line ~135
2. **Footer**, currently: `[ Your Practice ] &middot; name@practice.com`
   - `compile-dont-rent-onepager.html` line ~251
   - `agent-tax-calculator.html` line ~273

Nothing else is a placeholder. (`[ YOUR PRACTICE ]` is the only bracketed token; the rest of
the copy is final.)

---

## Integration options

These are framework-agnostic. Pick whatever fits the existing site:

- **Static pages (simplest).** Drop both files into the site's static/public dir and link
  them, e.g. `/pitch` → one-pager, `/calculator` → calculator. No changes needed.
- **Iframe embed.** Each file is self-contained, so `<iframe src="/calculator.html">` works
  if you want them inside an existing page shell. Set a generous height on the calculator
  (~1100px desktop) since it doesn't postMessage its height.
- **Port to components (React/Vue/etc).** Markup is plain semantic HTML; styles are scoped
  via class names under `.sheet`; the calculator's JS is a single IIFE at the bottom of the
  file. If converting to React: lift the `recompute()` math into a hook, replace the manual
  DOM writes with state, and keep the SVG chart logic intact (it's pure string-building, easy
  to port). **Do not** introduce `localStorage`/`sessionStorage` — there's no need and it adds
  state bugs.

### Dependencies & gotchas

- **Google Fonts** loaded via `<link>` (Archivo, Inter, IBM Plex Mono). If the site has a
  strict CSP or needs offline/air-gapped rendering, self-host these and update the `<link>`.
  There are sensible system-font fallbacks already, so it degrades gracefully if fonts fail.
- **No other external assets.** No images, no CDN scripts, no analytics. Add your own if wanted.
- **Print/PDF:** the one-pager has `@media print` styles and collapses to ~1 page. "Print to
  PDF" in any browser produces the leave-behind. The calculator isn't designed for print.
- **Accessibility:** keyboard focus is visible, `prefers-reduced-motion` is respected (the
  ticker and chart animation stop). Keep these if you refactor.
- **Responsive:** both collapse to single-column under 720px.

---

## Rules that keep this credible (read before editing numbers)

The whole reason the calculator survives a skeptical CFO is that **every number in it is
externally verifiable or user-editable.** That's a feature, not an accident. Two rules:

1. **No unsourced numbers presented as fact.** We deliberately did *not* add a "what a big
   systems integrator would charge" figure, because GSI pricing is opaque and unsourceable —
   one self-serving number among verifiable ones contaminates trust in all of them. Keep it out
   of the instrument. (Generic, ranged "traditional build" anchoring belongs in narrative copy,
   not the calculator.)
2. **Every assumption stays editable.** Don't hard-code a cost the user can't change. The point
   is to let a lead dial it to *their* reality in the room.

The two "builder" widgets exist to prove the inputs are grounded:
- **Agent side** — "Build this from tokens": model dropdown (current Anthropic rates), tokens
  in/out, calls per task, cache %. Computes per-request cost; "Use this →" pushes it into the
  main field.
- **Compiled side** — "Back this with a platform": Edge / Serverless / Full-stack presets,
  each pre-filled with a sourced per-million figure and a citation line.

---

## Numbers & sources (as of June 2026 — verify before relying on them)

Token and cloud prices move. If these get stale, update the constants noted below.

**Agent inference (per million tokens, in/out):** Haiku 4.5 $1/$5, Sonnet 4.6 $3/$15,
Opus 4.8 $5/$25. → in calculator JS, `RATES` object.

**Compiled runtime, per million requests:**
- Edge ~$0.50 — Cloudflare Workers: $5/mo incl. 10M requests, then $0.30/M + $0.02/M CPU-ms, zero egress.
- Serverless ~$2 — AWS Lambda: $0.20/M requests + ~$1.67/M compute at 512MB/200ms (x86).
- Full-stack ~$5.70 — Lambda + API Gateway + CloudWatch + NAT, all-in, per a 2026 cost teardown of a 10M-request API.
- → in calculator JS, `PLATFORM_SRC` object + the `data-v` values on the `#pseg` buttons.

**The punchline these support:** agent at $0.02/request = $20,000 per million; compiled is
$0.50–$6 per million. A 3,000–85,000× gap. The takeaway is that compiled-runtime precision
*doesn't matter* — the real cost of the compiled path is the **one-time build** and **annual
maintenance** fields, which are scoped engineering effort (your fee), not a market-price lookup.

**Default scenario** (editable): 50,000 req/day, $0.02/agent request, $2/M compiled,
$45k build, $9k/yr maintenance, 3-year horizon → ~$1.1M agent vs. ~$72k compiled, break-even ~46 days.

---

## Quick edit map (calculator JS, bottom of file)

- `RATES` — Anthropic per-million token prices for the token builder.
- `PLATFORM_SRC` + `#pseg` button `data-v` — compiled-cost presets and citations.
- `recompute()` — the core cost math (annual totals, break-even, savings).
- `drawChart()` — SVG cost-divergence chart (pure string-building).
- `tick()` — the live agent-tax meter.
- Default input values live in the HTML `value="..."` attributes, not the JS.

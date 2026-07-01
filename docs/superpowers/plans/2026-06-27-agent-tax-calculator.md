# Agent Tax Calculator — Implementation Plan

**Goal:** Port the standalone `agent-tax-calculator.html` kit into a native React page at `/calculator`, themed to Midnight & Gold, preserving the sourced numbers and math exactly. Add a top-nav item and a SaaS Killer CTA.

**Approach:** Extract the credibility-critical math into a pure, unit-tested module (`src/lib/calculator.ts`); build a client component (`AgentTaxCalculator`) that renders inputs, the token/platform builders, result stats, the live ticker, and the SVG cost chart using that module; wrap it in a `/calculator` route with TopNav/Footer + a short themed intro.

**Tech:** Next.js 14 client component, React state/useMemo/requestAnimationFrame, inline SVG (ported from the original `drawChart`), Tailwind (Midnight & Gold). No new deps.

---

## Preserved numbers (verbatim from the kit — do not alter)
- **RATES** (per-M tokens in/out): haiku 1/5, sonnet 3/15, opus 5/25.
- **PLATFORMS** ($/M requests + citation): edge 0.5, serverless 2, full-stack 5.7.
- **Math:** `dailyAgent = rpd*agc`; `dailyCompRun = rpd*(cmpPerM/1e6)`; `dailyMaint = mnt/365`; `DPM = 30.4375`; `monAgent = dailyAgent*DPM`; `monComp = dailyCompRun*DPM + mnt/12`; `agentTotal = monAgent*months`; `compTotal = bld + monComp*months`; `savings = agentTotal - compTotal`; `beDays = dailyDelta>0 ? bld/dailyDelta : Infinity` where `dailyDelta = dailyAgent - dailyCompRun - dailyMaint`.
- **Token builder:** `effIn = ratesIn*(1-0.9*cache)`; `perCall = (inTok*effIn + outTok*ratesOut)/1e6`; `perReq = perCall*calls`.

**Default-scenario sanity check (README):** 50k/day, $0.02/req, $2/M, $45k build, $9k/yr, 3 yr → agentTotal ≈ $1,095,750; compTotal ≈ $72,110; break-even ≈ 46 days. Default token build (sonnet, 6000 in / 1000 out, 1 call, 0% cache) → $0.033/request.

## Theme mapping
- Agent / "rent" (expensive): red `#DC2626`. Compiled / "own": emerald `#047857`. "You keep" hero: navy card, gold number (mirrors the ResultBand). Panels: white on mist, navy serif headings, `font-mono` for numeric values.

## Tasks
1. **`src/lib/calculator.ts` (TDD):** constants (RATES, PLATFORMS, DPM), `computeScenario(inputs)`, `perRequestCost(tokenInputs)`, and money/format helpers. Unit-test against the sanity-check figures above. `src/lib/calculator.test.ts`.
2. **`src/components/calculator/AgentTaxCalculator.tsx`** (`"use client"`): inputs (rpd + slider, agc + slider, latency, compiled $/M, build, maintenance, horizon segmented control), the "build from tokens" and "back with a platform" builders, result stats, live ticker (rAF, gated on `prefers-reduced-motion`), SVG chart (ported `drawChart`), and readout text. Uses the lib.
3. **`src/app/calculator/page.tsx`:** metadata + TopNav + themed intro + `<AgentTaxCalculator/>` + Footer.
4. **Nav + CTA:** add "Calculator" to `TopNav` links (desktop + mobile); add a CTA (`CTAButton href="/calculator"`) in `SaaSKiller`.
5. **Sitemap:** add `/calculator`.
6. **Verify:** `npm test`, `npm run lint`, `npm run build`; browser check (inputs recompute, builders push values, chart redraws, ticker runs).

## Notes
- Keep every input user-editable; keep the platform citations; no unsourced "SI price" figure (per the kit's credibility rules).
- No localStorage/sessionStorage.

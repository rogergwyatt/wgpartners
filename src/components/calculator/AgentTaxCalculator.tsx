"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  computeScenario,
  perRequestCost,
  money,
  moneyExact,
  perReqLabel,
  DPM,
  RATES,
  PLATFORMS,
  type ModelId,
  type Scenario,
} from "@/lib/calculator";

const AGENT = "#DC2626"; // rent / expensive
const COMPILED = "#047857"; // own / compiled

const fieldClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-ink focus:border-royal focus:outline-none focus:ring-1 focus:ring-royal";

function buildChart(s: Scenario): string {
  const W = 560,
    H = 230,
    L = 46,
    R = 14,
    T = 16,
    B = 34;
  const pw = W - L - R,
    ph = H - T - B;
  const months = s.months;
  const agentCum = (m: number) => s.monAgent * m;
  const compCum = (m: number) => s.bld + s.monComp * m;
  const ymax = Math.max(agentCum(months), compCum(months), 1) * 1.08;
  const X = (m: number) => L + (m / months) * pw;
  const Y = (v: number) => T + ph - (v / ymax) * ph;

  let ag = "";
  for (let m = 0; m <= months; m++)
    ag += (m === 0 ? "M" : "L") + X(m).toFixed(1) + "," + Y(agentCum(m)).toFixed(1) + " ";
  const cp =
    "M" + X(0).toFixed(1) + "," + Y(compCum(0)).toFixed(1) + " L" + X(months).toFixed(1) + "," + Y(compCum(months)).toFixed(1);

  const beMonth = s.beDays / DPM;
  let crossSVG = "";
  if (s.beDays !== Infinity && beMonth <= months) {
    const cx = X(beMonth),
      cyA = Y(agentCum(beMonth));
    let poly = "M" + cx.toFixed(1) + "," + cyA.toFixed(1);
    for (let mm = Math.ceil(beMonth); mm <= months; mm++)
      poly += " L" + X(mm).toFixed(1) + "," + Y(agentCum(mm)).toFixed(1);
    poly += " L" + X(months).toFixed(1) + "," + Y(compCum(months)).toFixed(1);
    poly += " L" + cx.toFixed(1) + "," + Y(compCum(beMonth)).toFixed(1) + " Z";
    crossSVG =
      '<path d="' + poly + '" fill="' + AGENT + '" fill-opacity="0.10"/>' +
      '<line x1="' + cx.toFixed(1) + '" y1="' + cyA.toFixed(1) + '" x2="' + cx.toFixed(1) + '" y2="' + (T + ph) + '" stroke="#0A2540" stroke-width="1" stroke-dasharray="3 3"/>' +
      '<circle cx="' + cx.toFixed(1) + '" cy="' + cyA.toFixed(1) + '" r="3.5" fill="#0A2540"/>';
  }

  const xlab = (m: number) => {
    const yr = m / 12;
    return yr % 1 === 0 ? yr + "y" : Math.round(m) + "m";
  };
  let ticks = "";
  [0, months / 2, months].forEach((m) => {
    ticks +=
      '<text x="' + X(m).toFixed(1) + '" y="' + (H - 12) + '" text-anchor="middle" font-family="ui-monospace,monospace" font-size="9" fill="#94A3B8">' + (m === 0 ? "now" : xlab(m)) + "</text>";
  });
  const ytop =
    '<text x="' + (L - 6) + '" y="' + (T + 8) + '" text-anchor="end" font-family="ui-monospace,monospace" font-size="9" fill="#94A3B8">' + money(ymax) + "</text>";

  return (
    '<line x1="' + L + '" y1="' + T + '" x2="' + L + '" y2="' + (T + ph) + '" stroke="#E2E8F0"/>' +
    '<line x1="' + L + '" y1="' + (T + ph) + '" x2="' + (W - R) + '" y2="' + (T + ph) + '" stroke="#E2E8F0"/>' +
    crossSVG +
    '<path d="' + cp + '" fill="none" stroke="' + COMPILED + '" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<path d="' + ag + '" fill="none" stroke="' + AGENT + '" stroke-width="2.5"/>' +
    ytop +
    ticks +
    '<text x="' + (W - R) + '" y="' + (Y(agentCum(months)) - 6).toFixed(1) + '" text-anchor="end" font-family="Georgia,serif" font-weight="700" font-size="11" fill="' + AGENT + '">Agent</text>' +
    '<text x="' + (W - R) + '" y="' + (Y(compCum(months)) - 6).toFixed(1) + '" text-anchor="end" font-family="Georgia,serif" font-weight="700" font-size="11" fill="' + COMPILED + '">Compiled</text>'
  );
}

export default function AgentTaxCalculator() {
  // main inputs
  const [rpd, setRpd] = useState(50000);
  const [agc, setAgc] = useState(0.02);
  const [lat, setLat] = useState(1.5);
  const [cmpPerM, setCmpPerM] = useState(2);
  const [bld, setBld] = useState(45000);
  const [mnt, setMnt] = useState(9000);
  const [years, setYears] = useState(3);

  // token builder
  const [model, setModel] = useState<ModelId>("sonnet");
  const [inTok, setInTok] = useState(6000);
  const [outTok, setOutTok] = useState(1000);
  const [calls, setCalls] = useState(1);
  const [cachePct, setCachePct] = useState(0);

  // platform builder
  const [platformId, setPlatformId] = useState("serverless");

  const s = useMemo(
    () => computeScenario({ rpd, agc, lat, cmpPerM, bld, mnt, years }),
    [rpd, agc, lat, cmpPerM, bld, mnt, years]
  );
  const perReq = useMemo(
    () => perRequestCost({ model, inTok, outTok, calls, cachePct }),
    [model, inTok, outTok, calls, cachePct]
  );
  const chart = useMemo(() => buildChart(s), [s]);

  // live ticker (respects prefers-reduced-motion)
  const [accrued, setAccrued] = useState(0);
  const startRef = useRef(Date.now());
  const dailyAgentRef = useRef(s.dailyAgent);
  dailyAgentRef.current = s.dailyAgent;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf = 0;
    const loop = () => {
      const perSec = dailyAgentRef.current / 86400;
      setAccrued(perSec * ((Date.now() - startRef.current) / 1000));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const yl = years + "-yr";
  const rps = rpd / 86400;
  const beTxt =
    s.beDays === Infinity
      ? "never at these inputs"
      : s.beDays <= 365
        ? Math.round(s.beDays) + " days"
        : (s.beDays / 365).toFixed(1) + " yrs";

  const readout = (() => {
    if (s.savings < 0) {
      return `At this volume the agent is still ${money(Math.abs(s.savings))} cheaper over ${years} years — so here you'd keep it live. That's the honest answer, and exactly the judgment call worth paying for. Push the volume up and watch where it flips.`;
    }
    const beWord =
      s.beDays === Infinity ? "never" : s.beDays <= 365 ? Math.round(s.beDays) + " days" : (s.beDays / 365).toFixed(1) + " years";
    const secs = rpd * 365 * lat;
    let timeLine = "";
    if (secs > 0) {
      const days = secs / 86400;
      const human = days >= 1 ? days.toFixed(days >= 10 ? 0 : 1) + " days" : (secs / 3600).toFixed(1) + " hours";
      timeLine = ` It also erases about ${human} of cumulative wait time every year.`;
    }
    return `Compiling this workflow pays for itself in ${beWord}, then keeps ${money(s.savings)} over ${years} years — money you're otherwise paying as inference tax on logic that never changes.${timeLine}`;
  })();

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      {/* INPUTS */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-4 font-mono text-xs uppercase tracking-widest text-slate-500">
          Your workflow
        </p>

        <Field label="Requests per day" hint={`${Math.round(rpd * 365).toLocaleString()} / yr`}>
          <input type="number" min={1} step={1000} value={rpd} onChange={(e) => setRpd(numOr(e.target.value, 0))} className={fieldClass} />
          <input type="range" min={100} max={500000} step={100} value={Math.min(rpd, 500000)} onChange={(e) => setRpd(Number(e.target.value))} className="mt-2 w-full accent-[#DC2626]" />
        </Field>

        <Field label="Agent cost / request" hint="inference, live">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-slate-500">$</span>
            <input type="number" min={0} step={0.001} value={agc} onChange={(e) => setAgc(numOr(e.target.value, 0))} className={fieldClass} />
          </div>
          <input type="range" min={0} max={0.1} step={0.001} value={Math.min(agc, 0.1)} onChange={(e) => setAgc(Number(e.target.value))} className="mt-2 w-full accent-[#DC2626]" />

          <details className="mt-3 rounded border border-dashed border-slate-300 bg-slate-50">
            <summary className="cursor-pointer px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-[#DC2626]">
              Build this from tokens
            </summary>
            <div className="space-y-2 px-3 pb-3">
              <div>
                <span className="mb-1 block font-mono text-[10px] uppercase text-slate-500">Model (June 2026 rates)</span>
                <select value={model} onChange={(e) => setModel(e.target.value as ModelId)} className={fieldClass}>
                  <option value="haiku">Haiku 4.5 · $1 / $5</option>
                  <option value="sonnet">Sonnet 4.6 · $3 / $15</option>
                  <option value="opus">Opus 4.8 · $5 / $25</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Mini label="Input tok / call"><input type="number" min={0} step={500} value={inTok} onChange={(e) => setInTok(numOr(e.target.value, 0))} className={fieldClass} /></Mini>
                <Mini label="Output tok / call"><input type="number" min={0} step={100} value={outTok} onChange={(e) => setOutTok(numOr(e.target.value, 0))} className={fieldClass} /></Mini>
              </div>
              <div className="flex gap-2">
                <Mini label="Calls / task"><input type="number" min={1} step={1} value={calls} onChange={(e) => setCalls(numOr(e.target.value, 1))} className={fieldClass} /></Mini>
                <Mini label={`Input cached ${cachePct}%`}><input type="range" min={0} max={90} step={5} value={cachePct} onChange={(e) => setCachePct(Number(e.target.value))} className="mt-2 w-full accent-[#DC2626]" /></Mini>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <div>
                  <span className="block font-mono text-[10px] uppercase text-slate-500">Cost / request</span>
                  <span className="font-mono text-base font-bold text-[#DC2626]">{perReqLabel(perReq)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAgc(Number(perReq.toFixed(3)))}
                  className="rounded bg-[#047857] px-3 py-2 font-mono text-[11px] font-semibold text-white"
                >
                  Use this →
                </button>
              </div>
              <p className="text-[11px] leading-snug text-slate-500">
                A real agent is a loop — set calls/task to 3–6 for a tool-using workflow and watch it climb. Caching cuts input only; it never fixes latency or non-determinism.
              </p>
            </div>
          </details>
        </Field>

        <Field label="Agent latency / request" hint="seconds">
          <input type="number" min={0} step={0.1} value={lat} onChange={(e) => setLat(numOr(e.target.value, 0))} className={fieldClass} />
        </Field>

        <Field label="Compiled cost" hint="$ / million reqs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-slate-500">$</span>
            <input type="number" min={0} step={0.5} value={cmpPerM} onChange={(e) => setCmpPerM(numOr(e.target.value, 0))} className={fieldClass} />
          </div>
          <details className="mt-3 rounded border border-dashed border-emerald-300 bg-emerald-50/50">
            <summary className="cursor-pointer px-3 py-2 font-mono text-[11px] uppercase tracking-wide text-[#047857]">
              Back this with a platform
            </summary>
            <div className="space-y-2 px-3 pb-3">
              <div className="flex gap-1.5">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setPlatformId(p.id);
                      setCmpPerM(p.value);
                    }}
                    className={`flex flex-1 flex-col items-center gap-0.5 rounded border px-1 py-2 font-mono text-[10px] font-semibold leading-tight ${
                      platformId === p.id
                        ? "border-[#047857] bg-[#047857] text-white"
                        : "border-slate-300 bg-white text-slate-500"
                    }`}
                  >
                    {p.label}
                    <span className={`text-[9px] font-normal ${platformId === p.id ? "text-emerald-100" : "text-slate-400"}`}>{p.per}</span>
                  </button>
                ))}
              </div>
              <p className="rounded border border-emerald-200 bg-white px-2 py-1.5 font-mono text-[9.5px] leading-relaxed text-[#047857]">
                {PLATFORMS.find((p) => p.id === platformId)?.src}
              </p>
              <p className="text-[11px] leading-snug text-slate-500">
                Click through all three. The savings number barely moves — that&rsquo;s the point. Per-request runtime is rounding error against the agent; the real cost of this path is the build + maintenance below.
              </p>
            </div>
          </details>
        </Field>

        <Field label="One-time build" hint="generate + test">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-slate-500">$</span>
            <input type="number" min={0} step={1000} value={bld} onChange={(e) => setBld(numOr(e.target.value, 0))} className={fieldClass} />
          </div>
        </Field>

        <Field label="Maintenance / year" hint="own the asset">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-slate-500">$</span>
            <input type="number" min={0} step={500} value={mnt} onChange={(e) => setMnt(numOr(e.target.value, 0))} className={fieldClass} />
          </div>
        </Field>

        <div className="mb-1">
          <span className="mb-1.5 block text-xs font-medium text-ink">Horizon</span>
          <div className="flex overflow-hidden rounded border border-slate-300">
            {[1, 3, 5].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYears(y)}
                className={`flex-1 border-r border-slate-300 py-1.5 font-mono text-xs last:border-r-0 ${
                  years === y ? "bg-navy text-white" : "bg-white text-slate-500"
                }`}
              >
                {y} yr
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RESULTS */}
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label={`Agent tax · ${yl}`} value={money(s.agentTotal)} note="paid every request, forever" color={AGENT} topBorder />
          <Stat label={`Compiled · ${yl}`} value={money(s.compTotal)} note="build + run + maintain" color={COMPILED} topBorder />
          <div className="rounded-xl border border-slate-200 bg-navy p-4 text-mist">
            <div className="font-mono text-[10px] uppercase leading-tight tracking-wide text-gold/80">You keep · over {years} yr</div>
            <div className="mt-1.5 font-serif text-2xl font-extrabold text-gold">
              {s.savings >= 0 ? money(s.savings) : "–" + money(Math.abs(s.savings))}
            </div>
            <div className="mt-1.5 text-[10.5px] text-slate-300">{s.savings >= 0 ? "vs. running it live" : "agent is cheaper here"}</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="min-w-[180px] flex-1">
            <div className="font-mono text-[9.5px] font-semibold uppercase tracking-wide text-[#DC2626]">Live agent meter</div>
            <div className="text-[11.5px] text-red-900/80">
              Tax accruing at your volume since this page loaded — {rps.toFixed(rps < 1 ? 2 : 1)} req/sec
            </div>
          </div>
          <div className="font-mono text-2xl font-bold tabular-nums text-[#DC2626]">
            {accrued < 100 ? moneyExact(accrued) : money(accrued)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-1.5">
            <div className="font-serif text-sm font-bold text-navy">Cumulative cost</div>
            <div className="rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-ink">
              break-even: <b className="text-[#DC2626]">{beTxt}</b>
            </div>
          </div>
          <svg viewBox="0 0 560 230" role="img" aria-label="Cumulative cost over the chosen horizon for agent runtime versus compiled code." className="block h-auto w-full" dangerouslySetInnerHTML={{ __html: chart }} />
        </div>

        <p className="rounded-r border-l-4 border-[#047857] bg-slate-50 px-4 py-3 text-[13px] text-slate-700">
          {readout}
        </p>
      </div>
    </div>
  );
}

function numOr(v: string, fallback: number): number {
  const n = parseFloat(v);
  return isNaN(n) ? fallback : n;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-ink">
        <span>{label}</span>
        {hint && <span className="font-mono text-[9.5px] uppercase tracking-wide text-slate-400">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Mini({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 flex-1">
      <span className="mb-1 block font-mono text-[10px] uppercase text-slate-500">{label}</span>
      {children}
    </div>
  );
}

function Stat({ label, value, note, color, topBorder }: { label: string; value: string; note: string; color: string; topBorder?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4" style={topBorder ? { borderTop: `3px solid ${color}` } : undefined}>
      <div className="font-mono text-[9.5px] uppercase leading-tight tracking-wide text-slate-500">{label}</div>
      <div className="mt-1.5 font-serif text-2xl font-extrabold" style={{ color }}>{value}</div>
      <div className="mt-1.5 text-[10.5px] text-slate-500">{note}</div>
    </div>
  );
}

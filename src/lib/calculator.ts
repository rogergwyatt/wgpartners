// Pure math + sourced constants for the Agent Tax Calculator.
// Ported verbatim from the "Compile, Don't Rent" kit. Do NOT change the numbers
// or formulas without re-verifying the sources — the tool's credibility depends
// on every figure being externally verifiable or user-editable.

export const DPM = 30.4375; // average days per month

export type ModelId = "haiku" | "sonnet" | "opus";

// Anthropic per-million token prices (in / out), June 2026.
export const RATES: Record<ModelId, { in: number; out: number }> = {
  haiku: { in: 1, out: 5 },
  sonnet: { in: 3, out: 15 },
  opus: { in: 5, out: 25 },
};

// Compiled runtime cost, $ per million requests, with citations (June 2026).
export interface Platform {
  id: string;
  label: string;
  per: string;
  value: number;
  src: string;
}

export const PLATFORMS: Platform[] = [
  {
    id: "edge",
    label: "Edge",
    per: "~$0.50/M",
    value: 0.5,
    src: "Cloudflare Workers · $5/mo incl. 10M requests, then $0.30/M + $0.02/M CPU-ms, zero egress fees (June 2026).",
  },
  {
    id: "serverless",
    label: "Serverless",
    per: "~$2/M",
    value: 2,
    src: "AWS Lambda · $0.20/M requests + ~$1.67/M compute at 512MB / 200ms, x86 (June 2026).",
  },
  {
    id: "fullstack",
    label: "Full-stack",
    per: "~$5.70/M",
    value: 5.7,
    src: "Lambda + API Gateway + CloudWatch + NAT, all-in ≈ $5.70/M per 2026 cost teardown of a 10M-request API.",
  },
];

export interface ScenarioInputs {
  rpd: number; // requests per day
  agc: number; // agent cost per request ($)
  lat: number; // agent latency per request (seconds)
  cmpPerM: number; // compiled cost per million requests ($)
  bld: number; // one-time build ($)
  mnt: number; // maintenance per year ($)
  years: number; // horizon
}

export interface Scenario {
  bld: number;
  cmpPer: number;
  dailyAgent: number;
  dailyCompRun: number;
  dailyMaint: number;
  months: number;
  monAgent: number;
  monComp: number;
  agentTotal: number;
  compTotal: number;
  savings: number;
  dailyDelta: number;
  beDays: number; // break-even in days, or Infinity
}

export function computeScenario(i: ScenarioInputs): Scenario {
  const cmpPer = i.cmpPerM / 1e6;
  const dailyAgent = i.rpd * i.agc;
  const dailyCompRun = i.rpd * cmpPer;
  const dailyMaint = i.mnt / 365;

  const months = i.years * 12;
  const monAgent = dailyAgent * DPM;
  const monComp = dailyCompRun * DPM + i.mnt / 12;

  const agentTotal = monAgent * months;
  const compTotal = i.bld + monComp * months;
  const savings = agentTotal - compTotal;

  const dailyDelta = dailyAgent - dailyCompRun - dailyMaint;
  const beDays = dailyDelta > 0 ? i.bld / dailyDelta : Infinity;

  return {
    bld: i.bld,
    cmpPer,
    dailyAgent,
    dailyCompRun,
    dailyMaint,
    months,
    monAgent,
    monComp,
    agentTotal,
    compTotal,
    savings,
    dailyDelta,
    beDays,
  };
}

export interface TokenInputs {
  model: ModelId;
  inTok: number;
  outTok: number;
  calls: number;
  cachePct: number; // 0-90
}

export function perRequestCost(t: TokenInputs): number {
  const r = RATES[t.model];
  const calls = Math.max(1, t.calls);
  const cache = t.cachePct / 100;
  const effIn = r.in * (1 - 0.9 * cache); // cached input ≈ 10% of input rate
  const perCall = (t.inTok * effIn + t.outTok * r.out) / 1e6;
  return perCall * calls;
}

const fmt0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const fmt2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function money(v: number): string {
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(v >= 1e7 ? 1 : 2) + "M";
  return fmt0.format(v);
}

export function moneyExact(v: number): string {
  return fmt2.format(v);
}

export function perReqLabel(v: number): string {
  return v < 0.01 ? "$" + v.toFixed(4) : "$" + v.toFixed(3);
}

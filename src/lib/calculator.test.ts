import { describe, it, expect } from "vitest";
import {
  computeScenario,
  perRequestCost,
  money,
  RATES,
  PLATFORMS,
} from "./calculator";

const DEFAULTS = {
  rpd: 50000,
  agc: 0.02,
  lat: 1.5,
  cmpPerM: 2,
  bld: 45000,
  mnt: 9000,
  years: 3,
};

describe("computeScenario", () => {
  it("matches the documented default scenario", () => {
    const s = computeScenario(DEFAULTS);
    expect(s.agentTotal).toBeCloseTo(1_095_750, 0);
    expect(s.compTotal).toBeCloseTo(72_109.575, 1);
    expect(s.savings).toBeCloseTo(1_023_640.425, 1);
    expect(s.beDays).toBeCloseTo(46.14, 1);
    expect(s.months).toBe(36);
  });

  it("reports Infinity break-even when the agent is cheaper daily", () => {
    const s = computeScenario({ ...DEFAULTS, agc: 0 });
    expect(s.beDays).toBe(Infinity);
    expect(s.savings).toBeLessThan(0);
  });

  it("scales agent total with request volume", () => {
    const a = computeScenario(DEFAULTS);
    const b = computeScenario({ ...DEFAULTS, rpd: 100000 });
    expect(b.agentTotal).toBeCloseTo(a.agentTotal * 2, 0);
  });
});

describe("perRequestCost", () => {
  it("computes the default sonnet token build ($0.033/request)", () => {
    const v = perRequestCost({ model: "sonnet", inTok: 6000, outTok: 1000, calls: 1, cachePct: 0 });
    expect(v).toBeCloseTo(0.033, 6);
  });

  it("caching reduces input cost only", () => {
    const base = perRequestCost({ model: "sonnet", inTok: 6000, outTok: 1000, calls: 1, cachePct: 0 });
    const cached = perRequestCost({ model: "sonnet", inTok: 6000, outTok: 1000, calls: 1, cachePct: 90 });
    expect(cached).toBeLessThan(base);
  });

  it("multiplies by calls per task", () => {
    const one = perRequestCost({ model: "opus", inTok: 6000, outTok: 1000, calls: 1, cachePct: 0 });
    const three = perRequestCost({ model: "opus", inTok: 6000, outTok: 1000, calls: 3, cachePct: 0 });
    expect(three).toBeCloseTo(one * 3, 8);
  });
});

describe("constants & formatting", () => {
  it("keeps the sourced rates and platforms", () => {
    expect(RATES.sonnet).toEqual({ in: 3, out: 15 });
    expect(PLATFORMS.map((p) => p.value)).toEqual([0.5, 2, 5.7]);
  });

  it("formats money like the original", () => {
    expect(money(1_095_750)).toBe("$1.10M");
    expect(money(72_109.575)).toBe("$72,110");
  });
});

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

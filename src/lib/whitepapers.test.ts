import { describe, it, expect } from "vitest";
import { getAllWhitepapers, getWhitepaper, whitepaperSlugs } from "./whitepapers";

describe("whitepapers registry (markdown)", () => {
  it("loads the markdown articles sorted newest date first", () => {
    const all = getAllWhitepapers();
    const slugs = all.map((w) => w.slug);
    // the migrated articles are present (others may be added as drop-in .md files)
    for (const s of ["saas-hostage-trap", "code-is-disposable", "the-42-problem"]) {
      expect(slugs).toContain(s);
    }
    // sorted strictly descending by date
    const dates = all.map((w) => w.date);
    expect([...dates].sort((a, b) => (a < b ? 1 : -1))).toEqual(dates);
  });

  it("parses frontmatter (title, dek, date) for each article", () => {
    const w = getWhitepaper("the-42-problem");
    expect(w?.title).toContain("42");
    expect(w?.dek).toBeTruthy();
    expect(w?.date).toBe("2026-06-14");
  });

  it("renders the markdown body to HTML", () => {
    const w = getWhitepaper("saas-hostage-trap");
    // headings become <h2>, prose becomes <p>
    expect(w?.contentHtml).toContain("<h2");
    expect(w?.contentHtml).toContain("Corporate Sovereign Infrastructure");
    expect(w?.contentHtml).toContain("<p>");
  });

  it("returns undefined for an unknown slug", () => {
    expect(getWhitepaper("nope")).toBeUndefined();
  });

  it("exposes slugs for static params", () => {
    expect(whitepaperSlugs()).toContain("code-is-disposable");
  });
});

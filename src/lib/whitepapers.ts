import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import type { Whitepaper } from "@/content/whitepapers/types";

const CONTENT_DIR = path.join(process.cwd(), "src/content/whitepapers");

// Normalize a frontmatter date (js-yaml may parse an unquoted ISO date into a
// Date object) into a yyyy-mm-dd string.
function toISODate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "");
}

function loadWhitepapers(): Whitepaper[] {
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".md"));

  const articles = files.map((file) => {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data, content } = matter(raw);
    return {
      slug: file.replace(/\.md$/, ""),
      title: String(data.title ?? ""),
      dek: String(data.dek ?? ""),
      date: toISODate(data.date),
      contentHtml: marked.parse(content) as string,
    } satisfies Whitepaper;
  });

  // Newest first.
  return articles.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

// Read and parse once at module load (build time for the static pages).
const articles = loadWhitepapers();

export function getAllWhitepapers(): Whitepaper[] {
  return articles;
}

export function getWhitepaper(slug: string): Whitepaper | undefined {
  return articles.find((a) => a.slug === slug);
}

export function whitepaperSlugs(): string[] {
  return articles.map((a) => a.slug);
}

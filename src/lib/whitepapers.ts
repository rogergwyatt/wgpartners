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

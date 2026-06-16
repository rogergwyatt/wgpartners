import type { MetadataRoute } from "next";
import { whitepaperSlugs } from "@/lib/whitepapers";

const BASE = "https://www.wgaipartners.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now },
    { url: `${BASE}/whitepapers`, lastModified: now },
    ...whitepaperSlugs().map((slug) => ({
      url: `${BASE}/whitepapers/${slug}`,
      lastModified: now,
    })),
  ];
}

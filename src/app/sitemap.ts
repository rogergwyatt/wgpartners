import { MetadataRoute } from 'next';

const BASE = 'https://www.wgpartners.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE}/whitepapers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ];
}

import { MetadataRoute } from 'next'

const BASE = 'https://www.rogerandsally.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Utility / private routes — no SEO value, keep them out of the index.
        disallow: ['/admin', '/cart', '/checkout', '/order', '/api'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  }
}

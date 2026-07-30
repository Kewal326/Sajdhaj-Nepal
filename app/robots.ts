import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sajdhajnepal.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/cart', '/checkout', '/order-success'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

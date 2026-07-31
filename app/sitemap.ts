import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sajdhajnepal.com'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/category`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ]

  // Only fetch from DB if Supabase env vars are present (skips gracefully at build time)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) return base

  try {
    const { createClient } = await import('@supabase/supabase-js')
    const db = createClient(supabaseUrl, supabaseKey)

    const [{ data: categories }, { data: products }] = await Promise.all([
      db.from('categories').select('slug, updated_at'),
      db.from('products').select('id, updated_at').eq('is_active', true),
    ])

    const categoryUrls: MetadataRoute.Sitemap = ((categories ?? []) as { slug: string; updated_at: string }[]).map(c => ({
      url: `${SITE_URL}/category/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    const productUrls: MetadataRoute.Sitemap = ((products ?? []) as { id: string; updated_at: string }[]).map(p => ({
      url: `${SITE_URL}/product/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    return [...base, ...categoryUrls, ...productUrls]
  } catch {
    return base
  }
}

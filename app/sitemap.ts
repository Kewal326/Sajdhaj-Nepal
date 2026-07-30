import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sajdhajnepal.com'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from('categories').select('slug, updated_at'),
    supabase.from('products').select('id, updated_at').eq('is_active', true),
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

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/category`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    ...categoryUrls,
    ...productUrls,
  ]
}

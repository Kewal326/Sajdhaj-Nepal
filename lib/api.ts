import type { Category, Product } from '@/types/database'

// Routes through our own Next.js server, which handles Supabase auth and SSL.
async function get<T>(supabasePath: string): Promise<T[]> {
  const res = await fetch(`/api/data?path=${encodeURIComponent(supabasePath)}`)
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return res.json()
}

export async function getCategories() {
  return get<Category>('categories?select=*&order=sort_order')
}

export async function getFeaturedProducts() {
  return get<Product>(
    'products?select=*,product_images(*)&is_featured=eq.true&is_active=eq.true&limit=6'
  )
}

export async function getProductsByCategory(categoryId: string) {
  return get<Product>(
    `products?select=*,product_images(*)&category_id=eq.${categoryId}&is_active=eq.true&order=created_at.desc`
  )
}

export async function getProduct(id: string) {
  const rows = await get<Product>(`products?select=*,product_images(*)&id=eq.${id}`)
  return rows[0] ?? null
}

export async function getCategoryBySlug(slug: string) {
  const rows = await get<Category>(`categories?select=*&slug=eq.${slug}`)
  return rows[0] ?? null
}

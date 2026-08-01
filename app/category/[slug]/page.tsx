import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import CartHeaderButton from '@/components/CartHeaderButton'
import BackButton from '@/components/BackButton'
import type { Product } from '@/types/database'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data: rawCategory } = await supabase.from('categories').select('name, description').eq('slug', slug).single()
  const category = rawCategory as { name: string; description: string } | null
  const name = category?.name ?? slug.replace(/-/g, ' ')
  return {
    title: `${name} — Buy Online in Nepal`,
    description: `Shop ${name} online in Nepal. Best prices, cash on delivery. Sajdhaj Nepal.`,
    openGraph: {
      title: `${name} — Sajdhaj Nepal`,
      description: `Browse our ${name} collection. Delivered across Nepal.`,
    },
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: rawCat } = await supabase.from('categories').select('*').eq('slug', slug).single()
  const category = rawCat as { id: string; name: string; icon: string } | null
  const { data: products } = category
    ? await supabase.from('products').select('*, product_images(*)').eq('category_id', category.id).eq('is_active', true).order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div>
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-base font-semibold text-gray-900">
            {category ? `${category.icon} ${category.name}` : slug}
          </h1>
        </div>
        <CartHeaderButton />
      </header>

      <div className="p-4">
        {(products ?? []).length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No products in this category yet.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {(products as Product[]).map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  )
}

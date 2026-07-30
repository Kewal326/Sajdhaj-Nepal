import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import { WhatsAppButtonIcon } from '@/components/WhatsAppButton'
import type { Product } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: category } = await supabase.from('categories').select('*').eq('slug', slug).single()
  const { data: products } = category
    ? await supabase.from('products').select('*, product_images(*)').eq('category_id', category.id).eq('is_active', true).order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div>
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/category" className="text-gray-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-semibold text-gray-900">
            {category ? `${category.icon} ${category.name}` : slug}
          </h1>
        </div>
        <WhatsAppButtonIcon />
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

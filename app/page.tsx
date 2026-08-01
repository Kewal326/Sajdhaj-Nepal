import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import CartHeaderButton from '@/components/CartHeaderButton'
import HeroCarousel from '@/components/HeroCarousel'
import type { Category, Product } from '@/types/database'

export const dynamic = 'force-dynamic'

async function getData() {
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('products').select('*, product_images(*)').eq('is_featured', true).eq('is_active', true).order('created_at', { ascending: false }).limit(6),
  ])
  return { categories: categories ?? [], products: products ?? [] }
}

export default async function HomePage() {
  const { categories, products } = await getData()

  return (
    <div>
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex flex-col leading-none">
          <span className="text-lg font-semibold text-brand-700">सजधज</span>
          <span className="text-[11px] font-medium text-brand-400 tracking-wide">Nepal</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/search" className="w-9 h-9 flex items-center justify-center text-gray-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </Link>
          <CartHeaderButton />
        </div>
      </header>

      <HeroCarousel />

      <div className="mt-5 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Categories</h2>
          <Link href="/category" className="text-xs text-brand-600">See all</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          {(categories as Category[]).map(cat => (
            <Link key={cat.id} href={`/category/${cat.slug}`} className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-full bg-brand-50 overflow-hidden flex items-center justify-center text-2xl border-2 border-transparent relative">
                {cat.image_url
                  ? <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                  : cat.icon}
              </div>
              <span className="text-[11px] text-gray-600 text-center w-14 leading-tight">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-5 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Featured</h2>
          <Link href="/category" className="text-xs text-brand-600">See all</Link>
        </div>
        {(products as Product[]).length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">No featured products yet.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {(products as Product[]).map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>

      <div className="mx-4 mt-5 mb-4 rounded-2xl bg-gradient-to-r from-brand-900 to-brand-700 p-4 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-brand-100">Teej sale — up to 40% off</p>
          <p className="text-xs text-brand-200 mt-0.5">Code <strong className="text-white">TEEJ2025</strong> · Ends Aug 15</p>
        </div>
        <div className="bg-gold-400 text-gold-800 text-center rounded-xl px-3 py-2 flex-shrink-0">
          <p className="text-[10px] font-medium">UP TO</p>
          <p className="text-2xl font-bold leading-none">40%</p>
          <p className="text-[10px] font-medium">OFF</p>
        </div>
      </div>
    </div>
  )
}

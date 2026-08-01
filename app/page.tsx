import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import CartHeaderButton from '@/components/CartHeaderButton'
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
        <span className="text-lg font-semibold text-brand-700">
          सजधज <span className="text-brand-400">Nepal</span>
        </span>
        <CartHeaderButton />
      </header>

      <div className="mx-4 mt-4 rounded-2xl bg-gradient-to-br from-brand-900 to-brand-700 p-5 flex justify-between items-end overflow-hidden min-h-36">
        <div>
          <span className="inline-block text-[11px] text-brand-100 border border-brand-600 rounded-full px-3 py-0.5 mb-2">
            ✦ Teej collection 2025
          </span>
          <h1 className="text-xl font-semibold text-white leading-tight mb-3">
            Celebrate in<br />style
          </h1>
          <Link href="/category" className="inline-flex items-center gap-1 bg-gold-400 text-gold-800 text-xs font-semibold px-4 py-2 rounded-full">
            Shop now →
          </Link>
        </div>
        <span className="text-6xl mb-1 select-none">🥻</span>
      </div>

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

'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import CartHeaderButton from '@/components/CartHeaderButton'
import type { Category, Product } from '@/types/database'

function CategoriesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      const cats = (data ?? []) as Category[]
      setCategories(cats)
      if (!cats.length) return
      const slug = searchParams.get('cat')
      const initial = (slug ? cats.find(c => c.slug === slug) : null) ?? cats[0]
      loadProducts(initial, cats)
    })
  }, [])

  async function loadProducts(cat: Category, allCats?: Category[]) {
    setSelected(cat)
    router.replace(`/category?cat=${cat.slug}`)
    setLoading(true)
    const { data } = await supabase
      .from('products')
      .select('*, product_images(*)')
      .eq('category_id', cat.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    setProducts((data as Product[]) ?? [])
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="flex-none flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100 z-10">
        <h1 className="text-sm font-semibold text-gray-900">{selected?.name ?? 'Categories'}</h1>
        <CartHeaderButton />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — 15%, icon + name */}
        <div className="w-[15%] flex-none bg-gray-50 border-r border-gray-100 overflow-y-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => loadProducts(cat)}
              className={`w-full flex flex-col items-center justify-center gap-1 py-3 border-l-2 transition-colors ${
                selected?.id === cat.id
                  ? 'border-brand-700 bg-white'
                  : 'border-transparent'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-brand-50 overflow-hidden flex items-center justify-center text-lg relative flex-shrink-0">
                {cat.image_url
                  ? <Image src={cat.image_url} alt={cat.name} fill className="object-cover" sizes="36px" />
                  : cat.icon}
              </div>
              <span className={`text-[10px] leading-tight text-center px-1 ${selected?.id === cat.id ? 'text-brand-700 font-semibold' : 'text-gray-500'}`}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        {/* Right — products */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center pt-12">
              <div className="w-5 h-5 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No products yet.</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 p-2 pb-20">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense>
      <CategoriesContent />
    </Suspense>
  )
}

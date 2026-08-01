'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import ProductCard from '@/components/ProductCard'
import type { Product, Category } from '@/types/database'

// Trigram similarity — handles typos like "saare" → "Saree"
function trigrams(s: string): Set<string> {
  const p = `  ${s.toLowerCase()} `
  const t = new Set<string>()
  for (let i = 0; i < p.length - 2; i++) t.add(p.slice(i, i + 3))
  return t
}
function similar(a: string, b: string, threshold = 0.25): boolean {
  const ta = trigrams(a), tb = trigrams(b)
  let shared = 0
  ta.forEach(t => { if (tb.has(t)) shared++ })
  return (2 * shared) / (ta.size + tb.size) >= threshold
}

export default function SearchPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Load all categories once — only ~10 rows
  useEffect(() => {
    supabase.from('categories').select('*').order('sort_order')
      .then(({ data }) => setAllCategories((data as Category[]) ?? []))
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const q = query.trim()
    if (!q) { setProducts([]); setCategories([]); setSearched(false); return }

    // Category fuzzy match client-side (handles typos)
    setCategories(allCategories.filter(c => similar(c.name, q)))

    const id = setTimeout(async () => {
      setLoading(true)

      // FTS for products, fallback to ilike if no results
      let { data: prods } = await supabase
        .from('products')
        .select('*, product_images(*)')
        .eq('is_active', true)
        .textSearch('fts', q, { type: 'websearch', config: 'english' })
        .order('created_at', { ascending: false })
        .limit(40)

      if (!prods?.length) {
        const { data: fallback } = await supabase
          .from('products')
          .select('*, product_images(*)')
          .eq('is_active', true)
          .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
          .order('created_at', { ascending: false })
          .limit(40)
        prods = fallback
      }

      setProducts((prods as Product[]) ?? [])
      setSearched(true)
      setLoading(false)
    }, 300)

    return () => clearTimeout(id)
  }, [query, allCategories])

  const hasResults = categories.length > 0 || products.length > 0

  return (
    <div className="flex flex-col min-h-screen">
      {/* Search header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-3 py-2.5 flex items-center gap-2">
        <button onClick={() => router.back()} className="p-1 text-gray-500 flex-shrink-0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 flex items-center bg-gray-100 rounded-xl px-3 py-2 gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-400 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search sarees, jewelry, sets…"
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 px-4 py-4">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center pt-12">
            <div className="w-6 h-6 border-2 border-brand-700 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* No results */}
        {!loading && searched && !hasResults && (
          <div className="flex flex-col items-center pt-16 gap-3 text-center">
            <span className="text-4xl">🔍</span>
            <p className="text-sm font-medium text-gray-700">No results for "{query}"</p>
            <p className="text-xs text-gray-400">Try a different keyword</p>
          </div>
        )}

        {/* Results */}
        {!loading && hasResults && (
          <>
            {/* Category icons — same style as home page */}
            {categories.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Categories</p>
                <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                  {categories.map(cat => (
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
            )}

            {/* Product results */}
            {products.length > 0 && (
              <>
                <p className="text-xs text-gray-400 mb-3">
                  {products.length} product{products.length !== 1 ? 's' : ''} for "{query}"
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </>
            )}
          </>
        )}

        {/* Empty state */}
        {!searched && !loading && (
          <div className="flex flex-col items-center pt-16 gap-3 text-center">
            <span className="text-4xl">✨</span>
            <p className="text-sm text-gray-400">Search for sarees, jewelry, sets and more</p>
          </div>
        )}
      </div>
    </div>
  )
}

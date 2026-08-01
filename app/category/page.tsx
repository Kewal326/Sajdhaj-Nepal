import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import CartHeaderButton from '@/components/CartHeaderButton'
import BackButton from '@/components/BackButton'
import type { Category } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order')

  return (
    <div>
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-base font-semibold text-gray-900">All categories</h1>
        </div>
        <CartHeaderButton />
      </header>

      <div className="grid grid-cols-3 gap-3 p-4">
        {(categories ?? []).map((cat: Category) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-2 bg-white rounded-2xl border border-gray-100 p-4 active:bg-brand-50"
          >
            <div className="w-14 h-14 rounded-full bg-brand-50 overflow-hidden flex items-center justify-center text-3xl relative">
              {cat.image_url
                ? <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                : cat.icon}
            </div>
            <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

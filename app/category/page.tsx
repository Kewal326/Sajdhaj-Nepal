import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import CartHeaderButton from '@/components/CartHeaderButton'
import BackButton from '@/components/BackButton'
import type { Category } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order')
  const cats = (categories ?? []) as Category[]
  const [hero, ...rest] = cats

  return (
    <div className="pb-6">
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-base font-semibold text-gray-900">Shop by category</h1>
        </div>
        <CartHeaderButton />
      </header>

      <div className="px-4 pt-4 flex flex-col gap-3">
        {/* Hero card — first category, full width */}
        {hero && (
          <CategoryCard cat={hero} height="h-44" textSize="text-xl" />
        )}

        {/* 2-column grid for the rest */}
        <div className="grid grid-cols-2 gap-3">
          {rest.map(cat => (
            <CategoryCard key={cat.id} cat={cat} height="h-36" textSize="text-base" />
          ))}
        </div>
      </div>
    </div>
  )
}

function CategoryCard({ cat, height, textSize }: { cat: Category; height: string; textSize: string }) {
  return (
    <Link
      href={`/category/${cat.slug}`}
      className={`relative rounded-2xl overflow-hidden block ${height} active:opacity-90`}
    >
      {cat.image_url ? (
        <>
          <Image src={cat.image_url} alt={cat.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 400px" />
          {/* Dark overlay only for image cards — ensures text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-brand-300 to-brand-600 flex items-center justify-center text-5xl">
            {cat.icon}
          </div>
          {/* Subtle bottom fade for text legibility on gradient */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
        </>
      )}
      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <p className={`${textSize} font-bold text-white leading-tight drop-shadow`}>{cat.name}</p>
      </div>
    </Link>
  )
}

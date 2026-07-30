import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import AddToCartButton from '@/components/AddToCartButton'
import { WhatsAppButtonIcon } from '@/components/WhatsAppButton'
import type { Product } from '@/types/database'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: product } = await supabase.from('products').select('*, product_images(*)').eq('id', id).single()

  if (!product) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Product not found.</div>
  }

  const p = product as Product
  const images = p.product_images ?? []
  const primaryImage = images.find(i => i.is_primary) ?? images[0]
  const discount = p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : null

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/" className="text-gray-500 flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-medium text-gray-900 truncate">{p.name}</span>
        </div>
        <WhatsAppButtonIcon />
      </div>

      <div className="relative h-72 bg-brand-50">
        {primaryImage ? (
          <Image src={primaryImage.url} alt={p.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-8xl">💍</div>
        )}
        {p.badge && (
          <span className="absolute top-3 left-3 bg-brand-700 text-white text-xs font-medium px-2.5 py-1 rounded">{p.badge}</span>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 px-4 mt-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {images.map(img => (
            <div key={img.id} className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-100 relative">
              <Image src={img.url} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="px-4 pt-4">
        <h1 className="text-lg font-semibold text-gray-900 leading-snug">{p.name}</h1>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-bold text-brand-700">NPR {p.price.toLocaleString()}</span>
          {p.original_price && (
            <>
              <span className="text-sm text-gray-400 line-through">{p.original_price.toLocaleString()}</span>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{discount}% off</span>
            </>
          )}
        </div>
        {p.stock > 0
          ? <p className="text-xs text-green-600 mt-1">{p.stock} in stock</p>
          : <p className="text-xs text-red-500 mt-1">Out of stock</p>}
        {p.description && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{p.description}</p>}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="text-xs text-gray-400">Pay via</span>
          {['eSewa', 'Khalti', 'IME Pay', 'COD'].map(m => (
            <span key={m} className="text-[11px] bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-gray-600">{m}</span>
          ))}
        </div>
      </div>

      <div className="px-4 mt-6 pb-4">
        <AddToCartButton product={p} />
      </div>
    </div>
  )
}

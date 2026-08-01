'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/components/CartProvider'
import type { Product } from '@/types/database'

export default function ProductStickyBar({ product }: { product: Product }) {
  const { items, add, updateQty } = useCart()
  const router = useRouter()
  const item = items.find(i => i.product.id === product.id)
  const qty = item?.quantity ?? 0

  if (product.stock === 0) return null

  function buyNow() {
    if (qty === 0) add(product)
    router.push('/cart')
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 px-4 py-3 flex items-center gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
      <p className="text-base font-bold text-brand-700 flex-shrink-0">NPR {product.price.toLocaleString()}</p>

      <div className="flex-1" />

      {qty === 0 ? (
        <>
          <button
            onClick={() => add(product)}
            className="border border-brand-700 text-brand-700 text-sm font-semibold px-5 py-2.5 rounded-2xl active:opacity-70"
          >
            Add to cart
          </button>
          <button
            onClick={buyNow}
            className="bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl active:opacity-80"
          >
            Buy now
          </button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1 border border-brand-700 rounded-2xl px-2 py-1">
            <button onClick={() => updateQty(product.id, qty - 1)}
              className="w-7 h-7 flex items-center justify-center text-brand-700 font-bold text-xl">−</button>
            <span className="text-brand-700 font-semibold w-5 text-center text-sm">{qty}</span>
            <button onClick={() => updateQty(product.id, qty + 1)}
              className="w-7 h-7 flex items-center justify-center text-brand-700 font-bold text-xl">+</button>
          </div>
          <button
            onClick={() => router.push('/cart')}
            className="bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-2xl active:opacity-80"
          >
            Go to cart
          </button>
        </>
      )}
    </div>
  )
}

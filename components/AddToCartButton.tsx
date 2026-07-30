'use client'

import { useCart } from './CartProvider'
import type { Product } from '@/types/database'

export default function AddToCartButton({ product }: { product: Product }) {
  const { add, updateQty, items } = useCart()
  const inCart = items.find(i => i.product.id === product.id)

  if (product.stock === 0) {
    return (
      <button disabled className="w-full py-3.5 rounded-2xl text-sm font-semibold bg-gray-200 text-gray-400">
        Out of stock
      </button>
    )
  }

  if (inCart) {
    return (
      <div className="flex items-center rounded-2xl overflow-hidden border-2 border-brand-700 h-12">
        <button
          onClick={() => updateQty(product.id, inCart.quantity - 1)}
          className="flex-1 h-full text-brand-700 text-xl font-medium active:bg-brand-50 transition-colors"
        >
          −
        </button>
        <span className="w-12 text-center text-base font-semibold text-brand-700">
          {inCart.quantity}
        </span>
        <button
          onClick={() => updateQty(product.id, inCart.quantity + 1)}
          className="flex-1 h-full text-brand-700 text-xl font-medium active:bg-brand-50 transition-colors"
        >
          +
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => add(product)}
      className="w-full py-3.5 rounded-2xl text-sm font-semibold bg-brand-700 text-white active:scale-95 transition-transform"
    >
      Add to cart
    </button>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/components/CartProvider'
import { WhatsAppButtonIcon } from '@/components/WhatsAppButton'

export default function CartPage() {
  const { items, remove, updateQty, total } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70dvh] gap-4 px-8 text-center">
        <span className="text-6xl">🛍️</span>
        <h2 className="text-base font-semibold text-gray-900">Your cart is empty</h2>
        <p className="text-sm text-gray-400">Add some products to get started</p>
        <Link
          href="/"
          className="mt-2 bg-brand-700 text-white text-sm font-medium px-6 py-3 rounded-2xl"
        >
          Browse products
        </Link>
      </div>
    )
  }

  return (
    <div>
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <h1 className="text-base font-semibold text-gray-900">Cart ({items.length})</h1>
        <WhatsAppButtonIcon />
      </header>

      <div className="p-4 space-y-3">
        {items.map(({ product, quantity }) => {
          const primaryImage = product.product_images?.find(i => i.is_primary) ?? product.product_images?.[0]
          return (
            <div key={product.id} className="flex gap-3 bg-white rounded-2xl border border-gray-100 p-3">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-brand-50 flex-shrink-0 relative">
                {primaryImage ? (
                  <Image src={primaryImage.url} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">💍</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight">{product.name}</p>
                <p className="text-sm font-bold text-brand-700 mt-1">NPR {product.price.toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-100">
                    <button
                      onClick={() => updateQty(product.id, quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-600 font-medium"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQty(product.id, quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-600 font-medium"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => remove(product.id)}
                    className="text-xs text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mx-4 bg-gray-50 rounded-2xl p-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>NPR {total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Delivery</span>
          <span className={total >= 2000 ? 'text-green-600' : ''}>
            {total >= 2000 ? 'Free' : 'NPR 100'}
          </span>
        </div>
        <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-semibold text-gray-900">
          <span>Total</span>
          <span>NPR {(total + (total >= 2000 ? 0 : 100)).toLocaleString()}</span>
        </div>
      </div>

      <div className="px-4 mt-4 pb-4">
        <Link
          href="/checkout"
          className="block w-full bg-brand-700 text-white text-sm font-semibold text-center py-4 rounded-2xl"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from './CartProvider'
import type { Product } from '@/types/database'

export default function ProductCard({ product }: { product: Product }) {
  const { add, updateQty, items } = useCart()
  const inCart = items.find(i => i.product.id === product.id)
  const primaryImage = product.product_images?.find(i => i.is_primary) ?? product.product_images?.[0]
  const discount = product.original_price
    ? Math.round((1 - product.price / product.original_price) * 100)
    : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative h-40 bg-brand-50">
          {primaryImage ? (
            <Image src={primaryImage.url} alt={product.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">💍</div>
          )}
          {product.badge && (
            <span className="absolute top-2 left-2 bg-brand-700 text-white text-[10px] font-medium px-2 py-0.5 rounded">
              {product.badge}
            </span>
          )}
          {discount && !product.badge && (
            <span className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-medium px-2 py-0.5 rounded">
              -{discount}%
            </span>
          )}
        </div>
        <div className="p-2.5 pb-1">
          <p className="text-sm font-medium text-gray-900 leading-tight truncate">{product.name}</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-semibold text-brand-700">
              NPR {product.price.toLocaleString()}
            </span>
            {product.original_price && (
              <span className="text-xs text-gray-400 line-through">
                {product.original_price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="px-2.5 pb-2.5">
        {inCart ? (
          <div className="flex items-center rounded-xl overflow-hidden border-2 border-brand-700 h-8">
            <button
              onClick={() => updateQty(product.id, inCart.quantity - 1)}
              className="flex-1 h-full text-brand-700 text-base font-medium active:bg-brand-50 transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center text-xs font-semibold text-brand-700">
              {inCart.quantity}
            </span>
            <button
              onClick={() => updateQty(product.id, inCart.quantity + 1)}
              className="flex-1 h-full text-brand-700 text-base font-medium active:bg-brand-50 transition-colors"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={() => add(product)}
            className="w-full bg-brand-700 text-white text-xs font-medium py-2 rounded-xl active:scale-95 transition-transform"
          >
            Add to cart
          </button>
        )}
      </div>
    </div>
  )
}

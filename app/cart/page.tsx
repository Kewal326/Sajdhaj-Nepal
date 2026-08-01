'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/components/CartProvider'
import CartHeaderButton from '@/components/CartHeaderButton'
import BackButton from '@/components/BackButton'
import { supabase } from '@/lib/supabase'

export default function CartPage() {
  const { items, remove, updateQty, total, clear } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const deliveryFee = total >= 2000 ? 0 : 100
  const grandTotal = total + deliveryFee

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!phone.trim()) { setError('Phone number is required.'); return }
    setError('')
    setLoading(true)

    try {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          customer_name: name.trim() || 'Guest',
          customer_phone: phone.trim(),
          district: '',
          city: '',
          address: '',
          payment_method: 'cod',
          total_amount: grandTotal,
        } as any)
        .select('id')
        .single()

      if (orderErr) throw new Error(orderErr.message)
      if (!order) throw new Error('No order returned')

      const { error: itemsErr } = await supabase.from('order_items').insert(
        items.map(i => ({
          order_id: (order as any).id,
          product_id: i.product.id,
          product_name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
        })) as any
      )
      if (itemsErr) throw new Error(itemsErr.message)

      let notified = true
      try {
        const res = await fetch('/api/notify-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: (order as any).id,
            customerName: name.trim() || 'Guest',
            customerPhone: phone.trim(),
            items: items.map(i => ({
              product_name: i.product.name,
              quantity: i.quantity,
              price: i.product.price,
            })),
            total: grandTotal,
          }),
        })
        if (!res.ok) notified = false
      } catch {
        notified = false
      }

      clear()
      router.push(`/order-success?id=${(order as any).id}&notified=${notified}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0 && !loading) {
    return (
      <div>
        <header className="flex items-center px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
          <BackButton />
        </header>
      <div className="flex flex-col items-center justify-center h-[70dvh] gap-4 px-8 text-center">
        <span className="text-6xl">🛍️</span>
        <h2 className="text-base font-semibold text-gray-900">Your cart is empty</h2>
        <p className="text-sm text-gray-400">Add some products to get started</p>
        <Link href="/" className="mt-2 bg-brand-700 text-white text-sm font-medium px-6 py-3 rounded-2xl">
          Browse products
        </Link>
      </div>
      </div>
    )
  }

  return (
    <div>
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-base font-semibold text-gray-900">Cart ({items.length})</h1>
        </div>
        <CartHeaderButton />
      </header>

      <form onSubmit={handlePlaceOrder} className="p-4 space-y-4">
        {/* Items */}
        <div className="space-y-3">
          {items.map(({ product, quantity }) => {
            const primaryImage = product.product_images?.find(i => i.is_primary) ?? product.product_images?.[0]
            return (
              <div key={product.id} className="flex gap-3 bg-white rounded-2xl border border-gray-100 p-3">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-brand-50 flex-shrink-0 relative">
                  {primaryImage
                    ? <Image src={primaryImage.url} alt={product.name} fill className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">💍</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate leading-tight">{product.name}</p>
                  <p className="text-sm font-bold text-brand-700 mt-1">NPR {product.price.toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-100">
                      <button type="button" onClick={() => updateQty(product.id, quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 font-medium">−</button>
                      <span className="text-sm font-medium w-4 text-center">{quantity}</span>
                      <button type="button" onClick={() => updateQty(product.id, quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 font-medium">+</button>
                    </div>
                    <button type="button" onClick={() => remove(product.id)} className="text-xs text-red-400">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span><span>NPR {total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery</span>
            <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
              {deliveryFee === 0 ? 'Free' : 'NPR 100'}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-semibold text-gray-900">
            <span>Total</span><span>NPR {grandTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Your details</h2>
          <input
            placeholder="Your name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          />
          <input
            type="tel"
            placeholder="Phone number *"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          />
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-700 text-white text-sm font-semibold py-4 rounded-2xl disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">COD</span>
          {loading ? 'Placing order…' : `Place order — NPR ${grandTotal.toLocaleString()}`}
        </button>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCart } from '@/components/CartProvider'
import { supabase } from '@/lib/supabase'

export default function CheckoutPage() {
  const { items, total, clear } = useCart()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const deliveryFee = total >= 2000 ? 0 : 100
  const grandTotal = total + deliveryFee

  async function handleSubmit(e: React.FormEvent) {
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

      if (orderErr || !order) throw orderErr

      const { error: itemsErr } = await supabase.from('order_items').insert(
        items.map(i => ({
          order_id: (order as any).id,
          product_id: i.product.id,
          product_name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
        })) as any
      )
      if (itemsErr) throw itemsErr

      clear()
      router.push(`/order-success?id=${(order as any).id}`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70dvh] gap-4 text-center px-8">
        <span className="text-6xl">🛍️</span>
        <p className="text-sm text-gray-500">Your cart is empty.</p>
        <Link href="/" className="bg-brand-700 text-white text-sm px-6 py-3 rounded-2xl">
          Shop now
        </Link>
      </div>
    )
  }

  return (
    <div>
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/cart" className="text-gray-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-base font-semibold text-gray-900">Checkout</h1>
        </div>
        <span className="flex items-center gap-1 bg-green-50 text-green-700 text-[11px] font-medium px-2.5 py-1 rounded-full border border-green-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Cash on delivery
        </span>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
          <input
            placeholder="Your name (optional)"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          />
          <input
            required
            type="tel"
            placeholder="Phone number *"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          />
        </div>

        {/* Order summary */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span><span>NPR {total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Delivery</span>
            <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
              {deliveryFee === 0 ? 'Free' : `NPR ${deliveryFee}`}
            </span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-900">
            <span>Total</span><span>NPR {grandTotal.toLocaleString()}</span>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-700 text-white text-sm font-semibold py-4 rounded-2xl disabled:opacity-60"
        >
          {loading ? 'Placing order…' : `Place order — NPR ${grandTotal.toLocaleString()}`}
        </button>
      </form>
    </div>
  )
}

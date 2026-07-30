'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { CartItem, Product } from '@/types/database'

type CartContextType = {
  items: CartItem[]
  add: (product: Product) => void
  remove: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  total: number
  count: number
  clear: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('cart')
    if (saved) setItems(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  function add(product: Product) {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  function remove(productId: string) {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) return remove(productId)
    setItems(prev =>
      prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i)
    )
  }

  function clear() {
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, total, count, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useCart } from './CartProvider'

export default function CartHeaderButton() {
  const { count } = useCart()
  const [wiggle, setWiggle] = useState(false)
  const prevCount = useRef(count)

  useEffect(() => {
    if (count > prevCount.current) {
      setWiggle(true)
      const t = setTimeout(() => setWiggle(false), 600)
      return () => clearTimeout(t)
    }
    prevCount.current = count
  }, [count])
  return (
    <Link href="/cart"
      className="relative flex items-center justify-center w-9 h-9 flex-shrink-0"
      aria-label="Go to cart"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={`w-6 h-6 text-gray-700 ${wiggle ? 'cart-wiggle' : ''}`}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
      </svg>
      {count > 0 && (
        <span className="absolute top-0 right-0 w-4 h-4 bg-brand-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  )
}

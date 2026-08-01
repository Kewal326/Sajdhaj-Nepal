'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useCart } from './CartProvider'

const links = [
  { href: '/',         label: 'Home',       icon: 'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9' },
  { href: '/category', label: 'Categories', icon: 'M4 6h16M4 10h16M4 14h10M4 18h6' },
  { href: '/cart',     label: 'Cart',       icon: 'M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0', cart: true },
]

export default function BottomNav() {
  const pathname = usePathname()
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

  if (pathname.startsWith('/product/')) return null

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-16 bg-white border-t border-gray-100 flex z-50">
      {links.map(link => {
        const active = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            className="flex-1 flex flex-col items-center gap-0.5 py-2 relative"
          >
            <span className="relative">
              <svg
                viewBox="0 0 24 24" fill="none" strokeWidth={1.8}
                stroke={active ? '#7F2E5D' : '#9ca3af'}
                className={`w-6 h-6 ${link.cart && wiggle ? 'cart-wiggle' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
              </svg>
              {link.cart && count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-700 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </span>
            <span className={`text-[10px] ${active ? 'text-brand-700 font-medium' : 'text-gray-400'}`}>
              {link.label}
            </span>
          </Link>
        )
      })}

    </nav>
  )
}

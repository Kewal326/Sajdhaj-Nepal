import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/components/CartProvider'
import BottomNav from '@/components/BottomNav'

export const metadata: Metadata = {
  title: 'Sajdhaj Nepal',
  description: 'Sarees, jewelry & accessories — delivered across Nepal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <div className="mobile-container pb-16">
            {children}
          </div>
          <BottomNav />
        </CartProvider>
      </body>
    </html>
  )
}

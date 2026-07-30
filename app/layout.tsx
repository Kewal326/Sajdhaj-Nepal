import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/components/CartProvider'
import BottomNav from '@/components/BottomNav'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sajdhajnepal.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Sajdhaj Nepal — Sarees, Jewelry & Women's Fashion Online",
    template: '%s | Sajdhaj Nepal',
  },
  description: "Shop sarees, artificial jewelry, earrings, necklaces & women's accessories online in Nepal. Cash on delivery. Teej & wedding collections.",
  keywords: ['saree Nepal', 'buy saree online Nepal', 'artificial jewelry Nepal', 'imitation jewelry Nepal', 'women fashion Nepal', 'Teej saree', 'earrings Nepal', 'necklace Nepal', 'women accessories Nepal', 'online shopping Nepal women', 'Banarasi saree Nepal', 'bridal jewelry Nepal'],
  openGraph: {
    type: 'website',
    locale: 'en_NP',
    url: SITE_URL,
    siteName: 'Sajdhaj Nepal',
    title: "Sajdhaj Nepal — Sarees, Jewelry & Women's Fashion",
    description: "Shop sarees, artificial jewelry & women's accessories online in Nepal. Cash on delivery available.",
  },
  twitter: {
    card: 'summary_large_image',
    title: "Sajdhaj Nepal — Sarees, Jewelry & Women's Fashion",
    description: "Shop sarees, artificial jewelry & women's accessories online in Nepal.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
}

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'OnlineStore',
  name: 'Sajdhaj Nepal',
  url: SITE_URL,
  description: "Sarees, artificial jewelry & women's accessories delivered across Nepal",
  areaServed: { '@type': 'Country', name: 'Nepal' },
  currenciesAccepted: 'NPR',
  paymentAccepted: 'Cash on delivery',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
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

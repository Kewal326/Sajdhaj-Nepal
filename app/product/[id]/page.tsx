import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AddToCartButton from '@/components/AddToCartButton'
import { WhatsAppButtonIcon } from '@/components/WhatsAppButton'
import ProductImageGallery from '@/components/ProductImageGallery'
import type { Product } from '@/types/database'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sajdhajnepal.com'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const { data: product } = await supabase.from('products').select('*, product_images(*)').eq('id', id).single()
  if (!product) return { title: 'Product not found' }
  const p = product as Product
  const primaryImage = p.product_images?.find(i => i.is_primary) ?? p.product_images?.[0]
  const description = p.description ?? `Buy ${p.name} online in Nepal. Cash on delivery. Sajdhaj Nepal.`
  return {
    title: `${p.name} — NPR ${p.price.toLocaleString()}`,
    description,
    openGraph: {
      title: p.name,
      description,
      images: primaryImage ? [{ url: primaryImage.url, alt: p.name }] : [],
    },
    alternates: { canonical: `${SITE_URL}/product/${id}` },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: product } = await supabase.from('products').select('*, product_images(*)').eq('id', id).single()

  if (!product) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">Product not found.</div>
  }

  const p = product as Product
  const images = p.product_images ?? []
  const primaryImage = images.find(i => i.is_primary) ?? images[0]
  const discount = p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : null

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    image: primaryImage?.url,
    sku: p.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'NPR',
      price: p.price,
      availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Sajdhaj Nepal' },
      url: `${SITE_URL}/product/${p.id}`,
    },
  }

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/" className="text-gray-500 flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm font-medium text-gray-900 truncate">{p.name}</span>
        </div>
        <WhatsAppButtonIcon />
      </div>

      <ProductImageGallery images={images} name={p.name} badge={p.badge} />

      <div className="px-4 pt-4">
        <h1 className="text-lg font-semibold text-gray-900 leading-snug">{p.name}</h1>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-xl font-bold text-brand-700">NPR {p.price.toLocaleString()}</span>
          {p.original_price && (
            <>
              <span className="text-sm text-gray-400 line-through">{p.original_price.toLocaleString()}</span>
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{discount}% off</span>
            </>
          )}
        </div>
        {p.stock > 0
          ? <p className="text-xs text-green-600 mt-1">{p.stock} in stock</p>
          : <p className="text-xs text-red-500 mt-1">Out of stock</p>}
        {p.description && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{p.description}</p>}
        <div className="flex items-center gap-2 mt-4">
          <span className="text-xs text-gray-400">Payment</span>
          <span className="text-[11px] bg-green-50 border border-green-200 rounded px-2 py-0.5 text-green-700 font-medium">Cash on delivery</span>
        </div>
      </div>

      <div className="px-4 mt-6 pb-4">
        <AddToCartButton product={p} />
      </div>
    </div>
  )
}

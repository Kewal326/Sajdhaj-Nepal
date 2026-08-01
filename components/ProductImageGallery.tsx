'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { ProductImage } from '@/types/database'

export default function ProductImageGallery({ images, name, badge }: {
  images: ProductImage[]
  name: string
  badge: string | null
}) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  if (images.length === 0) {
    return <div className="h-72 bg-brand-50 flex items-center justify-center text-8xl">💍</div>
  }

  return (
    <>
      {/* Main image */}
      <div
        className="relative h-72 bg-brand-50 cursor-zoom-in"
        onClick={() => setLightbox(true)}
      >
        <Image src={images[active].url} alt={name} fill className="object-contain" />
        {badge && (
          <span className="absolute top-3 left-3 bg-brand-700 text-white text-xs font-medium px-2.5 py-1 rounded">{badge}</span>
        )}
        {images.length > 1 && (
          <>
            {active > 0 && (
              <button
                onClick={e => { e.stopPropagation(); setActive(i => i - 1) }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            {active < images.length - 1 && (
              <button
                onClick={e => { e.stopPropagation(); setActive(i => i + 1) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full w-8 h-8 flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setActive(i) }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === active ? 'bg-white' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 mt-2 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <button key={img.id} onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 relative transition-colors ${i === active ? 'border-brand-600' : 'border-gray-100'}`}
            >
              <Image src={img.url} alt="" fill className="object-contain bg-brand-50" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] bg-white flex flex-col pt-16 pb-24"
          onClick={() => setLightbox(false)}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 z-10 text-gray-700 bg-gray-100 rounded-full w-9 h-9 flex items-center justify-center"
            onClick={() => setLightbox(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 z-10 text-gray-600 text-sm bg-gray-100 rounded-full px-3 py-1">
              {active + 1} / {images.length}
            </div>
          )}

          {/* Image + arrows row */}
          <div className="flex-1 flex items-center gap-2 px-2" onClick={e => e.stopPropagation()}>
            {images.length > 1 ? (
              <button
                onClick={() => setActive(i => Math.max(0, i - 1))}
                disabled={active === 0}
                className="flex-shrink-0 bg-gray-100 disabled:opacity-20 text-gray-700 rounded-full w-10 h-10 flex items-center justify-center shadow"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
            ) : <div className="w-10 flex-shrink-0" />}

            <div className="flex-1 relative h-full">
              <Image src={images[active].url} alt={name} fill className="object-contain" />
            </div>

            {images.length > 1 ? (
              <button
                onClick={() => setActive(i => Math.min(images.length - 1, i + 1))}
                disabled={active === images.length - 1}
                className="flex-shrink-0 bg-gray-100 disabled:opacity-20 text-gray-700 rounded-full w-10 h-10 flex items-center justify-center shadow"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            ) : <div className="w-10 flex-shrink-0" />}
          </div>
        </div>
      )}
    </>
  )
}

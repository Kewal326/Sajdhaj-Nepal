'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import type { ProductImage } from '@/types/database'

export default function ProductImageGallery({ images, name, badge }: {
  images: ProductImage[]
  name: string
  badge: string | null
}) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [copied, setCopied] = useState(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const didSwipe = useRef(false)

  function handleTouchStart(e: React.TouchEvent) {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    didSwipe.current = false
  }

  function handleTouchEnd(e: React.TouchEvent, onTap?: () => void) {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    // Vertical movement > 10px = scroll, ignore completely
    if (Math.abs(dy) > 10) { didSwipe.current = true; return }
    if (Math.abs(dx) > 40) {
      didSwipe.current = true
      if (dx < 0) setActive(i => Math.min(images.length - 1, i + 1))
      else setActive(i => Math.max(0, i - 1))
    } else {
      didSwipe.current = false
      onTap?.()
    }
  }

  function share() {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: name, url })
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
    } else {
      window.prompt('Copy link:', url)
    }
  }

  if (images.length === 0) {
    return <div className="h-96 bg-brand-50 flex items-center justify-center text-8xl">💍</div>
  }

  return (
    <>
      {/* Main image */}
      <div
        className="relative h-96 bg-brand-50 cursor-zoom-in select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={e => handleTouchEnd(e, () => setLightbox(true))}
        onClick={() => { if (!didSwipe.current) setLightbox(true) }}
      >
        <Image src={images[active].url} alt={name} fill className="object-contain" draggable={false} />
        {badge && (
          <span className="absolute top-3 left-3 bg-brand-700 text-white text-xs font-medium px-2.5 py-1 rounded">{badge}</span>
        )}
        <button
          onTouchStart={e => e.stopPropagation()}
          onTouchEnd={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); share() }}
          className="absolute top-3 right-3 bg-white/90 rounded-full w-9 h-9 flex items-center justify-center shadow-sm"
        >
          {copied
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-green-600"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 text-gray-700"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          }
        </button>
        {images.length > 1 && (
          <>
            {active > 0 && (
              <button onTouchStart={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setActive(i => i - 1) }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            {active < images.length - 1 && (
              <button onTouchStart={e => e.stopPropagation()} onTouchEnd={e => e.stopPropagation()} onClick={e => { e.stopPropagation(); setActive(i => i + 1) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white rounded-full w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setActive(i) }}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === active ? 'bg-white' : 'bg-white/40'}`} />
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
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 relative transition-colors ${i === active ? 'border-brand-600' : 'border-gray-100'}`}>
              <Image src={img.url} alt="" fill className="object-contain bg-brand-50" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col pt-16 pb-24" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 z-10 text-gray-700 bg-gray-100 rounded-full w-9 h-9 flex items-center justify-center"
            onClick={() => setLightbox(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          {images.length > 1 && (
            <div className="absolute top-4 left-4 z-10 text-gray-600 text-sm bg-gray-100 rounded-full px-3 py-1">
              {active + 1} / {images.length}
            </div>
          )}
          <div
            className="flex-1 flex items-center gap-2 px-2"
            onClick={e => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={e => handleTouchEnd(e)}
          >
            {images.length > 1
              ? <button onClick={() => setActive(i => Math.max(0, i - 1))} disabled={active === 0}
                  className="flex-shrink-0 bg-gray-100 disabled:opacity-20 text-gray-700 rounded-full w-10 h-10 flex items-center justify-center shadow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
              : <div className="w-10 flex-shrink-0" />}
            <div className="flex-1 relative h-full">
              <Image src={images[active].url} alt={name} fill className="object-contain" />
            </div>
            {images.length > 1
              ? <button onClick={() => setActive(i => Math.min(images.length - 1, i + 1))} disabled={active === images.length - 1}
                  className="flex-shrink-0 bg-gray-100 disabled:opacity-20 text-gray-700 rounded-full w-10 h-10 flex items-center justify-center shadow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              : <div className="w-10 flex-shrink-0" />}
          </div>
        </div>
      )}
    </>
  )
}

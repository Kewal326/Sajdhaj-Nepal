'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

const slides = [
  {
    id: 1,
    tag: '✦ Teej Collection 2025',
    title: 'Celebrate\nin style',
    cta: 'Shop now',
    href: '/category',
    image: 'https://picsum.photos/seed/teej2025/800/500',
  },
  {
    id: 2,
    tag: '🎉 Limited time offer',
    title: 'Up to 40%\noff this Teej',
    cta: 'See deals',
    href: '/category',
    image: 'https://picsum.photos/seed/jewelry99/800/500',
  },
  {
    id: 3,
    tag: '✨ Just arrived',
    title: 'New jewelry\ncollection',
    cta: 'Explore',
    href: '/category/sets',
    image: 'https://picsum.photos/seed/fashion77/800/500',
  },
]

export default function HeroCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  // Auto-scroll
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      const next = (active + 1) % slides.length
      scrollToSlide(next)
    }, 3500)
    return () => clearInterval(id)
  }, [active, paused])

  function scrollToSlide(index: number) {
    const el = scrollRef.current
    if (!el) return
    // children[0] = spacer, slides start at index 1
    const card = el.children[index + 1] as HTMLElement
    if (!card) return
    el.scrollTo({ left: card.offsetLeft - 16, behavior: 'smooth' })
    setActive(index)
  }

  function onScroll() {
    const el = scrollRef.current
    if (!el) return
    // children[0] is the spacer, children[1] is first slide
    // children[0] = left spacer, children[1..n] = slides
    const firstCard = el.children[1] as HTMLElement
    if (!firstCard) return
    const cardWidth = firstCard.offsetWidth + 12 // gap-3 = 12px
    const i = Math.round(Math.max(0, el.scrollLeft) / cardWidth)
    setActive(Math.min(i, slides.length - 1))
  }

  return (
    <div className="mt-3 select-none">
      {/* Scroll container — left padding 16px, no right padding so next card peeks */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto [&::-webkit-scrollbar]:hidden scroll-smooth"
        style={{ scrollSnapType: 'x mandatory', scrollPaddingLeft: '16px' }}
        onScroll={onScroll}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setTimeout(() => setPaused(false), 3000)}
      >
        <div className="flex-shrink-0 w-4" aria-hidden="true" />
        {slides.map(slide => (
          <div
            key={slide.id}
            className="relative flex-shrink-0 rounded-2xl overflow-hidden"
            style={{ width: 'calc(78% - 8px)', height: '300px', scrollSnapAlign: 'start' }}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              sizes="85vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

            <div className="absolute inset-0 p-4 flex flex-col justify-between">
              <span className="inline-block self-start text-[10px] text-white/80 border border-white/30 rounded-full px-2.5 py-0.5">
                {slide.tag}
              </span>
              <div>
                <h2 className="text-xl font-bold text-white leading-tight whitespace-pre-line mb-3 drop-shadow-sm">
                  {slide.title}
                </h2>
                <Link
                  href={slide.href}
                  className="inline-flex items-center gap-1 bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full active:opacity-80"
                >
                  {slide.cta} →
                </Link>
              </div>
            </div>
          </div>
        ))}
        {/* Right padding spacer so last card doesn't sit at edge */}
        <div className="flex-shrink-0 w-4" />
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { scrollToSlide(i); setPaused(true); setTimeout(() => setPaused(false), 3000) }}
            className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? 'w-5 bg-brand-700' : 'w-1.5 bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  )
}

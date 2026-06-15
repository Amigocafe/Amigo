'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLanguage } from '@/lib/i18n/language-context'
import { useMarqueeItems } from '@/lib/i18n/site-content'

gsap.registerPlugin(ScrollTrigger)

/** Minimum number of copies of the source list in one "half" of the track. */
const MIN_COPIES = 4

export function Marquee() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const halfRef = useRef<HTMLDivElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  const { t, locale } = useLanguage()
  const liveMarquee = useMarqueeItems()

  const staticItems = t.marquee as readonly string[]
  const liveItems = liveMarquee ? (locale === 'ar' ? liveMarquee.ar : liveMarquee.en) : staticItems
  const source = liveItems.length > 0 ? liveItems : staticItems

  // Always repeat source at least MIN_COPIES times in each half so there's
  // never a gap — even on ultra-wide screens or tiny item counts.
  const [copies, setCopies] = useState(MIN_COPIES)

  // After mount (and after source/locale changes), measure and bump copies
  // until the half-track overflows the container.
  useEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current
      const half = halfRef.current
      if (!wrap || !half) return
      const unitW = half.scrollWidth / copies
      if (unitW <= 0) return
      const needed = Math.max(MIN_COPIES, Math.ceil(wrap.offsetWidth / unitW) + 2)
      if (needed !== copies) setCopies(needed)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, locale])

  // Build the repeated items for one half of the track
  const halfItems = Array.from({ length: copies }, () => source).flat()

  const renderHalf = (key: string, ref?: React.Ref<HTMLDivElement>) => (
    <div
      key={key}
      ref={ref}
      // no gap between the two halves — gap only INSIDE each half
      className="flex shrink-0 items-center"
    >
      {halfItems.map((word, i) => (
        <span
          key={`${key}-${i}`}
          className="flex shrink-0 items-center gap-8 px-4 font-heading text-2xl uppercase tracking-wide text-primary-foreground md:text-4xl"
        >
          {word}
          <span className="inline-block h-2 w-2 rotate-45 bg-primary-foreground" />
        </span>
      ))}
    </div>
  )

  // GSAP: animate the FULL track by exactly one half-width so the loop is
  // seamless. We kill & recreate the tween whenever copies change.
  useGSAP(
    () => {
      const track = trackRef.current
      const half = halfRef.current
      if (!track || !half) return

      // Kill previous tween so the new one starts fresh
      tweenRef.current?.kill()

      // Half-width in pixels — this is exactly how far we need to move
      // before looping back to position 0.
      const halfW = half.scrollWidth

      if (!halfW) return

      gsap.set(track, { x: 0 })

      // We move the track from 0 → -halfW then wrap back to 0.
      // gsap.utils.wrap(-halfW, 0) maps any x value back into that range so
      // the moment we reach -halfW the modifier instantly returns 0, which
      // is indistinguishable from the start — giving a perfectly seamless loop.
      const wrap = gsap.utils.wrap(-halfW, 0)

      tweenRef.current = gsap.to(track, {
        x: -halfW,
        duration: 28,
        ease: 'none',
        repeat: -1,
        modifiers: {
          x: (val) => `${wrap(parseFloat(val))}px`,
        },
      })

      // Tilt on scroll
      gsap.fromTo(
        wrapRef.current,
        { rotate: -2.5 },
        {
          rotate: 2.5,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        },
      )

      return () => {
        tweenRef.current?.kill()
      }
    },
    { scope: wrapRef, dependencies: [copies] },
  )

  return (
    <div
      ref={wrapRef}
      dir="ltr"
      className="relative z-20 -my-6 overflow-hidden border-y border-border bg-primary py-4"
      aria-hidden="true"
    >
      {/* Track is wider than viewport; we translate it by -halfW to loop */}
      <div ref={trackRef} className="marquee-track flex w-max items-center whitespace-nowrap">
        {renderHalf('a', halfRef)}
        {renderHalf('b')}
      </div>
    </div>
  )
}

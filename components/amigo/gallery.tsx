'use client'

import { useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLanguage } from '@/lib/i18n/language-context'
import { useGalleryImages } from '@/lib/i18n/site-content'

gsap.registerPlugin(ScrollTrigger)

// four columns, each scrolling at a different parallax speed
const COLUMNS: { images: string[]; speed: number; offset: string }[] = [
  {
    images: ['/images/gallery-1.webp', '/images/barista.webp', '/images/beans.webp'],
    speed: 120,
    offset: '-45%',
  },
  {
    images: ['/images/gallery-4.webp', '/images/latte-art.webp', '/images/pastry.webp'],
    speed: 190,
    offset: '-95%',
  },
  {
    images: ['/images/gallery-gaming.webp', '/images/gaming-setup.webp', '/images/interior.webp'],
    speed: 80,
    offset: '-45%',
  },
  {
    images: ['/images/gallery-3.webp', '/images/gaming-room.webp', '/images/hero-pour.webp'],
    speed: 170,
    offset: '-75%',
  },
]

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()
  const liveImages = useGalleryImages()

  // Use the editable gallery images (one per column lead) when present,
  // keeping the rest of each column's static collage intact.
  const columns = liveImages
    ? COLUMNS.map((col, i) => ({
        ...col,
        images: [liveImages[i] ?? col.images[0], ...col.images.slice(1)],
      }))
    : COLUMNS

  useGSAP(
    () => {
      gsap.from('.gallery-heading-line', {
        yPercent: 110,
        stagger: 0.12,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      })

      // parallax: move each column upward by a different amount as the
      // gallery scrolls through the viewport
      const mm = gsap.matchMedia()

      // Desktop/tablet: full-strength parallax with smoothed scrub (wheel scroll
      // is steady, so the catch-up looks fluid).
      mm.add('(min-width: 768px)', () => {
        const columns = gsap.utils.toArray<HTMLElement>('.gallery-column')
        columns.forEach((column) => {
          const speed = Number(column.dataset.speed) || 150
          // Promote each column to its own compositor layer so the browser
          // only composites the translate instead of repainting the tall webp
          // images every frame — this removes the judder on desktop.
          gsap.set(column, { willChange: 'transform', force3D: true })
          gsap.fromTo(
            column,
            { y: 0 },
            {
              y: () => window.innerHeight * (speed / 100),
              ease: 'none',
              force3D: true,
              scrollTrigger: {
                trigger: galleryRef.current,
                start: 'top bottom',
                end: 'bottom top',
                // Lenis already smooths the scroll; bind the parallax 1:1 to it
                // (scrub: true) instead of adding a second lerp layer, which is
                // what produced the back-and-forth jitter.
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          )
        })
      })

      // Mobile: the gallery is a plain compact grid (no offset canvas), so any
      // parallax just shakes the images against native touch scroll. Leave the
      // columns static and let them scroll naturally with the page.
    },
    { scope: sectionRef },
  )

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="relative bg-background"
      aria-label={t.gallery.label}
    >
      {/* heading */}
      <div className="px-4 pt-24 pb-12 md:px-8 md:pt-40 md:pb-20">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="font-heading uppercase leading-[0.9] text-foreground">
            <span className="block overflow-hidden text-[clamp(3rem,9vw,8rem)]">
              <span className="gallery-heading-line block">{t.gallery.titleTop}</span>
            </span>
            <span className="block overflow-hidden ps-[6vw] text-[clamp(3rem,9vw,8rem)]">
              <span className="gallery-heading-line text-stroke-caramel block">
                {t.gallery.titleBottom}
              </span>
            </span>
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty md:text-base">
            {t.gallery.caption}
          </p>
        </div>
      </div>

      {/* parallax columns — tall offset canvas on desktop, compact grid on mobile */}
      <div
        ref={galleryRef}
        className="relative box-border flex h-auto gap-3 overflow-hidden bg-card p-3 md:h-[175vh] md:gap-[2vw] md:p-[2vw]"
      >
        {columns.map((column, ci) => (
          <div
            key={ci}
            data-speed={column.speed}
            className={`gallery-column relative top-0 flex w-1/2 flex-col gap-3 md:h-full md:w-1/4 md:min-w-[180px] md:gap-[2vw] md:top-[var(--col-offset)] ${
              ci > 1 ? 'hidden md:flex' : ''
            }`}
            style={{ '--col-offset': column.offset } as React.CSSProperties}
          >
            {column.images.map((src, i) => (
              <figure
                key={i}
                className="group relative aspect-[3/4] w-full overflow-hidden md:aspect-auto md:h-full"
              >
                <Image
                  src={src || '/placeholder.svg'}
                  alt="Inside Amigo cafe and PlayStation lounge"
                  fill
                  sizes="(max-width: 767px) 50vw, 25vw"
                  className="pointer-events-none object-cover transition-transform duration-700 ease-out [@media(hover:hover)]:group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-espresso/10 transition-colors duration-500 group-hover:bg-transparent"
                  aria-hidden="true"
                />
              </figure>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

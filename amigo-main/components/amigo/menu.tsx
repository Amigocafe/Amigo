'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLanguage } from '@/lib/i18n/language-context'
import { useMenuGroups } from '@/lib/i18n/site-content'

gsap.registerPlugin(ScrollTrigger)

// Static media + prices, zipped with localized text by index.
const MENU_MEDIA: { price: string; image: string }[][] = [
  [
    { price: '4.5', image: '/images/hero-pour.webp' },
    { price: '5.0', image: '/images/latte-art.webp' },
    { price: '6.0', image: '/images/beans.webp' },
  ],
  [
    { price: '5.5', image: '/images/barista.webp' },
    { price: '6.5', image: '/images/interior.webp' },
  ],
  [
    { price: '7.5', image: '/images/pastry.webp' },
    { price: '4.0', image: '/images/gallery-3.webp' },
  ],
]

export function Menu() {
  const sectionRef = useRef<HTMLElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const { t } = useLanguage()
  const liveGroups = useMenuGroups()

  // Prefer live database content; fall back to the bundled static menu (zipped
  // with its media) when the DB is empty or unreachable.
  const menu =
    liveGroups ??
    t.menu.groups.map((group, gi) => ({
      category: group.category,
      caption: group.caption,
      items: group.items.map((item, ii) => ({
        ...item,
        ...MENU_MEDIA[gi][ii],
      })),
    }))

  useGSAP(
    () => {
      gsap.from('.menu-heading-line', {
        yPercent: 110,
        stagger: 0.12,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      })

      const groups = gsap.utils.toArray<HTMLElement>('.menu-group')
      groups.forEach((group) => {
        gsap.from(group.querySelectorAll('.menu-row'), {
          autoAlpha: 0,
          y: 50,
          stagger: 0.08,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: group,
            start: 'top 82%',
          },
        })
      })

      // floating image preview follows cursor (desktop only)
      if (window.matchMedia('(pointer: fine)').matches) {
        const xTo = gsap.quickTo(previewRef.current, 'x', {
          duration: 0.5,
          ease: 'power3',
        })
        const yTo = gsap.quickTo(previewRef.current, 'y', {
          duration: 0.5,
          ease: 'power3',
        })

        const move = (e: MouseEvent) => {
          xTo(e.clientX)
          yTo(e.clientY)
        }
        window.addEventListener('mousemove', move, { passive: true })
        return () => window.removeEventListener('mousemove', move)
      }
    },
    { scope: sectionRef },
  )

  const allImages = Array.from(
    new Set(menu.flatMap((g) => g.items.map((i) => i.image))),
  )

  return (
    <section
      id="menu"
      ref={sectionRef}
      className="relative px-4 py-24 md:px-8 md:py-40"
    >
      <div className="mb-16 flex flex-col gap-6 md:mb-24 md:flex-row md:items-end md:justify-between">
        <h2 className="font-heading uppercase leading-[0.9] text-foreground">
          <span className="block overflow-hidden text-[clamp(3rem,9vw,8rem)]">
            <span className="menu-heading-line block">{t.menu.titleTop}</span>
          </span>
          <span className="block overflow-hidden ps-[6vw] text-[clamp(3rem,9vw,8rem)]">
            <span className="menu-heading-line text-stroke-cream block">
              {t.menu.titleBottom}
            </span>
          </span>
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty md:text-base">
          {t.menu.caption}
        </p>
      </div>

      <div className="flex flex-col gap-16 md:gap-24">
        {menu.map((group, gi) => (
          <div
            key={`${group.category}-${gi}`}
            className="menu-group grid gap-6 md:grid-cols-12 md:gap-12"
          >
            {/* sticky category label */}
            <div className="md:col-span-4 lg:col-span-3">
              <div className="md:sticky md:top-24">
                <h3 className="font-heading text-3xl uppercase text-primary md:text-4xl">
                  {group.category}
                </h3>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  {group.caption}
                </p>
              </div>
            </div>

            {/* items */}
            <ul className="border-t border-border md:col-span-8 lg:col-span-9">
              {group.items.map((item, ii) => (
                <li key={`${item.name}-${ii}`} className="menu-row border-b border-border">
                  <div
                    className="group flex items-center gap-5 py-6 md:py-8"
                    onMouseEnter={() => setActiveImage(item.image)}
                    onMouseLeave={() => setActiveImage(null)}
                  >
                    {/* inline thumbnail */}
                    <div className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-sm md:h-16 md:w-16">
                      <Image
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 64px, 64px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="flex flex-1 flex-col gap-1 md:flex-row md:items-baseline md:gap-6">
                      <span className="flex items-center gap-3">
                        <span className="font-heading text-2xl uppercase text-foreground transition-all duration-300 group-hover:translate-x-2 group-hover:text-primary md:text-4xl">
                          {item.name}
                        </span>
                        {item.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="border border-primary/50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary"
                          >
                            {tag}
                          </span>
                        ))}
                      </span>
                      <span
                        className="hidden flex-1 translate-y-1 border-b border-dashed border-border md:block"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-muted-foreground md:order-last md:hidden">
                        {item.desc}
                      </span>
                    </div>

                    <span className="shrink-0 font-mono text-lg text-primary tabular-nums md:text-2xl">
                      {item.price}
                      <span className="ms-1 text-xs text-muted-foreground">
                        {t.menu.currency}
                      </span>
                    </span>
                  </div>
                  <p className="hidden pb-6 pl-[5.25rem] text-sm text-muted-foreground md:block">
                    {item.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* floating cursor-follow preview */}
      <div
        ref={previewRef}
        className="pointer-events-none fixed top-0 left-0 z-50 hidden h-56 w-44 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-sm md:block"
        style={{
          opacity: activeImage !== null ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        aria-hidden="true"
      >
        {allImages.map((src) => (
          <Image
            key={src}
            src={src || '/placeholder.svg'}
            alt=""
            fill
            sizes="176px"
            className="object-cover transition-opacity duration-300"
            style={{ opacity: activeImage === src ? 1 : 0 }}
          />
        ))}
      </div>
    </section>
  )
}

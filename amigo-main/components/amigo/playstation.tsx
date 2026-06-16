'use client'

import { useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLanguage } from '@/lib/i18n/language-context'
import { usePlaystationContent } from '@/lib/i18n/site-content'

gsap.registerPlugin(ScrollTrigger)

const RATE_PRICES = ['60', '100', '180']

export function Playstation() {
  const sectionRef = useRef<HTMLElement>(null)
  const { t } = useLanguage()
  const livePs = usePlaystationContent()

  const titleTop = livePs?.titleTop ?? t.playstation.titleTop
  const titleBottom = livePs?.titleBottom ?? t.playstation.titleBottom
  const caption = livePs?.caption ?? t.playstation.caption

  const rates = livePs
    ? livePs.rates.map((r) => ({ label: r.label, note: '', price: r.price }))
    : t.playstation.rates.map((rate, i) => ({ ...rate, price: RATE_PRICES[i] }))

  useGSAP(
    () => {
      gsap.from('.ps-heading-line', {
        yPercent: 110,
        stagger: 0.12,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      })

      gsap.from('.ps-hero-img', {
        clipPath: 'inset(0% 0% 100% 0%)',
        duration: 1.3,
        ease: 'power4.inOut',
        scrollTrigger: { trigger: '.ps-hero-img', start: 'top 85%' },
      })

      gsap.from('.ps-card', {
        autoAlpha: 0,
        y: 60,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ps-cards', start: 'top 80%' },
      })

      gsap.from('.ps-rate', {
        autoAlpha: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ps-rates', start: 'top 85%' },
      })
    },
    { scope: sectionRef },
  )

  return (
    <section
      id="playstation"
      ref={sectionRef}
      className="relative overflow-hidden px-4 py-24 md:px-8 md:py-40"
      aria-label={t.playstation.label}
    >
      <div className="mb-12 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.3em] text-primary">
            {t.playstation.pressStart}
          </p>
          <h2 className="font-heading uppercase leading-[0.9] text-foreground">
            <span className="block overflow-hidden text-[clamp(3rem,9vw,8rem)]">
              <span className="ps-heading-line block">{titleTop}</span>
            </span>
            <span className="block overflow-hidden ps-[6vw] text-[clamp(3rem,9vw,8rem)]">
              <span className="ps-heading-line text-stroke-caramel block">
                {titleBottom}
              </span>
            </span>
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty md:text-base">
          {caption}
        </p>
      </div>

      {/* hero image */}
      <div className="ps-hero-img relative mb-6 aspect-[16/9] w-full overflow-hidden md:mb-6">
        <Image
          src="/images/gaming-room.webp"
          alt="Stylish PlayStation gaming booth inside the cafe with ambient lighting"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-transparent to-transparent"
          aria-hidden="true"
        />
        <span className="absolute bottom-6 left-6 font-mono text-xs uppercase tracking-[0.25em] text-cream">
          {t.playstation.loungeTag}
        </span>
      </div>

      {/* feature cards */}
      <div className="ps-cards grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {t.playstation.consoles.map((c) => (
          <article
            key={c.name}
            className="ps-card flex flex-col gap-4 border border-border bg-card p-6 md:p-8"
          >
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              {c.detail}
            </span>
            <h3 className="font-heading text-2xl uppercase leading-none text-card-foreground md:text-3xl">
              {c.name}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              {c.desc}
            </p>
          </article>
        ))}
      </div>

      {/* rates */}
      <div className="ps-rates mt-16 border-t border-border pt-10">
        <div className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-primary">
          <span className="inline-block h-px w-10 bg-primary" aria-hidden="true" />
          {t.playstation.ratesLabel}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {rates.map((r) => (
            <div
              key={r.label}
              className="ps-rate flex items-end justify-between border-b border-border pb-4"
            >
              <div className="flex flex-col gap-1">
                <span className="font-heading text-lg uppercase text-foreground">
                  {r.label}
                </span>
                <span className="text-xs text-muted-foreground">{r.note}</span>
              </div>
              <span className="font-heading text-3xl text-primary md:text-4xl">
                {r.price}
                <span className="ms-1 font-sans text-xs font-normal text-muted-foreground">
                  {t.playstation.currency}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

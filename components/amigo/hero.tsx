'use client'

import { useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ThemeToggle } from './theme-toggle'
import { LanguageToggle } from './language-toggle'
import { useLanguage, splitUnits } from '@/lib/i18n/language-context'
import { useHeroContent } from '@/lib/i18n/site-content'

gsap.registerPlugin(ScrollTrigger)

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const { t, locale } = useLanguage()
  const liveHero = useHeroContent()

  // Live hero content from the DB with a static fallback per field.
  const heroTitleTop = liveHero?.titleTop ?? t.hero.titleTop
  const heroTitleBottom = liveHero?.titleBottom ?? t.hero.titleBottom
  const heroTagline = liveHero?.tagline ?? t.hero.tagline
  const heroImage = liveHero?.image ?? '/images/hero-pour.webp'

  useGSAP(
    () => {
      // In RTL the indented bottom line sits on the right, so mirror the
      // horizontal split direction to keep the parallax reading naturally.
      // Read the persisted locale directly: this runs once (layout effect)
      // before the locale state hydrates, and we must NOT re-run on toggle —
      // re-running reverts the entrance timeline mid-flight and strands the
      // letters at their `from` offset.
      const isRtl =
        document.documentElement.dir === 'rtl' ||
        window.localStorage.getItem('amigo-locale') === 'ar'
      const dirMul = isRtl ? -1 : 1

      // Entrance
      const tl = gsap.timeline()
      tl.from('.hero-letter', {
        yPercent: 120,
        rotate: 6,
        stagger: 0.07,
        duration: 1.1,
        ease: 'power4.out',
      })
        .from(
          '.hero-img-wrap',
          {
            clipPath: 'inset(100% 0% 0% 0%)',
            duration: 1.2,
            ease: 'power4.inOut',
          },
          '-=0.7',
        )
        .from(
          '.hero-meta',
          { y: 30, autoAlpha: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' },
          '-=0.6',
        )

      // Scroll parallax: title splits apart, image scales
      gsap.to('.hero-title-top', {
        xPercent: -18 * dirMul,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })
      gsap.to('.hero-title-bottom', {
        xPercent: 18 * dirMul,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })
      gsap.to('.hero-img', {
        scale: 1.25,
        yPercent: 10,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })

      // floating PlayStation controller — entrance + idle float + scroll drift
      tl.from(
        '.hero-pad',
        { yPercent: -60, autoAlpha: 0, rotate: -25, duration: 1.1, ease: 'back.out(1.6)' },
        '-=0.5',
      )
      gsap.to('.hero-pad', {
        y: '+=18',
        rotate: '+=6',
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
      gsap.to('.hero-pad', {
        yPercent: -60,
        xPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      })
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-svh flex-col justify-between overflow-hidden px-4 pt-24 pb-8 md:px-8"
    >
      <header className="hero-meta absolute top-0 left-0 z-20 flex w-full items-center justify-between px-4 py-5 md:px-8">
        <p className="font-heading text-lg uppercase tracking-wide text-foreground">
          {t.hero.brand}
          <span className="text-primary">.</span>
        </p>
        <nav aria-label="Main">
          <ul className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <li className="hidden md:block">
              <a href="#story" className="transition-colors hover:text-primary">
                {t.nav.story}
              </a>
            </li>
            <li className="hidden md:block">
              <a href="#menu" className="transition-colors hover:text-primary">
                {t.nav.menu}
              </a>
            </li>
            <li className="hidden md:block">
              <a href="#playstation" className="transition-colors hover:text-primary">
                {t.nav.play}
              </a>
            </li>
            <li>
              <a
                href="#visit"
                className="border border-primary px-4 py-2 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                {t.nav.visit}
              </a>
            </li>
            <li>
              <LanguageToggle />
            </li>
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </nav>
      </header>

      <div className="relative z-10 flex flex-1 flex-col justify-center">
        <h1 className="font-heading uppercase leading-[0.85] text-foreground">
          <span className="hero-title-top block overflow-hidden text-[clamp(4rem,17vw,16rem)]">
            {splitUnits(heroTitleTop, locale).map((l, i) => (
              <span key={i} className="hero-letter inline-block whitespace-pre">
                {l}
              </span>
            ))}
          </span>
          <span className="hero-title-bottom block overflow-hidden ps-[8vw] text-[clamp(4rem,17vw,16rem)]">
            {splitUnits(heroTitleBottom, locale).map((l, i) => (
              <span
                key={i}
                className="hero-letter text-stroke-caramel inline-block whitespace-pre"
              >
                {l}
              </span>
            ))}
            <span className="hero-letter ms-[0.1em] inline-block text-primary">
              *
            </span>
          </span>
        </h1>

        {/* floating hero image overlapping the type */}
        <div className="hero-img-wrap absolute top-1/2 left-1/2 z-[-1] h-[42vh] w-[68vw] -translate-x-1/2 -translate-y-1/2 overflow-hidden md:left-[58%] md:h-[58vh] md:w-[34vw] md:rtl:left-[42%]">
          <Image
            src={heroImage || '/placeholder.svg'}
            alt="Espresso pouring into a ceramic cup with rich crema"
            fill
            priority
            sizes="(min-width: 768px) 34vw, 68vw"
            className="hero-img object-cover"
          />
        </div>

        {/* floating PlayStation controller — coffee + gaming */}
        <div className="hero-pad pointer-events-none absolute top-[18%] end-[6%] z-20 h-[22vh] w-[30vw] md:top-[14%] md:end-[10%] md:h-[26vh] md:w-[18vw]">
          <Image
            src="/images/ps-controller.webp"
            alt="Wireless gaming controller — Amigo is a cafe and PlayStation lounge"
            fill
            priority
            sizes="(min-width: 768px) 18vw, 30vw"
            className="object-contain drop-shadow-2xl"
          />
        </div>
      </div>

      <div className="hero-meta relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground text-pretty">
          {heroTagline}
        </p>
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-primary">
          <span className="inline-block h-px w-10 bg-primary" aria-hidden="true" />
          {t.hero.scroll}
        </div>
      </div>
    </section>
  )
}

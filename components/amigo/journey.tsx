'use client'

import { useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLanguage } from '@/lib/i18n/language-context'
import { useJourneyChapters } from '@/lib/i18n/site-content'

gsap.registerPlugin(ScrollTrigger)

const CHAPTER_MEDIA = [
  {
    number: '01',
    image: '/images/beans.webp',
    alt: 'Roasted coffee beans glistening under warm light',
  },
  {
    number: '02',
    image: '/images/barista.webp',
    alt: "Barista's hands tamping espresso grounds in a portafilter",
  },
  {
    number: '03',
    image: '/images/gaming-setup.webp',
    alt: 'Two friends playing PlayStation on a couch in a warmly lit cafe lounge',
  },
]

export function Journey() {
  const sectionRef = useRef<HTMLElement>(null)
  const { t } = useLanguage()
  const liveChapters = useJourneyChapters()

  const chapters = CHAPTER_MEDIA.map((media, i) => ({
    ...media,
    title: liveChapters?.[i]?.title ?? t.journey.chapters[i].title,
    body: liveChapters?.[i]?.body ?? t.journey.chapters[i].body,
  }))

  useGSAP(
    () => {
      // In RTL, flex children lay out right-to-left, so the panels overflow to
      // the left and must be panned in the opposite direction.
      const isRtl =
        document.documentElement.dir === 'rtl' ||
        window.localStorage.getItem('amigo-locale') === 'ar'
      const dirMul = isRtl ? -1 : 1

      const mm = gsap.matchMedia()

      // ---- Desktop / tablet: pinned horizontal scroll ------------------------
      mm.add('(min-width: 768px)', () => {
        const panels = gsap.utils.toArray<HTMLElement>('.journey-panel')

        const tween = gsap.to(panels, {
          xPercent: -100 * (panels.length - 1) * dirMul,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            pin: true,
            scrub: 1,
            snap: 1 / (panels.length - 1),
            end: () => '+=' + (sectionRef.current?.offsetWidth ?? 0) * 2,
          },
        })

        // per-panel inner parallax + reveals tied to the horizontal tween
        panels.forEach((panel) => {
          const img = panel.querySelector('.journey-img')
          const title = panel.querySelector('.journey-title')
          const num = panel.querySelector('.journey-num')

          // Horizontal edge keywords are mirrored under RTL, so swap them for
          // the scrubbed parallax to keep it spanning the full traversal.
          const imgStart = isRtl ? 'right left' : 'left right'
          const imgEnd = isRtl ? 'left right' : 'right left'

          gsap.fromTo(
            img,
            { scale: 1.3, xPercent: 8 * dirMul },
            {
              scale: 1,
              xPercent: -4 * dirMul,
              ease: 'none',
              scrollTrigger: {
                trigger: panel,
                containerAnimation: tween,
                start: imgStart,
                end: imgEnd,
                scrub: true,
              },
            },
          )
          gsap.from(num, {
            xPercent: -40 * dirMul,
            autoAlpha: 0,
            ease: 'power3.out',
            duration: 0.8,
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: 'left center',
              toggleActions: 'play none none reverse',
            },
          })
          // LTR uses a slide-up that relies on the h2's overflow-hidden clip
          // mask. Arabic glyphs (tall alef, high dots) get clipped by that
          // mask, so RTL gets overflow-visible + a gentle fade-and-rise.
          gsap.from(title, {
            yPercent: isRtl ? 0 : 100,
            y: isRtl ? 28 : 0,
            autoAlpha: isRtl ? 0 : 1,
            ease: 'power3.out',
            duration: 0.8,
            delay: 0.12,
            scrollTrigger: {
              trigger: panel,
              containerAnimation: tween,
              start: 'left center',
              toggleActions: 'play none none reverse',
            },
          })
        })
      })

      // ---- Mobile: panels stack vertically with plain fade-up reveals --------
      // Horizontal pinning is cramped on phones, and the container-animation
      // triggers fire unreliably, which is why titles never appeared. Each
      // panel just animates in as it enters the viewport instead.
      mm.add('(max-width: 767px)', () => {
        const panels = gsap.utils.toArray<HTMLElement>('.journey-panel')
        panels.forEach((panel) => {
          const title = panel.querySelector('.journey-title')
          const num = panel.querySelector('.journey-num')

          // One-shot fade-up as the panel enters — no scrubbed scale. A
          // scrubbed transform repaints the image on every scroll frame, which
          // is what made the section shake / lag on native touch scroll.
          gsap.from([num, title], {
            y: 40,
            autoAlpha: 0,
            stagger: 0.12,
            ease: 'power3.out',
            duration: 0.8,
            scrollTrigger: {
              trigger: panel,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          })
        })
      })
    },
    { scope: sectionRef },
  )

  return (
    <section
      id="story"
      ref={sectionRef}
      className="relative flex w-full flex-col overflow-hidden bg-background md:h-svh md:flex-row"
      aria-label={t.journey.label}
    >
      {chapters.map((chapter) => (
        <article
          key={chapter.number}
          className="journey-panel relative flex w-full shrink-0 items-center px-6 py-20 md:h-full md:w-screen md:px-16 md:py-0"
        >
          {/* oversized chapter number behind */}
          <span
            className="journey-num pointer-events-none absolute top-8 start-4 font-heading text-[clamp(8rem,28vw,24rem)] leading-none text-stroke-caramel opacity-40 md:start-8"
            aria-hidden="true"
          >
            {chapter.number}
          </span>

          <div className="relative z-10 grid w-full items-center gap-8 md:grid-cols-2 md:gap-16">
            <div className="relative aspect-[4/5] max-h-[62vh] w-full overflow-hidden">
              <Image
                src={chapter.image}
                alt={chapter.alt}
                fill
                sizes="(min-width: 768px) 45vw, 90vw"
                className="journey-img object-cover"
              />
            </div>
            <div className="flex flex-col gap-6">
              <h2 className="overflow-hidden font-heading text-5xl uppercase leading-none text-foreground md:text-8xl rtl:overflow-visible rtl:leading-[1.2] rtl:pb-1">
                <span className="journey-title block">{chapter.title}</span>
              </h2>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground text-pretty md:text-lg">
                {chapter.body}
              </p>
              <span
                className="inline-block h-px w-24 bg-primary"
                aria-hidden="true"
              />
            </div>
          </div>
        </article>
      ))}
    </section>
  )
}

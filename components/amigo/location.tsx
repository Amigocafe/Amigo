'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Map } from '@/components/ui/map'
import { useLanguage } from '@/lib/i18n/language-context'
import { useLocationContent, useMapLocation } from '@/lib/i18n/site-content'

gsap.registerPlugin(ScrollTrigger)

export function Location() {
  const sectionRef = useRef<HTMLElement>(null)
  const { t } = useLanguage()
  const liveLocation = useLocationContent()
  const { center: LOCATION, directionsUrl: DIRECTIONS_URL } = useMapLocation()

  const locTitle = liveLocation?.title ?? t.location.title
  // DB stores a single address string; static copy is a 2-line array.
  const addressLines = liveLocation
    ? liveLocation.address.split(/\n|،|,/).map((s) => s.trim()).filter(Boolean)
    : t.location.address
  const locHours = liveLocation?.hours ?? t.location.hours

  useGSAP(
    () => {
      gsap.from('.location-head', {
        y: 50,
        autoAlpha: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      })

      gsap.from('.location-detail', {
        y: 30,
        autoAlpha: 0,
        stagger: 0.12,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.location-grid', start: 'top 80%' },
      })

      gsap.from('.location-map', {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1.1,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.location-map', start: 'top 85%' },
      })
    },
    { scope: sectionRef },
  )

  return (
    <section
      id="location"
      ref={sectionRef}
      className="relative overflow-hidden border-t border-border bg-background px-4 py-20 md:px-8 md:py-32"
    >
      <div className="location-head mb-12 flex flex-col gap-3 md:mb-16">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
          {t.location.kicker}
        </span>
        <h2 className="max-w-3xl text-balance font-heading text-[clamp(2.5rem,7vw,6rem)] uppercase leading-[0.85] text-foreground">
          {locTitle}
        </h2>
      </div>

      <div className="location-grid grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-8">
          <div className="location-detail flex flex-col gap-2">
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {t.location.addressLabel}
            </h3>
            <p className="text-pretty text-xl leading-relaxed text-foreground">
              {addressLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < addressLines.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>

          <div className="location-detail flex flex-col gap-2">
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {t.location.hoursLabel}
            </h3>
            <p className="text-xl leading-relaxed text-foreground">
              {locHours}
            </p>
          </div>

          <div className="location-detail mt-auto">
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 border border-primary bg-primary px-6 py-4 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground transition-colors hover:bg-transparent hover:text-primary"
            >
              {t.location.directions}
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1 rtl:rotate-180"
              >
                &rarr;
              </span>
            </a>
          </div>
        </div>

        <div className="location-map h-[420px] w-full overflow-hidden rounded-sm border border-border lg:h-[560px]">
          <Map center={LOCATION} zoom={15} marker={LOCATION} />
        </div>
      </div>
    </section>
  )
}

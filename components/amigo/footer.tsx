'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { useLanguage, splitUnits } from '@/lib/i18n/language-context'
import { useContactLinks } from '@/lib/i18n/site-content'
import { SOCIAL_ICONS } from '@/components/amigo/social-icons'

gsap.registerPlugin(ScrollTrigger)

export function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const { t, locale } = useLanguage()
  const contact = useContactLinks()
  const email = contact?.email || 'hola@amigocafe.com'
  const socials = contact?.socials ?? []

  useGSAP(
    () => {
      gsap.from('.footer-letter', {
        yPercent: 110,
        stagger: 0.06,
        duration: 1,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: '.footer-giant',
          start: 'top 85%',
        },
      })

      gsap.from('.footer-info', {
        y: 40,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 75%',
        },
      })
    },
    { scope: footerRef },
  )

  return (
    <footer
      id="visit"
      ref={footerRef}
      className="relative overflow-hidden border-t border-border bg-primary px-4 pt-20 pb-4 md:px-8 md:pt-32"
    >
      <div className="mb-16 grid gap-10 md:mb-24 md:grid-cols-3">
        <div className="footer-info flex flex-col gap-2">
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-primary-foreground/60">
            {t.footer.findLabel}
          </h3>
          <p className="text-lg leading-relaxed text-primary-foreground">
            {t.footer.address[0]}
            <br />
            {t.footer.address[1]}
          </p>
        </div>
        <div className="footer-info flex flex-col gap-2">
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-primary-foreground/60">
            {t.footer.hoursLabel}
          </h3>
          <p className="text-lg leading-relaxed text-primary-foreground">
            {t.footer.hours[0]}
          </p>
        </div>
        <div className="footer-info flex flex-col gap-2">
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-primary-foreground/60">
            {t.footer.sayLabel}
          </h3>
          <a
            href={`mailto:${email}`}
            className="text-lg text-primary-foreground underline-offset-4 transition-all hover:underline"
          >
            {email}
          </a>
          {socials.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-3">
              {socials.map((s) => {
                const Icon = SOCIAL_ICONS[s.key]
                return (
                  <a
                    key={s.key}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="flex size-10 items-center justify-center rounded-full border border-primary-foreground/25 text-primary-foreground/70 transition-colors hover:border-primary-foreground hover:text-primary-foreground"
                  >
                    <Icon className="size-[18px]" />
                  </a>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>

      {locale !== 'ar' ? (
        <p
          className="footer-giant overflow-hidden text-center font-heading text-[clamp(4rem,18.5vw,22rem)] uppercase leading-[0.8] text-primary-foreground"
          aria-hidden="true"
        >
          {splitUnits(t.hero.titleTop, locale).map((l, i) => (
            <span key={i} className="footer-letter inline-block whitespace-pre">
              {l}
            </span>
          ))}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-primary-foreground/20 pt-4 font-mono text-[10px] uppercase tracking-widest text-primary-foreground/60 md:flex-row">
        <p>{t.footer.copyright}</p>
        <p>{t.footer.tagline}</p>
      </div>
    </footer>
  )
}

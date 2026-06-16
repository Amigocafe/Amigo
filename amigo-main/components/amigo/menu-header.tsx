'use client'

import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { LanguageToggle } from './language-toggle'
import { useLanguage } from '@/lib/i18n/language-context'

export function MenuHeader() {
  const { t } = useLanguage()

  return (
    <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-border bg-background/80 px-4 py-4 backdrop-blur md:px-8">
      <Link
        href="/"
        className="font-heading text-lg uppercase tracking-wide text-foreground transition-colors hover:text-primary"
      >
        {t.hero.brand}
        <span className="text-primary">.</span>
      </Link>

      <nav aria-label="Menu page">
        <ul className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          <li>
            <Link
              href="/"
              className="flex items-center gap-2 border border-primary px-4 py-2 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <span aria-hidden="true" className="rtl:rotate-180">
                &larr;
              </span>
              {t.nav.story}
            </Link>
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
  )
}

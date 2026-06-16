'use client'

import { useLanguage } from '@/lib/i18n/language-context'

export function LanguageToggle() {
  const { t, toggleLocale } = useLanguage()

  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={t.nav.switchLangAria}
      className="grid h-10 min-w-10 place-items-center border border-border px-2 font-mono text-xs uppercase tracking-widest text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {t.nav.switchLang}
    </button>
  )
}

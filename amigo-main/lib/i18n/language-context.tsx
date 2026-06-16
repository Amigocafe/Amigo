'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { translations, type Locale, type Translation } from './translations'

const STORAGE_KEY = 'amigo-locale'

// Persist in a cookie so the server can read it and render the right language
// in the initial HTML (no flash of English, no revert after refresh).
function persistLocale(next: Locale) {
  document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=31536000; samesite=lax`
}

type LanguageContextValue = {
  locale: Locale
  dir: 'ltr' | 'rtl'
  t: Translation
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({
  children,
  initialLocale = 'en',
}: {
  children: React.ReactNode
  initialLocale?: Locale
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  // Skip the very first run: the server already set <html> lang/dir, so there's
  // nothing to sync and no need to refresh ScrollTrigger before any scroll.
  const isFirstRun = useRef(true)

  // Keep <html> lang/dir in sync and recalc pinned scroll positions on change.
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false
      return
    }
    const html = document.documentElement
    html.lang = locale
    html.dir = translations[locale].dir
    // Layout shifts when text length + fonts change, so refresh ScrollTrigger
    // after the swap settles to keep scrubbed/pinned sections accurate.
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(raf)
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    persistLocale(next)
  }, [])

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => {
      const next = prev === 'en' ? 'ar' : 'en'
      persistLocale(next)
      return next
    })
  }, [])

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      dir: translations[locale].dir,
      t: translations[locale],
      setLocale,
      toggleLocale,
    }),
    [locale, setLocale, toggleLocale],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}

/**
 * Splits a string into animation units. English splits per-character so the
 * existing letter-reveal animations work. Arabic is a connected script, so it
 * MUST split per-word — splitting per glyph breaks the letter joining.
 */
export function splitUnits(text: string, locale: Locale): string[] {
  if (locale === 'ar') {
    return text.split(' ')
  }
  return text.split('')
}

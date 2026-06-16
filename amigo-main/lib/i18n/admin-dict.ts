import { useLanguage } from "@/lib/i18n/language-context"
import type { Locale } from "@/lib/i18n/translations"

/**
 * Tiny bilingual helper for the admin panel. Instead of a giant central
 * dictionary, translations live inline next to where they're used:
 *
 *   const tt = useAdminT()
 *   <h1>{tt("لوحة التحكم", "Dashboard")}</h1>
 *
 * For server components, use `makeTt(locale)` with a locale read from the
 * `amigo-locale` cookie.
 */
export type Tt = (ar: string, en: string) => string

export function makeTt(locale: Locale): Tt {
  return (ar, en) => (locale === "ar" ? ar : en)
}

/** Client hook: returns a bilingual translator bound to the current locale. */
export function useAdminT(): Tt {
  const { locale } = useLanguage()
  return makeTt(locale)
}

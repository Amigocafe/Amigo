'use client'

import { createContext, useContext, useMemo } from 'react'
import { useLanguage } from './language-context'
import type {
  CategoryRow,
  MenuItemRow,
  HomepageRow,
  SiteSettingsRow,
} from '@/lib/admin/types'

export type SiteData = {
  categories: CategoryRow[]
  menuItems: MenuItemRow[]
  homepage: HomepageRow | null
  site: SiteSettingsRow | null
}

const SiteDataContext = createContext<SiteData | null>(null)

export function SiteDataProvider({
  data,
  children,
}: {
  data: SiteData | null
  children: React.ReactNode
}) {
  return (
    <SiteDataContext.Provider value={data}>{children}</SiteDataContext.Provider>
  )
}

function useSiteData() {
  return useContext(SiteDataContext)
}

// numeric (often returned as a string by supabase-js) -> clean display string
function formatPrice(value: number | string): string {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value
  if (Number.isNaN(n)) return String(value)
  return n.toString()
}

export type MenuGroup = {
  category: string
  caption: string
  items: { name: string; desc: string; tags: string[]; price: string; image: string }[]
}

/**
 * Live menu groups built from the database, localized to the active locale.
 * Hides inactive categories and unavailable items. Returns null when there is
 * no DB data, so callers fall back to the bundled static menu.
 */
export function useMenuGroups(): MenuGroup[] | null {
  const data = useSiteData()
  const { locale } = useLanguage()

  return useMemo(() => {
    if (!data || data.categories.length === 0) return null
    const ar = locale === 'ar'

    const groups = data.categories
      .filter((c) => c.active)
      .map<MenuGroup>((c) => ({
        category: ar ? c.name_ar : c.name_en || c.name_ar,
        caption: ar ? c.caption_ar : c.caption_en || c.caption_ar,
        items: data.menuItems
          .filter((i) => i.category_id === c.id && i.available)
          .map((i) => ({
            name: ar ? i.name_ar : i.name_en || i.name_ar,
            desc: ar ? i.desc_ar : i.desc_en || i.desc_ar,
            tags: (ar ? i.tags_ar : i.tags_en) ?? [],
            price: formatPrice(i.price),
            image: i.image || '/placeholder.svg',
          })),
      }))
      .filter((g) => g.items.length > 0)

    return groups.length > 0 ? groups : null
  }, [data, locale])
}

export type ContactLink = {
  key: 'facebook' | 'instagram' | 'tiktok' | 'whatsapp'
  label: string
  href: string
}

/**
 * Contact email + social profile links pulled from site settings.
 * Empty fields are omitted, so the footer only shows what's configured.
 */
export function useContactLinks(): {
  email: string
  whatsapp: string
  mapsUrl: string
  socials: ContactLink[]
} | null {
  const data = useSiteData()
  return useMemo(() => {
    const s = data?.site
    if (!s) return null

    const waDigits = (s.whatsapp || '').replace(/[^\d]/g, '')
    const socials: ContactLink[] = []
    if (s.facebook_url) socials.push({ key: 'facebook', label: 'Facebook', href: s.facebook_url })
    if (s.instagram_url) socials.push({ key: 'instagram', label: 'Instagram', href: s.instagram_url })
    if (s.tiktok_url) socials.push({ key: 'tiktok', label: 'TikTok', href: s.tiktok_url })
    if (waDigits) {
      socials.push({ key: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${waDigits}` })
    }

    return {
      email: s.contact_email || '',
      whatsapp: waDigits ? `https://wa.me/${waDigits}` : '',
      mapsUrl: s.maps_url || '',
      socials,
    }
  }, [data])
}

/**
 * Map pin coordinates + directions URL from site settings.
 * Falls back to the real café location when settings are unavailable.
 */
export function useMapLocation(): {
  center: [number, number]
  directionsUrl: string
} {
  const data = useSiteData()
  return useMemo(() => {
    const s = data?.site
    const lat = typeof s?.latitude === 'number' ? s.latitude : 30.2921145
    const lng = typeof s?.longitude === 'number' ? s.longitude : 31.743953
    return {
      // maplibre expects [longitude, latitude]
      center: [lng, lat],
      directionsUrl: s?.maps_url || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    }
  }, [data])
}

export function useHeroContent(): {
  titleTop: string
  titleBottom: string
  tagline: string
  image: string
} | null {
  const data = useSiteData()
  const { locale } = useLanguage()

  return useMemo(() => {
    const hero = data?.homepage?.hero
    if (!hero) return null
    const ar = locale === 'ar'
    return {
      titleTop: ar ? hero.titleTop : hero.titleTopEn || hero.titleTop,
      titleBottom: ar ? hero.titleBottom : hero.titleBottomEn || hero.titleBottom,
      tagline: ar ? hero.tagline : hero.taglineEn || hero.tagline,
      image: hero.image || '/images/hero-pour.webp',
    }
  }, [data, locale])
}

export function useVibeManifesto(): string | null {
  const data = useSiteData()
  const { locale } = useLanguage()

  return useMemo(() => {
    const vibe = data?.homepage?.vibe
    if (!vibe) return null
    return locale === 'ar' ? vibe.manifesto : vibe.manifestoEn || vibe.manifesto
  }, [data, locale])
}

export function useLocationContent(): {
  title: string
  address: string
  hours: string
} | null {
  const data = useSiteData()
  const { locale } = useLanguage()

  return useMemo(() => {
    const loc = data?.homepage?.location
    if (!loc) return null
    const ar = locale === 'ar'
    return {
      title: ar ? loc.title : loc.titleEn || loc.title,
      address: ar ? loc.address : loc.addressEn || loc.address,
      hours: ar ? loc.hours : loc.hoursEn || loc.hours,
    }
  }, [data, locale])
}

/** The 4 editable gallery images, or null to keep the static collage. */
export function useGalleryImages(): string[] | null {
  const data = useSiteData()
  const gallery = data?.homepage?.gallery
  if (!gallery || gallery.length === 0) return null
  return gallery
}

/** Live marquee items, or null to fall back to static translations. */
export function useMarqueeItems(): { ar: string[]; en: string[] } | null {
  const data = useSiteData()
  const marquee = data?.homepage?.marquee
  if (!marquee) return null
  return { ar: marquee.items_ar, en: marquee.items_en }
}

/** Live journey chapters, or null to fall back to static translations. */
export function useJourneyChapters(): { title: string; body: string }[] | null {
  const data = useSiteData()
  const { locale } = useLanguage()
  return useMemo(() => {
    const chapters = data?.homepage?.journey?.chapters
    if (!chapters || chapters.length === 0) return null
    const ar = locale === 'ar'
    return chapters.map((c) => ({
      title: ar ? c.title_ar : c.title_en || c.title_ar,
      body: ar ? c.body_ar : c.body_en || c.body_ar,
    }))
  }, [data, locale])
}

/** Live PlayStation section content, or null to fall back to static translations. */
export function usePlaystationContent(): {
  titleTop: string
  titleBottom: string
  caption: string
  rates: { label: string; price: string }[]
} | null {
  const data = useSiteData()
  const { locale } = useLanguage()
  return useMemo(() => {
    const ps = data?.homepage?.playstation
    if (!ps) return null
    const ar = locale === 'ar'
    return {
      titleTop: ar ? ps.titleTop_ar : ps.titleTop_en || ps.titleTop_ar,
      titleBottom: ar ? ps.titleBottom_ar : ps.titleBottom_en || ps.titleBottom_ar,
      caption: ar ? ps.caption_ar : ps.caption_en || ps.caption_ar,
      rates: ps.rates.map((r) => ({
        label: ar ? r.label_ar : r.label_en || r.label_ar,
        price: r.price,
      })),
    }
  }, [data, locale])
}

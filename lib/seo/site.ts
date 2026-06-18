import type { SeoRow } from "@/lib/admin/types"

/**
 * Resolves the canonical origin of the site. Priority:
 *   1. NEXT_PUBLIC_SITE_URL env (explicit override)
 *   2. The origin of the SEO canonical configured in the admin panel
 *   3. The Vercel production/preview URL
 *   4. A sensible production fallback
 */
export function resolveSiteUrl(seo?: SeoRow | null): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv) return stripTrailingSlash(fromEnv)

  if (seo?.canonical) {
    try {
      return stripTrailingSlash(new URL(seo.canonical).origin)
    } catch {
      // canonical wasn't a full URL — ignore and continue
    }
  }

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
  if (vercel) return `https://${stripTrailingSlash(vercel)}`

  return "https://amigocafé.com"
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "")
}

/** Joins a path onto the resolved site origin, producing an absolute URL. */
export function absoluteUrl(path: string, base: string): string {
  if (!path) return base
  if (/^https?:\/\//i.test(path)) return path
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`
}

/**
 * Physical + contact details for the cafe. These power the LocalBusiness
 * structured data. Approximate town-level geo for Bilbeis, Sharqia, Egypt —
 * paired with the precise Google Maps link via `hasMap`.
 */
export const BUSINESS = {
  legalName: "Amigo Cafe",
  type: "CafeOrCoffeeShop" as const,
  telephone: "+20 100 123 4567",
  priceRange: "$$",
  currency: "EGP",
  email: "hola@amigocafe.com",
  mapUrl: "https://maps.app.goo.gl/hhjymBZ6r3MzUa6v7",
  address: {
    streetAddress_en: "Qasr El Saadawy, New Branch",
    streetAddress_ar: "قصر السعداوي، الفرع الجديد",
    locality_en: "Bilbeis",
    locality_ar: "بلبيس",
    region_en: "Sharqia",
    region_ar: "الشرقية",
    country: "EG",
  },
  geo: {
    latitude: 30.4196,
    longitude: 31.5645,
  },
  /** Daily 08:00 – midnight. */
  openingHours: {
    days: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "08:00",
    closes: "23:59",
  },
} as const

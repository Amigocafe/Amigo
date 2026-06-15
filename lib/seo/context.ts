import { cookies } from "next/headers"
import {
  getSeo,
  getSiteSettings,
  getHomepage,
  getCategories,
  getMenuItems,
  getTrackedLinks,
} from "@/lib/admin/queries"
import type { Locale } from "@/lib/i18n/translations"
import { resolveSiteUrl } from "@/lib/seo/site"

const SOCIAL_PLATFORMS = new Set([
  "facebook",
  "instagram",
  "tiktok",
  "x",
  "snapchat",
])

/**
 * Gathers everything the structured-data builders need, resolved on the server
 * for the active locale. Each query fails soft, so SEO degrades gracefully if
 * the database is unreachable.
 */
export async function getSeoContext() {
  const cookieStore = await cookies()
  const stored = cookieStore.get("amigo-locale")?.value
  const locale: Locale = stored === "ar" || stored === "en" ? (stored as Locale) : "ar"

  const [seo, site, homepage, categories, menuItems, links] = await Promise.all([
    getSeo(),
    getSiteSettings(),
    getHomepage(),
    getCategories(),
    getMenuItems(),
    getTrackedLinks(),
  ])

  // Real social profile URLs power schema `sameAs`. We combine the tracked
  // links with the dedicated social fields from site settings, then dedupe.
  const fromLinks = links
    .filter((l) => l.active && SOCIAL_PLATFORMS.has(l.platform) && /^https?:\/\//i.test(l.destination))
    .map((l) => l.destination)
  const fromSettings = [site?.facebook_url, site?.instagram_url, site?.tiktok_url].filter(
    (u): u is string => !!u && /^https?:\/\//i.test(u),
  )
  const sameAs = Array.from(new Set([...fromSettings, ...fromLinks]))

  return {
    locale,
    baseUrl: resolveSiteUrl(seo),
    seo,
    site,
    homepage,
    categories,
    menuItems,
    sameAs,
  }
}

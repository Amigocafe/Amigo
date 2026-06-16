import type {
  CategoryRow,
  MenuItemRow,
  HomepageRow,
  SeoRow,
  SiteSettingsRow,
} from "@/lib/admin/types"
import type { Locale } from "@/lib/i18n/translations"
import { BUSINESS, absoluteUrl } from "@/lib/seo/site"

type SchemaInput = {
  locale: Locale
  baseUrl: string
  seo?: SeoRow | null
  site?: SiteSettingsRow | null
  homepage?: HomepageRow | null
  categories?: CategoryRow[]
  menuItems?: MenuItemRow[]
  /** Social / external profile URLs for `sameAs`. */
  sameAs?: string[]
}

const ORG_ID = "#organization"
const WEBSITE_ID = "#website"
const BUSINESS_ID = "#business"

function brandName(input: SchemaInput): string {
  const ar = input.locale === "ar"
  return (
    input.site?.brand_name ||
    (ar ? "أميجو كافيه" : "Amigo Cafe")
  )
}

function siteTitle(input: SchemaInput): string {
  const ar = input.locale === "ar"
  const seo = input.seo
  return (
    (seo ? (ar ? seo.title_ar : seo.title_en) || seo.title_en || seo.title_ar : "") ||
    brandName(input)
  )
}

function siteDescription(input: SchemaInput): string {
  const ar = input.locale === "ar"
  const seo = input.seo
  return (
    (seo
      ? (ar ? seo.description_ar : seo.description_en) ||
        seo.description_en ||
        seo.description_ar
      : "") || ""
  )
}

function logoUrl(input: SchemaInput): string {
  const logo = input.site?.logo || "/icon.svg"
  return absoluteUrl(logo, input.baseUrl)
}

function ogImage(input: SchemaInput): string {
  const img = input.seo?.og_image || input.homepage?.hero?.image || "/images/interior.webp"
  return absoluteUrl(img, input.baseUrl)
}

/** Organization — the brand entity behind the site. */
export function organizationSchema(input: SchemaInput) {
  return {
    "@type": "Organization",
    "@id": `${input.baseUrl}/${ORG_ID}`,
    name: brandName(input),
    url: input.baseUrl,
    logo: {
      "@type": "ImageObject",
      url: logoUrl(input),
    },
    image: ogImage(input),
    ...(input.sameAs && input.sameAs.length > 0 ? { sameAs: input.sameAs } : {}),
  }
}

/** WebSite — enables sitelinks + names the publisher. */
export function websiteSchema(input: SchemaInput) {
  return {
    "@type": "WebSite",
    "@id": `${input.baseUrl}/${WEBSITE_ID}`,
    url: input.baseUrl,
    name: siteTitle(input),
    description: siteDescription(input),
    inLanguage: input.locale === "ar" ? "ar" : "en",
    publisher: { "@id": `${input.baseUrl}/${ORG_ID}` },
  }
}

/** LocalBusiness (CafeOrCoffeeShop) — the physical cafe with hours + geo. */
export function localBusinessSchema(input: SchemaInput) {
  const ar = input.locale === "ar"
  const a = BUSINESS.address
  const loc = input.homepage?.location
  const s = input.site
  const waDigits = (s?.whatsapp || "").replace(/[^\d+]/g, "")

  return {
    "@type": BUSINESS.type,
    "@id": `${input.baseUrl}/${BUSINESS_ID}`,
    name: brandName(input),
    description: siteDescription(input),
    url: input.baseUrl,
    telephone: waDigits || BUSINESS.telephone,
    email: s?.contact_email || BUSINESS.email,
    image: ogImage(input),
    logo: logoUrl(input),
    priceRange: BUSINESS.priceRange,
    currenciesAccepted: BUSINESS.currency,
    servesCuisine: ar ? ["قهوة", "مشروبات", "حلويات"] : ["Coffee", "Beverages", "Pastries"],
    address: {
      "@type": "PostalAddress",
      streetAddress:
        loc?.address ||
        (ar
          ? `${a.streetAddress_ar}، ${a.locality_ar}`
          : `${a.streetAddress_en}, ${a.locality_en}`),
      addressLocality: ar ? a.locality_ar : a.locality_en,
      addressRegion: ar ? a.region_ar : a.region_en,
      addressCountry: a.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: typeof s?.latitude === "number" ? s.latitude : BUSINESS.geo.latitude,
      longitude: typeof s?.longitude === "number" ? s.longitude : BUSINESS.geo.longitude,
    },
    hasMap: s?.maps_url || BUSINESS.mapUrl,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: BUSINESS.openingHours.days,
        opens: BUSINESS.openingHours.opens,
        closes: BUSINESS.openingHours.closes,
      },
    ],
    hasMenu: `${input.baseUrl}/menu`,
    parentOrganization: { "@id": `${input.baseUrl}/${ORG_ID}` },
    ...(input.sameAs && input.sameAs.length > 0 ? { sameAs: input.sameAs } : {}),
  }
}

/** Builds localized menu sections + items for Menu structured data. */
export function menuSchema(input: SchemaInput) {
  const ar = input.locale === "ar"
  const categories = (input.categories ?? []).filter((c) => c.active)
  const items = input.menuItems ?? []

  const sections = categories
    .map((c) => {
      const sectionItems = items
        .filter((i) => i.category_id === c.id && i.available)
        .map((i) => {
          const name = ar ? i.name_ar : i.name_en || i.name_ar
          const desc = ar ? i.desc_ar : i.desc_en || i.desc_ar
          const price = typeof i.price === "string" ? Number.parseFloat(i.price) : i.price
          return {
            "@type": "MenuItem",
            name,
            ...(desc ? { description: desc } : {}),
            ...(i.image ? { image: absoluteUrl(i.image, input.baseUrl) } : {}),
            offers: {
              "@type": "Offer",
              price: Number.isNaN(price) ? String(i.price) : price,
              priceCurrency: BUSINESS.currency,
              availability: "https://schema.org/InStock",
            },
          }
        })
      return {
        "@type": "MenuSection",
        name: ar ? c.name_ar : c.name_en || c.name_ar,
        ...(sectionItems.length > 0 ? { hasMenuItem: sectionItems } : {}),
      }
    })
    .filter((s) => "hasMenuItem" in s)

  return {
    "@type": "Menu",
    "@id": `${input.baseUrl}/menu#menu`,
    name: ar ? "منيو أميجو كافيه" : "Amigo Cafe Menu",
    inLanguage: ar ? "ar" : "en",
    ...(sections.length > 0 ? { hasMenuSection: sections } : {}),
    isPartOf: { "@id": `${input.baseUrl}/${BUSINESS_ID}` },
  }
}

/** BreadcrumbList for a page, given ordered crumbs. */
export function breadcrumbSchema(
  baseUrl: string,
  crumbs: { name: string; path: string }[],
) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path, baseUrl),
    })),
  }
}

/** Wraps one or more schema nodes into a single @graph document. */
export function buildGraph(...nodes: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes,
  }
}

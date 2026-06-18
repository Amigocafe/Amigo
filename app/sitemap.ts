import type { MetadataRoute } from "next"
import { getSeo, getContentTimestamps } from "@/lib/admin/queries"
import { resolveSiteUrl } from "@/lib/seo/site"

// Always render fresh so <lastmod> reflects the current database state.
// This is the signal Google uses to recrawl pages when content changes.
export const revalidate = 0

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [seo, ts] = await Promise.all([getSeo(), getContentTimestamps()])
  const baseUrl = resolveSiteUrl(seo)

  return [
    {
      url: baseUrl,
      lastModified: ts.home,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          ar: baseUrl,
          en: baseUrl,
        },
      },
    },
    {
      url: `${baseUrl}/menu`,
      lastModified: ts.menu,
      changeFrequency: "daily",
      priority: 0.9,
      alternates: {
        languages: {
          ar: `${baseUrl}/menu`,
          en: `${baseUrl}/menu`,
        },
      },
    },
  ]
}

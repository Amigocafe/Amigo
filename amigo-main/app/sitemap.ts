import type { MetadataRoute } from "next"
import { getSeo, getHomepage } from "@/lib/admin/queries"
import { resolveSiteUrl } from "@/lib/seo/site"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [seo, homepage] = await Promise.all([getSeo(), getHomepage()])
  const baseUrl = resolveSiteUrl(seo)
  const lastModified = homepage?.updated_at ? new Date(homepage.updated_at) : new Date()

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/menu`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]
}

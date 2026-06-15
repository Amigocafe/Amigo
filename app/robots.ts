import type { MetadataRoute } from "next"
import { getSeo } from "@/lib/admin/queries"
import { resolveSiteUrl } from "@/lib/seo/site"

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeo()
  const baseUrl = resolveSiteUrl(seo)
  const indexable = !seo || seo.indexable

  // When the site is flagged non-indexable in the admin panel, block everything.
  if (!indexable) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    }
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/auth", "/api", "/go"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

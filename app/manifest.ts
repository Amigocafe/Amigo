import type { MetadataRoute } from "next"
import { getSiteSettings } from "@/lib/admin/queries"

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await getSiteSettings()
  const name = site?.brand_name || "أميجو كافيه"

  return {
    name,
    short_name: "Amigo",
    description: "Amigo Cafe — specialty coffee, gaming, and good vibes in Bilbeis.",
    start_url: "/",
    display: "standalone",
    background_color: "#241a12",
    theme_color: site?.primary_color || "#b07a3c",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  }
}

import { getSeo } from "@/lib/admin/queries"
import { SeoManager } from "./seo-manager"

export const dynamic = "force-dynamic"

export default async function SeoPage() {
  const seo = await getSeo()
  return <SeoManager seo={seo} />
}

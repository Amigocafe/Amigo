import { getHomepage, getSiteSettings } from "@/lib/admin/queries"
import { ContentSettingsManager } from "./content-settings-manager"

export const dynamic = "force-dynamic"

export default async function ContentSettingsPage() {
  const [homepage, settings] = await Promise.all([getHomepage(), getSiteSettings()])
  return <ContentSettingsManager homepage={homepage} settings={settings} />
}

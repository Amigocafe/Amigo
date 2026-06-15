import { getQrAnalytics, getTrackedLinks } from "@/lib/admin/queries"
import { QrManager } from "./qr-manager"

export const dynamic = "force-dynamic"

export default async function QrPage() {
  const [analytics, links] = await Promise.all([getQrAnalytics(), getTrackedLinks()])
  return <QrManager analytics={analytics} links={links} />
}

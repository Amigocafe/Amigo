import { getNotifications, getSiteSettings } from "@/lib/admin/queries"
import { NotificationsClient } from "./notifications-client"

export default async function NotificationsPage() {
  const [notifications, settings] = await Promise.all([
    getNotifications(),
    getSiteSettings(),
  ])

  const prefs = (settings as any)?.notification_prefs ?? {
    orders: true,
    reviews: true,
    alerts: true,
    system: false,
  }

  return <NotificationsClient initialNotifications={notifications} initialPrefs={prefs} />
}

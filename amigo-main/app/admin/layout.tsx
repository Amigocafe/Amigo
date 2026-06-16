import type { ReactNode } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { getProfile, getAdminEmail, getNotifications, getNewFeedbackCount } from "@/lib/admin/queries"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const [profile, email, notifications, feedbackCount] = await Promise.all([
    getProfile(),
    getAdminEmail(),
    getNotifications(),
    getNewFeedbackCount(),
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <AdminShell
      profileName={profile?.name ?? ""}
      profileAvatar={profile?.avatar ?? ""}
      profileEmail={email}
      unreadCount={unreadCount}
      feedbackCount={feedbackCount}
    >
      {children}
    </AdminShell>
  )
}

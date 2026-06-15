import { getProfile, getAdminEmail } from "@/lib/admin/queries"
import { ProfileClient } from "./profile-client"

export default async function ProfilePage() {
  const [profile, email] = await Promise.all([getProfile(), getAdminEmail()])

  return (
    <ProfileClient
      initialProfile={{
        name:   profile?.name   ?? "",
        role:   profile?.role   ?? "مدير عام",
        phone:  profile?.phone  ?? "",
        avatar: profile?.avatar ?? "",
      }}
      email={email}
      joinedAt={profile?.created_at ?? new Date().toISOString()}
    />
  )
}

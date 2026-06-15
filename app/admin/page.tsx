import { getDashboard } from "@/lib/admin/queries"
import type { DashboardData } from "@/lib/admin/types"
import { DashboardClient } from "./dashboard-client"
import { EmptyDashboard } from "./dashboard-empty"

export default async function DashboardPage() {
  const data: DashboardData | null = await getDashboard()
  if (!data) return <EmptyDashboard />
  return <DashboardClient data={data} />
}

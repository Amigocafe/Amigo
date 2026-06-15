"use client"

import { useAdminT } from "@/lib/i18n/admin-dict"

export function EmptyDashboard() {
  const tt = useAdminT()
  return (
    <div className="rounded-lg border border-dashed border-border py-20 text-center text-muted-foreground">
      {tt(
        "لا توجد بيانات كافية بعد — ستظهر التحليلات بعد أول زيارات حقيقية.",
        "Not enough data yet — analytics will appear after your first real visits.",
      )}
    </div>
  )
}

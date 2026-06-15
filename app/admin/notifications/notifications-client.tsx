"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ShoppingBag, Star, AlertTriangle, Settings2, CheckCheck, Bell, Trash2, Loader2 } from "lucide-react"
import { Card, CardHeader, PageHeader, Badge, Toggle } from "@/components/admin/ui"
import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  saveNotificationPrefs,
} from "@/lib/admin/actions"
import type { NotificationRow, NotificationTone, NotificationPrefs } from "@/lib/admin/types"
import { cn } from "@/lib/utils"

const TONE_META: Record<NotificationTone, { icon: typeof ShoppingBag; cls: string }> = {
  order:  { icon: ShoppingBag,    cls: "bg-primary/12 text-primary" },
  review: { icon: Star,           cls: "bg-[oklch(0.7_0.15_70_/_18%)] text-[oklch(0.55_0.14_60)] dark:text-[oklch(0.82_0.14_75)]" },
  alert:  { icon: AlertTriangle,  cls: "bg-destructive/12 text-destructive" },
  system: { icon: Settings2,      cls: "bg-[oklch(0.6_0.13_220_/_15%)] text-[oklch(0.5_0.13_220)] dark:text-[oklch(0.75_0.12_220)]" },
}

const FILTERS = [
  { id: "all",    label: "الكل" },
  { id: "unread", label: "غير مقروء" },
  { id: "order",  label: "طلبات" },
  { id: "review", label: "تقييمات" },
  { id: "alert",  label: "تنبيهات" },
] as const

type FilterId = (typeof FILTERS)[number]["id"]

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "الآن"
  if (m < 60) return `منذ ${m} دقيقة`
  const h = Math.floor(m / 60)
  if (h < 24) return `منذ ${h} ساعة`
  return `منذ ${Math.floor(h / 24)} يوم`
}

export function NotificationsClient({
  initialNotifications,
  initialPrefs,
}: {
  initialNotifications: NotificationRow[]
  initialPrefs: NotificationPrefs
}) {
  const router = useRouter()
  const [items, setItems] = useState<NotificationRow[]>(initialNotifications)
  const [filter, setFilter] = useState<FilterId>("all")
  const [prefs, setPrefs] = useState<NotificationPrefs>(initialPrefs)
  const [isPending, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [prefsSaving, setPrefsSaving] = useState(false)

  const unread = items.filter((n) => !n.read).length

  const filtered = useMemo(() => {
    return items.filter((n) => {
      if (filter === "all") return true
      if (filter === "unread") return !n.read
      return n.tone === filter
    })
  }, [items, filter])

  function optimisticMarkRead(id: string, read: boolean) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read } : n)))
    setPendingId(id)
    startTransition(async () => {
      await markNotificationRead(id, read)
      router.refresh()
      setPendingId(null)
    })
  }

  function optimisticDelete(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id))
    startTransition(async () => {
      await deleteNotification(id)
      router.refresh()
    })
  }

  function handleMarkAll() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    startTransition(async () => {
      await markAllNotificationsRead()
      router.refresh()
    })
  }

  function handlePrefsChange(key: keyof NotificationPrefs, value: boolean) {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    setPrefsSaving(true)
    startTransition(async () => {
      await saveNotificationPrefs(next)
      setPrefsSaving(false)
    })
  }

  return (
    <>
      <PageHeader
        title="الإشعارات"
        description="كل اللي بيحصل في أميجو — طلبات، تقييمات، وتنبيهات النظام في مكان واحد."
        action={
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={unread === 0 || isPending}
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            <CheckCheck className="size-4" />
            تعليم الكل كمقروء
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  filter === f.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
                {f.id === "unread" && unread > 0 ? (
                  <span className="rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                    {unread}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <Card>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
                <Bell className="size-8 opacity-40" />
                لا توجد إشعارات هنا.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((n) => {
                  const meta = TONE_META[n.tone]
                  const Icon = meta.icon
                  return (
                    <li
                      key={n.id}
                      className={cn(
                        "flex gap-3 px-5 py-4 transition-colors",
                        !n.read && "bg-primary/[0.04]",
                      )}
                    >
                      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", meta.cls)}>
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{n.title}</p>
                          {!n.read ? <span className="size-2 rounded-full bg-primary" /> : null}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{n.body}</p>
                        <p className="mt-1 text-xs text-muted-foreground/70">{relativeTime(n.created_at)}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2 self-start">
                        {pendingId === n.id && isPending ? (
                          <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => optimisticMarkRead(n.id, !n.read)}
                            className="text-xs font-medium text-primary hover:underline"
                          >
                            {n.read ? "تعليم كغير مقروء" : "تعليم كمقروء"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => optimisticDelete(n.id)}
                          aria-label="حذف"
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader
            title="تفضيلات الإشعارات"
            subtitle="اختر ما تريد أن يصلك"
            action={prefsSaving ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
          />
          <ul className="flex flex-col gap-1 p-3">
            {(
              [
                { key: "orders"  as const, label: "الطلبات الجديدة",    icon: ShoppingBag },
                { key: "reviews" as const, label: "التقييمات",           icon: Star },
                { key: "alerts"  as const, label: "تنبيهات المخزون",    icon: AlertTriangle },
                { key: "system"  as const, label: "تحديثات النظام",      icon: Settings2 },
              ] as { key: keyof NotificationPrefs; label: string; icon: typeof ShoppingBag }[]
            ).map((row) => {
              const Icon = row.icon
              return (
                <li key={row.key} className="flex items-center justify-between rounded-md px-2 py-2.5">
                  <span className="flex items-center gap-2.5 text-sm text-foreground">
                    <Icon className="size-4 text-muted-foreground" />
                    {row.label}
                  </span>
                  <Toggle
                    checked={prefs[row.key]}
                    onChange={(v) => handlePrefsChange(row.key, v)}
                    label={row.label}
                  />
                </li>
              )
            })}
          </ul>
          <div className="border-t border-border p-5">
            <p className="mb-1 text-sm font-medium text-foreground">قناة الإشعارات</p>
            <p className="text-xs text-muted-foreground">حالياً عبر اللوحة فقط.</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone="success">اللوحة</Badge>
              <Badge tone="neutral">البريد (قريباً)</Badge>
              <Badge tone="neutral">واتساب (قريباً)</Badge>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}

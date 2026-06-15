"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  MessageSquareWarning,
  Lightbulb,
  Phone,
  Mail,
  AtSign,
  Trash2,
  Loader2,
  Inbox,
  Copy,
  Check,
} from "lucide-react"
import { Card, PageHeader, Badge } from "@/components/admin/ui"
import { setFeedbackStatus, deleteFeedback } from "@/lib/admin/actions"
import type {
  FeedbackRow,
  FeedbackStatus,
  FeedbackContactMethod,
} from "@/lib/admin/types"
import { cn } from "@/lib/utils"

const STATUS_META: Record<
  FeedbackStatus,
  { label: string; tone: "neutral" | "warning" | "success" }
> = {
  new: { label: "جديد", tone: "warning" },
  in_progress: { label: "قيد المعالجة", tone: "neutral" },
  resolved: { label: "تم الحل", tone: "success" },
}

const STATUS_ORDER: FeedbackStatus[] = ["new", "in_progress", "resolved"]

const CONTACT_META: Record<
  FeedbackContactMethod,
  { label: string; icon: typeof Phone | null }
> = {
  none: { label: "بدون تواصل", icon: null },
  phone: { label: "تليفون", icon: Phone },
  whatsapp: { label: "واتساب", icon: Phone },
  email: { label: "إيميل", icon: Mail },
  instagram: { label: "إنستجرام", icon: AtSign },
}

const FILTERS = [
  { id: "all", label: "الكل" },
  { id: "new", label: "جديد" },
  { id: "complaint", label: "شكاوى" },
  { id: "suggestion", label: "اقتراحات" },
  { id: "resolved", label: "تم الحل" },
] as const

type FilterId = (typeof FILTERS)[number]["id"]

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return "الآن"
  if (m < 60) return `منذ ${m} دقيقة`
  const h = Math.floor(m / 60)
  if (h < 24) return `منذ ${h} ساعة`
  const d = Math.floor(h / 24)
  if (d < 30) return `منذ ${d} يوم`
  return new Date(iso).toLocaleDateString("ar-EG")
}

export function FeedbackClient({ items: initial }: { items: FeedbackRow[] }) {
  const router = useRouter()
  const [items, setItems] = useState<FeedbackRow[]>(initial)
  const [filter, setFilter] = useState<FilterId>("all")
  const [, startTransition] = useTransition()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const counts = useMemo(() => {
    return {
      total: items.length,
      new: items.filter((i) => i.status === "new").length,
      complaint: items.filter((i) => i.type === "complaint").length,
      suggestion: items.filter((i) => i.type === "suggestion").length,
      resolved: items.filter((i) => i.status === "resolved").length,
    }
  }, [items])

  const filtered = useMemo(() => {
    switch (filter) {
      case "new":
        return items.filter((i) => i.status === "new")
      case "complaint":
        return items.filter((i) => i.type === "complaint")
      case "suggestion":
        return items.filter((i) => i.type === "suggestion")
      case "resolved":
        return items.filter((i) => i.status === "resolved")
      default:
        return items
    }
  }, [items, filter])

  function changeStatus(id: string, status: FeedbackStatus) {
    // Optimistic update.
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
    setPendingId(id)
    startTransition(async () => {
      await setFeedbackStatus(id, status)
      setPendingId(null)
      router.refresh()
    })
  }

  function remove(id: string) {
    if (!window.confirm("متأكد إنك عايز تمسح الرسالة دي؟")) return
    setItems((prev) => prev.filter((i) => i.id !== id))
    setPendingId(id)
    startTransition(async () => {
      await deleteFeedback(id)
      setPendingId(null)
      router.refresh()
    })
  }

  async function copyContact(item: FeedbackRow) {
    if (!item.contact_value) return
    try {
      await navigator.clipboard.writeText(item.contact_value)
      setCopiedId(item.id)
      setTimeout(() => setCopiedId((c) => (c === item.id ? null : c)), 1500)
    } catch {
      // ignore
    }
  }

  return (
    <div>
      <PageHeader
        title="الشكاوى والمقترحات"
        description="كل الرسائل اللي بعتها زوار الموقع من خلال زر الشكاوى والمقترحات."
      />

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="إجمالي الرسائل" value={counts.total} />
        <StatCard label="جديدة" value={counts.new} accent />
        <StatCard label="شكاوى" value={counts.complaint} />
        <StatCard label="اقتراحات" value={counts.suggestion} />
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.id
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="size-6" />
          </span>
          <p className="font-heading text-lg text-foreground">مفيش رسائل</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            لسه مفيش شكاوى أو اقتراحات في الفئة دي.
          </p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => {
            const isComplaint = item.type === "complaint"
            const TypeIcon = isComplaint ? MessageSquareWarning : Lightbulb
            const contact = CONTACT_META[item.contact_method]
            const ContactIcon = contact.icon
            const busy = pendingId === item.id
            return (
              <Card key={item.id} className="overflow-hidden">
                <div className="flex flex-col gap-4 p-5">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-lg",
                          isComplaint
                            ? "bg-destructive/12 text-destructive"
                            : "bg-[oklch(0.7_0.15_70_/_18%)] text-[oklch(0.55_0.14_60)] dark:text-[oklch(0.82_0.14_75)]",
                        )}
                      >
                        <TypeIcon className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-heading text-base text-foreground">
                            {isComplaint ? "شكوى" : "اقتراح"}
                          </span>
                          <Badge tone={STATUS_META[item.status].tone}>
                            {STATUS_META[item.status].label}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {item.name ? item.name : "زائر بدون اسم"} · {relativeTime(item.created_at)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.id)}
                      disabled={busy}
                      aria-label="حذف"
                      className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/12 hover:text-destructive disabled:opacity-50"
                    >
                      {busy ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </div>

                  {/* Message */}
                  <p className="whitespace-pre-wrap rounded-lg bg-muted/50 p-3.5 text-sm leading-relaxed text-foreground">
                    {item.message}
                  </p>

                  {/* Contact + status controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {item.contact_method === "none" || !item.contact_value ? (
                      <span className="text-xs text-muted-foreground">
                        الزائر مسابش وسيلة تواصل
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => copyContact(item)}
                        className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
                        title="نسخ بيانات التواصل"
                      >
                        {ContactIcon ? <ContactIcon className="size-4 text-muted-foreground" /> : null}
                        <span className="font-mono">{item.contact_value}</span>
                        <span className="text-muted-foreground">({contact.label})</span>
                        {copiedId === item.id ? (
                          <Check className="size-3.5 text-[oklch(0.6_0.14_150)]" />
                        ) : (
                          <Copy className="size-3.5 text-muted-foreground" />
                        )}
                      </button>
                    )}

                    {/* Status segmented control */}
                    <div className="inline-flex rounded-md border border-border p-0.5">
                      {STATUS_ORDER.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => changeStatus(item.id, s)}
                          disabled={busy}
                          className={cn(
                            "rounded px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50",
                            item.status === s
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted",
                          )}
                        >
                          {STATUS_META[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <Card className="px-4 py-3.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-heading text-2xl",
          accent && value > 0 ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </p>
    </Card>
  )
}

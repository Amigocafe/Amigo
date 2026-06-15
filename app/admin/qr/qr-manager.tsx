"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import {
  QrCode,
  LinkIcon,
  BarChart3,
  Download,
  Plus,
  Trash2,
  Pencil,
  Copy,
  Check,
  Star,
  Clock,
  CalendarDays,
  Smartphone,
  ExternalLink,
} from "lucide-react"
import {
  Card,
  CardHeader,
  PageHeader,
  Badge,
  Toggle,
  Field,
  inputClass,
} from "@/components/admin/ui"
import { AreaChart, BarChart, DonutChart, MiniBars } from "@/components/admin/charts"
import { QrCanvas, type QrStyle } from "./qr-canvas"
import {
  saveTrackedLink,
  deleteTrackedLink,
  toggleTrackedLink,
  setQrLink,
  type TrackedLinkInput,
} from "@/lib/admin/actions"
import type { QrAnalytics, TrackedLinkRow, LinkPlatform } from "@/lib/admin/types"
import { cn } from "@/lib/utils"

const PLATFORMS: { value: LinkPlatform; label: string }[] = [
  { value: "qr", label: "كود QR" },
  { value: "facebook", label: "فيسبوك" },
  { value: "instagram", label: "إنستجرام" },
  { value: "whatsapp", label: "واتساب" },
  { value: "tiktok", label: "تيك توك" },
  { value: "x", label: "إكس (تويتر)" },
  { value: "snapchat", label: "سناب شات" },
  { value: "google", label: "جوجل" },
  { value: "other", label: "أخرى" },
]

const PLATFORM_LABEL: Record<LinkPlatform, string> = Object.fromEntries(
  PLATFORMS.map((p) => [p.value, p.label]),
) as Record<LinkPlatform, string>

type Tab = "qr" | "links" | "stats"

export function QrManager({
  analytics,
  links,
}: {
  analytics: QrAnalytics
  links: TrackedLinkRow[]
}) {
  const [tab, setTab] = useState<Tab>("qr")

  const tabs: { id: Tab; label: string; icon: typeof QrCode }[] = [
    { id: "qr", label: "مولّد QR", icon: QrCode },
    { id: "links", label: "الروابط", icon: LinkIcon },
    { id: "stats", label: "الإحصائيات", icon: BarChart3 },
  ]

  return (
    <div>
      <PageHeader
        title="أكواد QR والروابط"
        description="ولّد كود QR بشعار الكافيه، أنشئ روابط مخصّصة لكل منصة، وتابع نشاط الزوّار بالتفصيل."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon
          const active = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === "qr" ? <QrTab analytics={analytics} links={links} /> : null}
      {tab === "links" ? <LinksTab links={links} /> : null}
      {tab === "stats" ? <StatsTab analytics={analytics} /> : null}
    </div>
  )
}

/* -------------------------------- QR tab ------------------------------- */

function QrTab({ analytics, links }: { analytics: QrAnalytics; links: TrackedLinkRow[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pending, startTransition] = useTransition()
  // Resolve the origin only after mount so server and client render the same
  // initial markup (avoids a hydration mismatch on the printed QR URL).
  const [origin, setOrigin] = useState("")
  useEffect(() => setOrigin(window.location.origin), [])

  const qrCandidates = links.filter((l) => l.active)
  const qrLink = analytics.qrLink ?? qrCandidates[0] ?? null
  const [selectedId, setSelectedId] = useState<string>(qrLink?.id ?? "")
  const selected = links.find((l) => l.id === selectedId) ?? qrLink

  const [style, setStyle] = useState<QrStyle>({
    fg: "#2a1c10",
    bg: "#ffffff",
    withLogo: true,
    margin: 2,
  })

  const qrUrl = selected ? `${origin}/go/${selected.slug}` : `${origin}/go/menu`

  function download(type: "png" | "svg") {
    const canvas = canvasRef.current
    if (!canvas) return
    if (type === "png") {
      const a = document.createElement("a")
      a.href = canvas.toDataURL("image/png")
      a.download = `amigo-qr-${selected?.slug ?? "menu"}.png`
      a.click()
    }
  }

  function makeQrTarget(id: string) {
    setSelectedId(id)
    startTransition(async () => {
      await setQrLink(id)
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <Card>
        <CardHeader title="معاينة الكود" subtitle="جاهز للطباعة بدقة عالية" />
        <div className="flex flex-col items-center gap-5 p-5">
          <QrCanvas value={qrUrl} style={style} canvasRef={canvasRef} />
          <div className="w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-center">
            <p className="font-mono text-xs text-muted-foreground break-all">{qrUrl}</p>
          </div>
          <button
            type="button"
            onClick={() => download("png")}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Download className="size-4" />
            تحميل PNG عالي الدقة
          </button>
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader title="إعدادات الكود" />
          <div className="flex flex-col gap-4 p-5">
            <Field label="الوجهة (اللينك اللي الكود هيوديله)">
              <select
                className={inputClass}
                value={selectedId}
                onChange={(e) => makeQrTarget(e.target.value)}
              >
                {qrCandidates.length === 0 ? (
                  <option value="">لا توجد روابط — أنشئ رابطًا أولًا</option>
                ) : null}
                {qrCandidates.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label || l.slug} — /go/{l.slug}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="لون الكود">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.fg}
                    onChange={(e) => setStyle((s) => ({ ...s, fg: e.target.value }))}
                    className="h-9 w-12 cursor-pointer rounded border border-input bg-background"
                  />
                  <span className="font-mono text-xs text-muted-foreground">{style.fg}</span>
                </div>
              </Field>
              <Field label="لون الخلفية">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.bg}
                    onChange={(e) => setStyle((s) => ({ ...s, bg: e.target.value }))}
                    className="h-9 w-12 cursor-pointer rounded border border-input bg-background"
                  />
                  <span className="font-mono text-xs text-muted-foreground">{style.bg}</span>
                </div>
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-foreground">شعار الكافيه في المنتصف</p>
                <p className="text-xs text-muted-foreground">يستخدم تصحيح خطأ عالي لضمان عمل المسح</p>
              </div>
              <Toggle
                checked={style.withLogo}
                onChange={(v) => setStyle((s) => ({ ...s, withLogo: v }))}
                label="شعار في المنتصف"
              />
            </div>

            <Field label={`الهامش حول الكود: ${style.margin}`}>
              <input
                type="range"
                min={0}
                max={6}
                value={style.margin}
                onChange={(e) => setStyle((s) => ({ ...s, margin: Number(e.target.value) }))}
                className="w-full accent-[var(--primary)]"
              />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="ملخّص الكود" />
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-b-lg bg-border sm:grid-cols-4">
            <MiniStat label="إجمالي المسح" value={analytics.qrScansTotal} />
            <MiniStat label="آخر 7 أيام" value={analytics.qrScans7} />
            <MiniStat
              label="أكثر ساعة"
              value={analytics.qrPeakHour !== null ? `${analytics.qrPeakHour}:00` : "—"}
            />
            <MiniStat label="أكثر يوم" value={analytics.qrPeakDay ?? "—"} />
          </div>
        </Card>
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-2xl text-foreground">{value}</p>
    </div>
  )
}

/* ------------------------------ Links tab ------------------------------ */

const EMPTY_LINK: TrackedLinkInput = {
  slug: "",
  label: "",
  platform: "facebook",
  destination: "",
  is_qr: false,
  active: true,
}

function LinksTab({ links }: { links: TrackedLinkRow[] }) {
  const [editing, setEditing] = useState<TrackedLinkInput | null>(null)
  const [origin, setOrigin] = useState("")
  useEffect(() => setOrigin(window.location.origin), [])
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  function openNew() {
    setError(null)
    setEditing({ ...EMPTY_LINK })
  }

  function openEdit(l: TrackedLinkRow) {
    setError(null)
    setEditing({
      id: l.id,
      slug: l.slug,
      label: l.label,
      platform: l.platform,
      destination: l.destination,
      is_qr: l.is_qr,
      active: l.active,
    })
  }

  function save() {
    if (!editing) return
    startTransition(async () => {
      const res = await saveTrackedLink(editing)
      if (!res.ok) {
        setError(res.error ?? "حدث خطأ")
        return
      }
      setEditing(null)
    })
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteTrackedLink(id)
    })
  }

  function toggle(id: string, active: boolean) {
    startTransition(async () => {
      await toggleTrackedLink(id, active)
    })
  }

  function copy(slug: string) {
    navigator.clipboard.writeText(`${origin}/go/${slug}`)
    setCopied(slug)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader
          title="الروابط المخصّصة"
          subtitle="كل منصة تأخذ رابطًا فريدًا لمعرفة مصدر الزوّار"
          action={
            <button
              type="button"
              onClick={openNew}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="size-4" />
              رابط جديد
            </button>
          }
        />
        <div className="divide-y divide-border">
          {links.length === 0 ? (
            <p className="p-5 text-sm text-muted-foreground">لا توجد روابط بعد. ابدأ بإنشاء واحد.</p>
          ) : null}
          {links.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-medium text-foreground">{l.label || l.slug}</p>
                  <Badge tone={l.platform === "qr" ? "primary" : "neutral"}>
                    {PLATFORM_LABEL[l.platform]}
                  </Badge>
                  {l.is_qr ? (
                    <Badge tone="primary">
                      <Star className="size-3" /> QR
                    </Badge>
                  ) : null}
                  {!l.active ? <Badge tone="danger">متوقّف</Badge> : null}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => copy(l.slug)}
                    className="inline-flex items-center gap-1 font-mono hover:text-foreground"
                  >
                    {copied === l.slug ? (
                      <Check className="size-3 text-primary" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                    /go/{l.slug}
                  </button>
                  <span className="inline-flex items-center gap-1 truncate">
                    <ExternalLink className="size-3" />
                    {l.destination}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Toggle checked={l.active} onChange={(v) => toggle(l.id, v)} label="تفعيل" />
                <button
                  type="button"
                  onClick={() => openEdit(l)}
                  className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="تعديل"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(l.id)}
                  className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:text-destructive"
                  aria-label="حذف"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {editing ? (
        <Card>
          <CardHeader title={editing.id ? "تعديل الرابط" : "رابط جديد"} />
          <div className="flex flex-col gap-4 p-5">
            {error ? (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="الاسم (للعرض في الأدمن)">
                <input
                  className={inputClass}
                  value={editing.label}
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                  placeholder="حملة فيسبوك الصيف"
                />
              </Field>
              <Field label="المنصة">
                <select
                  className={inputClass}
                  value={editing.platform}
                  onChange={(e) =>
                    setEditing({ ...editing, platform: e.target.value as LinkPlatform })
                  }
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="الكود المختصر (slug)" hint="حروف إنجليزية صغيرة وأرقام وشرطات فقط">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs text-muted-foreground">/go/</span>
                  <input
                    className={inputClass}
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    placeholder="facebook"
                  />
                </div>
              </Field>
              <Field label="رابط الوجهة" hint="ممكن يكون رابط خارجي أو مسار داخلي مثل /menu">
                <input
                  className={inputClass}
                  value={editing.destination}
                  onChange={(e) => setEditing({ ...editing, destination: e.target.value })}
                  placeholder="/menu"
                />
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={save}
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {pending ? "جارٍ الحفظ…" : "حفظ"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                إلغاء
              </button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}

/* ------------------------------ Stats tab ------------------------------ */

function StatsTab({ analytics }: { analytics: QrAnalytics }) {
  const hasEvents = analytics.totalEvents > 0

  const devicePct = useMemo(() => {
    const total = analytics.devices.reduce((s, d) => s + d.value, 0) || 1
    return analytics.devices.map((d) => ({
      label: d.label,
      value: Math.round((d.value / total) * 100),
    }))
  }, [analytics.devices])

  const referrerPct = useMemo(() => {
    const total = analytics.topReferrers.reduce((s, d) => s + d.value, 0) || 1
    return analytics.topReferrers.map((d) => ({
      label: d.label,
      value: Math.round((d.value / total) * 100),
    }))
  }, [analytics.topReferrers])

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={QrCode} label="مرات المسح (QR)" value={analytics.totalScans} sub={`+${analytics.scans7} هذا الأسبوع`} />
        <Kpi icon={LinkIcon} label="نقرات الروابط" value={analytics.totalClicks} sub={`+${analytics.clicks7} هذا الأسبوع`} />
        <Kpi icon={BarChart3} label="إجمالي الزيارات" value={analytics.totalEvents} />
        <Kpi icon={Star} label="روابط نشطة" value={analytics.activeLinks} />
      </div>

      <Card>
        <CardHeader title="النشاط على مدار 30 يوم" subtitle="كل المسحات والنقرات يوميًا" />
        <div className="p-5">
          {hasEvents ? (
            <AreaChart data={analytics.timeline} unitId="qr-timeline" />
          ) : (
            <Empty />
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="حسب ساعة اليوم"
            subtitle="امتى الناس بتعمل اسكان أكتر"
            action={<Clock className="size-4 text-muted-foreground" />}
          />
          <div className="p-5">
            {hasEvents ? <BarChart data={analytics.byHour} /> : <Empty />}
          </div>
        </Card>
        <Card>
          <CardHeader
            title="حسب يوم الأسبوع"
            subtitle="أكثر أيام النشاط"
            action={<CalendarDays className="size-4 text-muted-foreground" />}
          />
          <div className="p-5">
            {hasEvents ? <BarChart data={analytics.byWeekday} /> : <Empty />}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="الأجهزة"
            subtitle="نوع جهاز الزائر"
            action={<Smartphone className="size-4 text-muted-foreground" />}
          />
          <div className="p-5">
            {devicePct.length > 0 ? <DonutChart data={devicePct} /> : <Empty />}
          </div>
        </Card>
        <Card>
          <CardHeader title="مصادر الزيارات" subtitle="من أي موقع جاء الزائر" />
          <div className="p-5">
            {referrerPct.length > 0 ? <MiniBars data={referrerPct} /> : <Empty />}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="أداء كل رابط" subtitle="مرتّبة حسب الأكثر نشاطًا" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-right text-xs text-muted-foreground">
                <th className="px-5 py-3 font-medium">الرابط</th>
                <th className="px-5 py-3 font-medium">المنصة</th>
                <th className="px-5 py-3 font-medium">الإجمالي</th>
                <th className="px-5 py-3 font-medium">آخر 7 أيام</th>
                <th className="px-5 py-3 font-medium">زوّار مميّزون</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {analytics.links.map((s) => (
                <tr key={s.link.id}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-foreground">{s.link.label || s.link.slug}</p>
                    <p className="font-mono text-xs text-muted-foreground">/go/{s.link.slug}</p>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {PLATFORM_LABEL[s.link.platform]}
                  </td>
                  <td className="px-5 py-3 font-mono tabular-nums text-foreground">{s.total}</td>
                  <td className="px-5 py-3 font-mono tabular-nums text-muted-foreground">{s.last7}</td>
                  <td className="px-5 py-3 font-mono tabular-nums text-muted-foreground">
                    {s.uniqueSessions}
                  </td>
                </tr>
              ))}
              {analytics.links.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-center text-muted-foreground">
                    لا توجد بيانات بعد
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof QrCode
  label: string
  value: number
  sub?: string
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="size-4 text-primary" />
      </div>
      <p className="mt-2 font-heading text-3xl text-foreground">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </Card>
  )
}

function Empty() {
  return (
    <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border">
      <p className="text-sm text-muted-foreground">لا توجد بيانات كافية بعد</p>
    </div>
  )
}

"use client"

import Image from "next/image"
import {
  Users,
  Eye,
  ShoppingBag,
  Layers,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react"
import { Card, CardHeader, PageHeader, Badge } from "@/components/admin/ui"
import { AreaChart, BarChart, DonutChart, MiniBars } from "@/components/admin/charts"
import { useAdminT } from "@/lib/i18n/admin-dict"
import type { DashboardData } from "@/lib/admin/types"

const ACTIVITY_TONES: Record<string, string> = {
  order: "bg-primary",
  edit: "bg-[oklch(0.6_0.13_220)]",
  user: "bg-[oklch(0.6_0.13_150)]",
  alert: "bg-destructive",
}

function DeltaBadge({ delta }: { delta: number }) {
  const up = delta >= 0
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-xs font-medium ${
        up
          ? "bg-[oklch(0.55_0.12_150_/_15%)] text-[oklch(0.5_0.13_150)] dark:text-[oklch(0.78_0.14_150)]"
          : "bg-destructive/15 text-destructive"
      }`}
    >
      {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {Math.abs(delta)}%
    </span>
  )
}

function KpiCard({
  icon: Icon,
  label,
  hint,
  value,
  delta,
}: {
  icon: React.ElementType
  label: string
  hint: string
  value: number | string
  delta: number
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <span className="flex size-10 items-center justify-center rounded-md bg-primary/12 text-primary">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <DeltaBadge delta={delta} />
      </div>
      <p className="mt-4 font-heading text-3xl tabular-nums text-foreground">{value}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{label}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </Card>
  )
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const tt = useAdminT()
  const dateLocale = tt("ar-EG", "en-US")

  const { kpis, visitsSeries, viewsByDay, trafficSources, devices, topItems, recentActivity } = data

  const last7 = tt("آخر 7 أيام", "Last 7 days")
  const kpiCards = [
    { icon: Users, label: tt("الزيارات", "Visits"), hint: last7, value: kpis.visits, delta: kpis.visitsDelta },
    { icon: Eye, label: tt("المشاهدات", "Views"), hint: last7, value: kpis.views, delta: kpis.viewsDelta },
    { icon: ShoppingBag, label: tt("مشاهدات المنيو", "Menu Views"), hint: last7, value: kpis.menuViews, delta: kpis.menuViewsDelta },
    { icon: Layers, label: tt("صفحة / جلسة", "Pages / Session"), hint: tt("متوسط التفاعل", "Avg. engagement"), value: kpis.pagesPerSession, delta: kpis.pagesPerSessionDelta },
  ]

  return (
    <>
      <PageHeader
        title={tt("لوحة التحكم", "Dashboard")}
        description={tt(
          "نظرة سريعة على أداء أميجو كافيه — بيانات حقيقية محدّثة من قاعدة البيانات.",
          "A quick overview of Amigo Cafe's performance — live data from your database.",
        )}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title={tt("الزيارات", "Visits")} subtitle={tt("آخر 14 يوم", "Last 14 days")} />
          <div className="p-4">
            <AreaChart data={visitsSeries} unitId="visits" />
          </div>
        </Card>
        <Card>
          <CardHeader
            title={tt("مصادر الزيارات", "Traffic Sources")}
            subtitle={tt("من أين يأتي ضيوفك", "Where your guests come from")}
          />
          <div className="p-5">
            <DonutChart data={trafficSources} />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={tt("المشاهدات حسب اليوم", "Views by Day")}
            subtitle={tt("آخر 4 أسابيع", "Last 4 weeks")}
          />
          <div className="p-4">
            <BarChart data={viewsByDay} />
          </div>
        </Card>
        <Card>
          <CardHeader
            title={tt("الأجهزة", "Devices")}
            subtitle={tt("كيف يتصفح ضيوفك", "How your guests browse")}
          />
          <div className="p-5">
            <MiniBars data={devices} />
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title={tt("الأكثر مشاهدة", "Most Viewed")}
            subtitle={tt("أصناف هذا الأسبوع", "This week's items")}
            action={<Badge tone="primary">{last7}</Badge>}
          />
          <ul className="divide-y divide-border">
            {topItems.map((item, i) => (
              <li key={item.name} className="flex items-center gap-3 px-5 py-3">
                <span className="w-5 text-center font-mono text-sm text-muted-foreground">
                  {i + 1}
                </span>
                <span className="relative size-11 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.category}</p>
                </div>
                <span className="flex items-center gap-1 font-mono text-sm tabular-nums text-foreground">
                  {item.views}
                  <ArrowUpRight className="size-3.5 text-primary" />
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title={tt("آخر النشاطات", "Recent Activity")}
            subtitle={tt("مباشر من قاعدة البيانات", "Live from your database")}
          />
          <ul className="flex flex-col gap-4 p-5">
            {recentActivity.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className="mt-1.5 flex flex-col items-center">
                  <span className={`size-2.5 rounded-full ${ACTIVITY_TONES[a.kind] ?? "bg-muted"}`} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-foreground text-pretty">{a.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(a.created_at).toLocaleString(dateLocale, {
                      hour: "numeric",
                      minute: "2-digit",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}

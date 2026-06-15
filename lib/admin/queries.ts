import { createClient } from "@/lib/supabase/server"
import type {
  CategoryRow,
  MenuItemRow,
  HomepageRow,
  SeoRow,
  SiteSettingsRow,
  NotificationRow,
  ActivityRow,
  ProfileRow,
  DashboardData,
  TrackedLinkRow,
  LinkEventRow,
  QrAnalytics,
  LinkStats,
  FeedbackRow,
} from "@/lib/admin/types"

export async function getCategories(): Promise<CategoryRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
  if (error) {
    console.log("[v0] getCategories error:", error.message)
    return []
  }
  return (data ?? []) as CategoryRow[]
}

export async function getMenuItems(): Promise<MenuItemRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .order("sort_order", { ascending: true })
  if (error) {
    console.log("[v0] getMenuItems error:", error.message)
    return []
  }
  return (data ?? []) as MenuItemRow[]
}

export async function getHomepage(): Promise<HomepageRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("homepage_content")
    .select("*")
    .eq("id", 1)
    .maybeSingle()
  if (error) {
    console.log("[v0] getHomepage error:", error.message)
    return null
  }
  return data as HomepageRow | null
}

export async function getSeo(): Promise<SeoRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("seo_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle()
  if (error) {
    console.log("[v0] getSeo error:", error.message)
    return null
  }
  return data as SeoRow | null
}

export async function getSiteSettings(): Promise<SiteSettingsRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle()
  if (error) {
    console.log("[v0] getSiteSettings error:", error.message)
    return null
  }
  return data as SiteSettingsRow | null
}

/** Categories with a live item count, for the categories admin view. */
export async function getCategoriesWithCounts(): Promise<
  (CategoryRow & { itemsCount: number })[]
> {
  const [categories, items] = await Promise.all([getCategories(), getMenuItems()])
  return categories.map((c) => ({
    ...c,
    itemsCount: items.filter((it) => it.category_id === c.id).length,
  }))
}

/** All notifications, newest first. */
export async function getNotifications(): Promise<NotificationRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) {
    console.log("[v0] getNotifications error:", error.message)
    return []
  }
  return (data ?? []) as NotificationRow[]
}

/** All feedback submissions, newest first. */
export async function getFeedback(): Promise<FeedbackRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) {
    console.log("[v0] getFeedback error:", error.message)
    return []
  }
  return (data ?? []) as FeedbackRow[]
}

/** Count of feedback still marked as new (for nav badge). */
export async function getNewFeedbackCount(): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from("feedback")
    .select("*", { count: "exact", head: true })
    .eq("status", "new")
  if (error) {
    console.log("[v0] getNewFeedbackCount error:", error.message)
    return 0
  }
  return count ?? 0
}

/** Recent activity log entries. */
export async function getActivity(limit = 6): Promise<ActivityRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) {
    console.log("[v0] getActivity error:", error.message)
    return []
  }
  return (data ?? []) as ActivityRow[]
}

/** The profile of the currently signed-in admin. */
export async function getProfile(): Promise<ProfileRow | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()
  if (error) {
    console.log("[v0] getProfile error:", error.message)
    return null
  }
  // Fall back to a minimal profile derived from the auth record.
  return (
    (data as ProfileRow | null) ?? {
      id: user.id,
      name: user.email?.split("@")[0] ?? "",
      role: "مدير عام",
      phone: "",
      avatar: "",
      created_at: user.created_at ?? new Date().toISOString(),
    }
  )
}

/** The signed-in admin's email (from the auth record). */
export async function getAdminEmail(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.email ?? ""
}

/* ----------------------------- QR / Links ----------------------------- */

export async function getTrackedLinks(): Promise<TrackedLinkRow[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("tracked_links")
    .select("*")
    .order("created_at", { ascending: true })
  if (error) {
    console.log("[v0] getTrackedLinks error:", error.message)
    return []
  }
  return (data ?? []) as TrackedLinkRow[]
}

const WEEKDAYS_AR = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

/**
 * Fetches links + their events and aggregates a rich analytics payload.
 * Volumes are small (a single cafe), so we aggregate in JS for flexibility.
 */
export async function getQrAnalytics(): Promise<QrAnalytics> {
  const supabase = await createClient()
  const [linksRes, eventsRes] = await Promise.all([
    supabase.from("tracked_links").select("*").order("created_at", { ascending: true }),
    supabase
      .from("link_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20000),
  ])

  const links = (linksRes.data ?? []) as TrackedLinkRow[]
  const events = (eventsRes.data ?? []) as LinkEventRow[]

  const now = Date.now()
  const day = 24 * 60 * 60 * 1000
  const sevenAgo = now - 7 * day
  const thirtyAgo = now - 30 * day

  const inLast = (e: LinkEventRow, since: number) =>
    new Date(e.created_at).getTime() >= since

  const totalScans = events.filter((e) => e.type === "scan").length
  const totalClicks = events.filter((e) => e.type === "click").length
  const scans7 = events.filter((e) => e.type === "scan" && inLast(e, sevenAgo)).length
  const clicks7 = events.filter((e) => e.type === "click" && inLast(e, sevenAgo)).length

  // 30-day timeline of all events.
  const timelineMap = new Map<string, number>()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * day)
    timelineMap.set(d.toISOString().slice(0, 10), 0)
  }
  for (const e of events) {
    if (!inLast(e, thirtyAgo)) continue
    const key = new Date(e.created_at).toISOString().slice(0, 10)
    if (timelineMap.has(key)) timelineMap.set(key, (timelineMap.get(key) ?? 0) + 1)
  }
  const timeline = Array.from(timelineMap.entries()).map(([date, value]) => {
    const d = new Date(date)
    return { date, value, label: `${d.getDate()}/${d.getMonth() + 1}` }
  })

  // By hour of day (0..23).
  const hourCounts = new Array(24).fill(0)
  for (const e of events) hourCounts[new Date(e.created_at).getHours()]++
  const byHour = hourCounts.map((value, h) => ({ label: `${h}`, value }))

  // By weekday (Sat-first to match Arabic week).
  const weekdayCounts = new Array(7).fill(0)
  for (const e of events) weekdayCounts[new Date(e.created_at).getDay()]++
  const weekOrder = [6, 0, 1, 2, 3, 4, 5]
  const byWeekday = weekOrder.map((d) => ({ label: WEEKDAYS_AR[d], value: weekdayCounts[d] }))

  // Device breakdown.
  const deviceMap = new Map<string, number>()
  for (const e of events) {
    const key = e.device || "غير معروف"
    deviceMap.set(key, (deviceMap.get(key) ?? 0) + 1)
  }
  const deviceLabel: Record<string, string> = {
    mobile: "موبايل",
    tablet: "تابلت",
    desktop: "كمبيوتر",
  }
  const devices = Array.from(deviceMap.entries())
    .map(([k, v]) => ({ label: deviceLabel[k] ?? k, value: v }))
    .sort((a, b) => b.value - a.value)

  // Top referrers (host only).
  const refMap = new Map<string, number>()
  for (const e of events) {
    if (!e.referrer) continue
    let host = e.referrer
    try {
      host = new URL(e.referrer).hostname.replace(/^www\./, "")
    } catch {
      // keep raw referrer
    }
    refMap.set(host, (refMap.get(host) ?? 0) + 1)
  }
  const topReferrers = Array.from(refMap.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  // Per-link stats.
  const linkStats: LinkStats[] = links.map((link) => {
    const own = events.filter((e) => e.link_id === link.id)
    const sessions = new Set(own.map((e) => e.session_id).filter(Boolean))
    return {
      link,
      total: own.length,
      scans: own.filter((e) => e.type === "scan").length,
      clicks: own.filter((e) => e.type === "click").length,
      last7: own.filter((e) => inLast(e, sevenAgo)).length,
      uniqueSessions: sessions.size,
      lastEventAt: own[0]?.created_at ?? null,
    }
  })
  linkStats.sort((a, b) => b.total - a.total)

  // QR-specific peaks.
  const qrLink = links.find((l) => l.is_qr) ?? null
  const qrEvents = qrLink ? events.filter((e) => e.link_id === qrLink.id) : []
  const qrHour = new Array(24).fill(0)
  const qrDay = new Array(7).fill(0)
  for (const e of qrEvents) {
    qrHour[new Date(e.created_at).getHours()]++
    qrDay[new Date(e.created_at).getDay()]++
  }
  const maxQrHour = Math.max(...qrHour)
  const maxQrDay = Math.max(...qrDay)

  return {
    totalScans,
    totalClicks,
    totalEvents: events.length,
    scans7,
    clicks7,
    activeLinks: links.filter((l) => l.active).length,
    qrLink,
    qrScansTotal: qrEvents.length,
    qrScans7: qrEvents.filter((e) => inLast(e, sevenAgo)).length,
    qrPeakHour: maxQrHour > 0 ? qrHour.indexOf(maxQrHour) : null,
    qrPeakDay: maxQrDay > 0 ? WEEKDAYS_AR[qrDay.indexOf(maxQrDay)] : null,
    timeline,
    byHour,
    byWeekday,
    devices,
    topReferrers,
    links: linkStats,
  }
}

/** DB-derived dashboard aggregates via the get_dashboard() SQL function. */
export async function getDashboard(): Promise<DashboardData | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("get_dashboard")
  if (error) {
    console.log("[v0] getDashboard error:", error.message)
    return null
  }
  return data as DashboardData
}

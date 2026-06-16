"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { utapi } from "@/lib/uploadthing-server"
import type {
  HeroContent,
  VibeContent,
  LocationContent,
  MarqueeContent,
  JourneyContent,
  PlaystationContent,
  ActivityKind,
  NotificationPrefs,
  LinkPlatform,
  FeedbackType,
  FeedbackContactMethod,
  FeedbackStatus,
} from "@/lib/admin/types"

type ActionResult = { ok: boolean; error?: string }

/** Append an entry to the activity feed (best-effort, never throws). */
async function logActivity(kind: ActivityKind, message: string) {
  try {
    const supabase = await createClient()
    await supabase.from("activity_log").insert({ kind, message })
  } catch (e) {
    console.log("[v0] logActivity failed:", (e as Error).message)
  }
}

/** Delete a file from UploadThing given its URL (best-effort). */
async function deleteUploadedImage(url: string | null | undefined) {
  if (!url || !url.includes("utfs.io") && !url.includes("ufs.sh")) return
  try {
    const key = url.split("/").pop()
    if (key) await utapi.deleteFiles(key)
  } catch (e) {
    console.log("[v0] deleteUploadedImage failed:", (e as Error).message)
  }
}

async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { supabase, user: null as null }
  }
  return { supabase, user }
}

function revalidateAll() {
  // Public site + admin views that depend on this data.
  revalidatePath("/")
  revalidatePath("/admin/menu")
  revalidatePath("/admin/categories")
  revalidatePath("/admin/content")
  revalidatePath("/admin/seo")
  revalidatePath("/admin")
  revalidatePath("/admin/notifications")
  revalidatePath("/admin/profile")
  revalidatePath("/admin/qr")
  revalidatePath("/admin/feedback")
}

/* ------------------------------ Feedback ------------------------------ */

export type FeedbackInput = {
  type: FeedbackType
  name: string
  contact_method: FeedbackContactMethod
  contact_value: string
  message: string
}

/** Public action: a visitor submits a complaint or suggestion. No auth. */
export async function submitFeedback(input: FeedbackInput): Promise<ActionResult> {
  const message = input.message?.trim()
  if (!message || message.length < 3) {
    return { ok: false, error: "من فضلك اكتب رسالتك" }
  }
  const type: FeedbackType = input.type === "suggestion" ? "suggestion" : "complaint"
  const method: FeedbackContactMethod = (
    ["none", "phone", "whatsapp", "email", "instagram"] as FeedbackContactMethod[]
  ).includes(input.contact_method)
    ? input.contact_method
    : "none"

  const supabase = await createClient()
  const { error } = await supabase.from("feedback").insert({
    type,
    name: (input.name ?? "").trim().slice(0, 120),
    contact_method: method,
    contact_value: method === "none" ? "" : (input.contact_value ?? "").trim().slice(0, 200),
    message: message.slice(0, 2000),
    status: "new",
  })
  if (error) {
    console.log("[v0] submitFeedback error:", error.message)
    return { ok: false, error: "حصل خطأ أثناء الإرسال، حاول تاني" }
  }

  // Surface it to the admin via the activity feed (best-effort).
  await logActivity(
    "alert",
    type === "complaint" ? "وصلت شكوى جديدة" : "وصل اقتراح جديد",
  )
  revalidatePath("/admin/feedback")
  revalidatePath("/admin")
  return { ok: true }
}

/** Admin: update the workflow status of a feedback item. */
export async function setFeedbackStatus(
  id: string,
  status: FeedbackStatus,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error } = await supabase.from("feedback").update({ status }).eq("id", id)
  if (error) {
    console.log("[v0] setFeedbackStatus error:", error.message)
    return { ok: false, error: error.message }
  }
  revalidatePath("/admin/feedback")
  revalidatePath("/admin")
  return { ok: true }
}

/** Admin: permanently delete a feedback item. */
export async function deleteFeedback(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error } = await supabase.from("feedback").delete().eq("id", id)
  if (error) {
    console.log("[v0] deleteFeedback error:", error.message)
    return { ok: false, error: error.message }
  }
  revalidatePath("/admin/feedback")
  revalidatePath("/admin")
  return { ok: true }
}

/* ----------------------------- Menu items ----------------------------- */

export type MenuItemInput = {
  id?: string
  category_id: string | null
  name_ar: string
  name_en: string
  desc_ar: string
  desc_en: string
  price: number
  tags_ar: string[]
  tags_en: string[]
  image: string
  available: boolean
  sort_order?: number
}

export async function saveMenuItem(input: MenuItemInput): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }

  const payload = {
    category_id: input.category_id,
    name_ar: input.name_ar,
    name_en: input.name_en,
    desc_ar: input.desc_ar,
    desc_en: input.desc_en,
    price: input.price,
    tags_ar: input.tags_ar,
    tags_en: input.tags_en,
    image: input.image,
    available: input.available,
    sort_order: input.sort_order ?? 0,
  }

  const { error } = input.id
    ? await supabase.from("menu_items").update(payload).eq("id", input.id)
    : await supabase.from("menu_items").insert(payload)

  if (error) {
    console.log("[v0] saveMenuItem error:", error.message)
    return { ok: false, error: error.message }
  }
  await logActivity(
    "edit",
    input.id
      ? `تم تعديل صنف «${input.name_ar}»`
      : `تمت إضافة صنف «${input.name_ar}»`,
  )
  revalidateAll()
  return { ok: true }
}

export async function deleteMenuItem(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  // Fetch the row first so we can clean up its uploaded image.
  const { data: existing } = await supabase
    .from("menu_items")
    .select("name_ar, image")
    .eq("id", id)
    .maybeSingle()
  const { error } = await supabase.from("menu_items").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  await deleteUploadedImage(existing?.image)
  await logActivity("edit", `تم حذف صنف «${existing?.name_ar ?? ""}»`)
  revalidateAll()
  return { ok: true }
}

export async function toggleMenuItemAvailability(
  id: string,
  available: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error } = await supabase
    .from("menu_items")
    .update({ available })
    .eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidateAll()
  return { ok: true }
}

/* ----------------------------- Categories ----------------------------- */

export type CategoryInput = {
  id?: string
  slug: string
  name_ar: string
  name_en: string
  caption_ar: string
  caption_en: string
  active: boolean
  sort_order?: number
}

export async function saveCategory(input: CategoryInput): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }

  const payload = {
    slug: input.slug,
    name_ar: input.name_ar,
    name_en: input.name_en,
    caption_ar: input.caption_ar,
    caption_en: input.caption_en,
    active: input.active,
    sort_order: input.sort_order ?? 0,
  }

  const { error } = input.id
    ? await supabase.from("categories").update(payload).eq("id", input.id)
    : await supabase.from("categories").insert(payload)

  if (error) {
    console.log("[v0] saveCategory error:", error.message)
    return { ok: false, error: error.message }
  }
  await logActivity(
    "edit",
    input.id
      ? `تم تعديل تصنيف «${input.name_ar}»`
      : `تمت إضافة تصنيف «${input.name_ar}»`,
  )
  revalidateAll()
  return { ok: true }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error } = await supabase.from("categories").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidateAll()
  return { ok: true }
}

export async function toggleCategoryActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error } = await supabase
    .from("categories")
    .update({ active })
    .eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidateAll()
  return { ok: true }
}

/* --------------------------- Homepage content -------------------------- */

export type HomepageInput = {
  hero: HeroContent
  vibe: VibeContent
  location: LocationContent
  gallery: string[]
  marquee?: MarqueeContent
  journey?: JourneyContent
  playstation?: PlaystationContent
}

export async function saveHomepage(input: HomepageInput): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error } = await supabase
    .from("homepage_content")
    .upsert({
      id: 1,
      hero: input.hero,
      vibe: input.vibe,
      location: input.location,
      gallery: input.gallery,
      ...(input.marquee !== undefined && { marquee: input.marquee }),
      ...(input.journey !== undefined && { journey: input.journey }),
      ...(input.playstation !== undefined && { playstation: input.playstation }),
      updated_at: new Date().toISOString(),
    })
  if (error) {
    console.log("[v0] saveHomepage error:", error.message)
    return { ok: false, error: error.message }
  }
  revalidateAll()
  return { ok: true }
}

/* ------------------------------- SEO ----------------------------------- */

export type SeoInput = {
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
  keywords: string
  og_image: string
  canonical: string
  indexable: boolean
}

export async function saveSeo(input: SeoInput): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error } = await supabase
    .from("seo_settings")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", 1)
  if (error) {
    console.log("[v0] saveSeo error:", error.message)
    return { ok: false, error: error.message }
  }
  revalidateAll()
  return { ok: true }
}

/* --------------------------- Site settings ----------------------------- */

export type SiteSettingsInput = {
  brand_name: string
  default_locale: "ar" | "en"
  default_theme: "dark" | "light"
  primary_color: string
  logo: string
  contact_email: string
  facebook_url: string
  instagram_url: string
  tiktok_url: string
  whatsapp: string
  maps_url: string
  latitude: number
  longitude: number
}

export async function saveSiteSettings(
  input: SiteSettingsInput,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error } = await supabase
    .from("site_settings")
    .upsert({ id: 1, ...input, updated_at: new Date().toISOString() })
  if (error) {
    console.log("[v0] saveSiteSettings error:", error.message)
    return { ok: false, error: error.message }
  }
  revalidateAll()
  return { ok: true }
}

/* ----------------------------- Notifications --------------------------- */

export async function markNotificationRead(
  id: string,
  read: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error } = await supabase
    .from("notifications")
    .update({ read })
    .eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/notifications")
  revalidatePath("/admin")
  return { ok: true }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/notifications")
  revalidatePath("/admin")
  return { ok: true }
}

export async function deleteNotification(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error } = await supabase.from("notifications").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/notifications")
  revalidatePath("/admin")
  return { ok: true }
}

export async function saveNotificationPrefs(
  prefs: NotificationPrefs,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error } = await supabase
    .from("site_settings")
    .update({ notification_prefs: prefs, updated_at: new Date().toISOString() })
    .eq("id", 1)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/notifications")
  return { ok: true }
}

/* ------------------------------ Profile -------------------------------- */

export type ProfileInput = {
  name: string
  role: string
  phone: string
  avatar: string
}

export async function saveProfile(input: ProfileInput): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    name: input.name,
    role: input.role,
    phone: input.phone,
    avatar: input.avatar,
  })
  if (error) {
    console.log("[v0] saveProfile error:", error.message)
    return { ok: false, error: error.message }
  }
  await logActivity("user", "تم تحديث بيانات الملف الشخصي")
  revalidatePath("/admin/profile")
  revalidatePath("/admin")
  return { ok: true }
}

export async function changePassword(
  newPassword: string,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  if (newPassword.length < 6)
    return { ok: false, error: "كلمة المرور قصيرة جداً (6 أحرف على الأقل)" }
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

/* ----------------------------- QR / Links ------------------------------ */

export type TrackedLinkInput = {
  id?: string
  slug: string
  label: string
  platform: LinkPlatform
  destination: string
  is_qr?: boolean
  active?: boolean
}

const SLUG_RE = /^[a-z0-9-]+$/

export async function saveTrackedLink(
  input: TrackedLinkInput,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }

  const slug = input.slug.trim().toLowerCase()
  if (!slug || !SLUG_RE.test(slug)) {
    return { ok: false, error: "الكود يجب أن يحتوي على حرو�� إنجليزية صغيرة وأرقام وشرطات فقط" }
  }
  if (!input.destination.trim()) {
    return { ok: false, error: "لازم تحدد رابط الوجهة" }
  }

  const payload = {
    slug,
    label: input.label.trim(),
    platform: input.platform,
    destination: input.destination.trim(),
    is_qr: input.is_qr ?? false,
    active: input.active ?? true,
  }

  if (input.id) {
    const { error } = await supabase.from("tracked_links").update(payload).eq("id", input.id)
    if (error) {
      console.log("[v0] saveTrackedLink update error:", error.message)
      return { ok: false, error: error.code === "23505" ? "الكود ده مستخدم قبل كده" : error.message }
    }
    await logActivity("edit", `تم تعديل رابط: ${payload.label || slug}`)
  } else {
    const { error } = await supabase.from("tracked_links").insert(payload)
    if (error) {
      console.log("[v0] saveTrackedLink insert error:", error.message)
      return { ok: false, error: error.code === "23505" ? "الكود ده مستخدم قبل كده" : error.message }
    }
    await logActivity("edit", `تم إنشاء رابط: ${payload.label || slug}`)
  }

  revalidateAll()
  return { ok: true }
}

export async function deleteTrackedLink(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error } = await supabase.from("tracked_links").delete().eq("id", id)
  if (error) {
    console.log("[v0] deleteTrackedLink error:", error.message)
    return { ok: false, error: error.message }
  }
  revalidateAll()
  return { ok: true }
}

export async function toggleTrackedLink(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error } = await supabase.from("tracked_links").update({ active }).eq("id", id)
  if (error) {
    console.log("[v0] toggleTrackedLink error:", error.message)
    return { ok: false, error: error.message }
  }
  revalidateAll()
  return { ok: true }
}

/** Make a given link the single QR target (unsets is_qr on all others). */
export async function setQrLink(id: string): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }
  const { error: clearErr } = await supabase
    .from("tracked_links")
    .update({ is_qr: false })
    .eq("is_qr", true)
  if (clearErr) {
    console.log("[v0] setQrLink clear error:", clearErr.message)
    return { ok: false, error: clearErr.message }
  }
  const { error } = await supabase.from("tracked_links").update({ is_qr: true, active: true }).eq("id", id)
  if (error) {
    console.log("[v0] setQrLink set error:", error.message)
    return { ok: false, error: error.message }
  }
  revalidateAll()
  return { ok: true }
}

/* --------------------------- Backup / Restore -------------------------- */

// Tables included in a full content backup. Auth-managed data (profiles,
// activity log) is intentionally excluded so a restore never clobbers the
// signed-in admin or rewrites history.
const BACKUP_TABLES = [
  "categories",
  "menu_items",
  "homepage_content",
  "seo_settings",
  "site_settings",
  "notifications",
  "tracked_links",
] as const

export type BackupFile = {
  type: "amigo-backup"
  version: 1
  exportedAt: string
  tables: Record<string, unknown[]>
}

/** Read every backup table and return a single JSON-serialisable object. */
export async function exportBackup(): Promise<
  { ok: true; data: BackupFile } | { ok: false; error: string }
> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }

  const tables: Record<string, unknown[]> = {}
  for (const table of BACKUP_TABLES) {
    const { data, error } = await supabase.from(table).select("*")
    if (error) {
      console.log(`[v0] exportBackup ${table} error:`, error.message)
      return { ok: false, error: `تعذّر قراءة جدول ${table}: ${error.message}` }
    }
    tables[table] = data ?? []
  }

  return {
    ok: true,
    data: {
      type: "amigo-backup",
      version: 1,
      exportedAt: new Date().toISOString(),
      tables,
    },
  }
}

/** Validate and restore a backup file, replacing the contents of each table. */
export async function restoreBackup(payload: unknown): Promise<ActionResult> {
  const { supabase, user } = await requireUser()
  if (!user) return { ok: false, error: "غير مصرّح" }

  const file = payload as Partial<BackupFile>
  if (!file || file.type !== "amigo-backup" || typeof file.tables !== "object") {
    return { ok: false, error: "ملف غير صالح. تأكد من اختيار ملف نسخة احتياطية صحيح." }
  }

  for (const table of BACKUP_TABLES) {
    const rows = (file.tables as Record<string, unknown[]>)[table]
    if (!Array.isArray(rows)) continue

    // Replace strategy: clear the table, then re-insert the backed-up rows.
    const isSingleton = table === "homepage_content" || table === "seo_settings" || table === "site_settings"

    if (!isSingleton) {
      // Delete all existing rows (uuid / text primary keys).
      const { error: delErr } = await supabase
        .from(table)
        .delete()
        .not("id", "is", null)
      if (delErr) {
        console.log(`[v0] restoreBackup delete ${table} error:`, delErr.message)
        return { ok: false, error: `تعذّر مسح جدول ${table}: ${delErr.message}` }
      }
    }

    if (rows.length === 0) continue

    const { error: upErr } = await supabase.from(table).upsert(rows as never)
    if (upErr) {
      console.log(`[v0] restoreBackup upsert ${table} error:`, upErr.message)
      return { ok: false, error: `تعذّر استعادة جدول ${table}: ${upErr.message}` }
    }
  }

  await logActivity("alert", "تمت استعادة نسخة احتياطية للبيانات")
  revalidateAll()
  return { ok: true }
}

/* -------------------------------- Auth --------------------------------- */

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

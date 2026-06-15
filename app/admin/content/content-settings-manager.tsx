"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Type,
  Palette,
  Sun,
  Moon,
  Globe,
  Trash2,
  Check,
  Loader2,
  Music2,
  BookOpen,
  Gamepad2,
  Mail,
  Link as LinkIcon,
  AtSign,
  MapPin,
  MessageCircle,
} from "lucide-react"
import { Card, CardHeader, PageHeader, Badge, Field, inputClass } from "@/components/admin/ui"
import { ImageUpload } from "@/components/admin/image-upload"
import type {
  HomepageRow,
  SiteSettingsRow,
  MarqueeContent,
  JourneyContent,
  PlaystationContent,
} from "@/lib/admin/types"
import {
  saveHomepage,
  saveSiteSettings,
  type HomepageInput,
  type SiteSettingsInput,
} from "@/lib/admin/actions"
import { cn } from "@/lib/utils"

const TABS = [
  { id: "content", label: "الصفحة الرئيسية", icon: Type },
  { id: "journey", label: "الرحلة والماركي", icon: BookOpen },
  { id: "playstation", label: "البلايستيشن", icon: Gamepad2 },
  { id: "settings", label: "إعدادات الموقع", icon: Palette },
] as const

type TabId = (typeof TABS)[number]["id"]

export function ContentSettingsManager({
  homepage,
  settings,
}: {
  homepage: HomepageRow | null
  settings: SiteSettingsRow | null
}) {
  const [tab, setTab] = useState<TabId>("content")

  return (
    <>
      <PageHeader
        title="المحتوى والإعدادات"
        description="تحكّم في كل كلمة وصورة في الصفحة الرئيسية، وفي إعدادات الموقع العامة. التغييرات تظهر مباشرة على الموقع."
      />

      <div className="mb-6 flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {tab === "content" && <ContentTab homepage={homepage} />}
      {tab === "journey" && <JourneyMarqueeTab homepage={homepage} />}
      {tab === "playstation" && <PlaystationTab homepage={homepage} />}
      {tab === "settings" && <SettingsTab settings={settings} />}
    </>
  )
}

/* ─────────────────────────── Content Tab ─────────────────────────── */

function ContentTab({ homepage }: { homepage: HomepageRow | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const [hero, setHero] = useState(
    homepage?.hero ?? {
      titleTop: "",
      titleBottom: "",
      titleTopEn: "",
      titleBottomEn: "",
      tagline: "",
      taglineEn: "",
      image: "/placeholder.svg",
    },
  )
  const [vibe, setVibe] = useState(homepage?.vibe ?? { manifesto: "", manifestoEn: "" })
  const [location, setLocation] = useState(
    homepage?.location ?? {
      title: "",
      titleEn: "",
      address: "",
      addressEn: "",
      hours: "",
      hoursEn: "",
    },
  )
  const [gallery, setGallery] = useState<string[]>(homepage?.gallery ?? [])

  function save() {
    startTransition(async () => {
      const payload: HomepageInput = {
        hero,
        vibe,
        location,
        gallery,
        marquee: homepage?.marquee,
        journey: homepage?.journey,
        playstation: homepage?.playstation,
      }
      const res = await saveHomepage(payload)
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
      } else {
        alert(res.error ?? "تعذّر الحفظ")
      }
    })
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Hero */}
      <Card className="lg:col-span-2">
        <CardHeader
          title="قسم البطل (Hero)"
          subtitle="أول ما يشوفه الزائر"
          action={<Badge tone="primary">الصفحة الرئيسية</Badge>}
        />
        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="العنوان عربي (سطر أول)">
                <input
                  className={inputClass}
                  value={hero.titleTop}
                  onChange={(e) => setHero({ ...hero, titleTop: e.target.value })}
                />
              </Field>
              <Field label="العنوان عربي (سطر ثاني)">
                <input
                  className={inputClass}
                  value={hero.titleBottom}
                  onChange={(e) => setHero({ ...hero, titleBottom: e.target.value })}
                />
              </Field>
              <Field label="Title EN (line 1)">
                <input
                  className={inputClass}
                  dir="ltr"
                  value={hero.titleTopEn}
                  onChange={(e) => setHero({ ...hero, titleTopEn: e.target.value })}
                />
              </Field>
              <Field label="Title EN (line 2)">
                <input
                  className={inputClass}
                  dir="ltr"
                  value={hero.titleBottomEn}
                  onChange={(e) => setHero({ ...hero, titleBottomEn: e.target.value })}
                />
              </Field>
            </div>
            <Field label="النص التعريفي (عربي)">
              <textarea
                className={cn(inputClass, "min-h-24 resize-none")}
                value={hero.tagline}
                onChange={(e) => setHero({ ...hero, tagline: e.target.value })}
              />
            </Field>
            <Field label="Tagline (English)">
              <textarea
                className={cn(inputClass, "min-h-24 resize-none")}
                dir="ltr"
                value={hero.taglineEn}
                onChange={(e) => setHero({ ...hero, taglineEn: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex flex-col gap-2">
            <Field label="صورة البطل">
              <ImageUpload
                endpoint="homepageImage"
                value={hero.image}
                onChange={(url) => setHero({ ...hero, image: url })}
              />
            </Field>
          </div>
        </div>
      </Card>

      {/* Vibe */}
      <Card>
        <CardHeader title="جملة الأجواء" subtitle="مقطع الإحساس والمانيفستو" />
        <div className="flex flex-col gap-4 p-5">
          <Field label="النص (عربي)">
            <textarea
              className={cn(inputClass, "min-h-28 resize-none")}
              value={vibe.manifesto}
              onChange={(e) => setVibe({ ...vibe, manifesto: e.target.value })}
            />
          </Field>
          <Field label="Text (English)">
            <textarea
              className={cn(inputClass, "min-h-28 resize-none")}
              dir="ltr"
              value={vibe.manifestoEn}
              onChange={(e) => setVibe({ ...vibe, manifestoEn: e.target.value })}
            />
          </Field>
        </div>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader title="الموقع والتواصل" subtitle="بيانات الفرع وساعات العمل" />
        <div className="flex flex-col gap-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <Field label="عنوان القسم (عربي)">
              <input
                className={inputClass}
                value={location.title}
                onChange={(e) => setLocation({ ...location, title: e.target.value })}
              />
            </Field>
            <Field label="Title (EN)">
              <input
                className={inputClass}
                dir="ltr"
                value={location.titleEn}
                onChange={(e) => setLocation({ ...location, titleEn: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="العنوان (عربي)">
              <input
                className={inputClass}
                value={location.address}
                onChange={(e) => setLocation({ ...location, address: e.target.value })}
              />
            </Field>
            <Field label="Address (EN)">
              <input
                className={inputClass}
                dir="ltr"
                value={location.addressEn}
                onChange={(e) => setLocation({ ...location, addressEn: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ساعات العمل (عربي)">
              <input
                className={inputClass}
                value={location.hours}
                onChange={(e) => setLocation({ ...location, hours: e.target.value })}
              />
            </Field>
            <Field label="Hours (EN)">
              <input
                className={inputClass}
                dir="ltr"
                value={location.hoursEn}
                onChange={(e) => setLocation({ ...location, hoursEn: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </Card>

      {/* Gallery */}
      <Card className="lg:col-span-2">
        <CardHeader title="معرض الصور" subtitle="صور الأجواء في الصفحة الرئيسية" />
        <div className="flex flex-col gap-4 p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className="group relative aspect-square overflow-hidden rounded-md border border-border"
              >
                <Image
                  src={src || "/placeholder.svg"}
                  alt={`صورة المعرض ${i + 1}`}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
                <button
                  type="button"
                  aria-label="حذف الصورة"
                  onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-md bg-background/90 text-destructive opacity-0 shadow transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="max-w-xs">
            <ImageUpload
              endpoint="galleryImage"
              value=""
              onChange={(url) => {
                if (url) setGallery((prev) => [...prev, url])
              }}
              placeholder="ارفع صورة للمعرض"
            />
          </div>
        </div>
      </Card>

      <div className="lg:col-span-2">
        <SaveBar saving={isPending} saved={saved} onSave={save} />
      </div>
    </div>
  )
}

/* ─────────────────────── Journey & Marquee Tab ─────────────────────── */

const DEFAULT_MARQUEE: MarqueeContent = {
  items_ar: ["إسبريسو", "أصحاب", "كورتادو", "صباح الفل", "قهوة باردة", "أهلاً"],
  items_en: ["Espresso", "Amigos", "Cortado", "Buenos Dias", "Cold Brew", "Hola"],
}

const DEFAULT_JOURNEY: JourneyContent = {
  chapters: [
    { title_ar: "حبة البن", body_ar: "", title_en: "The Bean", body_en: "" },
    { title_ar: "الحِرفة", body_ar: "", title_en: "The Craft", body_en: "" },
    { title_ar: "اللعب", body_ar: "", title_en: "The Play", body_en: "" },
  ],
}

function JourneyMarqueeTab({ homepage }: { homepage: HomepageRow | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const [marquee, setMarquee] = useState<MarqueeContent>(
    homepage?.marquee ?? DEFAULT_MARQUEE,
  )
  const [journey, setJourney] = useState<JourneyContent>(
    homepage?.journey ?? DEFAULT_JOURNEY,
  )

  function updateChapter(
    i: number,
    field: keyof JourneyContent["chapters"][number],
    value: string,
  ) {
    const chapters = journey.chapters.map((c, idx) =>
      idx === i ? { ...c, [field]: value } : c,
    )
    setJourney({ chapters })
  }

  function save() {
    startTransition(async () => {
      const payload: HomepageInput = {
        hero: homepage?.hero ?? { titleTop: "", titleBottom: "", titleTopEn: "", titleBottomEn: "", tagline: "", taglineEn: "", image: "" },
        vibe: homepage?.vibe ?? { manifesto: "", manifestoEn: "" },
        location: homepage?.location ?? { title: "", titleEn: "", address: "", addressEn: "", hours: "", hoursEn: "" },
        gallery: homepage?.gallery ?? [],
        marquee,
        journey,
        playstation: homepage?.playstation,
      }
      const res = await saveHomepage(payload)
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
      } else {
        alert(res.error ?? "تعذّر الحفظ")
      }
    })
  }

  const CHAPTER_LABELS = ["الفصل الأول — حبة البن", "الفصل الثاني — الحِرفة", "الفصل الثالث — اللعب"]

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Marquee */}
      <Card>
        <CardHeader
          title="شريط الماركي"
          subtitle="الكلمات الدوّارة بين الأقسام"
          action={<Music2 className="size-4 text-muted-foreground" />}
        />
        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-muted-foreground">الكلمات (عربي) — افصل بفاصلة</p>
            <textarea
              className={cn(inputClass, "min-h-20 resize-none")}
              value={marquee.items_ar.join("، ")}
              onChange={(e) =>
                setMarquee({ ...marquee, items_ar: e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean) })
              }
            />
            <div className="flex flex-wrap gap-1.5">
              {marquee.items_ar.map((w, i) => (
                <span key={i} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-foreground">
                  {w}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-medium text-muted-foreground">Words (English) — separate with comma</p>
            <textarea
              className={cn(inputClass, "min-h-20 resize-none")}
              dir="ltr"
              value={marquee.items_en.join(", ")}
              onChange={(e) =>
                setMarquee({ ...marquee, items_en: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
              }
            />
            <div className="flex flex-wrap gap-1.5">
              {marquee.items_en.map((w, i) => (
                <span key={i} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-foreground">
                  {w}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Journey chapters */}
      {journey.chapters.map((chapter, i) => (
        <Card key={i}>
          <CardHeader title={CHAPTER_LABELS[i]} subtitle="نص الفصل في قسم رحلة البن" />
          <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
            <div className="flex flex-col gap-3">
              <Field label="العنوان (عربي)">
                <input
                  className={inputClass}
                  value={chapter.title_ar}
                  onChange={(e) => updateChapter(i, "title_ar", e.target.value)}
                />
              </Field>
              <Field label="النص (عربي)">
                <textarea
                  className={cn(inputClass, "min-h-28 resize-none")}
                  value={chapter.body_ar}
                  onChange={(e) => updateChapter(i, "body_ar", e.target.value)}
                />
              </Field>
            </div>
            <div className="flex flex-col gap-3">
              <Field label="Title (English)">
                <input
                  className={inputClass}
                  dir="ltr"
                  value={chapter.title_en}
                  onChange={(e) => updateChapter(i, "title_en", e.target.value)}
                />
              </Field>
              <Field label="Body (English)">
                <textarea
                  className={cn(inputClass, "min-h-28 resize-none")}
                  dir="ltr"
                  value={chapter.body_en}
                  onChange={(e) => updateChapter(i, "body_en", e.target.value)}
                />
              </Field>
            </div>
          </div>
        </Card>
      ))}

      <SaveBar saving={isPending} saved={saved} onSave={save} />
    </div>
  )
}

/* ─────────────────────────── PlayStation Tab ─────────────────────────── */

const DEFAULT_PS: PlaystationContent = {
  titleTop_ar: "يلا",
  titleBottom_ar: "نلعب",
  titleTop_en: "Game",
  titleBottom_en: "On",
  caption_ar: "أميجو مش بس قهوة. ده لاونج بلايستيشن.",
  caption_en: "Amigo is not just coffee. It is a PlayStation lounge.",
  rates: [
    { label_ar: "فردي / ساعة", label_en: "Solo / hr", price: "60" },
    { label_ar: "ثنائي / ساعة", label_en: "Duo / hr", price: "100" },
    { label_ar: "شلة / ساعة", label_en: "Squad / hr", price: "180" },
  ],
}

function PlaystationTab({ homepage }: { homepage: HomepageRow | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const [ps, setPs] = useState<PlaystationContent>(homepage?.playstation ?? DEFAULT_PS)

  function updateRate(i: number, field: keyof PlaystationContent["rates"][number], value: string) {
    const rates = ps.rates.map((r, idx) => (idx === i ? { ...r, [field]: value } : r))
    setPs({ ...ps, rates })
  }

  function save() {
    startTransition(async () => {
      const payload: HomepageInput = {
        hero: homepage?.hero ?? { titleTop: "", titleBottom: "", titleTopEn: "", titleBottomEn: "", tagline: "", taglineEn: "", image: "" },
        vibe: homepage?.vibe ?? { manifesto: "", manifestoEn: "" },
        location: homepage?.location ?? { title: "", titleEn: "", address: "", addressEn: "", hours: "", hoursEn: "" },
        gallery: homepage?.gallery ?? [],
        marquee: homepage?.marquee,
        journey: homepage?.journey,
        playstation: ps,
      }
      const res = await saveHomepage(payload)
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
      } else {
        alert(res.error ?? "تعذّر الحفظ")
      }
    })
  }

  const RATE_LABELS = ["الأسعار — فردي", "الأسعار — ثنائي", "الأسعار — شلة"]

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* Heading */}
      <Card>
        <CardHeader title="عنوان قسم البلايستيشن" subtitle="الكلمات الكبيرة في الأعلى" />
        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="سطر أول (عربي)">
                <input
                  className={inputClass}
                  value={ps.titleTop_ar}
                  onChange={(e) => setPs({ ...ps, titleTop_ar: e.target.value })}
                />
              </Field>
              <Field label="سطر ثاني (عربي)">
                <input
                  className={inputClass}
                  value={ps.titleBottom_ar}
                  onChange={(e) => setPs({ ...ps, titleBottom_ar: e.target.value })}
                />
              </Field>
            </div>
            <Field label="النص التعريفي (عربي)">
              <textarea
                className={cn(inputClass, "min-h-20 resize-none")}
                value={ps.caption_ar}
                onChange={(e) => setPs({ ...ps, caption_ar: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Line 1 (EN)">
                <input
                  className={inputClass}
                  dir="ltr"
                  value={ps.titleTop_en}
                  onChange={(e) => setPs({ ...ps, titleTop_en: e.target.value })}
                />
              </Field>
              <Field label="Line 2 (EN)">
                <input
                  className={inputClass}
                  dir="ltr"
                  value={ps.titleBottom_en}
                  onChange={(e) => setPs({ ...ps, titleBottom_en: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Caption (English)">
              <textarea
                className={cn(inputClass, "min-h-20 resize-none")}
                dir="ltr"
                value={ps.caption_en}
                onChange={(e) => setPs({ ...ps, caption_en: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </Card>

      {/* Rates */}
      <Card>
        <CardHeader title="أسعار اللعب" subtitle="السعر بالجنيه المصري لكل فئة" />
        <div className="flex flex-col gap-4 p-5">
          {ps.rates.map((rate, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 rounded-md border border-border p-4 md:grid-cols-3">
              <Field label={`التسمية (عربي) — ${RATE_LABELS[i]}`}>
                <input
                  className={inputClass}
                  value={rate.label_ar}
                  onChange={(e) => updateRate(i, "label_ar", e.target.value)}
                />
              </Field>
              <Field label="Label (English)">
                <input
                  className={inputClass}
                  dir="ltr"
                  value={rate.label_en}
                  onChange={(e) => updateRate(i, "label_en", e.target.value)}
                />
              </Field>
              <Field label="السعر (ج.م)">
                <input
                  className={inputClass}
                  dir="ltr"
                  type="number"
                  value={rate.price}
                  onChange={(e) => updateRate(i, "price", e.target.value)}
                />
              </Field>
            </div>
          ))}
        </div>
      </Card>

      <SaveBar saving={isPending} saved={saved} onSave={save} />
    </div>
  )
}

/* ─────────────────────────── Settings Tab ─────────────────────────── */

const COLOR_PRESETS = ["#b07a3c", "#9a6a30", "#7a8c5a", "#3c6e8f", "#a14b3c", "#5a4a8c"]

function SettingsTab({ settings }: { settings: SiteSettingsRow | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const [form, setForm] = useState({
    brand_name: settings?.brand_name ?? "",
    default_locale: settings?.default_locale ?? "ar",
    default_theme: settings?.default_theme ?? "dark",
    primary_color: settings?.primary_color ?? "#b07a3c",
    logo: settings?.logo ?? "/icon.svg",
    contact_email: settings?.contact_email ?? "",
    facebook_url: settings?.facebook_url ?? "",
    instagram_url: settings?.instagram_url ?? "",
    tiktok_url: settings?.tiktok_url ?? "",
    whatsapp: settings?.whatsapp ?? "",
    maps_url: settings?.maps_url ?? "",
    latitude: settings?.latitude?.toString() ?? "30.2921145",
    longitude: settings?.longitude?.toString() ?? "31.743953",
  })

  function save() {
    startTransition(async () => {
      const payload: SiteSettingsInput = {
        brand_name: form.brand_name,
        default_locale: form.default_locale as "ar" | "en",
        default_theme: form.default_theme as "dark" | "light",
        primary_color: form.primary_color,
        logo: form.logo,
        contact_email: form.contact_email.trim(),
        facebook_url: form.facebook_url.trim(),
        instagram_url: form.instagram_url.trim(),
        tiktok_url: form.tiktok_url.trim(),
        whatsapp: form.whatsapp.trim(),
        maps_url: form.maps_url.trim(),
        latitude: Number.parseFloat(form.latitude) || 30.2921145,
        longitude: Number.parseFloat(form.longitude) || 31.743953,
      }
      const res = await saveSiteSettings(payload)
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        router.refresh()
      } else {
        alert(res.error ?? "تعذّر الحفظ")
      }
    })
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader title="الهوية" subtitle="اسم وشعار الموقع" />
        <div className="flex flex-col gap-4 p-5">
          <Field label="اسم العلامة">
            <input
              className={inputClass}
              value={form.brand_name}
              onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
            />
          </Field>
          <Field label="الشعار">
            <ImageUpload
              endpoint="logoImage"
              value={form.logo}
              onChange={(url) => setForm({ ...form, logo: url })}
              placeholder="ارفع الشعار (SVG أو PNG)"
            />
          </Field>
        </div>
      </Card>

      <Card>
        <CardHeader title="اللون الأساسي" subtitle="يطبّق فوراً على الموقع بعد الحفظ" />
        <div className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap gap-2.5">
            {COLOR_PRESETS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, primary_color: c })}
                aria-label={`اختيار اللون ${c}`}
                className={cn(
                  "relative size-10 rounded-full border-2 transition-transform hover:scale-105",
                  form.primary_color === c ? "border-foreground" : "border-transparent",
                )}
                style={{ background: c }}
              >
                {form.primary_color === c ? (
                  <Check className="absolute inset-0 m-auto size-4 text-white" />
                ) : null}
              </button>
            ))}
          </div>
          <Field label="قيمة اللون (HEX)">
            <div className="flex items-center gap-2">
              <span
                className="size-8 shrink-0 rounded-full border border-border"
                style={{ background: form.primary_color }}
              />
              <input
                className={inputClass}
                dir="ltr"
                value={form.primary_color}
                onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
              />
            </div>
          </Field>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader
          title="الوضع الافتراضي للزوّار"
          subtitle="ما يراه الزائر لأول مرة قبل أن يغيّر تفضيلاته"
        />
        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">اللغة الافتراضية</span>
            <div className="flex gap-2">
              {(["ar", "en"] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setForm({ ...form, default_locale: loc })}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-md border py-2.5 text-sm font-medium transition-colors",
                    form.default_locale === loc
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Globe className="size-4" />
                  {loc === "ar" ? "العربية" : "الإنجليزية"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground">السمة الافتراضية</span>
            <div className="flex gap-2">
              {(["dark", "light"] as const).map((th) => (
                <button
                  key={th}
                  type="button"
                  onClick={() => setForm({ ...form, default_theme: th })}
                  className={cn(
                    "inline-flex flex-1 items-center justify-center gap-2 rounded-md border py-2.5 text-sm font-medium transition-colors",
                    form.default_theme === th
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {th === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
                  {th === "dark" ? "الوضع الداكن" : "الوضع الفاتح"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader
          title="التواصل والسوشيال ميديا"
          subtitle="الروابط اللي تتحط هنا تظهر في الفوتر وتتسحب لبيانات السيو (sameAs). سيب أي خانة فاضية عشان تختفي."
          action={<Badge tone="primary">يظهر في الموقع</Badge>}
        />
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <Field label="البريد الإلكتروني">
            <div className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-muted-foreground" />
              <input
                className={inputClass}
                dir="ltr"
                placeholder="hello@amigocafe.com"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              />
            </div>
          </Field>
          <Field label="واتساب (رقم بالكود الدولي)">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 shrink-0 text-muted-foreground" />
              <input
                className={inputClass}
                dir="ltr"
                placeholder="+201001234567"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
            </div>
          </Field>
          <Field label="رابط صفحة فيسبوك">
            <div className="flex items-center gap-2">
              <LinkIcon className="size-4 shrink-0 text-muted-foreground" />
              <input
                className={inputClass}
                dir="ltr"
                placeholder="https://facebook.com/amigocafe"
                value={form.facebook_url}
                onChange={(e) => setForm({ ...form, facebook_url: e.target.value })}
              />
            </div>
          </Field>
          <Field label="رابط إنستجرام">
            <div className="flex items-center gap-2">
              <AtSign className="size-4 shrink-0 text-muted-foreground" />
              <input
                className={inputClass}
                dir="ltr"
                placeholder="https://instagram.com/amigocafe"
                value={form.instagram_url}
                onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
              />
            </div>
          </Field>
          <Field label="رابط تيك توك">
            <div className="flex items-center gap-2">
              <LinkIcon className="size-4 shrink-0 text-muted-foreground" />
              <input
                className={inputClass}
                dir="ltr"
                placeholder="https://tiktok.com/@amigocafe"
                value={form.tiktok_url}
                onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })}
              />
            </div>
          </Field>
          <Field label="رابط خرائط جوجل">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-muted-foreground" />
              <input
                className={inputClass}
                dir="ltr"
                placeholder="https://maps.app.goo.gl/..."
                value={form.maps_url}
                onChange={(e) => setForm({ ...form, maps_url: e.target.value })}
              />
            </div>
          </Field>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader
          title="موقع المكان على الخريطة"
          subtitle="الإحداثيات اللي تتحط هنا تحدد مكان الدبوس في قسم الموقع على الصفحة الرئيسية وفي بيانات السيو."
          action={<Badge tone="primary">يظهر في الخريطة</Badge>}
        />
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
          <Field label="خط العرض (Latitude)">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-muted-foreground" />
              <input
                className={inputClass}
                dir="ltr"
                inputMode="decimal"
                placeholder="30.2921145"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
              />
            </div>
          </Field>
          <Field label="خط الطول (Longitude)">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-muted-foreground" />
              <input
                className={inputClass}
                dir="ltr"
                inputMode="decimal"
                placeholder="31.743953"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
              />
            </div>
          </Field>
          <p className="text-xs leading-relaxed text-muted-foreground md:col-span-2">
            عشان تجيب الإحداثيات: افتح المكان على خرائط جوجل، اضغط كليك يمين على
            الدبوس، وأول رقمين هيظهروا هما خط العرض وخط الطول بالترتيب.
          </p>
        </div>
      </Card>

      <div className="lg:col-span-2">
        <SaveBar saving={isPending} saved={saved} onSave={save} />
      </div>
    </div>
  )
}

/* ─────────────────────────── Save Bar ─────────────────────────── */

function SaveBar({
  saving,
  saved,
  onSave,
}: {
  saving: boolean
  saved: boolean
  onSave: () => void
}) {
  return (
    <div className="flex items-center justify-end gap-3 rounded-lg border border-border bg-card px-5 py-4">
      {saved ? (
        <span className="inline-flex items-center gap-1.5 text-sm text-[oklch(0.5_0.13_150)] dark:text-[oklch(0.78_0.14_150)]">
          <Check className="size-4" /> تم الحفظ
        </span>
      ) : null}
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
      >
        {saving ? <Loader2 className="size-4 animate-spin" /> : null}
        حفظ التغييرات
      </button>
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, Share2, Check, Globe, Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/admin/image-upload"
import { Card, CardHeader, PageHeader, Badge, Toggle, Field, inputClass } from "@/components/admin/ui"
import type { SeoRow } from "@/lib/admin/types"
import { saveSeo, type SeoInput } from "@/lib/admin/actions"
import { cn } from "@/lib/utils"

export function SeoManager({ seo: initial }: { seo: SeoRow | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const [seo, setSeo] = useState({
    title_ar: initial?.title_ar ?? "",
    title_en: initial?.title_en ?? "",
    description_ar: initial?.description_ar ?? "",
    description_en: initial?.description_en ?? "",
    keywords: initial?.keywords ?? "",
    og_image: initial?.og_image ?? "/placeholder.svg",
    canonical: initial?.canonical ?? "",
    indexable: initial?.indexable ?? true,
  })

  const titleLen = seo.title_ar.length
  const descLen = seo.description_ar.length

  function save() {
    startTransition(async () => {
      const payload: SeoInput = { ...seo }
      const res = await saveSeo(payload)
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
    <>
      <PageHeader
        title="تحسين الظهور (SEO)"
        description="تحكّم في طريقة ظهور أميجو في جوجل ومواقع التواصل بالعربي والإنجليزي."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="البيانات الأساسية" subtitle="عنوان ووصف الصفحة" />
            <div className="flex flex-col gap-4 p-5">
              <Field label="عنوان الصفحة عربي (Title)" hint={`${titleLen} / 60 حرف — يفضّل أقل من 60`}>
                <input className={inputClass} value={seo.title_ar} onChange={(e) => setSeo({ ...seo, title_ar: e.target.value })} />
                <span className={cn("h-1 rounded-full", titleLen > 60 ? "bg-destructive" : "bg-primary")} style={{ width: `${Math.min((titleLen / 60) * 100, 100)}%` }} />
              </Field>
              <Field label="Page Title (English)">
                <input className={inputClass} dir="ltr" value={seo.title_en} onChange={(e) => setSeo({ ...seo, title_en: e.target.value })} />
              </Field>
              <Field label="الوصف عربي (Description)" hint={`${descLen} / 160 حرف — يفضّل أقل من 160`}>
                <textarea className={cn(inputClass, "min-h-24 resize-none")} value={seo.description_ar} onChange={(e) => setSeo({ ...seo, description_ar: e.target.value })} />
                <span className={cn("h-1 rounded-full", descLen > 160 ? "bg-destructive" : "bg-primary")} style={{ width: `${Math.min((descLen / 160) * 100, 100)}%` }} />
              </Field>
              <Field label="Description (English)">
                <textarea className={cn(inputClass, "min-h-24 resize-none")} dir="ltr" value={seo.description_en} onChange={(e) => setSeo({ ...seo, description_en: e.target.value })} />
              </Field>
              <Field label="الكلمات المفتاحية" hint="افصل بين الكلمات بفاصلة">
                <input className={inputClass} value={seo.keywords} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} />
              </Field>
            </div>
          </Card>

          <Card>
            <CardHeader title="إعدادات متقدمة" subtitle="الفهرسة والرابط الأساسي" />
            <div className="flex flex-col gap-4 p-5">
              <Field label="الرابط الأساسي (Canonical URL)">
                <input className={inputClass} dir="ltr" value={seo.canonical} onChange={(e) => setSeo({ ...seo, canonical: e.target.value })} />
              </Field>
              <Field label="صورة المشاركة (OG Image)">
                <ImageUpload
                  endpoint="seoImage"
                  value={seo.og_image}
                  onChange={(url) => setSeo({ ...seo, og_image: url })}
                  placeholder="ارفع صورة المشاركة على السوشيال ميديا"
                />
              </Field>
              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">السماح بالفهرسة</p>
                  <p className="text-xs text-muted-foreground">اسمح لمحركات البحث بفهرسة الموقع</p>
                </div>
                <Toggle checked={seo.indexable} onChange={(v) => setSeo({ ...seo, indexable: v })} label="السماح بالفهرسة" />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="معاينة جوجل" subtitle="كيف تظهر في نتائج البحث" action={<Search className="size-4 text-muted-foreground" />} />
            <div className="p-5">
              <div className="rounded-lg border border-border p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex size-6 items-center justify-center rounded-full bg-primary/12 text-primary">
                    <Globe className="size-3.5" />
                  </span>
                  <span dir="ltr" className="truncate">{seo.canonical}</span>
                </div>
                <p className="mt-1.5 text-lg text-[oklch(0.45_0.13_260)] line-clamp-1 dark:text-[oklch(0.72_0.12_260)]">{seo.title_ar}</p>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2 text-pretty">{seo.description_ar}</p>
              </div>
              {!seo.indexable ? (
                <div className="mt-3">
                  <Badge tone="warning">الفهرسة معطّلة — لن يظهر في جوجل</Badge>
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader title="بطاقة التواصل الاجتماعي" subtitle="عند المشاركة على فيسبوك / تويتر" action={<Share2 className="size-4 text-muted-foreground" />} />
            <div className="p-5">
              <div className="overflow-hidden rounded-lg border border-border">
                <div className="relative aspect-[1.91/1] w-full">
                  <Image src={seo.og_image || "/placeholder.svg"} alt="صورة المشاركة" fill sizes="500px" className="object-cover" />
                </div>
                <div className="bg-muted/40 px-4 py-3">
                  <p className="text-xs uppercase text-muted-foreground" dir="ltr">amigo.cafe</p>
                  <p className="mt-0.5 text-sm font-semibold text-foreground line-clamp-1">{seo.title_ar}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 text-pretty">{seo.description_ar}</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3 rounded-lg border border-border bg-card px-5 py-4">
            {saved ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-[oklch(0.5_0.13_150)] dark:text-[oklch(0.78_0.14_150)]">
                <Check className="size-4" /> تم الحفظ
              </span>
            ) : null}
            <button
              type="button"
              onClick={save}
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
              حفظ إعدادات SEO
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

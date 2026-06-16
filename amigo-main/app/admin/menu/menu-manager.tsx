"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Plus, Search, Pencil, Trash2, X, Loader2 } from "lucide-react"
import { Card, PageHeader, Badge, Toggle, Field, inputClass } from "@/components/admin/ui"
import { ImageUpload } from "@/components/admin/image-upload"
import { useAdminT } from "@/lib/i18n/admin-dict"
import { useLanguage } from "@/lib/i18n/language-context"
import type { MenuItemRow, CategoryRow } from "@/lib/admin/types"
import {
  saveMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  type MenuItemInput,
} from "@/lib/admin/actions"
import { cn } from "@/lib/utils"

type Draft = {
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
}

function emptyDraft(categories: CategoryRow[]): Draft {
  return {
    category_id: categories[0]?.id ?? null,
    name_ar: "",
    name_en: "",
    desc_ar: "",
    desc_en: "",
    price: 0,
    tags_ar: [],
    tags_en: [],
    image: "/placeholder.svg",
    available: true,
  }
}

export function MenuManager({
  initialItems,
  categories,
}: {
  initialItems: MenuItemRow[]
  categories: CategoryRow[]
}) {
  const router = useRouter()
  const tt = useAdminT()
  const { locale } = useLanguage()
  const isEn = locale === "en"
  const [query, setQuery] = useState("")
  const [activeCat, setActiveCat] = useState<string>("all")
  const [editing, setEditing] = useState<Draft | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const catName = (id: string | null) => {
    const c = categories.find((c) => c.id === id)
    if (!c) return tt("بدون تصنيف", "Uncategorized")
    return isEn ? c.name_en || c.name_ar : c.name_ar
  }
  const itemName = (it: MenuItemRow) => (isEn ? it.name_en || it.name_ar : it.name_ar)
  const itemDesc = (it: MenuItemRow) => (isEn ? it.desc_en || it.desc_ar : it.desc_ar)

  const filtered = useMemo(() => {
    return initialItems.filter((it) => {
      const matchCat = activeCat === "all" || it.category_id === activeCat
      const q = query.trim()
      const matchQuery =
        q === "" || it.name_ar.includes(q) || it.desc_ar.includes(q) || it.name_en.toLowerCase().includes(q.toLowerCase())
      return matchCat && matchQuery
    })
  }, [initialItems, query, activeCat])

  function handleToggle(item: MenuItemRow) {
    setPendingId(item.id)
    startTransition(async () => {
      await toggleMenuItemAvailability(item.id, !item.available)
      router.refresh()
      setPendingId(null)
    })
  }

  function handleDelete(id: string) {
    if (!confirm(tt("هل تريد حذف هذا الصنف نهائياً؟", "Delete this item permanently?"))) return
    setPendingId(id)
    startTransition(async () => {
      await deleteMenuItem(id)
      router.refresh()
      setPendingId(null)
    })
  }

  function handleSave(draft: Draft) {
    startTransition(async () => {
      const payload: MenuItemInput = { ...draft }
      const res = await saveMenuItem(payload)
      if (res.ok) {
        setEditing(null)
        router.refresh()
      } else {
        alert(res.error ?? tt("تعذّر الحفظ", "Could not save"))
      }
    })
  }

  return (
    <>
      <PageHeader
        title={tt("إدارة المنيو", "Menu Management")}
        description={tt(
          "أضف، عدّل، وتحكّم في توافر كل صنف. كل صنف يُحفظ بالعربي والإنجليزي ويظهر مباشرة في الموقع.",
          "Add, edit, and control the availability of each item. Every item is stored in Arabic and English and appears live on the site.",
        )}
        action={
          <button
            type="button"
            onClick={() => setEditing(emptyDraft(categories))}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            {tt("صنف جديد", "New Item")}
          </button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground rtl:right-3 ltr:left-3" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tt("ابحث عن صنف...", "Search items...")}
            className={cn(inputClass, "rtl:pr-9 ltr:pl-9")}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", ...categories.map((c) => c.id)].map((cat) => {
            const label = cat === "all" ? tt("الكل", "All") : catName(cat)
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCat(cat)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  activeCat === cat
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <Card key={item.id} className="flex flex-col overflow-hidden">
            <div className="relative h-40 w-full overflow-hidden">
              <Image src={item.image || "/placeholder.svg"} alt={itemName(item)} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
              <div className="absolute right-2 top-2 flex gap-1.5">
                {(isEn ? item.tags_en : item.tags_ar).map((tag) => (
                  <Badge key={tag} tone="primary" className="backdrop-blur">{tag}</Badge>
                ))}
              </div>
              {!item.available ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/70">
                  <Badge tone="danger">{tt("غير متاح", "Unavailable")}</Badge>
                </div>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-heading text-lg uppercase text-foreground">{itemName(item)}</h3>
                <span className="font-mono text-sm font-semibold text-primary">{Number(item.price).toFixed(2)} {tt("ج", "EGP")}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground text-pretty">{itemDesc(item)}</p>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-xs text-muted-foreground">{catName(item.category_id)}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{tt("متاح", "Available")}</span>
                  {pendingId === item.id && isPending ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Toggle checked={item.available} onChange={() => handleToggle(item)} label={tt("تبديل التوافر", "Toggle availability")} />
                  )}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setEditing({
                      id: item.id,
                      category_id: item.category_id,
                      name_ar: item.name_ar,
                      name_en: item.name_en,
                      desc_ar: item.desc_ar,
                      desc_en: item.desc_en,
                      price: Number(item.price),
                      tags_ar: item.tags_ar,
                      tags_en: item.tags_en,
                      image: item.image,
                      available: item.available,
                    })
                  }
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Pencil className="size-3.5" /> {tt("تعديل", "Edit")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  aria-label={tt(`حذف ${item.name_ar}`, `Delete ${item.name_en || item.name_ar}`)}
                  className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
          {tt("لا توجد أصناف مطابقة.", "No matching items.")}
        </div>
      ) : null}

      {editing ? (
        <ItemEditor
          draft={editing}
          categories={categories}
          saving={isPending}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      ) : null}
    </>
  )
}

function ItemEditor({
  draft: initial,
  categories,
  saving,
  onClose,
  onSave,
}: {
  draft: Draft
  categories: CategoryRow[]
  saving: boolean
  onClose: () => void
  onSave: (draft: Draft) => void
}) {
  const [draft, setDraft] = useState<Draft>(initial)
  const tt = useAdminT()
  const isNew = !initial.id

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative ms-auto flex h-full w-full max-w-md flex-col bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-heading text-xl uppercase text-foreground">
            {isNew ? tt("صنف جديد", "New Item") : tt("تعديل الصنف", "Edit Item")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={tt("إغلاق", "Close")}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <form
          className="flex flex-1 flex-col gap-4 overflow-y-auto p-5"
          onSubmit={(e) => {
            e.preventDefault()
            onSave(draft)
          }}
        >
          <Field label={tt("صورة الصنف", "Item Image")}>
            <ImageUpload
              endpoint="menuItemImage"
              value={draft.image}
              onChange={(url) => setDraft({ ...draft, image: url })}
            />
          </Field>

          <div className="grid grid-cols-1 gap-3">
            <Field label={tt("اسم الصنف (عربي)", "Name (Arabic)")}>
              <input className={inputClass} dir="rtl" value={draft.name_ar} onChange={(e) => setDraft({ ...draft, name_ar: e.target.value })} placeholder="كافيه دي أويا" required />
            </Field>
            <Field label={tt("اسم الصنف (إنجليزي)", "Name (English)")}>
              <input className={inputClass} dir="ltr" value={draft.name_en} onChange={(e) => setDraft({ ...draft, name_en: e.target.value })} placeholder="Cafe de Olla" />
            </Field>
          </div>

          <Field label={tt("الوصف (عربي)", "Description (Arabic)")}>
            <textarea className={cn(inputClass, "min-h-16 resize-none")} dir="rtl" value={draft.desc_ar} onChange={(e) => setDraft({ ...draft, desc_ar: e.target.value })} placeholder="وصف قصير للصنف" />
          </Field>
          <Field label={tt("الوصف (إنجليزي)", "Description (English)")}>
            <textarea className={cn(inputClass, "min-h-16 resize-none")} dir="ltr" value={draft.desc_en} onChange={(e) => setDraft({ ...draft, desc_en: e.target.value })} placeholder="Short description" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={tt("السعر (جنيه)", "Price (EGP)")}>
              <input
                type="number"
                step="0.5"
                min="0"
                className={inputClass}
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                required
              />
            </Field>
            <Field label={tt("التصنيف", "Category")}>
              <select
                className={inputClass}
                value={draft.category_id ?? ""}
                onChange={(e) => setDraft({ ...draft, category_id: e.target.value || null })}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{tt(c.name_ar, c.name_en || c.name_ar)}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label={tt("وسوم (عربي)", "Tags (Arabic)")} hint={tt("افصل بفاصلة", "comma separated")}>
              <input
                className={inputClass}
                dir="rtl"
                value={draft.tags_ar.join("، ")}
                onChange={(e) => setDraft({ ...draft, tags_ar: e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean) })}
                placeholder="المميز، بارد"
              />
            </Field>
            <Field label={tt("وسوم (إنجليزي)", "Tags (English)")} hint={tt("افصل بفاصلة", "comma separated")}>
              <input
                className={inputClass}
                dir="ltr"
                value={draft.tags_en.join(", ")}
                onChange={(e) => setDraft({ ...draft, tags_en: e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean) })}
                placeholder="Featured, Cold"
              />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
            <span className="text-sm font-medium text-foreground">{tt("متاح للطلب", "Available to order")}</span>
            <Toggle checked={draft.available} onChange={(v) => setDraft({ ...draft, available: v })} />
          </div>

          <div className="mt-auto flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {isNew ? tt("إضافة الصنف", "Add Item") : tt("حفظ التغييرات", "Save Changes")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {tt("إلغاء", "Cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, X, FolderTree, Loader2 } from "lucide-react"
import { Card, PageHeader, Badge, Toggle, Field, inputClass } from "@/components/admin/ui"
import { useAdminT } from "@/lib/i18n/admin-dict"
import { useLanguage } from "@/lib/i18n/language-context"
import type { CategoryRow } from "@/lib/admin/types"
import {
  saveCategory,
  deleteCategory,
  toggleCategoryActive,
  type CategoryInput,
} from "@/lib/admin/actions"
import { cn } from "@/lib/utils"

type CatWithCount = CategoryRow & { itemsCount: number }

type Draft = {
  id?: string
  slug: string
  name_ar: string
  name_en: string
  caption_ar: string
  caption_en: string
  active: boolean
  sort_order: number
}

function emptyDraft(nextOrder: number): Draft {
  return {
    slug: "",
    name_ar: "",
    name_en: "",
    caption_ar: "",
    caption_en: "",
    active: true,
    sort_order: nextOrder,
  }
}

export function CategoriesManager({
  initialCategories,
}: {
  initialCategories: CatWithCount[]
}) {
  const router = useRouter()
  const tt = useAdminT()
  const { locale } = useLanguage()
  const isEn = locale === "en"
  const catName = (c: CatWithCount) => (isEn ? c.name_en || c.name_ar : c.name_ar)
  const catCaption = (c: CatWithCount) => (isEn ? c.caption_en || c.caption_ar : c.caption_ar)
  const [editing, setEditing] = useState<Draft | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleToggle(cat: CatWithCount) {
    setPendingId(cat.id)
    startTransition(async () => {
      await toggleCategoryActive(cat.id, !cat.active)
      router.refresh()
      setPendingId(null)
    })
  }

  function handleDelete(cat: CatWithCount) {
    if (cat.itemsCount > 0) {
      alert(tt("لا يمكن حذف تصنيف يحتوي على أصناف. انقل الأصناف أولاً.", "Can't delete a category that contains items. Move the items first."))
      return
    }
    if (!confirm(tt("هل تريد حذف هذا التصنيف؟", "Delete this category?"))) return
    setPendingId(cat.id)
    startTransition(async () => {
      await deleteCategory(cat.id)
      router.refresh()
      setPendingId(null)
    })
  }

  function handleSave(draft: Draft) {
    startTransition(async () => {
      const payload: CategoryInput = { ...draft }
      const res = await saveCategory(payload)
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
        title={tt("التصنيفات", "Categories")}
        description={tt(
          "نظّم أقسام المنيو وترتيب ظهورها. كل صنف لازم ينتمي لتصنيف عشان المنيو يطلع مرتب.",
          "Organize your menu sections and their display order. Every item must belong to a category so the menu stays tidy.",
        )}
        action={
          <button
            type="button"
            onClick={() => setEditing(emptyDraft(initialCategories.length))}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Plus className="size-4" />
            {tt("تصنيف جديد", "New Category")}
          </button>
        }
      />

      <Card>
        <ul className="divide-y divide-border">
          {initialCategories.map((cat) => (
            <li key={cat.id} className="flex items-center gap-3 px-4 py-3.5 md:px-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
                <FolderTree className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-heading text-base uppercase text-foreground">{catName(cat)}</h3>
                  <span className="font-mono text-xs text-muted-foreground">/{cat.slug}</span>
                  {cat.active ? (
                    <Badge tone="success">{tt("مفعّل", "Active")}</Badge>
                  ) : (
                    <Badge tone="neutral">{tt("مخفي", "Hidden")}</Badge>
                  )}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{catCaption(cat)}</p>
              </div>

              <span className="hidden shrink-0 text-center sm:block">
                <span className="block font-mono text-lg tabular-nums text-foreground">{cat.itemsCount}</span>
                <span className="text-[11px] text-muted-foreground">{tt("صنف", "items")}</span>
              </span>

              <div className="flex shrink-0 items-center gap-2">
                {pendingId === cat.id && isPending ? (
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  <Toggle checked={cat.active} onChange={() => handleToggle(cat)} label={tt("تفعيل التصنيف", "Toggle category")} />
                )}
                <button
                  type="button"
                  onClick={() =>
                    setEditing({
                      id: cat.id,
                      slug: cat.slug,
                      name_ar: cat.name_ar,
                      name_en: cat.name_en,
                      caption_ar: cat.caption_ar,
                      caption_en: cat.caption_en,
                      active: cat.active,
                      sort_order: cat.sort_order,
                    })
                  }
                  aria-label={tt(`تعديل ${cat.name_ar}`, `Edit ${cat.name_en || cat.name_ar}`)}
                  className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat)}
                  aria-label={tt(`حذف ${cat.name_ar}`, `Delete ${cat.name_en || cat.name_ar}`)}
                  className="flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {editing ? (
        <CategoryEditor
          draft={editing}
          saving={isPending}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      ) : null}
    </>
  )
}

function CategoryEditor({
  draft: initial,
  saving,
  onClose,
  onSave,
}: {
  draft: Draft
  saving: boolean
  onClose: () => void
  onSave: (cat: Draft) => void
}) {
  const [draft, setDraft] = useState<Draft>(initial)
  const isNew = !initial.id

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative ml-auto flex h-full w-full max-w-md flex-col bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-heading text-xl uppercase text-foreground">
            {isNew ? "تصنيف جديد" : "تعديل التصنيف"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
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
          <Field label="اسم التصنيف (عربي)">
            <input className={inputClass} value={draft.name_ar} onChange={(e) => setDraft({ ...draft, name_ar: e.target.value })} placeholder="مشروبات باردة" required />
          </Field>
          <Field label="اسم التصنيف (إنجليزي)">
            <input className={inputClass} dir="ltr" value={draft.name_en} onChange={(e) => setDraft({ ...draft, name_en: e.target.value })} placeholder="Cold Drinks" />
          </Field>

          <Field label="المعرّف (slug)" hint="يُستخدم في الرابط — إنجليزي وبدون مسافات">
            <input className={inputClass} value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} placeholder="cold-drinks" dir="ltr" required />
          </Field>

          <Field label="وصف مختصر (عربي)">
            <input className={inputClass} value={draft.caption_ar} onChange={(e) => setDraft({ ...draft, caption_ar: e.target.value })} placeholder="منعشة على طول اليوم" />
          </Field>
          <Field label="وصف مختصر (إنجليزي)">
            <input className={inputClass} dir="ltr" value={draft.caption_en} onChange={(e) => setDraft({ ...draft, caption_en: e.target.value })} placeholder="Refreshing all day" />
          </Field>

          <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
            <span className="text-sm font-medium text-foreground">مفعّل ويظهر في المنيو</span>
            <Toggle checked={draft.active} onChange={(v) => setDraft({ ...draft, active: v })} />
          </div>

          <div className="mt-auto flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {isNew ? "إضافة التصنيف" : "حفظ التغييرات"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

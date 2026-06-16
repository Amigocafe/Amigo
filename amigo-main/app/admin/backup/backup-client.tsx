"use client"

import { useRef, useState } from "react"
import { Download, Upload, ShieldCheck, AlertTriangle, Loader2, FileJson, CheckCircle2 } from "lucide-react"
import { PageHeader, Card, CardHeader, Badge } from "@/components/admin/ui"
import { exportBackup, restoreBackup } from "@/lib/admin/actions"

type Status =
  | { kind: "idle" }
  | { kind: "loading"; message: string }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }

const BACKED_UP = [
  "التصنيفات",
  "أصناف المنيو",
  "محتوى الصفحة الرئيسية",
  "إعدادات الـ SEO",
  "إعدادات الموقع",
  "الإشعارات",
]

export function BackupClient() {
  const [exportState, setExportState] = useState<Status>({ kind: "idle" })
  const [restoreState, setRestoreState] = useState<Status>({ kind: "idle" })
  const [pendingFile, setPendingFile] = useState<{ name: string; data: unknown } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    setExportState({ kind: "loading", message: "جاري تجهيز النسخة..." })
    const res = await exportBackup()
    if (!res.ok) {
      setExportState({ kind: "error", message: res.error })
      return
    }
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")
    a.href = url
    a.download = `amigo-backup-${stamp}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setExportState({ kind: "success", message: "تم تنزيل النسخة الاحتياطية بنجاح." })
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setRestoreState({ kind: "idle" })
    setPendingFile(null)
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (parsed?.type !== "amigo-backup") {
          setRestoreState({ kind: "error", message: "هذا ليس ملف نسخة احتياطية صالح لأميجو." })
          return
        }
        setPendingFile({ name: file.name, data: parsed })
      } catch {
        setRestoreState({ kind: "error", message: "تعذّر قراءة الملف. تأكد أنه ملف JSON صحيح." })
      }
    }
    reader.readAsText(file)
  }

  async function handleRestore() {
    if (!pendingFile) return
    setRestoreState({ kind: "loading", message: "جاري استعادة البيانات..." })
    const res = await restoreBackup(pendingFile.data)
    if (!res.ok) {
      setRestoreState({ kind: "error", message: res.error ?? "حدث خطأ غير متوقع." })
      return
    }
    setRestoreState({ kind: "success", message: "تمت استعادة البيانات بنجاح. تم تحديث الموقع." })
    setPendingFile(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <>
      <PageHeader
        title="النسخ الاحتياطي والاستعادة"
        description="نزّل نسخة كاملة من محتوى الموقع بصيغة JSON، أو استعد بياناتك من نسخة محفوظة مسبقاً."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Export */}
        <Card>
          <CardHeader
            title="تنزيل نسخة احتياطية"
            subtitle="ملف JSON يحتوي على كل محتوى الموقع القابل للتعديل."
            action={<Badge tone="primary"><FileJson className="size-3" /> JSON</Badge>}
          />
          <div className="flex flex-col gap-4 p-5">
            <div className="flex flex-wrap gap-2">
              {BACKED_UP.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                >
                  <CheckCircle2 className="size-3.5 text-primary" />
                  {label}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={exportState.kind === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {exportState.kind === "loading" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              تنزيل النسخة الآن
            </button>

            <StatusNote status={exportState} />
          </div>
        </Card>

        {/* Restore */}
        <Card>
          <CardHeader
            title="استعادة من ملف"
            subtitle="اختر ملف نسخة احتياطية (.json) لاستبدال البيانات الحالية."
            action={<Badge tone="warning"><AlertTriangle className="size-3" /> حساس</Badge>}
          />
          <div className="flex flex-col gap-4 p-5">
            <div className="rounded-md border border-[oklch(0.7_0.15_70_/_30%)] bg-[oklch(0.7_0.15_70_/_10%)] p-3 text-xs leading-relaxed text-[oklch(0.5_0.13_55)] dark:text-[oklch(0.82_0.14_75)]">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="size-3.5" /> تنبيه
              </span>
              <p className="mt-1">
                الاستعادة ستستبدل المحتوى الحالي بالكامل (التصنيفات، المنيو، المحتوى، الإعدادات،
                الإشعارات). يُفضّل تنزيل نسخة احتياطية أولاً قبل المتابعة.
              </p>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFilePick}
              className="block w-full cursor-pointer rounded-md border border-input bg-background text-sm text-muted-foreground file:mr-3 file:cursor-pointer file:border-0 file:bg-muted file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-foreground hover:file:bg-muted/70"
            />

            {pendingFile ? (
              <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                <FileJson className="size-4 text-primary" />
                <span className="truncate text-foreground">{pendingFile.name}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">جاهز للاستعادة</span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleRestore}
              disabled={!pendingFile || restoreState.kind === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {restoreState.kind === "loading" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              استعادة البيانات
            </button>

            <StatusNote status={restoreState} />
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-start gap-3 p-5">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            ملف النسخة الاحتياطية يُحفظ على جهازك فقط بصيغة JSON. لا يتضمّن بيانات تسجيل الدخول أو
            كلمات المرور. احتفظ به في مكان آمن، ويمكنك استخدامه لنقل المحتوى أو استرجاعه في أي وقت.
          </p>
        </div>
      </Card>
    </>
  )
}

function StatusNote({ status }: { status: Status }) {
  if (status.kind === "idle" || status.kind === "loading") {
    if (status.kind === "loading") {
      return (
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> {status.message}
        </p>
      )
    }
    return null
  }
  if (status.kind === "success") {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-[oklch(0.55_0.13_150)] dark:text-[oklch(0.78_0.14_150)]">
        <CheckCircle2 className="size-4" /> {status.message}
      </p>
    )
  }
  return (
    <p className="inline-flex items-center gap-2 text-sm text-destructive">
      <AlertTriangle className="size-4" /> {status.message}
    </p>
  )
}

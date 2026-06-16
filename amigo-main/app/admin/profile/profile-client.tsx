"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Mail, Phone, Calendar, ShieldCheck,
  KeyRound, Check, Loader2, Monitor, Eye, EyeOff,
} from "lucide-react"
import { Card, CardHeader, PageHeader, Badge, Field, inputClass } from "@/components/admin/ui"
import { ImageUpload } from "@/components/admin/image-upload"
import { saveProfile, changePassword } from "@/lib/admin/actions"
import { cn } from "@/lib/utils"

type ProfileDraft = {
  name: string
  role: string
  phone: string
  avatar: string
}

function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
}

export function ProfileClient({
  initialProfile,
  email,
  joinedAt,
}: {
  initialProfile: ProfileDraft
  email: string
  joinedAt: string
}) {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileDraft>(initialProfile)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [isPending, startTransition] = useTransition()

  // Password change
  const [pwOpen, setPwOpen] = useState(false)
  const [pw, setPw] = useState("")
  const [pwConfirm, setPwConfirm] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState("")
  const [pwPending, startPwTransition] = useTransition()

  function handleSave() {
    setSaveError("")
    startTransition(async () => {
      const res = await saveProfile(profile)
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
        router.refresh()
      } else {
        setSaveError(res.error ?? "تعذّر الحفظ")
      }
    })
  }

  function handlePasswordSave() {
    setPwError("")
    if (pw !== pwConfirm) { setPwError("كلمتا المرور غير متطابقتين"); return }
    startPwTransition(async () => {
      const res = await changePassword(pw)
      if (res.ok) {
        setPwSaved(true)
        setPw(""); setPwConfirm("")
        setTimeout(() => { setPwSaved(false); setPwOpen(false) }, 2000)
      } else {
        setPwError(res.error ?? "تعذّر تغيير كلمة المرور")
      }
    })
  }

  return (
    <>
      <PageHeader
        title="الملف الشخصي"
        description="بيانات حسابك والأمان — كل تعديل يُحفظ مباشرة في قاعدة البيانات."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Identity card */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center p-6 text-center">
            <div className="relative">
              <span className="relative block size-24 overflow-hidden rounded-full border-2 border-primary/30">
                <Image
                  src={profile.avatar || "/placeholder-user.jpg"}
                  alt={profile.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </span>
            </div>
            <h2 className="mt-4 font-heading text-2xl uppercase text-foreground">{profile.name || "—"}</h2>
            <div className="mt-2">
              <Badge tone="primary">
                <ShieldCheck className="size-3" /> {profile.role}
              </Badge>
            </div>
            <ul className="mt-5 flex w-full flex-col gap-3 text-sm">
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span dir="ltr" className="truncate">{email}</span>
              </li>
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="size-4 shrink-0" />
                <span dir="ltr">{profile.phone || "—"}</span>
              </li>
              <li className="flex items-center gap-2.5 text-muted-foreground">
                <Calendar className="size-4 shrink-0" />
                <span>{formatJoined(joinedAt)}</span>
              </li>
            </ul>
          </div>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Edit card */}
          <Card>
            <CardHeader title="تعديل البيانات" subtitle="حدّث معلوماتك الشخصية" />
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
              <Field label="الاسم">
                <input
                  className={inputClass}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="اسمك الكامل"
                />
              </Field>
              <Field label="الدور">
                <input
                  className={cn(inputClass, "opacity-60 cursor-not-allowed")}
                  value={profile.role}
                  disabled
                  title="الدور يُحدَّد من قِبل المسؤول"
                />
              </Field>
              <Field label="البريد الإلكتروني">
                <input
                  className={cn(inputClass, "opacity-60 cursor-not-allowed")}
                  dir="ltr"
                  value={email}
                  disabled
                  title="يُعدَّل من إعدادات Supabase Auth"
                />
              </Field>
              <Field label="رقم الهاتف">
                <input
                  className={inputClass}
                  dir="ltr"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+20 100 000 0000"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="صورة الملف الشخصي">
                  <ImageUpload
                    endpoint="profileAvatar"
                    value={profile.avatar}
                    onChange={(url) => setProfile({ ...profile, avatar: url })}
                  />
                </Field>
              </div>
              {saveError ? (
                <p className="sm:col-span-2 text-sm text-destructive">{saveError}</p>
              ) : null}
              <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-1">
                {saved ? (
                  <span className="inline-flex items-center gap-1.5 text-sm text-[oklch(0.5_0.13_150)] dark:text-[oklch(0.78_0.14_150)]">
                    <Check className="size-4" /> تم الحفظ
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isPending}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  حفظ التغييرات
                </button>
              </div>
            </div>
          </Card>

          {/* Security card */}
          <Card>
            <CardHeader title="الأمان" subtitle="كلمة المرور والحساب" />
            <div className="flex flex-col gap-3 p-5">
              <button
                type="button"
                onClick={() => { setPwOpen((o) => !o); setPwError("") }}
                className="flex items-center justify-between rounded-md border border-border px-4 py-3 text-start transition-colors hover:bg-muted"
              >
                <span className="flex items-center gap-3">
                  <KeyRound className="size-5 text-muted-foreground" />
                  <span>
                    <span className="block text-sm font-medium text-foreground">تغيير كلمة المرور</span>
                    <span className="block text-xs text-muted-foreground">استخدم كلمة مرور قوية لحماية حسابك</span>
                  </span>
                </span>
                <span className="text-sm text-primary">{pwOpen ? "إغلاق" : "تغيير"}</span>
              </button>

              {pwOpen ? (
                <div className="flex flex-col gap-3 rounded-md border border-border p-4">
                  <Field label="كلمة المرور الجديدة">
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        className={cn(inputClass, "pl-10")}
                        dir="ltr"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        placeholder="••••••••"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        tabIndex={-1}
                      >
                        {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field label="تأكيد كلمة المرور">
                    <input
                      type="password"
                      className={inputClass}
                      dir="ltr"
                      value={pwConfirm}
                      onChange={(e) => setPwConfirm(e.target.value)}
                      placeholder="••••••••"
                    />
                  </Field>
                  {pwError ? <p className="text-sm text-destructive">{pwError}</p> : null}
                  {pwSaved ? (
                    <p className="inline-flex items-center gap-1.5 text-sm text-[oklch(0.5_0.13_150)] dark:text-[oklch(0.78_0.14_150)]">
                      <Check className="size-4" /> تم تغيير كلمة المرور بنجاح
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={handlePasswordSave}
                    disabled={pwPending || !pw}
                    className="inline-flex items-center justify-center gap-2 self-end rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                  >
                    {pwPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    حفظ كلمة المرور
                  </button>
                </div>
              ) : null}

              <div className="flex items-center gap-3 rounded-md border border-border px-4 py-3">
                <Monitor className="size-5 text-muted-foreground" />
                <span>
                  <span className="block text-sm font-medium text-foreground">الجلسة الحالية</span>
                  <span className="block text-xs text-muted-foreground">أنت مسجّل الدخول الآن عبر هذا الجهاز.</span>
                </span>
                <Badge tone="success" className="mr-auto">نشطة</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

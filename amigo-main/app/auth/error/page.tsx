import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div
      dir="rtl"
      lang="ar"
      className="flex min-h-svh w-full items-center justify-center bg-background px-6 text-foreground"
    >
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center">
        <h1 className="font-heading text-2xl uppercase text-card-foreground">حدث خطأ</h1>
        <p className="mt-2 text-sm text-muted-foreground text-pretty">
          تعذّر إكمال عملية المصادقة. حاول تسجيل الدخول مرة أخرى.
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          العودة لتسجيل الدخول
        </Link>
      </div>
    </div>
  )
}

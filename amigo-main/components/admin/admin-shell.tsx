'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  PencilRuler,
  Bell,
  Globe,
  QrCode,
  MessageSquareWarning,
  DatabaseBackup,
  UserRound,
  Search,
  Menu as MenuIcon,
  X,
  Sun,
  Moon,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/lib/i18n/language-context'
import { signOut } from '@/lib/admin/actions'

const NAV = [
  { href: '/admin', label: 'الرئيسية', labelEn: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/menu', label: 'المنيو', labelEn: 'Menu', icon: UtensilsCrossed },
  { href: '/admin/categories', label: 'التصنيفات', labelEn: 'Categories', icon: FolderTree },
  { href: '/admin/content', label: 'المحتوى والإعدادات', labelEn: 'Content & Settings', icon: PencilRuler },
  { href: '/admin/notifications', label: 'الإشعارات', labelEn: 'Notifications', icon: Bell },
  { href: '/admin/seo', label: 'تحسين الظهور (SEO)', labelEn: 'SEO', icon: Globe },
  { href: '/admin/qr', label: 'أكواد QR والروابط', labelEn: 'QR & Links', icon: QrCode },
  { href: '/admin/feedback', label: 'الشكاوى والمقترحات', labelEn: 'Feedback', icon: MessageSquareWarning, badge: 'feedback' as const },
  { href: '/admin/backup', label: 'النسخ الاحتياطي', labelEn: 'Backup', icon: DatabaseBackup },
  { href: '/admin/profile', label: 'الملف الشخصي', labelEn: 'Profile', icon: UserRound },
] as const

// Bilingual UI strings for the admin shell chrome.
const SHELL_T = {
  ar: {
    panel: 'لوحة التحكم',
    viewSite: 'عرض الموقع',
    signOut: 'تسجيل الخروج',
    search: 'ابحث في اللوحة...',
    toggleTheme: 'تبديل سمة الألوان',
    toggleLang: 'تبديل لغة الموقع',
    notifications: 'الإشعارات',
    openMenu: 'فتح القائمة',
    closeMenu: 'إغلاق القائمة',
  },
  en: {
    panel: 'Control Panel',
    viewSite: 'View Site',
    signOut: 'Sign Out',
    search: 'Search the panel...',
    toggleTheme: 'Toggle color theme',
    toggleLang: 'Toggle site language',
    notifications: 'Notifications',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
} as const

function NavLinks({
  onNavigate,
  feedbackCount,
}: {
  onNavigate?: () => void
  feedbackCount: number
}) {
  const pathname = usePathname()
  const { locale } = useLanguage()
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {NAV.map((item) => {
        const active =
          item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)
        const Icon = item.icon
        const count = 'badge' in item && item.badge === 'feedback' ? feedbackCount : 0
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden="true" />
            <span className="truncate">{locale === 'en' ? item.labelEn : item.label}</span>
            {count > 0 && (
              <span className="ms-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-destructive-foreground">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarContent({
  onNavigate,
  feedbackCount,
}: {
  onNavigate?: () => void
  feedbackCount: number
}) {
  const { locale } = useLanguage()
  const t = SHELL_T[locale]
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground font-heading text-lg">
          A
        </span>
        <div className="leading-tight">
          <p className="font-heading text-lg uppercase text-sidebar-foreground">
            {locale === 'en' ? 'AMIGO' : 'أميجو'}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/50">
            {t.panel}
          </p>
        </div>
      </div>

      <NavLinks onNavigate={onNavigate} feedbackCount={feedbackCount} />

      <div className="mt-auto p-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <ExternalLink className="size-[18px] shrink-0" aria-hidden="true" />
          <span>{t.viewSite}</span>
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-destructive/15 hover:text-destructive"
          >
            <LogOut className="size-[18px] shrink-0" aria-hidden="true" />
            <span>{t.signOut}</span>
          </button>
        </form>
      </div>
    </div>
  )
}

function ThemeButton() {
  const { theme, setTheme } = useTheme()
  const { locale } = useLanguage()
  const isDark = theme !== 'light'
  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={SHELL_T[locale].toggleTheme}
      className="flex size-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted"
    >
      {isDark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  )
}

function LanguageButton() {
  const { locale, toggleLocale } = useLanguage()
  return (
    <button
      type="button"
      onClick={toggleLocale}
      aria-label={SHELL_T[locale].toggleLang}
      title={SHELL_T[locale].toggleLang}
      className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-foreground transition-colors hover:bg-muted"
    >
      <Globe className="size-[18px]" />
      <span className="font-mono text-xs font-semibold">
        {locale === 'ar' ? 'EN' : 'ع'}
      </span>
    </button>
  )
}

export function AdminShell({
  children,
  profileName,
  profileAvatar,
  profileEmail,
  unreadCount,
  feedbackCount = 0,
}: {
  children: React.ReactNode
  profileName: string
  profileAvatar: string
  profileEmail: string
  unreadCount: number
  feedbackCount?: number
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { locale, dir } = useLanguage()
  const t = SHELL_T[locale]
  const isRtl = dir === 'rtl'

  return (
    <div
      dir={dir}
      lang={locale}
      data-admin-panel
      className="min-h-screen bg-background text-foreground"
    >
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 z-30 hidden w-64 lg:block',
          isRtl ? 'right-0 border-l border-sidebar-border' : 'left-0 border-r border-sidebar-border',
        )}
      >
        <SidebarContent feedbackCount={feedbackCount} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            className={cn(
              'absolute inset-y-0 w-64 shadow-xl',
              isRtl ? 'right-0 border-l border-sidebar-border' : 'left-0 border-r border-sidebar-border',
            )}
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label={t.closeMenu}
              className={cn(
                'absolute top-4 z-10 flex size-8 items-center justify-center rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent',
                isRtl ? 'left-3' : 'right-3',
              )}
            >
              <X className="size-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} feedbackCount={feedbackCount} />
          </div>
        </div>
      ) : null}

      <div className={isRtl ? 'lg:mr-64' : 'lg:ml-64'}>
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={t.openMenu}
            className="flex size-9 items-center justify-center rounded-md border border-border text-foreground hover:bg-muted lg:hidden"
          >
            <MenuIcon className="size-5" />
          </button>

          <div className="relative hidden flex-1 max-w-sm sm:block">
            <Search
              className={cn(
                'absolute top-1/2 size-4 -translate-y-1/2 text-muted-foreground',
                isRtl ? 'right-3' : 'left-3',
              )}
            />
            <input
              type="search"
              placeholder={t.search}
              className={cn(
                'w-full rounded-md border border-input bg-background py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40',
                isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3',
              )}
            />
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
            <LanguageButton />
            <ThemeButton />
            <Link
              href="/admin/notifications"
              aria-label={t.notifications}
              className="relative flex size-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-muted"
            >
              <Bell className="size-[18px]" />
              {unreadCount > 0 ? (
                <span className={cn(
                  'absolute -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground',
                  isRtl ? '-right-0.5' : '-left-0.5',
                )}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              ) : null}
            </Link>
            <Link
              href="/admin/profile"
              className="flex items-center gap-2 rounded-md border border-border bg-background py-1 pr-1 pl-2.5 transition-colors hover:bg-muted"
            >
              <span className="relative size-7 overflow-hidden rounded-full">
                <Image src={profileAvatar || '/placeholder-user.jpg'} alt="" fill sizes="28px" className="object-cover" />
              </span>
              <span className="hidden text-sm font-medium md:inline">{profileName}</span>
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

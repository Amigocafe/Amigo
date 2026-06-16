import { Analytics } from '@vercel/analytics/next'
import { cookies } from 'next/headers'
import type { Metadata, Viewport } from 'next'
import { Anton, DM_Sans, Cairo } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/lib/i18n/language-context'
import { SiteDataProvider } from '@/lib/i18n/site-content'
import { getCategories, getMenuItems, getHomepage, getSiteSettings, getSeo } from '@/lib/admin/queries'
import type { Locale } from '@/lib/i18n/translations'
import { resolveSiteUrl } from '@/lib/seo/site'
import './globals.css'

const anton = Anton({
  variable: '--font-anton',
  weight: '400',
  subsets: ['latin'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
})

// Cairo powers the entire Arabic experience — display weights for headings and
// lighter weights for body/UI text, so the whole site shares one Arabic face.
const cairo = Cairo({
  variable: '--font-cairo',
  weight: ['400', '500', '600', '700', '900'],
  subsets: ['arabic', 'latin'],
})

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const ar = cookieStore.get('amigo-locale')?.value === 'ar'
  const seo = await getSeo()
  const siteUrl = resolveSiteUrl(seo)

  const brand = ar ? 'أميجو كافيه' : 'Amigo Cafe'
  const title = seo
    ? (ar ? seo.title_ar : seo.title_en) || seo.title_en || seo.title_ar
    : 'Amigo Cafe — Where Every Cup Is a Story'
  const description = seo
    ? (ar ? seo.description_ar : seo.description_en) ||
      seo.description_en ||
      seo.description_ar
    : 'Amigo Cafe. Specialty coffee roasted with soul. Step inside, slow down, and taste the journey from bean to cup.'
  const ogImage = seo?.og_image || '/images/interior.webp'
  const indexable = !seo || seo.indexable

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s — ${brand}`,
    },
    description,
    generator: 'v0.app',
    applicationName: brand,
    keywords: seo?.keywords
      ? seo.keywords.split(/[,،]/).map((k) => k.trim()).filter(Boolean)
      : undefined,
    authors: [{ name: brand }],
    creator: brand,
    publisher: brand,
    alternates: {
      canonical: seo?.canonical || siteUrl,
      languages: {
        ar: siteUrl,
        en: siteUrl,
        'x-default': siteUrl,
      },
    },
    verification: {
      google: 'GCbSHN7owNKc6IxTDdqq7pXTGkNA8AMCM5TqtJ6oxJY',
    },
    robots: indexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        }
      : { index: false, follow: false },
    openGraph: {
      type: 'website',
      siteName: brand,
      locale: ar ? 'ar_EG' : 'en_US',
      alternateLocale: ar ? 'en_US' : 'ar_EG',
      url: siteUrl,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: brand }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
    },
  }
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#241a12' },
    { media: '(prefers-color-scheme: light)', color: '#f3ece2' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Read the persisted locale on the server so the correct language + direction
  // are rendered in the initial HTML — no flash of English, no client revert.
  const cookieStore = await cookies()
  const stored = cookieStore.get('amigo-locale')?.value

  // Live content from Supabase, rendered into the initial HTML. Each query
  // already fails soft (returns [] / null), so the site falls back to the
  // bundled static copy if the DB is unreachable.
  const [categories, menuItems, homepage, site] = await Promise.all([
    getCategories(),
    getMenuItems(),
    getHomepage(),
    getSiteSettings(),
  ])
  const siteData = { categories, menuItems, homepage, site }

  // Apply site settings: locale from cookie (user preference) overrides DB default.
  const dbLocale = site?.default_locale ?? 'ar'
  const locale: Locale = stored === 'ar' || stored === 'en' ? (stored as Locale) : dbLocale
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const defaultTheme = site?.default_theme ?? 'dark'
  const primaryColor = site?.primary_color

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${anton.variable} ${dmSans.variable} ${cairo.variable} bg-background`}
    >
      {primaryColor && (
        <head>
          <style>{`:root { --caramel: ${primaryColor}; } .dark { --caramel: ${primaryColor}; }`}</style>
        </head>
      )}
      <body className="font-sans antialiased grain">
        <ThemeProvider
          attribute="class"
          defaultTheme={defaultTheme}
          enableSystem={false}
          disableTransitionOnChange
        >
          <LanguageProvider initialLocale={locale}>
            <SiteDataProvider data={siteData}>{children}</SiteDataProvider>
          </LanguageProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

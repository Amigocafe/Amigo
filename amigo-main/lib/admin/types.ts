// Shared DB row types for the Amigo backend (Supabase).
// Every editable entity stores both Arabic and English text.

export type CategoryRow = {
  id: string
  slug: string
  name_ar: string
  name_en: string
  caption_ar: string
  caption_en: string
  sort_order: number
  active: boolean
  created_at: string
}

export type MenuItemRow = {
  id: string
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
  sort_order: number
  created_at: string
}

export type HeroContent = {
  titleTop: string
  titleBottom: string
  titleTopEn: string
  titleBottomEn: string
  tagline: string
  taglineEn: string
  image: string
}

export type VibeContent = {
  manifesto: string
  manifestoEn: string
}

export type MarqueeContent = {
  items_ar: string[]
  items_en: string[]
}

export type JourneyChapter = {
  title_ar: string
  body_ar: string
  title_en: string
  body_en: string
}

export type JourneyContent = {
  chapters: JourneyChapter[]
}

export type PsRate = {
  label_ar: string
  label_en: string
  price: string
}

export type PlaystationContent = {
  titleTop_ar: string
  titleBottom_ar: string
  titleTop_en: string
  titleBottom_en: string
  caption_ar: string
  caption_en: string
  rates: PsRate[]
}

export type LocationContent = {
  title: string
  titleEn: string
  address: string
  addressEn: string
  hours: string
  hoursEn: string
}

export type HomepageRow = {
  id: number
  hero: HeroContent
  vibe: VibeContent
  location: LocationContent
  gallery: string[]
  marquee?: MarqueeContent
  journey?: JourneyContent
  playstation?: PlaystationContent
  updated_at: string
}

export type SeoRow = {
  id: number
  title_ar: string
  title_en: string
  description_ar: string
  description_en: string
  keywords: string
  og_image: string
  canonical: string
  indexable: boolean
  updated_at: string
}

export type SiteSettingsRow = {
  id: number
  brand_name: string
  default_locale: 'ar' | 'en'
  default_theme: 'dark' | 'light'
  primary_color: string
  logo: string
  notification_prefs: NotificationPrefs
  /* Contact & social profiles — surfaced in the footer and SEO `sameAs`. */
  contact_email: string
  facebook_url: string
  instagram_url: string
  tiktok_url: string
  whatsapp: string
  maps_url: string
  /* Map pin coordinates shown on the public location section. */
  latitude: number
  longitude: number
  updated_at: string
}

export type NotificationPrefs = {
  orders: boolean
  reviews: boolean
  alerts: boolean
  system: boolean
}

export type NotificationTone = 'order' | 'system' | 'review' | 'alert'

export type NotificationRow = {
  id: string
  title: string
  body: string
  tone: NotificationTone
  read: boolean
  created_at: string
}

export type ActivityKind = 'order' | 'edit' | 'user' | 'alert'

export type ActivityRow = {
  id: string
  kind: ActivityKind
  message: string
  created_at: string
}

export type ProfileRow = {
  id: string
  name: string
  role: string
  phone: string
  avatar: string
  created_at: string
}

/* ----------------------------- Feedback ------------------------------- */

export type FeedbackType = 'complaint' | 'suggestion'
export type FeedbackContactMethod = 'none' | 'phone' | 'whatsapp' | 'email' | 'instagram'
export type FeedbackStatus = 'new' | 'in_progress' | 'resolved'

export type FeedbackRow = {
  id: string
  type: FeedbackType
  name: string
  contact_method: FeedbackContactMethod
  contact_value: string
  message: string
  status: FeedbackStatus
  created_at: string
}

/* ----------------------------- QR / Links ----------------------------- */

export type LinkPlatform =
  | 'qr'
  | 'facebook'
  | 'instagram'
  | 'whatsapp'
  | 'tiktok'
  | 'x'
  | 'snapchat'
  | 'google'
  | 'other'

export type TrackedLinkRow = {
  id: string
  slug: string
  label: string
  platform: LinkPlatform
  destination: string
  is_qr: boolean
  active: boolean
  created_at: string
}

export type LinkEventRow = {
  id: string
  link_id: string
  type: 'scan' | 'click'
  device: string | null
  locale: string | null
  referrer: string | null
  session_id: string | null
  created_at: string
}

/** Per-link aggregated stats, plus the link itself. */
export type LinkStats = {
  link: TrackedLinkRow
  total: number
  scans: number
  clicks: number
  last7: number
  uniqueSessions: number
  lastEventAt: string | null
}

/** Full analytics payload for the QR + links page. */
export type QrAnalytics = {
  totalScans: number
  totalClicks: number
  totalEvents: number
  scans7: number
  clicks7: number
  activeLinks: number
  qrLink: TrackedLinkRow | null
  qrScansTotal: number
  qrScans7: number
  qrPeakHour: number | null
  qrPeakDay: string | null
  timeline: { label: string; value: number; date: string }[]
  byHour: { label: string; value: number }[]
  byWeekday: { label: string; value: number }[]
  devices: { label: string; value: number }[]
  topReferrers: { label: string; value: number }[]
  links: LinkStats[]
}

/** Aggregated, DB-derived analytics for the dashboard. */
export type DashboardData = {
  kpis: {
    visits: number
    visitsDelta: number
    views: number
    viewsDelta: number
    menuViews: number
    menuViewsDelta: number
    pagesPerSession: number
    pagesPerSessionDelta: number
  }
  visitsSeries: { label: string; value: number }[]
  viewsByDay: { label: string; value: number }[]
  trafficSources: { label: string; value: number; tone: number }[]
  devices: { label: string; value: number }[]
  topItems: { name: string; category: string; views: number; image: string }[]
  recentActivity: ActivityRow[]
}

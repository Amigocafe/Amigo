// Mock data for the Amigo admin panel (frontend only — no backend yet).
// All copy is authored in Arabic; a backend script will later auto-translate
// authored fields into the English locale stored in the database.

export type Trend = 'up' | 'down'

export type Kpi = {
  id: string
  label: string
  value: string
  delta: string
  trend: Trend
  hint: string
  icon: 'visits' | 'views' | 'orders' | 'time'
}

export const kpis: Kpi[] = [
  {
    id: 'visits',
    label: 'الزيارات',
    value: '24,580',
    delta: '+12.4%',
    trend: 'up',
    hint: 'مقارنة بالأسبوع الماضي',
    icon: 'visits',
  },
  {
    id: 'views',
    label: 'مشاهدات الصفحات',
    value: '86,210',
    delta: '+8.1%',
    trend: 'up',
    hint: 'إجمالي المشاهدات',
    icon: 'views',
  },
  {
    id: 'orders',
    label: 'طلبات المنيو',
    value: '1,943',
    delta: '-3.2%',
    trend: 'down',
    hint: 'عبر الكيو آر كود',
    icon: 'orders',
  },
  {
    id: 'time',
    label: 'متوسط مدة الجلسة',
    value: '3:42',
    delta: '+0:21',
    trend: 'up',
    hint: 'دقيقة : ثانية',
    icon: 'time',
  },
]

// Last 14 days of visits (area chart)
export const visitsSeries: { label: string; value: number }[] = [
  { label: '1', value: 1280 },
  { label: '2', value: 1520 },
  { label: '3', value: 1410 },
  { label: '4', value: 1880 },
  { label: '5', value: 1720 },
  { label: '6', value: 2240 },
  { label: '7', value: 2680 },
  { label: '8', value: 2120 },
  { label: '9', value: 2460 },
  { label: '10', value: 2980 },
  { label: '11', value: 2740 },
  { label: '12', value: 3320 },
  { label: '13', value: 3180 },
  { label: '14', value: 3720 },
]

// Views by weekday (bar chart) — Arabic day labels
export const viewsByDay: { label: string; value: number }[] = [
  { label: 'السبت', value: 12400 },
  { label: 'الأحد', value: 9800 },
  { label: 'الاثنين', value: 8600 },
  { label: 'الثلاثاء', value: 9100 },
  { label: 'الأربعاء', value: 10200 },
  { label: 'الخميس', value: 15300 },
  { label: 'الجمعة', value: 18800 },
]

// Traffic sources (donut chart)
export const trafficSources: { label: string; value: number; tone: number }[] = [
  { label: 'مباشر', value: 42, tone: 1 },
  { label: 'إنستجرام', value: 28, tone: 2 },
  { label: 'بحث جوجل', value: 18, tone: 3 },
  { label: 'كيو آر كود', value: 12, tone: 4 },
]

// Devices split
export const devices: { label: string; value: number }[] = [
  { label: 'موبايل', value: 68 },
  { label: 'كمبيوتر', value: 24 },
  { label: 'تابلت', value: 8 },
]

export type TopItem = {
  name: string
  category: string
  orders: number
  image: string
}

export const topItems: TopItem[] = [
  { name: 'كافيه دي أويا', category: 'إسبريسو', orders: 412, image: '/images/hero-pour.webp' },
  { name: 'كورتادو أميجو', category: 'إسبريسو', orders: 388, image: '/images/latte-art.webp' },
  { name: 'كولد برو تونيك', category: 'سلو بار', orders: 274, image: '/images/interior.webp' },
  { name: 'كرواسون بالزبدة', category: 'مخبوزات حلوة', orders: 219, image: '/images/pastry.webp' },
  { name: 'في60 بور أوفر', category: 'سلو بار', orders: 198, image: '/images/beans.webp' },
]

export type Activity = {
  id: string
  text: string
  time: string
  tone: 'order' | 'edit' | 'user' | 'alert'
}

export const recentActivity: Activity[] = [
  { id: 'a1', text: 'طلب جديد: كافيه دي أويا × 2', time: 'منذ دقيقتين', tone: 'order' },
  { id: 'a2', text: 'تم تعديل سعر «كورتادو أميجو»', time: 'منذ 18 دقيقة', tone: 'edit' },
  { id: 'a3', text: 'زائر جديد من إنستجرام', time: 'منذ 34 دقيقة', tone: 'user' },
  { id: 'a4', text: 'صنف «لاتيه الأرز» قارب على النفاد', time: 'منذ ساعة', tone: 'alert' },
  { id: 'a5', text: 'تمت إضافة تصنيف «مشروبات باردة»', time: 'منذ 3 ساعات', tone: 'edit' },
]

// ---- Menu management ----
export type MenuItem = {
  id: string
  name: string
  desc: string
  category: string
  price: number
  tags: string[]
  image: string
  available: boolean
}

export const menuItems: MenuItem[] = [
  { id: 'm1', name: 'كافيه دي أويا', desc: 'قرفة، سكر بني، تحضير بطيء', category: 'إسبريسو', price: 4.5, tags: ['المميز'], image: '/images/hero-pour.webp', available: true },
  { id: 'm2', name: 'كورتادو أميجو', desc: 'دبل شوت، حليب شوفان حريري', category: 'إسبريسو', price: 5.0, tags: [], image: '/images/latte-art.webp', available: true },
  { id: 'm3', name: 'لاتيه الأرز', desc: 'مشروب الأرز البيتي، إسبريسو، تلج', category: 'إسبريسو', price: 6.0, tags: ['بارد'], image: '/images/beans.webp', available: false },
  { id: 'm4', name: 'في60 بور أوفر', desc: 'أحادي المصدر متغير، 320 مل', category: 'سلو بار', price: 5.5, tags: [], image: '/images/barista.webp', available: true },
  { id: 'm5', name: 'كولد برو تونيك', desc: 'نقع 18 ساعة، حمضيات، تونيك', category: 'سلو بار', price: 6.5, tags: ['بارد'], image: '/images/interior.webp', available: true },
  { id: 'm6', name: 'كونشا وقهوة', desc: 'حلويات طازجة مع قهوة درِب', category: 'مخبوزات حلوة', price: 7.5, tags: ['تشكيلة'], image: '/images/pastry.webp', available: true },
  { id: 'm7', name: 'كرواسون بالزبدة', desc: 'مفرّد على مدى 72 ساعة، ملح بحري', category: 'مخبوزات حلوة', price: 4.0, tags: [], image: '/images/gallery-3.webp', available: true },
]

// ---- Categories ----
export type Category = {
  id: string
  name: string
  slug: string
  caption: string
  itemsCount: number
  active: boolean
}

export const categories: Category[] = [
  { id: 'c1', name: 'إسبريسو', slug: 'espresso', caption: 'تتحضّر عند الطلب', itemsCount: 3, active: true },
  { id: 'c2', name: 'سلو بار', slug: 'slow-bar', caption: 'أحادي المصدر، مصبوب باليد', itemsCount: 2, active: true },
  { id: 'c3', name: 'مخبوزات حلوة', slug: 'pan-dulce', caption: 'تتخبز كل صباح', itemsCount: 2, active: true },
  { id: 'c4', name: 'مشروبات باردة', slug: 'cold', caption: 'منعشة على طول اليوم', itemsCount: 0, active: false },
]

// ---- Notifications ----
export type Notification = {
  id: string
  title: string
  body: string
  time: string
  read: boolean
  tone: 'order' | 'system' | 'review' | 'alert'
}

export const notifications: Notification[] = [
  { id: 'n1', title: 'طلب جديد', body: 'وصل طلب جديد رقم #1944 من طاولة 6.', time: 'منذ دقيقة', read: false, tone: 'order' },
  { id: 'n2', title: 'تقييم جديد', body: 'قيّمك زائر بـ 5 نجوم: «أحلى كورتادو في بلبيس!».', time: 'منذ 22 دقيقة', read: false, tone: 'review' },
  { id: 'n3', title: 'تنبيه مخزون', body: 'صنف «لاتيه الأرز» أصبح غير متاح.', time: 'منذ ساعة', read: false, tone: 'alert' },
  { id: 'n4', title: 'تحديث النظام', body: 'تم حفظ نسخة احتياطية من إعدادات الموقع بنجاح.', time: 'منذ 5 ساعات', read: true, tone: 'system' },
  { id: 'n5', title: 'طلب جديد', body: 'وصل طلب جديد رقم #1943 عبر الكيو آر كود.', time: 'أمس', read: true, tone: 'order' },
]

// ---- Homepage editable content (Arabic source only) ----
export const homepageContent = {
  hero: {
    titleTop: 'أميجو',
    titleBottom: 'كافيه',
    tagline:
      'قهوة مختصة في النهار، ولاونج بلايستيشن في الليل. خُد لك فنجان، وامسك الدراع — كل ضيف عندنا صاحب.',
    image: '/images/hero-pour.webp',
  },
  vibe: {
    manifesto:
      'الكافيه مش مكان، الكافيه إحساس. ريحة التحميص الطازج، وهمسة الكلام، وغريب بيبقى صاحب.',
  },
  gallery: [
    '/images/gallery-1.webp',
    '/images/gallery-2.webp',
    '/images/gallery-3.webp',
    '/images/gallery-4.webp',
  ],
  location: {
    title: 'تعالى قول أهلاً',
    address: 'قصر السعداوي، الفرع الجديد، بلبيس، الشرقية',
    hours: 'يومياً: 8 صباحاً – 12 منتصف الليل',
  },
}

// ---- SEO defaults ----
export const seoDefaults = {
  title: 'أميجو كافيه — كل فنجان حكاية',
  description:
    'أميجو كافيه. قهوة مختصة محمّصة بحب. ادخل، خفّف السرعة، وتذوّق الرحلة من الحبة للفنجان.',
  keywords: 'قهوة، كافيه، بلايستيشن، بلبيس، الشرقية، إسبريسو، قهوة مختصة',
  ogImage: '/images/interior.webp',
  canonical: 'https://amigocafé.com',
  indexable: true,
}

// ---- Admin profile ----
export const adminProfile = {
  name: 'سيد المعلم',
  role: 'مدير عام',
email: 'sayed@amigocafé.com',
  phone: '+20 100 123 4567',
  joined: 'انضم في يناير 2026',
  avatar: '/images/barista.webp',
}

// ---- Site settings ----
export const siteSettings = {
  brandName: 'أميجو كافيه',
  defaultLocale: 'ar' as 'ar' | 'en',
  defaultTheme: 'dark' as 'dark' | 'light',
  primaryColor: '#b07a3c',
  logo: '/icon.svg',
}

export type TeamMember = {
  id: string
  name: string
  email: string
  role: 'مدير عام' | 'محرر منيو' | 'كاشير' | 'مشاهدة فقط'
  active: boolean
}

export const teamMembers: TeamMember[] = [
  { id: 't1', name: 'سيد المعلم', email: 'sayed@amigocafé.com', role: 'مدير عام', active: true },
  { id: 't2', name: 'منة حسن', email: 'mona@amigocafé.com', role: 'محرر منيو', active: true },
  { id: 't3', name: 'كريم فؤاد', email: 'karim@amigocafé.com', role: 'كاشير', active: true },
  { id: 't4', name: 'نور علي', email: 'nour@amigocafé.com', role: 'مشاهدة فقط', active: false },
]

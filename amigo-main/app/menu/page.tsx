import type { Metadata } from 'next'
import { MenuHeader } from '@/components/amigo/menu-header'
import { Menu } from '@/components/amigo/menu'
import { Footer } from '@/components/amigo/footer'
import { ScrollRefresher } from '@/components/amigo/scroll-refresher'
import { SmoothScroll } from '@/components/amigo/smooth-scroll'
import { JsonLd } from '@/components/seo/json-ld'
import { getSeoContext } from '@/lib/seo/context'
import {
  menuSchema,
  localBusinessSchema,
  breadcrumbSchema,
  buildGraph,
} from '@/lib/seo/schema'

export async function generateMetadata(): Promise<Metadata> {
  const { locale, baseUrl } = await getSeoContext()
  const ar = locale === 'ar'
  const title = ar ? 'المنيو' : 'Menu'
  const description = ar
    ? 'اكتشف منيو أميجو كافيه — إسبريسو، قهوة مختصة، وحلويات طازجة. محمّصة بحب ومقدّمة باهتمام.'
    : 'Explore the Amigo Cafe menu — espresso, slow bar pour-overs, and fresh pan dulce. Roasted in-house, poured with intention.'

  return {
    title,
    description,
    alternates: { canonical: `${baseUrl}/menu` },
    openGraph: {
      type: 'website',
      url: `${baseUrl}/menu`,
      title,
      description,
    },
  }
}

export default async function MenuPage() {
  const ctx = await getSeoContext()
  const ar = ctx.locale === 'ar'
  const graph = buildGraph(
    menuSchema(ctx),
    localBusinessSchema(ctx),
    breadcrumbSchema(ctx.baseUrl, [
      { name: ar ? 'الرئيسية' : 'Home', path: '/' },
      { name: ar ? 'المنيو' : 'Menu', path: '/menu' },
    ]),
  )

  return (
    <main>
      <JsonLd data={graph} />
      <SmoothScroll />
      <ScrollRefresher />
      <MenuHeader />
      <Menu />
      <Footer />
    </main>
  )
}

import { Hero } from '@/components/amigo/hero'
import { Marquee } from '@/components/amigo/marquee'
import { Journey } from '@/components/amigo/journey'
import { Vibe } from '@/components/amigo/vibe'
import { Gallery } from '@/components/amigo/gallery'
import { Menu } from '@/components/amigo/menu'
import { Playstation } from '@/components/amigo/playstation'
import { Location } from '@/components/amigo/location'
import { Footer } from '@/components/amigo/footer'
import { ScrollRefresher } from '@/components/amigo/scroll-refresher'
import { SmoothScroll } from '@/components/amigo/smooth-scroll'
import { FeedbackWidget } from '@/components/amigo/feedback-widget'
import { JsonLd } from '@/components/seo/json-ld'
import { getSeoContext } from '@/lib/seo/context'
import {
  organizationSchema,
  websiteSchema,
  localBusinessSchema,
  buildGraph,
} from '@/lib/seo/schema'

export default async function Page() {
  const ctx = await getSeoContext()
  const graph = buildGraph(
    organizationSchema(ctx),
    websiteSchema(ctx),
    localBusinessSchema(ctx),
  )

  return (
    <main>
      <JsonLd data={graph} />
      <SmoothScroll />
      <ScrollRefresher />
      <Hero />
      <Marquee />
      <Journey />
      <Vibe />
      <Gallery />
      <Menu />
      <Playstation />
      <Location />
      <Footer />
      <FeedbackWidget />
    </main>
  )
}

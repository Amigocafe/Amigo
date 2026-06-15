'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * ScrollTrigger measures element positions on mount. With large hero/section
 * images that load after hydration, those measurements are stale, which makes
 * pinned + scrubbed animations feel broken or jumpy. This refreshes ScrollTrigger
 * once everything (images, fonts) has actually loaded so all positions are correct.
 */
export function ScrollRefresher() {
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh()

    // refresh after the full window load (images included)
    if (document.readyState === 'complete') {
      refresh()
    } else {
      window.addEventListener('load', refresh, { once: true })
    }

    // refresh again once web fonts settle (Anton/DM Sans change text height)
    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh)
    }

    // safety net: refresh after each image finishes loading
    const images = Array.from(document.images)
    const pending = images.filter((img) => !img.complete)
    pending.forEach((img) =>
      img.addEventListener('load', refresh, { once: true }),
    )

    // final delayed refresh to catch any late layout shifts
    const t = window.setTimeout(refresh, 1200)

    return () => {
      window.removeEventListener('load', refresh)
      window.clearTimeout(t)
    }
  }, [])

  return null
}

'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

/**
 * Lenis-powered smooth scrolling for pointer/wheel devices only, driven by
 * GSAP's ticker so it stays in lock step with every ScrollTrigger (pinned
 * journey, scrubbed parallax, etc.).
 *
 * Touch devices are deliberately left on NATIVE scroll: any interpolation
 * layer (even tuned) inserts a gap between the finger and the page, which is
 * exactly the "laggy / running" feel on phones. The browser's own touch
 * scrolling is the most responsive, and ScrollTrigger works fine with it.
 */
export function SmoothScroll() {
  useEffect(() => {
    // Respect users who asked the OS to reduce motion — give them native scroll.
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    // Skip smooth scroll on touch / coarse-pointer devices → native scroll, no lag.
    const isTouch = window.matchMedia('(pointer: coarse)').matches
    if (prefersReduced || isTouch) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (x: number) => 1 - Math.pow(1 - x, 3), // easeOutCubic
      smoothWheel: true,
    })

    // Keep ScrollTrigger's cached positions in sync with Lenis on every scroll.
    lenis.on('scroll', ScrollTrigger.update)

    // Drive Lenis from GSAP's ticker for a single, shared animation loop.
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  return null
}

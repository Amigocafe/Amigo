"use client"

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"

export type QrStyle = {
  fg: string
  bg: string
  withLogo: boolean
  margin: number
}

/**
 * Renders a QR code onto a canvas and optionally stamps the cafe logo in the
 * centre. Exposes the canvas via ref so the parent can trigger downloads.
 */
export function QrCanvas({
  value,
  style,
  size = 1024,
  canvasRef,
}: {
  value: string
  style: QrStyle
  size?: number
  canvasRef: React.RefObject<HTMLCanvasElement | null>
}) {
  const localRef = useRef<HTMLCanvasElement>(null)
  const ref = canvasRef ?? localRef
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let cancelled = false

    async function render() {
      try {
        await QRCode.toCanvas(canvas, value || " ", {
          width: size,
          margin: style.margin,
          errorCorrectionLevel: "H", // high EC so the centre logo doesn't break scanning
          color: { dark: style.fg, light: style.bg },
        })
        if (cancelled) return

        if (style.withLogo && canvas) {
          const ctx = canvas.getContext("2d")
          if (!ctx) return
          const logo = new Image()
          logo.crossOrigin = "anonymous"
          logo.onload = () => {
            if (cancelled) return
            const box = size * 0.22
            const x = (size - box) / 2
            const y = (size - box) / 2
            const pad = box * 0.16
            // White rounded plate behind the logo for contrast.
            ctx.fillStyle = style.bg
            const r = box * 0.22
            roundRect(ctx, x - pad, y - pad, box + pad * 2, box + pad * 2, r)
            ctx.fill()
            ctx.drawImage(logo, x, y, box, box)
          }
          logo.onerror = () => {
            // Logo is optional; ignore load failures.
          }
          logo.src = "/icon.svg"
        }
        setError(null)
      } catch (e) {
        setError((e as Error).message)
        console.log("[v0] QrCanvas render error:", (e as Error).message)
      }
    }
    render()
    return () => {
      cancelled = true
    }
  }, [value, style.fg, style.bg, style.withLogo, style.margin, size, ref])

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas
        ref={ref}
        className="aspect-square w-full max-w-[280px] rounded-lg border border-border"
        aria-label="معاينة كود QR"
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

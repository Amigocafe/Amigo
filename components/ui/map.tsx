"use client"

import { useEffect, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"

type MapProps = {
  /** Map center as [longitude, latitude] */
  center: [number, number]
  zoom?: number
  /** Optional marker position as [longitude, latitude]. Defaults to center. */
  marker?: [number, number]
  className?: string
}

export function Map({ center, zoom = 12, marker, className }: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
              "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
              "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
            ],
            tileSize: 256,
            attribution: '© <a href="https://carto.com/">CARTO</a>, © OpenStreetMap contributors',
          },
        },
        layers: [{ id: "carto", type: "raster", source: "carto" }],
      },
      center,
      zoom,
      attributionControl: { compact: true },
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right")

    const markerEl = document.createElement("div")
    markerEl.style.width = "22px"
    markerEl.style.height = "22px"
    markerEl.style.borderRadius = "9999px"
    markerEl.style.background = "var(--primary)"
    markerEl.style.border = "3px solid var(--background)"
    markerEl.style.boxShadow = "0 0 0 2px var(--primary)"

    new maplibregl.Marker({ element: markerEl }).setLngLat(marker ?? center).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={containerRef} className={className} style={{ width: "100%", height: "100%" }} />
}

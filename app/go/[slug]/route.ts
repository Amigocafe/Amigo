import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Public tracking redirect. A QR code or a shared social link points here
// (e.g. /go/menu). We record one event, then 302 the visitor to the real
// destination. Failures never block the redirect.

function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  const s = ua.toLowerCase()
  if (/ipad|tablet|playbook|silk/.test(s)) return "tablet"
  if (/mobi|android|iphone|ipod|phone/.test(s)) return "mobile"
  return "desktop"
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: link } = await supabase
    .from("tracked_links")
    .select("*")
    .eq("slug", slug)
    .maybeSingle()

  // Unknown or disabled link -> send to homepage.
  if (!link || !link.active) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  // Resolve the destination (absolute URL or app-relative path).
  let target: URL
  try {
    target = new URL(link.destination)
  } catch {
    target = new URL(link.destination.startsWith("/") ? link.destination : `/${link.destination}`, req.url)
  }

  // Record the event (best-effort).
  try {
    const ua = req.headers.get("user-agent") ?? ""
    const referrer = req.headers.get("referer") ?? null
    const cookieSession = req.cookies.get("amigo_sid")?.value
    const sessionId = cookieSession ?? crypto.randomUUID()

    await supabase.from("link_events").insert({
      link_id: link.id,
      type: link.is_qr ? "scan" : "click",
      device: detectDevice(ua),
      locale: req.cookies.get("amigo-locale")?.value ?? null,
      referrer,
      session_id: sessionId,
    })

    const res = NextResponse.redirect(target)
    if (!cookieSession) {
      res.cookies.set("amigo_sid", sessionId, {
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      })
    }
    return res
  } catch (e) {
    console.log("[v0] /go redirect tracking failed:", (e as Error).message)
    return NextResponse.redirect(target)
  }
}

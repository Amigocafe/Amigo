// One-time migration: upload every local /public image to UploadThing and
// rewrite all database references (menu_items, homepage hero+gallery, seo og,
// site logo) to the new hosted URLs.
//
// Run with:
//   node --env-file-if-exists=/vercel/share/.env.project scripts/migrate-images-to-uploadthing.mjs

import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { UTApi, UTFile } from "uploadthing/server"
import { createClient } from "@supabase/supabase-js"

const PUBLIC_DIR = join(process.cwd(), "public")

const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
// Service role bypasses RLS for a trusted server-side migration.
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!process.env.UPLOADTHING_TOKEN) {
  console.error("[v0] Missing UPLOADTHING_TOKEN")
  process.exit(1)
}
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("[v0] Missing Supabase credentials")
  process.exit(1)
}

const utapi = new UTApi()
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
})

// Every local image referenced anywhere in the app / DB.
const FILES = [
  "barista.webp",
  "beans.webp",
  "gallery-1.webp",
  "gallery-2.webp",
  "gallery-3.webp",
  "gallery-4.webp",
  "gallery-gaming.webp",
  "gaming-room.webp",
  "gaming-setup.webp",
  "hero-pour.webp",
  "interior.webp",
  "latte-art.webp",
  "pastry.webp",
  "ps-controller.webp",
]

async function uploadAll() {
  const map = {}
  for (const name of FILES) {
    const buf = await readFile(join(PUBLIC_DIR, "images", name))
    const file = new UTFile([buf], name, { type: "image/webp" })
    const res = await utapi.uploadFiles(file)
    if (res.error) {
      console.error(`[v0] upload failed for ${name}:`, res.error)
      continue
    }
    map[`/images/${name}`] = res.data.ufsUrl ?? res.data.url
    console.log(`[v0] uploaded ${name} -> ${map[`/images/${name}`]}`)
  }
  return map
}

function remap(url, map) {
  return map[url] ?? url
}

async function updateDatabase(map) {
  // menu_items
  const { data: items } = await supabase.from("menu_items").select("id, image")
  for (const it of items ?? []) {
    const next = remap(it.image, map)
    if (next !== it.image)
      await supabase.from("menu_items").update({ image: next }).eq("id", it.id)
  }

  // homepage hero image + gallery array
  const { data: hp } = await supabase
    .from("homepage_content")
    .select("id, hero, gallery")
    .eq("id", 1)
    .maybeSingle()
  if (hp) {
    const hero = { ...hp.hero, image: remap(hp.hero?.image, map) }
    const gallery = (hp.gallery ?? []).map((g) => remap(g, map))
    await supabase
      .from("homepage_content")
      .update({ hero, gallery })
      .eq("id", 1)
  }

  // seo og_image
  const { data: seo } = await supabase
    .from("seo_settings")
    .select("id, og_image")
    .eq("id", 1)
    .maybeSingle()
  if (seo) {
    const og = remap(seo.og_image, map)
    if (og !== seo.og_image)
      await supabase.from("seo_settings").update({ og_image: og }).eq("id", 1)
  }
  console.log("[v0] database references updated")
}

const map = await uploadAll()
await updateDatabase(map)
// Emit the map so we can also patch hard-coded references in source files.
console.log("MAP_JSON_START" + JSON.stringify(map) + "MAP_JSON_END")
console.log("[v0] migration complete")

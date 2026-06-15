import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { createClient } from "@/lib/supabase/server"

const f = createUploadthing()

async function authMiddleware() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new UploadThingError("غير مصرّح برفع الملفات")
  return { userId: user.id }
}

const imageRoute = f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
  .middleware(authMiddleware)
  .onUploadComplete(({ file }) => ({ url: file.ufsUrl, name: file.name }))

export const ourFileRouter = {
  imageUploader: imageRoute,
  menuItemImage:  imageRoute,
  homepageImage:  imageRoute,
  galleryImage:   imageRoute,
  profileAvatar:  imageRoute,
  logoImage:      imageRoute,
  seoImage:       imageRoute,
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

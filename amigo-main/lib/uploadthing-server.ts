import "server-only"
import { UTApi } from "uploadthing/server"

/** Server-side UploadThing API (token read from UPLOADTHING_TOKEN). */
export const utapi = new UTApi()

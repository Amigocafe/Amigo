"use client"

import { useCallback, useRef, useState } from "react"
import Image from "next/image"
import { UploadCloud, Loader2, X, ImageIcon } from "lucide-react"
import { useUploadThing } from "@/lib/uploadthing"
import { cn } from "@/lib/utils"

type ImageUploadProps = {
  value: string
  onChange: (url: string) => void
  /** UploadThing router endpoint key. Defaults to "imageUploader". */
  endpoint?: "imageUploader" | "menuItemImage" | "homepageImage" | "galleryImage" | "profileAvatar" | "logoImage" | "seoImage"
  /** Visual aspect of the preview box. */
  aspect?: "video" | "square" | "wide"
  className?: string
  /** Round preview (e.g. avatars). */
  rounded?: boolean
  label?: string
  placeholder?: string
}

const ASPECT: Record<string, string> = {
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-[21/9]",
}

export function ImageUpload({
  value,
  onChange,
  endpoint = "imageUploader",
  aspect = "video",
  className,
  rounded = false,
  label,
  placeholder,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { startUpload, isUploading } = useUploadThing(endpoint, {
    onUploadProgress: (p) => setProgress(p),
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.ufsUrl ?? res?.[0]?.url
      if (url) onChange(url)
      setProgress(0)
      setError(null)
    },
    onUploadError: (e) => {
      setError(e.message || "تعذّر رفع الصورة")
      setProgress(0)
    },
  })

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      const file = files[0]
      if (!file.type.startsWith("image/")) {
        setError("الملف يجب أن يكون صورة")
        return
      }
      setError(null)
      void startUpload([file])
    },
    [startUpload],
  )

  const hasImage = value && value !== "/placeholder.svg"

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label ? (
        <span className="text-sm font-medium text-foreground">{label}</span>
      ) : null}
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isUploading) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          if (!isUploading) handleFiles(e.dataTransfer.files)
        }}
        className={cn(
          "group relative flex w-full cursor-pointer items-center justify-center overflow-hidden border border-dashed border-input bg-muted/40 transition-colors hover:border-ring focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
          rounded ? "rounded-full" : "rounded-md",
          ASPECT[aspect],
          dragOver && "border-ring bg-primary/5",
        )}
      >
        {hasImage ? (
          <>
            <Image
              src={value || "/placeholder.svg"}
              alt="معاينة الصورة"
              fill
              sizes="400px"
              className="object-cover"
            />
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-foreground/45 text-background opacity-0 transition-opacity group-hover:opacity-100",
                rounded ? "rounded-full" : "",
              )}
            >
              {!isUploading ? (
                <span className="flex flex-col items-center gap-1 text-xs font-medium">
                  <UploadCloud className="size-5" />
                  تغيير الصورة
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 px-4 py-6 text-center text-muted-foreground">
            <ImageIcon className="size-6" />
            <span className="text-xs">{placeholder ?? "اسحب صورة هنا أو اضغط للاختيار"}</span>
          </div>
        )}

        {isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span className="font-mono text-xs text-foreground">{progress}%</span>
          </div>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">PNG, JPG, WEBP — حتى 8 ميجا</p>
        {hasImage && !isUploading ? (
          <button
            type="button"
            onClick={() => onChange("/placeholder.svg")}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
          >
            <X className="size-3" /> إزالة
          </button>
        ) : null}
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, UploadCloud } from "lucide-react"
import { toast } from "sonner"
import { pick, type Lang } from "@/lib/lang"

/** Shrinks big phone photos in the browser first (max 2000px, JPEG) so uploads are fast and small. */
async function compress(file: File): Promise<Blob> {
  if (file.type === "image/webp" && file.size < 1_500_000) return file
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, 2000 / Math.max(bmp.width, bmp.height))
    const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale)
    const canvas = document.createElement("canvas")
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h)
    ctx.drawImage(bmp, 0, 0, w, h)
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.88))
    return blob && blob.size < file.size ? blob : file
  } catch {
    return file
  }
}

export function ImageUploader({ lang }: { lang: Lang }) {
  const L = pick(lang)
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [caption, setCaption] = useState("")

  async function onFiles(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    let okCount = 0
    for (const f of Array.from(files)) {
      const blob = await compress(f)
      const fd = new FormData()
      fd.append("file", new File([blob], f.name, { type: blob.type || f.type }))
      fd.append("caption", caption)
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      if (res.ok) okCount++
      else {
        const j = await res.json().catch(() => ({}))
        toast.error(
          j.error === "storage_not_configured" ? L("Ajoutez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.", "Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
          : j.error === "bad_type" ? L("Utilisez une image JPG, PNG ou WebP.", "Use a JPG, PNG or WebP image.")
          : j.error === "too_large" ? L("Image trop lourde (max 4 Mo).", "Image too large (max 4 MB).")
          : L("Échec du téléversement.", "Upload failed."),
        )
      }
    }
    setBusy(false)
    if (input.current) input.current.value = ""
    if (okCount) {
      setCaption("")
      toast.success(L("Image publiée sur le site", "Image published on the site"))
      router.refresh()
    }
  }

  return (
    <div className="panel space-y-4 p-5">
      <input
        value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={200}
        placeholder={L("Légende (facultatif)", "Caption (optional)")}
        className="w-full min-h-11 rounded-lg border border-line bg-panel2 px-3.5 text-sm outline-none focus:border-lime"
      />
      <button
        type="button" disabled={busy} onClick={() => input.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line px-4 py-10 text-center text-muted-foreground transition-colors hover:border-lime hover:text-foreground disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-8 animate-spin" /> : <UploadCloud className="size-8" />}
        <span className="font-medium text-foreground">{busy ? L("Téléversement…", "Uploading…") : L("Choisir une ou plusieurs images", "Choose one or more images")}</span>
        <span className="text-xs">JPG, PNG, WebP</span>
      </button>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => onFiles(e.target.files)} />
    </div>
  )
}

import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/admin/auth"
import { query } from "@/lib/db"
import { storageConfigured, uploadImage } from "@/lib/storage"

export const runtime = "nodejs"
const TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }

export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!storageConfigured()) return NextResponse.json({ error: "storage_not_configured" }, { status: 503 })
  const fd = await req.formData()
  const file = fd.get("file")
  if (!(file instanceof File)) return NextResponse.json({ error: "no_file" }, { status: 400 })
  const ext = TYPES[file.type]
  if (!ext) return NextResponse.json({ error: "bad_type" }, { status: 415 })
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "too_large" }, { status: 413 })
  try {
    const { url, path } = await uploadImage(await file.arrayBuffer(), file.type, ext)
    const caption = String(fd.get("caption") ?? "").slice(0, 200)
    await query(`insert into schedule_images (url, path, caption) values ($1, $2, $3)`, [url, path, caption])
    revalidatePath("/", "layout")
    return NextResponse.json({ ok: true, url })
  } catch (e) {
    console.error("[upload]", (e as Error).message)
    return NextResponse.json({ error: "upload_failed" }, { status: 500 })
  }
}

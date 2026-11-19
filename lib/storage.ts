import "server-only"
import { randomBytes } from "node:crypto"

const BUCKET = process.env.SUPABASE_BUCKET || "schedule"

function cfg() {
  const url = (process.env.SUPABASE_URL || "").replace(/\/+$/, "")
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  return { url, key }
}

export function storageConfigured() {
  const { url, key } = cfg()
  return Boolean(url && key)
}

function headers(extra: Record<string, string> = {}) {
  const { key } = cfg()
  // Legacy service_role keys are JWTs (also sent as Bearer). New sb_secret_ keys go in `apikey` only.
  const h: Record<string, string> = { apikey: key, ...extra }
  if (key.startsWith("eyJ")) h.Authorization = `Bearer ${key}`
  return h
}

async function ensureBucket() {
  const { url } = cfg()
  const res = await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, file_size_limit: 5 * 1024 * 1024 }),
  })
  if (!res.ok && res.status !== 409 && res.status !== 400) {
    throw new Error(`Could not create storage bucket (${res.status}): ${await res.text()}`)
  }
}

export async function uploadImage(data: ArrayBuffer, contentType: string, ext: string) {
  const { url } = cfg()
  const path = `${new Date().getFullYear()}/${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`
  const put = () =>
    fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, {
      method: "POST",
      headers: headers({ "Content-Type": contentType, "Cache-Control": "max-age=31536000" }),
      body: data,
    })
  let res = await put()
  if (!res.ok) {
    await ensureBucket()
    res = await put()
  }
  if (!res.ok) throw new Error(`Upload failed (${res.status}): ${await res.text()}`)
  return { path, url: `${url}/storage/v1/object/public/${BUCKET}/${path}` }
}

export async function deleteImage(path: string) {
  const { url } = cfg()
  try {
    await fetch(`${url}/storage/v1/object/${BUCKET}/${path}`, { method: "DELETE", headers: headers() })
  } catch (e) {
    console.error("[storage] delete failed", (e as Error).message)
  }
}

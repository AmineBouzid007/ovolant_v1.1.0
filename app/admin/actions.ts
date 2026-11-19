"use server"

import { after } from "next/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { adminConfigured, checkCredentials, endSession, requireAdmin, startSession } from "@/lib/admin/auth"
import { query } from "@/lib/db"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"
import { saveSettings } from "@/lib/data/settings"
import { deleteImage, storageConfigured } from "@/lib/storage"
import { sendStatusChange } from "@/lib/email"
import { zonedToUtc } from "@/lib/time"

export interface FormState {
  error?: string
  ok?: boolean
  email?: string
}

const UUID = z.string().uuid()

// ---------- auth ----------
export async function loginAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const L = pick(await getLang())
  if (!adminConfigured()) return { error: "Admin isn't configured. Set ADMIN_EMAIL, ADMIN_PASSWORD and AUTH_SECRET." }
  const email = String(fd.get("email") ?? "")
  const password = String(fd.get("password") ?? "")
  if (!checkCredentials(email, password)) {
    await new Promise((r) => setTimeout(r, 700))
    return { error: L("Courriel ou mot de passe incorrect.", "Incorrect email or password."), email }
  }
  await startSession(email.trim().toLowerCase())
  redirect("/admin/dashboard")
}

export async function logoutAction() {
  await endSession()
  redirect("/admin/login")
}

// ---------- bookings ----------
export async function updateBookingStatusAction(id: string, status: string): Promise<FormState> {
  await requireAdmin()
  if (!UUID.safeParse(id).success || !["pending", "confirmed", "cancelled"].includes(status)) return { error: "Invalid" }
  const before = await query<{ status: string }>(`select status from bookings where id = $1`, [id])
  const rows = await query<any>(
    `update bookings b set status = $2 where b.id = $1
     returning b.*, (select location from sessions where id = b.session_id) as location,
                    (select price_cents from sessions where id = b.session_id) as price_cents,
                    (select title_en from sessions where id = b.session_id) as title_en`,
    [id, status],
  )
  const b = rows[0]
  if (!b) return { error: "Not found" }
  if ((status === "confirmed" || status === "cancelled") && before[0]?.status !== status) {
    after(() =>
      sendStatusChange(
        {
          name: b.name, phone: b.phone, email: b.email, notes: b.notes, lang: b.lang,
          sessionTitle: b.lang === "en" && b.title_en ? b.title_en : b.session_title,
          sessionStartsAt: b.session_starts_at ? new Date(b.session_starts_at) : null,
          priceCents: b.price_cents, location: b.location ?? "",
        },
        status,
      ),
    )
  }
  revalidatePath("/admin", "layout")
  return { ok: true }
}

export async function deleteBookingAction(id: string): Promise<FormState> {
  await requireAdmin()
  if (!UUID.safeParse(id).success) return { error: "Invalid" }
  await query(`delete from bookings where id = $1`, [id])
  revalidatePath("/admin", "layout")
  return { ok: true }
}

// ---------- sessions ----------
const sessionSchema = z.object({
  title_fr: z.string().trim().min(2).max(140),
  title_en: z.string().trim().max(140),
  description_fr: z.string().trim().max(600),
  description_en: z.string().trim().max(600),
  starts_at: z.string(),
  duration_minutes: z.coerce.number().int().min(15).max(24 * 60),
  location: z.string().trim().max(200),
  seats: z.coerce.number().int().min(0).max(500),
  price: z.string().trim(),
})

export async function saveSessionAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  const L = pick(await getLang())
  const p = sessionSchema.safeParse(Object.fromEntries(fd))
  if (!p.success) return { error: L("Vérifiez les champs : titre, date, durée et places sont requis.", "Check the fields: title, date, duration and seats are required.") }
  const d = p.data
  const startsAt = zonedToUtc(d.starts_at)
  if (!startsAt) return { error: L("Date invalide.", "Invalid date.") }
  let priceCents: number | null = null
  if (d.price) {
    const n = Number(d.price.replace(",", ".").replace(/[^\d.]/g, ""))
    if (!Number.isFinite(n)) return { error: L("Prix invalide.", "Invalid price.") }
    priceCents = Math.round(n * 100)
  }
  const published = fd.get("published") === "on"
  const id = String(fd.get("id") ?? "")

  if (id) {
    if (!UUID.safeParse(id).success) return { error: "Invalid" }
    const [{ n }] = await query<{ n: number }>(`select count(*)::int as n from bookings where session_id = $1 and status <> 'cancelled'`, [id])
    if (d.seats < n) return { error: L(`Il y a déjà ${n} réservations actives : les places ne peuvent pas être moins nombreuses.`, `There are already ${n} active bookings: seats cannot go below that.`) }
    await query(
      `update sessions set title_fr=$2,title_en=$3,description_fr=$4,description_en=$5,starts_at=$6,duration_minutes=$7,location=$8,seats=$9,price_cents=$10,published=$11 where id=$1`,
      [id, d.title_fr, d.title_en || d.title_fr, d.description_fr, d.description_en, startsAt, d.duration_minutes, d.location, d.seats, priceCents, published],
    )
  } else {
    await query(
      `insert into sessions (title_fr,title_en,description_fr,description_en,starts_at,duration_minutes,location,seats,price_cents,published)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [d.title_fr, d.title_en || d.title_fr, d.description_fr, d.description_en, startsAt, d.duration_minutes, d.location, d.seats, priceCents, published],
    )
  }
  revalidatePath("/", "layout")
  redirect("/admin/sessions")
}

export async function deleteSessionAction(fd: FormData) {
  await requireAdmin()
  const id = String(fd.get("id") ?? "")
  if (UUID.safeParse(id).success) await query(`delete from sessions where id = $1`, [id])
  revalidatePath("/", "layout")
  redirect("/admin/sessions")
}

// ---------- settings ----------
const settingsSchema = z.object({
  contact_phone: z.string().trim().max(40),
  contact_email: z.union([z.literal(""), z.string().trim().email().max(160)]),
  notify_email: z.union([z.literal(""), z.string().trim().email().max(160)]),
  whatsapp: z.string().trim().max(40),
  address: z.string().trim().max(200),
  facebook: z.union([z.literal(""), z.string().trim().url().max(300)]),
  instagram: z.union([z.literal(""), z.string().trim().url().max(300)]),
})

export async function saveSettingsAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  const L = pick(await getLang())
  const p = settingsSchema.safeParse(Object.fromEntries(fd))
  if (!p.success) return { error: L("Vérifiez les courriels et les liens (ils doivent commencer par https://).", "Check the emails and links (they must start with https://).") }
  await saveSettings(p.data)
  revalidatePath("/", "layout")
  return { ok: true }
}

// ---------- instructors & testimonials ----------
const contentSchema = z.object({
  kind: z.enum(["testimonial", "instructor"]),
  name: z.string().trim().min(2).max(100),
  role_fr: z.string().trim().max(140),
  role_en: z.string().trim().max(140),
  text_fr: z.string().trim().max(800),
  text_en: z.string().trim().max(800),
  sort: z.coerce.number().int().min(0).max(9999).catch(0),
})

export async function saveContentAction(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin()
  const L = pick(await getLang())
  const p = contentSchema.safeParse(Object.fromEntries(fd))
  if (!p.success) return { error: L("Le nom est requis.", "The name is required.") }
  const d = p.data
  const published = fd.get("published") === "on"
  const id = String(fd.get("id") ?? "")
  if (id) {
    if (!UUID.safeParse(id).success) return { error: "Invalid" }
    await query(
      `update content_items set name=$2,role_fr=$3,role_en=$4,text_fr=$5,text_en=$6,sort=$7,published=$8 where id=$1`,
      [id, d.name, d.role_fr, d.role_en, d.text_fr, d.text_en, d.sort, published],
    )
  } else {
    await query(
      `insert into content_items (kind,name,role_fr,role_en,text_fr,text_en,sort,published) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [d.kind, d.name, d.role_fr, d.role_en, d.text_fr, d.text_en, d.sort, published],
    )
  }
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function deleteContentAction(fd: FormData) {
  await requireAdmin()
  const id = String(fd.get("id") ?? "")
  if (UUID.safeParse(id).success) await query(`delete from content_items where id = $1`, [id])
  revalidatePath("/", "layout")
}

// ---------- schedule photos ----------
export async function toggleImageAction(fd: FormData) {
  await requireAdmin()
  const id = String(fd.get("id") ?? "")
  if (UUID.safeParse(id).success) await query(`update schedule_images set active = not active where id = $1`, [id])
  revalidatePath("/", "layout")
}

export async function captionImageAction(fd: FormData) {
  await requireAdmin()
  const id = String(fd.get("id") ?? "")
  const caption = String(fd.get("caption") ?? "").trim().slice(0, 200)
  if (UUID.safeParse(id).success) await query(`update schedule_images set caption = $2 where id = $1`, [id, caption])
  revalidatePath("/", "layout")
}

export async function deleteImageAction(fd: FormData) {
  await requireAdmin()
  const id = String(fd.get("id") ?? "")
  if (!UUID.safeParse(id).success) return
  const rows = await query<{ path: string }>(`delete from schedule_images where id = $1 returning path`, [id])
  if (rows[0] && storageConfigured()) await deleteImage(rows[0].path)
  revalidatePath("/", "layout")
}

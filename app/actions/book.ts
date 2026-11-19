"use server"

import { after } from "next/server"
import { headers } from "next/headers"
import { z } from "zod"
import { withTx } from "@/lib/db"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"
import { sendBookingReceived, sendBookingToSchool, type BookingMail } from "@/lib/email"

export interface BookState {
  ok?: boolean
  error?: string
  fields?: Partial<Record<"name" | "phone" | "email" | "session" | "consent", string>>
  values?: { session?: string; name?: string; phone?: string; email?: string; notes?: string }
  summary?: { title: string; startsAt: string | null; email: string }
}

// Small in-memory throttle (per server instance) on top of the honeypot field.
const hits = new Map<string, number[]>()
function throttled(ip: string) {
  const now = Date.now()
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000)
  list.push(now)
  hits.set(ip, list)
  if (hits.size > 2000) hits.clear()
  return list.length > 6
}

export async function bookAction(_prev: BookState, fd: FormData): Promise<BookState> {
  const lang = await getLang()
  const L = pick(lang)
  const raw = {
    session: String(fd.get("session") ?? ""),
    name: String(fd.get("name") ?? "").trim(),
    phone: String(fd.get("phone") ?? "").trim(),
    email: String(fd.get("email") ?? "").trim(),
    notes: String(fd.get("notes") ?? "").trim(),
  }
  const values = { ...raw }

  // Honeypot: bots fill the hidden field. Pretend it worked.
  if (String(fd.get("website") ?? "")) return { ok: true, summary: { title: "", startsAt: null, email: raw.email } }

  const h = await headers()
  const ip = (h.get("x-forwarded-for") ?? "unknown").split(",")[0].trim()
  if (throttled(ip)) return { error: L("Trop de tentatives. Réessayez dans quelques minutes.", "Too many attempts. Try again in a few minutes."), values }

  const schema = z.object({
    session: z.union([z.literal("other"), z.string().uuid()]),
    name: z.string().min(2).max(100),
    phone: z.string().refine((v) => /^[+\d\s().-]{7,25}$/.test(v) && v.replace(/\D/g, "").length >= 10, "phone"),
    email: z.string().email().max(160),
    notes: z.string().max(600),
  })
  const parsed = schema.safeParse(raw)
  const consent = fd.get("consent") === "on"
  if (!parsed.success || !consent) {
    const fields: NonNullable<BookState["fields"]> = {}
    for (const i of parsed.success ? [] : parsed.error.issues) {
      const k = i.path[0] as keyof NonNullable<BookState["fields"]>
      if (fields[k]) continue
      fields[k] =
        k === "name" ? L("Entrez votre nom complet.", "Enter your full name.")
        : k === "phone" ? L("Entrez un numéro valide (10 chiffres).", "Enter a valid number (10 digits).")
        : k === "email" ? L("Entrez une adresse courriel valide.", "Enter a valid email address.")
        : L("Choisissez un cours.", "Choose a course.")
    }
    if (!consent) fields.consent = L("Vous devez accepter pour continuer.", "You must agree to continue.")
    return { fields, values }
  }
  const d = parsed.data

  type TxResult = { error: "gone" | "full" | "dup" } | { sess: Record<string, any> | null }
  const result = await withTx<TxResult>(async (c) => {
    let sess: Record<string, any> | null = null
    if (d.session !== "other") {
      // Lock the session row so two people can't take the last seat at the same time.
      const r = await c.query(`select * from sessions where id = $1 and published and starts_at > now() for update`, [d.session])
      sess = r.rows[0] ?? null
      if (!sess) return { error: "gone" }
      const cnt = await c.query(`select count(*)::int as n from bookings where session_id = $1 and status <> 'cancelled'`, [d.session])
      if (cnt.rows[0].n >= sess.seats) return { error: "full" }
      const dup = await c.query(
        `select 1 from bookings where session_id = $1 and lower(email) = lower($2) and status <> 'cancelled' limit 1`,
        [d.session, d.email],
      )
      if (dup.rowCount) return { error: "dup" }
    }
    await c.query(
      `insert into bookings (session_id, session_title, session_starts_at, name, phone, email, notes, lang)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [sess?.id ?? null, sess ? sess.title_fr : "Autre date / Other date", sess?.starts_at ?? null, d.name, d.phone, d.email, d.notes, lang],
    )
    return { sess }
  })

  if ("error" in result) {
    return {
      values,
      error:
        result.error === "full" ? L("Ce cours est maintenant complet. Choisissez une autre date.", "This course is now full. Please choose another date.")
        : result.error === "dup" ? L("Vous avez déjà réservé ce cours avec ce courriel.", "You already booked this course with this email.")
        : L("Ce cours n'est plus disponible. Choisissez une autre date.", "This course is no longer available. Please choose another date."),
    }
  }

  const sess = result.sess
  const title = sess ? (lang === "fr" ? sess.title_fr : sess.title_en || sess.title_fr) : L("Autre date (nous vous appellerons)", "Other date (we will call you)")
  const mail: BookingMail = {
    name: d.name, phone: d.phone, email: d.email, notes: d.notes, lang,
    sessionTitle: title,
    sessionStartsAt: sess ? new Date(sess.starts_at) : null,
    priceCents: sess?.price_cents ?? null,
    location: sess?.location ?? "",
  }
  after(async () => {
    await Promise.allSettled([sendBookingReceived(mail), sendBookingToSchool(mail)])
  })

  return { ok: true, summary: { title, startsAt: sess ? new Date(sess.starts_at).toISOString() : null, email: d.email } }
}

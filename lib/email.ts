import "server-only"
import type { Lang } from "@/lib/lang"
import { fmtFull, fmtPrice } from "@/lib/time"
import { getSettings } from "@/lib/data/settings"

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY)
}

async function send(to: string, subject: string, html: string, replyTo?: string) {
  const key = process.env.RESEND_API_KEY
  if (!key || !to) return
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Ovolant <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })
    if (!res.ok) console.error("[email] Resend error", res.status, await res.text())
  } catch (e) {
    console.error("[email] send failed", (e as Error).message)
  }
}

function shell(title: string, body: string, footer: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f7ee;padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:#121a0c">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #d5ddc8;border-radius:16px;overflow:hidden">
<tr><td style="height:4px;background:#92f52b"></td></tr>
<tr><td style="padding:28px 28px 8px"><div style="font-size:13px;color:#3b7a0a;font-weight:bold;letter-spacing:.3px">OVOLANT · École de conduite</div>
<h1 style="margin:14px 0 0;font-size:22px;line-height:1.25;color:#121a0c">${esc(title)}</h1></td></tr>
<tr><td style="padding:12px 28px 28px;font-size:15px;line-height:1.6;color:#2b3622">${body}</td></tr>
<tr><td style="padding:16px 28px;border-top:1px solid #d5ddc8;font-size:12px;color:#56624b">${footer}</td></tr>
</table></td></tr></table></body></html>`
}

function details(rows: [string, string][]) {
  return `<table role="presentation" width="100%" style="margin:16px 0;border:1px solid #d5ddc8;border-radius:12px;background:#f4f7ee">${rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:10px 14px;font-size:13px;color:#56624b;width:38%;vertical-align:top">${esc(k)}</td><td style="padding:10px 14px;font-size:14px;color:#121a0c">${esc(v)}</td></tr>`,
    )
    .join("")}</table>`
}

export interface BookingMail {
  name: string
  phone: string
  email: string
  notes: string
  lang: Lang
  sessionTitle: string
  sessionStartsAt: Date | null
  priceCents?: number | null
  location?: string
}

function sessionRows(b: BookingMail, fr: boolean): [string, string][] {
  return [
    [fr ? "Cours" : "Course", b.sessionTitle],
    [fr ? "Date" : "Date", b.sessionStartsAt ? fmtFull(b.sessionStartsAt, b.lang) : fr ? "À déterminer avec vous" : "To be arranged with you"],
    [fr ? "Lieu" : "Location", b.location ?? ""],
    [fr ? "Prix" : "Price", fmtPrice(b.priceCents, b.lang)],
  ]
}

async function contactFooter(fr: boolean) {
  const s = await getSettings()
  const bits = [s.contact_phone, s.contact_email, s.address].filter(Boolean).map(esc).join(" · ")
  return bits || (fr ? "Merci de votre confiance." : "Thank you for your trust.")
}

/** Sent to the client right after they book. */
export async function sendBookingReceived(b: BookingMail) {
  const fr = b.lang === "fr"
  const html = shell(
    fr ? `Bien reçu, ${b.name.split(" ")[0]} !` : `Got it, ${b.name.split(" ")[0]}!`,
    `<p style="margin:0 0 8px">${
      fr
        ? "Nous avons bien reçu votre demande de réservation. Nous communiquerons avec vous pour confirmer votre place."
        : "We received your booking request. We will contact you to confirm your spot."
    }</p>${details(sessionRows(b, fr))}<p style="margin:0">${fr ? "Statut : en attente de confirmation." : "Status: waiting for confirmation."}</p>`,
    await contactFooter(fr),
  )
  await send(b.email, fr ? "Votre demande de réservation — Ovolant" : "Your booking request — Ovolant", html)
}

/** Sent to the school for every new booking. */
export async function sendBookingToSchool(b: BookingMail) {
  const s = await getSettings()
  const to = s.notify_email || process.env.NOTIFY_EMAIL || s.contact_email
  if (!to) return
  const html = shell(
    "Nouvelle réservation / New booking",
    details([
      ["Nom / Name", b.name],
      ["Téléphone / Phone", b.phone],
      ["Courriel / Email", b.email],
      ["Cours / Course", b.sessionTitle],
      ["Date", b.sessionStartsAt ? fmtFull(b.sessionStartsAt, "fr") : "Autre date / Other date"],
      ["Notes", b.notes],
      ["Langue / Language", b.lang === "fr" ? "Français" : "English"],
    ]) +
      `<p style="margin:0"><a href="${esc((process.env.NEXT_PUBLIC_SITE_URL || "") + "/admin/bookings")}" style="color:#3b7a0a">Ouvrir le tableau de bord / Open dashboard</a></p>`,
    "Ovolant",
  )
  await send(to, `Nouvelle réservation — ${b.name}`, html, b.email)
}

/** Sent to the client when the admin confirms or cancels. */
export async function sendStatusChange(b: BookingMail, status: "confirmed" | "cancelled") {
  const fr = b.lang === "fr"
  const ok = status === "confirmed"
  const html = shell(
    ok ? (fr ? "Votre place est confirmée" : "Your spot is confirmed") : fr ? "Réservation annulée" : "Booking cancelled",
    `<p style="margin:0 0 8px">${
      ok
        ? fr
          ? `Bonjour ${esc(b.name)}, bonne nouvelle : votre réservation est confirmée.`
          : `Hello ${esc(b.name)}, good news: your booking is confirmed.`
        : fr
          ? `Bonjour ${esc(b.name)}, votre réservation a été annulée. Contactez-nous si vous souhaitez choisir une autre date.`
          : `Hello ${esc(b.name)}, your booking has been cancelled. Contact us if you would like to pick another date.`
    }</p>${details(sessionRows(b, fr))}`,
    await contactFooter(fr),
  )
  await send(
    b.email,
    ok ? (fr ? "Réservation confirmée — Ovolant" : "Booking confirmed — Ovolant") : fr ? "Réservation annulée — Ovolant" : "Booking cancelled — Ovolant",
    html,
  )
}

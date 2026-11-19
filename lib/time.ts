// All school times are Montréal time, whatever the server's time zone is.
export const TZ = "America/Toronto"

function zonedParts(d: Date) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, hourCycle: "h23",
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  })
  const o: Record<string, number> = {}
  for (const p of f.formatToParts(d)) if (p.type !== "literal") o[p.type] = Number(p.value)
  return o
}

function offsetMs(d: Date) {
  const p = zonedParts(d)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return asUtc - Math.floor(d.getTime() / 1000) * 1000
}

/** "2026-12-05T18:30" typed in Montréal time -> real UTC Date. */
export function zonedToUtc(local: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local)
  if (!m) return null
  const guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])
  let off = offsetMs(new Date(guess))
  let utc = guess - off
  const off2 = offsetMs(new Date(utc))
  if (off2 !== off) utc = guess - off2
  const d = new Date(utc)
  return Number.isNaN(d.getTime()) ? null : d
}

/** UTC Date -> "YYYY-MM-DDTHH:mm" in Montréal time (for <input type="datetime-local">). */
export function utcToLocalInput(d: Date) {
  const p = zonedParts(d)
  const z = (n: number, l = 2) => String(n).padStart(l, "0")
  return `${z(p.year, 4)}-${z(p.month)}-${z(p.day)}T${z(p.hour)}:${z(p.minute)}`
}

const loc = (lang: string) => (lang === "fr" ? "fr-CA" : "en-CA")

export function fmt(d: Date | string, lang: string, o: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(loc(lang), { timeZone: TZ, ...o }).format(new Date(d))
}
export const fmtDay = (d: Date | string, lang: string) => fmt(d, lang, { day: "numeric" })
export const fmtMonth = (d: Date | string, lang: string) => fmt(d, lang, { month: "short" }).replace(".", "")
export const fmtWeekday = (d: Date | string, lang: string) => fmt(d, lang, { weekday: "short" }).replace(".", "")
export const fmtTime = (d: Date | string, lang: string) => fmt(d, lang, { hour: "numeric", minute: "2-digit" })
export const fmtFull = (d: Date | string, lang: string) =>
  fmt(d, lang, { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" })
export const fmtShort = (d: Date | string, lang: string) =>
  fmt(d, lang, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })

export function fmtPrice(cents: number | null | undefined, lang: string) {
  if (cents == null) return ""
  return new Intl.NumberFormat(loc(lang), { style: "currency", currency: "CAD" }).format(cents / 100)
}

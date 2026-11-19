import Link from "next/link"
import { Clock, MapPin } from "lucide-react"
import type { Lang } from "@/lib/lang"
import { pick } from "@/lib/lang"
import { fmtDay, fmtMonth, fmtPrice, fmtTime, fmtWeekday } from "@/lib/time"
import { seatsLeft, type SessionRow } from "@/lib/data/sessions"

export function seatTone(s: Pick<SessionRow, "seats" | "booked">) {
  const left = seatsLeft(s)
  if (left === 0) return "full" as const
  if (left <= 3 || left / Math.max(1, s.seats) <= 0.25) return "low" as const
  return "open" as const
}
const DOT = { open: "bg-lime", low: "bg-amber", full: "bg-signal" }
const TEXT = { open: "text-lime", low: "text-amber", full: "text-signal" }

export function SessionList({ sessions, lang }: { sessions: SessionRow[]; lang: Lang }) {
  const L = pick(lang)
  return (
    <ul className="space-y-3">
      {sessions.map((s) => {
        const left = seatsLeft(s)
        const tone = seatTone(s)
        const end = new Date(new Date(s.starts_at).getTime() + s.duration_minutes * 60_000)
        const title = lang === "fr" ? s.title_fr : s.title_en || s.title_fr
        const desc = lang === "fr" ? s.description_fr : s.description_en || s.description_fr
        return (
          <li key={s.id} className="panel grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3 p-4 sm:grid-cols-[auto_1fr_auto] sm:p-5">
            <div className="flex w-16 flex-col items-center rounded-xl border border-line bg-panel2 py-2 text-center">
              <span className="text-xs text-muted-foreground">{fmtWeekday(s.starts_at, lang)}</span>
              <span className="font-display text-2xl font-semibold leading-none">{fmtDay(s.starts_at, lang)}</span>
              <span className="text-xs text-muted-foreground">{fmtMonth(s.starts_at, lang)}</span>
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold sm:text-lg">{title}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5" />{fmtTime(s.starts_at, lang)} – {fmtTime(end, lang)}</span>
                {s.location && <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5" />{s.location}</span>}
                {s.price_cents != null && <span className="font-medium text-foreground">{fmtPrice(s.price_cents, lang)}</span>}
              </p>
              {desc && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{desc}</p>}
            </div>
            <div className="col-span-2 flex items-center justify-between gap-3 border-t border-line pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
              <p className={`inline-flex items-center gap-2 text-sm font-medium ${TEXT[tone]}`}>
                <span className={`signal-dot ${DOT[tone]}`} />
                {tone === "full" ? L("Complet", "Full") : left === 1 ? L("1 place restante", "1 spot left") : L(`${left} places restantes`, `${left} spots left`)}
              </p>
              {tone === "full" ? (
                <span className="btn btn-ghost pointer-events-none opacity-50">{L("Complet", "Full")}</span>
              ) : (
                <Link href={`/book?session=${s.id}`} className="btn btn-lime">{L("Réserver", "Book")}</Link>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

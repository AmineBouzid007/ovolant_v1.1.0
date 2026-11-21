import Link from "next/link"
import { Clock, MapPin } from "lucide-react"
import type { Lang } from "@/lib/lang"
import { pick } from "@/lib/lang"
import { fmtDay, fmtMonth, fmtPrice, fmtTime, fmtWeekday } from "@/lib/time"
import { seatsLeft, type SessionRow } from "@/lib/data/sessions"
import { MiniDial, TONE_HEX } from "./gauge"

export function seatTone(s: Pick<SessionRow, "seats" | "booked">) {
  const left = seatsLeft(s)
  if (left === 0) return "full" as const
  if (left <= 3 || left / Math.max(1, s.seats) <= 0.25) return "low" as const
  return "open" as const
}
const DOT = { open: "bg-brand", low: "bg-sun", full: "bg-signal" }
const CHIP = { open: "bg-brand/15 text-lime", low: "bg-sun/15 text-amber", full: "bg-signal/15 text-signal" }

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
          <li key={s.id} className="panel grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-4 p-4 sm:grid-cols-[auto_1fr_auto] sm:p-5">
            <MiniDial pct={s.booked / Math.max(1, s.seats)} tone={tone}>
              <span className="text-[0.55rem] font-extrabold uppercase leading-none tracking-wider text-muted-foreground">{fmtWeekday(s.starts_at, lang)}</span>
              <span className="font-display my-0.5 text-xl leading-none text-white">{fmtDay(s.starts_at, lang)}</span>
              <span className="text-[0.55rem] font-extrabold uppercase leading-none tracking-wider" style={{ color: TONE_HEX[tone] }}>{fmtMonth(s.starts_at, lang)}</span>
            </MiniDial>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold sm:text-lg">{title}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Clock className="size-3.5 text-brand" />{fmtTime(s.starts_at, lang)} – {fmtTime(end, lang)}</span>
                {s.location && <span className="inline-flex items-center gap-1.5"><MapPin className="size-3.5 text-brand" />{s.location}</span>}
                {s.price_cents != null && <span className="font-extrabold text-foreground">{fmtPrice(s.price_cents, lang)}</span>}
              </p>
              {desc && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{desc}</p>}
            </div>
            <div className="col-span-2 flex items-center justify-between gap-3 border-t border-line pt-4 sm:col-span-1 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
              <p className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider ${CHIP[tone]}`}>
                <span className={`signal-dot ${DOT[tone]}`} />
                {tone === "full" ? L("Complet", "Full") : left === 1 ? L("1 place restante", "1 spot left") : L(`${left} places restantes`, `${left} spots left`)}
              </p>
              {tone === "full" ? (
                <span className="btn btn-ghost pointer-events-none opacity-40">{L("Complet", "Full")}</span>
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

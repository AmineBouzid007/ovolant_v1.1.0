import Link from "next/link"
import { Download, Search, Ticket } from "lucide-react"
import { Empty, PageHeader, inputCls, card } from "@/components/admin/ui"
import { DeleteBookingButton, StatusSelect } from "@/components/admin/booking-controls"
import { listBookings } from "@/lib/data/bookings"
import { listAllSessions } from "@/lib/data/sessions"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"
import { fmtShort } from "@/lib/time"

export const metadata = { title: "Bookings" }
const PAGE = 25

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; session?: string; page?: string }> }) {
  const sp = await searchParams
  const lang = await getLang()
  const L = pick(lang)
  const page = Math.max(1, Number(sp.page) || 1)
  const [{ rows, total }, sessions] = await Promise.all([listBookings(sp, page, PAGE), listAllSessions()])
  const pages = Math.max(1, Math.ceil(total / PAGE))

  const qs = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries({ q: sp.q, status: sp.status, session: sp.session, ...extra })) if (v) p.set(k, v)
    const s = p.toString()
    return s ? `?${s}` : ""
  }

  return (
    <>
      <PageHeader
        title={L("Réservations", "Bookings")}
        description={L(`${total} résultat(s)`, `${total} result(s)`)}
        action={
          <div className="flex flex-wrap gap-2">
            <a href={`/api/admin/bookings/export${qs({})}`} className="btn btn-lime"><Download className="size-4" />{L("Exporter Excel", "Export Excel")}</a>
            <a href={`/api/admin/bookings/export${qs({ delim: "comma" })}`} className="btn btn-ghost">CSV (,)</a>
          </div>
        }
      />

      <form method="get" className={`${card} mb-5 grid gap-3 p-4 md:grid-cols-[1.5fr_1fr_1.2fr_auto]`}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input name="q" defaultValue={sp.q} placeholder={L("Nom, courriel, téléphone…", "Name, email, phone…")} className={`${inputCls} pl-10`} />
        </div>
        <select name="status" defaultValue={sp.status ?? ""} className={inputCls} aria-label={L("Statut", "Status")}>
          <option value="">{L("Tous les statuts", "All statuses")}</option>
          <option value="pending">{L("En attente", "Pending")}</option>
          <option value="confirmed">{L("Confirmée", "Confirmed")}</option>
          <option value="cancelled">{L("Annulée", "Cancelled")}</option>
        </select>
        <select name="session" defaultValue={sp.session ?? ""} className={inputCls} aria-label={L("Cours", "Course")}>
          <option value="">{L("Tous les cours", "All courses")}</option>
          <option value="none">{L("Autre date", "Other date")}</option>
          {sessions.map((s) => <option key={s.id} value={s.id}>{(lang === "fr" ? s.title_fr : s.title_en) + " · " + fmtShort(s.starts_at, lang)}</option>)}
        </select>
        <div className="flex gap-2">
          <button className="btn btn-lime flex-1">{L("Filtrer", "Filter")}</button>
          {(sp.q || sp.status || sp.session) && <Link href="/admin/bookings" className="btn btn-ghost">{L("Effacer", "Clear")}</Link>}
        </div>
      </form>

      {rows.length === 0 ? (
        <Empty><Ticket className="mx-auto mb-3 size-8" /><p>{L("Aucune réservation ne correspond.", "No bookings match.")}</p></Empty>
      ) : (
        <ul className={`${card} divide-y divide-line`}>
          {rows.map((b) => (
            <li key={b.id} className="grid gap-3 p-4 md:grid-cols-[1.3fr_1.2fr_1.2fr_auto] md:items-center">
              <div className="min-w-0">
                <p className="font-medium">{b.name}</p>
                <p className="text-xs text-muted-foreground">{fmtShort(b.created_at, lang)} · {b.lang.toUpperCase()}</p>
                {b.notes && <p className="mt-1 line-clamp-2 text-sm italic text-muted-foreground">“{b.notes}”</p>}
              </div>
              <div className="min-w-0 text-sm">
                <a href={`tel:${b.phone.replace(/[^\d+]/g, "")}`} className="block text-foreground hover:text-lime">{b.phone}</a>
                <a href={`mailto:${b.email}`} className="block truncate text-muted-foreground hover:text-lime">{b.email}</a>
              </div>
              <div className="min-w-0 text-sm">
                <p className="truncate">{b.session_title}</p>
                <p className="text-xs text-muted-foreground">{b.session_starts_at ? fmtShort(b.session_starts_at, lang) : L("Date à convenir", "Date to arrange")}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusSelect id={b.id} status={b.status} lang={lang} />
                <DeleteBookingButton id={b.id} lang={lang} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-center gap-3 text-sm" aria-label="Pagination">
          {page > 1 && <Link href={`/admin/bookings${qs({ page: String(page - 1) })}`} className="btn btn-ghost">{L("Précédent", "Previous")}</Link>}
          <span className="text-muted-foreground">{page} / {pages}</span>
          {page < pages && <Link href={`/admin/bookings${qs({ page: String(page + 1) })}`} className="btn btn-ghost">{L("Suivant", "Next")}</Link>}
        </nav>
      )}
    </>
  )
}

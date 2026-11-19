import Link from "next/link"
import { CalendarDays, Clock, Ticket, TrendingUp } from "lucide-react"
import { PageHeader, StatCard, StatusBadge, SeatBar, Empty, card } from "@/components/admin/ui"
import { dashboardStats, latestBookings } from "@/lib/data/bookings"
import { listUpcomingSessions, seatsLeft } from "@/lib/data/sessions"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"
import { fmtShort } from "@/lib/time"

export const metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const lang = await getLang()
  const L = pick(lang)
  const [stats, latest, upcoming] = await Promise.all([dashboardStats(), latestBookings(6), listUpcomingSessions(5)])
  const statusLabel = (s: string) => (s === "pending" ? L("En attente", "Pending") : s === "confirmed" ? L("Confirmée", "Confirmed") : L("Annulée", "Cancelled"))
  return (
    <>
      <PageHeader title={L("Tableau de bord", "Dashboard")} description={L("Vue d'ensemble des réservations et des prochains cours.", "Overview of bookings and upcoming courses.")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard accent label={L("À confirmer", "To confirm")} value={String(stats.pending)} hint={L("Réservations en attente", "Pending bookings")} icon={Clock} />
        <StatCard label={L("Cette semaine", "This week")} value={String(stats.week)} hint={L("Nouvelles réservations (7 jours)", "New bookings (7 days)")} icon={TrendingUp} />
        <StatCard label={L("Prochains cours", "Upcoming courses")} value={String(stats.upcoming)} hint={L("Publiés sur le site", "Published on the site")} icon={CalendarDays} />
        <StatCard label="Total" value={String(stats.total)} hint={L("Toutes les réservations", "All bookings")} icon={Ticket} />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">{L("Dernières réservations", "Latest bookings")}</h2><Link href="/admin/bookings" className="text-sm text-lime">{L("Tout voir", "View all")}</Link></div>
          {latest.length ? (
            <ul className={`${card} divide-y divide-line`}>
              {latest.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{b.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{b.session_title}{b.session_starts_at ? ` · ${fmtShort(b.session_starts_at, lang)}` : ""}</p>
                  </div>
                  <StatusBadge status={b.status} label={statusLabel(b.status)} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty><Ticket className="mx-auto mb-3 size-8" /><p>{L("Aucune réservation pour l'instant.", "No bookings yet.")}</p></Empty>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">{L("Prochains cours", "Upcoming courses")}</h2><Link href="/admin/sessions" className="text-sm text-lime">{L("Gérer", "Manage")}</Link></div>
          {upcoming.length ? (
            <ul className={`${card} divide-y divide-line`}>
              {upcoming.map((s) => (
                <li key={s.id} className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-medium">{lang === "fr" ? s.title_fr : s.title_en}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{fmtShort(s.starts_at, lang)}</span>
                  </div>
                  <SeatBar booked={s.booked} seats={s.seats} />
                  <p className="text-xs text-muted-foreground">{s.booked}/{s.seats} · {L(`${seatsLeft(s)} places restantes`, `${seatsLeft(s)} spots left`)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty><CalendarDays className="mx-auto mb-3 size-8" /><p>{L("Aucun cours à venir.", "No upcoming courses.")}</p><Link href="/admin/sessions/new" className="btn btn-lime mt-4">{L("Ajouter un cours", "Add a course")}</Link></Empty>
          )}
        </section>
      </div>
    </>
  )
}

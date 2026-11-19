import Link from "next/link"
import { CalendarDays, Pencil, Plus } from "lucide-react"
import { Empty, PageHeader, SeatBar, card } from "@/components/admin/ui"
import { listAllSessions, seatsLeft } from "@/lib/data/sessions"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"
import { fmtShort, fmtPrice } from "@/lib/time"

export const metadata = { title: "Courses" }

export default async function SessionsPage() {
  const lang = await getLang()
  const L = pick(lang)
  const sessions = await listAllSessions()
  const now = Date.now()
  return (
    <>
      <PageHeader
        title={L("Cours et dates", "Courses & dates")}
        description={L("Créez les dates affichées sur le site, avec le nombre de places.", "Create the dates shown on the site, with their number of seats.")}
        action={<Link href="/admin/sessions/new" className="btn btn-lime"><Plus className="size-4" />{L("Ajouter un cours", "Add a course")}</Link>}
      />
      {sessions.length === 0 ? (
        <Empty><CalendarDays className="mx-auto mb-3 size-8" /><p>{L("Aucun cours créé.", "No courses created.")}</p></Empty>
      ) : (
        <ul className={`${card} divide-y divide-line`}>
          {sessions.map((s) => {
            const past = new Date(s.starts_at).getTime() < now
            return (
              <li key={s.id} className={`grid gap-3 p-4 md:grid-cols-[1.6fr_1fr_auto] md:items-center ${past ? "opacity-55" : ""}`}>
                <div className="min-w-0">
                  <p className="font-medium">{lang === "fr" ? s.title_fr : s.title_en}</p>
                  <p className="text-sm text-muted-foreground">{fmtShort(s.starts_at, lang)}{s.location ? ` · ${s.location}` : ""}{s.price_cents != null ? ` · ${fmtPrice(s.price_cents, lang)}` : ""}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {!s.published && <span className="mr-2 rounded bg-panel2 px-1.5 py-0.5">{L("Masqué", "Hidden")}</span>}
                    {past && <span className="rounded bg-panel2 px-1.5 py-0.5">{L("Passé", "Past")}</span>}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <SeatBar booked={s.booked} seats={s.seats} />
                  <Link href={`/admin/bookings?session=${s.id}`} className="text-xs text-muted-foreground hover:text-lime">{s.booked}/{s.seats} · {L(`${seatsLeft(s)} restantes`, `${seatsLeft(s)} left`)}</Link>
                </div>
                <Link href={`/admin/sessions/${s.id}`} className="btn btn-ghost"><Pencil className="size-4" />{L("Modifier", "Edit")}</Link>
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

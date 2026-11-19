import { notFound } from "next/navigation"
import { PageHeader } from "@/components/admin/ui"
import { SessionForm } from "@/components/admin/session-form"
import { ConfirmButton } from "@/components/admin/confirm-button"
import { deleteSessionAction } from "@/app/admin/actions"
import { getSession } from "@/lib/data/sessions"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"
import { utcToLocalInput } from "@/lib/time"

export const metadata = { title: "Edit course" }

export default async function EditSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = await getSession(id)
  if (!s) notFound()
  const lang = await getLang()
  const L = pick(lang)
  return (
    <>
      <PageHeader title={L("Modifier le cours", "Edit course")} description={L(`${s.booked} réservation(s) active(s)`, `${s.booked} active booking(s)`)} />
      <SessionForm
        lang={lang}
        d={{
          id: s.id, title_fr: s.title_fr, title_en: s.title_en, description_fr: s.description_fr, description_en: s.description_en,
          starts_local: utcToLocalInput(new Date(s.starts_at)), duration_minutes: s.duration_minutes, location: s.location,
          seats: s.seats, price: s.price_cents == null ? "" : (s.price_cents / 100).toFixed(2), published: s.published,
        }}
      />
      <form action={deleteSessionAction} className="mt-6 max-w-3xl">
        <input type="hidden" name="id" value={s.id} />
        <ConfirmButton message={L("Supprimer ce cours ? Les réservations sont conservées.", "Delete this course? Bookings are kept.")}>{L("Supprimer ce cours", "Delete this course")}</ConfirmButton>
      </form>
    </>
  )
}

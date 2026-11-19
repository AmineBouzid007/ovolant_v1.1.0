import { PageHeader } from "@/components/admin/ui"
import { SessionForm } from "@/components/admin/session-form"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"
import { utcToLocalInput } from "@/lib/time"

export const metadata = { title: "New course" }

export default async function NewSessionPage() {
  const lang = await getLang()
  const L = pick(lang)
  const tomorrow = utcToLocalInput(new Date(Date.now() + 24 * 3600_000)).slice(0, 11) + "18:00"
  return (
    <>
      <PageHeader title={L("Nouveau cours", "New course")} />
      <SessionForm lang={lang} d={{ title_fr: "", title_en: "", description_fr: "", description_en: "", starts_local: tomorrow, duration_minutes: 120, location: "", seats: 12, price: "", published: true }} />
    </>
  )
}

import type { Metadata } from "next"
import { BookingForm, type SessionOption } from "@/components/site/booking-form"
import { getSettings } from "@/lib/data/settings"
import { listUpcomingSessions, seatsLeft } from "@/lib/data/sessions"
import { safe } from "@/lib/data/safe"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"
import { fmtPrice, fmtShort } from "@/lib/time"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const L = pick(await getLang())
  return { title: L("Réserver un cours", "Book a course"), alternates: { canonical: "/book" } }
}

export default async function BookPage({ searchParams }: { searchParams: Promise<{ session?: string }> }) {
  const [{ session }, lang, s, sessions] = await Promise.all([
    searchParams, getLang(), getSettings(), safe(() => listUpcomingSessions(30), []),
  ])
  const L = pick(lang)
  const options: SessionOption[] = sessions.map((x) => ({
    id: x.id,
    title: lang === "fr" ? x.title_fr : x.title_en || x.title_fr,
    when: fmtShort(x.starts_at, lang),
    sub: [x.location, fmtPrice(x.price_cents, lang)].filter(Boolean).join(" · "),
    left: seatsLeft(x),
  }))
  const initial = options.some((o) => o.id === session && o.left > 0) ? session : undefined
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{L("Réserver un cours", "Book a course")}</h1>
      <p className="mt-3 text-muted-foreground">{L("Aucun paiement en ligne. Nous confirmons votre place par téléphone ou courriel.", "No online payment. We confirm your spot by phone or email.")}</p>
      <div className="mt-8">
        <BookingForm lang={lang} options={options} initial={initial} phone={s.contact_phone} />
      </div>
    </section>
  )
}

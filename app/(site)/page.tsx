import Link from "next/link"
import { ArrowRight, Mail, MapPin, Phone, Plus } from "lucide-react"
import { Gauge, type Tone } from "@/components/site/gauge"
import { SessionList, seatTone } from "@/components/site/session-list"
import { getSettings } from "@/lib/data/settings"
import { listUpcomingSessions, seatsLeft } from "@/lib/data/sessions"
import { listActiveImages, listContent } from "@/lib/data/content"
import { safe } from "@/lib/data/safe"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"
import { fmtDay, fmtMonth } from "@/lib/time"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const lang = await getLang()
  const L = pick(lang)
  const [s, sessions, images, instructors, testimonials] = await Promise.all([
    getSettings(),
    safe(() => listUpcomingSessions(12), []),
    safe(() => listActiveImages(4), []),
    safe(() => listContent("instructor"), []),
    safe(() => listContent("testimonial"), []),
  ])
  const tel = s.contact_phone.replace(/[^\d+]/g, "")
  const next = sessions[0]
  const tone: Tone = next ? seatTone(next) : "idle"
  const pct = next ? next.booked / Math.max(1, next.seats) : 0
  const left = next ? seatsLeft(next) : 0

  const faqs = [
    [L("Comment réserver un cours ?", "How do I book a course?"),
     L("Choisissez une date dans la liste, remplissez vos coordonnées et envoyez. Cela prend environ deux minutes.", "Pick a date from the list, fill in your details and send. It takes about two minutes.")],
    [L("Ma place est-elle garantie tout de suite ?", "Is my spot guaranteed right away?"),
     L("Votre demande est d'abord en attente. Nous vous contactons pour la confirmer, puis vous recevez un courriel de confirmation.", "Your request starts as pending. We contact you to confirm it, then you receive a confirmation email.")],
    [L("Comment modifier ou annuler ma réservation ?", "How do I change or cancel my booking?"),
     L("Appelez-nous ou écrivez-nous en indiquant votre nom et le cours choisi. Nous nous occupons du reste.", "Call or write to us with your name and the course you chose. We take care of the rest.")],
    [L("Aucune date ne me convient. Que faire ?", "None of the dates suit me. What now?"),
     L("Choisissez « Une autre date » dans le formulaire et indiquez vos disponibilités. Nous vous rappelons.", "Choose “Another date” in the form and tell us when you are free. We will call you back.")],
    [L("Dois-je payer en ligne ?", "Do I have to pay online?"),
     L("Non. La réservation est gratuite en ligne. Nous vous expliquons les modalités de paiement lors de la confirmation.", "No. Booking online is free. We explain the payment options when we confirm.")],
    [L("Que faites-vous de mes renseignements ?", "What do you do with my information?"),
     L("Ils servent uniquement à traiter votre réservation. Lisez notre politique de confidentialité pour le détail.", "They are only used to process your booking. Read our privacy policy for details.")],
  ]

  const ld = {
    "@context": "https://schema.org",
    "@type": "DrivingSchool",
    name: "Ovolant",
    description: L("École de conduite à Montréal", "Driving school in Montréal"),
    url: process.env.NEXT_PUBLIC_SITE_URL,
    image: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/brand/ovolant-logo.jpg`,
    telephone: s.contact_phone,
    email: s.contact_email || undefined,
    address: { "@type": "PostalAddress", addressLocality: "Montréal", addressRegion: "QC", addressCountry: "CA", streetAddress: s.address },
    areaServed: "Montréal",
    inLanguage: ["fr-CA", "en-CA"],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />

      {/* ---------- hero ---------- */}
      <section className="relative isolate overflow-hidden border-b border-line">
        <div className="road" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <h1 className="font-display text-[clamp(2rem,6.2vw,3.75rem)] font-semibold leading-[1.06]">
              {L("Prenez le volant en toute confiance.", "Take the wheel with confidence.")}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              {L("École de conduite à Montréal. Choisissez votre prochain cours et réservez votre place en ligne, en deux minutes.", "Driving school in Montréal. Choose your next course and book your spot online in two minutes.")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/book" className="btn btn-lime h-12 text-base">{L("Réserver un cours", "Book a course")} <ArrowRight className="size-4" /></Link>
              {s.contact_phone && <a href={`tel:${tel}`} className="btn btn-ghost h-12 text-base"><Phone className="size-4" />{s.contact_phone}</a>}
            </div>
          </div>

          <div className="hud panel mx-auto w-full max-w-sm p-5 sm:p-6">
            <Gauge pct={pct} tone={tone}>
              {next ? (
                <>
                  <span className="text-xs text-muted-foreground">{L("Prochain cours", "Next course")}</span>
                  <span className="font-display mt-1 text-[clamp(1.6rem,7vw,2.25rem)] font-semibold leading-none">{fmtDay(next.starts_at, lang)} {fmtMonth(next.starts_at, lang)}</span>
                  <span className={`mt-2 text-sm font-medium ${tone === "full" ? "text-signal" : tone === "low" ? "text-amber" : "text-lime"}`}>
                    {left === 0 ? L("Complet", "Full") : left === 1 ? L("1 place", "1 spot") : L(`${left} places`, `${left} spots`)}
                  </span>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">{L("Nouvelles dates bientôt", "New dates soon")}</span>
              )}
            </Gauge>
            {next && (
              <Link href={`/book?session=${next.id}`} className="btn btn-ghost mt-2 w-full">{L("Réserver cette date", "Book this date")}</Link>
            )}
          </div>
        </div>
      </section>

      {/* ---------- upcoming courses + schedule photo ---------- */}
      <section id="cours" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">{L("Prochains cours", "Upcoming courses")}</h2>
        <p className="mt-2 text-muted-foreground">{L("Le nombre de places est mis à jour en direct.", "Available spots are updated live.")}</p>

        <div className={`mt-8 grid gap-8 ${images.length ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
          <div>
            {sessions.length ? (
              <SessionList sessions={sessions} lang={lang} />
            ) : (
              <div className="panel p-8 text-center text-muted-foreground">
                <p className="text-foreground">{L("Les prochaines dates seront annoncées bientôt.", "Upcoming dates will be announced soon.")}</p>
                <p className="mt-2 text-sm">{L("Vous pouvez déjà nous envoyer une demande.", "You can already send us a request.")}</p>
                <Link href="/book" className="btn btn-lime mt-5">{L("Envoyer une demande", "Send a request")}</Link>
              </div>
            )}
          </div>
          {images.length > 0 && (
            <div className="space-y-4">
              {images.map((im) => (
                <a key={im.id} href={im.url} target="_blank" rel="noopener noreferrer" className="panel block overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt={im.caption || L("Horaire des prochains cours", "Upcoming course schedule")} loading="lazy" decoding="async" className="h-auto w-full" />
                  {im.caption && <p className="border-t border-line px-4 py-2 text-sm text-muted-foreground">{im.caption}</p>}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section id="comment" className="border-y border-line bg-panel/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">{L("Comment réserver", "How to book")}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              [L("Choisissez une date", "Pick a date"), L("Parcourez les prochains cours et leurs places restantes.", "Browse the upcoming courses and the spots left.")],
              [L("Laissez vos coordonnées", "Leave your details"), L("Nom, téléphone et courriel. Pas de compte à créer.", "Name, phone and email. No account to create.")],
              [L("Nous confirmons", "We confirm"), L("Nous vous contactons et vous recevez un courriel de confirmation.", "We contact you and you receive a confirmation email.")],
            ].map(([t, d], i) => (
              <li key={i} className="panel p-6">
                <span className="font-display flex size-10 items-center justify-center rounded-full border border-lime/60 text-lime">{i + 1}</span>
                <h3 className="mt-4 text-lg font-semibold">{t}</h3>
                <p className="mt-2 text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- instructors (only if the admin added some) ---------- */}
      {instructors.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">{L("Nos instructeurs", "Our instructors")}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {instructors.map((i) => (
              <article key={i.id} className="panel p-6">
                <div className="font-display flex size-12 items-center justify-center rounded-full bg-lime text-lg font-semibold text-[var(--lime-ink)]">{i.name.charAt(0)}</div>
                <h3 className="mt-4 text-lg font-semibold">{i.name}</h3>
                <p className="text-sm text-lime">{lang === "fr" ? i.role_fr : i.role_en || i.role_fr}</p>
                <p className="mt-3 text-muted-foreground">{lang === "fr" ? i.text_fr : i.text_en || i.text_fr}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ---------- testimonials (only if the admin added some) ---------- */}
      {testimonials.length > 0 && (
        <section className="border-y border-line bg-panel/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">{L("Ce que disent nos élèves", "What our students say")}</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.id} className="panel p-6">
                  <blockquote className="text-foreground">« {lang === "fr" ? t.text_fr : t.text_en || t.text_fr} »</blockquote>
                  <figcaption className="mt-4 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{t.name}</span>
                    {(lang === "fr" ? t.role_fr : t.role_en || t.role_fr) && <> — {lang === "fr" ? t.role_fr : t.role_en || t.role_fr}</>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- FAQ (native <details>: zero JS) ---------- */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">FAQ</h2>
        <div className="mt-8 divide-y divide-line rounded-2xl border border-line bg-panel">
          {faqs.map(([q, a]) => (
            <details key={q} className="group px-5">
              <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-3 font-medium">
                {q}
                <Plus className="faq-icon size-5 shrink-0 text-lime transition-transform" />
              </summary>
              <p className="pb-5 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- contact + map ---------- */}
      <section id="contact" className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">{L("Nous joindre", "Get in touch")}</h2>
            <ul className="mt-6 space-y-4 text-muted-foreground">
              {s.contact_phone && <li className="flex items-center gap-3"><Phone className="size-5 text-lime" /><a href={`tel:${tel}`} className="text-foreground">{s.contact_phone}</a></li>}
              {s.contact_email && <li className="flex items-center gap-3"><Mail className="size-5 text-lime" /><a href={`mailto:${s.contact_email}`} className="text-foreground">{s.contact_email}</a></li>}
              {s.address && <li className="flex items-center gap-3"><MapPin className="size-5 text-lime" />{s.address}</li>}
            </ul>
            <Link href="/book" className="btn btn-lime mt-8">{L("Réserver un cours", "Book a course")}</Link>
          </div>
          {s.address && (
            <div className="panel overflow-hidden">
              <iframe
                title={L("Carte", "Map")}
                src={`https://www.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`}
                loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                className="map-dark h-72 w-full border-0 sm:h-80"
              />
            </div>
          )}
        </div>
      </section>
    </>
  )
}

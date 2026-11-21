import Link from "next/link"
import { ArrowRight, Mail, MapPin, Phone, Plus } from "lucide-react"
import { Gauge, TONE_HEX, type Tone } from "@/components/site/gauge"
import { SessionList, seatTone } from "@/components/site/session-list"
import { getSettings } from "@/lib/data/settings"
import { listUpcomingSessions, seatsLeft } from "@/lib/data/sessions"
import { listActiveImages, listContent } from "@/lib/data/content"
import { safe } from "@/lib/data/safe"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"
import { fmtDay, fmtMonth, fmtWeekday } from "@/lib/time"

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
  const totalLeft = sessions.reduce((n, x) => n + seatsLeft(x), 0)

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

  const h2 = "font-display text-[clamp(1.3rem,3.6vw,2.1rem)]"
  const ticker = [L("École de conduite", "Driving school"), "Montréal", L("Réservation en ligne", "Online booking"), "Français / English"]
  const iconBox = "flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-on-lime"

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />

      {/* ---------- hero ---------- */}
      <section className="relative isolate overflow-hidden">
        <div className="hud-grid" aria-hidden="true" />
        <div className="hud-glow right-[-10%] top-[8%] size-[46rem] max-w-none" aria-hidden="true" />
        <div className="hud-floor" aria-hidden="true"><div className="hud-floor-plane" /></div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pb-24 pt-12 sm:px-6 md:pt-20 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <p className="inline-flex items-center gap-2.5 rounded-lg border border-line bg-panel/80 px-3.5 py-2 text-[0.68rem] font-extrabold uppercase tracking-[0.2em]">
              <span className="inline-flex gap-1" aria-hidden="true"><span className="signal-dot bg-signal" /><span className="signal-dot bg-sun" /><span className="signal-dot bg-brand" /></span>
              {L("École de conduite · Montréal", "Driving school · Montréal")}
            </p>
            <h1 className="font-display mt-6 text-[clamp(1.5rem,4.5vw,3rem)] leading-[1.1]">
              {L("Prenez le volant ", "Take the wheel ")}
              <span className="hud-glowtext">{L("en toute confiance.", "with confidence.")}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg font-semibold text-muted-foreground">
              {L("Choisissez votre prochain cours et réservez votre place en ligne, en deux minutes.", "Choose your next course and book your spot online, in two minutes.")}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/book" className="btn btn-lime h-14 pl-7 pr-6 text-sm">{L("Réserver un cours", "Book a course")}<ArrowRight /></Link>
              {s.contact_phone && <a href={`tel:${tel}`} className="btn btn-ghost h-14 text-sm"><Phone className="size-4" />{s.contact_phone}</a>}
            </div>
            {sessions.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-3">
                <li className="hud-tile"><b>{String(sessions.length).padStart(2, "0")}</b><span>{sessions.length === 1 ? L("cours à venir", "upcoming course") : L("cours à venir", "upcoming courses")}</span></li>
                <li className="hud-tile"><b>{String(totalLeft).padStart(2, "0")}</b><span>{L("places disponibles", "spots available")}</span></li>
              </ul>
            )}
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <Gauge pct={pct} tone={tone} lowLabel={L("Libre", "Open")} highLabel={L("Plein", "Full")}>
              {next ? (
                <>
                  <span className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">{L("Prochain cours", "Next course")}</span>
                  <span className="font-display mt-1.5 text-[clamp(2rem,9vw,3rem)] leading-none text-white">{fmtDay(next.starts_at, lang)}</span>
                  <span className="mt-1 text-xs font-extrabold uppercase tracking-[0.18em] text-white/80">{fmtWeekday(next.starts_at, lang)} · {fmtMonth(next.starts_at, lang)}</span>
                  <span className="mt-2 text-[0.8rem] font-extrabold uppercase tracking-wider" style={{ color: TONE_HEX[tone] }}>
                    {left === 0 ? L("Complet", "Full") : left === 1 ? L("1 place", "1 spot") : L(`${left} places`, `${left} spots`)}
                  </span>
                </>
              ) : (
                <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted-foreground">{L("Nouvelles dates bientôt", "New dates soon")}</span>
              )}
            </Gauge>
            {next && <Link href={`/book?session=${next.id}`} className="btn btn-ghost relative mt-6 w-full">{L("Réserver cette date", "Book this date")}</Link>}
          </div>
        </div>
      </section>

      {/* ---------- ticker ---------- */}
      <div className="hud-ticker" aria-hidden="true">
        <div className="hud-ticker-track">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center">
              {[...ticker, ...ticker].map((t, i) => (
                <span key={i} className="flex items-center gap-6 whitespace-nowrap px-6 py-2.5 text-[0.72rem] font-extrabold uppercase tracking-[0.22em]">{t}<span className="opacity-60">»»</span></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ---------- upcoming courses + schedule photo ---------- */}
      <section id="cours" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <p className="hud-eyebrow">{L("Horaire", "Schedule")}</p>
        <h2 className={h2}>{L("Prochains cours", "Upcoming courses")}</h2>
        <p className="mt-3 font-semibold text-muted-foreground">{L("Le nombre de places est mis à jour en direct.", "Available spots are updated live.")}</p>

        <div className={`mt-10 grid gap-8 ${images.length ? "lg:grid-cols-[1.4fr_1fr]" : ""}`}>
          <div>
            {sessions.length ? (
              <SessionList sessions={sessions} lang={lang} />
            ) : (
              <div className="panel p-10 text-center text-muted-foreground">
                <p className="text-lg font-extrabold text-foreground">{L("Les prochaines dates seront annoncées bientôt.", "Upcoming dates will be announced soon.")}</p>
                <p className="mt-2 text-sm">{L("Vous pouvez déjà nous envoyer une demande.", "You can already send us a request.")}</p>
                <Link href="/book" className="btn btn-lime mt-6">{L("Envoyer une demande", "Send a request")}</Link>
              </div>
            )}
          </div>
          {images.length > 0 && (
            <div className="space-y-4">
              {images.map((im) => (
                <a key={im.id} href={im.url} target="_blank" rel="noopener noreferrer" className="panel block overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt={im.caption || L("Horaire des prochains cours", "Upcoming course schedule")} loading="lazy" decoding="async" className="h-auto w-full" />
                  {im.caption && <p className="border-t border-line px-5 py-3 text-sm font-semibold text-muted-foreground">{im.caption}</p>}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section id="comment" className="hud-band">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="hud-eyebrow">{L("3 étapes", "3 steps")}</p>
          <h2 className={h2}>{L("Comment réserver", "How to book")}</h2>
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              [L("Choisissez une date", "Pick a date"), L("Parcourez les prochains cours et leurs places restantes.", "Browse the upcoming courses and the spots left.")],
              [L("Laissez vos coordonnées", "Leave your details"), L("Nom, téléphone et courriel. Pas de compte à créer.", "Name, phone and email. No account to create.")],
              [L("Nous confirmons", "We confirm"), L("Nous vous contactons et vous recevez un courriel de confirmation.", "We contact you and you receive a confirmation email.")],
            ].map(([t, d], i) => (
              <li key={i} className="panel relative overflow-hidden p-7">
                <span className="font-display text-6xl text-transparent [-webkit-text-stroke:1.5px_var(--lime)]" aria-hidden="true">0{i + 1}</span>
                <h3 className="mt-5 text-lg font-extrabold">{t}</h3>
                <p className="mt-2 text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- instructors (only if the admin added some) ---------- */}
      {instructors.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="hud-eyebrow">{L("Équipe", "Team")}</p>
          <h2 className={h2}>{L("Nos instructeurs", "Our instructors")}</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {instructors.map((i) => (
              <article key={i.id} className="panel p-7">
                <div className="font-display flex size-14 items-center justify-center rounded-xl bg-brand text-xl text-on-lime">{i.name.charAt(0)}</div>
                <h3 className="mt-5 text-lg font-extrabold">{i.name}</h3>
                <p className="text-sm font-bold text-lime">{lang === "fr" ? i.role_fr : i.role_en || i.role_fr}</p>
                <p className="mt-3 text-muted-foreground">{lang === "fr" ? i.text_fr : i.text_en || i.text_fr}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ---------- testimonials (only if the admin added some) ---------- */}
      {testimonials.length > 0 && (
        <section className="hud-band">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <p className="hud-eyebrow">{L("Avis", "Reviews")}</p>
            <h2 className={h2}>{L("Ce que disent nos élèves", "What our students say")}</h2>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <figure key={t.id} className="panel p-7">
                  <blockquote className="text-lg font-bold leading-snug">« {lang === "fr" ? t.text_fr : t.text_en || t.text_fr} »</blockquote>
                  <figcaption className="mt-5 text-sm text-muted-foreground">
                    <span className="font-extrabold text-foreground">{t.name}</span>
                    {(lang === "fr" ? t.role_fr : t.role_en || t.role_fr) && <> — {lang === "fr" ? t.role_fr : t.role_en || t.role_fr}</>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- FAQ (native <details>: zero JS) ---------- */}
      <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <p className="hud-eyebrow">{L("Questions fréquentes", "Common questions")}</p>
        <h2 className={h2}>FAQ</h2>
        <div className="panel mt-10 divide-y divide-line overflow-hidden">
          {faqs.map(([q, a]) => (
            <details key={q} className="group px-6">
              <summary className="flex min-h-16 cursor-pointer items-center justify-between gap-4 py-4 font-extrabold">
                {q}
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-panel2 text-brand"><Plus className="faq-icon size-4 transition-transform" /></span>
              </summary>
              <p className="pb-6 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---------- contact + map ---------- */}
      <section id="contact" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
          <div className="panel flex flex-col justify-between p-8">
            <div>
              <p className="hud-eyebrow">Contact</p>
              <h2 className={h2}>{L("Nous joindre", "Get in touch")}</h2>
              <ul className="mt-8 space-y-5 font-semibold text-muted-foreground">
                {s.contact_phone && <li className="flex items-center gap-4"><span className={iconBox}><Phone className="size-4" /></span><a href={`tel:${tel}`} className="text-lg font-extrabold text-foreground">{s.contact_phone}</a></li>}
                {s.contact_email && <li className="flex items-center gap-4"><span className={iconBox}><Mail className="size-4" /></span><a href={`mailto:${s.contact_email}`} className="text-foreground">{s.contact_email}</a></li>}
                {s.address && <li className="flex items-center gap-4"><span className={iconBox}><MapPin className="size-4" /></span>{s.address}</li>}
              </ul>
            </div>
            <Link href="/book" className="btn btn-lime mt-10 self-start">{L("Réserver un cours", "Book a course")}<ArrowRight /></Link>
          </div>
          {s.address && (
            <div className="panel min-h-72 overflow-hidden">
              <iframe
                title={L("Carte", "Map")}
                src={`https://www.google.com/maps?q=${encodeURIComponent(s.address)}&output=embed`}
                loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                className="hud-map h-full min-h-72 w-full border-0"
              />
            </div>
          )}
        </div>
      </section>
    </>
  )
}

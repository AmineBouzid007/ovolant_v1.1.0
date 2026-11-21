import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Facebook, MapPin, Phone, Mail } from "lucide-react"
import { getSettings } from "@/lib/data/settings"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"
import { OWNER } from "@/lib/owner"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const L = pick(await getLang())
  return {
    title: L(`À propos — ${OWNER.name}`, `About — ${OWNER.name}`),
    description: L(`${OWNER.name}, propriétaire de l'école de conduite Ovolant à Montréal.`, `${OWNER.name}, owner of Ovolant Driving School in Montréal.`),
    alternates: { canonical: "/about" },
  }
}

const C = 200
/** Flat dial that frames the portrait: ticks, a track and one lime arc. Same language as the homepage gauge. */
function PortraitDial({ initials, photo, name }: { initials: string; photo: string; name: string }) {
  const arc = "M 93.93 306.07 A 150 150 0 1 1 306.07 306.07"
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22rem]">
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <circle cx={C} cy={C} r="190" style={{ fill: "var(--panel)", stroke: "var(--line)" }} strokeWidth="2" />
        {Array.from({ length: 27 }, (_, i) => (
          <line key={i} x1={C} x2={C} y1={C - 176} y2={C - (i % 6 === 0 ? 162 : 169)} transform={`rotate(${-135 + 10 * i} ${C} ${C})`}
            style={{ stroke: i % 6 === 0 ? "var(--ink)" : "var(--line)" }} strokeWidth={i % 6 === 0 ? 3 : 2} strokeLinecap="round" />
        ))}
        <path d={arc} pathLength={100} fill="none" style={{ stroke: "var(--line)" }} strokeWidth="10" strokeLinecap="round" />
        <path className="hud-arc" d={arc} pathLength={100} fill="none" style={{ stroke: "var(--green)" }} strokeWidth="10" strokeLinecap="round" strokeDasharray="100 100" />
      </svg>
      <div className="absolute inset-[24%] overflow-hidden rounded-full border border-line bg-brand">
        {photo ? (
          <Image src={photo} alt={name} fill sizes="240px" className="object-cover" priority />
        ) : (
          <div className="font-display flex h-full w-full items-center justify-center text-5xl text-on-lime">{initials}</div>
        )}
      </div>
    </div>
  )
}

export default async function AboutPage() {
  const [lang, s] = await Promise.all([getLang(), getSettings()])
  const L = pick(lang)
  const tel = s.contact_phone.replace(/[^\d+]/g, "")
  const initials = OWNER.name.split(" ").map((w) => w[0]).slice(0, 2).join("")
  const first = OWNER.name.split(" ")[0]
  const last = OWNER.name.split(" ").slice(1).join(" ")
  const intro = L(OWNER.intro.fr, OWNER.intro.en)
  const message = L(OWNER.message.fr, OWNER.message.en)

  const info = [
    s.address && { icon: MapPin, label: L("Adresse", "Location"), value: s.address, href: undefined as string | undefined },
    s.contact_phone && { icon: Phone, label: L("Téléphone", "Phone"), value: s.contact_phone, href: `tel:${tel}` },
    s.contact_email && { icon: Mail, label: L("Courriel", "Email"), value: s.contact_email, href: `mailto:${s.contact_email}` },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string; href?: string }[]

  return (
    <div className="hud-root">
      {/* hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <p className="hud-eyebrow">{L("À propos", "About")}</p>
          <h1 className="font-display text-[clamp(2.2rem,7vw,4.2rem)] leading-[1.05]">
            {first}
            {last && <><br /><span className="hud-accent">{last}</span></>}
          </h1>
          <p className="mt-5 text-lg font-semibold text-muted-foreground">{L(OWNER.role.fr, OWNER.role.en)}</p>
          {intro && <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{intro}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/book" className="btn btn-lime">{L("Réserver un cours", "Book a course")}<ArrowRight className="size-4" /></Link>
            <a href={OWNER.links.schoolFacebook} target="_blank" rel="noopener noreferrer" className="btn btn-ghost"><Facebook className="size-4" />{L("Page de l'école", "School page")}</a>
          </div>
        </div>
        <PortraitDial initials={initials} photo={OWNER.photo} name={OWNER.name} />
      </section>

      {/* facts + highlights + message: only what is filled in lib/owner.ts */}
      {(OWNER.facts.length > 0 || OWNER.highlights.length > 0 || message) && (
        <section className="hud-band">
          <div className="mx-auto max-w-6xl space-y-10 px-4 py-12 sm:px-6">
            {OWNER.facts.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {OWNER.facts.map((f) => <div key={f.en} className="hud-tile"><b>{f.value}</b><span>{L(f.fr, f.en)}</span></div>)}
              </div>
            )}
            {OWNER.highlights.length > 0 && (
              <div>
                <p className="hud-eyebrow">{L("En bref", "At a glance")}</p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {OWNER.highlights.map((h) => (
                    <li key={h.en} className="flex items-center gap-3 rounded-xl border border-line bg-white p-4 font-semibold"><span className="size-2.5 shrink-0 rounded-full bg-brand" />{L(h.fr, h.en)}</li>
                  ))}
                </ul>
              </div>
            )}
            {message && <blockquote className="border-l-4 border-l-brand pl-5 text-xl font-semibold leading-relaxed">{message}</blockquote>}
          </div>
        </section>
      )}

      {/* contact */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="hud-eyebrow">{L("Nous joindre", "Get in touch")}</p>
        <div className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
          {info.map(({ icon: Icon, label, value, href }) => {
            const body = (
              <>
                <Icon className="size-5 text-lime" aria-hidden="true" />
                <span className="mt-3 block text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
                <span className="mt-1 block font-bold break-words">{value}</span>
              </>
            )
            const cls = "panel block p-5 transition-colors hover:border-lime"
            return href ? <a key={label} href={href} className={cls}>{body}</a> : <div key={label} className={cls}>{body}</div>
          })}
        </div>
      </section>
    </div>
  )
}

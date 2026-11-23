import Image from "next/image"
import Link from "next/link"
import { Phone } from "lucide-react"
import type { Lang } from "@/lib/lang"
import { pick } from "@/lib/lang"
import { LangSwitch } from "./lang-switch"
import { MobileMenu } from "./mobile-menu"

export function Header({ lang, phone }: { lang: Lang; phone: string }) {
  const L = pick(lang)
  const tel = phone.replace(/[^\d+]/g, "")
  const links = [
    { href: "/#cours", label: L("Prochains cours", "Upcoming courses") },
    { href: "/#comment", label: L("Comment réserver", "How to book") },
    { href: "/about", label: L("À propos", "About") },
    { href: "/#faq", label: "FAQ" },
    { href: "/#contact", label: "Contact" },
  ]
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <div className="relative mx-auto flex h-[4.5rem] max-w-6xl items-center gap-2 rounded-2xl border border-line bg-white pl-2.5 pr-2 sm:gap-3 sm:pl-3">
        <Link href="/" aria-label="Ovolant" className="mr-auto flex items-center">
          <span className="flex size-14 items-center justify-center overflow-hidden rounded-xl bg-white">
            <Image src="/brand/ovolant-logo.jpg" alt="Ovolant — École de conduite" width={447} height={447} priority className="size-14 object-contain" />
          </span>
        </Link>
        <nav className="hidden items-center md:flex" aria-label="Menu">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3.5 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-panel2 hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <LangSwitch lang={lang} className="hidden md:inline-flex" />
        <Link href="/book" className="btn btn-lime min-h-11 px-5">{L("Réserver", "Book now")}</Link>
        <MobileMenu links={links} label={L("Ouvrir le menu", "Open menu")}>
          <LangSwitch lang={lang} className="self-start" />
          {phone && (
            <a href={`tel:${tel}`} className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground">
              <Phone className="size-4" /> {phone}
            </a>
          )}
        </MobileMenu>
      </div>
    </header>
  )
}

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
    { href: "/#faq", label: "FAQ" },
    { href: "/#contact", label: "Contact" },
  ]
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-[#070b11]/85 backdrop-blur-md">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" aria-label="Ovolant" className="mr-auto flex items-center gap-3">
          <Image src="/brand/ovolant-logo.jpg" alt="Ovolant — École de conduite" width={447} height={447} priority className="size-11 rounded-xl bg-white object-contain" />
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Menu">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-3.5 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
        <LangSwitch lang={lang} className="hidden md:inline-flex" />
        <Link href="/book" className="btn btn-lime">{L("Réserver", "Book now")}</Link>
        <MobileMenu links={links} label={L("Ouvrir le menu", "Open menu")}>
          <LangSwitch lang={lang} className="self-start" />
          {phone && (
            <a href={`tel:${tel}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="size-4" /> {phone}
            </a>
          )}
        </MobileMenu>
      </div>
    </header>
  )
}

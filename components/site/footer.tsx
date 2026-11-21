import Image from "next/image"
import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react"
import type { Lang } from "@/lib/lang"
import { pick } from "@/lib/lang"
import type { SiteSettings } from "@/lib/data/settings"

const social = "flex size-11 items-center justify-center rounded-xl border border-line bg-white transition-colors hover:border-lime hover:text-lime"

export function Footer({ lang, s }: { lang: Lang; s: SiteSettings }) {
  const L = pick(lang)
  const tel = s.contact_phone.replace(/[^\d+]/g, "")
  return (
    <footer className="relative border-t border-line bg-panel">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto]">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center overflow-hidden rounded-xl bg-white">
              <Image src="/brand/ovolant-logo.jpg" alt="Ovolant" width={447} height={447} className="size-11 object-contain" />
            </span>
            <span className="inline-flex gap-1.5" aria-hidden="true">
              <span className="signal-dot bg-signal" /><span className="signal-dot bg-sun" /><span className="signal-dot bg-brand" />
            </span>
          </div>
          {s.contact_phone && <p className="flex items-center gap-2"><Phone className="size-4 text-lime" /><a href={`tel:${tel}`} className="hover:text-foreground">{s.contact_phone}</a></p>}
          {s.contact_email && <p className="flex items-center gap-2"><Mail className="size-4 text-lime" /><a href={`mailto:${s.contact_email}`} className="hover:text-foreground">{s.contact_email}</a></p>}
          {s.address && <p className="flex items-center gap-2"><MapPin className="size-4 text-lime" />{s.address}</p>}
        </div>
        <div className="flex flex-col gap-3 text-sm md:items-end">
          <div className="flex gap-3">
            {s.facebook && <a href={s.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={social}><Facebook className="size-4" /></a>}
            {s.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={social}><Instagram className="size-4" /></a>}
          </div>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">{L("Politique de confidentialité", "Privacy policy")}</Link>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-[0.7rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">© {new Date().getFullYear()} Ovolant — {L("École de conduite", "Driving school")}</div>
    </footer>
  )
}

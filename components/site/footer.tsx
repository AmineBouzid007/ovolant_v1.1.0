import Image from "next/image"
import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react"
import type { Lang } from "@/lib/lang"
import { pick } from "@/lib/lang"
import type { SiteSettings } from "@/lib/data/settings"

export function Footer({ lang, s }: { lang: Lang; s: SiteSettings }) {
  const L = pick(lang)
  const tel = s.contact_phone.replace(/[^\d+]/g, "")
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto]">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <Image src="/brand/ovolant-logo.jpg" alt="Ovolant" width={447} height={447} className="size-12 rounded-xl bg-white object-contain" />
            <span className="inline-flex gap-1.5" aria-hidden="true">
              <span className="signal-dot bg-signal" /><span className="signal-dot bg-amber" /><span className="signal-dot bg-lime" />
            </span>
          </div>
          {s.contact_phone && <p className="flex items-center gap-2"><Phone className="size-4" /><a href={`tel:${tel}`} className="hover:text-foreground">{s.contact_phone}</a></p>}
          {s.contact_email && <p className="flex items-center gap-2"><Mail className="size-4" /><a href={`mailto:${s.contact_email}`} className="hover:text-foreground">{s.contact_email}</a></p>}
          {s.address && <p className="flex items-center gap-2"><MapPin className="size-4" />{s.address}</p>}
        </div>
        <div className="flex flex-col gap-3 text-sm md:items-end">
          <div className="flex gap-3">
            {s.facebook && <a href={s.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex size-11 items-center justify-center rounded-full border border-line hover:border-lime"><Facebook className="size-4" /></a>}
            {s.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="flex size-11 items-center justify-center rounded-full border border-line hover:border-lime"><Instagram className="size-4" /></a>}
          </div>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground">{L("Politique de confidentialité", "Privacy policy")}</Link>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Ovolant — {L("École de conduite", "Driving school")}</div>
    </footer>
  )
}

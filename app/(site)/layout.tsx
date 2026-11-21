import type { Viewport } from "next"
import { MessageCircle } from "lucide-react"
import { Header } from "@/components/site/header"
import { Footer } from "@/components/site/footer"
import { getSettings } from "@/lib/data/settings"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"

export const dynamic = "force-dynamic"
export const viewport: Viewport = { themeColor: "#04070a", colorScheme: "dark" }

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, lang] = await Promise.all([getSettings(), getLang()])
  const wa = s.whatsapp.replace(/\D/g, "")
  return (
    <div className="hud-root">
      <Header lang={lang} phone={s.contact_phone} />
      <main className="min-h-[70vh]">{children}</main>
      <Footer lang={lang} s={s} />
      {wa && (
        <a
          href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
          aria-label={pick(lang)("Écrire sur WhatsApp", "Message on WhatsApp")}
          className="fixed bottom-5 right-5 z-30 flex size-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg shadow-black/40 transition-transform active:scale-95"
          style={{ marginBottom: "env(safe-area-inset-bottom)" }}
        >
          <MessageCircle className="size-7" />
        </a>
      )}
    </div>
  )
}

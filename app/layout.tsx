import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { getLang } from "@/lib/i18n"
import "@fontsource-variable/instrument-sans/index.css"
import "@fontsource-variable/unbounded/index.css"
import "./globals.css"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const fr = lang === "fr"
  const title = fr ? "Ovolant — École de conduite à Montréal" : "Ovolant — Driving school in Montréal"
  const description = fr
    ? "Ovolant, école de conduite à Montréal. Consultez les prochains cours et réservez votre place en ligne en deux minutes."
    : "Ovolant, a driving school in Montréal. See the next courses and book your spot online in two minutes."
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: "%s — Ovolant" },
    description,
    keywords: fr
      ? ["école de conduite Montréal", "cours de conduite", "permis de conduire Québec", "Ovolant"]
      : ["driving school Montréal", "driving lessons", "Québec driver's licence", "Ovolant"],
    alternates: { canonical: "/" },
    openGraph: { title, description, siteName: "Ovolant", type: "website", locale: fr ? "fr_CA" : "en_CA", images: ["/brand/ovolant-logo.jpg"] },
    twitter: { card: "summary", title, description },
  }
}

export const viewport: Viewport = { themeColor: "#070b11", width: "device-width", initialScale: 1 }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang()
  return (
    <html lang={lang}>
      <body>
        {children}
        <Toaster position="top-center" theme="dark" />
        <Analytics />
      </body>
    </html>
  )
}

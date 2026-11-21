import Link from "next/link"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"

export default async function NotFound() {
  const L = pick(await getLang())
  return (
    <section className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display hud-glowtext text-7xl">404</p>
      <h1 className="mt-4 text-2xl font-extrabold">{L("Page introuvable", "Page not found")}</h1>
      <p className="mt-2 text-muted-foreground">{L("Cette route n'existe pas. Revenez à l'accueil.", "This road does not exist. Head back home.")}</p>
      <Link href="/" className="btn btn-lime mt-8">{L("Retour à l'accueil", "Back to home")}</Link>
    </section>
  )
}

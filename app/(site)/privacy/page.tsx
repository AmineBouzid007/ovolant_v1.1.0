import type { Metadata } from "next"
import { getSettings } from "@/lib/data/settings"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"

export const dynamic = "force-dynamic"

export async function generateMetadata(): Promise<Metadata> {
  const L = pick(await getLang())
  return { title: L("Politique de confidentialité", "Privacy policy"), alternates: { canonical: "/privacy" } }
}

export default async function PrivacyPage() {
  const [lang, s] = await Promise.all([getLang(), getSettings()])
  const L = pick(lang)
  const contact = s.contact_email || s.contact_phone
  const blocks: [string, string][] = [
    [L("Renseignements recueillis", "Information we collect"),
     L("Lorsque vous réservez, nous recueillons votre nom, votre numéro de téléphone, votre adresse courriel, le cours choisi, votre message facultatif et votre langue préférée.", "When you book, we collect your name, phone number, email address, the course you chose, your optional message and your preferred language.")],
    [L("Pourquoi nous les utilisons", "Why we use it"),
     L("Uniquement pour traiter votre réservation, vous contacter, vous envoyer des courriels de confirmation ou d'annulation et gérer nos groupes. Nous ne vendons pas vos renseignements.", "Only to process your booking, contact you, send confirmation or cancellation emails and manage our groups. We do not sell your information.")],
    [L("Qui y a accès", "Who has access"),
     L("Le personnel d'Ovolant et nos fournisseurs techniques (hébergement du site, base de données et envoi de courriels). Ces services peuvent stocker des données à l'extérieur du Québec.", "Ovolant staff and our technical providers (website hosting, database and email delivery). These services may store data outside Québec.")],
    [L("Durée de conservation", "How long we keep it"),
     L("Nous conservons vos renseignements le temps nécessaire pour gérer votre formation et nos obligations, puis nous les supprimons ou les anonymisons.", "We keep your information as long as needed to manage your training and our obligations, then delete or anonymise it.")],
    [L("Vos droits", "Your rights"),
     L("Vous pouvez demander l'accès à vos renseignements, leur correction ou leur suppression, et retirer votre consentement en tout temps, conformément à la Loi 25 du Québec.", "You can ask to access, correct or delete your information, and withdraw your consent at any time, in line with Québec's Law 25.")],
    [L("Nous joindre", "Contact us"),
     L(`Pour toute demande liée à vos renseignements personnels : ${contact || "voir la page d'accueil"}.`, `For any request about your personal information: ${contact || "see the home page"}.`)],
  ]
  return (
    <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{L("Politique de confidentialité", "Privacy policy")}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{L("Dernière mise à jour : novembre 2026", "Last updated: November 2026")}</p>
      <div className="mt-8 space-y-8">
        {blocks.map(([h, p]) => (
          <section key={h}>
            <h2 className="text-lg font-semibold">{h}</h2>
            <p className="mt-2 text-muted-foreground">{p}</p>
          </section>
        ))}
      </div>
    </article>
  )
}

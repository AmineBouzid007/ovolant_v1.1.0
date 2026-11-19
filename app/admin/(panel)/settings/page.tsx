import { ActionForm } from "@/components/admin/action-form"
import { SubmitButton } from "@/components/admin/submit-button"
import { PageHeader, inputCls, labelCls } from "@/components/admin/ui"
import { saveSettingsAction } from "@/app/admin/actions"
import { getSettings } from "@/lib/data/settings"
import { emailConfigured } from "@/lib/email"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"

export const metadata = { title: "Settings" }

export default async function SettingsPage() {
  const lang = await getLang()
  const L = pick(lang)
  const s = await getSettings()
  const f = (name: keyof typeof s, label: string, opts: { type?: string; ph?: string; hint?: string } = {}) => (
    <div>
      <label className={labelCls} htmlFor={name}>{label}</label>
      <input id={name} name={name} type={opts.type ?? "text"} defaultValue={s[name]} placeholder={opts.ph} className={inputCls} />
      {opts.hint && <p className="mt-1 text-xs text-muted-foreground">{opts.hint}</p>}
    </div>
  )
  return (
    <>
      <PageHeader title={L("Paramètres", "Settings")} description={L("Coordonnées affichées sur le site et courriel de notification.", "Contact details shown on the site and the notification email.")} />
      {!emailConfigured() && (
        <p className="mb-5 max-w-3xl rounded-xl border border-amber/40 bg-amber/10 p-4 text-sm text-amber">
          {L("Les courriels sont désactivés : ajoutez RESEND_API_KEY dans les variables d'environnement.", "Emails are off: add RESEND_API_KEY to the environment variables.")}
        </p>
      )}
      <ActionForm action={saveSettingsAction} success={L("Paramètres enregistrés", "Settings saved")} className="panel max-w-3xl space-y-5 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {f("contact_phone", L("Téléphone", "Phone"))}
          {f("contact_email", L("Courriel public", "Public email"), { type: "email" })}
          {f("notify_email", L("Courriel qui reçoit les nouvelles réservations", "Email that receives new bookings"), { type: "email", hint: L("Si vide, on utilise le courriel public.", "If empty, the public email is used.") })}
          {f("whatsapp", "WhatsApp", { ph: "15143576337", hint: L("Numéro avec indicatif pays, sans + ni espaces. Vide = bouton masqué.", "Number with country code, no + or spaces. Empty = button hidden.") })}
          <div className="sm:col-span-2">{f("address", L("Adresse (utilisée pour la carte)", "Address (used for the map)"), { hint: L("Plus l'adresse est précise, meilleure est la carte.", "The more precise the address, the better the map.") })}</div>
          {f("facebook", "Facebook", { ph: "https://facebook.com/…" })}
          {f("instagram", "Instagram", { ph: "https://instagram.com/…" })}
        </div>
        <SubmitButton>{L("Enregistrer", "Save")}</SubmitButton>
      </ActionForm>
    </>
  )
}

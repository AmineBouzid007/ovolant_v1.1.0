"use client"

import Link from "next/link"
import { useActionState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { bookAction, type BookState } from "@/app/actions/book"
import { pick, type Lang } from "@/lib/lang"
import { cn } from "@/lib/utils"

export interface SessionOption { id: string; title: string; when: string; sub: string; left: number }

const field = "w-full min-h-12 rounded-xl border border-line bg-panel2 px-4 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-brand focus:ring-1 focus:ring-brand"

export function BookingForm({ lang, options, initial, phone }: { lang: Lang; options: SessionOption[]; initial?: string; phone: string }) {
  const L = pick(lang)
  const [state, action, pending] = useActionState<BookState, FormData>(bookAction, {})

  if (state.ok && state.summary) {
    return (
      <div className="panel p-6 text-center sm:p-10" role="status">
        <CheckCircle2 className="mx-auto size-12 text-lime" />
        <h2 className="font-display mt-4 text-xl sm:text-2xl">{L("Demande reçue", "Request received")}</h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          {L("Nous vous contacterons pour confirmer votre place. Un courriel de suivi sera envoyé à ", "We will contact you to confirm your spot. A follow-up email will be sent to ")}
          <span className="text-foreground">{state.summary.email}</span>.
        </p>
        {state.summary.title && <p className="mt-4 inline-block rounded-lg bg-panel2 px-4 py-2 text-sm font-bold">{state.summary.title}</p>}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn btn-lime">{L("Retour à l'accueil", "Back to home")}</Link>
          {phone && <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="btn btn-ghost">{L("Appeler", "Call")} {phone}</a>}
        </div>
      </div>
    )
  }

  const v = state.values
  const fe = state.fields ?? {}
  const selected = v?.session ?? initial ?? options.find((o) => o.left > 0)?.id ?? "other"

  return (
    <form action={action} className="space-y-8" noValidate>
      <div className="hidden" aria-hidden="true">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      <fieldset>
        <legend className="font-display mb-3 text-sm">{L("1. Choisissez votre cours", "1. Choose your course")}</legend>
        <div className="space-y-2">
          {options.map((o) => (
            <label key={o.id} className={cn("flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-line bg-panel2 px-4 py-3 transition-colors hover:border-brand/50 has-[:checked]:border-brand has-[:checked]:bg-brand/10 has-[:checked]:ring-1 has-[:checked]:ring-brand", o.left === 0 && "cursor-not-allowed opacity-45")}>
              <input type="radio" name="session" value={o.id} defaultChecked={selected === o.id} disabled={o.left === 0} className="size-4 accent-[#3b7a0a]" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{o.title}</span>
                <span className="block text-sm text-muted-foreground">{o.when}{o.sub ? ` · ${o.sub}` : ""}</span>
              </span>
              <span className={cn("shrink-0 text-xs font-medium", o.left === 0 ? "text-signal" : o.left <= 3 ? "text-amber" : "text-lime")}>
                {o.left === 0 ? L("Complet", "Full") : L(`${o.left} places`, `${o.left} spots`)}
              </span>
            </label>
          ))}
          <label className="flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-lime/40 px-4 py-3 transition-colors has-[:checked]:border-brand has-[:checked]:bg-brand/10 has-[:checked]:ring-1 has-[:checked]:ring-brand">
            <input type="radio" name="session" value="other" defaultChecked={selected === "other"} className="size-4 accent-[#3b7a0a]" />
            <span>
              <span className="block font-medium">{L("Une autre date", "Another date")}</span>
              <span className="block text-sm text-muted-foreground">{L("Indiquez vos disponibilités ci-dessous, nous vous appellerons.", "Tell us when you are free below and we will call you.")}</span>
            </span>
          </label>
        </div>
        {fe.session && <p role="alert" className="mt-2 text-sm text-signal">{fe.session}</p>}
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display mb-3 text-sm">{L("2. Vos coordonnées", "2. Your details")}</legend>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm text-muted-foreground">{L("Nom complet", "Full name")}</label>
          <input id="name" name="name" autoComplete="name" defaultValue={v?.name} aria-invalid={!!fe.name} className={field} />
          {fe.name && <p role="alert" className="mt-1.5 text-sm text-signal">{fe.name}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="phone" className="mb-1.5 block text-sm text-muted-foreground">{L("Téléphone", "Phone")}</label>
            <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(514) 000-0000" defaultValue={v?.phone} aria-invalid={!!fe.phone} className={field} />
            {fe.phone && <p role="alert" className="mt-1.5 text-sm text-signal">{fe.phone}</p>}
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-muted-foreground">{L("Courriel", "Email")}</label>
            <input id="email" name="email" type="email" inputMode="email" autoComplete="email" defaultValue={v?.email} aria-invalid={!!fe.email} className={field} />
            {fe.email && <p role="alert" className="mt-1.5 text-sm text-signal">{fe.email}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm text-muted-foreground">{L("Message ou disponibilités (facultatif)", "Message or availability (optional)")}</label>
          <textarea id="notes" name="notes" rows={3} maxLength={600} defaultValue={v?.notes} className={cn(field, "py-3")} />
        </div>
      </fieldset>

      <div>
        <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" name="consent" className="mt-0.5 size-5 shrink-0 accent-[#3b7a0a]" />
          <span>
            {L("J'accepte que mes renseignements soient utilisés pour traiter ma réservation, selon la ", "I agree that my information is used to process my booking, as described in the ")}
            <Link href="/privacy" target="_blank" className="font-bold text-lime underline underline-offset-2">{L("politique de confidentialité", "privacy policy")}</Link>.
          </span>
        </label>
        {fe.consent && <p role="alert" className="mt-2 text-sm text-signal">{fe.consent}</p>}
      </div>

      {state.error && <p role="alert" className="rounded-xl border border-signal bg-signal/10 px-4 py-3 text-sm text-signal">{state.error}</p>}

      <button disabled={pending} className="btn btn-lime w-full text-base sm:w-auto sm:min-w-64">
        {pending ? <><Loader2 className="size-4 animate-spin" />{L("Envoi…", "Sending…")}</> : L("Envoyer ma réservation", "Send my booking")}
      </button>
    </form>
  )
}

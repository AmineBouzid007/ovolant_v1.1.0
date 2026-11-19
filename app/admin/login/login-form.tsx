"use client"

import { useActionState } from "react"
import { loginAction, type FormState } from "@/app/admin/actions"
import { pick, type Lang } from "@/lib/lang"

const input = "w-full min-h-12 rounded-lg border border-line bg-panel2 px-3.5 text-base text-foreground outline-none focus:border-lime"

export function LoginForm({ lang }: { lang: Lang }) {
  const L = pick(lang)
  const [state, action, pending] = useActionState<FormState, FormData>(loginAction, {})
  return (
    <form action={action} className="panel mt-6 space-y-4 p-6">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm text-muted-foreground">{L("Courriel", "Email")}</label>
        <input id="email" name="email" type="email" required autoComplete="username" defaultValue={state.email} className={input} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm text-muted-foreground">{L("Mot de passe", "Password")}</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className={input} />
      </div>
      {state.error && <p role="alert" className="text-sm text-signal">{state.error}</p>}
      <button disabled={pending} className="btn btn-lime w-full">{pending ? L("Connexion…", "Signing in…") : L("Se connecter", "Sign in")}</button>
    </form>
  )
}

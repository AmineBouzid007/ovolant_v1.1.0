import { redirect } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import { adminConfigured, getSession } from "@/lib/admin/auth"
import { getLang } from "@/lib/i18n"
import { LangSwitch } from "@/components/site/lang-switch"
import { LoginForm } from "./login-form"

export const metadata: Metadata = { title: "Admin login", robots: { index: false } }

export default async function AdminLoginPage() {
  if (await getSession()) redirect("/admin/dashboard")
  const lang = await getLang()
  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-5">
      <div className="road" aria-hidden="true" />
      <div className="relative w-full max-w-sm">
        <Image src="/brand/ovolant-logo.jpg" alt="Ovolant" width={447} height={447} className="mx-auto size-28 rounded-2xl bg-white object-contain" priority />
        <div className="mt-5 flex justify-center"><LangSwitch lang={lang} /></div>
        {adminConfigured() ? (
          <LoginForm lang={lang} />
        ) : (
          <div className="panel mt-8 p-5 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Admin isn&apos;t set up yet</p>
            <p className="mt-2">Set these variables (.env locally, Vercel → Settings → Environment Variables), then redeploy:</p>
            <ul className="mt-3 space-y-1 font-mono text-xs text-foreground"><li>ADMIN_EMAIL</li><li>ADMIN_PASSWORD</li><li>AUTH_SECRET (32+ random characters)</li></ul>
          </div>
        )}
      </div>
    </div>
  )
}

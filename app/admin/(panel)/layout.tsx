import { redirect } from "next/navigation"
import { AdminShell } from "@/components/admin/admin-shell"
import { LangSwitch } from "@/components/site/lang-switch"
import { getSession } from "@/lib/admin/auth"
import { isDbConfigured } from "@/lib/db"
import { getLang } from "@/lib/i18n"
import { DatabaseNotice } from "@/components/admin/database-notice"

export const dynamic = "force-dynamic"
export const metadata = { title: { default: "Admin", template: "%s — Ovolant Admin" }, robots: { index: false } }

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/admin/login")
  const lang = await getLang()
  return (
    <AdminShell email={session.email} lang={lang} switcher={<LangSwitch lang={lang} />}>
      {isDbConfigured() ? children : <DatabaseNotice />}
    </AdminShell>
  )
}

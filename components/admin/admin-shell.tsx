"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { CalendarDays, ExternalLink, ImageIcon, LayoutDashboard, LogOut, Menu, Settings, Star, Ticket, X } from "lucide-react"
import { logoutAction } from "@/app/admin/actions"
import { pick, type Lang } from "@/lib/lang"
import { cn } from "@/lib/utils"

export function AdminShell({ children, email, lang, switcher }: { children: React.ReactNode; email: string; lang: Lang; switcher: React.ReactNode }) {
  const L = pick(lang)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const NAV = [
    { href: "/admin/dashboard", label: L("Tableau de bord", "Dashboard"), icon: LayoutDashboard },
    { href: "/admin/bookings", label: L("Réservations", "Bookings"), icon: Ticket },
    { href: "/admin/sessions", label: L("Cours et dates", "Courses & dates"), icon: CalendarDays },
    { href: "/admin/schedule", label: L("Affiche des horaires", "Schedule photo"), icon: ImageIcon },
    { href: "/admin/content", label: L("Instructeurs et avis", "Instructors & reviews"), icon: Star },
    { href: "/admin/settings", label: L("Paramètres", "Settings"), icon: Settings },
  ]

  const sidebar = (
    <>
      <div className="flex h-16 items-center gap-3 px-5">
        <Image src="/brand/ovolant-logo.jpg" alt="Ovolant" width={447} height={447} className="size-9 rounded-lg bg-white object-contain" />
        <span className="text-sm font-semibold">Ovolant <span className="font-normal text-muted-foreground">Admin</span></span>
        <button onClick={() => setOpen(false)} aria-label={L("Fermer le menu", "Close menu")} className="ml-auto text-muted-foreground hover:text-foreground lg:hidden"><X className="size-5" /></button>
      </div>
      <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={cn("flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors", active ? "bg-lime text-[var(--lime-ink)]" : "text-muted-foreground hover:bg-panel2 hover:text-foreground")}>
              <Icon className="size-[18px]" />{label}
            </Link>
          )
        })}
      </nav>
      <div className="space-y-1 border-t border-line px-3 py-4">
        <Link href="/" target="_blank" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-panel2 hover:text-foreground"><ExternalLink className="size-[18px]" />{L("Voir le site", "View site")}</Link>
        <form action={logoutAction}>
          <button className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-panel2 hover:text-foreground"><LogOut className="size-[18px]" />{L("Déconnexion", "Sign out")}</button>
        </form>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-panel/60 lg:flex">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-line bg-background">{sidebar}</aside>
        </div>
      )}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-background/90 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setOpen(true)} aria-label={L("Ouvrir le menu", "Open menu")} className="flex size-11 items-center justify-center text-muted-foreground hover:text-foreground lg:hidden"><Menu className="size-5" /></button>
          <div className="ml-auto flex items-center gap-4">
            {switcher}
            <p className="hidden text-xs text-muted-foreground sm:block">{email}</p>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

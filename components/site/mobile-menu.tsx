"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function MobileMenu({ links, label, children }: { links: { href: string; label: string }[]; label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={label}
        className="flex size-11 items-center justify-center rounded-xl border border-line bg-panel2"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] rounded-2xl border border-line bg-[#070d0b] p-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.9)]">
          <nav className="flex flex-col">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-line py-4 text-sm font-extrabold uppercase tracking-[0.14em] last:border-0">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-4">{children}</div>
        </div>
      )}
    </div>
  )
}

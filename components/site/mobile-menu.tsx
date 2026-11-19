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
        className="flex size-11 items-center justify-center rounded-full border border-line"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full border-b border-line bg-[#070b11] px-4 pb-6 pt-2 shadow-2xl">
          <nav className="flex flex-col">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="border-b border-line/60 py-4 text-lg font-medium">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 flex flex-col gap-4">{children}</div>
        </div>
      )}
    </div>
  )
}

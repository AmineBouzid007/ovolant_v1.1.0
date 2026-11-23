"use client"

import { useEffect, useState } from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { SubmitButton } from "./submit-button"

const VARIANT = { lime: "btn-lime", ghost: "btn-ghost", danger: "border border-signal/50 text-signal hover:bg-signal/10" } as const

/**
 * Submit button with an in-page two-step confirmation (works inside a plain <form action>).
 * First click arms it, the check button submits, the X (or Escape, or 5 s) cancels.
 * No window.confirm(), which blocks the whole page while it is open.
 */
export function ConfirmButton({ message, children, variant = "danger", className }: { message: string; children: React.ReactNode; variant?: "lime" | "ghost" | "danger"; className?: string }) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 5000)
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setArmed(false)
    window.addEventListener("keydown", esc)
    return () => { clearTimeout(t); window.removeEventListener("keydown", esc) }
  }, [armed])

  if (!armed) {
    return <button type="button" onClick={() => setArmed(true)} className={cn("btn", VARIANT[variant], className)}>{children}</button>
  }
  return (
    <span role="group" className="inline-flex items-center gap-1.5">
      <SubmitButton variant="danger" className={cn("bg-signal text-white hover:bg-signal", className)}>
        <Check className="size-4" /><span className="sr-only">{message}</span>
      </SubmitButton>
      <button type="button" aria-label="Annuler / Cancel" onClick={() => setArmed(false)} className="btn btn-ghost px-3"><X className="size-4" /></button>
    </span>
  )
}

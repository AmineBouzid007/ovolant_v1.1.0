"use client"

import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function SubmitButton({ children, className, variant = "lime" }: { children: React.ReactNode; className?: string; variant?: "lime" | "ghost" | "danger" }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit" disabled={pending}
      className={cn("btn", variant === "lime" && "btn-lime", variant === "ghost" && "btn-ghost", variant === "danger" && "btn border border-signal/50 text-signal hover:bg-signal/10", className)}
    >
      {pending && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  )
}

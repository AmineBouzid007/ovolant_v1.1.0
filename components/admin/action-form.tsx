"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import type { FormState } from "@/app/admin/actions"

/** A form that runs a server action, shows its error, and toasts on success. */
export function ActionForm({
  action, children, className, success,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>
  children: React.ReactNode
  className?: string
  success?: string
}) {
  const [state, formAction] = useActionState<FormState, FormData>(action, {})
  useEffect(() => {
    if (state.ok) toast.success(success ?? "OK")
  }, [state, success])
  return (
    <form action={formAction} className={className}>
      {children}
      {state.error && <p role="alert" className="mt-4 rounded-lg border border-signal/40 bg-signal/10 px-3 py-2 text-sm text-signal">{state.error}</p>}
    </form>
  )
}

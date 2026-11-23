"use client"

import { useEffect, useState, useTransition } from "react"
import { Check, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { deleteBookingAction, updateBookingStatusAction } from "@/app/admin/actions"
import type { Lang } from "@/lib/lang"
import { pick } from "@/lib/lang"
import { cn } from "@/lib/utils"

const COLOR: Record<string, string> = { pending: "text-amber", confirmed: "text-lime", cancelled: "text-signal" }

export function StatusSelect({ id, status, lang }: { id: string; status: string; lang: Lang }) {
  const L = pick(lang)
  const [pending, start] = useTransition()
  return (
    <select
      aria-label={L("Statut", "Status")}
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        start(async () => {
          const r = await updateBookingStatusAction(id, e.target.value)
          if (r.error) toast.error(r.error)
          else toast.success(L("Statut mis à jour", "Status updated"))
        })
      }
      className={cn("min-h-11 rounded-lg border border-line bg-panel2 px-3 text-sm font-medium outline-none focus:border-lime disabled:opacity-50", COLOR[status])}
    >
      <option value="pending">{L("En attente", "Pending")}</option>
      <option value="confirmed">{L("Confirmée", "Confirmed")}</option>
      <option value="cancelled">{L("Annulée", "Cancelled")}</option>
    </select>
  )
}

export function DeleteBookingButton({ id, lang }: { id: string; lang: Lang }) {
  const L = pick(lang)
  const [pending, start] = useTransition()
  const [armed, setArmed] = useState(false)

  // Two-step confirmation inside the page (no blocking window.confirm): the first click arms, the second deletes.
  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 5000)
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setArmed(false)
    window.addEventListener("keydown", esc)
    return () => { clearTimeout(t); window.removeEventListener("keydown", esc) }
  }, [armed])

  if (armed) {
    return (
      <div role="group" aria-label={L("Confirmer la suppression", "Confirm deletion")} className="flex items-center gap-1.5">
        <button
          type="button" autoFocus
          aria-label={L("Supprimer cette réservation définitivement", "Delete this booking permanently")}
          onClick={() => {
            setArmed(false)
            start(async () => {
              const r = await deleteBookingAction(id)
              if (r?.error) toast.error(r.error)
              else toast.success(L("Réservation supprimée", "Booking deleted"))
            })
          }}
          className="flex size-11 items-center justify-center rounded-lg bg-signal text-white"
        >
          <Check className="size-4" />
        </button>
        <button type="button" aria-label={L("Annuler", "Cancel")} onClick={() => setArmed(false)} className="flex size-11 items-center justify-center rounded-lg border border-line text-muted-foreground hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button" disabled={pending}
      aria-label={L("Supprimer la réservation", "Delete booking")}
      onClick={() => setArmed(true)}
      className="flex size-11 items-center justify-center rounded-lg border border-line text-muted-foreground transition-colors hover:border-signal/60 hover:text-signal disabled:opacity-50"
    >
      <Trash2 className="size-4" />
    </button>
  )
}

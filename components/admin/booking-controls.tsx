"use client"

import { useTransition } from "react"
import { Trash2 } from "lucide-react"
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
  return (
    <button
      type="button" disabled={pending}
      aria-label={L("Supprimer la réservation", "Delete booking")}
      onClick={() => {
        if (!confirm(L("Supprimer cette réservation définitivement ?", "Delete this booking permanently?"))) return
        start(async () => {
          await deleteBookingAction(id)
          toast.success(L("Réservation supprimée", "Booking deleted"))
        })
      }}
      className="flex size-11 items-center justify-center rounded-lg border border-line text-muted-foreground transition-colors hover:border-signal/60 hover:text-signal disabled:opacity-50"
    >
      <Trash2 className="size-4" />
    </button>
  )
}

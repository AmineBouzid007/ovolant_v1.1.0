import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export const card = "panel"
export const inputCls = "w-full min-h-11 rounded-lg border border-line bg-panel2 px-3.5 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-lime"
export const labelCls = "mb-1.5 block text-sm text-muted-foreground"
export const btnPrimary = "btn btn-lime"
export const btnGhost = "btn btn-ghost"

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-xl font-semibold sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ label, value, hint, icon: Icon, accent }: { label: string; value: string; hint?: string; icon: LucideIcon; accent?: boolean }) {
  return (
    <div className={cn(card, "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-display mt-2 truncate text-3xl font-semibold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", accent ? "bg-lime text-[var(--lime-ink)]" : "bg-panel2 text-muted-foreground")}><Icon className="size-5" /></div>
      </div>
    </div>
  )
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className={cn(card, "p-10 text-center text-muted-foreground")}>{children}</div>
}

const BADGE: Record<string, string> = {
  pending: "border-amber/50 bg-amber/10 text-amber",
  confirmed: "border-lime/50 bg-lime/10 text-lime",
  cancelled: "border-signal/50 bg-signal/10 text-signal",
}
export function StatusBadge({ status, label }: { status: string; label: string }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", BADGE[status])}>{label}</span>
}

export function SeatBar({ booked, seats }: { booked: number; seats: number }) {
  const pct = seats ? Math.min(100, Math.round((booked / seats) * 100)) : 100
  const color = pct >= 100 ? "bg-signal" : pct >= 75 ? "bg-amber" : "bg-lime"
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel2" role="img" aria-label={`${booked}/${seats}`}>
      <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
    </div>
  )
}

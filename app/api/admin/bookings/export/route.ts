import { NextResponse } from "next/server"
import { getSession } from "@/lib/admin/auth"
import { listBookingsForExport } from "@/lib/data/bookings"
import { utcToLocalInput } from "@/lib/time"

export const runtime = "nodejs"

export async function GET(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const u = new URL(req.url)
  // French-locale Excel expects ";" as the separator, English-locale Excel expects ",".
  const delim = u.searchParams.get("delim") === "comma" ? "," : ";"
  const rows = await listBookingsForExport({
    q: u.searchParams.get("q") ?? undefined,
    status: u.searchParams.get("status") ?? undefined,
    session: u.searchParams.get("session") ?? undefined,
  })
  // Prevent spreadsheet formula injection from user-supplied text.
  const cell = (v: unknown) => {
    let s = v == null ? "" : String(v)
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s
    return `"${s.replace(/"/g, '""')}"`
  }
  const when = (d: Date | null) => (d ? utcToLocalInput(new Date(d)).replace("T", " ") : "")
  const header = ["Date de la demande", "Nom", "Téléphone", "Courriel", "Cours", "Date du cours", "Statut", "Langue", "Notes"]
  const lines = [header.map(cell).join(delim)]
  for (const b of rows) {
    lines.push([when(b.created_at), b.name, b.phone, b.email, b.session_title, when(b.session_starts_at), b.status, b.lang, b.notes].map(cell).join(delim))
  }
  const stamp = new Date().toISOString().slice(0, 10)
  return new NextResponse("\uFEFF" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ovolant-reservations-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}

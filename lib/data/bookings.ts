import "server-only"
import { query } from "@/lib/db"

export type BookingStatus = "pending" | "confirmed" | "cancelled"
export const STATUSES: BookingStatus[] = ["pending", "confirmed", "cancelled"]

export interface BookingRow {
  id: string
  session_id: string | null
  session_title: string
  session_starts_at: Date | null
  name: string
  phone: string
  email: string
  notes: string
  status: BookingStatus
  lang: "fr" | "en"
  created_at: Date
}

export interface BookingFilter {
  q?: string
  status?: string
  session?: string
}

function where(f: BookingFilter) {
  const clauses: string[] = []
  const params: unknown[] = []
  if (f.q?.trim()) {
    const like = `%${f.q.trim().replace(/[\\%_]/g, (c) => "\\" + c)}%`
    params.push(like)
    const n = params.length
    clauses.push(`(name ilike $${n} or email ilike $${n} or phone ilike $${n} or session_title ilike $${n})`)
  }
  if (f.status && (STATUSES as string[]).includes(f.status)) {
    params.push(f.status)
    clauses.push(`status = $${params.length}`)
  }
  if (f.session === "none") clauses.push(`session_id is null`)
  else if (f.session && /^[0-9a-f-]{36}$/i.test(f.session)) {
    params.push(f.session)
    clauses.push(`session_id = $${params.length}`)
  }
  return { sql: clauses.length ? `where ${clauses.join(" and ")}` : "", params }
}

export async function listBookings(f: BookingFilter, page = 1, pageSize = 25) {
  const { sql, params } = where(f)
  const totalRows = await query<{ n: number }>(`select count(*)::int as n from bookings ${sql}`, params)
  const rows = await query<BookingRow>(
    `select * from bookings ${sql} order by created_at desc limit ${pageSize} offset ${(Math.max(1, page) - 1) * pageSize}`,
    params,
  )
  return { rows, total: totalRows[0]?.n ?? 0 }
}

export async function listBookingsForExport(f: BookingFilter) {
  const { sql, params } = where(f)
  return query<BookingRow>(`select * from bookings ${sql} order by created_at desc limit 20000`, params)
}

export async function getBooking(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const rows = await query<BookingRow>(`select * from bookings where id = $1`, [id])
  return rows[0] ?? null
}

export async function dashboardStats() {
  const [r] = await query<{ pending: number; total: number; week: number; upcoming: number }>(`
    select
      (select count(*) from bookings where status = 'pending')::int as pending,
      (select count(*) from bookings)::int as total,
      (select count(*) from bookings where created_at > now() - interval '7 days')::int as week,
      (select count(*) from sessions where published and starts_at > now())::int as upcoming
  `)
  return r
}

export async function latestBookings(n = 6) {
  return query<BookingRow>(`select * from bookings order by created_at desc limit $1`, [n])
}

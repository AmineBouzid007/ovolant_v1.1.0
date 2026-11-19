import "server-only"
import { query } from "@/lib/db"

export interface SessionRow {
  id: string
  title_fr: string
  title_en: string
  description_fr: string
  description_en: string
  starts_at: Date
  duration_minutes: number
  location: string
  seats: number
  price_cents: number | null
  published: boolean
  created_at: Date
  booked: number
}

const BASE = `
  select s.*, coalesce(b.n, 0)::int as booked
  from sessions s
  left join lateral (
    select count(*) as n from bookings where session_id = s.id and status <> 'cancelled'
  ) b on true
`

export const seatsLeft = (s: Pick<SessionRow, "seats" | "booked">) => Math.max(0, s.seats - s.booked)

/** Public: published sessions that haven't started yet. */
export async function listUpcomingSessions(limit = 12) {
  return query<SessionRow>(`${BASE} where s.published and s.starts_at > now() order by s.starts_at asc limit $1`, [limit])
}

/** Admin: everything, newest date first. */
export async function listAllSessions() {
  return query<SessionRow>(`${BASE} order by s.starts_at desc limit 300`)
}

export async function getSession(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const rows = await query<SessionRow>(`${BASE} where s.id = $1`, [id])
  return rows[0] ?? null
}

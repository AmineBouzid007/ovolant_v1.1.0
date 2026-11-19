import "server-only"
import { query } from "@/lib/db"

export interface ScheduleImage { id: string; url: string; path: string; caption: string; active: boolean; created_at: Date }
export interface ContentItem {
  id: string; kind: "testimonial" | "instructor"; name: string
  role_fr: string; role_en: string; text_fr: string; text_en: string
  sort: number; published: boolean
}

export const listActiveImages = (limit = 4) =>
  query<ScheduleImage>(`select * from schedule_images where active order by created_at desc limit $1`, [limit])
export const listAllImages = () => query<ScheduleImage>(`select * from schedule_images order by created_at desc limit 100`)

export const listContent = (kind: "testimonial" | "instructor", onlyPublished = true) =>
  query<ContentItem>(
    `select * from content_items where kind = $1 ${onlyPublished ? "and published" : ""} order by sort asc, created_at asc`,
    [kind],
  )
export async function getContentItem(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const r = await query<ContentItem>(`select * from content_items where id = $1`, [id])
  return r[0] ?? null
}

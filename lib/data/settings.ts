import "server-only"
import { isDbConfigured, query } from "@/lib/db"
import { DEFAULT_SETTINGS } from "@/lib/db/seed"

export interface SiteSettings {
  contact_phone: string
  contact_email: string
  notify_email: string
  whatsapp: string
  address: string
  facebook: string
  instagram: string
}

export async function getSettings(): Promise<SiteSettings> {
  const base: Record<string, unknown> = { ...DEFAULT_SETTINGS }
  if (isDbConfigured()) {
    try {
      const rows = await query<{ key: string; value: unknown }>(`select key, value from settings`)
      for (const r of rows) base[r.key] = r.value
    } catch (e) {
      console.error("[settings] falling back to defaults:", (e as Error).message)
    }
  }
  const s = (k: string) => String(base[k] ?? "")
  return {
    contact_phone: s("contact_phone"),
    contact_email: s("contact_email"),
    notify_email: s("notify_email"),
    whatsapp: s("whatsapp"),
    address: s("address"),
    facebook: s("facebook"),
    instagram: s("instagram"),
  }
}

export async function saveSettings(patch: Partial<SiteSettings>) {
  for (const [k, v] of Object.entries(patch)) {
    await query(
      `insert into settings (key, value) values ($1, $2::jsonb)
       on conflict (key) do update set value = excluded.value`,
      [k, JSON.stringify(v)],
    )
  }
}

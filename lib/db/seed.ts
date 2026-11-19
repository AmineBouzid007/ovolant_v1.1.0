import type { PoolClient } from "pg"

export const DEFAULT_SETTINGS = {
  contact_phone: "(514) 357-6337",
  contact_email: "",
  notify_email: "",
  whatsapp: "",
  address: "Montréal, QC",
  facebook: "",
  instagram: "",
} as const

export async function seedDatabase(client: PoolClient) {
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await client.query(
      `insert into settings (key, value) values ($1, $2::jsonb) on conflict (key) do nothing`,
      [key, JSON.stringify(value)],
    )
  }
}

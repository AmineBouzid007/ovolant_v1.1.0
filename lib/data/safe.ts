import "server-only"
import { isDbConfigured } from "@/lib/db"

/** Public pages must never crash if the database is down or not configured yet. */
export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDbConfigured()) return fallback
  try {
    return await fn()
  } catch (e) {
    console.error("[db]", (e as Error).message)
    return fallback
  }
}

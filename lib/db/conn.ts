// Tolerant DATABASE_URL parser. Accepts a pasted Supabase URI even when the password
// contains characters like @ # / ? : % that normally have to be URL-encoded, and ignores
// stray quotes, spaces, a leading "psql ", or [brackets] around the password.
export interface PgTarget { user: string; password: string; host: string; port: number; database: string; local: boolean }

export function parseDatabaseUrl(input: string): PgTarget {
  let s = input.trim().replace(/^psql\s+/i, "").trim().replace(/^["']+|["']+$/g, "").trim()
  const m = /^postgres(?:ql)?:\/\/([^:/?#@]+):([\s\S]*)@([^@/?#:]+)(?::(\d+))?\/([^?#]*)(?:[?#][\s\S]*)?$/.exec(s)
  if (!m) {
    throw new Error(
      "DATABASE_URL format is invalid. Expected postgresql://USER:PASSWORD@HOST:6543/postgres (copy the Transaction pooler string from Supabase and replace [YOUR-PASSWORD]).",
    )
  }
  let password = m[2]
  if (/^\[.*\]$/.test(password)) password = password.slice(1, -1)
  try {
    password = decodeURIComponent(password)
  } catch {
    /* not percent-encoded: keep as typed */
  }
  const host = m[3]
  return {
    user: decodeURIComponent(m[1]),
    password,
    host,
    port: m[4] ? Number(m[4]) : 5432,
    database: m[5] || "postgres",
    local: ["localhost", "127.0.0.1", "::1"].includes(host),
  }
}

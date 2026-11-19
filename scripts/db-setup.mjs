// Optional: `DATABASE_URL=... npm run db:setup` checks the Supabase connection.
// The site creates its tables automatically on first load.
import pg from "pg"

const raw = (process.env.DATABASE_URL || process.env.POSTGRES_URL || "").trim().replace(/^["']+|["']+$/g, "")
if (!raw) { console.error("Set DATABASE_URL first."); process.exit(1) }
const m = /^postgres(?:ql)?:\/\/([^:/?#@]+):([\s\S]*)@([^@/?#:]+)(?::(\d+))?\/([^?#]*)/.exec(raw)
if (!m) { console.error("DATABASE_URL format is invalid. Expected postgresql://USER:PASSWORD@HOST:6543/postgres"); process.exit(1) }
let password = m[2].replace(/^\[(.*)\]$/, "$1")
try { password = decodeURIComponent(password) } catch {}
const local = ["localhost", "127.0.0.1"].includes(m[3])
const client = new pg.Client({ host: m[3], port: m[4] ? Number(m[4]) : 5432, user: decodeURIComponent(m[1]), password, database: m[5] || "postgres", ssl: local ? false : { rejectUnauthorized: false } })
await client.connect()
const r = await client.query("select now() as now")
console.log("Connected to Postgres at", r.rows[0].now, "- start the site once to create the tables.")
await client.end()

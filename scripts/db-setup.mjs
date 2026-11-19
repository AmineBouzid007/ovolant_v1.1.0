// Optional: `DATABASE_URL=... npm run db:setup` checks the Supabase connection.
// The site creates its tables automatically on first load.
import pg from "pg"

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
if (!url) { console.error("Set DATABASE_URL first."); process.exit(1) }
const u = new URL(url); u.searchParams.delete("sslmode")
const local = ["localhost", "127.0.0.1"].includes(u.hostname)
const client = new pg.Client({ connectionString: u.toString(), ssl: local ? false : { rejectUnauthorized: false } })
await client.connect()
const r = await client.query("select now() as now")
console.log("Connected to Postgres at", r.rows[0].now, "- start the site once to create the tables.")
await client.end()

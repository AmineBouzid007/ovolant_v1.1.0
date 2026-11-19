export function DatabaseNotice() {
  return (
    <div className="panel mx-auto max-w-xl p-8">
      <h1 className="font-display text-xl font-semibold">Connect your Supabase database / Connectez Supabase</h1>
      <ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
        <li>Supabase → <b className="text-foreground">Project Settings → Database → Connection string</b>.</li>
        <li>Copy the <b className="text-foreground">Transaction pooler</b> string (port 6543) and put your database password in it.</li>
        <li>Add it as <code className="rounded bg-panel2 px-1.5 py-0.5 text-xs">DATABASE_URL</code> (.env locally, Vercel → Environment Variables), then redeploy.</li>
      </ol>
    </div>
  )
}

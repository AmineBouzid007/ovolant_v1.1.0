import { setLangAction } from "@/app/actions/lang"
import type { Lang } from "@/lib/lang"
import { cn } from "@/lib/utils"

export function LangSwitch({ lang, className }: { lang: Lang; className?: string }) {
  return (
    <div role="group" aria-label="Langue / Language" className={cn("inline-flex rounded-xl border border-line bg-panel2 p-1", className)}>
      {(["fr", "en"] as const).map((l) => (
        <form key={l} action={setLangAction.bind(null, l)}>
          <button
            type="submit"
            aria-pressed={lang === l}
            lang={l}
            className={cn(
              "min-h-9 min-w-11 rounded-lg px-3 text-xs font-extrabold tracking-wider transition-colors",
              lang === l ? "bg-brand text-on-lime" : "text-muted-foreground hover:text-ink",
            )}
          >
            {l.toUpperCase()}
          </button>
        </form>
      ))}
    </div>
  )
}

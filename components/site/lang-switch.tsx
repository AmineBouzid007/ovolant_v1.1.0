import { setLangAction } from "@/app/actions/lang"
import type { Lang } from "@/lib/lang"
import { cn } from "@/lib/utils"

export function LangSwitch({ lang, className }: { lang: Lang; className?: string }) {
  return (
    <div role="group" aria-label="Langue / Language" className={cn("inline-flex rounded-full border border-line p-0.5", className)}>
      {(["fr", "en"] as const).map((l) => (
        <form key={l} action={setLangAction.bind(null, l)}>
          <button
            type="submit"
            aria-pressed={lang === l}
            lang={l}
            className={cn(
              "min-h-9 min-w-10 rounded-full px-3 text-xs font-bold transition-colors",
              lang === l ? "bg-lime text-[var(--lime-ink)]" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {l.toUpperCase()}
          </button>
        </form>
      ))}
    </div>
  )
}

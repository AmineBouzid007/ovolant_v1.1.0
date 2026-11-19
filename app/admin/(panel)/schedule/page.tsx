import { Eye, EyeOff, ImageIcon, Trash2 } from "lucide-react"
import { Empty, PageHeader, card } from "@/components/admin/ui"
import { ImageUploader } from "@/components/admin/image-uploader"
import { ConfirmButton } from "@/components/admin/confirm-button"
import { SubmitButton } from "@/components/admin/submit-button"
import { captionImageAction, deleteImageAction, toggleImageAction } from "@/app/admin/actions"
import { listAllImages } from "@/lib/data/content"
import { storageConfigured } from "@/lib/storage"
import { getLang } from "@/lib/i18n"
import { pick } from "@/lib/lang"
import { fmtShort } from "@/lib/time"

export const metadata = { title: "Schedule photo" }

export default async function SchedulePage() {
  const lang = await getLang()
  const L = pick(lang)
  const images = await listAllImages()
  return (
    <>
      <PageHeader
        title={L("Affiche des horaires", "Schedule photo")}
        description={L("Les images actives s'affichent dans « Prochains cours » sur le site (les 4 plus récentes).", "Active images appear under “Upcoming courses” on the site (the 4 most recent).")}
      />
      {!storageConfigured() && (
        <p className="mb-5 rounded-xl border border-amber/40 bg-amber/10 p-4 text-sm text-amber">
          {L("Le stockage n'est pas configuré. Ajoutez SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans les variables d'environnement.", "Storage isn't configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the environment variables.")}
        </p>
      )}
      <div className="max-w-2xl"><ImageUploader lang={lang} /></div>

      <div className="mt-8">
        {images.length === 0 ? (
          <Empty><ImageIcon className="mx-auto mb-3 size-8" /><p>{L("Aucune image téléversée.", "No images uploaded.")}</p></Empty>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((im) => (
              <li key={im.id} className={`${card} overflow-hidden`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.url} alt={im.caption || ""} loading="lazy" className={`aspect-[4/3] w-full bg-panel2 object-contain ${im.active ? "" : "opacity-40"}`} />
                <div className="space-y-3 p-4">
                  <p className="text-xs text-muted-foreground">{fmtShort(im.created_at, lang)} · {im.active ? L("Visible", "Visible") : L("Masquée", "Hidden")}</p>
                  <form action={captionImageAction} className="flex gap-2">
                    <input type="hidden" name="id" value={im.id} />
                    <input name="caption" defaultValue={im.caption} maxLength={200} placeholder={L("Légende", "Caption")} className="min-h-11 min-w-0 flex-1 rounded-lg border border-line bg-panel2 px-3 text-sm outline-none focus:border-lime" />
                    <SubmitButton variant="ghost">OK</SubmitButton>
                  </form>
                  <div className="flex gap-2">
                    <form action={toggleImageAction} className="flex-1">
                      <input type="hidden" name="id" value={im.id} />
                      <SubmitButton variant="ghost" className="w-full">{im.active ? <><EyeOff className="size-4" />{L("Masquer", "Hide")}</> : <><Eye className="size-4" />{L("Afficher", "Show")}</>}</SubmitButton>
                    </form>
                    <form action={deleteImageAction}>
                      <input type="hidden" name="id" value={im.id} />
                      <ConfirmButton message={L("Supprimer cette image ?", "Delete this image?")}><Trash2 className="size-4" /><span className="sr-only">{L("Supprimer", "Delete")}</span></ConfirmButton>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  )
}

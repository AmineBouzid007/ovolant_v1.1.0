import Link from "next/link"
import { ActionForm } from "@/components/admin/action-form"
import { ConfirmButton } from "@/components/admin/confirm-button"
import { SubmitButton } from "@/components/admin/submit-button"
import { PageHeader, inputCls, labelCls, card } from "@/components/admin/ui"
import { deleteContentAction, saveContentAction } from "@/app/admin/actions"
import { listContent, type ContentItem } from "@/lib/data/content"
import { getLang } from "@/lib/i18n"
import { pick, type Lang } from "@/lib/lang"
import { cn } from "@/lib/utils"

export const metadata = { title: "Content" }

function ItemFields({ kind, item, lang }: { kind: string; item?: ContentItem; lang: Lang }) {
  const L = pick(lang)
  const isI = kind === "instructor"
  return (
    <>
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="kind" value={kind} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className={labelCls}>{isI ? L("Nom", "Name") : L("Nom de l'élève", "Student name")}</label><input name="name" required defaultValue={item?.name} className={inputCls} /></div>
        <div><label className={labelCls}>{L("Ordre d'affichage", "Display order")}</label><input name="sort" type="number" min={0} defaultValue={item?.sort ?? 0} className={inputCls} /></div>
        <div><label className={labelCls}>{isI ? L("Titre (français)", "Role (French)") : L("Précision (français)", "Detail (French)")}</label><input name="role_fr" defaultValue={item?.role_fr} className={inputCls} /></div>
        <div><label className={labelCls}>{isI ? L("Titre (anglais)", "Role (English)") : L("Précision (anglais)", "Detail (English)")}</label><input name="role_en" defaultValue={item?.role_en} className={inputCls} /></div>
        <div><label className={labelCls}>{isI ? L("Présentation (français)", "Bio (French)") : L("Avis (français)", "Review (French)")}</label><textarea name="text_fr" rows={3} defaultValue={item?.text_fr} className={inputCls} /></div>
        <div><label className={labelCls}>{isI ? L("Présentation (anglais)", "Bio (English)") : L("Avis (anglais)", "Review (English)")}</label><textarea name="text_en" rows={3} defaultValue={item?.text_en} className={inputCls} /></div>
      </div>
      <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm"><input type="checkbox" name="published" defaultChecked={item?.published ?? true} className="size-5 accent-[#86e10a]" />{L("Visible sur le site", "Visible on the site")}</label>
    </>
  )
}

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind: k } = await searchParams
  const kind = k === "testimonial" ? "testimonial" : "instructor"
  const lang = await getLang()
  const L = pick(lang)
  const items = await listContent(kind, false)
  const tab = (key: string, label: string) => (
    <Link href={`/admin/content?kind=${key}`} className={cn("btn", kind === key ? "btn-lime" : "btn-ghost")}>{label}</Link>
  )
  return (
    <>
      <PageHeader title={L("Instructeurs et avis", "Instructors & reviews")} description={L("Ces sections n'apparaissent sur le site que lorsqu'au moins un élément est visible.", "These sections only appear on the site once at least one item is visible.")} />
      <div className="mb-6 flex flex-wrap gap-2">{tab("instructor", L("Instructeurs", "Instructors"))}{tab("testimonial", L("Avis d'élèves", "Student reviews"))}</div>

      <ActionForm action={saveContentAction} success={L("Ajouté", "Added")} className={`${card} mb-8 max-w-3xl p-5 sm:p-6`}>
        <h2 className="mb-4 font-semibold">{kind === "instructor" ? L("Ajouter un instructeur", "Add an instructor") : L("Ajouter un avis", "Add a review")}</h2>
        <ItemFields kind={kind} lang={lang} />
        <div className="mt-5"><SubmitButton>{L("Ajouter", "Add")}</SubmitButton></div>
      </ActionForm>

      <ul className="max-w-3xl space-y-3">
        {items.map((it) => (
          <li key={it.id} className={card}>
            <details>
              <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-3 px-5 py-3">
                <span className="font-medium">{it.name}{!it.published && <span className="ml-2 rounded bg-panel2 px-1.5 py-0.5 text-xs text-muted-foreground">{L("Masqué", "Hidden")}</span>}</span>
                <span className="text-sm text-lime">{L("Modifier", "Edit")}</span>
              </summary>
              <div className="border-t border-line p-5">
                <ActionForm action={saveContentAction} success={L("Enregistré", "Saved")}>
                  <ItemFields kind={kind} item={it} lang={lang} />
                  <div className="mt-5"><SubmitButton>{L("Enregistrer", "Save")}</SubmitButton></div>
                </ActionForm>
                <form action={deleteContentAction} className="mt-3">
                  <input type="hidden" name="id" value={it.id} />
                  <ConfirmButton message={L("Supprimer cet élément ?", "Delete this item?")}>{L("Supprimer", "Delete")}</ConfirmButton>
                </form>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </>
  )
}

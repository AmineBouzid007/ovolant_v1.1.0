"use client"

import Link from "next/link"
import { saveSessionAction } from "@/app/admin/actions"
import { pick, type Lang } from "@/lib/lang"
import { ActionForm } from "./action-form"
import { SubmitButton } from "./submit-button"
import { inputCls, labelCls } from "./ui"

export interface SessionDefaults {
  id?: string; title_fr: string; title_en: string; description_fr: string; description_en: string
  starts_local: string; duration_minutes: number; location: string; seats: number; price: string; published: boolean
}

export function SessionForm({ lang, d }: { lang: Lang; d: SessionDefaults }) {
  const L = pick(lang)
  return (
    <ActionForm action={saveSessionAction} className="panel max-w-3xl space-y-5 p-5 sm:p-6">
      {d.id && <input type="hidden" name="id" value={d.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className={labelCls} htmlFor="title_fr">{L("Titre (français)", "Title (French)")}</label><input id="title_fr" name="title_fr" required defaultValue={d.title_fr} className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="title_en">{L("Titre (anglais)", "Title (English)")}</label><input id="title_en" name="title_en" defaultValue={d.title_en} placeholder={L("Même que le français si vide", "Same as French if empty")} className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="description_fr">{L("Description (français)", "Description (French)")}</label><textarea id="description_fr" name="description_fr" rows={3} defaultValue={d.description_fr} className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="description_en">{L("Description (anglais)", "Description (English)")}</label><textarea id="description_en" name="description_en" rows={3} defaultValue={d.description_en} className={inputCls} /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2"><label className={labelCls} htmlFor="starts_at">{L("Date et heure (heure de Montréal)", "Date and time (Montréal time)")}</label><input id="starts_at" name="starts_at" type="datetime-local" required defaultValue={d.starts_local} className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="duration_minutes">{L("Durée (minutes)", "Duration (minutes)")}</label><input id="duration_minutes" name="duration_minutes" type="number" min={15} step={5} required defaultValue={d.duration_minutes} className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="seats">{L("Places", "Seats")}</label><input id="seats" name="seats" type="number" min={0} required defaultValue={d.seats} className={inputCls} /></div>
        <div className="sm:col-span-2"><label className={labelCls} htmlFor="location">{L("Lieu", "Location")}</label><input id="location" name="location" defaultValue={d.location} className={inputCls} /></div>
        <div className="sm:col-span-2"><label className={labelCls} htmlFor="price">{L("Prix en CAD (facultatif)", "Price in CAD (optional)")}</label><input id="price" name="price" inputMode="decimal" defaultValue={d.price} placeholder="0.00" className={inputCls} /></div>
      </div>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
        <input type="checkbox" name="published" defaultChecked={d.published} className="size-5 accent-[#3b7a0a]" />
        {L("Visible sur le site", "Visible on the site")}
      </label>
      <div className="flex flex-wrap gap-3">
        <SubmitButton>{L("Enregistrer", "Save")}</SubmitButton>
        <Link href="/admin/sessions" className="btn btn-ghost">{L("Annuler", "Cancel")}</Link>
      </div>
    </ActionForm>
  )
}

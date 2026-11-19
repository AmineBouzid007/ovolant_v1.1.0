"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { LANG_COOKIE } from "@/lib/lang"

export async function setLangAction(lang: string) {
  const v = lang === "en" ? "en" : "fr"
  ;(await cookies()).set(LANG_COOKIE, v, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" })
  revalidatePath("/", "layout")
}

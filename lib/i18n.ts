import "server-only"
import { cookies } from "next/headers"
import { LANG_COOKIE, type Lang } from "./lang"

/** French is the default (Montréal). The visitor's choice is stored in a cookie. */
export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(LANG_COOKIE)?.value
  return v === "en" ? "en" : "fr"
}

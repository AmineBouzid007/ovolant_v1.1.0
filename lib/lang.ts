// Language helpers that are safe in both server and client components.
export type Lang = "fr" | "en"
export const LANG_COOKIE = "ovolant_lang"

/** const L = pick(lang);  L("Bonjour", "Hello") */
export const pick = (lang: Lang) => (fr: string, en: string) => (lang === "fr" ? fr : en)

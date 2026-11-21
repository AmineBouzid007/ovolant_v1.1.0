// Owner profile shown on /about. Edit this file only: the page shows exactly what is filled in here
// and hides every section that is left empty, so nothing is ever invented.
//
// Optional photo: put a square image at public/brand/owner.jpg and set photo to "/brand/owner.jpg".
export const OWNER = {
  name: "Safouane Bouzid",
  photo: "",                           // e.g. "/brand/owner.jpg"
  role: { fr: "Propriétaire de l'école de conduite Ovolant", en: "Owner of Ovolant Driving School" },

  // A short introduction in his own words (2-4 sentences). Leave "" to hide.
  intro: { fr: "", en: "" },

  // Key facts, shown as small tiles. Examples: { value: "15+", fr: "ans d'expérience", en: "years of experience" }
  facts: [] as { value: string; fr: string; en: string }[],

  // Short bullet list: certifications, languages, specialties... Leave [] to hide.
  highlights: [] as { fr: string; en: string }[],

  // A quote or message to students. Leave "" to hide.
  message: { fr: "", en: "" },

  links: {
    schoolFacebook: "https://www.facebook.com/profile.php?id=100008824605794",
  },
}

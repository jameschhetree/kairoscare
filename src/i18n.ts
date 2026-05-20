// next-intl scaffold. Phase 1 ships EN + ES JSON dictionaries; Phase 2 wires
// the actual `useTranslations` hook into the CNA visit-log flow (the highest-
// risk surface for adoption, per the brief).
//
// Locale routing (e.g. /es/cna) is deferred to keep Phase 1's surface tight.

export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export async function loadMessages(locale: Locale) {
  switch (locale) {
    case "es":
      return (await import("./messages/es.json")).default;
    case "en":
    default:
      return (await import("./messages/en.json")).default;
  }
}

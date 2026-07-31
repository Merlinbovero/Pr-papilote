import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SITE_FONT_VARIABLES } from "@/lib/design/site-fonts";

/**
 * Charte historique — lot M3.
 *
 * Geist, Geist Mono et Archivo viennent de `@/lib/design/site-fonts` — le
 * module partagé avec les fiches encore en transition (lot M6a), qui relèvent
 * toujours de cette charte bien que leur route ait rejoint `(planche)`. Les
 * routes réellement migrées, elles, ne les chargent pas.
 *
 * La classe `.site-root` porte la typographie de base, reprise des règles
 * globales `html { @apply font-sans }` et `h1, h2 { @apply font-heading }`
 * qui s'appliquaient auparavant au document entier — elles atteignaient donc
 * aussi les routes PLANCHE.
 *
 * `flex-1` et non `min-h-full` : ce conteneur s'intercale entre `<body>`
 * (colonne flex, `min-h-full`) et le `<main>` qui portait jusqu'ici le
 * `flex-1`. Sans lui, le pied de page cessait d'être poussé en bas de fenêtre
 * sur les pages courtes — mesuré à 258 px de remontée sur `/reviser`.
 */

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${SITE_FONT_VARIABLES} site-root flex flex-1 flex-col`}>
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

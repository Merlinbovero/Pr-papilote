import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

/**
 * Charte historique — lot M3.
 *
 * Geist, Geist Mono et Archivo sont déclarées **ici et nulle part ailleurs** :
 * elles ne sont donc chargées que sur les routes de ce groupe. Les routes
 * PLANCHE ne les voient pas.
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

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Police display des titres : grotesque institutionnelle sobre (graisses
// fortes pour les grands titres cinématiques), sans effet « gaming ».
const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
});

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} site-root flex flex-1 flex-col`}
    >
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

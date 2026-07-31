import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { isDesignLabEnabled } from "@/lib/design-lab/flag";
import "@/styles/banc.css";

export const metadata: Metadata = {
  title: "Laboratoire de design — Le Banc",
  // La vitrine ne fait pas partie du site publié : jamais indexée, jamais
  // suivie. `robots.ts` exclut également tout `/design-lab` par précaution.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Vitrine interne du système du Banc — lot F1b.
 *
 * Trois garanties, tenues par ce fichier, sur le modèle exact de la vitrine
 * PLANCHE :
 *  1. le drapeau — sans `NEXT_PUBLIC_DESIGN_LAB=1`, la route répond 404 ;
 *  2. l'isolation — `banc.css` n'émet aucun jeton sur `:root`, tout vit sous
 *     la classe `.banc` ;
 *  3. l'absence de la surface publique — aucune entrée de navigation ne
 *     pointe ici, et les métadonnées interdisent l'indexation.
 *
 * À ne pas confondre avec `/design-lab/planche/banc`, qui montre un écran de
 * test dans la charte **documentaire** PLANCHE. La présente route porte la
 * charte **fonctionnelle** du Banc, domaine autonome.
 */
export default function BancLabLayout({ children }: { children: React.ReactNode }) {
  if (!isDesignLabEnabled()) {
    notFound();
  }
  return children;
}

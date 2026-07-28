import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isDesignLabEnabled } from "@/lib/design-lab/flag";
import { PLANCHE_FONT_VARIABLES } from "@/lib/design/planche-fonts";
import "@/styles/planche.css";

export const metadata: Metadata = {
  title: "Laboratoire de design — PLANCHE",
  // Le prototype ne fait pas partie du site publié : jamais indexé, jamais
  // suivi. Le fichier robots.ts l'exclut également par précaution.
  robots: { index: false, follow: false, nocache: true },
};

/**
 * Prototype isolé du système PLANCHE.
 *
 * Trois garanties, tenues par ce fichier :
 *  1. le drapeau — sans `NEXT_PUBLIC_DESIGN_LAB=1`, la route répond 404 ;
 *  2. l'isolation — `planche.css` ne pose aucun jeton sur `:root` ;
 *  3. le préchargement — `next/font/local` précharge Spectral (la voix
 *     éditoriale, présente au premier écran) et laisse Fira Sans et Fira
 *     Mono se charger à la demande.
 */
export default function PlancheLayout({ children }: { children: React.ReactNode }) {
  if (!isDesignLabEnabled()) {
    notFound();
  }

  // Les variables de fontes sont posées ici, et nulle part ailleurs : le
  // gabarit racine de production reste sur Geist et Archivo.
  return <div className={PLANCHE_FONT_VARIABLES}>{children}</div>;
}

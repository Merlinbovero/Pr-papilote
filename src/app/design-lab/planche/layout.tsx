import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isDesignLabEnabled } from "@/lib/design-lab/flag";
import "./planche.css";

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
 *  3. le préchargement — seules les quatre fontes du premier écran sont
 *     préchargées ; les graisses secondaires se chargent à la demande.
 */
export default function PlancheLayout({ children }: { children: React.ReactNode }) {
  if (!isDesignLabEnabled()) {
    notFound();
  }

  return (
    <>
      {/* React 19 remonte ces balises dans <head>. */}
      <link
        rel="preload"
        href="/fonts/planche/spectral-400.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/fonts/planche/spectral-600.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/fonts/planche/fira-sans-400.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/fonts/planche/fira-mono-400.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      {children}
    </>
  );
}

import * as React from "react";

/**
 * Lien « Pour approfondir » du Banc — remboursement de DT-002 (lot F2a).
 *
 * Le rendu historique portait `text-primary underline-offset-4
 * hover:underline` : **souligné au survol seulement**. Au repos, rien ne
 * distinguait le lien du texte hors la teinte, et cette teinte ne tenait que
 * **1,06:1** contre le gris environnant en registre sombre (`#67a6fb` sur
 * `#a3aab5`, minimum 3:1) — mesure reproduite sur `/entrainement/eopan`
 * pendant l'audit F0b §1.
 *
 * Deux corrections, et non une :
 *
 *  1. **le soulignement est permanent** — c'est le repère non chromatique
 *     qu'exige WCAG 1.4.1, et il rend la règle `link-in-text-block` sans
 *     objet, quel que soit le contraste de la teinte ;
 *  2. **la teinte est celle du Banc** (`--bc-banc`), qui tient AA sur les
 *     trois fonds du cadre — vérifié par `banc-tokens.test.ts`.
 *
 * Le rendu historique n'est pas touché : la dette reste ouverte hors de la
 * route pilote, et `e2e/dette-lien-correction.spec.ts` continue de la
 * prouver là où elle subsiste.
 */

export interface LienApprofondirProps {
  href: string;
  children: React.ReactNode;
}

export function LienApprofondir({ href, children }: LienApprofondirProps) {
  return (
    <a href={href} className="underline underline-offset-4" style={{ color: "var(--bc-banc)" }}>
      {children}
    </a>
  );
}

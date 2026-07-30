"use client";

import * as React from "react";
import { CircleCheckIcon, CircleIcon, CircleXIcon, TriangleAlertIcon } from "lucide-react";

import type { EtatReponse } from "@/lib/design/banc-tokens";
import { cn } from "@/lib/utils";

/**
 * Réponse du Banc et ses quatre états — lot F1b.
 *
 * Deux règles, toutes deux issues de défauts mesurés :
 *
 *  1. **Jamais la couleur seule.** DT-002 documente précisément ce défaut
 *     ailleurs dans le produit — un lien distingué par la seule teinte, à
 *     1,06:1 du texte environnant. Chaque état porte donc une icône **et** un
 *     libellé lisible par une technique d'assistance.
 *
 *  2. **Jamais l'opacité seule.** Trois situations que l'audit voyait
 *     confondues sous un même gris pâle sont ici distinguées :
 *     — une réponse **non sélectionnée**, qui reste pleinement actionnable ;
 *     — une réponse **neutralisée après correction**, qui doit rester lisible
 *       puisqu'on la relit pour comprendre son erreur ;
 *     — un contrôle **réellement désactivé**, où aucune action n'est possible.
 */

const REPERES: Record<Exclude<EtatReponse, "neutre">, { Icone: typeof CircleIcon; mot: string }> = {
  juste: { Icone: CircleCheckIcon, mot: "Bonne réponse" },
  erreur: { Icone: CircleXIcon, mot: "Réponse incorrecte" },
  attention: { Icone: TriangleAlertIcon, mot: "À vérifier" },
};

export interface ReponseBancProps {
  /** Le libellé du choix. */
  children: React.ReactNode;
  /** L'état après correction. `undefined` tant que la séance attend une réponse. */
  etat?: EtatReponse;
  /** La réponse est-elle sélectionnée ? */
  selectionnee?: boolean;
  /**
   * Le contrôle est-il hors d'usage ?
   *
   * À distinguer de `etat="neutre"` : « neutralisé après correction » se lit
   * encore, « désactivé » annonce qu'aucune action n'est possible.
   */
  desactive?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export function ReponseBanc({
  children,
  etat,
  selectionnee = false,
  desactive = false,
  onClick,
  className,
}: ReponseBancProps) {
  const repere = etat && etat !== "neutre" ? REPERES[etat] : null;
  const Icone = repere?.Icone ?? CircleIcon;

  return (
    <button
      type="button"
      // Le modèle `button + aria-pressed` est conservé — décision de doctrine
      // prise à l'audit F0b-1 : il reste acceptable dès lors que le groupe
      // porte un nom accessible et que l'état sélectionné est exposé.
      aria-pressed={selectionnee}
      disabled={desactive}
      onClick={onClick}
      data-etat={etat ?? (selectionnee ? "selectionnee" : "repos")}
      className={cn(
        "banc-reponse focus-visible:ring-ring transition-colors focus-visible:ring-2 focus-visible:outline-none",
        className
      )}
    >
      <Icone
        aria-hidden
        className={cn(
          "size-4 shrink-0",
          etat === "juste" && "text-[var(--bc-juste)]",
          etat === "erreur" && "text-[var(--bc-erreur)]",
          etat === "attention" && "text-[var(--bc-attention)]"
        )}
      />
      <span className="flex-1">{children}</span>
      {/* Le verdict est ÉCRIT, pas seulement teinté : c'est ce qui manque au
          reste du produit et ce que DT-002 documente. */}
      {repere ? <span className="sr-only">{repere.mot}</span> : null}
      {etat === "neutre" ? <span className="sr-only">Réponse non retenue</span> : null}
      {desactive ? <span className="sr-only">Indisponible</span> : null}
    </button>
  );
}

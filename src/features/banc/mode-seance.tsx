"use client";

import * as React from "react";
import { BookOpenIcon, LogOutIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { deplacerFocus } from "@/lib/a11y/focus-transition";
import { cn } from "@/lib/utils";

/*
  Le registre est chargé par le POINT D'ADHÉSION, c'est-à-dire par ce qui
  pose la classe `.banc` — ici, et la route pilote. Tous les `.banc-*` n'ont
  de sens que dans un tel sous-arbre, donc cette règle suffit et se vérifie.
  Elle a été écrite après coup : en F1b, `banc.css` n'était importé que par
  la mise en page du laboratoire, si bien que la première migration a rendu
  des classes INERTES — flex non appliqué, surfaces absentes. Le contrôle
  `e2e/banc-route-pilote.spec.ts` mesure désormais le style calculé, et non
  la présence de la classe ; la rupture délibérée a été vérifiée.
*/
import "@/styles/banc.css";

/**
 * Mode séance — lot F1b.
 *
 * C'est la fondation comportementale du Banc, et elle répond au défaut le
 * plus grave de l'audit F0b §1 : **la séance ne prend jamais le cadre**. Au
 * lancement, le chapeau éditorial — titre, présentation, encart MÉTHODE —
 * reste empilé au-dessus, et l'aire de jeu s'ajoute en dessous. Mesuré : sur
 * mobile, trois épreuves psychotechniques placent le premier contrôle à
 * 891, 995 et 994 px du haut, pour un écran de 844. Le chronomètre tourne
 * pendant que le candidat fait défiler pour trouver l'exercice.
 *
 * Le contrat tenu ici :
 *  1. l'introduction se replie au lancement ;
 *  2. l'aire de séance entre dans le cadre ;
 *  3. le focus s'y déplace, via le contrat commun du lot F1a ;
 *  4. **le temps ne démarre qu'une fois l'aire en place** — `onSeanceEntree`
 *     n'est appelé qu'après le déplacement du focus, jamais au clic ;
 *  5. les consignes restent rappelables et la sortie reste explicite.
 *
 * **Portée F1b** : ce composant vit uniquement sur la vitrine
 * `/design-lab/banc`. Aucun moteur de production n'est migré dans ce lot, et
 * le défaut décrit ci-dessus n'est donc **pas encore corrigé dans le
 * produit** — il le sera lot par lot, lors des migrations.
 */

export interface ModeSeanceProps {
  /** Le contenu d'avant-séance : présentation, consignes, méthode. */
  introduction: React.ReactNode;
  /** L'aire de jeu, rendue une fois la séance lancée. */
  children: React.ReactNode;
  /** Libellé du bouton de lancement. */
  libelleLancement?: string;
  /** Nom accessible de l'aire de séance — ce que le focus fera lire. */
  labelSeance: string;
  /**
   * Appelé **après** que l'aire est en place et le focus déplacé.
   *
   * C'est ici, et pas au clic, que le moteur démarre son chronomètre : sans
   * cela, le temps courrait pendant que l'écran se réorganise.
   */
  onSeanceEntree?: () => void;
  /** Appelé à la sortie explicite. */
  onSortie?: () => void;
  /**
   * Empêche le lancement tant que l'avant-séance est incomplet — lot F2b.
   *
   * `/reviser` exige de choisir un concours avant de démarrer ; le bouton
   * existe donc dès l'abord, mais reste inopérant. C'est le comportement
   * historique de cette route, conservé tel quel : la migration ne change que
   * la présentation.
   */
  lancementDesactive?: boolean;
  /**
   * Identifiant de la consigne qui EXPLIQUE l'indisponibilité du lancement.
   *
   * Un bouton désactivé sans motif est une impasse : la relation est donc
   * explicite (`aria-describedby`), et non laissée à la proximité visuelle.
   */
  idDescriptionLancement?: string;
  className?: string;
}

export function ModeSeance({
  introduction,
  children,
  libelleLancement = "Commencer",
  labelSeance,
  onSeanceEntree,
  onSortie,
  lancementDesactive = false,
  idDescriptionLancement,
  className,
}: ModeSeanceProps) {
  const [enSeance, setEnSeance] = React.useState(false);
  const [consignesVisibles, setConsignesVisibles] = React.useState(false);
  const zoneSeance = React.useRef<HTMLDivElement>(null);
  const declencheur = React.useRef<Element | null>(null);
  const entreeNotifiee = React.useRef(false);

  React.useEffect(() => {
    if (!enSeance || entreeNotifiee.current) {
      return;
    }
    entreeNotifiee.current = true;
    // L'ordre compte : l'aire est rendue, le focus s'y pose, et seulement
    // ensuite le moteur est prévenu qu'il peut lancer son temps.
    deplacerFocus(zoneSeance.current, { declencheur: declencheur.current });
    onSeanceEntree?.();
  }, [enSeance, onSeanceEntree]);

  return (
    <div className={cn("banc banc-cadre", className)}>
      {/* L'introduction n'est pas démontée : elle est masquée. Le rappel des
          consignes la ramène sans relancer la séance ni perdre l'état. */}
      <div
        className="banc-introduction banc-transition"
        hidden={enSeance && !consignesVisibles}
        aria-label="Avant la séance"
      >
        {introduction}
        {!enSeance ? (
          <Button
            className="mt-6"
            disabled={lancementDesactive}
            aria-describedby={lancementDesactive ? idDescriptionLancement : undefined}
            onClick={(evenement) => {
              declencheur.current = evenement.currentTarget;
              setEnSeance(true);
            }}
          >
            {libelleLancement}
          </Button>
        ) : (
          <Button variant="outline" className="mt-4" onClick={() => setConsignesVisibles(false)}>
            Masquer les consignes
          </Button>
        )}
      </div>

      {enSeance ? (
        <>
          <div
            ref={zoneSeance}
            tabIndex={-1}
            role="group"
            aria-label={labelSeance}
            className="banc-zone-seance"
          >
            {children}
          </div>

          {/* Deux issues toujours disponibles : revoir la consigne sans
              quitter, et sortir explicitement. */}
          <div className="banc-separateur mt-8 flex flex-wrap gap-2 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConsignesVisibles((visible) => !visible)}
              aria-expanded={consignesVisibles}
            >
              <BookOpenIcon aria-hidden className="size-4" />
              {consignesVisibles ? "Masquer les consignes" : "Revoir les consignes"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEnSeance(false);
                setConsignesVisibles(false);
                entreeNotifiee.current = false;
                onSortie?.();
              }}
            >
              <LogOutIcon aria-hidden className="size-4" />
              Quitter la séance
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

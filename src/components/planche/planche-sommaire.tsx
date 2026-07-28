"use client";

import * as React from "react";
import type { EntreeSommaire } from "@/lib/lecon/sommaire";

/**
 * Sommaire ancré d'une leçon — lot M5.
 *
 * **Amélioration progressive, dans cet ordre :**
 *  1. les ancres sont rendues par le serveur et fonctionnent sans JavaScript —
 *     ce composant est client, mais son HTML est produit au rendu serveur ;
 *  2. le JavaScript n'ajoute **qu'une chose** : le repère de section courante.
 *     Il n'est jamais nécessaire pour naviguer.
 *
 * Ce qu'il ne fait pas, volontairement :
 *  - il **ne touche pas au hash de l'URL** pendant le défilement. L'adresse ne
 *    change que si le lecteur active une ancre lui-même ; sans quoi l'historique
 *    se remplirait tout seul et le bouton « retour » deviendrait inutilisable ;
 *  - il n'anime rien — le défilement doux vient de `scroll-behavior` en CSS,
 *    que `prefers-reduced-motion` neutralise (`src/styles/planche.css`) ;
 *  - il ne rend pas la leçon cliente : seule cette colonne l'est.
 */
export function PlancheSommaire({ entrees }: { entrees: readonly EntreeSommaire[] }) {
  const [courante, setCourante] = React.useState<string | null>(null);

  React.useEffect(() => {
    const cibles = entrees
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);
    if (cibles.length === 0) {
      return;
    }

    /**
     * La section courante est **la dernière dont le titre est passé** au-dessus
     * du quart haut de la fenêtre — pas celle qui traverse une bande étroite.
     * La nuance compte : un titre traverse une bande en une fraction de
     * seconde, alors qu'une section reste courante tant que la suivante n'est
     * pas arrivée. Une première version observait la bande, et le repère
     * s'éteignait dès qu'on s'arrêtait de défiler entre deux titres.
     */
    const ligne = () => window.innerHeight * 0.25;
    const majCourante = () => {
      // En bas de page, la dernière section est à l'écran sans jamais franchir
      // la ligne — le document ne peut plus défiler. Sans ce cas, le repère
      // resterait bloqué sur l'avant-dernière.
      const enBas =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (enBas) {
        setCourante(cibles[cibles.length - 1].id);
        return;
      }
      let actif = cibles[0].id;
      for (const cible of cibles) {
        if (cible.getBoundingClientRect().top <= ligne()) {
          actif = cible.id;
        }
      }
      setCourante(actif);
    };

    // L'observateur ne sert qu'à savoir *quand* recalculer : il se déclenche
    // lorsqu'un titre franchit la ligne, donc au moment où la réponse change.
    // Aucun écouteur de défilement.
    const observateur = new IntersectionObserver(majCourante, {
      rootMargin: "-25% 0px 0px 0px",
      threshold: 0,
    });
    for (const cible of cibles) {
      observateur.observe(cible);
    }

    /**
     * Sentinelle de bas de page — le pied de planche.
     *
     * Sans elle, arriver en bas ne déclenchait rien : le dernier titre ne
     * franchit jamais la ligne, faute de place pour défiler, et le repère
     * restait bloqué sur l'avant-dernière section. Les seuils multiples
     * donnent une seconde occasion de recalculer quand le défilement doux
     * s'immobilise enfin.
     */
    const pied = document.querySelector(".pl-pied");
    const sentinelle = pied
      ? new IntersectionObserver(majCourante, { threshold: [0, 0.5, 1] })
      : null;
    sentinelle?.observe(pied as Element);

    majCourante();
    return () => {
      observateur.disconnect();
      sentinelle?.disconnect();
    };
  }, [entrees]);

  return (
    <nav className="pl-toc" aria-label="Sommaire de la leçon">
      {entrees.map((entree) => (
        <a
          key={entree.id}
          href={`#${entree.id}`}
          aria-current={courante === entree.id ? "true" : undefined}
        >
          {/* Le numéro est une cote, pas un mot : masqué aux technologies
              d'assistance, sinon le lien s'annoncerait « 1Objectifs ». */}
          {entree.numero ? (
            <span className="pl-toc-n" aria-hidden="true">
              {entree.numero}
            </span>
          ) : null}
          <span>{entree.libelle}</span>
        </a>
      ))}
    </nav>
  );
}

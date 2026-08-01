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
  /**
   * Le titre de la séance — **et son titre de niveau 1** — lot F7d.
   *
   * Court : c'est ce que le focus fait lire à l'entrée, et ce que la
   * navigation par titres annonce.
   *
   * ── Pourquoi la séance porte un `<h1>` ──────────────────────────────────
   * Arbitrage du 2026-08-01. Le mode séance retire le chapeau éditorial de
   * l'arbre d'accessibilité, titre compris : la séance devient
   * fonctionnellement une nouvelle vue et doit donc exposer une structure
   * complète. Le `role="group"` nommé ne suffisait pas — il nomme l'aire de
   * jeu, mais il n'a pas la sémantique `heading`, n'apparaît pas dans la
   * liste des titres d'un lecteur d'écran, n'est pas un point de repère, et
   * n'expose pas la séance comme le nouveau sujet principal de la vue.
   *
   * La règle générale, applicable au-delà du Banc :
   *
   *   lorsqu'un état interactif remplace la tâche principale et retire le
   *   titre de la vue précédente, il doit fournir son propre titre principal.
   *   Un nom accessible sur un groupe complète cette structure ; il ne la
   *   remplace pas.
   *
   * Le groupe est donc nommé PAR ce titre (`aria-labelledby`), et non plus
   * par un `aria-label` qui le doublait.
   */
  labelSeance: string;
  /**
   * Masquer visuellement le titre de séance — **jamais** de l'arbre
   * d'accessibilité.
   *
   * À n'employer que si sa présence visuelle est réellement redondante avec
   * une information déjà affichée par la séance. Aucune route ne l'utilise
   * aujourd'hui : vérifié appelant par appelant, aucune n'affiche son propre
   * titre en séance — `QuizPlayer` ne rend le sien qu'en `aria-label`.
   */
  titreSeanceMasque?: boolean;
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
  /**
   * Poser le focus sur le lancement dès le montage — lot F5.
   *
   * Sert au seul cas du REMONTAGE : quand l'appelant redémarre une séance en
   * changeant la clé de ce composant, le bouton qui a déclenché le
   * redémarrage disparaît avec l'ancienne instance et le focus retombe sur
   * `body`. Le contrat du lot F1a exige alors de le replacer, et la cible
   * juste est la commande par laquelle la nouvelle séance commencera.
   *
   * Le premier affichage d'une page ne doit JAMAIS l'activer : voler le focus
   * à l'arrivée ferait sauter la lecture du chapeau.
   *
   * La règle de non-vol s'applique quand même : `deplacerFocus` refuse si la
   * personne a déjà posé le focus ailleurs.
   */
  focusAuMontage?: boolean;
  /**
   * Pilotage EXTERNE du repli — lot F7a.
   *
   * Laissé à `undefined`, le mode séance gère lui-même son état et rend son
   * bouton de lancement : c'est le cas des trois premières routes migrées.
   *
   * Fourni, il devient **contrôlé** : l'appelant décide quand la séance
   * commence et le bouton de lancement n'est plus rendu du tout.
   *
   * ── Pourquoi ce troisième cas existe ────────────────────────────────────
   * L'entraînement psychotechnique ne se lance pas en un clic mais en **deux
   * temps** — on choisit d'abord une session (courte, standard, longue,
   * ciblée, ou personnalisée par familles), puis on lit les consignes de
   * chaque famille tirée, et c'est seulement là que « Démarrer » lance le
   * chronomètre. Ces deux écrans sont l'avant-séance : les replier tous les
   * deux au démarrage est exactement ce que le Banc demande, mais aucun
   * bouton unique ne peut les résumer.
   *
   * Les deux réglages ajoutés aux lots précédents — `lancementDesactive` et
   * `idDescriptionLancement` — visaient déjà ce besoin sans l'atteindre : ils
   * supposent un lancement en une commande. Plutôt que d'empiler un quatrième
   * cas particulier, le composant admet ici que la décision puisse ne pas lui
   * appartenir.
   */
  enSeance?: boolean;
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
  focusAuMontage = false,
  titreSeanceMasque = false,
  enSeance: enSeanceControle,
  className,
}: ModeSeanceProps) {
  const controle = enSeanceControle !== undefined;
  const idTitreSeance = React.useId();
  const [enSeanceInterne, setEnSeanceInterne] = React.useState(false);
  const enSeance = controle ? enSeanceControle : enSeanceInterne;
  const [consignesVisibles, setConsignesVisibles] = React.useState(false);
  const zoneSeance = React.useRef<HTMLDivElement>(null);
  const titreSeance = React.useRef<HTMLHeadingElement>(null);
  const boutonLancement = React.useRef<HTMLButtonElement>(null);
  const declencheur = React.useRef<Element | null>(null);
  const entreeNotifiee = React.useRef(false);

  // Au montage seulement — les dépendances ne comportent donc ni `enSeance`
  // ni le bouton : une fois la séance lancée, la commande n'existe plus.
  React.useEffect(() => {
    if (!focusAuMontage) {
      return;
    }
    deplacerFocus(boutonLancement.current, { declencheur: null });
  }, [focusAuMontage]);

  React.useEffect(() => {
    if (!enSeance) {
      // En mode contrôlé, l'appelant peut sortir puis relancer sans que ce
      // composant ne soit démonté : le drapeau doit alors se réarmer, faute de
      // quoi la deuxième séance n'aurait ni focus ni notification d'entrée.
      entreeNotifiee.current = false;
      return;
    }
    if (entreeNotifiee.current) {
      return;
    }
    entreeNotifiee.current = true;
    /*
      L'ordre compte : l'aire est rendue, le focus s'y pose, et seulement
      ensuite le moteur est prévenu qu'il peut lancer son temps.

      **La cible du focus est le TITRE de séance depuis le lot F7d**, et non
      plus le cadre. Le titre est ce qui annonce le nouveau sujet de la vue ;
      le laisser de côté aurait fait lire un nom de groupe sans jamais situer
      la personne dans la structure du document. Le cadre reste nommé par ce
      même titre, il n'a donc rien perdu.
    */
    deplacerFocus(titreSeance.current, { declencheur: declencheur.current });
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
        {/* En mode contrôlé, le lancement appartient à l'appelant : ce
            composant n'ajoute alors AUCUNE commande à l'avant-séance, sans
            quoi la page en présenterait deux. */}
        {controle ? null : !enSeance ? (
          <Button
            ref={boutonLancement}
            className="mt-6"
            disabled={lancementDesactive}
            aria-describedby={lancementDesactive ? idDescriptionLancement : undefined}
            onClick={(evenement) => {
              declencheur.current = evenement.currentTarget;
              setEnSeanceInterne(true);
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
          {/*
            Le titre principal de l'état actif. Il n'existe QUE pendant la
            séance : au repos, c'est le titre éditorial de la page qui tient ce
            rôle, et il n'y a jamais deux `<h1>` dans une même phase.
          */}
          <h1
            ref={titreSeance}
            id={idTitreSeance}
            tabIndex={-1}
            className={cn("banc-titre-seance", titreSeanceMasque && "sr-only")}
          >
            {labelSeance}
          </h1>

          <div
            ref={zoneSeance}
            tabIndex={-1}
            role="group"
            aria-labelledby={idTitreSeance}
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
                // En mode contrôlé, c'est `onSortie` qui fait foi : le
                // composant ne peut pas décider seul de quitter une séance
                // dont il ne détient pas l'état.
                if (!controle) {
                  setEnSeanceInterne(false);
                  entreeNotifiee.current = false;
                }
                setConsignesVisibles(false);
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

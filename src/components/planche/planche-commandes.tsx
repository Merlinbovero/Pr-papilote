"use client";

import type { ReactNode } from "react";

/**
 * Commandes du système PLANCHE — lot M4.
 *
 * Extraites parce qu'elles ont un consommateur réel : les sept interactions
 * pédagogiques de la leçon. Les primitives sans consommateur (tableau,
 * légende) restent des classes du laboratoire tant qu'aucune route publique
 * ne les emploie — on ne fige pas une API pour personne.
 *
 * Toutes reposent sur des éléments natifs. Le clavier, les rôles et les noms
 * accessibles viennent du navigateur, pas d'un `role=` posé à la main : c'est
 * ce qui rend la migration purement visuelle.
 */

export function PlancheBouton({
  onClick,
  children,
  variante,
  type = "button",
}: {
  onClick?: () => void;
  children: ReactNode;
  variante?: "fantome";
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      className={variante === "fantome" ? "pl-btn pl-ghost" : "pl-btn"}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export interface PlancheOption<T extends string> {
  valeur: T;
  libelle: string;
}

/**
 * Groupe de choix exclusif — `<fieldset>` + `<legend>` + boutons radio natifs.
 *
 * Le rond du radio dit l'exclusivité ; la case de `PlancheCases` est carrée
 * parce qu'elle ne l'est pas. La forme porte le sens.
 */
export function PlancheChoix<T extends string>({
  legende,
  nom,
  options,
  valeur,
  onChange,
}: {
  legende: string;
  nom: string;
  options: readonly PlancheOption<T>[];
  valeur: T;
  onChange: (valeur: T) => void;
}) {
  return (
    <fieldset className="pl-champ">
      <legend>{legende}</legend>
      <div className="pl-radios">
        {options.map((option) => (
          <label key={option.valeur} className="pl-radio">
            <input
              type="radio"
              name={nom}
              value={option.valeur}
              checked={valeur === option.valeur}
              onChange={() => onChange(option.valeur)}
            />
            {option.libelle}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Groupe de choix multiples — mêmes règles, cases carrées. */
export function PlancheCases<T extends string>({
  legende,
  options,
  actives,
  onToggle,
}: {
  legende: string;
  options: readonly PlancheOption<T>[];
  actives: Record<T, boolean>;
  onToggle: (valeur: T) => void;
}) {
  return (
    <fieldset className="pl-champ">
      <legend>{legende}</legend>
      <div className="pl-radios">
        {options.map((option) => (
          <label key={option.valeur} className="pl-radio">
            <input
              type="checkbox"
              checked={actives[option.valeur]}
              onChange={() => onToggle(option.valeur)}
            />
            {option.libelle}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Curseur gradué — `<input type="range">` natif, donc pilotable aux flèches,
 * à Origine/Fin et à Page haut/bas sans une ligne de JavaScript.
 *
 * La valeur courante est affichée en monospace tabulaire : elle change à
 * chaque cran et ne doit pas faire sauter le libellé.
 *
 * Elle est **hors du `<label>`** et portée par `aria-valuetext` : un nom
 * accessible qui change à chaque cran serait annoncé en entier à chaque
 * flèche. Le nom reste « Angle d'incidence », la valeur est lue comme une
 * valeur — ce que les technologies d'assistance attendent d'un curseur.
 */
export function PlancheCurseur({
  id,
  libelle,
  valeur,
  affichage,
  min,
  max,
  pas = 1,
  onChange,
}: {
  id: string;
  libelle: string;
  valeur: number;
  affichage: string;
  min: number;
  max: number;
  pas?: number;
  onChange: (valeur: number) => void;
}) {
  return (
    <div className="pl-curseur">
      <p className="pl-curseur-t">
        <label htmlFor={id}>{libelle}</label>{" "}
        <span className="pl-v" aria-hidden="true">
          {affichage}
        </span>
      </p>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={pas}
        value={valeur}
        aria-valuetext={affichage}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

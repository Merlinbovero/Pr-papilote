"use client";

import * as React from "react";
import Link from "next/link";

import { chargerRecherche } from "./recherche-a-la-demande";
import type { SearchEntry } from "./types";

const PaletteChargee = React.lazy(async () => {
  const mod = await import("./search-command");
  return { default: mod.SearchCommand };
});

/**
 * Le déclencheur de recherche des routes PLANCHE — lot M10.
 *
 * **C'est le lien `/recherche` lui-même.** Sans JavaScript, il navigue ; avec
 * JavaScript, un clic principal sans modificateur ouvre la palette. Une seule
 * affordance, donc, et non un second système : le repli n'est pas un ajout,
 * il est la structure même du composant.
 *
 * **Le comportement natif du lien est préservé.** N'est intercepté que le clic
 * principal, sans `Ctrl`, `Cmd`, `Shift` ni `Alt`, et non déjà annulé. Le clic
 * molette, l'ouverture en nouvel onglet et le menu contextuel passent au
 * navigateur, parce que le `href` n'est jamais retiré.
 *
 * L'index n'est jamais chargé avant la première ouverture. Aucun préchargement
 * au survol ni au focus : il devrait d'abord être mesuré.
 */
export function DeclencheurRecherche({ className }: { className?: string }) {
  const [ouvert, setOuvert] = React.useState(false);
  const [entrees, setEntrees] = React.useState<SearchEntry[] | null>(null);
  const [erreur, setErreur] = React.useState(false);
  const [chargement, setChargement] = React.useState(false);

  const ouvrir = React.useCallback(() => {
    setOuvert(true);
    setErreur(false);
    if (entrees) return;
    setChargement(true);
    // Appels concurrents : `chargerRecherche` rend la même promesse, donc un
    // seul import et une seule requête, quelle que soit la rafale de clics.
    chargerRecherche()
      .then((r) => setEntrees(r.entries))
      .catch(() => setErreur(true))
      .finally(() => setChargement(false));
  }, [entrees]);

  React.useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        ouvrir();
      }
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [ouvrir]);

  const surClic = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Tout ce qui n'est pas un clic principal nu reste au navigateur.
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    ouvrir();
  };

  return (
    <>
      <Link href="/recherche" className={className} onClick={surClic}>
        Rechercher
      </Link>

      {/* L'état est annoncé, pas seulement affiché. */}
      <span aria-live="polite" className="sr-only">
        {chargement ? "Chargement de la recherche…" : ""}
        {erreur ? "La recherche n’a pas pu être chargée." : ""}
      </span>

      {ouvert && erreur ? (
        <div role="alert" className="pl-recherche-erreur">
          La recherche n’a pas pu être chargée.{" "}
          <Link href="/recherche">Ouvrir la page de recherche</Link>
        </div>
      ) : null}

      {ouvert && entrees ? (
        <React.Suspense fallback={null}>
          <PaletteChargee entries={entrees} pilote onFermeture={() => setOuvert(false)} />
        </React.Suspense>
      ) : null}
    </>
  );
}

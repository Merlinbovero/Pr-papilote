"use client";

import * as React from "react";
import Link from "next/link";
import { SearchIcon } from "lucide-react";

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
/** Verrou de page : un seul déclencheur sert le raccourci clavier. */
let raccourciPris = false;

export type PresentationDeclencheur = "lien" | "icon" | "hero";

export function DeclencheurRecherche({
  className,
  presentation = "lien",
}: {
  className?: string;
  presentation?: PresentationDeclencheur;
}) {
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

  // **Un seul écouteur pour toute la page.** L'accueil monte deux déclencheurs
  // — celui de l'en-tête et celui du héros — et sans ce verrou les deux
  // répondaient à `Ctrl K` : deux palettes s'ouvraient l'une sur l'autre.
  // Le premier monté prend le raccourci et le rend en se démontant.
  React.useEffect(() => {
    if (raccourciPris) return;
    raccourciPris = true;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        ouvrir();
      }
    };
    window.addEventListener("keydown", surTouche);
    return () => {
      window.removeEventListener("keydown", surTouche);
      raccourciPris = false;
    };
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
      {/* Toujours une ancre, quelle que soit la présentation : c'est ce qui
          garantit le repli sans JavaScript et les clics modifiés. Seule
          l'apparence change entre les routes. */}
      <Link
        href="/recherche"
        onClick={surClic}
        // L'étiquette n'est posée que sur la variante SANS texte visible.
        // Ailleurs elle masquerait le libellé descriptif — « Rechercher un
        // appareil, une notion, une procédure… » — et appauvrirait ce que le
        // lecteur d'écran annonce.
        aria-label={presentation === "icon" ? "Rechercher (Ctrl K)" : undefined}
        className={
          className ??
          (presentation === "icon"
            ? "border-input bg-background hover:bg-accent inline-flex size-9 items-center justify-center rounded-md border"
            : presentation === "hero"
              ? "border-input bg-background text-muted-foreground hover:bg-accent flex w-full max-w-xl items-center gap-2 rounded-lg border px-4 py-3 text-sm"
              : undefined)
        }
      >
        {presentation === "icon" ? (
          <SearchIcon aria-hidden className="size-4" />
        ) : presentation === "hero" ? (
          <>
            <SearchIcon aria-hidden className="size-4" />
            <span className="flex-1 text-left">
              Rechercher un appareil, une notion, une procédure…
            </span>
            <kbd className="bg-muted pointer-events-none hidden rounded px-1.5 font-mono text-xs sm:inline">
              Ctrl K
            </kbd>
          </>
        ) : (
          "Rechercher"
        )}
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

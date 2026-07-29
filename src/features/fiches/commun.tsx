import type { EncreModule } from "@/components/planche/planche";
import type { FicheFile } from "@/lib/content/content-schemas";

/**
 * Ce que les gabarits de fiche PLANCHE partagent — lot M7b.
 *
 * Extrait à la **deuxième** occurrence, quand Le Cahier et La Situation ont eu
 * besoin de ce que La Planche d'identification portait déjà. C'est la règle du
 * projet : on ne promeut pas une abstraction pour un seul consommateur.
 *
 * Rien de graphique ici : uniquement la résolution des données communes —
 * l'encre du module hôte, les avertissements de statut éditorial, les renvois
 * du graphe de relations, le format de date.
 */

/**
 * L'encre du module hôte — le sens de la couleur, pas une décoration.
 *
 * `culture` couvre les trois familles du module : les notices d'appareils
 * étrangers (M7a), Le Cahier et La Situation (M7b). Culture et Géopolitique
 * partagent volontairement `sienne` : ce qui les sépare n'est pas la couleur,
 * c'est leur rapport au temps.
 */
export const ENCRE_MODULE: Record<string, EncreModule> = {
  eopan: "marine",
  eopn: "air",
  alat: "terre",
  culture: "sienne",
  fondamentaux: "bistre",
};

export const AVERTISSEMENTS: Partial<
  Record<FicheFile["status"], { libelle: string; texte: string }>
> = {
  relecture: {
    libelle: "Fiche en relecture",
    texte: "Ce contenu attend la validation éditoriale finale avant publication.",
  },
  validee: {
    libelle: "Fiche validée",
    texte: "Contenu validé, en attente de publication.",
  },
  "a-mettre-a-jour": {
    libelle: "Fiche en cours de mise à jour",
    texte:
      "Une information de cette fiche est en cours de re-vérification ; certaines données peuvent évoluer.",
  },
};

export const dateCourte = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(new Date(iso));

export interface RenvoiPlanche {
  titre: string;
  items: { label: string; href: string }[];
}

interface ChargeursRenvois {
  getFicheById: (id: string) => FicheFile | undefined;
  getFicheHref: (fiche: Pick<FicheFile, "module" | "category" | "slug">) => string;
  getFicheLinks: (id: string) => { targetId: string; targetTitle: string; weight: string }[];
  getTermesForFiche: (id: string) => { id: string; title: string }[];
}

/**
 * Les renvois de l'annexe — mêmes sources et mêmes cibles que le gabarit
 * historique, dans le même ordre. Les blocs vides sont écartés : une rubrique
 * « Voir aussi » sans lien est une promesse non tenue.
 */
export function renvoisDeFiche(fiche: FicheFile, c: ChargeursRenvois): RenvoiPlanche[] {
  const links = c.getFicheLinks(fiche.id);
  const versFiche = (liste: typeof links) =>
    liste.map((lien) => {
      const cible = c.getFicheById(lien.targetId);
      return { label: lien.targetTitle, href: cible ? c.getFicheHref(cible) : "#" };
    });
  const pedagogiques = (ids: string[] | undefined) =>
    (ids ?? []).flatMap((id) => {
      const cible = c.getFicheById(id);
      return cible ? [{ label: cible.title, href: c.getFicheHref(cible) }] : [];
    });

  return [
    { titre: "Notions préalables", items: pedagogiques(fiche.relations.prerequisites) },
    { titre: "Relations directes", items: versFiche(links.filter((l) => l.weight === "forte")) },
    { titre: "Voir aussi", items: versFiche(links.filter((l) => l.weight === "moyenne")) },
    { titre: "Voir également", items: pedagogiques(fiche.relations.variantOf) },
    {
      titre: "Pour aller plus loin",
      items: versFiche(links.filter((l) => l.weight === "complementaire")),
    },
    {
      titre: "Dictionnaire",
      items: c.getTermesForFiche(fiche.id).map((terme) => ({
        label: terme.title,
        href: `/dictionnaire/${terme.id.replace(/^terme\./, "")}`,
      })),
    },
  ].filter((bloc) => bloc.items.length > 0);
}

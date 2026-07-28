import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FicheTransition } from "@/features/fiches/fiche-transition";
import { getArchetypeFiche } from "@/lib/content/archetypes";
import { getFiche, getFicheHref, getFiches } from "@/lib/content/fiches";
import { getCategory, getModule } from "@/lib/content/referentials";

/**
 * Fiche documentaire — lot M6a.
 *
 * La page ne rend plus rien elle-même : elle **choisit une famille**. Chaque
 * fiche est classée par `content/_referentiels/archetypes.json` — une décision
 * éditoriale, tenue hors du schéma des fiches — et le rendu suit.
 *
 * En M6a, les quatre familles passent encore par `FicheTransition`, qui porte
 * la charte historique telle quelle. M6b remplacera la seule branche
 * `identification` par le gabarit de La Planche ; les trois autres attendront
 * la validation de leur propre grammaire documentaire.
 *
 * Ce qui ne change pas ici, et doit rester vérifiable : l'URL, les paramètres
 * statiques, les métadonnées, la canonique, la règle d'indexation.
 */

interface FichePageProps {
  params: Promise<{ module: string; categorie: string; slug: string }>;
}

export function generateStaticParams() {
  return getFiches().map((fiche) => ({
    module: fiche.module,
    categorie: fiche.category,
    slug: fiche.slug,
  }));
}

export async function generateMetadata({ params }: FichePageProps): Promise<Metadata> {
  const { module: moduleSlug, categorie, slug } = await params;
  const fiche = getFiche(moduleSlug, categorie, slug);
  if (!fiche) {
    return {};
  }
  const canonical = getFicheHref(fiche);
  return {
    title: fiche.title,
    description: fiche.summary,
    alternates: { canonical },
    openGraph: { type: "article", title: fiche.title, description: fiche.summary, url: canonical },
    robots: fiche.status === "publie" ? undefined : { index: false, follow: false },
  };
}

export default async function FichePage({ params }: FichePageProps) {
  const { module: moduleSlug, categorie, slug } = await params;
  const fiche = getFiche(moduleSlug, categorie, slug);
  const mod = getModule(moduleSlug);
  const category = getCategory(moduleSlug, categorie);
  if (!fiche || !mod || !category) {
    notFound();
  }

  // La classification est résolue même si toutes les branches mènent
  // aujourd'hui au même rendu : c'est elle qui fait échouer le build lorsqu'une
  // fiche n'est pas classée, et c'est elle que M6b consultera.
  const archetype = getArchetypeFiche(fiche);

  switch (archetype) {
    case "identification":
    case "lecon":
    case "cahier":
    case "situation":
      return <FicheTransition fiche={fiche} mod={mod} category={category} />;
  }
}

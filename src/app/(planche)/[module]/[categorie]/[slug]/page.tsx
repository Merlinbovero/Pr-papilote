import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Cahier } from "@/features/fiches/cahier";
import { Dossier } from "@/features/fiches/dossier";

import { LeconFiche } from "@/features/fiches/lecon-fiche";
import { PlancheIdentification } from "@/features/fiches/planche-identification";
import { Situation } from "@/features/fiches/situation";

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
 * **Les cinq familles ont leur gabarit, et la migration est close** :
 * La Planche d'identification (83 notices, M6b et M7a), Le Cahier (20 articles)
 * et La Situation (4 points datés, M7b), La Leçon (108 fiches de notion, M8b),
 * Le Dossier (23 fiches de concours, M9b).
 *
 * Avec Le Dossier disparaît `FicheTransition`, dernière page à porter la charte
 * historique, et avec elle Geist, Geist Mono et Archivo quittent cette route.
 * Aucune des 238 fiches ne charge plus de fonte du site : elles ne vivent plus
 * que sous `(site)`.
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
      return <PlancheIdentification fiche={fiche} mod={mod} category={category} />;
    case "cahier":
      return <Cahier fiche={fiche} mod={mod} category={category} />;
    case "situation":
      return <Situation fiche={fiche} mod={mod} category={category} />;
    case "lecon":
      return <LeconFiche fiche={fiche} mod={mod} category={category} />;
    case "dossier":
      return <Dossier fiche={fiche} mod={mod} category={category} />;
  }
}

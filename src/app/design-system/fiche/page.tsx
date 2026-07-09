import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CrossModuleReturn } from "@/components/content/cross-module-return";
import { DocumentList } from "@/components/content/document-list";
import { EssentialBlock } from "@/components/content/essential-block";
import { FicheHeader } from "@/components/content/fiche-header";
import { FicheNav } from "@/components/content/fiche-nav";
import { FicheSection } from "@/components/content/fiche-section";
import { Infobox } from "@/components/content/infobox";
import { PitfallsBlock } from "@/components/content/pitfalls-block";
import { RelationBlock } from "@/components/content/relation-block";
import { SourceList } from "@/components/content/source-list";
import { TableOfContents } from "@/components/content/table-of-contents";
import { TermTooltip } from "@/components/content/term-tooltip";
import { RevisionHistory } from "@/components/content/revision-history";
import { TrainingBlock } from "@/components/content/training-block";

export const metadata: Metadata = {
  title: "Gabarit de fiche — démonstration",
  robots: { index: false, follow: false },
};

/**
 * Prévisualisation du gabarit officiel de fiche
 * (docs/editorial/gabarit-fiche.md) avec des données EXPLICITEMENT
 * FICTIVES : aucune information réelle n'est affirmée ici.
 */

const demoInfobox = [
  { label: "Constructeur", value: "Constructeur (démo)" },
  { label: "Rôle", value: "Multirôle (démo)" },
  { label: "Armées", value: ["Armée d'exemple"] },
  { label: "Mise en service", value: "20XX" },
  { label: "Statut", value: "En service (démo)" },
  { label: "Équipage", value: "1 ou 2" },
];

const tocItems = [
  { id: "l-essentiel", label: "L'essentiel" },
  { id: "role-et-missions", label: "Rôle et missions" },
  { id: "caracteristiques", label: "Caractéristiques" },
  { id: "versions", label: "Versions" },
  { id: "pieges", label: "Pièges et erreurs fréquentes" },
  { id: "histoire-detaillee", label: "Histoire détaillée" },
  { id: "documents", label: "Documents associés" },
  { id: "sources", label: "Sources et références" },
  { id: "s-entrainer", label: "S'entraîner" },
];

export default function FicheGabaritPreviewPage() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SHOW_DESIGN_SYSTEM !== "1") {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <Alert className="mb-6 print:hidden">
        <AlertTitle>Fiche de démonstration du gabarit officiel</AlertTitle>
        <AlertDescription>
          Toutes les données ci-dessous sont fictives. Cette page valide le gabarit
          (docs/editorial/gabarit-fiche.md) avant les cinq fiches pilotes.
        </AlertDescription>
      </Alert>

      <div className="mb-4 flex flex-wrap items-center gap-3 print:hidden">
        <SiteBreadcrumb
          items={[
            { label: "Accueil", href: "/" },
            { label: "EOPN", href: "/eopn" },
            { label: "Appareils", href: "/eopn/appareils" },
            { label: "Appareil de démonstration" },
          ]}
        />
        <CrossModuleReturn label="Variante Marine (démo)" href="/eopan/appareils" />
      </div>

      <FicheHeader
        title="Appareil de démonstration"
        summary="Fiche fictive illustrant le gabarit documentaire officiel : quatre niveaux de lecture, infobox, relations, sources et entraînement."
        moduleName="EOPN"
        typeLabel="Appareil"
        levelLabel="Niveau concours"
        readingMinutes={12}
        verifiedAt="2026-07-07"
      />

      <div className="mt-8 gap-10 xl:grid xl:grid-cols-[minmax(0,1fr)_280px]">
        {/* Colonne de lecture */}
        <div className="min-w-0 space-y-10">
          <figure className="print:hidden">
            <div
              aria-hidden
              className="bg-muted flex aspect-[16/9] items-center justify-center rounded-xl border"
            >
              <span className="text-muted-foreground text-sm">
                Image officielle (emplacement — droits vérifiés avant mise en ligne)
              </span>
            </div>
            <figcaption className="text-muted-foreground mt-2 text-sm">
              Légende de l&apos;image · Crédit : à renseigner
            </figcaption>
          </figure>

          <EssentialBlock
            keyPoints={[
              "Premier point à retenir (démonstration).",
              "Deuxième point à retenir (démonstration).",
              "Troisième point à retenir (démonstration).",
            ]}
          >
            <p>
              Paragraphe d&apos;essentiel : en moins de 250 mots, un candidat comprend de quoi parle
              la fiche et repart avec le principal. Ce bloc est autosuffisant — c&apos;est la
              lecture 30 secondes du gabarit.
            </p>
            <p>
              Les termes du dictionnaire apparaissent en souligné pointillé, comme{" "}
              <TermTooltip definition="Définition courte de démonstration issue du dictionnaire canonique.">
                ce terme d&apos;exemple
              </TermTooltip>
              , avec définition au survol ou au tap.
            </p>
          </EssentialBlock>

          {/* Infobox mobile : juste après L'essentiel (arbitrage 3) */}
          <Infobox
            title="Appareil de démonstration"
            entries={demoInfobox}
            className="xl:hidden print:hidden"
          />
          {/* Infobox impression : tableau sous le titre */}
          <Infobox
            title="Données"
            entries={demoInfobox}
            variant="table"
            className="hidden print:table"
          />

          <FicheSection id="role-et-missions" title="Rôle et missions">
            <p>
              Section « Approfondir » conforme au modèle du type appareil. Paragraphes courts, une
              idée par paragraphe, intertitres informatifs : la lecture 5 minutes se fait en
              parcourant ces sections.
            </p>
          </FicheSection>

          <FicheSection id="caracteristiques" title="Caractéristiques">
            <p>
              Les données chiffrées vivent dans l&apos;infobox et les tableaux — le texte explique,
              il n&apos;inventorie pas.
            </p>
          </FicheSection>

          <FicheSection id="versions" title="Versions">
            <p>
              Les variantes renvoient vers leurs fiches par la relation « variante-de », affichée
              dans « Voir également ».
            </p>
          </FicheSection>

          <PitfallsBlock
            items={[
              "Confusion fréquente de démonstration n° 1 — future question de quiz.",
              "Confusion fréquente de démonstration n° 2.",
            ]}
          />

          <FicheSection id="histoire-detaillee" title="Histoire détaillée" strate="maitriser">
            <p>
              Section « Maîtriser » : visible, badgée sobrement « Expert », jamais dominante. Le
              lecteur pressé s&apos;arrête avant ; la lecture d&apos;une heure passe par ici.
            </p>
          </FicheSection>

          <DocumentList
            documents={[
              {
                title: "Document public de démonstration",
                kindLabel: "Brochure (lien officiel)",
                href: "#",
              },
            ]}
          />

          <SourceList
            sources={[
              {
                title: "Source officielle de démonstration",
                kind: "officiel",
                consultedAt: "2026-07-07",
              },
              {
                title: "Ouvrage de démonstration",
                kind: "ouvrage",
                consultedAt: "2026-07-07",
              },
            ]}
          />

          <TrainingBlock questionCount={34} />

          <RevisionHistory
            revisions={[
              {
                date: "2026-07-07",
                version: 1,
                motif: "Création de la fiche de démonstration.",
                author: "Rédaction (démo)",
              },
              {
                date: "2026-07-08",
                version: 2,
                motif: "Mise à jour des données de l'infobox après vérification des sources.",
                author: "Rédaction (démo)",
                reviewer: "Relecture (démo)",
              },
            ]}
          />

          <FicheNav
            previous={{ label: "Fiche précédente (démo)", href: "#" }}
            next={{ label: "Fiche suivante (démo)", href: "#" }}
            back={{ label: "Retour à Appareils", href: "/eopn/appareils" }}
            auditLine="Fiche de démonstration · ID demo.appareils.exemple · créée le 07/07/2026 · vérifiée le 07/07/2026"
          />
        </div>

        {/* Colonne latérale sticky (desktop) */}
        <aside className="hidden xl:block print:hidden">
          <div className="sticky top-20 space-y-8">
            <Infobox title="Appareil de démonstration" entries={demoInfobox} />
            <TableOfContents items={tocItems} />
            <RelationBlock
              title="Notions préalables"
              items={[{ label: "Notion fondamentale (démo)", href: "/fondamentaux/aerodynamique" }]}
            />
            <RelationBlock
              title="Voir également"
              items={[
                {
                  label: "Variante Marine (démo)",
                  href: "/eopan/appareils",
                  context: "EOPAN",
                },
              ]}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}

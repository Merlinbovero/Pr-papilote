import { ModuleCategoryBar } from "@/components/layout/module-category-bar";
import { ModuleSidebarNav } from "@/components/layout/module-sidebar-nav";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { AircraftSpecsBlock } from "@/components/content/aircraft-specs";
import { DocumentList } from "@/components/content/document-list";
import { EssentialBlock } from "@/components/content/essential-block";
import { FicheFigure } from "@/components/content/fiche-figure";
import { FicheHeader } from "@/components/content/fiche-header";
import { FicheNav } from "@/components/content/fiche-nav";
import { FichePhotoBanner } from "@/components/content/fiche-photo";
import { FicheSection } from "@/components/content/fiche-section";
import { Infobox } from "@/components/content/infobox";
import { Markdown } from "@/components/content/markdown";
import { PitfallsBlock } from "@/components/content/pitfalls-block";
import { RelationBlock } from "@/components/content/relation-block";
import { RevisionHistory } from "@/components/content/revision-history";
import { ServiceStatusBadge } from "@/components/content/service-badge";
import { SourceList } from "@/components/content/source-list";
import { TableOfContents } from "@/components/content/table-of-contents";
import type { DocumentItem, InfoboxEntry, RelationItem, TocItem } from "@/components/content/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buildNotionPool } from "@/features/quiz/notion-pool";
import { NotionQuiz } from "@/features/quiz/notion-quiz";
import type { DocumentNotice, FicheFile } from "@/lib/content/content-schemas";
import {
  getDocumentHref,
  getDocumentsForFiche,
  getFicheById,
  getFicheHref,
  getFicheLinks,
  getFichesByCategory,
  getReadingMinutes,
  getTermesForFiche,
} from "@/lib/content/fiches";
import { editorialState } from "@/lib/content/freshness";
import { infoboxLabel } from "@/lib/content/infobox-labels";
import { getCategories } from "@/lib/content/referentials";
import type { Category, Module } from "@/lib/content/schemas";
import { SITE_FONT_VARIABLES } from "@/lib/design/site-fonts";
import { getModuleAccentVar } from "@/lib/module-accent";

/**
 * Fiche non encore migrée — lot M6a.
 *
 * Ce composant porte **la charte historique, telle quelle**. Il n'emprunte
 * rien à la grammaire de La Planche d'identification : une fiche qui n'a pas
 * été migrée ne doit pas en avoir l'air. C'est la contrepartie du déplacement
 * de la route — le groupe change, le rendu attend son tour.
 *
 * Trois précautions le rendent honnête :
 *  1. **ses fontes** — Geist et Archivo sont chargées ici, sinon la page se
 *     rendrait en Fira Sans, jamais dessinée pour ces composants ;
 *  2. **sa portée** — `.site-root` rétablit la typographie de base que le
 *     layout `(site)` fournissait ;
 *  3. **sa navigation** — l'index latéral des catégories et la barre mobile,
 *     que la route héritait de `ModuleLayout`, sont reproduits ici. Changer de
 *     groupe ne doit pas coûter une navigation.
 *
 * `.pl-hote` empêche la typographie PLANCHE d'entrer dans le bloc : elle
 * n'habille pas ce contenu, elle le laisse tranquille.
 *
 * Ce fichier est destiné à **disparaître** famille par famille. Le jour où
 * plus aucune fiche ne le monte, il s'en va — et Geist avec lui.
 */

const TYPE_LABELS: Partial<Record<FicheFile["type"], string>> = {
  appareil: "Appareil",
  helicoptere: "Hélicoptère",
  navire: "Navire",
  flottille: "Flottille",
  procedure: "Procédure",
  concept: "Concept",
  organisation: "Organisation",
};

const LEVEL_LABELS: Record<number, string> = {
  1: "Découverte",
  2: "Niveau concours",
  3: "Expert",
};

const DOCUMENT_KIND_LABELS: Record<DocumentNotice["kind"], string> = {
  arrete: "Arrêté",
  rapport: "Rapport",
  brochure: "Brochure",
  documentation: "Documentation",
  communique: "Communiqué",
  autre: "Document",
};

export function FicheTransition({
  fiche,
  mod,
  category,
}: {
  fiche: FicheFile;
  mod: Module;
  category: Category;
}) {
  const categoriesDuModule = getCategories(mod.slug).map((c) => ({
    slug: c.slug,
    name: c.name,
    count: getFichesByCategory(mod.slug, c.slug).length,
  }));
  const accentVar = getModuleAccentVar(mod.slug);

  const quizPool = buildNotionPool(fiche.id);
  const links = getFicheLinks(fiche.id);
  const strongLinks = links.filter((link) => link.weight === "forte");
  const mediumLinks = links.filter((link) => link.weight === "moyenne");
  const complementaryLinks = links.filter((link) => link.weight === "complementaire");

  const toRelationItems = (list: typeof links): RelationItem[] =>
    list.map((link) => {
      const target = getFicheById(link.targetId);
      return {
        label: link.targetTitle,
        href: target ? getFicheHref(target) : "#",
        context: link.label,
      };
    });

  const pedagogical = (ids: string[] | undefined): RelationItem[] =>
    (ids ?? []).flatMap((id) => {
      const target = getFicheById(id);
      return target ? [{ label: target.title, href: getFicheHref(target) }] : [];
    });

  const termes = getTermesForFiche(fiche.id);
  const state = editorialState(fiche, new Date());

  const documents: DocumentItem[] = getDocumentsForFiche(fiche).map((doc) => ({
    title: doc.title,
    kindLabel: DOCUMENT_KIND_LABELS[doc.kind],
    href: getDocumentHref(doc),
  }));

  const infoboxEntries: InfoboxEntry[] = fiche.infobox
    ? Object.entries(fiche.infobox).map(([key, value]) => ({
        label: infoboxLabel(key),
        value: typeof value === "number" ? String(value) : value,
      }))
    : [];

  const tocItems: TocItem[] = [
    { id: "l-essentiel", label: "L'essentiel" },
    ...fiche.content.sections.map((section) => ({ id: section.id, label: section.title })),
    ...(fiche.content.pieges.length > 0
      ? [{ id: "pieges", label: "Pièges et erreurs fréquentes" }]
      : []),
    { id: "sources", label: "Sources et références" },
  ];

  const siblings = getFichesByCategory(fiche.module, fiche.category);
  const index = siblings.findIndex((sibling) => sibling.id === fiche.id);
  const previous = index > 0 ? siblings[index - 1] : undefined;
  const next = index < siblings.length - 1 ? siblings[index + 1] : undefined;

  const formatDate = (iso: string) =>
    new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(new Date(iso));

  return (
    <div className={`${SITE_FONT_VARIABLES} site-root pl-hote`}>
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <ModuleSidebarNav
          moduleSlug={mod.slug}
          moduleName={mod.name}
          categories={categoriesDuModule}
          accentVar={accentVar}
        />
        <div className="min-w-0 flex-1">
          <ModuleCategoryBar
            moduleSlug={mod.slug}
            moduleName={mod.name}
            categories={categoriesDuModule}
            accentVar={accentVar}
          />
          <main className="w-full min-w-0">
            {fiche.status === "relecture" || fiche.status === "validee" ? (
              <Alert className="mb-6 print:hidden">
                <AlertTitle>
                  {fiche.status === "relecture" ? "Fiche en relecture" : "Fiche validée"}
                </AlertTitle>
                <AlertDescription>
                  {fiche.status === "relecture"
                    ? "Ce contenu attend la validation éditoriale finale avant publication."
                    : "Contenu validé, en attente de publication."}
                </AlertDescription>
              </Alert>
            ) : null}
            {fiche.status === "a-mettre-a-jour" ? (
              <Alert className="border-warning mb-6 print:hidden">
                <AlertTitle>Fiche en cours de mise à jour</AlertTitle>
                <AlertDescription>
                  Une information de cette fiche est en cours de re-vérification ; certaines données
                  peuvent évoluer.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="mb-4 print:hidden">
              <SiteBreadcrumb
                items={[
                  { label: "Accueil", href: "/" },
                  { label: mod.name, href: `/${mod.slug}` },
                  { label: category.name, href: `/${mod.slug}/${category.slug}` },
                  { label: fiche.title },
                ]}
              />
            </div>

            <FicheHeader
              title={fiche.title}
              summary={fiche.summary}
              moduleName={mod.name}
              typeLabel={TYPE_LABELS[fiche.type] ?? fiche.type}
              levelLabel={LEVEL_LABELS[fiche.level] ?? `Niveau ${fiche.level}`}
              readingMinutes={getReadingMinutes(fiche)}
              verifiedAt={fiche.verifiedAt}
              overdue={state === "a-verifier"}
            />

            {fiche.image ? (
              <div className="mt-6">
                <FichePhotoBanner photo={fiche.image} />
              </div>
            ) : null}

            {fiche.service ? <ServiceStatusBadge service={fiche.service} className="mt-4" /> : null}

            <div className="mt-8 gap-10 xl:grid xl:grid-cols-[minmax(0,1fr)_280px]">
              <div className="min-w-0 space-y-10">
                <EssentialBlock keyPoints={fiche.content.essentiel.aRetenir}>
                  <Markdown>{fiche.content.essentiel.body}</Markdown>
                </EssentialBlock>

                {infoboxEntries.length > 0 ? (
                  <>
                    <Infobox
                      title={fiche.title}
                      entries={infoboxEntries}
                      className="xl:hidden print:hidden"
                    />
                    <Infobox
                      title="Données"
                      entries={infoboxEntries}
                      variant="table"
                      className="hidden print:table"
                    />
                  </>
                ) : null}

                {fiche.content.sections.map((section) => (
                  <FicheSection
                    key={section.id}
                    id={section.id}
                    title={section.title}
                    strate={section.strate}
                  >
                    <Markdown>{section.body}</Markdown>
                    {section.figures.map((figure) => (
                      <FicheFigure key={figure.schemaId} {...figure} />
                    ))}
                  </FicheSection>
                ))}

                {fiche.specs ? <AircraftSpecsBlock specs={fiche.specs} /> : null}

                {fiche.content.pieges.length > 0 ? (
                  <PitfallsBlock items={fiche.content.pieges} />
                ) : null}

                <DocumentList documents={documents} />

                <SourceList sources={fiche.sources} />

                {complementaryLinks.length > 0 ? (
                  <div className="print:hidden">
                    <RelationBlock
                      title="Pour aller plus loin"
                      items={toRelationItems(complementaryLinks)}
                    />
                  </div>
                ) : null}

                <NotionQuiz ficheTitle={fiche.title} pool={quizPool} />

                <RevisionHistory revisions={fiche.revisions} />

                <FicheNav
                  previous={
                    previous ? { label: previous.title, href: getFicheHref(previous) } : undefined
                  }
                  next={next ? { label: next.title, href: getFicheHref(next) } : undefined}
                  back={{
                    label: `Retour à ${category.name}`,
                    href: `/${mod.slug}/${category.slug}`,
                  }}
                  auditLine={`ID ${fiche.id} · créée le ${formatDate(fiche.createdAt)} · vérifiée le ${formatDate(fiche.verifiedAt)} · ${fiche.author}`}
                />
              </div>

              <aside className="hidden xl:block print:hidden">
                <div className="sticky top-20 space-y-8">
                  {infoboxEntries.length > 0 ? (
                    <Infobox title={fiche.title} entries={infoboxEntries} />
                  ) : null}
                  <TableOfContents items={tocItems} />
                  <RelationBlock
                    title="Notions préalables"
                    items={pedagogical(fiche.relations.prerequisites)}
                  />
                  <RelationBlock title="Relations directes" items={toRelationItems(strongLinks)} />
                  <RelationBlock title="Voir aussi" items={toRelationItems(mediumLinks)} />
                  <RelationBlock
                    title="Voir également"
                    items={pedagogical(fiche.relations.variantOf)}
                  />
                  <RelationBlock
                    title="Dictionnaire"
                    items={termes.map((terme) => ({
                      label: terme.title,
                      href: `/dictionnaire/${terme.id.replace(/^terme\./, "")}`,
                    }))}
                  />
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

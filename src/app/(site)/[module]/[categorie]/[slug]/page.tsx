import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DocumentList } from "@/components/content/document-list";
import { EssentialBlock } from "@/components/content/essential-block";
import { FicheFigure } from "@/components/content/fiche-figure";
import { FicheHeader } from "@/components/content/fiche-header";
import { FichePhotoBanner } from "@/components/content/fiche-photo";
import { ServiceStatusBadge } from "@/components/content/service-badge";
import { AircraftSpecsBlock } from "@/components/content/aircraft-specs";
import { FicheNav } from "@/components/content/fiche-nav";
import { FicheSection } from "@/components/content/fiche-section";
import { Infobox } from "@/components/content/infobox";
import { Markdown } from "@/components/content/markdown";
import { PitfallsBlock } from "@/components/content/pitfalls-block";
import { RelationBlock } from "@/components/content/relation-block";
import { RevisionHistory } from "@/components/content/revision-history";
import { SourceList } from "@/components/content/source-list";
import { TableOfContents } from "@/components/content/table-of-contents";
import { NotionQuiz } from "@/features/quiz/notion-quiz";
import { buildNotionPool } from "@/features/quiz/notion-pool";
import type { DocumentItem, InfoboxEntry, RelationItem, TocItem } from "@/components/content/types";
import type { DocumentNotice, FicheFile } from "@/lib/content/content-schemas";
import {
  getDocumentHref,
  getDocumentsForFiche,
  getFiche,
  getFicheById,
  getFicheHref,
  getFicheLinks,
  getFiches,
  getFichesByCategory,
  getReadingMinutes,
  getTermesForFiche,
} from "@/lib/content/fiches";
import { editorialState } from "@/lib/content/freshness";
import { infoboxLabel } from "@/lib/content/infobox-labels";
import { getCategory, getModule } from "@/lib/content/referentials";

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

/** Gabarit officiel de fiche appliqué à un objet réel du graphe. */
export default async function FichePage({ params }: FichePageProps) {
  const { module: moduleSlug, categorie, slug } = await params;
  const fiche = getFiche(moduleSlug, categorie, slug);
  const mod = getModule(moduleSlug);
  const category = getCategory(moduleSlug, categorie);
  if (!fiche || !mod || !category) {
    notFound();
  }

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

          {fiche.content.pieges.length > 0 ? <PitfallsBlock items={fiche.content.pieges} /> : null}

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
            back={{ label: `Retour à ${category.name}`, href: `/${mod.slug}/${category.slug}` }}
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
            <RelationBlock title="Voir également" items={pedagogical(fiche.relations.variantOf)} />
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
  );
}

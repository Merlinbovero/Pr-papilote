import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DocumentList } from "@/components/content/document-list";
import { EssentialBlock } from "@/components/content/essential-block";
import { FicheHeader } from "@/components/content/fiche-header";
import { FicheNav } from "@/components/content/fiche-nav";
import { FicheSection } from "@/components/content/fiche-section";
import { Infobox } from "@/components/content/infobox";
import { Markdown } from "@/components/content/markdown";
import { PitfallsBlock } from "@/components/content/pitfalls-block";
import { RelationBlock } from "@/components/content/relation-block";
import { SourceList } from "@/components/content/source-list";
import { TableOfContents } from "@/components/content/table-of-contents";
import { TrainingBlock } from "@/components/content/training-block";
import type { InfoboxEntry, RelationItem, TocItem } from "@/components/content/types";
import type { FicheFile } from "@/lib/content/content-schemas";
import {
  getFiche,
  getFicheById,
  getFicheHref,
  getFicheLinks,
  getFiches,
  getFichesByCategory,
  getReadingMinutes,
  getTermesForFiche,
} from "@/lib/content/fiches";
import { isReviewOverdue } from "@/lib/content/freshness";
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

export async function generateMetadata({ params }: FichePageProps): Promise<Metadata> {
  const { module: moduleSlug, categorie, slug } = await params;
  const fiche = getFiche(moduleSlug, categorie, slug);
  if (!fiche) {
    return {};
  }
  return {
    title: fiche.title,
    description: fiche.summary,
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
  const overdue = isReviewOverdue(fiche, new Date());

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
      {fiche.status !== "publie" ? (
        <Alert className="mb-6 print:hidden">
          <AlertTitle>Fiche en relecture</AlertTitle>
          <AlertDescription>
            Ce contenu attend la validation éditoriale finale avant publication.
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
        overdue={overdue}
      />

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
            </FicheSection>
          ))}

          {fiche.content.pieges.length > 0 ? <PitfallsBlock items={fiche.content.pieges} /> : null}

          <DocumentList documents={[]} />

          <SourceList sources={fiche.sources} />

          {complementaryLinks.length > 0 ? (
            <div className="print:hidden">
              <RelationBlock
                title="Pour aller plus loin"
                items={toRelationItems(complementaryLinks)}
              />
            </div>
          ) : null}

          <TrainingBlock questionCount={0} />

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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { NoticeDocument } from "@/components/content/notice-document";
import type { RelationItem } from "@/components/content/types";
import type { DocumentNotice } from "@/lib/content/content-schemas";
import {
  getDocument,
  getDocuments,
  getFicheHref,
  getFichesForDocument,
} from "@/lib/content/fiches";

interface DocumentPageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return getDocuments().map((doc) => ({ id: doc.id.replace(/^doc\./, "") }));
}

const KIND_LABELS: Record<DocumentNotice["kind"], string> = {
  arrete: "Arrêté",
  rapport: "Rapport",
  brochure: "Brochure",
  documentation: "Documentation",
  communique: "Communiqué",
  autre: "Document",
};

const RIGHTS_LABELS: Record<DocumentNotice["rights"], string> = {
  "lien-seul": "Lien vers la source officielle",
  "rediffusion-autorisee": "Rediffusion autorisée",
  "rediffusion-accordee": "Rediffusion accordée",
};

export async function generateMetadata({ params }: DocumentPageProps): Promise<Metadata> {
  const { id } = await params;
  const doc = getDocument(`doc.${id}`);
  if (!doc) {
    return {};
  }
  const canonical = `/documents/${id}`;
  return {
    title: doc.title,
    description: doc.summary,
    alternates: { canonical },
    openGraph: { type: "article", title: doc.title, description: doc.summary, url: canonical },
    robots: doc.status === "publie" ? undefined : { index: false, follow: false },
  };
}

/** Notice de document public : consultation sur site (ch. 8 §10). */
export default async function DocumentPage({ params }: DocumentPageProps) {
  const { id } = await params;
  const doc = getDocument(`doc.${id}`);
  if (!doc) {
    notFound();
  }

  const relatedFiches: RelationItem[] = getFichesForDocument(doc.id).map((fiche) => ({
    label: fiche.title,
    href: getFicheHref(fiche),
  }));

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <SiteBreadcrumb
          items={[{ label: "Accueil", href: "/" }, { label: "Documents" }, { label: doc.title }]}
        />
      </div>
      <NoticeDocument
        title={doc.title}
        issuer={doc.issuer}
        publishedAt={doc.publishedAt}
        kindLabel={KIND_LABELS[doc.kind]}
        summary={doc.summary}
        officialUrl={doc.officialUrl}
        rightsLabel={RIGHTS_LABELS[doc.rights]}
        relatedFiches={relatedFiches}
      />
    </main>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { NoticeDocument } from "@/components/content/notice-document";

export const metadata: Metadata = {
  title: "Notice de document — démonstration",
  robots: { index: false, follow: false },
};

/**
 * Prévisualisation de la notice de document (ch. 8 §3, §10) avec des données
 * EXPLICITEMENT FICTIVES. Le document se consulte sur le site ; le
 * téléchargement ne s'affiche que lorsqu'un droit de rediffusion est établi.
 */
export default function DocumentPreviewPage() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SHOW_DESIGN_SYSTEM !== "1") {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <Alert>
        <AlertTitle>Notice de document — démonstration</AlertTitle>
        <AlertDescription>
          Données fictives. Cette page valide le composant de notice avant la production de vrais
          documents.
        </AlertDescription>
      </Alert>

      <NoticeDocument
        title="Document de démonstration"
        issuer="Organisme émetteur (démo)"
        publishedAt="2026-01-15"
        kindLabel="Brochure"
        summary="Résumé de démonstration décrivant le contenu du document, sa portée et son intérêt pour la préparation. La notice permet de comprendre le document sans quitter la plateforme."
        officialUrl="https://example.org/document-demo"
        rightsLabel="Lien vers la source officielle"
        relatedFiches={[{ label: "Fiche associée (démo)", href: "#" }]}
      />
    </main>
  );
}

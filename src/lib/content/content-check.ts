import type { DocumentNotice, FicheFile, Question } from "./content-schemas";
import { isReviewOverdue } from "./freshness";

/**
 * Contrôle qualité éditorial (ch. 8 §11). Fonction PURE : à partir du
 * contenu chargé, elle produit un rapport d'anomalies séparant les
 * ERREURS bloquantes (une fiche ne doit pas être publiée ainsi) des
 * AVERTISSEMENTS (à traiter, sans bloquer). Le chargement lui-même valide
 * déjà les schémas et l'intégrité du graphe ; ce contrôle ajoute les règles
 * éditoriales transverses et la couverture pédagogique.
 */

export interface ContentIssue {
  level: "error" | "warning";
  /** Code stable (regroupement, tri). */
  code: string;
  /** ID du contenu concerné. */
  id: string;
  message: string;
}

export interface ContentReport {
  errors: ContentIssue[];
  warnings: ContentIssue[];
  checked: { fiches: number; documents: number; questions: number };
}

export interface ContentCheckInput {
  fiches: FicheFile[];
  documents: DocumentNotice[];
  questions: Question[];
  today: Date;
}

/** Statuts servis en production : ce sont eux qui doivent être irréprochables. */
const PUBLISHED_STATUSES = new Set(["publie", "a-mettre-a-jour"]);

export function runContentCheck(input: ContentCheckInput): ContentReport {
  const { fiches, documents, questions, today } = input;
  const errors: ContentIssue[] = [];
  const warnings: ContentIssue[] = [];

  const documentIds = new Set(documents.map((doc) => doc.id));
  const evaluatedFicheIds = new Set(questions.flatMap((q) => q.evaluates));

  for (const fiche of fiches) {
    for (const docId of fiche.relations.documents ?? []) {
      if (!documentIds.has(docId)) {
        errors.push({
          level: "error",
          code: "document-manquant",
          id: fiche.id,
          message: `Document associé inexistant : ${docId}.`,
        });
      }
    }

    if (new Date(fiche.verifiedAt) > today) {
      errors.push({
        level: "error",
        code: "verification-future",
        id: fiche.id,
        message: `Date de vérification dans le futur (${fiche.verifiedAt}).`,
      });
    }

    if (PUBLISHED_STATUSES.has(fiche.status)) {
      if (isReviewOverdue(fiche, today)) {
        warnings.push({
          level: "warning",
          code: "fraicheur-depassee",
          id: fiche.id,
          message: `Fraîcheur dépassée — à re-vérifier (dernière vérification le ${fiche.verifiedAt}).`,
        });
      }
      if (!evaluatedFicheIds.has(fiche.id)) {
        warnings.push({
          level: "warning",
          code: "sans-quiz",
          id: fiche.id,
          message: "Fiche publiée sans aucune question d'entraînement associée.",
        });
      }
    }
  }

  for (const doc of documents) {
    if (PUBLISHED_STATUSES.has(doc.status) && doc.rights !== "lien-seul" && !doc.storagePath) {
      warnings.push({
        level: "warning",
        code: "document-sans-binaire",
        id: doc.id,
        message:
          "Document rediffusable sans binaire en Storage : la consultation sur site est incomplète.",
      });
    }
  }

  return {
    errors,
    warnings,
    checked: { fiches: fiches.length, documents: documents.length, questions: questions.length },
  };
}

/** Rapport lisible (une ligne par anomalie), pour l'affichage terminal. */
export function formatContentReport(report: ContentReport): string {
  const lines: string[] = [];
  const { fiches, documents, questions } = report.checked;
  lines.push(
    `Contrôle éditorial : ${fiches} fiche(s), ${documents} document(s), ${questions} question(s).`
  );
  for (const issue of [...report.errors, ...report.warnings]) {
    const mark = issue.level === "error" ? "✗ ERREUR" : "• attention";
    lines.push(`  ${mark} [${issue.code}] ${issue.id} — ${issue.message}`);
  }
  if (report.errors.length === 0 && report.warnings.length === 0) {
    lines.push("  Aucune anomalie.");
  } else {
    lines.push(`  ${report.errors.length} erreur(s), ${report.warnings.length} avertissement(s).`);
  }
  return lines.join("\n");
}

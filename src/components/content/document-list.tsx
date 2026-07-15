import { FileTextIcon } from "lucide-react";
import Link from "next/link";
import type { DocumentItem } from "./types";

interface DocumentListProps {
  documents: DocumentItem[];
}

/** Documents associés et téléchargeables, avec type et poids affichés. */
export function DocumentList({ documents }: DocumentListProps) {
  if (documents.length === 0) {
    return null;
  }

  return (
    <section id="documents" aria-labelledby="documents-titre" className="scroll-mt-20 space-y-3">
      <h2 id="documents-titre" className="text-2xl font-semibold tracking-tight">
        Documents associés
      </h2>
      <ul className="space-y-2">
        {documents.map((doc) => (
          <li key={doc.href}>
            <Link
              href={doc.href}
              className="hover:border-primary/40 flex items-center gap-3 rounded-lg border p-3 transition-colors"
            >
              <FileTextIcon aria-hidden className="text-muted-foreground size-5 shrink-0" />
              <span className="min-w-0">
                <span className="block truncate font-medium">{doc.title}</span>
                <span className="text-muted-foreground text-sm">
                  {doc.kindLabel}
                  {doc.sizeLabel ? ` · ${doc.sizeLabel}` : ""}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

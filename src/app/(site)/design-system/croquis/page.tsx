import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { CROQUIS_SOUS_CONTRAT } from "@/lib/content/croquis-garde";

export const metadata: Metadata = {
  title: "Banc de rendu des croquis scientifiques",
  robots: { index: false, follow: false },
};

/**
 * Banc de rendu des croquis sous contrat — lot C2.
 *
 * ── Pourquoi une page dédiée plutôt que la fiche réelle ─────────────────
 * Parce qu'une fiche apporte sa colonne, sa barre latérale, son en-tête photo
 * et sa largeur propre. Mesurer un croquis à travers tout cela mesure la
 * fiche autant que le dessin, et la moindre évolution de gabarit fausse la
 * comparaison. Ici, le croquis est seul dans un conteneur de largeur connue :
 * ce qu'on mesure est le croquis.
 *
 * Ce banc **ne remplace pas** le contrôle sur la fiche réelle — il le précède.
 * Un croquis lisible ici et illisible en page reste illisible.
 *
 * ── Ce qu'il rend ────────────────────────────────────────────────────────
 * Exactement les croquis du registre `CROQUIS_SOUS_CONTRAT`, ni plus ni moins.
 * Il ne balaie pas `content/schemas/` : un banc qui afficherait les cent six
 * fichiers laisserait croire que les cent six sont sous contrat.
 */

const SCHEMAS = path.join(process.cwd(), "content", "schemas");

export default function BancCroquisPage() {
  const croquis = CROQUIS_SOUS_CONTRAT.map((schemaId) => ({
    schemaId,
    svg: fs.readFileSync(path.join(SCHEMAS, `${schemaId}.svg`), "utf-8"),
  }));

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Banc de rendu des croquis scientifiques</h1>
        <p className="text-muted-foreground text-sm">
          Les croquis passés sous contrat en C2, rendus seuls, pour la mesure de lisibilité à
          390&nbsp;px et la revue des deux thèmes. Page interne, non indexée.
        </p>
      </header>

      {croquis.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
          Aucun croquis n’est encore sous contrat. La garde et le banc précèdent les pilotes ;
          chacun s’inscrira ici avec son propre commit.
        </p>
      ) : null}

      {croquis.map(({ schemaId, svg }) => (
        <section key={schemaId} className="space-y-2" data-croquis={schemaId}>
          <h2 className="font-mono text-sm">{schemaId}</h2>
          <div className="bg-card rounded-lg border p-4">
            <div
              className="text-foreground mx-auto w-full [&_svg]:h-auto [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </section>
      ))}
    </div>
  );
}

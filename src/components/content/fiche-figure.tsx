import fs from "node:fs";
import path from "node:path";
import type { FicheFigure as FicheFigureData } from "@/lib/content/content-schemas";

const SCHEMAS_DIR = path.join(process.cwd(), "content", "schemas");

/**
 * Schéma pédagogique d'une fiche (docs/editorial/processus-production.md).
 * Le SVG original (content/schemas/) est inséré EN LIGNE : ses traits
 * héritent de `currentColor` et s'adaptent donc au thème clair/sombre.
 * Composant serveur (lecture disque au build).
 */
export function FicheFigure({ schemaId, alt, caption, width, height }: FicheFigureData) {
  const svg = fs.readFileSync(path.join(SCHEMAS_DIR, `${schemaId}.svg`), "utf-8");
  return (
    <figure className="my-6 space-y-2">
      <div className="bg-card rounded-lg border p-4">
        <div
          role="img"
          aria-label={alt}
          className="text-foreground mx-auto w-full [&_svg]:h-full [&_svg]:w-full"
          style={{ aspectRatio: `${width} / ${height}`, maxWidth: `${width}px` }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      </div>
      {caption ? (
        <figcaption className="text-muted-foreground text-sm">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

import fs from "node:fs";
import path from "node:path";
import type { FicheFigure as FicheFigureData } from "@/lib/content/content-schemas";
import { cn } from "@/lib/utils";

// Charte des croquis techniques. Portée `.croquis` : un schéma qui ne porte
// pas la classe reste rendu exactement comme avant.
import "@/styles/croquis.css";

const SCHEMAS_DIR = path.join(process.cwd(), "content", "schemas");

/**
 * Schéma pédagogique d'une fiche (docs/editorial/processus-production.md).
 * Le SVG original (content/schemas/) est inséré EN LIGNE : ses traits
 * héritent de `currentColor` et s'adaptent donc au thème clair/sombre.
 * Composant serveur (lecture disque au build).
 *
 * ── Charte commune, adoption fichier par fichier ────────────────────────
 * Les schémas historiques embarquent chacun leur propre bloc `<style>` avec
 * des couleurs en dur — mesurées sous le seuil : `#94a3b8` à 2,56:1 sur
 * fond clair, `#3b82f6` à 3,68:1 alors qu'il porte du texte. Un schéma qui
 * abandonne son bloc local hérite de `croquis.css`, où la correction est
 * faite une seule fois au lieu de cent six.
 *
 * L'adoption se déclare dans le fichier lui-même, par `data-charte="croquis"`
 * sur la racine : rien à déclarer dans le contenu, et aucune bascule à
 * maintenir ailleurs.
 */
export function FicheFigure({ schemaId, alt, caption, legende, width, height }: FicheFigureData) {
  const svg = fs.readFileSync(path.join(SCHEMAS_DIR, `${schemaId}.svg`), "utf-8");
  /*
    L'adhésion est DÉCLARÉE par le fichier, pas devinée.

    La première version inférait « pas de feuille locale, donc sur charte »
    par recherche de sous-chaîne. Le commentaire du schéma pilote, qui
    expliquait précisément l'absence de bloc de style en le nommant,
    suffisait à faire échouer la détection — et le croquis se rendait sans
    charte, en silence. Un attribut sur la racine ne peut pas être ambigu.
  */
  const surCharte = /<svg[^>]*\sdata-charte="croquis"/.test(svg);

  return (
    <figure className="my-6 space-y-2">
      <div className="bg-card rounded-lg border p-4">
        <div
          role="img"
          aria-label={alt}
          className={cn(
            "text-foreground mx-auto w-full [&_svg]:h-full [&_svg]:w-full",
            surCharte && "croquis"
          )}
          style={{ aspectRatio: `${width} / ${height}`, maxWidth: `${width}px` }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />

        {/*
          Légende structurée — direction B.

          Ce que le dessin ne doit PAS graver : les intitulés longs et les
          formules. En HTML, ils se sélectionnent, se traduisent, se lisent à
          la taille de police du lecteur et suivent le zoom texte, ce qu'un
          `font-size` en pixels dans un SVG mis à l'échelle ne fait jamais.
        */}
        {legende && legende.length > 0 ? (
          <dl className="mx-auto mt-4 grid max-w-prose grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
            {legende.map((entree) => (
              <div key={entree.repere} className="col-span-2 grid grid-cols-subgrid">
                <dt className="text-foreground font-semibold">{entree.repere}</dt>
                <dd className="text-muted-foreground">{entree.texte}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
      {caption ? (
        <figcaption className="text-muted-foreground text-sm">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

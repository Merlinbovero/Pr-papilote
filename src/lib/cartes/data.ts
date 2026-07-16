import fs from "node:fs";
import path from "node:path";
import { getFicheById, getFicheHref } from "@/lib/content/fiches";
import { project } from "./geo";
import { implantationsFileSchema, type Implantation, type ImplantationView } from "./schema";

/**
 * Chargeur des implantations (content/_referentiels/implantations.json) —
 * serveur uniquement. Valide le référentiel ET l'existence des fiches
 * liées : un lien mort fait échouer le build, comme partout ailleurs.
 */

let cache: Implantation[] | undefined;

export function getImplantations(): Implantation[] {
  if (!cache) {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "content", "_referentiels", "implantations.json"),
      "utf-8"
    );
    const parsed = implantationsFileSchema.parse(JSON.parse(raw));
    const slugs = new Set(parsed.implantations.map((i) => i.slug));
    if (slugs.size !== parsed.implantations.length) {
      throw new Error("Référentiel implantations : slugs en double");
    }
    for (const implantation of parsed.implantations) {
      for (const id of [implantation.ficheId, ...implantation.liens].filter(Boolean)) {
        if (!getFicheById(id!)) {
          throw new Error(
            `Référentiel implantations : « ${implantation.slug} » référence une fiche inconnue (${id})`
          );
        }
      }
    }
    cache = parsed.implantations;
  }
  return cache;
}

/** Implantations d'une armée, enrichies des liens résolus (libellé + href). */
export function getImplantationViews(armee: Implantation["armee"]): ImplantationView[] {
  return getImplantations()
    .filter((implantation) => implantation.armee === armee)
    .map((implantation) => {
      const fiche = implantation.ficheId ? getFicheById(implantation.ficheId) : undefined;
      const { x, y } = project(implantation.lat, implantation.lon);
      return {
        ...implantation,
        ficheHref: fiche ? getFicheHref(fiche) : undefined,
        image: fiche?.image
          ? { src: fiche.image.src, alt: fiche.image.alt, focal: fiche.image.focal }
          : undefined,
        liensResolus: implantation.liens.flatMap((id) => {
          const linked = getFicheById(id);
          return linked ? [{ label: linked.title, href: getFicheHref(linked) }] : [];
        }),
        x,
        y,
      };
    });
}

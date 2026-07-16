import { DataGrid, type DataGridItem } from "@/components/content/data-grid";
import type { AircraftSpecs } from "@/lib/content/content-schemas";

/** Libellés français des caractéristiques, dans l'ordre d'affichage. */
const SPEC_LABELS: { key: keyof AircraftSpecs; label: string }[] = [
  { key: "crew", label: "Équipage" },
  { key: "length", label: "Longueur" },
  { key: "wingspan", label: "Envergure" },
  { key: "rotorDiameter", label: "Diamètre rotor principal" },
  { key: "height", label: "Hauteur" },
  { key: "emptyWeight", label: "Masse à vide" },
  { key: "maxTakeoffWeight", label: "Masse max. au décollage" },
  { key: "powerplant", label: "Motorisation" },
  { key: "maxSpeed", label: "Vitesse max." },
  { key: "ceiling", label: "Plafond" },
  { key: "range", label: "Rayon d'action / distance franchissable" },
  { key: "armament", label: "Armement / charge utile" },
];

/**
 * Bloc « Caractéristiques techniques » d'une fiche d'aéronef (gabarit
 * Appareils, F2). N'affiche que les champs renseignés — jamais de valeur
 * inventée ; les chiffres sont couverts par les sources de la fiche.
 */
export function AircraftSpecsBlock({ specs }: { specs: AircraftSpecs }) {
  const items: DataGridItem[] = SPEC_LABELS.flatMap(({ key, label }) => {
    const value = specs[key];
    return value ? [{ label, value }] : [];
  });
  if (items.length === 0) {
    return null;
  }
  return (
    <section aria-labelledby="specs-titre" className="scroll-mt-20 space-y-3">
      <h2 id="specs-titre" className="text-2xl font-semibold tracking-tight">
        Caractéristiques techniques
      </h2>
      <DataGrid items={items} />
      <p className="text-muted-foreground text-xs">
        Valeurs indicatives — voir les sources de la fiche.
      </p>
    </section>
  );
}

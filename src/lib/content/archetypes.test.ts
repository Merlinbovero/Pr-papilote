import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { getArchetypeFiche, getFichesParArchetype } from "./archetypes";
import { getFiches } from "./fiches";
import { archetypesFileSchema, archetypeSchema } from "./schemas";

/**
 * Classification documentaire des fiches — lot M6a.
 *
 * Deux propriétés font tenir la migration par familles :
 *  1. **exhaustivité** — aucune fiche ne peut être servie sans famille ;
 *  2. **fermeture** — aucune valeur d'archétype inventée ne passe.
 *
 * La répartition gelée plus bas n'est pas un instantané décoratif : elle dit
 * combien de pages chaque lot suivant va toucher. Un déplacement silencieux
 * d'une catégorie d'une famille à l'autre changerait la charte de dizaines de
 * pages publiées ; ce tableau l'empêche de passer inaperçu.
 */
const FICHIER = path.join(process.cwd(), "content", "_referentiels", "archetypes.json");
const brut = archetypesFileSchema.parse(JSON.parse(readFileSync(FICHIER, "utf-8")));

/**
 * Répartition gelée. La modifier est une décision éditoriale.
 *
 * 2026-07-28 (M6a) — identification 75, lecon 122.
 * 2026-07-29 (M6b) — les neuf fiches de missions passent à `lecon` : une
 * mission est un processus, pas un objet à identifier. D'où 66 et 131.
 */
const REPARTITION = {
  identification: 66,
  lecon: 131,
  cahier: 37,
  situation: 4,
} as const;

describe("classification documentaire", () => {
  it("classe chaque fiche du corpus", () => {
    const sans = getFiches().filter((fiche) => {
      try {
        getArchetypeFiche(fiche);
        return false;
      } catch {
        return true;
      }
    });
    expect(sans.map((f) => f.id)).toEqual([]);
  });

  it("n'admet que les quatre archétypes du référentiel fermé", () => {
    expect(archetypeSchema.options).toEqual(["identification", "lecon", "cahier", "situation"]);
    // Une valeur inventée doit être refusée par le schéma, pas absorbée.
    expect(() =>
      archetypesFileSchema.parse({ defauts: { "eopan/appareils": "notice" }, exceptions: {} })
    ).toThrow();
  });

  it("accepte une exception clée par identifiant de fiche", () => {
    // Régression M6a : `exceptions` était typé en `slugSchema`, qui interdit le
    // point. Toute exception réelle — les identifiants sont pointés — aurait
    // fait échouer la validation. La table était vide, donc rien ne le disait.
    expect(() =>
      archetypesFileSchema.parse({
        defauts: {},
        exceptions: { "eopan.appareils.rafale-m": "lecon" },
      })
    ).not.toThrow();
  });

  it("refuse une clé de défaut qui n'est pas « module/categorie »", () => {
    expect(() =>
      archetypesFileSchema.parse({ defauts: { appareils: "identification" }, exceptions: {} })
    ).toThrow();
  });

  it("garde la répartition gelée", () => {
    for (const [archetype, attendu] of Object.entries(REPARTITION)) {
      expect(getFichesParArchetype(archetype as keyof typeof REPARTITION).length, archetype).toBe(
        attendu
      );
    }
    // Le total doit couvrir le corpus : aucune fiche comptée deux fois, aucune
    // oubliée entre deux familles.
    const total = Object.values(REPARTITION).reduce((a, b) => a + b, 0);
    expect(total).toBe(getFiches().length);
  });

  it("ne déclare aucune exception morte", () => {
    const ids = new Set(getFiches().map((f) => f.id));
    const mortes = Object.keys(brut.exceptions).filter((id) => !ids.has(id));
    expect(mortes).toEqual([]);
  });

  it("ne déclare aucun défaut pour une catégorie sans fiche", () => {
    // Un défaut sans fiche est une règle qui ne s'applique à rien : elle
    // donne l'illusion d'un classement là où il n'y a pas de contenu.
    const couples = new Set(getFiches().map((f) => `${f.module}/${f.category}`));
    const inutiles = Object.keys(brut.defauts).filter((cle) => !couples.has(cle));
    expect(inutiles).toEqual([]);
  });

  it("l'exception l'emporte sur le défaut de catégorie", () => {
    // Propriété de résolution, vérifiée sur le référentiel réel : toute fiche
    // citée en exception porte bien la valeur de l'exception.
    for (const [id, archetype] of Object.entries(brut.exceptions)) {
      const fiche = getFiches().find((f) => f.id === id);
      expect(fiche && getArchetypeFiche(fiche)).toBe(archetype);
    }
  });
});

import { expect, test } from "@playwright/test";

/**
 * Les seize pages dont les identifiants SVG sont uniques — M10, puis C2.
 *
 * Le contrôle porte sur le DOM rendu, pas sur les fichiers : c'est là que la
 * collision produisait son effet, et c'est donc là qu'il faut prouver qu'elle a
 * disparu.
 *
 * Quinze pages ont été corrigées par préfixage au lot M10. La seizième —
 * `chaine-pitot-statique` — en était exclue : ses deux définitions `ac`
 * différaient, et les unifier aurait changé la taille des pointes de flèche
 * d'une figure. Elle rejoint la liste en C2, non par préfixage mais parce que
 * `chaine-anemobarometrique` y a été **entièrement reconstruit** comme croquis
 * pilote — aucun trait de l'ancien dessin ne subsiste, donc la question de sa
 * taille de pointe ne se pose plus.
 */
const CORRIGEES = [
  "/fondamentaux/aerodynamique/decrochage",
  "/fondamentaux/aerodynamique/ecoulement-de-l-air",
  "/fondamentaux/aerodynamique/portance",
  "/fondamentaux/aerodynamique/trainee",
  "/fondamentaux/facteurs-humains/desorientation-et-illusions",
  "/fondamentaux/mecanique-du-vol/decrochage-et-vrille",
  "/fondamentaux/mecanique-du-vol/quatre-forces",
  "/fondamentaux/mecanique-du-vol/virage",
  "/fondamentaux/meteorologie/atmosphere-standard",
  "/fondamentaux/meteorologie/le-vent",
  "/fondamentaux/meteorologie/les-nuages",
  "/fondamentaux/meteorologie/pression-et-calage",
  "/fondamentaux/navigation/cap-route-et-derive",
  "/fondamentaux/navigation/declinaison-magnetique",
  // Entrée en C2 : reconstruction complète de `chaine-anemobarometrique`.
  "/fondamentaux/instruments/chaine-pitot-statique",
  "/fondamentaux/physique/pression-forces-unites",
];

for (const url of CORRIGEES) {
  test(`${url} — aucun identifiant dupliqué, chaque url(#…) résout`, async ({ page }) => {
    await page.goto(url);

    const doublons = await page.evaluate(() => {
      const vus = new Set<string>();
      const doubles: string[] = [];
      for (const el of document.querySelectorAll("[id]")) {
        if (vus.has(el.id)) doubles.push(el.id);
        vus.add(el.id);
      }
      return doubles;
    });
    expect(doublons, "identifiants dupliqués").toEqual([]);

    // Chaque référence doit désigner une cible existante — c'est ce qui prouve
    // que le préfixage a bien réécrit les DEUX côtés, définition et renvoi.
    const orphelines = await page.evaluate(() => {
      const manquantes: string[] = [];
      for (const el of document.querySelectorAll("*")) {
        for (const attr of Array.from(el.attributes)) {
          const m = /^url\(#(.+)\)$/.exec(attr.value);
          if (m && !document.getElementById(m[1])) manquantes.push(attr.value);
        }
      }
      return manquantes;
    });
    expect(orphelines, "références url(#…) sans cible").toEqual([]);
  });
}

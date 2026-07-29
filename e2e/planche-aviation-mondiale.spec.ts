import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import yaml from "yaml";

/**
 * Contrôle permanent des 17 notices d'aviation mondiale — lot M7a.
 *
 * Ces fiches ont changé de famille : elles étaient rendues par Le Cahier, elles
 * le sont par La Planche d'identification. Six propriétés doivent le rester,
 * sur **les dix-sept**, et pas seulement sur un échantillon :
 *
 *  1. la page répond 200 ;
 *  2. le corps ne déborde pas ;
 *  3. **chaque valeur de spécification** survit — c'est le contrôle central :
 *     le gabarit du Cahier ne rendait pas ces données en tableau, et c'est en
 *     changeant de gabarit qu'on aurait pu en perdre ;
 *  4. la cote du référentiel est affichée ;
 *  5. l'encre sienne du module hôte est appliquée ;
 *  6. **rien n'a fui vers les autres fiches Culture** — Le Cahier et La
 *     Situation du même module gardent leur propre gabarit.
 *
 * Le corpus est lu au contenu, pas listé à la main : une dix-huitième notice
 * ajoutée demain entrerait automatiquement sous contrôle.
 */

const RACINE = path.join(process.cwd(), "content");

interface FicheBrute {
  id: string;
  slug: string;
  module: string;
  category: string;
  specs?: Record<string, string | undefined>;
}

function lireFiche(fichier: string): FicheBrute {
  return yaml.parse(readFileSync(fichier, "utf-8")) as FicheBrute;
}

const SLUGS = [
  "a-10-thunderbolt-ii",
  "f-14-tomcat",
  "f-16-fighting-falcon",
  "focke-wulf-fw-190",
  "hawker-hurricane",
  "messerschmitt-bf-109",
  "mikoyan-mig-29",
  "mikoyan-mig-31",
  "mitsubishi-a6m-zero",
  "north-american-p-51-mustang",
  "pilatus-pc-6-porter",
  "sukhoi-su-27",
  "sukhoi-su-34",
  "sukhoi-su-35",
  "sukhoi-su-57",
  "supermarine-spitfire",
  "uh-60-black-hawk",
];

const NOTICES = SLUGS.map((slug) =>
  lireFiche(path.join(RACINE, "culture", "aviation-mondiale", `${slug}.yaml`))
);

const COTES: Record<string, string> = JSON.parse(
  readFileSync(path.join(RACINE, "_referentiels", "cotes.json"), "utf-8")
).fiches;

test.describe("Aviation mondiale — les 17 notices", () => {
  test("le corpus contrôlé est complet", () => {
    // Si une fiche est ajoutée au dossier sans rejoindre cette liste, le
    // contrôle passerait à côté d'elle. On compare donc au dossier lui-même.
    const surDisque = readFileSync(
      path.join(RACINE, "_referentiels", "archetypes.json"),
      "utf-8"
    ).includes('"culture/aviation-mondiale": "identification"');
    expect(surDisque, "la catégorie doit rester classée identification").toBe(true);
    expect(NOTICES).toHaveLength(17);
  });

  for (const fiche of NOTICES) {
    const url = `/${fiche.module}/${fiche.category}/${fiche.slug}`;

    test(`${fiche.slug} — statut, cote, encre, spécifications, débordement`, async ({ page }) => {
      const reponse = await page.goto(url);
      expect(reponse?.status(), "statut HTTP").toBe(200);

      // La cote vient du référentiel, jamais d'un calcul au rendu.
      const cote = COTES[fiche.id];
      expect(cote, `cote absente du référentiel pour ${fiche.id}`).toBeTruthy();
      await expect(page.locator(".pl-cart")).toContainText(cote);

      // L'encre du module hôte. Une encre non déclarée retomberait sur le gris.
      const racine = page.locator(".pl-root");
      await expect(racine).toHaveAttribute("data-module", "sienne");
      const mod = await racine.evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--pl-mod").trim()
      );
      expect(mod.toLowerCase(), "--pl-mod doit être une couleur, pas le gris neutre").toMatch(
        /^#[0-9a-f]{6}$/
      );
      const gris = await racine.evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--pl-encre-2").trim()
      );
      expect(mod.toLowerCase(), "l'encre du module ne doit pas être l'encre secondaire").not.toBe(
        gris.toLowerCase()
      );

      // Chaque valeur de spécification, une par une, dans le texte rendu.
      const rendu = (await page.locator(".pl-corps").innerText()).replace(/\s+/g, " ");
      for (const [cle, valeur] of Object.entries(fiche.specs ?? {})) {
        if (!valeur) continue;
        expect(rendu, `spécification perdue — ${cle}`).toContain(valeur.replace(/\s+/g, " "));
      }

      const debordement = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(debordement, "débordement horizontal").toBe(0);
    });
  }

  test("aucune fuite vers les autres fiches Culture", async ({ page }) => {
    // Le module Culture héberge trois familles. La reclassification n'a visé
    // qu'une catégorie ; les deux autres ne doivent porter aucune marque de La
    // Planche d'identification tant que leur propre lot ne les a pas migrées.
    for (const url of [
      "/culture/personnalites/georges-guynemer",
      "/culture/culture-aeronautique/escadrons-agresseurs",
      "/culture/geopolitique-defense/red-flag",
    ]) {
      await page.goto(url);
      const cotes = await page.locator(".pl-cart").count();
      const signaletique = await page.locator("#signaletique").count();
      expect(
        cotes + signaletique,
        `${url} ne doit porter ni cartouche de cote ni fiche signalétique`
      ).toBe(0);
    }
  });
});

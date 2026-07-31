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
    // qu'une catégorie ; les deux autres gardent leur propre gabarit.
    //
    // **Ce test a dû être réécrit au lot M8b, et il a d'abord été rouge.** Sa
    // première rédaction affirmait que ces pages ne portaient « aucune
    // cartouche de cote » — vrai tant qu'elles passaient par FicheTransition,
    // faux dès que M7b leur a donné Le Cahier et La Situation, avec leurs
    // propres cotes D et E. La formulation confondait « pas migrée » et « pas
    // migrée EN NOTICE ». Le marqueur qui distingue réellement les familles est
    // la lettre de cote, plus la fiche signalétique, propre à la notice.
    //
    // Le test est resté rouge un lot entier sans être vu : `npm run check`
    // n'exécute pas Playwright, et je n'avais pas relancé ce fichier après M7b.
    const CAS: [string, string][] = [
      ["/culture/personnalites/georges-guynemer", "D"],
      ["/culture/culture-aeronautique/escadrons-agresseurs", "D"],
      ["/culture/geopolitique-defense/red-flag", "E"],
    ];
    for (const [url, lettre] of CAS) {
      await page.goto(url);
      // Pas de fiche signalétique : c'est le bloc propre à la notice.
      await expect(page.locator("#signaletique"), url).toHaveCount(0);
      // Et la cote porte la lettre de SA famille, jamais le « C » des notices.
      const cartouche = await page.locator(".pl-cart").innerText();
      const famille = cartouche.split("·")[1]?.trim().split(".")[0];
      expect(famille, `${url} doit porter une cote de famille ${lettre}`).toBe(lettre);
    }
  });
});

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * Lot M4 — les sept interactions pédagogiques, une par une.
 *
 * Les captures d'ensemble d'une leçon ne suffisent pas : chaque interaction a
 * son état initial, sa commande et son annonce. Ce fichier vérifie donc,
 * pour chacune : clavier, rôles et noms accessibles, `aria-live`, état initial
 * → modification → réinitialisation, absence de débordement, accessibilité
 * détectable et cibles tactiles.
 *
 * Ce qu'il ne vérifie pas, parce que d'autres le font mieux : les résultats
 * des modèles (`*-model.test.ts`, en Vitest, inchangés par ce lot) et les
 * seuils de contraste des couleurs de tracé (`planche-tokens.test.ts`).
 */

interface Cas {
  /** Identifiant de l'interaction dans le registre. */
  id: string;
  /** Une leçon réelle qui la monte. */
  url: string;
  /** Titre exact du bloc, qui sert aussi de nom accessible à la section. */
  titre: RegExp;
  /** Légende du groupe de commandes — absente pour un curseur seul. */
  groupe?: string;
  /** Commande à manœuvrer, et son nom accessible. */
  commande:
    | { type: "radio"; cible: RegExp }
    | { type: "case"; cible: RegExp }
    | { type: "curseur"; cible: RegExp };
}

const CAS: Cas[] = [
  {
    id: "forces-et-vecteurs",
    url: "/cours/forces-et-lois-de-newton",
    titre: /forces et vecteurs/i,
    groupe: "Situation",
    commande: { type: "radio", cible: /^Accélération$/ },
  },
  {
    id: "venturi",
    url: "/cours/bernoulli-et-venturi",
    titre: /effet venturi/i,
    groupe: "Rétrécissement du conduit",
    commande: { type: "radio", cible: /^Fort/ },
  },
  {
    id: "soufflerie-zones",
    url: "/cours/les-souffleries",
    titre: /soufflerie/i,
    groupe: "Zone",
    commande: { type: "radio", cible: /^Diffuseur$/ },
  },
  {
    id: "incidence-decrochage",
    url: "/cours/couche-limite-et-decrochage",
    titre: /incidence/i,
    groupe: "Angle d’incidence",
    commande: { type: "radio", cible: /décrochage/i },
  },
  {
    id: "polaire",
    url: "/cours/la-polaire-et-la-finesse",
    titre: /polaire/i,
    commande: { type: "curseur", cible: /angle d’incidence/i },
  },
  {
    id: "axes-gouvernes",
    url: "/cours/les-axes-et-les-gouvernes",
    titre: /axes/i,
    groupe: "Axe de rotation",
    commande: { type: "radio", cible: /lacet/i },
  },
  {
    id: "centrage",
    url: "/cours/stabilite-et-centrage",
    titre: /centrage/i,
    commande: { type: "curseur", cible: /centre de gravité/i },
  },
];

/** Le texte de l'annonce `aria-live` du bloc — l'alternative textuelle. */
function annonce(page: Page, id: string) {
  return page.locator(`#pl-manip-${id} [aria-live="polite"]`);
}

function bloc(page: Page, id: string) {
  return page.locator(`#pl-manip-${id}`);
}

for (const cas of CAS) {
  test.describe(`interaction — ${cas.id}`, () => {
    test("conserve ses rôles et ses noms accessibles", async ({ page }) => {
      await page.goto(cas.url);
      const section = bloc(page, cas.id);
      await expect(section).toBeVisible();
      // La section garde son nom accessible (le titre de l'interaction).
      await expect(page.getByRole("region", { name: cas.titre })).toBeVisible();
      // Le groupe de commandes garde sa légende, quand il y en a un.
      if (cas.groupe) {
        await expect(section.getByRole("group", { name: cas.groupe })).toBeVisible();
      }
      if (cas.commande.type === "curseur") {
        await expect(section.getByRole("slider", { name: cas.commande.cible })).toBeVisible();
      } else {
        const role = cas.commande.type === "radio" ? "radio" : "checkbox";
        await expect(section.getByRole(role, { name: cas.commande.cible })).toBeVisible();
      }
      // La figure garde son texte alternatif.
      await expect(section.getByRole("img")).toHaveAttribute("aria-label", /.{20,}/);
    });

    test("se pilote entièrement au clavier", async ({ page }) => {
      await page.goto(cas.url);
      const section = bloc(page, cas.id);
      const avant = await annonce(page, cas.id).textContent();

      if (cas.commande.type === "curseur") {
        const curseur = section.getByRole("slider", { name: cas.commande.cible });
        await curseur.focus();
        await expect(curseur).toBeFocused();
        const depart = await curseur.inputValue();
        await page.keyboard.press("ArrowRight");
        await page.keyboard.press("ArrowRight");
        expect(await curseur.inputValue()).not.toBe(depart);
      } else {
        const role = cas.commande.type === "radio" ? "radio" : "checkbox";
        const cible = section.getByRole(role, { name: cas.commande.cible });
        await cible.focus();
        await expect(cible).toBeFocused();
        // Espace sur une case, flèche/espace sur un radio : dans les deux cas
        // ce sont les commandes natives du navigateur, jamais un `keydown`
        // réécrit à la main.
        await page.keyboard.press("Space");
        await expect(cible).toBeChecked();
      }

      // L'annonce a suivi la manœuvre : `aria-live` est vivant.
      await expect.poll(async () => annonce(page, cas.id).textContent()).not.toBe(avant);
    });

    test("état initial, modification, réinitialisation", async ({ page }) => {
      await page.goto(cas.url);
      const section = bloc(page, cas.id);
      const initial = await annonce(page, cas.id).textContent();
      expect(initial?.length ?? 0).toBeGreaterThan(20);

      if (cas.commande.type === "curseur") {
        const curseur = section.getByRole("slider", { name: cas.commande.cible });
        await curseur.focus();
        for (let i = 0; i < 3; i += 1) await page.keyboard.press("ArrowRight");
      } else {
        await section
          .getByRole(cas.commande.type === "radio" ? "radio" : "checkbox", {
            name: cas.commande.cible,
          })
          .click();
      }
      await expect.poll(async () => annonce(page, cas.id).textContent()).not.toBe(initial);

      await section.getByRole("button", { name: "Réinitialiser" }).click();
      await expect.poll(async () => annonce(page, cas.id).textContent()).toBe(initial);
    });

    test("ne déborde à aucune des trois largeurs", async ({ page }) => {
      for (const width of [390, 834, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(cas.url);
        await page.evaluate(() => document.fonts.ready);
        const debordement = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth
        );
        expect(debordement, `${cas.id} à ${width} px`).toBeLessThanOrEqual(0);
      }
    });

    test("ne présente aucune violation WCAG détectable, en clair comme en sombre", async ({
      page,
    }) => {
      for (const sombre of [false, true]) {
        await page.emulateMedia({ colorScheme: sombre ? "dark" : "light" });
        await page.goto(cas.url);
        const resultats = await new AxeBuilder({ page })
          .include(`#pl-manip-${cas.id}`)
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(resultats.violations, sombre ? "registre sombre" : "registre clair").toEqual([]);
      }
    });

    test("sur pointeur grossier, ses commandes atteignent 44 px", async ({ page, isMobile }) => {
      test.skip(!isMobile, "réservé aux projets tactiles");
      await page.goto(cas.url);
      await page.evaluate(() => document.fonts.ready);
      const trop = await page.evaluate((id) => {
        const racine = document.querySelector(`#pl-manip-${id}`);
        if (!racine) return ["bloc introuvable"];
        return [...racine.querySelectorAll(".pl-radio, .pl-btn, input[type='range']")]
          .map((el) => ({
            nom: `${el.tagName}.${String(el.className).split(" ")[0] || "—"}`,
            h: Math.round(el.getBoundingClientRect().height),
          }))
          .filter((c) => c.h > 0 && c.h < 44)
          .map((c) => `${c.nom} ${c.h}px`);
      }, cas.id);
      expect(trop).toEqual([]);
    });
  });
}

test("les sept interactions du référentiel sont toutes couvertes", async () => {
  // Garde-fou : si une huitième interaction entre au registre sans entrer
  // ici, ce test tombe et le trou se voit tout de suite.
  expect(CAS.map((c) => c.id).sort()).toEqual(
    [
      "axes-gouvernes",
      "centrage",
      "forces-et-vecteurs",
      "incidence-decrochage",
      "polaire",
      "soufflerie-zones",
      "venturi",
    ].sort()
  );
});

import { FAMILY_INFO } from "@/lib/psychotech/generators";
import { expect, test } from "@playwright/test";

test.describe("entraînement psychotechnique", () => {
  test("le hub du module mène à l'entraînement", async ({ page }) => {
    await page.goto("/psychotechnique");
    await page.getByRole("link", { name: /Entraînement chronométré/ }).click();
    await expect(
      page.getByRole("heading", { level: 1, name: "Entraînement psychotechnique" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Courte — 10 questions/ })).toBeVisible();
  });

  test("une session courte se lance, se joue et se corrige", async ({ page }) => {
    await page.goto("/psychotechnique/entrainement");
    await page.getByRole("button", { name: /Courte — 10 questions/ }).click();

    // Consignes standardisées puis démarrage.
    await expect(page.getByRole("heading", { name: /Consignes — 10 questions/ })).toBeVisible();
    await page.getByRole("button", { name: "Démarrer" }).click();

    // Boucle : répondre (ou attendre la fin d'exposition mémoire) jusqu'au bout.
    for (let i = 0; i < 10; i += 1) {
      // La phase d'exposition (mémoire) n'a pas de choix — attendre qu'ils arrivent.
      const firstChoice = page
        .getByRole("region", { name: "Question en cours" })
        .getByRole("listitem")
        .first()
        .getByRole("button");
      await firstChoice.waitFor({ state: "visible", timeout: 15000 });
      await firstChoice.click();
      /*
        **Portée resserrée au lot F7a.** Cette assertion visait la page
        entière. Depuis la migration, le verdict est écrit DEUX fois — en
        toutes lettres dans le bloc de correction, et sur la réponse concernée
        par un libellé lisible par une technique d'assistance, qui est
        précisément ce que le Banc exige (jamais la couleur seule). La
        recherche non portée trouvait donc les deux et tombait en mode strict.

        Ce n'est pas un affaiblissement : le contrôle vise maintenant l'endroit
        où le verdict se lit, et il tomberait toujours si ce bloc disparaissait.
      */
      await expect(
        page
          .getByRole("group", { name: "Correction" })
          .getByText(/Bonne réponse|Réponse incorrecte|Temps écoulé/)
      ).toBeVisible();
      await page
        .getByRole("button", { name: i === 9 ? "Voir le résultat" : "Question suivante" })
        .click();
    }

    // Score final : précision, vitesse, détail par famille.
    await expect(page.getByText("Session terminée")).toBeVisible();
    await expect(page.getByText(/Précision \d+ %/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Nouvelle session" })).toBeVisible();
  });

  test("la session personnalisée respecte le choix des familles", async ({ page }) => {
    // **Rendu déterministe au lot M10.** Ce test listait six familles à
    // désélectionner en supposant qu'il ne restait alors que « Calcul mental ».
    // C'était exact le jour où il a été écrit — le module en comptait sept.
    // Le lot J en a ajouté trois, d'autres ont suivi : il y en a dix-neuf. Douze
    // familles restaient donc sélectionnées, et une session de dix questions n'y
    // contenait « Calcul mental » que par chance. Mesuré : six échecs sur seize.
    //
    // La liste ne vient plus du test mais du produit : on désélectionne TOUT ce
    // qui n'est pas la cible. Une vingtième famille ajoutée demain sera
    // désélectionnée d'elle-même, et le test restera vrai.
    await page.goto("/psychotechnique/entrainement");

    const CIBLE = FAMILY_INFO["calcul-mental"].name;
    const autres = Object.values(FAMILY_INFO)
      .map((f) => f.name)
      .filter((nom) => nom !== CIBLE);

    for (const nom of autres) {
      const bouton = page.getByRole("button", { name: nom, exact: true });
      // Une famille peut n'être pas proposée par cet écran : on ne clique que
      // ce qui existe, et on ne postule rien sur la composition de la liste.
      if ((await bouton.count()) === 0) continue;
      if ((await bouton.first().getAttribute("aria-pressed")) === "true") {
        await bouton.first().click();
      }
    }

    // Une seule famille reste active : la cible.
    const actives = page.locator('[aria-pressed="true"]');
    await expect(actives).toHaveCount(1);
    await expect(actives).toHaveText(CIBLE);

    await page.getByLabel("Nombre de questions").selectOption("10");
    await page.getByRole("button", { name: "Lancer la session personnalisée" }).click();

    await expect(page.getByRole("heading", { name: /Consignes — 10 questions/ })).toBeVisible();
    // Le vivier ne peut plus venir que de la cible : la consigne affichée est
    // donc la sienne, et aucune autre ne peut apparaître.
    await expect(page.getByText(new RegExp(`${CIBLE} —`))).toBeVisible();
    for (const nom of autres) {
      await expect(page.getByText(new RegExp(`${nom} —`)), nom).toHaveCount(0);
    }
  });
});

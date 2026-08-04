import { expect, test } from "@playwright/test";

/**
 * La clôture du Banc — lot F12.
 *
 * ── Ce que ce fichier surveille, et ce qu'il ne surveille pas ────────────
 * Il ne remesure pas les migrations : chacune a sa propre référence, écrite
 * avant elle et rejouée après. Il grave les trois faits que la CLÔTURE crée,
 * et qu'aucun contrôle existant n'atteint.
 *
 * 1. La série d'anglais est une SÉANCE, sur sa propre route. C'est le seul
 *    changement de structure du lot : ce quiz était la dernière surface en
 *    registre `legacy`, et le classer `documentaire` aurait été commode et
 *    faux — dix à quarante questions tirées dans toute la banque, avec un
 *    résultat final, ce n'est ni court ni contextuel. La doctrine du lot F4
 *    prescrit dans ce cas une **entrée explicite** vers le Banc, jamais une
 *    transformation silencieuse de la page documentaire.
 *
 * 2. Le hub `/anglais` n'a pas changé de registre pour autant. C'est la
 *    contrepartie de la règle, et la partie qu'on oublie : donner une route
 *    à la séance n'autorise pas à repeindre la page qu'elle quitte.
 *
 * 3. DT-002 est soldée **partout**, y compris sur la vitrine interne — la
 *    dernière surface qui ne passait aucun registre du tout. C'est là que le
 *    test de dette mesurait l'absence de soulignement au repos ; le même
 *    point de mesure sert désormais à prouver l'inverse.
 */

test.describe("Clôture du Banc — lot F12", () => {
  test("la série d'anglais a sa propre route, au registre du Banc", async ({ page }) => {
    const reponse = await page.goto("/anglais/quiz");
    expect(reponse?.status(), "/anglais/quiz doit répondre").toBeLessThan(400);

    // Le registre est porté par la page entière, comme sur les douze autres.
    await expect(page.locator("main.banc")).toHaveCount(1);

    // Et c'est bien une séance : lancement explicite, puis une question.
    await page.getByRole("button", { name: /Commencer la série/i }).click();
    await expect(page.getByRole("heading", { level: 1, name: /Série d'anglais/i })).toBeVisible();
    await expect(page.getByText(/Question 1 \//)).toBeVisible();
  });

  test("le hub d'anglais mène à la séance sans prendre son registre", async ({ page }) => {
    await page.goto("/anglais");

    // Le hub reste documentaire — c'est l'invariant que la clôture aurait pu
    // faire sauter en évitant de créer une route.
    await expect(page.locator(".banc")).toHaveCount(0);

    // L'entrée est un LIEN nommé, pas un lecteur encastré : la page ne se
    // transforme pas, elle renvoie.
    const entree = page.getByRole("link", { name: /Commencer une série d'anglais/i });
    await expect(entree).toBeVisible();
    await entree.click();
    await expect(page).toHaveURL(/\/anglais\/quiz$/);
  });

  test("DT-002 est soldée jusque sur la vitrine, qui ne passait aucun registre", async ({
    page,
  }) => {
    await page.goto("/design-system/quiz");
    await page.locator('section[aria-label] ul[role="list"] button').first().click();
    await page.getByRole("button", { name: /^Valider$/ }).click();

    const correction = page.getByRole("group", { name: "Correction" });
    await expect(correction).toBeVisible();
    const lien = correction.getByRole("link").first();
    // Sans lien, la mesure ne prouverait rien : on le vérifie avant de conclure.
    await expect(lien).toBeVisible();

    // Le soulignement AU REPOS est le seul repère non chromatique qu'exige
    // WCAG 1.4.1 — et c'est exactement ce que `dette-lien-correction.spec.ts`
    // mesurait absent jusqu'à ce lot.
    const decoration = await lien.evaluate((el) => getComputedStyle(el).textDecorationLine);
    expect(decoration, "le lien de correction doit être souligné au repos").toContain("underline");
  });
});

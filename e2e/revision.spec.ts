import { expect, test } from "@playwright/test";

/**
 * Révision espacée (P2). Vérifie qu'une séance se lance sur un concours choisi,
 * qu'une question apparaît, et qu'une réponse est prise en compte (échéance
 * mémorisée localement par le planificateur de Leitner).
 */

test("une séance de révision se lance et enregistre une réponse", async ({ page }) => {
  await page.goto("/reviser");
  await expect(page.getByRole("heading", { level: 1, name: "Réviser" })).toBeVisible();

  // Choix du concours puis lancement (vivier récupéré à la demande).
  //
  // **`pressed: false` n'est pas décoratif — c'est la correction du lot M10.**
  // Ce test échouait sur chromium et passait sur mobile. Cause exacte : sur
  // desktop, le déclencheur Radix du menu de navigation porte lui aussi le nom
  // accessible « EOPAN » et précède le sélecteur dans le DOM. Le test cliquait
  // donc le menu d'en-tête ; `concours` restait indéfini et « Commencer la
  // révision » restait désactivé jusqu'au délai d'attente. Sur mobile ce
  // déclencheur n'est pas rendu, et le test tombait sur le bon bouton.
  //
  // Le produit n'était pas en cause. La correction consiste à chercher le bouton
  // là où il vit — dans le contenu principal — plutôt que dans toute la page.
  // Un repère de région est stable : l'en-tête pourra changer de composant sans
  // remettre ce test en cause.
  await page.getByRole("main").getByRole("button", { name: "EOPAN", exact: true }).click();
  await page.getByRole("button", { name: /Commencer la révision/i }).click();

  // Une première question de la file du jour s'affiche.
  await expect(page.getByText(/Question 1 \//)).toBeVisible();

  // On répond : la validation révèle la correction (l'échéance est enregistrée).
  await page.locator('ul[role="list"] > li button').first().click();
  await page.getByRole("button", { name: "Valider" }).click();
  // Le verdict VISIBLE, dans le bloc de correction. Depuis le lot F1a, le
  // même texte existe aussi dans la région d'annonce `sr-only` : viser la
  // page entière ferait correspondre deux éléments.
  await expect(
    page.getByRole("group", { name: "Correction" }).getByText(/Bonne réponse|Réponse incorrecte/)
  ).toBeVisible();
});

test("le hub d'un concours renvoie vers la révision espacée", async ({ page }) => {
  await page.goto("/eopn");
  await expect(page.getByRole("link", { name: /Révision espacée/i })).toBeVisible();
});

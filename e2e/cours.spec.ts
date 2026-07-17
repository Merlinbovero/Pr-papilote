import { expect, test } from "@playwright/test";

/**
 * Cours (architecture pédagogique Lot 2B). Vérifie que le cours 1 est
 * consultable, que l'interaction « forces et vecteurs » est utilisable au
 * clavier et dispose d'une alternative textuelle, et que la progression se
 * met en route.
 */

const COURSE = "/cours/forces-et-lois-de-newton";

test("le cours 1 s'affiche avec ses sections clés", async ({ page }) => {
  await page.goto(COURSE);
  await expect(
    page.getByRole("heading", { level: 1, name: /forces et lois de newton/i })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Objectifs" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fiches à étudier" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /essentiel à retenir/i })).toBeVisible();
  // La même fiche est référencée (pas de duplication) et cliquable.
  await expect(page.getByRole("link", { name: /les trois lois de newton/i })).toBeVisible();
});

test("l'interaction forces/vecteurs est utilisable au clavier et décrite", async ({ page }) => {
  await page.goto(COURSE);
  const traction = page.getByRole("checkbox", { name: "Traction" });
  await expect(traction).toBeChecked();
  // Utilisable au clavier : focus + espace pour décocher.
  await traction.focus();
  await page.keyboard.press("Space");
  await expect(traction).not.toBeChecked();
  // Alternative textuelle accessible présente.
  await expect(page.getByText("Description accessible")).toBeVisible();
});

test("la progression démarre (découverte) au chargement", async ({ page }) => {
  await page.goto(COURSE);
  await expect(page.getByText("Ma progression", { exact: true })).toBeVisible();
});

test("le cours 2 (pression et écoulement) compose ses deux fiches sans les dupliquer", async ({
  page,
}) => {
  await page.goto("/cours/pression-et-ecoulement");
  await expect(
    page.getByRole("heading", { level: 1, name: /pression et écoulement/i })
  ).toBeVisible();
  // Les deux fiches canoniques sont référencées (liens), pas recopiées.
  await expect(
    page.getByRole("link", { name: /pression statique, dynamique et totale/i })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /la conservation du débit/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /essentiel à retenir/i })).toBeVisible();
});

test("le cours 3 propose l'interaction Venturi, utilisable au clavier et décrite", async ({
  page,
}) => {
  await page.goto("/cours/bernoulli-et-venturi");
  await expect(
    page.getByRole("heading", { level: 1, name: /théorème de bernoulli et effet venturi/i })
  ).toBeVisible();
  // L'interaction Venturi est présente ; son état par défaut est « Moyen ».
  const fort = page.getByRole("radio", { name: /Fort/ });
  await expect(fort).not.toBeChecked();
  // Utilisable au clavier : focus + flèche/espace pour changer d'option.
  await fort.focus();
  await page.keyboard.press("Space");
  await expect(fort).toBeChecked();
  // Alternative textuelle accessible présente (au moins une occurrence).
  await expect(page.getByText("Description accessible").first()).toBeVisible();
});

test("le cours 4 (souffleries) référence sa fiche et un exercice sur le collecteur", async ({
  page,
}) => {
  await page.goto("/cours/les-souffleries");
  await expect(page.getByRole("heading", { level: 1, name: /les souffleries/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Fiches à étudier" })).toBeVisible();
  // La fiche canonique est référencée (lien, avec son résumé), pas recopiée.
  await expect(
    page.getByRole("link", { name: /les souffleries une soufflerie produit/i })
  ).toBeVisible();
  // Le cours porte bien un quiz (composition standard).
  await expect(page.getByRole("heading", { name: /se tester/i })).toBeVisible();
});

test("le cours 5 (force aérodynamique) compose la fiche neuve et les fiches portance/traînée", async ({
  page,
}) => {
  await page.goto("/cours/la-force-aerodynamique");
  await expect(
    page.getByRole("heading", { level: 1, name: /la force aérodynamique/i })
  ).toBeVisible();
  // La fiche neuve et les deux fiches existantes sont référencées, pas recopiées.
  await expect(
    page.getByRole("link", { name: /la force aérodynamique et ses composantes/i })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /^la portance/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^la traînée/i })).toBeVisible();
});

test("le cours 6 (traînée induite) compose ses fiches neuves et la fiche traînée", async ({
  page,
}) => {
  await page.goto("/cours/trainee-induite-et-allongement");
  await expect(page.getByRole("heading", { level: 1, name: /traînée induite/i })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /la traînée induite et les tourbillons marginaux/i })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /l.allongement et les winglets/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /se tester/i })).toBeVisible();
});

test("le cours 7 propose l'interaction incidence/décrochage, utilisable au clavier", async ({
  page,
}) => {
  await page.goto("/cours/couche-limite-et-decrochage");
  await expect(
    page.getByRole("heading", { level: 1, name: /la couche limite et le décrochage/i })
  ).toBeVisible();
  // L'interaction est présente ; l'état par défaut est « Faible ».
  const stall = page.getByRole("radio", { name: /Décrochage/ });
  await expect(stall).not.toBeChecked();
  await stall.focus();
  await page.keyboard.press("Space");
  await expect(stall).toBeChecked();
  // Alternative textuelle accessible présente.
  await expect(page.getByText("Description accessible").first()).toBeVisible();
});

test("le cours 9 (types de profils) compose sa fiche neuve et la fiche profil d'aile", async ({
  page,
}) => {
  await page.goto("/cours/les-types-de-profils");
  await expect(page.getByRole("heading", { level: 1, name: /les profils d.aile/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /les types de profils d.aile/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /^le profil d.aile/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /se tester/i })).toBeVisible();
});

test("le cours 14 (stabilité & centrage) référence sa fiche et porte un quiz", async ({ page }) => {
  await page.goto("/cours/stabilite-et-centrage");
  await expect(
    page.getByRole("heading", { level: 1, name: /la stabilité et le centrage/i })
  ).toBeVisible();
  // Titre de cours = titre de fiche : cibler le lien de fiche par son résumé.
  await expect(
    page.getByRole("link", { name: /la stabilité et le centrage un avion est stable/i })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /se tester/i })).toBeVisible();
});

test("le cours 13 (effets moteur) référence sa fiche et porte un quiz", async ({ page }) => {
  await page.goto("/cours/les-effets-moteur");
  await expect(page.getByRole("heading", { level: 1, name: /les effets moteur/i })).toBeVisible();
  // Titre de cours = titre de fiche : cibler le lien de fiche par son résumé.
  await expect(page.getByRole("link", { name: /les effets moteur l.hélice/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /se tester/i })).toBeVisible();
});

test("le cours 12 (bilans de forces) référence sa fiche et porte un quiz", async ({ page }) => {
  await page.goto("/cours/les-bilans-de-forces");
  await expect(
    page.getByRole("heading", { level: 1, name: /les bilans de forces/i })
  ).toBeVisible();
  // Titre de cours = titre de fiche : on cible le lien de fiche par son résumé.
  await expect(
    page.getByRole("link", { name: /les bilans de forces en vol en vol stabilisé/i })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: /se tester/i })).toBeVisible();
});

test("le cours 11 propose l'interaction axes/gouvernes, utilisable au clavier", async ({
  page,
}) => {
  await page.goto("/cours/les-axes-et-les-gouvernes");
  await expect(
    page.getByRole("heading", { level: 1, name: /les trois axes et les gouvernes/i })
  ).toBeVisible();
  // L'interaction est présente ; l'état par défaut est « Tangage ».
  const roulis = page.getByRole("radio", { name: "Roulis" });
  await expect(roulis).not.toBeChecked();
  await roulis.focus();
  await page.keyboard.press("Space");
  await expect(roulis).toBeChecked();
  await expect(page.getByText("Description accessible").first()).toBeVisible();
});

test("le cours 10 (hypersustentateurs) compose ses deux fiches (volets/becs et spoilers/aérofreins)", async ({
  page,
}) => {
  await page.goto("/cours/dispositifs-hypersustentateurs");
  await expect(
    page.getByRole("heading", { level: 1, name: /hypersustentateurs et hyposustentateurs/i })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /les dispositifs hypersustentateurs/i })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /spoilers et aérofreins/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /se tester/i })).toBeVisible();
});

test("le cours 8 propose l'interaction polaire, dont le curseur d'incidence est réglable au clavier", async ({
  page,
}) => {
  await page.goto("/cours/la-polaire-et-la-finesse");
  await expect(
    page.getByRole("heading", { level: 1, name: /la polaire et la finesse/i })
  ).toBeVisible();
  // Curseur d'incidence (range) réglable au clavier.
  const slider = page.getByRole("slider");
  await expect(slider).toHaveValue("6");
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("7");
  await expect(page.getByText("Description accessible").first()).toBeVisible();
});

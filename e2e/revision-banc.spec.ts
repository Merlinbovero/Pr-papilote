import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * `/reviser` sur le Banc — lot F2b.
 *
 * Ce fichier porte la **présentation** et les deux états terminaux ; le
 * comportement du planificateur est prouvé séparément, et à l'identique
 * avant/après migration, par `revision-leitner.spec.ts`.
 *
 * L'état « rien à réviser » est difficile à atteindre naturellement : il
 * suppose que TOUTES les questions du vivier soient vues et aucune échue.
 * Il est donc semé à partir des **véritables identifiants servis par la
 * route**, avec des échéances futures — et non par un raccourci de
 * production, qui n'existe pas et ne doit pas exister.
 */

const CLE = "prepapilote:revision";
const POOL = "/entrainement/eopan/pool";

async function idsDuVivier(page: Page): Promise<string[]> {
  const reponse = await page.request.get(POOL);
  expect(reponse.ok(), "le vivier doit répondre").toBe(true);
  return ((await reponse.json()) as { id: string }[]).map((q) => q.id);
}

/** Sème un état où chaque question du vivier est vue et échoit plus tard. */
async function semerToutAJour(page: Page) {
  const ids = await idsDuVivier(page);
  const dansTrenteJours = new Date(Date.now() + 30 * 86_400_000).toISOString();
  const etat = Object.fromEntries(ids.map((id) => [id, { box: 3, dueAt: dansTrenteJours }]));
  await page.addInitScript(
    ([cle, valeur]) => window.localStorage.setItem(cle as string, valeur as string),
    [CLE, JSON.stringify(etat)] as const
  );
  return ids.length;
}

/** Le contrôle EOPAN, désormais un bouton radio natif (lot F2b, commit 3). */
const choisirEopan = (page: Page) =>
  page.getByRole("group", { name: "Concours à réviser" }).getByRole("radio", { name: "EOPAN" });

const focalise = (page: Page) =>
  page.evaluate(() => {
    const actif = document.activeElement;
    if (!actif || actif === document.body) return "body";
    return (actif.getAttribute("aria-label") ?? actif.textContent ?? "").trim().slice(0, 40);
  });

async function violations(page: Page) {
  const resultat = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  return resultat.violations.map((v) => `${v.id} (${v.nodes.length})`);
}

// ---------------------------------------------------------------------------
// 1. Le registre est servi, et le lancement s'explique
// ---------------------------------------------------------------------------

test("le registre du Banc est réellement appliqué", async ({ page }) => {
  await page.goto("/reviser");
  await choisirEopan(page).click();
  await page.getByRole("button", { name: /Commencer la révision/i }).click();
  await page.locator(".banc-reponse").first().waitFor({ timeout: 25_000 });

  const mesures = await page.evaluate(() => ({
    affichage: getComputedStyle(document.querySelector(".banc-reponse")!).display,
    encre: getComputedStyle(document.querySelector("main.banc")!)
      .getPropertyValue("--bc-banc")
      .trim(),
  }));
  expect(mesures.affichage).toBe("flex");
  expect(mesures.encre).not.toBe("");
});

test("le lancement indisponible dit pourquoi, et le dit au bouton", async ({ page }) => {
  await page.goto("/reviser");

  const lancer = page.getByRole("button", { name: /Commencer la révision/i });
  await expect(lancer).toBeDisabled();

  // La consigne est visible ET rattachée au bouton : un bouton désactivé
  // sans motif accessible est une impasse.
  const consigne = page.getByText("Choisissez un concours pour commencer.");
  await expect(consigne).toBeVisible();
  const idConsigne = await consigne.getAttribute("id");
  expect(await lancer.getAttribute("aria-describedby")).toBe(idConsigne);

  // Un choix valide l'active, et la consigne n'a plus d'objet.
  await choisirEopan(page).click();
  await expect(lancer).toBeEnabled();
  await expect(consigne).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// 1 bis. Le choix du concours est exclusif, et natif
// ---------------------------------------------------------------------------

test("le sélecteur est un choix exclusif natif, pilotable au clavier", async ({ page }) => {
  await page.goto("/reviser");

  const groupe = page.getByRole("group", { name: "Concours à réviser" });
  const options = groupe.getByRole("radio");
  await expect(options).toHaveCount(3);
  // Aucun présélectionné : c'est le comportement par défaut explicite.
  await expect(groupe.getByRole("radio", { checked: true })).toHaveCount(0);

  // Tab entre dans le groupe : c'est le CONTRÔLE qui prend le focus, même si
  // c'est l'étiquette qui le donne à voir.
  await options.first().focus();
  await expect(options.first()).toBeFocused();

  // Espace sélectionne.
  await page.keyboard.press("Space");
  await expect(options.first()).toBeChecked();
  // …et le lancement s'active immédiatement.
  await expect(page.getByRole("button", { name: /Commencer la révision/i })).toBeEnabled();

  // Les flèches changent le choix, sans quitter le groupe : c'est le propre
  // d'un groupe de boutons radio, et ce qu'un radiogroup ARIA devrait imiter.
  await page.keyboard.press("ArrowDown");
  await expect(options.nth(1)).toBeChecked();
  await expect(options.nth(1)).toBeFocused();
  await expect(options.first()).not.toBeChecked();

  await page.keyboard.press("ArrowUp");
  await expect(options.first()).toBeChecked();

  // Un seul arrêt de tabulation pour tout le groupe : après le choix, Tab
  // sort du groupe au lieu de visiter les deux autres options.
  await page.keyboard.press("Tab");
  await expect(options.nth(1)).not.toBeFocused();
  await expect(options.nth(2)).not.toBeFocused();
});

test("l'option retenue ne se signale pas par la seule couleur", async ({ page }) => {
  await page.goto("/reviser");
  await choisirEopan(page).click();

  // Une coche accompagne la teinte : la sélection reste lisible sans elle.
  // Portée au groupe : « EOPAN » nomme aussi un menu de navigation et un
  // lien de pied de page.
  const pastille = page
    .getByRole("group", { name: "Concours à réviser" })
    .getByText("EOPAN", { exact: true });
  const aUneIcone = await pastille.evaluate((el) => Boolean(el.querySelector("svg")));
  expect(aUneIcone).toBe(true);

  // La cible tactile se mesure sur le CONTRÔLE, qui recouvre la pastille.
  const boite = await choisirEopan(page).boundingBox();
  expect(boite!.height).toBeGreaterThanOrEqual(44);
});

// ---------------------------------------------------------------------------
// 1 ter. La clé morte n'influence plus rien
// ---------------------------------------------------------------------------

test.describe("prepapilote:preparation — vestige sans effet", () => {
  /** L'état de départ observable : rien de coché, lancement bloqué, consigne. */
  async function attendreEtatInitial(page: Page) {
    const groupe = page.getByRole("group", { name: "Concours à réviser" });
    await expect(groupe.getByRole("radio", { checked: true })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Commencer la révision/i })).toBeDisabled();
    await expect(page.getByText("Choisissez un concours pour commencer.")).toBeVisible();
  }

  test("clé absente : aucun concours présélectionné", async ({ page }) => {
    await page.goto("/reviser");
    await attendreEtatInitial(page);
  });

  test("clé présente avec une ancienne valeur : comportement identique", async ({ page }) => {
    // La valeur qu'écrivait l'ancienne fonctionnalité « Ma préparation ».
    await page.addInitScript(() =>
      window.localStorage.setItem(
        "prepapilote:preparation",
        JSON.stringify({ concours: "alat", dateConcours: "2027-05-01" })
      )
    );
    await page.goto("/reviser");
    await attendreEtatInitial(page);

    // Et le vestige n'est pas effacé de force : on ne migre ni ne nettoie
    // le navigateur du candidat, on cesse simplement d'en tenir compte.
    const reste = await page.evaluate(() => window.localStorage.getItem("prepapilote:preparation"));
    expect(reste).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 2. « Rien à réviser » — atteint par les vrais identifiants
// ---------------------------------------------------------------------------

test.describe("état « rien à réviser »", () => {
  test("il est titré, chiffré, actionnable et prend le focus", async ({ page }) => {
    const total = await semerToutAJour(page);
    await page.goto("/reviser");
    await choisirEopan(page).click();
    await page.getByRole("button", { name: /Commencer la révision/i }).click();

    const bloc = page.getByRole("region", { name: /Révision à jour/ });
    await expect(bloc).toBeVisible({ timeout: 25_000 });
    // Le focus vient sur l'aboutissement de l'action lancée.
    expect(await focalise(page)).toMatch(/^Révision à jour/);

    // Les chiffres sont ceux du vivier réellement semé — rien d'inventé.
    await expect(bloc).toContainText(`${total} questions programmées pour plus tard`);
    await expect(bloc).toContainText("Prochaine échéance");

    // Une issue utile, et pas seulement un constat.
    await expect(bloc.getByRole("link", { name: /S'entraîner librement/i })).toHaveAttribute(
      "href",
      "/entrainement/eopan"
    );
    // Aucune question n'est présentée : la file est bien vide.
    await expect(page.locator(".banc-reponse")).toHaveCount(0);
  });

  test("il ne prétend pas qu'il reste des questions dues", async ({ page }) => {
    await semerToutAJour(page);
    await page.goto("/reviser");
    await choisirEopan(page).click();
    await page.getByRole("button", { name: /Commencer la révision/i }).click();

    const bloc = page.getByRole("region", { name: /Révision à jour/ });
    await expect(bloc).toBeVisible({ timeout: 25_000 });
    /*
      `dueNow` et `neverSeen` valent nécessairement zéro ici : annoncer un
      DÉCOMPTE de questions échues ou jamais vues serait faux.

      On vise donc la forme chiffrée, et non le mot : le bloc contient
      légitimement « Aucune question n'est échue aujourd'hui », qui est la
      bonne nouvelle elle-même.
    */
    await expect(bloc).not.toContainText(/\d+\s+questions?\s+échues?/);
    await expect(bloc).not.toContainText(/\d+\s+.*jamais\s+vues?/);
    // Et aucune mention d'un compte nul, qui n'apprend rien.
    await expect(bloc).not.toContainText(/\b0\s+/);
  });
});

// ---------------------------------------------------------------------------
// 3. Erreur, et récupération réelle
// ---------------------------------------------------------------------------

test.describe("état d'erreur", () => {
  test("il alerte, prend le focus et propose une reprise", async ({ page }) => {
    await page.route(POOL, (route) => route.fulfill({ status: 500, body: "" }));
    await page.goto("/reviser");
    await choisirEopan(page).click();
    await page.getByRole("button", { name: /Commencer la révision/i }).click();

    const alerte = page.locator("main").getByRole("alert");
    await expect(alerte).toContainText("Chargement impossible");
    // `focalise` renvoie le début du contenu du bloc, qui n'a pas de nom
    // accessible propre : on vise donc son ouverture.
    expect(await focalise(page)).toMatch(/^Chargement impossible/);
    // Le candidat est rassuré sur ce qu'il ne perd pas.
    await expect(alerte).toContainText("échéances déjà enregistrées sont intactes");
    await expect(alerte.getByRole("button", { name: "Réessayer" })).toBeVisible();
  });

  test("« Réessayer » relance réellement la séance une fois le réseau revenu", async ({ page }) => {
    let echoue = true;
    await page.route(POOL, async (route) => {
      if (echoue) {
        await route.fulfill({ status: 500, body: "" });
        return;
      }
      await route.fallback();
    });

    await page.goto("/reviser");
    await choisirEopan(page).click();
    await page.getByRole("button", { name: /Commencer la révision/i }).click();
    await expect(page.locator("main").getByRole("alert")).toBeVisible();

    // Le réseau revient : la reprise doit aboutir à une vraie séance.
    echoue = false;
    await page.getByRole("button", { name: "Réessayer" }).click();
    await expect(page.locator(".banc-reponse").first()).toBeVisible({ timeout: 25_000 });
    await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
  });
});

// ---------------------------------------------------------------------------
// 4. Axe sur les deux états terminaux, dans les deux registres
// ---------------------------------------------------------------------------

for (const registre of ["light", "dark"] as const) {
  test.describe(`registre ${registre}`, () => {
    test.use({ colorScheme: registre });

    test("aucune violation axe sur les états de /reviser", async ({ page }) => {
      await page.goto("/reviser");
      expect(await violations(page), "préparation").toEqual([]);

      await page.route(POOL, (route) => route.fulfill({ status: 500, body: "" }));
      await choisirEopan(page).click();
      await page.getByRole("button", { name: /Commencer la révision/i }).click();
      await expect(page.locator("main").getByRole("alert")).toBeVisible();
      expect(await violations(page), "erreur").toEqual([]);
    });
  });
}

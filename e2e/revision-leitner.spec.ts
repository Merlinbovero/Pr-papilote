import { expect, test, type Page } from "@playwright/test";

/**
 * Le moteur Leitner de `/reviser`, mesuré de bout en bout — lot F2b.
 *
 * Ce fichier est écrit et vert **avant** la migration visuelle, puis rejoué
 * inchangé après : c'est ce qui prouve que le Banc ne touche pas à
 * l'algorithme pédagogique. Il n'affirme rien sur l'apparence.
 *
 * La date est pilotée par `page.clock`, et les identifiants viennent du
 * **vrai vivier** servi par la route : un état semé avec des identifiants
 * inventés ne prouverait rien, puisque le planificateur ne les rencontrerait
 * jamais.
 */

const CLE = "prepapilote:revision";
const POOL = "/entrainement/eopan/pool";
/** Un instant fixe, pour que les échéances soient calculables à la main. */
const MAINTENANT = new Date("2026-03-10T09:00:00.000Z");
const JOUR_MS = 86_400_000;

interface ItemRevision {
  box: number;
  dueAt: string;
}
type EtatRevision = Record<string, ItemRevision>;

/** Les identifiants réellement servis, dans l'ordre du vivier. */
async function identifiantsDuVivier(page: Page, combien: number): Promise<string[]> {
  const reponse = await page.request.get(POOL);
  expect(reponse.ok(), "le vivier doit répondre").toBe(true);
  const vivier = (await reponse.json()) as { id: string }[];
  expect(vivier.length).toBeGreaterThan(combien);
  return vivier.slice(0, combien).map((q) => q.id);
}

async function semer(page: Page, etat: EtatRevision) {
  await page.addInitScript(
    ([cle, valeur]) => window.localStorage.setItem(cle as string, valeur as string),
    [CLE, JSON.stringify(etat)] as const
  );
}

/**
 * Lit l'état de révision, **quelle que soit sa forme de stockage**.
 *
 * Élargi au lot F11, qui a mis le contenu sous enveloppe versionnée
 * (`{ v, d }`). Ce lecteur accepte les deux formes, et c'est délibéré : les
 * données déjà présentes chez les utilisateurs sont nues, celles écrites
 * désormais sont enveloppées, et le produit doit lire les deux. Un lecteur qui
 * n'accepterait que la nouvelle forme masquerait justement le risque que ce
 * lot devait écarter.
 */
const lireEtat = (page: Page) =>
  page.evaluate((cle) => {
    const brut = window.localStorage.getItem(cle);
    if (!brut) return null;
    const analyse: unknown = JSON.parse(brut);
    const enveloppe = analyse as { v?: unknown; d?: EtatRevision };
    return typeof enveloppe.v === "number" && enveloppe.d ? enveloppe.d : (analyse as EtatRevision);
  }, CLE);

/** La forme brute, pour les contrôles qui portent sur le stockage lui-même. */
const lireBrut = (page: Page) => page.evaluate((cle) => window.localStorage.getItem(cle), CLE);

/**
 * Choisit un concours **sans présumer du rôle du contrôle**.
 *
 * Ce fichier doit tourner à l'identique avant et après la migration, alors
 * que celle-ci remplace précisément des boutons `aria-pressed` par des
 * boutons radio natifs. Y figer un rôle rendrait la comparaison impossible —
 * et le sujet de ce fichier est le planificateur, pas le widget, dont la
 * sémantique est vérifiée ailleurs (`revision-banc.spec.ts`).
 *
 * Le nom accessible du GROUPE, lui, est stable de part et d'autre : c'est le
 * point d'ancrage, et il évite de confondre l'option avec un lien de
 * navigation portant le même libellé.
 */
async function choisirConcours(page: Page, nom: string) {
  const groupe = page.getByRole("group", { name: "Concours à réviser" });
  await groupe
    .getByRole("radio", { name: nom })
    .or(groupe.getByRole("button", { name: nom }))
    .first()
    .click();
}

/** Lance la révision sur EOPAN et attend la première question. */
async function lancerRevision(page: Page) {
  /*
    `setFixedTime` et NON `install`.
    `install()` remplace aussi `requestAnimationFrame`, or `RevisionSession`
    conditionne son montage à une image d'animation : avec l'horloge
    installée, le composant ne se rendait jamais et les six contrôles
    échouaient sur le sélecteur, en donnant l'impression d'un défaut de
    l'application. Ici on ne veut figer que la DATE, pour rendre les
    échéances calculables — pas suspendre les minuteurs.
  */
  await page.clock.setFixedTime(MAINTENANT);
  await page.goto("/reviser");
  await choisirConcours(page, "EOPAN");
  await page.getByRole("button", { name: /Commencer la révision/i }).click();
  await page.getByRole("button", { name: "Valider" }).waitFor({ timeout: 20_000 });
}

/** Répond à la question courante : `juste` choisit la bonne réponse. */
async function repondre(page: Page, juste: boolean) {
  const enonce = await page.locator("h2").first().innerText();
  const reponse = await page.request.get(POOL);
  const vivier = (await reponse.json()) as {
    id: string;
    statement: string;
    correctChoices: number[];
  }[];
  const question = vivier.find((q) => q.statement.trim() === enonce.trim());
  expect(question, `question « ${enonce} » introuvable dans le vivier`).toBeTruthy();

  const bonRang = question!.correctChoices[0];
  const choix = page.locator('ul[role="list"] > li button');
  const rang = juste ? bonRang : (bonRang + 1) % (await choix.count());
  await choix.nth(rang).click();
  await page.getByRole("button", { name: "Valider" }).click();
  return question!.id;
}

// ---------------------------------------------------------------------------

test("aucune écriture avant la première réponse validée", async ({ page }) => {
  await lancerRevision(page);
  // La séance est lancée, la première question affichée : le calendrier
  // d'écriture ne doit pas avoir commencé.
  expect(await lireEtat(page)).toBeNull();
});

test("une réponse juste fait monter d'une boîte, une erreur ramène en boîte 1", async ({
  page,
}) => {
  await lancerRevision(page);

  const premier = await repondre(page, true);
  let etat = await lireEtat(page);
  expect(etat, "l'écriture a lieu à la validation").not.toBeNull();
  // Jamais vue → boîte 0 implicite → 1 à la première réussite.
  expect(etat![premier].box).toBe(1);
  // Boîte 1 = 1 jour.
  expect(etat![premier].dueAt).toBe(new Date(MAINTENANT.getTime() + 1 * JOUR_MS).toISOString());

  await page.getByRole("button", { name: /Question suivante/i }).click();
  const second = await repondre(page, false);
  etat = await lireEtat(page);
  expect(etat![second].box).toBe(1);
  // L'erreur n'efface pas la question précédente.
  expect(etat![premier].box).toBe(1);
  expect(Object.keys(etat!)).toHaveLength(2);
});

test("une question déjà en boîte 3 monte en 4 et prend l'échéance de sa boîte", async ({
  page,
}) => {
  const [premierId] = await identifiantsDuVivier(page, 1);
  // Échue hier, donc prioritaire : elle sortira en tête de file.
  await semer(page, {
    [premierId]: {
      box: 3,
      dueAt: new Date(MAINTENANT.getTime() - JOUR_MS).toISOString(),
    },
  });

  await lancerRevision(page);
  const jouee = await repondre(page, true);
  expect(jouee, "la question échue passe en premier").toBe(premierId);

  const etat = await lireEtat(page);
  expect(etat![premierId].box).toBe(4);
  // Boîte 4 = 7 jours, comptés depuis MAINTENANT et non depuis l'ancienne échéance.
  expect(etat![premierId].dueAt).toBe(new Date(MAINTENANT.getTime() + 7 * JOUR_MS).toISOString());
});

test("les échéances des autres questions sont conservées telles quelles", async ({ page }) => {
  const [a, b, c] = await identifiantsDuVivier(page, 3);
  const futur = new Date(MAINTENANT.getTime() + 30 * JOUR_MS).toISOString();
  const seme: EtatRevision = {
    [a]: { box: 2, dueAt: new Date(MAINTENANT.getTime() - JOUR_MS).toISOString() },
    [b]: { box: 5, dueAt: futur },
    [c]: { box: 4, dueAt: futur },
  };
  await semer(page, seme);

  await lancerRevision(page);
  await repondre(page, true);

  const etat = await lireEtat(page);
  // Seule la question jouée bouge ; les deux autres sont intactes, au champ près.
  expect(etat![b]).toEqual(seme[b]);
  expect(etat![c]).toEqual(seme[c]);
});

test("une interruption ne perd pas les réponses déjà validées", async ({ page }) => {
  await lancerRevision(page);
  const premier = await repondre(page, true);
  const avant = await lireEtat(page);

  // Interruption brutale : rechargement en pleine séance.
  await page.reload();
  const apres = await lireEtat(page);
  expect(apres).toEqual(avant);
  expect(apres![premier].box).toBe(1);
});

test("le schéma d'une entrée de révision est inchangé", async ({ page }) => {
  /*
    **Réécrit au lot F11, et c'est un changement de format ASSUMÉ.**

    Ce contrôle s'appelait « le schéma de prepapilote:revision est inchangé ».
    Il ne l'est plus : le contenu est désormais enveloppé (`{ v, d }`) pour que
    la version soit une propriété de la donnée et non du nom de la clé — le
    défaut que le lot corrige, huit clés portant un `.v1` que personne ne
    lisait.

    Ce que ce contrôle protégeait vraiment reste intact et se vérifie toujours :
    la forme d'UNE ENTRÉE — deux champs, une boîte entière et une échéance ISO —
    et le fait qu'un état déjà présent chez un utilisateur continue d'être lu
    (contrôle suivant).
  */
  await lancerRevision(page);
  const id = await repondre(page, true);
  const etat = await lireEtat(page);

  expect(Object.keys(etat![id]).sort()).toEqual(["box", "dueAt"]);
  expect(Number.isInteger(etat![id].box)).toBe(true);
  expect(etat![id].dueAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

  // La version est explicite, et dans la donnée.
  const brut = JSON.parse((await lireBrut(page))!) as { v: number };
  expect(brut.v, "le contenu porte une version").toBe(1);
});

test("un état écrit AVANT le lot F11 reste lu, et n'est pas perdu", async ({ page }) => {
  /*
    Le contrôle qui décide du lot. Les utilisateurs qui révisent déjà ont un
    objet NU sous cette clé. S'il cessait d'être lu, leurs échéances
    repartiraient de zéro sans que rien ne le signale — la perte silencieuse
    que ce lot existe pour empêcher.

    `semer` écrit délibérément la forme héritée, sans enveloppe.
  */
  const [a, b] = await identifiantsDuVivier(page, 2);
  const futur = new Date(MAINTENANT.getTime() + 30 * JOUR_MS).toISOString();
  await semer(page, { [a]: { box: 5, dueAt: futur }, [b]: { box: 4, dueAt: futur } });

  await lancerRevision(page);
  await repondre(page, true);

  const etat = await lireEtat(page);
  // Les deux échéances héritées sont toujours là, à l'identique.
  expect(etat![a], "échéance héritée conservée").toEqual({ box: 5, dueAt: futur });
  expect(etat![b], "échéance héritée conservée").toEqual({ box: 4, dueAt: futur });

  // Rien n'a été mis en quarantaine : la donnée héritée est VALIDE, pas tolérée.
  const quarantaine = await page.evaluate(
    (cle) => window.localStorage.getItem(`${cle}.rejete`),
    CLE
  );
  expect(quarantaine, "aucune mise en quarantaine sur une donnée héritée valide").toBeNull();
});

import { expect, test, type Page } from "@playwright/test";

/**
 * Une image ne doit pas réclamer une variante disproportionnée.
 *
 * ── Ce que ce contrôle garde, et pourquoi il ne regarde pas `sizes` ──────
 * Il serait facile d'affirmer que `sizes` vaut telle chaîne. Ce serait
 * vérifier l'implémentation, pas le résultat : la chaîne peut être juste et
 * le rendu faux, ou l'inverse. Le contrôle compare donc la variante RÉELLEMENT
 * demandée à la largeur RÉELLEMENT rendue, mesurées toutes deux dans le
 * navigateur, et n'accepte que la plus petite candidate suffisante.
 *
 * ── D'où il vient ───────────────────────────────────────────────────────
 * En intégration continue, `page.goto` n'atteignait jamais `load` sur cette
 * notice, seulement en projet mobile et seulement à la deuxième largeur. Le
 * journal a nommé la coupable : une requête `/_next/image?…&w=3840` sans
 * statut après huit secondes. `sizes` annonçait `100vw` et 720 px, quand le
 * conteneur mesure 90 à 95 % du viewport puis 620 px au-delà de 1180 px. Sur
 * un écran à DPR 2,625, l'écart suffisait à faire choisir la plus grande
 * candidate du jeu — dont la sortie est pourtant identique, octet pour octet,
 * à celle de `w=1920`, l'optimiseur n'agrandissant pas au-delà des 1600 px de
 * la source.
 *
 * ── Ce qu'il ne fait pas ────────────────────────────────────────────────
 * Il ne fixe aucune largeur en dur et ne suppose aucun `deviceSizes` : le jeu
 * de candidates est lu dans le `srcset` servi. Changer la source, la grille ou
 * les points de bascule reste donc possible sans toucher à ce fichier — seule
 * une demande disproportionnée le fait tomber.
 *
 * ── ÉTENDU : les cinq gabarits, et un viewport de plus ───────────────────
 * Le lot R-01 n'avait corrigé qu'un gabarit et signalé les quatre autres sans
 * les traiter. Ils portaient le même `sizes` fautif, et la mesure a confirmé
 * qu'ils partagent la même géométrie **au pixel près** — 288, 343, 358, 608,
 * 712, 778, 968, puis 620 fixe à partir de 1180 px. C'est vérifié, non
 * supposé : `.pl-photo-c` est en `width: 100%`, sa largeur ne lui appartient
 * pas, et deux gabarits auraient pu vivre dans deux mises en page distinctes.
 *
 * **1280 px est ajouté à la liste, et c'est le point important.** La garde
 * d'origine mesurait 390, 834 et 1440 — or le défaut culminait précisément
 * entre les deux derniers : à 1280, l'ancien `sizes` faisait réclamer la
 * variante **1920 pour un conteneur de 620 px**, soit 96 460 octets au lieu de
 * 25 540, **73,5 % de transfert inutile**. Une garde qui saute le pire cas
 * n'est pas une garde ; c'est une impression de garde.
 *
 * ── Une entrée par gabarit, comme le registre du Banc ────────────────────
 * Même règle que `banc-route-pilote.spec.ts` : une entrée par **frontière
 * indépendante** capable de violer l'invariant. Les cinq gabarits sont cinq
 * fichiers distincts, donc cinq occasions de réintroduire le défaut — un
 * témoin unique serait aveugle aux quatre autres.
 */

const PHOTO = ".pl-photo img";

/** Une route par gabarit — cinq fichiers, cinq frontières. */
const GABARITS = [
  { gabarit: "planche-identification", route: "/eopn/grades/grades-de-l-armee-de-l-air" },
  { gabarit: "lecon-fiche", route: "/fondamentaux/aerodynamique/l-aerostatique" },
  { gabarit: "dossier", route: "/eopan/concepts/catobar" },
  { gabarit: "cahier", route: "/eopan/histoire/histoire-de-l-aeronautique-navale" },
  { gabarit: "situation", route: "/culture/geopolitique-defense/red-flag" },
] as const;

async function inspecter(page: Page) {
  return page.evaluate((selecteur) => {
    const img = document.querySelector(selecteur) as HTMLImageElement | null;
    if (!img) return null;
    const candidates = (img.getAttribute("srcset") ?? "")
      .split(",")
      .map((c) => Number.parseInt(c.trim().split(" ").pop() ?? "", 10))
      .filter((n) => Number.isFinite(n))
      .sort((a, b) => a - b);
    return {
      largeurRendue: img.getBoundingClientRect().width,
      dpr: window.devicePixelRatio,
      currentSrc: img.currentSrc,
      candidates,
      naturalWidth: img.naturalWidth,
      complete: img.complete,
    };
  }, PHOTO);
}

for (const { gabarit, route } of GABARITS) {
  // 1280 est le pire cas mesuré, et il manquait à la liste d'origine.
  for (const largeur of [390, 834, 1280, 1440]) {
    test(`${gabarit} ne réclame pas de variante disproportionnée à ${largeur}px`, async ({
      page,
    }, infos) => {
      await page.setViewportSize({ width: largeur, height: 900 });
      const reponse = await page.goto(route);
      // Une route qui répondrait 404 passerait ce contrôle sans rien prouver.
      expect(reponse?.status(), `${route} doit répondre`).toBeLessThan(400);

      // 1. `load` est atteint. C'est la condition qui manquait en CI, et elle
      //    est ici garantie par le `goto` lui-même, qui l'attend par défaut.
      expect(await page.evaluate(() => document.readyState)).toBe("complete");

      const img = await inspecter(page);
      expect(img, `${gabarit} doit rendre une photo`).not.toBeNull();

      // 2. L'image a réellement fini de charger.
      expect(img!.complete, "l'image doit être chargée").toBe(true);
      expect(img!.naturalWidth, "l'image doit avoir des pixels").toBeGreaterThan(0);

      // 3. La variante demandée est la plus petite qui suffise.
      const demande = Number.parseInt(
        new globalThis.URL(img!.currentSrc, "http://localhost:3000").searchParams.get("w") ?? "0",
        10
      );
      const utile = img!.largeurRendue * img!.dpr;
      const suffisante = img!.candidates.find((c) => c >= utile) ?? img!.candidates.at(-1)!;

      expect(
        demande,
        `${gabarit} — projet ${infos.project.name} — rendue ${Math.round(img!.largeurRendue)}px ` +
          `× DPR ${img!.dpr} = ${Math.round(utile)}px utiles ; la plus petite candidate ` +
          `suffisante est ${suffisante}, mais ${demande} a été demandée. ` +
          `Candidates : ${img!.candidates.join(", ")}`
      ).toBeLessThanOrEqual(suffisante);
    });
  }
}

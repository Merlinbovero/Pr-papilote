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
 */

const NOTICE = "/eopn/grades/grades-de-l-armee-de-l-air";
const PHOTO = ".pl-photo img";

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

for (const largeur of [390, 834, 1440]) {
  test(`la photo de notice ne réclame pas de variante disproportionnée à ${largeur}px`, async ({
    page,
  }, infos) => {
    await page.setViewportSize({ width: largeur, height: 900 });
    await page.goto(NOTICE);

    // 1. `load` est atteint. C'est la condition qui manquait en CI, et elle
    //    est ici garantie par le `goto` lui-même, qui l'attend par défaut.
    expect(await page.evaluate(() => document.readyState)).toBe("complete");

    const img = await inspecter(page);
    expect(img, "la photo de notice doit exister").not.toBeNull();

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
      `projet ${infos.project.name} — rendue ${Math.round(img!.largeurRendue)}px × DPR ${img!.dpr} ` +
        `= ${Math.round(utile)}px utiles ; la plus petite candidate suffisante est ${suffisante}, ` +
        `mais ${demande} a été demandée. Candidates : ${img!.candidates.join(", ")}`
    ).toBeLessThanOrEqual(suffisante);
  });
}

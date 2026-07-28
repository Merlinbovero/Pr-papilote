# Plan de migration — Système PLANCHE

> **Statut : plan soumis à validation. Aucune migration n'est commencée.**
> Le prototype (`/design-lab/planche/…`) est validé comme base ; ce document
> décrit comment le faire descendre en production sans casser le site en
> service. Il suppose la revue sur appareil réel faite — voir §0.

---

## 0. Ce qui conditionne le démarrage

| Préalable                                     | État                                                                                                                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Direction PLANCHE et trois prototypes validés | **Fait** (2026-07-28)                                                                                                                                                       |
| Revue sur iPad, téléphone et ordinateur       | **À faire — par la direction éditoriale.** Je ne dispose que d'un navigateur sans écran : je peux mesurer des pixels, pas juger un confort de lecture. Banc d'essai fourni. |
| Deux écarts mesurés tranchés                  | **À trancher** — voir §1                                                                                                                                                    |
| Système d'illustration technique              | **Chantier séparé, non bloquant** (`docs/roadmap.md`)                                                                                                                       |

---

## 1. Les deux écarts à trancher avant le lot 1

### La justure sur téléphone

Mesurée à **42 signes** sur un écran de 393 px, contre les 66–72 que le
manifeste déclare « non négociables sur tous les écrans ». **La règle est
fausse et c'est mon erreur** : atteindre 66 signes à cette largeur exigerait un
corps de 11 px, illisible.

**Correction proposée au manifeste** : la justure vise 66–72 signes **dès que la
largeur le permet** ; en dessous, **la taille du corps l'emporte sur le compte de
signes**, jamais l'inverse. Un plancher de 15,5 px est posé sur écran étroit.

### Les cibles tactiles

Les liens d'annexe et de sommaire mesurent **33 px de haut**, sous les 44 px
recommandés. **Correction proposée** : plancher de 44 px sur pointeur grossier
(`@media (pointer: coarse)`), sans changer la densité visuelle sur bureau.

---

## 2. Composants globaux à migrer

Dans cet ordre — chaque étage dépend du précédent.

| #   | Étage          | Contenu                                                                                             | Risque                                                           |
| --- | -------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1   | **Jetons**     | `fond`, `fond-2`, `fond-3`, encres, filets, six encres de module, trois états, deux registres       | Faible — rien de visible ne change tant que rien ne les consomme |
| 2   | **Fontes**     | Spectral, Fira Sans, Fira Mono auto-hébergées ; retrait de Geist et Archivo                         | Moyen — touche toutes les pages d'un coup                        |
| 3   | **Gabarit**    | `PlancheRoot`, marge, corps, annexe, cartouche, cote, repères, pied de planche                      | Élevé — c'est la bascule visible                                 |
| 4   | **Primitives** | Boutons, champs, tableaux, encadrés, citations, légendes, filets ; retrait des ombres et des rayons | Moyen                                                            |
| 5   | **Chrome**     | Bandeau, pied de site, recherche, navigation de module                                              | Élevé — visible partout                                          |
| 6   | **Familles**   | Les six archétypes, un par lot                                                                      | Contenu par contenu, réversible                                  |

Les étages 1 et 2 se livrent **sans changement visuel** : les jetons PLANCHE
sont ajoutés à côté des jetons existants, les fontes sont chargées mais non
appliquées. C'est ce qui rend la bascule de l'étage 3 réversible en une ligne.

---

## 3. Ordre des familles

L'ordre suit le **rapport bénéfice / risque**, pas la logique du plan de site.

| Rang | Famille                                             | Pourquoi ici                                                                                                                                                               |
| ---- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | **La Leçon** — cours                                | Prototype déjà éprouvé, périmètre fermé (14 leçons), aucune interaction critique. C'est la famille où PLANCHE apporte le plus.                                             |
| 2    | **La Planche d'identification** — fiches techniques | Volume le plus élevé (442 fiches) mais gabarit unique et déjà prototypé. Le gain de lisibilité y est immédiat.                                                             |
| 3    | **Le Dossier** — concours                           | Hubs et index. Peu de texte, beaucoup de structure : la table numérotée s'y installe sans risque.                                                                          |
| 4    | **Le Banc** — entraînement                          | Prototypé, mais touche le quiz, les scores et la progression. On y va **après** avoir stabilisé le reste, pour ne pas mêler refonte visuelle et régression fonctionnelle.  |
| 5    | **Le Cahier** — culture                             | Titre à 52 px, lettrine : la famille la plus typographique, donc celle qui bénéficie le plus d'un système déjà rodé.                                                       |
| 6    | **La Situation** — géopolitique                     | Quatre dossiers seulement, mais elle porte le cartouche d'arrêté et la section « ce qui reste incertain » — deux gestes qui demandent une reprise éditoriale en parallèle. |

Hors familles, en dernier : accueil, recherche, espace authentifié.

---

## 4. Coexistence des deux chartes

**Principe : jamais de « grand soir ».** Les deux chartes cohabitent le temps de
la migration, et le partage se fait **par route**, pas par composant.

- Les jetons PLANCHE sont posés sur une classe de portée, `.pl-root`, jusqu'à ce
  que **toutes** les familles soient migrées. Ils ne montent sur `:root` qu'au
  dernier lot, et ce jour-là le fichier `globals.css` perd ses anciens jetons
  dans le même commit.
- Une page migrée porte `PlancheRoot` ; une page non migrée ne le porte pas.
  Aucune page ne mélange les deux.
- Le drapeau `NEXT_PUBLIC_DESIGN_LAB` disparaît au lot 1 : la migration n'est
  plus une expérimentation. À la place, chaque lot est **réversible par un
  retour arrière git**, ce qui suppose de ne jamais mêler dans un même commit
  une migration visuelle et une modification de contenu ou de logique.
- **Le pansement `body:has(.pl-root)` ne survit pas au lot 3.** Voir §7.

---

## 5. Suppression progressive des styles historiques

Dans cet ordre, et jamais avant la migration de la dernière famille qui les
consomme.

1. **Les jetons Tailwind de l'ancienne charte** (`--primary`, `--card`,
   `--muted`…) restent tant qu'une primitive shadcn les utilise.
2. **Les primitives shadcn** sont remplacées une par une par leur équivalent
   PLANCHE. Celles qui n'ont pas d'équivalent (menu déroulant, dialogue) sont
   **conservées et restylées**, pas réécrites.
3. **Geist et Archivo** sont retirées du layout racine au lot 2. C'est le seul
   retrait qui se voit immédiatement sur les pages non encore migrées : elles
   passeront en Fira Sans avant d'avoir leur gabarit. **C'est acceptable et
   volontaire** — un site en deux polices pendant deux semaines vaut mieux qu'un
   site qui charge cinq familles.
4. **`docs/refonte-design.md`** passe en archive au dernier lot ;
   `docs/design-system.md` et `docs/ui-framework.md` sont réécrits pour se
   conformer au manifeste, comme celui-ci l'annonce.

**Règle de sécurité** : aucun style historique n'est supprimé dans le même
commit que celui qui le remplace. Suppression au commit suivant, après
vérification.

---

## 6. Tests de non-régression

Le prototype en fournit le modèle ; la migration l'étend.

| Test                      | Portée                                                                    | Où                                                                                            |
| ------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Contrastes                | Chaque encre, état et filet, sur les trois fonds, dans les deux registres | Vitest, `planche-tokens.test.ts` — **36 tests, déjà en place**                                |
| Débordement horizontal    | Chaque route migrée × 3 largeurs                                          | Playwright, à étendre route par route                                                         |
| Accessibilité             | axe-core WCAG A et AA                                                     | Playwright, sur chaque route migrée                                                           |
| Focus visible             | Anneau de 2 px présent                                                    | Playwright                                                                                    |
| Petites capitales réelles | Écart de largeur > 5 % avec et sans `smcp`                                | Playwright — **déjà en place**                                                                |
| Donnée inconnue           | Toute cellule vide vaut « — », « N/A » interdit                           | Playwright — **déjà en place**                                                                |
| Cibles tactiles           | ≥ 44 px sur pointeur grossier                                             | Playwright, **à écrire**                                                                      |
| Justure                   | Entre 66 et 72 signes dès que la largeur le permet                        | Playwright, **à écrire**                                                                      |
| Fonctionnel               | Quiz, progression, recherche, contenu                                     | Suites existantes, **inchangées** — c'est la garantie que la refonte ne touche pas la logique |

**Captures de référence** : une par route migrée × 3 largeurs × 2 registres,
prises au lot qui migre la route et comparées à chaque lot suivant.

---

## 7. Traitement propre du layout de production

**Le pansement `body:has(.pl-root)` ne devient pas l'architecture.**

Le prototype masque l'en-tête et le pied de production par une règle CSS parce
qu'il vit sous le layout racine existant. En production, la solution est un
**groupe de routes avec son propre layout racine** :

```
src/app/
  (planche)/          ← layout racine PLANCHE : jetons, fontes, bandeau, pied
    cours/…
    [module]/…
  (heritage)/         ← layout racine actuel, vidé au fil des lots
    …
```

Next.js autorise plusieurs layouts racine dès lors qu'ils vivent dans des
groupes de routes distincts. Le coût est un **déplacement de fichiers**, pas une
réécriture : chaque route change de dossier au lot qui la migre, et le groupe
`(heritage)` se vide jusqu'à disparaître.

Conséquences à assumer, et à traiter comme **temporaires** :

- une navigation entre les deux groupes provoque un **rechargement complet de la
  page**. Next ne peut pas faire de transition client entre deux layouts
  racine ; le navigateur repart de zéro ;
- le service worker et le manifeste PWA sont déclarés **une seule fois**, dans le
  groupe PLANCHE, dès le lot 3.

**Règles pendant la coexistence** — elles tombent à la fin de la migration,
quand le groupe hérité disparaît :

1. **Tester les navigations dans les deux sens** à chaque lot : hérité → PLANCHE
   et PLANCHE → hérité, et pas seulement le sens qui vient d'être migré.
2. **Vérifier qu'aucun état important n'est perdu** au franchissement :
   préparation en cours, filtres de recherche, position de lecture, thème.
3. **Ne jamais faire traverser une frontière de layout racine pendant une
   session d'entraînement.** Le Banc et ses écrans de correction restent du même
   côté, quel que soit l'ordre des lots — c'est une contrainte de découpe, pas
   une préférence.
4. Le rechargement complet est **un défaut connu et daté**, pas un choix
   d'architecture : sa disparition est un critère de clôture de la migration.

---

## 8. Stratégie de fontes — décision inversée après mesure

**J'avais recommandé `@font-face` manuel en affirmant que le chargeur intégré
séparerait nécessairement l'italique. C'était faux, et la mesure le montre.**

Un banc de comparaison a rendu les deux stratégies côte à côte, sur le même
spécimen, avec mesure de la largeur du texte par `Range` — la seule façon de
distinguer une italique authentique d'une oblique synthétisée, et de vraies
petites capitales d'une simulation.

| Critère                      | `next/font/local` (tableau de fichiers)      | `@font-face` manuel               |
| ---------------------------- | -------------------------------------------- | --------------------------------- |
| Italique authentique         | **Oui** — écart de −7,8 % sur la largeur     | Oui — −7,8 %                      |
| `smcp` conservé              | **Oui** — +23,6 %                            | Oui — +23,6 %                     |
| `c2sc` conservé              | Oui                                          | Oui                               |
| Synthèse du navigateur       | Aucune                                       | Aucune                            |
| Poids transféré              | Identique, au kilo-octet près                | Identique                         |
| Empreinte dans le nom        | **Oui**, automatique                         | Non — à poser à la main           |
| Cache                        | **`max-age=31536000, immutable`**            | `max-age=0` sans règle d'en-têtes |
| Métriques de repli           | **Famille de repli générée automatiquement** | À écrire à la main                |
| Décalage de mise en page     | **0,0001**                                   | Non mesuré séparément             |
| Granularité du préchargement | Par déclaration, pas par fichier             | **Par fichier**                   |

`next/font/local` accepte plusieurs graisses **et** l'italique dans une seule
famille : l'italique reste authentique, et les fonctionnalités OpenType du
sous-ensemble sont intégralement conservées.

**Décision : `next/font/local`.** Le cache immuable, l'empreinte de contenu et
les métriques de repli automatiques sont des gains de production que le
`@font-face` manuel n'obtient qu'au prix d'une machinerie à maintenir. Le seul
recul est la granularité du préchargement : préchargez Spectral et vous
préchargez son italique, soit **+28,1 kB sur les pages qui ne l'emploient pas**.

**Réglage retenu** : Spectral en `preload: true` (romain, gras, italique — 84,2 kB),
Fira Sans et Fira Mono en `preload: false`. C'est **moins d'octets préchargés**
que les quatre fichiers du prototype (101 kB), au prix d'un léger retard
d'affichage sur la sans-serif de bandeau, que `font-display: swap` et les
métriques de repli couvrent sans décalage mesurable.

**Le script de découpe entre au dépôt** : le sous-ensemble et les fonctionnalités
OpenType conservées (`smcp`, `c2sc`, `tnum`, `onum`, `lnum`) ne doivent pas
dépendre d'une manipulation manuelle.

---

## 9. Optimisation des images

Le prototype emploie `<img>` brut, volontairement, pour mesurer le poids réel :
**228,7 kB pour une photographie affichée à 600 px de large**. Inacceptable en
production.

| Mesure                                                                          | Effet attendu                                                                 |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Composant d'image de Next, avec `sizes` renseigné par gabarit                   | Sert la largeur réelle, en AVIF ou WebP selon le navigateur                   |
| Largeurs déclarées par famille — panoramique 3:1 en tête, portrait 4:3 en corps | Évite de servir 1 200 px pour un cadre de 600                                 |
| `priority` sur la seule planche au-dessus de la ligne de flottaison             | Une image prioritaire par page, jamais deux                                   |
| Étalonnage par filtre CSS conservé                                              | Aucun retraitement des fichiers sources — le registre sombre reste ajustable  |
| Registre des crédits inchangé                                                   | Auteur, licence et source restent portés par le contenu, pas par le composant |

**Cible mesurable** : moins de 120 kB par photographie servie à 800 px, contre
228,7 kB aujourd'hui.

---

## 10. Découpe en lots

Chaque lot est un commit vert, réversible, et livrable seul.

| Lot     | Contenu                                                                                                                             | Visible ?                  |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| **M1**  | Jetons PLANCHE ajoutés à côté des existants + tests de contraste                                                                    | Non                        |
| **M2**  | Fontes auto-hébergées, script de découpe, cache, retrait de Geist et Archivo                                                        | Oui — changement de police |
| **M3**  | Groupe de routes `(planche)`, layout racine, gabarit, bandeau et pied ; retrait du pansement `:has`                                 | Oui — la bascule           |
| **M4**  | Primitives : boutons, tableaux, encadrés, légendes ; retrait des ombres et rayons                                                   | Oui                        |
| **M5**  | La Leçon — 14 leçons                                                                                                                | Oui                        |
| **M6**  | La Planche d'identification — 442 fiches                                                                                            | Oui                        |
| **M7**  | Le Dossier — hubs et index                                                                                                          | Oui                        |
| **M8**  | Le Banc — entraînement, quiz, progression                                                                                           | Oui                        |
| **M9**  | Le Cahier, puis La Situation                                                                                                        | Oui                        |
| **M10** | Accueil, recherche, espace authentifié ; suppression des styles historiques ; réécriture de `design-system.md` et `ui-framework.md` | Oui                        |

**Après chaque lot** : `npm run check` vert, captures de référence prises, suites
fonctionnelles inchangées et vertes.

---

## 11. Ce qui ne change pas

Pour lever toute ambiguïté : la migration est **visuelle**. Elle ne touche ni le
contenu, ni les schémas de données, ni les moteurs de quiz, de progression, de
recherche ou de psychotechnique. Un lot qui exigerait de modifier l'un d'eux
n'est pas un lot de migration — c'est un chantier séparé, et il attend.

---

_Aucune migration n'a été commencée pour écrire ce document._

---

## 12. Lot M1 — livré le 2026-07-28

### Fichiers modifiés

| Fichier                                  | Nature                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------ |
| `src/styles/planche-tokens.css`          | **Nouveau** — les jetons, de portée `.planche`                                       |
| `src/lib/design/planche-tokens.ts`       | **Déplacé** depuis `src/lib/design-lab/` — le module devient un module de production |
| `src/lib/design/planche-tokens.test.ts`  | **Déplacé**, et **étendu** de 3 tests                                                |
| `src/app/globals.css`                    | Une ligne : l'import de la feuille de jetons                                         |
| `src/app/design-lab/planche/planche.css` | Cibles tactiles à 44 px, métadonnées mobiles, renvoi vers la source des valeurs      |
| `e2e/design-lab-planche.spec.ts`         | 5 tests de pointeur grossier                                                         |
| `docs/design-manifesto.md`               | Doctrine de justure corrigée, cibles tactiles, métadonnées mobiles                   |
| `docs/design-migration.md`               | Stratégie de fontes inversée, coexistence des layouts racine, ce chapitre            |

### Jetons introduits

Trente-quatre variables CSS sous `.planche`, en deux registres : trois fonds,
trois encres, deux filets, six encres de module, trois états — plus six jetons de
rythme et de grille. **Aucun sur `:root`.**

### Tests ajoutés

| Test                                                 | Ce qu'il garantit                                                                                                                         |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `la feuille de jetons et le module ne divergent pas` | Les 17 couleurs du CSS valent celles du TypeScript, dans les deux registres. Sans lui, une correction d'un côté dériverait en silence.    |
| `les jetons ne sont jamais posés sur :root`          | La garantie d'invisibilité du lot, tenue par une assertion et non par la vigilance.                                                       |
| 5 tests de pointeur grossier                         | 44 px sans chevauchement sur les trois écrans, métadonnées ≥ 12,5 px, et **le corps de lecture jamais réduit** pour atteindre la justure. |

Total : **39 tests** sur les jetons, **48 tests** Playwright sur le prototype.

### Preuve que le rendu public est inchangé

Quatorze captures pleine page — accueil, hub EOPAN, fiche appareil, cours,
psychotechnique, recherche, dictionnaire — en 1440 px et 390 px, comparées
**pixel par pixel** entre un build de la révision précédente et un build de M1,
tous deux reconstruits **cache vide** pour éliminer le bruit d'outillage.

| Résultat                        |                                                                       |
| ------------------------------- | --------------------------------------------------------------------- |
| Captures identiques au bit près | **13 sur 14**                                                         |
| Écart résiduel                  | **5 pixels sur 7,4 millions**, sur la seule fiche appareil            |
| Amplitude de l'écart            | **±2 sur 255**, un canal                                              |
| Localisation                    | Dans la photographie optimisée, sur la page la plus longue (5 172 px) |

Deux témoins encadrent la mesure : le **même build capturé deux fois** donne 0
pixel d'écart, et **deux builds successifs de la même source** donnent 0 pixel.
L'écart résiduel n'est donc ni de l'instabilité de capture ni de l'instabilité de
build : il vient du ré-encodage d'une photographie par l'optimiseur d'images.

**Je ne peux donc pas écrire « strictement inchangé » au sens du bit.** Ce que la
mesure établit : aucune modification de mise en page, aucune modification de
couleur, aucun texte déplacé — 5 pixels imperceptibles dans une image, sur une
page sur sept.

### Procédure d'annulation

M1 est un commit unique et sans dépendance. L'annuler :

```
git revert <sha-du-lot-M1>
npm run check
```

Rien d'autre n'est à défaire : aucune migration de données, aucun contenu
touché, aucune route publique modifiée. Si seule la partie production doit
partir en gardant le prototype, il suffit de retirer la ligne d'import de
`src/app/globals.css` et de supprimer `src/styles/planche-tokens.css` — la
feuille n'est référencée nulle part ailleurs.

---

## 13. Lot M2 — livré le 2026-07-28

### 13.1 Inventaire des références à Geist et Archivo

**Produit avant toute ligne de code, et il commande la suite.**

| Référence                 | Occurrences  | Où                                                                         |
| ------------------------- | ------------ | -------------------------------------------------------------------------- |
| Import `next/font/google` | 1            | `src/app/layout.tsx` — les trois familles                                  |
| Variables CSS déclarées   | 3            | `--font-sans`, `--font-geist-mono`, `--font-display`                       |
| Jetons Tailwind dérivés   | 3            | `--font-sans`, `--font-mono`, `--font-heading` dans `globals.css`          |
| `className` de police     | **36**       | 20 × `font-mono`, 14 × `font-heading`, 1 × `font-sans`, 1 × `font-display` |
| Fichiers concernés        | 23           | Composants d'interface, de contenu, entraîneurs psychotechniques, pages    |
| Application globale       | **2 règles** | `body { @apply font-sans }` et `h1, h2 { @apply font-heading }`            |
| Tests                     | 0            | Aucun test ne référence ces polices                                        |
| Storybook                 | —            | Le projet n'en a pas                                                       |
| Documentation             | 6            | `design-system.md`, deux docs éditoriales, deux skills, ce plan            |

**Verdict : la suppression est impossible.** Les deux règles de `globals.css`
appliquent Geist au corps de **toutes** les pages et Archivo à **tous** les
titres de niveau 1 et 2 — soit les **50 routes publiques**. Le compteur de
références ne peut atteindre zéro qu'après la migration de la dernière famille.

**Geist et Archivo restent donc en place, intactes.** M2 ne les touche pas.

### 13.2 Ce que M2 a fait

Les trois familles PLANCHE sont installées via `next/font/local` et appliquées
**au seul design-lab**. Le gabarit racine de production n'a pas changé d'une
ligne.

| Livrable           | Emplacement                                                 |
| ------------------ | ----------------------------------------------------------- |
| Fichiers de fontes | `src/fonts/planche/*.woff2` — 7 fichiers, **186,6 kB**      |
| Licences           | `public/fonts/planche/OFL-{spectral,firasans,firamono}.txt` |
| Script de découpe  | `scripts/build-planche-fonts.mjs`, avec un mode `--verify`  |
| Déclarations       | `src/lib/design/planche-fonts.ts`                           |

Le script est **reproductible au bit** : `SOURCE_DATE_EPOCH` fige l'horodatage
que fontTools inscrirait dans la table `head`. Sans lui, deux exécutions
produisaient des fichiers différents et `--verify` ne pouvait rien affirmer —
défaut trouvé et corrigé pendant le lot. Le script **échoue** si `smcp` manque
après découpe d'une fonte de lecture : la charte interdisant la synthèse, une
telle fonte serait inutilisable.

### 13.3 Poids préchargé par archétype

| Archétype      | Préchargé PLANCHE                | Chargé PLANCHE       | Hérité (gabarit racine)           |
| -------------- | -------------------------------- | -------------------- | --------------------------------- |
| La Leçon       | 3 fichiers Spectral, **84,2 kB** | 6 fichiers, 157,5 kB | 3 fichiers Geist/Archivo, 85,3 kB |
| Fiche appareil | 3 fichiers Spectral, **84,2 kB** | 7 fichiers, 186,7 kB | idem                              |
| Le Banc        | 3 fichiers Spectral, **84,2 kB** | 6 fichiers, 157,5 kB | idem                              |

Toutes les fontes PLANCHE sont servies en `public, max-age=31536000, immutable`
avec une empreinte de contenu dans le nom — deux gains que le `@font-face`
manuel n'obtenait pas. Les 85,3 kB hérités disparaîtront avec le gabarit racine
séparé, au lot M3.

### 13.4 Vérifications typographiques

| Contrôle                        | Résultat                                                                  |
| ------------------------------- | ------------------------------------------------------------------------- |
| Italique authentique            | **−7,8 %** de largeur — une oblique synthétisée ne change pas les chasses |
| Petites capitales               | **+26,1 %** — une synthèse ne changerait presque rien                     |
| Décalage cumulé de mise en page | **0,0001**                                                                |

> **Une erreur de mesure a failli passer.** La première sonde plaçait son
> élément témoin sur `document.body`, hors de `.pl-root` : `--pl-serif` n'y
> existe pas, la déclaration devenait invalide, et l'on mesurait la police
> héritée. Résultat affiché : « italique : synthèse ». Faux. La sonde vit
> désormais sous `.pl-root`, et le test Playwright fait de même.

### 13.5 Preuve que les routes non migrées sont inchangées

Quatorze captures pleine page, M1 contre M2 :

| Résultat               |                                                          |
| ---------------------- | -------------------------------------------------------- |
| Identiques au bit près | **12 sur 14**                                            |
| Écart résiduel         | **8 pixels**, sur deux pages                             |
| Amplitude              | **±2 sur 255**                                           |
| Localisation           | Photographies optimisées, jamais du texte ni une bordure |

Même signature que le résidu de M1 : le ré-encodage d'image par l'optimiseur.
Aucune mise en page, aucune couleur d'interface, aucun texte n'a bougé — ce qui
était attendu, puisque **aucun fichier de production n'a été modifié** hors le
déplacement des fontes hors de `public/`.

### 13.6 Procédure d'annulation

```
git revert <sha-du-lot-M2>
npm run check
```

Aucune dépendance : les fontes ne sont référencées que par
`src/lib/design/planche-fonts.ts`, lui-même importé par le seul gabarit du
design-lab. Pour ne retirer que le chargeur en gardant les fichiers, il suffit
de rétablir les `@font-face` dans `planche.css` — le lot précédent en contient
la forme exacte.

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
| 2    | **La Planche d'identification** — fiches techniques | Volume le plus élevé (238 fiches, dont 75 véritables notices) mais gabarit unique et déjà prototypé. Le gain de lisibilité y est immédiat.                                 |
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
| **M6**  | La Planche d'identification — 238 fiches, dont 75 notices                                                                           | Oui                        |
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

---

## 14. Lot M3 — livré le 2026-07-28

Architecture **B** : une racine commune minimale, un groupe historique `(site)`,
un groupe PLANCHE `(planche)`. C'est le lot de la bascule : la première route
publique change de charte.

### 14.1 Arborescence, avant et après

```
AVANT                              APRÈS
src/app/                           src/app/
├── layout.tsx  ← fontes + chrome  ├── layout.tsx        ← html/body/thème seulement
├── page.tsx                       ├── (site)/           ← 49 routes, charte historique
├── (auth)/ …                      │   ├── layout.tsx    ← Geist, Geist Mono, Archivo
├── [module]/ …                    │   ├── page.tsx
├── bia/ …                         │   ├── (auth)/ [module]/ bia/ …
├── cours/[slug]/                  │   └── … (24 segments déplacés)
├── … 24 segments                  ├── (planche)/        ← 1 route, système PLANCHE
├── design-lab/                    │   ├── layout.tsx    ← Spectral, Fira Sans, Fira Mono
└── globals.css                    │   └── cours/[slug]/
                                   ├── design-lab/
                                   └── globals.css
```

Les groupes **n'apparaissent pas dans l'URL** : `/cours/couche-limite-et-decrochage`
répond à la même adresse qu'avant. Les 492 URL du plan du site sont inchangées.

### 14.2 Fichiers déplacés

`git mv` sur **24 segments de route** (57 fichiers) vers `src/app/(site)/`, puis
`src/app/(site)/cours/[slug]` vers `src/app/(planche)/cours/[slug]`. Le
déplacement est enregistré comme un renommage : l'historique Git suit.

La feuille `planche.css` a quitté `src/app/design-lab/planche/` pour
`src/styles/planche.css` — un seul fichier désormais, importé par les deux
gabarits qui en ont besoin. Le **pansement `body:has(.pl-root) > header, > footer`
a disparu** : le chrome historique n'est plus monté sur ces routes, il n'y a
plus rien à masquer.

### 14.3 Fichiers réellement modifiés

| Fichier                               | Ce qui change                                                     |
| ------------------------------------- | ----------------------------------------------------------------- |
| `src/app/layout.tsx`                  | réduit à `html`/`body`/thème/service worker ; plus aucune fonte   |
| `src/app/(site)/layout.tsx`           | **neuf** — Geist, Geist Mono, Archivo, `SiteHeader`, `SiteFooter` |
| `src/app/(planche)/layout.tsx`        | **neuf** — fontes PLANCHE, bandeau, pied de page                  |
| `src/app/globals.css`                 | `html`/`h1, h2` → `.site-root`/`.site-root h1, h2`                |
| `src/app/(planche)/cours/[slug]/…`    | gabarit PLANCHE ; URL, contenu et métadonnées inchangés           |
| `src/components/planche/*`            | **neuf** — ossature promue du prototype + bandeau, pied, registre |
| `src/styles/planche.css`              | déplacé, dédoublonné, `.pl-univers` ajouté                        |
| `src/features/design-lab/planche.tsx` | réexporte l'ossature commune ; ne garde que son bandeau           |
| `src/lib/navigation.test.ts`          | la résolution d'URL traverse les répertoires parenthésés          |
| `e2e/planche-groupe.spec.ts`          | **neuf** — 12 tests de coexistence                                |

### 14.4 Deux défauts que seule la capture a montrés

**La grille écrasée.** Le premier gabarit posait `.pl-root` deux fois — une fois
pour le chrome, une fois pour la planche. Les règles de gabarit sont écrites en
descendance (`.pl-root[data-marge="none"] .pl-page`) : le conteneur externe, en
marge `none`, a donc imposé sa grille à deux colonnes à la page interne. La
colonne de corps est tombée de 620 à 280 px et l'annexe a basculé sous la marge.
Le conteneur de groupe porte désormais `.pl-univers`, qui déclare les mêmes
jetons **sans** hériter des sélecteurs de gabarit.

**Le pied de page décroché.** `<body>` est une colonne flex en `min-h-full` et
c'est `<main>` qui portait le `flex-1`. Le conteneur de groupe s'intercalant
entre les deux, il devait grandir à leur place : posé en `min-h-full`, il
laissait le pied remonter de **258 px** sur les pages courtes. `flex-1` rétablit
le comportement exact d'avant — et c'est la comparaison pixel, pas la relecture,
qui l'a trouvé.

### 14.5 Preuve pixel des routes non migrées

Méthode : un `git worktree` sur le commit précédent, construit et servi sur le
port 3100 ; le lot servi sur le port 3000 ; **34 captures pleine page** prises
dans la même exécution, à deux largeurs.

| Résultat                             |                                        |
| ------------------------------------ | -------------------------------------- |
| Routes non migrées identiques au bit | **32 sur 32**                          |
| Route migrée                         | 2 captures, différentes — c'est le lot |

`/credits-photos` a d'abord montré un écart : des vignettes non décodées sur le
serveur fraîchement démarré, cache d'optimiseur froid. Trois répétitions à cache
chaud des deux côtés donnent **0 pixel d'écart** — même signature que le
faux écart de M1, et la même leçon : contrôler la mesure avant de conclure.

### 14.6 Navigation, thème, défilement

Témoin de persistance : un jeton réécrit à chaque analyse de document. S'il
survit, le document n'a pas été rechargé. Il vit dans le harnais de test
(`addInitScript`), pas dans le bundle publié.

| Parcours                 | Résultat          |
| ------------------------ | ----------------- |
| `/bia/[matiere]` → leçon | navigation client |
| leçon → `/bia/[matiere]` | navigation client |
| retour arrière           | navigation client |
| leçon → leçon            | navigation client |

Thème posé sur une route historique, retrouvé sur la route PLANCHE (`.dark` et
registre sombre `#10141a`). Défilement : haut de page à l'aller, position
restaurée au retour — identique à avant.

### 14.7 Ressources chargées par groupe

| Route              | Fontes chargées                                 | Feuilles             |
| ------------------ | ----------------------------------------------- | -------------------- |
| `/cours/[slug]`    | Spectral 400/600/400-italic — **rien d'autre**  | globale + PLANCHE    |
| `/bia/…` et les 48 | trois fichiers Geist/Archivo — **rien d'autre** | globale + historique |

Aucune fuite dans un sens ni dans l'autre ; deux tests Playwright le tiennent.

**Poids de la leçon : 516 kB → 88 kB de HTML.** L'essentiel de la baisse est
l'index de recherche sérialisé, que le bandeau PLANCHE ne porte pas — mesuré à
**431 kB par page**.

### 14.8 SEO, PWA, liens internes

- Plan du site, `robots.txt` et manifeste : **octet pour octet identiques**.
- Les **14 leçons** gardent titre et description à l'identique.
- Aucune balise canonique n'existe sur le site, ni avant ni après.
- `/cours/*` n'est pas dans le plan du site — c'était déjà le cas ; à traiter
  dans un lot SEO, pas ici.
- Service worker : le composant d'enregistrement vit dans la racine commune,
  donc monté à l'identique des deux côtés ; état d'enregistrement mesuré
  identique sur les deux groupes.
- **Un seul lien avait disparu** : `/connexion`, que le bandeau PLANCHE ne
  portait pas. `AuthStatus` y est monté tel quel — le lot ne migre pas
  l'authentification, mais il n'a pas le droit de la faire disparaître.

### 14.9 Ce que M3 n'a pas fait, et pourquoi

- **`CourseExperience`** — progression, interaction, quiz — garde son habillage
  historique. Composant client partagé avec d'autres familles : sa mise en
  PLANCHE est le lot M5, pas un lot d'architecture.
- **La palette de recherche** n'est pas dans le bandeau PLANCHE : son index
  sérialisé pèse 431 kB par page. Le bandeau porte un **lien vers `/recherche`**
  — quelques octets, la recherche à un clic — et un test interdit le retour de
  l'index en plafonnant le HTML de la leçon à 200 kB.
- **`AuthStatus`** est monté avec ses boutons historiques : le remplacer
  supposerait de dupliquer la logique de session.

### 14.10 Deux tests rouges, antérieurs au lot

`preparation.spec.ts` et `revision.spec.ts` échouent — **à l'identique sur le
commit précédent**, vérifié en servant les deux versions côte à côte. Le repère
`region « Ma préparation »` n'existe plus dans `src/` : le test survit à une
fonctionnalité déplacée. Corriger cela demande de toucher une fonctionnalité
sans rapport avec le gabarit ; ce sera un lot à part.

Ils **ne font pas partie de `npm run check`**, qui enchaîne `lint`, `typecheck`,
`format:check` et `vitest run` — la suite Playwright s'exécute séparément par
`npm run test:e2e`. Commande, dette et question de porte de qualité sont
consignées dans `docs/roadmap.md`, section « Dette antérieure à M3 ».

### 14.11 Procédure d'annulation

```
git revert <sha-du-lot-M3>
npm run check
```

Le lot est un seul commit et ne touche ni contenu, ni schéma, ni migration SQL.
Le retour arrière remet les 24 segments à leur place et rétablit `html { @apply
font-sans }`. Pour ne retirer que la bascule publique en gardant l'architecture,
il suffit de rendre `cours/[slug]` au groupe `(site)` : les deux gabarits
coexistent sans lui.

---

## 15. Lot M4 — livré le 2026-07-28

Les primitives, puis la mise en PLANCHE de ce que la leçon monte : le relevé de
progression, les étapes, et les **sept interactions pédagogiques**.

### 15.1 Périmètre tenu

| Touché                                     | Non touché                               |
| ------------------------------------------ | ---------------------------------------- |
| `/cours/[slug]` — les 14 leçons            | les 49 routes historiques                |
| `CourseExperience` (montage unique)        | `QuizPlayer` — **0 ligne**               |
| `Interactive`, `InteractionSlot`           | `src/components/ui/*` — **0 ligne**      |
| les 7 interactions, **présentation seule** | les 7 modèles `*-model.ts` — **0 ligne** |

Vérification mécanique : `git diff -- src/features/quiz/ src/components/ui/
src/features/interactions/*-model.ts` rend **zéro ligne**.

### 15.2 Primitives extraites — et celles qui ne l'ont pas été

`src/components/planche/planche-commandes.tsx` : `PlancheBouton`,
`PlancheChoix` (radios), `PlancheCases` (cases), `PlancheCurseur`. Toutes
reposent sur des éléments natifs — le clavier, les rôles et les noms
accessibles viennent du navigateur, jamais d'un `role=` posé à la main.

`.pl-tab` et `.pl-legende` **restent des classes du laboratoire** : aucune
route publique ne les emploie encore, et l'on ne fige pas une API de
production pour personne. Elles entreront au catalogue avec La Planche
d'identification (M6).

### 15.3 Le bloc hôte — comment on ne restyle pas ce qu'on ne migre pas

`QuizPlayer` est déposé dans un `<div class="pl-hote">` qui lui donne un titre,
des filets et un rythme, **sans un seul sélecteur qui entre dedans**. Mieux :
la règle du corps a été rétrécie pour ne pas le franchir.

```css
.pl-corps p:not(.pl-hote *, .pl-manip *) { … }
```

C'est une règle **négative** : elle n'habille pas le quiz, elle empêche PLANCHE
de l'habiller. Sans elle, `.pl-corps p` imposait déjà, depuis M3, sa serif de
17 px aux paragraphes du lecteur de quiz — une fuite silencieuse, corrigée ici.

### 15.4 Les figures : la couleur, jamais la géométrie

Dix-sept familles de classes de couleur remappées vers les jetons PLANCHE
(`fill-primary` → `pl-f-mod`, `stroke-foreground` → `pl-t-encre`, …). **Aucun
attribut `d`, `points`, `x`, `y`, `viewBox` n'a bougé** : le dessin appartient
au chantier « Système d'illustration technique ».

Nouveau test unitaire : les couleurs de tracé sont mesurées **sur `fond2`**, le
fond du cadre `.pl-fig`, et non sur le fond de page — une couleur validée sur
le papier ne l'est pas d'office sur le creux. Les deux registres tiennent
leurs seuils (4,5:1 pour les libellés, 3:1 pour les traits).

### 15.5 Deux défauts pré-existants, trouvés à la capture

**Les libellés empâtés.** Un `<text>` placé dans un `<g stroke=… strokeWidth=2>`
héritait du trait : « Portance », « Poids », « Traction » sortaient
bavocheux — **avant ce lot déjà**, capture comparative à l'appui. Une ligne de
CSS (`.pl-fig text { stroke: none }`) les rend nets, sans toucher un tracé.

**Le libellé du col qui percute la paroi.** Sur l'effet Venturi, « col · V₂ =
20 m/s » chevauche le conduit. La capture du commit précédent montre le même
chevauchement : c'est une géométrie de figure, pas une typographie. **Laissé au
chantier illustration**, conformément à l'arbitrage « aucun SVG redessiné ».

### 15.6 Une amélioration d'accessibilité, assumée

Le nom accessible du curseur incluait sa valeur (« Angle d'incidence : 6° ») :
il changeait à chaque flèche et se faisait relire en entier. La valeur est
sortie du `<label>` et portée par `aria-valuetext`. Le nom est stable, la
valeur reste annoncée — ce qu'attend une technologie d'assistance d'un curseur.

### 15.7 Preuves

| Contrôle                                                        | Résultat                     |
| --------------------------------------------------------------- | ---------------------------- |
| Routes non migrées, pixel (worktree sur M3, servi en parallèle) | **32 sur 32 identiques**     |
| Tests unitaires                                                 | 637 verts, dont 43 de jetons |
| Par interaction × 2 projets (bureau, tactile)                   | 6 tests × 7 × 2, tous verts  |
| Scan axe des 14 leçons                                          | aucune violation             |
| Scan axe des 7 interactions, clair **et** sombre                | aucune violation             |
| Cibles tactiles des commandes                                   | ≥ 44 px, 7 sur 7             |
| Débordement horizontal à 390 / 834 / 1440                       | 0 px, 7 sur 7                |

Comme en M3, le résidu apparu au premier passage (`/eopan`, `/credits-photos`)
n'était qu'un cache d'optimiseur d'images froid : caches chauds des deux côtés,
l'écart tombe à **0 pixel**. Le contrôle « même build, deux exécutions » est
lancé avant toute conclusion.

### 15.8 Une erreur de méthode, et sa correction

Le remappage des couleurs a d'abord été fait par un script qui normalisait
aussi les espaces. Il a transformé `{" "}` en `{""}` — c'est-à-dire **supprimé
des espaces rendus**, dans sept fichiers. Un changement de contenu, exactement
ce que le lot s'interdit. Trouvé en **lisant le diff**, pas en lançant les
tests : aucune suite n'aurait signalé un espace manquant entre deux mots.

Les sept fichiers ont été rendus à leur état commité, puis repris avec un
script dont la normalisation ne s'applique qu'à l'intérieur d'un `className`.
Leçon : un remplacement mécanique sur du JSX doit connaître la syntaxe qu'il
touche, ou se limiter à ce qu'il sait délimiter.

### 15.9 Ce que M4 n'a pas fait

- **`QuizPlayer`** garde son habillage : partagé avec `/reviser`,
  `/bia/[matiere]` et la prévisualisation. La couture est visible dans la
  leçon et assumée jusqu'au lot du Banc.
- **`AuthStatus`** garde ses boutons historiques (lot M3).
- **Les tracés** ne sont pas redessinés.

### 15.10 Procédure d'annulation

```
git revert <sha-du-lot-M4>
npm run check
```

Un seul commit. Aucun contenu, schéma, migration SQL ni identifiant touché ;
aucune logique métier modifiée. Pour ne retirer que l'habillage des
interactions en gardant les primitives, il suffit de rétablir `interactive.tsx`
dans sa forme précédente : les sept composants n'appellent que ses props.

---

## 16. Lot M5 — livré le 2026-07-28

La famille **La Leçon** achevée : la cote gelée, le sommaire ancré, le bloc
« Voir aussi », le sas de sortie. Toujours sur `/cours/[slug]` et ses quatorze
leçons, et sur rien d'autre.

### 16.1 La cote quitte le calcul pour le référentiel

Avant M5, la page composait `FOND · AERO.07` au rendu, depuis la matière BIA et
le rang du cours. Deux défauts : la grammaire n'était pas celle de l'archétype,
et surtout **la valeur dépendait du tri courant** — insérer une leçon aurait
décalé les suivantes, et une référence notée sur un cahier aurait cessé de
désigner la même page.

Les quatorze cotes ont été engendrées **une fois** depuis la hiérarchie, puis
inscrites dans `content/_referentiels/cotes.json`. Le rendu les lit. Une leçon
sans cote fait **échouer le build** plutôt que d'afficher un vide.

|                                                    |                            |
| -------------------------------------------------- | -------------------------- |
| `forces-et-lois-de-newton`                         | `FOND · B.1.01`            |
| `pression-et-ecoulement` → `stabilite-et-centrage` | `FOND · B.3.02` → `B.3.14` |

La première leçon relève de la catégorie **Physique utile** (rang 1), les treize
autres d'**Aérodynamique** (rang 3) : le `C` de la cote le dit, et c'est
précisément ce qu'une cote dérivée du seul rang BIA masquait.

### 16.2 Le sommaire ancré, par amélioration progressive

| Couche  | Ce qu'elle apporte                | Sans elle                   |
| ------- | --------------------------------- | --------------------------- |
| Serveur | les ancres, le libellé, le numéro | —                           |
| Client  | le repère de section courante     | la navigation reste entière |

Un test s'exécute dans un contexte **`javaScriptEnabled: false`** : le sommaire
y est visible, ses liens fonctionnent, l'ancre atteint sa cible. C'est le seul
test qui distingue une amélioration progressive d'un composant client déguisé.

Le repère n'écrit **jamais** dans l'URL. Un sommaire qui pousse un hash à chaque
section remplit l'historique et rend le bouton « retour » inutilisable ; un test
vérifie que le hash reste vide après trois défilements.

### 16.3 Trois défauts trouvés en exécutant, pas en relisant

**Le repère qui s'éteint.** La première version observait une bande étroite : un
titre la traverse en une fraction de seconde, et dès qu'on s'arrêtait de défiler
entre deux titres, plus rien n'était marqué. La section courante est désormais
**la dernière dont le titre est passé** au-dessus du quart haut — une propriété
de position, pas un événement fugace.

**Le repère bloqué en bas de page.** Le dernier titre ne franchit jamais la
ligne : le document ne peut plus défiler. Une sentinelle posée sur le pied de
planche rend l'événement manquant.

**Le défilement doux qui survit à son correctif.** `scroll-behavior: smooth`
était déclaré après le bloc `prefers-reduced-motion` censé le neutraliser : même
spécificité, la dernière règle gagnait. Il est maintenant déclaré **uniquement**
sous `@media (prefers-reduced-motion: no-preference)`, ce qui ne dépend plus de
l'ordre du fichier. Le test lisait `smooth` là où il attendait `auto` : sans
lui, le défaut partait en production.

### 16.4 Une source unique pour la numérotation

La page codait ses numéros de paragraphe en dur (`numero={1}`…) tandis que le
sommaire les dérivait. Deux sources pour un même numéro, donc deux réponses
possibles. La page **lit désormais** ses numéros dans le sommaire
(`numeroDeSection`) : le désaccord n'est plus représentable.

Au passage, la section « Prérequis » reste au sommaire même vide : elle dit
alors « Aucun — c'est le point de départ », ce qui est une information et non
un vide.

### 16.5 Le sas de sortie

« → 14 questions portent sur cette leçon », vers `#se-tester`. Le compte est
celui du **vivier réellement jouable**, pas de la liste déclarée : une question
citée dans un format non jouable ne serait pas au rendez-vous. Un test compare
le nombre annoncé au compteur du lecteur de quiz sur la même page. Singulier et
pluriel accordés ; rien d'affiché quand le compte est nul.

### 16.6 Ce que M5 n'a pas fait

- **L'encadré Piège** n'est pas alimenté depuis `fiche.content.pieges` : les
  fiches sont référencées, jamais recopiées. Il attendra que la leçon porte sa
  propre donnée canonique.
- **La prose des fiches** n'est pas rendue dans la leçon, pour la même raison.
- **`QuizPlayer`** reste dans son bloc hôte, intouché.

### 16.7 Preuves

| Contrôle                                                        | Résultat                                           |
| --------------------------------------------------------------- | -------------------------------------------------- |
| Routes non migrées, pixel (worktree sur M4, servi en parallèle) | **32 sur 32 identiques**                           |
| Tests unitaires                                                 | 667 verts, dont 6 sur la cote et 9 sur le sommaire |
| Suite de bout en bout de la famille                             | 24 verts sur deux projets                          |
| Sommaire sans JavaScript                                        | ancres visibles et fonctionnelles                  |
| Hash de l'URL pendant le défilement                             | inchangé                                           |
| `prefers-reduced-motion`                                        | `scroll-behavior: auto`                            |
| Débordement à 390 / 834 / 1440                                  | 0 px                                               |
| Suite complète                                                  | 360 verts, 3 rouges — les mêmes qu'avant M5        |

Les trois rouges restants sont la dette consignée dans `docs/roadmap.md`
(`preparation.spec.ts`, `revision.spec.ts`), inchangée.

### 16.9 Sémantique de la cote — arrêtée après M5

Question posée à la validation : le dernier segment est-il un rang **global**
ou un rang **par catégorie** ? Réponse : **global**, et c'est volontaire.

```
FOND · B.3.02
 │      │ │ └── NN — rang dans le PARCOURS, deux chiffres. Global au module.
 │      │ └──── C  — rang de la catégorie dans categories.json (3 = Aérodynamique).
 │      └────── F  — lettre de famille (B = Cours).
 └───────────── MODULE propriétaire (FOND = Fondamentaux).
```

Un rang par catégorie ferait porter le même `NN` à deux documents de catégories
différentes : « la leçon 3 » deviendrait ambigu, à l'oral comme dans une marge
de cahier. Le rang global garde une référence pour un document et un seul.

La conséquence visible est assumée : `pression-et-ecoulement` est la **1re**
leçon d'Aérodynamique mais la **2e** du parcours — elle porte `B.3.02`, jamais
`B.3.01`. Trois tests énoncent la règle : le `NN` vaut le rang de parcours, le
`C` vaut le rang de catégorie déclaré, et les `NN` se suivent sans trou.

**Le slug n'est qu'une clé.** Un changement de slug ou d'URL **ne modifie jamais
la cote**. La correspondance doit être explicitement migrée ou conservée : on
renomme la clé du référentiel en gardant la valeur. Entre-temps, deux tests
tombent — la leçon renommée n'a plus de cote, l'ancienne clé devient orpheline.
C'est le mécanisme d'application : la migration est un geste conscient, jamais
un effet de bord.

**Limite connue, à traiter le jour venu.** Les valeurs initiales ont été
engendrées depuis `course.ordre`, qui est unique **par matière BIA**. Les
quatorze leçons partageant aujourd'hui une seule matière, ce rang est de fait
global. Le jour où une leçon naîtra sous une autre matière, `ordre` repartira
à 1 et pourrait entrer en collision. Le test d'unicité l'attrapera, et le
correctif est celui que permet un référentiel gelé : allouer à la main le
prochain `NN` libre. Aucune renumérotation.

### 16.8 Procédure d'annulation

```
git revert <sha-du-lot-M5>
npm run check
```

Un seul commit. Le référentiel de cotes disparaît avec lui — aucune donnée
utilisateur, aucune migration SQL, aucun identifiant de contenu touché. Pour ne
retirer que le sommaire en gardant la cote, il suffit de retirer
`<PlancheSommaire>` de l'annexe : le reste de la page l'ignore.

---

## 17. Lot M6a — livré le 2026-07-28

Le premier des deux commits de M6 : **la route change de groupe, le rendu ne
change pas encore**. La classification documentaire entre au dépôt, la route
de fiche rejoint `(planche)`, et les 238 fiches passent par un composant
explicitement nommé `FicheTransition`.

### 17.1 Un chiffre corrigé

Le plan annonçait « 442 fiches ». Le dépôt en contient **238**. Le 442 venait
du **compte de questions** de la banque (`docs/CHANGELOG.md`, 2026-07-13),
repris par mégarde comme un compte de fiches. Les deux occurrences du plan
sont corrigées.

### 17.2 Une route, quatre familles

`/[module]/[categorie]/[slug]` est une route unique qui sert cinq modules. Or
l'archétype appelé n'est pas le même selon la fiche :

| Famille          | Fiches | Ce que M6b fera                      |
| ---------------- | ------ | ------------------------------------ |
| `identification` | **75** | migrée graphiquement en M6b          |
| `lecon`          | 122    | attend la validation de sa grammaire |
| `cahier`         | 37     | attend M9                            |
| `situation`      | 4      | attend M9                            |

Le périmètre visuel de M6b n'est donc pas 238 pages mais **75**.

### 17.3 La classification vit hors du schéma

`content/_referentiels/archetypes.json` : un défaut par `module/categorie`, des
exceptions par identifiant de fiche. **Le schéma des fiches n'a pas bougé** —
à quelle famille appartient un document est une décision éditoriale, pas une
propriété du contenu.

Deux garanties, vérifiées en les cassant volontairement puis en restaurant :

- **une fiche non classée fait échouer le build.** Retirer `eopan/appareils`
  du référentiel produit `Archétypes : 11 fiche(s) non classée(s)` ;
- **une valeur inconnue est refusée** par l'énumération Zod fermée.

Deux règles mortes sont aussi refusées : une exception qui ne vise aucune
fiche, un défaut pour une catégorie sans contenu. Une règle qui ne s'applique
à rien donne l'illusion d'un classement.

### 17.4 `FicheTransition` — ne pas déguiser ce qui n'est pas migré

Une fiche non migrée **ne doit pas avoir l'air migrée**. `FicheTransition`
porte donc la charte historique telle quelle, dans un bloc `.pl-hote` que la
typographie PLANCHE ne franchit pas.

Trois précautions le rendent honnête :

1. **ses fontes** — Geist et Archivo sont extraites dans
   `src/lib/design/site-fonts.ts` et chargées par le composant. Sans cela, 238
   pages publiées se seraient rendues en Fira Sans, jamais dessinée pour ces
   composants ;
2. **sa portée** — `.site-root` rétablit la typographie de base que le layout
   `(site)` fournissait ;
3. **sa navigation** — l'index latéral des catégories et la barre mobile, que
   la route héritait de `ModuleLayout`, sont **reproduits dans le composant**.
   Changer de groupe ne doit pas coûter une navigation ; sans cette précaution,
   les 238 fiches perdaient leur index de catégorie.

### 17.5 Preuve exhaustive — 238 fiches, avant contre après

Les deux versions servies en parallèle, chaque fiche comparée sur onze
critères : statut HTTP, titre, description, canonique, directive `robots`,
`og:url`, empreinte textuelle du corps, liens internes, liens externes
(sources et crédits), images, et présence du corps.

| Résultat                                |                          |
| --------------------------------------- | ------------------------ |
| Fiches identiques sur tous les critères | **238 sur 238**          |
| Plan du site                            | identique, 492 URL       |
| `robots.txt`                            | identique                |
| Routes hors périmètre, pixel            | **34 sur 34 identiques** |

Ce qui change, et rien d'autre : le **chrome**. `SiteHeader` et `SiteFooter`
laissent place au bandeau et au pied PLANCHE — c'est la conséquence assumée du
déplacement de groupe. La première passe de comparaison l'a d'ailleurs isolée
toute seule : les seuls écarts détectés portaient sur le libellé du bandeau
(« Prépa Pilote » → « PrépaPilote »), la feuille de style et le logo.

Une fiche de transition charge donc **les deux chartes** : trois fichiers
Geist/Archivo et trois Spectral. C'est le coût d'un état transitoire, il se
mesure, et il disparaît fiche par fiche.

### 17.6 Ce que M6a n'a pas fait

- **Aucune cote de fiche** n'est engendrée : elles relèvent de M6b, et seules
  les 75 notices en recevront.
- **Aucun gabarit PLANCHE** n'est appliqué à une fiche.
- **`NotionQuiz`** n'est pas touché — il reste dans le corps historique.
- **Le schéma des fiches**, le contenu, les identifiants et l'index de
  recherche sont inchangés.

### 17.7 Classifications à confirmer avant M6b

M6a rend toutes les familles à l'identique : une erreur de classement n'a donc
aucune conséquence visible aujourd'hui. Elle en aura en M6b. Ces couples
méritent un regard :

| Couple                                   | Classé           | Doute                           |
| ---------------------------------------- | ---------------- | ------------------------------- |
| `*/missions` (9 fiches)                  | `identification` | une mission n'est pas un objet  |
| `*/presentation`, `*/selection` (6)      | `lecon`          | procédural, mais institutionnel |
| `eopan/concepts`, `eopan/procedures` (7) | `lecon`          | notions ou notices ?            |
| `psychotechnique/exercices` (20)         | `lecon`          | méthode ou banc ?               |
| `fondamentaux/culture-aeronautique` (6)  | `cahier`         | récit ou notion ?               |

### 17.8 Procédure d'annulation

```
git revert <sha-du-lot-M6a>
npm run check
```

Le commit est autonome : il rend la route au groupe `(site)`, retire le
référentiel d'archétypes et `FicheTransition`. Aucun contenu, aucun schéma,
aucune migration SQL, aucun identifiant touché. M6b sera un commit distinct,
révocable seul.

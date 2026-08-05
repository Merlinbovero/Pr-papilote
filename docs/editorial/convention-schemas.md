# Convention des croquis pédagogiques

**Document normatif.** Il fait autorité sur tout croquis produit à partir du lot C1. Il remplace la convention du 2026-07-09, dont la palette et les règles typographiques sont conservées au §12.

Contrat machine : [`src/lib/content/figure-meta.ts`](../../src/lib/content/figure-meta.ts). Registre des sources : [`references-schemas.md`](references-schemas.md). Inventaire des besoins : `reports/croquis/inventory.md`, **généré** par `scripts/audit-croquis-inventory.mjs`.

> **Aucun chiffre de ce document n'est saisi à la main.** Les totaux — fiches, croquis, références, orphelins, répartition par statut — vivent dans les rapports générés. Cette règle vient d'une série d'erreurs de comptage recopiées de rapport en rapport pendant les phases C0 et C1.

---

## 1. Finalité — un croquis n'est pas une décoration

Tout croquis remplit une fonction explicite, déclarée dans ses métadonnées :

**comprendre** · **calculer** · **comparer** · **reconnaître** · **localiser** · **mémoriser** · **suivre une séquence** · **interpréter une donnée**

Un visuel qui n'en remplit aucune est supprimé, et **n'est jamais compté dans la couverture scientifique**.

---

## 2. Doctrine scientifique

### 2.1 Les quatre repères, à ne jamais confondre

| Repère            | Définition                                          | Emploi                        |
| ----------------- | --------------------------------------------------- | ----------------------------- |
| **Terrestre**     | Lié au sol ; la verticale est celle de la pesanteur | Poids, altitude, relief       |
| **Avion**         | Lié à la cellule : roulis, tangage, lacet           | Axes, gouvernes, assiette     |
| **Trajectoire**   | Lié au vecteur vitesse                              | Pente, décomposition du poids |
| **Aérodynamique** | Lié au vent relatif                                 | Portance, traînée, incidence  |

**Tout croquis portant une orientation physique déclare lequel il emploie.** Aucun croquis de l'échantillon audité en C0 ne le faisait.

### 2.2 Portée — profil 2D, aile finie, aéronef complet

Un profil (2D), une aile finie et un aéronef complet **ne donnent pas les mêmes valeurs**. Cz max et l'angle critique dépendent de l'allongement et du nombre de Reynolds. Un croquis d'écoulement, de distribution de pression ou de polaire déclare donc sa portée — obligation machine (`scope`, familles F4, F5, F10).

### 2.3 Force, coefficient, grandeur adimensionnelle

- une **force** a une unité (N) et une direction ;
- un **coefficient** (Cz, Cx, Cp) est **sans dimension** et dépend des conditions ;
- un coefficient **n'est pas une force réduite** : passer de l'un à l'autre demande ρ, V et S.

Ne jamais annoter une flèche « Cz ». Ne jamais graduer un axe de force en coefficients.

### 2.4 Qualitatif, analytique, mesuré, simulé

| Nature         | Ce que le croquis montre      | Ce qu'il doit déclarer                                |
| -------------- | ----------------------------- | ----------------------------------------------------- |
| **Qualitatif** | Une tendance, un mécanisme    | Rien de plus                                          |
| **Analytique** | Un modèle et ses conséquences | Hypothèses, domaine                                   |
| **Mesuré**     | Des points expérimentaux      | Conditions (Re, Mach…), source, incertitude si connue |
| **Simulé**     | Un résultat numérique         | Modèle, méthode, domaine                              |

**Une visualisation numérique n'est pas une mesure de soufflerie.** Les présenter de la même façon est une faute.

### 2.5 Obligations générales

1. Déclarer les **simplifications** — une exagération d'échelle est légitime, la taire ne l'est pas.
2. Déclarer le **domaine de validité**.
3. Donner les **unités** de toute grandeur dimensionnée.
4. Citer les **sources**.
5. **Ne jamais présenter une convention graphique comme une loi physique.** Qu'on dessine traditionnellement la portance vers le haut ne fait pas de la portance une force verticale.

### 2.6 Les quatre forces — formulation rigoureuse

Défaut **A-01** de l'audit C0, sur le croquis le plus vu du module fondamentaux.

- le **poids** est vertical **dans le repère terrestre** ;
- la **portance** est définie **perpendiculairement au vent relatif** ;
- la **traînée** est **parallèle et opposée au vent relatif** ;
- la **traction** dépend de l'axe ou de la direction de poussée, qui n'est pas nécessairement celui de la trajectoire ;
- dans un repère lié à la **trajectoire**, le poids se décompose en une composante **longitudinale** et une composante **normale**.

> **« Deux forces verticales et deux forces horizontales » n'est valable que dans un cas particulier explicitement défini** — le vol rectiligne, en palier, stabilisé, sans vent. Hors de ce cas, l'énoncé est faux.

### 2.7 Facteur de charge

`n = 1 / cos φ` ne se présente que pour un virage **coordonné**, **stabilisé**, **à altitude constante**, **sans accélération verticale supplémentaire**.

En virage descendant, `n` peut être inférieur ou égal à 1. La formulation `n = portance / poids` reste correcte mais moins opérante.

### 2.8 Épaisseur de couche limite — ce qu'on ne dira pas

Le rapport C0 affirmait qu'« une couche limite réelle fait moins de 1 % de corde ». **Cette affirmation est retirée** : l'épaisseur dépend du nombre de Reynolds, de la position sur le profil, du régime laminaire ou turbulent, du gradient de pression et de la proximité d'une séparation.

Aucune valeur générale ne la remplace. La seule conclusion tenable :

> L'épaisseur est **volontairement exagérée** pour rendre le phénomène visible. Le facteur d'exagération doit être **déclaré**, ou le dessin marqué **non à l'échelle**.

---

## 3. Niveaux P1 / P2 / P3

|             | **P1 — Comprendre ou reconnaître**                         | **P2 — Lire techniquement**                                                       | **P3 — Exploiter un modèle**                                                                                                 |
| ----------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Le lecteur… | comprend le phénomène ou identifie les éléments essentiels | interprète repères, variables, unités, relations, hypothèses et domaine principal | calcule, compare des paramètres, interprète des données mesurées ou simulées, évalue une incertitude, étudie une sensibilité |
| Requiert    | fonction claire, sens de lecture                           | + repère nommé, symboles, unités, hypothèses et domaine accessibles               | + modèle ou données exploitables, nature déclarée                                                                            |

**Une formule simple reste possible en P1** si elle est secondaire et ne bloque pas la compréhension immédiate. `n = portance / poids` sur un croquis de virage en est un bon exemple : l'interdire aurait dégradé un bon croquis pour respecter une règle de forme.

**Une question de concours peut justifier P3 ; elle ne le définit pas.** Le critère est l'exploitation d'un modèle quantitatif, pas le programme d'un examen — qui change à chaque réforme.

---

## 4. Taxonomie — familles F1 à F13

| Famille                                 | Fonction pédagogique         | Conventions obligatoires                                                      | Erreurs fréquentes                             | Niveau | Format       | Cas PrépaPilote                |
| --------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------- | ------ | ------------ | ------------------------------ |
| **F1** Géométrie                        | Nommer et situer les parties | Cotes, référence de mesure, échelle ou mention « non à l'échelle »            | Proportions fantaisistes                       | P1+P2  | SVG          | `profil-anatomie`              |
| **F2** Corps libre                      | Bilan de forces              | Repère, point d'application, échelle des vecteurs                             | Portance dessinée verticale hors palier        | P1+P2  | SVG          | `quatre-forces-avion`          |
| **F3** Décomposition vectorielle        | Projeter, composer           | Angles cotés, composantes nommées, **somme vectorielle explicite**            | « somme » au lieu de « somme vectorielle »     | P2     | SVG          | `triangle-des-vitesses`        |
| **F4** Écoulement                       | Montrer le fluide            | Sens, vent relatif, **portée**, mention de l'exagération d'échelle            | Couche limite exagérée sans le dire            | P1+P2  | SVG ou animé | `couche-limite`                |
| **F5** Distribution de pression         | Champ scalaire               | Signe, référence, échelle, **portée**                                         | Confusion −Cp / +Cp                            | P2+P3  | SVG          | `pressions-statique-dynamique` |
| **F6** Coupe fonctionnelle              | Voir l'intérieur             | Plan de coupe situé, hachures cohérentes                                      | Coupe non située                               | P1+P2  | SVG          | `altimetre-principe`           |
| **F7** Chaîne fonctionnelle             | Relier des organes           | Sens du flux, nature du flux                                                  | Flux non orienté                               | P1+P2  | SVG          | `pitot-statique-sources`       |
| **F8** Séquence                         | Ordonner dans le temps       | Numérotation, durées si connues                                               | Étapes non numérotées                          | P1     | SVG          | `catapultage-principe`         |
| **F9** Comparaison                      | Opposer deux cas             | **Même échelle, même cadrage**, une seule variable changée                    | Deux échelles différentes                      | P1+P2  | SVG          | `fenestron-rotor-anticouple`   |
| **F10** Graphique scientifique          | Relation quantifiée          | Axes nommés + unités, origine, domaine, **portée**, conditions si mesuré      | Courbe sans axes ; 2D confondu avec aile finie | P2+P3  | SVG          | `polaire-eiffel`               |
| **F11** Carte ou implantation           | Situer                       | Voir §8 — Nord et échelle **conditionnels**                                   | Nord absent là où l'orientation compte         | P1     | SVG          | `carte-ban-aeronavale`         |
| **F12** Organigramme ou frise           | Structurer, ordonner         | Sens de lecture, dates sourcées                                               | Hiérarchie ambiguë                             | P1     | SVG          | `structure-alat`               |
| **F13** Instrument ou affichage cockpit | Lire un instrument           | Marquages normalisés, sens de rotation, plage de lecture, mode de défaillance | Couleurs inventées ; couleur non doublée       | P1+P2  | SVG          | `badin-arcs`                   |

**F13 a été créée en C0-bis.** Plusieurs croquis existants en relèvent, deux fiches S3 la réclament, et elle porte une **clause d'accessibilité inversée** (§7).

---

## 5. Axes orthogonaux — obligatoires

Toute famille se croise avec trois axes. **Une interaction ou une simulation reçoit aussi une famille scientifique** : elle n'est jamais classée par son seul format technique.

**A. Modalité** — `static` · `animated` · `interactive_2d` · `interactive_3d` · `simulation`

**B. Nature scientifique** — `qualitative` · `analytical` · `measured` · `simulated`
**Plusieurs valeurs possibles** : un croquis peut poser un modèle analytique et y placer des points mesurés.

**C. Portée** — `airfoil_2d` · `finite_wing` · `complete_aircraft` · `system` · `operational_environment`
**Obligatoire seulement lorsqu'elle a un sens** : imposée sur F4, F5 et F10, facultative ailleurs.

### Classement des interactions existantes

| Interaction            | Famille | Modalité       | Nature      | Portée            |
| ---------------------- | ------- | -------------- | ----------- | ----------------- |
| `forces-et-vecteurs`   | F2      | interactive_2d | analytical  | complete_aircraft |
| `venturi`              | F5      | interactive_2d | analytical  | system            |
| `incidence-decrochage` | F4      | interactive_2d | qualitative | airfoil_2d        |
| `polaire`              | F10     | interactive_2d | analytical  | airfoil_2d        |
| `axes-gouvernes`       | F2      | interactive_2d | qualitative | complete_aircraft |
| `centrage`             | F2      | interactive_2d | analytical  | complete_aircraft |
| `soufflerie-zones`     | F6      | interactive_2d | qualitative | system            |

---

## 6. Fonctions éditoriales — six, et deux décisions distinctes

**Les six fonctions acceptées :**

`scientific_diagram` · `identification` · `orientation` · `map` · `organization_chart` · `timeline`

**Les deux décisions éditoriales**, qui **ne sont pas des familles de croquis** :

- `photo_preferred` — le réel dit mieux que le trait ; le croquis cède la place ;
- `reject_no_pedagogical_function` — ne sert ni à comprendre, ni à reconnaître, ni à situer : **supprimer**, et ne pas compter dans la couverture scientifique.

Les confondre reviendrait à dire qu'« à supprimer » est un genre de dessin. `editorialDecision` est donc un champ **séparé** de `function`.

**Une illustration d'identification est légitime** si elle aide à reconnaître, comparer, localiser ou mémoriser. L'audit C0 avait qualifié un lot de visuels de « peut-être décoratifs » ; le reclassement par fonction en a rendu la quasi-totalité légitimes.

---

## 7. Accessibilité

| Élément                                          | Contraste minimal |
| ------------------------------------------------ | ----------------- |
| Texte ordinaire                                  | **4,5:1**         |
| Grand texte (≥ 24 px, ou ≥ 18,66 px gras)        | **3:1**           |
| Objets graphiques nécessaires à la compréhension | **3:1**           |

Mesurés **dans les deux thèmes**. Un contraste correct en sombre et fautif en clair est un défaut — c'est l'état actuel de la majorité des croquis, traité au lot C5.

- **Aucune information portée uniquement par la couleur.**
- **Exception — couleurs normalisées d'un instrument réel** (F13) : sur un badin, la couleur _est_ l'information, parce qu'elle est normalisée sur l'instrument. Elle est admise, **à condition d'être doublée** d'un texte, d'un symbole ou d'une position. `badin-arcs` le fait déjà.
- **Texte alternatif** fondé sur **l'objectif et la conclusion**, sans minimum arbitraire de caractères.
- **Description longue séparée** (`longDescription`) lorsque le croquis est trop complexe pour un `alt` concis.
- **Impression en noir et blanc** : lisible sans couleur.
- **Test à 390 px** : le croquis reste lisible à la largeur mobile de référence.

---

## 8. Cartes — Nord et échelle conditionnels

**Le Nord et l'échelle ne sont obligatoires que lorsque l'orientation ou les distances ont une fonction pédagogique.**

Une carte d'implantation de bases aéronavales qui sert à mémoriser _quelles_ bases existent n'a pas besoin d'une échelle. Une carte de navigation qui sert à mesurer une route a besoin des deux.

Ne pas imposer mécaniquement ces éléments à toute représentation spatiale : ce serait le défaut symétrique de celui que ce document corrige — exiger d'une famille ce qui n'a de sens que pour une autre.

### 8 bis. Le vent — deux objets, deux orientations opposées

**Ajouté en C2, sur source.** Tout croquis portant un vent doit distinguer :

| Objet                                | Ce qu'il désigne                                           | Sens                                 |
| ------------------------------------ | ---------------------------------------------------------- | ------------------------------------ |
| **Direction météorologique du vent** | La direction **d'où le vent vient**                        | Degrés, sens horaire, depuis le Nord |
| **Vecteur vitesse du vent**          | Le déplacement réel de la masse d'air, **vers où elle va** | Opposé au précédent                  |

Un vent « de 045° » vient du nord-est ; **son vecteur pointe vers le sud-ouest**. Les deux sont justes, et leurs flèches sont opposées.

Les deux conventions sont sourcées, et par deux documents indépendants :

- **FR-02** (manuel BIA, éduscol, p. 127) : « La direction du vent indique toujours la provenance du vent », observée « en degrés et mesurée dans le sens des aiguilles d'une montre ».
- **F-03** (FAA PHAK 25B, p. 16-14, étape 3 de la construction du triangle) : tracer la flèche de vent « **not toward 045°, but downwind in the direction the wind is blowing** ».

**Règle applicable.** Dès qu'un croquis dessine une flèche de vent, il indique laquelle des deux il représente. Une flèche de vent non qualifiée est un défaut : elle est lue à l'envers une fois sur deux, et rien dans le dessin ne permet de trancher.

---

## 9. Doctrine juridique

> **Données et faits issus de sources traçables ; composition, dessin, légendes et identité graphique originaux.**

### Vérification document par document

Jamais en bloc, jamais par organisme :

- **auteur** — agence gouvernementale ou **contractant privé** (fréquent chez NASA) ;
- **mention de copyright** explicite ;
- **éléments de tiers** incorporés ;
- **conditions propres** au document ;
- **logos, marques, personnes reconnaissables**.

### Citation ≠ autorisation

**Une citation établit la traçabilité scientifique. Elle ne constitue pas une autorisation de reproduction.** Une courbe peut être une œuvre protégée ; les **données** sous-jacentes ne le sont généralement pas. La voie correcte est de **retracer les données dans une composition originale**, lorsque le droit le permet, en citant leur origine.

### Licences

| Licence        | Usage commercial           | Conditions à étudier séparément                                                               |
| -------------- | -------------------------- | --------------------------------------------------------------------------------------------- |
| **CC BY-SA**   | **Permis** sous conditions | Attribution · partage à l'identique · fourniture de la licence · indication des modifications |
| **GFDL**       | **Permis** sous conditions | Conditions propres, plus lourdes                                                              |
| **Clauses NC** | **Interdit**               | Bloquant si le service devient payant                                                         |

Ce ne sont pas CC BY-SA et GFDL qui bloquent un passage au payant — ce sont les clauses **NC**.

### Statut juridique

Deux valeurs, et deux seulement : `verified` ou `uncertain`.

**Ne jamais écrire « domaine public » sans vérification documentaire.** C'est une conclusion, pas une donnée.

### Silhouettes d'aéronefs

**Un avis juridique est requis avant toute industrialisation de silhouettes reconnaissables d'aéronefs.** C'est l'incertitude majeure du chantier. Elle n'est pas requise avant les deux pilotes génériques de C2, qui n'en comportent aucune.

---

## 10. Contrat graphique (applicable dès C2)

### 10.1 Formats canoniques

Les croquis existants emploient de nombreux `viewBox` distincts, avec une nette convergence. Quatre formats canoniques sont retenus ; tout écart se justifie.

| Format            | `viewBox`     | Emploi                            |
| ----------------- | ------------- | --------------------------------- |
| **Paysage large** | `0 0 460 260` | Défaut — le plus répandu          |
| **Paysage haut**  | `0 0 460 300` | Superpositions verticales, étages |
| **Compact**       | `0 0 420 240` | Schéma simple, une seule idée     |
| **Portrait**      | `0 0 340 340` | Coupes verticales, organigrammes  |

**Les croquis existants ne sont pas recadrés.** Normaliser recadrerait des dessins justes, pour un gain d'homogénéité qui ne vaut pas ce risque.

### 10.2 Marges, densité, lisibilité

- **Marge de sécurité** : 12 unités de `viewBox` sur les quatre bords.
- **Texte minimal** : 11 unités de `viewBox`. La taille effective en pixels CSS à 390 px de large est **à mesurer en C2**, pas à supposer.
- **Densité** : proportionnée au format et au niveau. **Aucun maximum universel d'étiquettes** — un P3 en porte légitimement davantage qu'un P1. La règle opérante est qu'aucune étiquette n'en chevauche une autre à 390 px.

### 10.3 Conventions de tracé

| Élément                   | Convention                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Trait principal**       | 2 unités, `schema-ink`                                                                                         |
| **Trait secondaire**      | 1,5 unité, `schema-muted`                                                                                      |
| **Trait de construction** | 1 unité, pointillé `2 3`, `schema-muted`                                                                       |
| **Vecteur force**         | Flèche pleine, tête `orient="auto"`, longueur **proportionnelle à l'intensité** si plusieurs forces coexistent |
| **Filet d'air**           | Ligne fléchée, sens toujours indiqué                                                                           |
| **Coupe**                 | Hachures à 45°, plan de coupe repéré par deux traits et une lettre                                             |
| **Axe**                   | Flèche à l'extrémité positive, nom de la grandeur **et son unité**                                             |

### 10.4 Jetons sémantiques

Rôles définis dès C1 ; **valeurs fixées en C2**, après mesure de contraste dans les deux thèmes. Aucune couleur n'est retenue pour son esthétique.

| Jeton             | Rôle sémantique                                            |
| ----------------- | ---------------------------------------------------------- |
| `schema-ink`      | Structure, contours, texte principal, axes                 |
| `schema-muted`    | Repères secondaires, traits de construction, sous-légendes |
| `schema-accent`   | La grandeur étudiée, la variable dont parle le croquis     |
| `schema-surface`  | Fond d'une zone, remplissage de matière                    |
| `schema-grid`     | Grille d'un graphique                                      |
| `schema-positive` | État normal, plage autorisée                               |
| `schema-warning`  | Zone de prudence, seuil approché                           |
| `schema-danger`   | Limite à ne pas franchir, état critique                    |

Chaque valeur devra satisfaire les seuils du §7 **dans les deux thèmes** — c'est ce qui a manqué aux couleurs actuelles, choisies en regardant le rendu sombre.

### 10.5 Identifiants SVG

Tout `id` interne est préfixé par un trigramme propre au croquis (`cl-` pour `couche-limite`). Plusieurs SVG coexistent sur une page ; sans préfixe, un `url(#a)` résout vers le mauvais marqueur. La garde existe : `e2e/schemas-identifiants.spec.ts`.

### 10.6 Emplacement des hypothèses et des sources

**Les hypothèses et le domaine de validité n'ont pas à surcharger le dessin.** Ils doivent être disponibles **dans la même figure ou dans son composant documentaire directement associé** — c'est-à-dire portés par les métadonnées et rendus par `FicheFigure`.

Ce qui reste **sur le dessin** : ce dont la lecture immédiate dépend — une mention « non à l'échelle », un régime de vol qui change le sens des flèches.

---

## 11. Checklists d'acceptation

### 11.1 Croquis scientifique

Les lignes conditionnelles ne s'appliquent que si leur condition est remplie.

**Fond**

1. Objectif pédagogique énoncé.
2. **Si le dessin porte une orientation physique** : repère nommé (§2.1).
3. Variables symbolisées.
4. **Si grandeur dimensionnée** : unité présente.
5. **Si le signe porte du sens** : convention explicite.
6. Échelle réelle, relative, ou mention « non à l'échelle ».
7. Hypothèses disponibles (§10.6).
8. Domaine de validité disponible.
9. **Au moins une source**, avec sa localisation ou `à vérifier`.
10. Nature scientifique déclarée.
11. **Si mesuré ou simulé** : conditions expérimentales ou numériques.
12. **Si famille F4, F5 ou F10** : portée physique déclarée.

**Forme** 13. Aucune information portée uniquement par la couleur (exception F13, §7). 14. Contrastes du §7 respectés **dans les deux thèmes**. 15. Lisible à 390 px, sans chevauchement d'étiquettes. 16. Imprimable en noir et blanc. 17. Identifiants SVG préfixés.

**Documentaire** 18. Texte alternatif portant l'objectif et la conclusion. 19. **Si trop complexe pour un `alt` concis** : description longue. 20. Version du croquis. 21. Date de vérification scientifique.

### 11.2 Illustration d'identification ou d'orientation

Neuf lignes. **Ni repère, ni unités, ni hypothèses, ni domaine de validité** : ces exigences n'ont pas d'objet ici.

1. Fonction déclarée — identifier, orienter, situer ou mémoriser.
2. Élément distinctif visible : ce qui permet de reconnaître, pas une forme générique.
3. Exactitude factuelle de ce qui est représenté.
4. **Si la forme ou la donnée dérive d'un document tiers** : source citée.
5. Statut juridique renseigné (`verified` ou `uncertain`).
6. Contrastes du §7.
7. Aucune dépendance exclusive à la couleur.
8. Texte alternatif transmettant ce qu'il faut reconnaître.
9. Lisible à 390 px.

---

## 12. Palette et typographie actuelles (héritées du 2026-07-09)

Conservées telles quelles jusqu'à la fixation des jetons en C2.

**Palette** — `currentColor` pour la structure et les légendes ; bleu `#3b82f6` pour la grandeur mise en avant ; gris `#94a3b8` pour les repères secondaires. Fond transparent. **Ces deux couleurs sont sous le seuil de contraste en thème clair** (2,56:1 et 3,68:1 mesurés en C0) : défaut traité au lot C5.

**Typographie** — `system-ui` ; titre 14 px semi-gras, libellés 13 px, sous-texte 11 px.

**Représentation homogène des grandeurs** — une même grandeur garde la même représentation partout :

| Grandeur            | Représentation constante                                          |
| ------------------- | ----------------------------------------------------------------- |
| Force               | Flèche vectorielle pleine ; la force étudiée en accent            |
| Vitesse, écoulement | Filet d'air fléché, sens toujours indiqué                         |
| Pression            | Flèches perpendiculaires à la surface, ou barres proportionnelles |
| Altitude            | Axe vertical fléché vers le haut, à gauche                        |
| Température         | Échelle ou valeur en °C, en encre                                 |
| Densité de l'air    | Densité de points                                                 |
| Surface             | Segment ou rectangle en encre                                     |

**Marqueurs de flèche** — deux par croquis : `#a` (encre) et `#ac` (accent), `orient="auto"`, préfixés selon §10.5.

**Dimensions** — `viewBox="0 0 W H"`, `width="100%" height="100%"`, `preserveAspectRatio="xMidYMid meet"`. Les `width`/`height` de `figures[]` reprennent W et H.

---

## 13. Portée de ce document

S'applique à **tout croquis produit à partir de C1**. Les croquis antérieurs restent servis sans métadonnées (`meta` facultatif) ; ils ne sont simplement **pas comptés dans la couverture scientifique** tant qu'ils ne sont pas repris.

Complète [`processus-production.md`](processus-production.md) et le design system.

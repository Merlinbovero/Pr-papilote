# Design Manifesto — PrépaPilote

> **Statut : proposition soumise à validation.** Ce document ne décrit pas
> l'état du site, il décrit ce qu'il doit devenir. Aucune ligne de code n'a été
> modifiée pour l'écrire. Une fois validé, il devient la loi du projet et prime
> sur `docs/design-system.md`, `docs/ui-framework.md` et `docs/refonte-design.md`,
> qui seront réécrits pour s'y conformer.

---

## 0. L'épreuve

Une capture d'écran de PrépaPilote, logo masqué, doit être reconnue.

C'est le seul critère qui compte, et il est brutal : il élimine toute décision
qui pourrait être prise à l'identique par n'importe quel autre projet. Un
arrondi, une ombre portée, un dégradé, une grille de trois cartes — rien de
tout cela ne signe. Ce qui signe, c'est une **architecture** : une façon
constante de poser le texte, de numéroter, de légender, de trancher entre ce
qui est référence et ce qui est état.

Ce manifeste construit cette architecture.

---

# PHASE 1 — Recherche

## 1.1 Méthode, et ses limites

Trois sources d'observation, distinguées honnêtement.

**Vérifié.** Deux ancrages historiques ont été contrôlés à la source, parce que
l'identité s'appuie dessus :

- La police **Frutiger** a été commandée en 1970-71 à Adrian Frutiger pour la
  **signalétique directionnelle de l'aéroport Roissy-Charles-de-Gaulle**,
  finalisée en 1972 sous le nom « Roissy », publiée commercialement en 1976.
  L'objectif de la commande : lisibilité **à des angles, des tailles et des
  distances variables**.
- La police **Spectral** a été dessinée par **Production Type** (fonderie
  parisienne), commandée par Google, pensée **pour l'écran et la lecture
  longue**. Sept graisses, italiques, **petites capitales**.

**Structure relevée.** Quatre sites sondés pour leur architecture éditoriale
(nomenclature, hiérarchie, densité) : Monocle, ONERA, Dassault Aviation. Le
site du Smithsonian Air & Space a renvoyé une erreur d'accès — il n'est donc
pas cité comme observé.

**Connaissance de métier.** L'analyse visuelle qui suit (typographie, couleur,
traitement photographique, rythme) relève de la culture du design. Cet
environnement ne peut pas produire de captures des sites tiers. Je le signale
plutôt que de faire passer un jugement esthétique pour un relevé.

## 1.2 Ce que les références enseignent

### Les institutions scientifiques — ONERA, MIT, ESA, NASA

**Relevé.** L'ONERA organise sa recherche autour de quatre piliers et nomme ses
sept départements par **codes** : DAAA, DEMR, DMAS, DMPE, DOTA, DPHY, DTIS. Ces
codes ne sont pas cachés, ils sont l'ossature de la navigation. La recherche est
présentée par **domaines thématiques**, jamais par liste de projets.

**Ce qui fonctionne.** Le code est une promesse de sérieux. Il dit : cette
maison a un classement, ce classement est stable, vous pouvez y revenir. Le
domaine thématique évite l'effet catalogue.

**Pourquoi.** Une nomenclature visible transforme un site en **fonds
documentaire**. On ne consulte pas un fonds comme on parcourt une vitrine.

**Ce qu'on prend.** La nomenclature assumée, affichée, pas honteuse.
**Ce qu'on refuse.** La froideur institutionnelle, l'absence de voix, les pages
qui existent pour l'organigramme et non pour le lecteur.

### Les industriels — Dassault, Airbus, Safran

**Relevé.** Dassault ne présente pas le Rafale en fiche technique mais en
**angles de mission** : « Concevoir et Optimiser », « Détecter et poursuivre »,
« Adapter et délivrer ». Cinq branches seulement : Groupe, Défense, Civil,
Espace, Passion.

**Ce qui fonctionne.** L'objet technique raconté par ce qu'il permet, pas par ce
qu'il pèse. Et une branche « Passion » assumée, qui ne rougit pas de s'adresser
à l'amateur.

**Pourquoi.** Les chiffres sans récit ne se retiennent pas. Le récit sans
chiffres ne se croit pas. Les deux ensemble font autorité.

**Ce qu'on prend.** Le récit avant la donnée, la donnée jamais absente.
**Ce qu'on refuse.** L'aspirationnel publicitaire (« Higher Together »), les
photos en pleine page avec un slogan par-dessus, la communication corporate.

### Les éditoriaux — Monocle, The Economist, National Geographic

**Relevé.** Monocle navigue par sujets (Affairs, Business, Culture, Design,
Fashion, Travel), affiche des **temps de lecture** (4-6 min, 12-22 min) et
institue des **rubriques nommées** qui reviennent : « Quality of Life »,
« Longer Reads », « Meet Our Columnists ».

**Ce qui fonctionne.** La rubrique récurrente crée un rendez-vous. Le temps de
lecture est un contrat : je sais ce que j'engage.

**Pourquoi.** Un lecteur revient pour une **habitude**, pas pour une surprise.
La constance de la grille éditoriale vaut mieux que la variété.

**Ce qu'on prend.** Les rubriques nommées et stables, le contrat de lecture
affiché.
**Ce qu'on refuse.** La densité magazine sur écran, la course à l'actualité, le
mélange marchand.

### Les musées et les revues spécialisées

**Ce qui fonctionne** (connaissance de métier, non vérifié ici). L'objet de
collection est toujours accompagné d'un **cartel** : dénomination, datation,
provenance, numéro d'inventaire. Ce cartel est aussi important que l'objet.

**Pourquoi.** Le cartel dit d'où vient le savoir. Il transforme une image en
document.

**Ce qu'on prend.** Le cartel systématique. Nous l'avons déjà, à moitié : nos
photos portent auteur et licence. Il faut aller jusqu'au bout — numéro, cote,
révision.

## 1.3 Le diagnostic sur nous-mêmes

En regardant nos propres écrans avec les yeux de cette recherche :

- La structure éditoriale est **excellente** — fiches sourcées, révisions,
  registres, contrôle automatisé. C'est notre force et personne ne la voit.
- L'habillage est **générique** : cartes à coins arrondis, ombres douces,
  grilles de trois, accents colorés. Rien qui ne pourrait appartenir à un autre
  produit.
- L'appareil documentaire est **caché** dans le pied de page alors qu'il est la
  preuve du sérieux.

Le travail à faire n'est donc pas d'ajouter du style. C'est de **rendre visible
l'exigence qui existe déjà**.

---

# PHASE 2 — Le parti pris

## 2.1 PLANCHE

Le système de design de PrépaPilote s'appelle **Planche**.

Une planche, dans un ouvrage technique, est une page d'illustration numérotée,
légendée, référencée, que l'on peut citer. Elle appartient à un ensemble et le
dit. Elle ne s'admire pas : elle se consulte.

**Tout écran de PrépaPilote est une planche.** Il porte une cote, une date de
révision, une légende, et il assume d'appartenir à un corpus.

## 2.2 La métaphore fondatrice

> **Un manuel aéronautique français, imprimé avec soin, qui se trouve être
> vivant.**

Pas un site qui ressemble à un livre — les textures de papier et les ombres de
page tournée sont des pastiches. Un objet qui a **les propriétés** d'un manuel :
une pagination, une nomenclature, des marges qui servent, des planches
numérotées, une typographie de lecture, une révision datée. Et qui ajoute ce
qu'un manuel ne peut pas faire : réagir, chronométrer, corriger, se souvenir.

Cette métaphore hérite d'une lignée réelle : celle de la **signalétique
aéronautique française**, dont Frutiger reste le monument, et celle des
**cartes aéronautiques**, où chaque trait, chaque teinte et chaque symbole
signifie quelque chose de précis et rien d'autre.

## 2.3 Ce que nous sommes, ce que nous ne sommes pas

| Nous sommes              | Nous ne sommes pas     |
| ------------------------ | ---------------------- |
| Une académie             | Une start-up           |
| Un fonds documentaire    | Un flux                |
| Un appareil de référence | Un catalogue           |
| Un banc d'entraînement   | Un jeu                 |
| Un ouvrage technique     | Un tableau de bord     |
| Une bibliothèque vivante | Une bibliothèque morte |

**Le mot d'ordre : jamais un dashboard SaaS.** Ce refus a des conséquences
précises, listées en Phase 3, section « Patterns interdits ».

## 2.4 Les sept principes fondateurs

**I. La structure est l'identité.**
Nous ne signons pas par une couleur ni par un arrondi. Nous signons par une
manière constante d'organiser la page : une marge technique, un corps mesuré,
une cote, des filets. Un lecteur reconnaîtra la disposition avant la palette.

**II. Le papier avant l'écran.**
Le fond n'est jamais blanc pur, le texte jamais noir pur. Nous travaillons sur
un papier chaud et une encre profonde. Cela repose l'œil sur les longues
sessions — et cela distingue instantanément d'un produit logiciel.

**III. Chaque couleur a un métier.**
Une teinte qui ne signifie rien n'existe pas. Les **encres de module** situent,
les **états** signalent. Aucune couleur n'est décorative. C'est la règle la plus
difficile à tenir et la plus rentable.

**IV. Le savoir montre ses papiers.**
Cote, révision, source, licence, auteur : l'appareil documentaire est **visible
en permanence**, pas relégué. C'est ce qui nous sépare d'un contenu généré.

**V. La densité est un service.**
Un candidat qui révise veut voir beaucoup, vite. L'air ne se met pas partout :
il se met **là où la hiérarchie l'exige**, et nulle part ailleurs. Une page
aérée partout est une page sans hiérarchie.

**VI. Le mouvement obéit.**
Rien ne bouge sans que l'utilisateur ait agi. Aucune apparition au défilement,
aucun compteur qui s'anime, aucun parallaxe. Le mouvement confirme une action ;
il ne divertit pas.

**VII. L'épreuve prime sur l'entraîneur.**
Quand un écran reconstitue une épreuve officielle, il en épouse le format et la
sobriété. La pédagogie se déploie **avant** et **après**, jamais pendant.

---

# PHASE 3 — Le système

## 3.1 Papier & encre — la palette

### Le fond

Le socle est un papier chaud, jamais blanc. Trois niveaux, pas davantage.

| Rôle         | Nom            | Valeur (oklch)   | Usage                             |
| ------------ | -------------- | ---------------- | --------------------------------- |
| Fond général | `papier`       | `97.2% 0.006 85` | Le fond de toute page             |
| Surface      | `papier-vergé` | `94.8% 0.008 85` | Planches, encadrés, tableaux      |
| Creux        | `papier-creux` | `92.0% 0.010 85` | Champs de saisie, zones inactives |

### L'encre

| Rôle             | Nom          | Valeur (oklch)  | Usage                         |
| ---------------- | ------------ | --------------- | ----------------------------- |
| Texte principal  | `encre`      | `24% 0.028 250` | Corps, titres                 |
| Texte secondaire | `encre-2`    | `42% 0.022 250` | Chapôs, descriptions          |
| Texte tertiaire  | `encre-3`    | `58% 0.016 250` | Légendes, cotes, crédits      |
| Filet            | `filet`      | `84% 0.012 250` | Tous les traits de séparation |
| Filet appuyé     | `filet-fort` | `70% 0.016 250` | Séparations de premier rang   |

L'encre tire sur le bleu (teinte 250), jamais sur le neutre pur. C'est ce qui
donne le grain d'imprimerie plutôt que le gris d'interface.

### Les encres de module

Six teintes, **délibérément proches en clarté et en saturation** pour se lire
comme une seule famille d'encres. Elles situent ; elles ne décorent pas.

| Module                 | Nom             | Valeur (oklch) | Origine                      |
| ---------------------- | --------------- | -------------- | ---------------------------- |
| EOPAN                  | `encre-marine`  | `46% 0.10 245` | Bleu de mer                  |
| EOPN                   | `encre-air`     | `52% 0.11 225` | Bleu d'air                   |
| ALAT                   | `encre-terre`   | `46% 0.07 145` | Vert de terre                |
| Fondamentaux           | `encre-bistre`  | `45% 0.09 60`  | Ocre des planches techniques |
| Psychotechnique        | `encre-violine` | `45% 0.10 300` | Violet d'encre               |
| Culture & géopolitique | `encre-sienne`  | `44% 0.10 25`  | Terre de Sienne              |

Emploi autorisé : le filet sous un titre de page, le repère de marge, le trait
d'un encadré, la cote, un trait de schéma. **Jamais un fond de bloc pleine
largeur, jamais un bouton, jamais un badge rempli.**

### Les états

Registre **séparé**, plus vif, réservé au retour d'action. Une couleur d'état
qui apparaît ailleurs que dans une correction ou une validation est un bug.

| État        | Valeur (oklch) | Emploi                            |
| ----------- | -------------- | --------------------------------- |
| `juste`     | `55% 0.14 150` | Bonne réponse, contenu vérifié    |
| `attention` | `70% 0.15 75`  | Approximation, échéance, prudence |
| `erreur`    | `55% 0.19 27`  | Mauvaise réponse, contenu périmé  |

### Le mode sombre — « table lumineuse »

Le mode sombre **n'est pas une inversion de gris**. C'est le retournement d'une
table à dessin : le fond devient une encre profonde, le texte devient le papier.
La famille de teintes ne change pas.

| Rôle           | Valeur (oklch)  |
| -------------- | --------------- |
| `papier`       | `21% 0.025 250` |
| `papier-vergé` | `25% 0.024 250` |
| `encre`        | `93% 0.010 85`  |
| `encre-3`      | `66% 0.014 85`  |
| `filet`        | `34% 0.020 250` |

Les encres de module **remontent en clarté** (+14 points) pour tenir le contraste
sur fond sombre, sans changer de teinte. Les états conservent leur teinte et
gagnent également en clarté.

**Contraste.** Aucun texte sous 4.5:1, aucun filet porteur d'information sous
3:1. Vérifié dans les deux modes, pas seulement dans le mode clair.

## 3.2 Typographie

Trois familles, choisies pour ce qu'elles savent faire, pas pour leur allure.

### Spectral — la lecture

Serif de Production Type (Paris), dessinée pour l'écran et la lecture longue.
Sept graisses, italiques, **petites capitales**.

Emploi : tout le corps de texte éditorial, les titres de planche, les citations,
les définitions. Les petites capitales servent aux libellés d'encadré et aux
attributions — c'est le détail typographique le plus rare et le plus signant
qu'une licence libre nous offre.

### Fira Sans — l'interface et la signalétique

Sans-serif humaniste, dessinée pour la lisibilité aux petites tailles à l'écran.
La lignée humaniste est celle de la signalétique aéroportuaire — celle de
Frutiger, dont nous ne pouvons pas payer la licence mais dont nous pouvons
tenir la promesse : **lisible à des angles, des tailles et des distances
variables**.

Emploi : navigation, boutons, libellés, tableaux, tout ce qui n'est pas de la
lecture suivie.

### Fira Mono — la donnée

Emploi : cotes, références, codes, chronomètres, coordonnées, valeurs
numériques dans les tableaux, codes du test de codage. La même famille que
l'interface : un seul dessin, une seule cohérence.

**Archivo est retirée.** Elle faisait un display correct mais grotesque, sans
lignée aéronautique et sans famille sérif ni monospace assortie.

### L'échelle

Peu de tailles, employées strictement. Le fouillis typographique vient toujours
d'une échelle trop riche.

| Rôle             | Famille   | Taille               | Interligne | Particularités                   |
| ---------------- | --------- | -------------------- | ---------- | -------------------------------- |
| Cote, légende    | Fira Mono | 12 px                | 1.35       | Capitales, interlettrage +0.08em |
| Mention          | Fira Sans | 13.5 px              | 1.45       | Crédits, méta                    |
| Interface        | Fira Sans | 15 px                | 1.45       | Boutons, navigation, tableaux    |
| Lecture          | Spectral  | 17 px                | **1.62**   | Corps éditorial                  |
| Intertitre       | Fira Sans | 20 px                | 1.30       | Semi-gras                        |
| Titre de section | Spectral  | 26 px                | 1.22       |                                  |
| Titre de planche | Spectral  | 34 px                | 1.15       |                                  |
| Titre de page    | Spectral  | 44 px / 32 px mobile | 1.10       |                                  |

**Justure.** Le corps de lecture est calé entre **66 et 72 signes**. Au-delà,
l'œil perd la ligne ; en deçà, le rythme se hache. Cette borne n'est pas
négociable et vaut sur tous les écrans.

## 3.3 Rythme et grille

### La ligne de base

Le corps de lecture pose un rythme vertical de **28 px** (17 × 1.62 ≈ 27.5). Tout
espacement vertical dans la colonne de lecture est un multiple de 28. Hors
colonne de lecture, l'unité est 8.

Un vrai rythme vertical est rare sur le web. Il ne se remarque pas
consciemment — il se **ressent** comme du calme. C'est un investissement
invisible qui signe.

### La grille — marge et corps

C'est ici que se joue l'essentiel de la reconnaissance.

**Écran large (≥ 1280 px)**

```
│ marge 200 │ 40 │ corps 720 │ 40 │ annexe 280 │
```

- **La marge technique** porte la cote, la révision, la marque du module et les
  repères de section. **Rien d'autre.** Jamais de navigation, jamais de bouton,
  jamais de publicité. Sa vacuité est le message : cette page appartient à un
  fonds classé.
- **Le corps** porte le texte, à la justure imposée.
- **L'annexe** porte les débords de figure, les notes, les sources, les
  renvois.

**Écran moyen (1024 – 1279 px)** — la marge se réduit à un rail de 48 px qui ne
porte plus que les repères ; l'annexe passe sous le corps.

**Écran étroit (< 1024 px)** — la marge devient un **bandeau horizontal** au-dessus
du titre, portant la cote et la révision sur une ligne. Les repères disparaissent.
L'annexe passe sous le corps. **Aucune fonction ne disparaît** : elle change de
place.

## 3.4 Le système d'ornement

Cinq objets, et seulement cinq. Ils constituent la signature.

**Le filet.** Trait de 1 px. Trois emplois : _filet de section_ (pleine largeur
du corps, au-dessus d'un titre de niveau 2), _filet de légende_ (3 rem, sous une
figure), _filet de marge_ (vertical, sépare marge et corps sur écran large).
Aucun autre trait n'existe dans le système.

**Le repère.** Un tiret de 8 px dans la marge, aligné sur la ligne de base du
titre de section, dans l'encre du module. Il donne à la marge la cadence d'une
règle graduée. C'est l'ornement le plus discret et le plus reconnaissable.

**La cote.** Toute page porte sa référence documentaire, en haut de marge :

```
EOPAN · A.2.14
RÉV. 2026-07-27
```

En Fira Mono, capitales, interlettré. La cote se lit, se note, se cite.

**La légende.** Toute figure porte un numéro de planche et une légende de
grammaire fixe :

```
PL. 07 — Écoulement autour d'un profil à faible incidence
Photo : Antonin JLY (CC BY-SA 4.0)
```

**Le pied de planche.** En bas de chaque fiche : filet fort, date de
vérification, sources numérotées, historique de révision. L'appareil
documentaire **remonte** du pied de page vers le contenu.

## 3.5 Composants

Le catalogue existant reste valable dans son inventaire ; c'est son expression
qui change. Trois règles gouvernent tous les composants.

**Rayon.** 0 px pour tout ce qui est documentaire (planches, tableaux,
encadrés, figures). 2 px maximum pour l'interactif (boutons, champs). Le rayon
généreux est la signature du produit logiciel — nous n'en voulons pas.

**Ombre.** **Aucune.** La profondeur se fait par le filet et le fond, jamais par
l'ombre portée. Une seule exception : les surfaces flottantes réellement
au-dessus du document (menu déroulant, dialogue), avec une ombre unique et
sobre.

**Remplissage.** Un bloc coloré plein est réservé aux **états**. Une encre de
module ne remplit jamais un bloc : elle trace un filet, un repère, un texte.

### Boutons

Trois seulement. _Principal_ : fond encre, texte papier. _Secondaire_ : filet
encre, fond transparent. _Discret_ : texte seul, souligné à l'interaction. Pas
de bouton fantôme coloré, pas de dégradé, pas d'icône seule sans intitulé hors
barre d'outils dense.

### Encadrés éditoriaux

Quatre types, distingués par leur **libellé en petites capitales** et un filet
gauche dans l'encre du module — jamais par une pastille de couleur.

`DÉFINITION` · `MÉTHODE` · `PIÈGE` · `À RETENIR`

Teinte de fond autorisée : 4 % de l'encre du module, pas davantage.

### Tableaux

Pas de zébrure. Filets horizontaux seuls. En-tête en petites capitales.
Nombres en Fira Mono, alignés à droite, chiffres tabulaires. Unité dans
l'en-tête, jamais répétée dans les cellules.

### Citations

Pas de gros guillemet décoratif. Filet gauche, Spectral italique, attribution en
petites capitales sur la ligne suivante.

### Cartes

Fond `papier-vergé`, terres en aplat très désaturé, filets pour les frontières,
libellés en Fira Sans 13.5. Les points d'intérêt portent l'encre de leur module.
Aucune ombre, aucun relief. Une carte est une planche.

## 3.6 Photographie

- **Jamais de photo en fond de texte.** Aucune exception.
- Cadre : filet de 1 px, rayon 0, pas d'ombre.
- Étalonnage : léger biais chaud pour s'asseoir sur le papier, contraste réduit
  d'environ 6 % pour ne pas percer la page.
- Toute photo porte un numéro de planche, une légende et son crédit complet
  (auteur, licence, source). C'est déjà notre règle juridique ; elle devient une
  règle graphique.
- **Une photographie par écran de défilement au maximum.** Un manuel n'est pas
  un album.
- Le portrait et le paysage cohabitent ; le format panoramique large est réservé
  aux en-têtes de module.

## 3.7 Illustrations et schémas

Le schéma est le cœur du système, parce qu'il est ce qu'un manuel fait de mieux.

- **Trait d'encre uniquement**, sur `papier-vergé`. Deux graisses : 1.5 px pour
  la structure, 1 px pour les détails.
- Une seule couleur par schéma : l'encre du module. Les états n'entrent pas
  dans un schéma.
- **Numérotation en légende** : les éléments sont repérés ①②③ et expliqués dans
  une liste sous la figure, en Fira Mono pour le numéro et Fira Sans pour le
  libellé.
- Les schémas interactifs conservent exactement le même dessin que les schémas
  fixes. L'interactivité **ajoute** ; elle ne redessine pas.
- **Aucune illustration de personnages.** Pas de silhouettes plates, pas de
  scènes vectorielles. Nous illustrons des phénomènes, pas des gens.

## 3.8 Mouvement

**Durées.** 120 ms (changement d'état), 180 ms (apparition), 240 ms (transition
de page). Rien au-delà de 240 ms.

**Courbe.** Une seule : `cubic-bezier(0.2, 0, 0, 1)` — départ franc, arrivée
douce. Le mouvement décide, il n'hésite pas.

**Autorisé.** Opacité, translation de 2 à 6 px, couleur, croissance d'un filet.

**Interdit.** Mise à l'échelle d'une carte au survol, parallaxe, défilement
détourné, apparitions en cascade, compteurs animés, rotation, rebond, tout ce
qui bouge sans action de l'utilisateur.

**La seule motion signature.** Le **repère** de marge se trace (largeur 0 → 8 px,
180 ms) quand sa section entre dans le champ. Une fois. C'est le seul mouvement
décoratif du système, et il évoque une graduation qui s'inscrit.

**`prefers-reduced-motion`** supprime toutes les apparitions ; les changements
d'état restent instantanés. Ce n'est pas une option de confort, c'est une
obligation.

## 3.9 Micro-interactions

- **Survol** : le filet passe en `filet-fort`. Rien d'autre. Pas de
  soulèvement, pas d'ombre qui grandit.
- **Focus clavier** : anneau de 2 px dans l'encre du module, décalé de 2 px.
  Toujours visible, jamais supprimé.
- **Pression** : translation de 1 px vers le bas, 90 ms.
- **Chargement** : jamais de squelette animé. Un filet de progression fin, en
  haut de la zone concernée.
- **Validation** : le retour d'état est **textuel avant d'être coloré**. La
  couleur double le mot, elle ne le remplace pas.

## 3.10 Icônes

Lucide, sous contrainte stricte : trait de 1.5 px, tailles 16 / 20 / 24
uniquement, couleur héritée du texte. Toujours accompagnée d'un mot, sauf en
barre d'outils dense où l'intitulé accessible suffit. **Jamais** dans un cercle
coloré, **jamais** comme ornement de carte, **jamais** d'emoji.

## 3.11 Mode lecture

Un vrai mode, pas un réglage cosmétique. Il masque la navigation, élargit les
marges, porte la justure à 62 signes et le corps à 19 px, et **conserve la cote
et les repères** — on lit une planche, on ne quitte pas le fonds. L'état
persiste d'une page à l'autre.

---

# PATTERNS INTERDITS

Cette section est normative. Elle liste ce qui donne au web contemporain — et
singulièrement aux sites produits par IA — son air de famille. Aucune de ces
choses n'entrera dans PrépaPilote, quelle que soit la justification.

## Couleur

1. Dégradés violet-rose, indigo-cyan, ou tout dégradé de marque.
2. Texte en dégradé.
3. Aplats de couleur vive en fond de section pleine largeur.
4. Blanc pur `#fff` et noir pur `#000`.
5. Couleur employée sans signification — « pour égayer ».
6. Mode sombre obtenu en inversant des gris et en gardant les mêmes accents.
7. Plus d'une teinte d'accent visible simultanément dans un même écran.

## Formes et matières

8. Glassmorphisme, verre dépoli, flou d'arrière-plan.
9. Néomorphisme, effets de relief.
10. Rayons supérieurs à 2 px sur un objet documentaire.
11. Ombres portées sur les cartes, ombres colorées, ombres multiples.
12. Bordures colorées épaisses en guise de décor.
13. Formes organiques, « blobs », vagues séparatrices entre sections.
14. Cadres photo arrondis.

## Composition

15. **Le héros centré** : grand titre, sous-titre, deux boutons, rien d'autre au
    premier écran.
16. La grille de trois cartes « icône ronde + titre + une phrase ».
17. Les « bento grids ».
18. Les sections alternées image-gauche / image-droite à l'infini.
19. Le bandeau de logos « ils nous font confiance ».
20. Les cartes flottant sur un fond gris.
21. L'espacement uniforme partout, qui supprime toute hiérarchie.
22. Le pied de page à cinq colonnes de liens.

## Typographie

23. Une seule famille en une seule graisse pour tout le site.
24. Inter, ou toute police devenue le signal par défaut du produit logiciel.
25. Les titres immenses qui ne laissent aucun contenu visible.
26. Le texte centré sur plus de deux lignes.
27. Les majuscules pour un paragraphe.
28. Une justure supérieure à 72 signes.

## Contenu et ton

29. **Les emoji**, partout, sans exception.
30. Les illustrations plates de personnages (style « undraw »).
31. Les photos de stock de gens qui pointent un écran.
32. Le superlatif marketing : « révolutionnaire », « puissant », « incroyable ».
33. Le tutoiement commercial et l'exclamation.
34. Les compteurs animés et les statistiques sans source.
35. Les témoignages fabriqués.
36. Toute affirmation chiffrée sans source vérifiable — **c'est déjà une règle
    du projet, elle devient aussi une règle graphique.**

## Mouvement

37. Les apparitions au défilement.
38. Le parallaxe.
39. Le défilement détourné.
40. Les compteurs qui montent.
41. Les curseurs personnalisés.
42. Toute animation ignorant `prefers-reduced-motion`.

## Interface

43. Le squelette de chargement animé.
44. Les info-bulles qui remplacent un libellé.
45. Les modales d'accueil, bandeaux de newsletter, pop-ups de sortie.
46. Les barres de progression décoratives.
47. Les badges « nouveau » en couleur vive sans date.
48. Le tableau de bord comme page d'accueil d'un module.

---

# Gouvernance

## Ce que ce document remplace

Une fois validé, ce manifeste devient la référence unique en matière de design.
`docs/design-system.md` devient sa **table des jetons** ; `docs/ui-framework.md`
devient son **catalogue de composants** ; `docs/refonte-design.md` passe en
archive historique.

## La règle d'arbitrage

Devant un choix graphique, poser trois questions dans cet ordre :

1. **Est-ce que cela pourrait appartenir à un autre produit ?** Si oui, chercher
   autre chose.
2. **Est-ce que cela sert la lecture ou la consultation ?** Si non, retirer.
3. **Est-ce que cela signifie quelque chose de précis ?** Si non, retirer.

## Ce qui reste à trancher avec vous

Trois décisions ne m'appartiennent pas.

- **Le retrait d'Archivo** au profit de Spectral + Fira. C'est un changement de
  voix, pas seulement de police.
- **L'abandon du blanc pur** pour un papier chaud. C'est le changement le plus
  visible et le plus irréversible.
- **La marge technique** sur écran large : elle coûte 200 px de largeur qui ne
  portent presque rien. C'est précisément ce qui la rend signante — et c'est
  discutable.

---

_Les six familles d'écrans et leurs maquettes détaillées sont traitées dans
`docs/design-archetypes.md`._

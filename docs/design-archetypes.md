# Archétypes d'écrans — Système PLANCHE

> **Statut : proposition soumise à validation.** Ce document est la Phase 4 du
> travail de direction artistique ouvert par `docs/design-manifesto.md`. Il n'a
> donné lieu à aucune modification de code. Il ne vaut que si le manifeste est
> validé : il en est l'application, pas une alternative.

---

## 0. Ce que ce document décide

Le manifeste fixe une langue : papier et encre, cote et repère, filets, Spectral
et Fira, rythme de 28 px, marge technique. Une langue commune ne suffit pas à
faire un ouvrage — il faut des **genres**.

Six familles d'écrans, six genres. Chacune reçoit une **identité secondaire** :
un nom, un modèle d'origine, une inflexion de la grille et un ornement propre.
Aucune ne reçoit une palette à elle, une typographie à elle ou une géométrie à
elle. La règle est celle d'un ouvrage relié : **on change de chapitre, pas de
livre.**

| Famille           | Identité secondaire             | Modèle d'origine                  | Encre                                |
| ----------------- | ------------------------------- | --------------------------------- | ------------------------------------ |
| Concours          | **Le Dossier**                  | L'instruction administrative      | Encre du concours                    |
| Cours             | **La Leçon**                    | Le cahier de cours                | `encre-bistre`                       |
| Fiches techniques | **La Planche d'identification** | La notice constructeur, le cartel | Encre du module hôte                 |
| Culture           | **Le Cahier**                   | La revue d'histoire               | `encre-sienne`                       |
| Géopolitique      | **La Situation**                | Le point de situation daté        | `encre-sienne`                       |
| Entraînement      | **Le Banc**                     | La salle d'examen                 | `encre-violine` ou encre du concours |

Culture et Géopolitique **partagent volontairement une encre**. Ce sont deux
registres d'un même fonds : ce qui les sépare n'est pas la couleur, c'est le
rapport au temps. Le Cahier raconte ce qui est arrivé ; la Situation décrit ce
qui est en cours, et doit donc porter une date d'arrêt.

---

## 1. La cote — grammaire commune aux six familles

Le manifeste institue la cote sans en fixer la syntaxe. La voici.

```
MODULE · F.C.NN
RÉV. AAAA-MM-JJ
```

- **MODULE** — `EOPAN`, `EOPN`, `ALAT`, `PSY`, `FOND`, `CULT`.
- **F** — la lettre de famille : **A** Concours, **B** Cours, **C** Fiches
  techniques, **D** Culture, **E** Géopolitique, **F** Entraînement.
- **C** — le rang de la catégorie dans `content/_referentiels/categories.json`.
  Ce référentiel existe déjà et porte un `order` par catégorie ; la cote ne fait
  que le rendre visible.
- **NN** — le rang de la fiche dans sa catégorie, sur deux chiffres.

```
EOPAN · A.3.07     Parcours de sélection, 7ᵉ fiche
FOND  · B.3.02     Aérodynamique, 2ᵉ leçon
EOPN  · C.6.11     Appareils, 11ᵉ planche
PSY   · F.1.04     Épreuves, 4ᵉ banc
```

**La cote est stable et gelée.** Elle se dérive de données déjà présentes dans
le contenu ; elle n'est jamais saisie à la main, jamais renumérotée après coup.
Une fiche déplacée garde sa cote et reçoit un renvoi. C'est la condition pour
qu'une cote puisse être notée sur un cahier par un candidat et retrouvée six
mois plus tard.

---

## 2. Le gabarit commun

Toutes les familles héritent de la même ossature. Ce qui suit n'est pas répété
dans chaque archétype ; seules les inflexions le sont.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  BANDEAU — Fira Sans 15, filet fort en dessous, hauteur 56, fond papier   │
│  PrépaPilote     Concours · Cours · Fiches · Culture · Entraînement    ⌕  │
└──────────────────────────────────────────────────────────────────────────┘
   ← 200 →   40   ←────────── 720 ──────────→   40   ←── 280 ──→
┌─────────┐│                                  │┌──────────────┐
│ EOPAN   │││  Titre de page · Spectral 44     ││              │
│ A.3.07  │││                                  ││  ANNEXE      │
│ RÉV.    │││  Chapô · Spectral 17, encre-2    ││  débords,    │
│ 2026-.. │││  ────────────────────────────    ││  notes,      │
│         │││                                  ││  renvois,    │
│ ▬ §1    │││  Corps, 66–72 signes, rythme 28  ││  sources     │
│         │││                                  ││              │
│ ▬ §2    │││                                  ││              │
│         │││                                  ││              │
└─────────┘│                                  │└──────────────┘
   marge   filet de marge (1 px, vertical)
```

> **Révision du 2026-07-28.** Les largeurs du schéma ci-dessus ne valent que pour
> la variante de marge la plus large. **Le gabarit ne dépend d'aucune valeur en
> pixels** : la marge connaît trois états (large, rail, aucune), choisis d'après
> la charge documentaire de la page et non d'après la seule largeur d'écran, et
> elle est désactivable. Marge par défaut de chaque famille, règle de bascule et
> variantes : `docs/design-ecrans-maitres.md`.

- La **marge** ne porte que : cote, révision, marque de module, repères de
  section. Rien d'autre, dans aucune famille. Quand elle disparaît, la cote
  devient un cartouche et les repères passent en tête de section — rien n'est
  perdu, tout change de place.
- Le **corps** tient la justure de 66 à 72 signes, dans toutes les familles,
  sans exception.
- L'**annexe** est facultative. Quand elle est vide, elle reste vide : on ne la
  remplit pas d'un encart d'appel à l'action.
- Le **pied de planche** ferme chaque écran : filet fort, date de vérification,
  sources numérotées, historique de révision.

---

# ARCHÉTYPE I — LE DOSSIER

## Famille : Concours

`/eopan` · `/eopn` · `/alat` · `/[module]/[categorie]` · `/[module]/selection`
· `/fiche-de-travail/[concours]`

## L'intention du lecteur

Il ne vient pas lire. Il vient **savoir où il en est** : quelles épreuves,
quelles conditions, quelles dates, quelles pièces, quel ordre. Toute phrase qui
ne répond pas à une de ces questions lui coûte du temps.

## Identité secondaire

**Le Dossier.** Le modèle est l'instruction administrative militaire : un
document qui classe, qui date, qui énumère, et dont la froideur est une forme de
respect. C'est la famille **la plus sèche des six**, et elle doit le rester. Le
Dossier ne motive pas, ne rassure pas, ne félicite pas. Il informe et il tient
ses délais.

C'est aussi la famille qui porte l'**encre du concours** — `encre-marine`,
`encre-air`, `encre-terre`. Un candidat EOPAN qui bascule sur EOPN doit sentir
le changement d'armée dans le filet sous le titre, avant d'avoir lu le nom.

## Inflexion de la grille

L'annexe devient un **échéancier** permanent, collé en haut de colonne, en Fira
Mono, sans fond, sans cadre : uniquement des filets horizontaux.

```
┌──────────────┐
│ ÉCHÉANCIER   │   ← petites capitales Spectral
│──────────────│
│ INSCRIPTION  │   ← Fira Mono 12, encre-3
│ voir source  │
│──────────────│
│ ÉPREUVES     │
│ voir source  │
└──────────────┘
```

**Aucune date n'est affichée sans source.** Quand la date officielle n'est pas
publiée, l'échéancier écrit _« non publié à ce jour »_ et renvoie à la source.
C'est une règle du projet ; elle devient ici une règle graphique, parce que
l'échéancier est précisément l'endroit où la tentation d'inventer est la plus
forte.

## Maquette — page de module

```
   MARGE                CORPS 720                        ANNEXE
┌─────────┐  ┌────────────────────────────────┐   ┌──────────────┐
│ EOPAN   │  │ EOPAN                          │   │ ÉCHÉANCIER   │
│ A.1.01  │  │ Élève Officier Pilote de       │   │ ──────────   │
│ RÉV.    │  │ l'Aéronautique Navale          │   │ …            │
│ ……      │  │ ══════════════════════════════ │   └──────────────┘
│         │  │  ↑ filet 1 px, encre-marine    │
│ ▬ 1     │  │                                │   ┌──────────────┐
│ ▬ 2     │  │ Chapô, 3 lignes maximum.       │   │ EN CHIFFRES  │
│ ▬ 3     │  │                                │   │ ──────────   │
│         │  │ ─── PL. 01 ──────────────────  │   │ 148 fiches   │
│         │  │ [ photographie, filet 1 px ]   │   │ 62 quiz      │
│         │  │ PL. 01 — Rafale M à l'appon-   │   │ ──────────   │
│         │  │ tage. Photo : … (CC BY 2.0)    │   │ chiffres     │
│         │  │                                │   │ mesurés sur  │
│         │  │ ─────────────────────────────  │   │ le contenu,  │
│         │  │ LE PARCOURS                    │   │ jamais       │
│         │  │                                │   │ décoratifs   │
│         │  │  1 ─ Dossier          →        │   └──────────────┘
│         │  │  2 ─ Sélection        →        │
│         │  │  3 ─ Épreuves         →        │
│         │  │  4 ─ École            →        │
│         │  │                                │
│         │  │ ─────────────────────────────  │
│         │  │ LE FONDS                       │
│         │  │                                │
│         │  │  6 ─ Appareils      12 fiches  │
│         │  │  7 ─ Navires         8 fiches  │
│         │  │  9 ─ BAN             6 fiches  │
│         │  │ 13 ─ Grades          4 fiches  │
│         │  │                                │
│         │  │ ══════ pied de planche ══════  │
└─────────┘  └────────────────────────────────┘
```

## Le motif propre : la table numérotée

C'est l'ornement signature du Dossier, et il n'apparaît nulle part ailleurs.
Une catégorie ou une étape est toujours annoncée par son **rang du référentiel**,
en Fira Mono, à gauche, sur une colonne alignée, suivi d'un tiret cadratin et du
libellé.

```
 6 ─ Appareils                                           12 fiches
 7 ─ Navires                                              8 fiches
 9 ─ Bases d'aéronautique navale                          6 fiches
```

Pas de carte. Pas d'icône. Pas de chevron. Un filet horizontal entre chaque
ligne, et le nombre de fiches aligné à droite en Fira Mono. Toute la ligne est
cliquable, le survol passe le filet en `filet-fort` et souligne le libellé.

Cette table est ce qui remplace, dans notre système, la grille de trois cartes.
Elle en dit plus, tient plus dense, se scanne plus vite, et **ne pourrait pas
appartenir à un autre produit**.

## Image

Une photographie par page de module, en tête, format panoramique large
(rapport 3:1). Elle porte `PL. 01` et son crédit complet. Les pages de
catégorie n'en portent aucune : elles sont des index, pas des vitrines.

## Mouvement

Aucun, hormis le survol des lignes et le tracé du repère de marge.

## Transposition étroite

La marge devient un bandeau : `EOPAN · A.1.01 — RÉV. 2026-07-27` sur une ligne
en Fira Mono 12, filet en dessous. L'échéancier passe **avant** la table
numérotée — sur mobile, la date est plus urgente que l'inventaire. La table
numérotée conserve son rang et son compte ; elle ne se transforme pas en liste
d'accordéons.

## Interdits propres à la famille

- Aucun compte à rebours animé, aucun « plus que N jours ».
- Aucun encouragement (« vous y êtes presque »).
- Aucune statistique de réussite non sourcée.
- Aucune progression personnelle sur ces pages : le Dossier décrit le concours,
  pas le candidat. La progression a son propre espace.

---

# ARCHÉTYPE II — LA LEÇON

## Famille : Cours

`/cours` · `/cours/[slug]` · `/fondamentaux/[categorie]/[slug]` · `/bia/[matiere]`

## L'intention du lecteur

Il vient **comprendre**, une fois, quelque chose qu'il ne comprend pas encore.
Il lira vingt minutes. Il reviendra dans trois semaines et voudra retrouver un
paragraphe précis sans relire le reste.

C'est la seule famille où la lecture longue est l'usage principal. Tout y est
subordonné au confort de lecture.

## Identité secondaire

**La Leçon.** Le modèle est le cahier de cours d'une classe préparatoire :
paragraphes numérotés, définitions encadrées, schémas au trait, exercices en
fin de section. `encre-bistre`, l'ocre des planches techniques.

## Inflexion de la grille

Deux changements, les seuls du document :

- **La numérotation des paragraphes.** Chaque section de niveau 2 porte un
  numéro en marge, en Fira Mono, aligné sur sa ligne de base : `§ 3`. Le repère
  de 8 px se place sous le numéro. C'est ce qui rend un cours citable —
  « revois le § 4 » — et c'est la raison d'être de la marge technique.
- **L'annexe devient le sommaire**, ancré, avec le paragraphe courant marqué par
  un repère plein. Pas de barre de progression de lecture : le sommaire dit déjà
  où l'on est.

## Maquette — une leçon

```
   MARGE                CORPS 720                        ANNEXE
┌─────────┐  ┌────────────────────────────────┐   ┌──────────────┐
│ FOND    │  │ Aérodynamique                  │   │ DANS CETTE   │
│ B.3.02  │  │ La couche limite               │   │ LEÇON        │
│ RÉV.    │  │ ══════════════════════════════ │   │ ──────────   │
│ ……      │  │  ↑ filet encre-bistre          │   │ ▬ 1 Origine  │
│         │  │                                │   │ ▬ 2 Régimes  │
│         │  │ Chapô en Spectral 17, encre-2.  │   │ ▬ 3 Décolle- │
│ § 1     │  │                                │   │      ment    │
│ ▬       │  │ 1  L'ORIGINE DU PHÉNOMÈNE      │   │ ▬ 4 Consé-   │
│         │  │ ─────────────────────────────  │   │      quences │
│         │  │                                │   └──────────────┘
│         │  │ Corps de lecture, Spectral 17, │
│         │  │ interligne 1.62, justure tenue │   ┌──────────────┐
│         │  │ entre 66 et 72 signes.         │   │ VOIR AUSSI   │
│         │  │                                │   │ ──────────   │
│         │  │ ┌ DÉFINITION ─────────────────┐│   │ → Profils    │
│         │  │ │ Petites capitales Spectral, ││   │ → Traînée    │
│         │  │ │ filet gauche encre-bistre,  ││   │   induite    │
│         │  │ │ fond 4 % de l'encre.        ││   └──────────────┘
│         │  │ └─────────────────────────────┘│
│ § 2     │  │                                │
│ ▬       │  │ 2  LES DEUX RÉGIMES            │
│         │  │ ─────────────────────────────  │
│         │  │                                │
│         │  │ [ schéma au trait, encre-      │
│         │  │   bistre, repères ① ② ③ ]      │
│         │  │ ────────                       │
│         │  │ PL. 04 — Transition laminaire  │
│         │  │ ① bord d'attaque  ② transition │
│         │  │ ③ décollement                  │
│         │  │                                │
│         │  │ ┌ PIÈGE ──────────────────────┐│
│         │  │ │ …                           ││
│         │  │ └─────────────────────────────┘│
│         │  │                                │
│         │  │ ─────────────────────────────  │
│         │  │ VÉRIFIER SA COMPRÉHENSION      │
│         │  │  → 8 questions sur cette leçon │
│         │  │                                │
│         │  │ ══════ pied de planche ══════  │
└─────────┘  └────────────────────────────────┘
```

## Le motif propre : le schéma numéroté

La Leçon est la famille du **schéma**, et le schéma y est traité comme le
manifeste l'exige : trait d'encre unique sur `papier-vergé`, deux graisses,
repères ①②③ expliqués sous la figure en Fira Mono pour le numéro et Fira Sans
pour le libellé.

Un schéma interactif — souffleries, polaires, React Flow — garde **exactement le
même dessin** que sa version fixe. L'interactivité ajoute une valeur qui change,
un curseur, une courbe qui se déplace. Elle ne change ni le trait, ni la
couleur, ni la légende. Un lecteur doit pouvoir imprimer la page et retrouver la
figure qu'il a manipulée.

## Le sas de sortie

Chaque leçon se termine par un renvoi vers les questions qui la couvrent. Un
lien, en Fira Sans, avec le nombre exact de questions disponibles. Pas de
bouton pleine largeur, pas de « Testez-vous ! », pas de badge.

## Image

La photographie est rare dans la Leçon — elle explique mal. Le schéma explique
mieux. Quand une photographie apparaît, c'est qu'elle montre un phénomène qu'un
trait ne peut pas rendre : une formation nuageuse, un givrage, un état de mer.

## Mouvement

Le tracé du repère à l'entrée de section. Rien d'autre, hors schéma interactif.

## Transposition étroite

Le numéro de paragraphe passe **avant le titre**, sur la même ligne :
`3 — LE DÉCOLLEMENT`. Le sommaire devient un bloc dépliable placé après le
chapô, fermé par défaut. La justure descend, le corps monte à 17.5 px, le
rythme de 28 px est conservé.

## Interdits propres à la famille

- Aucune surbrillance de texte automatique.
- Aucun « temps de lecture estimé » calculé par une formule : soit il est
  mesuré, soit il n'est pas affiché.
- Aucun encadré de plus de six lignes — au-delà, c'est du corps de texte.
- Deux encadrés consécutifs sont interdits : ils signalent un plan raté.

---

# ARCHÉTYPE III — LA PLANCHE D'IDENTIFICATION

## Famille : Fiches techniques

`/[module]/appareils/[slug]` · `/[module]/navires/[slug]` ·
`/[module]/unites/[slug]` · `/[module]/grades/[slug]` · `/dictionnaire/[terme]`

## L'intention du lecteur

Il vient **identifier** et **retenir** : quel appareil, quelle silhouette, quels
chiffres, quelle unité l'emploie. Il veut la donnée nue, tout de suite, et il
veut pouvoir la comparer à une autre.

## Identité secondaire

**La Planche d'identification.** Deux modèles se rejoignent ici : la notice
constructeur — silhouette, cotes, caractéristiques — et le cartel de musée —
dénomination, datation, provenance, numéro d'inventaire. C'est la famille où le
système PLANCHE est le plus littéral, et c'est la plus reconnaissable des six.

Elle porte l'**encre du module hôte** : un Rafale M consulté depuis EOPAN porte
`encre-marine`, le même appareil consulté depuis EOPN porte `encre-air`. La
fiche est unique ; sa cote l'est aussi ; seule la teinte du filet situe le
parcours d'où l'on vient.

## Inflexion de la grille

C'est la seule famille qui **inverse** le rapport corps / annexe. Le tableau de
caractéristiques n'est pas un débord : il est le sujet. Il occupe une colonne
pleine, à droite, du haut de la page au pied de planche.

```
│ marge 200 │ 40 │ figure + texte 560 │ 40 │ caractéristiques 400 │
```

## Maquette — un appareil

```
   MARGE            FIGURE + TEXTE 560              CARACTÉRISTIQUES 400
┌─────────┐  ┌──────────────────────────┐   ┌────────────────────────┐
│ EOPAN   │  │ Rafale M                 │   │ CARACTÉRISTIQUES       │
│ C.6.03  │  │ Chasseur embarqué        │   │ ══════════════════════ │
│ RÉV.    │  │ ════════════════════════ │   │                        │
│ ……      │  │  ↑ filet encre-marine    │   │ Constructeur     …     │
│         │  │                          │   │ Premier vol      …     │
│ ▬       │  │ ┌──────────────────────┐ │   │ Équipage         …     │
│         │  │ │                      │ │   │ ────────────────────── │
│ MARINE  │  │ │   [ silhouette au    │ │   │ DIMENSIONS       (m)   │
│ NATIO-  │  │ │     trait, 3 vues,   │ │   │ Envergure        …     │
│ NALE    │  │ │     encre-marine ]   │ │   │ Longueur         …     │
│         │  │ │                      │ │   │ Hauteur          …     │
│         │  │ └──────────────────────┘ │   │ ────────────────────── │
│         │  │ ────────                 │   │ MASSES          (kg)   │
│         │  │ PL. 03 — Trois vues au   │   │ À vide           …     │
│         │  │ trait. Schéma PrépaPilote│   │ Maximale         …     │
│         │  │                          │   │ ────────────────────── │
│         │  │ ┌──────────────────────┐ │   │ PERFORMANCES           │
│         │  │ │  [ photographie ]    │ │   │ Vitesse max      …     │
│         │  │ └──────────────────────┘ │   │ Plafond          …     │
│         │  │ ────────                 │   │ ────────────────────── │
│         │  │ PL. 04 — … (CC BY-SA 4.0)│   │                        │
│         │  │                          │   │ Chaque valeur renvoie  │
│         │  │ EN SERVICE               │   │ à sa source numérotée. │
│         │  │ ────────────────────────  │   │ Une valeur sans source │
│         │  │ Texte court, 3 à 5 para- │   │ n'est pas affichée.    │
│         │  │ graphes. Emploi, unités, │   └────────────────────────┘
│         │  │ particularités.          │
│         │  │                          │
│         │  │ RELATIONS                │
│         │  │ ────────────────────────  │
│         │  │ → Flottille 11F          │
│         │  │ → Porte-avions           │
│         │  │ → Appontage              │
│         │  │                          │
│         │  │ ═══ pied de planche ═══  │
└─────────┘  └──────────────────────────┘
```

## Le motif propre : le tableau de cotes

Fira Mono, alignement à droite, chiffres tabulaires, **unité dans l'en-tête de
groupe et jamais répétée dans les cellules**. Filets horizontaux seuls, aucune
zébrure. Les groupes (`DIMENSIONS`, `MASSES`, `PERFORMANCES`) sont annoncés en
petites capitales avec leur unité entre parenthèses.

Une cellule vide se lit `—`. Elle ne se lit jamais « N/A », jamais « ? », et la
donnée n'est **jamais estimée pour faire joli**. Un tableau à trous est un
tableau honnête ; c'est exactement ce qui nous sépare d'un contenu produit à la
chaîne.

## Le motif propre : la silhouette au trait

Chaque appareil, chaque navire porte une **silhouette au trait** dans l'encre de
son module. C'est un investissement lourd et c'est celui qui paiera le plus : un
fonds de silhouettes homogènes, au même trait, à la même échelle relative, est
une signature qu'aucun générateur ne produit.

Trois vues quand la source le permet (dessus, côté, face), une seule sinon.
Le dessin est un travail original ou une figure sous licence libre créditée —
jamais un décalque d'illustration protégée.

## Image

Deux au maximum : la silhouette et une photographie. Jamais de galerie, jamais
de carrousel. La photographie montre l'appareil en emploi, pas en meeting.

## Mouvement

Aucun. Une planche d'identification ne bouge pas. La comparaison entre deux
fiches se fait par la navigation, pas par une animation.

## Transposition étroite

Le tableau passe sous le texte, en pleine largeur, et **conserve son alignement
à droite et ses chiffres tabulaires**. Il ne se transforme pas en liste de
paires libellé/valeur : la colonne de chiffres est ce qui permet de comparer, et
elle survit à toutes les largeurs.

## Interdits propres à la famille

- Aucune vue 3D, aucun modèle manipulable : ce serait le SaaS qui reprend la
  main sur le manuel.
- Aucune barre comparative (« vitesse ▮▮▮▮▯ »), aucune notation.
- Aucun superlatif : « l'un des meilleurs chasseurs au monde » n'a pas de
  source, donc pas de place.

---

# ARCHÉTYPE IV — LE CAHIER

## Famille : Culture

`/culture/culture-aeronautique/[slug]` · `/culture/personnalites/[slug]` ·
`/culture/aviation-mondiale/[slug]` · `/[module]/histoire/[slug]` · `/lectures/[slug]`

## L'intention du lecteur

Il vient pour le plaisir, et il en tirera un avantage à l'oral. Il n'a pas
d'objectif immédiat. Il faut donc lui donner envie de rester — non par des
artifices, mais par de la **respiration** et un vrai travail de mise en page.

## Identité secondaire

**Le Cahier.** Le modèle est la revue d'histoire : un récit tenu, une
chronologie, un portrait, des citations attribuées, une bibliographie. C'est la
famille **la plus généreuse en blanc** des six, et la seule où le texte peut se
permettre une ouverture.

`encre-sienne`.

## Inflexion de la grille

- Le titre de page monte à **52 px** et s'installe sur trois lignes de rythme
  vides au-dessus de lui. C'est la seule dérogation à l'échelle du manifeste, et
  elle est réservée à cette famille.
- La **lettrine** est autorisée : première lettre du premier paragraphe en
  Spectral, sur deux lignes de rythme, dans `encre-sienne`. Une seule par page.
  C'est un ornement de tradition typographique, pas un effet — il n'existe que
  dans le Cahier.
- L'annexe porte la **chronologie**.

## Maquette — un article de culture

```
   MARGE                CORPS 720                        ANNEXE
┌─────────┐  ┌────────────────────────────────┐   ┌──────────────┐
│ CULT    │  │                                │   │ REPÈRES      │
│ D.16.04 │  │  ← trois lignes de rythme      │   │ CHRONO-      │
│ RÉV.    │  │                                │   │ LOGIQUES     │
│ ……      │  │ Hélène Boucher                 │   │ ──────────   │
│         │  │ ══════════════════════════════ │   │ 1908  …      │
│         │  │  ↑ filet encre-sienne          │   │ 1930  …      │
│ ▬       │  │                                │   │ 1934  …      │
│         │  │ Chapô, Spectral 17 italique,   │   │              │
│         │  │ encre-2, 3 lignes.             │   │ chaque date  │
│         │  │                                │   │ renvoie à sa │
│         │  │ ┌──────────────────────────┐   │   │ source       │
│         │  │ │   [ photographie ]       │   │   └──────────────┘
│         │  │ └──────────────────────────┘   │
│         │  │ ────────                       │   ┌──────────────┐
│         │  │ PL. 01 — … (domaine public)    │   │ POUR ALLER   │
│         │  │                                │   │ PLUS LOIN    │
│         │  │ ┌─┐                            │   │ ──────────   │
│         │  │ │E│n 1934, …                   │   │ → Lecture    │
│         │  │ └─┘  ↑ lettrine, encre-sienne  │   │ → Fiche      │
│         │  │                                │   └──────────────┘
│         │  │ Corps de lecture.              │
│         │  │                                │
│         │  │ │ « Citation en Spectral       │
│         │  │ │   italique, filet gauche. »  │
│         │  │ │   ᴀᴜᴛᴇᴜʀ, source             │
│         │  │                                │
│         │  │ Corps de lecture.              │
│         │  │                                │
│         │  │ ══════ pied de planche ══════  │
└─────────┘  └────────────────────────────────┘
```

## Le motif propre : la chronologie en marge

Une colonne de dates en Fira Mono, un filet vertical, un repère par entrée. Elle
ne défile pas avec le texte, elle ne s'anime pas, elle ne se déplie pas. Elle
est là, complète, dès le premier écran : le lecteur peut la parcourir avant de
lire, ce qui est exactement l'usage d'un repère chronologique.

Chaque date porte sa source. **Une chronologie non sourcée n'est pas publiée.**

## Image

C'est la famille où la photographie a le plus de valeur — portraits, appareils
historiques, documents. La limite d'une photographie par écran de défilement
tient quand même. Le domaine public y est fréquent : le crédit indique alors
`domaine public` avec l'origine et la date, jamais un simple « libre de
droits ».

## Mouvement

Le tracé du repère. Rien d'autre. La tentation de la « frise animée » est
précisément ce que le manifeste interdit.

## Transposition étroite

La chronologie passe **après** le chapô, avant le corps, en bandeau vertical
pleine largeur. La lettrine est conservée. Le titre descend à 34 px.

## Interdits propres à la famille

- Aucun « saviez-vous que » ni encadré anecdote.
- Aucune photographie recadrée en cercle.
- Aucun portrait sans date ni source.
- Aucun ton d'hagiographie : la famille raconte, elle ne célèbre pas.

---

# ARCHÉTYPE V — LA SITUATION

## Famille : Géopolitique

`/culture/geopolitique-defense/[slug]` · `/cartes` · `/cartes/[armee]` · `/veille/[slug]`

## L'intention du lecteur

Il vient chercher de quoi tenir dix minutes d'entretien sur un sujet
international. Il a besoin d'être **exact** et de savoir **jusqu'à quand** son
information est valable.

## Identité secondaire

**La Situation.** Le modèle est le point de situation daté : une carte, des
acteurs, une chronologie, des sources, et surtout un **arrêté**. C'est la
famille la plus prudente des six, et celle où l'appareil documentaire est le
plus visible.

`encre-sienne`, comme le Cahier — même fonds, registre différent.

## Inflexion de la grille : l'arrêté

Un bloc unique, sous le titre, avant le chapô, en Fira Mono, encadré de deux
filets forts :

```
═══════════════════════════════════════════════
ARRÊTÉ AU 2026-07-12 · 6 SOURCES · REVU LE 2026-07-27
═══════════════════════════════════════════════
```

C'est le seul bloc du système qui est à la fois obligatoire, non décoratif et
placé **au-dessus** du chapô. Il dit au lecteur ce qu'il engage. Un sujet dont
l'arrêté dépasse un seuil d'ancienneté porte la mention `À REVOIR` dans l'état
`attention` — jamais un badge rouge, jamais une alarme.

## Maquette — une situation

```
   MARGE                CORPS 720                        ANNEXE
┌─────────┐  ┌────────────────────────────────┐   ┌──────────────┐
│ CULT    │  │ Mer Noire                      │   │ ACTEURS      │
│ E.17.02 │  │ ══════════════════════════════ │   │ ──────────   │
│ RÉV.    │  │                                │   │ …            │
│ ……      │  │ ══════════════════════════════ │   │ …            │
│         │  │ ARRÊTÉ AU … · N SOURCES        │   │              │
│ ▬ 1     │  │ ══════════════════════════════ │   │ chaque acteur│
│ ▬ 2     │  │                                │   │ porte sa     │
│ ▬ 3     │  │ Chapô factuel, sans adjectif.  │   │ source       │
│         │  │                                │   └──────────────┘
│         │  │ ┌──────────────────────────┐   │
│         │  │ │  [ carte : papier-vergé, │   │   ┌──────────────┐
│         │  │ │    terres désaturées,    │   │   │ CHRONOLOGIE  │
│         │  │ │    frontières au filet,  │   │   │ ──────────   │
│         │  │ │    points d'intérêt en   │   │   │ …            │
│         │  │ │    encre de module ]     │   │   └──────────────┘
│         │  │ └──────────────────────────┘   │
│         │  │ ────────                       │   ┌──────────────┐
│         │  │ PL. 01 — Fond de carte : …     │   │ SOURCES      │
│         │  │ Tracés PrépaPilote.            │   │ ──────────   │
│         │  │                                │   │ 1 …          │
│         │  │ 1  LES FAITS                   │   │ 2 …          │
│         │  │ ─────────────────────────────  │   │ 3 …          │
│         │  │ Faits datés, chacun sourcé¹.   │   └──────────────┘
│         │  │                                │
│         │  │ 2  LES POSITIONS               │
│         │  │ ─────────────────────────────  │
│         │  │ Positions attribuées, jamais   │
│         │  │ résumées en jugement.          │
│         │  │                                │
│         │  │ 3  CE QUI RESTE INCERTAIN      │
│         │  │ ─────────────────────────────  │
│         │  │ Section obligatoire.           │
│         │  │                                │
│         │  │ ══════ pied de planche ══════  │
└─────────┘  └────────────────────────────────┘
```

## Le motif propre : la section « ce qui reste incertain »

**Obligatoire dans chaque situation.** Une section, en fin de corps, qui énonce
ce que les sources ne permettent pas de trancher.

C'est le geste éditorial le plus fort du site entier, et il est graphique autant
qu'éditorial : il occupe une section de plein rang, avec son filet et son
intertitre, exactement comme les faits. Il n'est pas relégué en note. Aucun
contenu généré à la chaîne n'écrit spontanément ce qu'il ne sait pas.

## Le motif propre : la carte

Traitée comme une planche, selon le manifeste : fond `papier-vergé`, terres en
aplat très désaturé, frontières au filet, libellés en Fira Sans 13.5, points
d'intérêt dans l'encre de leur module. Aucun relief, aucune ombre, aucun
dégradé de densité, aucun marqueur en goutte.

Une carte interactive garde le dessin de la carte fixe. Le zoom change l'échelle
et le niveau de détail des libellés ; il ne change pas la palette.

## Image

La carte tient lieu de figure principale. La photographie est rare et toujours
datée et localisée.

## Transposition étroite

L'arrêté reste au-dessus du chapô — il ne descend jamais. Acteurs, chronologie
et sources passent sous le corps, dans cet ordre. La carte occupe la pleine
largeur et conserve ses commandes de zoom au doigt.

## Interdits propres à la famille

- Aucune couleur d'état sur une carte : `erreur` en rouge sur un territoire est
  un contresens politique autant que graphique.
- Aucun aplat rouge, aucune flèche d'invasion, aucune iconographie martiale.
- Aucune prévision, aucun pronostic, aucune analyse non attribuée.
- Aucun contenu de veille sans date d'arrêt.

---

# ARCHÉTYPE VI — LE BANC

## Famille : Entraînement

`/entrainement/[concours]` · `/psychotechnique/*` · `/bia/examen-blanc` ·
`/anglais/quiz` · `/reviser` · `/progression`

## L'intention du lecteur

Il vient **se mettre en difficulté**. Il n'est pas là pour lire ni pour
admirer : il est là pour être évalué, et il veut ensuite comprendre ses erreurs.

## Identité secondaire

**Le Banc.** Le modèle est la salle d'examen. Le principe VII du manifeste
gouverne toute la famille : **l'épreuve prime sur l'entraîneur.** La pédagogie
se déploie avant et après ; jamais pendant.

`encre-violine` pour les tests psychotechniques ; l'encre du concours pour les
quiz de connaissances.

## Les trois temps, et leur traitement opposé

C'est la famille la plus contrastée du système, parce qu'elle change de registre
deux fois.

### Temps 1 — Avant : la consigne

Grille normale, marge, cote, annexe. Registre du Dossier : sec, énumératif.

```
┌─────────┐  ┌────────────────────────────────┐
│ PSY     │  │ Le test des triangles           │
│ F.1.06  │  │ ══════════════════════════════ │
│ RÉV.    │  │  ↑ filet encre-violine         │
│ ……      │  │                                │
│         │  │ L'ÉPREUVE                       │
│         │  │ ─────────────────────────────  │
│         │  │ Durée          …               │
│         │  │ Questions      …               │
│         │  │ Concours       …               │
│         │  │                                │
│         │  │ ┌ AVANT DE VOUS LANCER ───────┐│
│         │  │ │ → Fiche de méthode          ││
│         │  │ └─────────────────────────────┘│
│         │  │                                │
│         │  │ ┌ NIVEAU ─────────────────────┐│
│         │  │ │ ○ Découverte  ○ Concours    ││
│         │  │ └─────────────────────────────┘│
│         │  │                                │
│         │  │      [ Commencer ]             │
└─────────┘  └────────────────────────────────┘
```

### Temps 2 — Pendant : le dépouillement

**Tout disparaît.** Navigation, marge, annexe, cote, pied de planche, liens,
recherche. Il ne reste que quatre choses, dans cet ordre vertical :

```
┌──────────────────────────────────────────────────────┐
│  12 / 30                                     04:37   │   ← Fira Mono, encre-3
│  ───────────────────────────────────────────────────  │
│                                                      │
│                                                      │
│                  [ LA FIGURE ]                       │   ← centrée, au plus grand
│                                                      │
│                                                      │
│  ────────────────────────────────────────────────    │
│                                                      │
│   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐     │
│   │   A    │  │   B    │  │   C    │  │   D    │     │   ← filets, rayon 0
│   └────────┘  └────────┘  └────────┘  └────────┘     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

- Le compteur de questions et le chronomètre, en Fira Mono, `encre-3`, **sans
  barre de progression** et sans couleur d'alerte. Un chronomètre qui rougit à
  trente secondes est un artifice de jeu.
- La figure ou l'énoncé, au plus grand que la fenêtre permet.
- Les propositions, en filets, rayon 0, **cadrage strictement identique** entre
  elles — le manifeste l'exige, l'expérience nous l'a imposé : un cadrage qui
  varie trahit la réponse.
- Rien d'autre. Aucune aide, aucun indice, aucun encouragement.

L'écran de jeu occupe la hauteur pleine (`min-h` de la fenêtre) et le défilement
revient en haut à chaque question. C'est une exigence de conception, pas un
détail d'implémentation : sans elle, on atterrit sur les propositions avant
d'avoir vu la figure.

### Temps 3 — Après : la correction

La grille revient, et avec elle tout l'appareil. Le score en haut, les erreurs
ensuite, jamais l'inverse.

```
┌─────────┐  ┌────────────────────────────────┐   ┌──────────────┐
│ PSY     │  │ Résultat                       │   │ REVOIR       │
│ F.1.06  │  │ ══════════════════════════════ │   │ ──────────   │
│         │  │                                │   │ → Méthode    │
│         │  │  22 / 30        04:37          │   │ → Leçon      │
│         │  │  ──────────────────────────    │   └──────────────┘
│         │  │  JUSTESSE   …   RYTHME   …     │
│         │  │                                │
│         │  │ ─────────────────────────────  │
│         │  │ VOS ERREURS                    │
│         │  │                                │
│         │  │ Question 4                     │
│         │  │  ┌──────────┐  ┌──────────┐    │
│         │  │  │ VOTRE    │  │ RÉPONSE  │    │   ← petites capitales
│         │  │  │ RÉPONSE  │  │ ATTENDUE │    │
│         │  │  │ [ figure]│  │ [ figure]│    │
│         │  │  └──────────┘  └──────────┘    │
│         │  │   filet erreur   filet juste   │
│         │  │                                │
│         │  │  Pourquoi : phrase unique qui  │
│         │  │  nomme l'écart.                │
│         │  │                                │
└─────────┘  └────────────────────────────────┘
```

## Le motif propre : la comparaison côte à côte

Une erreur ne se corrige pas en affichant la bonne réponse. Elle se corrige en
montrant **les deux** — ce que l'on a choisi, ce qu'il fallait choisir — au même
cadrage, à la même taille, côte à côte, sous deux libellés en petites
capitales : `VOTRE RÉPONSE` / `RÉPONSE ATTENDUE`.

Le filet du cadre porte l'état, `erreur` à gauche, `juste` à droite. La couleur
**double** le libellé, elle ne le remplace pas : un daltonien lit les deux
libellés et s'en sort.

Sous la paire, **une phrase**, qui nomme l'écart précis. Pas un paragraphe
d'explication générale : l'écart, celui-là, dans cette question.

## Le motif propre : le relevé de progression

La progression n'emprunte rien au tableau de bord. Pas de cartes de
statistiques, pas de jauges circulaires, pas de courbe lissée sur fond dégradé.
Un **relevé** : un tableau, filets horizontaux, Fira Mono, une ligne par
séance, colonnes date / épreuve / score / durée. Et un graphique unique, au
trait, sans remplissage, sans point brillant, sans info-bulle flottante — les
valeurs sont lisibles dans le tableau.

C'est l'interdit n° 48 du manifeste appliqué là où il coûte le plus cher :
**aucun module n'a de tableau de bord pour page d'accueil.**

## Mouvement

- Le passage d'une question à la suivante : opacité, 120 ms. Pas de glissement,
  pas de retournement de carte.
- La révélation d'une correction : apparition à 180 ms.
- Aucune animation de célébration, aucune séquence, aucun confetti.

## Transposition étroite

Le temps 2 est **identique** sur mobile — il était déjà dépouillé. La figure
occupe la largeur, les propositions passent en deux colonnes plutôt que quatre,
et conservent leur cadrage commun. Le compteur et le chronomètre restent en
haut, fixés.

## Interdits propres à la famille

- Aucune série, aucun badge, aucun trophée, aucun niveau à débloquer.
- Aucun son.
- Aucun classement entre utilisateurs.
- Aucune couleur d'état pendant l'épreuve : le rouge et le vert n'existent
  qu'après validation.
- Aucun « vous progressez ! » : le relevé montre, il ne commente pas.

---

# 3. Ce qui n'est pas une famille

Trois zones ne relèvent d'aucun archétype et suivent le gabarit commun sans
inflexion.

**L'accueil.** Ce n'est ni un héros centré ni un tableau de bord. C'est une
**page de garde** : le titre de l'ouvrage, une phrase qui dit ce qu'il est, la
table des six familles en table numérotée (motif du Dossier), et l'état du fonds
en chiffres mesurés. Une photographie, en tête, panoramique.

**La recherche.** Une liste, pas une grille. Chaque résultat porte **sa cote**,
son module, son type et sa date de révision, en Fira Mono. C'est l'écran où la
cote démontre son utilité : on cherche, on retient une cote, on y revient.

**Le compte et l'espace authentifié.** Registre du Dossier, sans exception et
sans ornement. C'est la zone où l'esthétique SaaS s'infiltre le plus
naturellement ; elle doit y être combattue le plus fermement.

---

# 4. Tableau de contrôle

Un écran est conforme quand les douze réponses sont oui.

| #   | Contrôle                                                                   |
| --- | -------------------------------------------------------------------------- |
| 1   | La cote et la révision sont visibles, dans la marge ou le bandeau.         |
| 2   | La justure du corps tient entre 66 et 72 signes.                           |
| 3   | Le rythme vertical de 28 px est respecté dans la colonne de lecture.       |
| 4   | Une seule encre de module est visible sur l'écran.                         |
| 5   | Aucune couleur d'état hors correction ou validation.                       |
| 6   | Aucun rayon supérieur à 2 px sur un objet documentaire.                    |
| 7   | Aucune ombre portée hors surface flottante.                                |
| 8   | Chaque figure porte un numéro de planche, une légende et son crédit.       |
| 9   | Chaque donnée chiffrée renvoie à une source.                               |
| 10  | Rien ne bouge sans action de l'utilisateur.                                |
| 11  | `prefers-reduced-motion` supprime toutes les apparitions.                  |
| 12  | Sur écran étroit, aucune fonction n'a disparu — seulement changé de place. |

Et la question finale, celle de l'épreuve du manifeste :

> **Logo masqué, cet écran est-il reconnaissable ?**

Si la réponse tient à la couleur, elle est fausse. Elle doit tenir à la
structure : la marge et sa cote, la table numérotée, le tableau de cotes, la
chronologie en marge, l'arrêté daté, le dépouillement du banc.

---

# 5. Ordre de bataille proposé pour la refonte

Pour information, et sans engagement d'exécution — **rien ne commence avant
validation.** Si le manifeste et les archétypes sont retenus, l'ordre le plus
sûr serait :

1. **Les jetons** — papier, encres, encres de module, états, modes clair et
   sombre. Rien de visible ne change encore vraiment ; tout en dépend.
2. **La typographie** — Spectral, Fira Sans, Fira Mono, l'échelle, la justure,
   le rythme de 28. C'est le changement le plus perceptible.
3. **Le gabarit** — marge technique, cote, repères, pied de planche. C'est le
   moment où le site devient reconnaissable.
4. **Les ornements et composants** — filets, encadrés, tableaux, citations,
   boutons, suppression des ombres et des rayons.
5. **Les six archétypes**, dans l'ordre : Leçon, Planche d'identification,
   Dossier, Banc, Cahier, Situation.
6. **Les silhouettes au trait**, chantier long, mené en fond.

Chaque étape est un lot livrable séparément, avec `npm run check` vert et la
documentation mise à jour dans le même commit — les règles du projet ne
changent pas parce que le design change.

---

_Ce document et `docs/design-manifesto.md` forment la proposition complète.
Aucune ligne de code, aucun composant, aucune feuille de style n'a été modifié._

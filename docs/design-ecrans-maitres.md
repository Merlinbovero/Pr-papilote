# Écrans maîtres — Système PLANCHE

> **Statut : proposition soumise à validation.** Ce document est la suite de
> `docs/design-manifesto.md` et de `docs/design-archetypes.md`, après les
> arbitrages du 28 juillet 2026. Aucun fichier de production n'a été modifié pour
> le produire. La refonte du code ne commence qu'après validation des écrans
> ci-dessous.
>
> **Exports visuels, contenu réel** — huit écrans × desktop clair, desktop sombre,
> mobile :
> <https://claude.ai/code/artifact/aa2b69bc-9834-4694-8368-3aa40c708757>
>
> **Dossier d'arbitrage** (palette, comparatif typographique, variantes de marge) :
> <https://claude.ai/code/artifact/92aa1905-b062-4e27-83d6-cebaeb4ee5eb>

---

## 0. Ce que les arbitrages ont changé

| Arbitrage                             | Effet sur le système                                                                     |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| Spectral = voix éditoriale seulement  | La sans-serif garde l'interface. Le rôle de chaque famille est fixé par écran, plus bas. |
| Blanc cassé neutre, pas de sépia      | Palette recalculée à très bas chroma. Voir manifeste §3.1.                               |
| Mode sombre = charbon bleuté          | Le registre sombre ne simule plus un papier. Jetons renommés `papier` → `fond`.          |
| Marge responsive, jamais 200 px fixes | Trois variantes, une par charge documentaire, plus une désactivation totale.             |
| Hub du Banc sous charte               | Le dépouillement est un **état de session**, pas une identité de famille.                |

---

## 1. Les trois variantes de marge

| Variante            | Largeur                     | Plage                                 | Porte                                         | Devient                      |
| ------------------- | --------------------------- | ------------------------------------- | --------------------------------------------- | ---------------------------- |
| **1 · Marge large** | `clamp(168px, 13vw, 224px)` | ≥ 1440 px                             | Cote, révision, module, repères, numéros de § | —                            |
| **2 · Rail**        | 72–88 px                    | 1180–1439 px                          | Repères et numéros de § seuls                 | Cartouche au-dessus du titre |
| **3 · Sans marge**  | 0                           | < 1180 px, et Le Banc à toute largeur | Rien                                          | Cartouche pleine largeur     |

**Règle de bascule.** Ce n'est pas la largeur d'écran seule, c'est **la charge** :
une marge qui ne porte rien ne s'affiche pas, même sur un grand écran. Une page
sans repères de section retombe sur la variante 2. **La marge large se mérite.**

### La décision est déclarative

**Arrêté le 2026-07-28.** La variante n'est **jamais déduite du contenu présent
dans le DOM**. Elle est déclarée, par archétype et surchargeable par page :

```ts
type MarginMode = "wide" | "rail" | "none";
```

Chaque archétype porte un `marginMode` par défaut ; les métadonnées d'une page
peuvent le surcharger. Une déduction automatique serait invisible, instable au
fil des éditions, et impossible à tester — trois raisons de ne pas la faire. Les
largeurs restent responsives à l'intérieur du mode déclaré : `wide` retombe sur
`rail` puis sur `none` quand la fenêtre se resserre, mais **une page déclarée
`none` ne remonte jamais**.

**Marge par défaut, par famille**

| Famille                        | Défaut     | Pourquoi                                                                   |
| ------------------------------ | ---------- | -------------------------------------------------------------------------- |
| Le Dossier — concours          | 2 · rail   | Peu de sections ; l'échéancier compte plus que les repères.                |
| La Leçon — cours               | 1 · large  | Seule famille où la marge est indispensable : elle porte les numéros de §. |
| La Planche — fiches techniques | 2 · rail   | La largeur va au tableau de cotes.                                         |
| Le Cahier — culture            | 1 · large  | La respiration fait partie du genre.                                       |
| La Situation — géopolitique    | 2 · rail   | L'arrêté est dans le corps, en cartouche : il doit être vu.                |
| Le Banc — entraînement         | 3 · aucune | Hub en rail ; session sans marge, à toute largeur.                         |

---

## 2. Le comparatif typographique

Spectral est constante dans les trois appariements. **Seule la sans-serif
change.** Les trois mêmes écrans, le même texte : cours scientifique, fiche
appareil, session d'entraînement.

| Appariement                      | Argument                                                                                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **A · Spectral + Fira Sans**     | Humaniste, dessinée pour les petites tailles à l'écran. La lignée de la signalétique — celle que Frutiger a portée pour Roissy. Mono assortie. |
| **B · Spectral + IBM Plex Sans** | Registre d'ingénierie assumé. Superfamille complète (Sans, Mono, Serif). Plus étroite, plus dense dans les tableaux.                           |
| **C · Spectral + Inria Sans**    | Dessinée par une fonderie française pour un institut public français de recherche. Lignée institutionnelle, formes plus rondes.                |

**Marianne**, caractère officiel de l'État, aurait été le choix narratif évident.
Sa licence la réserve à l'État : elle est écartée pour raison juridique, pas
esthétique.

**Décision : A — Spectral + Fira Sans**, arrêtée le 2026-07-28. Spectral porte la
voix éditoriale, Fira Sans l'interface et le fonctionnement.

**Fira Mono est restreinte.** Elle ne sert plus qu'aux codes, fréquences,
coordonnées, références et cotes, valeurs techniques de tableau, dates de
chronologie et chronomètres. Les libellés, les mentions d'annexe et les comptes
rédigés (« 11 fiches ») repassent en Fira Sans — seul le nombre reste en Mono,
pour que les colonnes de chiffres s'alignent.

### Petites capitales : ce que la vérification a changé

**Le sous-ensemble webfont de Spectral servi par Google Fonts ne contient pas
`smcp`.** Vérifié en inspectant les tables GSUB du woff2 réellement servi : il
n'expose que `ccmp dnom frac kern liga locl mark numr pnum tnum`. Le TTF source
OFL, lui, expose `smcp`, `c2sc`, `onum`, `lnum` et `tnum`.

Conséquence directe : **`next/font/google` ne peut pas produire de vraies petites
capitales.** Il ne resterait que la synthèse du navigateur — interdite.

Les fontes seront donc **auto-hébergées**, découpées depuis les TTF sources en
conservant explicitement `smcp`, `c2sc`, `tnum`, `onum`, `lnum`. Coût mesuré sur
le jeu complet — Spectral 400 / 600 / italique, Fira Sans 400 / 500 / 600, Fira
Mono 400 / 500, sous-ensemble latin — : **211 kB de woff2**. Fira Sans expose
aussi `smcp`. Fira Mono n'en a pas besoin.

**Constat honnête sur le comparatif** : sur le Banc, la sans-serif ne porte
presque rien — compteur, chronomètre, lettres de proposition. C'est l'écran où le
choix comptait le moins, et cela retirait un argument au débat plutôt que d'en
ajouter un.

---

# Les huit écrans maîtres

Sept écrans demandés, plus le hub du Banc — complément à l'arbitrage qui veut
que, hors session, Le Banc reste sous charte. Chaque écran est décrit selon les
mêmes dix points. Ce qui est commun au système
(cote, pied de planche, justure, rythme) n'est pas répété : seules les inflexions
le sont.

---

## ÉCRAN 1 — Page d'accueil

**Famille** — aucune. C'est une **page de garde**, pas un membre d'une famille.

1. **Structure** — Bandeau · cote `PRÉPAPILOTE · PAGE DE GARDE` · titre · phrase
   d'objet · une planche photographique panoramique · table numérotée des six
   familles · pied de planche. Annexe : état du fonds.
2. **Grille** — Gabarit commun. Annexe présente.
3. **Marge** — Variante 2 par défaut : la page de garde ne porte pas de repères
   de section, donc la marge large ne se mérite pas.
4. **Typographies** — Titre Spectral 44. Phrase d'objet Spectral 17,5.
   Table numérotée : rangs en Fira Mono, libellés en sans-serif 16. Cote et
   légendes en Fira Mono.
5. **Hiérarchie** — Titre → objet → planche → table. Une seule entrée forte : la
   table. Aucun bouton d'appel à l'action.
6. **Couleurs** — Aucune encre de module : l'accueil n'appartient à aucun module.
   Filets et encres seules.
7. **Images** — Une, panoramique, en tête, avec `PL. 01` et crédit complet.
8. **Composants** — Table numérotée, planche photo, bloc de chiffres en annexe,
   pied de planche.
9. **Mobile** — Cartouche, puis titre, puis table. La planche passe après l'objet.
   L'état du fonds descend en bas.
10. **Ce qui la distingue** — L'absence de héros centré et de grille de trois
    cartes. Une page de garde d'ouvrage, dont la seule promesse est un sommaire.

---

## ÉCRAN 2 — Hub EOPAN

**Famille** — Le Dossier.

1. **Structure** — Bandeau · cote `EOPAN · A.1.01` · titre + intitulé complet ·
   filet marine · chapô · planche panoramique · `LE PARCOURS` (table numérotée) ·
   `LE FONDS` (table numérotée) · pied de planche. Annexe : `ÉCHÉANCIER` puis
   `EN CHIFFRES`.
2. **Grille** — Gabarit commun ; annexe permanente.
3. **Marge** — Variante 2 par défaut. Variante 1 seulement si la page porte assez
   de sections pour justifier des repères.
4. **Typographies** — Titre Spectral 44 ; intitulé complet en sans-serif 12,5
   capitales interlettrées ; libellés de table en sans-serif 16 ; rangs, comptes
   et échéancier en Fira Mono.
5. **Hiérarchie** — Deux sections seulement : ce qu'on doit faire, ce qu'on peut
   consulter. Rien entre les deux.
6. **Couleurs** — `encre-marine` sur le filet de titre, la marque de module et
   les repères. Aucun autre emploi. Un candidat qui bascule sur EOPN doit sentir
   le changement d'armée avant d'avoir lu le nom.
7. **Images** — Une, panoramique 3:1, en tête. Les pages de catégorie n'en
   portent aucune : ce sont des index, pas des vitrines.
8. **Composants** — Table numérotée (rangs réels du référentiel), échéancier,
   bloc de chiffres, planche photo, pied de planche.
9. **Mobile** — L'échéancier remonte **avant** la table numérotée : la date est
   plus urgente que l'inventaire. La table garde ses rangs et ses comptes ; elle
   ne devient pas une liste d'accordéons.
10. **Ce qui le distingue** — La table numérotée aux rangs du référentiel
    (6, 7, 9, 13 — **les trous se voient, et c'est voulu**), l'échéancier
    permanent, et l'interdit de toute date sans source : quand elle n'est pas
    publiée, l'échéancier l'écrit.

---

## ÉCRAN 3 — Cours scientifique

**Famille** — La Leçon.

1. **Structure** — Surtitre matière · titre · filet bistre · chapô · sections
   numérotées · encadrés · schéma au trait légendé · sas de sortie vers les
   questions · pied de planche. Annexe : sommaire ancré, puis renvois.
2. **Grille** — Gabarit commun. Le corps ne dépasse jamais la justure, même quand
   la fenêtre le permettrait.
3. **Marge** — Variante 1 par défaut, et **c'est la seule famille où elle est
   indispensable** : elle porte les numéros de paragraphe (`§ 1`, `§ 2`), donc la
   citabilité. Sans elle, la numérotation retombe dans le corps.
4. **Typographies** — Titre Spectral 44 ; corps Spectral 17 / 1,62 ; intertitres
   sans-serif 15 capitales ; numéros de § et légendes en Fira Mono ; libellés
   d'encadré en capitales interlettrées.
5. **Hiérarchie** — Le rythme de 28 px porte toute la hiérarchie. Un encadré ne
   dépasse pas six lignes ; deux encadrés consécutifs sont interdits — ils
   signalent un plan raté.
6. **Couleurs** — `encre-bistre` sur le filet de titre, les repères, le filet
   d'encadré et **le trait du schéma**. Les états n'entrent pas dans un schéma.
7. **Images** — Rares. Le schéma explique mieux qu'une photographie. Une photo
   n'apparaît que pour ce qu'un trait ne peut pas rendre : un givrage, un état de
   mer, une formation nuageuse.
8. **Composants** — Encadrés `DÉFINITION` / `MÉTHODE` / `PIÈGE` / `À RETENIR`,
   schéma numéroté ①②③ avec liste sous la figure, sommaire ancré, sas de sortie.
9. **Mobile** — Le numéro de § quitte la marge et rejoint le titre de section
   (`3 — LE DÉCOLLEMENT`). Le sommaire devient un bloc replié après le chapô. Le
   rythme de 28 px est conservé.
10. **Ce qui la distingue** — La numérotation citable en marge et le schéma au
    trait. Un schéma interactif garde **exactement le même dessin** que sa version
    fixe : l'interactivité ajoute une valeur qui change, jamais un trait ni une
    couleur.

---

## ÉCRAN 4 — Fiche appareil

**Famille** — La Planche d'identification.

1. **Structure** — Cote `EOPAN · C.6.03` · titre · sous-titre de type · filet
   module · silhouette au trait · photographie · `EN SERVICE` (3 à 5 paragraphes)
   · `RELATIONS` · pied de planche. Colonne droite : `CARACTÉRISTIQUES`, pleine
   hauteur.
2. **Grille** — **La seule famille qui inverse le rapport corps / annexe.** Le
   tableau de cotes n'est pas un débord : c'est le sujet. `marge · figure+texte
560 · caractéristiques 400`.
3. **Marge** — Variante 2 par défaut : la largeur va au tableau.
4. **Typographies** — Titre Spectral 44 ; sous-titre sans-serif capitales ;
   libellés du tableau en sans-serif ; **toutes les valeurs en Fira Mono, alignées
   à droite, chiffres tabulaires**.
5. **Hiérarchie** — Identifier d'abord (silhouette), retenir ensuite (tableau),
   comprendre enfin (texte). Le texte est court par construction.
6. **Couleurs** — Encre du **module hôte** : un même appareil consulté depuis
   EOPAN porte le marine, depuis EOPN le bleu d'air. La fiche est unique, sa cote
   aussi ; seule la teinte situe le parcours d'où l'on vient.
7. **Images** — Deux au maximum : la silhouette au trait et une photographie
   d'emploi. Jamais de galerie, jamais de carrousel, jamais de meeting aérien.
8. **Composants** — Tableau de cotes groupé (`DIMENSIONS (m)`, `MASSES (kg)`,
   `PERFORMANCES`), unité dans l'en-tête et jamais répétée en cellule ;
   silhouette ; liste de relations.
9. **Mobile** — Le tableau passe sous le texte, en pleine largeur, et **conserve
   son alignement à droite et ses chiffres tabulaires**. Il ne devient pas une
   liste de paires libellé/valeur : la colonne de chiffres est ce qui permet de
   comparer, et elle survit à toutes les largeurs.
10. **Ce qui la distingue** — Le **tableau à trous assumé** : une case sans source
    se lit `—`, jamais « N/A », jamais une estimation. Un tableau à trous est un
    tableau honnête, et c'est exactement ce qui nous sépare d'un contenu produit à
    la chaîne. Aucune vue 3D, aucune barre comparative, aucune notation.

---

## ÉCRAN 5 — Article culturel / RETEX

**Famille** — Le Cahier.

1. **Structure** — Surtitre rubrique · titre · filet sienne · chapô italique ·
   planche · corps ouvert par une lettrine · citation · corps · pied de planche.
   Annexe : `REPÈRES CHRONOLOGIQUES`, puis renvois.
2. **Grille** — Gabarit commun, avec **trois lignes de rythme vides au-dessus du
   titre**. C'est la seule dérogation à l'échelle du manifeste.
3. **Marge** — Variante 1 par défaut : la respiration fait partie du genre.
4. **Typographies** — Titre Spectral **52** (unique à cette famille) ; chapô
   Spectral italique ; lettrine Spectral sur deux lignes de rythme ; citation
   Spectral italique ; attribution en capitales interlettrées.
5. **Hiérarchie** — La plus généreuse en blanc des six. Le lecteur n'a pas
   d'objectif immédiat : il faut lui donner envie de rester par la mise en page,
   pas par des artifices.
6. **Couleurs** — `encre-sienne`, partagée avec la Situation. Ce qui sépare les
   deux familles n'est pas la couleur, c'est le rapport au temps.
7. **Images** — La famille où la photographie a le plus de valeur : portraits,
   appareils historiques, documents. La limite d'**une photographie par écran de
   défilement** tient quand même. Le domaine public est fréquent ; le crédit
   indique alors `domaine public` avec l'origine et la date, jamais « libre de
   droits ».
8. **Composants** — Lettrine (une seule par page, inexistante ailleurs),
   citation à filet, chronologie en annexe.
9. **Mobile** — La chronologie passe après le chapô, en bandeau pleine largeur.
   La lettrine est conservée. Le titre descend à 34 px.
10. **Ce qui le distingue** — La lettrine et le titre à 52 px. La chronologie est
    **complète dès le premier écran** : ni dépliable, ni animée, parce que c'est
    ainsi qu'on se sert d'un repère chronologique. Chaque date porte sa source ;
    une chronologie non sourcée n'est pas publiée.

---

## ÉCRAN 6 — Dossier géopolitique

**Famille** — La Situation.

1. **Structure** — Surtitre · titre · filet sienne · **cartouche d'arrêté** ·
   chapô · carte · `1 LES FAITS` · `2 LES POSITIONS` · `3 CE QUI RESTE INCERTAIN`
   · pied de planche. Annexe : `ACTEURS`, `CHRONOLOGIE`, `SOURCES`.
2. **Grille** — Gabarit commun. Le cartouche d'arrêté est **le seul bloc du
   système placé au-dessus du chapô**.
3. **Marge** — Variante 2 par défaut : l'appareil documentaire est dans le corps,
   pas en marge, parce qu'il doit être vu.
4. **Typographies** — Cartouche d'arrêté en Fira Mono capitales interlettrées,
   encadré de deux filets forts. Sections numérotées comme la Leçon.
5. **Hiérarchie** — Faits, puis positions, puis incertitudes. Les trois sections
   sont de **plein rang** : l'incertitude n'est pas une note de bas de page.
6. **Couleurs** — `encre-sienne`. **Aucune couleur d'état sur une carte** :
   `erreur` en rouge sur un territoire est un contresens politique autant que
   graphique.
7. **Images** — La carte tient lieu de figure principale. La photographie est
   rare, toujours datée et localisée.
8. **Composants** — Cartouche d'arrêté, carte-planche (fond `fond-2`, terres en
   aplat très désaturé, frontières au filet, points d'intérêt dans l'encre du
   module), listes d'acteurs et de sources numérotées.
9. **Mobile** — Le cartouche d'arrêté **reste au-dessus du chapô** ; il ne descend
   jamais. Acteurs, chronologie et sources passent sous le corps dans cet ordre.
   La carte occupe la pleine largeur et garde son zoom au doigt.
10. **Ce qui le distingue** — L'**arrêté daté** (`ARRÊTÉ AU · N SOURCES · REVU
LE`), qui dit au lecteur ce qu'il engage, et la section **« ce qui reste
    incertain », obligatoire**. C'est le geste éditorial le plus fort du site, et
    il est graphique autant qu'éditorial : aucun contenu généré à la chaîne
    n'écrit spontanément ce qu'il ne sait pas. Un sujet dont l'arrêté vieillit
    porte la mention `À REVOIR` dans l'état `attention` — jamais un badge rouge,
    jamais une alarme.

---

## ÉCRAN 7 — Le Banc

**Famille** — Le Banc. La seule famille qui change deux fois de registre.

### 7a — Hub, sous charte

1. **Structure** — Cote `PSY · F.1.06` · titre · filet violine · chapô ·
   `L'ÉPREUVE` (tableau sec) · encadré `AVANT DE VOUS LANCER` · `NIVEAU` ·
   boutons · pied de planche. Annexe : `RELEVÉ`.
2. **Grille** — Gabarit commun.
3. **Marge** — Variante 2.
4. **Typographies** — Registre du Dossier : sec, énumératif. Valeurs de l'épreuve
   en Fira Mono.
5. **Hiérarchie** — Ce qu'est l'épreuve, comment s'y préparer, avec quel réglage,
   puis démarrer. Rien d'autre.
6. **Couleurs** — `encre-violine` pour les tests psychotechniques, encre du
   concours pour les quiz de connaissances. **Aucune couleur d'état** : rien n'a
   encore été évalué.
7. **Images** — Aucune. La consigne n'a pas besoin d'illustration.
8. **Composants** — Tableau de l'épreuve, encadré de renvoi vers la fiche de
   méthode, sélecteur de niveau, boutons, **relevé** en annexe.
9. **Mobile** — Ordre inchangé, une colonne.
10. **Ce qui le distingue** — Le **relevé** remplace le tableau de bord : un
    tableau, filets horizontaux, Fira Mono, une ligne par séance. Aucune jauge
    circulaire, aucune courbe lissée sur fond dégradé, aucun badge, aucune série.
    Le relevé montre ; il ne commente pas.

### 7b — Session, dépouillement total

1. **Structure** — Quatre éléments, dans cet ordre vertical : compteur et
   chronomètre · figure · filet · propositions. **Rien d'autre.** Navigation,
   marge, cote, annexe, pied de planche : tout disparaît.
2. **Grille** — Aucune. Colonne unique centrée, hauteur pleine fenêtre.
3. **Marge** — **Variante 3, à toute largeur.** Cet écran ne répond à aucun
   réglage : la session n'a jamais de marge.
4. **Typographies** — Fira Mono pour le compteur et le chronomètre, sans-serif
   pour les lettres de proposition. La sans-serif ne porte presque rien.
5. **Hiérarchie** — La figure, au plus grand que la fenêtre permet. Le défilement
   revient en haut à chaque question : sans cela, on atterrit sur les propositions
   avant d'avoir vu la figure. C'est une exigence de conception, pas un détail
   d'implémentation.
6. **Couleurs** — **Aucune couleur d'état pendant l'épreuve.** Le rouge et le vert
   n'existent qu'après validation. Le chronomètre ne rougit pas : un chronomètre
   qui s'affole est un artifice de jeu. Les couleurs propres à un test (les tuiles
   des triangles, par exemple) sont **délibérément hors palette sémantique**, pour
   qu'un candidat ne les lise jamais comme un état.
7. **Images** — La figure de l'épreuve, et rien d'autre.
8. **Composants** — Compteur, chronomètre, figure, propositions au **cadrage
   strictement identique**. Un cadrage qui varie trahit la réponse — l'expérience
   nous l'a imposé sur les formes imbriquées.
9. **Mobile** — **Identique au bureau** : il était déjà dépouillé. Les
   propositions passent en deux colonnes et gardent leur cadrage commun. Compteur
   et chronomètre restent en haut, fixés.
10. **Ce qui le distingue** — Le dépouillement lui-même. Aucune aide, aucun
    indice, aucun encouragement, aucun son, aucun classement, aucune animation de
    célébration.

### 7c — Correction

La grille revient, et avec elle tout l'appareil. **Le score en haut, les erreurs
ensuite, jamais l'inverse.** Chaque erreur est montrée par une **comparaison côte
à côte** — `VOTRE RÉPONSE` / `RÉPONSE ATTENDUE` — au même cadrage et à la même
taille, filet `erreur` à gauche, filet `juste` à droite. **La couleur double le
libellé, elle ne le remplace pas** : un daltonien lit les deux libellés et s'en
sort. Sous la paire, **une phrase**, qui nomme l'écart précis de cette
question-là — pas un paragraphe d'explication générale.

---

## 3. Tableau de contrôle

Un écran est conforme quand les treize réponses sont oui.

| #   | Contrôle                                                                   |
| --- | -------------------------------------------------------------------------- |
| 1   | La cote et la révision sont visibles, en marge ou en cartouche.            |
| 2   | La justure du corps tient entre 66 et 72 signes.                           |
| 3   | Le rythme vertical de 28 px est respecté dans la colonne de lecture.       |
| 4   | La variante de marge correspond à la charge réelle de la page.             |
| 5   | Une seule encre de module est visible sur l'écran.                         |
| 6   | Aucune couleur d'état hors correction ou validation.                       |
| 7   | Aucun rayon supérieur à 2 px sur un objet documentaire.                    |
| 8   | Aucune ombre portée hors surface flottante.                                |
| 9   | Chaque figure porte un numéro de planche, une légende et son crédit.       |
| 10  | Chaque donnée chiffrée renvoie à une source ; sinon elle se lit `—`.       |
| 11  | Rien ne bouge sans action de l'utilisateur.                                |
| 12  | `prefers-reduced-motion` supprime toutes les apparitions.                  |
| 13  | Sur écran étroit, aucune fonction n'a disparu — seulement changé de place. |

Et la question finale :

> **Logo masqué, cet écran est-il reconnaissable ?**

Si la réponse tient à la couleur, elle est fausse. Elle doit tenir à la
structure : la marge et sa cote, la table numérotée, le tableau de cotes à trous,
la chronologie en marge, l'arrêté daté, le dépouillement du Banc.

---

## 4. Les exports visuels

**Produits le 2026-07-28**, en **contenu réel du dépôt** : fiches, cours,
référentiels, photographies créditées, comptes mesurés. Vingt-quatre images —
huit écrans × trois variantes (desktop clair 1440 px, desktop sombre 1440 px,
mobile clair 390 px), chacune dans la marge de son archétype.

<https://claude.ai/code/artifact/aa2b69bc-9834-4694-8368-3aa40c708757>

**Ce qui est réel dans les exports** : le texte des fiches _La couche limite et
le décollement_, _Rafale M_, _Hélène Boucher_ et _L'organisation de la Défense
française_ ; les caractéristiques Dassault Aviation ; les articles 15 et 21 de la
Constitution ; les photographies avec auteur, licence et source ; les comptes du
fonds (442 fiches, 1 127 questions, 14 leçons, 11 appareils EOPAN) ; le format
officiel du test des triangles.

**Ce qui ne l'est pas, et qui est signalé comme tel dans les exports** :

- la **silhouette** de la fiche appareil est un tracé **générique de
  démonstration**. Elle montre le traitement — graisses, cadrage, encre du
  module — et non la géométrie du Rafale M. Le fonds de silhouettes fidèles reste
  un chantier de fond ;
- le **schéma** de la leçon est tracé pour la maquette ;
- la section **« ce qui reste incertain »** du dossier géopolitique est rendue
  **vide et signalée** : la fiche réelle est antérieure à la règle ;
- **aucune citation** n'apparaît dans l'article culturel, parce que la fiche n'en
  contient aucune de sourcée. Le gabarit ne fabrique pas de citation pour remplir
  un bloc ;
- le **relevé** du hub d'entraînement affiche `—` : aucune séance n'est
  enregistrée.

### Trois corrections faites au rendu

Aucune n'était visible dans les documents ; toutes le sont devenues à l'écran.

1. **Les repères de marge étaient posés au jugé.** Ils sont maintenant calculés
   en face de la section qu'ils annoncent — sinon la marge ment.
2. **La colonne de texte était plus large que sa justure**, laissant les filets
   déborder de cent pixels au-delà du texte. Corps ramené à 620 px.
3. **L'échéancier passait après l'inventaire sur mobile**, contre la doctrine que
   j'avais moi-même écrite. Il remonte avant la table numérotée, et le pied de
   planche ferme la page après l'annexe.

---

## 5. Le prototype codé — livré le 2026-07-28

**Trois routes, derrière le drapeau `NEXT_PUBLIC_DESIGN_LAB=1`** :
`/design-lab/planche/lecon`, `/design-lab/planche/appareil`,
`/design-lab/planche/banc`. Sans le drapeau, elles répondent 404 ; elles sont
exclues de l'indexation par leur `metadata.robots` et par `robots.ts`.

### Ce qui est tenu, et vérifié par des tests

| Garantie                           | Comment elle est tenue                                               | Vérification                                                                                                        |
| ---------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Aucun jeton de production remplacé | Les jetons `--pl-*` sont posés sur `.pl-root`, jamais sur `:root`    | Test e2e : `getComputedStyle(document.documentElement)` ne rend aucun `--pl-*`                                      |
| `marginMode` déclaré               | Attribut `data-marge` posé par la page                               | Test e2e : `wide` / `rail` / `none` attendus par écran                                                              |
| Donnée inconnue = `—`              | Composant `PlancheValeur`, pas la vigilance de l'auteur              | Test e2e : toute cellule vide vaut `—`, et « N/A » n'apparaît nulle part                                            |
| Silhouette non trompeuse           | Légende et `aria-label` disent qu'elle ne représente pas le Rafale M | Test e2e sur les deux mentions                                                                                      |
| Petites capitales réelles          | Fontes auto-hébergées avec `smcp` conservé                           | Test e2e : la largeur change de plus de 5 % entre normal et `small-caps` — une synthèse ne le ferait pas            |
| Aucun débordement                  | —                                                                    | Test e2e : 3 écrans × 3 largeurs, `scrollWidth - clientWidth === 0`                                                 |
| Accessibilité                      | —                                                                    | axe-core WCAG 2.0/2.1 A et AA sur les trois écrans : **aucune violation**                                           |
| Session au clavier seul            | Touches 1-4 ou A-D, focus posé sur la première proposition           | Test e2e : 20 réponses au clavier jusqu'à la correction                                                             |
| Focus visible                      | Anneau de 2 px dans l'encre du module                                | Test e2e sur `outline-width` et `outline-style`                                                                     |
| Contrastes                         | Module pur `planche-tokens.ts`                                       | **36 tests Vitest** : chaque encre, chaque état, chaque filet, sur **les trois fonds**, dans **les deux registres** |

### Ce que le prototype a corrigé, et que rien d'autre n'aurait vu

1. **Le test de contraste a démoli quatre valeurs de la palette validée.** Elles
   avaient été vérifiées sur le fond de base, jamais sur les surfaces ni les
   creux. Sur `fond-3`, `encre-3` tombait à 4,25:1, `juste` à 4,48:1,
   `attention` à 4,45:1 et `filet-fort` à 2,95:1. Les valeurs sont resserrées —
   `encre-3` `#666C74`, `filet-fort` `#7C8186`, `juste` `#117C40`, `attention`
   `#986001` en clair ; `encre-3` `#888E94` et `filet-fort` `#6B727C` en sombre.
   Le filet appuyé est visiblement plus foncé qu'avant : c'est le prix du seuil.
2. **Le bandeau survivait à l'entrée en session.** Corrigé : c'est le composant
   d'épreuve qui décide de l'afficher, pas la page.
3. **Le viewBox de la figure était faux** — calculé sur un repère de 40 quand
   `cellPolygon` travaille sur un côté de 100. La figure se rognait en un
   fuseau. Invisible aux tests, évident au rendu.
4. **Le bandeau préchargeait ses voisins** : la photographie de la fiche
   appareil (229 kB) était tirée sur des écrans sans image. Les `<Link>` sont
   devenus des ancres simples.
5. **34 px de débordement horizontal sur mobile**, dus au bandeau.

### Poids transféré et LCP, mesurés

| Écran          | Fontes PLANCHE           | Reste                                    | LCP bureau / tablette / mobile |
| -------------- | ------------------------ | ---------------------------------------- | ------------------------------ |
| La Leçon       | 5 fichiers, **129,5 kB** | 124,0 kB                                 | 236 / 176 / 172 ms             |
| Fiche appareil | 6 fichiers, **158,7 kB** | 352,7 kB (dont 228,7 kB de photographie) | 284 / 236 / 232 ms             |
| Le Banc        | 6 fichiers, **157,6 kB** | 124,0 kB                                 | 196 / 212 / 164 ms             |

**Préchargement.** Quatre fontes seulement sont préchargées — Spectral 400 et
600, Fira Sans 400, Fira Mono 400 : celles du premier écran. Fira Sans 500 et
600 et l'italique se chargent à la demande.

### Compromis constatés, à lever à la migration

- **Le prototype vit sous le layout racine de production.** Il en hérite donc
  l'en-tête, le pied de page, l'enregistrement du service worker, l'icône
  d'application et **trois fontes Geist / Archivo inutiles** — l'essentiel des
  124 kB de « reste ». L'en-tête et le pied sont masqués par une règle
  `body:has(.pl-root)`, ce qui fonctionne mais reste un pansement. La solution
  propre est un **groupe de routes avec son propre layout racine**, ce qui
  suppose de déplacer les routes existantes : trop invasif pour un prototype.
- **Les fontes sont servies depuis `/public`**, donc sans en-tête de cache
  longue durée ni empreinte dans le nom. À la migration, elles devront passer
  par le chargeur de fontes ou par une règle d'en-têtes dédiée.
- **La photographie n'est pas optimisée** : `<img>` brut plutôt que le composant
  d'image, volontairement, pour mesurer le poids réel sans couche intermédiaire.
  228,7 kB pour une image affichée à 600 px de large est excessif en production.
- **Le drapeau est ouvert en développement** (`NODE_ENV === "development"`), pour
  ne pas avoir à configurer l'environnement local. En production, seule la
  variable compte.

---

## 5 bis. Le cadre du prototype

Un prototype isolé sur **trois écrans** précède la migration générale.

| Écran          | Route de prototype             | Réutilise                                |
| -------------- | ------------------------------ | ---------------------------------------- |
| La Leçon       | `/design-lab/planche/lecon`    | Chargeur de cours et de fiches existant  |
| Fiche appareil | `/design-lab/planche/appareil` | Chargeur de fiches et `specs` existants  |
| Le Banc        | `/design-lab/planche/banc`     | Moteur `src/lib/psychotech/triangles.ts` |

**Règles du prototype, non négociables :**

- il vit derrière un **drapeau de fonctionnalité**, hors des routes publiques ;
- il **ne remplace aucun jeton global de production** : les jetons PLANCHE sont
  portés par une classe de portée locale, pas par `:root` ;
- il **réutilise le vrai contenu et la vraie logique** — chargeurs, moteurs,
  schémas — sans les modifier ;
- il **ne touche pas** aux routes publiques, aux données, au quiz, à la
  progression, à la recherche ni aux schémas de contenu ;
- `npm run check` reste vert, et les **seuils de contraste sont couverts par des
  tests** — chaque paire jeton/fond est vérifiée dans les deux registres.

---

## 6. Ce qui conditionne la migration générale

La migration ne commencera qu'après validation, dans cet ordre :

1. les **exports** ci-dessus ;
2. les **trois prototypes codés** ;
3. le **responsive** vérifié sur les trois variantes de marge ;
4. le **clair et le sombre** vérifiés sur chaque écran ;
5. l'**accessibilité** — contrastes testés, focus visible, `getByRole`,
   `prefers-reduced-motion` ;
6. la **stabilité fonctionnelle** — aucune régression sur quiz, progression,
   recherche et contenu.

---

## 7. Ordre de refonte, après validation

1. **Les jetons** — fond, encres, encres de module, états, registres clair et
   sombre. Rien de visible ne change encore ; tout en dépend.
2. **La typographie** — Spectral, la sans-serif retenue, la mono, l'échelle, la
   justure, le rythme de 28. Le changement le plus perceptible.
3. **Le gabarit** — marge responsive, cote, cartouche, repères, pied de planche.
   Le moment où le site devient reconnaissable.
4. **Les ornements et composants** — filets, encadrés, tableaux, citations,
   boutons ; suppression des ombres et des rayons.
5. **Les sept écrans**, dans l'ordre : Leçon, Planche d'identification, Dossier,
   Banc, Cahier, Situation, accueil.
6. **Les silhouettes au trait**, chantier long, mené en fond.

Chaque étape est un lot livrable séparément, avec `npm run check` vert et la
documentation à jour dans le même commit.

---

_Aucune ligne de code, aucun composant, aucune feuille de style de production n'a
été modifié pour produire ce document._

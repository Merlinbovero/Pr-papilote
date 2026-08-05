# Registre des sources scientifiques des croquis

Référentiel des sources citables par les métadonnées de croquis (`sources[].id`). Doctrine : [`convention-schemas.md`](convention-schemas.md).

> **Aucun total n'est écrit à la main dans ce document.** Les comptages par statut de vérification et par statut juridique sont produits par `scripts/audit-croquis-inventory.mjs` et lisibles dans `reports/croquis/inventory.md`. Un « 32 » annoncé en phase C0 ne correspondait à aucune table réelle ; la règle en découle.

---

## Comment lire ce registre

### Cinq états distincts, à ne jamais confondre

| État                                | Ce qu'il signifie                        | Ce qu'il ne signifie **pas**  |
| ----------------------------------- | ---------------------------------------- | ----------------------------- |
| **URL accessible**                  | L'adresse répond, code HTTP < 400        | Que le document a été ouvert  |
| **Document consulté**               | Le document a été ouvert                 | Qu'un passage précis a été lu |
| **Passage lu**                      | Un passage identifié a été lu            | Que la figure citée a été vue |
| **Figure vérifiée**                 | La page ou la figure citée a été vue     | —                             |
| **Contenu scientifiquement validé** | Le fait cité a été confronté au document | —                             |

Les trois valeurs machine (`verificationStatus`) sont `url_reachable`, `document_consulted`, `figure_verified`. Cette distinction naît d'une erreur du rapport C0, qui présentait des URL répondant 200 comme des sources vérifiées.

### Localisation

Quand une page ou une figure n'a pas été ouverte, la localisation porte littéralement **`à vérifier`**. **Aucun numéro de page ou de figure n'est inventé.**

### Statut juridique

`verified` ou `uncertain`. **« Domaine public » n'est pas un statut** — c'est une conclusion, qui suppose d'avoir vérifié l'auteur (agence ou contractant), les mentions de copyright, les éléments de tiers et les marques.

---

## Niveau 1 — Sources primaires scientifiques

### N-01 · NACA-TR-460

| Champ             | Valeur                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| Organisme         | NACA                                                                                                             |
| Titre             | _The characteristics of 78 related airfoil sections from tests in the variable-density wind tunnel_              |
| Auteurs           | Jacobs, Eastman N. ; Ward, Kenneth E. ; Pinkerton, Robert M.                                                     |
| Date              | 1933                                                                                                             |
| URL               | https://ntrs.nasa.gov/citations/19930091108                                                                      |
| URL accessible    | **oui** (HTTP 200)                                                                                               |
| Document consulté | **oui** — notice NTRS lue, métadonnées confirmées                                                                |
| Figure vérifiée   | **non**                                                                                                          |
| Localisation      | `à vérifier`                                                                                                     |
| Type              | `primary_scientific`                                                                                             |
| Statut juridique  | **`verified`** — la notice porte « Distribution Limits: Public » et « Work of the US Gov. Public Use Permitted » |
| Points couverts   | Corde, cambrure, épaisseur relative ; Cl et Cd mesurés avec Reynolds déclaré                                     |
| Limites           | 1933 : profils NACA à quatre et cinq chiffres, ni laminaires ni transsoniques                                    |

**Seule référence du registre dont le statut juridique a été vérifié sur pièce.**

### N-02 · NACA-TR-586

| Champ             | Valeur                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| Organisme         | NACA                                                                                                          |
| Titre             | _Characteristics of the NACA 23012 airfoil from tests in the full-scale and variable-density tunnels_         |
| Date              | `à vérifier`                                                                                                  |
| URL               | https://ntrs.nasa.gov/citations/19930091603                                                                   |
| URL accessible    | **oui** (HTTP 200)                                                                                            |
| Document consulté | **non**                                                                                                       |
| Figure vérifiée   | **non**                                                                                                       |
| Localisation      | `à vérifier`                                                                                                  |
| Type              | `primary_scientific`                                                                                          |
| Statut juridique  | `uncertain`                                                                                                   |
| Points couverts   | **Effet du nombre de Reynolds sur Cz max et l'angle critique** — variable absente de tous les croquis actuels |
| Limites           | Un seul profil                                                                                                |

### N-03 · NACA-TR-416

| Champ             | Valeur                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| Organisme         | NACA                                                                                             |
| Titre             | _The NACA variable-density wind tunnel_                                                          |
| URL               | https://ntrs.nasa.gov/citations/19930091490                                                      |
| URL accessible    | **oui** (HTTP 200)                                                                               |
| Document consulté | **non**                                                                                          |
| Figure vérifiée   | **non**                                                                                          |
| Localisation      | `à vérifier`                                                                                     |
| Type              | `primary_scientific`                                                                             |
| Statut juridique  | `uncertain`                                                                                      |
| Points couverts   | Méthode de mesure, corrections de soufflerie ; distinction mesure / correction / résultat publié |

### N-05 · NASA Glenn — Beginner's Guide to Aeronautics

| Champ             | Valeur                                                                                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Organisme         | NASA Glenn Research Center                                                                                                                                                    |
| URL               | https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/                                                                                                                     |
| URL (page citée)  | https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/pitot-static-tube-speedometer/                                                                                       |
| URL accessible    | **oui** (HTTP 200 ; l'ancienne adresse `grc.nasa.gov/www/k-12/airplane/pitot.html` **redirige** vers celle-ci)                                                                |
| Document consulté | **oui** — page « Pitot – Static Tube – Speedometer » ouverte en C2                                                                                                            |
| Passage lu        | **oui** — bloc d'équations de la page                                                                                                                                         |
| Figure vérifiée   | **non** — les équations ont été lues, les illustrations de la page **n'ont pas** été ouvertes et ne sont pas reprises                                                         |
| Type              | `academic`                                                                                                                                                                    |
| Statut juridique  | `uncertain` — aucune mention de licence ni de crédit sur la page. **Aucune illustration n'est reprise ; seules les équations, qui ne sont pas protégeables, sont utilisées.** |
| Points couverts   | Relation pression / vitesse du circuit Pitot-statique. **Source de la couche analytique de P-4**                                                                              |
| Limites           | Vulgarisation — à utiliser pour la méthode d'exposition, pas comme source de données                                                                                          |

**Équations retenues, citées littéralement** :

- `q = p_t – p_s`
- `p_s + (1/2)ρV² = p_t`
- `V = √[2(p_t – p_s)/ρ]`

avec `q` pression dynamique, `p_t` pression totale, `p_s` pression statique, `ρ` masse volumique de l'air, `V` vitesse.

La page signale elle-même que le régime supersonique « viole les hypothèses de l'équation de Bernoulli », et que les très basses vitesses rendent l'écart de pression trop faible pour être mesuré. **Ces deux limites bornent le domaine de validité affiché sur le pilote P-4** — elles ne sont pas ajoutées par prudence rédactionnelle, elles sont dans la source.

---

## Niveau 2 — Sources réglementaires et opérationnelles

### F-01 · FAA PHAK, chapitre 5

| Champ             | Valeur                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| Titre             | _Pilot's Handbook of Aeronautical Knowledge_ — ch. 5, « Aerodynamics of Flight »                     |
| URL               | https://www.faa.gov/regulationspolicies/handbooksmanuals/aviation/phak/chapter-5-aerodynamics-flight |
| URL accessible    | **oui** (HTTP 200)                                                                                   |
| Document consulté | **non**                                                                                              |
| Figure vérifiée   | **non**                                                                                              |
| Localisation      | Chapitre 5 identifié. Figure : `à vérifier`                                                          |
| Type              | `regulatory`                                                                                         |
| Statut juridique  | `uncertain`                                                                                          |
| Points couverts   | Traitement du cas montée/descente (défaut **A-01**) ; facteur de charge en virage (défaut **A-05**)  |

### F-02 · FAA PHAK, chapitre 8

| Champ             | Valeur                                                                                                                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Titre             | _PHAK_ — ch. 8, « Flight Instruments » (PDF direct)                                                                                                                                                              |
| Édition           | **FAA-H-8083-25B** — établi par le PDF complet (F-03), dont les métadonnées portent « Pilot's Handbook of Aeronautical Knowledge (25B) »                                                                         |
| Date              | PDF créé le **2016-08-23**, modifié le **2023-03-27** (métadonnées du fichier)                                                                                                                                   |
| URL               | https://www.faa.gov/sites/faa.gov/files/10_phak_ch8.pdf                                                                                                                                                          |
| URL accessible    | **oui** (HTTP 200, 13 589 925 octets)                                                                                                                                                                            |
| Document consulté | **oui** — 28 pages, ouvert et extrait en C2                                                                                                                                                                      |
| Passage lu        | **oui** — pages **8-1 à 8-8**                                                                                                                                                                                    |
| Figure vérifiée   | **oui** — **Figure 8-1** « Pitot-static system and instruments », **Figure 8-2** « Altimeter », **Figure 8-5** « Vertical speed indicator (VSI) »                                                                |
| Type              | `regulatory`                                                                                                                                                                                                     |
| Statut juridique  | `uncertain` — œuvre d'une agence fédérale américaine, mais l'auteur réel (agence ou contractant), les mentions de copyright et les éléments de tiers n'ont pas été vérifiés. **Aucune figure n'est reproduite.** |
| Points couverts   | Circuit Pitot-statique, altimètre, badin, variomètre, IAS/CAS/TAS. **Source principale du pilote P-4**                                                                                                           |

**Passages retenus, cités littéralement** (p. 8-2) :

- « The pitot tube is utilized to measure the total combined pressures that are present when an aircraft moves through the air. »
- « The total pressure is made up of dynamic pressure plus static pressure. » → c'est **cette phrase**, et non une déduction, qui fonde `Pt = Ps + q`.
- « The one instrument that utilizes the pitot tube is the ASI. […] The static pressure is also delivered to the opposite side of the ASI, which serves to cancel out the two static pressures, thereby leaving the dynamic pressure to be indicated on the instrument. »
- « The two remaining instruments (altimeter and VSI) utilize only the static pressure that is derived from the static port. »

(p. 8-7) : « Although the VSI operates solely from static pressure, it is a differential pressure instrument. […] The area outside the diaphragm […] is also connected to the static line but through a restricted orifice (calibrated leak). »

**Ce passage est décisif** : il interdit d'écrire que le variomètre « mesure une vitesse verticale ». Il mesure un **écart de pression statique** entretenu par une fuite calibrée, et c'est le régime de cet écart qui est gradué en pieds par minute.

(p. 8-8) : « Indicated airspeed (IAS) — the direct instrument reading obtained from the ASI, uncorrected for variations in atmospheric density, installation error, or instrument error » ; « True airspeed (TAS) — CAS corrected for altitude and nonstandard temperature ».

### F-03 · FAA PHAK complet

| Champ             | Valeur                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Titre             | _Pilot's Handbook of Aeronautical Knowledge_, FAA-H-8083-25B                                                                                                        |
| Édition           | **25B, confirmée** — le titre interne du PDF est littéralement « Pilot's Handbook of Aeronautical Knowledge (25B) », sujet « Corrected Figures 7-23, 8-20, & 8-21 » |
| URL               | https://www.faa.gov/sites/faa.gov/files/pilots/pilot_handbook.pdf                                                                                                   |
| URL accessible    | **oui** (HTTP 200, 56 133 125 octets, 524 pages)                                                                                                                    |
| Document consulté | **oui** — ouvert et extrait en C2                                                                                                                                   |
| Passage lu        | **oui** — pages **16-13 à 16-15**, section « Wind Triangle or Vector Analysis »                                                                                     |
| Figure vérifiée   | **oui** — **Figure 16-19** « Principle of the wind triangle », **Figure 16-20**, **Figure 16-21** « Steps in drawing the wind triangle », **Figures 16-22/16-23**   |
| Type              | `regulatory`                                                                                                                                                        |
| Statut juridique  | `uncertain` — mêmes réserves que F-02. **Aucune figure n'est reproduite ; aucune valeur numérique de l'exemple FAA n'est reprise.**                                 |
| Points couverts   | Démonstration vectorielle du triangle des vitesses. **Source anglophone du pilote P-6**                                                                             |
| Limites           | Une révision **25C** existe ; elle n'a pas été ouverte. Ce qui est cité ici l'est de **25B**, et rien n'est extrapolé à 25C.                                        |

**Passages retenus, cités littéralement** (p. 16-13) :

- « A wind triangle, the pilot's version of vector analysis, is the basis of dead reckoning. »
- « The long blue and white hashed line shows the direction the aircraft is heading, and its length represents the distance traveled at the indicated airspeed for 1 hour. The short blue arrow at the right shows the wind direction, and its length represents the wind velocity for 1 hour. The solid yellow line shows the direction of the track or the path of the aircraft as measured over the earth, and its length represents the distance traveled in 1 hour or the GS. »

(p. 16-14, étape 3 de la construction) : « draw the wind arrow from E, **not toward 045°, but downwind in the direction the wind is blowing** ».

**C'est la source de la distinction exigée au §3.3** : la direction météorologique nomme la provenance, le vecteur pointe vers où l'air se déplace. La FAA le dit en toutes lettres, et c'est précisément l'erreur que la construction impose d'éviter.

(p. 16-14, étape 4) : « the same scale must be used for each of the linear movements involved » → l'échelle commune n'est pas une préférence graphique, c'est une condition de justesse.

**Vérification numérique indépendante de l'exemple FAA.** L'exemple donne TC 090°, vent de 045° à 40 kt, Vp 120 kt, et conclut TH 076° et GS 88 kt. Recalculé en composantes : vecteur air = (120 sin 76°, 120 cos 76°) = (116,44 ; 29,03) ; vecteur vent, soufflant **vers** 225°, = (40 sin 225°, 40 cos 225°) = (−28,28 ; −28,28) ; somme = (88,16 ; 0,75), soit une norme de **88,2 kt** et une direction de **89,5°**. L'exemple se referme. Ce contrôle ne sert pas à recopier ces valeurs — il sert à établir que la relation vectorielle retenue est bien celle qui produit le résultat annoncé.

### F-04 · FAA Helicopter Flying Handbook, chapitre 2

| Champ             | Valeur                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Titre             | _Helicopter Flying Handbook_ — ch. 2, « Aerodynamics of Flight »                                                                |
| URL               | https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook/hfh_ch02.pdf |
| URL accessible    | **oui** (HTTP 200)                                                                                                              |
| Document consulté | **non**                                                                                                                         |
| Figure vérifiée   | **non**                                                                                                                         |
| Localisation      | `à vérifier`                                                                                                                    |
| Type              | `regulatory`                                                                                                                    |
| Statut juridique  | `uncertain`                                                                                                                     |
| Points couverts   | Rotor, couple, anticouple, dissymétrie de portance                                                                              |

### F-05 · FAA Helicopter Flying Handbook, chapitre 1

| Champ             | Valeur                                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Titre             | _Helicopter Flying Handbook_ — ch. 1                                                                                            |
| URL               | https://www.faa.gov/sites/faa.gov/files/regulations_policies/handbooks_manuals/aviation/helicopter_flying_handbook/hfh_ch01.pdf |
| URL accessible    | **oui** (HTTP 200)                                                                                                              |
| Document consulté | **non**                                                                                                                         |
| Figure vérifiée   | **non**                                                                                                                         |
| Localisation      | `à vérifier`                                                                                                                    |
| Type              | `regulatory`                                                                                                                    |
| Statut juridique  | `uncertain`                                                                                                                     |
| Points couverts   | Anatomie de l'hélicoptère                                                                                                       |
| Note              | **Omise du registre C1 initial** ; réintégrée après revérification de l'URL                                                     |

### F-06 · FAA Glider Flying Handbook, chapitre 4

| Champ             | Valeur                                                                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Titre             | _Glider Flying Handbook_ — ch. 4, « Flight Instruments »                                                                               |
| Date              | PDF créé le **2024-12-20** (métadonnées du fichier), titre interne « Chapter 4: Flight Instruments »                                   |
| URL               | https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/glider_handbook/gfh_chapter_4.pdf                                  |
| URL accessible    | **oui** (HTTP 200, 4 250 683 octets, 22 pages)                                                                                         |
| Document consulté | **oui** — ouvert et extrait en C2                                                                                                      |
| Passage lu        | **oui** — pages **4-1 et 4-2**, sections « Pitot-Static Instruments » et « Airspeed Indicator »                                        |
| Figure vérifiée   | **oui** — **Figure 4-1** (implantation Pitot / statique), **Figure 4-3** (badin), **Figure 4-4** « Anatomy of the airspeed indicator » |
| Type              | `regulatory`                                                                                                                           |
| Statut juridique  | `uncertain` — mêmes réserves que F-02. **Aucune figure n'est reproduite.**                                                             |
| Points couverts   | Le badin mesure la **différence** entre pression totale et pression statique                                                           |

**Passages retenus, cités littéralement** (p. 4-1) :

- « The pitot-static system uses two different air pressure measurements: 1. Static ports transport ambient atmospheric pressure to instruments through tubing. 2. The pitot tube transports ambient air pressure plus any ram air pressure resulting from forward motion to instruments through tubing. »

(p. 4-2) : « The airspeed indicator measures the difference between the pitot pressure and static pressure, and displays this difference as the indicated airspeed (IAS) of the glider. »

**Pourquoi cette source en plus de F-02.** Elle énonce la même chose sur une cellule différente (planeur), ce qui établit que la relation appartient au circuit et non à un type d'aéronef. Elle formule aussi l'énoncé le plus net du produit final : le badin **affiche une différence de pressions**, et cette différence **est** la vitesse indiquée — pas une vitesse déduite d'un calcul visible du pilote.

### F-07 · FAA Airplane Flying Handbook

| Champ             | Valeur                                                                                |
| ----------------- | ------------------------------------------------------------------------------------- |
| Titre             | _Airplane Flying Handbook_, FAA-H-8083-3C                                             |
| URL               | https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/airplane_handbook |
| URL accessible    | **oui** (HTTP 200)                                                                    |
| Document consulté | **non**                                                                               |
| Figure vérifiée   | **non**                                                                               |
| Localisation      | `à vérifier`                                                                          |
| Type              | `regulatory`                                                                          |
| Statut juridique  | `uncertain`                                                                           |
| Points couverts   | Manœuvres, décrochage, vrille                                                         |
| Note              | **Omise du registre C1 initial** ; réintégrée après revérification de l'URL           |

---

## Niveau 3 — Météorologie et géomagnétisme

### M-01 · NWS/WPC — Symboles de fronts de surface

| Champ             | Valeur                                                                 |
| ----------------- | ---------------------------------------------------------------------- |
| Organisme         | NOAA / NWS — Weather Prediction Center                                 |
| Titre             | _Description of surface fronts and boundaries_                         |
| URL               | https://www.wpc.ncep.noaa.gov/html/fntcodes2.shtml                     |
| URL accessible    | **oui** (HTTP 200)                                                     |
| Document consulté | **non**                                                                |
| Figure vérifiée   | **non**                                                                |
| Localisation      | `à vérifier`                                                           |
| Type              | `institutional`                                                        |
| Statut juridique  | `uncertain`                                                            |
| Points couverts   | **Symbologie normalisée** des fronts — convention générale, reprenable |

### M-02 · NOAA JetStream — Modèle du cyclone norvégien

| Champ             | Valeur                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------- |
| URL               | https://www.noaa.gov/jetstream/synoptic/norwegian-cyclone-model                           |
| URL accessible    | **oui** (HTTP 200) — un premier test avait renvoyé 504, timeout transitoire de passerelle |
| Document consulté | **non**                                                                                   |
| Figure vérifiée   | **non**                                                                                   |
| Localisation      | `à vérifier`                                                                              |
| Type              | `institutional`                                                                           |
| Statut juridique  | `uncertain`                                                                               |
| Points couverts   | Structure verticale d'une perturbation (modèle de Bjerknes)                               |

### M-03 · NOAA JetStream — Lecture des cartes de surface

| Champ             | Valeur                                                                      |
| ----------------- | --------------------------------------------------------------------------- |
| Titre             | _How to read surface weather maps_                                          |
| URL               | https://www.noaa.gov/jetstream/wxmaps                                       |
| URL accessible    | **oui** (HTTP 200)                                                          |
| Document consulté | **non**                                                                     |
| Figure vérifiée   | **non**                                                                     |
| Localisation      | `à vérifier`                                                                |
| Type              | `institutional`                                                             |
| Statut juridique  | `uncertain`                                                                 |
| Points couverts   | Lecture d'une carte synoptique                                              |
| Note              | **Omise du registre C1 initial** ; réintégrée après revérification de l'URL |

### G-01 · NOAA NCEI — World Magnetic Model

| Champ             | Valeur                                                                           |
| ----------------- | -------------------------------------------------------------------------------- |
| Titre             | _World Magnetic Model_ (WMM2025)                                                 |
| URL               | https://www.ncei.noaa.gov/products/world-magnetic-model                          |
| URL accessible    | **oui** (HTTP 200)                                                               |
| Document consulté | **non**                                                                          |
| Figure vérifiée   | **non**                                                                          |
| Localisation      | `à vérifier`                                                                     |
| Type              | `institutional`                                                                  |
| Statut juridique  | `uncertain`                                                                      |
| Points couverts   | **Source et datation** d'une valeur de déclinaison                               |
| Limites           | WMM2025 expire fin 2029 : toute valeur portée sur un croquis doit être **datée** |

### G-02 · NCEI — Calculateur de déclinaison

| Champ             | Valeur                                                                              |
| ----------------- | ----------------------------------------------------------------------------------- |
| URL               | https://www.ngdc.noaa.gov/geomag/calculators/magcalc.shtml                          |
| URL accessible    | **oui** (HTTP 200)                                                                  |
| Document consulté | **non**                                                                             |
| Figure vérifiée   | **non** — sans objet, c'est un outil                                                |
| Type              | `institutional`                                                                     |
| Statut juridique  | `uncertain`                                                                         |
| Limites           | Outil, pas document : une valeur qui en sort se cite **avec sa date et son modèle** |

---

## Niveau 4 — Sources françaises

### FR-01 · DGAC / DSAC — Notions d'anémométrie

| Champ             | Valeur                                                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Titre             | _Notions d'anémométrie_                                                                                                                                                                                    |
| Organisme         | **Ministère chargé de l'aviation civile** — auteur du fichier : **DSAC/NO/NAV** (Direction de la sécurité de l'Aviation civile)                                                                            |
| Édition et date   | **version 22/08/2025** (portée en tête de document) ; PDF créé le 2025-08-22                                                                                                                               |
| URL               | https://www.ecologie.gouv.fr/sites/default/files/documents/notions_danemometrie.pdf                                                                                                                        |
| URL accessible    | **oui** (HTTP 200, 614 943 octets, 6 pages)                                                                                                                                                                |
| Document consulté | **oui** — les 6 pages, ouvertes et extraites en C2                                                                                                                                                         |
| Passage lu        | **oui** — §2 « Définitions » (p. 1-2) et §4 « Les erreurs liées à l'installation anémométrique » (p. 4)                                                                                                    |
| Figure vérifiée   | **non** — les planches d'anémomètres (p. 3) et les courbes d'étalonnage (p. 5) n'ont pas été ouvertes et ne sont pas reprises                                                                              |
| Type              | `regulatory`                                                                                                                                                                                               |
| Statut juridique  | `uncertain` — document administratif français, mais **aucune mention de licence** (ni Licence Ouverte, ni copyright) sur le PDF. Rien n'en est reproduit ; seuls des faits et une nomenclature sont cités. |
| Points couverts   | **Nomenclature française du circuit anémométrique et des vitesses.** Source française du pilote **P-4**                                                                                                    |

**Passages retenus, cités littéralement** (§4, p. 4) :

> « L'installation anémométrique comprend généralement : un anémomètre, un variomètre et un altimètre ; une ou deux prises de pression statique, situées de façon pariétale sur le fuselage ; une prise de pression totale, située sous la voilure, appelée prise Pitot ou tube Pitot ; les canalisations acheminant les informations de pression des prises aux instruments. »

C'est **la** phrase qui fixe le vocabulaire français du pilote P-4 : « prise de pression statique », « prise de pression totale », « canalisations », « installation anémométrique ». Elle dispense d'inventer une traduction.

(§2, p. 1-2) — définitions littérales :

- « **V indiquée (Vi)** : c'est la vitesse lue par le pilote sur l'anémomètre. En appellation anglo-saxonne, IAS pour Indicated Airspeed. »
- « **V propre (Vp)** : C'est la vitesse de l'avion par rapport à la masse d'air, projetée sur l'horizontale locale. […] En notation anglo-saxonne, c'est la true Airspeed (TAS). »
- « En subsonique (jusqu'à 661 kt, ou 340 m/s ou Mach 1), la vitesse est donnée par la relation de St Venant. **Cette relation s'approxime bien jusqu'à 250 kt par la relation de Bernouilli.** »

**Cette dernière phrase est la pièce maîtresse du domaine de validité de P-4**, et elle est française, officielle et chiffrée. La forme simplifiée `V = √(2q/ρ)` n'est pas « valable en subsonique » — elle est une **approximation** de la loi de Saint-Venant, bonne jusqu'à environ **250 kt**. Sans cette source, le domaine de validité aurait été écrit de mémoire ou laissé vague.

Elle donne aussi `ρ₀ = 1,225 kg/m³` et la relation `ρ·Vp² = ρ₀·Ve²`.

### FR-02 · Manuel du Brevet d'Initiation Aéronautique (éduscol)

| Champ             | Valeur                                                                                                                                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Titre             | _Manuel du Brevet d'Initiation Aéronautique_, **version 4.0, édition 2021**                                                                                                                                                   |
| Organisme         | **Ministère de l'Éducation nationale — éduscol STI** (portail national de ressources). Mention de responsabilité en pied de page : **© CIRAS Toulouse**                                                                       |
| URL               | https://sti.eduscol.education.fr/sites/eduscol.education.fr.sti/files/ressources/pedagogiques/11283/11283-bia-2021-vf1-copie.pdf                                                                                              |
| URL accessible    | **oui** (HTTP 200, 14 491 472 octets, 274 pages)                                                                                                                                                                              |
| Document consulté | **oui** — ouvert et extrait en C2                                                                                                                                                                                             |
| Passage lu        | **oui** — **p. 127** (direction du vent), **p. 198** (cap, route, dérive), **p. 207** (vitesse propre, vitesse sol)                                                                                                           |
| Figure vérifiée   | **non** — les figures **3.13**, **4.31**, **4.44 à 4.47** sont identifiées et localisées, mais **elles n'ont pas été ouvertes** et rien n'en est repris                                                                       |
| Type              | `institutional`                                                                                                                                                                                                               |
| Statut juridique  | `uncertain` — **mention de copyright explicite « © CIRAS Toulouse » sur chaque page.** Le document est donc cité **comme source de terminologie et de faits**, jamais reproduit, et aucune de ses figures n'inspire le tracé. |
| Points couverts   | **Nomenclature française de la navigation.** Source française du pilote **P-6**                                                                                                                                               |

**Définitions retenues, citées littéralement** (p. 198) :

- « **Cap** : Angle entre le Nord et l'axe de l'avion »
- « **Route** : Angle entre le Nord et la trajectoire au sol de l'avion »
- « **Dérive** : Angle entre le Cap et la route. L'écart est dû au vent, qui souffle du cap vers la route. »
- « **Route = Cap + Dérive** »
- Convention de signe : « Le vent venant de la droite, je dérive vers la gauche (la dérive Négative) ; Le vent venant de la gauche, je dérive vers la droite (la dérive est positive) »

(p. 207) :

- « **La Vitesse propre** : C'est la vitesse horizontale de l'avion par rapport à la masse d'air »
- « **La Vitesse sol** : C'est la vitesse de l'avion par rapport au sol »

(p. 127) :

- « **La direction du vent indique toujours la provenance du vent.** »
- « La direction du vent est observée par une girouette (exprimée en degrés et mesurée dans le sens des aiguilles d'une montre) et sa vitesse par un anémomètre. »

**Ces trois lignes closent le §3.3 côté français** : la convention angulaire (degrés, sens horaire) et la convention de provenance sont énoncées ensemble, par une source française officielle. La FAA (F-03) dit la même chose côté vecteur — « downwind in the direction the wind is blowing ». Les deux sources se recoupent sans se contredire, et c'est le recoupement qui autorise à porter la distinction sur le croquis.

### FR-03 · Code de l'aviation civile — Annexe I, chapitre Ier (règles de l'air)

| Champ               | Valeur                                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Titre               | _Code de l'aviation civile_, Annexe I relative aux règles de l'air, **chapitre Ier — Définitions**                           |
| Organisme           | République française — Légifrance                                                                                            |
| URL                 | https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000019942518                                                         |
| URL accessible      | **oui**                                                                                                                      |
| Document consulté   | **oui** — article ouvert en C2                                                                                               |
| Passage lu          | **oui** — entrées « Cap », « Route », « Point de cheminement », « Niveau de vol »                                            |
| Figure vérifiée     | sans objet (texte sans figure)                                                                                               |
| Type                | `regulatory`                                                                                                                 |
| Statut juridique    | `uncertain`                                                                                                                  |
| **Statut du texte** | ⚠ **ABROGÉ** — version en vigueur du 04/05/2006 au 01/11/2023, abrogée par le décret n° 2023-1008 du 31 octobre 2023, art. 5 |

Définitions littérales, telles que lues :

- « **Cap** : Orientation de l'axe longitudinal de l'aéronef, généralement exprimée en degrés par rapport au nord (vrai, magnétique, compas ou grille). »
- « **Route** : Projection sur la surface de la terre de la trajectoire d'un aéronef, trajectoire dont l'orientation, en un point quelconque, est généralement exprimée en degrés par rapport au nord (vrai, magnétique ou grille). »

**Pourquoi cette entrée n'est PAS la source retenue pour P-6, alors qu'elle est la plus officielle.** Parce qu'elle est abrogée depuis le 1ᵉʳ novembre 2023. La citer comme droit en vigueur serait faux. Les définitions restent exactes et éclairantes — la « route » comme **projection au sol**, le « cap » comme **orientation de l'axe longitudinal** — et elles corroborent FR-02 mot pour mot sur le fond. Elle est donc conservée comme **corroboration historique**, jamais comme fondement.

Le texte en vigueur qui l'a remplacée est le règlement d'exécution (UE) n° 923/2012 (SERA), dont la version française n'a **pas** pu être ouverte pendant C2 : EUR-Lex a répondu **HTTP 202 avec un corps vide** aux tentatives d'accès direct. Ce point est consigné comme **non résolu**, pas contourné.

### O-01 · ONERA — Mesure des efforts en soufflerie

| Champ             | Valeur                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Titre             | _Méthodes de mesure en aérodynamique — partie 1 : mesure des efforts_                                                    |
| URL               | https://onera.fr/sites/default/files/ressources_documentaires/cours-exposes-conf/cours-aerodynamique-mesures-efforts.pdf |
| URL accessible    | **oui** (HTTP 200)                                                                                                       |
| Document consulté | **non**                                                                                                                  |
| Figure vérifiée   | **non**                                                                                                                  |
| Localisation      | `à vérifier`                                                                                                             |
| Type              | `academic`                                                                                                               |
| Statut juridique  | `uncertain` — **ONERA n'est pas une agence du gouvernement des États-Unis ; aucune présomption de domaine public**       |
| Points couverts   | **En français.** Balance aérodynamique, incertitudes, corrections                                                        |

### O-02 · ONERA — Techniques optiques de visualisation

| Champ             | Valeur                                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- |
| URL               | https://www.onera.fr/sites/default/files/ressources_documentaires/cours-exposes-conf/cours-aerodynamique-mesures-visus2.pdf |
| URL accessible    | **oui** (HTTP 200)                                                                                                          |
| Document consulté | **non**                                                                                                                     |
| Figure vérifiée   | **non**                                                                                                                     |
| Type              | `academic`                                                                                                                  |
| Statut juridique  | `uncertain`                                                                                                                 |
| Points couverts   | Distingue ce qui est **vu** de ce qui est **calculé** — utile pour `couche-limite` (défaut A-02)                            |

### O-03 · ONERA — 50 ans de recherches pour les avions

| Champ             | Valeur                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Titre             | _1946-1995 : recherches ONERA pour l'aviation_                                                                               |
| URL               | https://www.onera.fr/sites/default/files/ressources_documentaires/cours-exposes-conf/1946-1995-recherches-onera-aviation.pdf |
| URL accessible    | **oui** (HTTP 200)                                                                                                           |
| Document consulté | **non**                                                                                                                      |
| Figure vérifiée   | **non**                                                                                                                      |
| Type              | `academic`                                                                                                                   |
| Statut juridique  | `uncertain`                                                                                                                  |
| Points couverts   | Contexte historique français                                                                                                 |
| Note              | **Omise du registre C1 initial** ; réintégrée après revérification de l'URL                                                  |

---

## Pistes non retenues comme sources

### N-04 · « NACA-TR-586 et suivants » sur l'effet Reynolds

Le rapport C0 citait une **URL de recherche NTRS** (`ntrs.nasa.gov/search.jsp?R=…`), non vérifiée.

**Une page de recherche n'est pas une source scientifique.** Elle ne désigne aucun document précis, son contenu varie, et rien n'y est citable. Conservée ici comme **piste**, jamais comme référence : l'effet Reynolds est couvert par **N-02**.

---

## Sources à acquérir

Identifiées comme nécessaires, **non encore recherchées ni vérifiées**.

| Besoin                                                | Piste                                     | Pour                                                |
| ----------------------------------------------------- | ----------------------------------------- | --------------------------------------------------- |
| Atmosphère standard                                   | OACI Doc 7488                             | `profil-isa`, `etages-nuages`                       |
| Classification des nuages et dépendance à la latitude | OMM, Atlas international des nuages       | Défaut **A-06**                                     |
| Catapultes du _Charles de Gaulle_                     | Documentation officielle Marine nationale | Défaut **A-04** — données actuellement non sourcées |
| Cartographie aéronautique française                   | SIA — AIP France                          | `lire-une-carte-aeronautique`                       |
| Nomenclature française de navigation (Cm, Cv, Rm, Rv) | SIA ou manuel officiel                    | **Bloquant pour le pilote P-6**                     |
| Réglementation européenne                             | EASA                                      | `les-regles-de-l-air`                               |
| Radionavigation                                       | Eurocontrol / SKYbrary                    | `la-radionavigation`                                |

---

## Sources écartées, avec motif

| Source                                | Motif                                                                                                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Wikipédia, Wikimedia Commons          | Peut orienter, ne prouve rien. **Nuance** : les photographies du site en proviennent déjà, avec licence et crédit — légitime pour une photo, pas pour un fait physique |
| Blogs et forums aéronautiques         | Chaîne de sourçage non traçable                                                                                                                                        |
| Infographies commerciales             | Origine des données inconnue, conventions non déclarées                                                                                                                |
| Images générées par IA                | Aucune valeur probante                                                                                                                                                 |
| Publications Airbus, Boeing, Lockheed | **Non écartées comme sources de faits.** Mais leurs **figures** sont protégées : utilisables comme donnée et convention, **jamais comme modèle de dessin**             |

---

## État de vérification

**Les comptages sont générés**, pas écrits ici : voir la section « Registre des sources » de `reports/croquis/inventory.md`.

**La limite qualitative posée en C1 est levée pour les deux pilotes, et pour eux seuls.** C1 constatait qu'aucune figure n'avait jamais été ouverte, donc qu'aucun croquis ne pouvait porter `figure_verified`. En C2, six documents ont été **réellement téléchargés, extraits et lus** : F-02, F-03, F-06, N-05, FR-01, FR-02 — plus FR-03, consulté puis écarté comme abrogé.

Ce qui n'a **pas** changé :

- les sources restées `document_consulté: non` le sont toujours, et aucune n'a été promue par commodité ;
- `FR-01` et `FR-02` sont marquées **`figure_verified: non`** alors même que leurs pages ont été lues, parce que leurs figures n'ont pas été ouvertes une par une. Lire le texte d'une page n'est pas voir sa figure, et la distinction serait vide si on l'assouplissait dès qu'elle gêne ;
- aucun statut juridique ne passe à `verified` : **une seule** référence du registre l'est (N-01), et C2 n'en ajoute aucune.

Restent à lever en C3/C4 : les sources encore non ouvertes, et le texte SERA en français, inaccessible pendant C2.

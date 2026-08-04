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

| Champ             | Valeur                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------- |
| Organisme         | NASA Glenn Research Center                                                                                    |
| URL               | https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/                                                     |
| URL accessible    | **oui** (HTTP 200)                                                                                            |
| Document consulté | **partiellement** — page d'accueil seule                                                                      |
| Figure vérifiée   | **non**                                                                                                       |
| Localisation      | `à vérifier`                                                                                                  |
| Type              | `academic`                                                                                                    |
| Statut juridique  | `uncertain`                                                                                                   |
| Points couverts   | **Modèle méthodologique** : chaque page pose l'équation, définit ses variables, donne son domaine de validité |
| Limites           | Vulgarisation — à utiliser pour la méthode d'exposition, pas comme source de données                          |

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

| Champ             | Valeur                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| Titre             | _PHAK_ — ch. 8, « Flight Instruments » (PDF direct)                                                 |
| URL               | https://www.faa.gov/sites/faa.gov/files/10_phak_ch8.pdf                                             |
| URL accessible    | **oui** (HTTP 200)                                                                                  |
| Document consulté | **non**                                                                                             |
| Figure vérifiée   | **non**                                                                                             |
| Localisation      | Chapitre 8. Pages : `à vérifier`                                                                    |
| Type              | `regulatory`                                                                                        |
| Statut juridique  | `uncertain`                                                                                         |
| Points couverts   | Circuit Pitot-statique, altimètre, badin, variomètre, blocages. **Source principale du pilote P-4** |

### F-03 · FAA PHAK complet

| Champ             | Valeur                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------- |
| Titre             | _Pilot's Handbook of Aeronautical Knowledge_, FAA-H-8083-25B                            |
| URL               | https://www.faa.gov/sites/faa.gov/files/pilots/pilot_handbook.pdf                       |
| URL accessible    | **oui** (HTTP 200)                                                                      |
| Document consulté | **non**                                                                                 |
| Figure vérifiée   | **non**                                                                                 |
| Localisation      | `à vérifier`                                                                            |
| Type              | `regulatory`                                                                            |
| Statut juridique  | `uncertain`                                                                             |
| Points couverts   | Navigation : cap, route, dérive. **Source du pilote P-6**                               |
| Limites           | Une révision plus récente (25C) existe ; la référence exacte à retenir est `à vérifier` |

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

| Champ             | Valeur                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| Titre             | _Glider Flying Handbook_ — ch. 4, « Flight Instruments »                                              |
| URL               | https://www.faa.gov/regulations_policies/handbooks_manuals/aviation/glider_handbook/gfh_chapter_4.pdf |
| URL accessible    | **oui** (HTTP 200)                                                                                    |
| Document consulté | **non**                                                                                               |
| Figure vérifiée   | **non**                                                                                               |
| Localisation      | `à vérifier`                                                                                          |
| Type              | `regulatory`                                                                                          |
| Statut juridique  | `uncertain`                                                                                           |
| Points couverts   | Le badin mesure la **différence** entre pression totale et pression statique                          |

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

Le fait structurant, lui, est qualitatif et se dit sans compter : **aucune figure n'a été ouverte et vérifiée à ce jour.** Tant que cette limite dure, aucun croquis ne peut légitimement porter un `verificationStatus` de `figure_verified`.

Lever cette limite fait partie de C2 pour les deux pilotes, et de C4 pour les révisions de l'échantillon audité.

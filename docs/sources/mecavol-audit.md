# Audit « Mécanique du Vol » (M.V. 001) — Lot 1

> Rapport d'audit exhaustif du PDF « Préparation au BIA — Mécanique du Vol — M.V. 001 » (100 pages) en vue de sa transformation en module numérique PrépaAéro.
> Registre page par page : `docs/sources/mecavol-inventaire.md`. **Ce rapport livre l'architecture proposée — la production ne démarre qu'après validation.**

## 0. Contexte et principe

Le PDF est un **iBook pédagogique de préparation au BIA** structuré en 13 chapitres, riche en schémas dessinés, formules et cas concrets. Il constitue une **source de départ** — pas une vérité absolue : plusieurs formulations sont vulgarisées, quelques chiffres sont à sourcer/actualiser, et **de nombreux visuels sont juridiquement problématiques** (BD Gotlib, image Yoda, captures presse/vidéo). Aucun contenu n'est repris tel quel : tout est **réécrit, vérifié et restructuré**, les schémas **redessinés en original (SVG)**.

Le module s'insère dans l'**arborescence existante** `content/fondamentaux/` (déjà pourvue de `physique/`, `aerodynamique/`, `mecanique-du-vol/`, `instruments/`) — **on étend, on ne crée pas de système parallèle**.

---

## 1. Sommaire reconstitué du PDF

| # chap. | Titre (source)                    | Pages | Cœur                                                                                   |
| ------- | --------------------------------- | ----- | -------------------------------------------------------------------------------------- |
| 1       | Rappels de physique               | 1–5   | Force, vecteur, 3 lois de Newton, pression, inertie, bilan avion                       |
| 2       | Notions d'aérodynamique           | 6–11  | Pression statique/dynamique/totale, débit, Bernoulli, Venturi, air                     |
| 3       | Les souffleries                   | 12–14 | Eiffel/Prandtl, composition, balance aérodynamique, Cx/Cz                              |
| (3b)    | La résistance de l'air            | 15–17 | R = ½ρV²S·K, coefficient de forme, comparaison de formes                               |
| 4       | Surface portante                  | 18–23 | F_R → portance/traînée, incidence, C_R, 3 traînées, allongement, winglets              |
| (4b)    | Écoulement autour d'un profil     | 24–26 | Couche limite, laminaire/turbulent, Reynolds, décollement → décrochage                 |
| (4c)    | Polaire & finesse                 | 27–35 | Polaire d'Eiffel, points remarquables, polaire des vitesses, profils, finesse          |
| (4d)    | Hypersustentateurs                | 36–38 | Becs/volets/fentes, effets secondaires, spoilers                                       |
| 5       | La résultante aérodynamique       | 39–41 | Facteurs de F_R (ρ, V, S, C_R), influence de i                                         |
| (5b)    | Hyposustentateurs & aérofreins    | 42–45 | Spoilers, aérofreins, fonctionnement                                                   |
| 6       | Contrôler les forces aéro         | 46–51 | 3 axes, gouvernes, tangage/roulis/lacet, assiette/incidence/pente/dérapage             |
| 7       | Cas de vol                        | 52–58 | Palier, montée, descente, virage, facteur de charge, plané                             |
| 8       | Un peu plus loin (cas de vol)     | 59–63 | Lacet inverse, bille, glissade/dérapage, taux de virage                                |
| 9       | Le décrochage d'une aile          | 64–67 | Vitesse de décrochage V_S, facteur de charge, indices, sortie, vrille                  |
| 10      | Effets aérodynamiques & stabilité | 68–81 | Lacet/roulis induits, girouette, flèche, dièdre, formes, souffle, couple, gyroscopique |
| 11      | Points particuliers               | 82–92 | Compensation (tabs, PHR), CdG, CP, foyer, stabilité, centrage                          |
| 12      | Décollage & atterrissage          | 93–96 | Vent de face/arrière, décollage/atterrissage décortiqués, 15 m                         |
| 13      | Annexes                           | 97–99 | Rappels becs/volets, anecdote                                                          |

---

## 2. Liste des notions (≈180, regroupées)

- **Physique / mécanique** : force, caractéristiques d'un vecteur (direction, sens, intensité, point d'application), résultante, forces de contact/distance, 1ʳᵉ/2ᵉ/3ᵉ loi de Newton, principe d'inertie, MRU, référentiel galiléen, action-réaction, poids, centre de gravité, accélération, pression.
- **Mécanique des fluides** : pression statique, pression dynamique, pression totale, masse volumique, énergie cinétique, ligne/tube/filet de courant, débit, conservation du débit, théorème de Bernoulli, tube de Venturi, air (composition, ρ, pression atmosphérique, Kelvin), viscosité.
- **Souffleries** : soufflerie Eiffel/Prandtl, convergent/collecteur, chambre de tranquillisation, veine d'essai, diffuseur, ventilateur, taux de turbulence, balance aérodynamique, Cx, Cz.
- **Résistance de l'air & traînée** : résistance de l'air R, coefficient de forme K, zone de pression/dépression, vent relatif, traînée de forme/de sillage/induite, tourbillon marginal, turbulence de sillage, saumon, allongement, envergure, surface alaire, corde moyenne, winglet.
- **Portance & profils** : force aérodynamique F_R, portance F_z, traînée F_x, angle d'incidence, coefficient C_R/C_z/C_x, extrados, intrados, bord d'attaque/de fuite, corde, profondeur, ligne moyenne, épaisseur relative, cambrure, calage, centre de poussée, profils (biconvexe sym./dissym., plan convexe, creux, autostable, supercritique).
- **Couche limite** : couche limite, écoulement laminaire/turbulent, nombre de Reynolds, point d'impact/transition/décollement, incidence critique, décrochage.
- **Polaire & finesse** : polaire d'Eiffel, points remarquables (portance nulle, traînée mini, finesse max, meilleur rendement, portance max, décrochage), polaire des vitesses, taux de chute, finesse, angle de plané.
- **Hypersustentateurs / hyposustentateurs** : bec/slat, volet/flap, volet Fowler, bec Krüger, fente, configuration lisse/décollage/atterrissage, spoiler, destructeur de portance, aérofrein, STOL.
- **Pilotage & axes** : axe de tangage/roulis/lacet, gouverne, aileron, gouverne de profondeur/direction, manche, palonnier, empennage horizontal/vertical, déporteur, assiette, incidence, pente, inclinaison, dérapage, gauchissement.
- **Cas de vol** : vol en palier, montée, descente, virage, force déviatrice, facteur de charge, rayon de virage, vol symétrique, vol plané, distance franchissable.
- **Décrochage** : vitesse de décrochage V_S, buffeting, avertisseur de décrochage, abattée, vrille.
- **Effets induits & moteur** : lacet inverse, roulis induit, lacet induit, effet girouette, souffle hélicoïdal, pale montante, couple de renversement, effet gyroscopique, précession.
- **Stabilité & centrage** : stabilité statique/dynamique, longitudinale/transversale, dièdre (positif/négatif/nul), flèche, effet redresseur, position d'aile, formes de voilures (flèche, elliptique, delta, gothique, canard), emplantures, empennages (Té/Vé/double), centre de poussée, foyer, coefficient de moment, marge statique, plage de centrage, limite avant/arrière, CDVE.
- **Compensation** : compensateur, tab automatique/commandé, corne débordante, panneau compensateur, flottement (flutter), masselotte, trim, PHR/THS.
- **Décollage/atterrissage** : vent de face/arrière, manche à air/biroutte, vitesse de rotation, distance de roulage, arrondi, pente finale, toucher des roues, influence altitude/température.

---

## 3. Liste des formules (≈30)

| Formule                                         | Domaine                  |
| ----------------------------------------------- | ------------------------ |
| P = F/S                                         | Pression                 |
| P_B − P_A = ρ·g·h                               | Pression statique        |
| P_d = ½·ρ·v²                                    | Pression dynamique       |
| P_T = P_s + ½·ρ·v²                              | Pression totale          |
| Q = V·S (conservation)                          | Débit                    |
| P_s1 + ½ρV₁² = P_s2 + ½ρV₂²                     | Bernoulli                |
| R = ½·ρ·V²·S·K                                  | Résistance de l'air      |
| F_R = ½·ρ·V²·S·C_R                              | Résultante aérodynamique |
| F_z = ½·ρ·V²·S·C_z ; F_x = ½·ρ·V²·S·C_x         | Portance / traînée       |
| λ = L²/S_a = L / corde moyenne                  | Allongement              |
| Re = ρ·v·D / η                                  | Nombre de Reynolds       |
| f = C_z/C_x = R_z/R_x = V_x/V_z = D/Δz          | Finesse                  |
| pente = arctan(1/f)                             | Angle de plané           |
| ΣF = 0 ⇔ V = cste ; ΣF = M·a ; F(A/B) = −F(B/A) | Lois de Newton           |
| g = 9,81 m/s²                                   | Pesanteur                |
| R_z = P = mg (palier)                           | Équilibre palier         |
| R_z = mg·cos φ ; T = R_x ± mg·sin φ             | Montée / descente        |
| n = R_z/P = 1/cos φ                             | Facteur de charge        |
| tan φ = V²/(R·g) ; R = V²/(g·tan φ)             | Virage                   |
| V_S = √(2P / (ρ·S·C_z max))                     | Vitesse de décrochage    |
| V_S(nG) = V_S(1G)·√n                            | Décrochage en virage     |
| taux = degrés / temps (s)                       | Taux de virage           |
| M_z = −½·ρ·S·V²·C_z·(d − x)                     | Moment / foyer           |

Toutes rendues en **KaTeX** (ou le système du projet), avec variables, unités et exemple — plusieurs alimentent des **calculateurs pédagogiques** (finesse, facteur de charge, V_S, plané, centrage).

---

## 4. Liste des schémas / visuels (≈70)

- **À redessiner en SVG original (≈60)** : bilan des forces (palier/montée/descente/virage/plané), pression statique/dynamique, Venturi (interactif), tube de courant, profil légendé, répartition pression/dépression, décomposition F_R→F_z/F_x, comparateur de formes (plaque/sphère/profilé/aile), tourbillons marginaux, allongement, couche limite + point I/T/D, incidence→décrochage, polaire (interactive), profils (comparateur), finesse/plané, dispositifs hypersustentateurs (gros porteur cliquable), spoilers/aérofreins, 3 axes + gouvernes (aéronef interactif), effets induits (lacet inverse/roulis induit/lacet induit), effet girouette, dièdre/flèche, formes d'ailes/emplantures/empennages, souffle hélicoïdal, précession, compensation (tabs/PHR/masselottes), CP/foyer, plage de centrage (simulateur), bille/indicateur de virage, séquences décollage/atterrissage.
- **Photos réutilisables sous réserve de licence (≈6)** : F-16 Thunderbirds, F-22, tourbillon NASA, Rafale, Concorde (USAF/NASA/Wikimedia — vérifier licence, créditer).
- **Tableaux à retranscrire (2)** : NACA 2412 (foyer), glissade extérieure/intérieure.

---

## 5. Informations incorrectes / obsolètes / vulgarisées (à corriger)

Consignées en détail dans `docs/sources/mecavol-corrections.md` (à créer en Lot 2). Points saillants :

1. **ρ = 1,3 kg/m³** (p.10) : valeur approchée. Préciser **ρ_ISA = 1,225 kg/m³ à 15 °C au niveau de la mer** (garder 1,3 comme ordre de grandeur pédagogique).
2. **« la dépression d'extrados assure 70 % de la portance »** (p.20) : ordre de grandeur admis mais variable selon profil/incidence — présenter comme « la majeure partie » + note.
3. **« winglets → 3,5 % » (p.6) vs « 4 % Sharklets » (p.22)** : incohérence interne. Harmoniser et sourcer (Airbus annonce jusqu'à ~4 %).
4. **Interprétation « tout Bernoulli » de la portance** : la vulgarisation « le chemin plus long sur l'extrados » n'est pas rigoureuse. Conserver Bernoulli comme modèle d'introduction, ajouter une note « Pour aller plus loin » (déviation de l'air / 3ᵉ loi de Newton) — **ne pas propager l'erreur du « temps de parcours égal »**.
5. **Étude de cas Air Transat TS236** (p.31) : narratif — à re-sourcer sur le rapport officiel (GPIAA/TSB) ; vérifier dates/chiffres.
6. **Anecdote ANA « gagner du kérosène »** (p.99) : datée 2009 — reformuler, sourcer, ou écarter.
7. **Valeurs « exemples »** (braquages volets 10–15°/20–40°, PHR Airbus 300 3°/12°, spoilers 85 kt, « 15 m » fin de décollage, navette 73 t) : à présenter explicitement comme **ordres de grandeur / exemples type**, sourcés quand une valeur normative existe (15 m ≈ 50 ft).
8. **« Les lois de Newton ne sont pas au programme du BIA »** (p.2) : vérifier au regard du **programme officiel BIA en vigueur** (arrêté / annales) — la mécanique du vol l'est, la formulation à ajuster.

---

## 6. Informations nécessitant vérification (sources prioritaires)

Programme officiel BIA (Éducation nationale / SIA), DGAC, ENAC, ONERA, EASA, FAA, NASA, manuels universitaires. À vérifier en priorité : portance (Bernoulli vs déviation), Reynolds, décollement, polaire/finesse, facteur de charge, V_S, dispositifs hypersustentateurs, effets moteur (souffle/couple/gyroscopique), foyer (~25 % corde), marge statique, valeurs chiffrées listées au §5.

---

## 7. Découpage proposé en **cours** (14 cours, alignés `fondamentaux/`)

| Cours                                                      | Emplacement         | Pages source |
| ---------------------------------------------------------- | ------------------- | ------------ |
| C1 — Forces et lois de Newton                              | `physique/`         | 1–5          |
| C2 — Pression et théorème de Bernoulli                     | `aerodynamique/`    | 6–11         |
| C3 — Les souffleries                                       | `aerodynamique/`    | 12–14        |
| C4 — Résistance de l'air et traînée                        | `aerodynamique/`    | 15–17, 21–23 |
| C5 — Portance, profils et incidence                        | `aerodynamique/`    | 18–20, 33–34 |
| C6 — Couche limite et décrochage aérodynamique             | `aerodynamique/`    | 24–26        |
| C7 — Polaire et finesse                                    | `aerodynamique/`    | 27–32, 35    |
| C8 — Hypersustentateurs, spoilers et aérofreins            | `mecanique-du-vol/` | 36–45        |
| C9 — Axes, gouvernes et effets induits                     | `mecanique-du-vol/` | 46–51, 69–72 |
| C10 — Cas de vol (palier, montée, descente, virage, plané) | `mecanique-du-vol/` | 52–63        |
| C11 — Décrochage et facteur de charge                      | `mecanique-du-vol/` | 64–67        |
| C12 — Effets moteur (souffle, couple, gyroscopique)        | `mecanique-du-vol/` | 77–81        |
| C13 — Stabilité et centrage                                | `mecanique-du-vol/` | 73–76, 82–92 |
| C14 — Décollage et atterrissage                            | `mecanique-du-vol/` | 93–96        |

Chaque cours suit la structure du brief (objectifs, prérequis, intro, notions, formules, schémas, exemples, applications, erreurs fréquentes, résumé, vocabulaire, exercices, quiz, sources).

---

## 8. Découpage proposé en **fiches** (≈50)

Beaucoup **enrichissent des fiches existantes** (marquées ✎) ; les autres sont nouvelles (✚).

- ✎ physique : les trois lois de Newton (✚), forces de contact et de distance (✚), représenter une force — vecteur (✚), le poids et le centre de gravité (✚), pression-forces-unités.
- ✎ aérodynamique : pression statique et dynamique (✚), pression totale (✚), le tube de Venturi / conservation du débit (✚), théorème de Bernoulli (✚), air-et-proprietes ✎, les souffleries (✚), la résistance de l'air (✚), les trois types de traînée (✚), traînée induite et tourbillons marginaux (✚), l'allongement (✚), les winglets (✚), portance ✎, trainee ✎, l'angle d'incidence (✚), profil-d-aile ✎, les types de profils (✚), ecoulement-de-l-air ✎, la couche limite (✚), écoulement laminaire/turbulent et Reynolds (✚), decrochage ✎, la polaire d'Eiffel (✚), les coefficients Cz/Cx (✚), la polaire des vitesses (✚), la finesse (✚).
- ✎ mécanique-du-vol : les becs (slats) (✚), les volets (flaps) (✚), les spoilers et aérofreins (✚), axes-et-gouvernes ✎, le contrôle du tangage/roulis/lacet (✚), le lacet inverse / roulis induit / lacet induit (✚), l'effet girouette (✚), quatre-forces ✎, le vol en montée/descente (✚), virage ✎, le facteur de charge (✚), le vol plané (✚), decrochage-et-vrille ✎, la vitesse de décrochage V_S (✚), le souffle hélicoïdal (✚), le couple de renversement (✚), l'effet gyroscopique (✚), la stabilité longitudinale (✚), la stabilité transversale : dièdre et flèche (✚), formes d'ailes et emplantures (✚), le centre de poussée et le foyer (✚), equilibre-et-centrage ✎ (centrage/marge statique), la compensation des gouvernes / trims / PHR (✚), le décollage (✚), l'atterrissage (✚).
- **Fiches de révision (FR)** : « Assiette, incidence, pente, dérapage », « Glissade et dérapage », « Stabilité : dièdre, flèche, position d'aile », + une FR par cours.
- **Études de cas** : turbulence de sillage, décrochage en dernier virage, le planeur Air Transat (sourcé), influence du centrage.

---

## 9. Liste des termes de **dictionnaire** (≈120 FR + ≈30 EN)

**FR** : l'ensemble des notions du §2 (dédoublonnées) → ~120 entrées (force, vecteur, résultante, pression statique/dynamique/totale, masse volumique, débit, Bernoulli, Venturi, couche limite, Reynolds, laminaire, turbulent, incidence, portance, traînée [forme/sillage/induite], tourbillon marginal, allongement, winglet, extrados, intrados, bord d'attaque/de fuite, corde, cambrure, calage, centre de poussée, foyer, polaire, finesse, taux de chute, bec, volet, fente, spoiler, aérofrein, tangage, roulis, lacet, aileron, gouverne, palonnier, assiette, pente, dérapage, gauchissement, facteur de charge, force déviatrice, vitesse de décrochage, buffeting, abattée, vrille, lacet inverse, roulis/lacet induit, effet girouette, souffle hélicoïdal, couple de renversement, effet gyroscopique, précession, dièdre, flèche, marge statique, centrage, compensateur, tab, PHR, arrondi…).

**EN (lexique bilingue)** : lift, drag, stall, angle of attack, relative wind, leading/trailing edge, upper/lower surface, boundary layer, laminar/turbulent flow, wake turbulence, wingtip vortex, aspect ratio, glide ratio, flap, slat, spoiler, airbrake, pitch, roll, yaw, load factor, centre of gravity, aerodynamic centre, static margin, trim, stability, camber, chord.

Chaque entrée : définition courte + détaillée, exemple, traduction EN, termes liés, fiches liées, formule éventuelle, source.

---

## 10. Interactions numériques possibles (priorisées)

1. **Polaire d'Eiffel interactive** (curseur d'incidence → C_z, C_x, finesse, position, proximité décrochage) — p.27-29.
2. **Écoulement autour d'un profil / incidence → décrochage** (transition, décollement) — p.24-26.
3. **Aéronef interactif — axes et gouvernes** (manche/palonnier → gouverne, axe, force, effet, effets induits) — p.46-51, 69-72.
4. **Venturi + manomètres** (section → vitesse → pression) — p.9-11.
5. **Dispositifs d'un gros porteur** (becs/volets/spoilers cliquables) — p.36.
6. **Comparateur de formes** (traînée plaque/sphère/profilé/aile) et **comparateur de profils** — p.17, 34.
7. **Calculateurs** : finesse ↔ pente, facteur de charge ↔ inclinaison, V_S ↔ facteur de charge, distance de plané, **centrage/marge statique** — p.35, 56-58, 65, 89.
8. **Bille / indicateur de virage** (glissade/dérapage, correction au pied) — p.60-63.
9. **Soufflerie à zones cliquables** — p.13-14.

Interactions relevant du skill `svg-interactive-graphics`. Aucune vidéo tierce republiée : les médias externes du PDF sont **remplacés par des interactions natives** ou de courtes synthèses.

---

## 11. Quantité estimée de **questions** : ~350

Répartition indicative : Newton/forces 25 · pression/Bernoulli 35 · souffleries 12 · résistance/traînée 30 · portance/profils 40 · couche limite 20 · polaire/finesse 30 · hypersustentateurs 25 · axes/gouvernes/effets induits 30 · cas de vol 35 · décrochage 25 · effets moteur 20 · stabilité/centrage 30 · décollage/atterrissage 20. Trois niveaux (découverte / BIA / approfondissement), types variés (QCM, vrai/faux, association, légendage, lecture de graphe/polaire, calcul, cas pratique, vocabulaire EN). Chaque question : reliée à une fiche, pages PDF tracées, source externe, difficulté, compétence, pièges.

---

## 12. Matrice page PDF → contenu PrépaAéro

La **matrice complète page-à-destination** figure dans `docs/sources/mecavol-inventaire.md` (une entrée par page, avec notions/formules/images/destinations). Synthèse : **100 pages → 14 cours, ~50 fiches, ~120 termes, ~30 formules, ~9 interactions, ~350 questions**. **0 page non affectée.**

---

## 13. Problèmes de droits (images / médias)

Registre détaillé à créer en Lot 2 : `docs/sources/mecavol-assets-rights.md`.

- **Ne pas republier** (copyright) : dessin Gotlib (p.1-bis), image Yoda/Lucasfilm (p.46), captures vidéo « blason Pau » (p.7/22/38/53/67), photo Dacia en soufflerie (p.15), vignettes winglets constructeurs (p.23), capture Le Figaro (p.99), auto-capture iBook C.A.001 (p.98), photos d'instruments et de cockpits tierces (p.59, 62-63), photos de planeurs/voltige tierces (p.68, 88).
- **À vérifier puis créditer si libre** : F-16 Thunderbirds (couv.), F-22 (p.64), tourbillon NASA Langley (p.97), Rafale (p.39), Concorde (p.93) — sources USAF/NASA généralement domaine public ; Wikimedia pour Concorde.
- **Tous les schémas pédagogiques** : redessinés en **SVG original** — aucune extraction du PDF.
- **Photos complémentaires** : recherche prioritaire Wikimedia Commons / NASA / DVIDS / ministère des Armées, sous licence compatible, chacune créditée (auteur, licence, URL, date).

---

## 14. Plan de lots d'implémentation

| Lot                | Contenu                                                                                                | Sortie                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| **1 (ce rapport)** | Audit, inventaire, architecture                                                                        | `mecavol-audit.md` + `mecavol-inventaire.md`                                |
| 2                  | Corrections & droits consignés ; C1 physique (Newton, forces, pression) + fiches + schémas + questions | `mecavol-corrections.md`, `mecavol-assets-rights.md`, 1er incrément vérifié |
| 3                  | C2–C3 Bernoulli/Venturi/souffleries (+ Venturi interactif)                                             | incrément                                                                   |
| 4                  | C4–C5 résistance, traînée, portance, profils (+ comparateurs)                                          | incrément                                                                   |
| 5                  | C6–C7 couche limite, décrochage aéro, polaire, finesse (+ polaire interactive)                         | incrément                                                                   |
| 6                  | C8 hypersustentateurs/spoilers/aérofreins (+ gros porteur interactif)                                  | incrément                                                                   |
| 7                  | C9–C10 axes/gouvernes/effets induits/cas de vol (+ aéronef interactif, calculateurs)                   | incrément                                                                   |
| 8                  | C11–C12 décrochage/facteur de charge/effets moteur (+ calculateur V_S)                                 | incrément                                                                   |
| 9                  | C13 stabilité & centrage (+ simulateur de centrage)                                                    | incrément                                                                   |
| 10                 | C14 décollage/atterrissage                                                                             | incrément                                                                   |
| 11                 | Banque de questions complète + exercices + lexique EN                                                  | incrément                                                                   |
| 12                 | **Audit de couverture** : 100 pages soldées, tests de garantie                                         | clôture                                                                     |

Chaque lot : `npm run format` → `npm run check` → `npm run build` → `npm run content:check` → e2e (fiches + axe) ; commit/push/PR/merge ; CHANGELOG synchrone.

---

## 15. Fichiers du dépôt concernés

- **Contenu** : `content/fondamentaux/{physique,aerodynamique,mecanique-du-vol,instruments}/*.yaml` (enrichissement + nouvelles fiches), `content/questions/**` (nouvelle banque), `content/glossaire/*.yaml` (termes FR/EN).
- **Schémas / interactions** : nouveaux composants sous `src/components/content/` (blocs Formule/KaTeX, calculateurs) et `src/features/` (interactions SVG : polaire, profil, aéronef, Venturi, centrage) — cf. skills `svg-interactive-graphics`, `react-ui-architect`.
- **Schémas de contenu** : `src/lib/content/content-schemas.ts` (au besoin : type `formule`/`calculateur`, champ `pdfPages`/traçabilité), `src/components/content/types.ts`.
- **Docs** : `docs/sources/mecavol-*.md` (inventaire, audit, corrections, droits), `docs/CHANGELOG.md`.
- **Images** : `public/images/` (photos libres vérifiées + éventuels SVG exportés), `content/_referentiels/` si registre de crédits.

---

## Métriques (contrôle de couverture)

- **Pages PDF analysées : 100**
- **Notions identifiées : ~180**
- **Cours proposés : 14**
- **Fiches proposées : ~50** (dont ~14 enrichissements de fiches existantes)
- **Formules : ~30**
- **Visuels : ~70** (~60 schémas à redessiner + ~6 photos à vérifier + 2 tableaux)
- **Termes de dictionnaire : ~150** (~120 FR + ~30 EN)
- **Questions estimées : ~350**
- **Interactions numériques : 9**
- **Pages du PDF encore non affectées : 0**

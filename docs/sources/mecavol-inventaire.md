# Inventaire d'extraction — « Mécanique du Vol » (M.V. 001)

> Source : PDF fourni « Préparation au Brevet d'Initiation Aéronautique — Mécanique du Vol — M.V. 001 » (~100 pages).
> Registre page par page (Phase 1 du brief PRÉPAAÉRO). Statut de traitement : `audité` (inventorié) → `mappé` (relié à un contenu du site) → `produit`.
> Ce fichier sert de traçabilité ; il n'est pas publié tel quel aux utilisateurs.

Légende destination : **C**=cours, **F**=fiche, **FR**=fiche de révision, **D**=dictionnaire, **Q**=quiz, **EX**=exercice, **S**=schéma/interaction, **IMG**=photo, **∅**=liminaire (couverture/citation, rien à produire).

---

## Chapitre 1 — Rappels de Physique (p. 1–5)

### Page 1 — Couverture

- Titre « Mécanique du Vol », code M.V. 001, sous-titre « Préparation au BIA ».
- IMG : photo F-16 Thunderbirds en vol inversé (probable U.S. Air Force → domaine public à vérifier).
- Destination : ∅ (identité du module).

### Page (planche) — Ouverture chapitre 1 « Rappels de Physique »

- Citation Newton « J'ai vu plus loin… épaules de géants ».
- IMG : dessin **Gotlib** (Newton + pomme) → **COPYRIGHT, ne pas republier** (bande dessinée protégée).
- Destination : ∅ (à remplacer par illustration originale/libre si ouverture de cours).

### Page 2 — Qu'est-ce qu'une force ?

- Notions : force (langage courant vs définition Newton « action mécanique capable de créer une accélération ») ; Principia (1687) ; **1ʳᵉ loi de Newton / principe d'inertie** (énoncé original).
- Encadré : « les lois de Newton ne sont pas au programme du BIA » mais aident à comprendre.
- IMG : photo manège/chaises volantes (contact + force centripète) — photo tierce, à remplacer.
- Destinations : C (Module 1) ; F « Les trois lois de Newton » ; D : force, inertie ; Q.

### Page 3 — Lois de Newton (suite) + types de forces

- Notions : MRU + résultante des forces ; **ΣF = 0 ⇔ V = constante** ; **2ᵉ loi ΣF = M·a** ; **3ᵉ loi action-réaction F(A/B) = −F(B/A)** (même droite, même valeur, sens opposés) ; exemples (fusil/balle, hélice/air) ; **2 types de forces** : contact / distance (gravitationnelle, électrique, magnétique, électronucléaire).
- Formules : ΣF=0 ⇔ V=cste ; ΣF=M·a ; F(A/B)=−F(B/A).
- Destinations : C ; F « Les trois lois de Newton » ; F « Forces de contact et de distance » ; D : résultante, action-réaction ; Q ; EX.

### Page 4 — Représentation d'une force + inertie appliquée à l'avion

- Notions : force de Laplace (force électromagnétique) ; **représentation vectorielle** (4 caractéristiques : direction, sens, intensité, point d'application) ; le **poids** comme exemple (P appliqué au centre de gravité, ex. 45 000 N) ; **3.1 forces de pression P = F/S** ; **principe d'inertie appliqué à l'avion** (phases de vol stabilisé = MRU ; référentiels galiléens ; Vg = Cste).
- Formule : P = F/S.
- Média : « Vidéo 1.1 Forces de contact et distance » (capture, pile sur table) → **ressource externe à retrouver / remplacer**.
- IMG : photo Alphajet PAF avec vecteur poids (photo tierce, à remplacer/redessiner en schéma).
- Destinations : C ; F « Représenter une force (vecteur) » ; F « Le poids » ; D : vecteur, poids, centre de gravité, pression ; S (schéma vectoriel) ; Q.

### Page 5 — Bilan des forces sur l'avion en MRU

- Notions : réciproque (MRU ⇒ ΣF = 0) ; **bilan : un avion en vol n'est soumis qu'à 2 forces — le poids P et la résultante aérodynamique F** ; en MRU, F équilibre P (même direction/intensité/point d'application, sens opposé).
- IMG : schéma avion (vecteurs F et P) — schéma simple, à redessiner en SVG.
- Destinations : C ; F « L'équilibre des forces » ; S (bilan des forces) ; Q. (Lien vers fondamentaux.mecanique-du-vol.quatre-forces existant.)

---

## Chapitre 2 — Notions d'aérodynamique / mécanique des fluides (p. 6–11)

### Page 6 — Introduction à l'aérodynamique

- Notions : annonce du programme (montée, descente, virage) ; **théorème de Bernoulli (1738)** ; questions fil rouge : comment un avion vole ? pourquoi un hypersustentateur augmente la portance aux basses vitesses et abaisse la vitesse de décrochage ? pourquoi les winglets font gagner **3,5 % d'autonomie** à un Airbus ?
- IMG : photo sillages tourbillonnaires d'éoliennes dans le brouillard (illustration turbulence de sillage) — photo tierce, à remplacer.
- Destinations : C (intro Module 2) ; D : Bernoulli, winglet, hypersustentateur ; Q. **À VÉRIFIER** : « 3,5 % » (chiffre à sourcer/actualiser).

### Page 7 — Pression statique

- Notions : **P = F/S** (Pa) ; **1.1 pression statique** (fluide au repos, perpendiculaire aux parois, varie avec la hauteur) ; **P_B − P_A = ρ·g·h** ; prise de pression statique dans une canalisation (perpendiculaire à l'écoulement).
- Formule : P_B − P_A = ρ·g·h (variables : ρ kg/m³, g m/s², h m).
- Média : « Vidéo 1.2 Mise en évidence de la pression statique » (blason Pau) → ressource externe à retrouver/remplacer.
- IMG : schéma récipient A/B/h/ρ ; schéma manomètre canalisation → redessiner en SVG.
- Destinations : C ; F « Pression statique et pression dynamique » ; D : pression statique ; S ; Q ; EX (calcul ρgh).

### Page 8 — Pression dynamique

- Notions : **1.2 pression dynamique** (fluide en mouvement, perpendiculaire au mouvement) ; énergie cinétique W = ½·M·V² ; M = ρ·V₀ ; **P_d = ½·ρ·v²** ; pression statique = énergie d'expansion, pression dynamique = énergie cinétique (nulle au repos).
- Formules : W = ½·M·V² ; M = ρ·V₀ ; **P_d = ½·ρ·v²**.
- IMG : schémas « air en repos » vs « air en mouvement » (flèches) → redessiner en SVG.
- Destinations : C ; F « Pression dynamique » ; D : pression dynamique, énergie cinétique, masse volumique ; S ; Q ; EX (influence du doublement de vitesse → ×4).

### Page 9 — Pression totale + tubes de courant

- Notions : **1.3 pression totale P_T = P_s + P_d = P_s + ½·ρ·V²** ; **1.4 tubes de courant** (ligne de courant, tube de courant, filet de courant ΔS) ; **débit Q = V·S constant** ; Q = V₁S₁ = V₂S₂ = V₃S₃ ; section diminue ⇒ vitesse augmente.
- Formules : **P_T = P_s + ½·ρ·V²** ; **Q = V·S** (conservation du débit).
- IMG : schéma tube de courant/ligne/filet ; schéma Venturi (S1/S2/S3) → redessiner SVG (base de l'interaction Venturi).
- Destinations : C ; F « Pression totale » ; F « Le tube de Venturi » / « Conservation du débit » ; D : pression totale, ligne de courant, tube de courant, débit ; S (Venturi interactif) ; Q ; EX.

### Page 10 — Mise en évidence du théorème de Bernoulli + propriétés de l'air

- Notions : hypothèses (air = fluide incompressible, V ≪ vitesse du son, ρ et T constantes, poids propre négligé) ; **1. L'air** : masse volumique **ρ ≈ 1,3 kg/m³** ; pression **≈ 101 300 Pa = 1013 hPa ≈ 1 bar** au niveau de la mer ; température T en Kelvin.
- IMG : schéma profil d'aile (P_l extrados / P_b intrados) + schéma coque de bateau (P_front/P_back) → redessiner SVG.
- Destinations : C ; F « Les caractéristiques de l'air » (lien fondamentaux.aerodynamique.air-et-proprietes existant) ; D : masse volumique, pression atmosphérique, Kelvin ; Q. **À VÉRIFIER** : ρ=1,3 (valeur ISA au niveau mer = 1,225 kg/m³ à 15 °C — préciser).

### Page 11 — Théorème de Bernoulli + Venturi

- Notions : conversion Celsius→Kelvin (35 + 273,15 = 308,15 K) ; viscosité, humidité (renvoi météo) ; **air ≈ 4/5 diazote + 1/5 dioxygène** ; **2. Théorème de Bernoulli** (P_T constante dans un tube de courant, démontré par Euler) ; **P_T = P_s1 + ½ρV₁² = P_s2 + ½ρV₂² = Cste** ; section ↓ ⇒ vitesse ↑ ⇒ P_d ↑ ⇒ **P_s ↓** ; **3. Le tube de Venturi**.
- Formule : **P_s1 + ½ρV₁² = P_s2 + ½ρV₂²** (Bernoulli).
- Média : « Galerie 1.1 Mise en évidence du théorème de Bernoulli » (manomètres sur Venturi) → interaction à recréer.
- Destinations : C ; F « Théorème de Bernoulli » ; F « Le tube de Venturi » ; D : Bernoulli, Venturi, Kelvin, viscosité ; S (Venturi + manomètres interactif) ; Q ; EX.

---

## Chapitre 3 — Les souffleries (p. 12–…)

### Page 12 — Ouverture chapitre 3 « Les souffleries »

- Citation Henrik Wergeland « Si le vent du succès souffle trop fort, réduis la voilure ».
- IMG : photo enfant soufflant un pissenlit (photo tierce) → ∅ / à remplacer.
- Destination : ∅.

### Page 13 — Composition d'une soufflerie (début)

- Notions : aéronautique = science d'expérimentation ; souffleries = bancs de mesure (Cx, Cz) ; bases de données d'essais ; **1. Composition** : dispositif de mise en mouvement (ventilateur), chambre de tranquillisation (nid d'abeille + grillages → casse la turbulence, taux de turbulence), collecteur/convergent (accélération, Bernoulli), chambre d'essai (maquette), diffuseur/divergent (angle max 7°) ; classification : circuit ouvert (**type Eiffel**)…
- Destinations : C (Module 3) ; F « Les souffleries » ; D : soufflerie, Cx, Cz, chambre de tranquillisation, convergent, diffuseur, taux de turbulence ; S (soufflerie interactive à zones cliquables) ; Q.

---

### Page 14 — Souffleries Eiffel / Prandtl + mesures

- Notions : **soufflerie type Eiffel** (circuit ouvert, air aspiré de l'atmosphère) ; **type Prandtl** (circuit fermé, la plupart des modernes) ; à savoir identifier au BIA : collecteur, filtres, convergent, veine, chambre d'expérimentation, diffuseur, ventilateur ; **4. mesures en soufflerie** : balance aérodynamique (plateaux moments / portance / dérapage / traînée).
- Média : « Vidéo 2.1 Soufflerie Eiffel » (blason Pau) → externe à retrouver/remplacer.
- IMG : schéma circuit ouvert (Eiffel) ; schéma circuit fermé ; schéma balance aérodynamique → redessiner SVG.
- Destinations : C ; F « Les souffleries » ; D : soufflerie Eiffel, soufflerie Prandtl, balance aérodynamique ; S (soufflerie cliquable) ; Q.

## Chapitre 3 (bis) — La résistance de l'air (p. 15–17)

### Page 15 — Ouverture chapitre « La résistance de l'air »

- Citation Sénèque « Il n'est pas de vent favorable… ».
- IMG : photo Dacia Duster en soufflerie (**constructeur → copyright, ne pas republier**).
- Destination : ∅ / à remplacer.

### Page 16 — Étude simplifiée de la résistance de l'air « R »

- Notions : corps = obstacle au **vent relatif** ; plaque perpendiculaire freine/dévie l'air ; **zone de pression** en amont (P_s > P_a) / **zone de dépression** en aval (P_s < P_a) ; Bernoulli ; « les flèches représentent la pression statique relative (P_s − P_a) ».
- IMG : schéma plaque + zones pression/dépression → redessiner SVG (interaction possible).
- Destinations : C ; F « La résistance de l'air » ; D : vent relatif, dépression, résistance de l'air ; S ; Q.

### Page 17 — Expression de R et coefficient K

- Notions : **R = ½·ρ·V²·S** (si filets non déviés) ; filets déviés + frottements ⇒ **R = ½·ρ·V²·S·K** ; K = coefficient de **forme + état de surface** ; comparaison des formes : plaque **R = 100 %**, sphère **R = 50 %**, corps profilé **R < 15 %**, aile **R < 5 %** ; R ∝ ρ, V², S, K.
- Formule : **R = ½·ρ·V²·S·K**.
- IMG : comparatif de formes (plaque/sphère/profilé/aile) → redessiner SVG (comparaison visuelle demandée par le brief).
- Destinations : C ; F « Les différents types de traînée » / « Résistance de l'air » ; D : coefficient de traînée, maître-couple ; S (comparateur de formes) ; Q ; EX (comparaison de traînée).

## Chapitre 4 — Surface portante, portance et traînée (p. 18–23)

### Page 18 — Ouverture « Comment obtenir une surface portante ? »

- Citation Antoine-Marin Lemierre « Même quand l'oiseau marche… ».
- IMG : photo N&B historique (aviateur ailé, années 1930) → **domaine public probable (ancienneté), à vérifier** ; sinon remplacer.
- Destination : ∅.

### Page 19 — La force aérodynamique F_R

- Notions : R (mal nécessaire) contient une énergie contrôlable ; F_R inclinée vers l'arrière (frottements) ; **décomposition : F_z perpendiculaire au vent relatif = PORTANCE ; F_x parallèle = TRAÎNÉE** ; surface portante = transforme la vitesse relative en force sustentatrice ; **angle d'incidence i** = angle entre le vent relatif et le profil.
- IMG : schéma F_R → F_z + F_x ; schéma profil + angle d'incidence → redessiner SVG.
- Destinations : C ; F « Portance et traînée » ; F « L'angle d'incidence » ; D : force aérodynamique, portance, traînée, angle d'incidence, vent relatif ; S ; Q. (Liens fondamentaux.aerodynamique.portance / trainee existants.)

### Page 20 — Coefficient C_R + rôle de l'extrados

- Notions : i croît ⇒ F_R croît ; **F_R = ½·ρ·V²·S·C_R** (C_R remplace K, intègre la position dans le vent relatif) ; extrados = **dépression**, intrados = **pression** ; portance F_z = force utile, traînée F_x = force nuisible ; **la dépression d'extrados assure ~70 % de la portance**.
- Formule : **F_R = ½·ρ·V²·S·C_R**.
- IMG : diagramme des pressions/dépressions autour d'un profil → redessiner SVG (interaction « écoulement autour d'un profil »).
- Destinations : C ; F « Portance et traînée » ; F « Le profil d'aile » ; D : coefficient de portance, extrados, intrados, dépression ; S (répartition des pressions) ; Q. **À VÉRIFIER** : « 70 % » (ordre de grandeur admis — à sourcer).

### Page 21 — Étude de la traînée (3 types) + tourbillons marginaux

- Notions : **trois traînées : de forme, de sillage, induite** ; forme (profil) ; sillage (décollement des filets à l'arrière, ∝ vitesse et incidence) ; induite (différence de pression intrados/extrados ⇒ l'air remonte aux saumons ⇒ **tourbillons marginaux**) ; deux tourbillons contrarotatifs ⇒ turbulence de sillage, dangereuse au décollage/atterrissage.
- IMG : schéma tourbillons marginaux (dépressions extrados / surpressions intrados) ; schéma avion + 2 tourbillons → redessiner SVG.
- Destinations : C ; F « Les différents types de traînée » ; F « Traînée induite et tourbillons marginaux » ; D : traînée de forme, traînée de sillage, traînée induite, tourbillon marginal, turbulence de sillage, saumon ; S ; Q ; F « Étude de cas : turbulence de sillage ».

### Page 22 — Allongement, winglets, finesse

- Notions : « si l'incidence est trop grande, la portance s'effondre » ; **allongement λ = L²/S_a = L / corde moyenne** (L = envergure, S_a = surface alaire, le fuselage compte) ; traînée induite **inversement proportionnelle à l'allongement** ; avions de transport = allongement peu élevé ; **winglets/Sharklets** réduisent la traînée induite ; **allongement ↑ ⇒ finesse ↑**.
- Formule : **λ = L²/S_a = L / corde moyenne**.
- Média : « Vidéo 4.1 Traînée induite » (blason Pau) → externe à retrouver ; lien « ici » (économie kérosène) → lien mort à retrouver.
- IMG : schéma envergure/surface alaire (avion léger + jet, fuselage inclus) → redessiner SVG.
- Destinations : C ; F « L'allongement » ; F « Les winglets » ; D : allongement, envergure, surface alaire, corde moyenne, winglet, finesse ; S ; Q ; EX (influence de l'allongement). **À VÉRIFIER / ACTUALISER** : « 3,5 % » (p.6) vs « 4 % Sharklets » (p.22) — chiffres à harmoniser et sourcer (Airbus annonce jusqu'à ~4 %).

### Page 23 — Galerie Winglets

- Média : « Galerie 4.2 Winglets » (photo condor + vignettes de winglets d'avions).
- IMG : photo condor (**tierce, à vérifier/remplacer**) ; vignettes winglets (constructeurs → copyright).
- Destinations : IMG (illustrer F « Winglets » par une photo libre équivalente — rechercher Wikimedia).

## Chapitre 5 — Couche limite, écoulement et décrochage (p. 24–26)

### Page 24 — Écoulement de l'air autour d'un profil + couche limite + Reynolds

- Notions : **couche limite** = film d'air d'épaisseur AB où la vitesse varie de 0 (paroi) à V_R ; les forces de pression statique (donc F_R) ne s'exercent qu'en présence d'une couche limite collant à la paroi ; **écoulement laminaire vs turbulent** (Osborne Reynolds) ; **nombre de Reynolds Re = ρ·v·D / η** (sans dimension ; ρ masse volumique, v vitesse moyenne, D diamètre/dimension, η viscosité dynamique) ; importance pour la transition laminaire/turbulent et la traînée de frottement.
- Formule : **Re = ρ·v·D / η**.
- IMG : schéma couche limite (profil de vitesse A→B) → redessiner SVG.
- Destinations : C ; F « La couche limite » ; F « Écoulement laminaire et turbulent / Nombre de Reynolds » ; D : couche limite, écoulement laminaire, écoulement turbulent, nombre de Reynolds, viscosité, transition ; S (couche limite / transition) ; Q. (Lien fondamentaux.aerodynamique.ecoulement-de-l-air existant.)

### Page 25 — Point d'impact / transition / décollement (planche tournée)

- Notions : **point d'impact I** (partage du flux), **point de transition T** (laminaire→turbulent), **point de décollement D** ; couche limite laminaire = filets parallèles, épaisseur quelques dixièmes de mm ; turbulent = désordonné mais direction générale conservée ; sous certaines conditions l'écoulement décolle (tourbillonnaire) = **décollement de la couche limite**.
- IMG : schéma profil avec I/T/D et détails laminaire/turbulent → redessiner SVG (base de l'interaction « variation de l'incidence »). **NB : page en orientation tournée dans le PDF.**
- Destinations : C ; F « La couche limite » ; D : point d'impact, point de transition, point de décollement ; S ; Q.

### Page 26 — Influence de l'incidence sur l'écoulement → décrochage (planche tournée)

- Notions : faible incidence (i≈0) : T proche, D vers bord d'attaque ; incidence moyenne : déplacement de T ; **incidence forte** : au-delà de l'**incidence critique**, la couche limite décolle, la portance **diminue brutalement = décrochage**.
- IMG : schémas profils faible/moyenne/forte incidence (I/T/D) → redessiner SVG (interaction « incidence → décrochage »). **NB : page tournée.**
- Destinations : C ; F « Le décrochage » ; D : incidence critique, décrochage ; S (incidence interactive) ; Q ; F « Étude de cas : décrochage ». (Liens fondamentaux.aerodynamique.decrochage / mecanique-du-vol.decrochage-et-vrille existants.)

## Chapitre 6 — Polaire et finesse (p. 27–…)

### Page 27 — La polaire d'un profil Eiffel

- Notions : **F_z = ½ρV²S·C_z** (C_z coeff de portance), **F_x = ½ρV²S·C_x** (C_x coeff de traînée), **F_R = ½ρV²S·C_R** ; en soufflerie ½ρv²S = A (constant) ⇒ F_z = A·C_z, etc. ; construction de la **polaire d'un profil** (C_z en ordonnée, C_x en abscisse) ; exemple profil biconvexe symétrique : i=2° → (C_x 0,010 ; C_z 0,17), i=6° → (C_x 0,019 ; C_z 0,47) ; polaire 100·C_z / 100·C_x avec angles repérés (−2°, 0°, 2°, 5°, 10°, 17°, 18°, 20°).
- Formules : **F_z = ½ρV²S·C_z** ; **F_x = ½ρV²S·C_x**.
- IMG : schéma vecteurs C_z/C_x/C_R ; graphe polaire (2 versions) → recréer en **polaire interactive** (curseur d'incidence → C_x, C_z, finesse, position, proximité décrochage).
- Destinations : C (Module 7) ; F « La polaire d'Eiffel » ; F « Les coefficients C_z et C_x » ; D : polaire, coefficient de portance, coefficient de traînée ; **S (polaire interactive — priorité brief)** ; Q ; EX (lecture de polaire).

### Page 28 — La polaire complète (points remarquables)

- Notions : lecture de la polaire (100·C_z / 100·C_x, échelle C_x ×10) ; **points remarquables** : i=−2° **portance nulle** ; i=0° **traînée minimum** ; i=5° **finesse maximum** (tangente issue de l'origine) ; i=9° **meilleur rendement aérodynamique** ; i=13° **portance maximum** ; i=16° **décrochage**.
- IMG : polaire annotée → base directe de la **polaire interactive**.
- Destinations : C ; F « La polaire d'Eiffel » ; F « La finesse » ; D : portance nulle, traînée minimale, finesse maximale, portance maximale ; S (polaire interactive) ; Q ; EX (lecture de polaire).

### Page 29 — Interaction polaire (biconvexe symétrique)

- Média : « Interactive 4.1 Polaire d'un profil biconvexe symétrique » (mêmes points cliquables) → **à recréer nativement** (SVG/React).
- Destinations : S (polaire interactive — priorité).

### Page 30 — Polaire d'aile → d'avion + polaire des vitesses

- Notions : polaire de l'avion = polaire de l'aile translatée vers des C_x plus élevés (fuselage, moteurs, empennages) ⇒ concevoir avec C_x minimal ; **2. polaire des vitesses** (pour info) : vitesse horizontale V_h (abscisse) vs taux de chute T_c (ordonnée) en vol plané ; exemple parapente **V_D (décrochage) 5,3 m/s**, **V_M (max) 10,4 m/s** ; finesse max = tangente par l'origine ; influence du vent (arrière/face).
- IMG : schéma polaire aile vs avion ; polaire des vitesses parapente → redessiner SVG.
- Destinations : C ; F « La polaire des vitesses » (Niveau 3) ; D : polaire des vitesses, taux de chute, vitesse de décrochage ; S ; Q.

### Page 31 — Polaire des vitesses (suite) + étude de cas Air Transat

- Notions : construction tangente décalée (vent) : F1 8,5 m/s (par 0), F2 7,8 m/s (par −4, vent arrière) ; **étude de cas réel — vol Air Transat TS236** (23 août 2001, A330-243 C-GITS, Toronto→Lisbonne, fuite de carburant, double extinction moteurs, **vol plané ~19 min / 65 Nm ≈ 120 km**, posé à Lajes/Terceira aux Açores à ~200 kts).
- Destinations : C ; **F « Étude de cas : le planeur Air Transat »** (Niveau 2/3) ; Q (cas pratique). **À VÉRIFIER** : faits, dates, chiffres du vol TS236 (sourcer rapport officiel BEA/TSB Canada) — actuellement narratif.

### Page 32 — Fin étude de cas + vidéo vitesses en plané

- Média : « Vidéo 4.2 Différentes vitesses en plané » (planeur : V=230 km/h, V=180 km/h, taux de chute mini 95 km/h, **finesse max 115 km/h**) → externe à retrouver/remplacer par schéma original.
- IMG : schéma trajectoires de plané selon la vitesse → redessiner SVG (calculateur/visualisation vol plané).
- Destinations : C ; F « La finesse » / « Le vol plané » ; S ; EX (distance franchissable en plané).

### Page 33 — Parlons profils (vocabulaire géométrique)

- Notions : **extrados, intrados, bord d'attaque, bord de fuite, profondeur/corde, épaisseur relative** (épaisseur/corde en %, ex. 12 %), **corde de référence, ligne moyenne, angle de calage** (fixe : corde ↔ plan de référence/fuselage), **angle d'incidence** (corde ↔ vent relatif), **centre de poussée** (point d'application de F_R ; profils symétriques : fixe à **25 % de la profondeur**).
- IMG : schémas de profil annotés (toutes ces définitions) → **redessiner en SVG interactif (profil légendé cliquable)**.
- Destinations : C ; F « Le profil d'aile (vocabulaire) » ; D : extrados, intrados, bord d'attaque, bord de fuite, corde, profondeur, épaisseur relative, ligne moyenne, calage, angle d'incidence, centre de poussée ; S (profil légendé) ; Q (légendage de schéma). (Lien fondamentaux.aerodynamique.profil-d-aile existant.)

### Page 34 — Les types de profils

- Notions : profil d'aile = section perpendiculaire à l'axe de tangage ; **5 types classés du moins au plus stable : biconvexe symétrique, biconvexe dissymétrique, plan convexe, creux (cambré), autostable** ; usages (gouvernes/voltige/pales d'hélico ; aviation de loisir ; aviation générale ; planeurs ; ailes volantes) ; **profils supercritiques** (double courbure, extrados aplati, intrados creusé arrière — vol transsonique, plus d'épaisseur/carburant).
- IMG : planche des 5 types de profils + supercritique → redessiner SVG (comparateur de profils).
- Destinations : C ; F « Les types de profils » ; D : biconvexe symétrique/dissymétrique, plan convexe, profil creux, profil autostable, profil supercritique, cambrure ; S ; Q.

### Page 35 — Cambrure et finesse

- Notions : **cambrure** (distance corde↔ligne moyenne, nulle si symétrique) ; **finesse f = C_z/C_x = R_z/R_x = V_x/V_z = D/Δz** ; pente = arctan(1/finesse) ; finesse 7 ⇒ angle de plané ≈ 8° ; **la finesse maximale ne dépend pas du poids** (dépend de C_z, donc de l'incidence).
- Formules : **f = C_z/C_x = V_x/V_z = D/Δz** ; **pente = arctan(1/f)**.
- IMG : formule finesse + schéma angle de plané (ε = 1:N = tan γ) → rendu KaTeX + schéma SVG.
- Destinations : C ; F « La finesse » ; D : cambrure, finesse, angle de plané ; S (calculateur finesse ↔ pente) ; Q ; EX (finesse ↔ distance de plané).

## Chapitre 7 — Les hypersustentateurs (p. 36–38)

### Page 36 — Systèmes hypersustentateurs

- Notions : **becs (slats, bord d'attaque) et volets (flaps, bord de fuite)** ; extension de surface + augmentation de cambrure ; **fentes** (redonnent de l'énergie à la couche limite, retardent le décollement, jusqu'à **+60 % de C_z max**) ; combinaison becs+volets **jusqu'à +150 % de portance** ; graphe C_z max : aile simple 1,6 à 15°, volets haute portance 3,2 à 22°, volets+fentes 4,0 à 28°, fentes 2,4 à 22°.
- IMG : graphe C_z max / angle d'attaque (4 courbes) → recréer en graphe/interaction.
- Média : « Vidéo 4.3 Volets » ; « Interactif 4.1 Ailerons et volets d'un gros porteur » (winglet, ailerons BV/HV, rail, becs Krüger, volets Fowler, spoilers) → interaction à recréer (**gros porteur : becs/volets/spoilers cliquables**).
- Destinations : C (Module 8) ; F « Les volets (flaps) » ; F « Les becs (slats) » ; D : hypersustentateur, bec/slat, volet/flap, volet Fowler, bec Krüger, fente ; S (dispositifs d'un gros porteur) ; Q ; EX.

### Page 37 — Utilisation et effets secondaires

- Notions : soufflage d'air sur volets / aspiration de couche limite (systèmes complexes, énergivores) ; **utilisation des volets** : décollage 10–15°, approche 20–40°, atterrissage (pleins volets) ; **effets secondaires** : sortie des volets ⇒ **moment à piquer** ; sortie des becs ⇒ **moment à cabrer** ; config atterrissage réduit la visibilité vers l'avant ; **configuration lisse** (becs/volets rentrés).
- IMG : schéma soufflage/aspiration → redessiner SVG.
- Destinations : C ; F « Utilisation des volets et becs » ; D : configuration lisse, configuration atterrissage, braquage ; Q ; EX. **À VÉRIFIER** : valeurs de braquage (10–15° / 20–40°) — génériques, à présenter comme ordres de grandeur.

### Page 38 — Galeries et vidéos dispositifs

- Média : Galerie 4.3 (avions légers, config croisière), 4.4 (avions de transport, config lisse), 4.5 (spoilers) ; « Vidéo 4.4 Slats, Spoilers et Flaps » ; « Vidéo 4.5 STOL ».
- IMG : schémas config croisière/lisse ; photo spoilers en vol (tierce) → redessiner/rechercher libre.
- Destinations : F « Les spoilers et aérofreins » ; D : spoiler, destructeur de portance, aérofrein, STOL ; S ; Q.

## Chapitre 8 — La résultante aérodynamique (variation) (p. 39–40)

### Page 39 — Ouverture chapitre 5 « La résultante aérodynamique »

- Citation/formule F_R = ½·ρ·v²·S·C_R.
- IMG : photo Rafale fumigènes (armée de l'Air — **domaine public probable si cliché militaire officiel, à vérifier** ; sinon remplacer par photo libre créditée).
- Destination : ∅ / IMG.

### Page 40 — Facteurs influant sur F_R

- Notions : **F_R = ½·ρ·V²·S·C_R** ; **1.1 ρ** (F_R diminue quand altitude et température augmentent) ; **1.2 V²** ; **1.3 S** (surface alaire ; avions à géométrie variable — F-14, Tupolev) ; **1.4 C_R** → 1.4.1 faire varier surface et courbure (hypersustentateurs) pour augmenter C_z (portance) à basse vitesse.
- Formule : F_R = ½·ρ·V²·S·C_R (rappel, facteurs détaillés).
- Destinations : C ; F « Les facteurs de la résultante aérodynamique » ; D : géométrie variable ; Q ; EX (influence de ρ/V/S). **À VÉRIFIER** : « altiport de Peyragudes », « aérodrome de Pau » (exemples locaux — anecdotiques, conservables).

### Page 41 — Influence de l'angle d'incidence sur F_R

- Notions : F_R (appliquée au centre de poussée) inclinée vers l'arrière ; **i > 0** ⇒ F_R vers le haut (portance positive) ; **i < 0** ⇒ F_R vers le bas (**portance négative −F_z**) ; **i = 0** ⇒ écoulement symétrique (profil symétrique) ; C_R intègre forme + état de surface + position (incidence) ; **conclusion : contrôler l'avion = contrôler F_R en faisant varier l'angle d'incidence i**.
- IMG : schémas profil i>0 / i<0 / i=0 (vecteurs F_R, F_z, F_x) → redessiner SVG.
- Destinations : C ; F « L'angle d'incidence » ; D : portance négative, centre de poussée ; S ; Q.

## Chapitre 9 — Hyposustentateurs et aérofreins (p. 42–45)

### Page 42 — Spoilers et aérofreins (définitions)

- Notions : **spoilers = hyposustentateurs** (diminuent fortement la portance, exclusivement sur l'**extrados**, écoulement tourbillonnaire ⇒ forte traînée) ; symétriques (braquage 0°/30°/60°) → effet aérofrein (V_z ↑, réduction du roulage) ; dissymétriques → aide au virage ; PA amortit la turbulence ; au sol, plaquent l'avion ; **aérofreins** (augmentent C_x, C_z ~constant).
- IMG : (page principalement textuelle).
- Destinations : C ; F « Les spoilers et aérofreins » ; D : spoiler, hyposustentateur, aérofrein, destructeur de portance ; Q ; EX.

### Page 43 — Aérofreins vs spoilers + localisation

- Notions : aérofreins → diminuer la vitesse, augmenter le taux de descente, stabiliser l'approche ; différences (aérofreins possibles sur l'intrados, pas utilisés en virage) ; braquages spoilers 0/30/60° (C_z max décroît, C_x min croît) ; **6.1 localisation** (circuit hydraulique, sauf planeurs).
- IMG : graphes C_z/C_x (aérofreins rentrés/sortis ; spoilers 0/30/60°) → recréer en graphes ; Galerie 5.1 Aérofreins (photo F-16 tierce).
- Destinations : C ; F « Les spoilers et aérofreins » ; S (graphe polaire avec dispositifs) ; Q.

### Page 44 — Parachute de queue + spoilers A319

- Notions : parachute de frein (navette spatiale — planeur de 73 t, Mirage IV, Typhoon) ; spoilers = hyposustentateurs (destruction de portance + décollement) ; exemple **Airbus A319** (5 panneaux de spoilers, décalés des ailerons) ; **7.1 principes de fonctionnement — 7.1.1 en vol** (symétriques = aérofreins).
- IMG : schéma aile A319 (volets/spoilers/aileron numérotés) → redessiner SVG ; photo spoilers (tierce).
- Destinations : C ; F « Les spoilers et aérofreins » ; D : parachute de frein ; S ; Q. **À VÉRIFIER** : « navette 73 tonnes », nombre de panneaux A319 — sourcer/nuancer.

### Page 45 — Fonctionnement des spoilers (sol/vol/approche)

- Notions : spoilers différentiels = aide au **gauchissement** (roulis) ; au sol = aérofreins + destructeurs de portance ; en approche les pilotes « arment » les spoilers (sortie auto si manettes au ralenti + amortisseurs comprimés + **vitesse roues > 85 kt**) ; remise de gaz ⇒ rentrée automatique (sécurité).
- IMG : schéma des fonctions roulis / aérofreins (ailerons+spoilers) → redessiner SVG.
- Destinations : C ; F « Les spoilers et aérofreins » ; D : gauchissement ; Q. **À VÉRIFIER** : « 85 kt » (valeur type Airbus — présenter comme exemple).

## Chapitre 10 — Contrôler l'avion : axes et gouvernes (p. 46–51)

### Page 46 — Ouverture chapitre 6 « Contrôler les forces aérodynamiques »

- Citation « Sans la maîtrise, la force n'est rien » — **Maître Yoda**.
- IMG : image Yoda (**Star Wars / Lucasfilm → COPYRIGHT, ne pas republier** ; remplacer).
- Destination : ∅.

### Page 47 — Axes d'inertie + principe du contrôle

- Notions : **3 axes** — **tangage** (transversal), **roulis** (longitudinal), **lacet** (perpendiculaire au plan tangage/roulis) — passant par le centre de gravité ; contrôler l'aéronef = contrôler angles et vitesses autour de ces 3 axes ; virage = incliner l'axe de tangage ; les **gouvernes** changent l'angle d'incidence → varient C_z/C_x → F_R.
- IMG : schéma 3D des 3 axes sur avion → redessiner SVG (base de l'**aéronef interactif — axes/gouvernes**).
- Destinations : C (Module 9) ; F « Les axes de l'avion » ; F « Les gouvernes » ; D : axe de tangage, axe de roulis, axe de lacet, gouverne ; S (aéronef interactif) ; Q. (Lien fondamentaux.mecanique-du-vol.axes-et-gouvernes existant.)

### Page 48 — Contrôle du tangage (profondeur)

- Notions : **contrôle du tangage** = rotation autour de l'axe de tangage via l'empennage horizontal ; empennage **déporteur** (R_z vers le bas en palier) ; **lever la gouverne de profondeur** ⇒ portance de l'empennage diminue (plus déportrice) ⇒ la queue descend ⇒ **le nez monte**.
- IMG : schéma profondeur / empennage / assiette → redessiner SVG.
- Destinations : C ; F « Le contrôle du tangage (profondeur) » ; D : gouverne de profondeur, empennage horizontal, assiette, déporteur ; S ; Q.

### Page 49 — Tangage (suite) + contrôle du roulis (ailerons)

- Notions : baisser la profondeur ⇒ nez descend ; **assiette = angle axe de roulis / horizon** (>0 ou <0) ; **contrôle du roulis** via les **ailerons** (virage à droite : aileron gauche baissé ⇒ portance aile gauche ↑ ; aileron droit levé ⇒ portance aile droite ↓) — R_zg / R_zd.
- IMG : schémas assiette>0 / assiette<0 ; ailerons différentiels ; gouvernes (direction/profondeur) → redessiner SVG.
- Destinations : C ; F « Le contrôle du roulis (ailerons) » ; D : aileron, roulis, gauchissement ; S (aéronef interactif — manche latéral) ; Q.

### Page 50 — Gauchissement + contrôle du lacet (direction)

- Notions : **gauchissement** (terme historique : déformation des ailes) ; spoilers en aide au roulis ; **contrôle du lacet** via la **gouverne de direction** (partie mobile de l'empennage vertical) commandée au **palonnier** (pied gauche ⇒ nez à gauche).
- IMG : schémas gauchissement ; axe de lacet 3D → redessiner SVG.
- Destinations : C ; F « Le contrôle du lacet (direction) » ; D : gouverne de direction, palonnier, lacet, empennage vertical ; S ; Q.

### Page 51 — Synthèse commandes + définitions incontournables

- Notions : synthèse manche/pied (manche avant→nez pique ; pied à droite→nez à droite) ; **définitions clés** : **assiette** (axe roulis / horizontale), **incidence** (axe roulis / vent relatif ou trajectoire), **pente** (vitesse / horizontale), **ASSIETTE = INCIDENCE + PENTE**, **inclinaison** (axe tangage / horizontale), **dérapage** (axe roulis / vent relatif — nul si symétrique).
- Formule/relation : **Assiette = Incidence + Pente**.
- IMG : schéma assiette/incidence/pente/vent relatif ; schémas dérapage nul / à droite → redessiner SVG.
- Destinations : C ; **FR (fiche de révision « Assiette, incidence, pente, dérapage »)** ; D : assiette, incidence, pente, inclinaison, dérapage ; S ; Q (pièges classiques BIA).

## Chapitre 11 — Cas de vol (p. 52–…)

### Page 52 — Ouverture chapitre 7 « Cas de vol »

- Citation Cédric Villani (courbure de Ricci).
- IMG : photo Cédric Villani sautant (**tierce → droits à vérifier**, remplacer).
- Destination : ∅.

### Page 53 — Rappels + vol rectiligne en palier à vitesse constante

- Notions : rappels (ΣF=0 ⇔ V=cste ; ΣF=M·a ; **g = 9,81 m/s²**) ; **vol en palier (MRU)** : la **portance R_z** (⊥ vent relatif) équilibre le **poids P** (vertical) ; la **traction T** (// V_R) équilibre la **traînée R_x** ; bilan des 4 forces.
- Formule : g = 9,81 m/s² ; équilibre R_z = P, T = R_x.
- Média : « Vidéo 7.1 SO-CA-TOA » (trigonométrie) → externe.
- IMG : schéma des 4 forces (R_z, P, T, R_x) → redessiner SVG (bilan des forces en palier).
- Destinations : C (Module 10) ; F « Les quatre forces / le vol en palier » ; D : traction, portance, poids, traînée ; S (bilan des forces) ; Q ; EX. (Lien fondamentaux.mecanique-du-vol.quatre-forces existant.)

### Page 54 — Palier (bilan) + montée (décomposition du poids)

- Notions : palier **R_z = ½ρV²S·C_z = P = mg** ; **T = R_x = ½ρV²S·C_x** ; **vol en montée à vitesse constante** (MRU) ; relation de Chasles (décomposition de vecteurs) ; poids décomposé **P = P_z + P_x** dans un repère lié à V_R (pente φ).
- Formules : R_z = P = mg ; T = R_x ; P = P_z + P_x.
- Média : « Vidéo 7.2 La relation de Chasles » (externe).
- IMG : schéma avion en montée (R_z, T, R_x, P, P_z, P_x, φ=30°) → redessiner SVG.
- Destinations : C ; F « Le vol en montée » ; D : pente, relation de Chasles ; S ; Q ; EX (décomposition des forces en montée).

### Page 55 — Montée (équations) + descente

- Notions : montée — **R_z = mg·cos(φ)** ; **T = R_x + mg·sin(φ)** (le pilote met **plus** de puissance) ; **descente à vitesse constante** — P_x orienté vers l'avant (rôle moteur) ⇒ **T = R_x − mg·sin(φ)** (le pilote met **moins** de puissance).
- Formules : **R_z = mg·cos(φ)** ; **T = R_x ± mg·sin(φ)** (montée +, descente −).
- IMG : schémas montée/descente (φ=30°) → redessiner SVG.
- Destinations : C ; F « Le vol en montée » / « Le vol en descente » ; S ; Q ; EX (forces en montée/descente).

### Page 56 — Le virage (force déviatrice, facteur de charge)

- Notions : virage = incliner la portance ⇒ composante horizontale = **force déviatrice** ; effet girouette (dérive) ⇒ vol symétrique ; **T = R_x** ; **R_z·cos(φ) = mg** ; **facteur de charge n = R_z/P = 1/cos(φ)** (poids apparent/poids).
- Formules : **R_z·cos(φ) = mg** ; **n = 1/cos(φ)**.
- IMG : schéma inclinaison de la portance + force déviatrice → redessiner SVG.
- Destinations : C ; F « Le virage » ; F « Le facteur de charge » ; D : force déviatrice, facteur de charge, vol symétrique ; S ; Q ; EX. (Lien fondamentaux.mecanique-du-vol.virage existant.)

### Page 57 — Facteur de charge et rayon de virage

- Notions : **n(30°)=1,15 ; n(45°)=1,41 ; n(60°)=2,00** ; accélération **a = V²/R** ; **R_z·sin(φ) = m·V²/R** ; **tan(φ) = V²/(R·g)** ; rayon de virage ∝ V².
- Formules : **tan(φ) = V²/(R·g)** ; a = V²/R.
- IMG : schéma virage (projection des forces) → redessiner SVG.
- Destinations : C ; F « Le facteur de charge » ; F « Le virage » ; D : rayon de virage ; S (calculateur n ↔ inclinaison) ; Q ; EX (forces en virage).

### Page 58 — Rayon de virage + descente en plané

- Notions : **R = V²/(g·tan(φ))** (faible vitesse = petit rayon ; grande vitesse = grand rayon) ; **descente en plané** (planeur/parapente/panne moteur, pas de traction T) : **tan(φ) = H/D = R_x/R_z = C_x/C_z = 1/f** ; R_z = mg·cos(φ), R_x = mg·sin(φ) ; rappel finesse f = C_z/C_x = V_x/V_z = D/Δz.
- Formules : **R = V²/(g·tan φ)** ; **tan(φ) = 1/f = C_x/C_z = H/D**.
- IMG : schéma vol plané (pente φ=20°, H, D) → redessiner SVG (calculateur plané).
- Destinations : C ; F « Le vol plané / la finesse » ; D : rayon de virage, vol plané ; S ; Q ; EX (distance franchissable en plané).

## Chapitre 12 — Cas de vol approfondis : virage, bille, taux (p. 59–63)

### Page 59 — Ouverture chapitre 8 « Un peu plus loin sur les cas de vol »

- Citation « Je ne trouve pas la bille » — un élève pilote.
- IMG : photo cockpit ancien à instruments (**tierce → droits à vérifier**, remplacer).
- Destination : ∅.

### Page 60 — Le virage : lacet inverse et la bille

- Notions : **lacet inverse** (aileron baissé ⇒ plus de traînée ⇒ rotation en lacet opposée au virage ⇒ conjuguer au palonnier) ; lecture de la **bille** : (1) bille au centre = **virage coordonné/symétrique** ; (2) virage à droite + bille à droite = **glissade**, « le pied chasse la bille » (palonnier droit) ; (3) virage à droite + bille à gauche = **dérapage** (palonnier gauche).
- IMG : schémas bille (correct / glissade / dérapage) → redessiner SVG (bille interactive).
- Destinations : C ; F « Le lacet inverse » ; F « Le virage : bille, glissade, dérapage » ; D : lacet inverse, glissade, dérapage, bille, virage coordonné ; S ; Q (pièges).

### Page 61 — Tableau glissade extérieure / intérieure (planche tournée)

- Notions : tableau comparatif **glissade extérieure (dérapage) vs glissade intérieure** — position du nez, facteur de charge, vitesse de décrochage, dangerosité (dérapage = risque de vrille, plus dangereux près du sol), aile intérieure/extérieure, sens de départ de la bille, correction (pied). **NB : page tournée.**
- IMG : tableau (contenu à retranscrire en tableau HTML/DataGrid).
- Destinations : C (Niveau 2/3) ; **FR (fiche de révision « Glissade et dérapage »)** ; D : glissade extérieure, glissade intérieure ; Q.

### Page 62 — Le taux de virage

- Notions : **taux de virage = nombre de degrés / temps (s)** ; **taux 1 (standard)** = 360° en 2 min = **3°/s** ; **taux 2** = 360° en 1 min = **6°/s** ; instruments : indicateur bille-aiguille, coordinateur de virage (turn coordinator), chronomètre.
- Formule : **taux = degrés parcourus / temps (s)**.
- IMG : schémas indicateur de virage (taux 0/1/2, bille) ; photos d'instruments (tierces) → redessiner SVG.
- Destinations : C ; F « Le taux de virage » ; D : taux de virage, taux standard, coordinateur de virage ; S ; Q ; EX. (Liens fondamentaux.instruments.* existants.)

### Page 63 — Lectures d'indicateur (inclinaison/dérapage/glissade)

- Notions : planche de cas — inclinaison droite/gauche au taux 2, symétrique / en dérapage / en glissade, et corrections au pied.
- IMG : 6 cadrans bille-aiguille annotés → redessiner SVG (**interaction « lecture d'instrument » — lien psychotechnique/instruments**).
- Destinations : F « Lire l'indicateur de virage » ; S (lecture d'instrument interactive) ; Q (lecture de cadran).

## Chapitre 13 — Le décrochage (p. 64–66) [suite au chapitre 6 aéro]

### Page 64 — Ouverture chapitre 9 « Le décrochage d'une aile »

- Citation « Le décrochage c'est plutôt sympa mais pas en dernier virage ».
- IMG : photo F-22 (cône de vapeur) (**U.S. Air Force → domaine public probable, à vérifier**).
- Destination : ∅ / IMG.

### Page 65 — Décrochage : définition, Vs, décrochage en virage

- Notions : **décrochage** = effondrement de la portance (disparition de la couche limite, incidence trop grande) ; F_z = ½ρv²S·C_z ; **vitesse de décrochage à plat V_S** ; **V_S min = √(2P / (ρ·S·C_z max))** (S comme _Stall_) ; **en virage : V_S(nG) = V_S(1G)·√n** ; exemples (100 km/h à 1G ⇒ ~140 km/h à 60°/n=2 ; ~200 km/h à n=4/75° ; 70 km/h à 0,5 g) ; hypersustentateurs diminuent V_S.
- Formules : **V_S = √(2P / (ρ·S·C_z max))** ; **V_S(nG) = V_S(1G)·√n**.
- IMG : schéma évolution du décrochage (VR) → redessiner SVG.
- Destinations : C (Module 11) ; F « Le décrochage » ; F « La vitesse de décrochage V_S » ; D : décrochage, vitesse de décrochage, Stall, facteur de charge ; S (calculateur V_S ↔ facteur de charge) ; Q ; EX (V_S en fonction de n). (Liens fondamentaux.aerodynamique.decrochage / mecanique-du-vol.decrochage-et-vrille existants.)

### Page 66 — Indices et sortie du décrochage

- Notions : **facteurs de V_S** (masse ↑ ⇒ V_S ↑ ; facteur de charge ↑ ⇒ V_S ↑) ; **indices du décrochage** : commandes molles, **buffeting** (vibrations), **avertisseur de décrochage** (palette au bord d'attaque, klaxon 5–10 kt avant) ; **sortie du décrochage** : abattée (le nez plonge, le centre de poussée recule) ⇒ **rendre la main + remettre des gaz**.
- Média : « Vidéo 9.1 Décrochage en virage » (externe).
- IMG : schéma avertisseur de décrochage ; photo palette (tierce) → redessiner SVG.
- Destinations : C ; F « Le décrochage » ; F « Sortir du décrochage » ; D : buffeting, avertisseur de décrochage, abattée ; S ; Q ; F « Étude de cas : décrochage en dernier virage ».

### Page 67 — Décrochage dissymétrique → vrille

- Notions : si **une seule aile décroche**, l'avion **amorce une vrille**.
- Média : « Vidéo 9.2 Décrochages » (brins de laine sur l'aile — photo tierce).
- Destinations : C ; F « Le décrochage » / « La vrille » ; D : vrille ; Q. (Lien fondamentaux.mecanique-du-vol.decrochage-et-vrille existant.)

## Chapitre 14 — Effets aérodynamiques et stabilité (p. 68–80)

### Page 68 — Ouverture chapitre 10 « Quelques effets aérodynamiques et stabilité »

- Citation Paulo Coelho.
- IMG : photo planeur de voltige (HB-3241) fumigènes (**tierce → droits à vérifier**, remplacer).
- Destination : ∅.

### Page 69 — Le lacet inverse

- Notions : à l'amorce du virage, l'aileron baissé (aile extérieure) augmente portance **et traînée** ; l'aile intérieure voit sa traînée diminuer ⇒ différence de traînée ⇒ **rotation en lacet dans le sens opposé au virage (lacet inverse)** ; annulé au palonnier (conjugaison).
- IMG : schéma 3D lacet inverse (action ailerons, différence de traînée) → redessiner SVG.
- Destinations : C ; F « Le lacet inverse » ; D : lacet inverse ; S (aéronef interactif — effet induit) ; Q.

### Page 70 — Le roulis induit

- Notions : action sur la **gouverne de direction** (palonnier droit ⇒ lacet direct à droite) ⇒ la vitesse de l'**aile extérieure > intérieure** ⇒ **augmentation de portance sur l'aile extérieure** ⇒ **roulis induit « dans le bon sens »** ; en virage coexistent force centripète, lacet inverse et roulis induit (très marqué sur planeurs) ; virage coordonné = manche + pied du même côté.
- IMG : schéma 3D roulis induit → redessiner SVG.
- Destinations : C ; F « Le roulis induit » ; D : roulis induit ; S ; Q.

### Page 71 — Le lacet induit

- Notions : action sur la gouverne de direction ⇒ vitesse aile extérieure > intérieure ⇒ **augmentation de traînée sur l'aile extérieure** ⇒ **lacet induit opposé au lacet direct** ; sensible sur aéronefs lents, de grande envergure, à faibles inclinaisons (planeurs).
- IMG : schéma 3D lacet induit → redessiner SVG.
- Destinations : C ; F « Le lacet induit » ; D : lacet induit ; S ; Q.

### Page 72 — Effet girouette

- Notions : en **attaque oblique**, les surfaces latérales (majoritairement en arrière du centre de gravité) sont soumises au vent relatif ⇒ rotation autour de l'axe de lacet qui **ramène l'avion dans le lit du vent** (comme une girouette).
- IMG : schéma 3D effet girouette (vent relatif) → redessiner SVG.
- Destinations : C ; F « L'effet girouette » ; D : effet girouette, attaque oblique ; S ; Q.

### Page 73 — Stabilité latérale : effet redresseur de la flèche

- Notions : la **flèche** joue un rôle stabilisateur sur l'**axe de lacet** (comme le dièdre sur l'inclinaison) ; en dérapage, l'aile avancée présente plus de longueur (donc de traînée) au vent ⇒ **couple redresseur** qui remet l'avion dans le lit du vent.
- IMG : schéma flèche + traînées différentielles → redessiner SVG.
- Destinations : C ; F « La stabilité latérale : flèche et dièdre » ; D : flèche, effet redresseur, stabilité de route ; S ; Q.

### Page 74 — Stabilité latérale : effet redresseur du dièdre

- Notions : **dièdre positif** (commun aux avions d'aéroclub) ; en cas d'inclinaison, l'angle d'incidence est plus petit sur l'aile haute que sur l'aile basse ⇒ **différence de portance qui ramène l'avion à plat** sans action du pilote.
- IMG : schéma dièdre + angles d'incidence différentiels → redessiner SVG.
- Destinations : C ; F « La stabilité latérale : flèche et dièdre » ; D : dièdre positif/négatif/nul, stabilité latérale ; S ; Q.

### Page 75 — Formes d'ailes et stabilité

- Notions : classement des **voilures classiques** (plus stable → moins stable : trapézoïdale en flèche + empennage arrière, elliptique, flèche inversée, rectangulaire) ; **voilures « canard »** (flèche + empennage avant, gothique, delta, flèche inversée + empennage avant).
- IMG : planche des formes de voilures (classiques / canard) → redessiner SVG (comparateur de formes d'ailes).
- Destinations : C ; F « Formes d'ailes et stabilité » ; D : aile en flèche, aile elliptique, aile delta, aile gothique, formule canard, flèche inversée ; S ; Q.

### Page 76 — Emplantures et empennages

- Notions : classement des **emplantures** (plus stable → moins : aile haute dièdre nul, médiane dièdre positif, basse dièdre positif, semi-basse dièdre en bout, médiane dièdre négatif) ; **formes d'empennages** (sans classement de stabilité : double, classique, en Té, en Vé).
- IMG : planche emplantures + empennages → redessiner SVG.
- Destinations : C ; F « Emplantures et empennages » ; D : emplanture, aile haute/basse/médiane, empennage en Té, empennage en Vé ; S ; Q.

### Page 77 — Le souffle hélicoïdal

- Notions : l'hélice envoie l'air vers l'arrière en rotation = **souffle hélicoïdal** ; sensible à **basse vitesse** (décollage, remise de gaz) ; s'enroule autour du fuselage et attaque la dérive du côté de la **pale montante** ; pale montante à gauche (hélice horaire vue pilote) ⇒ la dérive est attaquée à gauche ⇒ la queue part à droite ⇒ **le nez part à gauche** ⇒ correction au **palonnier droit** ; train classique = roulette libre, la queue se lève (virage brutal possible).
- IMG : schéma souffle hélicoïdal (enroulement autour du fuselage) → redessiner SVG.
- Destinations : C (Module 12) ; F « Le souffle hélicoïdal » ; D : souffle hélicoïdal, pale montante, dérive ; S ; Q. **À VÉRIFIER** : sens (dépend du sens de rotation de l'hélice) — bien conditionner « hélice horaire vue pilote ».

### Page 78 — Souffle hélicoïdal (compensations) + vol lent

- Notions : réglage cadence nulle en croisière ; descente moteur réduit ⇒ embardée à droite ⇒ palonnier gauche ; le souffle rend les gouvernes plus efficaces à basse vitesse mais **néfaste à la stabilité** (dérive déportée / axe moteur décalé / TAB) ; **vol lent** proche du décrochage ⇒ dissymétrie ⇒ risque de départ en **vrille**.
- Notions/vocabulaire : **TAB** (fixe ou commandé), compensation.
- Destinations : C ; F « Le souffle hélicoïdal » ; F « Le vol lent » ; D : TAB/compensateur, cadence, vol lent ; Q.

### Page 79 — Le couple de renversement

- Notions : **couple de renversement** = application de la **3ᵉ loi de Newton** ; en réaction à la rotation de l'hélice, un couple fait tourner l'avion autour de l'axe de roulis dans le **sens inverse** de l'hélice (hélice à droite ⇒ appui sur la roue gauche, inclinaison à gauche) ; d'autant plus fort que la puissance est grande (décollage, remise de gaz) ; compensé par calage/TAB ; dangereux sur avions anciens très motorisés (passage sur le dos si mise en puissance brutale).
- IMG : (page textuelle) → schéma SVG à créer.
- Destinations : C ; F « Le couple de renversement » ; D : couple de renversement ; S ; Q. **Lien pédagogique** : 3ᵉ loi de Newton (Module 1).

### Page 80 — Effet gyroscopique et précession

- Notions : hélice + masses tournantes = volant **gyroscopique** (rigidité + **précession**) ; **précession** : une force appliquée à un gyroscope produit une réaction **perpendiculaire (90°)** dans le sens de rotation ; hélice horaire (vue pilote) ⇒ l'avion a tendance à **piquer dans les virages à droite** et à **cabrer dans les virages à gauche**.
- Média : « Vidéo 10.1 Effet gyroscopique » (externe) ; schéma « Effet de précession ».
- IMG : schéma effet de précession → redessiner SVG.
- Destinations : C ; F « L'effet gyroscopique » ; D : effet gyroscopique, précession, rigidité gyroscopique ; S ; Q. **Lien** : instruments gyroscopiques (horizon, conservateur).

### Page 81 — Effet gyroscopique (suite)

- Notions : au décollage, soulever la queue fait basculer le plan de l'hélice ⇒ couple gyroscopique ⇒ rotation en lacet ; en vol, cause de variations de pente/assiette en virage (à contrôler).
- Média : lien « cours pilote de ligne » (externe).
- Destinations : C ; F « L'effet gyroscopique » ; Q.

## Chapitre 15 — Compensation des commandes (p. 82–84)

### Page 82 — Compensateurs d'évolution (déport d'axe, tabs)

- Notions : les résultantes sur les gouvernes créent des efforts à combattre ⇒ **compensation** ; **1.1 déport de l'axe** (partie avant de la gouverne « aide » ; ex. partie déportée DC-3, corne débordante Caravelle) ; **1.2 tabs automatiques / commandés** (biellette Tab reliée au plan fixe, contrebraquage ; force r sur le Tab, force R sur la gouverne).
- IMG : schémas déport d'axe ; tab automatique (action du manche, force R/r) → redessiner SVG.
- Destinations : C (Module 13) ; F « La compensation des gouvernes » ; D : compensateur, tab/compensateur, corne débordante ; S ; Q.

### Page 83 — Panneau compensateur + masselottes (flutter)

- Notions : **1.3 panneau compensateur** (Boeing, surface interne au plan fixe, bypass, frottoirs caoutchouc) ; **1.4 compensateurs à masselotte** — le **flottement (flutter)** = oscillations de flexion/torsion pouvant aller jusqu'à la destruction ; gouverne d'autant plus sensible que son CG est loin de l'axe d'articulation ⇒ **masses de plomb** ramenant le CG vers l'avant (masselotte externe/interne).
- IMG : schémas panneau compensateur (bypass) ; masselottes → redessiner SVG.
- Destinations : C ; F « La compensation des gouvernes » ; D : flottement/flutter, masselotte d'équilibrage ; S ; Q. **Lien** : sécurité structurale.

### Page 84 — Compensateurs de régime, trims, PHR

- Notions : **compensateurs de régime** (annuler l'effort/supprimer le braquage à un régime donné) ; **tab fixe** (plaque au bord de fuite, contre le souffle hélicoïdal en croisière) ; **trims** (biellette filetée + écrou, moteur électrique/manuel) ; **PHR — Plan Horizontal Réglable** (THS, pivote le stabilisateur via un vérin à vis sans fin ; sur Airbus 300, débattement 3° à cabrer / 12° à piquer).
- IMG : schémas trim (biellette/écrou) ; PHR → redessiner SVG.
- Destinations : C ; F « Trims et PHR » ; D : trim/compensateur de régime, tab fixe, PHR/THS ; S ; Q. **À VÉRIFIER** : débattement PHR Airbus 300 (valeur type — sourcer/nuancer).

## Chapitre 16 — Centre de gravité, foyer, stabilité et centrage (p. 85–92)

### Page 85 — Ouverture chapitre 11 « Points particuliers »

- Citation « Le barycentre n'a rien à voir avec le cri de l'éléphant ».
- IMG : photo illusion de chaise en équilibre (**tierce → droits à vérifier**, remplacer).
- Destination : ∅.

### Page 86 — Centre de gravité et centre de poussée

- Notions : **centre de gravité (CdG, g)** = point d'application de la résultante des forces de pesanteur = barycentre des masses = origine du trièdre des 3 axes = point d'application des moments ; **centre de poussée (CP)** = point d'application de la résultante aérodynamique/portance (entre **30 et 50 % de la corde** depuis le bord d'attaque) ; profil dissymétrique : le CP **avance** vers le bord d'attaque quand i augmente ; profil symétrique : CP **fixe**.
- IMG : schéma CP en fonction de i → redessiner SVG.
- Destinations : C (Module 14) ; F « Le centre de gravité » ; F « Le centre de poussée » ; D : centre de gravité, barycentre, centre de poussée ; S ; Q. (Lien fondamentaux.mecanique-du-vol.equilibre-et-centrage existant.)

### Page 87 — Le foyer (démonstration NACA 2412)

- Notions : moment de portance **M_z/X = −Z·(d − x) = −½·ρ·S·V²·C_z·(d − x)** ; convention de signe ; tableau NACA 2412 (i de −2° à 7°, C_z, d, produit C_z·(d−x) pour x = 0 / 0,1 / 0,2 / 0,26 / 0,3) ; **à x = 0,26 le moment reste constant quelle que soit l'incidence ⇒ ce point est le FOYER (en tangage)** ; foyer ≈ à x = 0,26 (~¼ de corde), position quasi identique pour tous les profils.
- Formule : **M_z = −½·ρ·S·V²·C_z·(d − x)**.
- IMG : tableau NACA 2412 → retranscrire en tableau HTML/DataGrid.
- Destinations : C (Niveau 3) ; F « Le foyer » ; D : foyer, moment aérodynamique, coefficient de moment Cm ; Q ; EX (calcul de moment). **À VÉRIFIER** : reproduire fidèlement le tableau NACA 2412.

### Page 88 — Le foyer (définition) + mobilité des points

- Notions : **foyer** = point fixe où le coefficient de moment **C_m est constant** quelle que soit l'incidence ; foyer à ~¼ de corde (subsonique) = point d'application des **variations de portance** ; **mobilité** : CdG se déplace (chargement, carburant — manuel de vol) ; CP se déplace avec l'incidence (recule au décrochage) ; foyer fixe pour une configuration donnée mais varie avec les volets ; **stabilité** = un système qui revient à son état initial (analogie bille dans un bol / au sommet d'une colline).
- IMG : schéma CP en fonction de i ; billes stable/instable → redessiner SVG.
- Destinations : C ; F « Le foyer » ; F « Stabilité et centrage » ; D : coefficient de moment, stabilité, instabilité ; S (bille stable/instable) ; Q.

### Page 89 — Centrage et marge statique

- Notions : avion stable = revient après perturbation ; exemples d'**avions instables** (X-29, Su-47 — CDVE + ordinateur indispensables) ; **centrage** = placer le CdG dans une plage par rapport au foyer ; **règle absolue : le CdG doit être en avant du foyer** ; le pilote calcule les moments (équipage, carburant, fret, passagers) ; **marge statique = distance G→F** ; limite **avant** (manœuvrabilité) / **arrière** (stabilité).
- IMG : schéma plage de centrage (G, F, DANGER av/ar, secteur vert) → redessiner SVG (simulateur de chargement/centrage — priorité brief) ; Galerie 11.1 (photos X-29/Su-47 tierces).
- Destinations : C ; F « Le centrage et la marge statique » ; D : centrage, marge statique, plage de centrage, limite avant/arrière, CDVE ; **S (simulateur de centrage)** ; Q ; EX (calcul simplifié de centrage, centrage trop avant/arrière). (Lien fondamentaux.mecanique-du-vol.equilibre-et-centrage.)

### Page 90 — Stabilité statique longitudinale

- Notions : **stabilité longitudinale** (axe de tangage) ; config classique aile-empennage, CdG en avant du foyer/CP ; **voilure porteuse, empennage déporteur** ; augmentation d'incidence ⇒ couple à **piquer** (ramène) ; diminution ⇒ couple à **cabrer** ; **stable si le foyer est en arrière du CdG** ; centré avant = plus stable, centré arrière = plus maniable (dans la plage constructeur).
- IMG : schémas avion (augmentation/diminution d'incidence, R_z, R_ze, P) → redessiner SVG.
- Destinations : C ; F « La stabilité longitudinale » ; D : stabilité longitudinale, empennage déporteur, couple cabreur/piqueur ; S ; Q.

### Page 91 — Stabilité statique transversale (dièdre, flèche)

- Notions : **stabilité transversale** (roulis/lacet, petites variations de dérapage/inclinaison) ; **effet de dièdre** (dérapage positif ⇒ incidence aile droite ↑, gauche ↓ ⇒ roulis à gauche ; dièdre positif stabilise) ; **effet de la flèche** (dérapage positif : composante perpendiculaire de l'aile droite > gauche ⇒ portance aile droite > ⇒ roulis à gauche ; flèche inversée ⇒ effet inversé).
- IMG : schémas « étude du dièdre » (Vt/Vp) ; « effet de la flèche » (Vpar/Vper) → redessiner SVG.
- Destinations : C ; F « La stabilité transversale » ; D : stabilité transversale, effet de dièdre, effet de flèche ; S ; Q.

### Page 92 — Position des ailes + dérive + tableau des dièdres

- Notions : **position des ailes** (aile basse : dérapage à droite ⇒ surpression extrados aile droite ⇒ roulis à droite ; aile haute ⇒ roulis à gauche) ; **la dérive** (dérapage à droite ⇒ force aéro vers la gauche ⇒ rotation en lacet réduisant le dérapage) ; tableau : Droite+Haute = dièdre quasi nul ; Droite+Basse = positif ; Flèche+Basse = faible positif ; Flèche+Haute = fort positif.
- IMG : schémas surpression/dépression selon position d'aile ; dérive → redessiner SVG ; tableau → HTML.
- Destinations : C ; F « La stabilité transversale » ; D : aile haute/basse, dérive/stabilité de route ; S ; Q ; **FR (fiche de révision « Stabilité : dièdre, flèche, position d'aile »)**.

## Chapitre 17 — Décollage et atterrissage (p. 93–…)

### Page 93 — Ouverture chapitre 12 « Décollage et Atterrissage »

- Citation humoristique (échange contrôleur/pilote).
- IMG : photo Concorde Air France au décollage (**tierce → droits à vérifier**, remplacer par photo libre — Concorde très documenté sur Wikimedia).
- Destination : ∅ / IMG (recherche libre).

### Page 94 — Le décollage

- Notions : c'est la **vitesse par rapport à la masse d'air** qui compte ; **décollage face au vent** (manche à air/biroutte ; V_R = vitesse avion + vent ⇒ distance de roulage réduite) ; **décollage vent arrière** (V_R = vitesse avion − vent ⇒ distance rallongée, danger) ; **décollage décortiqué** : roulement → rotation → assiette de montée → quitte le sol → **fin du décollage au passage des 15 m** ; la longueur de roulage **augmente avec l'altitude et la température** ; les volets réduisent la vitesse de décollage.
- IMG : schémas décollage vent de face / vent arrière → redessiner SVG.
- Destinations : C (Module 15) ; F « Le décollage » ; D : vent de face, vent arrière, manche à air/biroutte, vitesse de rotation, distance de roulage ; S ; Q ; EX. **À VÉRIFIER** : « 15 m » (convention de fin de décollage — 15 m / 50 ft, sourcer).

### Page 95 — Décollage décortiqué + influence du vent sur la montée

- Notions : séquence **a→e** : (a) plein gaz + lâcher les freins ; (b) accélération (lever de queue pour trains classiques) ; (c) décollage ; (d) prise de vitesse (vouloir monter trop vite ⇒ risque de passer sous la vitesse de décrochage) ; (e) mise en montée, **passage des 15 m = fin du décollage** ; **influence du vent sur la pente de montée** (angle de montée / franchissement d'obstacle).
- IMG : séquence décollage a→e (avec crash en d) ; schéma angle de montée face au vent → redessiner SVG.
- Destinations : C ; F « Le décollage » ; S ; Q ; EX.

### Page 96 — L'atterrissage

- Notions : atterrissage **face au vent** ; pente finale stabilisée à la vitesse d'atterrissage ; réduction moteur + sortie du train + crans de volets/becs (rester au-dessus de la vitesse de décrochage) ; séquence **a→d** : (a) **arrondi** (cabrer pour tangenter le sol) ; (b) réduction complète de puissance (la portance décroît doucement) ; (c) relever le nez pour poser le **train principal** en premier (léger décrochage) ; (d) décélération/roulage ; pleins volets réduisent la vitesse d'approche ; distance d'atterrissage **augmente avec l'altitude et la température**.
- IMG : séquence atterrissage a→d → redessiner SVG.
- Destinations : C ; F « L'atterrissage » ; D : arrondi, pente finale, vitesse d'approche, toucher des roues ; S ; Q ; EX.

## Chapitre 18 — Annexes (p. 97–99)

### Page 97 — Ouverture chapitre 13 « Annexes »

- IMG : photo **tourbillon marginal** matérialisé par fumée rouge derrière un avion (célèbre cliché **NASA Langley** — **domaine public probable**, à vérifier ; excellent visuel pour « traînée induite / turbulence de sillage »).
- Destination : IMG (illustration F « Traînée induite »).

### Page 98 — Annexe : ailerons, volets, becs à fente

- Notions (rappel/synthèse) : dièdre positif/négatif/nul ; **ailerons** (extrémité d'aile, braquage inverse, roulis) ; **volets hypersustentateurs** (près du fuselage, symétriques, vol basse vitesse) ; **3. dispositifs de bord d'attaque** — **3.1 bec à fente** (retarde le décollement de la couche limite laminaire sur l'extrados ; la pression d'intrados passe par la fente et redonne de l'énergie) ; **3.2 bec à fente automatique** (à vitesse élevée plaqués, se déploient par dépression locale à incidence élevée ; ex. **Morane-Saulnier Rallye**).
- Média : « Galerie 13.1 » (capture d'écran de l'iBook C.A.001 — **auto-référence, à ne pas republier telle quelle**) ; « Vidéo 3.3 Volets hypersustentateurs » (externe) ; photo bec automatique Rallye (tierce).
- IMG : schéma bec à fente → redessiner SVG.
- Destinations : C ; F « Les becs (slats) » ; D : bec à fente, bec automatique, dièdre ; S ; Q.

### Page 99 — Annexe : anecdote « Gagner du kérosène »

- Notions : anecdote (article Le Figaro/AFP, 14/10/2009) — All Nippon Airways invite les passagers à passer aux toilettes avant l'embarquement pour réduire le poids (≈ 4,2 t de CO₂/mois économisées sur un test d'un mois, 38 vols).
- IMG : **capture d'écran d'un article Le Figaro** (**COPYRIGHT presse → ne pas republier ; reformuler l'anecdote et citer la source**).
- Destinations : (facultatif) encadré « le saviez-vous » lié à F « L'allongement / la consommation » — anecdote reformulée, non prioritaire. **À VÉRIFIER** : réactualiser (info datée de 2009).

---

## Synthèse de l'inventaire

- **Pages PDF analysées : 100 / 100** (couverture + 99 pages numérotées ; **0 page non traitée**).
- **13 chapitres source** : 1 Rappels de physique · 2 Aérodynamique/fluides · 3 Souffleries · (résistance de l'air) · 4 Surface portante/portance-traînée · (couche limite) · (polaire/finesse) · (hypersustentateurs) · 5 Résultante aérodynamique · 6 Contrôler l'avion (axes/gouvernes) · 7 Cas de vol · 8 Cas de vol approfondis · 9 Décrochage · 10 Effets aérodynamiques et stabilité · 11 Points particuliers (centrage) · 12 Décollage/atterrissage · 13 Annexes.
- **Formules recensées (≈30)** : P=F/S ; P_B−P_A=ρgh ; P_d=½ρv² ; P_T=P_s+½ρv² ; Q=V·S ; Bernoulli (½ρV₁²+P_s1=…) ; R=½ρV²S·K ; F_R=½ρV²S·C_R ; F_z=½ρV²S·C_z ; F_x=½ρV²S·C_x ; λ=L²/S_a ; Re=ρvD/η ; f=C_z/C_x=V_x/V_z=D/Δz ; pente=arctan(1/f) ; ΣF=0⇔V=cste ; ΣF=M·a ; F(A/B)=−F(B/A) ; g=9,81 ; R_z=mg·cos φ ; T=R_x±mg·sin φ ; n=1/cos φ ; tan φ=V²/(R·g) ; R=V²/(g·tan φ) ; V_S=√(2P/(ρS·C_z max)) ; V_S(nG)=V_S(1G)·√n ; taux=°/s ; M_z=−½ρSV²C_z(d−x).
- **Médias externes (vidéos/galeries/liens ≈18)** : à retrouver/remplacer ou recréer nativement (aucune republication de vidéo tierce).
- **Visuels à statut juridique problématique** : dessin Gotlib (p.1-bis), image Yoda/Star Wars (p.46), captures vidéo « blason Pau » (Immaculée Conception, p.7/22/38/53…), photo Dacia soufflerie (p.15), capture Le Figaro (p.99), vignettes winglets constructeurs (p.23), auto-capture iBook C.A.001 (p.98) → **redessiner / remplacer par des sources libres**.
- **Photos potentiellement libres à vérifier** : F-16 Thunderbirds (couv.), F-22 (p.64), tourbillon NASA (p.97), Rafale (p.39), Concorde (p.93) → vérifier licence (USAF/NASA = domaine public probable) avant réutilisation créditée.

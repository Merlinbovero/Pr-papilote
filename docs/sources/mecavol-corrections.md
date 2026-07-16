# Registre des corrections scientifiques — « Mécanique du Vol » (M.V. 001)

> Le PDF est une **source de départ**, pas une vérité absolue. Ce registre consigne chaque affirmation du document qui a été **corrigée, nuancée ou contextualisée** avant réutilisation, avec la formulation retenue et les sources. Principe : distinguer clairement **donnée scientifique**, **simplification BIA** (niveau introductif assumé) et **approfondissement**.
>
> Colonne « révision » : ⏳ = affirmation à revérifier périodiquement (valeur susceptible d'évoluer : flotte, réglementation, chiffres constructeur).

## C1 — Masse volumique de l'air

- **Affirmation d'origine (p.10)** : « Masse volumique ρ ≈ 1,3 kg/m³ ».
- **Problème** : valeur arrondie. La référence normalisée (atmosphère standard ISA) est **1,225 kg/m³ à 15 °C au niveau de la mer**.
- **Formulation retenue** : « ρ ≈ **1,225 kg/m³** dans l'atmosphère standard au niveau de la mer (souvent arrondi à 1,3 kg/m³ pour les calculs de tête) ». La valeur 1,3 est présentée comme **simplification de calcul**, pas comme donnée.
- **Sources** : atmosphère type OACI (ISA) ; manuels DGAC/ENAC.

## C2 — Part de la portance due à la dépression d'extrados

- **Affirmation d'origine (p.20)** : « Les forces de dépression d'extrados assurent **70 %** de la portance ».
- **Problème** : ordre de grandeur souvent cité mais **variable** selon le profil, l'incidence et le régime ; présenté comme une constante.
- **Formulation retenue** : « la **dépression d'extrados fournit la majeure partie** de la portance (nettement plus que la surpression d'intrados) ; l'ordre de grandeur souvent avancé est d'environ deux tiers, mais il dépend du profil et de l'incidence ». Pas de chiffre présenté comme exact.
- **Sources** : ONERA / manuels d'aérodynamique.

## C3 — Gain des winglets (incohérence interne)

- **Affirmation d'origine** : « winglets → **3,5 %** d'autonomie » (p.6) **vs** « **4 %** sur Airbus long-courrier équipé de Sharklets » (p.22).
- **Problème** : deux chiffres différents dans le même document ; valeurs commerciales datées.
- **Formulation retenue** : « les dispositifs de bout d'aile (winglets/Sharklets) réduisent la traînée induite et permettent un gain de consommation de l'ordre de **quelques pour cent** (Airbus annonce jusqu'à ~4 % pour les Sharklets) ». Chiffre unique, borné, attribué au constructeur. ⏳
- **Sources** : communication Airbus (Sharklets) — à re-sourcer/actualiser.

## C4 — Interprétation de la portance par Bernoulli

- **Affirmation d'origine (chap. 2-4)** : la portance est expliquée **uniquement** par Bernoulli (dépression d'extrados via l'accélération de l'air).
- **Problème** : l'explication « chemin plus long donc air plus rapide sur l'extrados » sous-entend souvent l'**erreur du temps de parcours égal** (« equal transit time »), physiquement fausse. Bernoulli est un bon modèle descriptif mais **partiel**.
- **Formulation retenue** : Bernoulli conservé comme **modèle d'introduction BIA** (relation vitesse ↑ ⇒ pression ↓), **sans** l'argument du temps de parcours. Ajout d'un bloc **« Pour aller plus loin »** : la portance résulte aussi de la **déviation de l'air vers le bas** (3ᵉ loi de Newton) ; les deux lectures sont complémentaires. Ne jamais écrire que « l'air se rejoint au bord de fuite en même temps ».
- **Sources** : NASA Glenn (« Incorrect Theory of Lift » / « Newton's third law and lift ») ; ONERA.

## C5 — Étude de cas « planeur Air Transat » (vol TS236)

- **Affirmation d'origine (p.31-32)** : récit narratif du vol Air Transat 236 (A330, 2001), chiffres de vol plané.
- **Problème** : narratif non sourcé, dates/chiffres à vérifier.
- **Formulation retenue** : étude de cas **reformulée**, chiffres alignés sur le **rapport officiel d'enquête** (GPIAA Portugal / soutien TSB Canada) : A330-243 C-GITS, 24 août 2001, panne sèche des deux moteurs, vol plané puis atterrissage à Lajes (Terceira, Açores). Ne conserver que les faits confirmés par le rapport. ⏳
- **Sources** : rapport GPIAA (Portugal), rapport BEA/TSB — **à consulter avant publication de la fiche « étude de cas »**.

## C6 — Anecdote « gagner du kérosène » (ANA)

- **Affirmation d'origine (p.99)** : article Le Figaro/AFP (14/10/2009) — passagers invités aux toilettes avant embarquement.
- **Problème** : anecdote **datée (2009)**, capture presse sous copyright.
- **Décision** : **écartée** de la production prioritaire. Si réutilisée un jour, la **reformuler** (pas de capture) et la présenter comme une anecdote historique datée. ⏳
- **Sources** : —.

## C7 — Valeurs présentées comme « exemples » (ordres de grandeur)

Ces valeurs sont **conservées mais explicitement marquées comme exemples/ordres de grandeur**, pas comme normes générales :

| Affirmation d'origine                                            | Traitement                                                            |
| ---------------------------------------------------------------- | --------------------------------------------------------------------- |
| Braquage volets décollage « 10–15° », approche « 20–40° » (p.37) | « ordres de grandeur, variables selon l'avion »                       |
| PHR Airbus 300 : « 3° à cabrer / 12° à piquer » (p.84)           | « exemple sur un type donné » ⏳                                      |
| Sortie auto des spoilers « vitesse roues > 85 kt » (p.45)        | « exemple type Airbus » ⏳                                            |
| Fin du décollage « au passage des 15 m » (p.94-95)               | à relier à la convention **15 m ≈ 50 ft** (franchissement d'obstacle) |
| Navette spatiale « 73 tonnes », « finesse d'un éléphant » (p.44) | anecdotique, conservé comme image                                     |
| Poids d'exemple « 45 000 N » (p.4)                               | exemple de calcul, conservé                                           |

## C8 — Programme officiel BIA et lois de Newton

- **Affirmation d'origine (p.2)** : « Bien qu'elles ne soient pas au programme du BIA, les lois de Newton permettent de comprendre… ».
- **Problème** : formulation à confronter au **programme officiel BIA en vigueur**. La mécanique du vol et l'aérodynamique **sont** au programme ; les lois de Newton y servent d'outil de compréhension.
- **Formulation retenue** : présenter les lois de Newton comme un **socle de compréhension** (niveau « comprendre »), en précisant que le BIA attend surtout leurs **conséquences** (équilibre des forces, action-réaction, inertie) plutôt que leur énoncé formel. ⏳ (revérifier au programme officiel / annales).
- **Sources** : programme officiel BIA (Éducation nationale / SIA), annales BIA.

## C9 — Sens des effets moteur (souffle, couple, gyroscopique)

- **Affirmation d'origine (p.77-81)** : sens des effets donnés pour « hélice tournant dans le sens des aiguilles d'une montre vue de la place pilote ».
- **Problème** : le sens dépend du **sens de rotation de l'hélice** ; risque d'être présenté comme universel.
- **Formulation retenue** : toujours **conditionner** l'énoncé (« pour une hélice tournant dans le sens horaire vue du pilote… ») et rappeler que le sens s'inverse pour une hélice antihoraire.
- **Sources** : manuels DGAC/ENAC (effets moteur).

## C10 — Position du foyer

- **Affirmation d'origine (p.87-88)** : foyer « à x = 0,26 » (démonstration NACA 2412), « ~¼ de corde », « quasi identique pour tous les profils ».
- **Problème** : valeur exacte (0,26) issue d'un profil particulier ; à présenter comme **approximation**.
- **Formulation retenue** : « en régime subsonique, le foyer se situe **approximativement au quart de la corde (~25 %)** à partir du bord d'attaque, quel que soit le profil ». La valeur 0,26 est présentée comme le **résultat de l'exemple NACA 2412**.
- **Sources** : manuels d'aérodynamique (foyer / coefficient de moment).

---

### Affirmations à révision périodique (⏳ récapitulatif)

C3 (gain winglets), C5 (données vol TS236), C6 (anecdote datée), C7 (valeurs constructeur PHR/spoilers), C8 (programme BIA), — à revérifier au moins une fois par an ou à chaque évolution réglementaire/constructeur.

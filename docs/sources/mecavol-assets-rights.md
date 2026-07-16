# Registre des droits des visuels — « Mécanique du Vol » (M.V. 001)

> Le PDF sert de **matériau de travail**. Aucun visuel n'est republié si ses droits ne sont pas clairement compatibles. Décision par visuel : **utiliser** (source libre vérifiée, créditée) · **remplacer** (photo libre équivalente) · **redessiner** (schéma SVG original) · **abandonner**.
>
> Règle générale : **tous les schémas pédagogiques du PDF sont redessinés en SVG original** (aucune extraction) ; **toutes les photos** sont remplacées par des ressources libres créditées (Wikimedia Commons, NASA, DVIDS, ministère des Armées) ou abandonnées.

## Visuels COPYRIGHT — ne jamais republier

| Page              | Description                                          | Origine                                    | Décision                                                                       |
| ----------------- | ---------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------ |
| 1-bis             | Dessin Newton + pomme                                | **Gotlib** (BD)                            | **abandonner** — remplacer par une illustration originale ou aucune            |
| 46                | Image de Yoda                                        | **Star Wars / Lucasfilm**                  | **abandonner**                                                                 |
| 7, 22, 38, 53, 67 | Captures vidéo « blason Pau / Immaculée Conception » | Établissement scolaire (vidéos tierces)    | **redessiner** l'idée (schéma) ou **abandonner** ; ne pas republier la capture |
| 15                | Dacia Duster en soufflerie                           | Constructeur (Renault/Dacia)               | **remplacer** par une photo libre de soufflerie / abandonner                   |
| 23                | Vignettes de winglets d'avions                       | Constructeurs                              | **remplacer** par photo(s) libre(s) Wikimedia + schéma SVG                     |
| 98                | Auto-capture de l'iBook « C.A.001 »                  | Auto-référence (même auteur, format iBook) | **abandonner** — recréer le contenu nativement                                 |
| 99                | Capture d'article Le Figaro                          | **Presse (Le Figaro/AFP)**                 | **abandonner** — reformuler l'anecdote, citer la source en texte               |
| 59, 62, 63        | Photos de cockpits / instruments (bille-aiguille)    | Tierces, non identifiées                   | **redessiner** (schémas SVG d'instruments)                                     |
| 68, 88            | Planeurs de voltige / illusion de chaise             | Tierces, non identifiées                   | **remplacer** (Wikimedia) ou **abandonner**                                    |

## Photos potentiellement libres — VÉRIFIER puis créditer

| Page  | Description                       | Piste de licence                                            | Décision                                                                  |
| ----- | --------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| Couv. | F-16 Thunderbirds en vol inversé  | **U.S. Air Force** → domaine public probable                | **utiliser** après vérification Wikimedia + crédit (auteur, licence, URL) |
| 39    | Rafale fumigènes                  | Armée de l'Air (cliché officiel ?)                          | **vérifier** ; sinon remplacer par photo libre créditée                   |
| 64    | F-22 (cône de vapeur)             | **U.S. Air Force** → domaine public probable                | **utiliser** après vérification                                           |
| 93    | Concorde Air France au décollage  | Wikimedia (Concorde très documenté)                         | **remplacer** par un cliché libre Wikimedia crédité                       |
| 97    | Tourbillon marginal (fumée rouge) | **NASA Langley** (cliché célèbre) → domaine public probable | **utiliser** après vérification (excellent visuel « traînée induite »)    |

> Note : « domaine public probable » n'autorise pas la republication tant que la source exacte (page Wikimedia Commons + mention de licence) n'est pas confirmée. Chaque photo réutilisée reçoit : titre, alt, auteur, licence, URL source, date de vérification, point focal responsive — comme les photos déjà présentes dans le projet (`src/lib/photos.ts`, page `/credits-photos`).

## Schémas scientifiques — REDESSINER (SVG original)

Tous les schémas du PDF sont **recréés en SVG original** (héritage `currentColor` pour le thème clair/sombre, cf. `src/components/content/fiche-figure.tsx`), sans reproduire la mise en page ancienne. Liste complète des ~60 schémas dans `docs/sources/mecavol-audit.md` §4 et `mecavol-inventaire.md` (colonne IMG). Les schémas **interactifs** (polaire, profil, aéronef, Venturi, centrage…) sont développés comme composants React/SVG natifs (cf. framework d'interactions, Lot 2F).

## Tableaux à retranscrire

| Page | Tableau                          | Traitement                                                        |
| ---- | -------------------------------- | ----------------------------------------------------------------- |
| 87   | NACA 2412 (foyer, C_z·(d−x))     | retranscrit en tableau HTML/DataGrid original, données factuelles |
| 61   | Glissade extérieure / intérieure | retranscrit en tableau HTML original                              |

## Médias externes (vidéos, galeries, liens)

Les ~18 renvois vidéo/galerie/lien du PDF (« Vidéo x.y », « Galerie x.y », liens « ici ») pointent vers des ressources tierces, souvent mortes. **Aucune vidéo tierce n'est téléchargée ni republiée.** Chaque renvoi est :

- soit **remplacé par une interaction native** (polaire, Venturi, aéronef… — Lot 2F et suivants) ;
- soit **synthétisé en texte original** (transcription/résumé) avec, si la ressource existe encore et le permet, un simple lien sortant.

## Traçabilité

Chaque contenu produit conserve, dans son registre interne (`mecavol-inventaire.md`) ou ses métadonnées, les **pages du PDF** d'origine et les **sources externes** de vérification. Les sources importantes restent **visibles sur les fiches** (bloc sources). Les crédits photo restent centralisés (`/credits-photos`).

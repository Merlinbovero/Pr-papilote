# Application installable (PWA) et icône

Le site est installable comme une application : sur iPhone (Safari →
Partager → **Sur l'écran d'accueil**), sur Android/desktop Chrome
(**Installer l'application**). L'icône ouvre le site en plein écran, sans
barre d'adresse, et reflète toujours la dernière version en ligne.

## Fichiers en jeu

- `src/app/manifest.ts` — nom, couleurs, écran de démarrage, liste des
  icônes. C'est le manifeste web ; il ne change qu'en cas d'évolution du
  nom ou des couleurs.
- `src/app/layout.tsx` — balises Apple (`appleWebApp`) et couleur de thème.
- `public/` — les **images d'icône** (c'est ce qu'on remplace) :
  - `icon-192.png` — 192×192, coins arrondis, fond plein.
  - `icon-512.png` — 512×512, idem (magasins, grandes tailles).
  - `icon-maskable-512.png` — 512×512, **plein cadre sans arrondi** : le
    système applique lui-même le masque ; garder le motif dans les 80 %
    centraux (zone de sécurité).
  - `apple-touch-icon.png` — 180×180, plein cadre : iOS arrondit lui-même.
  - `logo-mark.png` — 128×128, écu sur **tuile blanche arrondie**, affiché
    dans l'en-tête du site à côté du nom.

L'icône est le **logo officiel** : l'écu tricolore à trois quartiers
(ancre + vagues = aéronavale ; oiseau tricolore = Air & Espace ;
hélicoptère + montagnes = ALAT), centré sur fond blanc. La pastille
`logo-mark.png` (écu sur tuile blanche arrondie) sert aussi dans l'en-tête.

## Remplacer l'icône par une nouvelle version

Pour poser une nouvelle version du logo, il suffit de **régénérer ces PNG**.

1. Fournir le logo en carré, idéalement un **SVG** ou un PNG ≥ 512×512.
2. Décliner aux quatre tailles ci-dessus (fond plein pour les versions
   `maskable` et `apple`, motif centré dans la zone de sécurité).
3. Écraser les fichiers de `public/` en gardant **exactement les mêmes
   noms**. Aucune autre modification n'est nécessaire : le manifeste et les
   métadonnées pointent déjà dessus.

Astuce : demander la régénération à l'assistant en joignant le logo — il
produit les quatre PNG aux bons formats et zones de sécurité.

## Vérifier

Après déploiement, ouvrir le site sur téléphone et « ajouter à l'écran
d'accueil ». L'icône, le nom court (**PrépaPilote**) et l'ouverture plein
écran doivent apparaître. Sur desktop Chrome, une invite d'installation
apparaît dans la barre d'adresse.

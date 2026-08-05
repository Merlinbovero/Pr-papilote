# Revue visuelle des pilotes C2

`avant/` conserve les rendus de C2, avant l'élévation du standard menée en
C2-bis. Les fichiers à la racine du dossier sont l'état courant.

Dix captures, deux croquis × cinq conditions : clair et sombre à 390 px, clair
et sombre en largeur bureau, et une simulation noir et blanc.

Elles sont **versionnées** (344 Ko au total) pour une raison précise : le
conteneur de travail a déjà été réinitialisé plusieurs fois pendant ce chantier,
et une revue visuelle qui n'existe que dans un rapport disparaît avec lui. Ces
fichiers sont la seule trace consultable de ce que les deux pilotes donnaient à
l'écran au moment de leur validation.

## Ce qu'elles ont trouvé, et que la mesure n'avait pas vu

La mesure automatique compare des boîtes englobantes : elle voit un
chevauchement, elle ne voit pas une **laideur**. Deux défauts sont sortis de la
capture, pas du calcul :

1. **Les libellés débordaient de leurs boîtes** sur `chaine-anemobarometrique`.
   Mes estimations de largeur étaient fausses — « prise de pression statique »
   mesure 168,2 unités de `viewBox` pour une boîte de 168. Les largeurs sont
   désormais **mesurées dans le navigateur** (`getBBox`), et les boîtes sont
   passées à 190 unités.
2. **L'arc de dérive était trop discret** sur `triangle-des-vitesses` : il
   portait le jeton `--schema-grid`, décoratif, alors qu'il désigne l'angle dont
   parle le croquis. Il est passé au jeton de repère et son rayon a doublé.

## Une limite de l'environnement, non corrigée

Sur les captures, les libellés en graisse 600 aux petites tailles apparaissent
**creux**, comme détourés. C'est un artefact du conteneur headless, dont la
pile de polices ne contient pas `system-ui` et synthétise donc la graisse.
Ce n'est pas un défaut des fichiers, et cela **n'a pas pu être vérifié sur un
système réel** depuis cet environnement. À confirmer en revue humaine.

## Régénération

```
npm run build && npm start
# puis le script de capture décrit dans le rapport C2
```

Les captures ne sont pas produites par un script versionné : elles sont un
artefact de revue, pas une sortie déterministe du dépôt.

## C2-bis — ce que la revue humaine a changé

**Règle typographique refondée sur le rendu.** C2 mesurait 11 unités de
`viewBox` ; à 390 px cela donnait 7,75 puis 8,45 px effectifs. Une règle sur le
fichier ne protège rien. Le seuil porte désormais sur la **taille rendue** :
12 px effectifs pour le texte essentiel, 11 px pour le secondaire, mesurés à
390 px de viewport. Les deux pilotes passent au format canonique 420 × 240,
dont le facteur d'échelle (0,771) permet d'y satisfaire, et leurs titres
internes sont **supprimés** — la légende et le titre de section les répétaient.

**Trois défauts trouvés par l'image, invisibles à la mesure de boîtes :**

1. Une canalisation traversait un libellé sur P-4. Le contrôle de chevauchement
   compare des étiquettes entre elles, jamais une étiquette et un trait.
2. La sonde Pitot, dessinée comme un tracé ouvert, se lisait comme un crochet.
   Elle est redessinée en tube arrondi avec son ouverture frontale marquée.
3. Les arcs angulaires de P-6 étaient trop petits pour être lus ; leurs rayons
   passent de 40 et 58 à 56 et 78 unités.

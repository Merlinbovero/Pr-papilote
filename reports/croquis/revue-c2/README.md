# Revue visuelle des pilotes C2

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

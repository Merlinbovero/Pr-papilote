# Convention graphique des schémas pédagogiques

**Règle officielle (2026-07-09).** Tous les schémas de PrépaPilote suivent une **convention visuelle homogène** : une même grandeur physique garde **la même représentation** partout, pour faciliter l'apprentissage. Un schéma est un SVG original, sobre, libre de droits, stocké dans `content/schemas/` et inséré en ligne (`FicheFigure`) — ses traits héritent de `currentColor` et s'adaptent au thème clair/sombre.

## Palette (trois rôles seulement)

| Rôle                                | Couleur                 | Emploi                                                                |
| ----------------------------------- | ----------------------- | --------------------------------------------------------------------- |
| **Structure & légendes**            | `currentColor` (ink)    | contours, textes, axes principaux, matière (points)                   |
| **Grandeur mise en avant / action** | bleu `#3b82f6` (accent) | la grandeur étudiée, la force active, l'axe fléché de la variable clé |
| **Repères secondaires**             | gris `#94a3b8` (muted)  | traits d'appui, pointillés, sous-légendes                             |

Fond **transparent** (la carte `bg-card` de `FicheFigure` fournit l'arrière-plan). Jamais d'autre couleur sans justification.

## Typographie

`system-ui` — titre 14 px semi-gras, libellés 13 px, sous-texte 11 px (muted). Nombres et unités lisibles, jamais tronqués.

## Représentation homogène des grandeurs

| Grandeur                                      | Représentation constante                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| **Force** (poids, portance, traînée, poussée) | flèche vectorielle pleine ; la force étudiée en **accent**                |
| **Vitesse / écoulement de l'air**             | filet d'air = ligne fléchée (le sens est toujours indiqué)                |
| **Pression**                                  | petites flèches perpendiculaires à la surface, ou barres proportionnelles |
| **Altitude**                                  | axe vertical **fléché vers le haut**, placé à gauche, en accent           |
| **Température**                               | échelle ou valeur en °C, en ink (pas de couleur dédiée)                   |
| **Densité de l'air**                          | densité de **points** (molécules) — dense = serré, raréfié = espacé       |
| **Surface**                                   | segment ou rectangle en ink                                               |

## Marqueurs de flèche standard

Deux marqueurs par schéma : `#a` (pointe en `currentColor`) et `#ac` (pointe en accent `#3b82f6`), `orient="auto"`.

## Dimensions

`viewBox="0 0 W H"`, `width="100%" height="100%"`, `preserveAspectRatio="xMidYMid meet"`. Les valeurs `width`/`height` déclarées dans `figures[]` reprennent W et H (réservation d'espace, aucun décalage de mise en page).

## Portée

Cette convention s'applique à **tout** schéma produit désormais. Un schéma qui s'en écarte doit le justifier. Elle complète `processus-production.md` (schémas obligatoires dès que leur absence pénalise la compréhension) et le design system.

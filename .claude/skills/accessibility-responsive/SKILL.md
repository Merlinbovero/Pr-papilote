---
name: accessibility-responsive
description: Accessibilité (WCAG) et responsive mobile/tablette/desktop. Utiliser lors de la création de toute interface interactive, formulaire, navigation ou média.
---

# Accessibility & Responsive

## Accessibilité — checklist par composant

- **HTML sémantique d'abord** : `nav`, `main`, `header`, `footer`, `section` + titres hiérarchisés ; `button` pour une action, `a`/`Link` pour une navigation — jamais de `div onClick`.
- Les primitives Radix (via shadcn/ui) gèrent focus, ARIA et clavier : les utiliser au lieu de réimplémenter (Dialog, DropdownMenu, Tabs…).
- Formulaires : chaque champ a un `Label` associé ; erreurs annoncées (les composants `field.tsx` le font) ; jamais un placeholder comme seul libellé.
- Images : `alt` descriptif, ou `alt=""` si décorative. Icônes seules : `aria-label` sur le bouton + `aria-hidden` sur l'icône.
- Navigation clavier complète : ordre de tabulation logique, focus visible (`focus-visible:ring` — inclus dans les primitives), pas de piège de focus.
- Contraste AA : 4.5:1 texte, 3:1 grand texte et éléments d'interface — vérifier dans les DEUX thèmes.
- Cibles tactiles ≥ 44×44 px sur mobile.
- `prefers-reduced-motion` respecté pour toute animation (voir skill framer-motion).
- La langue du document est `lang="fr"` (à maintenir dans le layout racine).

## Responsive

- Mobile-first strict (voir skill tailwind-expert). Breakpoints : base = mobile, `md:` tablette, `lg:` desktop.
- Navigation : menu complet en desktop (`NavigationMenu`), `Sheet` + bouton hamburger accessible (`aria-expanded`) en mobile.
- Tableaux larges : envelopper dans un conteneur `overflow-x-auto`, ou basculer en liste de cartes sous `md:`.
- Jamais de scroll horizontal de page ; les schémas/SVG larges scrollent ou zooment dans leur propre conteneur.
- Texte fluide raisonnable : ajuster les tailles de titres par breakpoint (`text-2xl md:text-4xl`), pas de `vw` brut.

## Vérification

- Tests Testing Library : requêtes par rôle (`getByRole`) — elles échouent si la sémantique est mauvaise.
- Test rapide : parcourir la page uniquement au clavier ; vérifier l'arbre d'accessibilité dans les DevTools.
- Lighthouse (catégorie Accessibility) ≥ 95 sur les pages clés — voir skill performance-optimizer pour la commande.

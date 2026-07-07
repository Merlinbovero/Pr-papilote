---
name: framer-motion
description: Animations fluides avec Framer Motion — transitions de pages, animations de dashboard, micro-interactions. Utiliser dès qu'un mouvement, une transition ou une animation est demandé.
---

# Framer Motion

`framer-motion` v12 est installé. Les composants animés sont forcément des Client Components (`"use client"`) : isoler l'animation dans un petit composant feuille plutôt que rendre la page entière cliente.

## Modèles à suivre

- **Apparition en cascade** (listes, grilles de cartes de dashboard) : parent `variants` + `staggerChildren: 0.05–0.08`, enfants `{ opacity: 0, y: 8 }` → `{ opacity: 1, y: 0 }`.
- **Apparition au scroll** : `whileInView={{ opacity: 1, y: 0 }}` + `viewport={{ once: true, margin: "-80px" }}`.
- **Micro-interactions** : `whileHover={{ scale: 1.02 }}` et `whileTap={{ scale: 0.98 }}` sur les éléments cliquables ; rester subtil (≤ 1.05).
- **Entrées/sorties** (modales, onglets, filtres) : `<AnimatePresence mode="wait">` + prop `key` stable.
- **Transitions partagées** : `layoutId` pour les indicateurs d'onglet actif et les cartes qui s'étendent.
- **Compteurs animés** (statistiques de dashboard) : `useMotionValue` + `animate()` + `useTransform` pour formater.

## Règles de qualité

- Durées courtes : 0.15–0.3 s pour les micro-interactions, 0.4–0.6 s pour les entrées de sections. Easing : `easeOut` en entrée, `easeIn` en sortie, ou `type: "spring", stiffness: 300, damping: 30`.
- **N'animer que `transform` et `opacity`** (compositables GPU). Jamais `width`/`height`/`top`/`left` ; pour les tailles, utiliser `layout`.
- **Accessibilité obligatoire** : respecter `prefers-reduced-motion` via `useReducedMotion()` ou envelopper l'app dans `<MotionConfig reducedMotion="user">` — à faire dans un provider client global.
- Centraliser les variants réutilisés dans `src/lib/motion.ts` (ex. `fadeInUp`, `staggerContainer`) pour la cohérence.
- Une animation doit avoir un rôle (hiérarchie, feedback, continuité) ; pas de décoration gratuite qui ralentit la lecture.

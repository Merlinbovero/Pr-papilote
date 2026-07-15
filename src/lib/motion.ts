import type { Transition, Variants } from "framer-motion";

/**
 * Bibliothèque d'animations commune (design system, § animations).
 *
 * Toute animation Framer Motion du site puise ici : durées, courbes et
 * variants partagés. Une animation ad hoc dans un composant est un
 * défaut de revue. Rappels de doctrine (docs/ui-framework.md) :
 * transform/opacity uniquement, `useReducedMotion` ou <MotionConfig
 * reducedMotion="user"> obligatoire au niveau du provider.
 */

/** Durées officielles (secondes). Micro = feedback ; entrée = apparitions. */
export const DURATIONS = {
  micro: 0.15,
  short: 0.2,
  entrance: 0.3,
} as const;

/** Courbes officielles : ease-out en entrée, ease-in en sortie. */
export const TRANSITIONS = {
  enter: { duration: DURATIONS.entrance, ease: "easeOut" } satisfies Transition,
  exit: { duration: DURATIONS.short, ease: "easeIn" } satisfies Transition,
  micro: { duration: DURATIONS.micro, ease: "easeOut" } satisfies Transition,
} as const;

/** Apparition discrète vers le haut — sections, cartes, résultats. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: TRANSITIONS.enter },
};

/** Simple fondu — contenus dont le déplacement serait du bruit. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: TRANSITIONS.enter },
};

/** Conteneur en cascade : parent des listes/grilles (enfants en fadeInUp). */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

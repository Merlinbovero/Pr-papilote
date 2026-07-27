/**
 * Structure de la navigation principale — données pures, sans rendu.
 *
 * Six entrées de premier niveau : les **trois concours** (ce que les visiteurs
 * cherchent réellement — personne ne tape « concours », on tape « EOPAN ») puis
 * les **trois modules transverses**. Les outils qui ne sont pas un module
 * (BIA, anglais, dictionnaire, cartes, veille, lectures, révision) sont rangés
 * dans le menu du domaine qu'ils servent : rien n'est retiré du header.
 *
 * Un test (`navigation.test.ts`) vérifie que chaque lien pointe vers une route
 * réelle — soit une page de `src/app`, soit un couple module/catégorie déclaré
 * dans les référentiels. La navigation ne peut donc pas dériver du contenu.
 */

/** Icône d'un outil transverse (les catégories de module n'en portent pas). */
export type NavIconName =
  | "training"
  | "exam"
  | "language"
  | "dictionary"
  | "map"
  | "video"
  | "book"
  | "repeat"
  | "timer"
  | "compass"
  | "dominos"
  | "camera"
  | "calculator"
  | "shapes"
  | "keyboard"
  | "gauge";

export interface NavLink {
  href: string;
  label: string;
  description: string;
  /** Outil transverse : affiché avec une icône plutôt qu'avec la pastille du module. */
  icon?: NavIconName;
}

export interface NavSection {
  /** Libellé court affiché dans la barre — doit rester bref, la place est comptée. */
  label: string;
  /** Nom complet, affiché en tête du menu déroulant. */
  fullName: string;
  /** Page d'accueil de la section. */
  href: string;
  /** Slug de module, pour la pastille de couleur de l'armée. */
  accentSlug: string;
  links: NavLink[];
}

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    label: "EOPAN",
    fullName: "EOPAN — Marine nationale",
    href: "/eopan",
    accentSlug: "eopan",
    links: [
      {
        href: "/eopan/selection",
        label: "Parcours de sélection",
        description: "Les étapes, de la candidature à l’admission",
      },
      {
        href: "/eopan/appareils",
        label: "Appareils",
        description: "Rafale M, NH90, Atlantique 2…",
      },
      {
        href: "/eopan/unites",
        label: "Flottilles et unités",
        description: "Qui vole sur quoi, et où",
      },
      {
        href: "/eopan/ban",
        label: "Bases d’aéronautique navale",
        description: "Landivisiau, Lann-Bihoué, Hyères…",
      },
      { href: "/eopan/grades", label: "Grades", description: "Hiérarchie et équivalences" },
      {
        href: "/eopan/missions",
        label: "Missions",
        description: "Ce que fait l’aéronautique navale",
      },
      {
        href: "/entrainement/eopan",
        label: "S’entraîner EOPAN",
        description: "Quiz et séries ciblés sur le concours",
        icon: "training",
      },
      {
        href: "/cartes",
        label: "Cartes des bases",
        description: "Les implantations des trois armées",
        icon: "map",
      },
    ],
  },
  {
    label: "EOPN",
    fullName: "EOPN — Armée de l’Air et de l’Espace",
    href: "/eopn",
    accentSlug: "eopn",
    links: [
      {
        href: "/eopn/selection",
        label: "Parcours de sélection",
        description: "Les étapes et les épreuves",
      },
      { href: "/eopn/appareils", label: "Appareils", description: "Rafale, A400M, AWACS…" },
      {
        href: "/eopn/unites",
        label: "Escadrons et unités",
        description: "L’organisation des forces",
      },
      {
        href: "/eopn/bases",
        label: "Bases aériennes",
        description: "Salon, Cognac, Mont-de-Marsan…",
      },
      { href: "/eopn/grades", label: "Grades", description: "Hiérarchie et équivalences" },
      {
        href: "/eopn/missions",
        label: "Missions",
        description: "Dissuasion, projection, protection",
      },
      {
        href: "/entrainement/eopn",
        label: "S’entraîner EOPN",
        description: "Quiz et séries ciblés sur le concours",
        icon: "training",
      },
      {
        href: "/cartes",
        label: "Cartes des bases",
        description: "Les implantations des trois armées",
        icon: "map",
      },
    ],
  },
  {
    label: "ALAT",
    fullName: "ALAT — Armée de Terre",
    href: "/alat",
    accentSlug: "alat",
    links: [
      {
        href: "/alat/appareils",
        label: "Appareils",
        description: "Tigre, Caïman, Caracal, Gazelle…",
      },
      {
        href: "/alat/unites",
        label: "Régiments et unités",
        description: "Les RHC et les forces spéciales",
      },
      { href: "/alat/missions", label: "Missions", description: "Appui, transport, renseignement" },
      {
        href: "/alat/organisation",
        label: "Organisation",
        description: "Le commandement de l’ALAT",
      },
      { href: "/alat/grades", label: "Grades", description: "Hiérarchie et équivalences" },
      { href: "/alat/histoire", label: "Histoire", description: "De l’aviation légère à l’ALAT" },
      {
        href: "/entrainement/alat",
        label: "S’entraîner ALAT",
        description: "Quiz et séries ciblés sur la sélection",
        icon: "training",
      },
      {
        href: "/cartes",
        label: "Cartes des bases",
        description: "Les implantations des trois armées",
        icon: "map",
      },
    ],
  },
  {
    label: "Fondamentaux",
    fullName: "Fondamentaux aéronautiques",
    href: "/fondamentaux",
    accentSlug: "fondamentaux",
    links: [
      {
        href: "/fondamentaux/aerodynamique",
        label: "Aérodynamique",
        description: "Portance, traînée, décrochage — et les cours",
      },
      {
        href: "/fondamentaux/mecanique-du-vol",
        label: "Mécanique du vol",
        description: "Bilans de forces, stabilité, centrage",
      },
      {
        href: "/fondamentaux/meteorologie",
        label: "Météorologie",
        description: "Masses d’air, nuages, METAR",
      },
      {
        href: "/fondamentaux/navigation",
        label: "Navigation",
        description: "Caps, dérive, estime",
      },
      {
        href: "/fondamentaux/instruments",
        label: "Instruments de vol",
        description: "Anémométrie, gyroscopes, horizon",
      },
      {
        href: "/fondamentaux/facteurs-humains",
        label: "Facteurs humains",
        description: "Physiologie, illusions, vigilance",
      },
      {
        href: "/bia",
        label: "BIA — examen blanc",
        description: "Les cinq matières et l’épreuve complète",
        icon: "exam",
      },
      {
        href: "/anglais",
        label: "Anglais aéronautique",
        description: "Vocabulaire, alphabet OACI, textes",
        icon: "language",
      },
      {
        href: "/dictionnaire",
        label: "Dictionnaire",
        description: "Sigles et termes du métier",
        icon: "dictionary",
      },
      {
        href: "/reviser",
        label: "Réviser",
        description: "Révision espacée des notions vues",
        icon: "repeat",
      },
    ],
  },
  {
    label: "Psychotechnique",
    fullName: "Tests psychotechniques",
    href: "/psychotechnique",
    accentSlug: "psychotechnique",
    links: [
      {
        href: "/psychotechnique/entrainement",
        label: "Entraînement chronométré",
        description: "Dix-neuf familles d’exercices générés",
        icon: "timer",
      },
      {
        href: "/psychotechnique/secpil",
        label: "Simulateur SECPIL",
        description: "Attention partagée en temps réel",
        icon: "gauge",
      },
      {
        href: "/psychotechnique/calcul-mental",
        label: "Calcul mental",
        description: "Neuf thèmes, du format officiel aux séries sans fin",
        icon: "calculator",
      },
      {
        href: "/psychotechnique/appareils-photos",
        label: "Test des appareils photos",
        description: "Trois objectifs, une photo : lequel l’a prise ?",
        icon: "camera",
      },
      {
        href: "/psychotechnique/codage",
        label: "Test de codage",
        description: "Une grille de codes, 45 questions en 2 min 30",
        icon: "keyboard",
      },
      {
        href: "/psychotechnique/formes-imbriquees",
        label: "Test des formes imbriquées",
        description: "Un assemblage, quatre jeux de pièces : lequel est le bon ?",
        icon: "shapes",
      },
      {
        href: "/psychotechnique/dominos",
        label: "Test de dominos",
        description: "Trois niveaux, séries générées à l’infini",
        icon: "dominos",
      },
      {
        href: "/psychotechnique/orientation",
        label: "Test d’orientation",
        description: "Lire une attitude de vol en 3D",
        icon: "compass",
      },
      {
        href: "/psychotechnique/exercices",
        label: "Méthodes par famille",
        description: "Comment aborder chaque type d’épreuve",
      },
      {
        href: "/psychotechnique/methodologie",
        label: "Méthodologie générale",
        description: "Gérer le temps et la pression",
      },
    ],
  },
  {
    label: "Culture",
    fullName: "Culture & géopolitique",
    href: "/culture",
    accentSlug: "culture",
    links: [
      {
        href: "/culture/geopolitique-defense",
        label: "Géopolitique & défense",
        description: "Opérations, alliances, enjeux",
      },
      {
        href: "/culture/aviation-mondiale",
        label: "Aviation mondiale",
        description: "Les grands appareils étrangers",
      },
      {
        href: "/culture/personnalites",
        label: "Personnalités",
        description: "Guynemer, Blériot, Hélène Boucher…",
      },
      {
        href: "/culture/culture-aeronautique",
        label: "Culture aéronautique",
        description: "Repères et grands récits",
      },
      {
        href: "/veille",
        label: "Veille vidéo",
        description: "Vidéos résumées et reliées aux fiches",
        icon: "video",
      },
      {
        href: "/lectures",
        label: "Lectures",
        description: "Livres et articles résumés",
        icon: "book",
      },
    ],
  },
];

/** Tous les liens de la navigation, sections comprises. */
export function allNavHrefs(): string[] {
  return NAV_SECTIONS.flatMap((s) => [s.href, ...s.links.map((l) => l.href)]);
}

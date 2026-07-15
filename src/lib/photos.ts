/**
 * Registre des photographies du site (docs/design-system.md §photographies).
 *
 * Règle éditoriale : uniquement de vraies photos, jamais d'images générées.
 * Chaque entrée provient de Wikimedia Commons avec une licence de libre
 * réutilisation vérifiée (domaine public, CC0, CC BY, CC BY-SA) ; l'auteur,
 * la licence et la page source sont consignés ici et affichés sur
 * /credits-photos. Les fichiers sont seulement redimensionnés/compressés.
 */

export interface SitePhoto {
  /** Chemin public de l'image optimisée. */
  src: string;
  /** Description en français (attribut alt). */
  alt: string;
  /** Intitulé court pour la page des crédits. */
  title: string;
  author: string;
  license: string;
  /** Absent pour le domaine public. */
  licenseUrl?: string;
  /** Page de description du fichier sur Wikimedia Commons. */
  sourceUrl: string;
  /**
   * Point focal CSS (`object-position`) par défaut. Défaut effectif : "center".
   */
  focal?: string;
  /**
   * Point focal pour un recadrage **vertical** (carte de module, portrait) —
   * le sujet peut être ailleurs qu'en recadrage large. Défaut : `focal`.
   */
  focalCard?: string;
  /**
   * Point focal pour une **bannière large** (hero paysage). Défaut : `focal`.
   */
  focalHero?: string;
}

export const SITE_PHOTOS = {
  accueilHero: {
    src: "/images/accueil-hero.jpg",
    alt: "Rafale en livrée tricolore du Rafale Solo Display, en virage serré plein ciel",
    title: "Rafale Solo Display (2025)",
    author: "Antonin JLY",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.fr",
    sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=185879030",
  },
  eopan: {
    src: "/images/module-eopan.jpg",
    alt: "Rafale Marine train sorti au-dessus du pont d'envol d'un porte-avions",
    title: "Rafale Marine à l'appontage (2007)",
    author: "U.S. Navy — MCS3 Ron Reeves",
    license: "Domaine public",
    sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=8203930",
    // Le Rafale Marine à l'appontage est en haut à gauche du cadre.
    focal: "50% 40%",
    focalCard: "26% 40%",
    focalHero: "44% 38%",
  },
  eopn: {
    src: "/images/module-eopn.jpg",
    alt: "Rafale de l'Armée de l'Air et de l'Espace au roulage, dérive marquée « Armée de l'Air »",
    title: "Rafale de l'Armée de l'Air et de l'Espace (2023)",
    author: "U.S. Air Force — SSgt Hannah Strobel",
    license: "Domaine public",
    sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=134018270",
    // Le Rafale de l'AAE occupe le centre-droit ; cockpit vers x≈50 %.
    focal: "55% 52%",
    focalCard: "52% 50%",
    focalHero: "56% 50%",
  },
  alat: {
    src: "/images/module-alat.jpg",
    alt: "Hélicoptère de combat Tigre en vol, vu de trois quarts",
    title: "Hélicoptère Tigre en vol (2025)",
    author: "Ibex73",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/deed.fr",
    sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=169032432",
  },
  fondamentaux: {
    src: "/images/module-fondamentaux.jpg",
    alt: "Avion léger Robin DR400 en vol au-dessus du littoral atlantique",
    title: "Robin DR400 en vol",
    author: "Dylan Agbagni",
    license: "CC0",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.fr",
    sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=140570923",
  },
  psychotechnique: {
    src: "/images/module-psychotechnique.jpg",
    alt: "Tableau de bord d'un avion léger en vol au-dessus de montagnes enneigées",
    title: "Planche de bord en vol (Photo Giles Laurent)",
    author: "Giles Laurent",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.fr",
    sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=142187142",
    focal: "50% 62%",
  },
  meteo: {
    src: "/images/theme-meteo.jpg",
    alt: "Cumulus bourgeonnants photographiés depuis un avion en vol",
    title: "Cumulus en développement",
    author: "Famartin",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/deed.fr",
    sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=54622627",
  },
  histoire: {
    src: "/images/theme-histoire.jpg",
    alt: "Nord Noratlas, avion de transport militaire français historique, sur un tarmac",
    title: "Nord Noratlas",
    author: "Rob Schleiffert",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/deed.fr",
    sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=46893603",
  },
  marine: {
    src: "/images/theme-marine.jpg",
    alt: "Porte-avions Charles de Gaulle en mer, Rafale Marine sur le pont d'envol",
    title: "Porte-avions Charles de Gaulle",
    author: "U.S. Marine Corps — Maj. Joshua Smith",
    license: "Domaine public",
    sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=78656298",
  },
  espace: {
    src: "/images/theme-espace.jpg",
    alt: "Lanceur Ariane 5 sur son pas de tir",
    title: "Ariane 5 sur le pas de tir",
    author: "NASA — Bill Ingalls",
    license: "Domaine public",
    sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=113683096",
  },
} as const satisfies Record<string, SitePhoto>;

/**
 * Photo d'illustration par famille de catégorie. Les catégories partageant un
 * thème (appareils, bases, météo…) réutilisent la même photographie ; à
 * défaut de correspondance, l'appelant retombe sur la photo du module. Les
 * clés sont des slugs de catégorie tels qu'ils apparaissent dans plusieurs
 * modules (content/_referentiels/categories.json).
 */
const CATEGORY_THEME_PHOTOS: Record<string, keyof typeof SITE_PHOTOS> = {
  // Appareils et matériels
  appareils: "eopn",
  helicopteres: "alat",
  navires: "marine",
  ban: "marine",
  // Bases et implantations
  bases: "eopn",
  // Sélection et pilotage
  selection: "psychotechnique",
  instruments: "psychotechnique",
  "radio-communications": "psychotechnique",
  navigation: "psychotechnique",
  cartographie: "psychotechnique",
  // Sciences du vol
  aerodynamique: "fondamentaux",
  "mecanique-du-vol": "fondamentaux",
  performances: "fondamentaux",
  physique: "fondamentaux",
  // Météo
  meteorologie: "meteo",
  // Histoire et culture
  histoire: "histoire",
  "culture-aeronautique": "histoire",
  personnalites: "histoire",
  // Espace (fondamentaux)
  // (rattaché via catégories spécifiques si présentes)
};

/** Photo d'illustration d'un module, par slug (accueil et hubs). */
export function getModulePhoto(slug: string): SitePhoto | undefined {
  const bySlug: Record<string, SitePhoto> = {
    eopan: SITE_PHOTOS.eopan,
    eopn: SITE_PHOTOS.eopn,
    alat: SITE_PHOTOS.alat,
    fondamentaux: SITE_PHOTOS.fondamentaux,
    psychotechnique: SITE_PHOTOS.psychotechnique,
  };
  return bySlug[slug];
}

/**
 * Photo d'en-tête d'une catégorie : la photo thématique de la famille si elle
 * existe, sinon la photo du module. Garantit qu'aucune page de catégorie n'est
 * sans visuel (retour V1 : « photos partout »).
 */
export function getCategoryPhoto(moduleSlug: string, categorySlug: string): SitePhoto | undefined {
  const themeKey = CATEGORY_THEME_PHOTOS[categorySlug];
  if (themeKey) {
    return SITE_PHOTOS[themeKey];
  }
  return getModulePhoto(moduleSlug);
}

/** Toutes les photos, pour la page des crédits. */
export function getAllSitePhotos(): SitePhoto[] {
  return Object.values(SITE_PHOTOS);
}

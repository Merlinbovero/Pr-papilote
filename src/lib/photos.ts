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
  },
  eopn: {
    src: "/images/module-eopn.jpg",
    alt: "Rafale de l'Armée de l'Air et de l'Espace au roulage, dérive marquée « Armée de l'Air »",
    title: "Rafale de l'Armée de l'Air et de l'Espace (2023)",
    author: "U.S. Air Force — SSgt Hannah Strobel",
    license: "Domaine public",
    sourceUrl: "https://commons.wikimedia.org/w/index.php?curid=134018270",
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
  },
} as const satisfies Record<string, SitePhoto>;

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

/** Toutes les photos, pour la page des crédits. */
export function getAllSitePhotos(): SitePhoto[] {
  return Object.values(SITE_PHOTOS);
}

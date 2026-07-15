import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/**
 * Directives d'indexation (SEO — ch. 9 §7). Le contenu documentaire est
 * ouvert ; l'espace personnel, l'authentification et les prévisualisations
 * internes sont exclus de l'indexation.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/progression",
        "/compte",
        "/connexion",
        "/inscription",
        "/mot-de-passe-oublie",
        "/design-system",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}

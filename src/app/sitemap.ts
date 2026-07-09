import type { MetadataRoute } from "next";
import {
  getDocumentHref,
  getDocuments,
  getFicheHref,
  getFiches,
  getTermes,
} from "@/lib/content/fiches";
import { getCategories, getModules } from "@/lib/content/referentials";
import { absoluteUrl } from "@/lib/site";

/**
 * Plan du site (SEO — ch. 9 §7). Ne liste que le contenu public et
 * consultable ; l'espace authentifié et les prévisualisations en sont exclus
 * (voir robots.ts). Le maillage interne, lui, vient du graphe documentaire.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/recherche"), changeFrequency: "monthly", priority: 0.3 },
    { url: absoluteUrl("/dictionnaire"), changeFrequency: "monthly", priority: 0.5 },
  ];

  for (const mod of getModules()) {
    entries.push({ url: absoluteUrl(`/${mod.slug}`), changeFrequency: "monthly", priority: 0.8 });
    for (const category of getCategories(mod.slug)) {
      entries.push({
        url: absoluteUrl(`/${mod.slug}/${category.slug}`),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  for (const fiche of getFiches()) {
    entries.push({
      url: absoluteUrl(getFicheHref(fiche)),
      lastModified: fiche.verifiedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const terme of getTermes()) {
    entries.push({
      url: absoluteUrl(`/dictionnaire/${terme.id.replace(/^terme\./, "")}`),
      changeFrequency: "yearly",
      priority: 0.4,
    });
  }

  for (const doc of getDocuments()) {
    entries.push({
      url: absoluteUrl(getDocumentHref(doc)),
      lastModified: doc.publishedAt,
      changeFrequency: "yearly",
      priority: 0.4,
    });
  }

  return entries;
}

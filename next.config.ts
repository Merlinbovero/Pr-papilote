import fs from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

/**
 * Redirections permanentes issues du référentiel de contenu.
 *
 * Toute réorganisation (fusion/déplacement de catégorie, changement de
 * slug) ajoute une entrée { source, destination } dans
 * content/_referentiels/redirects.json — aucune URL publiée ne meurt.
 */
function loadContentRedirects(): { source: string; destination: string; permanent: true }[] {
  const file = path.join(process.cwd(), "content", "_referentiels", "redirects.json");
  const entries = JSON.parse(fs.readFileSync(file, "utf-8")) as unknown;
  if (!Array.isArray(entries)) {
    throw new Error("redirects.json doit contenir un tableau");
  }
  return entries.map((entry) => {
    if (
      typeof entry !== "object" ||
      entry === null ||
      typeof (entry as { source?: unknown }).source !== "string" ||
      typeof (entry as { destination?: unknown }).destination !== "string"
    ) {
      throw new Error("redirects.json : chaque entrée exige { source, destination }");
    }
    const { source, destination } = entry as { source: string; destination: string };
    return { source, destination, permanent: true };
  });
}

const nextConfig: NextConfig = {
  async redirects() {
    return loadContentRedirects();
  },
};

export default nextConfig;

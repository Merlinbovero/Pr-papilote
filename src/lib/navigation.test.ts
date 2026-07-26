import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { getCategories, getModules } from "@/lib/content/referentials";
import { allNavHrefs, NAV_SECTIONS } from "@/lib/navigation";

const APP_DIR = path.join(process.cwd(), "src", "app");

/** Une route statique existe-t-elle dans `src/app` ? (`/bia` → `src/app/bia/page.tsx`) */
function staticRouteExists(href: string): boolean {
  const segments = href.replace(/^\//, "").split("/");
  return existsSync(path.join(APP_DIR, ...segments, "page.tsx"));
}

/** `/eopan` → page de module, servie par la route dynamique `[module]`. */
function isModuleHub(href: string): boolean {
  const segments = href.replace(/^\//, "").split("/");
  return segments.length === 1 && getModules().some((m) => m.slug === segments[0]);
}

/** `/eopan/appareils` → un couple module/catégorie déclaré dans les référentiels ? */
function isModuleCategory(href: string): boolean {
  const segments = href.replace(/^\//, "").split("/");
  if (segments.length !== 2) return false;
  const [moduleSlug, categorySlug] = segments;
  if (!getModules().some((m) => m.slug === moduleSlug)) return false;
  return getCategories(moduleSlug).some((c) => c.slug === categorySlug);
}

/** `/entrainement/eopan` → route dynamique `[concours]` sur un concours réel ? */
function isConcoursRoute(href: string): boolean {
  const match = /^\/entrainement\/([a-z]+)$/.exec(href);
  if (!match) return false;
  return getModules().some((m) => m.slug === match[1] && m.kind === "concours");
}

describe("navigation principale", () => {
  it("expose les six sections attendues, concours en tête", () => {
    expect(NAV_SECTIONS.map((s) => s.accentSlug)).toEqual([
      "eopan",
      "eopn",
      "alat",
      "fondamentaux",
      "psychotechnique",
      "culture",
    ]);
  });

  it("couvre tous les modules du référentiel", () => {
    const moduleSlugs = getModules().map((m) => m.slug);
    const navSlugs = NAV_SECTIONS.map((s) => s.accentSlug);
    for (const slug of moduleSlugs) {
      expect(navSlugs).toContain(slug);
    }
  });

  it("pointe chaque section sur la page de son module", () => {
    for (const section of NAV_SECTIONS) {
      expect(section.href).toBe(`/${section.accentSlug}`);
    }
  });

  it.each(allNavHrefs())("le lien %s mène à une route réelle", (href) => {
    const reachable =
      staticRouteExists(href) ||
      isModuleHub(href) ||
      isModuleCategory(href) ||
      isConcoursRoute(href);
    expect(reachable).toBe(true);
  });

  it("ne propose jamais deux fois le même lien dans un menu", () => {
    for (const section of NAV_SECTIONS) {
      const hrefs = section.links.map((l) => l.href);
      expect(new Set(hrefs).size).toBe(hrefs.length);
    }
  });

  it("garde des libellés de barre assez courts pour tenir sur une ligne", () => {
    for (const section of NAV_SECTIONS) {
      expect(section.label.length).toBeLessThanOrEqual(15);
    }
  });

  it("décrit chaque lien — la description porte le menu déroulant", () => {
    for (const section of NAV_SECTIONS) {
      for (const link of section.links) {
        expect(link.description.length).toBeGreaterThan(0);
        expect(link.label.length).toBeGreaterThan(0);
      }
    }
  });
});

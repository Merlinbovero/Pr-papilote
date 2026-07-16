import Link from "next/link";
import { getModules } from "@/lib/content/referentials";

/** Pied de page sobre : les cinq portes d'entrée et la mention du projet. */
export function SiteFooter() {
  const modules = getModules();

  return (
    <footer className="border-t print:hidden">
      <div className="text-muted-foreground mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <nav aria-label="Pied de page">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {modules.map((mod) => (
              <li key={mod.id}>
                <Link href={`/${mod.slug}`} className="hover:text-foreground transition-colors">
                  {mod.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-2 sm:items-end">
          <nav aria-label="Informations légales">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 sm:justify-end">
              <li>
                <Link href="/credits-photos" className="hover:text-foreground transition-colors">
                  Crédits photos
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="hover:text-foreground transition-colors">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="hover:text-foreground transition-colors">
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/cgu" className="hover:text-foreground transition-colors">
                  CGU
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
          <p className="sm:text-right">
            Projet indépendant, non officiel — préparation aux concours EOPAN, EOPN et ALAT.
          </p>
        </div>
      </div>
    </footer>
  );
}

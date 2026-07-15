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
        <p>PrépaPilote — préparation aux concours EOPAN, EOPN et ALAT.</p>
      </div>
    </footer>
  );
}

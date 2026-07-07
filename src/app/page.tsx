import { ModuleCard } from "@/components/shared/module-card";
import { getModules } from "@/lib/content/referentials";

/**
 * Accueil : les cinq portes d'entrée, rien d'autre (VISION.md §accueil).
 * Trois cartes verticales (concours), deux cartes horizontales (transverses).
 */
export default function HomePage() {
  const modules = getModules();
  const concours = modules.filter((mod) => mod.kind === "concours");
  const transverse = modules.filter((mod) => mod.kind === "transverse");

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 md:py-12 lg:px-8">
      <h1 className="sr-only">PrépaPilote — préparer les concours EOPAN, EOPN et ALAT</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {concours.map((mod) => (
          <ModuleCard key={mod.id} module={mod} orientation="vertical" />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:mt-6 md:gap-6">
        {transverse.map((mod) => (
          <ModuleCard key={mod.id} module={mod} orientation="horizontal" />
        ))}
      </div>
    </main>
  );
}

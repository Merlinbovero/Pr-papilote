import { cn } from "@/lib/utils";
import { SiteBreadcrumb, type BreadcrumbEntry } from "./site-breadcrumb";

/**
 * Coquille commune des pages autonomes (BIA, psychotechnique, cartes,
 * dictionnaire, recherche…). Garantit une largeur, des marges et un rythme
 * vertical identiques d'une page à l'autre : aucune page ne touche les bords
 * ni n'utilise d'espacement arbitraire (docs/design-system.md, Phase 3).
 *
 * Le conteneur (`max-w-7xl`, marges responsive) et le fil d'Ariane optionnel
 * sont centralisés ici ; la page ne fournit plus que son contenu.
 */
interface StandalonePageShellProps {
  /** Fil d'Ariane rendu en tête (optionnel). */
  breadcrumb?: BreadcrumbEntry[];
  children: React.ReactNode;
  /** Classes supplémentaires sur le conteneur `<main>`. */
  className?: string;
}

export function StandalonePageShell({ breadcrumb, children, className }: StandalonePageShellProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-8",
        className
      )}
    >
      {breadcrumb ? <SiteBreadcrumb items={breadcrumb} /> : null}
      {children}
    </main>
  );
}

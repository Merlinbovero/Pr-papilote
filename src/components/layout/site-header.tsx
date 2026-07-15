import Link from "next/link";
import { UserIcon } from "lucide-react";
import { MainNav } from "@/components/layout/main-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { SearchCommand } from "@/features/search/search-command";
import { buildSearchEntries } from "@/features/search/entries";

/**
 * Header global, présent sur toutes les pages : logo, navigation principale,
 * recherche, connexion. L'index de la palette est construit au build depuis
 * les référentiels.
 */
export function SiteHeader() {
  const entries = buildSearchEntries();

  return (
    <header className="bg-background/95 sticky top-0 z-40 border-b backdrop-blur print:hidden">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="focus-visible:ring-ring rounded-sm text-lg font-bold tracking-tight focus-visible:ring-2 focus-visible:outline-none"
        >
          Prépa<span className="text-primary">Pilote</span>
        </Link>
        <MainNav />
        <div className="ml-auto flex items-center gap-2">
          <SearchCommand entries={entries} />
          <ThemeToggle />
          <Button asChild variant="outline" size="sm">
            <Link href="/connexion">
              <UserIcon aria-hidden className="size-4" />
              {/* Libellé toujours dans l'arbre d'accessibilité : visible dès sm,
                  lisible par lecteur d'écran en icône seule sur mobile. */}
              <span className="sr-only sm:not-sr-only">Connexion</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

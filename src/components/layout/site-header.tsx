import Image from "next/image";
import Link from "next/link";
import { MainNav } from "@/components/layout/main-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { AuthStatus } from "@/features/auth/auth-status";
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
        {/* `shrink-0` : sans lui, le logo se comprimait et son texte passait
            sous la navigation quand la barre devenait juste. */}
        <Link
          href="/"
          aria-label="PrépaPilote — accueil"
          className="focus-visible:ring-ring flex shrink-0 items-center gap-2 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
        >
          <Image
            src="/logo-mark.png"
            alt=""
            width={30}
            height={30}
            className="rounded-md"
            priority
          />
          <span className="text-lg font-bold tracking-tight whitespace-nowrap">
            Prépa<span className="text-primary">Pilote</span>
          </span>
        </Link>
        <MainNav />
        {/* La vraie barre de recherche vit en page d'accueil ; le header ne
            garde qu'un bouton, pour laisser la place aux six sections. */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <SearchCommand entries={entries} variant="icon" />
          <ThemeToggle />
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}

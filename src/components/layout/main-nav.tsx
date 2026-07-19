"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  GraduationCapIcon,
  LanguagesIcon,
  BookMarkedIcon,
  MapIcon,
  MenuIcon,
  PlaySquareIcon,
  RepeatIcon,
  TimerIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getModuleAccentVar } from "@/lib/module-accent";
import { cn } from "@/lib/utils";

/**
 * Navigation principale. Sur desktop, deux menus déroulants sobres (Concours,
 * S'entraîner) pour éviter l'empilement de libellés longs ; sur mobile, un
 * tiroir. État actif visible partout (retours V1 : header « brouillon »).
 */

interface NavEntry {
  href: string;
  label: string;
  description: string;
  /** slug de module pour la pastille de couleur (concours). */
  accentSlug?: string;
  /** icône (outils d'entraînement). */
  icon?: LucideIcon;
}

const CONCOURS: NavEntry[] = [
  {
    href: "/eopan",
    label: "EOPAN",
    description: "Marine nationale · aéronautique navale",
    accentSlug: "eopan",
  },
  {
    href: "/eopn",
    label: "EOPN",
    description: "Armée de l'Air et de l'Espace",
    accentSlug: "eopn",
  },
  {
    href: "/alat",
    label: "ALAT",
    description: "Armée de Terre · hélicoptères",
    accentSlug: "alat",
  },
  {
    href: "/fondamentaux",
    label: "Fondamentaux",
    description: "Le socle théorique commun",
    accentSlug: "fondamentaux",
  },
  {
    href: "/culture",
    label: "Culture & géopolitique",
    description: "Aviation mondiale, géopolitique, culture générale",
    accentSlug: "culture",
  },
];

const ENTRAINEMENT: NavEntry[] = [
  { href: "/bia", label: "BIA", description: "Cours et examen blanc", icon: GraduationCapIcon },
  {
    href: "/anglais",
    label: "Anglais",
    description: "Vocabulaire, textes et quiz",
    icon: LanguagesIcon,
  },
  {
    href: "/reviser",
    label: "Réviser",
    description: "Révision espacée",
    icon: RepeatIcon,
  },
  {
    href: "/psychotechnique/entrainement",
    label: "Psychotechnique",
    description: "Entraînement chronométré",
    icon: TimerIcon,
  },
  { href: "/cartes", label: "Cartes des bases", description: "Les trois armées", icon: MapIcon },
  {
    href: "/dictionnaire",
    label: "Dictionnaire",
    description: "Sigles et termes",
    icon: BookOpenIcon,
  },
  {
    href: "/veille",
    label: "Veille vidéo",
    description: "Vidéos résumées et reliées aux fiches",
    icon: PlaySquareIcon,
  },
  {
    href: "/lectures",
    label: "Lectures",
    description: "Livres et articles résumés et reliés aux fiches",
    icon: BookMarkedIcon,
  },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const concoursActive = CONCOURS.some((e) => isActive(pathname, e.href));
  const entrainementActive = ENTRAINEMENT.some((e) => isActive(pathname, e.href));

  return (
    <>
      {/* Desktop : deux menus déroulants */}
      <NavigationMenu
        viewport={false}
        aria-label="Navigation principale"
        className="hidden md:flex"
      >
        <NavigationMenuList className="gap-1">
          <NavigationMenuItem>
            <NavigationMenuTrigger className={cn(concoursActive && "text-foreground bg-muted/60")}>
              Concours
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[440px] grid-cols-2 gap-1 p-2">
                {CONCOURS.map((entry) => (
                  <MenuLink
                    key={entry.href}
                    entry={entry}
                    active={isActive(pathname, entry.href)}
                  />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn(entrainementActive && "text-foreground bg-muted/60")}
            >
              S&apos;entraîner
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[440px] grid-cols-2 gap-1 p-2">
                {ENTRAINEMENT.map((entry) => (
                  <MenuLink
                    key={entry.href}
                    entry={entry}
                    active={isActive(pathname, entry.href)}
                  />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile : tiroir */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Ouvrir le menu">
              <MenuIcon aria-hidden className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <nav aria-label="Navigation principale" className="space-y-6 px-4 pb-6">
              <MobileGroup
                title="Concours"
                entries={CONCOURS}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
              <MobileGroup
                title="S'entraîner"
                entries={ENTRAINEMENT}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

/** Entrée d'un menu déroulant desktop : pastille/icône + libellé + description. */
function MenuLink({ entry, active }: { entry: NavEntry; active: boolean }) {
  const Icon = entry.icon;
  return (
    <li>
      <NavigationMenuLink asChild active={active}>
        <Link href={entry.href} className="flex flex-col gap-1 rounded-md p-2.5">
          <span className="flex items-center gap-2 text-sm font-semibold">
            {entry.accentSlug ? (
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: getModuleAccentVar(entry.accentSlug) }}
              />
            ) : Icon ? (
              <Icon aria-hidden className="text-primary size-4 shrink-0" />
            ) : null}
            {entry.label}
          </span>
          <span className="text-muted-foreground pl-4.5 text-xs leading-snug">
            {entry.description}
          </span>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

function MobileGroup({
  title,
  entries,
  pathname,
  onNavigate,
}: {
  title: string;
  entries: NavEntry[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground px-2 text-xs font-semibold tracking-wide uppercase">
        {title}
      </p>
      <ul>
        {entries.map((entry) => {
          const active = isActive(pathname, entry.href);
          const Icon = entry.icon;
          return (
            <li key={entry.href}>
              <Link
                href={entry.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-visible:ring-ring flex items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  active ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                )}
              >
                {entry.accentSlug ? (
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: getModuleAccentVar(entry.accentSlug) }}
                  />
                ) : Icon ? (
                  <Icon aria-hidden className="text-primary size-4 shrink-0" />
                ) : null}
                {entry.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

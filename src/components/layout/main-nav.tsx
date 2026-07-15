"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Navigation principale (retour V1 n°2 — « navigation confuse »). Deux
 * groupes explicites : les concours, puis les outils d'entraînement. Liens
 * en ligne sur desktop, tiroir sur mobile ; état actif visible partout.
 */

interface NavLink {
  href: string;
  label: string;
}

const CONCOURS: NavLink[] = [
  { href: "/eopan", label: "EOPAN — Marine" },
  { href: "/eopn", label: "EOPN — Air" },
  { href: "/alat", label: "ALAT — Terre" },
  { href: "/fondamentaux", label: "Fondamentaux" },
];

const ENTRAINEMENT: NavLink[] = [
  { href: "/bia", label: "BIA" },
  { href: "/psychotechnique/entrainement", label: "Psychotechnique" },
  { href: "/cartes", label: "Cartes" },
  { href: "/dictionnaire", label: "Dictionnaire" },
];

/** Vrai si le lien correspond à la route courante (ou une de ses sous-pages). */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Desktop : liens en ligne */}
      <nav aria-label="Navigation principale" className="hidden md:block">
        <ul className="flex items-center gap-1">
          {[...CONCOURS, ...ENTRAINEMENT].map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-visible:ring-ring rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile : tiroir */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Ouvrir le menu">
              <MenuIcon aria-hidden className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <nav aria-label="Navigation principale" className="space-y-6 px-4 pb-6">
              <MobileGroup
                title="Concours"
                links={CONCOURS}
                pathname={pathname}
                onNavigate={() => setOpen(false)}
              />
              <MobileGroup
                title="S'entraîner"
                links={ENTRAINEMENT}
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

function MobileGroup({
  title,
  links,
  pathname,
  onNavigate,
}: {
  title: string;
  links: NavLink[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground px-2 text-xs font-semibold tracking-wide uppercase">
        {title}
      </p>
      <ul>
        {links.map((link) => {
          const active = isActive(pathname, link.href);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-visible:ring-ring block rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  active ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                )}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

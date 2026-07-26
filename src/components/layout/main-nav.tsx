"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookMarkedIcon,
  BookOpenIcon,
  CameraIcon,
  CompassIcon,
  GaugeIcon,
  Grid2x2Icon,
  GraduationCapIcon,
  LanguagesIcon,
  MapIcon,
  MenuIcon,
  PlaySquareIcon,
  RepeatIcon,
  TargetIcon,
  TimerIcon,
  type LucideIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { NAV_SECTIONS, type NavIconName, type NavLink, type NavSection } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Navigation principale. Six entrées de premier niveau — les trois concours
 * puis les trois modules transverses — chacune avec son menu déroulant. Les
 * libellés disent ce que le site contient (« EOPAN » plutôt que « Concours ») :
 * c'est ce que les visiteurs cherchent.
 *
 * La structure vit dans `src/lib/navigation.ts`, où un test vérifie que chaque
 * lien mène à une route réelle. Ici, uniquement le rendu.
 *
 * Le basculement en tiroir se fait à **1180 px**, une largeur mesurée et non
 * choisie : logo (136) + six sections (612) + bloc de droite connecté (269,
 * « Mon compte » et la déconnexion étant plus larges que « Connexion ») +
 * gouttières (48) = 1065 px de contenu, soit 1129 px de fenêtre avec les
 * marges. En dessous, la barre se chevauchait — d'où ce point d'arrêt propre
 * plutôt qu'un `lg` qui tombait 100 px trop bas.
 */

const ICONS: Record<NavIconName, LucideIcon> = {
  training: TargetIcon,
  exam: GraduationCapIcon,
  language: LanguagesIcon,
  dictionary: BookOpenIcon,
  map: MapIcon,
  video: PlaySquareIcon,
  book: BookMarkedIcon,
  repeat: RepeatIcon,
  timer: TimerIcon,
  compass: CompassIcon,
  dominos: Grid2x2Icon,
  camera: CameraIcon,
  gauge: GaugeIcon,
};

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Une section est active si l'on est sur son hub ou sur l'une de ses pages. */
function isSectionActive(pathname: string, section: NavSection): boolean {
  return isActive(pathname, section.href);
}

export function MainNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* Desktop : six menus déroulants */}
      <NavigationMenu
        viewport={false}
        aria-label="Navigation principale"
        className="hidden min-[1180px]:flex"
      >
        <NavigationMenuList className="gap-0.5">
          {NAV_SECTIONS.map((section) => {
            const active = isSectionActive(pathname, section);
            return (
              <NavigationMenuItem key={section.href}>
                <NavigationMenuTrigger
                  className={cn(
                    "relative px-2.5 text-sm font-semibold",
                    active ? "text-foreground" : "text-foreground/70 hover:text-foreground"
                  )}
                >
                  {section.label}
                  {/* Filet d'accent de l'armée sous la section courante. */}
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute inset-x-2.5 -bottom-0.5 h-0.5 rounded-full"
                      style={{ backgroundColor: getModuleAccentVar(section.accentSlug) }}
                    />
                  ) : null}
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-[30rem] p-2">
                    <NavigationMenuLink asChild active={pathname === section.href}>
                      <Link
                        href={section.href}
                        className="mb-1 flex items-center gap-2 rounded-md p-2.5"
                      >
                        <span
                          aria-hidden
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: getModuleAccentVar(section.accentSlug) }}
                        />
                        <span className="text-sm font-semibold">{section.fullName}</span>
                        <span className="text-muted-foreground ml-auto text-xs">
                          Tout le module
                        </span>
                      </Link>
                    </NavigationMenuLink>
                    <ul className="grid grid-cols-2 gap-0.5 border-t pt-1">
                      {section.links.map((link) => (
                        <MenuLink
                          key={link.href}
                          link={link}
                          accentSlug={section.accentSlug}
                          active={isActive(pathname, link.href)}
                        />
                      ))}
                    </ul>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Mobile et tablette : tiroir, une section par volet dépliable */}
      <div className="min-[1180px]:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Ouvrir le menu">
              <MenuIcon aria-hidden className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <nav aria-label="Navigation principale" className="px-4 pb-6">
              <Accordion
                type="single"
                collapsible
                defaultValue={
                  NAV_SECTIONS.find((s) => isSectionActive(pathname, s))?.href ?? undefined
                }
              >
                {NAV_SECTIONS.map((section) => (
                  <AccordionItem key={section.href} value={section.href}>
                    <AccordionTrigger className="text-sm font-semibold">
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: getModuleAccentVar(section.accentSlug) }}
                        />
                        {section.label}
                      </span>
                    </AccordionTrigger>
                    {/* La primitive souligne les liens (pensée pour de la prose) :
                        dans une liste de navigation, c’est du bruit. */}
                    <AccordionContent className="[&_a]:no-underline">
                      <ul className="space-y-0.5">
                        <MobileLink
                          href={section.href}
                          label={section.fullName}
                          active={pathname === section.href}
                          onNavigate={() => setOpen(false)}
                        />
                        {section.links.map((link) => (
                          <MobileLink
                            key={link.href}
                            href={link.href}
                            label={link.label}
                            icon={link.icon}
                            active={isActive(pathname, link.href)}
                            onNavigate={() => setOpen(false)}
                          />
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

/** Entrée d'un menu déroulant : icône (outil) ou pastille (catégorie) + description. */
function MenuLink({
  link,
  accentSlug,
  active,
}: {
  link: NavLink;
  accentSlug: string;
  active: boolean;
}) {
  const Icon = link.icon ? ICONS[link.icon] : null;
  return (
    <li>
      <NavigationMenuLink asChild active={active}>
        {/* `items-start` : la primitive impose `items-center`, qui centrerait
            horizontalement une fois passé en colonne. */}
        <Link href={link.href} className="flex flex-col items-start gap-0.5 rounded-md p-2.5">
          <span className="flex items-center gap-2 text-sm font-medium">
            {Icon ? (
              <Icon aria-hidden className="text-primary size-4 shrink-0" />
            ) : (
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full opacity-70"
                style={{ backgroundColor: getModuleAccentVar(accentSlug) }}
              />
            )}
            {link.label}
          </span>
          <span className="text-muted-foreground pl-6 text-xs leading-snug">
            {link.description}
          </span>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}

function MobileLink({
  href,
  label,
  icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon?: NavIconName;
  active: boolean;
  onNavigate: () => void;
}) {
  const Icon = icon ? ICONS[icon] : null;
  return (
    <li>
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "focus-visible:ring-ring flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
          active ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"
        )}
      >
        {Icon ? <Icon aria-hidden className="text-primary size-4 shrink-0" /> : null}
        {label}
      </Link>
    </li>
  );
}

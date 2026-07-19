import Image from "next/image";
import Link from "next/link";
import {
  BookOpenIcon,
  GraduationCapIcon,
  LanguagesIcon,
  MapIcon,
  RepeatIcon,
  TimerIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ModuleCard } from "@/components/shared/module-card";
import { buildSearchEntries } from "@/features/search/entries";
import { PreparationBanner } from "@/features/preparation/preparation-banner";
import { SearchCommand } from "@/features/search/search-command";
import { getModules } from "@/lib/content/referentials";
import { SITE_PHOTOS, getModulePhoto } from "@/lib/photos";

/**
 * Accueil en trois temps (retours V1 n°2 et n°3) : une promesse illustrée,
 * le choix du concours, puis les entraînements et le socle commun. Toutes
 * les photographies sont réelles et créditées (/credits-photos).
 */

/** Sous-titres courts des modules transverses sur les cartes d'accueil. */
const TRANSVERSE_SUBTITLES: Record<string, string> = {
  fondamentaux: "Le socle commun aux trois concours",
  psychotechnique: "Les épreuves de sélection communes",
  culture: "Aviation mondiale, géopolitique et culture générale",
};

const ENTRAINEMENTS = [
  {
    href: "/reviser",
    title: "Révision espacée",
    description:
      "Chaque question au bon moment : celles que vous ratez reviennent vite, les autres s'espacent.",
    icon: RepeatIcon,
  },
  {
    href: "/anglais",
    title: "Anglais aéronautique",
    description:
      "Fiches et textes en anglais, vocabulaire bilingue en cartes-éclair, phraséologie et quiz.",
    icon: LanguagesIcon,
  },
  {
    href: "/bia",
    title: "BIA — cours et examen blanc",
    description: "Les cinq matières du brevet, quiz par matière et examen blanc de 100 questions.",
    icon: GraduationCapIcon,
  },
  {
    href: "/psychotechnique/entrainement",
    title: "Entraînement chronométré",
    description: "Sessions psychotechniques générées : mémoire, logique, calcul, spatial.",
    icon: TimerIcon,
  },
  {
    href: "/cartes",
    title: "Cartes des bases",
    description: "Les implantations des trois armées sur cartes interactives reliées aux fiches.",
    icon: MapIcon,
  },
  {
    href: "/dictionnaire",
    title: "Dictionnaire des sigles",
    description: "SNA, CEMPN, FOST… tous les sigles et termes expliqués en une page.",
    icon: BookOpenIcon,
  },
];

export default function HomePage() {
  const modules = getModules();
  const concours = modules.filter((mod) => mod.kind === "concours");
  const transverse = modules.filter((mod) => mod.kind === "transverse");
  const hero = SITE_PHOTOS.accueilHero;

  return (
    <main className="flex-1">
      <h1 className="sr-only">PrépaPilote — préparer les concours EOPAN, EOPN et ALAT</h1>

      {/* Promesse illustrée : hero cinématique — photo réelle créditée plein cadre,
          scrim pour le contraste AA, titre display ample, recherche et actions. */}
      <section className="relative isolate overflow-hidden">
        <Image src={hero.src} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        {/* Scrim : dégradé sombre (bas → haut) + voile latéral pour garantir le
            contraste du texte blanc quelle que soit la photo. */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/55 to-black/25"
        />
        <div
          aria-hidden
          className="from-background absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t to-transparent"
        />
        <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-end gap-5 px-4 py-20 sm:px-6 md:min-h-[40rem] md:py-28 lg:min-h-[44rem] lg:px-8">
          <p className="text-primary-foreground/90 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] uppercase">
            <span aria-hidden className="bg-primary h-px w-8" />
            Concours de pilote militaire
          </p>
          <p className="font-heading max-w-3xl text-4xl font-extrabold tracking-tight text-balance text-white drop-shadow-sm md:text-6xl lg:text-7xl">
            Devenez pilote dans les forces armées françaises.
          </p>
          <p className="max-w-xl text-base text-white/90 md:text-lg">
            Fiches vérifiées, quiz, examen blanc du BIA et entraînement psychotechnique pour
            préparer les sélections EOPAN, EOPN et ALAT.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="#concours">Choisir mon concours</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/bia/examen-blanc">Passer un examen blanc</Link>
            </Button>
          </div>
          <SearchCommand entries={buildSearchEntries()} variant="hero" />
        </div>
        <a
          href={hero.sourceUrl}
          className="absolute right-2 bottom-2 rounded px-1.5 py-0.5 text-[11px] text-white/70 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          Photo : {hero.author} ({hero.license})
        </a>
      </section>

      {/* Ma préparation : tableau de bord personnel (concours cible + compte à rebours) */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <PreparationBanner
          concoursList={concours.map((mod) => ({
            slug: mod.slug,
            name: mod.name,
            organization: mod.organization,
          }))}
        />
      </div>

      {/* Choix du concours : les trois portes d'entrée principales */}
      <section
        id="concours"
        aria-labelledby="concours-titre"
        className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 py-10 sm:px-6 md:py-14 lg:px-8"
      >
        <div className="mb-6 space-y-1">
          <h2 id="concours-titre" className="text-2xl font-bold tracking-tight md:text-3xl">
            Choisissez votre concours
          </h2>
          <p className="text-muted-foreground max-w-prose">
            Trois armées, trois sélections — chaque espace regroupe les fiches, les quiz et la
            culture propres au concours.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          {concours.map((mod) => {
            const photo = getModulePhoto(mod.slug);
            return (
              <ModuleCard
                key={mod.id}
                module={mod}
                orientation="vertical"
                imageSrc={photo?.src}
                imageAlt={photo?.alt}
                imageFocal={photo?.focalCard ?? photo?.focal}
                subtitle={mod.organization}
              />
            );
          })}
        </div>
      </section>

      {/* Entraînements : les actions concrètes, tout de suite.
          Tuiles sur fond « background » (les cartes bg-card ressortent en clair
          au-dessus, dans les deux thèmes) : pastille d'icône colorée, ombre et
          élévation au survol — pour qu'on ne passe plus dessus sans les voir. */}
      <section aria-labelledby="entrainement-titre" className="border-y">
        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <div className="mb-6 space-y-1">
            <h2 id="entrainement-titre" className="text-2xl font-bold tracking-tight md:text-3xl">
              Entraînez-vous dès maintenant
            </h2>
            <p className="text-muted-foreground max-w-prose">
              Sans inscription — vos scores restent sur votre appareil.
            </p>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ENTRAINEMENTS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
                >
                  <Card className="hover:border-primary/60 h-full border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <CardContent className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg"
                      >
                        <item.icon className="size-5" />
                      </span>
                      <div className="min-w-0 space-y-1">
                        <p className="font-heading text-base leading-snug font-semibold">
                          {item.title}
                        </p>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Socle commun : les deux modules transverses */}
      <section
        aria-labelledby="socle-titre"
        className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8"
      >
        <div className="mb-6 space-y-1">
          <h2 id="socle-titre" className="text-2xl font-bold tracking-tight md:text-3xl">
            Le socle commun
          </h2>
          <p className="text-muted-foreground max-w-prose">
            Ce que tous les candidats doivent maîtriser, quel que soit le concours visé.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {transverse.map((mod) => {
            const photo = getModulePhoto(mod.slug);
            return (
              <ModuleCard
                key={mod.id}
                module={mod}
                orientation="horizontal"
                imageSrc={photo?.src}
                imageAlt={photo?.alt}
                imageFocal={photo?.focalHero ?? photo?.focal}
                subtitle={TRANSVERSE_SUBTITLES[mod.slug]}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}

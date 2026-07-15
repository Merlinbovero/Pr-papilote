import type { Metadata } from "next";
import Link from "next/link";
import { AnchorIcon, MountainIcon, PlaneIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getImplantations } from "@/lib/cartes/data";
import { SITE_PHOTOS } from "@/lib/photos";

export const metadata: Metadata = {
  title: "Cartes des bases — aéronavale, armée de l'Air, ALAT",
  description:
    "Situez les bases aéronavales, les bases aériennes et les implantations de l'ALAT sur trois cartes interactives reliées aux fiches PrépaPilote.",
};

const CARTES = [
  {
    href: "/cartes/aeronavale",
    title: "Aéronautique navale",
    description:
      "Les bases d'aéronautique navale (BAN) — chasse embarquée, patrouille maritime, hélicoptères.",
    armee: "marine" as const,
    icon: AnchorIcon,
  },
  {
    href: "/cartes/armee-de-l-air",
    title: "Armée de l'Air et de l'Espace",
    description: "Les bases aériennes du parcours EOPN — écoles, chasse, ravitaillement, essais.",
    armee: "air" as const,
    icon: PlaneIcon,
  },
  {
    href: "/cartes/alat",
    title: "ALAT",
    description:
      "Écoles, régiments d'hélicoptères et états-majors de l'aviation légère de l'armée de Terre.",
    armee: "terre" as const,
    icon: MountainIcon,
  },
];

/** Hub des cartes — trois expériences, une par armée. */
export default function CartesHubPage() {
  const implantations = getImplantations();
  return (
    <main className="space-y-8">
      <SiteBreadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Cartes des bases" }]} />
      <PageHeader
        eyebrow="Les trois armées sur la carte"
        title="Cartes des bases"
        description="Où tout se passe — les implantations des trois armées, reliées aux fiches du site."
        photo={SITE_PHOTOS.marine}
      />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CARTES.map((carte) => {
          const count = implantations.filter((i) => i.armee === carte.armee).length;
          return (
            <li key={carte.href}>
              <Link
                href={carte.href}
                className="focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
              >
                <Card className="hover:border-primary/40 h-full transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <carte.icon aria-hidden className="text-primary size-4" />
                      {carte.title}
                    </CardTitle>
                    <CardDescription>{carte.description}</CardDescription>
                    <p className="text-muted-foreground pt-1 text-sm">{count} implantations</p>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteBreadcrumb } from "@/components/layout/site-breadcrumb";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { getModule } from "@/lib/content/referentials";

interface ModuleProgressionProps {
  params: Promise<{ module: string }>;
}

export async function generateMetadata({ params }: ModuleProgressionProps): Promise<Metadata> {
  const { module: moduleSlug } = await params;
  const mod = getModule(moduleSlug);
  return {
    title: mod ? `Progression ${mod.name}` : "Progression",
    robots: { index: false, follow: false },
  };
}

/** Une des cinq progressions par module (arbitrage 9). */
export default async function ModuleProgressionPage({ params }: ModuleProgressionProps) {
  const { module: moduleSlug } = await params;
  const mod = getModule(moduleSlug);
  if (!mod) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <SiteBreadcrumb
        items={[{ label: "Ma progression", href: "/progression" }, { label: mod.name }]}
      />
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Progression — {mod.name}</h1>
        <p className="text-muted-foreground">{mod.description}</p>
      </header>
      <Empty className="bg-background border">
        <EmptyHeader>
          <EmptyTitle>Aucune donnée pour l&apos;instant</EmptyTitle>
          <EmptyDescription>
            Vos quiz, erreurs, heures de travail et recommandations pour {mod.name}{" "}
            s&apos;afficheront ici dès vos premiers entraînements.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}

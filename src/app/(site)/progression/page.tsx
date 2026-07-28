import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getModules } from "@/lib/content/referentials";

export const metadata: Metadata = {
  title: "Ma progression",
  robots: { index: false, follow: false },
};

/**
 * Tableau de bord global : agrège les cinq progressions (arbitrage 9).
 * Les statistiques réelles arriveront avec le moteur de quiz.
 */
export default function ProgressionPage() {
  const modules = getModules();

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Ma progression</h1>
        <p className="text-muted-foreground">
          Vue d&apos;ensemble de votre préparation, tous modules confondus.
        </p>
      </header>
      <section aria-label="Progression par module">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((mod) => (
            <li key={mod.id}>
              <Link
                href={`/progression/${mod.slug}`}
                className="focus-visible:ring-ring block h-full rounded-xl focus-visible:ring-2 focus-visible:outline-none"
              >
                <Card className="hover:border-primary/40 h-full transition-colors">
                  <CardHeader>
                    <CardTitle className="text-base">{mod.name}</CardTitle>
                    <CardDescription>
                      Les statistiques apparaîtront dès vos premiers entraînements.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

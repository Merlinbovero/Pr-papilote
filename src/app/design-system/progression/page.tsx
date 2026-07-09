import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClockIcon, HistoryIcon, TargetIcon, TrendingUpIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { RecommendationList } from "@/features/progression/recommendation-list";
import { StatCard } from "@/features/progression/stat-card";
import { ThemeMasteryList } from "@/features/progression/theme-mastery-list";
import {
  journey,
  overallStats,
  recommendations,
  themeMastery,
  type AttemptRecord,
  type StudySessionRecord,
} from "@/lib/progression/derive";

export const metadata: Metadata = {
  title: "Tableau de bord de progression — démonstration",
  robots: { index: false, follow: false },
};

/**
 * Prévisualisation du tableau de bord de progression avec des données
 * EXPLICITEMENT FICTIVES — le câblage Supabase (lecture réelle) est
 * différé à l'intégration. Aucune donnée réelle n'est affichée ici.
 */
const demoAttempts: AttemptRecord[] = [
  ...Array.from({ length: 18 }, (_, i) => ({
    questionId: `q.meteo.${i}`,
    theme: "meteorologie",
    moduleSlug: "fondamentaux",
    isCorrect: i % 3 !== 0,
    durationMs: 12000,
    answeredAt: `2026-06-${String((i % 28) + 1).padStart(2, "0")}T10:00:00.000Z`,
  })),
  ...Array.from({ length: 12 }, (_, i) => ({
    questionId: `q.nav.${i}`,
    theme: "navigation",
    moduleSlug: "fondamentaux",
    isCorrect: i % 2 === 0 ? false : true,
    durationMs: 15000,
    answeredAt: `2026-06-${String((i % 28) + 1).padStart(2, "0")}T11:00:00.000Z`,
  })),
];

const demoSessions: StudySessionRecord[] = Array.from({ length: 24 }, (_, i) => ({
  moduleSlug: "fondamentaux",
  startedAt: `2026-03-${String((i % 28) + 1).padStart(2, "0")}T18:00:00.000Z`,
  endedAt: `2026-03-${String((i % 28) + 1).padStart(2, "0")}T19:00:00.000Z`,
}));

const THEME_LABELS: Record<string, string> = {
  meteorologie: "Météorologie",
  navigation: "Navigation",
};

export default function ProgressionPreviewPage() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SHOW_DESIGN_SYSTEM !== "1") {
    notFound();
  }

  const stats = overallStats(demoAttempts);
  const mastery = themeMastery(demoAttempts);
  const path = journey(demoAttempts, demoSessions);
  const recs = recommendations(mastery, 5, ["aerodynamique"]);

  const sinceLabel = path.since
    ? new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(
        new Date(path.since)
      )
    : "—";

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <Alert>
        <AlertTitle>Tableau de bord de progression — démonstration</AlertTitle>
        <AlertDescription>
          Données fictives. Cette page valide les composants avant le câblage Supabase (lecture
          réelle différée à l&apos;intégration).
        </AlertDescription>
      </Alert>

      <header className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Ma progression</h1>
        <p className="text-muted-foreground">Le chemin parcouru, pas une pression quotidienne.</p>
      </header>

      <section aria-label="Parcours" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="En préparation depuis" value={sinceLabel} icon={HistoryIcon} />
        <StatCard
          label="Heures investies"
          value={`${path.totalHours} h`}
          hint={`≈ ${path.weeklyAverageHours} h / semaine`}
          icon={ClockIcon}
        />
        <StatCard
          label="Taux de réussite"
          value={`${stats.correctRate} %`}
          hint={`${stats.answered} questions`}
          icon={TargetIcon}
        />
        <StatCard label="À réviser aujourd'hui" value="5" icon={TrendingUpIcon} />
      </section>

      <section aria-labelledby="ds-prog-themes" className="space-y-4">
        <h2 id="ds-prog-themes" className="text-xl font-semibold tracking-tight">
          Maîtrise par thème
        </h2>
        <ThemeMasteryList items={mastery} labelOf={(t) => THEME_LABELS[t] ?? t} />
      </section>

      <section aria-labelledby="ds-prog-recos" className="space-y-4">
        <h2 id="ds-prog-recos" className="text-xl font-semibold tracking-tight">
          Recommandations
        </h2>
        <RecommendationList items={recs} />
      </section>
    </main>
  );
}

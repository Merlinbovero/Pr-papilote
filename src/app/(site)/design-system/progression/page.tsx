import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClockIcon, HistoryIcon, TargetIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MasteryList, type MasteryItem } from "@/features/progression/mastery-list";
import { ObjectiveList, type ObjectiveView } from "@/features/progression/objective-list";
import { RecommendationList } from "@/features/progression/recommendation-list";
import { ResumeBlock } from "@/features/progression/resume-block";
import { StatCard } from "@/features/progression/stat-card";
import {
  competencyMastery,
  journey,
  objectiveProgress,
  overallStats,
  recommendations,
  resumePoint,
  themeMastery,
  type AttemptRecord,
  type Objective,
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
    competencies: ["meteorologie", "raisonnement-logique"],
    isCorrect: i % 3 !== 0,
    durationMs: 12000,
    answeredAt: `2026-06-${String((i % 28) + 1).padStart(2, "0")}T10:00:00.000Z`,
  })),
  ...Array.from({ length: 12 }, (_, i) => ({
    questionId: `q.nav.${i}`,
    theme: "navigation",
    moduleSlug: "fondamentaux",
    competencies: ["navigation", "calcul-mental"],
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

const demoObjectives: Objective[] = [
  {
    id: "o1",
    type: "consulter-fiches",
    label: "Consulter 30 fiches",
    target: 30,
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "o2",
    type: "examen-blanc",
    label: "Réaliser un examen blanc",
    target: 1,
    createdAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "o3",
    type: "terminer-domaine",
    label: "Terminer les Fondamentaux",
    target: 100,
    moduleSlug: "fondamentaux",
    createdAt: "2026-03-01T10:00:00.000Z",
  },
];

const THEME_LABELS: Record<string, string> = {
  meteorologie: "Météorologie",
  navigation: "Navigation",
};

const COMPETENCE_LABELS: Record<string, string> = {
  meteorologie: "Météorologie",
  navigation: "Navigation",
  "calcul-mental": "Calcul mental",
  "raisonnement-logique": "Raisonnement logique",
};

export default function ProgressionPreviewPage() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SHOW_DESIGN_SYSTEM !== "1") {
    notFound();
  }

  const stats = overallStats(demoAttempts);
  const themes = themeMastery(demoAttempts);
  const competences = competencyMastery(demoAttempts);
  const path = journey(demoAttempts, demoSessions);
  const dueReviewCount = 5;
  const recs = recommendations(themes, dueReviewCount, ["aerodynamique"]);
  const resume = resumePoint(demoAttempts, demoSessions, dueReviewCount);

  const masteredThemes = themes.filter((t) => t.level === "maitrise").length;
  const coverageRatio = themes.length > 0 ? masteredThemes / themes.length : 0;
  const objectives: ObjectiveView[] = demoObjectives.map((objective) => ({
    objective,
    progress: objectiveProgress(objective, {
      fichesConsulted: 22,
      quizzesCompleted: 14,
      examsCompleted: 1,
      coverageRatio,
    }),
  }));

  const themeItems: MasteryItem[] = themes.map((t) => ({
    ...t,
    key: t.theme,
    label: THEME_LABELS[t.theme] ?? t.theme,
  }));
  const competenceItems: MasteryItem[] = competences.map((c) => ({
    ...c,
    key: c.competency,
    label: COMPETENCE_LABELS[c.competency] ?? c.competency,
  }));

  const sinceLabel = path.since
    ? new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(
        new Date(path.since)
      )
    : "—";

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-4 py-8 sm:px-6 lg:px-8">
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

      {/* Reprendre : l'action la plus utile, tout en haut. */}
      <section aria-labelledby="prog-reprendre" className="space-y-3">
        <h2 id="prog-reprendre" className="text-xl font-semibold tracking-tight">
          Reprendre
        </h2>
        <ResumeBlock
          moduleLabel="Fondamentaux"
          resumeHref="#"
          lastActivityLabel="Dernière activité récente"
          dueReviewCount={resume.dueReviewCount}
          reviewHref="#"
        />
      </section>

      {/* Où j'en suis : quelques repères, pas un mur de graphiques. */}
      <section aria-label="Où j'en suis" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
        <StatCard label="À réviser aujourd'hui" value={`${dueReviewCount}`} icon={TargetIcon} />
      </section>

      {/* À travailler aujourd'hui. */}
      <section aria-labelledby="prog-recos" className="space-y-4">
        <h2 id="prog-recos" className="text-xl font-semibold tracking-tight">
          À travailler aujourd&apos;hui
        </h2>
        <RecommendationList items={recs} />
      </section>

      <section aria-labelledby="prog-objectifs" className="space-y-4">
        <h2 id="prog-objectifs" className="text-xl font-semibold tracking-tight">
          Mes objectifs
        </h2>
        <ObjectiveList items={objectives} />
      </section>

      {/* Détail secondaire : maîtrise par thème et par compétence. */}
      <section aria-labelledby="prog-themes" className="space-y-4">
        <h2 id="prog-themes" className="text-xl font-semibold tracking-tight">
          Maîtrise par thème
        </h2>
        <MasteryList items={themeItems} ariaLabel="Maîtrise par thème" />
      </section>

      <section aria-labelledby="prog-competences" className="space-y-4">
        <h2 id="prog-competences" className="text-xl font-semibold tracking-tight">
          Maîtrise par compétence
        </h2>
        <MasteryList items={competenceItems} ariaLabel="Maîtrise par compétence" />
      </section>
    </main>
  );
}

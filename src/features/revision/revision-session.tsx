"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2Icon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuizPlayer, type PlayerQuestion } from "@/features/quiz/quiz-player";
import {
  buildReviewQueue,
  reviewStats,
  type ReviewState,
  type ReviewStats,
} from "@/lib/revision/scheduler";
import { readRevisionState, recordReview } from "./revision-store";

/**
 * Séance de révision espacée : à partir du concours cible, on récupère la
 * banque (à la demande), on en tire les questions échues (planificateur de
 * Leitner) plus quelques nouvelles, et chaque réponse met à jour l'échéance de
 * la question. Local et sans compte, cohérent avec la progression dérivée.
 */

interface RevisionConcours {
  slug: string;
  name: string;
}

interface RevisionSessionProps {
  concoursList: RevisionConcours[];
  /** Concours présélectionné (issu de « Ma préparation »), sinon choix manuel. */
  initialConcours?: string;
}

type Phase = "idle" | "loading" | "error" | "empty" | "playing";

export function RevisionSession({ concoursList, initialConcours }: RevisionSessionProps) {
  const [mounted, setMounted] = React.useState(false);
  const [concours, setConcours] = React.useState<string | undefined>(initialConcours);
  const [phase, setPhase] = React.useState<Phase>("idle");
  const [queue, setQueue] = React.useState<PlayerQuestion[]>([]);
  const [stats, setStats] = React.useState<ReviewStats | null>(null);
  const [sessionId, setSessionId] = React.useState(0);
  const poolCache = React.useRef<Record<string, PlayerQuestion[]>>({});

  // Préselection : « Ma préparation » si aucun concours n'est imposé.
  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (!initialConcours) {
        try {
          const raw = window.localStorage.getItem("prepapilote:preparation");
          if (raw) {
            const parsed = JSON.parse(raw) as { concours?: string };
            if (parsed?.concours) setConcours(parsed.concours);
          }
        } catch {
          // pas de préparation mémorisée : choix manuel
        }
      }
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, [initialConcours]);

  const buildFrom = React.useCallback((pool: PlayerQuestion[], state: ReviewState) => {
    const byId = new Map(pool.map((q) => [q.id, q]));
    const ids = pool.map((q) => q.id);
    const { due, fresh } = buildReviewQueue(ids, state);
    const selected = [...due, ...fresh]
      .map((id) => byId.get(id))
      .filter((q): q is PlayerQuestion => Boolean(q));
    setStats(reviewStats(ids, state));
    setQueue(selected);
    setSessionId((n) => n + 1);
    setPhase(selected.length > 0 ? "playing" : "empty");
  }, []);

  const startFor = React.useCallback(
    async (slug: string) => {
      let pool = poolCache.current[slug];
      if (!pool) {
        setPhase("loading");
        try {
          const res = await fetch(`/entrainement/${slug}/pool`);
          if (!res.ok) throw new Error(String(res.status));
          pool = (await res.json()) as PlayerQuestion[];
          poolCache.current[slug] = pool;
        } catch {
          setPhase("error");
          return;
        }
      }
      buildFrom(pool, readRevisionState());
    },
    [buildFrom]
  );

  const onAnswered = React.useCallback((questionId: string, correct: boolean) => {
    recordReview(questionId, correct);
  }, []);

  const refreshEmptyStats = React.useCallback(() => {
    if (concours && poolCache.current[concours]) {
      const ids = poolCache.current[concours].map((q) => q.id);
      setStats(reviewStats(ids, readRevisionState()));
    }
  }, [concours]);

  if (!mounted) {
    return <div aria-hidden className="min-h-[8rem]" />;
  }

  const currentName = concoursList.find((c) => c.slug === concours)?.name;

  return (
    <div className="space-y-5">
      {/* Choix du concours à réviser (présélectionné si « Ma préparation » existe). */}
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label="Concours à réviser"
      >
        {concoursList.map((c) => {
          const active = concours === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setConcours(c.slug);
                setPhase("idle");
                setQueue([]);
                setStats(null);
              }}
              className={cn(
                "focus-visible:ring-ring rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:border-foreground/20"
              )}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {phase === "playing" ? (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {queue.length} question{queue.length > 1 ? "s" : ""} à réviser aujourd&apos;hui
            {currentName ? ` · ${currentName}` : ""}
          </p>
          <QuizPlayer
            key={sessionId}
            title={`Révision ${currentName ?? ""}`}
            questions={queue}
            onAnswered={onAnswered}
            onFinished={refreshEmptyStats}
          />
        </div>
      ) : phase === "empty" ? (
        <div className="bg-card space-y-4 rounded-2xl border p-6">
          <p className="flex items-center gap-2 font-medium">
            <CheckCircle2Icon aria-hidden className="text-success size-5" />
            Rien à réviser aujourd&apos;hui pour {currentName}.
          </p>
          {stats ? (
            <p className="text-muted-foreground text-sm">
              {stats.upcoming} question{stats.upcoming > 1 ? "s" : ""} programmée
              {stats.upcoming > 1 ? "s" : ""} pour plus tard, {stats.mastered} acquise
              {stats.mastered > 1 ? "s" : ""}, {stats.neverSeen} encore jamais vue
              {stats.neverSeen > 1 ? "s" : ""}.
            </p>
          ) : null}
          <Button asChild variant="outline" size="sm">
            <Link href={`/entrainement/${concours}`}>
              <SparklesIcon aria-hidden className="size-4" />
              S&apos;entraîner librement
            </Link>
          </Button>
        </div>
      ) : phase === "error" ? (
        <div className="border-destructive/40 text-muted-foreground rounded-2xl border p-6 text-sm">
          Le vivier n&apos;a pas pu être récupéré. Vérifiez votre connexion et réessayez.
        </div>
      ) : (
        <div className="bg-card space-y-4 rounded-2xl border p-6">
          <p className="text-muted-foreground text-sm">
            {concours
              ? "Lancez votre séance : les questions échues remontent en priorité, complétées par quelques nouvelles."
              : "Choisissez un concours à réviser ci-dessus."}
          </p>
          <Button
            onClick={() => concours && startFor(concours)}
            disabled={!concours || phase === "loading"}
          >
            {phase === "loading" ? "Préparation…" : "Commencer la révision"}
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2Icon, SparklesIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizPlayer, type PlayerQuestion } from "@/features/quiz/quiz-player";
import { ModeSeance } from "@/features/banc/mode-seance";
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
  /**
   * En-tête de page, confié à la séance pour qu'il **se replie au
   * lancement** — même contrat qu'à la route pilote (lot F2a). C'est la
   * condition pour que l'aire de jeu entre dans le cadre.
   */
  entete?: React.ReactNode;
  /** Concours présélectionné (issu de « Ma préparation »), sinon choix manuel. */
  initialConcours?: string;
}

type Phase = "idle" | "loading" | "error" | "empty" | "playing";

export function RevisionSession({ concoursList, initialConcours, entete }: RevisionSessionProps) {
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

  /* Le sélecteur garde ici sa sémantique historique (`aria-pressed`) : le
     passage au choix exclusif natif est le sujet du commit 3, pour que la
     migration visuelle et le changement de sémantique restent relisibles
     séparément. Seule la teinte passe au registre du Banc. */
  const selecteur = (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Concours à réviser">
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
            className="focus-visible:ring-ring rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            style={
              active
                ? {
                    borderColor: "var(--bc-banc)",
                    color: "var(--bc-banc)",
                    backgroundColor: "var(--bc-fond2)",
                  }
                : { borderColor: "var(--bc-filet)", color: "var(--bc-encre2)" }
            }
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );

  return (
    <ModeSeance
      labelSeance={`Révision espacée${currentName ? ` — ${currentName}` : ""}`}
      libelleLancement={phase === "loading" ? "Préparation…" : "Commencer la révision"}
      // Le concours doit être choisi avant de démarrer : comportement
      // historique de la route, conservé à l'identique.
      lancementDesactive={!concours}
      // Le vivier n'est demandé qu'ici — l'aire est en place et le focus posé.
      onSeanceEntree={() => {
        if (concours) void startFor(concours);
      }}
      onSortie={() => {
        setPhase("idle");
        setQueue([]);
      }}
      introduction={
        <div className="space-y-6">
          {entete}
          <div className="space-y-4">
            <p className="banc-consigne text-sm" style={{ color: "var(--bc-encre2)" }}>
              Les questions échues remontent en priorité, complétées par quelques nouvelles. Vos
              échéances sont calculées à partir de vos réponses et restent sur cet appareil.
            </p>
            {selecteur}
          </div>
        </div>
      }
    >
      {phase === "playing" ? (
        <div className="space-y-4">
          {/* Une seule expression, et non un mélange de texte JSX et
              d'accolades : la coupure de ligne mangeait l'espace, et le
              rendu affichait « 15 questionsà réviser ». Défaut préexistant,
              mesuré dans le DOM avant migration. */}
          <p className="text-sm" style={{ color: "var(--bc-encre2)" }}>
            {`${queue.length} question${queue.length > 1 ? "s" : ""} à réviser aujourd’hui${
              currentName ? ` · ${currentName}` : ""
            }`}
          </p>
          <QuizPlayer
            key={sessionId}
            title={`Révision ${currentName ?? ""}`}
            questions={queue}
            variant="banc"
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
        /* `idle` et `loading` : l'aire est en place, le vivier arrive. Le
           bouton de lancement n'est plus dupliqué ici — c'est `ModeSeance`
           qui le porte, dans l'introduction. */
        <p className="text-sm" style={{ color: "var(--bc-encre2)" }}>
          Préparation de la séance…
        </p>
      )}
    </ModeSeance>
  );
}

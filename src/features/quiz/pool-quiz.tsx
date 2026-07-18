"use client";

import * as React from "react";
import { RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuizPlayer, type PlayerQuestion } from "./quiz-player";

/**
 * Lanceur de quiz sur un vivier servi à la demande : l'utilisateur choisit une
 * longueur de série, le vivier est récupéré en JSON statique puis un tirage
 * aléatoire alimente le lecteur de quiz. Générique — réutilisé pour
 * l'entraînement par concours comme pour l'anglais aéronautique. Rien n'est
 * enregistré sans compte (le lecteur l'indique).
 */

interface PoolQuizProps {
  /** Libellé du vivier (« EOPAN — Marine nationale », « Anglais aéronautique »…). */
  label: string;
  /** URL du vivier statique servi à la demande. */
  poolUrl: string;
  /** Nombre total de questions disponibles (pour borner les longueurs). */
  totalAvailable: number;
  /** Phrase d'introduction (contextualise le vivier). */
  blurb?: React.ReactNode;
}

type Phase = "config" | "loading" | "error" | "playing";

const LENGTHS = [10, 20, 40] as const;

/** Mélange une copie (Fisher–Yates) — entraînement, tirage non rejoué. */
function shuffled<T>(source: readonly T[]): T[] {
  const copy = [...source];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function PoolQuiz({ label, poolUrl, totalAvailable, blurb }: PoolQuizProps) {
  const options = LENGTHS.filter((n) => n <= totalAvailable);
  const [count, setCount] = React.useState<number>(options[0] ?? Math.min(10, totalAvailable));
  const [phase, setPhase] = React.useState<Phase>("config");
  const [draw, setDraw] = React.useState<PlayerQuestion[]>([]);
  const [drawId, setDrawId] = React.useState(0);
  const poolCache = React.useRef<PlayerQuestion[] | null>(null);

  const drawSeries = React.useCallback((pool: PlayerQuestion[], length: number) => {
    setDraw(shuffled(pool).slice(0, Math.min(length, pool.length)));
    setDrawId((id) => id + 1);
    setPhase("playing");
  }, []);

  const start = React.useCallback(
    async (length: number) => {
      let pool = poolCache.current;
      if (!pool) {
        setPhase("loading");
        try {
          const res = await fetch(poolUrl);
          if (!res.ok) throw new Error(String(res.status));
          pool = (await res.json()) as PlayerQuestion[];
          poolCache.current = pool;
        } catch {
          setPhase("error");
          return;
        }
      }
      drawSeries(pool, length);
    },
    [poolUrl, drawSeries]
  );

  if (phase === "playing" && draw.length > 0) {
    return (
      <div className="space-y-5">
        <div className="bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
          <p className="text-muted-foreground text-sm">
            Série de <span className="text-foreground font-medium">{draw.length}</span> questions ·{" "}
            {label}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => poolCache.current && drawSeries(poolCache.current, count)}
            >
              <RotateCcwIcon aria-hidden className="size-4" />
              Nouvelle série
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPhase("config")}>
              <SlidersHorizontalIcon aria-hidden className="size-4" />
              Réglages
            </Button>
          </div>
        </div>
        <QuizPlayer key={drawId} title={label} questions={draw} />
      </div>
    );
  }

  return (
    <section aria-label={`Quiz ${label}`} className="bg-card space-y-5 rounded-xl border p-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Quiz</h2>
        <p className="text-muted-foreground text-sm">
          {blurb ?? (
            <>
              Une série de questions tirées au hasard ({totalAvailable} disponibles), avec
              correction détaillée.
            </>
          )}
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Longueur de la série</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Longueur de la série">
          {options.map((n) => {
            const active = n === count;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setCount(n)}
                className={cn(
                  "focus-visible:ring-ring rounded-full border px-4 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:border-foreground/20"
                )}
              >
                {n} questions
              </button>
            );
          })}
        </div>
      </fieldset>

      {phase === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Chargement impossible</AlertTitle>
          <AlertDescription>
            Le vivier n&apos;a pas pu être récupéré. Vérifiez votre connexion et réessayez.
          </AlertDescription>
        </Alert>
      ) : null}

      <Button onClick={() => start(count)} disabled={phase === "loading"}>
        {phase === "loading" ? "Préparation…" : "Commencer la série"}
      </Button>
    </section>
  );
}

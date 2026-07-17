"use client";

import * as React from "react";
import Link from "next/link";
import { CalendarClockIcon, ListChecksIcon, PencilIcon, TargetIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * « Ma préparation » : le candidat choisit son concours cible et, s'il le
 * souhaite, la date de son épreuve (saisie par lui — aucune date n'est
 * présumée). On en dérive un compte à rebours et des accès directs (réviser,
 * s'entraîner, progression). Tout est local (localStorage) : rien n'est envoyé,
 * rien n'est présumé sans compte. Lecture différée après hydratation pour ne
 * pas provoquer d'écart serveur/client.
 */

export interface PreparationConcours {
  slug: string;
  name: string;
  organization?: string;
}

interface PreparationState {
  concours: string;
  /** Date de l'épreuve au format AAAA-MM-JJ (facultative). */
  examDate?: string;
}

const STORAGE_KEY = "prepapilote:preparation";

function readState(): PreparationState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreparationState;
    return parsed && typeof parsed.concours === "string" ? parsed : null;
  } catch {
    return null;
  }
}

/** Jours entiers entre aujourd'hui et la date d'épreuve (UTC, sans dérive TZ). */
function daysUntil(iso: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const target = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86_400_000);
}

export function PreparationBanner({ concoursList }: { concoursList: PreparationConcours[] }) {
  const [mounted, setMounted] = React.useState(false);
  const [state, setState] = React.useState<PreparationState | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [draftConcours, setDraftConcours] = React.useState<string>("");
  const [draftDate, setDraftDate] = React.useState<string>("");

  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      const stored = readState();
      setState(stored);
      setEditing(stored === null);
      setDraftConcours(stored?.concours ?? "");
      setDraftDate(stored?.examDate ?? "");
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const persist = (next: PreparationState | null) => {
    setState(next);
    try {
      if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // stockage indisponible : la sélection reste valable pour la session
    }
  };

  const save = () => {
    if (!draftConcours) return;
    persist({ concours: draftConcours, examDate: draftDate || undefined });
    setEditing(false);
  };

  // Avant hydratation : réserve un espace neutre (pas de saut de mise en page).
  if (!mounted) {
    return <div aria-hidden className="min-h-[4.5rem]" />;
  }

  const current = state ? concoursList.find((c) => c.slug === state.concours) : undefined;
  const remaining = state?.examDate ? daysUntil(state.examDate) : null;

  if (!editing && state && current) {
    return (
      <section
        aria-label="Ma préparation"
        className="bg-card flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl border p-5"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl"
          >
            <TargetIcon className="size-5" />
          </span>
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Ma préparation
            </p>
            <p className="font-semibold">
              {current.name}
              {current.organization ? (
                <span className="text-muted-foreground font-normal"> · {current.organization}</span>
              ) : null}
            </p>
          </div>
        </div>

        {remaining !== null ? (
          <p className="flex items-center gap-2 text-sm">
            <CalendarClockIcon aria-hidden className="text-muted-foreground size-4" />
            {remaining > 0 ? (
              <span>
                <span className="text-primary text-lg font-bold tabular-nums">J−{remaining}</span>{" "}
                avant l&apos;épreuve
              </span>
            ) : remaining === 0 ? (
              <span className="font-medium">C&apos;est le jour J — bon courage.</span>
            ) : (
              <span className="text-muted-foreground">Épreuve passée</span>
            )}
          </p>
        ) : null}

        <div className="ml-auto flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={`/entrainement/${current.slug}`}>
              <ListChecksIcon aria-hidden className="size-4" />
              S&apos;entraîner
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/${current.slug}`}>Réviser</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/progression/${current.slug}`}>Progression</Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDraftConcours(state.concours);
              setDraftDate(state.examDate ?? "");
              setEditing(true);
            }}
          >
            <PencilIcon aria-hidden className="size-4" />
            Modifier
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Ma préparation" className="bg-card space-y-4 rounded-2xl border p-5">
      <div className="space-y-1">
        <h2 className="font-semibold">Quel concours préparez-vous ?</h2>
        <p className="text-muted-foreground text-sm">
          Personnalisez votre tableau de bord — accès direct à vos révisions, entraînements et à un
          compte à rebours si vous connaissez la date de l&apos;épreuve. Enregistré sur cet
          appareil.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Concours cible">
        {concoursList.map((c) => {
          const active = draftConcours === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setDraftConcours(c.slug)}
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

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="prep-date" className="text-sm font-medium">
            Date de l&apos;épreuve <span className="text-muted-foreground">(facultatif)</span>
          </label>
          <input
            id="prep-date"
            type="date"
            value={draftDate}
            onChange={(event) => setDraftDate(event.target.value)}
            className="border-input bg-background focus-visible:ring-ring block rounded-md border px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
          />
        </div>
        <Button onClick={save} disabled={!draftConcours}>
          Enregistrer
        </Button>
        {state ? (
          <Button variant="ghost" onClick={() => setEditing(false)}>
            Annuler
          </Button>
        ) : null}
      </div>
    </section>
  );
}

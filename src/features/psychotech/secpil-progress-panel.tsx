"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { SECPIL_MODES } from "@/lib/psychotech/secpil";
import {
  configLabel,
  modeSummaries,
  SECPIL_MASTERY_SCORE,
  SECPIL_MASTERY_SESSIONS,
  trend,
  type SecpilAdvice,
  type SecpilSessionEntry,
} from "@/lib/psychotech/secpil-progress";

/**
 * Progression du SECPIL — vues seules. Toute la logique (regroupement par
 * configuration, meilleurs scores, tendance, conseil) vit dans
 * `src/lib/psychotech/secpil-progress.ts` et y est testée.
 */

/** Mêmes seuils que le bilan de session, pour que les couleurs concordent. */
function scoreTone(v: number): string {
  return v >= 80 ? "text-success" : v >= 55 ? "text-warning" : "text-destructive";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// --- Courbe de progression ---------------------------------------------------

const CURVE_W = 320;
const CURVE_H = 84;
const CURVE_PAD = 8;

/**
 * Courbe des dernières sessions d'une même configuration. Échelle **toujours
 * 0–100** : une échelle ajustée aux données ferait passer 3 points pour une
 * envolée.
 */
export function ProgressionCurve({ series, label }: { series: readonly number[]; label: string }) {
  if (series.length < 2) return null;
  const innerW = CURVE_W - CURVE_PAD * 2;
  const innerH = CURVE_H - CURVE_PAD * 2;
  const x = (i: number) => CURVE_PAD + (i / (series.length - 1)) * innerW;
  const y = (v: number) => CURVE_PAD + (1 - v / 100) * innerH;
  const line = series.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" L");
  const area = `M${x(0)},${y(0)} L${line} L${x(series.length - 1)},${y(0)} Z`;

  return (
    <svg
      viewBox={`0 0 ${CURVE_W} ${CURVE_H}`}
      className="w-full"
      role="img"
      aria-label={`${label} : ${series.length} sessions, de ${series[0]} % à ${series[series.length - 1]} %.`}
    >
      {/* Repère de maîtrise — le même que celui qui déclenche le conseil. */}
      <line
        x1={CURVE_PAD}
        y1={y(SECPIL_MASTERY_SCORE)}
        x2={CURVE_W - CURVE_PAD}
        y2={y(SECPIL_MASTERY_SCORE)}
        className="stroke-success/40"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <path d={area} className="fill-primary/10" />
      <path
        d={`M${line}`}
        className="stroke-primary fill-none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {series.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r={i === series.length - 1 ? 3.5 : 2}
          className={cn(i === series.length - 1 ? "fill-primary" : "fill-primary/60")}
        />
      ))}
    </svg>
  );
}

// --- Bilan d'une session -----------------------------------------------------

function DeltaBadge({ delta }: { delta: number }) {
  const up = delta > 0;
  const flat = delta === 0;
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        flat && "bg-muted text-muted-foreground",
        up && "bg-success/10 text-success",
        !up && !flat && "bg-destructive/10 text-destructive"
      )}
    >
      {flat ? "= votre record" : `${up ? "+" : ""}${delta} pts`}
    </span>
  );
}

function adviceText(advice: SecpilAdvice): React.ReactNode {
  const suggestedLabel = SECPIL_MODES.find((m) => m.mode === advice.suggested)?.label;
  switch (advice.kind) {
    case "keep-going":
      return (
        <>
          Rejouez cette configuration encore deux ou trois fois : en dessous de{" "}
          {SECPIL_MASTERY_SESSIONS} sessions, un score dépend surtout de la journée.
        </>
      );
    case "consolidate":
      return (
        <>
          Vous tenez la configuration, sans encore la dominer. Restez-y jusqu’à dépasser{" "}
          {SECPIL_MASTERY_SCORE} % régulièrement — ajouter une tâche maintenant ferait tout
          s’effondrer.
        </>
      );
    case "step-up":
      return (
        <>
          Configuration acquise. Passez à <strong>{suggestedLabel}</strong> — ou gardez celle-ci en
          montant d’un niveau de calcul.
        </>
      );
    case "max-level":
      return (
        <>
          Vous tenez l’épreuve complète au-dessus du repère. Il reste les niveaux de calcul
          supérieurs, jusqu’au champ libre où plus aucun point de contrôle ne vous relance.
        </>
      );
  }
}

/** Bloc ajouté au bilan de fin de session : record, courbe, conseil. */
export function SecpilSessionReport({
  entry,
  delta,
  best,
  series,
  advice,
}: {
  entry: SecpilSessionEntry;
  delta: number | null;
  best: number | null;
  series: readonly number[];
  advice: SecpilAdvice;
}) {
  const label = configLabel(entry.mode, entry.level);
  const t = trend(series);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-lg border p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm font-semibold">{label}</p>
          {delta !== null ? <DeltaBadge delta={delta} /> : null}
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          {delta === null ? (
            <>Première session dans cette configuration — c’est votre point de départ.</>
          ) : (
            <>
              Record :{" "}
              <span className={cn("font-semibold tabular-nums", best !== null && scoreTone(best))}>
                {best} %
              </span>{" "}
              sur {series.length} session{series.length > 1 ? "s" : ""}.
              {t !== null ? (
                <>
                  {" "}
                  Tendance récente :{" "}
                  <span className={cn("font-semibold tabular-nums", t >= 0 ? "text-success" : "")}>
                    {t > 0 ? "+" : ""}
                    {t} pts
                  </span>
                  .
                </>
              ) : null}
            </>
          )}
        </p>

        {series.length > 1 ? (
          <div className="mt-3 max-w-md">
            <ProgressionCurve series={series} label={label} />
            <p className="text-muted-foreground mt-1 text-xs">
              Vos {series.length} dernières sessions dans cette configuration — échelle 0 à 100 %,
              repère de maîtrise en pointillés.
            </p>
          </div>
        ) : null}
      </div>

      <div className="border-primary/30 bg-primary/5 rounded-lg border p-4">
        <p className="text-sm font-semibold">Et ensuite ?</p>
        <p className="text-muted-foreground mt-1 text-sm">{adviceText(advice)}</p>
      </div>
    </div>
  );
}

// --- Tableau de progression (écran de sélection) -----------------------------

/**
 * Où en est-on sur les cinq modes. Les modes jamais joués restent visibles :
 * c'est le chemin qui reste qui donne son sens à la progression.
 */
export function SecpilProgressTable({ history }: { history: readonly SecpilSessionEntry[] }) {
  const rows = modeSummaries(history);
  const total = history.length;
  if (total === 0) return null;

  return (
    <section className="bg-card rounded-2xl border p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">Votre progression</h2>
      <p className="text-muted-foreground mt-2 max-w-prose text-sm">
        {total} session{total > 1 ? "s" : ""} enregistrée{total > 1 ? "s" : ""} sur cet appareil. Un
        mode est marqué acquis à partir de {SECPIL_MASTERY_SESSIONS} sessions au-dessus de{" "}
        {SECPIL_MASTERY_SCORE} % — repère du site pour savoir quand monter d’un cran, pas un barème
        officiel.
      </p>

      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="border-b-2 text-left">
            <th scope="col" className="py-2 font-semibold">
              Mode
            </th>
            <th scope="col" className="py-2 text-right font-semibold">
              Sessions
            </th>
            <th scope="col" className="py-2 text-right font-semibold">
              Record
            </th>
            <th scope="col" className="hidden py-2 text-right font-semibold sm:table-cell">
              Dernière
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.mode} className="border-b last:border-b-0">
              <td className="py-2.5">
                <span className={cn(row.sessions === 0 && "text-muted-foreground")}>
                  {row.label}
                </span>
                {row.mastered ? (
                  <span className="bg-success/10 text-success ml-2 rounded-full px-2 py-0.5 text-xs font-semibold">
                    acquis
                  </span>
                ) : null}
              </td>
              <td className="text-muted-foreground py-2.5 text-right tabular-nums">
                {row.sessions || "—"}
              </td>
              <td className="py-2.5 text-right font-semibold tabular-nums">
                {row.best !== null ? (
                  <span className={scoreTone(row.best)}>{row.best} %</span>
                ) : (
                  <span className="text-muted-foreground font-normal">—</span>
                )}
              </td>
              <td className="text-muted-foreground hidden py-2.5 text-right tabular-nums sm:table-cell">
                {row.lastDate ? formatDate(row.lastDate) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

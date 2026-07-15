"use client";

import * as React from "react";
import Link from "next/link";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CORSICA_OUTLINE_PATH,
  FRANCE_OUTLINE_PATH,
  MAP_HEIGHT,
  MAP_WIDTH,
  ROLE_LABELS,
  project,
  type ImplantationView,
} from "@/lib/cartes/schema";

/**
 * Carte interactive des implantations d'une armée
 * (docs/editorial/cartes-des-bases.md) — fond de France SVG original,
 * zoom/pan, marqueurs-boutons accessibles, panneau de détail relié au
 * graphe, filtres par rôle. Données publiques, localisation communale.
 */

interface BaseMapProps {
  implantations: ImplantationView[];
  /** Libellé de l'armée pour les intitulés d'accessibilité. */
  armeeLabel: string;
}

export function BaseMap({ implantations, armeeLabel }: BaseMapProps) {
  const roles = React.useMemo(
    () => [...new Set(implantations.flatMap((i) => i.roles))].sort(),
    [implantations]
  );
  const [activeRoles, setActiveRoles] = React.useState<string[]>([]);
  const [selectedSlug, setSelectedSlug] = React.useState<string | null>(null);

  const visible = implantations.filter(
    (implantation) =>
      activeRoles.length === 0 || implantation.roles.some((r) => activeRoles.includes(r))
  );
  const selected = implantations.find((i) => i.slug === selectedSlug) ?? null;

  const toggleRole = (role: string) => {
    setActiveRoles((previous) =>
      previous.includes(role) ? previous.filter((r) => r !== role) : [...previous, role]
    );
    setSelectedSlug(null);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="space-y-3">
        <div aria-label="Filtres par rôle" className="flex flex-wrap gap-2" role="group">
          {roles.map((role) => {
            const active = activeRoles.includes(role);
            const count = implantations.filter((i) => i.roles.includes(role as never)).length;
            return (
              <button
                key={role}
                type="button"
                aria-pressed={active}
                onClick={() => toggleRole(role)}
                className={cn(
                  "focus-visible:ring-ring rounded-full border px-3 py-1 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"
                )}
              >
                {ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role} ({count})
              </button>
            );
          })}
          {activeRoles.length > 0 ? (
            <button
              type="button"
              onClick={() => setActiveRoles([])}
              className="text-muted-foreground focus-visible:ring-ring rounded-full px-3 py-1 text-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
            >
              Tout afficher
            </button>
          ) : null}
        </div>

        <div className="bg-card overflow-hidden rounded-xl border">
          <TransformWrapper minScale={0.9} maxScale={6} doubleClick={{ mode: "zoomIn" }}>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <div className="relative">
                <div
                  className="absolute top-2 right-2 z-10 flex flex-col gap-1"
                  role="group"
                  aria-label="Contrôles de zoom"
                >
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Zoomer"
                    onClick={() => zoomIn()}
                  >
                    <PlusIcon aria-hidden className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Dézoomer"
                    onClick={() => zoomOut()}
                  >
                    <MinusIcon aria-hidden className="size-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Réinitialiser la vue"
                    onClick={() => resetTransform()}
                  >
                    <RotateCcwIcon aria-hidden className="size-4" />
                  </Button>
                </div>
                <TransformComponent wrapperClass="!w-full" contentClass="!w-full">
                  <svg
                    viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
                    role="group"
                    aria-label={`Carte des implantations — ${armeeLabel}`}
                    className="h-auto w-full select-none"
                  >
                    <path
                      d={FRANCE_OUTLINE_PATH}
                      className="fill-muted/60 stroke-border"
                      strokeWidth="1.5"
                    />
                    <path
                      d={CORSICA_OUTLINE_PATH}
                      className="fill-muted/60 stroke-border"
                      strokeWidth="1.5"
                    />
                    {visible.map((implantation) => {
                      const { x, y } = project(implantation.lat, implantation.lon);
                      const isSelected = selectedSlug === implantation.slug;
                      return (
                        <g key={implantation.slug}>
                          <circle
                            cx={x}
                            cy={y}
                            r={isSelected ? 11 : 8}
                            className={cn(
                              "cursor-pointer transition-all",
                              implantation.statut === "active"
                                ? "fill-primary"
                                : "fill-background stroke-primary",
                              isSelected && "stroke-ring stroke-2"
                            )}
                            strokeWidth={implantation.statut === "historique" ? 2 : undefined}
                            role="button"
                            tabIndex={0}
                            aria-label={`${implantation.name} — ${implantation.ville}`}
                            aria-pressed={isSelected}
                            onClick={() => setSelectedSlug(implantation.slug)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setSelectedSlug(implantation.slug);
                              }
                            }}
                          />
                          <text
                            x={x}
                            y={y - 13}
                            textAnchor="middle"
                            className="fill-foreground pointer-events-none text-[11px] font-medium"
                          >
                            {implantation.ville}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </TransformComponent>
              </div>
            )}
          </TransformWrapper>
        </div>
        <p className="text-muted-foreground text-xs">
          Carte pédagogique — les marqueurs pointent la commune, à partir de données publiques.
        </p>
      </div>

      <aside aria-label="Détail de l'implantation" className="space-y-4">
        {selected ? (
          <div className="bg-card space-y-4 rounded-xl border p-6">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">{selected.name}</h2>
              <p className="text-muted-foreground text-sm">
                {selected.ville} · {selected.departement}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <Badge variant={selected.statut === "active" ? "default" : "outline"}>
                  {selected.statut === "active" ? "En activité" : "Historique"}
                </Badge>
                {selected.roles.map((role) => (
                  <Badge key={role} variant="outline" className="font-normal">
                    {ROLE_LABELS[role]}
                  </Badge>
                ))}
              </div>
            </div>

            {selected.ficheHref ? (
              <Link
                href={selected.ficheHref}
                className="text-primary text-sm font-medium underline-offset-4 hover:underline"
              >
                Lire la fiche complète →
              </Link>
            ) : null}

            {selected.liensResolus.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Dans le graphe</h3>
                <ul className="space-y-1 text-sm">
                  {selected.liensResolus.map((lien) => (
                    <li key={lien.href}>
                      <Link
                        href={lien.href}
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {lien.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm leading-6">
            Sélectionnez un marqueur pour afficher le détail — désignation, rôle, unités et
            appareils reliés, et la fiche complète de l&apos;implantation.
          </div>
        )}

        <ul aria-label="Liste des implantations" className="space-y-1">
          {visible.map((implantation) => (
            <li key={implantation.slug}>
              <button
                type="button"
                onClick={() => setSelectedSlug(implantation.slug)}
                aria-pressed={selectedSlug === implantation.slug}
                className={cn(
                  "focus-visible:ring-ring w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  selectedSlug === implantation.slug
                    ? "border-primary bg-accent"
                    : "hover:bg-accent/50"
                )}
              >
                <span className="font-medium">{implantation.name}</span>
                <span className="text-muted-foreground"> — {implantation.ville}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

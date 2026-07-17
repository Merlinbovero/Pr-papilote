"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { ArrowRightIcon, MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FranceMap } from "@/lib/cartes/geo";
import type { MapLandmark } from "@/lib/cartes/landmarks";
import {
  IMPLANTATION_ZONES,
  ROLE_LABELS,
  ZONE_LABELS,
  type ImplantationView,
} from "@/lib/cartes/schema";

/**
 * Carte interactive des implantations d'une armée (design pass D3) — fond de
 * France métropolitaine réaliste (régions projetées, données publiques),
 * zoom/pan, marqueurs-boutons accessibles à la couleur de l'armée, panneau de
 * détail relié au graphe, filtres par rôle. Localisation communale uniquement.
 */

interface BaseMapProps {
  implantations: ImplantationView[];
  /** Libellé de l'armée pour les intitulés d'accessibilité. */
  armeeLabel: string;
  /** Fond de carte (dimensions + tracés des régions), calculé au serveur. */
  map: FranceMap;
  /** Villes repères (contexte géographique), projetées au serveur. */
  landmarks?: MapLandmark[];
  /** Variable CSS de la couleur d'accent de l'armée. */
  accentVar: string;
}

export function BaseMap({
  implantations,
  armeeLabel,
  map,
  landmarks = [],
  accentVar,
}: BaseMapProps) {
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

  // Métropole sur le fond SVG ; outre-mer en cartouches (inset).
  const metropole = visible.filter((i) => (i.zone ?? "metropole") === "metropole");
  const omZones = IMPLANTATION_ZONES.filter((zone) => zone !== "metropole")
    .map((zone) => ({ zone, items: visible.filter((i) => i.zone === zone) }))
    .filter((group) => group.items.length > 0);

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
                  "focus-visible:ring-ring rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  active
                    ? "text-primary-foreground border-transparent"
                    : "hover:bg-accent hover:border-foreground/20"
                )}
                style={active ? { backgroundColor: accentVar } : undefined}
              >
                {ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role}{" "}
                <span className={active ? "opacity-80" : "text-muted-foreground"}>({count})</span>
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

        <div
          className="relative overflow-hidden rounded-2xl border"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in oklab, var(--info) 16%, var(--background)), color-mix(in oklab, var(--info) 8%, var(--background)))",
          }}
        >
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
                    viewBox={`0 0 ${map.width} ${map.height}`}
                    role="group"
                    aria-label={`Carte des implantations — ${armeeLabel}`}
                    className="h-auto w-full select-none"
                  >
                    {/* Fond : régions métropolitaines (terre claire sur mer bleutée) */}
                    {map.regions.map((region) => (
                      <path
                        key={region.code}
                        d={region.path}
                        className="fill-card stroke-border"
                        strokeWidth={1}
                        strokeLinejoin="round"
                      />
                    ))}

                    {/* Villes repères — contexte géographique, non interactif */}
                    <g aria-hidden>
                      {landmarks.map((landmark) => (
                        <g key={landmark.name}>
                          <circle
                            cx={landmark.x}
                            cy={landmark.y}
                            r={1.6}
                            className="fill-muted-foreground/50"
                          />
                          <text
                            x={landmark.x + 4}
                            y={landmark.y + 3}
                            style={{ paintOrder: "stroke" }}
                            className="fill-muted-foreground/70 stroke-background pointer-events-none [stroke-width:2.5px] text-[9px]"
                          >
                            {landmark.name}
                          </text>
                        </g>
                      ))}
                    </g>

                    {/* Marqueurs (métropole) */}
                    {metropole.map((implantation) => {
                      const isSelected = selectedSlug === implantation.slug;
                      const isActive = implantation.statut === "active";
                      return (
                        <g key={implantation.slug}>
                          {isSelected ? (
                            <circle
                              cx={implantation.x}
                              cy={implantation.y}
                              r={16}
                              style={{ fill: accentVar }}
                              className="opacity-20"
                            />
                          ) : null}
                          <circle
                            cx={implantation.x}
                            cy={implantation.y}
                            r={isSelected ? 8 : 6}
                            style={isActive ? { fill: accentVar } : { stroke: accentVar }}
                            className={cn(
                              "cursor-pointer transition-all",
                              isActive ? "stroke-white" : "fill-background"
                            )}
                            strokeWidth={isActive ? 1.5 : 2}
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
                            x={implantation.x}
                            y={implantation.y - 12}
                            textAnchor="middle"
                            style={{ paintOrder: "stroke" }}
                            className="fill-foreground stroke-background pointer-events-none [stroke-width:3px] text-[13px] font-semibold"
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
          Carte pédagogique — fond des régions métropolitaines (données publiques). Les marqueurs
          pointent la commune.
        </p>

        {omZones.length > 0 ? (
          <div className="space-y-2 pt-1">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
              Outre-mer
            </p>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {omZones.map(({ zone, items }) => (
                <li key={zone} className="bg-card rounded-lg border p-2.5">
                  <p className="mb-1.5 text-xs font-semibold">{ZONE_LABELS[zone]}</p>
                  <ul className="space-y-0.5">
                    {items.map((implantation) => (
                      <li key={implantation.slug}>
                        <button
                          type="button"
                          onClick={() => setSelectedSlug(implantation.slug)}
                          aria-pressed={selectedSlug === implantation.slug}
                          className={cn(
                            "focus-visible:ring-ring flex w-full items-center gap-1.5 rounded px-1 py-1 text-left text-xs transition-colors focus-visible:ring-2 focus-visible:outline-none",
                            selectedSlug === implantation.slug ? "bg-accent" : "hover:bg-accent/50"
                          )}
                        >
                          <span
                            aria-hidden
                            className="size-2 shrink-0 rounded-full"
                            style={{ backgroundColor: accentVar }}
                          />
                          <span className="min-w-0 flex-1 truncate">
                            <span className="font-medium">{implantation.code}</span>{" "}
                            <span className="text-muted-foreground">· {implantation.ville}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <aside aria-label="Détail de l'implantation" className="space-y-4">
        {selected ? (
          <div className="bg-card space-y-4 overflow-hidden rounded-2xl border shadow-sm">
            {selected.image ? (
              <figure className="relative -mb-2 aspect-[16/9] w-full">
                <Image
                  src={selected.image.src}
                  alt={selected.image.alt}
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  style={
                    selected.image.focal ? { objectPosition: selected.image.focal } : undefined
                  }
                  className="object-cover"
                />
              </figure>
            ) : null}
            <div className={cn("space-y-4 p-6", selected.image ? "pt-2" : "")}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: accentVar }}
                  />
                  <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    {selected.code}
                  </span>
                </div>
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
                  className="text-primary inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
                >
                  Lire la fiche complète
                  <ArrowRightIcon aria-hidden className="size-4" />
                </Link>
              ) : null}

              {selected.liensResolus.length > 0 ? (
                <div className="space-y-2 border-t pt-4">
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
          </div>
        ) : (
          <div className="bg-card text-muted-foreground rounded-2xl border p-6 text-sm leading-6">
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
                  "focus-visible:ring-ring flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  selectedSlug === implantation.slug ? "bg-accent" : "hover:bg-accent/50"
                )}
                style={selectedSlug === implantation.slug ? { borderColor: accentVar } : undefined}
              >
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full"
                  style={
                    implantation.statut === "active"
                      ? { backgroundColor: accentVar }
                      : { border: `1.5px solid ${accentVar}` }
                  }
                />
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{implantation.name}</span>
                  <span className="text-muted-foreground"> — {implantation.ville}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

import * as React from "react";
import type { PsyInstrument } from "@/lib/psychotech/types";

/**
 * Rendu SVG des cadrans de vol de la famille « lecture-instruments ».
 * Le générateur ne fournit que la donnée physique (cap, vitesse, altitude) ;
 * toute la géométrie est calculée ici. Couleurs issues des tokens (aucune
 * couleur brute). L'étiquette d'accessibilité ne révèle jamais la valeur —
 * l'épreuve est une lecture visuelle.
 */

const CENTER = 110;

/** Coordonnées d'un point à `angle` (0 = haut, sens horaire) et rayon `r`. */
function polar(angle: number, r: number): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180;
  return { x: CENTER + r * Math.sin(rad), y: CENTER - r * Math.cos(rad) };
}

function Dial({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <svg
      viewBox="0 0 220 220"
      role="img"
      aria-label={label}
      className="text-foreground h-56 w-56 max-w-full"
    >
      <circle cx={CENTER} cy={CENTER} r={104} className="fill-card stroke-border" strokeWidth={2} />
      <circle
        cx={CENTER}
        cy={CENTER}
        r={98}
        className="stroke-border fill-none"
        strokeWidth={1}
        opacity={0.6}
      />
      {children}
    </svg>
  );
}

function HeadingDial({ value }: { value: number }) {
  const ticks = Array.from({ length: 36 }, (_, i) => i * 10);
  return (
    <Dial label="Compas de cap — lecture visuelle">
      {ticks.map((t) => {
        const screen = t - value; // le cap `value` est en haut (repère fixe).
        const major = t % 30 === 0;
        const outer = polar(screen, 96);
        const inner = polar(screen, major ? 82 : 89);
        const label = polar(screen, 70);
        const text =
          t === 0 ? "N" : t === 90 ? "E" : t === 180 ? "S" : t === 270 ? "W" : `${t / 10}`;
        return (
          <g key={t}>
            <line
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              className="stroke-foreground"
              strokeWidth={major ? 2 : 1}
              opacity={major ? 1 : 0.5}
            />
            {major ? (
              <text
                x={label.x}
                y={label.y}
                className="fill-foreground"
                fontSize={13}
                fontWeight={600}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {text}
              </text>
            ) : null}
          </g>
        );
      })}
      {/* Repère fixe (lubber line) en haut. */}
      <polygon points={`${CENTER},18 ${CENTER - 7},6 ${CENTER + 7},6`} className="fill-primary" />
      {/* Silhouette avion fixe, nez en haut. */}
      <g className="stroke-primary fill-none" strokeWidth={2.5} strokeLinecap="round">
        <line x1={CENTER} y1={CENTER - 22} x2={CENTER} y2={CENTER + 22} />
        <line x1={CENTER - 18} y1={CENTER} x2={CENTER + 18} y2={CENTER} />
        <line x1={CENTER - 8} y1={CENTER + 20} x2={CENTER + 8} y2={CENTER + 20} />
      </g>
    </Dial>
  );
}

function AirspeedDial({ value }: { value: number }) {
  // 40 → 340 kt sur 300°, de −150° (bas-gauche) à +150° (bas-droite).
  const angleFor = (s: number) => -150 + ((s - 40) / (340 - 40)) * 300;
  const ticks = Array.from({ length: (340 - 40) / 20 + 1 }, (_, i) => 40 + i * 20);
  const needle = polar(angleFor(value), 80);
  return (
    <Dial label="Anémomètre — lecture visuelle de la vitesse">
      {ticks.map((s) => {
        const major = s % 40 === 0;
        const a = angleFor(s);
        const outer = polar(a, 96);
        const inner = polar(a, major ? 80 : 88);
        const label = polar(a, 66);
        return (
          <g key={s}>
            <line
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              className="stroke-foreground"
              strokeWidth={major ? 2 : 1}
              opacity={major ? 1 : 0.5}
            />
            {major ? (
              <text
                x={label.x}
                y={label.y}
                className="fill-foreground"
                fontSize={12}
                fontWeight={600}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {s}
              </text>
            ) : null}
          </g>
        );
      })}
      <text
        x={CENTER}
        y={CENTER + 42}
        className="fill-muted-foreground"
        fontSize={11}
        letterSpacing={1}
        textAnchor="middle"
      >
        KT
      </text>
      <line
        x1={CENTER}
        y1={CENTER}
        x2={needle.x}
        y2={needle.y}
        className="stroke-primary"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={CENTER} cy={CENTER} r={5} className="fill-primary" />
    </Dial>
  );
}

function AltimeterDial({ value }: { value: number }) {
  const numbers = Array.from({ length: 10 }, (_, n) => n);
  const angleLong = ((value % 1000) / 1000) * 360; // centaines (1 tour = 1000 ft)
  const angleShort = ((value % 10000) / 10000) * 360; // milliers (1 tour = 10000 ft)
  const longTip = polar(angleLong, 84);
  const shortTip = polar(angleShort, 54);
  return (
    <Dial label="Altimètre à deux aiguilles — lecture visuelle de l'altitude">
      {numbers.map((n) => {
        const a = n * 36;
        const outer = polar(a, 96);
        const inner = polar(a, 84);
        const label = polar(a, 72);
        return (
          <g key={n}>
            <line
              x1={outer.x}
              y1={outer.y}
              x2={inner.x}
              y2={inner.y}
              className="stroke-foreground"
              strokeWidth={2}
            />
            <text
              x={label.x}
              y={label.y}
              className="fill-foreground"
              fontSize={14}
              fontWeight={700}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {n}
            </text>
          </g>
        );
      })}
      {Array.from({ length: 50 }, (_, i) => i).map((i) => {
        if (i % 5 === 0) return null;
        const a = i * 7.2;
        const outer = polar(a, 96);
        const inner = polar(a, 90);
        return (
          <line
            key={i}
            x1={outer.x}
            y1={outer.y}
            x2={inner.x}
            y2={inner.y}
            className="stroke-foreground"
            strokeWidth={1}
            opacity={0.4}
          />
        );
      })}
      {/* Grande aiguille (centaines) — fine et longue. */}
      <line
        x1={CENTER}
        y1={CENTER}
        x2={longTip.x}
        y2={longTip.y}
        className="stroke-primary"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* Petite aiguille (milliers) — épaisse et courte. */}
      <line
        x1={CENTER}
        y1={CENTER}
        x2={shortTip.x}
        y2={shortTip.y}
        className="stroke-primary"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <circle cx={CENTER} cy={CENTER} r={5} className="fill-primary" />
      <text
        x={CENTER}
        y={CENTER + 46}
        className="fill-muted-foreground"
        fontSize={10}
        letterSpacing={1}
        textAnchor="middle"
      >
        100 FT
      </text>
    </Dial>
  );
}

/** Rendu d'un instrument de vol à lire. */
export function PsyInstrumentView({ instrument }: { instrument: PsyInstrument }) {
  return (
    <div className="flex justify-center py-2">
      {instrument.kind === "cap" ? (
        <HeadingDial value={instrument.value} />
      ) : instrument.kind === "anemometre" ? (
        <AirspeedDial value={instrument.value} />
      ) : (
        <AltimeterDial value={instrument.value} />
      )}
    </div>
  );
}

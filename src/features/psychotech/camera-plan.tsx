import * as React from "react";

import { CAMERA_FOV, type CameraPuzzle } from "@/lib/psychotech/cameras";

/**
 * Plan de la scène vu de dessus — SVG, sans 3D.
 *
 * C'est une **béquille pédagogique** : voir d'un coup où sont les objets et
 * vers où visent les appareils rend la projection mentale beaucoup plus facile.
 * Elle n'est donc offerte qu'au premier niveau et en mode entraînement ; au
 * test, l'aptitude évaluée est justement de s'en passer.
 */

const SIZE = 260;
const WORLD = 12; // demi-étendue représentée, en unités de scène

/** Formes stylisées, reconnaissables sans texte. */
function ObjectMark({ shape, x, y, r }: { shape: string; x: number; y: number; r: number }) {
  const common = "fill-foreground/70 stroke-foreground";
  if (shape === "cube" || shape === "tore") {
    return (
      <rect
        x={x - r}
        y={y - r}
        width={r * 2}
        height={r * 2}
        rx={shape === "tore" ? r : 1}
        className={common}
        strokeWidth={0.8}
      />
    );
  }
  if (shape === "sphere" || shape === "cylindre") {
    return <circle cx={x} cy={y} r={r} className={common} strokeWidth={0.8} />;
  }
  return (
    <polygon
      points={`${x},${y - r} ${x + r},${y + r} ${x - r},${y + r}`}
      className={common}
      strokeWidth={0.8}
    />
  );
}

export function ScenePlan({ puzzle, size = SIZE }: { puzzle: CameraPuzzle; size?: number }) {
  // Repère du plan : x vers la droite, z vers le bas — vue de dessus directe.
  const project = (x: number, z: number) => ({
    px: SIZE / 2 + (x / WORLD) * (SIZE / 2),
    py: SIZE / 2 + (z / WORLD) * (SIZE / 2),
  });
  const half = CAMERA_FOV / 2;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      width={size}
      height={size}
      className="bg-muted/20 h-auto w-full rounded-lg border"
      role="img"
      aria-label={`Plan de la scène vu de dessus : ${puzzle.objects.length} objets et trois appareils photo numérotés.`}
    >
      <rect x={0} y={0} width={SIZE} height={SIZE} className="fill-transparent" />

      {/* Cônes de visée, dessinés en premier pour rester sous les repères. */}
      {puzzle.cameras.map((cam) => {
        const { px, py } = project(cam.x, cam.z);
        const reach = (7 / WORLD) * (SIZE / 2);
        const left = cam.yaw - half;
        const right = cam.yaw + half;
        const p1 = { x: px + Math.sin(left) * reach, y: py + Math.cos(left) * reach };
        const p2 = { x: px + Math.sin(right) * reach, y: py + Math.cos(right) * reach };
        return (
          <polygon
            key={`cone-${cam.label}`}
            points={`${px},${py} ${p1.x},${p1.y} ${p2.x},${p2.y}`}
            className="fill-primary/12 stroke-primary/40"
            strokeWidth={0.7}
          />
        );
      })}

      {puzzle.objects.map((object) => {
        const { px, py } = project(object.x, object.z);
        return (
          <ObjectMark
            key={object.id}
            shape={object.shape}
            x={px}
            y={py}
            r={(object.radius / WORLD) * (SIZE / 2) * 1.6}
          />
        );
      })}

      {puzzle.cameras.map((cam) => {
        const { px, py } = project(cam.x, cam.z);
        return (
          <g key={`cam-${cam.label}`}>
            <circle
              cx={px}
              cy={py}
              r={9}
              className="fill-primary stroke-background"
              strokeWidth={2}
            />
            <text
              x={px}
              y={py}
              textAnchor="middle"
              dominantBaseline="central"
              className="fill-primary-foreground font-bold"
              fontSize={11}
            >
              {cam.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

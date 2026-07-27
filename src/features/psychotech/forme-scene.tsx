"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { boundingRadius, type FormePuzzle, type Piece } from "@/lib/psychotech/formes";

/**
 * Rendu 3D des formes imbriquées — Three.js importé dynamiquement, donc absent
 * du reste du site.
 *
 * Aucun modèle téléchargé : chaque pièce est une **primitive paramétrique**.
 * Un anneau ouvert est un tore d'arc partiel, un disque entaillé un cylindre
 * d'angle partiel, un tube un profil annulaire révolutionné. C'est exactement
 * le vocabulaire de formes de l'épreuve réelle, sans aucune question de droits
 * ni de téléchargement.
 *
 * Le fond reste transparent : la carte qui porte l'image fournit sa propre
 * couleur, donc le rendu suit le thème clair comme le thème sombre.
 */

type ThreeMod = typeof import("three");

interface FormeRenderer {
  renderAssembly: (puzzle: FormePuzzle) => string;
  renderOption: (puzzle: FormePuzzle, optionIndex: number) => string;
  renderPiece: (puzzle: FormePuzzle, optionIndex: number, slot: number, frame: number) => string;
}

const ASSEMBLY_W = 640;
const ASSEMBLY_H = 420;
const OPTION_W = 620;
const OPTION_H = 320;
const PIECE_W = 320;
const PIECE_H = 260;

/**
 * Teintes des pièces. Volontairement **hors palette sémantique** : sur ce site
 * le bleu signale la navigation, le vert la validation, le rouge l'erreur. Une
 * pièce n'est ni juste ni fausse — ses couleurs ne servent qu'à distinguer les
 * volumes, comme les plastiques colorés de l'épreuve réelle.
 */
const TONES = [0xe8823c, 0x2bb6c4, 0xd8438f, 0xe0c341, 0x8b6fd4, 0x5aa469];

let rendererPromise: Promise<FormeRenderer> | null = null;

function geometryFor(THREE: ThreeMod, piece: Piece): import("three").BufferGeometry {
  const turn = Math.PI * 2 * piece.arc;
  switch (piece.kind) {
    case "barre":
      return new THREE.BoxGeometry(piece.radius * 2, piece.height, piece.thickness);
    case "plaque":
      return new THREE.BoxGeometry(piece.radius * 2, piece.height, piece.thickness * 2);
    case "anneau":
      return new THREE.TorusGeometry(piece.radius, piece.thickness, 16, 56, turn);
    case "disque":
      return new THREE.CylinderGeometry(
        piece.radius,
        piece.radius,
        piece.height,
        56,
        1,
        false,
        0,
        turn
      );
    case "cone":
      return new THREE.CylinderGeometry(0.001, piece.radius, piece.height, 56, 1, false, 0, turn);
    case "tube": {
      // Profil annulaire fermé, révolutionné : donne un vrai tube creux, avec
      // une fente quand l'arc est partiel — sans aucune opération booléenne.
      const rExt = piece.radius;
      const rInt = Math.max(0.05, piece.radius - piece.thickness);
      const h = piece.height / 2;
      const profile = [
        new THREE.Vector2(rExt, -h),
        new THREE.Vector2(rExt, h),
        new THREE.Vector2(rInt, h),
        new THREE.Vector2(rInt, -h),
        new THREE.Vector2(rExt, -h),
      ];
      return new THREE.LatheGeometry(profile, 56, 0, turn);
    }
  }
}

/** Direction d'où l'on regarde, projetée au sol — voir `renderGroup`. */
const VIEW_ANGLE = Math.atan2(0.62, 1);

/**
 * Direction vers laquelle pointe l'entaille d'une pièce, mesurée dans le plan
 * horizontal depuis +Z vers +X. Les primitives ne partent pas toutes du même
 * axe : un cylindre ouvre son secteur depuis +Z, un tore depuis +X dans son
 * propre plan, qu'il faut d'abord coucher.
 */
function gapAngle(piece: Piece): number {
  const turn = Math.PI * 2 * piece.arc;
  const middle = (turn + Math.PI * 2) / 2;
  if (piece.kind === "anneau") return Math.atan2(Math.cos(middle), -Math.sin(middle));
  return middle;
}

/**
 * Orientation d'une pièce dans une proposition. Deux règles :
 *
 * - elle ne dépend **que** de la question et du rang de la pièce, jamais de la
 *   proposition — les quatre jeux montrent donc les mêmes pièces sous les
 *   mêmes angles, et seule la forme les distingue ;
 * - l'**entaille est tournée vers l'observateur**. Sans cela, deux jeux qui ne
 *   diffèrent que par une encoche paraîtraient identiques, et la question
 *   n'aurait plus de réponse défendable.
 */
function applyOptionPose(
  mesh: import("three").Object3D,
  puzzle: FormePuzzle,
  piece: Piece,
  slot: number
) {
  const revolution = piece.kind !== "barre" && piece.kind !== "plaque";
  if (!revolution) {
    mesh.rotation.set(0, puzzle.level === 1 ? 0 : ((slot * 0.37) % 1) * 0.9 - 0.45, 0);
    return;
  }
  const lay = piece.kind === "anneau" ? -Math.PI / 2 : 0;
  const tilt = puzzle.level === 1 ? 0.22 : 0.22 + (((slot * 0.29) % 1) - 0.5) * 0.5;
  mesh.rotation.order = "YXZ";
  mesh.rotation.set(lay + tilt, VIEW_ANGLE - gapAngle(piece), 0);
}

async function getFormeRenderer(): Promise<FormeRenderer> {
  if (rendererPromise) return rendererPromise;
  rendererPromise = (async () => {
    const THREE: ThreeMod = await import("three");

    const canvas = document.createElement("canvas");
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x556070, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2);
    key.position.set(5, 8, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.5);
    fill.position.set(-6, 3, -5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.35);
    rim.position.set(0, -4, -6);
    scene.add(rim);

    let content: import("three").Group | null = null;

    const clear = () => {
      if (!content) return;
      scene.remove(content);
      content.traverse((child) => {
        const mesh = child as import("three").Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          (mesh.material as import("three").Material).dispose();
        }
      });
      content = null;
    };

    const meshFor = (piece: Piece) => {
      const material = new THREE.MeshStandardMaterial({
        color: TONES[piece.hue % TONES.length],
        roughness: 0.42,
        metalness: 0.08,
        side: THREE.DoubleSide, // les pièces entaillées laissent voir l'intérieur
      });
      return new THREE.Mesh(geometryFor(THREE, piece), material);
    };

    const renderGroup = (
      group: import("three").Group,
      width: number,
      height: number,
      /** Rayon imposé du cadrage — voir `renderOption`. */
      forcedRadius?: number
    ) => {
      scene.add(group);
      content = group;

      // Cadrage automatique : la caméra recule juste assez pour tout contenir.
      const box = new THREE.Box3().setFromObject(group);
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      if (forcedRadius !== undefined) sphere.radius = forcedRadius;
      const fov = 38;
      const fovV = (fov * Math.PI) / 180;
      const fovH = 2 * Math.atan(Math.tan(fovV / 2) * (width / height));
      const distance =
        (Math.max(sphere.radius / Math.tan(fovV / 2), sphere.radius / Math.tan(fovH / 2)) || 1) *
        1.04;

      const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 200);
      const dir = new THREE.Vector3(0.62, 0.5, 1).normalize();
      camera.position.copy(sphere.center.clone().add(dir.multiplyScalar(distance)));
      camera.lookAt(sphere.center);

      canvas.width = width;
      canvas.height = height;
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
      const url = canvas.toDataURL("image/png");
      clear();
      return url;
    };

    return {
      renderAssembly(puzzle) {
        clear();
        const group = new THREE.Group();
        for (const { piece, pose } of puzzle.assembly) {
          const mesh = meshFor(piece);
          mesh.position.set(...pose.position);
          mesh.rotation.set(...pose.rotation);
          group.add(mesh);
        }
        // Basculement d'ensemble : c'est lui qui change l'angle d'un
        // assemblage à l'autre, donc ce qui oblige à se projeter.
        group.rotation.set(...puzzle.tilt);
        return renderGroup(group, ASSEMBLY_W, ASSEMBLY_H);
      },
      renderOption(puzzle, optionIndex) {
        clear();
        // Les pièces sont alignées et espacées : c'est bien un jeu
        // **désassemblé** qu'on montre, jamais un assemblage.
        // Au-delà de trois pièces, une seule rangée les rendrait minuscules :
        // on passe sur deux rangs, ce qui les grossit d'environ moitié.
        const rowsFor = (count: number) => (count >= 4 ? 2 : 1);

        const layout = (pieces: readonly Piece[]) => {
          const radii = pieces.map(boundingRadius);
          const gap = 0.3;
          const rows = rowsFor(pieces.length);
          const perRow = Math.ceil(pieces.length / rows);
          const widths: number[] = [];
          for (let r = 0; r < rows; r += 1) {
            const slice = radii.slice(r * perRow, (r + 1) * perRow);
            widths.push(slice.reduce((sum, v) => sum + v * 2, 0) + gap * (slice.length - 1));
          }
          const rowHeight = Math.max(...radii) * 2 + gap;
          return { radii, gap, rows, perRow, widths, rowHeight };
        };

        // Cadrage **commun aux quatre propositions**. Sans cela, le jeu
        // contenant la pièce la plus courte serait rendu plus gros, et le zoom
        // trahirait la réponse sans qu'on ait à regarder les formes.
        const widest = Math.max(
          ...puzzle.options.map((set) => {
            const l = layout(set);
            return Math.max(Math.max(...l.widths), l.rowHeight * l.rows * 1.4);
          })
        );

        const pieces = puzzle.options[optionIndex];
        const { radii, gap, rows, perRow, widths, rowHeight } = layout(pieces);
        const group = new THREE.Group();
        for (let row = 0; row < rows; row += 1) {
          const slice = pieces.slice(row * perRow, (row + 1) * perRow);
          let x = -widths[row] / 2;
          const y = ((rows - 1) / 2 - row) * rowHeight;
          slice.forEach((piece, i) => {
            const slot = row * perRow + i;
            const r = radii[slot];
            x += r;
            const mesh = meshFor(piece);
            mesh.position.set(x, y, 0);
            applyOptionPose(mesh, puzzle, piece, slot);
            group.add(mesh);
            x += r + gap;
          });
        }
        return renderGroup(group, OPTION_W, OPTION_H, widest / 2);
      },
      renderPiece(puzzle, optionIndex, slot, frame) {
        clear();
        const piece = puzzle.options[optionIndex][slot];
        const group = new THREE.Group();
        const mesh = meshFor(piece);
        applyOptionPose(mesh, puzzle, piece, slot);
        group.add(mesh);
        // Cadrage imposé, commun aux deux pièces comparées : sans lui, une
        // pièce plus courte serait rendue plus grosse et la comparaison
        // mentirait.
        return renderGroup(group, PIECE_W, PIECE_H, frame);
      },
    };
  })();
  return rendererPromise;
}

// ---------------------------------------------------------------------------
// Composants
// ---------------------------------------------------------------------------

type Kind =
  | { mode: "assembly" }
  | { mode: "option"; optionIndex: number }
  /** Une seule pièce, en grand — pour mettre en regard celle qui change. */
  | { mode: "piece"; optionIndex: number; slot: number; frame: number };

/**
 * Une image de formes. Le rendu se fait une fois puis reste une image fixe :
 * pas de boucle d'animation, rien qui tourne en fond — et l'assemblage n'est
 * pas manipulable, comme aux sélections.
 */
export function FormeImage({
  puzzle,
  kind,
  alt,
  className,
}: {
  puzzle: FormePuzzle;
  kind: Kind;
  alt: string;
  className?: string;
}) {
  const mode = kind.mode;
  const optionIndex = kind.mode === "assembly" ? -1 : kind.optionIndex;
  const slot = kind.mode === "piece" ? kind.slot : -1;
  const frame = kind.mode === "piece" ? kind.frame : 0;
  const signature = `${puzzle.id}|${mode}:${optionIndex}:${slot}:${frame}`;

  const [rendered, setRendered] = React.useState<{ key: string; src: string } | null>(null);

  React.useEffect(() => {
    let active = true;
    void getFormeRenderer().then((renderer) => {
      if (!active) return;
      const image =
        mode === "assembly"
          ? renderer.renderAssembly(puzzle)
          : mode === "option"
            ? renderer.renderOption(puzzle, optionIndex)
            : renderer.renderPiece(puzzle, optionIndex, slot, frame);
      setRendered({ key: signature, src: image });
    });
    return () => {
      active = false;
    };
  }, [puzzle, mode, optionIndex, slot, frame, signature]);

  const src = rendered?.key === signature ? rendered.src : null;

  return (
    <div
      className={cn(
        "bg-muted/40 relative overflow-hidden rounded-lg border",
        mode === "assembly"
          ? "aspect-[640/420]"
          : mode === "option"
            ? "aspect-[620/320]"
            : "aspect-[320/260]",
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- image produite dans le navigateur (data URL), hors pipeline next/image
        <img src={src} alt={alt} className="h-full w-full object-contain" />
      ) : (
        <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
          Rendu en cours…
        </div>
      )}
    </div>
  );
}

/** Précharge le moteur 3D pour que la première question ne se fasse pas attendre. */
export function usePreloadFormes() {
  React.useEffect(() => {
    void getFormeRenderer();
  }, []);
}

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  CAMERA_FOV,
  type CameraPuzzle,
  type SceneCamera,
  type SceneObject,
} from "@/lib/psychotech/cameras";

/**
 * Rendu 3D du test des appareils photos — Three.js importé dynamiquement, donc
 * absent du reste du site.
 *
 * Aucun modèle téléchargé : les objets sont des **primitives calculées**
 * (cube, cône, cylindre, sphère, pyramide, tore). Pour une épreuve de
 * perspective, seule compte la silhouette et la position relative — un modèle
 * importé n'apporterait rien et coûterait un téléchargement, une échelle à
 * recaler et une licence à créditer.
 */

type ThreeMod = typeof import("three");

/** Deux rendus par question : la scène vue de biais, et la vue de l'objectif. */
interface SceneRenderer {
  renderView: (puzzle: CameraPuzzle, cameraIndex: number) => string;
  renderOverview: (puzzle: CameraPuzzle) => string;
}

const VIEW_W = 640;
const VIEW_H = 420;

/** Teintes des objets — franches et distinctes, pour se reconnaître de loin. */
const TONES = [0xd94f4f, 0x3b82f6, 0x22a06b, 0xe0a13a, 0x8b5cf6, 0x0ea5e9, 0xef7d3d];

let rendererPromise: Promise<SceneRenderer> | null = null;

async function getSceneRenderer(): Promise<SceneRenderer> {
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

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x445566, 1.2));
    const key = new THREE.DirectionalLight(0xffffff, 1.9);
    key.position.set(6, 10, 4);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.45);
    fill.position.set(-6, 4, -5);
    scene.add(fill);

    // Sol : un damier discret donne l'échelle et la profondeur sans distraire.
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.MeshStandardMaterial({ color: 0xf1f3f6, roughness: 1 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);
    const grid = new THREE.GridHelper(40, 40, 0xc7ccd4, 0xdfe3e9);
    grid.position.y = 0.002;
    scene.add(grid);

    const shapeGeometry = (shape: SceneObject["shape"], radius: number, height: number) => {
      switch (shape) {
        case "cube":
          return new THREE.BoxGeometry(radius * 1.7, height, radius * 1.7);
        case "cone":
          return new THREE.ConeGeometry(radius, height, 28);
        case "cylindre":
          return new THREE.CylinderGeometry(radius, radius, height, 28);
        case "sphere":
          return new THREE.SphereGeometry(radius, 28, 20);
        case "pyramide":
          return new THREE.ConeGeometry(radius * 1.25, height, 4);
        case "tore":
          return new THREE.TorusGeometry(radius * 0.72, radius * 0.3, 14, 30);
      }
    };

    /** Un groupe jetable qui porte les objets de la question courante. */
    let content: import("three").Group | null = null;

    const build = (puzzle: CameraPuzzle, withCameras: boolean) => {
      if (content) {
        scene.remove(content);
        content.traverse((child) => {
          const mesh = child as import("three").Mesh;
          if (mesh.isMesh) {
            mesh.geometry.dispose();
            (mesh.material as import("three").Material).dispose();
          }
        });
      }
      const group = new THREE.Group();

      for (const object of puzzle.objects) {
        const geometry = shapeGeometry(object.shape, object.radius, object.height);
        const material = new THREE.MeshStandardMaterial({
          color: TONES[object.tone % TONES.length],
          roughness: 0.55,
          metalness: 0.05,
        });
        const mesh = new THREE.Mesh(geometry, material);
        // Le tore se pose sur la tranche ; les autres reposent sur leur base.
        mesh.position.set(
          object.x,
          object.shape === "tore" ? object.radius * 1.02 : object.height / 2,
          object.z
        );
        if (object.shape === "sphere") mesh.position.y = object.radius;
        group.add(mesh);
      }

      if (withCameras) {
        for (const cam of puzzle.cameras) {
          group.add(cameraGizmo(THREE, cam));
        }
      }

      scene.add(group);
      content = group;
    };

    const renderAt = (
      position: [number, number, number],
      lookAt: [number, number, number],
      fovDeg: number,
      width: number,
      height: number
    ) => {
      const camera = new THREE.PerspectiveCamera(fovDeg, width / height, 0.1, 200);
      camera.position.set(...position);
      camera.lookAt(...lookAt);
      canvas.width = width;
      canvas.height = height;
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
      return canvas.toDataURL("image/png");
    };

    return {
      renderView(puzzle, cameraIndex) {
        build(puzzle, false);
        const cam = puzzle.cameras[cameraIndex];
        // Hauteur d'œil : assez bas pour que les objets s'occultent vraiment.
        const eye: [number, number, number] = [cam.x, 1.15, cam.z];
        const target: [number, number, number] = [
          cam.x + Math.sin(cam.yaw) * 10,
          0.9,
          cam.z + Math.cos(cam.yaw) * 10,
        ];
        // Le champ vertical découle du champ horizontal et du format d'image.
        const fovV = (2 * Math.atan(Math.tan(CAMERA_FOV / 2) / (VIEW_W / VIEW_H)) * 180) / Math.PI;
        return renderAt(eye, target, fovV, VIEW_W, VIEW_H);
      },
      renderOverview(puzzle) {
        build(puzzle, true);
        return renderAt([0, 15.5, -15.5], [0, 0, 0], 46, VIEW_W, VIEW_H);
      },
    };
  })();
  return rendererPromise;
}

/**
 * Étiquette numérotée, dessinée sur un canvas puis affichée en sprite : elle
 * fait toujours face à l'observateur, quel que soit l'angle de la vue
 * d'ensemble. Sans elle, on verrait trois appareils sans savoir lequel est
 * lequel — et la question n'aurait plus de sens.
 */
function labelSprite(THREE: ThreeMod, text: string): import("three").Sprite {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#1d4ed8";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 74px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, size / 2, size / 2 + 4);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true })
  );
  sprite.scale.set(1.5, 1.5, 1);
  return sprite;
}

/** Le petit boîtier d'un appareil, son cône de visée et son numéro. */
function cameraGizmo(THREE: ThreeMod, cam: SceneCamera): import("three").Group {
  const group = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.5, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.5 })
  );
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.2, 0.34, 20),
    new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.35, metalness: 0.4 })
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.z = 0.36;
  group.add(body, lens);

  // Cône de visée : ouvert comme le champ réel, translucide.
  const length = 2.6;
  const spread = Math.tan(CAMERA_FOV / 2) * length;
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(spread, length, 4, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.16,
      side: THREE.DoubleSide,
    })
  );
  cone.rotation.x = Math.PI / 2;
  cone.rotation.y = Math.PI / 4;
  cone.position.z = length / 2 + 0.3;
  group.add(cone);

  group.position.set(cam.x, 0.85, cam.z);
  group.rotation.y = cam.yaw;

  // Le numéro est ajouté hors du groupe orienté : un sprite ne doit pas
  // hériter de la rotation de l'appareil, il fait face à l'observateur.
  const wrapper = new THREE.Group();
  wrapper.add(group);
  const label = labelSprite(THREE, String(cam.label));
  label.position.set(cam.x, 2.1, cam.z);
  wrapper.add(label);
  return wrapper;
}

// ---------------------------------------------------------------------------
// Composants
// ---------------------------------------------------------------------------

type Kind = { mode: "view"; cameraIndex: number } | { mode: "overview" };

/**
 * Une image de la scène. Le rendu se fait une fois par question et le résultat
 * est conservé en image : pas de boucle d'animation, rien qui tourne en fond.
 */
export function SceneImage({
  puzzle,
  kind,
  alt,
  className,
}: {
  puzzle: CameraPuzzle;
  kind: Kind;
  alt: string;
  className?: string;
}) {
  // Clé du rendu demandé : elle sert à la fois de dépendance d'effet et de
  // garde, pour n'afficher une image que si elle correspond à la question
  // courante. L'état n'est ainsi jamais remis à zéro pendant le rendu.
  const wanted =
    kind.mode === "view"
      ? `${puzzle.objects.map((o) => o.id).join()}|view:${kind.cameraIndex}`
      : "overview";
  const signature = `${puzzle.cameras.map((c) => `${c.x},${c.z}`).join(";")}|${wanted}`;

  const [rendered, setRendered] = React.useState<{ key: string; src: string } | null>(null);
  const mode = kind.mode;
  const cameraIndex = kind.mode === "view" ? kind.cameraIndex : -1;

  React.useEffect(() => {
    let active = true;
    void getSceneRenderer().then((renderer) => {
      if (!active) return;
      const image =
        mode === "view"
          ? renderer.renderView(puzzle, cameraIndex)
          : renderer.renderOverview(puzzle);
      setRendered({ key: signature, src: image });
    });
    return () => {
      active = false;
    };
  }, [puzzle, mode, cameraIndex, signature]);

  const src = rendered?.key === signature ? rendered.src : null;

  return (
    <div
      className={cn(
        "bg-muted/30 relative overflow-hidden rounded-lg border",
        "aspect-[640/420]",
        className
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- image produite dans le navigateur (data URL), hors pipeline next/image
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
          Rendu en cours…
        </div>
      )}
    </div>
  );
}

/** Précharge le moteur 3D pour que la première question ne se fasse pas attendre. */
export function usePreloadScene() {
  React.useEffect(() => {
    void getSceneRenderer();
  }, []);
}

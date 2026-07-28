"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlancheTop } from "@/features/design-lab/planche";
import {
  type CellContent,
  type TrianglePiece,
  type TrianglePuzzle,
  allCells,
  buildTriangleSession,
  key,
  scoreTriangleSession,
} from "@/lib/psychotech/triangles";
// La géométrie des cases est celle du rendu de production : une pièce se
// présente donc exactement dans l'orientation de son trou.
import { cellPolygon } from "@/features/psychotech/triangle-figure";

/**
 * Prototype — Le Banc.
 *
 * Le moteur d'épreuve est celui de production (`src/lib/psychotech/triangles.ts`),
 * repris tel quel : aucune règle, aucun tirage, aucun barème n'est réécrit ici.
 * Ce composant n'écrit **rien** — ni progression, ni score, ni stockage local :
 * l'état vit dans la page et meurt avec elle.
 */

/** Le format officiel de l'épreuve EOPAN : 20 figures en 8 minutes. */
const FORMAT = "officiel" as const;
const DUREE_SECONDES = 8 * 60;

/** Palette du test — délibérément hors de la palette sémantique PLANCHE :
 *  un candidat ne doit jamais lire une couleur de figure comme un état. */
const CLASSES = ["pl-c0", "pl-c1", "pl-c2", "pl-c0", "pl-c1", "pl-c2"] as const;

function Figure({
  puzzle,
  piece,
  titre,
}: {
  puzzle: TrianglePuzzle;
  piece?: TrianglePiece | null;
  titre: string;
}) {
  const { size, grid, hole } = puzzle;
  const cells = allCells(size);
  const trous = new Set(hole.map((c) => key(c.row, c.col)));
  const remplissage = new Map<string, CellContent>();
  if (piece) {
    piece.cells.forEach((cell, i) => {
      remplissage.set(key(cell.row, cell.col), piece.contents[i]);
    });
  }
  // Le repère de `cellPolygon` est celui de la production : côté 100,
  // hauteur 100·√3/2. Un viewBox calculé autrement rogne la figure.
  const largeur = size * 100;
  const hauteur = size * ((100 * Math.sqrt(3)) / 2);

  return (
    <svg
      viewBox={`-2 -2 ${largeur + 4} ${hauteur + 4}`}
      className="pl-tri"
      role="img"
      aria-label={titre}
    >
      {cells.map((cell) => {
        const k = key(cell.row, cell.col);
        const points = cellPolygon(cell.row, cell.col, size)
          .map(([x, y]) => `${x},${y}`)
          .join(" ");
        const estTrou = trous.has(k);
        const contenu = estTrou ? remplissage.get(k) : grid[k];
        if (estTrou && !contenu) {
          return <polygon key={k} points={points} className="pl-vide" />;
        }
        return (
          <polygon
            key={k}
            points={points}
            className={CLASSES[(contenu?.color ?? 0) % CLASSES.length]}
          />
        );
      })}
    </svg>
  );
}

function Losange({
  puzzle,
  piece,
  titre,
}: {
  puzzle: TrianglePuzzle;
  piece: TrianglePiece;
  titre: string;
}) {
  const { size } = puzzle;
  // La pièce est dessinée avec la MÊME géométrie que la figure, donc dans
  // l'orientation exacte de son trou — jamais un dessin séparé.
  const polys = piece.cells.map((cell) => cellPolygon(cell.row, cell.col, size));
  const xs = polys.flat().map(([x]) => x);
  const ys = polys.flat().map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(...xs) - minX;
  const h = Math.max(...ys) - minY;

  return (
    <svg
      viewBox={`${minX - 2} ${minY - 2} ${w + 4} ${h + 4}`}
      className="pl-tri"
      role="img"
      aria-label={titre}
    >
      {polys.map((points, i) => (
        <polygon
          key={`${piece.cells[i].row}-${piece.cells[i].col}`}
          points={points.map(([x, y]) => `${x},${y}`).join(" ")}
          className={CLASSES[piece.contents[i].color % CLASSES.length]}
        />
      ))}
    </svg>
  );
}

function chrono(secondes: number): string {
  const m = Math.floor(secondes / 60);
  const s = secondes % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type Phase = "consigne" | "session" | "correction";

export function PlancheBanc({ seed }: { seed: number }) {
  const puzzles = useMemo(() => buildTriangleSession(seed, FORMAT), [seed]);
  const [phase, setPhase] = useState<Phase>("consigne");
  const [index, setIndex] = useState(0);
  const [reponses, setReponses] = useState<(number | null)[]>(() => puzzles.map(() => null));
  const [restant, setRestant] = useState(DUREE_SECONDES);
  // Le temps écoulé fait basculer la phase par DÉRIVATION, pas par un effet
  // qui écrirait dans l'état : moins de rendus, et aucune fenêtre où l'écran
  // afficherait 00:00 tout en acceptant encore une réponse.

  const hautRef = useRef<HTMLDivElement>(null);
  const premiereOptionRef = useRef<HTMLButtonElement>(null);
  const phaseEffective: Phase = phase === "session" && restant === 0 ? "correction" : phase;

  // Le chronomètre ne s'affole pas et ne change pas de couleur : il compte.
  useEffect(() => {
    if (phase !== "session") return;
    const id = window.setInterval(() => {
      setRestant((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  // Le défilement revient en haut à chaque changement de phase ET à chaque
  // question : sans cela, on atterrit sur les propositions avant d'avoir vu
  // la figure. C'est une exigence de conception, pas un détail.
  useEffect(() => {
    hautRef.current?.scrollIntoView({ block: "start" });
    if (phaseEffective === "session") premiereOptionRef.current?.focus();
  }, [phaseEffective, index]);

  const repondre = useCallback(
    (choix: number) => {
      setReponses((prev) => {
        const suivant = [...prev];
        suivant[index] = choix;
        return suivant;
      });
      if (index + 1 >= puzzles.length) {
        setPhase("correction");
      } else {
        setIndex((i) => i + 1);
      }
    },
    [index, puzzles.length]
  );

  // Navigation clavier : 1 à 4 ou A à D répondent, sans quitter le clavier.
  useEffect(() => {
    if (phaseEffective !== "session") return;
    const onKey = (event: KeyboardEvent) => {
      const touche = event.key.toLowerCase();
      const parChiffre = ["1", "2", "3", "4"].indexOf(touche);
      const parLettre = ["a", "b", "c", "d"].indexOf(touche);
      const choix = parChiffre >= 0 ? parChiffre : parLettre;
      if (choix >= 0 && choix < puzzles[index].options.length) {
        event.preventDefault();
        repondre(choix);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phaseEffective, index, puzzles, repondre]);

  const score = useMemo(() => scoreTriangleSession(puzzles, reponses), [puzzles, reponses]);
  const puzzle = puzzles[index];

  if (phaseEffective === "consigne") {
    return (
      <>
        <PlancheTop actif="/design-lab/planche/banc" />
        <div className="pl-page" ref={hautRef}>
          <div className="pl-corps">
            <p className="pl-sur">Psychotechnique</p>
            <h1 className="pl-titre">Le test des triangles</h1>
            <div className="pl-ft" />
            <p className="pl-chapo">
              Un grand triangle découpé en petits triangles coloriés, deux laissés blancs, quatre
              losanges proposés. La figure obéit à une règle : trouver la règle, c&rsquo;est trouver
              la pièce.
            </p>

            <h2 className="pl-sec">
              <span className="pl-repere" aria-hidden="true" />
              L&rsquo;épreuve
            </h2>
            <table className="pl-tab">
              <tbody>
                <tr>
                  <td>Durée</td>
                  <td className="pl-v">8 min</td>
                </tr>
                <tr>
                  <td>Figures</td>
                  <td className="pl-v">{puzzles.length}</td>
                </tr>
                <tr>
                  <td>Propositions</td>
                  <td className="pl-v">4</td>
                </tr>
                <tr>
                  <td>Cadence</td>
                  <td className="pl-v">24 s</td>
                </tr>
                <tr>
                  <td>Concours</td>
                  <td className="pl-v">EOPAN</td>
                </tr>
              </tbody>
            </table>

            <div className="pl-enc">
              <p className="pl-enc-l">Avant de vous lancer</p>
              <p>
                Fiche de méthode — <em>Le test des triangles</em> : les sept familles de règles, la
                méthode en quatre temps, le piège des marques.
              </p>
            </div>

            <div className="pl-btns">
              <button type="button" className="pl-btn" onClick={() => setPhase("session")}>
                Commencer
              </button>
            </div>
            <p className="pl-an-note">
              Prototype : aucune séance n&rsquo;est enregistrée, aucun score n&rsquo;est transmis.
            </p>
          </div>

          <aside className="pl-annexe">
            <p className="pl-an-h">Relevé</p>
            <table className="pl-tab">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>—</td>
                  <td className="pl-v pl-vide">—</td>
                  <td className="pl-v pl-vide">—</td>
                </tr>
              </tbody>
            </table>
            <p className="pl-an-note">
              Un relevé, pas un tableau de bord : ni jauge, ni badge, ni série. Aucune séance
              enregistrée — les cases se lisent « — ».
            </p>
          </aside>
        </div>
      </>
    );
  }

  if (phaseEffective === "session") {
    return (
      <div className="pl-banc" ref={hautRef}>
        <div className="pl-banc-h">
          <span>
            {index + 1} / {puzzles.length}
          </span>
          <span aria-label={`Temps restant ${chrono(restant)}`}>{chrono(restant)}</span>
        </div>

        <div className="pl-banc-f">
          <Figure puzzle={puzzle} titre={`Figure ${index + 1} : deux cases sont à compléter`} />
        </div>

        <div className="pl-banc-sep" />

        <div className="pl-opts" role="group" aria-label="Quatre propositions">
          {puzzle.options.map((piece, i) => (
            <button
              key={`${puzzle.id}-${i}`}
              type="button"
              className="pl-opt"
              ref={i === 0 ? premiereOptionRef : undefined}
              onClick={() => repondre(i)}
            >
              <span className="pl-opt-l">{"ABCD"[i]}</span>
              <Losange puzzle={puzzle} piece={piece} titre={`Proposition ${"ABCD"[i]}`} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  const erreurs = puzzles
    .map((p, i) => ({ p, i, choix: reponses[i] }))
    .filter(({ p, choix }) => choix !== null && choix !== p.answerIndex);

  return (
    <>
      <PlancheTop actif="/design-lab/planche/banc" />
      <div className="pl-page" ref={hautRef}>
        <div className="pl-corps">
          <p className="pl-sur">Psychotechnique</p>
          <h1 className="pl-titre">Résultat</h1>
          <div className="pl-ft" />

          <p className="pl-score">
            {score.correct} / {score.total}
          </p>
          <table className="pl-tab">
            <tbody>
              <tr>
                <td>Répondues</td>
                <td className="pl-v">{score.answered}</td>
              </tr>
              <tr>
                <td>Justesse</td>
                <td className="pl-v">{Math.round(score.precision * 100)} %</td>
              </tr>
              <tr>
                <td>Meilleure série</td>
                <td className="pl-v">{score.bestStreak}</td>
              </tr>
              <tr>
                <td>Temps employé</td>
                <td className="pl-v">{chrono(DUREE_SECONDES - restant)}</td>
              </tr>
            </tbody>
          </table>

          <h2 className="pl-sec">
            <span className="pl-repere" aria-hidden="true" />
            {erreurs.length > 0 ? "Vos erreurs" : "Aucune erreur"}
          </h2>

          {erreurs.map(({ p, i, choix }) => (
            <section key={p.id} aria-label={`Erreur à la figure ${i + 1}`}>
              <p>
                <strong>Figure {i + 1}</strong> — {p.rule}
              </p>
              <div className="pl-cmp">
                <figure className="pl-mauvais">
                  <figcaption>Votre réponse</figcaption>
                  <Losange puzzle={p} piece={p.options[choix as number]} titre="Votre réponse" />
                </figure>
                <figure className="pl-bon">
                  <figcaption>Réponse attendue</figcaption>
                  <Losange puzzle={p} piece={p.options[p.answerIndex]} titre="Réponse attendue" />
                </figure>
              </div>
              <p>{p.differences[choix as number] ?? "La pièce choisie ne suit pas la règle."}</p>
            </section>
          ))}

          <div className="pl-btns">
            <button
              type="button"
              className="pl-btn pl-ghost"
              onClick={() => {
                setPhase("consigne");
                setIndex(0);
                setReponses(puzzles.map(() => null));
                setRestant(DUREE_SECONDES);
              }}
            >
              Revenir à la consigne
            </button>
          </div>
        </div>

        <aside className="pl-annexe">
          <p className="pl-an-h">Revoir</p>
          <div className="pl-an-row">
            <span>Fiche de méthode</span>
          </div>
          <div className="pl-an-row">
            <span>Les sept familles de règles</span>
          </div>
          <p className="pl-an-note">
            La couleur double le libellé, elle ne le remplace pas : « votre réponse » et « réponse
            attendue » restent lisibles sans percevoir le rouge ni le vert.
          </p>
        </aside>
      </div>
    </>
  );
}

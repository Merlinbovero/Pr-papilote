import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { NotionQuiz } from "./notion-quiz";
import type { PlayerQuestion } from "./quiz-player";

/**
 * Premier des deux niveaux de protection contre une fuite du Banc.
 *
 * Le registre `AUTRES_APPELANTS` (end-to-end) surveille les PAGES : une entrée
 * par chemin d'intégration indépendant. Ce test-ci surveille le COMPOSANT :
 * `NotionQuiz` ne doit pas porter la nouvelle charte de lui-même, quel que
 * soit le gabarit qui le rend.
 *
 * Les deux niveaux ne se recouvrent pas. Une fuite venue du composant se
 * verrait sur les cinq gabarits à la fois ; une fuite venue d'un seul gabarit
 * ne se verrait que là. Aucun des deux ne rend l'autre superflu.
 *
 * `NotionQuiz` ne passe aucun `variant` à `QuizPlayer`, qui retombe donc sur
 * `legacy`. C'est cette omission — invisible à la lecture, facile à défaire —
 * que le contrôle grave.
 */

const VIVIER: PlayerQuestion[] = [
  {
    id: "notion.01",
    theme: "meteorologie",
    difficulty: 1,
    statement: "Le vent est nommé par la direction d’où il vient.",
    choices: [{ label: "Vrai" }, { label: "Faux" }],
    correctChoices: [0],
    explanation: "Un vent de 270° souffle de l’ouest vers l’est.",
  },
];

/** Toute classe du registre Banc, à quelque profondeur que ce soit. */
function classesBanc(racine: HTMLElement): string[] {
  return [...racine.querySelectorAll<HTMLElement>("[class]")]
    .flatMap((e) => [...e.classList])
    .filter((c) => c === "banc" || c.startsWith("banc-"));
}

describe("NotionQuiz — rendu historique", () => {
  it("n'émet aucune classe du Banc avant le tirage", () => {
    const { container } = render(<NotionQuiz ficheTitle="Le vent" pool={VIVIER} />);
    expect(screen.getByRole("heading", { name: /Tester cette notion/ })).toBeInTheDocument();
    expect(classesBanc(container)).toEqual([]);
  });

  it("n'émet aucune classe du Banc une fois la série lancée", async () => {
    const utilisateur = userEvent.setup();
    const { container } = render(<NotionQuiz ficheTitle="Le vent" pool={VIVIER} />);

    // Le tirage se fait au clic, jamais au rendu : c'est donc APRÈS le clic
    // que le lecteur existe, et seulement là que la fuite serait visible.
    await utilisateur.click(screen.getByRole("button", { name: /Tester cette notion/i }));

    expect(screen.getByText(VIVIER[0].statement)).toBeInTheDocument();
    expect(classesBanc(container)).toEqual([]);
  });
});

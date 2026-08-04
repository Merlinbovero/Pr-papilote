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
 * **Ce paragraphe disait le contraire du code, et il est corrigé au lot F12.**
 * Il affirmait que `NotionQuiz` ne passait aucun `variant` et retombait donc
 * sur `legacy` : c'était vrai avant le lot F4, qui l'a classé `documentaire`
 * sans mettre à jour ce commentaire. Le fichier même dont la raison d'être est
 * d'empêcher une dérive silencieuse de registre en décrivait un faux — un
 * relecteur s'y fiant aurait cru l'arbitrage encore à faire.
 *
 * Ce que le contrôle grave est donc exact, et inchangé : `documentaire` **ne
 * prend pas** l'apparence du Banc. Il tient son contrat d'accessibilité, ce
 * qui est une autre chose, et se vérifie ailleurs.
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

describe("NotionQuiz — relance d'une série", () => {
  /*
    Le vivier compte DEUX questions pour une série d'UNE : c'est la condition
    d'apparition du bouton, `NotionQuiz` ne proposant « Nouvelle série » que
    lorsqu'il reste de quoi tirer autre chose.
  */
  const VIVIER_2: PlayerQuestion[] = [
    VIVIER[0],
    { ...VIVIER[0], id: "notion.02", statement: "L’aérostat tient par la poussée d’Archimède." },
  ];

  it("« Nouvelle série » repart d'une question, même après la fin", async () => {
    const utilisateur = userEvent.setup();
    render(<NotionQuiz ficheTitle="Le vent" pool={VIVIER_2} seriesSize={1} />);

    await utilisateur.click(screen.getByRole("button", { name: /Tester cette notion/i }));
    await utilisateur.click(screen.getByRole("button", { name: "Vrai" }));
    await utilisateur.click(screen.getByRole("button", { name: "Valider" }));
    await utilisateur.click(screen.getByRole("button", { name: /Voir le résultat/i }));

    await utilisateur.click(screen.getByRole("button", { name: /Nouvelle série/i }));

    // Le lecteur doit être revenu à une question posée, pas rester au score.
    expect(screen.getByRole("button", { name: "Valider" })).toBeInTheDocument();
  });
});

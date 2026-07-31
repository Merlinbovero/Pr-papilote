import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Progress } from "./progress";

/**
 * Contrat de la barre de progression — lot F1a.
 *
 * L'audit F0b avait relevé deux défauts que rien n'empêchait de revenir :
 * la valeur n'était pas exposée, et deux consommateurs sur trois n'avaient
 * pas de nom accessible. Ces tests transforment les deux constats en garde.
 */

describe("Progress", () => {
  it("expose la valeur : la barre n'est plus indéterminée", () => {
    render(<Progress aria-label="Progression du quiz" value={40} />);
    const barre = screen.getByRole("progressbar", { name: "Progression du quiz" });

    // C'était le défaut : `value` n'atteignait pas la racine Radix, qui
    // restait « indeterminate » et n'émettait aucun `aria-valuenow`.
    expect(barre).toHaveAttribute("aria-valuenow", "40");
    expect(barre).toHaveAttribute("aria-valuemin", "0");
    expect(barre).toHaveAttribute("aria-valuemax", "100");
    expect(barre.getAttribute("data-state")).not.toBe("indeterminate");
  });

  it("relaie le libellé de valeur fourni par le consommateur", () => {
    render(
      <Progress
        aria-label="Progression de l’examen"
        aria-valuetext="18 réponses complétées sur 100"
        value={18}
      />
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuetext",
      "18 réponses complétées sur 100"
    );
  });

  it("accepte un nom accessible par référence", () => {
    render(
      <>
        <span id="titre-progression">Progression de la séance</span>
        <Progress aria-labelledby="titre-progression" value={0} />
      </>
    );
    expect(
      screen.getByRole("progressbar", { name: "Progression de la séance" })
    ).toBeInTheDocument();
  });

  it("reste cohérente aux bornes", () => {
    const { rerender } = render(<Progress aria-label="Progression du quiz" value={0} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
    rerender(<Progress aria-label="Progression du quiz" value={100} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("refuse à la compilation une barre sans nom accessible", () => {
    // Le contrôle vit dans le typecheck, pas à l'exécution : `@ts-expect-error`
    // échoue si l'erreur attendue disparaît. Retirer la contrainte de type de
    // la primitive fait donc échouer `npm run check`, et non un audit six mois
    // plus tard.
    // @ts-expect-error — `aria-label` ou `aria-labelledby` est obligatoire.
    const sansNom = <Progress value={50} />;
    expect(sansNom).toBeTruthy();
  });
});

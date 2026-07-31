import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Annonce, finAnnonce, verdictAnnonce } from "./annonce";

/**
 * Contrat d'annonce — lot F1a.
 *
 * Ce que la région doit dire, et surtout ce qu'elle ne doit pas dire :
 * l'explication éditoriale n'est jamais lue automatiquement.
 */

describe("verdictAnnonce", () => {
  it("annonce une bonne réponse sans rien y ajouter", () => {
    expect(verdictAnnonce(true)).toBe("Bonne réponse.");
    // Même si la bonne réponse est connue, elle est inutile ici.
    expect(verdictAnnonce(true, "Les différences de pression")).toBe("Bonne réponse.");
  });

  it("cite la bonne réponse quand elle est courte", () => {
    expect(verdictAnnonce(false, "Vrai")).toBe("Réponse incorrecte. Bonne réponse : Vrai.");
  });

  it("renvoie à l'écran quand la bonne réponse est trop longue à dicter", () => {
    const longue =
      "Les différences de pression entre deux masses d'air, elles-mêmes issues d'un écart de température";
    expect(verdictAnnonce(false, longue)).toBe(
      "Réponse incorrecte. Consultez la correction affichée."
    );
  });

  it("renvoie à l'écran quand aucune réponse unique n'existe", () => {
    // Cas du choix multiple : énumérer serait plus confus qu'utile.
    expect(verdictAnnonce(false)).toBe("Réponse incorrecte. Consultez la correction affichée.");
    expect(verdictAnnonce(false, "   ")).toBe(
      "Réponse incorrecte. Consultez la correction affichée."
    );
  });
});

describe("finAnnonce", () => {
  it("dit le score, pas le pourcentage", () => {
    expect(finAnnonce(8, 10)).toBe("Séance terminée. Score : 8 sur 10.");
  });
});

describe("Annonce", () => {
  it("est une région polie et atomique, invisible à l'écran", () => {
    const { container } = render(<Annonce message="Bonne réponse." />);
    const region = container.querySelector("[aria-live]");
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAttribute("aria-atomic", "true");
    expect(region).toHaveClass("sr-only");
    // Une annonce ordinaire ne doit pas interrompre la lecture en cours.
    expect(region).not.toHaveAttribute("role", "alert");
    expect(screen.getByText("Bonne réponse.")).toBeInTheDocument();
  });

  it("passe en alerte pour une erreur qui interrompt la séance", () => {
    const { container } = render(
      <Annonce message="Le vivier n’a pas pu être chargé." urgence="assertive" />
    );
    const region = container.querySelector("[aria-live]");
    expect(region).toHaveAttribute("aria-live", "assertive");
    expect(region).toHaveAttribute("role", "alert");
  });

  it("reste muette quand il n'y a rien à dire", () => {
    const { container } = render(<Annonce message="" />);
    expect(container.querySelector("[aria-live]")?.textContent).toBe("");
  });
});

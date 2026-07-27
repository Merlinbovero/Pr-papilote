import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MethodeFicheCard } from "./methode-fiche-card";

describe("MethodeFicheCard", () => {
  it("renvoie vers la fiche de méthode, annoncée comme telle", () => {
    render(
      <MethodeFicheCard
        ficheId="psychotechnique.exercices.le-calcul-mental"
        intro="Les techniques de calcul rapide."
      />
    );
    const lien = screen.getByRole("link", { name: "Le calcul mental" });
    expect(lien).toHaveAttribute("href", "/psychotechnique/exercices/le-calcul-mental");
    expect(screen.getByText("Méthode")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Avant de vous lancer" })).toBeInTheDocument();
  });

  it("s’efface plutôt que de laisser un lien mort", () => {
    const { container } = render(
      <MethodeFicheCard
        ficheId="psychotechnique.exercices.fiche-inexistante"
        intro="Peu importe."
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});

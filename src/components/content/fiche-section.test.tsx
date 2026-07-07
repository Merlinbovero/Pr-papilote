import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FicheSection } from "./fiche-section";

describe("FicheSection", () => {
  it("rend un titre de section ancré", () => {
    render(
      <FicheSection id="role" title="Rôle et missions">
        <p>Contenu</p>
      </FicheSection>
    );
    const heading = screen.getByRole("heading", { level: 2, name: /Rôle et missions/ });
    expect(heading).toBeInTheDocument();
    expect(document.getElementById("role")).not.toBeNull();
  });

  it("badge la strate Maîtriser en « Expert »", () => {
    render(
      <FicheSection id="histoire" title="Histoire" strate="maitriser">
        <p>Contenu</p>
      </FicheSection>
    );
    expect(screen.getByText("Expert")).toBeInTheDocument();
  });
});

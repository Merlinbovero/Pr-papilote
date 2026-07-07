import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("rend le texte du bouton", () => {
    render(<Button>Valider</Button>);
    expect(screen.getByRole("button", { name: "Valider" })).toBeInTheDocument();
  });

  it("est désactivable", () => {
    render(<Button disabled>Valider</Button>);
    expect(screen.getByRole("button", { name: "Valider" })).toBeDisabled();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Infobox } from "./infobox";

const entries = [
  { label: "Constructeur", value: "Exemple" },
  { label: "Armées", value: ["Air", "Marine"] },
];

describe("Infobox", () => {
  it("rend les libellés et valeurs en variante carte", () => {
    render(<Infobox title="Données" entries={entries} />);
    expect(screen.getByRole("complementary", { name: "Données" })).toBeInTheDocument();
    expect(screen.getByText("Constructeur")).toBeInTheDocument();
    expect(screen.getByText("Air, Marine")).toBeInTheDocument();
  });

  it("rend un tableau en variante impression", () => {
    render(<Infobox title="Données" entries={entries} variant="table" />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "Constructeur" })).toBeInTheDocument();
  });
});

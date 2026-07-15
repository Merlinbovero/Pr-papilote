import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Callout } from "./callout";
import { Timeline } from "./timeline";
import { DataGrid } from "./data-grid";

describe("Callout", () => {
  it("annonce la nature du bloc via un intitulé accessible par défaut", () => {
    render(<Callout variant="piege">Ne pas confondre assiette et trajectoire.</Callout>);
    const aside = screen.getByRole("complementary", { name: "Piège" });
    expect(aside).toBeInTheDocument();
    expect(aside).toHaveTextContent("assiette et trajectoire");
  });

  it("accepte un intitulé personnalisé", () => {
    render(
      <Callout variant="definition" title="Portance">
        {"Force perpendiculaire à l'écoulement."}
      </Callout>
    );
    expect(screen.getByRole("complementary", { name: "Portance" })).toBeInTheDocument();
  });
});

describe("Timeline", () => {
  it("rend les jalons dans l'ordre avec date et titre", () => {
    render(
      <Timeline
        entries={[
          { date: "1909", title: "Traversée de la Manche", highlight: true },
          { date: "1918", title: "Fin de la Grande Guerre" },
        ]}
      />
    );
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("1909");
    expect(items[0]).toHaveTextContent("Traversée de la Manche");
  });
});

describe("DataGrid", () => {
  it("rend des paires clé/valeur en liste de définitions", () => {
    render(
      <DataGrid
        items={[
          { label: "Vitesse max", value: "1912 km/h" },
          { label: "Plafond", value: "15 240 m" },
        ]}
      />
    );
    expect(screen.getByText("Vitesse max")).toBeInTheDocument();
    expect(screen.getByText("1912 km/h")).toBeInTheDocument();
  });
});

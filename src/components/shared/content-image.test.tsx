import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContentImage } from "./content-image";

describe("ContentImage", () => {
  it("expose un texte alternatif et des dimensions explicites", () => {
    render(<ContentImage src="/demo.png" alt="Schéma de démonstration" width={640} height={360} />);
    const img = screen.getByRole("img", { name: "Schéma de démonstration" });
    expect(img).toHaveAttribute("width", "640");
    expect(img).toHaveAttribute("height", "360");
  });

  it("diffère le chargement par défaut", () => {
    render(<ContentImage src="/demo.png" alt="Schéma" width={640} height={360} />);
    expect(screen.getByRole("img")).toHaveAttribute("loading", "lazy");
  });

  it("rend une légende et un crédit dans une figure", () => {
    render(
      <ContentImage
        src="/demo.png"
        alt="Schéma"
        width={640}
        height={360}
        caption="Une légende."
        credit="Auteur · Source · Licence"
      />
    );
    expect(screen.getByRole("figure")).toBeInTheDocument();
    expect(screen.getByText("Une légende.")).toBeInTheDocument();
    expect(screen.getByText("Auteur · Source · Licence")).toBeInTheDocument();
  });
});

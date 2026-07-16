import { describe, expect, it } from "vitest";
import { describeForces, INITIAL_STATE, resultante } from "./forces-model";

describe("interaction forces — modèle pur", () => {
  it("l'équilibre a une résultante nulle, l'accélération non", () => {
    expect(resultante("equilibre").nulle).toBe(true);
    expect(resultante("acceleration").nulle).toBe(false);
  });

  it("l'alternative textuelle liste les forces affichées et l'état", () => {
    const txt = describeForces(INITIAL_STATE);
    expect(txt).toContain("équilibre");
    expect(txt).toContain("Poids");
    expect(txt).toContain("Portance");
  });

  it("masquer toutes les forces est décrit explicitement", () => {
    const txt = describeForces({
      scenario: "acceleration",
      visible: { poids: false, portance: false, traction: false, trainee: false },
    });
    expect(txt).toContain("aucune force affichée");
    expect(txt).toContain("accélération");
  });
});

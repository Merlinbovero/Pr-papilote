import { describe, expect, it } from "vitest";
import {
  ALPHA_FINESSE_MAX,
  ALPHA_STALL,
  cxAt,
  czAt,
  describePolaire,
  finesseAt,
  polaireCurve,
  remarquableAt,
} from "./polaire-model";

describe("interaction polaire — modèle pur", () => {
  it("le Cz croît avec l'incidence jusqu'au décrochage, puis chute", () => {
    expect(czAt(0)).toBeLessThan(czAt(8));
    expect(czAt(ALPHA_STALL)).toBeGreaterThan(czAt(ALPHA_STALL + 3));
  });

  it("la finesse est maximale au voisinage de l'incidence de finesse max", () => {
    const fMax = finesseAt(ALPHA_FINESSE_MAX);
    expect(fMax).toBeGreaterThan(finesseAt(ALPHA_FINESSE_MAX - 4));
    expect(fMax).toBeGreaterThan(finesseAt(ALPHA_FINESSE_MAX + 4));
  });

  it("le Cx croît avec le Cz (polaire parabolique)", () => {
    expect(cxAt(2)).toBeLessThan(cxAt(12));
  });

  it("nomme les points remarquables et le décrochage", () => {
    expect(remarquableAt(ALPHA_STALL + 2)).toBe("decrochage");
    expect(describePolaire({ alpha: ALPHA_STALL + 2 })).toContain("décrochage");
  });

  it("échantillonne une courbe non vide", () => {
    expect(polaireCurve().length).toBeGreaterThan(10);
  });
});

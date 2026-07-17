import { describe, expect, it } from "vitest";
import { describeSoufflerie, ZONE_ROLES, ZONES } from "./soufflerie-model";

describe("interaction soufflerie à zones — modèle pur", () => {
  it("chaque zone a un rôle décrit", () => {
    for (const zone of ZONES) {
      expect(ZONE_ROLES[zone].length).toBeGreaterThan(10);
    }
  });

  it("le collecteur accélère l'air, le diffuseur le ralentit", () => {
    expect(ZONE_ROLES.collecteur).toContain("accélère");
    expect(ZONE_ROLES.diffuseur).toContain("ralentit");
  });

  it("l'alternative textuelle nomme la zone et son rôle", () => {
    const txt = describeSoufflerie({ zone: "veine" });
    expect(txt).toContain("Veine d'essai");
    expect(txt).toContain("maquette");
  });
});

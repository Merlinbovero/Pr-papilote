import { describe, expect, it } from "vitest";
import { AXE_INFO, describeAxe } from "./axes-model";

describe("interaction axes/gouvernes — modèle pur", () => {
  it("chaque axe est associé à sa gouverne", () => {
    expect(AXE_INFO.tangage.gouverne).toContain("profondeur");
    expect(AXE_INFO.roulis.gouverne).toContain("aileron");
    expect(AXE_INFO.lacet.gouverne).toContain("direction");
  });

  it("le lacet est commandé au palonnier", () => {
    expect(AXE_INFO.lacet.commande).toContain("palonnier");
  });

  it("l'alternative textuelle nomme l'axe, la gouverne et l'effet", () => {
    const txt = describeAxe({ axe: "roulis" });
    expect(txt).toContain("Roulis");
    expect(txt).toContain("aileron");
    expect(txt).toContain("ailes s'inclinent");
  });
});

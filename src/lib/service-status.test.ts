import { describe, expect, it } from "vitest";
import { serviceStatusSchema } from "@/lib/content/content-schemas";
import { getServiceGroup, SERVICE_GROUPS, SERVICE_STATUS } from "./service-status";

describe("service-status", () => {
  it("couvre tous les statuts du schéma", () => {
    for (const status of serviceStatusSchema.options) {
      expect(SERVICE_STATUS[status]).toBeDefined();
    }
  });

  it("range les statuts dans les bons groupes", () => {
    expect(getServiceGroup("actif")).toBe("en-service");
    expect(getServiceGroup("en-retrait")).toBe("en-service");
    expect(getServiceGroup("commande")).toBe("en-cours");
    expect(getServiceGroup("annonce")).toBe("en-cours");
    expect(getServiceGroup("retire")).toBe("retire");
    expect(getServiceGroup("historique")).toBe("retire");
  });

  it("expose exactement trois groupes ordonnés", () => {
    expect(SERVICE_GROUPS.map((g) => g.group)).toEqual(["en-service", "en-cours", "retire"]);
  });
});

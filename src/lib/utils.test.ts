import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("fusionne des classes simples", () => {
    expect(cn("p-2", "text-sm")).toBe("p-2 text-sm");
  });

  it("résout les conflits Tailwind en gardant la dernière classe", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("ignore les valeurs falsy", () => {
    expect(cn("p-2", false, undefined, null, "text-sm")).toBe("p-2 text-sm");
  });
});

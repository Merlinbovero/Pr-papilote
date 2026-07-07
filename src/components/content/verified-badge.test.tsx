import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VerifiedBadge } from "./verified-badge";

describe("VerifiedBadge", () => {
  it("affiche la date de vérification en français", () => {
    render(<VerifiedBadge verifiedAt="2026-07-07" />);
    expect(screen.getByText(/Vérifié le 7 juillet 2026/)).toBeInTheDocument();
  });

  it("signale une revue en retard", () => {
    render(<VerifiedBadge verifiedAt="2025-01-01" overdue />);
    expect(screen.getByText(/À re-vérifier/)).toBeInTheDocument();
  });
});

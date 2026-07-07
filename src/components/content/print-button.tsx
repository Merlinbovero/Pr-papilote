"use client";

import { FileDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Déclenche la vue impression (version PDF de la fiche, sans dépendance). */
export function PrintButton() {
  return (
    <Button variant="outline" size="sm" className="print:hidden" onClick={() => window.print()}>
      <FileDownIcon aria-hidden className="size-4" />
      Version PDF
    </Button>
  );
}

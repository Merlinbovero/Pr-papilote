"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Frontière d'erreur de segment (ch. 9 §8) : jamais d'impasse. L'utilisateur
 * garde toujours une issue — réessayer ou revenir à l'accueil.
 */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Point d'accroche pour le monitoring runtime (différé à l'intégration).
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 px-4 py-16">
      <Alert variant="destructive">
        <AlertTitle>Une erreur est survenue</AlertTitle>
        <AlertDescription>
          Le contenu n&apos;a pas pu s&apos;afficher. Vous pouvez réessayer ou revenir à
          l&apos;accueil.
        </AlertDescription>
      </Alert>
      <div className="flex flex-wrap gap-3">
        <Button onClick={reset}>Réessayer</Button>
        <Button asChild variant="outline">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </main>
  );
}

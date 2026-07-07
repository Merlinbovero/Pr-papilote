import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-muted-foreground font-mono text-sm">Erreur 404</p>
      <h1 className="text-3xl font-bold tracking-tight">Page introuvable</h1>
      <p className="text-muted-foreground max-w-prose">
        Cette page n&apos;existe pas ou n&apos;existe plus. La recherche est le chemin le plus
        rapide vers ce que vous cherchez.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/recherche">Rechercher</Link>
        </Button>
      </div>
    </main>
  );
}

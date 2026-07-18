import type { Metadata } from "next";
import Link from "next/link";
import { WifiOffIcon } from "lucide-react";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Hors ligne",
  robots: { index: false, follow: false },
};

/**
 * Page de repli affichée par le service worker quand une page non encore
 * consultée est demandée sans connexion. Les pages déjà visitées, elles,
 * restent disponibles depuis le cache.
 */
export default function OfflinePage() {
  return (
    <StandalonePageShell>
      <div className="mx-auto max-w-md space-y-4 py-12 text-center">
        <span
          aria-hidden
          className="bg-muted text-muted-foreground mx-auto flex size-14 items-center justify-center rounded-2xl"
        >
          <WifiOffIcon className="size-7" />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">Vous êtes hors ligne</h1>
        <p className="text-muted-foreground">
          Cette page n&apos;a pas encore été consultée, elle n&apos;est donc pas disponible sans
          connexion. Les pages déjà ouvertes restent accessibles ; revenez en arrière ou réessayez
          une fois reconnecté.
        </p>
        <div className="flex justify-center gap-2">
          <Button asChild>
            <Link href="/">Accueil</Link>
          </Button>
        </div>
      </div>
    </StandalonePageShell>
  );
}

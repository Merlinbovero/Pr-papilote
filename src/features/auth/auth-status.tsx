"use client";

import * as React from "react";
import Link from "next/link";
import { LogOutIcon, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { signOut } from "@/features/auth/actions";

/**
 * Indicateur de connexion de l'en-tête. Rendu par défaut (SSR / non connecté /
 * en cours de vérification) : le bouton « Connexion » — l'affichage statique
 * du site est préservé. Une fois monté, si une session existe, il bascule sur
 * « Mon compte » + « Se déconnecter ». Écoute les changements d'état.
 */
export function AuthStatus() {
  const [signedIn, setSignedIn] = React.useState(false);

  React.useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSignedIn(Boolean(data.session));
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  if (!signedIn) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/connexion">
          <UserIcon aria-hidden className="size-4" />
          <span className="sr-only sm:not-sr-only">Connexion</span>
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href="/progression">
          <span aria-hidden className="bg-success size-2 rounded-full" title="Connecté" />
          <UserIcon aria-hidden className="size-4" />
          <span className="sr-only sm:not-sr-only">Mon compte</span>
        </Link>
      </Button>
      <form action={signOut}>
        <Button type="submit" variant="ghost" size="sm" title="Se déconnecter">
          <LogOutIcon aria-hidden className="size-4" />
          <span className="sr-only">Se déconnecter</span>
        </Button>
      </form>
    </div>
  );
}

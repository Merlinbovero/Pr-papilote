import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";
import { signIn } from "@/features/auth/actions";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Accédez à votre espace de progression PrépaPilote.",
};

export default function ConnexionPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Connexion</h1>
        <p className="text-muted-foreground text-sm">
          Retrouvez votre progression, vos erreurs et vos statistiques.
        </p>
      </header>
      <AuthForm action={signIn} submitLabel="Se connecter">
        <div className="text-muted-foreground space-y-1 text-sm">
          <p>
            <Link href="/mot-de-passe-oublie" className="hover:text-foreground underline">
              Mot de passe oublié ?
            </Link>
          </p>
          <p>
            Pas encore de compte ?{" "}
            <Link href="/inscription" className="hover:text-foreground underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </AuthForm>
    </div>
  );
}

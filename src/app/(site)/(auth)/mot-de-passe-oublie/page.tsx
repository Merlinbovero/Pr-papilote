import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";
import { requestPasswordReset } from "@/features/auth/actions";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description: "Réinitialisez le mot de passe de votre compte PrépaPilote.",
};

export default function MotDePasseOubliePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Mot de passe oublié</h1>
        <p className="text-muted-foreground text-sm">
          Indiquez votre adresse : nous vous enverrons un lien de réinitialisation.
        </p>
      </header>
      <AuthForm action={requestPasswordReset} submitLabel="Envoyer le lien" withPassword={false}>
        <p className="text-muted-foreground text-sm">
          <Link href="/connexion" className="hover:text-foreground underline">
            Retour à la connexion
          </Link>
        </p>
      </AuthForm>
    </div>
  );
}

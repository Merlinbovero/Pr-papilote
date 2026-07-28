import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/features/auth/auth-form";
import { signUp } from "@/features/auth/actions";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte PrépaPilote pour suivre votre progression.",
};

export default function InscriptionPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Créer un compte</h1>
        <p className="text-muted-foreground text-sm">
          Gratuit. Votre progression est synchronisée sur tous vos appareils.
        </p>
      </header>
      <AuthForm action={signUp} submitLabel="Créer mon compte">
        <p className="text-muted-foreground text-sm">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="hover:text-foreground underline">
            Se connecter
          </Link>
        </p>
      </AuthForm>
    </div>
  );
}

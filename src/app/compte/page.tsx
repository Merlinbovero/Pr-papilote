import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signOut } from "@/features/auth/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Mon compte",
  robots: { index: false, follow: false },
};

export default async function ComptePage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <Alert>
          <AlertTitle>Comptes bientôt disponibles</AlertTitle>
          <AlertDescription>
            La création de compte sera activée à la mise en service de la plateforme.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase!.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Mon compte</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
          <CardDescription>Votre identité de connexion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Adresse e-mail : <span className="font-medium">{user.email}</span>
          </p>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              Se déconnecter
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

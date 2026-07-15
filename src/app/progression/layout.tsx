import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Espace personnel : seul territoire du site où la progression est
 * visible (règle fondamentale des deux modes). Accès authentifié.
 *
 * Tant que Supabase n'est pas configuré, un état explicite est affiché —
 * la consultation documentaire reste totalement indépendante.
 */
export default async function ProgressionLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <Alert>
          <AlertTitle>Espace de progression bientôt disponible</AlertTitle>
          <AlertDescription>
            Les comptes et le suivi de progression seront activés à la mise en service de la
            plateforme. Toute la documentation reste librement consultable.
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
    <div className="bg-muted/30 flex-1 border-b">
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

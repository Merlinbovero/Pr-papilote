import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./config";

/**
 * Client Supabase côté serveur (Server Components, Server Actions).
 *
 * Retourne undefined tant que l'environnement n'est pas configuré :
 * l'appelant doit gérer explicitement ce cas (état « non configuré »).
 * Les routes documentaires ne doivent JAMAIS appeler ce client.
 */
export async function createSupabaseServerClient() {
  const env = getSupabaseEnv();
  if (!env) {
    return undefined;
  }

  const cookieStore = await cookies();

  return createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appelé depuis un Server Component : les cookies ne peuvent pas
          // être écrits ici. Le rafraîchissement de session se fera via
          // les Server Actions (et un proxy dédié si nécessaire plus tard).
        }
      },
    },
  });
}

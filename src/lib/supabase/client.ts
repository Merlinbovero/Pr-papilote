import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./config";

/**
 * Client Supabase côté navigateur (composants client).
 *
 * Retourne undefined tant que l'environnement n'est pas configuré — l'appelant
 * gère ce cas (l'interface reste en mode « non configuré »). Instance unique
 * mémorisée pour éviter de recréer un client à chaque rendu.
 */
let cached: SupabaseClient | undefined;

export function getSupabaseBrowserClient(): SupabaseClient | undefined {
  if (cached) {
    return cached;
  }
  const env = getSupabaseEnv();
  if (!env) {
    return undefined;
  }
  cached = createBrowserClient(env.url, env.anonKey);
  return cached;
}

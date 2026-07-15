/**
 * Garde de configuration Supabase.
 *
 * Les clés arrivent exclusivement par variables d'environnement
 * (VISION.md, arbitrage 14). Tant qu'elles sont absentes, l'application
 * fonctionne en mode dégradé propre : la consultation documentaire est
 * intacte et les écrans authentifiés affichent un état « non configuré ».
 * Le build et les tests ne dépendent JAMAIS des secrets.
 */

export function getSupabaseEnv(): { url: string; anonKey: string } | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return undefined;
  }
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== undefined;
}

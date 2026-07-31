import { BancVitrine } from "@/features/banc/vitrine";

/**
 * Vitrine du système du Banc — lot F1b.
 *
 * Elle montre les jetons, les quatre états, le chronomètre dans ses cinq
 * états, la progression et une séance factice complète. **Aucun moteur de
 * production n'y est branché** : c'est ce qui rend le lot annulable et permet
 * de valider l'identité avant toute migration.
 */
export default function BancLabPage() {
  return <BancVitrine />;
}

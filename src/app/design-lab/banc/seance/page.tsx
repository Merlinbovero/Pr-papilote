import { SeanceVitrine } from "@/features/banc/seance-vitrine";

/**
 * Vitrine — une séance seule, dans les conditions réelles.
 *
 * La page d'index du laboratoire est un **catalogue** : elle empile jetons,
 * chronomètres et états, si bien que la séance y arrive en bas. Le contrat de
 * densité — cadre, stimulus, chronomètre et premier contrôle visibles sans
 * défiler — ne veut rien dire dans ce contexte : il s'applique à une page de
 * séance, où la séance est le sujet.
 *
 * Cette page est donc l'étalon de densité, et c'est sur elle que le contrôle
 * du premier écran s'exerce.
 */
export default function BancSeancePage() {
  return <SeanceVitrine />;
}

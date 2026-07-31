import { PlancheRoot } from "@/features/design-lab/planche";
import { PlancheBanc } from "@/features/design-lab/planche-banc";

/**
 * Prototype — Le Banc.
 *
 * `marginMode: none` : la session n'a jamais de marge, à aucune largeur.
 * Le bandeau reste visible hors session ; pendant l'épreuve, le composant
 * occupe la fenêtre entière et tout l'appareil disparaît.
 *
 * La graine est fixe pour que la capture de référence soit reproductible :
 * le générateur est déterministe, une même graine rend toujours la même
 * session. C'est ce qui rend le test visuel de non-régression possible.
 */
const GRAINE = 20260728;

export default function BancPlanchePage() {
  return (
    <PlancheRoot marginMode="none" module="violine">
      <PlancheBanc seed={GRAINE} />
    </PlancheRoot>
  );
}

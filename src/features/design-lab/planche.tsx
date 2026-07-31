/**
 * Prototype PLANCHE — ce qui lui est propre.
 *
 * Depuis le lot M3, l'ossature du système vit dans `@/components/planche` :
 * elle sert aussi les routes publiques du groupe `(planche)`. Ce fichier ne
 * garde que le bandeau du laboratoire, dont la navigation ne pointe que vers
 * les trois écrans du prototype, et réexporte le reste pour ne pas casser
 * les imports du laboratoire.
 */
export {
  PlancheCartouche,
  PlancheEncadre,
  PlancheLegende,
  PlancheMarge,
  PlanchePied,
  PlancheRoot,
  PlancheSection,
  PlancheValeur,
  type EncreModule,
  type MarginMode,
} from "@/components/planche/planche";

const NAV = [
  { href: "/design-lab/planche/lecon", label: "La Leçon" },
  { href: "/design-lab/planche/appareil", label: "Fiche appareil" },
  { href: "/design-lab/planche/banc", label: "Le Banc" },
];

export function PlancheTop({ actif }: { actif: string }) {
  return (
    <div className="pl-top">
      <span className="pl-mark">PrépaPilote</span>
      <nav aria-label="Prototypes PLANCHE">
        {NAV.map((entree) => (
          // Ancres simples, pas de <Link> : le préchargement de route tirait
          // la photographie de la fiche appareil (229 kB) sur des écrans qui
          // n'affichent aucune image. Mesuré, puis supprimé.
          <a
            key={entree.href}
            href={entree.href}
            aria-current={entree.href === actif ? "page" : undefined}
          >
            {entree.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

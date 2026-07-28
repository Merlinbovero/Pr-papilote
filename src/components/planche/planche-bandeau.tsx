import Link from "next/link";
import { PlancheRegistre } from "@/components/planche/planche-registre";
import { AuthStatus } from "@/features/auth/auth-status";
import { NAV_SECTIONS } from "@/lib/navigation";

/**
 * Bandeau des routes PLANCHE.
 *
 * Il remplace `SiteHeader` sur ce groupe : même destinations de premier
 * niveau — les six sections déclarées dans `src/lib/navigation.ts`, où un
 * test vérifie que chaque lien mène à une route réelle — mais la grammaire
 * PLANCHE, c'est-à-dire un filet et des libellés, pas de carte ni d'ombre.
 *
 * Les liens sont des `<Link>` et non des ancres : la traversée entre les
 * deux univers doit rester une navigation client. Le prototype employait des
 * ancres pour éviter un préchargement coûteux ; ici l'exigence inverse prime,
 * et les hubs visés n'appartiennent pas au groupe PLANCHE.
 *
 * `AuthStatus` est monté tel quel : le lot ne migre pas l'authentification,
 * mais il ne doit pas non plus la faire disparaître — sans lui, `/connexion`
 * n'était plus atteignable depuis les quatorze leçons. Son habillage reste
 * celui de la charte historique jusqu'au lot des primitives.
 *
 * Ce que le bandeau ne porte **pas** : la recherche globale. Mesuré : sur une
 * leçon, l'index sérialisé de `SearchCommand` pèse 431 kB de HTML — la page
 * passe de 516 kB à 85 kB sans lui. Le point d'entrée sera réintroduit sous
 * une forme légère avec le lot de la recherche ; d'ici là, les six sections
 * du bandeau et les renvois de la leçon couvrent la navigation.
 */
export function PlancheBandeau({ actif }: { actif?: string }) {
  return (
    <div className="pl-top">
      <Link href="/" className="pl-mark">
        PrépaPilote
      </Link>
      <nav aria-label="Navigation principale">
        {NAV_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            aria-current={section.href === actif ? "page" : undefined}
          >
            {section.label}
          </Link>
        ))}
      </nav>
      <div className="pl-top-fin">
        <PlancheRegistre />
        <AuthStatus />
      </div>
    </div>
  );
}

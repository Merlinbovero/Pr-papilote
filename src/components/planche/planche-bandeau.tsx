import Link from "next/link";

import { DeclencheurRecherche } from "@/features/search/declencheur-recherche";
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
 * LA RECHERCHE — unifiée au lot M10. C'était un simple lien vers `/recherche`,
 * pour une raison mesurée : l'index sérialisé de `SearchCommand` pesait 431 kB
 * de HTML, et la page passait de 516 kB à 85 kB sans lui.
 *
 * Le lien reste, et c'est lui le déclencheur. `DeclencheurRecherche` ouvre la
 * même palette, sur le même index et le même classement que `(site)` et
 * `/recherche` — mais l'index est désormais une **ressource chargée à la
 * première ouverture**, jamais sérialisée dans la page. Sans JavaScript, le
 * lien navigue comme avant.
 *
 * **Ne pas importer `buildSearchEntries` ici** : ce seul import ramènerait
 * l'index dans le HTML des 252 documents, et annulerait tout le lot.
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
        <DeclencheurRecherche className="pl-recherche" />
        <PlancheRegistre />
        <AuthStatus />
      </div>
    </div>
  );
}

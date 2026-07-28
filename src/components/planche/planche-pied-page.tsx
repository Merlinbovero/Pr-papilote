import Link from "next/link";
import { getModules } from "@/lib/content/referentials";

/**
 * Pied de page des routes PLANCHE.
 *
 * Mêmes destinations que `SiteFooter` — les modules et les cinq pages
 * légales — en grammaire PLANCHE : un filet fort, deux colonnes de liens en
 * capitales, aucune surface. Les URL sont identiques : le pied n'est pas un
 * changement de contenu, c'est un changement de rendu.
 *
 * À ne pas confondre avec `PlanchePied` (`@/components/planche/planche`),
 * qui est le **pied de planche** d'un document — vérification, sources,
 * révision — et vit dans la colonne de corps.
 */
export function PlanchePiedPage() {
  const modules = getModules();

  return (
    <footer className="pl-foot">
      <nav aria-label="Modules">
        {modules.map((mod) => (
          <Link key={mod.slug} href={`/${mod.slug}`}>
            {mod.name}
          </Link>
        ))}
      </nav>
      <nav aria-label="Informations légales">
        <Link href="/credits-photos">Crédits photos</Link>
        <Link href="/mentions-legales">Mentions légales</Link>
        <Link href="/confidentialite">Confidentialité</Link>
        <Link href="/cgu">CGU</Link>
        <Link href="/contact">Contact</Link>
      </nav>
      <p>Projet indépendant, non officiel — préparation aux concours EOPAN, EOPN et ALAT.</p>
    </footer>
  );
}

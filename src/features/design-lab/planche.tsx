/* eslint-disable @next/next/no-html-link-for-pages --
 * Ancres HTML volontaires. Avec <Link>, Next précharge les routes voisines
 * du bandeau : la photographie de la fiche appareil (229 kB) était tirée sur
 * des écrans qui n'affichent aucune image. Mesuré, puis supprimé. Le
 * prototype n'a pas besoin de navigation client — trois écrans, trois
 * chargements francs. */
import type { ReactNode } from "react";

/**
 * Ossature commune du système PLANCHE.
 *
 * `marginMode` est **déclaré** par la page, jamais déduit du contenu monté :
 * une déduction serait invisible, instable au fil des éditions et impossible
 * à tester. Le repli responsive se fait à l'intérieur du mode déclaré.
 */
export type MarginMode = "wide" | "rail" | "none";
export type EncreModule = "marine" | "bistre" | "violine" | "neutre";

export function PlancheRoot({
  marginMode,
  module = "neutre",
  children,
  className,
}: {
  marginMode: MarginMode;
  module?: EncreModule;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className ? `pl-root ${className}` : "pl-root"}
      data-marge={marginMode}
      data-module={module}
    >
      {children}
    </div>
  );
}

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

/** La cote et la révision, en cartouche quand la marge se replie. */
export function PlancheCartouche({ children }: { children: ReactNode }) {
  return <div className="pl-cart">{children}</div>;
}

export function PlancheMarge({
  cote,
  revision,
  module,
}: {
  cote: string;
  revision: string;
  module?: string;
}) {
  return (
    <aside className="pl-marge" aria-hidden="true">
      <div className="pl-cote">{cote}</div>
      <div className="pl-rev">RÉV. {revision}</div>
      {module ? <div className="pl-mmark">{module}</div> : null}
    </aside>
  );
}

/**
 * Titre de section, avec son repère de marge.
 *
 * Le repère est posé en absolu **depuis la section elle-même** : il tombe
 * donc toujours en face de son titre, sans aucun calcul en JavaScript.
 */
export function PlancheSection({
  numero,
  id,
  children,
}: {
  numero?: number;
  id?: string;
  children: ReactNode;
}) {
  return (
    <h2 className="pl-sec" id={id}>
      <span className="pl-repere" aria-hidden="true">
        {numero ? <span className="pl-repere-n">§ {numero}</span> : null}
      </span>
      {numero ? <span className="pl-sec-n">{numero}</span> : null}
      {children}
    </h2>
  );
}

export function PlancheLegende({ planche, children }: { planche: string; children: ReactNode }) {
  return (
    <figcaption className="pl-legende">
      <span className="pl-ref">{planche}</span> — {children}
    </figcaption>
  );
}

export function PlanchePied({
  verifie,
  sources,
  revision,
}: {
  verifie: string;
  sources: number;
  revision: number;
}) {
  return (
    <div className="pl-pied">
      <span>Vérifié le {verifie}</span>
      <span>Sources : {sources}</span>
      <span>Rév. {revision}</span>
    </div>
  );
}

export function PlancheEncadre({
  libelle,
  variante,
  children,
}: {
  libelle: string;
  variante?: "piege";
  children: ReactNode;
}) {
  return (
    <div className={variante === "piege" ? "pl-enc pl-piege" : "pl-enc"}>
      <p className="pl-enc-l">{libelle}</p>
      {children}
    </div>
  );
}

/**
 * Valeur de tableau technique.
 *
 * Une donnée absente se lit « — », jamais « N/A », jamais un blanc, et
 * jamais une estimation silencieuse. C'est une règle du projet ; elle est
 * tenue ici par le composant plutôt que par la vigilance de l'auteur.
 */
export function PlancheValeur({ valeur }: { valeur: string | undefined | null }) {
  const vide = valeur === undefined || valeur === null || valeur.trim() === "";
  return (
    <td className={vide ? "pl-v pl-vide" : "pl-v"}>
      {vide ? <span title="Donnée non renseignée">—</span> : valeur}
    </td>
  );
}

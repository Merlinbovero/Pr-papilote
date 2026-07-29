import type { ReactNode } from "react";

/**
 * Ossature commune du système PLANCHE (docs/design-manifesto.md).
 *
 * Ces primitives ont été écrites pour le prototype `/design-lab/planche` puis
 * promues ici au lot M3, à leur deuxième usage, quand le groupe de routes
 * `(planche)` a commencé à les employer sur des routes publiques. Le prototype
 * les réexporte : il n'en existe qu'une seule version.
 *
 * `marginMode` est **déclaré** par la page, jamais déduit du contenu monté :
 * une déduction serait invisible, instable au fil des éditions et impossible
 * à tester. Le repli responsive se fait à l'intérieur du mode déclaré.
 */
export type MarginMode = "wide" | "rail" | "none";
/**
 * L'encre du module hôte. `air` et `terre` rejoignent la liste au lot M6b,
 * `sienne` au lot M7a : les notices EOPN, ALAT puis Culture devaient porter
 * l'encre de leur module, et non le bleu de la Marine ni le gris neutre. Les
 * trois valeurs existaient déjà dans `planche-tokens.css` et dans le module de
 * jetons, où leur contraste est vérifié ; seule la feuille du système ne les
 * déclarait pas. Un test confronte désormais les deux fichiers.
 */
export type EncreModule = "marine" | "air" | "terre" | "bistre" | "violine" | "sienne" | "neutre";

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
 *
 * Le numéro est une **cote**, pas un mot : il est masqué aux technologies
 * d'assistance, sans quoi le nom accessible du titre deviendrait « 1Objectifs »
 * et les tests comme les lecteurs d'écran perdraient le libellé réel.
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
      {numero ? (
        <span className="pl-sec-n" aria-hidden="true">
          {numero}
        </span>
      ) : null}
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

/**
 * Encadré — piège, avertissement, essentiel.
 *
 * `titre` promeut le libellé en `<h2>` : un encadré qui remplace une section
 * du document doit rester un titre dans l'arbre d'accessibilité, sinon le
 * plan de la page perd un niveau. Sans lui, le libellé n'est qu'une étiquette.
 */
export function PlancheEncadre({
  libelle,
  variante,
  titre,
  id,
  children,
}: {
  libelle: string;
  variante?: "piege";
  titre?: boolean;
  id?: string;
  children: ReactNode;
}) {
  return (
    <div className={variante === "piege" ? "pl-enc pl-piege" : "pl-enc"}>
      {titre ? (
        <h2 className="pl-enc-l" id={id}>
          {libelle}
        </h2>
      ) : (
        <p className="pl-enc-l">{libelle}</p>
      )}
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

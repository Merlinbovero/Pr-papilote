/* eslint-disable @next/next/no-html-link-for-pages --
 * Ancres HTML volontaires. Avec <Link>, Next précharge les routes voisines
 * du bandeau : la photographie de la fiche appareil (229 kB) était tirée sur
 * des écrans qui n'affichent aucune image. Mesuré, puis supprimé. Le
 * prototype n'a pas besoin de navigation client — trois écrans, trois
 * chargements francs. */
import { PlancheRoot } from "@/features/design-lab/planche";

/** Index du prototype — trois écrans, derrière le drapeau. */
export default function PlancheIndexPage() {
  return (
    <PlancheRoot marginMode="none">
      <div className="pl-index">
        <h1>Système PLANCHE — prototype</h1>
        <p>
          Trois écrans isolés, derrière un drapeau de fonctionnalité. Les jetons PLANCHE sont de
          portée locale : aucun jeton de production n&rsquo;est remplacé, <code>:root</code> reste
          intact. Le contenu vient du dépôt, les moteurs sont ceux de production.
        </p>
        <ul>
          <li>
            <a href="/design-lab/planche/lecon">
              <span>La Leçon — La couche limite et le décrochage</span>
              <span>marginMode: wide</span>
            </a>
          </li>
          <li>
            <a href="/design-lab/planche/appareil">
              <span>La Planche d&rsquo;identification — Rafale M</span>
              <span>marginMode: rail</span>
            </a>
          </li>
          <li>
            <a href="/design-lab/planche/banc">
              <span>Le Banc — Le test des triangles</span>
              <span>marginMode: none</span>
            </a>
          </li>
        </ul>
      </div>
    </PlancheRoot>
  );
}

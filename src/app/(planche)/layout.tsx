import { PlancheBandeau } from "@/components/planche/planche-bandeau";
import { PlanchePiedPage } from "@/components/planche/planche-pied-page";
import { PLANCHE_FONT_VARIABLES } from "@/lib/design/planche-fonts";
import "@/styles/planche.css";

/**
 * Groupe PLANCHE — lot M3.
 *
 * Il porte tout ce que la racine commune ne porte plus : les trois fontes du
 * système, les jetons de portée `.pl-root`, le bandeau, le pied de page et
 * les deux registres. Geist et Archivo ne sont **pas** déclarées ici : elles
 * vivent dans `(site)`, et les routes de ce groupe ne les chargent donc pas.
 *
 * Le pansement `body:has(.pl-root)` du prototype n'a plus lieu d'être : le
 * chrome historique n'est plus monté sur ces routes, il n'y a rien à masquer.
 *
 * Le conteneur porte `.pl-univers`, **pas** `.pl-root` : les règles de
 * gabarit sont écrites en descendance (`.pl-root[data-marge="none"] .pl-page`)
 * et un `.pl-root` imbriqué les ferait fuir sur la grille de la page — la
 * première capture du lot l'a montré, colonne de corps réduite à 280 px.
 * `.pl-univers` déclare les mêmes jetons pour le bandeau et le pied ; le
 * `marginMode` et l'encre de module restent **déclarés par la page**.
 */
export default function PlancheGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${PLANCHE_FONT_VARIABLES} flex flex-1 flex-col`}>
      <div className="pl-univers">
        <PlancheBandeau />
        {children}
        <PlanchePiedPage />
      </div>
    </div>
  );
}

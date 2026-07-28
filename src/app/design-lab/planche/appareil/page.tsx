import { notFound } from "next/navigation";
import {
  PlancheCartouche,
  PlancheLegende,
  PlancheMarge,
  PlanchePied,
  PlancheRoot,
  PlancheSection,
  PlancheTop,
  PlancheValeur,
} from "@/features/design-lab/planche";
import { PlancheMarkdown } from "@/features/design-lab/planche-markdown";
import { getFicheById } from "@/lib/content/fiches";

const FICHE_ID = "eopan.appareils.rafale-m";

/**
 * Prototype — La Planche d'identification.
 *
 * Ce que la page teste : photographie créditée, silhouette explicitement
 * générique, tableau de caractéristiques, valeurs inconnues, légendes et
 * crédits, chronologie de révision, rail plutôt que marge large — la
 * largeur va au tableau, pas à la marge.
 */
export default function AppareilPlanchePage() {
  const fiche = getFicheById(FICHE_ID);
  if (!fiche) {
    notFound();
  }

  const specs = fiche.specs ?? {};
  const image = fiche.image;
  const infobox = fiche.infobox ?? {};

  // Les groupes du tableau de cotes. Une clé absente du contenu produit
  // une ligne « — » : le tableau montre ses trous plutôt que de les taire.
  const groupes: { titre: string; lignes: [string, string | undefined][] }[] = [
    {
      titre: "Identité",
      lignes: [
        [
          "Constructeur",
          typeof infobox.constructeur === "string" ? infobox.constructeur : undefined,
        ],
        [
          "Mise en service",
          infobox.miseEnService === undefined ? undefined : String(infobox.miseEnService),
        ],
        ["Équipage", specs.crew],
      ],
    },
    {
      titre: "Dimensions",
      lignes: [
        ["Envergure", specs.wingspan],
        ["Longueur", specs.length],
        ["Hauteur", specs.height],
      ],
    },
    {
      titre: "Masses",
      lignes: [
        ["À vide", specs.emptyWeight],
        ["Maximale au décollage", specs.maxTakeoffWeight],
      ],
    },
    {
      titre: "Performances",
      lignes: [
        ["Vitesse maximale", specs.maxSpeed],
        ["Plafond", specs.ceiling],
        ["Rayon d'action", specs.range],
      ],
    },
    {
      titre: "Motorisation",
      lignes: [["Réacteurs", specs.powerplant]],
    },
  ];

  return (
    <PlancheRoot marginMode="rail" module="marine">
      <PlancheTop actif="/design-lab/planche/appareil" />
      <PlancheCartouche>
        EOPAN · C.6.10 — rév. {fiche.verifiedAt} — Marine nationale
      </PlancheCartouche>

      <div className="pl-page" style={{ ["--pl-annexe" as string]: "400px" }}>
        <PlancheMarge cote="EOPAN C.6.10" revision={fiche.verifiedAt} module="Marine nationale" />

        <div className="pl-corps">
          <h1 className="pl-titre">{fiche.title}</h1>
          <p className="pl-stitre">
            {typeof infobox.role === "string" ? infobox.role : "Aéronef"}
            {fiche.service?.status ? ` — ${fiche.service.status}` : ""}
          </p>
          <div className="pl-ft" />

          {/* La silhouette est un DÉMONSTRATEUR VISUEL. Elle montre le
              traitement — graisses, cadrage, encre du module — et n'est en
              aucun cas une représentation exacte du Rafale M. Le fonds de
              silhouettes fidèles reste un chantier de fond. */}
          <figure className="pl-planche">
            <div className="pl-fig">
              <svg
                viewBox="0 0 420 210"
                role="img"
                aria-label="Silhouette générique de démonstration, vue de dessus — ce tracé ne représente pas le Rafale M"
              >
                <path
                  d="M210 16 L216 62 L228 104 L246 112 L302 150 L302 162 L232 146 L230 172 L252 188 L252 196 L210 186 L168 196 L168 188 L190 172 L188 146 L118 162 L118 150 L174 112 L192 104 L204 62 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M228 104 L262 96 L268 106 L236 114 Z M192 104 L158 96 L152 106 L184 114 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <path d="M199 74 L221 74 M196 100 L224 100" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
            <PlancheLegende planche="PL. 03">
              <strong>Silhouette générique — démonstrateur visuel.</strong> Ce tracé montre le
              traitement graphique (graisses, cadrage, encre du module) et{" "}
              <strong>ne représente pas le {fiche.title}</strong>. Aucune silhouette fidèle
              n&rsquo;est encore établie.
            </PlancheLegende>
          </figure>

          {image ? (
            <figure className="pl-planche pl-port">
              {/* eslint-disable-next-line @next/next/no-img-element -- prototype :
                  on mesure le poids réellement transféré sans la couche
                  d'optimisation, pour comparer ce qui est comparable. */}
              <img src={image.src} alt={image.alt} width={1200} height={900} />
              <PlancheLegende planche="PL. 04">
                {image.alt}. Photo : {image.author} ({image.license}), Wikimedia Commons.
              </PlancheLegende>
            </figure>
          ) : null}

          <PlancheSection>En service</PlancheSection>
          <PlancheMarkdown>{fiche.content.essentiel.body}</PlancheMarkdown>

          <PlancheSection>À retenir</PlancheSection>
          <ul>
            {fiche.content.essentiel.aRetenir.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

          <PlanchePied
            verifie={fiche.verifiedAt}
            sources={fiche.sources.length}
            revision={fiche.version}
          />
        </div>

        <aside className="pl-annexe">
          <p className="pl-an-h">Caractéristiques</p>
          <table className="pl-tab">
            <tbody>
              {groupes.map((groupe) => (
                <>
                  <tr key={groupe.titre}>
                    <th colSpan={2}>{groupe.titre}</th>
                  </tr>
                  {groupe.lignes.map(([libelle, valeur]) => (
                    <tr key={`${groupe.titre}-${libelle}`}>
                      <td>{libelle}</td>
                      <PlancheValeur valeur={valeur} />
                    </tr>
                  ))}
                </>
              ))}
              {/* Deux lignes que le contenu ne renseigne pas : elles restent
                  visibles et vides. Un tableau à trous est un tableau honnête. */}
              <tr>
                <th colSpan={2}>Non renseigné</th>
              </tr>
              <tr>
                <td>Distance de catapultage</td>
                <PlancheValeur valeur={undefined} />
              </tr>
              <tr>
                <td>Vitesse d&rsquo;appontage</td>
                <PlancheValeur valeur={undefined} />
              </tr>
            </tbody>
          </table>
          <p className="pl-an-note">
            Chaque valeur affichée vient du contenu du dépôt et de ses sources. Une donnée absente
            se lit « — » : elle n&rsquo;est jamais estimée ni inventée pour combler la ligne.
          </p>

          <p className="pl-an-h">Historique de révision</p>
          {fiche.revisions.map((revision) => (
            <div className="pl-chrono" key={`${revision.date}-${revision.version}`}>
              <span className="pl-num">{revision.date}</span>
              <span>
                v{revision.version} — {revision.motif}
              </span>
            </div>
          ))}

          <p className="pl-an-h">Sources</p>
          <ol className="pl-srcs">
            {fiche.sources.map((source, index) => (
              <li key={source.url}>
                <span className="pl-num">{index + 1}</span>
                <span>{source.title}</span>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </PlancheRoot>
  );
}

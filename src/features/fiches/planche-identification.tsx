import Image from "next/image";
import Link from "next/link";

import { FicheFigure } from "@/components/content/fiche-figure";
import {
  PlancheCartouche,
  PlancheEncadre,
  PlancheLegende,
  PlancheMarge,
  PlanchePied,
  PlancheRoot,
  PlancheSection,
  PlancheValeur,
  type EncreModule,
} from "@/components/planche/planche";
import { PlancheImpression } from "@/components/planche/planche-impression";
import { PlancheMarkdown } from "@/components/planche/planche-markdown";
import { PlancheSommaire } from "@/components/planche/planche-sommaire";
import { buildNotionPool } from "@/features/quiz/notion-pool";
import { NotionQuiz } from "@/features/quiz/notion-quiz";
import type { DocumentNotice, FicheFile } from "@/lib/content/content-schemas";
import {
  getDocumentHref,
  getDocumentsForFiche,
  getFicheById,
  getFicheHref,
  getFicheLinks,
  getFichesByCategory,
  getReadingMinutes,
  getTermesForFiche,
} from "@/lib/content/fiches";
import { editorialState } from "@/lib/content/freshness";
import { infoboxLabel } from "@/lib/content/infobox-labels";
import { getCoteFiche } from "@/lib/content/referentials";
import type { Category, Module } from "@/lib/content/schemas";
import { numeroDeSection } from "@/lib/lecon/sommaire";
import { sommaireNotice } from "@/lib/fiche/sommaire";
import { SERVICE_STATUS } from "@/lib/service-status";

/**
 * La Planche d'identification — lot M6b.
 *
 * La famille des **notices techniques** : un appareil, un navire, une base,
 * une unité, un grade, une institution. Un objet qu'on identifie, pas une
 * notion qu'on apprend. Son modèle est la notice constructeur et le cartel de
 * musée : une pièce, sa cote, ses caractéristiques, ses sources.
 *
 * CE QUE CE COMPOSANT CHANGE — le gabarit, et lui seul. Chaque bloc de la
 * fiche historique se retrouve ici, dans le même ordre, avec le même texte,
 * les mêmes liens et les mêmes ancres publiques (`l-essentiel`, les
 * identifiants de section déclarés, `pieges`, `documents`, `sources`,
 * `s-entrainer`). Un lecteur qui avait collé une ancre la retrouve.
 *
 * CE QU'IL NE CHANGE PAS, volontairement :
 *  - **la photographie** — ni recadrée, ni teintée, ni retouchée. Même
 *    rapport et même `object-position` d'auteur que le gabarit historique ;
 *    PLANCHE n'ajoute qu'un filet et une légende. Voir `.pl-photo`, qui existe
 *    justement pour ne pas hériter du filtre décoratif de `.pl-planche`.
 *  - **aucun schéma n'est créé** — les figures rendues sont celles que le
 *    contenu déclare, servies par le composant historique. M6b ne dessine rien.
 *  - **NotionQuiz** — monté tel quel dans un bloc `.pl-hote`, dont la seule
 *    fonction est d'arrêter la typographie PLANCHE à sa frontière. Aucune de
 *    ses classes internes n'est ciblée. Il attend son lot propriétaire.
 *
 * La cote est **lue** dans `content/_referentiels/cotes.json`, jamais dérivée
 * de l'ordre courant : une notice sans cote est une erreur d'intégrité, et la
 * page le dit en faisant échouer le build.
 */

/** L'encre du module hôte — le sens de la couleur, pas une décoration. */
const ENCRE_MODULE: Record<string, EncreModule> = {
  eopan: "marine",
  eopn: "air",
  alat: "terre",
};

const TYPE_LABELS: Partial<Record<FicheFile["type"], string>> = {
  appareil: "Appareil",
  helicoptere: "Hélicoptère",
  navire: "Navire",
  flottille: "Flottille",
  procedure: "Procédure",
  concept: "Concept",
  organisation: "Organisation",
};

const LEVEL_LABELS: Record<number, string> = {
  1: "Découverte",
  2: "Niveau concours",
  3: "Expert",
};

const DOCUMENT_KIND_LABELS: Record<DocumentNotice["kind"], string> = {
  arrete: "Arrêté",
  rapport: "Rapport",
  brochure: "Brochure",
  documentation: "Documentation",
  communique: "Communiqué",
  autre: "Document",
};

const AVERTISSEMENTS: Partial<Record<FicheFile["status"], { libelle: string; texte: string }>> = {
  relecture: {
    libelle: "Fiche en relecture",
    texte: "Ce contenu attend la validation éditoriale finale avant publication.",
  },
  validee: {
    libelle: "Fiche validée",
    texte: "Contenu validé, en attente de publication.",
  },
  "a-mettre-a-jour": {
    libelle: "Fiche en cours de mise à jour",
    texte:
      "Une information de cette fiche est en cours de re-vérification ; certaines données peuvent évoluer.",
  },
};

export function PlancheIdentification({
  fiche,
  mod,
  category,
}: {
  fiche: FicheFile;
  mod: Module;
  category: Category;
}) {
  const cote = getCoteFiche(fiche.id);
  if (!cote) {
    throw new Error(`Cote manquante pour la notice « ${fiche.id} » (cotes.json)`);
  }

  const quizPool = buildNotionPool(fiche.id);
  const documents = getDocumentsForFiche(fiche);
  const specs = fiche.specs;
  const infoboxEntries = fiche.infobox
    ? Object.entries(fiche.infobox).map(([cle, valeur]) => ({
        label: infoboxLabel(cle),
        value: Array.isArray(valeur) ? valeur.join(", ") : String(valeur),
      }))
    : [];

  const sommaire = sommaireNotice({
    sections: fiche.content.sections.map((s) => ({ id: s.id, title: s.title })),
    caracteristiques: Boolean(specs),
    pieges: fiche.content.pieges.length > 0,
    documents: documents.length > 0,
    quiz: quizPool.length > 0,
  });
  const numero = (id: string) => numeroDeSection(sommaire, id);

  // Relations : mêmes sources et mêmes cibles que le gabarit historique.
  const links = getFicheLinks(fiche.id);
  const versFiche = (liste: typeof links) =>
    liste.map((lien) => {
      const cible = getFicheById(lien.targetId);
      return { label: lien.targetTitle, href: cible ? getFicheHref(cible) : "#" };
    });
  const pedagogiques = (ids: string[] | undefined) =>
    (ids ?? []).flatMap((id) => {
      const cible = getFicheById(id);
      return cible ? [{ label: cible.title, href: getFicheHref(cible) }] : [];
    });

  const renvois = [
    { titre: "Notions préalables", items: pedagogiques(fiche.relations.prerequisites) },
    { titre: "Relations directes", items: versFiche(links.filter((l) => l.weight === "forte")) },
    { titre: "Voir aussi", items: versFiche(links.filter((l) => l.weight === "moyenne")) },
    { titre: "Voir également", items: pedagogiques(fiche.relations.variantOf) },
    {
      titre: "Pour aller plus loin",
      items: versFiche(links.filter((l) => l.weight === "complementaire")),
    },
    {
      titre: "Dictionnaire",
      items: getTermesForFiche(fiche.id).map((terme) => ({
        label: terme.title,
        href: `/dictionnaire/${terme.id.replace(/^terme\./, "")}`,
      })),
    },
  ].filter((bloc) => bloc.items.length > 0);

  const voisines = getFichesByCategory(fiche.module, fiche.category);
  const rang = voisines.findIndex((v) => v.id === fiche.id);
  const precedente = rang > 0 ? voisines[rang - 1] : undefined;
  const suivante = rang >= 0 && rang < voisines.length - 1 ? voisines[rang + 1] : undefined;

  const avertissement = AVERTISSEMENTS[fiche.status];
  const perimee = editorialState(fiche, new Date()) === "a-verifier";
  const service = fiche.service ? SERVICE_STATUS[fiche.service.status] : undefined;
  // L'armée d'appartenance, pas le code du concours : une notice se range sous
  // « Marine nationale », pas sous « EOPAN ». Les modules transverses n'en
  // déclarent pas — ils retombent sur leur nom.
  const organisation = mod.organization ?? mod.name;
  const dateCourte = (iso: string) =>
    new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(new Date(iso));

  return (
    <PlancheRoot marginMode="rail" module={ENCRE_MODULE[mod.slug] ?? "neutre"}>
      <PlancheCartouche>
        {cote} — rév. {fiche.verifiedAt} — {organisation}
      </PlancheCartouche>

      <div className="pl-page">
        <PlancheMarge cote={cote} revision={fiche.verifiedAt} module={organisation} />

        <div className="pl-corps">
          <nav aria-label="Fil d’Ariane" className="pl-fil">
            <Link href="/">Accueil</Link>
            <Link href={`/${mod.slug}`}>{mod.name}</Link>
            <Link href={`/${mod.slug}/${category.slug}`}>{category.name}</Link>
            <span aria-current="page">{fiche.title}</span>
          </nav>

          <p className="pl-sur">{category.name}</p>
          <h1 className="pl-titre">{fiche.title}</h1>
          <p className="pl-stitre">
            {[
              TYPE_LABELS[fiche.type] ?? fiche.type,
              service?.label,
              fiche.service?.operator,
              LEVEL_LABELS[fiche.level] ?? `Niveau ${fiche.level}`,
              `${getReadingMinutes(fiche)} min de lecture`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="pl-ft" />
          <p className="pl-chapo">{fiche.summary}</p>

          <PlancheImpression />

          {avertissement ? (
            <PlancheEncadre libelle={avertissement.libelle} variante="piege">
              <p>{avertissement.texte}</p>
            </PlancheEncadre>
          ) : null}

          {fiche.image ? (
            <figure className="pl-photo">
              <div className="pl-photo-c">
                {/* Cadrage et position d'auteur repris tels quels du gabarit
                    historique : les pixels rendus ne bougent pas. */}
                <Image
                  src={fiche.image.src}
                  alt={fiche.image.alt}
                  fill
                  priority
                  sizes="(min-width: 1180px) 720px, 100vw"
                  style={fiche.image.focal ? { objectPosition: fiche.image.focal } : undefined}
                />
              </div>
              <PlancheLegende planche="PHOT.">
                {fiche.image.alt}. Photo :{" "}
                <a href={fiche.image.sourceUrl} target="_blank" rel="noopener noreferrer">
                  {fiche.image.author} ({fiche.image.license})
                </a>
              </PlancheLegende>
            </figure>
          ) : null}

          <section aria-labelledby="l-essentiel">
            <PlancheSection numero={numero("l-essentiel")} id="l-essentiel">
              L’essentiel
            </PlancheSection>
            <PlancheMarkdown>{fiche.content.essentiel.body}</PlancheMarkdown>
            <PlancheEncadre libelle="À retenir">
              <ul>
                {fiche.content.essentiel.aRetenir.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </PlancheEncadre>
          </section>

          {fiche.content.sections.map((section) => (
            <section key={section.id} aria-labelledby={section.id}>
              <PlancheSection numero={numero(section.id)} id={section.id}>
                {section.title}
              </PlancheSection>
              <PlancheMarkdown>{section.body}</PlancheMarkdown>
              {/* Les figures sont celles que le contenu déclare — M6b n'en
                  dessine aucune. Le composant historique les sert. */}
              {section.figures.map((figure) => (
                <div className="pl-hote" key={figure.schemaId}>
                  <FicheFigure {...figure} />
                </div>
              ))}
            </section>
          ))}

          {specs ? (
            <section aria-labelledby="signaletique">
              {/* « signalétique » et non « caractéristiques » : quatre fiches du
                  corpus rédigent déjà une section `#caracteristiques`, et deux
                  éléments ne peuvent pas porter le même identifiant — l'ancre
                  devenait ambiguë. Un test de corpus tient désormais la règle. */}
              <PlancheSection numero={numero("signaletique")} id="signaletique">
                Fiche signalétique
              </PlancheSection>
              <table className="pl-tab">
                <caption className="sr-only">Caractéristiques techniques — {fiche.title}</caption>
                <tbody>
                  {(
                    [
                      ["Équipage", specs.crew],
                      ["Longueur", specs.length],
                      ["Envergure", specs.wingspan],
                      ["Hauteur", specs.height],
                      ["Masse à vide", specs.emptyWeight],
                      ["Masse maximale au décollage", specs.maxTakeoffWeight],
                      ["Motorisation", specs.powerplant],
                      ["Vitesse maximale", specs.maxSpeed],
                      ["Plafond", specs.ceiling],
                      ["Rayon d’action", specs.range],
                      ["Armement", specs.armament],
                    ] as const
                  )
                    // Une ligne n'apparaît que si la donnée existe : le tableau
                    // ne fabrique pas de trous pour faire nombre. Une valeur
                    // vide déclarée, elle, se lit « — » (PlancheValeur).
                    .filter(([, valeur]) => valeur !== undefined)
                    .map(([libelle, valeur]) => (
                      <tr key={libelle}>
                        <th scope="row">{libelle}</th>
                        <PlancheValeur valeur={valeur} />
                      </tr>
                    ))}
                </tbody>
              </table>
            </section>
          ) : null}

          {fiche.content.pieges.length > 0 ? (
            <section aria-labelledby="pieges">
              <PlancheSection numero={numero("pieges")} id="pieges">
                Pièges fréquents
              </PlancheSection>
              <PlancheEncadre libelle="Attention" variante="piege">
                <ul>
                  {fiche.content.pieges.map((piege) => (
                    <li key={piege}>{piege}</li>
                  ))}
                </ul>
              </PlancheEncadre>
            </section>
          ) : null}

          {documents.length > 0 ? (
            <section aria-labelledby="documents">
              <PlancheSection numero={numero("documents")} id="documents">
                Documents
              </PlancheSection>
              <ul className="pl-renvois">
                {documents.map((doc) => (
                  <li key={doc.id}>
                    <Link href={getDocumentHref(doc)}>
                      <span className="pl-renvoi-t">{doc.title}</span>
                      <span className="pl-renvoi-r">{DOCUMENT_KIND_LABELS[doc.kind]}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section aria-labelledby="sources">
            <PlancheSection numero={numero("sources")} id="sources">
              Sources
            </PlancheSection>
            <ol className="pl-srcs">
              {fiche.sources.map((source, index) => (
                <li key={source.url}>
                  <span className="pl-num">{index + 1}</span>
                  <span>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.title}
                    </a>{" "}
                    — consultée le {dateCourte(source.consultedAt)}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* QuizPlayer et NotionQuiz restent hors périmètre jusqu'à leur lot
              propriétaire. `.pl-hote` n'habille pas ce bloc : il l'isole. */}
          {quizPool.length > 0 ? (
            <div className="pl-hote">
              <NotionQuiz ficheTitle={fiche.title} pool={quizPool} />
            </div>
          ) : null}

          <nav aria-label="Navigation de la catégorie" className="pl-nav">
            {precedente ? <Link href={getFicheHref(precedente)}>← {precedente.title}</Link> : null}
            <Link href={`/${mod.slug}/${category.slug}`}>Retour à {category.name}</Link>
            {suivante ? <Link href={getFicheHref(suivante)}>{suivante.title} →</Link> : null}
          </nav>

          <PlanchePied
            verifie={fiche.verifiedAt}
            sources={fiche.sources.length}
            revision={fiche.version}
          />
          <p className="pl-an-note">
            ID {fiche.id} · créée le {dateCourte(fiche.createdAt)} · vérifiée le{" "}
            {dateCourte(fiche.verifiedAt)} · {fiche.author}
            {perimee ? " · vérification à renouveler" : ""}
          </p>
        </div>

        <aside className="pl-annexe">
          <p className="pl-an-h" id="sommaire">
            Dans cette notice
          </p>
          <PlancheSommaire entrees={sommaire} libelle="Sommaire de la notice" />

          {infoboxEntries.length > 0 ? (
            <>
              <p className="pl-an-h">Données</p>
              {infoboxEntries.map((entree) => (
                <div className="pl-an-row" key={entree.label}>
                  <span>{entree.label}</span>
                  <span className="pl-num">{entree.value}</span>
                </div>
              ))}
            </>
          ) : null}

          {renvois.map((bloc) => (
            <div key={bloc.titre}>
              <p className="pl-an-h">{bloc.titre}</p>
              <nav className="pl-voir" aria-label={bloc.titre}>
                {bloc.items.map((item) => (
                  <Link key={`${item.href}-${item.label}`} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}

          {fiche.revisions.length > 0 ? (
            <>
              <p className="pl-an-h">Historique</p>
              {fiche.revisions.map((revision) => (
                <div className="pl-chrono" key={`${revision.date}-${revision.version}`}>
                  <span className="pl-num">{revision.date}</span>
                  <span>
                    v{revision.version} — {revision.motif}
                  </span>
                </div>
              ))}
            </>
          ) : null}
        </aside>
      </div>
    </PlancheRoot>
  );
}

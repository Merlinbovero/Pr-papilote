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
} from "@/components/planche/planche";
import { PlancheImpression } from "@/components/planche/planche-impression";
import { PlancheMarkdown } from "@/components/planche/planche-markdown";
import { PlancheSommaire } from "@/components/planche/planche-sommaire";
import { buildNotionPool } from "@/features/quiz/notion-pool";
import { NotionQuiz } from "@/features/quiz/notion-quiz";
import type { FicheFile } from "@/lib/content/content-schemas";
import {
  getFicheById,
  getFicheHref,
  getFicheLinks,
  getFichesByCategory,
  getReadingMinutes,
  getTermesForFiche,
} from "@/lib/content/fiches";
import { infoboxLabel } from "@/lib/content/infobox-labels";
import { getCoteFiche } from "@/lib/content/referentials";
import type { Category, Module } from "@/lib/content/schemas";
import { numeroDeSection } from "@/lib/lecon/sommaire";
import { ancreQuiz, sommaireCahier } from "@/lib/fiche/sommaire";
import { AVERTISSEMENTS, dateCourte, renvoisDeFiche } from "./commun";

/**
 * Le Cahier — lot M7b.
 *
 * La famille du **récit** : une histoire, une personne, un épisode. Son modèle
 * est la revue d'histoire, et c'est la famille la plus généreuse en blanc des
 * six (docs/design-archetypes.md, archétype IV).
 *
 * SON ENCRE EST CELLE DE LA FAMILLE, PAS CELLE DU MODULE HÔTE. `sienne`,
 * toujours — y compris pour une histoire de l'Aéronautique navale, qui vit dans
 * le module EOPAN. C'est la règle de `docs/design-archetypes.md` §0 : Culture et
 * Géopolitique partagent volontairement une encre parce qu'elles sont « deux
 * registres d'un même fonds ». L'encre dit ici le FONDS, pas l'étagère.
 *
 * La Planche d'identification suit la règle inverse — encre du module hôte —
 * et c'est délibéré : une notice appartient à son armée, un récit appartient au
 * fonds documentaire. La première version de ce composant avait appliqué la
 * règle de la notice ; la campagne visuelle a montré quatre encres différentes
 * là où il n'en fallait qu'une.
 *
 * CE QUI LA DISTINGUE DE LA NOTICE, et rien d'autre :
 *  - la **marge large** au lieu du rail — la place va au texte, pas au tableau ;
 *  - le **titre à 52 px**, posé sur trois lignes de rythme vides ;
 *  - le **chapô en italique** ;
 *  - la **lettrine**, une seule, en ouverture de l'essentiel.
 *
 * Ce sont les quatre dérogations que le manifeste réserve nommément à cette
 * famille. Aucune autre : on change de chapitre, pas de livre.
 *
 * CE QU'ELLE NE FAIT PAS, faute de contenu canonique — et c'est une décision,
 * pas un oubli :
 *  - **aucune chronologie en marge.** Le motif est décrit au manifeste, mais
 *    aucun champ ne porte de chronologie, et « une chronologie non sourcée
 *    n'est pas publiée ». La déduire de la prose serait la fabriquer. Sept
 *    fiches rédigent une section « Repères » sous forme de tableau Markdown :
 *    elle est rendue telle quelle, comme le contenu l'a écrite.
 *  - **aucun bloc de citation.** Aucun champ ne porte de citation attribuée ;
 *    en extraire des guillemets du corps reviendrait à en fabriquer une.
 *  - **aucune photographie ajoutée**, aucun portrait sans crédit.
 *
 * Les figures historiques déclarées par le contenu sont servies **dans leur
 * bloc hôte**, par le composant historique : M7b ne dessine rien.
 */
export function Cahier({
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
    throw new Error(`Cote manquante pour l’article « ${fiche.id} » (cotes.json)`);
  }

  const quizPool = buildNotionPool(fiche.id);
  const sommaire = sommaireCahier({
    sections: fiche.content.sections.map((s) => ({ id: s.id, title: s.title })),
    pieges: fiche.content.pieges.length > 0,
    quiz: quizPool.length > 0,
  });
  const numero = (id: string) => numeroDeSection(sommaire, id);

  const renvois = renvoisDeFiche(fiche, {
    getFicheById,
    getFicheHref,
    getFicheLinks,
    getTermesForFiche,
  });

  const voisines = getFichesByCategory(fiche.module, fiche.category);
  const rang = voisines.findIndex((v) => v.id === fiche.id);
  const precedente = rang > 0 ? voisines[rang - 1] : undefined;
  const suivante = rang >= 0 && rang < voisines.length - 1 ? voisines[rang + 1] : undefined;

  const avertissement = AVERTISSEMENTS[fiche.status];
  const organisation = mod.organization ?? mod.name;
  const infoboxEntries = fiche.infobox
    ? Object.entries(fiche.infobox).map(([cle, valeur]) => ({
        label: infoboxLabel(cle),
        value: Array.isArray(valeur) ? valeur.join(", ") : String(valeur),
      }))
    : [];

  return (
    <PlancheRoot marginMode="wide" module="sienne" famille="cahier">
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
            {getReadingMinutes(fiche)} min de lecture · vérifié le {dateCourte(fiche.verifiedAt)}
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
                <Image
                  src={fiche.image.src}
                  alt={fiche.image.alt}
                  fill
                  priority
                  /*
                    `sizes` MESURÉ, et non déclaré — correctif du défaut
                    systémique nommé au lot R-01 et laissé ouvert sur ce
                    gabarit.

                    L'ancienne valeur, `(min-width: 1440px) 720px, 100vw`,
                    était fausse deux fois. `100vw` en dessous de 1440 est un
                    mensonge : `.pl-photo-c` se fige à 620 px dès 1180. Et le
                    seuil lui-même était mal placé — la bascule réelle est à
                    1180, pas à 1440.

                    Conséquence mesurée à 1280 px, le poste le plus courant :
                    le navigateur réclamait la variante **1920 pour un
                    conteneur de 620** — 96 460 octets au lieu de 25 540, soit
                    **73,5 % de transfert inutile** sur la même image affichée
                    à l'identique.

                    Les trois branches ci-dessous restituent les onze largeurs
                    relevées de 320 à 1920 px : 288, 343, 358, 608, 712, 778,
                    968, puis 620 fixe. La gouttière est de 32 px sous 768 et
                    de 56 px au-delà — d'où les deux `calc()`.
                  */
                  sizes="(min-width: 1180px) 620px, (min-width: 768px) calc(100vw - 56px), calc(100vw - 32px)"
                  style={fiche.image.focal ? { objectPosition: fiche.image.focal } : undefined}
                />
              </div>
              <PlancheLegende planche="PL. 01">
                {fiche.image.alt} Photo :{" "}
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
            {/* `.pl-ouverture` porte la lettrine, par `::first-letter` : aucun
                caractère n'est extrait du texte, l'ordre de lecture et le texte
                annoncé sont ceux du contenu. Une seule par page. */}
            <div className="pl-ouverture">
              <PlancheMarkdown>{fiche.content.essentiel.body}</PlancheMarkdown>
            </div>
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
              {section.figures.map((figure) => (
                <div className="pl-hote" key={figure.schemaId}>
                  <FicheFigure {...figure} />
                </div>
              ))}
            </section>
          ))}

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

          <section aria-labelledby="sources">
            <PlancheSection numero={numero("sources")} id="sources">
              Sources
            </PlancheSection>
            <ol className="pl-srcs">
              {fiche.sources.map((source, index) => (
                <li key={source.url ?? source.title}>
                  <span className="pl-num">{index + 1}</span>
                  <span>
                    {source.url ? (
                      <a href={source.url} target="_blank" rel="noopener noreferrer">
                        {source.title}
                      </a>
                    ) : (
                      source.title
                    )}{" "}
                    — consultée le {dateCourte(source.consultedAt)}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {quizPool.length > 0 ? (
            <div className="pl-hote">
              <NotionQuiz
                ficheTitle={fiche.title}
                pool={quizPool}
                idBloc={ancreQuiz(fiche.content.sections)}
              />
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
          </p>
        </div>

        <aside className="pl-annexe">
          <p className="pl-an-h" id="sommaire">
            Dans cet article
          </p>
          <PlancheSommaire entrees={sommaire} libelle="Sommaire de l’article" />

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

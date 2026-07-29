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
  getTermesForFiche,
} from "@/lib/content/fiches";
import { editorialState } from "@/lib/content/freshness";
import { getCoteFiche } from "@/lib/content/referentials";
import type { Category, Module } from "@/lib/content/schemas";
import { numeroDeSection } from "@/lib/lecon/sommaire";
import { sommaireSituation } from "@/lib/fiche/sommaire";
import { AVERTISSEMENTS, dateCourte, renvoisDeFiche } from "./commun";

/**
 * La Situation — lot M7b.
 *
 * La famille du **point daté**. Le lecteur vient y chercher de quoi tenir dix
 * minutes d'entretien sur un sujet international : il a besoin d'être exact, et
 * de savoir jusqu'à quand son information vaut. C'est la famille la plus
 * prudente des six, et celle où l'appareil documentaire est le plus visible
 * (docs/design-archetypes.md, archétype V).
 *
 * Son encre est `sienne`, celle du fonds documentaire qu'elle partage avec Le
 * Cahier — jamais celle du module hôte. Ce qui sépare les deux familles n'est
 * pas la couleur, c'est leur rapport au temps : Le Cahier raconte ce qui est
 * arrivé, La Situation décrit ce qui est en cours.
 *
 * DEUX MOTIFS LUI SONT PROPRES.
 *
 * **1. Le bandeau documentaire, au-dessus du chapô.** Le seul bloc du système à
 * la fois obligatoire, non décoratif et placé avant le texte.
 *
 * Il énonce « Informations vérifiées au … », **et non « Arrêté au … »**. La
 * nuance n'est pas cosmétique : `verifiedAt` est la date de dernière
 * vérification des faits, pas une date d'arrêt éditorial. Les deux ne coïncident
 * pas nécessairement, et écrire « arrêté au » ferait passer l'une pour l'autre.
 * Une véritable date d'arrêt demandera **un champ canonique distinct** ; elle ne
 * se simule pas dans un lot graphique. Le manifeste prévoit la mention
 * `À REVOIR` au-delà d'un seuil d'ancienneté : elle vient de `editorialState`,
 * la règle de fraîcheur déjà en place, jamais d'une appréciation.
 *
 * **2. « Ce qui reste incertain », section obligatoire.** Une section de plein
 * rang, avec son filet et son intertitre, exactement comme les faits — jamais
 * reléguée en note.
 *
 * Aucun champ ne la porte aujourd'hui. Le composant **n'invente donc rien** : il
 * affiche une formulation éditoriale neutre disant qu'aucun élément
 * d'incertitude n'est explicitement documenté dans cette version. Il ne déduit
 * pas non plus qu'une affirmation serait un fait, une estimation, une analyse ou
 * une hypothèse quand le contenu ne le précise pas. Le jour où un champ
 * canonique existera, il prendra la place de cette formulation.
 *
 * Aucune carte n'est dessinée : les quatre situations n'en déclarent aucune.
 */

/**
 * La formulation de repli, employée tant qu'aucun champ canonique ne porte les
 * incertitudes. Elle décrit **l'état de la documentation**, pas l'état du
 * monde : elle n'affirme pas qu'il n'y a pas d'incertitude.
 */
const INCERTITUDE_NON_DOCUMENTEE =
  "Aucun élément d’incertitude n’est explicitement documenté dans cette version " +
  "de la fiche. Cette mention porte sur l’état de la documentation, non sur " +
  "l’état du sujet : elle ne signifie pas que tout est établi.";

export function Situation({
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
    throw new Error(`Cote manquante pour la situation « ${fiche.id} » (cotes.json)`);
  }

  const quizPool = buildNotionPool(fiche.id);
  const sommaire = sommaireSituation({
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
  const aRevoir = editorialState(fiche, new Date()) === "a-verifier";
  const organisation = mod.organization ?? mod.name;

  return (
    <PlancheRoot marginMode="wide" module="sienne" famille="situation">
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
          <div className="pl-ft" />

          {/* L'appareil documentaire, avant le chapô — il ne descend jamais. */}
          <p className="pl-arrete">
            <span>Informations vérifiées au {dateCourte(fiche.verifiedAt)}</span>
            <span>
              {fiche.sources.length} source{fiche.sources.length > 1 ? "s" : ""}
            </span>
            {aRevoir ? <span className="pl-alerte">À revoir</span> : null}
          </p>

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
                  sizes="(min-width: 1440px) 720px, 100vw"
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
              {section.figures.map((figure) => (
                <div className="pl-hote" key={figure.schemaId}>
                  <FicheFigure {...figure} />
                </div>
              ))}
            </section>
          ))}

          {/* Section obligatoire — elle existe même sans contenu à y mettre. */}
          <section aria-labelledby="ce-qui-reste-incertain">
            <PlancheSection numero={numero("ce-qui-reste-incertain")} id="ce-qui-reste-incertain">
              Ce qui reste incertain
            </PlancheSection>
            <div className="pl-incertain">
              <p>{INCERTITUDE_NON_DOCUMENTEE}</p>
            </div>
          </section>

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
          </p>
        </div>

        <aside className="pl-annexe">
          <p className="pl-an-h" id="sommaire">
            Dans cette situation
          </p>
          <PlancheSommaire entrees={sommaire} libelle="Sommaire de la situation" />

          <p className="pl-an-h">Appareil documentaire</p>
          <div className="pl-an-row">
            <span>Informations vérifiées au</span>
            <span className="pl-num">{fiche.verifiedAt}</span>
          </div>
          <div className="pl-an-row">
            <span>Sources</span>
            <span className="pl-num">{fiche.sources.length}</span>
          </div>
          <div className="pl-an-row">
            <span>Révision</span>
            <span className="pl-num">v{fiche.version}</span>
          </div>
          <p className="pl-an-note">
            La date ci-dessus est celle de la dernière vérification des faits. Elle ne vaut pas date
            d’arrêt éditorial : ce champ n’existe pas encore.
          </p>

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

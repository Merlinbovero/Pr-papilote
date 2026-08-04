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
import { getCoteFiche } from "@/lib/content/referentials";
import type { Category, Module } from "@/lib/content/schemas";
import { numeroDeSection } from "@/lib/lecon/sommaire";
import { ancreQuiz, sommaireLeconFiche } from "@/lib/fiche/sommaire";
import { AVERTISSEMENTS, dateCourte, renvoisDeFiche } from "./commun";

/**
 * La Leçon — fiche explicative de notion — lot M8b.
 *
 * **Le gabarit frère des quatorze leçons canoniques, pas leur copie.** Les deux
 * familles partagent la grammaire de La Leçon : paragraphes numérotés avec leur
 * repère `§ n` en marge, et annexe qui devient le sommaire ancré. Ce sont les
 * deux seules inflexions que le manifeste accorde à cette famille, et elles
 * existent déjà dans `PlancheSection` et `PlancheSommaire` depuis M5 — ce lot
 * n'ajoute aucune règle de style.
 *
 * L'encre est `bistre`, celle de la **famille** Cours, comme pour les quatorze
 * leçons — jamais celle du module hôte. Même règle qu'au Cahier : l'encre dit le
 * genre du document.
 *
 * CE QU'IL NE FAIT PAS, et c'est la limite centrale du lot : **il ne convertit
 * pas une fiche en cours.** Une leçon canonique porte des objectifs, des
 * prérequis pédagogiques, des étapes à valider, une interaction, des exercices
 * et un sas de sortie vers le quiz. Une fiche de notion n'en porte aucun — ces
 * champs n'existent pas sur son schéma. Le gabarit ne rend donc que ce que la
 * fiche déclare : essentiel, sections, pièges, sources, relations,
 * photographie, figures, révisions. Fabriquer les rubriques manquantes aurait
 * été inventer du contenu pédagogique.
 *
 * L'ANCRE DU QUIZ. `s-entrainer` est l'ancre publique historique, conservée par
 * défaut. Une fiche du corpus rédige pourtant une section de ce nom : sur elle,
 * et sur elle seule, c'est le bloc hôte qui cède et prend `se-tester`. Voir
 * `ancreQuiz` — la règle est une fonction pure, pas une liste de slugs, et un
 * test relève le compte réel sur le corpus.
 *
 * `NotionQuiz` et les figures restent dans des blocs `.pl-hote` : la
 * typographie PLANCHE s'arrête à leur frontière, aucune de leurs classes
 * internes n'est ciblée, aucune géométrie n'est touchée.
 */
export function LeconFiche({
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
    throw new Error(`Cote manquante pour la fiche de notion « ${fiche.id} » (cotes.json)`);
  }

  const quizPool = buildNotionPool(fiche.id);
  const sections = fiche.content.sections.map((s) => ({ id: s.id, title: s.title }));
  const sommaire = sommaireLeconFiche({
    sections,
    pieges: fiche.content.pieges.length > 0,
    quiz: quizPool.length > 0,
  });
  const numero = (id: string) => numeroDeSection(sommaire, id);
  const idQuiz = ancreQuiz(sections);

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

  return (
    <PlancheRoot marginMode="wide" module="bistre">
      <PlancheCartouche>
        {cote} — rév. {fiche.verifiedAt} — {category.name}
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
              {/* Les schémas au trait sont ceux du contenu, servis par le
                  composant historique dans un bloc hôte : géométrie, textes,
                  légendes, alternatives et identifiants inchangés. M8b ne
                  redessine rien. */}
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
              <NotionQuiz ficheTitle={fiche.title} pool={quizPool} idBloc={idQuiz} />
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
            Dans cette fiche
          </p>
          <PlancheSommaire entrees={sommaire} libelle="Sommaire de la fiche" />

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

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
import { getNatureDossier } from "@/lib/content/archetypes";
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
import { ancreQuiz, sommaireDossier } from "@/lib/fiche/sommaire";
import { numeroDeSection } from "@/lib/lecon/sommaire";
import { AVERTISSEMENTS, dateCourte, renvoisDeFiche } from "./commun";

/**
 * Le Dossier de concours — lot M9b. Dernier gabarit de la migration PLANCHE.
 *
 * **Un seul gabarit pour cinq sous-types.** Missions, sélections, concepts,
 * présentations et procédures ont été mesurés avant d'être dessinés : les 23
 * fiches portent exactement le même profil de données — une image, deux ou trois
 * sections, trois ou quatre pièges, des sources, un quiz, trois objectifs, et ni
 * spécifications ni relations. Seul le champ `type` sépare 21 « concept » de 2
 * « procedure ». Cinq gabarits auraient donc exigé d'inventer cinq structures
 * que le contenu ne porte pas.
 *
 * Leur nature s'affiche par un **libellé** — « Mission », « Sélection »… — lu
 * dans le référentiel par `getNatureDossier`, jamais déduit d'une troncature du
 * nom de catégorie : « Parcours de sélection » aurait donné « Parcours de
 * sélection », pas « Sélection ».
 *
 * L'ENCRE EST `indigo`, celle de la **famille**, identique pour les 23. Le
 * manifeste prévoyait à l'origine l'encre du concours — marine, air, terre. La
 * direction éditoriale l'a révisé au lot M9a : l'encre dit le genre du document,
 * pas l'étagère où il est rangé, exactement comme au Cahier et à La Leçon.
 * L'appartenance à l'armée reste lisible par le fil d'Ariane, le préfixe de cote
 * et le nom de l'organisation en marge.
 *
 * CE QU'IL N'INVENTE PAS. Le manifeste décrit pour cette famille une annexe en
 * « échéancier permanent ». **Aucun champ canonique ne porte d'échéance**, et
 * fabriquer un calendrier de concours à partir de rien aurait été la faute la
 * plus grave possible dans la famille précisément chargée de dater et de
 * classer — un candidat aurait pu s'y fier. L'annexe porte donc ce qui existe :
 * sommaire, renvois, historique de révision. Les deux procédures ne reçoivent
 * aucun traitement d'étapes tant que leurs étapes ne sont pas dans les données.
 *
 * La famille est « la plus sèche des six » : pas de lettrine, pas de bandeau,
 * pas de photographie pleine largeur en ouverture. La photographie, quand elle
 * existe, est créditée comme partout ailleurs.
 */
export function Dossier({
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
    throw new Error(`Cote manquante pour le dossier « ${fiche.id} » (cotes.json)`);
  }
  const nature = getNatureDossier(fiche);

  const quizPool = buildNotionPool(fiche.id);
  const sections = fiche.content.sections.map((s) => ({ id: s.id, title: s.title }));
  const idQuiz = ancreQuiz(sections);
  const sommaire = sommaireDossier({
    sections,
    pieges: fiche.content.pieges.length > 0,
    quiz: quizPool.length > 0,
    ancreQuiz: idQuiz,
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

  return (
    <PlancheRoot marginMode="wide" module="indigo" famille="dossier">
      <PlancheCartouche>
        {cote} — {nature} — rév. {fiche.verifiedAt}
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

          {/* La nature du document, puis la catégorie qui le range. L'ordre dit
              la doctrine : le genre prime sur l'étagère. */}
          <p className="pl-sur">
            {nature} · {category.name}
          </p>
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
            Dans ce dossier
          </p>
          <PlancheSommaire entrees={sommaire} libelle="Sommaire du dossier" />

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

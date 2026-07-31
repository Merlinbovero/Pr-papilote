import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PlancheCartouche,
  PlancheEncadre,
  PlanchePied,
  PlancheRoot,
  PlancheSection,
} from "@/components/planche/planche";
import { CourseExperience } from "@/features/cours/course-experience";
import {
  getCourseBySlug,
  getCourses,
  getCoursesByMatiere,
  getExerciceById,
} from "@/lib/content/cours";
import { getFicheById, getFicheHref } from "@/lib/content/fiches";
import { getBiaMatiere } from "@/lib/bia/config";
import { getCategory, getCoteCours } from "@/lib/content/referentials";
import { numeroDeSection, sasDeSortie, sommaireLecon } from "@/lib/lecon/sommaire";
import { PlancheSommaire } from "@/components/planche/planche-sommaire";
import { buildCoursePool } from "@/features/quiz/notion-pool";

/**
 * La Leçon — première route publique du groupe `(planche)` (lot M3).
 *
 * Ce que le lot a changé : le **gabarit**. La coquille historique
 * (`StandalonePageShell`, fil d'Ariane, cartes) laisse place à la planche —
 * marge technique, repères de section, annexe, pied de planche.
 *
 * Ce que le lot n'a **pas** changé : l'URL, le slug, les identifiants, les
 * chargeurs, le pool de quiz, la progression, les métadonnées, l'ordre des
 * sections ni une seule chaîne de contenu. Chaque bloc de l'ancienne page se
 * retrouve ici, dans le même ordre, avec le même texte et les mêmes liens.
 *
 * Un compromis assumé et daté : `CourseExperience` — progression, interaction
 * et quiz — garde son habillage historique. C'est un composant client partagé
 * avec d'autres familles ; le remettre en PLANCHE relève du lot M5, pas d'un
 * lot d'architecture.
 */

export const dynamicParams = false;

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getCourses().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) {
    return {};
  }
  return { title: `${course.title} — Cours`, description: course.description };
}

const NIVEAU_LABELS = ["", "Découverte", "BIA", "Approfondissement"];

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) {
    notFound();
  }

  const matiere = getBiaMatiere(course.matiereBia);
  const categorie = getCategory(course.module, course.categorieFondamentaux);
  const fondamentauxHref = `/${course.module}/${course.categorieFondamentaux}`;
  const biaHref = `/bia/${course.matiereBia}`;

  const siblings = getCoursesByMatiere(course.matiereBia);
  const position = siblings.findIndex((c) => c.id === course.id);
  const previous = position > 0 ? siblings[position - 1] : undefined;
  const next = position >= 0 && position < siblings.length - 1 ? siblings[position + 1] : undefined;

  const fiches = course.fiches
    .map((id) => getFicheById(id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f));
  const exercices = course.exercices
    .map((id) => getExerciceById(id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));
  const quizPool = buildCoursePool(course.questions);

  const steps = course.sequence.map((s, index) => ({
    index,
    kind: s.kind,
    title: s.title,
    obligatoire: s.obligatoire,
  }));

  // La cote est **lue** dans `content/_referentiels/cotes.json`, jamais
  // recalculée : elle se note sur un cahier et doit se retrouver six mois plus
  // tard. Une leçon sans cote est une erreur d'intégrité, pas un cas nominal.
  const cote = getCoteCours(course.slug);
  if (!cote) {
    throw new Error(`Cote manquante pour la leçon « ${course.slug} » (cotes.json)`);
  }

  // Le sommaire décrit ce que la page rend : il est calculé au serveur, ses
  // ancres existent donc dans le HTML et fonctionnent sans JavaScript.
  const sommaire = sommaireLecon({
    etapes: steps.some((s) => s.obligatoire),
    interaction: steps.some((s) => s.kind === "interaction") && course.interactions.length > 0,
    quiz: steps.some((s) => s.kind === "quiz") && quizPool.length > 0,
    exercices: exercices.length > 0,
  });
  // Le compte porte sur les questions **jouables**, pas sur la liste déclarée.
  const sas = sasDeSortie(quizPool.length);
  // La révision est la date de vérification de la première fiche du cours.
  // Sans fiche, la donnée est inconnue : elle s'écrit « — », jamais estimée.
  const revision = fiches[0]?.verifiedAt ?? "—";
  const sourcesTotal = course.sources.length;

  return (
    <PlancheRoot marginMode="wide" module="bistre">
      <PlancheCartouche>
        {cote} — rév. {revision} — {matiere ? matiere.name : "Cours"}
      </PlancheCartouche>

      <div className="pl-page">
        <aside className="pl-marge" aria-hidden="true">
          <div className="pl-cote">{cote}</div>
          <div className="pl-rev">RÉV. {revision}</div>
          <div className="pl-mmark">Fondamentaux</div>
        </aside>

        <div className="pl-corps">
          <nav aria-label="Fil d’Ariane" className="pl-fil">
            <Link href="/bia">BIA</Link>
            {matiere ? <Link href={biaHref}>{matiere.name}</Link> : null}
            <span aria-current="page">{course.title}</span>
          </nav>

          <p className="pl-sur">{matiere ? matiere.name : "Cours"}</p>
          <h1 className="pl-titre">{course.title}</h1>
          <p className="pl-stitre">
            {NIVEAU_LABELS[course.niveau]} · Cours n°{course.ordre} · ≈ {course.dureeEstimeeMin} min
          </p>
          <div className="pl-ft" />
          <p className="pl-chapo">{course.description}</p>

          <section aria-label="Objectifs">
            <PlancheSection numero={numeroDeSection(sommaire, "objectifs")} id="objectifs">
              Objectifs
            </PlancheSection>
            <ul>
              {course.objectifs.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </section>

          <section aria-label="Prérequis">
            <PlancheSection numero={numeroDeSection(sommaire, "prerequis")} id="prerequis">
              Prérequis
            </PlancheSection>
            {course.prerequisites.length === 0 ? (
              <p>Aucun — c’est le point de départ.</p>
            ) : (
              <ul>
                {course.prerequisites.map((id) => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            )}
          </section>

          <section aria-label="Fiches à étudier">
            <PlancheSection numero={numeroDeSection(sommaire, "fiches")} id="fiches">
              Fiches à étudier
            </PlancheSection>
            <ul className="pl-renvois">
              {fiches.map((fiche) => (
                <li key={fiche.id}>
                  {/* Le résumé reste **dans** le lien, comme dans le gabarit
                      historique : le nom accessible et la cible de clic ne
                      changent pas d'un lot de gabarit à l'autre. */}
                  <Link href={getFicheHref(fiche)}>
                    <span className="pl-renvoi-t">{fiche.title}</span>
                    <span className="pl-renvoi-r">{fiche.summary}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* Expérience interactive : progression, interaction, quiz (client).
              Habillage historique conservé — voir l'en-tête du fichier. */}
          <CourseExperience
            courseId={course.id}
            steps={steps}
            interactionIds={course.interactions}
            quizPool={quizPool}
          />

          {exercices.length > 0 ? (
            <section aria-label="Exercices" id="exercices">
              <PlancheSection
                numero={numeroDeSection(sommaire, "exercices-titre")}
                id="exercices-titre"
              >
                Exercices guidés
              </PlancheSection>
              {exercices.map((ex) => (
                <details key={ex.id} className="pl-exo">
                  <summary>{ex.title}</summary>
                  <p>
                    <strong>Consigne.</strong> {ex.consigne}
                  </p>
                  {ex.donnees ? (
                    <p>
                      <strong>Données.</strong> {ex.donnees}
                    </p>
                  ) : null}
                  <p>
                    <strong>Méthode.</strong> {ex.methode}
                  </p>
                  <p>
                    <strong>Correction.</strong> {ex.correction}
                  </p>
                  <p>
                    <strong>Interprétation aéronautique.</strong> {ex.interpretation}
                  </p>
                </details>
              ))}
            </section>
          ) : null}

          {sas ? (
            <p className="pl-sortie">
              → <a href="#se-tester">{sas}</a>
            </p>
          ) : null}

          <section aria-label="À retenir" id="revision">
            <PlancheEncadre libelle="L’essentiel à retenir" titre id="essentiel">
              <ul>
                {course.resumeRevision.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </PlancheEncadre>
          </section>

          <nav aria-label="Navigation du parcours" className="pl-nav">
            {previous ? <Link href={`/cours/${previous.slug}`}>← {previous.title}</Link> : null}
            <Link href={fondamentauxHref}>Retour aux Fondamentaux</Link>
            <Link href={biaHref}>Retour à la matière BIA</Link>
            {next ? <Link href={`/cours/${next.slug}`}>{next.title} →</Link> : null}
          </nav>

          <PlanchePied verifie={revision} sources={sourcesTotal} revision={course.ordre} />
        </div>

        <aside className="pl-annexe">
          <p className="pl-an-h" id="sommaire">
            Dans cette leçon
          </p>
          <PlancheSommaire entrees={sommaire} />

          <p className="pl-an-h">Voir aussi</p>
          <nav className="pl-voir" aria-label="Voir aussi">
            {previous ? <Link href={`/cours/${previous.slug}`}>{previous.title}</Link> : null}
            {next ? <Link href={`/cours/${next.slug}`}>{next.title}</Link> : null}
            {categorie ? <Link href={fondamentauxHref}>{categorie.name}</Link> : null}
            {matiere ? <Link href={biaHref}>{matiere.name}</Link> : null}
          </nav>

          <p className="pl-an-h">Repères</p>
          <div className="pl-an-row">
            <span>Durée estimée</span>
            <span className="pl-num">{course.dureeEstimeeMin} min</span>
          </div>
          <div className="pl-an-row">
            <span>Niveau</span>
            <span className="pl-num">{NIVEAU_LABELS[course.niveau]}</span>
          </div>
          <div className="pl-an-row">
            <span>Questions</span>
            <span className="pl-num">{course.questions.length}</span>
          </div>

          {course.sources.length > 0 ? (
            <>
              <p className="pl-an-h">Sources</p>
              <ol className="pl-srcs">
                {course.sources.map((s, index) => (
                  <li key={s.title}>
                    <span className="pl-num">{index + 1}</span>
                    <span>
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noreferrer">
                          {s.title}
                        </a>
                      ) : (
                        s.title
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            </>
          ) : null}
        </aside>
      </div>
    </PlancheRoot>
  );
}

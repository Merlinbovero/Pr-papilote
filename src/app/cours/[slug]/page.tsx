import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, GraduationCap, Layers } from "lucide-react";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { Badge } from "@/components/ui/badge";
import { CourseExperience } from "@/features/cours/course-experience";
import {
  getCourseBySlug,
  getCourses,
  getCoursesByMatiere,
  getExerciceById,
} from "@/lib/content/cours";
import { getFicheById, getFicheHref } from "@/lib/content/fiches";
import { getBiaMatiere } from "@/lib/bia/config";
import { getCategory } from "@/lib/content/referentials";
import { buildCoursePool } from "@/features/quiz/notion-pool";

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

  return (
    <StandalonePageShell
      breadcrumb={[
        { label: "BIA", href: "/bia" },
        ...(matiere ? [{ label: matiere.name, href: biaHref }] : []),
        { label: course.title },
      ]}
    >
      {/* En-tête */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {matiere ? <Badge variant="secondary">{matiere.name}</Badge> : null}
          <Badge variant="outline">{NIVEAU_LABELS[course.niveau]}</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="text-muted-foreground max-w-2xl">{course.description}</p>
        <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" aria-hidden="true" /> ≈ {course.dureeEstimeeMin} min
          </span>
          <span className="flex items-center gap-1.5">
            <Layers className="size-4" aria-hidden="true" /> Cours n°{course.ordre}
          </span>
          {categorie ? (
            <span className="flex items-center gap-1.5">
              <GraduationCap className="size-4" aria-hidden="true" /> Fondamentaux ·{" "}
              <Link href={fondamentauxHref} className="underline">
                {categorie.name}
              </Link>
            </span>
          ) : null}
        </div>
      </header>

      {/* Objectifs & prérequis */}
      <section aria-label="Objectifs" className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Objectifs</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {course.objectifs.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Prérequis</h2>
          {course.prerequisites.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun — c’est le point de départ.</p>
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {course.prerequisites.map((id) => (
                <li key={id}>{id}</li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Fiches à étudier */}
      <section aria-label="Fiches à étudier" className="space-y-3">
        <h2 className="text-xl font-semibold">Fiches à étudier</h2>
        <ul className="space-y-2">
          {fiches.map((fiche) => (
            <li key={fiche.id}>
              <Link
                href={getFicheHref(fiche)}
                className="bg-card hover:border-primary/50 block rounded-lg border p-3 transition-colors"
              >
                <span className="font-medium">{fiche.title}</span>
                <span className="text-muted-foreground block text-sm">{fiche.summary}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Expérience interactive : progression, interaction, quiz (client) */}
      <CourseExperience
        courseId={course.id}
        steps={steps}
        interactionIds={course.interactions}
        quizPool={quizPool}
      />

      {/* Exercices guidés */}
      {exercices.length > 0 ? (
        <section aria-label="Exercices" id="exercices" className="space-y-3">
          <h2 className="text-xl font-semibold">Exercices guidés</h2>
          <div className="space-y-3">
            {exercices.map((ex) => (
              <details key={ex.id} className="bg-card rounded-lg border p-4">
                <summary className="cursor-pointer font-medium">{ex.title}</summary>
                <div className="mt-3 space-y-2 text-sm">
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
                  <p className="text-muted-foreground">
                    <strong>Interprétation aéronautique.</strong> {ex.interpretation}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {/* Fiche de révision — l'ancre « à retenir », mise en avant comme dans les fiches */}
      <section aria-label="À retenir" id="revision">
        <div className="bg-card border-primary rounded-xl border border-l-4 p-6">
          <h2 className="mb-3 text-xl font-semibold tracking-tight">L’essentiel à retenir</h2>
          <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6">
            {course.resumeRevision.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* Sources */}
      {course.sources.length > 0 ? (
        <section aria-label="Sources" className="space-y-2">
          <h2 className="text-lg font-semibold">Sources</h2>
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
            {course.sources.map((s) => (
              <li key={s.title}>
                {s.url ? (
                  <a href={s.url} className="underline" target="_blank" rel="noreferrer">
                    {s.title}
                  </a>
                ) : (
                  s.title
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Navigation */}
      <nav
        aria-label="Navigation du parcours"
        className="flex flex-wrap justify-between gap-3 border-t pt-6"
      >
        <div className="flex gap-3">
          {previous ? (
            <Link
              href={`/cours/${previous.slug}`}
              className="flex items-center gap-1 text-sm underline"
            >
              <ArrowLeft className="size-4" aria-hidden="true" /> {previous.title}
            </Link>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href={fondamentauxHref} className="text-sm underline">
            Retour aux Fondamentaux
          </Link>
          <Link href={biaHref} className="text-sm underline">
            Retour à la matière BIA
          </Link>
          {next ? (
            <Link
              href={`/cours/${next.slug}`}
              className="flex items-center gap-1 text-sm underline"
            >
              {next.title} <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </nav>
    </StandalonePageShell>
  );
}

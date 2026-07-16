import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { courseSchema, exerciceSchema, type Course, type Exercice } from "./cours-schema";
import { getFiches, getQuestions, getTermes } from "./fiches";
import { getCategory } from "./referentials";
import { getBiaMatiere } from "@/lib/bia/config";
import { isKnownInteraction } from "@/features/interactions/registry";

/**
 * Chargement et validation d'INTÉGRITÉ RÉFÉRENTIELLE des cours et exercices
 * (docs/editorial/cours.md). Lecture au build. Toute référence morte (fiche,
 * question, terme, exercice, interaction, prérequis, matière, catégorie),
 * tout doublon d'identifiant ou d'ordre, toute page PDF hors intervalle, ou
 * tout cours publié sans source/question, FAIT ÉCHOUER LE BUILD.
 */

const CONTENT_DIR = path.join(process.cwd(), "content");
/** Le PDF « Mécanique du Vol » (M.V. 001) compte 100 pages. */
const MAX_PDF_PAGE = 100;

const PUBLISHED = new Set(["publie", "a-mettre-a-jour"]);

function readYamlFiles(dir: string): { file: string; data: unknown }[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  const out: { file: string; data: unknown }[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && entry.name.endsWith(".yaml")) {
      const file = path.join(entry.parentPath, entry.name);
      out.push({ file, data: parseYaml(fs.readFileSync(file, "utf-8")) });
    }
  }
  return out;
}

interface CoursIndex {
  courses: Course[];
  exercices: Exercice[];
}

let cache: CoursIndex | undefined;

function buildIndex(): CoursIndex {
  const exercices = readYamlFiles(path.join(CONTENT_DIR, "exercices")).map(({ data }) =>
    exerciceSchema.parse(data)
  );
  const exerciceIds = new Set(exercices.map((e) => e.id));
  if (exerciceIds.size !== exercices.length) {
    throw new Error("Cours : identifiants d'exercices en double");
  }

  const courses = readYamlFiles(path.join(CONTENT_DIR, "cours")).map(({ data }) =>
    courseSchema.parse(data)
  );
  const courseIds = new Set(courses.map((c) => c.id));
  if (courseIds.size !== courses.length) {
    throw new Error("Cours : identifiants de cours en double");
  }

  // Ensembles de référence (objets canoniques existants)
  const ficheIds = new Set(getFiches().map((f) => f.id));
  const questionIds = new Set(getQuestions().map((q) => q.id));
  const termeIds = new Set(getTermes().map((t) => t.id));

  // Ordre unique par matière BIA
  const orderByMatiere = new Map<string, Set<number>>();

  for (const c of courses) {
    const where = `Cours « ${c.id} »`;

    if (!getCategory(c.module, c.categorieFondamentaux)) {
      throw new Error(`${where} : catégorie Fondamentaux inconnue « ${c.categorieFondamentaux} »`);
    }
    if (!getBiaMatiere(c.matiereBia)) {
      throw new Error(`${where} : matière BIA inconnue « ${c.matiereBia} »`);
    }

    const seen = orderByMatiere.get(c.matiereBia) ?? new Set<number>();
    if (seen.has(c.ordre)) {
      throw new Error(
        `${where} : ordre ${c.ordre} déjà utilisé dans la matière « ${c.matiereBia} »`
      );
    }
    seen.add(c.ordre);
    orderByMatiere.set(c.matiereBia, seen);

    for (const fiche of c.fiches) {
      if (!ficheIds.has(fiche)) {
        throw new Error(`${where} : fiche référencée inexistante « ${fiche} »`);
      }
    }
    for (const q of c.questions) {
      if (!questionIds.has(q)) {
        throw new Error(`${where} : question référencée inexistante « ${q} »`);
      }
    }
    for (const t of c.termes) {
      if (!termeIds.has(t)) {
        throw new Error(`${where} : terme référencé inexistant « ${t} »`);
      }
    }
    for (const ex of c.exercices) {
      if (!exerciceIds.has(ex)) {
        throw new Error(`${where} : exercice référencé inexistant « ${ex} »`);
      }
    }
    for (const inter of c.interactions) {
      if (!isKnownInteraction(inter)) {
        throw new Error(`${where} : interaction inconnue « ${inter} »`);
      }
    }
    for (const pre of c.prerequisites) {
      if (!courseIds.has(pre)) {
        throw new Error(`${where} : prérequis inexistant « ${pre} »`);
      }
    }
    for (const range of c.pdfPages) {
      if (range.from < 1 || range.to > MAX_PDF_PAGE) {
        throw new Error(
          `${where} : pages PDF hors intervalle 1–${MAX_PDF_PAGE} (${range.from}–${range.to})`
        );
      }
    }

    // Chaque étape "concrète" doit pointer vers un objet effectivement référencé
    for (const step of c.sequence) {
      if (step.kind === "fiche" || step.kind === "interaction" || step.kind === "exercice") {
        if (!step.ref) {
          throw new Error(`${where} : étape « ${step.title} » (${step.kind}) sans référence`);
        }
        const pool =
          step.kind === "fiche"
            ? c.fiches
            : step.kind === "interaction"
              ? c.interactions
              : c.exercices;
        if (!pool.includes(step.ref)) {
          throw new Error(
            `${where} : étape « ${step.title} » renvoie à « ${step.ref} » absent de ${step.kind}s[]`
          );
        }
      }
    }

    if (PUBLISHED.has(c.status)) {
      if (c.sources.length === 0) {
        throw new Error(`${where} : cours publié sans aucune source`);
      }
      if (c.questions.length === 0) {
        throw new Error(`${where} : cours publié sans aucune question`);
      }
    }
  }

  // Intégrité des exercices
  for (const e of exercices) {
    if (!ficheIds.has(e.notionLiee)) {
      throw new Error(`Exercice « ${e.id} » : notion liée inexistante « ${e.notionLiee} »`);
    }
  }

  courses.sort((a, b) => a.ordre - b.ordre);
  return { courses, exercices };
}

function index(): CoursIndex {
  if (!cache) {
    cache = buildIndex();
  }
  return cache;
}

export function getCourses(): Course[] {
  return index().courses.filter((c) => c.status === "publie" || includeDrafts());
}

export function getExercices(): Exercice[] {
  return index().exercices;
}

function includeDrafts(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_DRAFTS === "1";
}

export function getCourseBySlug(slug: string): Course | undefined {
  return getCourses().find((c) => c.slug === slug);
}

export function getCourseById(id: string): Course | undefined {
  return getCourses().find((c) => c.id === id);
}

export function getExerciceById(id: string): Exercice | undefined {
  return getExercices().find((e) => e.id === id);
}

/** Cours d'une matière BIA (référence, pas de copie), triés par ordre. */
export function getCoursesByMatiere(matiereSlug: string): Course[] {
  return getCourses()
    .filter((c) => c.matiereBia === matiereSlug)
    .sort((a, b) => a.ordre - b.ordre);
}

/** Cours d'une catégorie des Fondamentaux, triés par ordre. */
export function getCoursesByFondamentauxCategory(module: string, category: string): Course[] {
  return getCourses()
    .filter((c) => c.module === module && c.categorieFondamentaux === category)
    .sort((a, b) => a.ordre - b.ordre);
}

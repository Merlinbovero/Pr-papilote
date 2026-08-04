"use client";

import * as React from "react";
import { z } from "zod";
import { BookmarkIcon, FlagIcon, RotateCcwIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Annonce } from "@/components/a11y/annonce";
import { Chronometre } from "@/features/banc/chronometre";
import { LienApprofondir } from "@/features/banc/lien-approfondir";
import { ModeSeance } from "@/features/banc/mode-seance";
import { ReponseBanc } from "@/features/banc/etat-reponse";
import { deplacerFocus } from "@/lib/a11y/focus-transition";
import type { EtatChrono } from "@/lib/design/banc-tokens";
import { ecrireStocke, lireStocke, VERSION_HERITEE } from "@/lib/stockage/stockage";
import { cn } from "@/lib/utils";
import {
  composeBiaExam,
  gradeComposedExam,
  type BiaExamQuestion,
  type BiaExamReport,
} from "@/lib/bia/exam";
import type { BiaConfig, BiaPlayerQuestion } from "@/lib/bia/schema";

/**
 * Examen blanc BIA — expérience complète côté client
 * (docs/editorial/module-bia.md) : composition par graine de session
 * (renouvellement via l'historique local), navigation libre entre les
 * questions, marquage « à revoir », chronomètre global, validation
 * finale, correction détaillée avec renvoi vers les fiches, score par
 * matière et synthèse. Le moteur (composition, notation) vient de
 * src/lib/bia/exam — aucune logique de barème ici.
 *
 * ── Lot F5 — le Banc, sur la première séance réellement autonome ─────────
 * Les lots F2 et F3 ont porté le Banc sur des entraînements libres ; F4 a
 * arbitré que les quiz ENCASTRÉS restent documentaires. L'examen blanc est
 * l'autre bord de cette frontière, et le plus net : il se lance
 * explicitement, occupe cent questions et deux heures et demie, se chronomètre
 * et se termine. Changement de tâche principale, donc changement de registre.
 *
 * Ce que la migration change, et rien d'autre :
 *  1. l'introduction se replie au lancement (`ModeSeance`) — le chapeau ne
 *     reste plus empilé au-dessus de l'aire de jeu pendant que le temps court ;
 *  2. le chronomètre cesse d'être une métadonnée grise de la taille du
 *     compteur de questions : il prend le poids de la contrainte qu'il est ;
 *  3. les réponses passent par `ReponseBanc` — verdict ÉCRIT et non seulement
 *     teinté — et les renvois de correction par `LienApprofondir`, ce qui
 *     rembourse DT-002 sur cette route ;
 *  4. les surfaces remplacent les cartes bordées du registre documentaire.
 *
 * Ce qu'elle ne change pas, et que `e2e/bia-examen-f5-reference.spec.ts` fige
 * depuis AVANT la migration : les trois phases, leurs noms accessibles, la
 * navigation libre, le marquage, le pavé, la note, l'historique et sa clé.
 */

const SEEN_STORAGE_KEY = "prepapilote.bia.seenQuestions";
const HISTORY_STORAGE_KEY = "prepapilote.bia.examHistory";

/**
 * Seuils du chronomètre — décidés **par le moteur**, jamais par le composant.
 *
 * `Chronometre` sait rendre `normal`, `warning`, `critical` et `expired` ; il
 * refuse délibérément de déduire lequel s'applique, parce que cinq secondes
 * sont critiques sur une question de quinze et anodines sur une épreuve de
 * deux heures et demie. Ici, l'échelle est celle de l'examen : le quart
 * d'heure qui reste mérite un signal, les cinq dernières minutes en méritent
 * un autre. Le rendu historique n'avait qu'un seuil, à 300 s ; il est
 * conservé et complété, pas remplacé.
 */
const CHRONO_ATTENTION = 900;
const CHRONO_CRITIQUE = 300;

function etatChrono(restant: number): EtatChrono {
  if (restant <= 0) return "expired";
  if (restant <= CHRONO_CRITIQUE) return "critical";
  if (restant <= CHRONO_ATTENTION) return "warning";
  return "normal";
}

interface ExamHistoryEntry {
  finishedAt: string;
  noteGlobale20: number;
  admis: boolean;
  dureeSecondes: number;
}

/**
 * Version du contenu stocké — lot F11. Les CLÉS ne changent pas : renommer
 * abandonnerait les historiques déjà constitués.
 */
const VERSION_STOCKAGE = 1;

/**
 * Les deux schémas, appliqués à la LECTURE.
 *
 * Avant le lot F11, ce fichier faisait `JSON.parse(raw) as T` : un `as`
 * affirme, il ne vérifie pas. Une note stockée en chaîne, une date illisible
 * ou un tableau tronqué par une écriture interrompue entraient sans contrôle
 * et se manifestaient bien plus loin — dans l'affichage de l'historique, ou
 * dans le tirage qui exclut les questions déjà vues.
 */
const historiqueSchema = z.array(
  z.object({
    finishedAt: z.string().refine((v) => !Number.isNaN(Date.parse(v))),
    noteGlobale20: z.number(),
    admis: z.boolean(),
    dureeSecondes: z.number().nonnegative(),
  })
);
const vuesSchema = z.array(z.string());

/**
 * Les données écrites avant ce lot sont des tableaux nus : leur forme est
 * déjà la bonne, seul l'emballage est nouveau. On les accepte telles quelles,
 * et la première écriture les enveloppe.
 */
const heritage = (depuis: number, charge: unknown) =>
  depuis === VERSION_HERITEE ? charge : undefined;

interface BiaExamPlayerProps {
  /** URL du vivier JSON, récupéré à la demande au lancement (Phase 16). */
  poolUrl: string;
  /** Nombre total de questions du vivier (compté au serveur, sans les données). */
  totalAvailable: number;
  config: BiaConfig;
  matiereNames: Record<string, string>;
  /**
   * En-tête de page, confié à la séance pour qu'il **se replie au lancement**
   * — même contrat qu'aux routes déjà migrées (F2a, F2b, F3). C'est la
   * condition pour que l'aire de jeu entre dans le cadre.
   */
  entete?: React.ReactNode;
}

/**
 * Les phases du joueur — l'avant-séance n'en fait plus partie.
 *
 * C'est `ModeSeance` qui porte désormais la présentation et le lancement :
 * `attente` est donc le premier état du joueur, celui où l'aire existe et le
 * vivier arrive.
 */
type Phase = "attente" | "erreur" | "running" | "review";

export function BiaExamPlayer({
  poolUrl,
  totalAvailable,
  config,
  matiereNames,
  entete,
}: BiaExamPlayerProps) {
  const [phase, setPhase] = React.useState<Phase>("attente");
  const poolsCache = React.useRef<Record<string, BiaPlayerQuestion[]> | null>(null);
  const [questions, setQuestions] = React.useState<BiaExamQuestion<BiaPlayerQuestion>[]>([]);
  const [shortagesCount, setShortagesCount] = React.useState(0);
  const [index, setIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number[]>>({});
  const [marked, setMarked] = React.useState<Set<string>>(new Set());
  const [remaining, setRemaining] = React.useState(config.examen.dureeSecondes);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [report, setReport] = React.useState<BiaExamReport | null>(null);
  const [elapsed, setElapsed] = React.useState(0);
  const [history, setHistory] = React.useState<ExamHistoryEntry[]>([]);
  /**
   * Compteur de séances — clé de `ModeSeance`.
   *
   * « Nouvel examen » doit ramener à la présentation ; or le repli de
   * l'introduction est un état INTERNE au mode séance. Plutôt que d'ouvrir ce
   * composant partagé à un pilotage externe, on le remonte : un nouvel examen
   * EST une nouvelle séance, et la remise à zéro est alors exacte par
   * construction. Même procédé qu'au lot F4 pour les nouveaux tirages.
   */
  const [seance, setSeance] = React.useState(0);

  // Chargé après l'hydratation (asynchrone : pas de rendu en cascade,
  // et le HTML serveur — sans historique — reste identique au premier
  // rendu client).
  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      setHistory(
        lireStocke<ExamHistoryEntry[]>(HISTORY_STORAGE_KEY, historiqueSchema, [], {
          version: VERSION_STOCKAGE,
          migrer: heritage,
        })
      );
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const start = React.useCallback(async () => {
    let pools = poolsCache.current;
    if (!pools) {
      setPhase("attente");
      try {
        const res = await fetch(poolUrl);
        if (!res.ok) throw new Error(String(res.status));
        pools = (await res.json()) as Record<string, BiaPlayerQuestion[]>;
        poolsCache.current = pools;
      } catch {
        setPhase("erreur");
        return;
      }
    }
    const seenIds = new Set(
      lireStocke<string[]>(SEEN_STORAGE_KEY, vuesSchema, [], {
        version: VERSION_STOCKAGE,
        migrer: heritage,
      })
    );
    const byMatiere = new Map(Object.entries(pools));
    const exam = composeBiaExam({
      pools: { byMatiere },
      config,
      seed: Date.now() % 2147483647,
      seenIds,
    });
    setQuestions(exam.questions);
    setShortagesCount(exam.shortages.reduce((sum, s) => sum + (s.requested - s.provided), 0));
    setAnswers({});
    setMarked(new Set());
    setIndex(0);
    setRemaining(config.examen.dureeSecondes);
    setStartedAt(Date.now());
    setReport(null);
    setPhase("running");
  }, [poolUrl, config]);

  // Annonces et focus — lot F1a. L'examen est le cas le plus sensible au
  // temps : une transition qui laisse le focus sur `body` renvoie au haut du
  // document pendant que le chronomètre tourne.
  const [annonce, setAnnonce] = React.useState("");
  const zoneQuestion = React.useRef<HTMLDivElement>(null);
  /** L'élément qui a déclenché la transition (voir `quiz-player`). */
  const declencheur = React.useRef<Element | null>(null);
  const noterDeclencheur = (evenement: { currentTarget: Element }) => {
    declencheur.current = evenement.currentTarget;
  };
  const premierRendu = React.useRef(true);

  React.useEffect(() => {
    if (premierRendu.current) {
      premierRendu.current = false;
      return;
    }
    if (phase === "running") {
      deplacerFocus(zoneQuestion.current, { declencheur: declencheur.current });
    }
  }, [phase, index]);

  /*
    Focus des états ASYNCHRONES (erreur de chargement).

    `ModeSeance` a déjà posé le focus sur l'aire de séance au lancement ; le
    résultat du chargement arrive ensuite. On mémorise donc où le système
    avait laissé le focus et on ne le déplace que s'il s'y trouve encore —
    même précaution qu'à `/reviser`.
  */
  const zoneErreur = React.useRef<HTMLElement>(null);
  const focusAuLancement = React.useRef<Element | null>(null);

  React.useEffect(() => {
    if (phase !== "erreur") {
      return;
    }
    deplacerFocus(zoneErreur.current, { declencheur: focusAuLancement.current });
  }, [phase]);

  const finish = React.useCallback(() => {
    if (phase !== "running") {
      return;
    }
    const graded = gradeComposedExam(
      { questions },
      (question) => {
        const given = answers[question.id];
        if (!given || given.length === 0) {
          return undefined;
        }
        const expected = new Set(question.correctChoices);
        return given.length === expected.size && given.every((c) => expected.has(c));
      },
      config
    );
    const spent = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
    const entry: ExamHistoryEntry = {
      finishedAt: new Date().toISOString(),
      noteGlobale20: graded.noteGlobale20,
      admis: graded.admis,
      dureeSecondes: spent,
    };
    const nextHistory = [entry, ...history].slice(0, 20);
    ecrireStocke(HISTORY_STORAGE_KEY, nextHistory, VERSION_STOCKAGE);
    const seen = new Set(
      lireStocke<string[]>(SEEN_STORAGE_KEY, vuesSchema, [], {
        version: VERSION_STOCKAGE,
        migrer: heritage,
      })
    );
    for (const { question } of questions) {
      seen.add(question.id);
    }
    ecrireStocke(SEEN_STORAGE_KEY, [...seen].slice(-2000), VERSION_STOCKAGE);

    setReport(graded);
    setElapsed(spent);
    setHistory(nextHistory);
    // L'examen se note sur 20, pas en nombre de bonnes réponses : l'annonce
    // dit la note, qui est le résultat que le candidat attend.
    setAnnonce(
      `Examen terminé. Note : ${graded.noteGlobale20.toFixed(1).replace(".", ",")} sur 20.`
    );
    setPhase("review");
  }, [phase, questions, answers, config, startedAt, history]);

  // Chronomètre global : à zéro, l'examen est remis tel quel.
  React.useEffect(() => {
    if (phase !== "running") {
      return;
    }
    const id = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearInterval(id);
          finish();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, finish]);

  const total = config.matieres.length * config.examen.questionsParMatiere;

  return (
    <ModeSeance
      key={seance}
      // Une seule séance à la fois, remontée à chaque nouvel examen : le
      // focus doit alors être replacé, le bouton actionné ayant disparu.
      focusAuMontage={seance > 0}
      labelSeance="Examen blanc BIA"
      libelleLancement="Commencer l’examen"
      onSeanceEntree={() => {
        focusAuLancement.current = document.activeElement;
        void start();
      }}
      onSortie={() => {
        setPhase("attente");
        setQuestions([]);
        setReport(null);
      }}
      introduction={
        <div className="space-y-6">
          {entete}
          <ExamIntro config={config} history={history} totalAvailable={totalAvailable} />
        </div>
      }
    >
      {phase === "review" && report ? (
        <>
          <Annonce message={annonce} />
          <ExamReview
            questions={questions}
            answers={answers}
            report={report}
            matiereNames={matiereNames}
            elapsedSeconds={elapsed}
            onRestart={() => {
              setPhase("attente");
              setReport(null);
              setQuestions([]);
              setSeance((n) => n + 1);
            }}
          />
        </>
      ) : phase === "erreur" ? (
        /*
          L'erreur interrompt le parcours : elle porte `role="alert"`, reçoit
          le focus et offre une sortie. Un message sans action laisserait le
          candidat dans une impasse — le rendu historique affichait l'alerte
          dans l'introduction, qui est désormais repliée.
        */
        <section
          ref={zoneErreur}
          tabIndex={-1}
          role="alert"
          className="banc-stimulus space-y-3 outline-none"
          style={{ borderLeft: "3px solid var(--bc-erreur)" }}
        >
          <h2 className="font-semibold" style={{ color: "var(--bc-erreur)" }}>
            Chargement impossible
          </h2>
          <p className="banc-consigne text-sm" style={{ color: "var(--bc-encre2)" }}>
            Le vivier de questions n’a pas pu être récupéré. Vérifiez votre connexion, puis relancez
            l’examen. Vos examens déjà passés sont intacts.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="sm" onClick={() => void start()}>
              <RotateCcwIcon aria-hidden className="size-4" />
              Réessayer
            </Button>
          </div>
        </section>
      ) : phase === "running" ? (
        <ExamRunning
          questions={questions}
          index={index}
          answers={answers}
          marked={marked}
          remaining={remaining}
          shortagesCount={shortagesCount}
          matiereNames={matiereNames}
          zoneQuestion={zoneQuestion}
          noterDeclencheur={noterDeclencheur}
          onIndex={setIndex}
          onAnswers={setAnswers}
          onMarked={setMarked}
          onFinish={finish}
        />
      ) : (
        /* `attente` : l'aire est en place, le vivier arrive. Le bouton de
           lancement n'est plus dupliqué ici — `ModeSeance` le porte. */
        <p className="text-sm" style={{ color: "var(--bc-encre2)" }}>
          {`Préparation de l’examen — ${total} questions en cours de tirage…`}
        </p>
      )}
    </ModeSeance>
  );
}

// ---------------------------------------------------------------------------
// Séance en cours
// ---------------------------------------------------------------------------

function ExamRunning({
  questions,
  index,
  answers,
  marked,
  remaining,
  shortagesCount,
  matiereNames,
  zoneQuestion,
  noterDeclencheur,
  onIndex,
  onAnswers,
  onMarked,
  onFinish,
}: {
  questions: BiaExamQuestion<BiaPlayerQuestion>[];
  index: number;
  answers: Record<string, number[]>;
  marked: Set<string>;
  remaining: number;
  shortagesCount: number;
  matiereNames: Record<string, string>;
  zoneQuestion: React.RefObject<HTMLDivElement | null>;
  noterDeclencheur: (evenement: { currentTarget: Element }) => void;
  onIndex: React.Dispatch<React.SetStateAction<number>>;
  onAnswers: React.Dispatch<React.SetStateAction<Record<string, number[]>>>;
  onMarked: React.Dispatch<React.SetStateAction<Set<string>>>;
  onFinish: () => void;
}) {
  const current = questions[index];
  if (!current) {
    return null;
  }
  const answered = Object.keys(answers).filter((id) => answers[id].length > 0).length;
  const isMultiple = current.question.correctChoices.length > 1;
  const selected = answers[current.question.id] ?? [];
  const estMarquee = marked.has(current.question.id);

  const toggle = (choiceIndex: number) => {
    onAnswers((previous) => {
      const before = previous[current.question.id] ?? [];
      const next = isMultiple
        ? before.includes(choiceIndex)
          ? before.filter((v) => v !== choiceIndex)
          : [...before, choiceIndex]
        : [choiceIndex];
      return { ...previous, [current.question.id]: next };
    });
  };

  const toggleMark = () => {
    onMarked((previous) => {
      const next = new Set(previous);
      if (next.has(current.question.id)) {
        next.delete(current.question.id);
      } else {
        next.add(current.question.id);
      }
      return next;
    });
  };

  return (
    <section aria-label="Examen blanc en cours" className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <span style={{ color: "var(--bc-encre2)" }}>
            Question {index + 1} / {questions.length} ·{" "}
            {matiereNames[current.matiere] ?? current.matiere}
          </span>
          <span className="flex items-center gap-3">
            <span style={{ color: "var(--bc-encre2)" }}>{answered} répondues</span>
            {/*
              Le temps est la contrainte principale de l'épreuve, pas une
              métadonnée : le cadre lui donne le poids relevé manquant à
              l'audit F0b, où il était gris et de la taille du compteur.
            */}
            <Chronometre
              secondes={remaining}
              etat={etatChrono(remaining)}
              label="Temps restant à l’examen"
              className="banc-chrono-cadre"
            />
          </span>
        </div>
        {/*
          À l'examen, la navigation est libre : `answered` compte les questions
          RÉPONDUES, sans lien avec la position. Le libellé le dit tel quel.
        */}
        <Progress
          aria-label="Progression de l’examen"
          aria-valuetext={`${answered} réponse${answered > 1 ? "s" : ""} complétée${
            answered > 1 ? "s" : ""
          } sur ${questions.length}`}
          value={(answered / questions.length) * 100}
        />
      </div>

      {shortagesCount > 0 && index === 0 ? (
        <Alert>
          <AlertTitle>Examen légèrement réduit</AlertTitle>
          <AlertDescription>
            La banque ne permet pas encore de servir {shortagesCount} question
            {shortagesCount > 1 ? "s" : ""} sur ce tirage — l’examen reste noté sur les questions
            présentes.
          </AlertDescription>
        </Alert>
      ) : null}

      {/*
        Cible de focus à chaque changement de question. Son nom accessible
        porte la POSITION, que la barre n'exprime pas : elle compte les
        réponses données, indépendantes de l'ordre de parcours.
      */}
      <div
        ref={zoneQuestion}
        tabIndex={-1}
        role="group"
        aria-label={`Question ${index + 1} sur ${questions.length}`}
        className="banc-stimulus space-y-5 outline-none"
      >
        <h2 className="banc-enonce text-xl font-semibold">{current.question.statement}</h2>
        {isMultiple ? (
          <p className="banc-consigne text-sm" style={{ color: "var(--bc-encre2)" }}>
            Plusieurs réponses possibles.
          </p>
        ) : null}

        <ul className="flex flex-col" style={{ gap: "var(--bc-espace-reponse)" }} role="list">
          {current.question.choices.map((choice, choiceIndex) => (
            <li key={choiceIndex}>
              <ReponseBanc
                selectionnee={selected.includes(choiceIndex)}
                onClick={() => toggle(choiceIndex)}
              >
                {choice.label}
              </ReponseBanc>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          onClick={(evenement) => {
            noterDeclencheur(evenement);
            onIndex((i) => Math.max(0, i - 1));
          }}
        >
          Précédente
        </Button>
        <Button
          variant="outline"
          onClick={(evenement) => {
            noterDeclencheur(evenement);
            onIndex((i) => Math.min(questions.length - 1, i + 1));
          }}
        >
          Suivante
        </Button>
        <Button
          variant={estMarquee ? "secondary" : "ghost"}
          onClick={toggleMark}
          aria-pressed={estMarquee}
        >
          <BookmarkIcon aria-hidden className="size-4" />
          {estMarquee ? "Marquée" : "Marquer"}
        </Button>
        <span className="flex-1" />
        {/*
          Rendre sa copie n'est pas une erreur, c'est la conclusion normale de
          l'épreuve — et le code couleur du projet réserve le rouge à l'erreur.
          La commande porte donc la teinte du Banc, celle de l'action
          principale, et non la variante destructive.

          La mesure a confirmé le raisonnement : sur la surface du Banc, cette
          variante tombait à **4,38:1** (#d50000 sur #f7e1df), sous le seuil
          AA de 4,5. Le défaut n'existait pas avant la migration, le fond de
          page étant différent ; il est corrigé ici, pas contourné.
        */}
        <Button onClick={onFinish}>
          <FlagIcon aria-hidden className="size-4" />
          Terminer l’examen
        </Button>
      </div>

      <nav
        aria-label="Navigation entre les questions"
        className="banc-stimulus"
        style={{ padding: "1rem" }}
      >
        <ol className="flex flex-wrap gap-1.5">
          {questions.map(({ question }, i) => {
            const hasAnswer = (answers[question.id] ?? []).length > 0;
            const isMarked = marked.has(question.id);
            return (
              <li key={question.id}>
                <button
                  type="button"
                  onClick={(evenement) => {
                    noterDeclencheur(evenement);
                    onIndex(i);
                  }}
                  aria-label={`Question ${i + 1}${hasAnswer ? ", répondue" : ""}${isMarked ? ", marquée" : ""}`}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    "focus-visible:ring-ring size-8 rounded-md border text-xs tabular-nums transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  )}
                  style={{
                    borderColor: isMarked
                      ? "var(--bc-attention)"
                      : hasAnswer
                        ? "var(--bc-banc)"
                        : "var(--bc-filet)",
                    backgroundColor: hasAnswer ? "var(--bc-fond)" : "transparent",
                    color: "var(--bc-encre)",
                    // La position courante ne se signale pas par la seule
                    // teinte : `aria-current` la porte, l'anneau la montre.
                    boxShadow: i === index ? "0 0 0 2px var(--bc-banc)" : undefined,
                  }}
                >
                  {i + 1}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Écran d'introduction
// ---------------------------------------------------------------------------

/**
 * Ce que le candidat lit AVANT de lancer.
 *
 * Le bouton de lancement n'est plus rendu ici : c'est `ModeSeance` qui le
 * porte, dans l'introduction qu'il replie. L'alerte de chargement non plus —
 * elle survient après le repli, et vit donc dans l'aire de séance.
 */
function ExamIntro({
  config,
  history,
  totalAvailable,
}: {
  config: BiaConfig;
  history: ExamHistoryEntry[];
  totalAvailable: number;
}) {
  const total = config.matieres.length * config.examen.questionsParMatiere;
  return (
    <section aria-label="Présentation de l'examen blanc" className="space-y-6">
      <div className="banc-stimulus space-y-4">
        <h2 className="text-lg font-semibold">Les conditions de l’épreuve</h2>
        <ul className="banc-consigne space-y-2 text-sm leading-6">
          <li>
            <strong>{total} questions</strong> — {config.examen.questionsParMatiere} par matière,
            dans l’ordre officiel des cinq matières.
          </li>
          <li>
            <strong>{formatDuree(config.examen.dureeSecondes)}</strong> de chronomètre global —
            comme à l’épreuve réelle. À zéro, la copie est relevée en l’état.
          </li>
          <li>
            Navigation <strong>libre</strong> entre les questions, marquage « à revoir », validation
            finale quand vous le décidez.
          </li>
          <li>
            Admission à <strong>{config.examen.seuilAdmission}/20</strong> de moyenne — mentions
            comme au vrai BIA. Chaque tirage privilégie les questions que vous n’avez pas encore
            rencontrées ({totalAvailable} questions au total dans les viviers).
          </li>
        </ul>
      </div>

      {history.length > 0 ? (
        <div className="banc-stimulus space-y-3">
          <h2 className="text-lg font-semibold">Vos examens précédents</h2>
          <ul className="space-y-1 text-sm">
            {history.slice(0, 5).map((entry) => (
              <li key={entry.finishedAt} className="flex items-center justify-between gap-3">
                <span style={{ color: "var(--bc-encre2)" }}>
                  {new Date(entry.finishedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="flex items-center gap-2 tabular-nums">
                  {entry.noteGlobale20}/20
                  <Badge variant={entry.admis ? "default" : "outline"} className="font-normal">
                    {entry.admis ? "Admis" : "Non admis"}
                  </Badge>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-xs" style={{ color: "var(--bc-encre2)" }}>
            Historique conservé sur cet appareil uniquement.
          </p>
        </div>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Correction et synthèse
// ---------------------------------------------------------------------------

function ExamReview({
  questions,
  answers,
  report,
  matiereNames,
  elapsedSeconds,
  onRestart,
}: {
  questions: BiaExamQuestion<BiaPlayerQuestion>[];
  answers: Record<string, number[]>;
  report: BiaExamReport;
  matiereNames: Record<string, string>;
  elapsedSeconds: number;
  onRestart: () => void;
}) {
  const [filter, setFilter] = React.useState<"erreurs" | "toutes">("erreurs");
  const erreurs = new Set(report.erreurs);
  const shown =
    filter === "erreurs" ? questions.filter((q) => erreurs.has(q.question.id)) : questions;

  const forces = report.parMatiere.filter((m) => m.note20 >= 14);
  const faiblesses = report.parMatiere.filter((m) => m.note20 < 10);

  return (
    <section aria-label="Correction de l'examen blanc" className="space-y-8">
      <div className="banc-stimulus space-y-2 text-center">
        <p className="text-sm tracking-wide uppercase" style={{ color: "var(--bc-encre2)" }}>
          Résultat
        </p>
        <p className="text-4xl font-bold tracking-tight">{report.noteGlobale20}/20</p>
        <p className="text-lg font-medium">
          {report.admis
            ? `Admis${report.mention ? ` — mention ${report.mention}` : ""}`
            : "Non admis"}
        </p>
        <p className="text-sm" style={{ color: "var(--bc-encre2)" }}>
          {formatDuree(elapsedSeconds)} passées · {report.sansReponse.length} question
          {report.sansReponse.length > 1 ? "s" : ""} sans réponse
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {report.parMatiere.map((score) => (
          <div key={score.matiere} className="banc-stimulus" style={{ padding: "1rem" }}>
            <p className="text-xs" style={{ color: "var(--bc-encre2)" }}>
              {matiereNames[score.matiere]}
            </p>
            <p className="text-2xl font-semibold tabular-nums">{score.note20}/20</p>
            <p className="text-xs" style={{ color: "var(--bc-encre2)" }}>
              {score.correct}/{score.total} bonnes réponses
            </p>
          </div>
        ))}
      </div>

      {(forces.length > 0 || faiblesses.length > 0) && (
        <div className="banc-stimulus space-y-2 text-sm leading-6">
          <h2 className="font-semibold">Synthèse</h2>
          {forces.length > 0 ? (
            <p className="banc-consigne">
              <strong>Points forts</strong> —{" "}
              {forces.map((m) => matiereNames[m.matiere]).join(", ")}.
            </p>
          ) : null}
          {faiblesses.length > 0 ? (
            <p className="banc-consigne">
              <strong>À travailler en priorité</strong> —{" "}
              {faiblesses.map((m) => matiereNames[m.matiere]).join(", ")} : reprenez les fiches
              liées aux questions ratées ci-dessous.
            </p>
          ) : (
            <p className="banc-consigne">
              Aucune matière sous la moyenne — continuez à creuser vos erreurs restantes.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={filter === "erreurs" ? "default" : "outline"}
          onClick={() => setFilter("erreurs")}
        >
          Mes erreurs ({report.erreurs.length})
        </Button>
        <Button
          variant={filter === "toutes" ? "default" : "outline"}
          onClick={() => setFilter("toutes")}
        >
          Toutes les questions
        </Button>
        <span className="flex-1" />
        <Button variant="outline" onClick={onRestart}>
          Nouvel examen
        </Button>
      </div>

      <ol className="space-y-4">
        {shown.map(({ question, matiere }) => {
          const given = answers[question.id] ?? [];
          const expected = new Set(question.correctChoices);
          const wasCorrect = given.length === expected.size && given.every((c) => expected.has(c));
          return (
            <li key={question.id} className="banc-stimulus space-y-3">
              <div className="flex items-start justify-between gap-3">
                <p className="banc-enonce font-medium">{question.statement}</p>
                {/* Le verdict est ÉCRIT, pas seulement icôné : l'icône seule
                    ne dit rien à l'oreille (DT-002, même famille de défaut). */}
                <span
                  className="shrink-0 text-sm font-medium"
                  style={{ color: wasCorrect ? "var(--bc-juste)" : "var(--bc-erreur)" }}
                >
                  {wasCorrect ? "Juste" : "Ratée"}
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--bc-encre2)" }}>
                {matiereNames[matiere]}
              </p>
              <ul className="flex flex-col text-sm" style={{ gap: "var(--bc-espace-reponse)" }}>
                {question.choices.map((choice, i) => (
                  <li key={i}>
                    <ReponseBanc
                      desactive
                      etat={expected.has(i) ? "juste" : given.includes(i) ? "erreur" : "neutre"}
                    >
                      {choice.label}
                      {given.includes(i) && !expected.has(i) ? " — votre réponse" : ""}
                    </ReponseBanc>
                  </li>
                ))}
              </ul>
              <p className="banc-consigne text-sm leading-6">{question.explanation}</p>
              {question.furtherReading.length > 0 ? (
                <p className="banc-consigne text-sm" style={{ color: "var(--bc-encre2)" }}>
                  À réviser :{" "}
                  {question.furtherReading.map((fiche, i) => (
                    <React.Fragment key={fiche.href}>
                      {i > 0 ? ", " : ""}
                      <LienApprofondir href={fiche.href}>{fiche.label}</LienApprofondir>
                    </React.Fragment>
                  ))}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/**
 * Durée en toutes lettres abrégées — pour les PHRASES (« 2 h 30 min de
 * chronomètre »), là où `formatChrono` sert le compteur qui défile.
 */
function formatDuree(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours} h ${String(minutes).padStart(2, "0")} min`;
  }
  if (minutes > 0) {
    return `${minutes} min ${String(seconds).padStart(2, "0")} s`;
  }
  return `${seconds} s`;
}

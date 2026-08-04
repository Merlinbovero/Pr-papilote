import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { QuizPlayer, type PlayerQuestion } from "@/features/quiz/quiz-player";

export const metadata: Metadata = {
  title: "Lecteur de quiz — démonstration",
  robots: { index: false, follow: false },
};

/**
 * Prévisualisation du lecteur de quiz avec des questions EXPLICITEMENT
 * FICTIVES (aucune connaissance réelle affirmée), pour valider le
 * gabarit avant la production de la banque.
 */
const demoQuestions: PlayerQuestion[] = [
  {
    id: "q.demo.0001",
    theme: "demonstration",
    difficulty: 2,
    statement: "Question de démonstration à choix unique — quelle réponse est correcte ?",
    choices: [
      { label: "Réponse fictive A", note: "Pourquoi A est incorrect (démonstration)." },
      { label: "Réponse fictive B (correcte)" },
      { label: "Réponse fictive C", note: "Pourquoi C est incorrect (démonstration)." },
    ],
    correctChoices: [1],
    explanation:
      "Explication pédagogique de démonstration : pourquoi la bonne réponse est correcte, en une à trois phrases. C'est ce bloc qui fait du quiz une occasion d'apprendre.",
    furtherReading: [{ label: "Fiche de démonstration", href: "#" }],
  },
  {
    id: "q.demo.0002",
    theme: "demonstration",
    difficulty: 4,
    statement:
      "Question de démonstration à choix multiple — sélectionnez toutes les bonnes réponses.",
    choices: [
      { label: "Proposition fictive 1 (correcte)" },
      { label: "Proposition fictive 2", note: "Pourquoi 2 est incorrect (démonstration)." },
      { label: "Proposition fictive 3 (correcte)" },
    ],
    correctChoices: [0, 2],
    explanation: "Explication de démonstration pour une question à choix multiple.",
  },
];

export default function QuizPreviewPage() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SHOW_DESIGN_SYSTEM !== "1") {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6">
      <Alert className="mb-6">
        <AlertTitle>Lecteur de quiz — démonstration</AlertTitle>
        <AlertDescription>
          Questions fictives. Cette page valide le lecteur (question, réponses, correction
          pédagogique, chronomètre, progression, restitution) avant la production de la banque.
        </AlertDescription>
      </Alert>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Quiz de démonstration</h1>
      {/*
        Registre arbitré au lot F12 : **documentaire**. Cette vitrine était la
        dernière surface à ne rien passer du tout, retombant donc sur le défaut
        `legacy` — et c'est précisément ce qu'une vitrine ne doit pas faire :
        montrer un rendu qu'aucune page réelle n'emploie. Le lecteur est ici
        déposé dans une page de documentation, sous un chapeau qui reste
        visible ; c'est la définition de `documentaire`. L'étalon du registre
        Banc a sa propre vitrine, `/design-lab/banc/seance`.
      */}
      <QuizPlayer
        title="Quiz de démonstration"
        questions={demoQuestions}
        variant="documentaire"
        timePerQuestionSeconds={45}
      />
    </main>
  );
}

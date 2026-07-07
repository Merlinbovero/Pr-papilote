import { TargetIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TrainingBlockProps {
  questionCount: number;
  /** Absent tant que le moteur de quiz n'est pas en service. */
  quizHref?: string;
}

/**
 * Pont volontaire vers le mode préparation, en fin de lecture — le
 * moment où l'on souhaite se tester. La fiche elle-même n'affiche
 * jamais de progression.
 */
export function TrainingBlock({ questionCount, quizHref }: TrainingBlockProps) {
  if (questionCount === 0) {
    return null;
  }

  return (
    <section
      id="s-entrainer"
      aria-labelledby="s-entrainer-titre"
      className="bg-card scroll-mt-20 rounded-xl border p-6 print:hidden"
    >
      <h2
        id="s-entrainer-titre"
        className="mb-1 flex items-center gap-2 text-2xl font-semibold tracking-tight"
      >
        <TargetIcon aria-hidden className="text-primary size-5" />
        S&apos;entraîner
      </h2>
      <p className="text-muted-foreground mb-4 text-sm">
        {questionCount} question{questionCount > 1 ? "s" : ""} porte
        {questionCount > 1 ? "nt" : ""} sur cette fiche.
      </p>
      {quizHref ? (
        <Button asChild>
          <Link href={quizHref}>S&apos;entraîner sur cette fiche</Link>
        </Button>
      ) : (
        <Button disabled>Quiz bientôt disponible</Button>
      )}
    </section>
  );
}

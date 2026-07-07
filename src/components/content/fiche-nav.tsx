import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FicheNavProps {
  previous?: { label: string; href: string };
  next?: { label: string; href: string };
  back: { label: string; href: string };
  /** Traçabilité d'audit : créée, mise à jour, vérifiée, auteur, ID. */
  auditLine: string;
}

/** Pied de fiche : feuilletage dans la catégorie + traçabilité complète. */
export function FicheNav({ previous, next, back, auditLine }: FicheNavProps) {
  return (
    <footer className="space-y-4 border-t pt-6 print:hidden">
      <nav aria-label="Navigation entre fiches" className="flex flex-wrap items-center gap-3">
        {previous ? (
          <Button asChild variant="outline" size="sm">
            <Link href={previous.href}>
              <ArrowLeftIcon aria-hidden className="size-4" />
              {previous.label}
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="ghost" size="sm" className="mx-auto">
          <Link href={back.href}>{back.label}</Link>
        </Button>
        {next ? (
          <Button asChild variant="outline" size="sm" className="ml-auto">
            <Link href={next.href}>
              {next.label}
              <ArrowRightIcon aria-hidden className="size-4" />
            </Link>
          </Button>
        ) : null}
      </nav>
      <p className="text-muted-foreground text-xs">
        {auditLine} ·{" "}
        <a href="mailto:contact@prepapilote.fr" className="underline-offset-4 hover:underline">
          Signaler une erreur
        </a>
      </p>
    </footer>
  );
}

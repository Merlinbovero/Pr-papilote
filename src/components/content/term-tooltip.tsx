"use client";

import Link from "next/link";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TermTooltipProps {
  /** Terme tel qu'il apparaît dans la phrase. */
  children: React.ReactNode;
  /** Définition courte du dictionnaire (vocabulaire canonique). */
  definition: string;
  /** Entrée complète du dictionnaire, si elle existe. */
  href?: string;
}

/**
 * Terme du dictionnaire dans une fiche : souligné pointillé, définition
 * en infobulle (survol ou tap), lien vers l'entrée complète.
 */
export function TermTooltip({ children, definition, href }: TermTooltipProps) {
  const trigger = (
    <span className="decoration-muted-foreground cursor-help underline decoration-dotted underline-offset-4">
      {children}
    </span>
  );

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          {href ? (
            <Link href={href}>{trigger}</Link>
          ) : (
            <button type="button" className="text-left">
              {trigger}
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-left">
          <p>{definition}</p>
          {href ? (
            <p className="mt-1 text-xs opacity-80">Voir l&apos;entrée du dictionnaire →</p>
          ) : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

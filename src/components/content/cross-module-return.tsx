import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

interface CrossModuleReturnProps {
  label: string;
  href: string;
}

/**
 * Pastille contextuelle « Retour : X » (arbitrage 10) : affichée
 * uniquement en arrivée par passerelle inter-modules, éphémère,
 * jamais dans l'URL canonique indexée.
 */
export function CrossModuleReturn({ label, href }: CrossModuleReturnProps) {
  return (
    <Link
      href={href}
      className="bg-muted text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm transition-colors print:hidden"
    >
      <ArrowLeftIcon aria-hidden className="size-3.5" />
      Retour : {label}
    </Link>
  );
}

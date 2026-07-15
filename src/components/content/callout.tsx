import {
  BookMarkedIcon,
  GaugeIcon,
  HistoryIcon,
  type LucideIcon,
  QuoteIcon,
  RadarIcon,
  SearchCheckIcon,
  TargetIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Blocs éditoriaux « par nature d'information » (docs/design-system.md).
 *
 * Objectif : l'œil identifie la *nature* d'un bloc avant de l'avoir lu.
 * Chaque variante porte une couleur porteuse de sens (bleu = navigation /
 * définition, vert = validation / opérationnel, orange = attention / piège,
 * gris = secondaire / technique / historique), une icône et un intitulé par
 * défaut. Aucune couleur brute : uniquement des tokens du design system.
 */
export type CalloutVariant =
  | "definition"
  | "a-retenir"
  | "technique"
  | "citation"
  | "source"
  | "piege"
  | "a-verifier"
  | "actuel"
  | "historique";

interface VariantConfig {
  icon: LucideIcon;
  label: string;
  /** Filet gauche + couleur d'icône. */
  accent: string;
  /** Fond teinté discret. */
  tint: string;
  /** Bordure en pointillés pour signaler l'incertitude. */
  dashed?: boolean;
}

const VARIANTS: Record<CalloutVariant, VariantConfig> = {
  definition: {
    icon: BookMarkedIcon,
    label: "Définition",
    accent: "border-l-info text-info",
    tint: "bg-info/5",
  },
  "a-retenir": {
    icon: TargetIcon,
    label: "À retenir",
    accent: "border-l-primary text-primary",
    tint: "bg-primary/5",
  },
  technique: {
    icon: GaugeIcon,
    label: "Donnée technique",
    accent: "border-l-muted-foreground text-muted-foreground",
    tint: "bg-muted/40",
  },
  citation: {
    icon: QuoteIcon,
    label: "Citation",
    accent: "border-l-muted-foreground text-muted-foreground",
    tint: "bg-muted/30",
  },
  source: {
    icon: SearchCheckIcon,
    label: "Source",
    accent: "border-l-info text-info",
    tint: "bg-info/5",
  },
  piege: {
    icon: TriangleAlertIcon,
    label: "Piège",
    accent: "border-l-warning text-warning",
    tint: "bg-warning/5",
  },
  "a-verifier": {
    icon: SearchCheckIcon,
    label: "À vérifier",
    accent: "border-l-warning text-warning",
    tint: "bg-warning/5",
    dashed: true,
  },
  actuel: {
    icon: RadarIcon,
    label: "Opérationnel aujourd'hui",
    accent: "border-l-success text-success",
    tint: "bg-success/5",
  },
  historique: {
    icon: HistoryIcon,
    label: "Repère historique",
    accent: "border-l-muted-foreground text-muted-foreground",
    tint: "bg-muted/40",
  },
};

interface CalloutProps {
  variant: CalloutVariant;
  /** Remplace l'intitulé par défaut de la variante. */
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Encart de contenu à nature identifiable. Rendu en `<aside>` étiqueté pour
 * que la nature du bloc soit annoncée aux lecteurs d'écran.
 */
export function Callout({ variant, title, children, className }: CalloutProps) {
  const config = VARIANTS[variant];
  const Icon = config.icon;
  const label = title ?? config.label;
  return (
    <aside
      aria-label={label}
      className={cn(
        "rounded-xl border border-l-4 p-4 sm:p-5",
        config.accent,
        config.tint,
        config.dashed && "border-dashed",
        className
      )}
    >
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase">
        <Icon aria-hidden className="size-4 shrink-0" />
        <span className="text-foreground/80">{label}</span>
      </p>
      <div className="text-foreground space-y-2 text-sm leading-6 sm:text-[0.95rem]">
        {children}
      </div>
    </aside>
  );
}

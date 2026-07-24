import { createElement } from "react";
import {
  AnchorIcon,
  BookOpenIcon,
  ClipboardCheckIcon,
  CompassIcon,
  CrosshairIcon,
  FileTextIcon,
  FolderOpenIcon,
  LandmarkIcon,
  LanguagesIcon,
  LightbulbIcon,
  ListChecksIcon,
  MapIcon,
  PlaneIcon,
  RepeatIcon,
  ShieldIcon,
  ShipIcon,
  TargetIcon,
  TimerIcon,
  UsersIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SEARCH_TYPE_LABEL_SINGULAR, type SearchEntry } from "./types";

/** Icône par famille d'objet ; repli sur le type d'entrée. */
const FAMILY_ICONS: Record<string, LucideIcon> = {
  appareil: PlaneIcon,
  helicoptere: PlaneIcon,
  navire: ShipIcon,
  "base-aerienne": AnchorIcon,
  ban: AnchorIcon,
  regiment: ShieldIcon,
  escadron: ShieldIcon,
  flottille: ShieldIcon,
  unite: UsersIcon,
  organisation: LandmarkIcon,
  armement: CrosshairIcon,
  procedure: ListChecksIcon,
  concept: LightbulbIcon,
  terme: BookOpenIcon,
  // Familles d'outils interactifs (type « outil »)
  simulateur: CrosshairIcon,
  chrono: TimerIcon,
  revision: RepeatIcon,
  examen: ClipboardCheckIcon,
  anglais: LanguagesIcon,
  carte: MapIcon,
  lexique: BookOpenIcon,
};

const TYPE_ICONS: Record<SearchEntry["type"], LucideIcon> = {
  fiche: FileTextIcon,
  terme: BookOpenIcon,
  document: FileTextIcon,
  quiz: TargetIcon,
  categorie: FolderOpenIcon,
  module: CompassIcon,
  outil: WrenchIcon,
};

export function searchEntryIcon(entry: SearchEntry): LucideIcon {
  return (entry.family && FAMILY_ICONS[entry.family]) || TYPE_ICONS[entry.type];
}

/**
 * Résultat de recherche riche (Design System) : icône de famille,
 * type, titre, résumé d'une ligne, catégorie. Même rendu dans la
 * palette et sur /recherche.
 */
export function SearchResultItem({ entry }: { entry: SearchEntry }) {
  return (
    <span className="flex min-w-0 items-start gap-3">
      {/* Référence statique issue du mapping famille→icône (pas une création de composant) */}
      {createElement(searchEntryIcon(entry), {
        "aria-hidden": true,
        className: "text-muted-foreground mt-0.5 size-4 shrink-0",
      })}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate font-medium">{entry.title}</span>
          <Badge variant="outline" className="shrink-0 font-normal">
            {SEARCH_TYPE_LABEL_SINGULAR[entry.type]}
          </Badge>
        </span>
        {entry.summary ? (
          <span className="text-muted-foreground line-clamp-1 block text-sm">{entry.summary}</span>
        ) : null}
        <span className="text-muted-foreground block text-xs">
          {entry.moduleName}
          {entry.categoryName ? ` · ${entry.categoryName}` : ""}
        </span>
      </span>
    </span>
  );
}

import {
  AnchorIcon,
  AtomIcon,
  AwardIcon,
  BookOpenIcon,
  BookAIcon,
  BrainIcon,
  Building2Icon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  CloudSunIcon,
  CompassIcon,
  DumbbellIcon,
  FileTextIcon,
  GaugeIcon,
  GlobeIcon,
  HeartPulseIcon,
  InfoIcon,
  LandmarkIcon,
  LayersIcon,
  ListChecksIcon,
  MapIcon,
  MapPinIcon,
  PlaneIcon,
  RadioIcon,
  ScaleIcon,
  ShipIcon,
  SigmaIcon,
  TargetIcon,
  UserRoundIcon,
  UsersIcon,
  WindIcon,
  type LucideIcon,
} from "lucide-react";

/**
 * Icône par famille de catégorie (design pass D2). Donne une identité visuelle
 * aux cartes de catégories sans dépendre d'une photo par catégorie. Les clés
 * sont des slugs de catégorie (content/_referentiels/categories.json).
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Concours
  presentation: InfoIcon,
  conditions: ClipboardCheckIcon,
  selection: ClipboardListIcon,
  organisation: Building2Icon,
  "culture-militaire": AwardIcon,
  appareils: PlaneIcon,
  navires: ShipIcon,
  bases: MapPinIcon,
  ban: AnchorIcon,
  unites: UsersIcon,
  procedures: ListChecksIcon,
  concepts: BookOpenIcon,
  grades: AwardIcon,
  missions: TargetIcon,
  histoire: LandmarkIcon,
  personnalites: UserRoundIcon,
  geopolitique: GlobeIcon,
  retex: FileTextIcon,
  documents: FileTextIcon,
  quiz: ListChecksIcon,
  // Fondamentaux
  physique: AtomIcon,
  mathematiques: SigmaIcon,
  aerodynamique: WindIcon,
  "mecanique-du-vol": PlaneIcon,
  meteorologie: CloudSunIcon,
  navigation: CompassIcon,
  instruments: GaugeIcon,
  cartographie: MapIcon,
  reglementation: ScaleIcon,
  "facteurs-humains": HeartPulseIcon,
  "radio-communications": RadioIcon,
  "anglais-aeronautique": GlobeIcon,
  performances: GaugeIcon,
  "culture-aeronautique": BookOpenIcon,
  dictionnaire: BookAIcon,
  // Psychotechnique
  methodologie: ListChecksIcon,
  epreuves: ClipboardListIcon,
  exercices: DumbbellIcon,
  // Divers
  aerostatique: WindIcon,
  "facteurs-humains-navigant": BrainIcon,
};

/** Icône d'une catégorie (repli neutre si non répertoriée). */
export function getCategoryIcon(categorySlug: string): LucideIcon {
  return CATEGORY_ICONS[categorySlug] ?? LayersIcon;
}

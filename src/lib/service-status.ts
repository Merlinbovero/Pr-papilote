import type { ServiceStatus } from "@/lib/content/content-schemas";

/**
 * Présentation du statut de service d'un aéronef (gabarit Appareils).
 * `group` sert au regroupement de la catégorie ; `tone` mappe un token
 * porteur de sens (vert = en service, bleu = à venir, gris = passé).
 */
export type ServiceGroup = "en-service" | "en-cours" | "retire";

interface ServiceStatusMeta {
  label: string;
  group: ServiceGroup;
  tone: "success" | "info" | "muted";
}

export const SERVICE_STATUS: Record<ServiceStatus, ServiceStatusMeta> = {
  actif: { label: "En service", group: "en-service", tone: "success" },
  "en-retrait": { label: "En cours de retrait", group: "en-service", tone: "success" },
  commande: { label: "Commandé", group: "en-cours", tone: "info" },
  essais: { label: "En essais", group: "en-cours", tone: "info" },
  annonce: { label: "Annoncé", group: "en-cours", tone: "info" },
  retire: { label: "Retiré du service", group: "retire", tone: "muted" },
  historique: { label: "Historique", group: "retire", tone: "muted" },
};

/** Libellé et ordre d'affichage des groupes de la catégorie « Appareils ». */
export const SERVICE_GROUPS: { group: ServiceGroup; label: string }[] = [
  { group: "en-service", label: "En service" },
  { group: "en-cours", label: "En développement ou à venir" },
  { group: "retire", label: "Retirés du service" },
];

export function getServiceGroup(status: ServiceStatus): ServiceGroup {
  return SERVICE_STATUS[status].group;
}

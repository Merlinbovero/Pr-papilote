import {
  type FactualEdge,
  type FicheType,
  type Predicate,
  type RelationWeight,
} from "./content-schemas";

/**
 * Résolveur du registre factuel du graphe documentaire
 * (docs/editorial/graphe-documentaire.md).
 *
 * Fonctions pures : les arêtes déclarées d'un seul côté produisent les
 * liens des deux côtés (libellé inverse), chaque arête est validée
 * contre le référentiel des prédicats et les familles autorisées.
 * Les erreurs sont retournées (jamais avalées) : la CI les transforme
 * en échec de build.
 */

export interface GraphNode {
  id: string;
  family: FicheType;
  title: string;
  edges: FactualEdge[];
}

export interface ResolvedLink {
  /** Objet à afficher (l'autre extrémité de l'arête). */
  targetId: string;
  targetTitle: string;
  /** Libellé de la relation vue depuis l'objet courant. */
  label: string;
  predicateId: string;
  weight: RelationWeight;
  direction: "sortante" | "entrante";
}

export interface GraphResolution {
  /** Liens par objet, triés forte → moyenne → complémentaire. */
  linksByObject: Map<string, ResolvedLink[]>;
  /** Violations du contrat (arête invalide = build rouge en CI). */
  errors: string[];
}

const WEIGHT_ORDER: Record<RelationWeight, number> = {
  forte: 0,
  moyenne: 1,
  complementaire: 2,
};

export function resolveFactualGraph(nodes: GraphNode[], predicates: Predicate[]): GraphResolution {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const predicatesById = new Map(predicates.map((predicate) => [predicate.id, predicate]));
  const linksByObject = new Map<string, ResolvedLink[]>();
  const errors: string[] = [];

  const push = (objectId: string, link: ResolvedLink) => {
    const list = linksByObject.get(objectId) ?? [];
    list.push(link);
    linksByObject.set(objectId, list);
  };

  for (const node of nodes) {
    for (const edge of node.edges) {
      const predicate = predicatesById.get(edge.predicate);
      if (!predicate) {
        errors.push(`${node.id} : prédicat inconnu « ${edge.predicate} »`);
        continue;
      }
      const target = nodesById.get(edge.target);
      if (!target) {
        errors.push(`${node.id} : cible inexistante « ${edge.target} » (${edge.predicate})`);
        continue;
      }
      if (!predicate.sourceFamilies.includes(node.family)) {
        errors.push(
          `${node.id} : la famille « ${node.family} » n'est pas admise en source de « ${predicate.id} »`
        );
        continue;
      }
      if (!predicate.targetFamilies.includes(target.family)) {
        errors.push(
          `${node.id} : la famille « ${target.family} » n'est pas admise en cible de « ${predicate.id} »`
        );
        continue;
      }

      const weight = edge.weight ?? predicate.weight;
      push(node.id, {
        targetId: target.id,
        targetTitle: target.title,
        label: predicate.label,
        predicateId: predicate.id,
        weight,
        direction: "sortante",
      });
      push(target.id, {
        targetId: node.id,
        targetTitle: node.title,
        label: predicate.inverseLabel,
        predicateId: predicate.id,
        weight,
        direction: "entrante",
      });
    }
  }

  for (const links of linksByObject.values()) {
    links.sort(
      (a, b) =>
        WEIGHT_ORDER[a.weight] - WEIGHT_ORDER[b.weight] ||
        a.targetTitle.localeCompare(b.targetTitle, "fr")
    );
  }

  return { linksByObject, errors };
}

import { artefactRechercheSchema, CHEMIN_INDEX_RECHERCHE } from "./artefact";
import type { SearchEntry } from "./types";

/**
 * Le chargement à la demande de la recherche — lot M10.
 *
 * **UNE SEULE PROMESSE POUR TOUTE LA PREMIÈRE OUVERTURE.** Elle réunit l'import
 * dynamique du module de palette ET le chargement, l'analyse et la validation
 * de l'index. Des ouvertures simultanées — double clic, `Ctrl K` martelé —
 * partagent donc explicitement une séquence complète, et non deux moitiés.
 *
 * **C'est la promesse qui est mémorisée, pas son résultat.** La distinction est
 * la raison d'être de ce module : mémoriser le résultat ne déduplique rien tant
 * qu'il n'existe pas, et deux ouvertures rapprochées lanceraient deux requêtes.
 * Ici la promesse est affectée AVANT tout `await`, donc dès le premier appel.
 *
 * **Les deux ressources partent en parallèle.** Le coût de la première
 * ouverture est celui de la plus lente, pas la somme des deux.
 *
 * **Un échec libère la promesse.** Import, réseau, JSON illisible ou schéma
 * invalide : la mémoire est remise à zéro pour qu'une seconde tentative soit
 * possible. Sans cela, une coupure passagère condamnerait la palette pour toute
 * la session — et l'utilisateur n'aurait plus que le repli `/recherche`.
 */

/** Ce que la palette a besoin de recevoir, une fois tout prêt. */
export interface RessourcesRecherche {
  entries: SearchEntry[];
}

let combinee: Promise<RessourcesRecherche> | undefined;

/** Compteurs d'instrumentation — lus par les tests, jamais par l'interface. */
export const compteurs = { imports: 0, requetes: 0 };

/**
 * Charge tout ce qu'il faut à la palette. Appels concurrents : même promesse,
 * un seul import, une seule requête.
 */
export function chargerRecherche(): Promise<RessourcesRecherche> {
  if (combinee) return combinee;

  combinee = (async () => {
    // Les deux départs ont lieu avant le premier `await` : ils sont réellement
    // simultanés, et non enchaînés.
    compteurs.imports += 1;
    const moduleP = import("./search");

    compteurs.requetes += 1;
    const indexP = fetch(CHEMIN_INDEX_RECHERCHE, { headers: { accept: "application/json" } });

    const [, reponse] = await Promise.all([moduleP, indexP]);
    if (!reponse.ok) {
      throw new Error(`Index de recherche indisponible (HTTP ${reponse.status})`);
    }

    const artefact = artefactRechercheSchema.parse(await reponse.json());
    return { entries: artefact.entries as unknown as SearchEntry[] };
  })();

  // Un échec ne doit pas être mémorisé : on libère pour permettre un nouvel
  // essai. Le `catch` ne consomme pas le rejet — l'appelant le reçoit toujours.
  combinee.catch(() => {
    combinee = undefined;
  });

  return combinee;
}

/** Remet le module à zéro — réservé aux tests. */
export function reinitialiserRecherche(): void {
  combinee = undefined;
  compteurs.imports = 0;
  compteurs.requetes = 0;
}

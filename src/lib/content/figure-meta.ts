import { z } from "zod";

/**
 * Métadonnées scientifiques d'un croquis — lot C1.
 *
 * ── Pourquoi ce fichier existe ──────────────────────────────────────────
 * L'audit C0 a lu le contenu de dix-huit croquis du produit. Aucun ne
 * déclare ses hypothèses, aucun ne porte de source, aucun ne dit son domaine
 * de validité. Trois énoncent comme général ce qui n'est vrai qu'en vol
 * stabilisé, et un porte des valeurs numériques sans origine.
 *
 * Ce ne sont pas des fautes de dessin : ce sont des informations qui n'ont
 * nulle part où être écrites. Le contrat `ficheFigureSchema` ne prévoyait que
 * `schemaId`, `alt`, `caption`, `width`, `height` — un croquis pouvait donc
 * être juste ou faux sans que le contenu en garde trace.
 *
 * ── La règle que ce module applique ─────────────────────────────────────
 *
 * > Un croquis qui affirme un fait doit pouvoir dire d'où il le tient, sous
 * > quelles hypothèses, et dans quel domaine cela reste vrai.
 *
 * ── Ce qu'il ne fait pas, délibérément ──────────────────────────────────
 * Il ne rend rien obligatoire globalement. Exiger un repère d'une frise, une
 * portée aérodynamique d'un organigramme ou un domaine de validité d'une
 * carte de base aéronavale n'aurait aucun sens — et c'est exactement le
 * défaut symétrique de celui qu'on corrige. Les obligations sont
 * **conditionnées par la fonction**, jamais posées en bloc.
 *
 * ── Rétrocompatibilité : la décision structurante ───────────────────────
 * Les croquis existants n'ont aucune de ces métadonnées. Les rendre
 * obligatoires casserait le produit et forcerait à remplir cent fois des
 * champs non vérifiés — c'est-à-dire à inventer, précisément ce que ce
 * contrat existe pour empêcher. Le champ `meta` est donc **facultatif** :
 *
 *   - absent  → croquis historique, accepté tel quel, non compté dans la
 *               couverture scientifique ;
 *   - présent → le contrat complet s'applique, sans indulgence.
 *
 * Il n'y a pas de demi-mesure : on ne peut pas déclarer une source et omettre
 * la date de vérification. C'est ce qui empêche la métadonnée de devenir
 * décorative à son tour — le sort qu'avait connu le `.v1` des clés de
 * stockage, marqueur de version que personne ne lisait.
 */

// ---------------------------------------------------------------------------
// Vocabulaires fermés
// ---------------------------------------------------------------------------

/**
 * Les treize familles de croquis (doctrine §4).
 *
 * F13 a été ajoutée en C0-bis : plusieurs croquis existants relèvent de
 * l'affichage cockpit, et cette famille porte des conventions que les douze
 * autres n'ont pas — marquages normalisés, sens de rotation, plage de lecture,
 * mode de défaillance. Elle a surtout une clause d'accessibilité inversée :
 * sur un badin, la couleur EST l'information, parce qu'elle est normalisée sur
 * l'instrument réel.
 */
export const diagramFamilySchema = z.enum([
  "F1", // Géométrie et définition
  "F2", // Diagramme de corps libre
  "F3", // Décomposition vectorielle
  "F4", // Écoulement
  "F5", // Distribution de pression
  "F6", // Coupe fonctionnelle
  "F7", // Chaîne fonctionnelle
  "F8", // Séquence temporelle
  "F9", // Comparaison de configurations
  "F10", // Graphique scientifique
  "F11", // Carte ou implantation
  "F12", // Organigramme ou frise
  "F13", // Instrument ou affichage cockpit
]);

/**
 * Fonction éditoriale — le champ PIVOT du contrat.
 *
 * C'est lui qui décide quelles autres obligations s'appliquent. Un
 * `scientific_diagram` doit une source et une nature ; une `map` ne doit ni
 * repère aérodynamique ni hypothèse physique.
 *
 * Six valeurs, et six seulement. `photo_preferred` et
 * `reject_no_pedagogical_function` N'EN FONT PAS PARTIE : ce sont des
 * décisions éditoriales sur le sort d'un visuel, pas des familles de croquis.
 * Les confondre reviendrait à dire qu'« à supprimer » est un genre de dessin.
 */
export const diagramFunctionSchema = z.enum([
  "scientific_diagram",
  "identification",
  "orientation",
  "map",
  "organization_chart",
  "timeline",
]);

/** Décision éditoriale sur le sort du visuel — distincte de sa fonction. */
export const editorialDecisionSchema = z.enum([
  "keep",
  "photo_preferred",
  "reject_no_pedagogical_function",
]);

/**
 * Niveau de lecture (doctrine §3, révisée en C0-bis).
 *
 * Le critère initial — « une question d'examen peut porter sur une valeur
 * lisible » — a été abandonné : il indexait la science sur un programme et
 * aurait vieilli à chaque réforme de concours. Le critère est désormais
 * l'exploitation d'un modèle quantitatif.
 */
export const diagramLevelSchema = z.enum(["P1", "P2", "P3"]);

/** Axe A — modalité de rendu. Singulier : un croquis a une modalité. */
export const diagramModalitySchema = z.enum([
  "static",
  "animated",
  "interactive_2d",
  "interactive_3d",
  "simulation",
]);

/**
 * Axe B — nature scientifique. **Plusieurs valeurs possibles** : un croquis
 * peut poser un modèle analytique ET y placer des points mesurés.
 */
export const scientificNatureSchema = z.enum([
  "qualitative",
  "analytical",
  "measured",
  "simulated",
]);

/**
 * Axe C — portée physique.
 *
 * Facultative, et c'est délibéré : elle n'a de sens que là où la distinction
 * porte. Elle devient obligatoire pour un sujet aérodynamique — c'est le
 * défaut A-03 de l'audit, où `polaire-eiffel` et `decrochage-courbe-cz` ne
 * disent ni 2D ni aile finie alors que Cz max et l'angle critique dépendent
 * des deux.
 */
export const diagramScopeSchema = z.enum([
  "airfoil_2d",
  "finite_wing",
  "complete_aircraft",
  "system",
  "operational_environment",
]);

/**
 * Statut de vérification d'une source — trois états, jamais deux.
 *
 * La distinction vient d'une erreur du rapport C0 : j'y présentais des URL
 * répondant HTTP 200 comme des sources vérifiées. Une URL qui répond prouve
 * qu'un document existe, pas qu'on l'a lu, et encore moins qu'on a ouvert la
 * figure citée.
 */
export const sourceVerificationSchema = z.enum([
  "url_reachable", // l'adresse répond — rien de plus
  "document_consulted", // le document a été ouvert et lu
  "figure_verified", // la page ou la figure citée a été vue
]);

/**
 * Statut juridique — binaire et explicite.
 *
 * `public_domain` n'est pas une valeur : c'est une conclusion, et elle ne peut
 * être tirée qu'après vérification de l'auteur (agence ou contractant), des
 * mentions de copyright, des éléments de tiers et des marques. Tant que ce
 * contrôle n'est pas fait, le statut est `uncertain`.
 */
export const sourceLegalStatusSchema = z.enum(["verified", "uncertain"]);

/** Type de source (hiérarchie établie en C0). */
export const sourceKindSchema = z.enum([
  "primary_scientific",
  "regulatory",
  "industrial",
  "academic",
  "institutional",
]);

// ---------------------------------------------------------------------------
// Source d'un croquis
// ---------------------------------------------------------------------------

/**
 * Une source. **Pluriel dès l'origine** dans `sources[]` : un croquis
 * synthétise presque toujours plusieurs documents, et un champ unique aurait
 * forcé à en taire.
 */
export const diagramSourceSchema = z.object({
  /** Identifiant stable du registre `docs/editorial/references-schemas.md`. */
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.url().optional(),
  /** Page, chapitre ou figure. `à vérifier` tant que non ouvert. */
  location: z.string().min(1).optional(),
  kind: sourceKindSchema,
  verificationStatus: sourceVerificationSchema,
  legalStatus: sourceLegalStatusSchema,
});
export type DiagramSource = z.infer<typeof diagramSourceSchema>;

// ---------------------------------------------------------------------------
// Dérogation aux contraintes conditionnelles
// ---------------------------------------------------------------------------

const isoDate = z.iso.date();

/**
 * Contraintes qu'une dérogation peut lever — et elle ne peut lever qu'elles.
 *
 * `sources` en est **volontairement absent**. Ce n'est pas une interdiction
 * écrite quelque part, c'est une impossibilité de structure : aucune
 * dérogation ne peut porter cette valeur, donc aucune ne peut affranchir un
 * croquis scientifique de son obligation de source.
 */
export const contrainteDerogeableSchema = z.enum(["assumptions", "validityDomain"]);

/**
 * Dérogation structurée et traçable.
 *
 * ── Pourquoi la première forme ne tenait pas ────────────────────────────
 * Le premier C1 admettait un simple texte de vingt caractères. C'était
 * insuffisant : « pas applicable ici » satisfaisait la règle sans rien
 * prouver, et surtout **rien ne disait à QUOI on dérogeait**, ni si quelqu'un
 * l'avait relu.
 *
 * ── Ce que cette forme garantit ─────────────────────────────────────────
 * 1. La dérogation **nomme** les contraintes qu'elle lève : on ne déroge pas
 *    « en général », on déroge à quelque chose de précis.
 * 2. Elle porte un **état de relecture**. `pending` est un brouillon
 *    recevable ; il n'autorise pas à considérer le croquis comme
 *    scientifiquement validé.
 * 3. `approved` **exige une date** — une approbation sans date n'est pas
 *    vérifiable.
 *
 * ── Ce qu'une dérogation ne peut JAMAIS faire ───────────────────────────
 * - supprimer l'obligation de source d'un croquis scientifique (impossible
 *   par construction, voir `contrainteDerogeableSchema`) ;
 * - transformer une donnée non vérifiée en donnée vérifiée : elle ne touche
 *   ni `verificationStatus`, ni `legalStatus`, ni `scientificallyVerifiedAt`.
 */
export const derogationSchema = z.object({
  /** Le motif. Assez long pour être argumenté, pas seulement affirmé. */
  reason: z.string().min(30),
  /** Au moins une contrainte nommée : on ne déroge jamais « en général ». */
  waivedConstraints: z.array(contrainteDerogeableSchema).min(1),
  reviewStatus: z.enum(["pending", "approved"]),
  reviewedAt: isoDate.optional(),
});
export type Derogation = z.infer<typeof derogationSchema>;

// ---------------------------------------------------------------------------
// Le contrat
// ---------------------------------------------------------------------------

const baseFigureMetaSchema = z.object({
  family: diagramFamilySchema,
  function: diagramFunctionSchema,
  editorialDecision: editorialDecisionSchema.default("keep"),
  level: diagramLevelSchema,
  modality: diagramModalitySchema.default("static"),
  /** Plusieurs natures possibles — voir `scientificNatureSchema`. */
  scientificNatures: z.array(scientificNatureSchema).default([]),
  scope: diagramScopeSchema.optional(),
  sources: z.array(diagramSourceSchema).default([]),
  assumptions: z.array(z.string().min(1)).default([]),
  validityDomain: z.string().min(1).optional(),
  scientificallyVerifiedAt: isoDate.optional(),
  /** Version du croquis, indépendante de la version de la fiche. */
  diagramVersion: z.int().min(1),
  /** Pour les croquis trop complexes pour un `alt` concis. */
  longDescription: z.string().min(1).optional(),
  /** Dérogation structurée — voir `derogationSchema`. */
  constraintWaiver: derogationSchema.optional(),
});

/**
 * Les familles où la distinction 2D / aile finie / aéronef change le résultat,
 * et où `scope` devient donc obligatoire.
 *
 * Restreint aux cas où la confusion a un effet mesurable : un écoulement, une
 * distribution de pression et une polaire ne se lisent pas de la même façon en
 * 2D et sur une aile finie. Une chaîne fonctionnelle ou une séquence n'ont pas
 * ce problème.
 */
const FAMILLES_A_PORTEE_OBLIGATOIRE = new Set(["F4", "F5", "F10"]);

/** Natures qui engagent un modèle, et doivent donc dire sous quelles réserves. */
const NATURES_ENGAGEANTES = new Set(["analytical", "measured", "simulated"]);

/** Fonctions documentaires : elles transmettent des faits, pas de la physique. */
const FONCTIONS_DOCUMENTAIRES = new Set(["map", "organization_chart", "timeline"]);

/**
 * Métadonnées d'un croquis, avec leurs contraintes conditionnelles.
 *
 * Chaque règle ci-dessous correspond à un défaut réel relevé dans l'audit C0.
 * Aucune n'est préventive.
 */
export const figureMetaSchema = baseFigureMetaSchema.superRefine((meta, ctx) => {
  const refuser = (path: (string | number)[], message: string) =>
    ctx.addIssue({ code: "custom", path, message });

  // ── Cohérence interne de la dérogation ──────────────────────────────────
  const derogation = meta.constraintWaiver;
  if (derogation) {
    if (derogation.reviewStatus === "approved" && !derogation.reviewedAt) {
      refuser(
        ["constraintWaiver", "reviewedAt"],
        "Une dérogation approuvée doit porter sa date de relecture. " +
          "Une approbation sans date n'est pas vérifiable."
      );
    }
    // Une dérogation en attente NE PEUT PAS accompagner un croquis présenté
    // comme scientifiquement validé : ce serait faire passer un brouillon pour
    // une pièce relue.
    if (derogation.reviewStatus === "pending" && meta.scientificallyVerifiedAt) {
      refuser(
        ["constraintWaiver", "reviewStatus"],
        "Une dérogation « pending » interdit de déclarer le croquis scientifiquement " +
          "vérifié : retirer `scientificallyVerifiedAt`, ou faire relire la dérogation."
      );
    }
  }

  // ── Croquis scientifique ────────────────────────────────────────────────
  if (meta.function === "scientific_diagram") {
    if (meta.sources.length === 0) {
      refuser(
        ["sources"],
        "Un croquis scientifique doit citer au moins une source. " +
          "C'est la règle qui empêche une belle illustration non traçable de passer."
      );
    }
    if (meta.scientificNatures.length === 0) {
      refuser(
        ["scientificNatures"],
        "Un croquis scientifique doit déclarer sa nature : qualitatif, analytique, mesuré ou simulé. " +
          "Ne pas la dire laisse croire qu'une visualisation vaut une mesure."
      );
    }
    if (meta.editorialDecision === "keep" && !meta.scientificallyVerifiedAt) {
      refuser(
        ["scientificallyVerifiedAt"],
        "Un croquis scientifique retenu doit porter la date de sa vérification scientifique."
      );
    }
    if (FAMILLES_A_PORTEE_OBLIGATOIRE.has(meta.family) && !meta.scope) {
      refuser(
        ["scope"],
        `La famille ${meta.family} exige une portée : profil 2D, aile finie ou aéronef complet. ` +
          "Cz max et l'angle critique dépendent de cette distinction (défaut A-03 de l'audit C0)."
      );
    }

    /*
      La dérogation ne lève QUE les contraintes qu'elle nomme.

      C'est la différence avec la première forme, où un texte libre levait tout
      d'un coup. Ici, déroger aux hypothèses n'affranchit pas du domaine de
      validité : chacun se nomme, ou reste dû.
    */
    const leve = new Set(derogation?.waivedConstraints ?? []);
    const engageUnModele = meta.scientificNatures.some((n) => NATURES_ENGAGEANTES.has(n));
    if (engageUnModele) {
      if (meta.assumptions.length === 0 && !leve.has("assumptions")) {
        refuser(
          ["assumptions"],
          "Un croquis analytique, mesuré ou simulé doit déclarer ses hypothèses, " +
            "ou les nommer dans `constraintWaiver.waivedConstraints`."
        );
      }
      if (!meta.validityDomain && !leve.has("validityDomain")) {
        refuser(
          ["validityDomain"],
          "Un croquis analytique, mesuré ou simulé doit déclarer son domaine de validité, " +
            "ou le nommer dans `constraintWaiver.waivedConstraints`. " +
            "C'est le défaut A-01 : « deux forces verticales, deux forces horizontales » " +
            "n'est vrai qu'en palier stabilisé."
        );
      }
    }
  }

  // ── Identification et orientation ───────────────────────────────────────
  // Une source n'est due que si le dessin transporte une donnée externe. Un
  // pictogramme entièrement original n'en doit aucune ; une silhouette dérivée
  // d'un document tiers en doit une, et c'est là que se joue le risque
  // juridique majeur du chantier.
  if (meta.function === "identification" || meta.function === "orientation") {
    const deriveDUnTiers = meta.scope !== undefined || meta.scientificNatures.length > 0;
    if (deriveDUnTiers && meta.sources.length === 0) {
      refuser(
        ["sources"],
        "Une illustration qui reprend une forme, une donnée ou une organisation issue " +
          "d'un document tiers doit citer sa source."
      );
    }
  }

  // ── Carte, organigramme, frise ──────────────────────────────────────────
  // Aucune obligation de repère aérodynamique ni d'hypothèse physique : ces
  // familles n'en ont pas l'usage. En revanche, ce qu'elles affirment est
  // factuel — une date, une subordination, une implantation — et doit être
  // traçable dès qu'elles transmettent un fait.
  if (FONCTIONS_DOCUMENTAIRES.has(meta.function)) {
    const transmetUnFait = meta.scientificNatures.length > 0 || meta.level !== "P1";
    if (transmetUnFait && meta.sources.length === 0) {
      refuser(
        ["sources"],
        "Une carte, un organigramme ou une frise qui transmet des faits doit citer sa source."
      );
    }
  }

  // ── Cohérence transverse ────────────────────────────────────────────────
  if (meta.scientificNatures.includes("qualitative") && meta.scientificNatures.length > 1) {
    refuser(
      ["scientificNatures"],
      "« qualitative » combiné à une nature engageante est contradictoire : " +
        "un croquis qui pose un modèle n'est plus purement qualitatif."
    );
  }
});

export type FigureMeta = z.infer<typeof figureMetaSchema>;

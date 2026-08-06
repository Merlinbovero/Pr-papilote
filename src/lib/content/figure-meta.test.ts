import { describe, expect, it } from "vitest";
import { derogationSchema, figureMetaSchema } from "./figure-meta";

/*
  Ce que ces tests vérifient — et ce qu'ils ne vérifient pas.

  Ils vérifient que le contrat REFUSE ce qu'il doit refuser. Ils ne vérifient
  aucune vérité scientifique : aucun schéma Zod ne peut dire si `n = 1/cos φ`
  est correctement appliqué. Le contrat garantit qu'une affirmation est
  traçable, pas qu'elle est vraie ; la vérité reste le travail de la relecture
  humaine (C2).

  Chaque cas de refus correspond à un défaut réel de l'audit C0. Aucun n'est
  préventif.
*/

/** Croquis scientifique complet — le point de départ de tous les cas de refus. */
const croquisScientifique = {
  family: "F2",
  function: "scientific_diagram",
  level: "P2",
  scientificNatures: ["analytical"],
  scope: "complete_aircraft",
  sources: [
    {
      id: "N-01",
      title: "NASA Glenn — Beginner's Guide to Aeronautics",
      url: "https://www.grc.nasa.gov/www/k-12/airplane/",
      location: "Four Forces on an Airplane",
      kind: "institutional",
      verificationStatus: "figure_verified",
      legalStatus: "verified",
    },
  ],
  assumptions: ["Vol rectiligne uniforme", "Atmosphère au repos"],
  validityDomain: "Palier stabilisé, régime subsonique incompressible",
  scientificallyVerifiedAt: "2026-08-04",
  diagramVersion: 1,
};

/** Frise documentaire — l'autre bout du contrat : aucune obligation physique. */
const friseDocumentaire = {
  family: "F12",
  function: "timeline",
  level: "P1",
  diagramVersion: 1,
};

describe("figureMetaSchema — valeurs par défaut", () => {
  it("accepte un croquis scientifique complet", () => {
    const result = figureMetaSchema.safeParse(croquisScientifique);
    expect(result.success).toBe(true);
  });

  it("applique les valeurs par défaut (keep, static, listes vides)", () => {
    const result = figureMetaSchema.parse(friseDocumentaire);
    expect(result.editorialDecision).toBe("keep");
    expect(result.modality).toBe("static");
    expect(result.scientificNatures).toEqual([]);
    expect(result.sources).toEqual([]);
    expect(result.assumptions).toEqual([]);
  });

  it("refuse une famille hors des treize", () => {
    expect(figureMetaSchema.safeParse({ ...friseDocumentaire, family: "F14" }).success).toBe(false);
  });

  it("refuse une décision éditoriale posée comme fonction", () => {
    // `photo_preferred` est une décision sur le sort du visuel, pas un genre de
    // dessin. Les confondre reviendrait à dire qu'« à supprimer » est une
    // famille de croquis.
    expect(
      figureMetaSchema.safeParse({ ...friseDocumentaire, function: "photo_preferred" }).success
    ).toBe(false);
  });

  it("refuse une version de croquis absente ou nulle", () => {
    const { diagramVersion: _v, ...sansVersion } = friseDocumentaire;
    expect(figureMetaSchema.safeParse(sansVersion).success).toBe(false);
    expect(figureMetaSchema.safeParse({ ...friseDocumentaire, diagramVersion: 0 }).success).toBe(
      false
    );
  });
});

describe("figureMetaSchema — obligations d'un croquis scientifique", () => {
  it("refuse un croquis scientifique sans source", () => {
    const result = figureMetaSchema.safeParse({ ...croquisScientifique, sources: [] });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path[0] === "sources")).toBe(true);
  });

  it("refuse un croquis scientifique sans nature déclarée", () => {
    const result = figureMetaSchema.safeParse({
      ...croquisScientifique,
      scientificNatures: [],
      // Sans nature engageante, hypothèses et domaine ne sont plus dus : le
      // seul défaut attendu porte sur `scientificNatures`.
      assumptions: [],
      validityDomain: undefined,
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path[0] === "scientificNatures")).toBe(true);
  });

  it("refuse un croquis scientifique retenu sans date de vérification", () => {
    const { scientificallyVerifiedAt: _d, ...sansDate } = croquisScientifique;
    const result = figureMetaSchema.safeParse(sansDate);
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path[0] === "scientificallyVerifiedAt")).toBe(true);
  });

  it("n'exige pas de date de vérification pour un croquis rejeté", () => {
    const { scientificallyVerifiedAt: _d, ...sansDate } = croquisScientifique;
    const result = figureMetaSchema.safeParse({
      ...sansDate,
      editorialDecision: "reject_no_pedagogical_function",
    });
    expect(result.success).toBe(true);
  });

  it("refuse une date de vérification qui n'est pas une date ISO", () => {
    expect(
      figureMetaSchema.safeParse({ ...croquisScientifique, scientificallyVerifiedAt: "04/08/2026" })
        .success
    ).toBe(false);
  });
});

describe("figureMetaSchema — portée physique (défaut A-03)", () => {
  const polaire = {
    ...croquisScientifique,
    family: "F10",
    scientificNatures: ["measured"],
    assumptions: ["Nombre de Reynolds constant"],
    validityDomain: "Re = 3 × 10⁶, incidences hors décrochage profond",
  };

  it("exige une portée pour F4, F5 et F10", () => {
    for (const family of ["F4", "F5", "F10"]) {
      const { scope: _s, ...sansPortee } = polaire;
      const result = figureMetaSchema.safeParse({ ...sansPortee, family });
      expect(result.success).toBe(false);
      expect(result.error?.issues.some((i) => i.path[0] === "scope")).toBe(true);
    }
  });

  it("n'exige pas de portée pour une chaîne fonctionnelle", () => {
    const { scope: _s, ...sansPortee } = polaire;
    expect(figureMetaSchema.safeParse({ ...sansPortee, family: "F7" }).success).toBe(true);
  });
});

describe("figureMetaSchema — hypothèses et domaine de validité (défaut A-01)", () => {
  it("exige les hypothèses d'un croquis analytique, mesuré ou simulé", () => {
    for (const nature of ["analytical", "measured", "simulated"]) {
      const result = figureMetaSchema.safeParse({
        ...croquisScientifique,
        scientificNatures: [nature],
        assumptions: [],
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues.some((i) => i.path[0] === "assumptions")).toBe(true);
    }
  });

  it("exige le domaine de validité d'un croquis analytique", () => {
    const { validityDomain: _v, ...sansDomaine } = croquisScientifique;
    const result = figureMetaSchema.safeParse(sansDomaine);
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path[0] === "validityDomain")).toBe(true);
  });

  it("n'exige ni hypothèses ni domaine d'un croquis purement qualitatif", () => {
    const { validityDomain: _v, ...sansDomaine } = croquisScientifique;
    const result = figureMetaSchema.safeParse({
      ...sansDomaine,
      scientificNatures: ["qualitative"],
      assumptions: [],
    });
    expect(result.success).toBe(true);
  });

  it("refuse « qualitative » combiné à une nature engageante", () => {
    const result = figureMetaSchema.safeParse({
      ...croquisScientifique,
      scientificNatures: ["qualitative", "analytical"],
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path[0] === "scientificNatures")).toBe(true);
  });
});

describe("figureMetaSchema — illustrations non scientifiques", () => {
  const pictogramme = {
    family: "F1",
    function: "identification",
    level: "P1",
    diagramVersion: 1,
  };

  it("accepte un pictogramme original sans source", () => {
    expect(figureMetaSchema.safeParse(pictogramme).success).toBe(true);
  });

  it("exige une source dès qu'une silhouette porte une portée ou une nature", () => {
    // Une silhouette d'aéronef dérivée d'un document tiers est le risque
    // juridique majeur du chantier : elle doit dire d'où elle vient.
    const result = figureMetaSchema.safeParse({ ...pictogramme, scope: "complete_aircraft" });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path[0] === "sources")).toBe(true);
  });

  it("accepte une frise P1 sans source ni hypothèse", () => {
    expect(figureMetaSchema.safeParse(friseDocumentaire).success).toBe(true);
  });

  it("exige une source d'une carte ou d'un organigramme qui transmet un fait", () => {
    for (const fonction of ["map", "organization_chart", "timeline"]) {
      const result = figureMetaSchema.safeParse({
        ...friseDocumentaire,
        function: fonction,
        level: "P2",
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues.some((i) => i.path[0] === "sources")).toBe(true);
    }
  });

  it("n'exige d'une carte ni portée aérodynamique ni domaine de validité", () => {
    const result = figureMetaSchema.safeParse({
      ...friseDocumentaire,
      family: "F11",
      function: "map",
      level: "P2",
      sources: [
        {
          id: "O-01",
          title: "Ministère des Armées — implantations",
          kind: "institutional",
          verificationStatus: "document_consulted",
          legalStatus: "uncertain",
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("figureMetaSchema — statut des sources", () => {
  it("refuse un statut de vérification hors des trois états", () => {
    const result = figureMetaSchema.safeParse({
      ...croquisScientifique,
      sources: [{ ...croquisScientifique.sources[0], verificationStatus: "verified" }],
    });
    expect(result.success).toBe(false);
  });

  it("refuse « public_domain » comme statut juridique", () => {
    // Le domaine public est une conclusion, pas une déclaration : il se prouve
    // après contrôle de l'auteur, du copyright, des tiers et des marques.
    const result = figureMetaSchema.safeParse({
      ...croquisScientifique,
      sources: [{ ...croquisScientifique.sources[0], legalStatus: "public_domain" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepte une source sans URL mais avec une localisation", () => {
    const result = figureMetaSchema.safeParse({
      ...croquisScientifique,
      sources: [
        {
          id: "O-02",
          title: "Manuel du pilote d'avion",
          location: "chapitre 4",
          kind: "academic",
          verificationStatus: "document_consulted",
          legalStatus: "uncertain",
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("derogationSchema — forme de la dérogation", () => {
  const derogationValide = {
    reason:
      "Croquis de principe destiné à la seule lecture des sens de rotation : aucun modèle quantitatif n'y est exploité.",
    waivedConstraints: ["validityDomain"],
    reviewStatus: "approved",
    reviewedAt: "2026-08-04",
  };

  it("accepte une dérogation motivée, nommée et relue", () => {
    expect(derogationSchema.safeParse(derogationValide).success).toBe(true);
  });

  it("refuse une dérogation vide", () => {
    // Cas 1 de la clôture C1 : un motif vide ne motive rien.
    expect(derogationSchema.safeParse({ ...derogationValide, reason: "" }).success).toBe(false);
    expect(
      derogationSchema.safeParse({ ...derogationValide, reason: "pas applicable" }).success
    ).toBe(false);
  });

  it("refuse une dérogation qui ne nomme aucune contrainte", () => {
    // Cas 2 : on ne déroge pas « en général ».
    expect(derogationSchema.safeParse({ ...derogationValide, waivedConstraints: [] }).success).toBe(
      false
    );
  });
});

describe("figureMetaSchema — ce qu'une dérogation peut et ne peut pas", () => {
  const croquisEngageant = {
    ...croquisScientifique,
    assumptions: [],
    validityDomain: undefined,
  };

  const motif =
    "Croquis de principe : les vecteurs sont indicatifs et aucune valeur n'y est lisible.";

  it("lève exactement les contraintes qu'elle nomme, et pas les autres", () => {
    const result = figureMetaSchema.safeParse({
      ...croquisEngageant,
      constraintWaiver: {
        reason: motif,
        waivedConstraints: ["validityDomain"],
        reviewStatus: "approved",
        reviewedAt: "2026-08-04",
      },
    });
    expect(result.success).toBe(false);
    // Le domaine est levé ; les hypothèses restent dues.
    expect(result.error?.issues.some((i) => i.path[0] === "validityDomain")).toBe(false);
    expect(result.error?.issues.some((i) => i.path[0] === "assumptions")).toBe(true);
  });

  it("accepte un croquis dont la dérogation nomme les deux contraintes", () => {
    const result = figureMetaSchema.safeParse({
      ...croquisEngageant,
      constraintWaiver: {
        reason: motif,
        waivedConstraints: ["assumptions", "validityDomain"],
        reviewStatus: "approved",
        reviewedAt: "2026-08-04",
      },
    });
    expect(result.success).toBe(true);
  });

  it("refuse une dérogation approuvée sans date de relecture", () => {
    // Cas 3 : une approbation sans date n'est pas vérifiable.
    const result = figureMetaSchema.safeParse({
      ...croquisEngageant,
      constraintWaiver: {
        reason: motif,
        waivedConstraints: ["assumptions", "validityDomain"],
        reviewStatus: "approved",
      },
    });
    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some(
        (i) => i.path[0] === "constraintWaiver" && i.path[1] === "reviewedAt"
      )
    ).toBe(true);
  });

  it("accepte une dérogation « pending » comme brouillon, jamais comme validation", () => {
    // Cas 4, dans ses deux moitiés.
    const { scientificallyVerifiedAt: _d, ...sansDate } = croquisEngageant;
    const brouillon = {
      reason: motif,
      waivedConstraints: ["assumptions", "validityDomain"],
      reviewStatus: "pending",
    };

    // Brouillon recevable : le croquis n'est pas présenté comme vérifié — il est
    // alors « non retenu » tant que la relecture n'a pas eu lieu.
    expect(
      figureMetaSchema.safeParse({
        ...sansDate,
        editorialDecision: "reject_no_pedagogical_function",
        constraintWaiver: brouillon,
      }).success
    ).toBe(true);

    // Mais un brouillon ne fait pas passer un croquis pour scientifiquement relu.
    const result = figureMetaSchema.safeParse({
      ...croquisEngageant,
      constraintWaiver: brouillon,
    });
    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some(
        (i) => i.path[0] === "constraintWaiver" && i.path[1] === "reviewStatus"
      )
    ).toBe(true);
  });

  it("refuse une dérogation qui tente de lever l'obligation de source", () => {
    /*
      Cas 5 — et la garantie est plus forte que ce que l'énoncé supposait.

      `sources` n'est pas une valeur de `contrainteDerogeableSchema` : Zod
      rejette donc l'énumération AVANT que `superRefine` ne s'exécute. Le
      message « au moins une source » n'apparaît jamais, parce qu'il n'a pas à
      apparaître : la dérogation elle-même est irrecevable. L'obligation de
      source n'est pas défendue par une règle, elle est hors d'atteinte.
    */
    const result = figureMetaSchema.safeParse({
      ...croquisScientifique,
      sources: [],
      constraintWaiver: {
        reason: motif,
        waivedConstraints: ["sources"],
        reviewStatus: "approved",
        reviewedAt: "2026-08-04",
      },
    });
    expect(result.success).toBe(false);
    expect(
      result.error?.issues.some(
        (i) => i.path[0] === "constraintWaiver" && i.path[1] === "waivedConstraints"
      )
    ).toBe(true);

    // Et sans la dérogation irrecevable, l'obligation de source s'applique bien.
    const sansDerogation = figureMetaSchema.safeParse({ ...croquisScientifique, sources: [] });
    expect(sansDerogation.success).toBe(false);
    expect(sansDerogation.error?.issues.some((i) => i.path[0] === "sources")).toBe(true);
  });

  it("n'autorise aucune dérogation pour une famille à portée obligatoire", () => {
    // `scope` n'est pas dérogeable non plus : la portée d'une polaire change le
    // résultat, elle ne se contourne pas par un motif.
    const { scope: _s, ...sansPortee } = croquisScientifique;
    const result = figureMetaSchema.safeParse({
      ...sansPortee,
      family: "F10",
      constraintWaiver: {
        reason: motif,
        waivedConstraints: ["assumptions", "validityDomain"],
        reviewStatus: "approved",
        reviewedAt: "2026-08-04",
      },
    });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path[0] === "scope")).toBe(true);
  });
});

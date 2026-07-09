import { describe, expect, it } from "vitest";
import {
  CONTENT_SCHEMA_VERSION,
  documentNoticeSchema,
  ficheMetadataSchema,
  FICHE_FAMILIES,
  ficheTypeSchema,
  imageSchema,
  questionSchema,
  quizSchema,
  termeSchema,
} from "./content-schemas";

const ficheAppareil = {
  schemaVersion: CONTENT_SCHEMA_VERSION,
  id: "eopn.appareils.exemple",
  type: "appareil",
  title: "Appareil d'exemple",
  slug: "appareil-exemple",
  summary: "Fixture de test du contrat éditorial pour une fiche-objet de type appareil.",
  module: "eopn",
  category: "appareils",
  subcategory: "avions-de-chasse",
  tags: ["exemple"],
  concours: ["eopn"],
  level: 2,
  createdAt: "2026-07-07",
  verifiedAt: "2026-07-07",
  author: "proprietaire",
  sources: [
    {
      title: "Source officielle d'exemple",
      kind: "officiel",
      consultedAt: "2026-07-07",
    },
  ],
  status: "brouillon",
  relations: { specializes: ["fondamentaux.aerodynamique.exemple"] },
  infobox: {
    constructeur: "Exemple",
    role: "Chasse",
    armees: ["Armée de l'Air et de l'Espace"],
    miseEnService: 2006,
    statut: "En service",
    equipage: "1 ou 2",
  },
} as const;

describe("ficheMetadataSchema", () => {
  it("accepte une fiche-objet complète", () => {
    expect(ficheMetadataSchema.parse(ficheAppareil).id).toBe("eopn.appareils.exemple");
  });

  it("refuse une fiche sans source", () => {
    expect(ficheMetadataSchema.safeParse({ ...ficheAppareil, sources: [] }).success).toBe(false);
  });

  it("refuse une fiche-objet sans infobox", () => {
    const { infobox: _infobox, ...sansInfobox } = ficheAppareil;
    expect(ficheMetadataSchema.safeParse(sansInfobox).success).toBe(false);
  });

  it("refuse une infobox incomplète pour son type", () => {
    const result = ficheMetadataSchema.safeParse({
      ...ficheAppareil,
      infobox: { constructeur: "Exemple" },
    });
    expect(result.success).toBe(false);
  });

  it("accepte une fiche-notion sans infobox", () => {
    const notion = {
      ...ficheAppareil,
      id: "fondamentaux.meteorologie.exemple",
      type: "notion-meteo",
      module: "fondamentaux",
      category: "meteorologie",
      subcategory: undefined,
      infobox: undefined,
    };
    expect(ficheMetadataSchema.safeParse(notion).success).toBe(true);
  });

  it("refuse un statut hors vocabulaire", () => {
    expect(ficheMetadataSchema.safeParse({ ...ficheAppareil, status: "valide" }).success).toBe(
      false
    );
  });

  it("couvre tous les types dans la carte des familles", () => {
    expect(Object.keys(FICHE_FAMILIES).sort()).toEqual([...ficheTypeSchema.options].sort());
  });

  it("refuse une valeur d'approximation dans une infobox (on n'invente jamais)", () => {
    const result = ficheMetadataSchema.safeParse({
      ...ficheAppareil,
      infobox: { ...ficheAppareil.infobox, vitesseMax: "inconnu" },
    });
    expect(result.success).toBe(false);
  });

  it("accepte une infobox sans les champs optionnels (omis plutôt qu'approximés)", () => {
    expect(ficheMetadataSchema.safeParse(ficheAppareil).success).toBe(true);
  });

  it("accepte un historique de révisions cohérent avec la version", () => {
    const result = ficheMetadataSchema.safeParse({
      ...ficheAppareil,
      version: 2,
      revisions: [
        { date: "2026-07-07", version: 1, motif: "Création.", author: "proprietaire" },
        {
          date: "2026-07-08",
          version: 2,
          motif: "Mise à jour des sources.",
          author: "proprietaire",
          reviewer: "relecteur",
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("refuse un historique dont la dernière version ne coïncide pas avec version", () => {
    const result = ficheMetadataSchema.safeParse({
      ...ficheAppareil,
      version: 1,
      revisions: [{ date: "2026-07-08", version: 2, motif: "Écart.", author: "proprietaire" }],
    });
    expect(result.success).toBe(false);
  });

  it("refuse un motif de révision vide", () => {
    const result = ficheMetadataSchema.safeParse({
      ...ficheAppareil,
      revisions: [{ date: "2026-07-07", version: 1, motif: "", author: "proprietaire" }],
    });
    expect(result.success).toBe(false);
  });
});

describe("questionSchema", () => {
  const qcm = {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    id: "q.meteo.0001",
    theme: "meteorologie",
    kind: "qcm",
    statement: "Quel nuage est associé aux orages ?",
    choices: ["Cirrus", "Cumulonimbus", "Stratus"],
    correctChoices: [1],
    explanation: "Le cumulonimbus est le nuage d'instabilité verticale associé aux orages.",
    evaluates: ["fondamentaux.meteorologie.exemple"],
    difficulty: 2,
    status: "brouillon",
  } as const;

  it("accepte un QCM valide", () => {
    expect(questionSchema.parse(qcm).id).toBe("q.meteo.0001");
  });

  it("refuse une question qui n'évalue aucune fiche", () => {
    expect(questionSchema.safeParse({ ...qcm, evaluates: [] }).success).toBe(false);
  });

  it("refuse un QCM à moins de trois choix", () => {
    expect(questionSchema.safeParse({ ...qcm, choices: ["A", "B"] }).success).toBe(false);
  });

  it("accepte un vrai-faux et un calcul", () => {
    expect(
      questionSchema.safeParse({
        ...qcm,
        id: "q.meteo.0002",
        kind: "vrai-faux",
        answer: false,
        choices: undefined,
        correctChoices: undefined,
      }).success
    ).toBe(true);
    expect(
      questionSchema.safeParse({
        ...qcm,
        id: "q.maths.0001",
        kind: "calcul",
        answerValue: 42,
        tolerance: 0.5,
        unit: "kt",
        choices: undefined,
        correctChoices: undefined,
      }).success
    ).toBe(true);
  });
});

describe("quizSchema", () => {
  const base = {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    id: "quiz.meteo-niveau-2",
    title: "Météo — niveau 2",
    module: "fondamentaux",
    status: "brouillon",
  } as const;

  it("accepte un quiz par sélecteur", () => {
    expect(
      quizSchema.safeParse({
        ...base,
        selector: { categories: ["meteorologie"], difficulty: [1, 3], count: 20 },
      }).success
    ).toBe(true);
  });

  it("refuse un quiz avec sélecteur ET liste explicite", () => {
    expect(
      quizSchema.safeParse({
        ...base,
        questions: ["q.meteo.0001"],
        selector: { count: 10 },
      }).success
    ).toBe(false);
  });

  it("refuse un quiz sans sélecteur ni liste", () => {
    expect(quizSchema.safeParse(base).success).toBe(false);
  });
});

describe("imageSchema", () => {
  const image = {
    schemaVersion: CONTENT_SCHEMA_VERSION,
    id: "image.exemple",
    title: "Image d'exemple",
    description: "Fixture de test de l'entité image indépendante.",
    alt: "Description alternative de l'image d'exemple.",
    author: "Auteur d'exemple",
    source: "https://exemple.fr/image",
    license: "CC BY-SA 4.0",
    date: "2026-01-01",
    status: "brouillon",
  } as const;

  it("accepte une image complète (auteur, source, licence, alt, date, description)", () => {
    expect(imageSchema.safeParse(image).success).toBe(true);
  });

  it("refuse une image sans licence vérifiée", () => {
    const { license: _license, ...sansLicence } = image;
    expect(imageSchema.safeParse(sansLicence).success).toBe(false);
  });

  it("refuse un texte alternatif vide ou dérisoire", () => {
    expect(imageSchema.safeParse({ ...image, alt: "img" }).success).toBe(false);
  });
});

describe("termeSchema et documentNoticeSchema", () => {
  it("accepte un terme canonique", () => {
    expect(
      termeSchema.safeParse({
        schemaVersion: CONTENT_SCHEMA_VERSION,
        id: "terme.finesse",
        title: "Finesse",
        definition:
          "Rapport entre la portance et la traînée d'un aéronef, égal au rapport entre distance parcourue et hauteur perdue en plané.",
        english: "Lift-to-drag ratio",
        status: "brouillon",
      }).success
    ).toBe(true);
  });

  it("refuse un binaire Storage sur un document « lien-seul »", () => {
    const notice = {
      schemaVersion: CONTENT_SCHEMA_VERSION,
      id: "doc.exemple",
      title: "Document d'exemple",
      issuer: "Ministère des Armées",
      publishedAt: "2026-01-01",
      kind: "brochure",
      summary: "Résumé de consultation du document d'exemple, suffisamment détaillé.",
      officialUrl: "https://www.defense.gouv.fr/exemple",
      rights: "lien-seul",
      storagePath: "documents/exemple.pdf",
      status: "brouillon",
    };
    expect(documentNoticeSchema.safeParse(notice).success).toBe(false);
    expect(documentNoticeSchema.safeParse({ ...notice, storagePath: undefined }).success).toBe(
      true
    );
  });

  it("exige un résumé de consultation (ch. 8 §3)", () => {
    const notice = {
      schemaVersion: CONTENT_SCHEMA_VERSION,
      id: "doc.exemple",
      title: "Document d'exemple",
      issuer: "Ministère des Armées",
      publishedAt: "2026-01-01",
      kind: "brochure",
      officialUrl: "https://www.defense.gouv.fr/exemple",
      rights: "lien-seul",
      status: "brouillon",
    };
    expect(documentNoticeSchema.safeParse(notice).success).toBe(false);
  });
});

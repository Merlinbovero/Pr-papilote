import { describe, expect, it } from "vitest";
import { PHONETIC_ALPHABET, PHONETIC_NUMBERS, spellWithAlphabet } from "./phonetic-alphabet";

describe("alphabet OACI", () => {
  it("couvre les 26 lettres, dans l'ordre, sans doublon", () => {
    expect(PHONETIC_ALPHABET).toHaveLength(26);
    const letters = PHONETIC_ALPHABET.map((e) => e.letter);
    expect(letters.join("")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    expect(new Set(PHONETIC_ALPHABET.map((e) => e.word)).size).toBe(26);
  });

  it("retient l'orthographe officielle OACI (Alfa, Juliett)", () => {
    expect(PHONETIC_ALPHABET.find((e) => e.letter === "A")?.word).toBe("Alfa");
    expect(PHONETIC_ALPHABET.find((e) => e.letter === "J")?.word).toBe("Juliett");
    expect(PHONETIC_ALPHABET.find((e) => e.letter === "N")?.word).toBe("November");
    expect(PHONETIC_ALPHABET.find((e) => e.letter === "Z")?.word).toBe("Zulu");
  });

  it("couvre les dix chiffres", () => {
    expect(PHONETIC_NUMBERS).toHaveLength(10);
    expect(PHONETIC_NUMBERS.find((e) => e.digit === "9")?.pronunciation).toBe("NIN-er");
  });
});

describe("spellWithAlphabet", () => {
  it("épelle lettres et chiffres, ignore le reste", () => {
    const spelled = spellWithAlphabet("A3-z");
    expect(spelled).toEqual([
      { char: "A", word: "Alfa" },
      { char: "3", word: "TREE" },
      { char: "Z", word: "Zulu" },
    ]);
  });

  it("renvoie une liste vide sans caractère épelable", () => {
    expect(spellWithAlphabet("!! ??")).toEqual([]);
  });
});

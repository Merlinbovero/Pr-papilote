import { describe, expect, it } from "vitest";
import { FAMILY_INFO, generateQuestion } from "./generators";
import { composeSession, scoreSession } from "./session";
import { PSY_FAMILIES, type PsyAnswerEvent, type PsyFamily } from "./types";

/**
 * Tests du moteur psychotechnique — invariants des générateurs
 * (déterminisme, 4 choix uniques, bonne réponse présente), composition de
 * session (répartition, progression de difficulté) et notation.
 */

describe("générateurs — invariants sur toutes les familles", () => {
  const difficulties = [1, 2, 3] as const;
  const seeds = [1, 42, 999, 123456];

  for (const family of PSY_FAMILIES) {
    it(`${family} : 4 choix uniques, bonne réponse présente, déterministe`, () => {
      for (const difficulty of difficulties) {
        for (const seed of seeds) {
          const q = generateQuestion(family, seed, difficulty);
          expect(q.family).toBe(family);
          expect(q.choices).toHaveLength(4);
          expect(new Set(q.choices).size).toBe(4);
          expect(q.correctIndex).toBeGreaterThanOrEqual(0);
          expect(q.correctIndex).toBeLessThan(4);
          expect(q.method.length).toBeGreaterThan(10);
          expect(q.timeLimitSeconds).toBe(FAMILY_INFO[family].timeLimits[difficulty - 1]);

          const again = generateQuestion(family, seed, difficulty);
          expect(again).toEqual(q);
        }
      }
    });
  }

  it("mémoire : la bonne réponse est bien l'élément à la position demandée", () => {
    for (const seed of [5, 77, 2024]) {
      const q = generateQuestion("memoire", seed, 2);
      const items = q.exposure!.lines[0].split(/\s+/);
      const position = Number(q.prompt.match(/(\d+)/)![1]);
      expect(q.choices[q.correctIndex]).toBe(items[position - 1]);
    }
  });

  it("empan de chiffres : la bonne réponse est bien la séquence inversée", () => {
    for (const seed of [4, 61, 2027]) {
      const q = generateQuestion("empan-chiffres", seed, 2);
      const shown = q.exposure!.lines[0].split(/\s+/);
      const reversed = [...shown].reverse().join(" ");
      expect(q.choices[q.correctIndex]).toBe(reversed);
    }
  });

  it("attention : le compte annoncé correspond à la grille", () => {
    for (const seed of [3, 88, 4321]) {
      const q = generateQuestion("attention", seed, 2);
      const target = q.prompt.match(/« (.) »/)![1];
      const count = q
        .gridLines!.join(" ")
        .split(/\s+/)
        .filter((c) => c === target).length;
      expect(q.choices[q.correctIndex]).toBe(String(count));
    }
  });

  it("dissociation d'attention : la réponse correspond aux cadrans hors limite affichés", () => {
    // Reconstitue l'état « hors limite » depuis le panneau (valeur vs règle affichée).
    const isOut = (line: string): boolean => {
      const ruleMatch = line.match(/\(([^)]+)\)\s*$/)!;
      const rule = ruleMatch[1];
      const value = Number(line.slice(0, ruleMatch.index).match(/(-?\d+)\s+\S+\s*$/)![1]);
      if (rule.startsWith("min ")) return value < Number(rule.slice(4));
      if (rule.startsWith("max ")) return value > Number(rule.slice(4));
      const [lo, hi] = rule.split("–").map(Number);
      return value < lo || value > hi;
    };

    for (const seed of [2, 50, 808, 91234]) {
      // Niveaux 1-2 : le compte annoncé = nombre de cadrans hors limite.
      for (const difficulty of [1, 2] as const) {
        const q = generateQuestion("dissociation-attention", seed, difficulty);
        const outCount = q.gridLines!.filter(isOut).length;
        expect(q.choices[q.correctIndex]).toBe(String(outCount));
      }
      // Niveau 3 : un seul cadran hors limite, et c'est celui désigné.
      const q3 = generateQuestion("dissociation-attention", seed, 3);
      const outLines = q3.gridLines!.filter(isOut);
      expect(outLines).toHaveLength(1);
      expect(outLines[0].startsWith(q3.choices[q3.correctIndex])).toBe(true);
    }
  });

  it("lecture d'instruments : la bonne réponse correspond à la valeur du cadran", () => {
    const fmtCap = (c: number) => String(((c % 360) + 360) % 360 || 360).padStart(3, "0");
    for (const seed of [6, 71, 909, 54321]) {
      const cap = generateQuestion("lecture-instruments", seed, 1);
      expect(cap.instrument!.kind).toBe("cap");
      expect(cap.choices[cap.correctIndex]).toBe(`${fmtCap(cap.instrument!.value)}°`);

      const speed = generateQuestion("lecture-instruments", seed, 2);
      expect(speed.instrument!.kind).toBe("anemometre");
      expect(speed.choices[speed.correctIndex]).toBe(`${speed.instrument!.value} kt`);

      const alt = generateQuestion("lecture-instruments", seed, 3);
      expect(alt.instrument!.kind).toBe("altimetre");
      expect(alt.choices[alt.correctIndex]).toBe(`${alt.instrument!.value} ft`);
    }
  });

  it("mémoire associative : la bonne réponse respecte les paires exposées", () => {
    for (const seed of [8, 64, 707, 90210]) {
      // Reconstitue les paires exposées « MOT   →   NN ».
      const parsePairs = (q: ReturnType<typeof generateQuestion>) => {
        const map = new Map<string, string>();
        for (const line of q.exposure!.lines) {
          const [word, num] = line.split("→").map((s) => s.trim());
          map.set(word, num);
        }
        return map;
      };

      // Sens direct (niveaux 1-2) : indicatif → nombre.
      for (const difficulty of [1, 2] as const) {
        const q = generateQuestion("memoire-associative", seed, difficulty);
        const map = parsePairs(q);
        const word = q.prompt.match(/« (.+?) »/)![1];
        expect(q.choices[q.correctIndex]).toBe(map.get(word));
      }

      // Sens inverse (niveau 3) : nombre → indicatif.
      const q3 = generateQuestion("memoire-associative", seed, 3);
      const map3 = parsePairs(q3);
      const num = q3.prompt.match(/nombre (\d+)/)![1];
      const expectedWord = [...map3.entries()].find(([, n]) => n === num)![0];
      expect(q3.choices[q3.correctIndex]).toBe(expectedWord);
    }
  });

  it("matrices : la bonne option complète la règle de la grille", () => {
    for (const seed of [9, 55, 606, 71717]) {
      for (const difficulty of [1, 2, 3] as const) {
        const q = generateQuestion("matrices", seed, difficulty);
        // Grille 3×3 avec une seule case manquante, la dernière.
        expect(q.matrix!.grid).toHaveLength(9);
        expect(q.matrix!.grid.filter((c) => c === null)).toHaveLength(1);
        expect(q.matrix!.grid[8]).toBeNull();
        expect(q.matrix!.options).toHaveLength(4);
        // Forme ← ligne (triangle en ligne 2), nombre ← colonne (3 en colonne 2),
        // remplissage selon la règle de difficulté.
        const expectedFilled = difficulty === 1 ? false : true;
        expect(q.matrix!.options[q.correctIndex]).toEqual({
          shape: "triangle",
          count: 3,
          filled: expectedFilled,
        });
      }
    }
  });

  it("rapidité : identiques ↔ chaînes réellement égales", () => {
    for (const seed of [11, 220, 3033, 40404]) {
      const q = generateQuestion("rapidite", seed, 3);
      const [, a, b] = q.prompt.split("\n");
      const verdict = q.choices[q.correctIndex];
      expect(verdict).toBe(a === b ? "Identiques" : "Différentes");
    }
  });

  it("horloges et durées : l'heure/durée annoncée est cohérente avec l'énoncé", () => {
    const toMin = (hhmm: string) => {
      const [, h, m] = hhmm.match(/(\d{2})h(\d{2})/)!;
      return Number(h) * 60 + Number(m);
    };
    const durToMin = (s: string) => {
      const [, h, m] = s.match(/(\d+)h(\d{2})/)!;
      return Number(h) * 60 + Number(m);
    };
    for (const seed of [12, 340, 5005, 60606]) {
      // Niveau 1 : arrivée = départ + temps de vol (modulo 24 h).
      const q1 = generateQuestion("horloges-durees", seed, 1);
      const [, dep1] = q1.prompt.match(/à (\d{2}h\d{2})/)!;
      const [, dur1] = q1.prompt.match(/temps de vol (\d+h\d{2})/)!;
      const arr = (toMin(dep1) + durToMin(dur1)) % 1440;
      expect(toMin(q1.choices[q1.correctIndex])).toBe(arr);

      // Niveau 2 : durée = arrivée − départ (modulo 24 h).
      const q2 = generateQuestion("horloges-durees", seed, 2);
      const times = q2.prompt.match(/(\d{2}h\d{2})/g)!;
      const realDur = (toMin(times[1]) - toMin(times[0]) + 1440) % 1440;
      expect(durToMin(q2.choices[q2.correctIndex])).toBe(realDur);

      // Niveau 3 : arrivée UTC = (locale − décalage) + temps de vol.
      const q3 = generateQuestion("horloges-durees", seed, 3);
      const [, loc] = q3.prompt.match(/à (\d{2}h\d{2}) heure locale/)!;
      const [, off] = q3.prompt.match(/UTC\+(\d)/)!;
      const [, dur3] = q3.prompt.match(/temps de vol (\d+h\d{2})/)!;
      const utcArr = (toMin(loc) - Number(off) * 60 + durToMin(dur3) + 1440 * 2) % 1440;
      expect(toMin(q3.choices[q3.correctIndex])).toBe(utcArr);
    }
  });

  it("raisonnement mécanique : sens et vitesse cohérents avec l'énoncé", () => {
    for (const seed of [13, 260, 7007, 80808]) {
      // Niveau 1 : deux roues engrenées → sens inverse ; plus de dents → plus lent.
      const q1 = generateQuestion("raisonnement-mecanique", seed, 1);
      const [, a, b] = q1.prompt.match(/de (\d+) dents est engrenée avec une roue de (\d+) dents/)!;
      const faster = Number(b) < Number(a);
      expect(q1.choices[q1.correctIndex]).toBe(
        `En sens inverse, plus ${faster ? "vite" : "lentement"}`
      );

      // Niveau 2 : nombre de roues tournant comme la première = ceil(n / 2).
      const q2 = generateQuestion("raisonnement-mecanique", seed, 2);
      const n = { Quatre: 4, Cinq: 5, Six: 6, Sept: 7 }[q2.prompt.split(" ")[0]]!;
      expect(q2.choices[q2.correctIndex]).toBe(String(Math.ceil(n / 2)));

      // Niveau 3 : courroie croisée → sens inverse ; petite poulie menée → plus rapide.
      const q3 = generateQuestion("raisonnement-mecanique", seed, 3);
      const crossed = q3.prompt.includes("courroie croisée");
      const [, d1, d2] = q3.prompt.match(/menante \(diamètre (\d+)\).+?menée \(diamètre (\d+)\)/)!;
      const fasterP = Number(d2) < Number(d1);
      expect(q3.choices[q3.correctIndex]).toBe(
        `${crossed ? "En sens inverse" : "Dans le même sens"}, plus ${fasterP ? "vite" : "lentement"}`
      );
    }
  });

  it("analogies : la bonne réponse est le résultat annoncé par la méthode", () => {
    for (const seed of [14, 300, 8008, 90909]) {
      for (const difficulty of [1, 2, 3] as const) {
        const q = generateQuestion("analogies", seed, difficulty);
        // La méthode se termine par « = <réponse> » : le dernier nombre = la bonne réponse.
        const nums = q.method.match(/-?\d+/g)!;
        expect(Number(nums[nums.length - 1])).toBe(Number(q.choices[q.correctIndex]));
      }
    }
  });

  it("comparaison de nombres : la bonne réponse est bien l'extremum de la liste", () => {
    for (const seed of [15, 320, 9009, 12121]) {
      const nums = (q: ReturnType<typeof generateQuestion>) =>
        q.prompt.split("\n")[1].split(" · ").map(Number);

      const q1 = generateQuestion("comparaison-nombres", seed, 1);
      expect(Number(q1.choices[q1.correctIndex])).toBe(Math.max(...nums(q1)));

      const q2 = generateQuestion("comparaison-nombres", seed, 2);
      expect(Number(q2.choices[q2.correctIndex])).toBe(Math.min(...nums(q2)));

      const q3 = generateQuestion("comparaison-nombres", seed, 3);
      expect(Number(q3.choices[q3.correctIndex])).toBe(Math.max(...nums(q3)));
    }
  });
});

describe("composition de session", () => {
  it("répartit équitablement les familles et reste déterministe", () => {
    const families: PsyFamily[] = ["calcul-mental", "orientation"];
    const a = composeSession({ families, size: 20, seed: 42 });
    const b = composeSession({ families, size: 20, seed: 42 });
    expect(a).toHaveLength(20);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
    const calcul = a.filter((q) => q.family === "calcul-mental").length;
    expect(calcul).toBe(10);
  });

  it("monte en difficulté par tiers", () => {
    const session = composeSession({ families: ["suites-numeriques"], size: 9, seed: 7 });
    expect(session.slice(0, 3).every((q) => q.difficulty === 1)).toBe(true);
    expect(session.slice(3, 6).every((q) => q.difficulty === 2)).toBe(true);
    expect(session.slice(6).every((q) => q.difficulty === 3)).toBe(true);
  });

  it("ne duplique pas les questions dans une session", () => {
    const session = composeSession({ families: ["attention", "memoire"], size: 20, seed: 3 });
    const ids = session.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("notation de session", () => {
  it("calcule précision, vitesse et familles à retravailler", () => {
    const events: PsyAnswerEvent[] = [
      { questionId: "a", family: "calcul-mental", correct: true, elapsedMs: 4000 },
      { questionId: "b", family: "calcul-mental", correct: true, elapsedMs: 6000 },
      { questionId: "c", family: "calcul-mental", correct: false, elapsedMs: 8000 },
      { questionId: "d", family: "orientation", correct: false, elapsedMs: 5000 },
      { questionId: "e", family: "orientation", correct: false, elapsedMs: 5000 },
      { questionId: "f", family: "orientation", correct: true, elapsedMs: 5000 },
      { questionId: "g", family: "memoire", correct: undefined, elapsedMs: 15000 },
    ];
    const score = scoreSession(events);
    expect(score.asked).toBe(7);
    expect(score.answered).toBe(6);
    expect(score.correct).toBe(3);
    expect(score.precision).toBeCloseTo(0.5);

    const calcul = score.parFamille.find((f) => f.family === "calcul-mental")!;
    expect(calcul.precision).toBeCloseTo(2 / 3);
    expect(calcul.avgMs).toBe(6000);

    // orientation à 1/3 (< 60 % sur ≥ 3 questions) → à retravailler.
    expect(score.aRetravailler).toEqual(["orientation"]);
  });
});

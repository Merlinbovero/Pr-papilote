/**
 * Alphabet phonétique international (OACI / OTAN) et prononciation des chiffres.
 *
 * Données normalisées, factuelles — **pas inventées** : elles sont fixées par
 * l'OACI (Annexe 10, Volume II, radiotéléphonie). L'orthographe officielle
 * retient « Alfa » et « Juliett » (et non « Alpha »/« Juliet ») pour éviter les
 * fautes de prononciation des non-anglophones. La colonne « prononciation »
 * indique l'accentuation recommandée (syllabe accentuée en capitales).
 */

export const PHONETIC_SOURCE =
  "OACI, Annexe 10 au titre de la Convention de Chicago, Volume II — alphabet d'épellation et prononciation des nombres (radiotéléphonie).";

export interface PhoneticLetter {
  letter: string;
  /** Mot-code officiel (orthographe OACI). */
  word: string;
  /** Prononciation recommandée, syllabe accentuée en capitales. */
  pronunciation: string;
}

export const PHONETIC_ALPHABET: PhoneticLetter[] = [
  { letter: "A", word: "Alfa", pronunciation: "AL-fah" },
  { letter: "B", word: "Bravo", pronunciation: "BRAH-voh" },
  { letter: "C", word: "Charlie", pronunciation: "CHAR-lee" },
  { letter: "D", word: "Delta", pronunciation: "DELL-tah" },
  { letter: "E", word: "Echo", pronunciation: "ECK-oh" },
  { letter: "F", word: "Foxtrot", pronunciation: "FOKS-trot" },
  { letter: "G", word: "Golf", pronunciation: "GOLF" },
  { letter: "H", word: "Hotel", pronunciation: "hoh-TELL" },
  { letter: "I", word: "India", pronunciation: "IN-dee-ah" },
  { letter: "J", word: "Juliett", pronunciation: "JEW-lee-ett" },
  { letter: "K", word: "Kilo", pronunciation: "KEY-loh" },
  { letter: "L", word: "Lima", pronunciation: "LEE-mah" },
  { letter: "M", word: "Mike", pronunciation: "MIKE" },
  { letter: "N", word: "November", pronunciation: "no-VEM-ber" },
  { letter: "O", word: "Oscar", pronunciation: "OSS-cah" },
  { letter: "P", word: "Papa", pronunciation: "pah-PAH" },
  { letter: "Q", word: "Quebec", pronunciation: "keh-BECK" },
  { letter: "R", word: "Romeo", pronunciation: "ROW-me-oh" },
  { letter: "S", word: "Sierra", pronunciation: "see-AIR-rah" },
  { letter: "T", word: "Tango", pronunciation: "TANG-go" },
  { letter: "U", word: "Uniform", pronunciation: "YOU-nee-form" },
  { letter: "V", word: "Victor", pronunciation: "VIK-tah" },
  { letter: "W", word: "Whiskey", pronunciation: "WISS-key" },
  { letter: "X", word: "X-ray", pronunciation: "ECKS-ray" },
  { letter: "Y", word: "Yankee", pronunciation: "YANG-key" },
  { letter: "Z", word: "Zulu", pronunciation: "ZOO-loo" },
];

export interface PhoneticNumber {
  digit: string;
  pronunciation: string;
}

/** Prononciation OACI des chiffres (radiotéléphonie) : « tree », « fife », « niner »… */
export const PHONETIC_NUMBERS: PhoneticNumber[] = [
  { digit: "0", pronunciation: "ZE-RO" },
  { digit: "1", pronunciation: "WUN" },
  { digit: "2", pronunciation: "TOO" },
  { digit: "3", pronunciation: "TREE" },
  { digit: "4", pronunciation: "FOW-er" },
  { digit: "5", pronunciation: "FIFE" },
  { digit: "6", pronunciation: "SIX" },
  { digit: "7", pronunciation: "SEV-en" },
  { digit: "8", pronunciation: "AIT" },
  { digit: "9", pronunciation: "NIN-er" },
];

/** Épelle un texte : chaque lettre A–Z devient son mot-code, le reste est ignoré. */
export function spellWithAlphabet(input: string): { char: string; word: string }[] {
  const byLetter = new Map(PHONETIC_ALPHABET.map((entry) => [entry.letter, entry.word]));
  const byDigit = new Map(PHONETIC_NUMBERS.map((entry) => [entry.digit, entry.pronunciation]));
  const result: { char: string; word: string }[] = [];
  for (const raw of input.toUpperCase()) {
    const letterWord = byLetter.get(raw);
    if (letterWord) {
      result.push({ char: raw, word: letterWord });
      continue;
    }
    const digitWord = byDigit.get(raw);
    if (digitWord) {
      result.push({ char: raw, word: digitWord });
    }
  }
  return result;
}

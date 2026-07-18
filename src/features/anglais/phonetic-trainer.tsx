"use client";

import * as React from "react";
import { EyeIcon, ShuffleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  PHONETIC_ALPHABET,
  PHONETIC_NUMBERS,
  PHONETIC_SOURCE,
  spellWithAlphabet,
  type PhoneticLetter,
} from "@/lib/anglais/phonetic-alphabet";

/**
 * Alphabet OACI : un épeleur (texte → mots-code), un entraînement par
 * cartes-éclair (lettre ↔ mot) et la table de référence complète avec la
 * prononciation. Données normalisées OACI — aucune donnée inventée.
 */

type Direction = "letter-word" | "word-letter";

function randomIndex(exclude: number): number {
  if (PHONETIC_ALPHABET.length < 2) return 0;
  let next = exclude;
  while (next === exclude) next = Math.floor(Math.random() * PHONETIC_ALPHABET.length);
  return next;
}

export function PhoneticTrainer() {
  const [text, setText] = React.useState("");
  const [index, setIndex] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  const [direction, setDirection] = React.useState<Direction>("letter-word");

  const spelled = spellWithAlphabet(text);
  const card: PhoneticLetter = PHONETIC_ALPHABET[index];
  const front = direction === "letter-word" ? card.letter : card.word;
  const back = direction === "letter-word" ? card.word : card.letter;

  const nextCard = () => {
    setIndex((current) => randomIndex(current));
    setRevealed(false);
  };

  return (
    <div className="space-y-8">
      {/* Épeleur : texte → mots-code */}
      <section aria-label="Épeler un mot" className="bg-card space-y-3 rounded-xl border p-5">
        <div className="space-y-1">
          <h3 className="font-semibold">Épeler un mot</h3>
          <p className="text-muted-foreground text-sm">
            Tapez un indicatif ou un mot : il est transcrit en alphabet OACI, comme à la radio.
          </p>
        </div>
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Ex. : RAFALE, F-GKXA, 27…"
          aria-label="Mot à épeler"
          className="max-w-sm"
        />
        {spelled.length > 0 ? (
          <p className="flex flex-wrap gap-x-2 gap-y-1" aria-live="polite">
            {spelled.map((item, position) => (
              <span key={`${item.char}-${position}`} className="inline-flex items-baseline gap-1">
                <span className="text-muted-foreground text-xs tabular-nums">{item.char}</span>
                <span className="font-medium" lang="en">
                  {item.word}
                </span>
              </span>
            ))}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm italic">
            La transcription s&apos;affiche ici (lettres A–Z et chiffres).
          </p>
        )}
      </section>

      {/* Entraînement : cartes-éclair */}
      <div className="bg-card space-y-4 rounded-xl border p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">S&apos;entraîner</h3>
          <button
            type="button"
            onClick={() => {
              setDirection((d) => (d === "letter-word" ? "word-letter" : "letter-word"));
              setRevealed(false);
            }}
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
          >
            {direction === "letter-word" ? "Lettre → mot" : "Mot → lettre"}
          </button>
        </div>
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <p
            className="text-3xl font-bold tracking-tight"
            lang={direction === "letter-word" ? undefined : "en"}
          >
            {front}
          </p>
          <p
            className={cn(
              "text-primary text-xl font-semibold transition-opacity",
              revealed ? "opacity-100" : "opacity-0"
            )}
            aria-hidden={!revealed}
            lang={direction === "letter-word" ? "en" : undefined}
          >
            {back}
          </p>
          {revealed ? (
            <p className="text-muted-foreground text-sm" aria-live="polite">
              {card.pronunciation}
            </p>
          ) : null}
        </div>
        <div className="flex justify-center gap-2">
          {!revealed ? (
            <Button variant="outline" onClick={() => setRevealed(true)}>
              <EyeIcon aria-hidden className="size-4" />
              Révéler
            </Button>
          ) : null}
          <Button onClick={nextCard}>
            <ShuffleIcon aria-hidden className="size-4" />
            Lettre suivante
          </Button>
        </div>
      </div>

      {/* Référence complète */}
      <div className="space-y-3">
        <h3 className="font-semibold">Table de référence</h3>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {PHONETIC_ALPHABET.map((entry) => (
            <li
              key={entry.letter}
              className="bg-card flex items-center gap-3 rounded-lg border p-3"
            >
              <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md font-bold">
                {entry.letter}
              </span>
              <span className="min-w-0">
                <span className="block font-medium" lang="en">
                  {entry.word}
                </span>
                <span className="text-muted-foreground block text-xs">{entry.pronunciation}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="space-y-2">
          <h4 className="text-muted-foreground text-sm font-semibold">Chiffres</h4>
          <ul className="flex flex-wrap gap-2">
            {PHONETIC_NUMBERS.map((entry) => (
              <li
                key={entry.digit}
                className="bg-card inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm"
              >
                <span className="font-bold tabular-nums">{entry.digit}</span>
                <span className="text-muted-foreground">{entry.pronunciation}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-muted-foreground text-xs">Source : {PHONETIC_SOURCE}</p>
      </div>
    </div>
  );
}

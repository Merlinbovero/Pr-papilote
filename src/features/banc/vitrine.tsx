"use client";

import * as React from "react";

import { Progress } from "@/components/ui/progress";
import { BANC_CLAIR, BANC_SOMBRE, type EtatChrono } from "@/lib/design/banc-tokens";

import { Chronometre } from "./chronometre";
import { ReponseBanc } from "./etat-reponse";
import { ModeSeance } from "./mode-seance";

/**
 * Vitrine du système du Banc — lot F1b.
 *
 * Elle sert de **contrat visuel** : ce que les migrations devront reproduire.
 * Aucun moteur de production n'y est branché, aucune donnée réelle n'y entre.
 */

const ENCRES: { nom: string; clair: string; sombre: string; role: string }[] = [
  { nom: "banc", clair: BANC_CLAIR.banc, sombre: BANC_SOMBRE.banc, role: "Encre de famille F" },
  { nom: "juste", clair: BANC_CLAIR.juste, sombre: BANC_SOMBRE.juste, role: "Réponse correcte" },
  {
    nom: "attention",
    clair: BANC_CLAIR.attention,
    sombre: BANC_SOMBRE.attention,
    role: "Temps faible, réponse partielle",
  },
  { nom: "erreur", clair: BANC_CLAIR.erreur, sombre: BANC_SOMBRE.erreur, role: "Réponse fausse" },
];

const FONDS: { nom: string; clair: string; sombre: string; role: string }[] = [
  { nom: "fond", clair: BANC_CLAIR.fond, sombre: BANC_SOMBRE.fond, role: "Cadre de séance" },
  { nom: "fond2", clair: BANC_CLAIR.fond2, sombre: BANC_SOMBRE.fond2, role: "Zone de stimulus" },
  { nom: "fond3", clair: BANC_CLAIR.fond3, sombre: BANC_SOMBRE.fond3, role: "Réponses au repos" },
];

const ETATS_CHRONO_DEMO: { etat: EtatChrono; secondes: number; propos: string }[] = [
  { etat: "normal", secondes: 425, propos: "Le temps court" },
  { etat: "warning", secondes: 45, propos: "Seuil fourni par le moteur" },
  { etat: "critical", secondes: 8, propos: "Seuil fourni par le moteur" },
  { etat: "expired", secondes: 0, propos: "À zéro" },
  { etat: "absent", secondes: 0, propos: "Entraînement libre" },
];

function Pastille({ couleur }: { couleur: string }) {
  return (
    <span
      aria-hidden
      className="inline-block size-8 shrink-0 rounded-md border"
      style={{ backgroundColor: couleur }}
    />
  );
}

export function BancVitrine() {
  const [choix, setChoix] = React.useState<number | null>(null);
  const [corrige, setCorrige] = React.useState(false);

  return (
    <div className="banc min-h-screen py-10">
      <div className="banc-cadre space-y-12">
        <header className="space-y-2">
          <p className="text-sm tracking-widest uppercase" style={{ color: "var(--bc-banc)" }}>
            Laboratoire de design — vitrine interne
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Le Banc — système visuel</h1>
          <p className="banc-consigne" style={{ color: "var(--bc-encre2)" }}>
            Fondation visuelle du lot F1b, derrière le drapeau de fonctionnalité et non indexée.
            Aucun moteur de production n’est branché ici : cette page est le contrat que les
            migrations devront reproduire.
          </p>
        </header>

        <section aria-labelledby="titre-encres" className="space-y-4">
          <h2 id="titre-encres" className="text-xl font-semibold">
            Encres et fonds
          </h2>
          <p className="banc-consigne text-sm" style={{ color: "var(--bc-encre2)" }}>
            L’encre du Banc est un turquoise de teinte 193, choisie par la mesure : elle occupe le
            seul créneau libre de la famille isoluminante, se sépare des sept encres PLANCHE et des
            trois états, et tient dans le gamut sRGB.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">
                Jetons du Banc : rôle, valeur en registre clair et en registre sombre
              </caption>
              <thead>
                <tr className="text-left">
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Jeton
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Rôle
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    Clair
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Sombre
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...ENCRES, ...FONDS].map((jeton) => (
                  <tr key={jeton.nom} className="banc-separateur">
                    <td className="py-2 pr-4 font-mono">{jeton.nom}</td>
                    <td className="py-2 pr-4">{jeton.role}</td>
                    <td className="py-2 pr-4">
                      <span className="flex items-center gap-2">
                        <Pastille couleur={jeton.clair} />
                        <code>{jeton.clair}</code>
                      </span>
                    </td>
                    <td className="py-2">
                      <span className="flex items-center gap-2">
                        <Pastille couleur={jeton.sombre} />
                        <code>{jeton.sombre}</code>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="titre-chrono" className="space-y-4">
          <h2 id="titre-chrono" className="text-xl font-semibold">
            Chronomètre
          </h2>
          <p className="banc-consigne text-sm" style={{ color: "var(--bc-encre2)" }}>
            Une seule écriture pour l’œil, une phrase pour l’oreille. Aucun seuil n’est codé dans le
            composant : l’état vient du moteur, car cinq secondes ne veulent pas dire la même chose
            sur une question de quinze et sur un examen de deux heures et demie.
          </p>
          <ul className="space-y-3">
            {ETATS_CHRONO_DEMO.map(({ etat, secondes, propos }) => (
              <li key={etat} className="flex flex-wrap items-center gap-4">
                <code className="w-20 shrink-0 text-xs">{etat}</code>
                <Chronometre
                  etat={etat}
                  secondes={secondes}
                  label="Temps restant — démonstration"
                />
                <span className="text-sm" style={{ color: "var(--bc-encre2)" }}>
                  {propos}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titre-etats" className="space-y-4">
          <h2 id="titre-etats" className="text-xl font-semibold">
            États de réponse
          </h2>
          <p className="banc-consigne text-sm" style={{ color: "var(--bc-encre2)" }}>
            Chaque état porte une icône et un libellé lisible par une technique d’assistance :
            jamais la couleur seule, jamais l’opacité seule.
          </p>
          <ul className="space-y-2">
            <li>
              <ReponseBanc>Au repos, actionnable</ReponseBanc>
            </li>
            <li>
              <ReponseBanc selectionnee>Sélectionnée</ReponseBanc>
            </li>
            <li>
              <ReponseBanc etat="juste">Juste</ReponseBanc>
            </li>
            <li>
              <ReponseBanc etat="erreur">Erreur</ReponseBanc>
            </li>
            <li>
              <ReponseBanc etat="attention">Attention</ReponseBanc>
            </li>
            <li>
              <ReponseBanc etat="neutre">Neutralisée après correction — encore lisible</ReponseBanc>
            </li>
            <li>
              <ReponseBanc desactive>Réellement désactivée — aucune action possible</ReponseBanc>
            </li>
          </ul>
        </section>

        <section aria-labelledby="titre-seance" className="space-y-4">
          <h2 id="titre-seance" className="text-xl font-semibold">
            Mode séance
          </h2>
          <p className="banc-consigne text-sm" style={{ color: "var(--bc-encre2)" }}>
            Au lancement, l’introduction se replie, l’aire entre dans le cadre et le focus s’y
            déplace. Le moteur n’est prévenu qu’ensuite : le temps ne court pas pendant que l’écran
            se réorganise.
          </p>

          <ModeSeance
            labelSeance="Question 1 sur 3"
            libelleLancement="Commencer la séance de démonstration"
            introduction={
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Démonstration — trois questions</h3>
                <p className="banc-consigne text-sm" style={{ color: "var(--bc-encre2)" }}>
                  Ce bloc représente tout ce qui précède une séance : présentation, consignes,
                  méthode. Il disparaît au lancement et reste rappelable.
                </p>
              </div>
            }
          >
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm" style={{ color: "var(--bc-encre2)" }}>
                  Question 1 / 3
                </span>
                <Chronometre secondes={95} label="Temps restant dans la séance" />
              </div>

              <Progress
                aria-label="Progression de la séance"
                aria-valuetext="0 question terminée sur 3"
                value={0}
              />

              <div className="banc-stimulus">
                <p className="banc-enonce text-xl font-semibold">
                  Le vent est toujours nommé par la direction d’où il vient.
                </p>
              </div>

              <ul className="space-y-2">
                {["Vrai", "Faux"].map((libelle, index) => (
                  <li key={libelle}>
                    <ReponseBanc
                      selectionnee={choix === index}
                      etat={corrige ? (index === 0 ? "juste" : "neutre") : undefined}
                      onClick={() => setChoix(index)}
                    >
                      {libelle}
                    </ReponseBanc>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="rounded-md px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: "var(--bc-banc)", color: "var(--bc-fond)" }}
                onClick={() => setCorrige((valeur) => !valeur)}
              >
                {corrige ? "Revenir à la question" : "Afficher la correction"}
              </button>
            </div>
          </ModeSeance>
        </section>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";

import { Progress } from "@/components/ui/progress";

import { Chronometre } from "./chronometre";
import { ReponseBanc } from "./etat-reponse";
import { ModeSeance } from "./mode-seance";

/**
 * Une séance de démonstration, seule sur sa page — lot F1b.
 *
 * C'est l'**étalon de densité** du Banc, et la forme que les migrations
 * devront reproduire : au lancement, le cadre, le stimulus, le chronomètre et
 * le premier contrôle de réponse tiennent dans le premier écran, sur les trois
 * viewports. L'audit F0b §1 avait mesuré l'inverse — 891, 995 et 994 px pour
 * un écran de 844 sur trois épreuves psychotechniques.
 *
 * Aucun moteur de production n'est branché : les données sont factices, et le
 * chronomètre ne court pas.
 */

const QUESTIONS = [
  {
    enonce: "Le vent est toujours nommé par la direction d’où il vient.",
    choix: ["Vrai", "Faux"],
    bonne: 0,
  },
  {
    enonce: "Dans l’atmosphère standard, la température décroît de 6,5 °C par kilomètre.",
    choix: ["Vrai", "Faux"],
    bonne: 0,
  },
  {
    enonce: "Un aérostat se sustente grâce à la portance d’une voilure.",
    choix: ["Vrai", "Faux"],
    bonne: 1,
  },
];

export function SeanceVitrine() {
  const [index, setIndex] = React.useState(0);
  const [choix, setChoix] = React.useState<number | null>(null);
  const [corrige, setCorrige] = React.useState(false);
  const question = QUESTIONS[index];
  const terminees = index + (corrige ? 1 : 0);

  return (
    <div className="banc min-h-screen py-6">
      <ModeSeance
        labelSeance={`Question ${index + 1} sur ${QUESTIONS.length}`}
        libelleLancement="Commencer la séance"
        introduction={
          /*
            L'introduction est volontairement de la HAUTEUR MESURÉE en
            production : titre, chapeau, « Avant de vous lancer » et encart
            MÉTHODE. Une démonstration de trois lignes rendrait le contrôle de
            densité complaisant — il passerait même sans le repli, ce qui a
            été vérifié par rupture délibérée.
          */
          <div className="space-y-4">
            <p className="text-sm tracking-widest uppercase" style={{ color: "var(--bc-banc)" }}>
              Vitrine interne — séance
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Démonstration — trois questions</h1>
            <p className="banc-consigne" style={{ color: "var(--bc-encre2)" }}>
              Tout ce bloc représente l’avant-séance : présentation, consignes, méthode. Il se
              replie au lancement pour que l’aire de jeu entre dans le cadre, et reste rappelable
              sans quitter la séance.
            </p>
            <div className="space-y-2 border-l-2 pl-4" style={{ borderColor: "var(--bc-banc)" }}>
              <h2 className="font-semibold">Avant de vous lancer</h2>
              <p className="banc-consigne text-sm" style={{ color: "var(--bc-encre2)" }}>
                Les règles de l’épreuve, l’ordre dans lequel les appliquer, et la convention à
                retenir. À lire avant d’attaquer le niveau supérieur.
              </p>
            </div>
            <div
              className="flex gap-4 rounded-xl p-4"
              style={{ backgroundColor: "var(--bc-fond2)" }}
            >
              <div
                aria-hidden
                className="size-24 shrink-0 rounded-lg"
                style={{ backgroundColor: "var(--bc-fond3)" }}
              />
              <div className="space-y-1">
                <p
                  className="text-xs tracking-widest uppercase"
                  style={{ color: "var(--bc-encre2)" }}
                >
                  Méthode
                </p>
                <h3 className="font-semibold">La démonstration</h3>
                <p className="banc-consigne text-sm" style={{ color: "var(--bc-encre2)" }}>
                  L’encart de méthode occupe ici la place qu’il prend en production, photo comprise
                  : c’est lui qui repoussait l’aire de jeu sous le pli.
                </p>
              </div>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm" style={{ color: "var(--bc-encre2)" }}>
              Question {index + 1} / {QUESTIONS.length}
            </span>
            <Chronometre
              secondes={95}
              label="Temps restant dans la séance"
              className="banc-chrono-cadre"
            />
          </div>

          <Progress
            aria-label="Progression de la séance"
            aria-valuetext={`${terminees} question${terminees > 1 ? "s" : ""} terminée${
              terminees > 1 ? "s" : ""
            } sur ${QUESTIONS.length}`}
            value={(terminees / QUESTIONS.length) * 100}
          />

          <div className="banc-stimulus">
            <p className="banc-enonce text-xl font-semibold">{question.enonce}</p>
          </div>

          <ul className="space-y-2">
            {question.choix.map((libelle, rang) => (
              <li key={libelle}>
                <ReponseBanc
                  selectionnee={choix === rang}
                  etat={
                    corrige
                      ? rang === question.bonne
                        ? "juste"
                        : choix === rang
                          ? "erreur"
                          : "neutre"
                      : undefined
                  }
                  desactive={corrige}
                  onClick={() => setChoix(rang)}
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
            onClick={() => {
              if (!corrige) {
                setCorrige(true);
                return;
              }
              setCorrige(false);
              setChoix(null);
              setIndex((valeur) => (valeur + 1) % QUESTIONS.length);
            }}
          >
            {corrige ? "Question suivante" : "Valider"}
          </button>
        </div>
      </ModeSeance>
    </div>
  );
}

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Chronometre } from "./chronometre";
import { ReponseBanc } from "./etat-reponse";
import { ModeSeance } from "./mode-seance";

/**
 * Les contrats des trois composants de fondation du Banc — lot F1b.
 *
 * Chaque assertion correspond à un défaut mesuré pendant l'audit F0b.
 */

describe("Chronometre", () => {
  it("porte la sémantique du compte à rebours et reste muet", () => {
    render(<Chronometre secondes={425} label="Temps restant" />);
    const chrono = screen.getByRole("timer", { name: "Temps restant" });
    // Muet volontairement : une valeur qui change chaque seconde couvrirait
    // toutes les autres annonces de la séance.
    expect(chrono).toHaveAttribute("aria-live", "off");
  });

  it("affiche M:SS pour l'œil et une phrase pour l'oreille", () => {
    render(<Chronometre secondes={425} label="Temps restant" />);
    const chrono = screen.getByRole("timer");
    expect(chrono).toHaveTextContent("7:05");
    // « 7:05 » se lit « sept-cent-cinq » selon les lecteurs d'écran.
    expect(chrono).toHaveAttribute("aria-valuetext", "7 minutes et 5 secondes restantes");
  });

  it("passe en H:MM:SS au-delà d'une heure", () => {
    render(<Chronometre secondes={4328} label="Temps restant" />);
    expect(screen.getByRole("timer")).toHaveTextContent("1:12:08");
    expect(screen.getByRole("timer")).toHaveAttribute(
      "aria-valuetext",
      "1 heure, 12 minutes et 8 secondes restantes"
    );
  });

  it("emploie des chiffres tabulaires", () => {
    // Sans cela, la largeur du compteur danse à chaque seconde.
    render(<Chronometre secondes={95} label="Temps restant" />);
    expect(screen.getByRole("timer")).toHaveClass("banc-chrono");
  });

  it.each(["normal", "warning", "critical", "expired"] as const)(
    "expose l'état %s tel que le moteur le fournit",
    (etat) => {
      render(<Chronometre secondes={12} etat={etat} label="Temps restant" />);
      expect(screen.getByRole("timer")).toHaveAttribute("data-etat", etat);
    }
  );

  it("double l'alerte d'un libellé, jamais de la seule couleur", () => {
    const { rerender } = render(<Chronometre secondes={9} etat="warning" label="Temps" />);
    expect(screen.getByText("Temps faible")).toBeInTheDocument();
    rerender(<Chronometre secondes={3} etat="critical" label="Temps" />);
    expect(screen.getByText("Temps critique")).toBeInTheDocument();
    rerender(<Chronometre secondes={0} etat="expired" label="Temps" />);
    expect(screen.getByText("Temps écoulé")).toBeInTheDocument();
  });

  it("traite l'absence de chronomètre comme un état, pas comme un vide", () => {
    // Sur un entraînement libre, « sans chronomètre » est une information.
    render(<Chronometre etat="absent" label="Temps restant" />);
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    expect(screen.getByText("Sans chronomètre")).toBeInTheDocument();
  });

  it("ne déduit aucun seuil d'une durée", () => {
    // Cinq secondes sont critiques sur une question de quinze, anodines sur
    // un examen de deux heures et demie : le seuil appartient au moteur.
    render(<Chronometre secondes={3} label="Temps restant" />);
    expect(screen.getByRole("timer")).toHaveAttribute("data-etat", "normal");
  });
});

describe("ReponseBanc", () => {
  it("expose l'état sélectionné", () => {
    render(<ReponseBanc selectionnee>Vrai</ReponseBanc>);
    expect(screen.getByRole("button", { name: /Vrai/ })).toHaveAttribute("aria-pressed", "true");
  });

  it.each([
    ["juste", "Bonne réponse"],
    ["erreur", "Réponse incorrecte"],
    ["attention", "À vérifier"],
  ] as const)("écrit le verdict %s au lieu de le seulement teinter", (etat, mot) => {
    render(<ReponseBanc etat={etat}>Une réponse</ReponseBanc>);
    expect(screen.getByText(mot)).toBeInTheDocument();
  });

  it("distingue neutralisé après correction et réellement désactivé", () => {
    // Les deux étaient confondus sous un même gris pâle dans le produit.
    const { rerender } = render(<ReponseBanc etat="neutre">Un choix</ReponseBanc>);
    expect(screen.getByText("Réponse non retenue")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Un choix/ })).toBeEnabled();

    rerender(<ReponseBanc desactive>Un choix</ReponseBanc>);
    expect(screen.getByText("Indisponible")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Un choix/ })).toBeDisabled();
  });

  it("reste actionnable au repos", async () => {
    const clic = vi.fn();
    render(<ReponseBanc onClick={clic}>Faux</ReponseBanc>);
    await userEvent.click(screen.getByRole("button", { name: /Faux/ }));
    expect(clic).toHaveBeenCalledOnce();
  });
});

describe("ModeSeance", () => {
  const rendre = (props: Partial<React.ComponentProps<typeof ModeSeance>> = {}) =>
    render(
      <ModeSeance
        introduction={<p>Présentation de l’épreuve</p>}
        labelSeance="Séance de démonstration"
        {...props}
      >
        <button type="button">Première réponse</button>
      </ModeSeance>
    );

  it("montre l'introduction et cache la séance avant le lancement", () => {
    rendre();
    expect(screen.getByText("Présentation de l’épreuve")).toBeVisible();
    expect(
      screen.queryByRole("group", { name: "Séance de démonstration" })
    ).not.toBeInTheDocument();
  });

  it("replie l'introduction et donne le focus à la séance au lancement", async () => {
    rendre();
    await userEvent.click(screen.getByRole("button", { name: "Commencer" }));

    // C'est le défaut mesuré : l'introduction restait empilée au-dessus et
    // l'aire de jeu tombait sous le pli.
    expect(screen.getByText("Présentation de l’épreuve")).not.toBeVisible();
    const zone = screen.getByRole("group", { name: "Séance de démonstration" });
    expect(zone).toBeVisible();
    expect(zone).toHaveFocus();
  });

  it("ne prévient le moteur qu'une fois l'aire en place ET focalisée", async () => {
    // Vérifier après coup que le rappel a eu lieu et que la zone a le focus
    // ne prouve RIEN : les deux restent vrais même si le moteur a été
    // prévenu au clic. C'est l'état du DOM **au moment de l'appel** qui
    // atteste l'ordre — et c'est lui qui décide si le chronomètre court
    // pendant que l'écran se réorganise.
    let zoneAuMomentDeLAppel: string | null = null;
    let focusAuMomentDeLAppel: string | null = null;
    const entree = vi.fn(() => {
      zoneAuMomentDeLAppel =
        document.querySelector('[aria-label="Séance de démonstration"]')?.tagName ?? null;
      focusAuMomentDeLAppel = document.activeElement?.getAttribute("aria-label") ?? null;
    });

    rendre({ onSeanceEntree: entree });
    expect(entree).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Commencer" }));

    expect(entree).toHaveBeenCalledOnce();
    expect(zoneAuMomentDeLAppel, "l'aire de séance n'existait pas encore").not.toBeNull();
    expect(focusAuMomentDeLAppel, "le focus n'était pas encore dans la séance").toBe(
      "Séance de démonstration"
    );
  });

  it("garde les consignes rappelables sans quitter la séance", async () => {
    rendre();
    await userEvent.click(screen.getByRole("button", { name: "Commencer" }));
    await userEvent.click(screen.getByRole("button", { name: /Revoir les consignes/ }));

    expect(screen.getByText("Présentation de l’épreuve")).toBeVisible();
    // La séance n'est pas interrompue pour autant.
    expect(screen.getByRole("group", { name: "Séance de démonstration" })).toBeInTheDocument();
  });

  it("offre une sortie explicite qui ramène à l'avant-séance", async () => {
    const sortie = vi.fn();
    rendre({ onSortie: sortie });
    await userEvent.click(screen.getByRole("button", { name: "Commencer" }));
    await userEvent.click(screen.getByRole("button", { name: /Quitter la séance/ }));

    expect(sortie).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Commencer" })).toBeVisible();
    expect(
      screen.queryByRole("group", { name: "Séance de démonstration" })
    ).not.toBeInTheDocument();
  });
});

import type { Metadata } from "next";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { LEGAL, LEGAL_PLACEHOLDER } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacter l'équipe de PrépaPilote.",
};

export default function ContactPage() {
  const email = LEGAL.contactEmail;
  const configured = email !== LEGAL_PLACEHOLDER;

  return (
    <StandalonePageShell
      breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Contact" }]}
      className="max-w-3xl"
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Contact</h1>
        <p className="text-muted-foreground">
          Une question, une correction à signaler, une source à proposer ?
        </p>
      </header>

      <section className="space-y-3 leading-7">
        <p>
          PrépaPilote s&apos;améliore grâce aux retours de ses utilisateurs. Signalements
          d&apos;erreur, suggestions de contenu et sources vérifiables sont les bienvenus.
        </p>
        {configured ? (
          <p>
            Écrivez à{" "}
            <a
              href={`mailto:${email}`}
              className="text-primary font-medium underline underline-offset-4"
            >
              {email}
            </a>
            .
          </p>
        ) : (
          <p className="text-foreground font-medium">
            <span className="bg-warning/15 rounded px-1">
              Adresse de contact à compléter par l&apos;éditeur.
            </span>
          </p>
        )}
      </section>
    </StandalonePageShell>
  );
}

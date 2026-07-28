import type { Metadata } from "next";
import Link from "next/link";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { LEGAL, LEGAL_PLACEHOLDER } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Quelles données PrépaPilote traite, pourquoi, où elles sont hébergées et comment exercer vos droits.",
};

export default function ConfidentialitePage() {
  const contact =
    LEGAL.contactEmail === LEGAL_PLACEHOLDER
      ? "l'adresse de contact indiquée dans les mentions légales"
      : LEGAL.contactEmail;

  return (
    <StandalonePageShell
      breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Confidentialité" }]}
      className="max-w-3xl"
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Politique de confidentialité</h1>
        <p className="text-muted-foreground">
          PrépaPilote limite au strict nécessaire les données traitées et n&apos;en fait aucun usage
          publicitaire.
        </p>
      </header>

      <section className="space-y-3 leading-7">
        <h2 className="text-xl font-semibold tracking-tight">Consultation sans compte</h2>
        <p>
          La documentation (fiches, dictionnaire, cartes) est consultable{" "}
          <strong>sans inscription</strong>. Les entraînements passés hors connexion (examens blancs
          BIA, sessions psychotechniques) sont conservés{" "}
          <strong>localement dans votre navigateur</strong> et ne sont jamais transmis à un serveur.
          Les effacer vide votre historique local.
        </p>
      </section>

      <section className="space-y-3 leading-7">
        <h2 className="text-xl font-semibold tracking-tight">Compte et progression</h2>
        <p>
          La création d&apos;un compte est facultative ; elle sert uniquement à retrouver votre
          progression d&apos;un appareil à l&apos;autre. Sont alors traités : votre adresse
          électronique (authentification) et vos données de progression (fiches consultées,
          résultats de quiz, favoris, objectifs). L&apos;authentification et le stockage reposent
          sur <strong>Supabase, hébergé dans l&apos;Union européenne</strong>, avec une isolation
          stricte par utilisateur (chaque personne n&apos;accède qu&apos;à ses propres données).
        </p>
      </section>

      <section className="space-y-3 leading-7">
        <h2 className="text-xl font-semibold tracking-tight">Pas de suivi publicitaire</h2>
        <p>
          Aucun traceur publicitaire, aucune revente de données, aucun profilage marketing. Les
          cartes n&apos;appellent aucun service tiers ; les images sont servies par le site
          lui-même.
        </p>
      </section>

      <section className="space-y-3 leading-7">
        <h2 className="text-xl font-semibold tracking-tight">Vos droits</h2>
        <p>
          Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
          d&apos;effacement et de portabilité de vos données. Depuis votre espace{" "}
          <Link href="/compte" className="text-primary underline underline-offset-4">
            compte
          </Link>
          , vous pouvez exporter vos données et supprimer votre compte (ce qui efface les données
          associées). Pour toute demande, écrivez à {contact}.
        </p>
      </section>

      <section className="space-y-3 leading-7">
        <h2 className="text-xl font-semibold tracking-tight">Conservation</h2>
        <p>
          Les données de compte sont conservées tant que le compte existe. Les historiques locaux
          restent sur votre appareil jusqu&apos;à ce que vous les effaciez.
        </p>
      </section>
    </StandalonePageShell>
  );
}

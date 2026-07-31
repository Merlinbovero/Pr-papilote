import type { Metadata } from "next";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { NonOfficialNotice } from "@/components/layout/non-official-notice";

export const metadata: Metadata = {
  title: "Conditions d'utilisation",
  description: "Les règles d'usage de la plateforme PrépaPilote.",
};

export default function CguPage() {
  return (
    <StandalonePageShell
      breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Conditions d'utilisation" }]}
      className="max-w-3xl"
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Conditions d&apos;utilisation</h1>
        <p className="text-muted-foreground">
          En utilisant PrépaPilote, vous acceptez les conditions ci-dessous.
        </p>
      </header>

      <NonOfficialNotice />

      <section className="space-y-3 leading-7">
        <h2 className="text-xl font-semibold tracking-tight">Objet</h2>
        <p>
          PrépaPilote est un outil pédagogique d&apos;aide à la préparation des concours de pilote
          militaire (EOPAN, EOPN, ALAT) et du BIA. Il ne se substitue ni à une formation officielle,
          ni aux épreuves réelles, ni à l&apos;avis d&apos;un médecin ou d&apos;un conseiller en
          recrutement.
        </p>
      </section>

      <section className="space-y-3 leading-7">
        <h2 className="text-xl font-semibold tracking-tight">Exactitude des contenus</h2>
        <p>
          Les contenus sont rédigés avec soin et sourcés, mais fournis « en l&apos;état », sans
          garantie d&apos;exhaustivité ni d&apos;actualité. Les données susceptibles d&apos;évoluer
          (calendriers, aptitudes, formats d&apos;épreuve) doivent être vérifiées auprès des sources
          officielles. L&apos;éditeur ne saurait être tenu responsable d&apos;une décision prise sur
          la seule base des informations du site.
        </p>
      </section>

      <section className="space-y-3 leading-7">
        <h2 className="text-xl font-semibold tracking-tight">Usage attendu</h2>
        <p>
          L&apos;usage est personnel et non commercial. Il est interdit de tenter de perturber le
          service, d&apos;en extraire massivement le contenu de façon automatisée, ou de le
          reproduire sans autorisation. Les comptes sont personnels.
        </p>
      </section>

      <section className="space-y-3 leading-7">
        <h2 className="text-xl font-semibold tracking-tight">Disponibilité et évolution</h2>
        <p>
          Le service est proposé sans garantie de disponibilité continue. Les fonctionnalités et ces
          conditions peuvent évoluer ; la version en vigueur est celle publiée sur cette page.
        </p>
      </section>
    </StandalonePageShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { StandalonePageShell } from "@/components/layout/standalone-page-shell";
import { NonOfficialNotice } from "@/components/layout/non-official-notice";
import { LEGAL, LEGAL_PLACEHOLDER } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Éditeur, hébergeur et responsabilités du site PrépaPilote.",
};

function Value({ children }: { children: string }) {
  if (children === LEGAL_PLACEHOLDER) {
    return (
      <span className="bg-warning/15 text-foreground rounded px-1 font-medium">
        à compléter par l&apos;éditeur
      </span>
    );
  }
  return <span>{children}</span>;
}

export default function MentionsLegalesPage() {
  return (
    <StandalonePageShell
      breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Mentions légales" }]}
      className="max-w-3xl"
    >
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Mentions légales</h1>
        <p className="text-muted-foreground">
          Informations relatives à l&apos;éditeur et à l&apos;hébergeur du site.
        </p>
      </header>

      <NonOfficialNotice />

      <section className="space-y-3 leading-7">
        <h2 className="text-xl font-semibold tracking-tight">Éditeur</h2>
        <dl className="space-y-1 text-sm">
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-40 shrink-0">Éditeur</dt>
            <dd>
              <Value>{LEGAL.editorName}</Value>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-40 shrink-0">Statut</dt>
            <dd>
              <Value>{LEGAL.editorStatus}</Value>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-40 shrink-0">Directeur de publication</dt>
            <dd>
              <Value>{LEGAL.publicationDirector}</Value>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground w-40 shrink-0">Contact</dt>
            <dd>
              <Value>{LEGAL.contactEmail}</Value>
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3 leading-7">
        <h2 className="text-xl font-semibold tracking-tight">Hébergeur</h2>
        <p className="text-sm">
          {LEGAL.host.name} — {LEGAL.host.address} —{" "}
          <a
            href={LEGAL.host.url}
            className="text-primary underline underline-offset-4"
            rel="noopener noreferrer"
            target="_blank"
          >
            {LEGAL.host.url}
          </a>
        </p>
      </section>

      <section className="space-y-3 leading-7">
        <h2 className="text-xl font-semibold tracking-tight">Propriété intellectuelle</h2>
        <p>
          Les contenus rédigés pour PrépaPilote (fiches, questions, textes) sont la propriété de
          l&apos;éditeur. Les photographies proviennent de sources de libre réutilisation et sont
          créditées sur la page{" "}
          <Link href="/credits-photos" className="text-primary underline underline-offset-4">
            crédits photographiques
          </Link>
          . Les marques, insignes et dénominations des armées citées restent la propriété de leurs
          détenteurs et ne sont utilisés qu&apos;à des fins d&apos;information.
        </p>
      </section>

      <section className="space-y-3 leading-7">
        <h2 className="text-xl font-semibold tracking-tight">Responsabilité</h2>
        <p>
          Les informations sont fournies à titre pédagogique, sans garantie d&apos;exhaustivité ni
          d&apos;actualité. Les conditions officielles des concours (calendriers, critères
          d&apos;aptitude, formats d&apos;épreuve) évoluent : seuls les sites institutionnels et les
          centres d&apos;information et de recrutement des forces armées (CIRFA) font foi.
        </p>
      </section>
    </StandalonePageShell>
  );
}

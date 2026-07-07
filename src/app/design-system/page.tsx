import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const paletteTokens = [
  { name: "primary", className: "bg-primary", usage: "Accent institutionnel — actions, liens" },
  { name: "secondary", className: "bg-secondary", usage: "Fonds discrets" },
  { name: "muted", className: "bg-muted", usage: "Texte secondaire, fonds neutres" },
  { name: "accent", className: "bg-accent", usage: "Survols" },
  { name: "destructive", className: "bg-destructive", usage: "Danger, réponse fausse" },
  { name: "success", className: "bg-success", usage: "Réponse juste, vérifié" },
  { name: "warning", className: "bg-warning", usage: "Avertissement, à re-vérifier" },
  { name: "concours-eopan", className: "bg-concours-eopan", usage: "Marqueur EOPAN" },
  { name: "concours-eopn", className: "bg-concours-eopn", usage: "Marqueur EOPN" },
  { name: "concours-alat", className: "bg-concours-alat", usage: "Marqueur ALAT" },
] as const;

/**
 * Catalogue interne du design system. Exclu de la production
 * (sauf NEXT_PUBLIC_SHOW_DESIGN_SYSTEM=1) et jamais indexé.
 */
export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SHOW_DESIGN_SYSTEM !== "1") {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Design system</h1>
        <p className="text-muted-foreground max-w-prose">
          Catalogue interne des tokens et composants de PrépaPilote. Règles complètes dans{" "}
          <code className="font-mono text-sm">docs/design-system.md</code>.
        </p>
      </header>

      <section aria-labelledby="ds-palette" className="space-y-4">
        <h2 id="ds-palette" className="text-xl font-semibold tracking-tight">
          Palette
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {paletteTokens.map((token) => (
            <div key={token.name} className="space-y-2">
              <div className={`h-16 rounded-lg border ${token.className}`} />
              <p className="font-mono text-sm">{token.name}</p>
              <p className="text-muted-foreground text-sm">{token.usage}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      <section aria-labelledby="ds-typo" className="space-y-4">
        <h2 id="ds-typo" className="text-xl font-semibold tracking-tight">
          Typographie
        </h2>
        <div className="space-y-3">
          <p className="text-4xl font-bold tracking-tight">Titre de page — text-4xl bold</p>
          <p className="text-2xl font-semibold tracking-tight">Titre de section — text-2xl</p>
          <p className="text-xl font-semibold">Intertitre — text-xl</p>
          <p className="text-base">
            Corps de texte — text-base. La lecture documentaire est bornée à une largeur de prose.
          </p>
          <p className="text-muted-foreground text-sm">Texte secondaire — text-sm muted.</p>
          <p className="font-mono text-sm">
            Données chiffrées, codes OACI, fréquences — Geist Mono : LFRL · 118,675 MHz
          </p>
        </div>
      </section>

      <Separator />

      <section aria-labelledby="ds-buttons" className="space-y-4">
        <h2 id="ds-buttons" className="text-xl font-semibold tracking-tight">
          Boutons
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button>Action principale</Button>
          <Button variant="outline">Secondaire</Button>
          <Button variant="ghost">Discret</Button>
          <Button variant="destructive">Danger</Button>
          <Button variant="link">Lien</Button>
          <Button size="sm">Petit</Button>
          <Button size="lg">Grand</Button>
          <Button disabled>Désactivé</Button>
        </div>
      </section>

      <Separator />

      <section aria-labelledby="ds-badges" className="space-y-4">
        <h2 id="ds-badges" className="text-xl font-semibold tracking-tight">
          Badges et marqueurs concours
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Défaut</Badge>
          <Badge variant="secondary">Secondaire</Badge>
          <Badge variant="outline">Contour</Badge>
          <Badge variant="destructive">Erreur</Badge>
          <Badge className="bg-concours-eopan text-primary-foreground">EOPAN</Badge>
          <Badge className="bg-concours-eopn text-primary-foreground">EOPN</Badge>
          <Badge className="bg-concours-alat text-primary-foreground">ALAT</Badge>
        </div>
      </section>

      <Separator />

      <section aria-labelledby="ds-forms" className="space-y-4">
        <h2 id="ds-forms" className="text-xl font-semibold tracking-tight">
          Formulaires
        </h2>
        <div className="max-w-sm space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ds-input">Adresse e-mail</Label>
            <Input id="ds-input" type="email" placeholder="prenom.nom@exemple.fr" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ds-input-error">Champ en erreur</Label>
            <Input id="ds-input-error" aria-invalid placeholder="Valeur invalide" />
            <p className="text-destructive text-sm">Message d&apos;erreur explicite.</p>
          </div>
        </div>
      </section>

      <Separator />

      <section aria-labelledby="ds-cards" className="space-y-4">
        <h2 id="ds-cards" className="text-xl font-semibold tracking-tight">
          Cartes et tableaux
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Titre de carte</CardTitle>
              <CardDescription>Description secondaire de la carte.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Contenu de la carte, composé à partir des primitives.</p>
            </CardContent>
          </Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Appareil</TableHead>
                <TableHead>Armée</TableHead>
                <TableHead className="text-right">Mise en service</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Exemple A</TableCell>
                <TableCell>Marine nationale</TableCell>
                <TableCell className="text-right font-mono">2001</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Exemple B</TableCell>
                <TableCell>Armée de l&apos;Air et de l&apos;Espace</TableCell>
                <TableCell className="text-right font-mono">2013</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      <Separator />

      <section aria-labelledby="ds-states" className="space-y-4">
        <h2 id="ds-states" className="text-xl font-semibold tracking-tight">
          États obligatoires
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">Chargement</p>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">Vide</p>
            <Empty className="border">
              <EmptyHeader>
                <EmptyTitle>Aucun contenu pour l&apos;instant</EmptyTitle>
                <EmptyDescription>
                  Cette section se remplira au fil de la production documentaire.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">Erreur</p>
            <Alert variant="destructive">
              <AlertTitle>Une erreur est survenue</AlertTitle>
              <AlertDescription>Réessayez ou revenez à l&apos;accueil.</AlertDescription>
            </Alert>
          </div>
        </div>
      </section>
    </main>
  );
}

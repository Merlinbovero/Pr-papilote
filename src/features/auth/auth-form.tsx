"use client";

import * as React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthFormState } from "./actions";

type AuthAction = (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;

interface AuthFormProps {
  action: AuthAction;
  submitLabel: string;
  /** Affiche le champ mot de passe (absent pour la réinitialisation). */
  withPassword?: boolean;
  children?: React.ReactNode;
}

/**
 * Formulaire d'authentification commun (connexion, inscription,
 * réinitialisation) : validation serveur via Server Action, erreurs
 * annoncées champ par champ, état d'envoi sur le bouton.
 */
export function AuthForm({ action, submitLabel, withPassword = true, children }: AuthFormProps) {
  const [state, formAction, isPending] = React.useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.success ? (
        <Alert>
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">Adresse e-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
        />
        {state.fieldErrors?.email ? (
          <p id="email-error" className="text-destructive text-sm">
            {state.fieldErrors.email[0]}
          </p>
        ) : null}
      </div>

      {withPassword ? (
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          />
          {state.fieldErrors?.password ? (
            <p id="password-error" className="text-destructive text-sm">
              {state.fieldErrors.password[0]}
            </p>
          ) : null}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Un instant…" : submitLabel}
      </Button>

      {children}
    </form>
  );
}

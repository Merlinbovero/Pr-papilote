"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: string;
}

const NOT_CONFIGURED =
  "L'authentification n'est pas encore activée sur cet environnement. Elle le sera à la mise en service des comptes.";

const emailSchema = z.email("Adresse e-mail invalide.");
const passwordSchema = z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères.");

const credentialsSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

function parseCredentials(formData: FormData) {
  return credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

export async function signIn(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = parseCredentials(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: NOT_CONFIGURED };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "Identifiants incorrects ou compte inexistant." };
  }

  redirect("/progression");
}

export async function signUp(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = parseCredentials(formData);
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: NOT_CONFIGURED };
  }

  const { error } = await supabase.auth.signUp(parsed.data);
  if (error) {
    return { error: "L'inscription a échoué. Réessayez dans quelques instants." };
  }

  return {
    success: "Compte créé. Vérifiez votre boîte mail pour confirmer votre adresse.",
  };
}

export async function requestPasswordReset(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = z.object({ email: emailSchema }).safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { error: NOT_CONFIGURED };
  }

  await supabase.auth.resetPasswordForEmail(parsed.data.email);
  // Toujours la même réponse, que l'adresse existe ou non (pas d'énumération).
  return {
    success: "Si un compte existe pour cette adresse, un e-mail de réinitialisation a été envoyé.",
  };
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}

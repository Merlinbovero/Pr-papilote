"use client";

import { useEffect } from "react";

/**
 * Frontière d'erreur racine (ch. 9 §8) : dernier filet si le layout lui-même
 * échoue. Elle remplace tout le document, doit donc porter ses propres
 * <html>/<body> et rester autonome (aucune dépendance au thème).
 */
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "2rem",
        }}
      >
        <main style={{ maxWidth: "28rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Une erreur est survenue</h1>
          <p style={{ color: "#555", marginTop: "0.5rem" }}>
            L&apos;application a rencontré un problème inattendu.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}

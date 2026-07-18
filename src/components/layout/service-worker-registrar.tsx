"use client";

import * as React from "react";

/**
 * Enregistre le service worker (couche hors-ligne) après le chargement, et
 * seulement en production — en développement, on évite de mettre en cache les
 * ressources du serveur de dev. N'affiche rien.
 */
export function ServiceWorkerRegistrar() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // enregistrement impossible : le site fonctionne normalement en ligne
      });
    };
    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}

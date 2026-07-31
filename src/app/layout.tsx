import type { Metadata, Viewport } from "next";
import { ServiceWorkerRegistrar } from "@/components/layout/service-worker-registrar";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

/**
 * Racine commune — lot M3.
 *
 * Volontairement minimale : elle ne porte que ce que les deux univers
 * partagent réellement. **Aucune fonte, aucun bandeau, aucun pied de page,
 * aucune classe typographique.** Le chrome et la typographie appartiennent
 * aux layouts de groupe : `(site)` pour la charte historique, `(planche)`
 * pour le système PLANCHE.
 *
 * Cette racine unique est ce qui permet à la navigation entre les deux
 * univers de rester une navigation client : deux layouts racine distincts
 * auraient imposé un rechargement complet du document à chaque traversée.
 */

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PrépaPilote — Préparer les concours EOPAN, EOPN et ALAT",
    template: "%s | PrépaPilote",
  },
  description:
    "Plateforme de préparation aux concours de pilote militaire français : EOPAN (Marine nationale), EOPN (Armée de l'Air et de l'Espace) et ALAT (Armée de Terre). Fiches, quiz et tests psychotechniques.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "PrépaPilote",
    title: "PrépaPilote — Préparer les concours EOPAN, EOPN et ALAT",
    description:
      "La référence francophone pour préparer les concours de pilote militaire français.",
  },
  // Installation en application (PWA) — icône d'écran d'accueil sur iPhone.
  appleWebApp: {
    capable: true,
    title: "PrépaPilote",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d55ad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          {children}
          <Toaster />
          <ServiceWorkerRegistrar />
        </ThemeProvider>
      </body>
    </html>
  );
}

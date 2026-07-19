"use client";

import { useState } from "react";
import { PlayIcon } from "lucide-react";

/**
 * Intégration YouTube respectueuse : facade « clic pour charger ». Tant que
 * l'utilisateur ne lance pas la vidéo, aucun script tiers ni cookie YouTube
 * n'est chargé (meilleure performance et vie privée). Au clic, on injecte
 * l'iframe officielle « nocookie ». Aucune image copiée n'est hébergée : la
 * miniature réelle apparaît via le lecteur officiel une fois lancé.
 */
export function YoutubeEmbed({ youtubeId, title }: { youtubeId: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="bg-muted relative aspect-video overflow-hidden rounded-xl border">
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group focus-visible:ring-ring bg-elevated relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border focus-visible:ring-2 focus-visible:outline-none"
      aria-label={`Lire la vidéo : ${title}`}
    >
      {/* Facade neutre (aucune image copiée) : dégradé sobre + bouton lecture. */}
      <span
        aria-hidden
        className="from-primary/10 absolute inset-0 bg-gradient-to-br to-transparent"
      />
      <span className="bg-primary text-primary-foreground relative flex size-16 items-center justify-center rounded-full shadow-lg transition-transform group-hover:scale-110">
        <PlayIcon aria-hidden className="size-7 translate-x-0.5" fill="currentColor" />
      </span>
      <span className="text-muted-foreground absolute right-4 bottom-3 left-4 text-sm">
        Lancer la vidéo sur YouTube
      </span>
    </button>
  );
}

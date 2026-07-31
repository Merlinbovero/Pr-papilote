import { notFound } from "next/navigation";
import {
  PlancheCartouche,
  PlancheEncadre,
  PlancheLegende,
  PlancheMarge,
  PlanchePied,
  PlancheRoot,
  PlancheSection,
  PlancheTop,
} from "@/features/design-lab/planche";
import { PlancheMarkdown } from "@/features/design-lab/planche-markdown";
import { getCourseBySlug } from "@/lib/content/cours";
import { getFicheById } from "@/lib/content/fiches";

const COURS_SLUG = "couche-limite-et-decrochage";
const FICHE_ID = "fondamentaux.aerodynamique.la-couche-limite";

/**
 * Prototype — La Leçon.
 *
 * Contenu réel : le cours et la fiche sont chargés par les chargeurs de
 * production, sans copie ni adaptation. Ce que la page teste : marge large,
 * repères alignés sur les sections, justure, notes et références, schéma,
 * lecture longue.
 */
export default function LeconPlanchePage() {
  const cours = getCourseBySlug(COURS_SLUG);
  const fiche = getFicheById(FICHE_ID);
  if (!cours || !fiche) {
    notFound();
  }

  const sections = fiche.content.sections;

  return (
    <PlancheRoot marginMode="wide" module="bistre">
      <PlancheTop actif="/design-lab/planche/lecon" />
      <PlancheCartouche>FOND · B.3.07 — rév. {fiche.verifiedAt} — Fondamentaux</PlancheCartouche>

      <div className="pl-page">
        <PlancheMarge cote="FOND B.3.07" revision={fiche.verifiedAt} module="Fondamentaux" />

        <div className="pl-corps">
          <p className="pl-sur">Aérodynamique</p>
          <h1 className="pl-titre">{cours.title}</h1>
          <div className="pl-ft" />
          <p className="pl-chapo">{cours.description}</p>

          {sections.map((section, index) => (
            <section key={section.id} aria-labelledby={section.id}>
              <PlancheSection numero={index + 1} id={section.id}>
                {section.title}
              </PlancheSection>
              <PlancheMarkdown>{section.body}</PlancheMarkdown>

              {/* Le schéma vient après le § 2, là où la leçon parle des
                  deux régimes. Trait d'encre unique, repères numérotés. */}
              {index === 1 ? (
                <figure className="pl-planche">
                  <div className="pl-fig">
                    <svg
                      viewBox="0 0 480 130"
                      role="img"
                      aria-label="Profil d'aile avec la couche limite : bord d'attaque, point de transition, décollement"
                    >
                      <path
                        d="M20 90 C 90 52, 210 46, 330 66 C 380 74, 420 84, 460 90 C 400 98, 200 102, 20 90 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M22 72 C 110 40, 240 36, 356 54"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeDasharray="4 3"
                      />
                      <path
                        d="M24 52 C 130 24, 262 20, 402 42"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      {[
                        [44, 102, "1"],
                        [200, 26, "2"],
                        [392, 66, "3"],
                      ].map(([cx, cy, n]) => (
                        <g key={n}>
                          <circle
                            cx={cx}
                            cy={cy}
                            r="9"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                          />
                          <text
                            x={cx}
                            y={Number(cy) + 4}
                            textAnchor="middle"
                            fontSize="9"
                            fill="currentColor"
                            fontFamily="var(--pl-mono)"
                          >
                            {n}
                          </text>
                        </g>
                      ))}
                    </svg>
                  </div>
                  <PlancheLegende planche="PL. 04">
                    Transition laminaire-turbulent et décollement. Schéma PrépaPilote, tracé pour ce
                    prototype.
                  </PlancheLegende>
                  <ol className="pl-reperes-fig">
                    <li>
                      <span className="pl-num">1</span>bord d&rsquo;attaque
                    </li>
                    <li>
                      <span className="pl-num">2</span>point de transition
                    </li>
                    <li>
                      <span className="pl-num">3</span>décollement
                    </li>
                  </ol>
                </figure>
              ) : null}
            </section>
          ))}

          {fiche.content.pieges.length > 0 ? (
            <PlancheEncadre libelle="Piège" variante="piege">
              <p>{fiche.content.pieges[0]}</p>
            </PlancheEncadre>
          ) : null}

          <p className="pl-sortie">
            → <strong>{cours.questions.length} questions</strong> portent sur cette leçon
          </p>

          <PlanchePied
            verifie={fiche.verifiedAt}
            sources={fiche.sources.length}
            revision={fiche.version}
          />
        </div>

        <aside className="pl-annexe">
          <p className="pl-an-h">Dans cette leçon</p>
          <nav className="pl-toc" aria-label="Sommaire de la leçon">
            {sections.map((section, index) => (
              <a key={section.id} href={`#${section.id}`}>
                {index + 1} · {section.title}
              </a>
            ))}
          </nav>

          <p className="pl-an-h">Repères</p>
          <div className="pl-an-row">
            <span>Durée estimée</span>
            <span className="pl-num">{cours.dureeEstimeeMin} min</span>
          </div>
          <div className="pl-an-row">
            <span>Niveau</span>
            <span className="pl-num">{cours.niveau}</span>
          </div>
          <div className="pl-an-row">
            <span>Questions</span>
            <span className="pl-num">{cours.questions.length}</span>
          </div>

          <p className="pl-an-h">Sources</p>
          <ol className="pl-srcs">
            {fiche.sources.map((source, index) => (
              <li key={source.url}>
                <span className="pl-num">{index + 1}</span>
                <span>{source.title}</span>
              </li>
            ))}
          </ol>
          <p className="pl-an-note">
            Chaque source porte sa date de consultation dans le contenu. Une affirmation sans source
            n&rsquo;est pas publiable.
          </p>
        </aside>
      </div>
    </PlancheRoot>
  );
}

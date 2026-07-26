import {
  MANCHE_PERIOD_S,
  mancheTarget,
  PALONNIER_DWELL_MS,
  SECPIL_LEVELS,
  SECPIL_MODES,
  SECPIL_NUMBER_OFF_MS,
  SECPIL_NUMBER_ON_MS,
} from "@/lib/psychotech/secpil";

/**
 * Tutoriel du SECPIL — affiché sur l'écran de sélection, il disparaît pendant
 * la session. Les figures sont tracées à partir des MÊMES fonctions que le
 * simulateur (`mancheTarget`, constantes de cadence) : elles ne peuvent donc
 * pas se désynchroniser de l'entraîneur réel.
 */

// Repère commun aux trois figures.
const W = 210;
const H = 116;
const CX = W / 2;

// --- Figure 1 : le « 8 » -----------------------------------------------------
const EIGHT_CY = 58;
const EIGHT_RX = 62;
const EIGHT_RY = 40;
const projX = (x: number) => CX + x * EIGHT_RX;
const projY = (y: number) => EIGHT_CY - y * EIGHT_RY;

/** Tracé du « 8 », dérivé de la trajectoire réelle du simulateur. */
const EIGHT_PATH = (() => {
  const points: string[] = [];
  const N = 120;
  for (let i = 0; i <= N; i += 1) {
    const elapsed = (i / N) * MANCHE_PERIOD_S * 1000;
    const { x, y } = mancheTarget(elapsed);
    points.push(`${projX(x).toFixed(1)},${projY(y).toFixed(1)}`);
  }
  return "M" + points.join(" L");
})();

/** Position d'exemple de la cible, prise sur la trajectoire réelle. */
const SAMPLE = mancheTarget(MANCHE_PERIOD_S * 1000 * 0.085);

function EightFigure() {
  const tx = projX(SAMPLE.x);
  const ty = projY(SAMPLE.y);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="presentation" aria-hidden>
      <path
        d={EIGHT_PATH}
        className="stroke-muted-foreground/50 fill-none"
        strokeWidth={1}
        strokeDasharray="0.5 3.5"
        strokeLinecap="round"
      />
      {/* La cible que l'on poursuit */}
      <circle cx={tx} cy={ty} r={5} className="fill-destructive" />
      {/* Le curseur du joueur, légèrement en retard sur la cible */}
      <g transform={`translate(${tx - 13} ${ty + 9})`}>
        <circle r={3} className="stroke-foreground fill-none" strokeWidth={1.2} />
        <line x1={-9} y1={0} x2={9} y2={0} className="stroke-foreground" strokeWidth={1} />
        <line x1={0} y1={-9} x2={0} y2={9} className="stroke-foreground" strokeWidth={1} />
      </g>
      <text x={CX} y={H - 4} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        souris ou doigt
      </text>
    </svg>
  );
}

// --- Figure 2 : le palonnier -------------------------------------------------
const BAND_Y = 46;
const BAND_R = 86;

function RudderFigure() {
  const dotX = CX + 0.5 * BAND_R;
  const squareX = CX - 0.25 * BAND_R;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="presentation" aria-hidden>
      <line
        x1={CX - BAND_R}
        y1={BAND_Y}
        x2={CX + BAND_R}
        y2={BAND_Y}
        className="stroke-muted-foreground/25"
        strokeWidth={1}
      />
      {/* Le point à rejoindre */}
      <circle cx={dotX} cy={BAND_Y} r={4} className="fill-foreground" />
      {/* Le carré que l'on déplace */}
      <g transform={`translate(${squareX} ${BAND_Y})`}>
        <rect
          x={-8}
          y={-8}
          width={16}
          height={16}
          className="stroke-destructive fill-none"
          strokeWidth={1.5}
        />
        <line x1={0} y1={-8} x2={0} y2={8} className="stroke-destructive" strokeWidth={1} />
        <line x1={-8} y1={0} x2={8} y2={0} className="stroke-destructive" strokeWidth={1} />
      </g>
      {/* Sens du déplacement à faire */}
      <path
        d={`M ${squareX + 12} ${BAND_Y} L ${dotX - 9} ${BAND_Y}`}
        className="stroke-muted-foreground/60"
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <text x={CX} y={H - 26} textAnchor="middle" className="fill-muted-foreground" fontSize={10}>
        ◀ ▶
      </text>
      <text x={CX} y={H - 8} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        flèches du clavier
      </text>
    </svg>
  );
}

// --- Figure 3 : le calcul ----------------------------------------------------
const ON_S = SECPIL_NUMBER_ON_MS / 1000;
const OFF_S = SECPIL_NUMBER_OFF_MS / 1000;

function MathFigure() {
  const barY = 74;
  const barH = 9;
  const total = W - 32;
  const onW = (total * ON_S) / (ON_S + OFF_S);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="presentation" aria-hidden>
      <text x={CX} y={46} textAnchor="middle" className="fill-warning font-bold" fontSize={34}>
        7
      </text>
      <rect x={16} y={barY} width={onW} height={barH} rx={2} className="fill-warning/70" />
      <rect
        x={16 + onW}
        y={barY}
        width={total - onW}
        height={barH}
        rx={2}
        className="fill-muted-foreground/25"
      />
      <text
        x={16 + onW / 2}
        y={barY + barH + 11}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={8}
      >
        affiché {ON_S} s
      </text>
      <text
        x={16 + onW + (total - onW) / 2}
        y={barY + barH + 11}
        textAnchor="middle"
        className="fill-muted-foreground"
        fontSize={8}
      >
        masqué {OFF_S} s
      </text>
      <text x={CX} y={H - 4} textAnchor="middle" className="fill-muted-foreground" fontSize={9}>
        on additionne au fur et à mesure
      </text>
    </svg>
  );
}

// --- Le tutoriel -------------------------------------------------------------

const TASKS = [
  {
    title: "Le manche — suivre le « 8 »",
    figure: <EightFigure />,
    body: (
      <>
        Un point rouge parcourt un « 8 » à vitesse constante ({MANCHE_PERIOD_S} s le tour). Gardez
        votre curseur dessus, à la souris ou au doigt.{" "}
        <strong>N’essayez pas de le rattraper</strong> quand il vous échappe : anticipez la courbe
        suivante, et il revient à vous.
      </>
    ),
  },
  {
    title: "Le palonnier — poser le carré sur le point",
    figure: <RudderFigure />,
    body: (
      <>
        En haut de l’écran, un point apparaît à une position au hasard et y reste{" "}
        {PALONNIER_DWELL_MS / 1000} s avant de réapparaître ailleurs. Amenez le carré dessus avec
        les <strong>flèches ◀ ▶</strong> (ou les boutons tactiles). C’est la tâche la moins
        exigeante : traitez-la <strong>entre deux courbes</strong> du « 8 ».
      </>
    ),
  },
  {
    title: "Le calcul — additionner en continu",
    figure: <MathFigure />,
    body: (
      <>
        Un nombre s’affiche {ON_S} s, disparaît {OFF_S} s, puis le suivant arrive. Ajoutez-le à
        votre total au moment où vous le voyez. À chaque point de contrôle, le jeu{" "}
        <strong>se met en pause</strong> et un pavé numérique vous demande la somme courante — le
        temps d’arrêt ne compte pas dans la précision du suivi.
      </>
    ),
  },
];

export function SecpilTutorial() {
  return (
    <section className="bg-card rounded-2xl border p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold tracking-tight">Comment ça marche</h2>
      <p className="text-muted-foreground mt-2 max-w-prose text-sm">
        Le SECPIL n’évalue pas votre habileté sur une tâche, mais votre capacité à en mener{" "}
        <strong>trois de front</strong> sans en abandonner aucune. Voici ces trois tâches, telles
        qu’elles apparaissent à l’écran.
      </p>

      <ul className="mt-5 grid gap-5 sm:grid-cols-3">
        {TASKS.map((task) => (
          <li key={task.title} className="space-y-2">
            <div className="bg-muted/30 rounded-lg border p-2">{task.figure}</div>
            <p className="text-sm font-semibold">{task.title}</p>
            <p className="text-muted-foreground text-sm">{task.body}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold">Monter en charge, pas se noyer</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Les {SECPIL_MODES.length} modes ci-dessous ajoutent les tâches une à une, du palonnier
            seul à l’épreuve complète. Ne passez au suivant que lorsque le précédent vous semble
            confortable : c’est le passage de deux à trois tâches qui se travaille, pas chaque tâche
            isolément.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Puis durcir le calcul</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Une fois les nombres présents, les {SECPIL_LEVELS.length} niveaux règlent <em>quand</em>{" "}
            la somme est demandée et <em>quelle taille</em> ont les nombres. Au niveau le plus haut,
            plus aucun point de contrôle ne vient vous relancer : la somme n’est demandée qu’à la
            fin, il faut la tenir seul de bout en bout.
          </p>
        </div>
      </div>

      <div className="border-primary/30 bg-primary/5 mt-6 rounded-lg border p-4">
        <p className="text-sm font-semibold">La règle qui fait la différence</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Sous charge, on a le réflexe de se concentrer sur la tâche qu’on rate — et on lâche les
          deux autres. L’attendu est l’inverse : <strong>dégrader un peu partout</strong> plutôt que
          d’abandonner une tâche. Balayez à rythme régulier, acceptez d’être imparfait sur le « 8 »
          le temps de placer le palonnier, et revenez.
        </p>
      </div>
    </section>
  );
}

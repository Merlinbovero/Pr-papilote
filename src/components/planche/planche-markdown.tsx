import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Rendu Markdown sous la charte PLANCHE — promu du prototype au lot M6b,
 * à son premier usage sur une route publique.
 *
 * Même bibliothèque et même greffon que le rendu historique
 * (`@/components/content/markdown`) : le Markdown est interprété exactement
 * pareil, seule l'habillage change. La typographie n'est pas déclarée ici, elle
 * vient des sélecteurs `.pl-corps` — c'est-à-dire des jetons PLANCHE.
 *
 * Deux comportements sont repris **à l'identique** du rendu historique, parce
 * qu'ils ne relèvent pas du graphisme :
 *  - les tableaux défilent dans leur propre conteneur, jamais la page ;
 *  - un lien externe s'ouvre dans un nouvel onglet avec `rel` complet.
 *
 * Les titres internes au Markdown restent des intertitres de corps : ils ne
 * prennent pas le repère de marge, réservé aux sections du document.
 */
export function PlancheMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        table: (props) => (
          <div style={{ overflowX: "auto" }}>
            <table className="pl-tab" {...props} />
          </div>
        ),
        h3: (props) => <h3 className="pl-sec" {...props} />,
        h4: (props) => <h4 className="pl-sec" {...props} />,
        a: ({ href, ...props }) => (
          <a
            href={href}
            {...(href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            {...props}
          />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

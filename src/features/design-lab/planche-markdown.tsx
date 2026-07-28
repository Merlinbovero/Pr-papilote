import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Rendu Markdown du prototype PLANCHE.
 *
 * Même bibliothèque que la production (`react-markdown` + GFM), mais aucun
 * style de production : la typographie vient des sélecteurs `.pl-corps`,
 * donc des jetons PLANCHE de portée locale. Les tableaux défilent dans leur
 * propre conteneur — jamais la page.
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
        // Les titres internes au Markdown restent des intertitres de corps :
        // ils ne prennent pas le repère de marge, réservé aux sections.
        h3: (props) => <h3 className="pl-sec" {...props} />,
        h4: (props) => <h4 className="pl-sec" {...props} />,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

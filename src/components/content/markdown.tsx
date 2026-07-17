import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Rendu du Markdown de contenu (corps des fiches, GFM : tableaux,
 * listes). Serveur pur. Styles conformes au design system ; les
 * tableaux défilent dans leur propre conteneur (jamais la page).
 */
export function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: (props) => <p className="leading-7" {...props} />,
        strong: (props) => <strong className="text-foreground font-semibold" {...props} />,
        h3: (props) => (
          <h3 className="mt-6 text-lg font-semibold tracking-tight first:mt-0" {...props} />
        ),
        h4: (props) => <h4 className="mt-4 font-semibold first:mt-0" {...props} />,
        hr: (props) => <hr className="border-border my-6" {...props} />,
        ul: (props) => <ul className="list-disc space-y-1 pl-5 leading-7" {...props} />,
        ol: (props) => <ol className="list-decimal space-y-1 pl-5 leading-7" {...props} />,
        a: ({ href, ...props }) => (
          <a
            href={href}
            className="text-primary underline-offset-4 hover:underline"
            {...(href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            {...props}
          />
        ),
        table: (props) => (
          <div className="overflow-x-auto">
            <table className="w-full border text-sm" {...props} />
          </div>
        ),
        th: (props) => (
          <th
            className="text-muted-foreground border-b px-3 py-1.5 text-left font-medium"
            {...props}
          />
        ),
        td: (props) => <td className="border-b px-3 py-1.5" {...props} />,
        blockquote: (props) => (
          <blockquote className="text-muted-foreground border-l-2 pl-4 italic" {...props} />
        ),
        code: (props) => (
          <code className="bg-muted rounded px-1 py-0.5 font-mono text-sm" {...props} />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

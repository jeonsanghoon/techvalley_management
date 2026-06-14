import type { ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { MermaidDiagram } from "./MermaidDiagram";

type Props = { content: string };

export function MarkdownContent({ content }: Props) {
  return (
    <article className="prose-doc max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          code({ className, children, ...props }) {
            const text = String(children).replace(/\n$/, "");
            if (className === "language-mermaid") {
              return <MermaidDiagram chart={text} />;
            }
            const match = /language-(\w+)/.exec(className ?? "");
            if (match) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre({ children }) {
            const child = children as ReactElement<{ className?: string }>;
            if (child?.props?.className === "language-mermaid") {
              return <>{children}</>;
            }
            return <pre>{children}</pre>;
          },
          table({ children }) {
            return (
              <div className="table-scroll -mx-4 my-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <table>{children}</table>
              </div>
            );
          },
          a({ href, children, ...props }) {
            const isExternal = href?.startsWith("http");
            return (
              <a
                href={href}
                {...props}
                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}

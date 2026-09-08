import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './CodeBlock';

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && !String(children).includes('\n');

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded text-[13.5px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700/60"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                language={match ? match[1] : undefined}
                code={String(children).replace(/\n$/, '')}
              />
            );
          },
          p({ children }) {
            return <p className="mb-3.5 last:mb-0 text-neutral-900 dark:text-neutral-100">{children}</p>;
          },
          h1({ children }) {
            return (
              <h1 className="text-xl font-bold mt-5 mb-3 text-neutral-950 dark:text-white border-b border-neutral-200 dark:border-neutral-800 pb-1.5">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="text-lg font-bold mt-4 mb-2.5 text-neutral-950 dark:text-white">
                {children}
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="text-base font-semibold mt-3.5 mb-2 text-neutral-900 dark:text-neutral-100">
                {children}
              </h3>
            );
          },
          ul({ children }) {
            return <ul className="list-disc pl-5 mb-3.5 space-y-1 text-neutral-800 dark:text-neutral-200">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="list-decimal pl-5 mb-3.5 space-y-1 text-neutral-800 dark:text-neutral-200">{children}</ol>;
          },
          li({ children }) {
            return <li className="pl-1">{children}</li>;
          },
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-4 my-3 text-neutral-600 dark:text-neutral-400 italic">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4 rounded border border-neutral-200 dark:border-neutral-800">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-neutral-50 dark:bg-neutral-900">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-950">{children}</tbody>;
          },
          th({ children }) {
            return (
              <th className="px-3.5 py-2.5 text-left font-semibold text-neutral-900 dark:text-neutral-100">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="px-3.5 py-2 text-neutral-700 dark:text-neutral-300">
                {children}
              </td>
            );
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium text-neutral-900 dark:text-neutral-100 underline underline-offset-4 decoration-neutral-400 hover:decoration-neutral-900 dark:hover:decoration-white transition-colors"
              >
                {children}
              </a>
            );
          },
          hr() {
            return <hr className="my-5 border-neutral-200 dark:border-neutral-800" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

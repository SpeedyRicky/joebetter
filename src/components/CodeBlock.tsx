import { useState } from 'react';
import { Check, Copy, Play, Code2, ExternalLink } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  const handleOpenInGretCode = () => {
    const detail = {
      code,
      language: language || 'typescript',
      filename: language === 'html' ? 'index.html' : language === 'css' ? 'style.css' : 'App.tsx',
    };
    window.dispatchEvent(new CustomEvent('open-in-gret-code', { detail }));
    window.dispatchEvent(new CustomEvent('open-in-joe-code', { detail }));
  };

  const displayLanguage = language ? language.toLowerCase() : 'text';
  const isPreviewable =
    displayLanguage === 'html' ||
    displayLanguage === 'svg' ||
    displayLanguage === 'jsx' ||
    displayLanguage === 'tsx' ||
    displayLanguage === 'js' ||
    displayLanguage === 'javascript' ||
    code.includes('<svg') ||
    code.includes('<!DOCTYPE') ||
    code.includes('<div') ||
    code.includes('<button');

  const getPreviewSrcDoc = () => {
    if (displayLanguage === 'svg' || code.trim().startsWith('<svg')) {
      return `<!DOCTYPE html><html><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#171717;">${code}</body></html>`;
    }

    if (code.includes('<!DOCTYPE') || code.includes('<html')) {
      return code;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; background: #ffffff; color: #171717; }
    @media (prefers-color-scheme: dark) {
      body { background: #0a0a0a; color: #ededed; }
    }
  </style>
</head>
<body>
  ${code}
</body>
</html>`;
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 dark:bg-black text-neutral-100 shadow-sm">
      {/* Code Header with Claude-style Artifact Tabs */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-neutral-800/90 dark:bg-neutral-900/90 border-b border-neutral-700/50 dark:border-neutral-800 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wider font-semibold text-neutral-300">
            {displayLanguage}
          </span>
          {isPreviewable && (
            <div className="flex items-center rounded-lg bg-neutral-950/60 p-0.5 border border-neutral-700/40 text-[11px]">
              <button
                type="button"
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition ${
                  viewMode === 'code'
                    ? 'bg-neutral-700 text-white font-medium'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span>Code</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition ${
                  viewMode === 'preview'
                    ? 'bg-neutral-100 text-neutral-950 font-medium'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Play className="w-3 h-3" />
                <span>Artifact</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleOpenInGretCode}
            title="Open in Gret Code IDE"
            className="flex items-center gap-1 px-2 py-1 rounded transition-colors text-neutral-300 hover:text-white hover:bg-neutral-700/60 dark:hover:bg-neutral-800 cursor-pointer text-[11px]"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open in IDE</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            aria-label={copied ? 'Copied code to clipboard' : 'Copy code to clipboard'}
            className="flex items-center gap-1 px-2 py-1 rounded transition-colors text-neutral-300 hover:text-white hover:bg-neutral-700/60 dark:hover:bg-neutral-800 cursor-pointer text-[11px]"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-neutral-200" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Content or Live Interactive Artifact Preview */}
      {viewMode === 'preview' && isPreviewable ? (
        <div className="bg-white dark:bg-neutral-950 min-h-[260px] max-h-[500px] overflow-hidden flex flex-col">
          <iframe
            title="Artifact Preview"
            sandbox="allow-scripts allow-modals"
            srcDoc={getPreviewSrcDoc()}
            className="w-full h-72 border-0 bg-white dark:bg-neutral-900"
          />
        </div>
      ) : (
        <div className="p-4 overflow-x-auto text-[13.5px] leading-relaxed font-mono">
          <pre className="m-0 whitespace-pre">
            <code>{code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

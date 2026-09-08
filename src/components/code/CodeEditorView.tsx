import { useEffect, useRef, useState, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import { Copy, Check, WrapText } from 'lucide-react';

interface CodeEditorViewProps {
  code: string;
  language: string;
  onChange: (newCode: string) => void;
  readOnly?: boolean;
}

export function CodeEditorView({
  code,
  language,
  onChange,
  readOnly = false,
}: CodeEditorViewProps) {
  const [wordWrap, setWordWrap] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const lines = useMemo(() => code.split('\n'), [code]);

  // Determine Prism grammar language
  const prismLang = useMemo(() => {
    const l = language.toLowerCase();
    if (l === 'html' || l === 'xml') return 'html';
    if (l === 'javascript' || l === 'js') return 'javascript';
    if (l === 'typescript' || l === 'ts') return 'typescript';
    if (l === 'tsx' || l === 'jsx') return 'jsx';
    if (l === 'css') return 'css';
    if (l === 'json') return 'json';
    return 'javascript';
  }, [language]);

  // Synchronize scroll between textarea and syntax highlight pre layer
  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = ta.value;
      const nextVal = val.substring(0, start) + '  ' + val.substring(end);
      onChange(nextVal);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const highlightedHtml = useMemo(() => {
    try {
      const grammar = Prism.languages[prismLang] || Prism.languages.javascript;
      return Prism.highlight(code, grammar, prismLang);
    } catch {
      return code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }, [code, prismLang]);

  return (
    <div className="relative flex flex-col h-full w-full bg-neutral-950 text-neutral-100 font-mono text-[13px] overflow-hidden select-text">
      {/* Editor Sub-Header Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-800 bg-neutral-900/90 text-xs text-neutral-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium uppercase px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
            {language}
          </span>
          <span className="text-[11px] text-neutral-500">{lines.length} lines</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setWordWrap(!wordWrap)}
            title={wordWrap ? 'Disable wrap' : 'Enable wrap'}
            className={`p-1.5 rounded hover:text-white transition cursor-pointer ${
              wordWrap ? 'bg-neutral-800 text-white' : 'text-neutral-400'
            }`}
          >
            <WrapText className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCopy}
            title={copied ? 'Copied' : 'Copy file'}
            className="p-1.5 rounded hover:text-white text-neutral-400 hover:bg-neutral-800 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Body with Gutter and Overlay */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Line Numbers Gutter */}
        <div className="w-12 shrink-0 py-3 bg-neutral-950/80 border-r border-neutral-850 select-none text-right pr-3 text-[12px] text-neutral-600 font-mono overflow-hidden">
          {lines.map((_, idx) => (
            <div key={idx} className="leading-[21px] h-[21px]">
              {idx + 1}
            </div>
          ))}
        </div>

        {/* Code Canvas Container */}
        <div className="relative flex-1 h-full overflow-hidden">
          {/* Syntax Highlighted Underlay */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className={`absolute inset-0 m-0 py-3 px-4 font-mono text-[13px] leading-[21px] pointer-events-none overflow-hidden ${
              wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
            }`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />

          {/* Transparent Input Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className={`absolute inset-0 m-0 py-3 px-4 font-mono text-[13px] leading-[21px] bg-transparent text-transparent caret-white resize-none outline-hidden border-none overflow-auto z-10 selection:bg-neutral-700/60 ${
              wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
            }`}
          />
        </div>
      </div>
    </div>
  );
}

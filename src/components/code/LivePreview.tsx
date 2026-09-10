import { useState, useEffect, useRef, useMemo } from 'react';
import {
  RotateCw,
  Monitor,
  Tablet,
  Smartphone,
  Terminal,
  ExternalLink,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { CodeFile } from '../../types';

interface LivePreviewProps {
  files: CodeFile[];
}

interface ConsoleMsg {
  id: string;
  type: 'log' | 'warn' | 'error' | 'info';
  text: string;
  timestamp: string;
}

export function LivePreview({ files }: LivePreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [logs, setLogs] = useState<ConsoleMsg[]>([]);
  const [reloadKey, setReloadKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Bundle files together into a runnable HTML document
  const srcDoc = useMemo(() => {
    const htmlFile = files.find((f) => f.name.endsWith('.html')) || files[0];
    const cssFiles = files.filter((f) => f.name.endsWith('.css'));
    const jsFiles = files.filter((f) => f.name.endsWith('.js') || f.name.endsWith('.ts'));

    let html = htmlFile?.content || '<html><body><h1 style="color:white;font-family:sans-serif;">Craig Code Sandbox</h1></body></html>';

    // Intercept console.log script to be injected into iframe
    const consoleInterceptorScript = `
<script>
  (function() {
    function sendLog(type, args) {
      try {
        const text = Array.from(args).map(a => {
          if (typeof a === 'object') {
            try { return JSON.stringify(a); } catch(e) { return String(a); }
          }
          return String(a);
        }).join(' ');
        window.parent.postMessage({ type: 'SANDBOX_CONSOLE', level: type, text: text }, '*');
      } catch(e) {}
    }
    const origLog = console.log;
    const origWarn = console.warn;
    const origErr = console.error;
    console.log = function() { origLog.apply(console, arguments); sendLog('log', arguments); };
    console.warn = function() { origWarn.apply(console, arguments); sendLog('warn', arguments); };
    console.error = function() { origErr.apply(console, arguments); sendLog('error', arguments); };
    window.onerror = function(msg, url, line) {
      sendLog('error', ['[Uncaught] ' + msg + ' (' + line + ')']);
    };
  })();
</script>
`;

    // Inject styles
    const inlinedCss = cssFiles
      .map((css) => `<style data-filename="${css.name}">\n${css.content}\n</style>`)
      .join('\n');

    // Inject scripts
    const inlinedJs = jsFiles
      .map((js) => `<script data-filename="${js.name}">\n${js.content}\n</script>`)
      .join('\n');

    // Replace external link tags or append
    let modifiedHtml = html;
    cssFiles.forEach((css) => {
      const linkRegex = new RegExp(`<link[^>]*href=["']${css.name}["'][^>]*>`, 'gi');
      modifiedHtml = modifiedHtml.replace(linkRegex, '');
    });

    jsFiles.forEach((js) => {
      const scriptRegex = new RegExp(`<script[^>]*src=["']${js.name}["'][^>]*>\\s*<\\/script>`, 'gi');
      modifiedHtml = modifiedHtml.replace(scriptRegex, '');
    });

    if (modifiedHtml.includes('</head>')) {
      modifiedHtml = modifiedHtml.replace('</head>', `${consoleInterceptorScript}\n${inlinedCss}\n</head>`);
    } else {
      modifiedHtml = `${consoleInterceptorScript}\n${inlinedCss}\n${modifiedHtml}`;
    }

    if (modifiedHtml.includes('</body>')) {
      modifiedHtml = modifiedHtml.replace('</body>', `${inlinedJs}\n</body>`);
    } else {
      modifiedHtml = `${modifiedHtml}\n${inlinedJs}`;
    }

    return modifiedHtml;
  }, [files, reloadKey]);

  // Listen for iframe console messages
  useEffect(() => {
    const handleMsg = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SANDBOX_CONSOLE') {
        const newMsg: ConsoleMsg = {
          id: Math.random().toString(36).slice(2, 9),
          type: event.data.level || 'log',
          text: event.data.text || '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        setLogs((prev) => [...prev.slice(-99), newMsg]);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const widthStyle = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[375px]',
  }[device];

  const handleOpenNewTab = () => {
    const blob = new Blob([srcDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 border-l border-neutral-850 overflow-hidden select-none">
      {/* Browser Mockup Top Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-950 text-xs text-neutral-400 shrink-0">
        {/* URL Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-sm mr-2">
          <button
            onClick={() => {
              setLogs([]);
              setReloadKey((k) => k + 1);
            }}
            title="Reload preview"
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 px-2.5 py-1 rounded-md bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 truncate flex items-center justify-between">
            <span className="truncate">localhost:3000/app</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 ml-1.5" />
          </div>
        </div>

        {/* Viewport Toggles & Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDevice('desktop')}
            title="Desktop view"
            className={`p-1.5 rounded transition cursor-pointer ${
              device === 'desktop' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            title="Tablet view"
            className={`p-1.5 rounded transition cursor-pointer ${
              device === 'tablet' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            title="Mobile view"
            className={`p-1.5 rounded transition cursor-pointer ${
              device === 'mobile' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-3.5 bg-neutral-800 mx-1" />

          {/* Console Drawer Toggle */}
          <button
            onClick={() => setConsoleOpen(!consoleOpen)}
            title="Toggle Console logs"
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition cursor-pointer ${
              consoleOpen || logs.length > 0
                ? 'bg-neutral-800 text-neutral-200'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono">{logs.length}</span>
          </button>

          <button
            onClick={handleOpenNewTab}
            title="Open in new window"
            className="p-1.5 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 bg-neutral-950/60 overflow-auto">
        <div
          className={`h-full ${widthStyle} transition-all duration-300 rounded-xl overflow-hidden border border-neutral-800 shadow-2xl bg-white`}
        >
          <iframe
            key={reloadKey}
            ref={iframeRef}
            srcDoc={srcDoc}
            title="Craig Code Sandbox Preview"
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            className="w-full h-full border-none"
          />
        </div>
      </div>

      {/* Interactive Collapsible Console Drawer */}
      {consoleOpen && (
        <div className="h-44 border-t border-neutral-800 bg-neutral-950 font-mono text-xs text-neutral-300 flex flex-col shrink-0 select-text">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-neutral-850 bg-neutral-900/60 text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-semibold text-[11px]">Sandbox Console</span>
              <span className="text-[10px] text-neutral-500">({logs.length} logs)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLogs([])}
                title="Clear console"
                className="text-neutral-500 hover:text-neutral-300 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[11px]">
            {logs.length === 0 ? (
              <div className="text-neutral-600 italic px-2 py-1">No console output recorded yet.</div>
            ) : (
              logs.map((l) => (
                <div
                  key={l.id}
                  className={`flex items-start gap-2 px-1.5 py-0.5 rounded ${
                    l.type === 'error'
                      ? 'bg-red-950/40 text-red-300 border-l-2 border-red-500'
                      : l.type === 'warn'
                      ? 'bg-amber-950/40 text-amber-300 border-l-2 border-amber-500'
                      : 'text-neutral-300 hover:bg-neutral-900/50'
                  }`}
                >
                  <span className="text-neutral-600 select-none text-[10px] mt-0.5">{l.timestamp}</span>
                  {l.type === 'error' ? (
                    <AlertCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                  ) : l.type === 'warn' ? (
                    <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500/60 shrink-0 mt-0.5" />
                  )}
                  <span className="break-all whitespace-pre-wrap flex-1">{l.text}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

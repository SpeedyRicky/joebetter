import { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  User,
  AlertCircle,
  Download,
  ExternalLink,
  Film,
  Maximize2,
  X,
  Volume2,
  VolumeX,
  Brain,
  ChevronDown,
  ChevronRight,
  Globe,
  FileText,
  FileCode,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Message, MediaAttachment } from '../types';
import { MarkdownContent } from './MarkdownContent';

interface ChatMessageProps {
  message: Message;
  isLatestAssistant?: boolean;
  isStreaming?: boolean;
  showTimestamps?: boolean;
  onRegenerate?: () => void;
  onRate?: (rating: 'like' | 'dislike') => void;
  onEditPrompt?: (messageId: string, newContent: string, submitAndRegenerate: boolean) => void;
  onDeletePrompt?: (messageId: string) => void;
}

export function ChatMessage({
  message,
  isLatestAssistant = false,
  isStreaming = false,
  showTimestamps = true,
  onRegenerate,
  onRate,
  onEditPrompt,
  onDeletePrompt,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [userPromptCopied, setUserPromptCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(message.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThoughtOpen, setIsThoughtOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const isUser = message.role === 'user';

  // Stop speech synthesis if component unmounts
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      // Copy main content without raw internal thought tags
      const cleanText = message.content.replace(/<thought>[\s\S]*?<\/thought>/g, '').trim();
      await navigator.clipboard.writeText(cleanText || message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleToggleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = message.content
      .replace(/<thought>[\s\S]*?<\/thought>/g, '')
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setUserPromptCopied(true);
      setTimeout(() => setUserPromptCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  // Extract thinking process if present (Deep Reasoning mode)
  const thoughtMatch = message.content.match(/<thought>([\s\S]*?)(?:<\/thought>|$)/);
  const thoughtContent = message.thoughtProcess || (thoughtMatch ? thoughtMatch[1].trim() : null);
  const displayContent = message.content.replace(/<thought>[\s\S]*?(?:<\/thought>|$)/g, '').trim();

  // User Message
  if (isUser) {
    return (
      <div className="group w-full py-3 px-4 sm:px-6 flex justify-end animate-fade-in">
        <div className={`flex flex-col items-end transition-all ${isEditing ? 'w-full max-w-3xl' : 'max-w-[85%] md:max-w-[75%]'}`}>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-neutral-400">
            {showTimestamps && <span>{formattedTime}</span>}
            <span className="font-medium text-neutral-700 dark:text-neutral-300">You</span>
            <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 text-[10px]">
              <User className="w-3 h-3" />
            </div>
          </div>

          <div className={`w-full px-4 py-3 rounded-2xl rounded-tr-xs bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 text-[15px] leading-relaxed space-y-2.5 ${isEditing ? 'ring-2 ring-neutral-400 dark:ring-neutral-600' : ''}`}>
            {/* User attached media & files */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1 pb-1">
                {message.attachments.map((att: MediaAttachment) => (
                  <div key={att.id} className="relative rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-700">
                    {att.type === 'image' ? (
                      <img
                        src={att.url}
                        alt={att.name}
                        onClick={() => setPreviewImage(att.url)}
                        className="max-h-48 rounded-lg object-contain cursor-pointer hover:opacity-90 transition"
                      />
                    ) : att.type === 'video' ? (
                      <div className="p-2 rounded-lg bg-black/40">
                        <video
                          src={att.url}
                          controls
                          className="max-h-48 rounded-lg"
                        />
                        <div className="text-[11px] font-mono mt-1 text-neutral-300 truncate max-w-[200px]">
                          {att.name}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-neutral-200/70 dark:bg-neutral-800/80 flex items-center gap-2 text-xs">
                        {att.type === 'code' ? (
                          <FileCode className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                        ) : (
                          <FileText className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                        )}
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate max-w-[180px]">
                            {att.name}
                          </div>
                          <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                            {Math.round(att.size / 1024)} KB • Attached file
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isEditing ? (
              <div className="space-y-2.5 pt-1">
                <textarea
                  value={editDraft}
                  onChange={(e) => setEditDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsEditing(false);
                      setEditDraft(message.content);
                    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      if (editDraft.trim()) {
                        onEditPrompt?.(message.id, editDraft.trim(), true);
                        setIsEditing(false);
                      }
                    }
                  }}
                  rows={Math.max(2, editDraft.split('\n').length)}
                  className="w-full min-h-[72px] p-3 text-[14.5px] rounded-xl bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-500 dark:focus:ring-neutral-400 resize-y leading-relaxed"
                  autoFocus
                  placeholder="Edit your prompt..."
                />
                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    Esc to cancel • Ctrl + Enter to submit
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditDraft(message.content);
                      }}
                      className="px-3 py-1.5 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition cursor-pointer font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (editDraft.trim()) {
                          onEditPrompt?.(message.id, editDraft.trim(), false);
                          setIsEditing(false);
                        }
                      }}
                      title="Save text in place without regenerating"
                      className="px-3 py-1.5 rounded-lg text-neutral-700 dark:text-neutral-200 bg-neutral-200/80 dark:bg-neutral-800 hover:bg-neutral-300/80 dark:hover:bg-neutral-700 transition cursor-pointer font-medium"
                    >
                      Save Only
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (editDraft.trim()) {
                          onEditPrompt?.(message.id, editDraft.trim(), true);
                          setIsEditing(false);
                        }
                      }}
                      title="Save prompt and regenerate response"
                      className="px-3.5 py-1.5 rounded-lg text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white transition cursor-pointer font-medium shadow-xs"
                    >
                      Save & Submit
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              message.content && <div className="whitespace-pre-wrap">{message.content}</div>
            )}
          </div>

          {/* Action Bar for User Prompt (Copy, Edit, Delete) */}
          {!isEditing && (
            <div className="flex items-center gap-1.5 mt-1.5 text-neutral-500 dark:text-neutral-400 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              {showDeleteConfirm ? (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs animate-fade-in">
                  <span className="font-medium">Delete prompt?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onDeletePrompt?.(message.id);
                      setShowDeleteConfirm(false);
                    }}
                    className="font-semibold underline hover:text-red-700 dark:hover:text-red-300 cursor-pointer"
                  >
                    Yes, delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer ml-1"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    title={userPromptCopied ? 'Copied prompt!' : 'Copy prompt'}
                    aria-label="Copy prompt"
                    className="flex items-center gap-1 px-2 py-1 rounded-md hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer text-xs"
                  >
                    {userPromptCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-neutral-100" />
                        <span className="text-neutral-900 dark:text-neutral-100 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {onEditPrompt && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditDraft(message.content);
                        setIsEditing(true);
                      }}
                      title="Edit prompt"
                      aria-label="Edit prompt"
                      className="flex items-center gap-1 px-2 py-1 rounded-md hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer text-xs"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  )}

                  {onDeletePrompt && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      title="Delete prompt"
                      aria-label="Delete prompt"
                      className="flex items-center gap-1 px-2 py-1 rounded-md hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal preview */}
        {previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={previewImage}
                alt="Enlarged preview"
                className="max-w-full max-h-[90vh] object-contain rounded-xl"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Assistant Message (Joe)
  return (
    <div className="group w-full py-5 px-4 sm:px-6 bg-white dark:bg-black/40 border-y border-neutral-100 dark:border-neutral-900/60 transition-colors">
      <div className="max-w-3xl mx-auto flex items-start gap-3.5">
        {/* Joe Avatar */}
        <div className="w-7 h-7 shrink-0 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 flex items-center justify-center shadow-xs mt-0.5 font-bold text-xs select-none">
          J
        </div>

        {/* Content & Action Container */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">
                Joe
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/60 font-medium">
                {message.mode === 'deep-think'
                  ? 'Deep Reasoner'
                  : message.mode === 'claude-code'
                  ? 'Claude Code Engine'
                  : message.mode === 'web-search'
                  ? 'Live Web Grounded'
                  : 'AI Assistant'}
              </span>
              {showTimestamps && (
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  {formattedTime}
                </span>
              )}
            </div>

            {/* Speaking State Pill */}
            {isSpeaking && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-[10px] font-medium border border-neutral-300 dark:border-neutral-700 animate-pulse">
                <Volume2 className="w-3 h-3 text-neutral-700 dark:text-neutral-300" />
                <span>Speaking...</span>
              </div>
            )}
          </div>

          {/* Collapsible Deep Reasoning Thinking Process (like Claude 3.7 & ChatGPT o1) */}
          {thoughtContent && (
            <div className="mb-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/50 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setIsThoughtOpen(!isThoughtOpen)}
                className="w-full flex items-center justify-between px-3.5 py-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    Thinking Process (Zero-Mistake Verification)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                  <span>{isThoughtOpen ? 'Hide' : 'Show breakdown'}</span>
                  {isThoughtOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              </button>
              {isThoughtOpen && (
                <div className="px-3.5 py-2.5 border-t border-neutral-200/80 dark:border-neutral-800/80 font-mono text-[11.5px] leading-relaxed text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap bg-neutral-100/50 dark:bg-neutral-950/50">
                  {thoughtContent}
                </div>
              )}
            </div>
          )}

          {/* Generated Media Card if generated by Joe */}
          {message.generatedMedia && (
            <div className="mb-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 overflow-hidden shadow-xs">
              {message.generatedMedia.type === 'image' ? (
                <div>
                  <div className="relative group/media">
                    <img
                      src={message.generatedMedia.url}
                      alt={message.generatedMedia.prompt}
                      referrerPolicy="no-referrer"
                      className="w-full max-h-[440px] object-cover rounded-t-xl"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover/media:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPreviewImage(message.generatedMedia?.url || null)}
                        className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-black/90 transition shadow-xs cursor-pointer"
                        title="Expand image"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <a
                        href={message.generatedMedia.url}
                        target="_blank"
                        rel="noreferrer"
                        download="joe-generated-image.jpg"
                        className="p-1.5 rounded-lg bg-black/70 text-white hover:bg-black/90 transition shadow-xs"
                        title="Download image"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                  <div className="p-3 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
                    <div className="truncate pr-2 italic">"{message.generatedMedia.prompt}"</div>
                    <span className="text-[10px] shrink-0 font-medium uppercase tracking-wider text-neutral-400">
                      Generated Art
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2 font-medium text-xs text-neutral-900 dark:text-neutral-100">
                    <Film className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                    <span>{message.generatedMedia.title || 'Generated Video Clip'}</span>
                  </div>
                  <video
                    src={message.generatedMedia.url}
                    controls
                    playsInline
                    className="w-full max-h-[380px] rounded-lg bg-black shadow-inner"
                  />
                  <div className="mt-2 text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
                    <span className="italic truncate pr-2">"{message.generatedMedia.prompt}"</span>
                    <a
                      href={message.generatedMedia.url}
                      target="_blank"
                      rel="noreferrer"
                      download="joe-video.mp4"
                      className="inline-flex items-center gap-1 text-[11px] text-neutral-700 dark:text-neutral-300 hover:underline shrink-0"
                    >
                      <Download className="w-3 h-3" /> Download MP4
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message Text Content */}
          {message.isError ? (
            <div className="flex items-start gap-2.5 p-3.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-neutral-600 dark:text-neutral-400" />
              <div className="flex-1">
                <p className="font-medium mb-1">Response could not be completed</p>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                  {message.content}
                </p>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Try again</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="relative">
              <MarkdownContent content={displayContent || (isStreaming ? '...' : '')} />
              {isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 align-middle bg-neutral-900 dark:bg-white animate-pulse" />
              )}
            </div>
          )}

          {/* Web Search Grounding Citations (like ChatGPT & Perplexity) */}
          {message.groundingSources && message.groundingSources.length > 0 && (
            <div className="mt-3.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Live Grounded Sources ({message.groundingSources.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {message.groundingSources.map((source, i) => (
                  <a
                    key={i}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs transition border border-neutral-200 dark:border-neutral-700/60"
                  >
                    <ExternalLink className="w-2.5 h-2.5 text-neutral-400" />
                    <span className="truncate max-w-[200px]">{source.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          {!isStreaming && !message.isError && (
            <div className="flex items-center gap-1 mt-3 pt-2 text-neutral-400 dark:text-neutral-500 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                title={copied ? 'Copied' : 'Copy response'}
                aria-label={copied ? 'Copied response' : 'Copy response'}
                className="p-1.5 rounded hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Text-to-Speech Voice Button (ChatGPT Voice style) */}
              <button
                onClick={handleToggleSpeak}
                title={isSpeaking ? 'Stop speaking' : 'Read aloud with Joe Voice'}
                aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  isSpeaking
                    ? 'text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-900'
                    : 'hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {isLatestAssistant && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  title="Regenerate response"
                  aria-label="Regenerate response"
                  className="p-1.5 rounded hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              )}

              {onRate && (
                <>
                  <button
                    onClick={() => onRate('like')}
                    title="Good response"
                    aria-label="Good response"
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      message.rating === 'like'
                        ? 'text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-900'
                        : 'hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRate('dislike')}
                    title="Poor response"
                    aria-label="Poor response"
                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                      message.rating === 'dislike'
                        ? 'text-neutral-950 dark:text-white bg-neutral-100 dark:bg-neutral-900'
                        : 'hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox modal for full size preview */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="relative max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage}
              alt="Enlarged preview"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-neutral-800"
            />
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <a
                href={previewImage}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white transition"
                title="Open original"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-white transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import {
  ArrowUp,
  Square,
  FolderUp,
  Image as ImageIcon,
  Film,
  X,
  Sparkles,
  Wand2,
  Mic,
  MicOff,
  Brain,
  Globe,
  Code2,
  Zap,
  Briefcase,
  Activity,
  ChevronDown,
  FileCode,
  FileText,
} from 'lucide-react';
import { MediaAttachment, AIMode } from '../types';
import { getUploadStatus, recordFileUploads } from '../utils/fileLimit';
import { enhancePrompt } from '../services/geminiService';

interface ChatComposerProps {
  onSendMessage: (text: string, attachments?: MediaAttachment[], mode?: AIMode) => void;
  onGenerateImage?: (prompt: string) => void;
  onGenerateVideo?: (prompt: string) => void;
  onStopGeneration?: () => void;
  isGenerating?: boolean;
  disabled?: boolean;
  enterToSend?: boolean;
  activeMode?: AIMode;
  onModeChange?: (mode: AIMode) => void;
}

export function ChatComposer({
  onSendMessage,
  onGenerateImage,
  onGenerateVideo,
  onStopGeneration,
  isGenerating = false,
  disabled = false,
  enterToSend = true,
  activeMode = 'standard',
  onModeChange,
}: ChatComposerProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [isHoveringFolder, setIsHoveringFolder] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const [showGenerateMenu, setShowGenerateMenu] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentMode, setCurrentMode] = useState<AIMode>(activeMode);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setCurrentMode(activeMode);
  }, [activeMode]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const newHeight = Math.min(el.scrollHeight, 180);
    el.style.height = `${Math.max(48, newHeight)}px`;
  }, [text]);

  // Voice speech-to-text dictation cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const uploadStatus = getUploadStatus();

  const handleSelectMode = (mode: AIMode) => {
    setCurrentMode(mode);
    onModeChange?.(mode);
    setShowModeMenu(false);
  };

  const handleToggleVoice = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      setLimitWarning('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecording(false);
      return;
    }

    try {
      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setText((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      rec.onerror = (e: any) => {
        setIsRecording(false);
        const errType = e?.error;
        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          setLimitWarning('Microphone access was blocked or denied. Please grant microphone permission in your browser settings.');
        } else if (errType === 'network') {
          setLimitWarning('Voice recognition network connection issue. Please check your internet connection.');
        } else if (errType && errType !== 'no-speech' && errType !== 'aborted') {
          setLimitWarning('Voice recognition unavailable: ' + errType);
        }
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.start();
      recognitionRef.current = rec;
      setIsRecording(true);
    } catch (err: any) {
      setIsRecording(false);
      setLimitWarning('Unable to access microphone. Please check browser microphone permissions.');
    }
  };

  const handleEnhancePrompt = async () => {
    const trimmed = text.trim();
    if (!trimmed || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const optimized = await enhancePrompt(trimmed, currentMode);
      if (optimized && optimized !== trimmed) {
        setText(optimized);
      }
    } catch (err) {
      console.error('Failed to enhance prompt', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setLimitWarning(null);

    const currentStatus = getUploadStatus();
    if (currentStatus.isLimitReached) {
      setLimitWarning('You can add up to 6 files a day. You have reached your limit today.');
      return;
    }

    const filesToProcess = Array.from(fileList);
    if (filesToProcess.length > currentStatus.remaining) {
      setLimitWarning(
        `You can only add ${currentStatus.remaining} more file${currentStatus.remaining === 1 ? '' : 's'} today (6 files/day limit).`
      );
    }

    const allowedFiles = filesToProcess.slice(0, currentStatus.remaining);
    const newAttachments: MediaAttachment[] = [];

    for (const file of allowedFiles) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isCodeOrText =
        file.type.startsWith('text/') ||
        /\.(ts|tsx|js|jsx|py|html|css|json|md|txt|csv|pdf|sql|rs|go|java|cpp|c|sh|yaml|yml)$/i.test(
          file.name
        );

      if (file.size > 25 * 1024 * 1024) {
        setLimitWarning(`File "${file.name}" exceeds the 25MB limit.`);
        continue;
      }

      if (isImage || isVideo) {
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string) || '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });

        if (dataUrl) {
          newAttachments.push({
            id: 'att_' + Math.random().toString(36).slice(2, 9),
            type: isImage ? 'image' : 'video',
            name: file.name,
            size: file.size,
            url: dataUrl,
            mimeType: file.type || (isImage ? 'image/jpeg' : 'video/mp4'),
          });
        }
      } else if (isCodeOrText) {
        const reader = new FileReader();
        const textContent = await new Promise<string>((resolve) => {
          reader.onload = () => resolve((reader.result as string) || '');
          reader.onerror = () => resolve('');
          reader.readAsText(file);
        });

        const isCode = /\.(ts|tsx|js|jsx|py|html|css|json|sql|rs|go|java|cpp|c|sh)$/i.test(
          file.name
        );

        newAttachments.push({
          id: 'att_' + Math.random().toString(36).slice(2, 9),
          type: isCode ? 'code' : 'document',
          name: file.name,
          size: file.size,
          url: `data:text/plain;charset=utf-8,${encodeURIComponent(textContent.slice(0, 100000))}`,
          mimeType: file.type || 'text/plain',
          textContent: textContent.slice(0, 100000),
        });
      }

    }

    if (newAttachments.length > 0) {
      recordFileUploads(newAttachments.length);
      setAttachments((prev) => [...prev, ...newAttachments]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = () => {
    if (isGenerating && onStopGeneration) {
      onStopGeneration();
      return;
    }
    const trimmed = text.trim();
    if ((!trimmed && attachments.length === 0) || disabled) return;

    onSendMessage(trimmed, attachments.length > 0 ? attachments : undefined, currentMode);
    setText('');
    setAttachments([]);
    setLimitWarning(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && enterToSend) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickImage = () => {
    const query = text.trim() || 'A high-definition minimalist aesthetic landscape at dawn';
    if (onGenerateImage) {
      onGenerateImage(query);
      setText('');
      setShowGenerateMenu(false);
    }
  };

  const handleQuickVideo = () => {
    const query = text.trim() || 'Cinematic drone shot flying through a mountain valley';
    if (onGenerateVideo) {
      onGenerateVideo(query);
      setText('');
      setShowGenerateMenu(false);
    }
  };

  const getModeLabel = (mode: AIMode) => {
    switch (mode) {
      case 'deep-think':
        return { label: 'Deep Reasoner', icon: Brain, color: 'text-neutral-900 dark:text-white' };
      case 'claude-code':
        return { label: 'Claude Code', icon: Code2, color: 'text-neutral-900 dark:text-white' };
      case 'web-search':
        return { label: 'Live Web', icon: Globe, color: 'text-neutral-900 dark:text-white' };
      case 'crm':
        return { label: 'CRM Mode', icon: Briefcase, color: 'text-neutral-900 dark:text-white' };
      case 'health':
        return { label: 'Health Mode', icon: Activity, color: 'text-neutral-900 dark:text-white' };
      default:
        return { label: 'Standard', icon: Zap, color: 'text-neutral-700 dark:text-neutral-300' };
    }
  };

  const ActiveModeConfig = getModeLabel(currentMode);
  const ModeIcon = ActiveModeConfig.icon;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 sm:pb-6 pt-2">
      {/* Limit Warning banner if any */}
      {limitWarning && (
        <div className="mb-2 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 text-xs flex items-center justify-between">
          <span>{limitWarning}</span>
          <button
            onClick={() => setLimitWarning(null)}
            className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mode Switcher Bar */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowModeMenu(!showModeMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700/80 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 transition cursor-pointer"
          >
            <ModeIcon className="w-3.5 h-3.5" />
            <span>Mode: {ActiveModeConfig.label}</span>
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {showModeMenu && (
            <div className="absolute left-0 bottom-full mb-2 z-30 w-64 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl p-1.5 animate-fade-in text-xs">
              <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Select Intelligence Mode
              </div>
              <button
                type="button"
                onClick={() => handleSelectMode('standard')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition cursor-pointer ${
                  currentMode === 'standard'
                    ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <Zap className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <div>
                  <div>Standard (Ultra Fast)</div>
                  <div className="text-[10px] text-neutral-400 font-normal">
                    Instant responses for everyday questions
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('deep-think')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition cursor-pointer ${
                  currentMode === 'deep-think'
                    ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <Brain className="w-4 h-4 text-neutral-900 dark:text-neutral-100" />
                <div>
                  <div>Deep Reasoner (Zero Mistake)</div>
                  <div className="text-[10px] text-neutral-400 font-normal">
                    Full verification & chain-of-thought logic
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('claude-code')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition cursor-pointer ${
                  currentMode === 'claude-code'
                    ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <Code2 className="w-4 h-4 text-neutral-900 dark:text-neutral-100" />
                <div>
                  <div>Claude Code Engine</div>
                  <div className="text-[10px] text-neutral-400 font-normal">
                    Full-stack coding, refactoring & debugging
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('web-search')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition cursor-pointer ${
                  currentMode === 'web-search'
                    ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <Globe className="w-4 h-4 text-neutral-900 dark:text-neutral-100" />
                <div>
                  <div>Live Web Search</div>
                  <div className="text-[10px] text-neutral-400 font-normal">
                    Google Grounded real-time news & citations
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('crm')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition cursor-pointer ${
                  currentMode === 'crm'
                    ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <Briefcase className="w-4 h-4 text-neutral-900 dark:text-neutral-100" />
                <div>
                  <div>CRM & Sales Mode</div>
                  <div className="text-[10px] text-neutral-400 font-normal">
                    Lead qualification, deal pipelines & follow-ups
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectMode('health')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition cursor-pointer ${
                  currentMode === 'health'
                    ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <Activity className="w-4 h-4 text-neutral-900 dark:text-neutral-100" />
                <div>
                  <div>Health & Fitness Mode</div>
                  <div className="text-[10px] text-neutral-400 font-normal">
                    Workouts, nutrition, sleep & recovery habits
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Prompt Enhancer ("Make it Perfect") Button */}
        {text.trim().length > 3 && (
          <button
            type="button"
            onClick={handleEnhancePrompt}
            disabled={isEnhancing}
            title="Enhance prompt to get a flawless, zero-mistake response"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition cursor-pointer border border-neutral-200 dark:border-neutral-700/80"
          >
            <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
            <span>{isEnhancing ? 'Perfecting...' : 'Make it Perfect'}</span>
          </button>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`relative flex flex-col rounded-2xl border transition-all ${
          isDragOver
            ? 'border-neutral-900 dark:border-white bg-neutral-100/60 dark:bg-neutral-800/60 ring-2 ring-neutral-400'
            : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs focus-within:border-neutral-400 dark:focus-within:border-neutral-600'
        }`}
      >
        {/* Drag Overlay Hint */}
        {isDragOver && (
          <div className="absolute inset-0 z-20 rounded-2xl bg-white/90 dark:bg-neutral-900/90 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
            <FolderUp className="w-8 h-8 text-neutral-900 dark:text-white mb-2 animate-bounce" />
            <div className="text-sm font-semibold text-neutral-900 dark:text-white">
              Drop files to attach
            </div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Supports images, videos, documents & code files ({uploadStatus.remaining} left today)
            </div>
          </div>
        )}

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex items-center gap-2 p-3 pb-1 overflow-x-auto border-b border-neutral-100 dark:border-neutral-800/60">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="relative group shrink-0 flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-800 dark:text-neutral-200"
              >
                {att.type === 'image' ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    className="w-9 h-9 object-cover rounded-lg border border-neutral-300 dark:border-neutral-600"
                  />
                ) : att.type === 'video' ? (
                  <div className="w-9 h-9 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    <Film className="w-4 h-4 text-neutral-700 dark:text-neutral-200" />
                  </div>
                ) : att.type === 'code' ? (
                  <div className="w-9 h-9 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    <FileCode className="w-4 h-4 text-neutral-700 dark:text-neutral-200" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-neutral-700 dark:text-neutral-200" />
                  </div>
                )}
                <div className="max-w-[120px]">
                  <div className="truncate font-medium text-[11px]">{att.name}</div>
                  <div className="text-[10px] text-neutral-400">
                    {Math.round(att.size / 1024)} KB
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(att.id)}
                  title="Remove attachment"
                  className="w-4 h-4 rounded-full bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500 flex items-center justify-center text-neutral-800 dark:text-neutral-100 transition cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Hidden File Input (supports images, videos, code, documents) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,text/*,.ts,.tsx,.js,.jsx,.py,.html,.css,.json,.md,.txt,.csv,.pdf,.sql"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Gret anything, type numbers like 1, signs like @, or paste code..."
          rows={1}
          disabled={disabled}
          className="w-full resize-none bg-transparent px-4 pt-3.5 pb-12 text-[15px] leading-relaxed text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-hidden disabled:opacity-50"
        />

        {/* Action Bottom Row */}
        <div className="absolute left-3 bottom-2.5 flex items-center gap-1.5">
          {/* Folder Attachment Button with Hover Tooltip */}
          <div className="relative">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={() => setIsHoveringFolder(true)}
              onMouseLeave={() => setIsHoveringFolder(false)}
              title="Attach image, video, code, or document"
              aria-label="Attach file"
              disabled={disabled || uploadStatus.isLimitReached}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-xs ${
                uploadStatus.isLimitReached
                  ? 'border-neutral-200 dark:border-neutral-800 text-neutral-400 opacity-50 cursor-not-allowed'
                  : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <FolderUp className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px] font-medium">Attach</span>
            </button>

            {/* Prominent Hover Notification: "You can add 6 files a day" */}
            {isHoveringFolder && (
              <div className="absolute left-0 bottom-full mb-2 z-30 px-3 py-1.5 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium whitespace-nowrap shadow-lg animate-fade-in pointer-events-none flex items-center gap-1.5 border border-neutral-800 dark:border-neutral-200">
                <FolderUp className="w-3.5 h-3.5 shrink-0" />
                <span>You can add 6 files a day ({uploadStatus.remaining} left today)</span>
              </div>
            )}
          </div>

          {/* Quick Create Button (Image / Video) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowGenerateMenu(!showGenerateMenu)}
              title="Create images or videos"
              aria-label="Create media"
              className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1 text-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px] font-medium">Create</span>
            </button>

            {/* Quick Create Dropdown */}
            {showGenerateMenu && (
              <div className="absolute left-0 bottom-full mb-2 z-30 w-48 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl p-1 animate-fade-in">
                <button
                  type="button"
                  onClick={handleQuickImage}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  <div>
                    <div className="font-semibold">Generate Image</div>
                    <div className="text-[10px] text-neutral-400">Create custom artwork</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleQuickVideo}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left cursor-pointer"
                >
                  <Film className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                  <div>
                    <div className="font-semibold">Generate Video</div>
                    <div className="text-[10px] text-neutral-400">Cinematic motion clip</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Voice Speech-to-Text Input (ChatGPT Voice Dictation) */}
          <button
            type="button"
            onClick={handleToggleVoice}
            title={isRecording ? 'Stop voice listening' : 'Voice dictation'}
            aria-label="Voice input"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-xs ${
              isRecording
                ? 'border-red-500 bg-red-500/10 text-red-500 animate-pulse'
                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* Right Action: Send / Stop */}
        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-2">
          {isGenerating ? (
            <button
              onClick={onStopGeneration}
              type="button"
              title="Stop response"
              aria-label="Stop response"
              className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center hover:opacity-90 active:scale-95 transition cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={(!text.trim() && attachments.length === 0) || disabled}
              type="button"
              title="Send to Gret"
              aria-label="Send message"
              className="w-8 h-8 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 transition cursor-pointer"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* Subtext info */}
      <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-neutral-400 dark:text-neutral-500">
        <span>
          {enterToSend ? 'Enter to send • Shift + Enter for newline' : 'Shift + Enter to send'}
        </span>
        <span className="flex items-center gap-1.5">
          <span>Gret AI</span>
          <span>•</span>
          <span>Zero-Mistake Architecture</span>
        </span>
      </div>
    </div>
  );
}

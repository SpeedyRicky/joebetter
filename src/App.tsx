import { useState, useEffect, useRef } from 'react';
import {
  Conversation,
  Message,
  AppSettings,
  ThemeMode,
  AppSection,
  DEFAULT_SETTINGS,
  AVAILABLE_MODELS,
  MediaAttachment,
  AIMode,
} from './types';
import {
  loadConversations,
  saveConversations,
  loadActiveConversationId,
  saveActiveConversationId,
  loadSettings,
  saveSettings,
  createNewConversation,
  generateId,
} from './utils/storage';
import { getStoredTheme, setStoredTheme, applyTheme } from './utils/theme';
import {
  streamChatMessage,
  generateConversationTitle,
  generateImage,
  generateVideo,
} from './services/geminiService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatComposer } from './components/ChatComposer';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SettingsModal } from './components/SettingsModal';
import { JoeCodeWorkspace } from './components/code/JoeCodeWorkspace';
import { JoeChessArena } from './components/chess/JoeChessArena';

export default function App() {
  const [section, setSection] = useState<AppSection>('chat');
  const [currentMode, setCurrentMode] = useState<AIMode>('standard');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for open-in-joe-code and open-in-joe-chess events
  useEffect(() => {
    const handleOpenInJoeCodeEvent = () => {
      setSection('code');
    };
    const handleOpenInJoeChessEvent = () => {
      setSection('chess');
    };
    window.addEventListener('open-in-joe-code', handleOpenInJoeCodeEvent);
    window.addEventListener('open-in-joe-chess', handleOpenInJoeChessEvent);
    return () => {
      window.removeEventListener('open-in-joe-code', handleOpenInJoeCodeEvent);
      window.removeEventListener('open-in-joe-chess', handleOpenInJoeChessEvent);
    };
  }, []);

  // Initialize theme, settings, and conversations
  useEffect(() => {
    const savedTheme = getStoredTheme();
    applyTheme(savedTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => {
      const current = getStoredTheme();
      if (current === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleThemeChange);

    const initialSettings = loadSettings();
    setSettings(initialSettings);

    const savedConversations = loadConversations();
    const savedActiveId = loadActiveConversationId();

    if (savedConversations.length > 0) {
      setConversations(savedConversations);
      const exists = savedConversations.some((c) => c.id === savedActiveId);
      setActiveId(exists ? savedActiveId : savedConversations[0].id);
    } else {
      const initialConv = createNewConversation();
      setConversations([initialConv]);
      setActiveId(initialConv.id);
      saveConversations([initialConv]);
      saveActiveConversationId(initialConv.id);
    }

    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }

    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  // Save conversations whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      saveConversations(conversations);
    }
  }, [conversations]);

  // Save active conversation id
  useEffect(() => {
    saveActiveConversationId(activeId);
  }, [activeId]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  useEffect(() => {
    scrollToBottom('auto');
  }, [activeId]);

  useEffect(() => {
    if (isGenerating) {
      scrollToBottom('smooth');
    }
  }, [activeConversation?.messages, isGenerating]);

  // Keyboard shortcut listener: Cmd/Ctrl + K for new chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversations]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setStoredTheme(newTheme);
    setSettings((prev) => {
      const updated = { ...prev, theme: newTheme };
      saveSettings(updated);
      return updated;
    });
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
    if (newSettings.theme !== settings.theme) {
      handleThemeChange(newSettings.theme);
    }
  };

  const handleNewChat = () => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    const newConv = createNewConversation();
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
  };

  const handleSelectConversation = (id: string) => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    setActiveId(id);
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const fresh = createNewConversation();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (activeId === id) {
        setActiveId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleClearAllData = () => {
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
    const fresh = createNewConversation();
    setConversations([fresh]);
    setActiveId(fresh.id);
    saveConversations([fresh]);
    saveActiveConversationId(fresh.id);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  // Image Generation Handler
  const handleGenerateImage = async (prompt: string) => {
    if (!activeId) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    const assistantMessageId = generateId();
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: 'Generating your image with Craig AI visual engine...',
      timestamp: Date.now(),
    };

    const currentConv = conversations.find((c) => c.id === activeId);
    const existingMessages = currentConv?.messages || [];
    const isFirstTurn = existingMessages.length === 0;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [...existingMessages, userMessage, assistantPlaceholder],
              updatedAt: Date.now(),
            }
          : c
      )
    );

    setIsGenerating(true);

    try {
      const result = await generateImage(prompt);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    content: `Here is the artwork I created for you: **"${result.prompt}"**`,
                    generatedMedia: {
                      type: 'image',
                      url: result.url,
                      prompt: result.prompt,
                    },
                  }
                : m
            ),
          };
        })
      );

      if (isFirstTurn) {
        handleRenameConversation(activeId, 'Generated Art: ' + prompt.slice(0, 20));
      }
    } catch (err: any) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    content: err.message || 'Failed to generate image. Please try again.',
                    isError: true,
                  }
                : m
            ),
          };
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Video Generation Handler
  const handleGenerateVideo = async (prompt: string) => {
    if (!activeId) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    const assistantMessageId = generateId();
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: 'Directing and rendering cinematic video clip with Craig AI motion engine...',
      timestamp: Date.now(),
    };

    const currentConv = conversations.find((c) => c.id === activeId);
    const existingMessages = currentConv?.messages || [];
    const isFirstTurn = existingMessages.length === 0;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [...existingMessages, userMessage, assistantPlaceholder],
              updatedAt: Date.now(),
            }
          : c
      )
    );

    setIsGenerating(true);

    try {
      const result = await generateVideo(prompt);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    content: `Here is your generated video clip: **"${result.title}"**\n\n*Cinematic concept:* ${result.prompt}`,
                    generatedMedia: {
                      type: 'video',
                      url: result.url,
                      prompt: result.prompt,
                      title: result.title,
                    },
                  }
                : m
            ),
          };
        })
      );

      if (isFirstTurn) {
        handleRenameConversation(activeId, result.title || 'Generated Video');
      }
    } catch (err: any) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    content: err.message || 'Failed to generate video. Please try again.',
                    isError: true,
                  }
                : m
            ),
          };
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Main Send Message Handler (handles text, numbers like 1, signs like @, images, videos, code files)
  const handleSendMessage = async (
    text: string,
    attachments?: MediaAttachment[],
    mode?: AIMode
  ) => {
    const activeModeToUse = mode || currentMode;
    if ((!text.trim() && (!attachments || attachments.length === 0)) || !activeId) return;

    // Check if the user explicitly requested image generation without attachments
    const isImageRequest =
      (!attachments || attachments.length === 0) &&
      /^(generate|create|make|draw)\s+(an?\s+)?image\s+(of|with|showing)?/i.test(text.trim());

    if (isImageRequest) {
      const cleanPrompt = text
        .replace(/^(generate|create|make|draw)\s+(an?\s+)?image\s+(of|with|showing)?/i, '')
        .trim();
      handleGenerateImage(cleanPrompt || text.trim());
      return;
    }

    // Check if the user explicitly requested video generation without attachments
    const isVideoRequest =
      (!attachments || attachments.length === 0) &&
      /^(generate|create|make)\s+(an?\s+)?video\s+(of|with|showing)?/i.test(text.trim());

    if (isVideoRequest) {
      const cleanPrompt = text
        .replace(/^(generate|create|make)\s+(an?\s+)?video\s+(of|with|showing)?/i, '')
        .trim();
      handleGenerateVideo(cleanPrompt || text.trim());
      return;
    }

    // Check if user is asking to open Joe Code IDE
    if (/\b(switch to|open|launch|go to)\s+(joe\s+)?code(\s+editor|\s+ide)?\b/i.test(text.trim())) {
      setSection('code');
      return;
    }

    // Check if user is asking to open Joe Chess Arena
    if (/\b(play\s+chess|open\s+chess|launch\s+chess|start\s+chess|go\s+to\s+chess|play\s+against\s+joe\s+chess|chess\s+bot|play\s+with\s+joe\s+in\s+chess)\b/i.test(text.trim())) {
      setSection('chess');
      return;
    }

    // Standard streaming chat with Joe
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
      timestamp: Date.now(),
      mode: activeModeToUse,
    };

    const assistantMessageId = generateId();
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      mode: activeModeToUse,
    };

    const currentConv = conversations.find((c) => c.id === activeId);
    const existingMessages = currentConv?.messages || [];
    const isFirstTurn = existingMessages.length === 0;

    const updatedMessages = [...existingMessages, userMessage, assistantPlaceholder];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : c
      )
    );

    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Include full conversation history with media attachments
    const apiMessages = [...existingMessages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
      attachments: m.attachments,
    }));

    await streamChatMessage({
      messages: apiMessages,
      model: settings.model,
      temperature: settings.temperature,
      systemInstruction: settings.systemInstruction,
      mode: activeModeToUse,
      webSearch: activeModeToUse === 'web-search',
      signal: controller.signal,
      onChunk: (chunk: string) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== activeId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: m.content + chunk }
                  : m
              ),
            };
          })
        );
      },
      onSources: (sources) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== activeId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, groundingSources: sources }
                  : m
              ),
            };
          })
        );
      },
      onError: (err: Error) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== activeId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content: err.message || 'An unexpected error occurred.',
                      isError: true,
                    }
                  : m
              ),
            };
          })
        );
        setIsGenerating(false);
      },
      onComplete: () => {
        setIsGenerating(false);
        abortControllerRef.current = null;

        if (isFirstTurn && text.trim().length > 0) {
          generateConversationTitle(text).then((newTitle) => {
            if (newTitle && newTitle !== 'New Chat') {
              handleRenameConversation(activeId, newTitle);
            }
          });
        }
      },
    });
  };

  // Regenerate Response
  const handleRegenerate = async () => {
    if (!activeConversation || isGenerating) return;

    const msgs = activeConversation.messages;
    if (msgs.length === 0) return;

    let lastUserIndex = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const trimmedHistory = msgs.slice(0, lastUserIndex + 1);

    const assistantMessageId = generateId();
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages: [...trimmedHistory, assistantPlaceholder],
              updatedAt: Date.now(),
            }
          : c
      )
    );

    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const apiMessages = trimmedHistory.map((m) => ({
      role: m.role,
      content: m.content,
      attachments: m.attachments,
    }));

    await streamChatMessage({
      messages: apiMessages,
      model: settings.model,
      temperature: settings.temperature,
      systemInstruction: settings.systemInstruction,
      signal: controller.signal,
      onChunk: (chunk: string) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== activeId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: m.content + chunk }
                  : m
              ),
            };
          })
        );
      },
      onError: (err: Error) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== activeId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content: err.message || 'An error occurred during regeneration.',
                      isError: true,
                    }
                  : m
              ),
            };
          })
        );
        setIsGenerating(false);
      },
      onComplete: () => {
        setIsGenerating(false);
        abortControllerRef.current = null;
      },
    });
  };

  const handleRateMessage = (messageId: string, rating: 'like' | 'dislike') => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c;
        return {
          ...c,
          messages: c.messages.map((m) =>
            m.id === messageId
              ? { ...m, rating: m.rating === rating ? null : rating }
              : m
          ),
        };
      })
    );
  };

  // Edit prompt handler (save in place or save & regenerate)
  const handleEditPrompt = async (
    messageId: string,
    newContent: string,
    submitAndRegenerate: boolean
  ) => {
    if (!activeConversation || !newContent.trim()) return;

    const msgs = activeConversation.messages;
    const msgIndex = msgs.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // If saving in place without regenerating
    if (!submitAndRegenerate) {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, content: newContent } : m
            ),
            updatedAt: Date.now(),
          };
        })
      );
      return;
    }

    // If currently generating, abort current stream
    if (isGenerating && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }

    const updatedUserMessage: Message = {
      ...msgs[msgIndex],
      content: newContent,
    };

    const trimmedHistory = [...msgs.slice(0, msgIndex), updatedUserMessage];

    const assistantMessageId = generateId();
    const activeModeToUse = updatedUserMessage.mode || currentMode;
    const assistantPlaceholder: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      mode: activeModeToUse,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c;
        return {
          ...c,
          messages: [...trimmedHistory, assistantPlaceholder],
          updatedAt: Date.now(),
        };
      })
    );

    // If editing the first turn, also update conversation title
    if (msgIndex === 0) {
      generateConversationTitle(newContent).then((newTitle) => {
        if (newTitle && newTitle !== 'New Chat') {
          handleRenameConversation(activeId!, newTitle);
        }
      });
    }

    setIsGenerating(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const apiMessages = trimmedHistory.map((m) => ({
      role: m.role,
      content: m.content,
      attachments: m.attachments,
    }));

    await streamChatMessage({
      messages: apiMessages,
      model: settings.model,
      temperature: settings.temperature,
      systemInstruction: settings.systemInstruction,
      mode: activeModeToUse,
      webSearch: activeModeToUse === 'web-search',
      signal: controller.signal,
      onChunk: (chunk: string) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== activeId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, content: m.content + chunk }
                  : m
              ),
            };
          })
        );
      },
      onSources: (sources) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== activeId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, groundingSources: sources }
                  : m
              ),
            };
          })
        );
      },
      onError: (err: Error) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== activeId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content: err.message || 'An error occurred during regeneration.',
                      isError: true,
                    }
                  : m
              ),
            };
          })
        );
        setIsGenerating(false);
      },
      onComplete: () => {
        setIsGenerating(false);
        abortControllerRef.current = null;
      },
    });
  };

  // Delete prompt handler (removes user prompt and associated assistant reply)
  const handleDeletePrompt = (messageId: string) => {
    if (!activeConversation) return;

    const msgs = activeConversation.messages;
    const msgIndex = msgs.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) return;

    // If aborting active generation on deleted turn
    if (isGenerating && abortControllerRef.current) {
      if (msgIndex >= msgs.length - 2) {
        abortControllerRef.current.abort();
        setIsGenerating(false);
      }
    }

    const hasSubsequentAssistant =
      msgIndex + 1 < msgs.length && msgs[msgIndex + 1].role === 'assistant';

    const updatedMessages = msgs.filter((_, idx) => {
      if (idx === msgIndex) return false;
      if (hasSubsequentAssistant && idx === msgIndex + 1) return false;
      return true;
    });

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeId) return c;
        return {
          ...c,
          messages: updatedMessages,
          updatedAt: Date.now(),
        };
      })
    );
  };

  const currentModelOption =
    AVAILABLE_MODELS.find((m) => m.id === settings.model) || AVAILABLE_MODELS[0];

  const currentMessages = activeConversation?.messages || [];

  if (section === 'code') {
    return <JoeCodeWorkspace onBackToChat={() => setSection('chat')} />;
  }

  if (section === 'chess') {
    return (
      <JoeChessArena
        onBackToChat={() => setSection('chat')}
        onOpenCode={() => setSection('code')}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-black text-neutral-900 dark:text-neutral-100 antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCodeSection={() => setSection('code')}
        onOpenChessSection={() => setSection('chess')}
        theme={settings.theme}
        onThemeChange={handleThemeChange}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Header
          conversationTitle={activeConversation?.title || 'New Chat'}
          modelName={currentModelOption.name}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewChat={handleNewChat}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCodeSection={() => setSection('code')}
          onOpenChessSection={() => setSection('chess')}
          theme={settings.theme}
          onThemeChange={handleThemeChange}
        />

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          {currentMessages.length === 0 ? (
            <WelcomeScreen
              onSelectPrompt={(prompt) => handleSendMessage(prompt)}
              onGenerateImagePrompt={handleGenerateImage}
              onGenerateVideoPrompt={handleGenerateVideo}
              onOpenCodeSection={() => setSection('code')}
              onOpenChessSection={() => setSection('chess')}
            />
          ) : (
            <div className="flex-1 pb-4">
              {currentMessages.map((msg, idx) => {
                const isLatestAssistant =
                  msg.role === 'assistant' &&
                  idx === currentMessages.length - 1;

                return (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isLatestAssistant={isLatestAssistant}
                    isStreaming={isLatestAssistant && isGenerating}
                    showTimestamps={settings.showTimestamps}
                    onRegenerate={isLatestAssistant ? handleRegenerate : undefined}
                    onRate={(rating) => handleRateMessage(msg.id, rating)}
                    onEditPrompt={handleEditPrompt}
                    onDeletePrompt={handleDeletePrompt}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Chat Composer */}
        <div className="shrink-0 bg-white/90 dark:bg-black/90 backdrop-blur-xs border-t border-neutral-100 dark:border-neutral-900/60">
          <ChatComposer
            onSendMessage={handleSendMessage}
            onGenerateImage={handleGenerateImage}
            onGenerateVideo={handleGenerateVideo}
            onStopGeneration={handleStopGeneration}
            isGenerating={isGenerating}
            enterToSend={settings.enterToSend}
            activeMode={currentMode}
            onModeChange={setCurrentMode}
          />
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onClearAllData={handleClearAllData}
      />
    </div>
  );
}

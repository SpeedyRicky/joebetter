import { Conversation, AppSettings, DEFAULT_SETTINGS } from '../types';

const CONVERSATIONS_KEY = 'gemini_assistant_conversations';
const ACTIVE_CONV_KEY = 'gemini_assistant_active_conv';
const SETTINGS_KEY = 'gemini_assistant_settings';

export function loadConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    return [];
  } catch (err) {
    console.error('Failed to load conversations from localStorage:', err);
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (err) {
    console.warn('Standard localStorage save failed, applying resilient quota management...', err);
    try {
      // Step 1: Prune oversized base64 data from older conversation attachments
      const pruned = conversations.map((conv, idx) => {
        if (idx > 2) {
          // In older conversations, keep text and metadata, trim large embedded base64 URLs
          return {
            ...conv,
            messages: conv.messages.map((m) => ({
              ...m,
              attachments: m.attachments?.map((a) => ({
                ...a,
                url: a.url && a.url.length > 5000 ? '' : a.url,
              })),
            })),
          };
        }
        return conv;
      });
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(pruned));
    } catch {
      try {
        // Step 2: Keep only the most recent 15 conversations if still exceeding quota
        const trimmed = conversations.slice(0, 15);
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(trimmed));
      } catch (finalErr) {
        console.error('Critical localStorage quota exceeded:', finalErr);
      }
    }
  }
}


export function loadActiveConversationId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_CONV_KEY);
}

export function saveActiveConversationId(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem(ACTIVE_CONV_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_CONV_KEY);
  }
}

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const settings = { ...DEFAULT_SETTINGS, ...parsed };
    if (!settings.model || settings.model === 'gemini-3.8-flash' || settings.model === 'gemini-2.5-flash') {
      settings.model = 'gemini-3.6-flash';
    }
    return settings;
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
  }
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function createNewConversation(title = 'New Chat'): Conversation {
  const now = Date.now();
  return {
    id: generateId(),
    title,
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
}

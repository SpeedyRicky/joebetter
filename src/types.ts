export type AttachmentType = 'image' | 'video' | 'document' | 'code';

export interface MediaAttachment {
  id: string;
  type: AttachmentType;
  name: string;
  size: number;
  url: string; // Base64 data URL, text preview, or blob URL
  mimeType: string;
  textContent?: string;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface GeneratedMedia {
  type: 'image' | 'video';
  url: string;
  prompt: string;
  title?: string;
  aspectRatio?: string;
}

export type AIMode = 'standard' | 'deep-think' | 'claude-code' | 'web-search' | 'creative';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  rating?: 'like' | 'dislike' | null;
  isError?: boolean;
  attachments?: MediaAttachment[];
  generatedMedia?: GeneratedMedia;
  thoughtProcess?: string;
  groundingSources?: GroundingSource[];
  mode?: AIMode;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type AppSection = 'chat' | 'code';

export interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
  isDirty?: boolean;
}

export interface CodeProject {
  id: string;
  name: string;
  description?: string;
  files: CodeFile[];
  activeFileId: string;
  createdAt: number;
  updatedAt: number;
}

export interface CodeDiff {
  oldCode: string;
  newCode: string;
  filename: string;
  summary: string;
  highlights: string[];
}

export interface TerminalEntry {
  id: string;
  command: string;
  output: string;
  status: 'success' | 'error' | 'info';
  timestamp: number;
}

export interface TimeTravelSnapshot {
  id: string;
  timestamp: number;
  label: string;
  files: Record<string, string>;
}

export interface AppSettings {
  theme: ThemeMode;
  enterToSend: boolean;
  showTimestamps: boolean;
  model: string;
  temperature: number;
  systemInstruction: string;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Joe Turbo (3.8 Flash)',
    description: 'High capacity, fast, reliable intelligence for all chat, coding, and reasoning tasks.',
    isDefault: true,
  },
  {
    id: 'gemini-3.7-flash',
    name: 'Joe 3.7 Flash',
    description: 'Versatile and fast general-purpose conversational intelligence.',
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Joe 3.6 Flash',
    description: 'Dependable, high-throughput model.',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Joe Lite (Speed)',
    description: 'Ultra-lightweight model for quick conversational queries.',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Joe Pro (Deep Reasoning)',
    description: 'Advanced reasoning engine for complex math, STEM, and architectural tasks.',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  enterToSend: true,
  showTimestamps: true,
  model: 'gemini-3.8-flash',
  temperature: 0.7,
  systemInstruction:
    'You are Joe, a friendly, intelligent, and articulate AI assistant. Greet the user warmly with "Hi, how are you?". You accurately read and process numbers (such as 1, 42, 100), signs and symbols (such as @, #, $, %, &, *, math operators), and analyze images and video attachments. You can also craft creative prompts to generate images and videos. Keep your tone helpful, approachable, and natural.',
};

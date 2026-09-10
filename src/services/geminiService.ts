import { MediaAttachment, AIMode, GroundingSource } from '../types';

export interface StreamChatParams {
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    attachments?: MediaAttachment[];
  }>;
  model?: string;
  temperature?: number;
  systemInstruction?: string;
  mode?: AIMode;
  webSearch?: boolean;
  signal?: AbortSignal;
  onChunk: (textChunk: string) => void;
  onSources?: (sources: GroundingSource[]) => void;
  onError?: (err: Error) => void;
  onComplete?: () => void;
}

export interface HealthResponse {
  status: string;
  hasApiKey: boolean;
  defaultModel: string;
}

export async function checkServerHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    return {
      status: 'error',
      hasApiKey: false,
      defaultModel: 'Gret AI',
    };
  }
}

export async function streamChatMessage({
  messages,
  model,
  temperature,
  systemInstruction,
  mode,
  webSearch,
  signal,
  onChunk,
  onSources,
  onError,
  onComplete,
}: StreamChatParams): Promise<void> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        model,
        temperature,
        systemInstruction,
        mode,
        webSearch,
      }),
      signal,
    });

    if (!response.ok) {
      let errorMsg = `Server error (${response.status})`;
      try {
        const data = await response.json();
        if (data.error) errorMsg = data.error;
      } catch {
        // Fallback to text or status
      }
      throw new Error(errorMsg);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported by response body.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.replace(/^data:\s*/, '');
        if (dataStr === '[DONE]') {
          onComplete?.();
          return;
        }

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.error) {
            onError?.(new Error(parsed.error));
            return;
          }
          if (parsed.text) {
            onChunk(parsed.text);
          }
          if (parsed.sources && Array.isArray(parsed.sources) && onSources) {
            onSources(parsed.sources);
          }
        } catch {
          // Ignore incomplete JSON chunks until buffer completes
        }
      }
    }

    onComplete?.();
  } catch (err: any) {
    if (signal?.aborted) {
      // Stream stopped cleanly by user
      onComplete?.();
      return;
    }
    onError?.(err instanceof Error ? err : new Error(String(err)));
  }
}

export async function enhancePrompt(prompt: string, mode?: string): Promise<string> {
  try {
    const res = await fetch('/api/enhance-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, mode }),
    });
    if (!res.ok) return prompt;
    const data = await res.json();
    return data.enhanced || prompt;
  } catch {
    return prompt;
  }
}

export async function generateConversationTitle(firstMessage: string): Promise<string> {
  try {
    const response = await fetch('/api/title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: firstMessage }),
    });
    if (!response.ok) return 'New Chat';
    const data = await response.json();
    return data.title || 'New Chat';
  } catch {
    return 'New Chat';
  }
}

export async function generateImage(prompt: string): Promise<{ url: string; prompt: string; type: 'image' }> {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to generate image.');
  }

  return response.json();
}

export async function generateVideo(prompt: string): Promise<{ url: string; prompt: string; title: string; type: 'video'; duration: number }> {
  const response = await fetch('/api/generate-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to generate video.');
  }

  return response.json();
}

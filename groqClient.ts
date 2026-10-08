// Groq client using a single API key (GROQ_API_KEY).
//
// When the key hits Groq's daily limit, Gret answers with a friendly "unavailable"
// message instead of an error, without calling Groq again until the limit resets
// (Groq tells us when via the retry-after header). Short per-minute limits get a
// "busy, try again shortly" message instead.

const GROQ_URL = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";

export const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
export const FAST_MODEL = process.env.GROQ_FAST_MODEL || "llama-3.1-8b-instant";
export const VISION_MODEL = process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
export const SEARCH_MODEL = process.env.GROQ_SEARCH_MODEL || "groq/compound-mini";

export const UNAVAILABLE_MESSAGE =
  "Gret is unavailable right now. Today's capacity has been used up. Gret will be back within the next 24 hours, and possibly sooner, so please check back later.";
export const BUSY_MESSAGE = "Gret is busy right now. Please try again in a minute.";

const ONE_MINUTE = 60 * 1000;
const FIVE_MINUTES = 5 * ONE_MINUTE;
const ONE_DAY = 24 * 60 * ONE_MINUTE;

export class GretUnavailableError extends Error {
  constructor(message: string = UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = "GretUnavailableError";
  }
}

const rawKey = (process.env.GROQ_API_KEY || "").trim();
const apiKey = rawKey && !rawKey.startsWith("MY_") ? rawKey : "";

// Time until which the key is known to be over its limit.
let blockedUntil = 0;

export function hasGroqKey(): boolean {
  return apiKey !== "";
}

export function isGretAvailable(): boolean {
  return hasGroqKey() && Date.now() >= blockedUntil;
}

function unavailableError(): GretUnavailableError {
  const remaining = blockedUntil - Date.now();
  return new GretUnavailableError(remaining > FIVE_MINUTES ? UNAVAILABLE_MESSAGE : BUSY_MESSAGE);
}

// Parse Groq durations such as "2.5s", "1m30s", "7h12m5.2s", or plain seconds.
function parseDuration(value: string | null): number | null {
  if (!value) return null;
  const asNumber = Number(value);
  if (!Number.isNaN(asNumber)) return asNumber * 1000;
  let ms = 0;
  const re = /([\d.]+)(ms|h|m|s)/g;
  let match: RegExpExecArray | null;
  let found = false;
  while ((match = re.exec(value))) {
    found = true;
    const n = parseFloat(match[1]);
    ms += match[2] === "h" ? n * 3600000 : match[2] === "m" ? n * 60000 : match[2] === "s" ? n * 1000 : n;
  }
  return found ? ms : null;
}

function cooldownFor429(res: Response, body: string): number {
  const fromHeader = parseDuration(res.headers.get("retry-after"));
  if (fromHeader !== null) return Math.min(Math.max(fromHeader, 1000), ONE_DAY);
  // Daily limits (requests/tokens per day) reset within 24h; per-minute limits within a minute.
  if (/per day|\(RPD\)|\(TPD\)/i.test(body)) return ONE_DAY;
  return ONE_MINUTE;
}

type FailureKind = "rate_limited" | "bad_key" | "model" | "server";

class AttemptError extends Error {
  constructor(public kind: FailureKind, message: string) {
    super(message);
  }
}

async function postToGroq(payload: any, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });
  if (res.ok) return res;

  const body = await res.text().catch(() => "");
  if (res.status === 429) {
    const wait = cooldownFor429(res, body);
    blockedUntil = Date.now() + wait;
    console.warn(`[Groq] rate limited, pausing for ${Math.round(wait / 1000)}s`);
    throw new AttemptError("rate_limited", body);
  }
  if (res.status === 401 || res.status === 403) {
    console.error(`[Groq] API key rejected (${res.status}). Check GROQ_API_KEY.`);
    throw new AttemptError("bad_key", "AI API key is invalid or lacks necessary permissions.");
  }
  if (res.status === 400 || res.status === 404) {
    throw new AttemptError("model", body);
  }
  throw new AttemptError("server", `Groq ${res.status}: ${body}`);
}

// Runs `attempt` with each model in turn until one succeeds.
async function withModelFallback<T>(models: string[], attempt: (model: string) => Promise<T>): Promise<T> {
  if (!hasGroqKey()) throw new Error("AI assistant key is not configured on the server.");
  if (!isGretAvailable()) throw unavailableError();

  const modelList = Array.from(new Set(models.filter(Boolean)));
  let lastError: any = null;

  for (const model of modelList) {
    try {
      return await attempt(model);
    } catch (err: any) {
      lastError = err;
      if (err?.name === "AbortError") throw err;
      if (err instanceof AttemptError && err.kind === "rate_limited") throw unavailableError();
      if (err instanceof AttemptError && err.kind === "bad_key") throw err;
      console.warn(`[Groq] ${model} failed:`, err?.message || err);
      // model or server error: try the next model
    }
  }

  throw lastError || new Error("An unexpected error occurred.");
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: any;
}

export interface CompletionOptions {
  models: string[];
  temperature?: number;
  json?: boolean;
  signal?: AbortSignal;
}

export async function groqComplete(messages: ChatMessage[], opts: CompletionOptions): Promise<string> {
  return withModelFallback(opts.models, async (model) => {
    const res = await postToGroq(
      {
        model,
        messages,
        temperature: opts.temperature ?? 0.7,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      },
      opts.signal
    );
    const data: any = await res.json();
    return data?.choices?.[0]?.message?.content ?? "";
  });
}

// Streams text deltas to onText. Once the first token has been sent the stream is
// committed to that model, so a mid-stream failure ends the response instead of retrying.
export async function groqStream(
  messages: ChatMessage[],
  opts: CompletionOptions,
  onText: (text: string) => void
): Promise<void> {
  return withModelFallback(opts.models, async (model) => {
    const res = await postToGroq(
      { model, messages, temperature: opts.temperature ?? 0.7, stream: true },
      opts.signal
    );
    if (!res.body) throw new AttemptError("server", "Empty response body from Groq");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let sentAny = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            const text = parsed?.choices?.[0]?.delta?.content;
            if (text) {
              sentAny = true;
              onText(text);
            }
          } catch {
            // ignore partial JSON
          }
        }
      }
    } catch (err) {
      if (sentAny) return; // keep what the user already received
      throw err;
    }
  });
}

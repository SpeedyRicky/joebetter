// Groq client using a single API key (GROQ_API_KEY).
//
// When the key hits Groq's daily limit, Gret answers with a friendly "unavailable"
// message instead of an error, without calling Groq again until the limit resets
// (Groq tells us when via the retry-after header). Short per-minute limits get a
// "busy, try again shortly" message instead.

const GROQ_URL = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELS_URL = GROQ_URL.replace(/\/chat\/completions\/?$/, "/models");

// Preferred models (Groq retired its Llama models in August 2026 and the Compound
// systems in September 2026). Gret also asks Groq which models the key can use and
// switches to a working one, so a future model retirement doesn't break chat.
export const DEFAULT_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
export const FAST_MODEL = process.env.GROQ_FAST_MODEL || "openai/gpt-oss-20b";
export const VISION_MODEL = process.env.GROQ_VISION_MODEL || "qwen/qwen3.8-27b";

// Groq's built-in web search tool (supported by the gpt-oss models).
export const WEB_SEARCH_TOOLS = [{ type: "browser_search" }];

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

export function isModelError(err: any): boolean {
  return err instanceof AttemptError && err.kind === "model";
}

// Models that can't hold a normal chat: speech, moderation, embeddings, retired systems.
const NON_CHAT = /whisper|tts|orpheus|playai|guard|embed|compound/i;
// Models that accept images.
const VISION_HINT = /qwen\/qwen3\.\d+-27b|vision|scout|maverick|-vl\b/i;

const MODEL_LIST_TTL = 10 * ONE_MINUTE;
let modelCache: { ids: Set<string>; at: number } | null = null;
let modelListFailedAt = 0;

// The models this key can use right now, from Groq's model list (cached for 10 minutes).
// Returns null when the list can't be fetched (retried after a minute), so callers fall
// back to their preferred models.
async function availableModels(): Promise<Set<string> | null> {
  if (modelCache && Date.now() - modelCache.at < MODEL_LIST_TTL) return modelCache.ids;
  if (Date.now() - modelListFailedAt < ONE_MINUTE) return modelCache?.ids ?? null;
  try {
    const res = await fetch(GROQ_MODELS_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5000),
    });
    const data: any = res.ok ? await res.json() : null;
    const ids = new Set<string>(
      (Array.isArray(data?.data) ? data.data : [])
        .filter((m: any) => m?.id && m.active !== false)
        .map((m: any) => String(m.id))
    );
    if (ids.size > 0) {
      modelCache = { ids, at: Date.now() };
      return ids;
    }
  } catch {
    // fall through
  }
  modelListFailedAt = Date.now();
  return modelCache?.ids ?? null;
}

function rankChatModel(id: string): number {
  if (id === DEFAULT_MODEL) return 0;
  if (id === "openai/gpt-oss-120b") return 1;
  if (id === "openai/gpt-oss-20b") return 2;
  if (id.startsWith("qwen/")) return 3;
  if (id.startsWith("openai/")) return 4;
  return 5;
}

// Orders the models to try: the preferred ones this key can use, then any other model
// of the right kind it can use. Uses the preferred list as-is if Groq's list is unavailable.
async function resolveModels(preferred: string[], kind: "text" | "vision"): Promise<string[]> {
  const wanted = Array.from(new Set(preferred.filter(Boolean)));
  const ids = await availableModels();
  if (!ids) return wanted;
  const usable = wanted.filter((m) => ids.has(m));
  const others = [...ids].filter((id) => !NON_CHAT.test(id));
  if (kind === "vision") {
    usable.push(...others.filter((id) => VISION_HINT.test(id)));
  } else {
    usable.push(...others.sort((a, b) => rankChatModel(a) - rankChatModel(b)));
  }
  return Array.from(new Set(usable));
}

// Image-capable models this key can use (empty when there are none).
export async function findVisionModels(): Promise<string[]> {
  if (!hasGroqKey()) return [];
  return resolveModels([VISION_MODEL], "vision");
}

export const MODEL_UNAVAILABLE_MESSAGE =
  "Gret's AI model is unavailable right now. Please try again later.";

// Runs `attempt` with each usable model until one succeeds. When a request with extra
// options (web search, JSON mode, ...) is rejected, it is retried once without them.
async function withModelFallback<T>(
  opts: CompletionOptions,
  attempt: (model: string, extra: Record<string, any>) => Promise<T>
): Promise<T> {
  if (!hasGroqKey()) throw new Error("AI assistant key is not configured on the server.");
  if (!isGretAvailable()) throw unavailableError();

  const models = await resolveModels(opts.models, opts.kind ?? "text");
  let lastError: any = null;

  for (const model of models) {
    const extra: Record<string, any> = {
      // Same reasoning setting as Groq's own example for the gpt-oss models.
      ...(model.startsWith("openai/gpt-oss") ? { reasoning_effort: "medium" } : {}),
      // Qwen models think out loud unless told to keep their reasoning out of the reply.
      ...(model.startsWith("qwen/") ? { reasoning_format: "hidden" } : {}),
      ...(opts.extra || {}),
    };
    const variants = Object.keys(extra).length > 0 ? [extra, {}] : [{}];
    for (const variant of variants) {
      try {
        return await attempt(model, variant);
      } catch (err: any) {
        lastError = err;
        if (err?.name === "AbortError") throw err;
        if (err instanceof AttemptError && err.kind === "rate_limited") throw unavailableError();
        if (err instanceof AttemptError && err.kind === "bad_key") throw err;
        console.warn(`[Groq] ${model} failed:`, err?.message || err);
        if (!isModelError(err)) break; // server error: move on to the next model
      }
    }
  }

  if (!lastError || isModelError(lastError)) {
    modelCache = null; // refresh Groq's model list on the next request
    modelListFailedAt = 0;
    const err = new AttemptError("model", MODEL_UNAVAILABLE_MESSAGE);
    throw err;
  }
  throw lastError;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: any;
}

export interface CompletionOptions {
  models: string[];
  kind?: "text" | "vision";
  temperature?: number;
  json?: boolean;
  extra?: Record<string, any>;
  signal?: AbortSignal;
}

export async function groqComplete(messages: ChatMessage[], opts: CompletionOptions): Promise<string> {
  const withJson = {
    ...opts,
    extra: { ...(opts.json ? { response_format: { type: "json_object" } } : {}), ...(opts.extra || {}) },
  };
  return withModelFallback(withJson, async (model, extra) => {
    const res = await postToGroq(
      { model, messages, temperature: opts.temperature ?? 0.7, ...extra },
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
  return withModelFallback(opts, async (model, extra) => {
    const res = await postToGroq(
      { model, messages, temperature: opts.temperature ?? 0.7, ...extra, stream: true },
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

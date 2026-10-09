// Groq client using a single API key (GROQ_API_KEY).
//
// - Gret asks Groq which models the key can use and picks a working one, so a model
//   that Groq retires doesn't break chat.
// - Groq's rate limits are per model: a model that hits its limit is paused until Groq
//   says it can be used again (retry-after), and the next model is tried. Only when every
//   model is paused does Gret answer with the friendly "unavailable" message ("busy" for
//   short pauses), without calling Groq again until a model is free.
// - Errors become short, clear messages instead of raw API output.

const GROQ_URL = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODELS_URL = GROQ_URL.replace(/\/chat\/completions\/?$/, "/models");

// Built-in models (Groq retired its Llama models in August 2026 and the Compound
// systems in September 2026).
const BUILTIN_DEFAULT = "openai/gpt-oss-120b";
const BUILTIN_FAST = "openai/gpt-oss-20b";
const BUILTIN_VISION = "qwen/qwen3.8-27b";

export const DEFAULT_MODEL = process.env.GROQ_MODEL || BUILTIN_DEFAULT;
export const FAST_MODEL = process.env.GROQ_FAST_MODEL || BUILTIN_FAST;
export const VISION_MODEL = process.env.GROQ_VISION_MODEL || BUILTIN_VISION;

// Preference order for text replies; the built-in models stay as backups in case an
// override names a retired model.
export const TEXT_MODELS = [DEFAULT_MODEL, BUILTIN_DEFAULT, FAST_MODEL, BUILTIN_FAST];
export const FAST_TEXT_MODELS = [FAST_MODEL, BUILTIN_FAST, DEFAULT_MODEL, BUILTIN_DEFAULT];

// Groq's built-in web search tool (supported by the gpt-oss models).
export const WEB_SEARCH_TOOLS = [{ type: "browser_search" }];

export const UNAVAILABLE_MESSAGE =
  "Gret is unavailable right now. Today's capacity has been used up. Gret will be back within the next 24 hours, and possibly sooner, so please check back later.";
export const BUSY_MESSAGE = "Gret is busy right now. Please try again in a minute.";
export const MODEL_UNAVAILABLE_MESSAGE = "Gret's AI model is unavailable right now. Please try again later.";
export const TOO_LARGE_MESSAGE =
  "That message or attachment is too long for Gret right now. Please shorten it or start a new chat.";
export const SERVICE_ERROR_MESSAGE = "Gret's AI service had a problem. Please try again in a moment.";
export const TIMEOUT_MESSAGE = "Gret took too long to answer. Please try again.";
const BAD_KEY_MESSAGE = "AI API key is invalid or lacks necessary permissions.";

const ONE_MINUTE = 60 * 1000;
const FIVE_MINUTES = 5 * ONE_MINUTE;
const ONE_DAY = 24 * 60 * ONE_MINUTE;
// How long to wait for Groq to start answering, and when to stop trying more models
// (Vercel ends the function at 60 seconds).
const START_TIMEOUT = 30 * 1000;
const OVERALL_DEADLINE = 45 * 1000;

export class GretUnavailableError extends Error {
  constructor(message: string = UNAVAILABLE_MESSAGE) {
    super(message);
    this.name = "GretUnavailableError";
  }
}

const rawKey = (process.env.GROQ_API_KEY || "").trim();
const apiKey = rawKey && !rawKey.startsWith("MY_") ? rawKey : "";

// Per model: time until which it is over its Groq rate limit.
const blockedUntil = new Map<string, number>();

function isBlocked(model: string): boolean {
  return (blockedUntil.get(model) ?? 0) > Date.now();
}

export function hasGroqKey(): boolean {
  return apiKey !== "";
}

// Gret is available while at least one chat model it can use is not rate limited.
export function isGretAvailable(): boolean {
  if (!hasGroqKey()) return false;
  const pool = modelCache?.chat.length ? modelCache.chat : TEXT_MODELS;
  return pool.some((m) => !isBlocked(m));
}

function unavailableError(models: string[]): GretUnavailableError {
  const now = Date.now();
  const soonest = Math.min(...models.map((m) => blockedUntil.get(m) ?? now));
  return new GretUnavailableError(soonest - now > FIVE_MINUTES ? UNAVAILABLE_MESSAGE : BUSY_MESSAGE);
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

// rate_limited: this model is over its limit, try another model.
// model: this model doesn't exist or isn't allowed for the key, try another model.
// rejected: Groq refused the request's options, retry with fewer options.
// too_large: the request is over Groq's size limit (same for every model).
// server: Groq failed or didn't answer, try another model.
type FailureKind = "rate_limited" | "bad_key" | "model" | "rejected" | "too_large" | "server";

class AttemptError extends Error {
  constructor(public kind: FailureKind, message: string) {
    super(message);
  }
}

export function isModelError(err: any): boolean {
  return err instanceof AttemptError && err.kind === "model";
}

export function isTooLargeError(err: any): boolean {
  return err instanceof AttemptError && err.kind === "too_large";
}

interface GroqErrorInfo {
  message: string;
  code: string;
  type: string;
}

function parseGroqError(body: string): GroqErrorInfo {
  try {
    const e = JSON.parse(body)?.error;
    if (e) return { message: String(e.message || ""), code: String(e.code || ""), type: String(e.type || "") };
  } catch {
    // not JSON
  }
  return { message: body.slice(0, 300), code: "", type: "" };
}

function classify(status: number, info: GroqErrorInfo): FailureKind {
  if (
    status === 413 ||
    info.code === "context_length_exceeded" ||
    /request too large|context length|context_length|reduce the length/i.test(info.message)
  ) {
    return "too_large";
  }
  if (status === 429) return "rate_limited";
  if (status === 404 || info.code === "model_not_found" || info.code === "model_decommissioned") return "model";
  if (status === 403 && (info.type === "permissions_error" || /model/i.test(info.message))) return "model";
  if (status === 401 || status === 403 || info.code === "invalid_api_key") return "bad_key";
  if (status === 400 || status === 422) return "rejected";
  return "server";
}

async function postToGroq(payload: any, signal?: AbortSignal): Promise<Response> {
  // Give up if Groq hasn't started answering in time (cleared once it does).
  const startTimeout = new AbortController();
  const timer = setTimeout(() => startTimeout.abort(), START_TIMEOUT);
  let res: Response;
  try {
    res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: signal ? AbortSignal.any([signal, startTimeout.signal]) : startTimeout.signal,
    });
  } catch (err: any) {
    if (signal?.aborted) throw err; // the user left; stop quietly
    throw new AttemptError("server", startTimeout.signal.aborted ? TIMEOUT_MESSAGE : String(err?.message || err));
  } finally {
    clearTimeout(timer);
  }
  if (res.ok) return res;

  const body = await res.text().catch(() => "");
  const info = parseGroqError(body);
  const kind = classify(res.status, info);
  if (kind === "rate_limited") {
    const wait = cooldownFor429(res, body);
    blockedUntil.set(payload.model, Date.now() + wait);
    console.warn(`[Groq] ${payload.model} rate limited, pausing it for ${Math.round(wait / 1000)}s`);
  }
  if (kind === "bad_key") {
    console.error(`[Groq] API key rejected (${res.status}). Check GROQ_API_KEY.`);
    throw new AttemptError(kind, BAD_KEY_MESSAGE);
  }
  if (kind === "too_large") throw new AttemptError(kind, TOO_LARGE_MESSAGE);
  throw new AttemptError(kind, info.message || `Groq ${res.status}`);
}

// Models that can't hold a normal chat: speech, moderation, embeddings, retired systems.
const NON_CHAT = /whisper|tts|orpheus|playai|guard|embed|compound/i;
// Models that accept images, when Groq's list doesn't say.
const VISION_HINT = /qwen\/qwen3\.\d+-27b|vision|scout|maverick|-vl\b/i;
// Smallest context window worth chatting with (Gret's prompts and history need room).
const MIN_CONTEXT = 16000;

const MODEL_LIST_TTL = 10 * ONE_MINUTE;
let modelCache: { chat: string[]; vision: string[]; at: number } | null = null;
let modelListFailedAt = 0;

function isChatModel(m: any): boolean {
  const id = String(m.id);
  if (NON_CHAT.test(id)) return false;
  if (Array.isArray(m.output_modalities) && !m.output_modalities.includes("text")) return false;
  if (Array.isArray(m.input_modalities) && !m.input_modalities.includes("text")) return false;
  if (typeof m.context_window === "number" && m.context_window < MIN_CONTEXT) return false;
  return true;
}

function isVisionModel(m: any): boolean {
  return Array.isArray(m.input_modalities) ? m.input_modalities.includes("image") : VISION_HINT.test(String(m.id));
}

// The chat and vision models this key can use right now, from Groq's model list (cached
// for 10 minutes). Returns null when the list can't be fetched (retried after a minute),
// so callers fall back to their preferred models.
async function availableModels(): Promise<{ chat: string[]; vision: string[] } | null> {
  if (modelCache && Date.now() - modelCache.at < MODEL_LIST_TTL) return modelCache;
  if (Date.now() - modelListFailedAt < ONE_MINUTE) return modelCache;
  try {
    const res = await fetch(GROQ_MODELS_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(5000),
    });
    const data: any = res.ok ? await res.json() : null;
    const models = (Array.isArray(data?.data) ? data.data : []).filter((m: any) => m?.id && m.active !== false);
    if (models.length > 0) {
      const chat = models.filter(isChatModel);
      modelCache = {
        chat: chat.map((m: any) => String(m.id)),
        vision: chat.filter(isVisionModel).map((m: any) => String(m.id)),
        at: Date.now(),
      };
      return modelCache;
    }
  } catch {
    // fall through
  }
  modelListFailedAt = Date.now();
  return modelCache;
}

function rankChatModel(id: string): number {
  if (id === DEFAULT_MODEL) return 0;
  if (id === BUILTIN_DEFAULT) return 1;
  if (id === BUILTIN_FAST) return 2;
  if (id.startsWith("qwen/")) return 3;
  if (id.startsWith("openai/")) return 4;
  return 5;
}

// Orders the models to try: the preferred ones this key can use, then any other model
// of the right kind it can use. Uses the preferred list as-is if Groq's list is unavailable.
async function resolveModels(preferred: string[], kind: "text" | "vision"): Promise<string[]> {
  const wanted = Array.from(new Set(preferred.filter(Boolean)));
  const available = await availableModels();
  if (!available) return wanted;
  const pool = kind === "vision" ? available.vision : available.chat;
  const usable = wanted.filter((m) => pool.includes(m));
  const others = kind === "vision" ? pool : [...pool].sort((a, b) => rankChatModel(a) - rankChatModel(b));
  return Array.from(new Set([...usable, ...others]));
}

// Image-capable models this key can use and that aren't rate limited (empty if none).
export async function findVisionModels(): Promise<string[]> {
  if (!hasGroqKey()) return [];
  const models = await resolveModels([VISION_MODEL, BUILTIN_VISION], "vision");
  return models.filter((m) => !isBlocked(m));
}

// Settings each model needs: the gpt-oss reasoning level from Groq's own example, and
// Qwen told to keep its thinking out of the reply.
function modelSettings(model: string): Record<string, any> {
  if (model.startsWith("openai/gpt-oss")) return { reasoning_effort: "medium" };
  if (model.startsWith("qwen/")) return { reasoning_format: "hidden" };
  return {};
}

// Runs `attempt` with each usable model until one succeeds. If Groq refuses a request's
// options (web search, JSON mode, ...), it is retried with fewer of them before giving up.
async function withModelFallback<T>(
  opts: CompletionOptions,
  attempt: (model: string, extra: Record<string, any>) => Promise<T>
): Promise<T> {
  if (!hasGroqKey()) throw new Error("AI assistant key is not configured on the server.");
  const started = Date.now();
  const candidates = await resolveModels(opts.models, opts.kind ?? "text");
  const models = candidates.filter((m) => !isBlocked(m));
  if (candidates.length > 0 && models.length === 0) throw unavailableError(candidates);

  let lastError: any = null;
  for (const model of models) {
    if (Date.now() - started > OVERALL_DEADLINE) {
      lastError = new AttemptError("server", TIMEOUT_MESSAGE);
      break;
    }
    const settings = modelSettings(model);
    const variants: Record<string, any>[] = [];
    for (const v of [{ ...settings, ...(opts.extra || {}) }, settings, {}]) {
      if (!variants.some((x) => JSON.stringify(x) === JSON.stringify(v))) variants.push(v);
    }
    for (let i = 0; i < variants.length; i++) {
      try {
        return await attempt(model, variants[i]);
      } catch (err: any) {
        lastError = err;
        if (err?.name === "AbortError") throw err;
        const kind: FailureKind = err instanceof AttemptError ? err.kind : "server";
        console.warn(`[Groq] ${model} failed (${kind}):`, err?.message || err);
        if (kind === "bad_key" || kind === "too_large") throw err;
        // Options refused: retry with fewer. Refused even without options: Groq's message.
        if (kind === "rejected") {
          if (i < variants.length - 1) continue;
          throw err;
        }
        break; // model missing, rate limited or Groq failed: try the next model
      }
    }
  }

  if (candidates.length > 0 && candidates.every(isBlocked)) throw unavailableError(candidates);
  if (!lastError || isModelError(lastError)) {
    modelCache = null; // refresh Groq's model list on the next request
    modelListFailedAt = 0;
    throw new AttemptError("model", MODEL_UNAVAILABLE_MESSAGE);
  }
  if (lastError instanceof AttemptError && lastError.kind === "rate_limited") {
    throw unavailableError(candidates.filter(isBlocked));
  }
  throw new AttemptError("server", lastError?.message === TIMEOUT_MESSAGE ? TIMEOUT_MESSAGE : SERVICE_ERROR_MESSAGE);
}

// Cleans a reply as it streams: drops a leading <think>...</think> block (in case a model
// thinks out loud) and, for web search, Groq's citation markers such as 【1†L9-L13】.
class ReplyFilter {
  private pending = "";
  private state: "start" | "think" | "body" = "start";

  constructor(private stripCitations: boolean) {}

  push(text: string): string {
    this.pending += text;
    if (this.state === "start") {
      const head = this.pending.trimStart();
      if (head.length < 7 && "<think>".startsWith(head)) return ""; // wait for more text
      if (head.startsWith("<think>")) {
        this.state = "think";
        this.pending = head.slice(7);
      } else {
        this.state = "body";
      }
    }
    if (this.state === "think") {
      const end = this.pending.indexOf("</think>");
      if (end === -1) {
        this.pending = this.pending.slice(-8); // enough to spot a split closing tag
        return "";
      }
      this.pending = this.pending.slice(end + 8).replace(/^\s+/, "");
      this.state = "body";
    }
    return this.take(false);
  }

  flush(): string {
    if (this.state === "think") return "";
    this.state = "body";
    return this.take(true);
  }

  private take(final: boolean): string {
    let text = this.pending;
    this.pending = "";
    if (!this.stripCitations) return text;
    text = text.replace(/【[^】]{0,80}】/g, "");
    const open = text.lastIndexOf("【");
    if (!final && open !== -1 && text.length - open <= 80) {
      this.pending = text.slice(open); // a marker may be split across chunks
      text = text.slice(0, open);
    }
    return text;
  }
}

function cleanReply(text: string, stripCitations: boolean): string {
  const filter = new ReplyFilter(stripCitations);
  return (filter.push(text) + filter.flush()).trim();
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
    return cleanReply(data?.choices?.[0]?.message?.content ?? "", Boolean(extra.tools));
  });
}

// Streams text deltas to onText. Once the first text has been sent the stream is
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
    const filter = new ReplyFilter(Boolean(extra.tools));
    let buffer = "";
    let sentAny = false;
    const emit = (text: string) => {
      if (!text) return;
      sentAny = true;
      onText(text);
    };
    const finish = () => {
      emit(filter.flush());
      // Nothing but reasoning (or nothing at all): let the next option or model answer.
      if (!sentAny) throw new AttemptError("server", "Groq returned an empty answer");
    };

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
          if (data === "[DONE]") return finish();
          let parsed: any;
          try {
            parsed = JSON.parse(data);
          } catch {
            continue; // ignore partial JSON
          }
          if (parsed?.error) {
            // An error reported inside the stream (for example a failed web search).
            if (sentAny) return finish();
            const code = String(parsed.error.code || "");
            throw new AttemptError(code === "tool_use_failed" ? "rejected" : "server", String(parsed.error.message || code));
          }
          emit(filter.push(parsed?.choices?.[0]?.delta?.content || ""));
        }
      }
      finish();
    } catch (err) {
      if (sentAny) return; // keep what the user already received
      throw err;
    }
  });
}

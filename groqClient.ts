// Groq client with a rotating pool of API keys.
//
// Keys are read from GROQ_API_KEY_1 ... GROQ_API_KEY_20 (and/or a comma-separated
// GROQ_API_KEYS). Each request uses the next key that is not cooling down. When a key
// hits a rate limit or its daily quota it is parked until Groq says it can be used
// again, and the next key is tried. When every key is parked, callers get a
// GretUnavailableError instead of a raw API error. As soon as any key's cooldown
// expires, Gret is available again.

const GROQ_URL = process.env.GROQ_API_URL || "https://api.groq.com/openai/v1/chat/completions";

export const DEFAULT_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
export const FAST_MODEL = process.env.GROQ_FAST_MODEL || "llama-3.1-8b-instant";
export const VISION_MODEL = process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
export const SEARCH_MODEL = process.env.GROQ_SEARCH_MODEL || "groq/compound-mini";

export const UNAVAILABLE_MESSAGE =
  "Gret is unavailable right now. All of today's capacity has been used up. Gret will be back within the next 24 hours, and possibly sooner, so please check back later.";

const ONE_MINUTE = 60 * 1000;
const ONE_DAY = 24 * 60 * ONE_MINUTE;

export class GretUnavailableError extends Error {
  constructor() {
    super(UNAVAILABLE_MESSAGE);
    this.name = "GretUnavailableError";
  }
}

interface KeySlot {
  key: string;
  label: string;
  cooldownUntil: number;
}

function loadKeys(): KeySlot[] {
  const raw: string[] = [];
  if (process.env.GROQ_API_KEYS) raw.push(...process.env.GROQ_API_KEYS.split(","));
  if (process.env.GROQ_API_KEY) raw.push(process.env.GROQ_API_KEY);
  for (let i = 1; i <= 20; i++) {
    const v = process.env[`GROQ_API_KEY_${i}`];
    if (v) raw.push(v);
  }
  const unique = Array.from(new Set(raw.map((k) => k.trim()).filter((k) => k && !k.startsWith("MY_"))));
  return unique.map((key, i) => ({ key, label: `key #${i + 1}`, cooldownUntil: 0 }));
}

const slots = loadKeys();
let nextIndex = 0;

export function hasGroqKeys(): boolean {
  return slots.length > 0;
}

export function isGretAvailable(): boolean {
  const now = Date.now();
  return slots.some((s) => s.cooldownUntil <= now);
}

// Returns available keys starting from the round-robin pointer.
function availableSlots(): KeySlot[] {
  const now = Date.now();
  const ordered: KeySlot[] = [];
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[(nextIndex + i) % slots.length];
    if (slot.cooldownUntil <= now) ordered.push(slot);
  }
  nextIndex = (nextIndex + 1) % Math.max(slots.length, 1);
  return ordered;
}

// Parse Groq durations such as "2.5s", "1m30s", "7h12m5.2s".
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
  if (fromHeader !== null) return Math.min(Math.max(fromHeader, 5000), ONE_DAY);
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

async function postToGroq(slot: KeySlot, payload: any, signal?: AbortSignal): Promise<Response> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${slot.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });
  if (res.ok) return res;

  const body = await res.text().catch(() => "");
  if (res.status === 429) {
    const wait = cooldownFor429(res, body);
    slot.cooldownUntil = Date.now() + wait;
    console.warn(`[Groq] ${slot.label} rate limited, parked for ${Math.round(wait / 1000)}s`);
    throw new AttemptError("rate_limited", body);
  }
  if (res.status === 401 || res.status === 403) {
    slot.cooldownUntil = Date.now() + ONE_DAY;
    console.warn(`[Groq] ${slot.label} rejected (${res.status}), parked for 24h`);
    throw new AttemptError("bad_key", body);
  }
  if (res.status === 400 || res.status === 404) {
    throw new AttemptError("model", body);
  }
  throw new AttemptError("server", `Groq ${res.status}: ${body}`);
}

// Runs `attempt` with each available key and each model until one succeeds.
async function withRotation<T>(
  models: string[],
  attempt: (slot: KeySlot, model: string) => Promise<T>
): Promise<T> {
  if (!hasGroqKeys()) throw new Error("AI assistant key is not configured on the server.");

  const modelList = Array.from(new Set(models.filter(Boolean)));
  let lastError: any = null;

  for (const slot of availableSlots()) {
    for (const model of modelList) {
      try {
        return await attempt(slot, model);
      } catch (err: any) {
        lastError = err;
        if (err?.name === "AbortError") throw err;
        if (err instanceof AttemptError && (err.kind === "rate_limited" || err.kind === "bad_key")) {
          break; // this key is parked, move on to the next key
        }
        console.warn(`[Groq] ${slot.label} / ${model} failed:`, err?.message || err);
        // model or server error: try the next model with the same key
      }
    }
  }

  if (!isGretAvailable()) throw new GretUnavailableError();
  throw lastError || new GretUnavailableError();
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
  return withRotation(opts.models, async (slot, model) => {
    const res = await postToGroq(
      slot,
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
// committed to that key, so a mid-stream failure ends the response instead of retrying.
export async function groqStream(
  messages: ChatMessage[],
  opts: CompletionOptions,
  onText: (text: string) => void
): Promise<void> {
  return withRotation(opts.models, async (slot, model) => {
    const res = await postToGroq(
      slot,
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

import "server-only";
import { db } from "../db";
import { anthropicProvider } from "./anthropic";
import { geminiProvider } from "./gemini";
import { openaiProvider } from "./openai";
import {
  AiError,
  MAX_SOURCE_CHARS,
  PROVIDERS,
  PROVIDER_IDS,
  providerInfo,
  type GenerateInput,
  type GeneratedCards,
  type ProviderId,
  type ProviderImpl,
} from "./shared";

export { AiError, GeneratedCardsSchema, PROVIDERS, PROVIDER_IDS, type ProviderId } from "./shared";

const IMPLS: Record<ProviderId, ProviderImpl> = {
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  openai: openaiProvider,
};

// Keys entered in Settings are stored in the local SQLite file (plain text, never sent
// to the browser). Environment variables are used when no key is saved in the app.

function getSetting(key: string): string | null {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key) as { value: string } | undefined;
  return row?.value ?? null;
}
function setSetting(key: string, value: string) {
  db.prepare(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
  ).run(key, value);
}
function deleteSetting(key: string) {
  db.prepare("DELETE FROM settings WHERE key = ?").run(key);
}

export const isProviderId = (v: unknown): v is ProviderId => (PROVIDER_IDS as string[]).includes(v as string);

type ResolvedConfig = { apiKey: string | null; keySource: "app" | "env" | null; model: string };

function resolve(id: ProviderId): ResolvedConfig {
  const info = providerInfo(id);
  const appKey = getSetting(`ai.${id}.key`);
  const envKey = process.env[info.envKey] || null;
  return {
    apiKey: appKey || envKey,
    keySource: appKey ? "app" : envKey ? "env" : null,
    model: getSetting(`ai.${id}.model`) || info.defaultModel,
  };
}

/** Safe-for-the-browser view of each provider's configuration (no keys). */
export function getProviderStatuses() {
  const def = getDefaultProvider();
  return PROVIDERS.map((p) => {
    const c = resolve(p.id);
    return {
      id: p.id,
      label: p.label,
      envKey: p.envKey,
      keyUrl: p.keyUrl,
      defaultModel: p.defaultModel,
      model: c.model,
      configured: !!c.apiKey,
      keySource: c.keySource,
      keyHint: c.apiKey ? `…${c.apiKey.slice(-4)}` : null,
      isDefault: p.id === def,
    };
  });
}
export type ProviderStatus = ReturnType<typeof getProviderStatuses>[number];

/** The chosen default, or else the first provider that has a key. */
export function getDefaultProvider(): ProviderId | null {
  const saved = getSetting("ai.default");
  if (isProviderId(saved) && resolve(saved).apiKey) return saved;
  return PROVIDERS.find((p) => resolve(p.id).apiKey)?.id ?? null;
}

export function anyProviderConfigured() {
  return getDefaultProvider() !== null;
}

export function saveProviderConfig(id: ProviderId, cfg: { apiKey?: string; model?: string }) {
  if (cfg.apiKey !== undefined && cfg.apiKey.trim()) setSetting(`ai.${id}.key`, cfg.apiKey.trim());
  if (cfg.model !== undefined) {
    const m = cfg.model.trim();
    if (m && m !== providerInfo(id).defaultModel) setSetting(`ai.${id}.model`, m);
    else deleteSetting(`ai.${id}.model`);
  }
}

export function clearProviderKey(id: ProviderId) {
  deleteSetting(`ai.${id}.key`);
}

export function setDefaultProvider(id: ProviderId) {
  setSetting("ai.default", id);
}

export async function testProvider(id: ProviderId): Promise<{ ok: true; model: string } | { ok: false; error: string }> {
  const c = resolve(id);
  if (!c.apiKey) return { ok: false, error: "No API key set." };
  try {
    await IMPLS[id].test({ apiKey: c.apiKey, model: c.model });
    return { ok: true, model: c.model };
  } catch (e) {
    if (e instanceof AiError) return { ok: false, error: e.message };
    console.error(e);
    return { ok: false, error: "Unexpected error while testing the key." };
  }
}

export async function generateCards(id: ProviderId, input: GenerateInput): Promise<GeneratedCards> {
  if (input.text.length > MAX_SOURCE_CHARS) {
    throw new AiError(
      `That source is too long (${input.text.length.toLocaleString()} characters; limit ${MAX_SOURCE_CHARS.toLocaleString()}). Paste one chapter or section at a time.`,
    );
  }
  const c = resolve(id);
  if (!c.apiKey) throw new AiError(`No API key set for ${providerInfo(id).label}. Add one in Settings.`);
  return IMPLS[id].generate({ apiKey: c.apiKey, model: c.model }, input);
}

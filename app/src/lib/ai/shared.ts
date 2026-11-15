import { z } from "zod";
import { SOURCE_KINDS, TOPIC_SLUGS } from "../topics";

export const PROVIDERS = [
  {
    id: "anthropic",
    label: "Claude (Anthropic)",
    envKey: "ANTHROPIC_API_KEY",
    defaultModel: "claude-opus-5-5",
    keyUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    id: "gemini",
    label: "Gemini (Google)",
    envKey: "GEMINI_API_KEY",
    defaultModel: "gemini-3.8-flash",
    keyUrl: "https://aistudio.google.com/apikey",
  },
  {
    id: "openai",
    label: "OpenAI",
    envKey: "OPENAI_API_KEY",
    defaultModel: "gpt-5.5",
    keyUrl: "https://platform.openai.com/api-keys",
  },
] as const;

export type ProviderId = (typeof PROVIDERS)[number]["id"];
export const PROVIDER_IDS = PROVIDERS.map((p) => p.id) as [ProviderId, ...ProviderId[]];
export const providerInfo = (id: ProviderId) => PROVIDERS.find((p) => p.id === id)!;

// Hard limit on source text sent to a model (~150k tokens). We reject rather than
// silently truncate, so the user knows the cards cover the whole source.
export const MAX_SOURCE_CHARS = 600_000;
export const MAX_OUTPUT_TOKENS = 16000;

export const GeneratedCardsSchema = z.object({
  source: z.object({
    title: z.string().describe("Title of the book, article, video or podcast"),
    author: z.string().describe("Author or creator; empty string if unknown"),
    kind: z.enum(SOURCE_KINDS),
  }),
  ideas: z
    .array(
      z.object({
        title: z.string().describe("A short, punchy headline for the idea (max ~8 words)"),
        body: z.string().describe("The idea explained in 2-4 plain sentences (40-90 words)"),
        topic: z.enum(TOPIC_SLUGS),
      }),
    )
    .describe("The key ideas, in the order they appear in the source"),
});

export type GeneratedCards = z.infer<typeof GeneratedCardsSchema>;

export const SYSTEM_PROMPT = `You turn long-form content into "idea cards" for a personal learning app.

An idea card captures ONE self-contained, useful insight: a principle, mental model,
technique, surprising fact or memorable argument. A reader who sees only the card,
with no other context, should understand it and be able to apply or remember it.

Write each card in your own plain words. Prefer concrete wording over vague
motivation. Stay faithful to the source; don't add claims it doesn't make.
Skip filler, anecdotes without a lesson, and promotional content.

Pick the single best-fitting topic for each card from the allowed list.`;

export type GenerateInput = {
  text: string;
  count: number;
  hint?: { title?: string; author?: string; url?: string };
};

export function buildUserPrompt(input: GenerateInput) {
  const hint = [
    input.hint?.title && `Title (from user): ${input.hint.title}`,
    input.hint?.author && `Author (from user): ${input.hint.author}`,
    input.hint?.url && `URL: ${input.hint.url}`,
  ]
    .filter(Boolean)
    .join("\n");
  return `${hint ? hint + "\n\n" : ""}<source>\n${input.text}\n</source>\n\nExtract the ${input.count} most valuable ideas as cards (fewer if the source doesn't have that many good ones).`;
}

/** Errors with a message that is safe and useful to show in the UI. */
export class AiError extends Error {}

export type ProviderImpl = {
  generate(cfg: { apiKey: string; model: string }, input: GenerateInput): Promise<GeneratedCards>;
  /** Cheap check (model lookup, no tokens) that the key and model are valid. */
  test(cfg: { apiKey: string; model: string }): Promise<void>;
};

export function statusError(provider: string, status: number | undefined, message: string): AiError {
  if (status === 401 || status === 403) return new AiError(`${provider} rejected the API key (HTTP ${status}).`);
  if (status === 404) return new AiError(`${provider} doesn't know that model name (HTTP 404). Check it in Settings.`);
  if (status === 429) return new AiError(`${provider} rate limit or quota reached. Try again later.`);
  if (status === 400) return new AiError(`${provider} rejected the request (HTTP 400): ${message}`);
  return new AiError(`${provider} request failed${status ? ` (HTTP ${status})` : ""}: ${message}`);
}

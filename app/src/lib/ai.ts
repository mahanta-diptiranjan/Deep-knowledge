import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { SOURCE_KINDS, TOPIC_SLUGS } from "./topics";

const MODEL = "claude-opus-5-5";

// Hard limit on source text sent to the model (~150k tokens). We reject rather than
// silently truncate, so the user knows the cards cover the whole source.
export const MAX_SOURCE_CHARS = 600_000;

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

const SYSTEM = `You turn long-form content into "idea cards" for a personal learning app.

An idea card captures ONE self-contained, useful insight: a principle, mental model,
technique, surprising fact or memorable argument. A reader who sees only the card,
with no other context, should understand it and be able to apply or remember it.

Write each card in your own plain words. Prefer concrete wording over vague
motivation. Stay faithful to the source; don't add claims it doesn't make.
Skip filler, anecdotes without a lesson, and promotional content.

Pick the single best-fitting topic for each card from the allowed list.`;

export class AiError extends Error {}

export function aiConfigured() {
  return !!process.env.ANTHROPIC_API_KEY || !!process.env.ANTHROPIC_AUTH_TOKEN;
}

export async function generateCards(input: {
  text: string;
  count: number;
  hint?: { title?: string; author?: string; url?: string };
}): Promise<GeneratedCards> {
  if (input.text.length > MAX_SOURCE_CHARS) {
    throw new AiError(
      `That source is too long (${input.text.length.toLocaleString()} characters; limit ${MAX_SOURCE_CHARS.toLocaleString()}). Paste one chapter or section at a time.`,
    );
  }

  const client = new Anthropic();
  const hintLines = [
    input.hint?.title && `Title (from user): ${input.hint.title}`,
    input.hint?.author && `Author (from user): ${input.hint.author}`,
    input.hint?.url && `URL: ${input.hint.url}`,
  ]
    .filter(Boolean)
    .join("\n");

  let response;
  try {
    response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM,
      output_config: { effort: "medium", format: betaZodOutputFormat(GeneratedCardsSchema) },
      // If the model declines on a safety classifier, the API retries on a fallback model.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages: [
        {
          role: "user",
          content: `${hintLines ? hintLines + "\n\n" : ""}<source>\n${input.text}\n</source>\n\nExtract the ${input.count} most valuable ideas as cards (fewer if the source doesn't have that many good ones).`,
        },
      ],
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError)
      throw new AiError("Your Anthropic API key was rejected. Check ANTHROPIC_API_KEY in .env.local.");
    if (e instanceof Anthropic.RateLimitError) throw new AiError("Rate limited by the API. Try again in a minute.");
    if (e instanceof Anthropic.APIConnectionError) throw new AiError("Couldn't reach the Anthropic API.");
    if (e instanceof Anthropic.APIError) throw new AiError(`AI request failed (${e.status}): ${e.message}`);
    throw e;
  }

  if (response.stop_reason === "refusal") throw new AiError("The model declined to process this content.");
  if (response.stop_reason === "max_tokens") throw new AiError("The response was cut off. Try asking for fewer cards.");
  if (!response.parsed_output) throw new AiError("The model's response couldn't be parsed. Try again.");
  return response.parsed_output;
}

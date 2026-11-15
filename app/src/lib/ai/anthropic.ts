import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import {
  AiError,
  GeneratedCardsSchema,
  MAX_OUTPUT_TOKENS,
  SYSTEM_PROMPT,
  buildUserPrompt,
  statusError,
  type ProviderImpl,
} from "./shared";

function wrap(e: unknown): never {
  if (e instanceof Anthropic.APIConnectionError) throw new AiError("Couldn't reach the Anthropic API.");
  if (e instanceof Anthropic.APIError) throw statusError("Anthropic", e.status, e.message);
  throw e;
}

export const anthropicProvider: ProviderImpl = {
  async generate({ apiKey, model }, input) {
    const client = new Anthropic({ apiKey });
    let response;
    try {
      response = await client.beta.messages.parse({
        model,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: SYSTEM_PROMPT,
        output_config: { effort: "medium", format: betaZodOutputFormat(GeneratedCardsSchema) },
        // If the model declines on a safety classifier, the API retries on a fallback model.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        messages: [{ role: "user", content: buildUserPrompt(input) }],
      });
    } catch (e) {
      wrap(e);
    }
    if (response.stop_reason === "refusal") throw new AiError("Claude declined to process this content.");
    if (response.stop_reason === "max_tokens") throw new AiError("The response was cut off. Ask for fewer cards.");
    if (!response.parsed_output) throw new AiError("Claude's response couldn't be parsed. Try again.");
    return response.parsed_output;
  },

  async test({ apiKey, model }) {
    try {
      await new Anthropic({ apiKey }).models.retrieve(model);
    } catch (e) {
      wrap(e);
    }
  },
};

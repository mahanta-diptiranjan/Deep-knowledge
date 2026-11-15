import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
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
  if (e instanceof OpenAI.APIConnectionError) throw new AiError("Couldn't reach the OpenAI API.");
  if (e instanceof OpenAI.APIError) throw statusError("OpenAI", e.status, e.message);
  throw e;
}

export const openaiProvider: ProviderImpl = {
  async generate({ apiKey, model }, input) {
    const client = new OpenAI({ apiKey });
    let response;
    try {
      response = await client.responses.parse({
        model,
        instructions: SYSTEM_PROMPT,
        input: buildUserPrompt(input),
        max_output_tokens: MAX_OUTPUT_TOKENS,
        text: { format: zodTextFormat(GeneratedCardsSchema, "idea_cards") },
      });
    } catch (e) {
      wrap(e);
    }

    if (response.status === "incomplete") {
      const reason = response.incomplete_details?.reason;
      throw new AiError(
        reason === "max_output_tokens"
          ? "The response was cut off. Ask for fewer cards."
          : `OpenAI stopped early (${reason ?? "unknown reason"}).`,
      );
    }
    const refused = response.output.some(
      (o) => o.type === "message" && o.content.some((c) => c.type === "refusal"),
    );
    if (refused) throw new AiError("OpenAI declined to process this content.");
    if (!response.output_parsed) throw new AiError("OpenAI's response couldn't be parsed. Try again.");
    return response.output_parsed;
  },

  async test({ apiKey, model }) {
    try {
      await new OpenAI({ apiKey }).models.retrieve(model);
    } catch (e) {
      wrap(e);
    }
  },
};

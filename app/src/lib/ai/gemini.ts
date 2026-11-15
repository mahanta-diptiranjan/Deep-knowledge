import "server-only";
import { ApiError, GoogleGenAI } from "@google/genai";
import { z } from "zod";
import {
  AiError,
  GeneratedCardsSchema,
  MAX_OUTPUT_TOKENS,
  SYSTEM_PROMPT,
  buildUserPrompt,
  statusError,
  type ProviderImpl,
} from "./shared";

const JSON_SCHEMA = z.toJSONSchema(GeneratedCardsSchema);

function wrap(e: unknown): never {
  if (e instanceof ApiError) throw statusError("Gemini", e.status, e.message);
  if (e instanceof TypeError) throw new AiError("Couldn't reach the Gemini API.");
  throw e;
}

export const geminiProvider: ProviderImpl = {
  async generate({ apiKey, model }, input) {
    const ai = new GoogleGenAI({ apiKey });
    let response;
    try {
      response = await ai.models.generateContent({
        model,
        contents: buildUserPrompt(input),
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseJsonSchema: JSON_SCHEMA,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        },
      });
    } catch (e) {
      wrap(e);
    }

    const blocked = response.promptFeedback?.blockReason;
    if (blocked) throw new AiError(`Gemini blocked this content (${blocked}).`);
    const finish = response.candidates?.[0]?.finishReason;
    if (finish === "MAX_TOKENS") throw new AiError("The response was cut off. Ask for fewer cards.");
    if (finish && finish !== "STOP") throw new AiError(`Gemini stopped early (${finish}).`);

    const text = response.text;
    if (!text) throw new AiError("Gemini returned an empty response. Try again.");
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new AiError("Gemini's response wasn't valid JSON. Try again.");
    }
    const parsed = GeneratedCardsSchema.safeParse(json);
    if (!parsed.success) throw new AiError("Gemini's response didn't match the card format. Try again.");
    return parsed.data;
  },

  async test({ apiKey, model }) {
    try {
      await new GoogleGenAI({ apiKey }).models.get({ model });
    } catch (e) {
      wrap(e);
    }
  },
};

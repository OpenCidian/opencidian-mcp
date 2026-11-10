import { z } from "zod";

import { apiFetch, toQueryString } from "../lib/api.js";
import type { Env } from "../lib/env.js";
import { withDataset } from "../lib/format.js";
import { defineReadTool } from "../lib/tool-helpers.js";
import { getCharacterInputSchema } from "./get-character.js";

export const wordsWithInputSchema = getCharacterInputSchema.extend({
  limit: z.number().int().min(1).max(100).optional().describe("Words to return, 1-100 (default 20)."),
});
export type WordsWithInput = z.infer<typeof wordsWithInputSchema>;

export async function executeWordsWith(env: Env, input: WordsWithInput) {
  const body = await apiFetch<unknown[]>(env, `/v1/words-with/${encodeURIComponent(input.char)}${toQueryString({ limit: input.limit })}`);
  return { content: { char: input.char, ...withDataset(body) }, resultCount: body.data.length };
}

export const WORDS_WITH_INFO = {
  name: "words_with",
  title: "Words that contain a character",
  description:
    "Words of two characters or more that contain a character (simplified or traditional), HSK words first, then shorter words. Each comes as a full entry: pinyin, Hán Việt, Vietnamese and English senses, HSK level, `src` per field.",
};

export const wordsWithTool = defineReadTool({
  info: WORDS_WITH_INFO,
  inputSchema: wordsWithInputSchema,
  example: "Which common words contain 觉?",
  execute: executeWordsWith,
});

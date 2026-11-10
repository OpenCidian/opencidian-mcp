import { z } from "zod";

import { apiFetch } from "../lib/api.js";
import type { Env } from "../lib/env.js";
import { withDataset } from "../lib/format.js";
import { defineReadTool } from "../lib/tool-helpers.js";

export const getCharacterInputSchema = z.object({
  char: z
    .string()
    .trim()
    .regex(/^\p{Script=Han}$/u, "one Chinese character")
    .describe("One Chinese character, simplified or traditional (觉 or 覺)."),
});
export type GetCharacterInput = z.infer<typeof getCharacterInputSchema>;

export async function executeGetCharacter(env: Env, input: GetCharacterInput) {
  const body = await apiFetch(env, `/v1/chars/${encodeURIComponent(input.char)}`);
  return { content: withDataset(body), resultCount: 1 };
}

export const GET_CHARACTER_INFO = {
  name: "get_character",
  title: "One Chinese character",
  description:
    "Everything known about one character: Hán Việt readings (Thiều Chửu first, Unihan when Thiều Chửu has none), pinyin readings, a short English gloss, stroke count, radical, its parts (decomposition) and how it was formed (etymology: the meaning part and the sound part, each with its Hán Việt), and its traditional or simplified forms. Every field carries `src`. For the words a character is in, use words_with; for a character used as a word, lookup.",
};

export const getCharacterTool = defineReadTool({
  info: GET_CHARACTER_INFO,
  inputSchema: getCharacterInputSchema,
  example: "What are the Hán Việt readings and the parts of 觉?",
  execute: executeGetCharacter,
});

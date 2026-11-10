import { z } from "zod";

import { apiFetch } from "../lib/api.js";
import type { Env } from "../lib/env.js";
import { withDataset } from "../lib/format.js";
import { defineReadTool } from "../lib/tool-helpers.js";

/** opencidian-api's `MAX_TEXT` (src/lib/annotate.ts). */
export const MAX_TEXT = 2000;

export const annotateTextInputSchema = z.object({
  text: z.string().min(1).max(MAX_TEXT).describe(`Chinese text, up to ${MAX_TEXT} characters: a sentence, a lesson's dialogue, a sign.`),
});
export type AnnotateTextInput = z.infer<typeof annotateTextInputSchema>;

export async function executeAnnotateText(env: Env, input: AnnotateTextInput) {
  const body = await apiFetch<unknown[]>(env, "/v1/annotate", { text: input.text });
  return { content: withDataset(body, "tokens"), resultCount: body.data.length };
}

export const ANNOTATE_TEXT_INFO = {
  name: "annotate_text",
  title: "Annotate a Chinese text",
  description:
    "Splits Chinese text into words (longest match against the dictionary) and gives each its pinyin, Hán Việt per character, Vietnamese and English senses and entry `id`. `kind` is word, unknown (Chinese not in the dictionary: say so) or other (punctuation, Latin, digits). `otherReadings` > 0 means the word has more readings than the one shown: look it up when the reading matters. The split is by dictionary match, not grammar, and can be wrong (哪国人 comes out 哪 + 国人): check a split that changes the meaning.",
};

export const annotateTextTool = defineReadTool({
  info: ANNOTATE_TEXT_INFO,
  inputSchema: annotateTextInputSchema,
  example: "Give the pinyin, Hán Việt and meaning of each word in 他觉得北京很好。",
  execute: executeAnnotateText,
});

import { z } from "zod";

import { apiFetch, toQueryString } from "../lib/api.js";
import type { Env } from "../lib/env.js";
import { withDataset } from "../lib/format.js";
import { defineReadTool } from "../lib/tool-helpers.js";

export const searchMeaningInputSchema = z.object({
  meaning: z.string().trim().min(1).max(100).describe("A meaning to find Chinese words for, in Vietnamese (cảm thấy, with or without diacritics) or English (to feel)."),
  lang: z.enum(["vi", "en"]).optional().describe("The language of `meaning`: vi (default) or en."),
  limit: z.number().int().min(1).max(50).optional().describe("Entries to return, 1-50 (default 10)."),
});
export type SearchMeaningInput = z.infer<typeof searchMeaningInputSchema>;

export async function executeSearchMeaning(env: Env, input: SearchMeaningInput) {
  const lang = input.lang ?? "vi";
  const body = await apiFetch<unknown[]>(env, `/v1/search${toQueryString({ meaning: input.meaning, lang, limit: input.limit })}`);
  return { content: { meaning: input.meaning, lang, ...withDataset(body) }, resultCount: body.data.length };
}

export const SEARCH_MEANING_INFO = {
  name: "search_meaning",
  title: "Chinese words for a meaning",
  description:
    "Vietnamese or English → Chinese: entries whose Vietnamese (CVDICT) or English (CC-CEDICT) senses match the meaning, HSK words first. These are candidates, not one translation: compare their senses and HSK levels before picking one, and say when several fit.",
};

export const searchMeaningTool = defineReadTool({
  info: SEARCH_MEANING_INFO,
  inputSchema: searchMeaningInputSchema,
  example: "How do you say “cảm thấy” in Chinese?",
  execute: executeSearchMeaning,
});

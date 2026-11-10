import { z } from "zod";

import { apiFetch, toQueryString } from "../lib/api.js";
import type { Env } from "../lib/env.js";
import { withDataset } from "../lib/format.js";
import { defineReadTool } from "../lib/tool-helpers.js";

export const lookupInputSchema = z.object({
  q: z.string().trim().min(1).max(100).describe("Chinese characters (觉得, 覺得), pinyin with or without tones (jué de, jue2 de5, jue de) or Vietnamese (cảm thấy)."),
  by: z.enum(["hanzi", "pinyin", "vi"]).optional().describe("Force how q is read. Leave out to let the server tell hanzi, pinyin and Vietnamese apart."),
  limit: z.number().int().min(1).max(50).optional().describe("Entries to return, 1-50 (default 10)."),
});
export type LookupInput = z.infer<typeof lookupInputSchema>;

interface LookupData {
  q: string;
  kinds: string[];
  entries: unknown[];
}

export async function executeLookup(env: Env, input: LookupInput) {
  const body = await apiFetch<LookupData>(env, `/v1/lookup${toQueryString({ q: input.q, by: input.by, limit: input.limit })}`);
  return { content: withDataset(body), resultCount: body.data.entries.length };
}

export const LOOKUP_INFO = {
  name: "lookup",
  title: "Look up a Chinese word",
  description:
    "Dictionary entries for a Chinese word, a pinyin syllable or a Vietnamese word: simplified and traditional forms, pinyin, Hán Việt per character (Thiều Chửu), Vietnamese senses (CVDICT), English senses (CC-CEDICT), HSK level. Every field carries `src`, the source it came from. `kinds` says how the query was read and each entry's `match` which reading found it. `vi: null` means CVDICT has no Vietnamese for that word: say so, don't translate the English as if it were the dictionary's. No entries means the word isn't in the dictionary: say so, don't guess.",
};

export const lookupTool = defineReadTool({
  info: LOOKUP_INFO,
  inputSchema: lookupInputSchema,
  example: "What does 觉得 mean in Vietnamese, and what is its Hán Việt?",
  execute: executeLookup,
});

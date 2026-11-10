import { z } from "zod";

import { defineTool, ToolError } from "../../kit/core/tool.js";
import { ApiError, apiFetch } from "../lib/api.js";
import type { Env } from "../lib/env.js";

export const suggestCorrectionInputSchema = z.object({
  word: z.string().trim().min(1).max(40).describe("The word or character the fix is for, in hanzi (说, 觉得)."),
  pinyin: z
    .string()
    .trim()
    .max(60)
    .optional()
    .describe("The pinyin, only when the fix is for one reading of the word (觉 jiào, not jué)."),
  field: z
    .enum(["hanviet", "vi", "en", "pinyin", "missing", "other"])
    .describe("What is wrong: hanviet (Hán Việt reading), vi (Vietnamese meaning), en (English), pinyin, missing (a word the dictionary lacks), other."),
  current: z.string().trim().max(2000).optional().describe("The value OpenCidian gives now, copied from a lookup."),
  suggested: z.string().trim().min(1).max(2000).describe("The value it should be."),
  evidence: z
    .string()
    .trim()
    .min(1)
    .max(2000)
    .describe("Where the right value comes from: a dictionary (Thiều Chửu, hvdic.thivien.net, a textbook) with a page or link. Not your own guess."),
});
export type SuggestCorrectionInput = z.infer<typeof suggestCorrectionInputSchema>;

export async function executeSuggestCorrection(env: Env, input: SuggestCorrectionInput) {
  const body = await apiFetch<{ number: number; url: string }>(env, "/v1/corrections", input);
  return {
    content: {
      received: true,
      issue: body.data.number,
      url: body.data.url,
      note: "A public GitHub issue in OpenCidian/opencidian-data. A maintainer checks it; the data changes only once a correction is merged.",
    },
    resultCount: 1,
  };
}

export const SUGGEST_CORRECTION_INFO = {
  name: "suggest_correction",
  title: "Suggest a correction",
  description:
    "Sends a correction for a wrong or missing value (Hán Việt, Vietnamese meaning, English, pinyin, a missing word) as a public GitHub issue in OpenCidian/opencidian-data; a maintainer reviews it, nothing changes in the data until then. Returns the issue number and link. Only use it when the user asks to report a mistake or agrees to, with evidence from a dictionary or textbook, never for a guess. The issue is public: put no personal details in it. A few per minute for all callers together.",
};

export const suggestCorrectionTool = defineTool({
  ...SUGGEST_CORRECTION_INFO,
  access: "public",
  inputSchema: suggestCorrectionInputSchema,
  annotations: { readOnlyHint: false, openWorldHint: true },
  example: "The Hán Việt of 办 should be biện: report it.",
  async execute(input, ctx) {
    try {
      const result = await executeSuggestCorrection(ctx.env as Env, input);
      return { data: result.content, count: result.resultCount };
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
      if (err.status === 429 || err.status === 503) throw new ToolError("unavailable", err.message);
      throw new ToolError(err.status === 400 ? "bad_input" : "upstream", err.message);
    }
  },
});

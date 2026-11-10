import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { ToolError } from "../kit/core/tool.js";
import type { Env } from "../src/lib/env.js";
import { executeSuggestCorrection, suggestCorrectionInputSchema, suggestCorrectionTool } from "../src/tools/suggest-correction.js";

type Sent = { url: string; method?: string; body?: unknown };

function envAnswering(status: number, body: unknown): { env: Env; sent: Sent[] } {
  const sent: Sent[] = [];
  const env = {
    API_URL: "https://opencidian-api.test",
    MCP_SECRET: "test-secret",
    API: {
      async fetch(url: string, init: RequestInit) {
        sent.push({ url, method: init.method, body: init.body ? JSON.parse(init.body as string) : undefined });
        return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
      },
    },
  } as unknown as Env;
  return { env, sent };
}

const input = { word: "办", field: "hanviet" as const, current: "bạn", suggested: "biện", evidence: "Thiều Chửu, Hán Việt tự điển" };

describe("suggest_correction", () => {
  it("POSTs the suggestion to /v1/corrections and returns the issue number and link", async () => {
    const { env, sent } = envAnswering(200, { data: { number: 12, url: "https://github.com/OpenCidian/opencidian-data/issues/12" }, meta: {} });
    const r = await executeSuggestCorrection(env, input);
    assert.equal(sent[0]!.url, "https://opencidian-api.test/v1/corrections");
    assert.equal(sent[0]!.method, "POST");
    assert.deepEqual(sent[0]!.body, input);
    const c = r.content as Record<string, unknown>;
    assert.equal(c.issue, 12);
    assert.equal(c.url, "https://github.com/OpenCidian/opencidian-data/issues/12");
  });

  it("is marked as not read-only", () => {
    assert.equal(suggestCorrectionTool.annotations?.readOnlyHint, false);
  });

  it("requires evidence and a suggested value", () => {
    assert.equal(suggestCorrectionInputSchema.safeParse({ word: "办", field: "hanviet", suggested: "biện" }).success, false);
    assert.equal(suggestCorrectionInputSchema.safeParse({ word: "办", field: "hanviet", evidence: "x" }).success, false);
  });

  it("turns the API's rate limit into an 'unavailable' tool error with its message", async () => {
    const { env } = envAnswering(429, { error: { code: "RATE_LIMITED", message: "Too many suggestions; try again in a minute" } });
    await assert.rejects(
      suggestCorrectionTool.execute(input, { env, auth: null, requestId: "r", log: () => {} } as never),
      (e: unknown) => e instanceof ToolError && e.code === "unavailable" && /Too many/.test(e.message),
    );
  });
});

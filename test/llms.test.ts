import { describe, expect, it } from "vitest";

import config from "../mcp.config.js";
import { apiFetch } from "../src/lib/api.js";
import { renderLlmsTxt } from "../src/lib/llms.js";
import worker from "../src/index.js";
import { makeMockEnv } from "./helpers.js";

describe("/llms.txt", () => {
  it("is served as plain text with the MCP URL, every tool and the licence", async () => {
    const env = { MCP_PUBLIC_URL: "https://mcp.example" } as never;
    const res = await worker.fetch(new Request("https://mcp.example/llms.txt"), env, {} as ExecutionContext);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    const text = await res.text();
    expect(text).toContain("https://mcp.example/mcp");
    expect(text).toContain("OpenCidian by Perxel");
    expect(text).toContain("CC BY-SA 4.0");
    for (const tool of config.tools) expect(text).toContain(`\`${tool.name}\``);
  });

  it("never mentions the internal API", () => {
    expect(renderLlmsTxt(config, "https://mcp.example")).not.toMatch(/opencidian-api/);
  });
});

describe("apiFetch", () => {
  it("sends X-MCP-Secret on every call", async () => {
    let sent: string | null = null;
    const env = {
      API_URL: "https://opencidian-api.internal",
      MCP_SECRET: "s3",
      API: {
        async fetch(_url: string, init?: RequestInit) {
          sent = new Headers(init?.headers).get("X-MCP-Secret");
          return Response.json({ data: {}, meta: {} });
        },
      },
    } as never;
    await apiFetch(env, "/v1/meta");
    expect(sent).toBe("s3");
  });

  it("throws when MCP_SECRET is missing instead of calling the API", async () => {
    const { env, calls } = makeMockEnv({ "/v1/meta": {} });
    delete (env as { MCP_SECRET?: string }).MCP_SECRET;
    await expect(apiFetch(env, "/v1/meta")).rejects.toThrow(/MCP_SECRET/);
    expect(calls).toEqual([]);
  });
});

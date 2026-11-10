import { createWorker } from "../kit/core/worker.js";
import config from "../mcp.config.js";
import type { Env } from "./lib/env.js";
import { renderLlmsTxt } from "./lib/llms.js";

const worker = createWorker(config);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    // Served here, not by the kit: the kit owns `/`, `/mcp`, `/health`, OAuth and `/dash`.
    if (url.pathname === "/llms.txt" && (request.method === "GET" || request.method === "HEAD")) {
      const publicUrl = env.MCP_PUBLIC_URL ?? `http://${url.host}`;
      return new Response(renderLlmsTxt(config, publicUrl), {
        headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
      });
    }
    return worker.fetch(request, env, ctx);
  },
};

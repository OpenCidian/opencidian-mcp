import type { z } from "zod";

import { defineTool, ToolError } from "../../kit/core/tool.js";
import { ApiError } from "./api.js";
import type { Env } from "./env.js";

export interface ToolResult {
  content: unknown;
  resultCount: number;
}

export interface ReadToolInfo {
  name: string;
  title: string;
  description: string;
}

/** opencidian-api's own error message reaches the model, with a stable code for metrics. */
function toToolError(err: unknown): unknown {
  if (!(err instanceof ApiError)) return err;
  const code = err.status === 404 ? "not_found" : err.status === 400 ? "bad_input" : "upstream";
  return new ToolError(code, err.message);
}

/**
 * Wraps a read tool's `execute(env, input)` core (kept separate so tests call it
 * without a request) in the kit's `defineTool`: public, read-only, and opencidian-api's
 * errors mapped to `ToolError`. The SDK validates `input` against `inputSchema`.
 */
export function defineReadTool<I extends z.ZodObject>(def: {
  info: ReadToolInfo;
  inputSchema: I;
  example: string;
  execute: (env: Env, input: z.infer<I>) => Promise<ToolResult>;
}) {
  return defineTool({
    ...def.info,
    access: "public",
    inputSchema: def.inputSchema,
    example: def.example,
    async execute(input, ctx) {
      try {
        const result = await def.execute(ctx.env as Env, input);
        return { data: result.content, count: result.resultCount };
      } catch (err) {
        throw toToolError(err);
      }
    },
  });
}

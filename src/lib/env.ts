import type { Env as KitEnv } from "../../kit/core/env.js";

/** The service binding to opencidian-api: a plain Fetcher, no network hop, no CORS. */
export type ApiBinding = Pick<Fetcher, "fetch">;

/** The kit's Env plus this MCP's own bindings, vars and secrets. */
export interface Env extends KitEnv {
  API: ApiBinding;
  API_URL: string;
  // Secrets
  MCP_SECRET?: string;
}

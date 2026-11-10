import type { Env } from "./env.js";
import { MCP_SECRET_HEADER } from "./constants.js";

/** Thrown on a non-2xx response from opencidian-api; carries the API's own error message. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** What every opencidian-api answer carries next to `data`. */
export interface ApiMeta {
  dataset: string | null;
  license: string;
  licenseUrl: string;
  attribution: string;
}

export interface ApiBody<T> {
  data: T;
  meta: ApiMeta;
}

/**
 * Calls opencidian-api over the service binding, sending `X-MCP-Secret`. The API is internal
 * (opencidian-data plan 001): without a matching secret every route answers 404. A missing secret
 * throws (an internal error in the logs) rather than every tool reporting "not found". On a non-2xx
 * response, throws an ApiError carrying the API's own `error.message` (e.g. "Character not in the
 * dataset"), so a tool handler can turn it into a tool error the model can act on.
 */
export async function apiFetch<T = unknown>(env: Env, path: string, body?: unknown): Promise<ApiBody<T>> {
  if (!env.MCP_SECRET) throw new Error("MCP_SECRET is not set: opencidian-api answers 404 without it");
  const headers: Record<string, string> = { [MCP_SECRET_HEADER]: env.MCP_SECRET };
  const init: RequestInit = { headers };
  if (body !== undefined) {
    init.method = "POST";
    headers["content-type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const res = await env.API.fetch(`${env.API_URL}${path}`, init);

  const text = await res.text();
  let parsed: unknown;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch {
    parsed = undefined;
  }

  if (!res.ok) {
    const message =
      (parsed as { error?: { message?: string } } | undefined)?.error?.message ?? `opencidian-api ${res.status} ${res.statusText}`;
    throw new ApiError(message, res.status);
  }
  return parsed as ApiBody<T>;
}

/** Builds a query string from a plain object, dropping undefined/null/empty values. */
export function toQueryString(params: Record<string, unknown>): string {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    usp.set(key, String(value));
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

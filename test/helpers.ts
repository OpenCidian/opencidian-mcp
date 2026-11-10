import type { Env } from "../src/lib/env.js";

/**
 * A mock `env.API` service binding: routes are matched by the request path + query
 * string exactly as sent (a test asserting on `calls` catches an unexpected query
 * shape). `routes` maps a path to the fixture body to return (200), or to
 * `{ status, body }` for an error response.
 */
export function makeMockEnv(routes: Record<string, unknown | { status: number; body: unknown }>): { env: Env; calls: string[] } {
  const calls: string[] = [];
  // Only the bindings the tools read; the kit's own bindings (KV, metrics, limiters) aren't used here.
  const env = {
    API_URL: "https://opencidian-api.test",
    MCP_SECRET: "test-secret",
    API: {
      async fetch(input: RequestInfo | URL) {
        const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url;
        const path = url.replace("https://opencidian-api.test", "");
        calls.push(path);
        const match = routes[path];
        if (match === undefined) {
          return new Response(JSON.stringify({ error: { code: "NOT_FOUND", message: `No fixture for path: ${path}` } }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }
        if (typeof match === "object" && match !== null && "status" in match && "body" in match) {
          const { status, body } = match as { status: number; body: unknown };
          return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
        }
        return new Response(JSON.stringify(match), { status: 200, headers: { "Content-Type": "application/json" } });
      },
    },
  } as unknown as Env;
  return { env, calls };
}

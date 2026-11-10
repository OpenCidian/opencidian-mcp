# opencidian-mcp: notes for agents

A remote MCP server over opencidian-api (Cloudflare Worker, stateless Streamable HTTP). The plan for all of OpenCidian is in opencidian-data: `.claude/plans/001-20261110-opencidian.md` (locally `../opencidian-data/`). Read its "opencidian-mcp" section and "Where it stands" before non-trivial work.

## Where things are

- `kit/`: the Perxel MCP Kit. **Never edit it here**; changes land in `perxel/perxel-mcp-kit` and arrive via `pnpm kit:update`. `STANDARD.md` is the checklist.
- `mcp.config.ts`: slug, name, server `instructions`, the tool list.
- `src/index.ts`: `createWorker(config)` plus `/llms.txt`.
- `src/tools/`: one file per tool (zod schema, `execute*` core, `*_INFO`, a `*Tool` made with `defineReadTool`).
- `src/lib/`: `api.ts` (service-binding call to opencidian-api, unwraps `{ data, meta }`), `format.ts` (`withDataset`: dataset version + short credit on every answer), `tool-helpers.ts`, `llms.ts`.
- `test/fixtures/`: real answers from the deployed API. `evals/questions.md`: the plan's questions as tool calls.

## Rules

- Never guess a word the dictionary lacks: tools return empty lists or `vi: null`, and descriptions tell the model to say so.
- Keep `src` on every field; don't flatten it away for brevity.

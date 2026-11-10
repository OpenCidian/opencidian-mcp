# opencidian-mcp

A remote [MCP](https://modelcontextprotocol.io) server for OpenCidian by Perxel: an open Chinese-Vietnamese dictionary. **It is the only public way in for systems**: there is no public API. Read-only except `suggest_correction`, which opens a public GitHub issue for a maintainer (it never changes the data); no sign-in. A Cloudflare Worker built from the [Perxel MCP Kit](https://github.com/perxel/perxel-mcp-kit) (`kit/`, see `STANDARD.md`) over [opencidian-api](https://github.com/OpenCidian/opencidian-api), which is internal: it answers 404 to every read without `X-MCP-Secret`, which this Worker sends over its service binding.

```
opencidian-mcp (this repo) ──service binding──▶ opencidian-api ──▶ D1
  POST /mcp (Streamable HTTP, stateless)           loaded from opencidian-data's releases
```

`GET /` lists connect instructions and every tool; `GET /llms.txt` says what OpenCidian is, how to connect, example questions, licence and attribution (`src/lib/llms.ts`); `/dash` is a public usage dashboard. Host: `opencidian-mcp.perxel.com`.

## Tools

| Tool | Wraps | Notes |
|---|---|---|
| `lookup` | `GET /v1/lookup` | Hanzi, pinyin (with or without tones) or Vietnamese; `by` forces the reading, `limit` 1-50. |
| `get_character` | `GET /v1/chars/{char}` | Hán Việt, pinyin, radical, parts, etymology, strokes, traditional forms. |
| `words_with` | `GET /v1/words-with/{char}` | Words of 2+ characters containing it, HSK words first. |
| `search_meaning` | `GET /v1/search` | Vietnamese (default) or English meaning → candidate Chinese words. |
| `annotate_text` | `POST /v1/annotate` | Text (up to 2,000 characters) → words with pinyin, Hán Việt and meaning. |
| `suggest_correction` | `POST /v1/corrections` | Opens a public issue in [opencidian-data](https://github.com/OpenCidian/opencidian-data) (labels `correction`, `from-ai`); a maintainer turns it into a correction file. Never changes the data. 5 a minute for all MCP callers together. |
| `about` | `GET /v1/meta` | Version, licence, full attribution, sources with their pinned versions. |

Every answer carries `src` per field, the dataset version and a short credit; the full attribution (every source) comes from `about` only, to keep answers small.

## Setup

```sh
pnpm install
cp .dev.vars.example .dev.vars   # MCP_SECRET: the one in ../opencidian-api/.dev.vars
pnpm test && pnpm typecheck
```

Against a local opencidian-api: run `wrangler dev` there, then `pnpm dev` here. Against the deployed API: a temporary copy of `wrangler.mcp.jsonc` with `"remote": true` on the `API` service binding (never committed), then `pnpm exec wrangler dev -c <copy> --port 8788`.

Evals: `pnpm eval --url http://localhost:8788/mcp` (`evals/questions.md`).

## Deploy

On push to `main` (`.github/workflows/deploy.yml`, repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`), or `pnpm exec wrangler deploy -c wrangler.mcp.jsonc`. Secrets: `MCP_SECRET` (same as opencidian-api's), `IP_HASH_SALT`, `COOKIE_ENCRYPTION_KEY`, `DASH_PROXY_KEY` (see `wrangler.mcp.jsonc`).

## Licence

Code MIT (`kit/` keeps the kit's own licence). Data CC BY-SA 4.0: credit "OpenCidian by Perxel" and its sources.

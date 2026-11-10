import { z } from "zod";

import { apiFetch } from "../lib/api.js";
import type { Env } from "../lib/env.js";
import { defineReadTool } from "../lib/tool-helpers.js";

export const aboutInputSchema = z.object({});
export type AboutInput = z.infer<typeof aboutInputSchema>;

interface Source {
  id: string;
  name: string;
  version?: string;
  license?: string;
  url?: string;
  credit?: string;
  sha256?: string;
}
interface MetaData {
  dataset: { name?: string; version?: string; builtAt?: string; commit?: string; license?: { id?: string; url?: string; attribution?: string }; sources?: Source[]; [k: string]: unknown };
  release_tag?: string;
  synced_at?: string;
}

export async function executeAbout(env: Env, _input: AboutInput) {
  const body = await apiFetch<MetaData>(env, "/v1/meta");
  const { dataset, release_tag, synced_at } = body.data;
  const { sources, license, ...rest } = dataset ?? {};
  return {
    content: {
      ...rest,
      release: release_tag ?? null,
      loadedAt: synced_at ?? null,
      license: { id: license?.id ?? body.meta?.license, url: license?.url ?? body.meta?.licenseUrl },
      // How to credit OpenCidian when reusing its data (CC BY-SA 4.0: credit, link, share alike).
      attribution: license?.attribution ?? body.meta?.attribution,
      sources: (sources ?? []).map(({ sha256: _sha, ...s }) => s),
    },
    resultCount: sources?.length ?? 0,
  };
}

export const ABOUT_INFO = {
  name: "about",
  title: "About OpenCidian's data",
  description:
    "The dataset's version and build date, its licence (CC BY-SA 4.0), the full attribution to quote when reusing it, and every source with its pinned version and licence (CC-CEDICT, CVDICT, Thiều Chửu, Unihan, Make Me a Hanzi, the HSK lists). Use it to say where an answer comes from or how to cite OpenCidian.",
};

export const aboutTool = defineReadTool({
  info: ABOUT_INFO,
  inputSchema: aboutInputSchema,
  example: "Where does OpenCidian's data come from, and how do I cite it?",
  execute: executeAbout,
});

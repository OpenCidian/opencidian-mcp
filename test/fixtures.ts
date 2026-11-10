import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Real answers from the deployed opencidian-api (dataset 2026-11-10+19f6dfd). */
export const fixture = (name: string) => JSON.parse(readFileSync(join(import.meta.dirname, "fixtures", `${name}.json`), "utf8"));
export const q = (s: string) => encodeURIComponent(s);

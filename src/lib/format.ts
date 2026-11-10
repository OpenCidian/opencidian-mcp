import type { ApiBody } from "./api.js";
import { CREDIT } from "./constants.js";

/**
 * A tool answer: the API's data (an object as is, a list under `key`), plus the dataset version
 * and a short credit, so a model can cite it. The API's full `attribution` (every source, about
 * 700 characters) stays out of each answer: models pay for every token; `about` returns it.
 */
export function withDataset<T>(body: ApiBody<T>, key = "entries"): Record<string, unknown> {
  const data = Array.isArray(body.data) ? { [key]: body.data } : (body.data as Record<string, unknown>);
  return { ...data, dataset: body.meta?.dataset ?? null, credit: CREDIT };
}

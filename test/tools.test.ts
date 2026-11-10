import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { CREDIT } from "../src/lib/constants.js";
import { executeAbout } from "../src/tools/about.js";
import { executeAnnotateText } from "../src/tools/annotate-text.js";
import { executeGetCharacter, getCharacterInputSchema } from "../src/tools/get-character.js";
import { executeLookup } from "../src/tools/lookup.js";
import { executeSearchMeaning } from "../src/tools/search-meaning.js";
import { executeWordsWith } from "../src/tools/words-with.js";

import { fixture, q } from "./fixtures.js";
import { makeMockEnv } from "./helpers.js";

type Obj = Record<string, any>;

describe("lookup", () => {
  it("passes q and returns the entries with the dataset version and a short credit", async () => {
    const { env, calls } = makeMockEnv({ [`/v1/lookup?q=${q("觉得")}`]: fixture("lookup-juede") });
    const r = await executeLookup(env, { q: "觉得" });
    const c = r.content as Obj;
    assert.equal(calls[0], `/v1/lookup?q=${q("觉得")}`);
    assert.equal(r.resultCount, 1);
    assert.equal(c.entries[0].simp, "觉得");
    assert.deepEqual(c.entries[0].hanviet.map((h: Obj) => h.readings[0]), ["giác", "đắc"]);
    assert.equal(c.entries[0].vi.src, "cvdict");
    assert.equal(c.dataset, "2026-11-10+19f6dfd");
    assert.equal(c.credit, CREDIT);
    assert.ok(!("attribution" in c), "the 700-character attribution stays in about");
  });

  it("sends by and limit when given", async () => {
    const { env, calls } = makeMockEnv({ "/v1/lookup?q=jue&by=pinyin&limit=3": fixture("lookup-jue") });
    await executeLookup(env, { q: "jue", by: "pinyin", limit: 3 });
    assert.equal(calls[0], "/v1/lookup?q=jue&by=pinyin&limit=3");
  });

  it("returns an empty list (not an error) for a word the dictionary doesn't have", async () => {
    const { env } = makeMockEnv({ [`/v1/lookup?q=${q("龘龘龘")}`]: fixture("lookup-none") });
    const r = await executeLookup(env, { q: "龘龘龘" });
    assert.equal(r.resultCount, 0);
    assert.deepEqual((r.content as Obj).entries, []);
  });
});

describe("get_character", () => {
  it("returns the character's record with src per field", async () => {
    const { env, calls } = makeMockEnv({ [`/v1/chars/${q("觉")}`]: fixture("char-jue") });
    const c = (await executeGetCharacter(env, { char: "觉" })).content as Obj;
    assert.equal(calls[0], `/v1/chars/${q("觉")}`);
    assert.deepEqual(c.hanviet, { readings: ["giác", "giáo"], src: "thieu-chuu" });
    assert.equal(c.etymology.semantic.char, "见");
    assert.equal(c.dataset, "2026-11-10+19f6dfd");
  });

  it("surfaces the API's not-found message", async () => {
    const { env } = makeMockEnv({ [`/v1/chars/${q("𠀀")}`]: { status: 404, body: fixture("char-missing") } });
    await assert.rejects(() => executeGetCharacter(env, { char: "𠀀" }), /Character not in the dataset/);
  });

  it("takes exactly one Han character", () => {
    assert.ok(getCharacterInputSchema.safeParse({ char: "觉" }).success);
    assert.ok(getCharacterInputSchema.safeParse({ char: "𠀀" }).success, "a supplementary-plane character is one character");
    assert.ok(!getCharacterInputSchema.safeParse({ char: "觉得" }).success);
    assert.ok(!getCharacterInputSchema.safeParse({ char: "a" }).success);
  });
});

describe("words_with", () => {
  it("lists the words under entries, with the character", async () => {
    const { env, calls } = makeMockEnv({ [`/v1/words-with/${q("觉")}?limit=5`]: fixture("words-with-jue") });
    const r = await executeWordsWith(env, { char: "觉", limit: 5 });
    const c = r.content as Obj;
    assert.equal(calls[0], `/v1/words-with/${q("觉")}?limit=5`);
    assert.equal(c.char, "觉");
    assert.equal(r.resultCount, c.entries.length);
    assert.ok(c.entries.some((e: Obj) => e.simp === "睡觉"));
  });
});

describe("search_meaning", () => {
  it("defaults to Vietnamese", async () => {
    const path = `/v1/search?meaning=${q("cảm thấy").replace(/%20/g, "+")}&lang=vi&limit=3`;
    const { env, calls } = makeMockEnv({ [path]: fixture("search-camthay") });
    const r = await executeSearchMeaning(env, { meaning: "cảm thấy", limit: 3 });
    const c = r.content as Obj;
    assert.equal(calls[0], path);
    assert.equal(c.lang, "vi");
    assert.ok(c.entries.some((e: Obj) => e.simp === "感到"));
  });
});

describe("annotate_text", () => {
  it("POSTs the text and returns tokens", async () => {
    let sent: { method?: string; body?: string } = {};
    const { env } = makeMockEnv({});
    (env as Obj).API = {
      async fetch(_url: string, init?: RequestInit) {
        sent = { method: init?.method, body: init?.body as string };
        return Response.json(fixture("annotate"));
      },
    };
    const r = await executeAnnotateText(env, { text: "大卫是哪国人？他觉得北京很好。" });
    const c = r.content as Obj;
    assert.equal(sent.method, "POST");
    assert.deepEqual(JSON.parse(sent.body!), { text: "大卫是哪国人？他觉得北京很好。" });
    assert.ok(Array.isArray(c.tokens));
    assert.ok(c.tokens.some((t: Obj) => t.text === "觉得" && t.kind === "word"));
    assert.ok(c.tokens.some((t: Obj) => t.kind === "other"));
  });
});

describe("about", () => {
  it("gives the version, licence, full attribution and sources without checksums", async () => {
    const { env } = makeMockEnv({ "/v1/meta": fixture("meta") });
    const r = await executeAbout(env, {});
    const c = r.content as Obj;
    assert.equal(c.version, "2026-11-10+19f6dfd");
    assert.equal(c.release, "data-2026-11-10-19f6dfd");
    assert.equal(c.license.id, "CC-BY-SA-4.0");
    assert.match(c.attribution, /OpenCidian by Perxel/);
    assert.match(c.attribution, /Thiều Chửu/);
    assert.ok(c.sources.length >= 5);
    assert.ok(c.sources.every((s: Obj) => !("sha256" in s)));
    assert.equal(c.counts.entries, 125397);
  });
});
